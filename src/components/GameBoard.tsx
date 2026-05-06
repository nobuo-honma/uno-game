"use client";
import React, { useState, useEffect } from 'react';
import { useUnoOnline } from '../hooks/useUnoOnline';
import { UnoCard } from './Card/UnoCard';
import { createDeck, shuffle, canPlayCards } from '../lib/uno-utils';
import type { Color, Card, GameState } from '../types/uno';

export const GameBoard = () => {
    const [view, setView] = useState<'home' | 'lobby' | 'game'>('home');
    const [roomId, setRoomId] = useState('');
    const { gameState, playerIndex, updateRemoteGame, joinRoom } = useUnoOnline(roomId);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // ルーム作成（ホスト）
    const handleCreateRoom = async () => {
        const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomId(newId);

        // 初期ゲーム状態の作成
        const deck = shuffle(createDeck());
        const players = [deck.splice(0, 7), deck.splice(0, 7)]; // まずは2人対戦
        const firstDiscard = deck.pop()!;

        const initialState: GameState = {
            deck, discardPile: [firstDiscard], players,
            turn: 0, direction: 1, gameEnd: false, winner: null, activeColor: null,
            playerCount: 2
        };

        await joinRoom(newId); // 自分がPlayer 0になる
        await updateRemoteGame(initialState);
        setView('game');
    };

    // ルーム参加（ゲスト）
    const handleJoinRoom = async () => {
        if (!roomId) return;
        await joinRoom(roomId); // 自分がPlayer 1以降になる
        setView('game');
    };

    // カードを出す処理（Firebaseへ同期）
    const handlePlay = async () => {
        if (!gameState || playerIndex !== gameState.turn) return;

        const cards = selectedIds.map(id => gameState.players[playerIndex].find(c => c.id === id)!).filter(Boolean);
        const topCard = gameState.discardPile[gameState.discardPile.length - 1];

        if (canPlayCards(cards, topCard, gameState.activeColor)) {
            const newPlayers = [...gameState.players];
            newPlayers[playerIndex] = newPlayers[playerIndex].filter(c => !selectedIds.includes(c.id));

            const isWin = newPlayers[playerIndex].length === 0;

            const nextState: GameState = {
                ...gameState,
                players: newPlayers,
                discardPile: [...gameState.discardPile, ...cards],
                turn: isWin ? gameState.turn : (gameState.turn + 1) % gameState.playerCount,
                gameEnd: isWin,
                winner: isWin ? playerIndex : null,
                activeColor: null // 簡易化のため一旦null（ワイルド処理は後述）
            };

            await updateRemoteGame(nextState);
            setSelectedIds([]);
        }
    };

    if (view === 'home') {
        return (
            <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <h1 className="text-6xl font-black mb-12">UNO ONLINE</h1>
                <div className="flex flex-col gap-6 w-80">
                    <button onClick={handleCreateRoom} className="bg-blue-600 py-4 rounded-xl font-bold hover:bg-blue-500">
                        ルームを新規作成
                    </button>
                    <div className="flex gap-2">
                        <input
                            type="text" placeholder="ルームIDを入力"
                            className="flex-1 px-4 py-2 rounded-lg text-black outline-none"
                            value={roomId} onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                        />
                        <button onClick={handleJoinRoom} className="bg-green-600 px-6 rounded-lg font-bold">
                            参加
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!gameState || playerIndex === null) return <div className="text-white text-center mt-20">接続中...</div>;

    const isMyTurn = gameState.turn === playerIndex;
    const myHand = gameState.players[playerIndex] || [];
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];

    return (
        <div className="h-screen bg-zinc-900 text-white flex flex-col items-center justify-between py-10">
            <div className="text-xl font-bold bg-white/10 px-6 py-2 rounded-full">
                ROOM: {roomId} | あなたは Player {playerIndex}
            </div>

            <div className="flex flex-col items-center gap-8">
                <div className="text-2xl font-black text-yellow-400">
                    {isMyTurn ? "★ あなたの番です" : `Player ${gameState.turn} の番です...`}
                </div>
                <div className="flex gap-8">
                    {/* 山札（簡易的に1枚引く機能） */}
                    <div className="w-24 h-36 bg-indigo-900 rounded-xl border-2 border-white/20 flex items-center justify-center shadow-2xl opacity-50">
                        <span className="font-bold">DECK</span>
                    </div>
                    <UnoCard card={topCard} />
                </div>
            </div>

            {/* 自分の手札 */}
            <div className="flex flex-col items-center gap-6">
                <div className="flex -space-x-6">
                    {myHand.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => isMyTurn && setSelectedIds(prev => prev.includes(card.id) ? prev.filter(i => i !== card.id) : [...prev, card.id])}
                            className={`transition-all ${selectedIds.includes(card.id) ? '-translate-y-10 z-50' : 'hover:-translate-y-4'}`}
                        >
                            <UnoCard card={card} />
                        </div>
                    ))}
                </div>

                {isMyTurn && selectedIds.length > 0 && (
                    <button onClick={handlePlay} className="bg-yellow-400 text-black px-12 py-3 rounded-full font-black animate-pulse">
                        カードを出す
                    </button>
                )}
            </div>
        </div>
    );
};