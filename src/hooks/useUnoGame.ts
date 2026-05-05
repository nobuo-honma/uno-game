import { useState, useCallback } from 'react';
import type { Card, Color, GameState } from '../types/uno';
import { createDeck, shuffle } from '../lib/uno-utils';

export const useUnoGame = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isSelectingColor, setIsSelectingColor] = useState(false);
    const [pendingCards, setPendingCards] = useState<Card[]>([]);

    const initGame = useCallback(() => {
        const deck = shuffle(createDeck());
        const hands = [deck.splice(0, 7), deck.splice(0, 7)];
        const firstCard = deck.pop();
        if (!firstCard) return;

        setGameState({
            deck,
            discardPile: [firstCard],
            players: hands,
            turn: 0,
            direction: 1,
            gameEnd: false,
            winner: null,
            activeColor: null,
        });
    }, []);

    const playCards = (playerIdx: number, cards: Card[]) => {
        if (!gameState || gameState.turn !== playerIdx) return;
        
        const first = cards[0];
        if (!first) return;

        if (first.color === 'wild' || first.value === 'wild' || first.value === 'wild4') {
            setPendingCards(cards);
            setIsSelectingColor(true);
            return;
        }

        executeMove(playerIdx, cards, null);
    };

    const executeMove = (playerIdx: number, cards: Card[], selectedColor: Color | null) => {
        setGameState((prev: GameState | null) => {
            if (!prev) return prev;
            
            const newPlayers = [...prev.players];
            const currentHand = newPlayers[playerIdx];
            if (!currentHand) return prev;

            const cardIds = cards.map((c: Card) => c.id);
            newPlayers[playerIdx] = currentHand.filter((c: Card) => !cardIds.includes(c.id));

            const lastCard = cards[cards.length - 1];
            if (!lastCard) return prev;

            let nextTurn = (prev.turn + prev.direction + 2) % 2;
            let nextDirection = prev.direction;

            if (lastCard.value === 'skip') {
                nextTurn = (nextTurn + prev.direction + 2) % 2;
            } else if (lastCard.value === 'reverse') {
                nextDirection = (prev.direction * -1) as (1 | -1);
                nextTurn = (prev.turn + nextDirection + 2) % 2;
            }

            return {
                ...prev,
                players: newPlayers,
                discardPile: [...prev.discardPile, ...cards],
                turn: nextTurn,
                direction: nextDirection,
                activeColor: selectedColor,
                gameEnd: newPlayers[playerIdx]?.length === 0,
                winner: newPlayers[playerIdx]?.length === 0 ? playerIdx : null,
            };
        });
        setIsSelectingColor(false);
        setPendingCards([]);
    };

    const drawCard = (playerIdx: number) => {
        setGameState((prev: GameState | null) => {
            if (!prev || prev.turn !== playerIdx) return prev;
            const newDeck = [...prev.deck];
            const drawn = newDeck.pop();
            if (!drawn) return prev;

            const newPlayers = [...prev.players];
            const currentHand = newPlayers[playerIdx];
            if (!currentHand) return prev;
            newPlayers[playerIdx] = [...currentHand, drawn];

            return {
                ...prev,
                deck: newDeck,
                players: newPlayers,
                turn: (prev.turn + prev.direction + 2) % 2,
            };
        });
    };

    return {
        gameState,
        initGame,
        playCards,
        drawCard,
        isSelectingColor,
        pendingCards,
        executeMove,
    };
};