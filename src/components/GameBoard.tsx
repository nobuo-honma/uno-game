"use client";
import React, { useState } from 'react';
import { useUnoGame } from '../hooks/useUnoGame';
import { UnoCard } from './Card/UnoCard';
import type { Color, Card } from '../types/uno';
import { canPlayCards } from '../lib/uno-utils';

export const GameBoard = () => {
    const { gameState, initGame, playCards, drawCard, isSelectingColor, pendingCards, executeMove } = useUnoGame();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [view, setView] = useState<'home' | 'game'>('home');

    if (view === 'home' || !gameState) {
        return (
            <div className="h-screen bg-gradient-to-br from-red-600 via-blue-600 to-yellow-500 flex flex-col items-center justify-center text-white">
                <h1 className="text-8xl font-black italic mb-12 drop-shadow-2xl tracking-tighter">UNO TSX</h1>
                <div className="flex gap-4">
                    {[2, 3, 4].map(num => (
                        <button key={num} onClick={() => { initGame(num); setView('game'); }}
                            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-110 transition-transform shadow-xl">
                            {num} Players
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    if (!topCard) return null;
    const activeColor = gameState.activeColor || topCard.color;

    const handlePlay = () => {
        const playerHand = gameState.players[0];
        if (!playerHand) return;
        const cards = selectedIds.map(id => playerHand.find(c => c.id === id)!).filter(Boolean);
        if (canPlayCards(cards, topCard, gameState.activeColor)) {
            playCards(0, cards);
            setSelectedIds([]);
        }
    };

    return (
        <div className={`h-screen relative overflow-hidden transition-colors duration-700 ${activeColor === 'wild' ? 'bg-neutral-900' : 'bg-zinc-900'}`}>
            {/* 場の指定色背景 */}
            <div className={`absolute inset-0 opacity-20 blur-3xl rounded-full scale-150 transition-colors duration-1000 
        ${activeColor === 'red' ? 'bg-red-600' : activeColor === 'blue' ? 'bg-blue-600' : activeColor === 'green' ? 'bg-green-600' : 'bg-yellow-400'}`} />

            {/* プレイヤー情報表示 */}
            <div className="absolute top-4 left-4 z-50 flex gap-4 text-white font-bold">
                {gameState.players.map((hand, i) => (
                    <div key={i} className={`px-4 py-2 rounded-lg border-2 ${gameState.turn === i ? 'border-yellow-400 bg-yellow-400/20 scale-110' : 'border-white/20'}`}>
                        P{i === 0 ? ' (YOU)' : i}: {hand.length}枚
                    </div>
                ))}
            </div>

            {/* CPUレイアウト（上、左、右に配置） */}
            <div className="absolute inset-0 pointer-events-none">
                {/* P1 (Top) */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex -space-x-8 scale-50 opacity-40">
                    {gameState.players[1]?.map((_, i) => <div key={i} className="w-16 h-24 bg-indigo-900 rounded-lg border-2 border-white" />)}
                </div>
                {/* P2 (Left) */}
                {gameState.playerCount >= 3 && (
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col -space-y-16 scale-50 opacity-40">
                        {gameState.players[2]?.map((_, i) => <div key={i} className="w-16 h-24 bg-indigo-900 rounded-lg border-2 border-white -rotate-90" />)}
                    </div>
                )}
                {/* P3 (Right) */}
                {gameState.playerCount >= 4 && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col -space-y-16 scale-50 opacity-40">
                        {gameState.players[3]?.map((_, i) => <div key={i} className="w-16 h-24 bg-indigo-900 rounded-lg border-2 border-white rotate-90" />)}
                    </div>
                )}
            </div>

            {/* 場の中心 */}
            <div className="h-full flex flex-col items-center justify-center gap-12 relative z-10">
                <div className="flex items-center gap-12">
                    <div onClick={() => gameState.turn === 0 && drawCard(0)} className="w-24 h-36 bg-blue-900 rounded-xl border-4 border-white flex items-center justify-center cursor-pointer hover:rotate-3 transition-transform shadow-2xl">
                        <span className="text-white font-black -rotate-45">UNO</span>
                    </div>
                    <UnoCard card={topCard} />
                </div>

                {/* 自分の手札 */}
                <div className="flex flex-col items-center gap-6 mt-12">
                    <div className="flex -space-x-6">
                        {gameState.players[0]?.map((card) => (
                            <div key={card.id} onClick={() => setSelectedIds(prev => prev.includes(card.id) ? prev.filter(i => i !== card.id) : [...prev, card.id])}
                                className={`transition-all duration-300 cursor-pointer ${selectedIds.includes(card.id) ? '-translate-y-10 scale-110 z-50' : 'hover:-translate-y-4'}`}>
                                <UnoCard card={card} />
                            </div>
                        ))}
                    </div>
                    {selectedIds.length > 0 && (
                        <button onClick={handlePlay} className="px-10 py-3 bg-yellow-400 text-black font-black rounded-full animate-bounce">
                            PLAY {selectedIds.length}枚
                        </button>
                    )}
                </div>
            </div>

            {/* 色選択モーダル（略：前回のコードと同じ） */}
            {isSelectingColor && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-[100]">
                    <div className="grid grid-cols-2 gap-4">
                        {(['red', 'blue', 'green', 'yellow'] as Color[]).map(c => (
                            <button key={c} onClick={() => executeMove(0, pendingCards, c)} className={`w-24 h-24 rounded-full border-4 border-white bg-${c === 'yellow' ? 'yellow-400' : c + '-600'}`} />
                        ))}
                    </div>
                </div>
            )}

            {/* 終了画面 */}
            {gameState.gameEnd && (
                <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[200]">
                    <h2 className="text-6xl font-black text-white mb-8">P{gameState.winner} WIN!</h2>
                    <button onClick={() => setView('home')} className="px-8 py-3 bg-white font-bold rounded-lg">HOME</button>
                </div>
            )}
        </div>
    );
};