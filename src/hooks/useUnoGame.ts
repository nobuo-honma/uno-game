"use client";
import { useState, useCallback, useEffect } from 'react';
import type { Card, GameState, Color } from '../types/uno';
import { createDeck, shuffle, canPlayCards } from '../lib/uno-utils';
import { selectAiCards } from '../lib/ai-logic';

export const useUnoGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isSelectingColor, setIsSelectingColor] = useState(false);
    const [pendingCards, setPendingCards] = useState<Card[]>([]);

    // ゲーム初期化（プレイヤー数を引数に取る）
    const initGame = useCallback((count: number = 4) => {
        const newDeck = shuffle(createDeck());
        const players: Card[][] = [];
        for (let i = 0; i < count; i++) {
            players.push(newDeck.splice(0, 7));
        }
        const firstDiscard = newDeck.pop()!;
        setGameState({
            deck: newDeck, discardPile: [firstDiscard], players,
            turn: 0, direction: 1, gameEnd: false, winner: null, activeColor: null,
            playerCount: count
        });
    }, []);

    const executeMove = useCallback((playerIndex: number, cards: Card[], nextColor: Color | null) => {
        setGameState(prev => {
            if (!prev) return prev;
            const newPlayers = [...prev.players];
            const currentHand = newPlayers[playerIndex];
            if (!currentHand) return prev;
            
            const cardIds = cards.map(c => c.id);
            newPlayers[playerIndex] = currentHand.filter(c => !cardIds.includes(c.id));

            const isWin = newPlayers[playerIndex].length === 0;
            // 次のターン計算
            let nextTurn = (prev.turn + prev.direction + prev.playerCount) % prev.playerCount;

            return {
                ...prev,
                players: newPlayers,
                discardPile: [...prev.discardPile, ...cards],
                activeColor: nextColor,
                turn: isWin ? prev.turn : nextTurn,
                gameEnd: isWin,
                winner: isWin ? playerIndex : null
            };
        });
        setPendingCards([]);
        setIsSelectingColor(false);
    }, []);

    const playCards = useCallback((playerIndex: number, cards: Card[]) => {
        if (!cards || cards.length === 0) return;
        const lastCard = cards[cards.length - 1];
        if (!lastCard) return;

        if (lastCard.color === 'wild' || lastCard.value === 'wild' || lastCard.value === 'wild4') {
            if (playerIndex === 0) {
                setPendingCards(cards);
                setIsSelectingColor(true);
            } else {
                const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
                const aiColor = colors[Math.floor(Math.random() * colors.length)]!;
                executeMove(playerIndex, cards, aiColor);
            }
        } else {
            executeMove(playerIndex, cards, null);
        }
    }, [executeMove]);

    const drawCard = useCallback((playerIndex: number) => {
        setGameState(prev => {
            if (!prev || prev.turn !== playerIndex) return prev;
            const newDeck = [...prev.deck];
            const card = newDeck.pop();
            if (!card) return prev;
            const newPlayers = [...prev.players];
            const currentHand = newPlayers[playerIndex];
            if (!currentHand) return prev;
            newPlayers[playerIndex] = [...currentHand, card];
            return { ...prev, deck: newDeck, players: newPlayers, turn: (prev.turn + prev.direction + prev.playerCount) % prev.playerCount };
        });
    }, []);

    // CPU自動実行ロジック（修正版）
    useEffect(() => {
        if (!gameState || gameState.gameEnd || gameState.turn === 0) return;

        const cpuMove = () => {
            const currentHand = gameState.players[gameState.turn];
            const topCard = gameState.discardPile[gameState.discardPile.length - 1];
            if (!currentHand || !topCard) return;
            const cards = selectAiCards(currentHand, topCard, gameState.activeColor);

            if (cards.length > 0) {
                playCards(gameState.turn, cards);
            } else {
                drawCard(gameState.turn);
            }
        };

        const timer = setTimeout(cpuMove, 1200); // CPUの思考時間
        return () => clearTimeout(timer);
    }, [gameState?.turn, gameState?.activeColor, playCards, drawCard]);

    return { gameState, initGame, playCards, drawCard, isSelectingColor, pendingCards, executeMove, setGameState };
};