"use client";
import React, { useState, useEffect } from 'react';
import { useUnoGame } from '../hooks/useUnoGame';
import { UnoCard } from './Card/UnoCard';
import type { Card, Color } from '../types/uno';
import { canPlayCards } from '../lib/uno-utils';

export const GameBoard = () => {
    const { gameState, initGame, playCards, drawCard, isSelectingColor, pendingCards, executeMove } = useUnoGame();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => { initGame(); }, [initGame]);

    // 1. ガード：gameState が null の場合は何も表示しない
    if (!gameState) return null;

    // 2. データの抽出（gameState が存在することを保証した上で取得）
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    const playerHand = gameState.players[0];
    const aiHand = gameState.players[1];

    // 3. 追加のガード：万が一配列が空だった場合のエラーを防ぐ
    if (!topCard || !playerHand || !aiHand) return null;

    const activeColor = gameState.activeColor || topCard.color;

    const colorMap: Record<string, string> = {
        red: 'bg-red-600',
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        yellow: 'bg-yellow-400',
        wild: 'bg-zinc-800'
    };

    const handlePlay = () => {
        // playerHand.find の戻り値が undefined の可能性を filter(Boolean) で除去し、型を Card[] に確定させる
        const cards = selectedIds
            .map(id => playerHand.find((c: Card) => c.id === id))
            .filter((c): c is Card => !!c);

        if (cards.length > 0 && canPlayCards(cards, topCard, gameState.activeColor)) {
            playCards(0, cards);
            setSelectedIds([]);
        }
    };

    return (
        <div className={`flex flex-col h-screen transition-colors duration-500 ${activeColor === 'wild' ? 'bg-neutral-900' : `${colorMap[activeColor]}/20`}`}>

            {/* ヘッダー */}
            <div className="p-4 flex justify-between items-center bg-black/40 text-white">
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 border-white ${colorMap[activeColor]}`} />
                    <span className="font-bold text-lg uppercase tracking-widest">
                        Current Color: {activeColor}
                    </span>
                </div>
                <div className="text-sm font-mono">Deck: {gameState.deck.length}</div>
            </div>

            {/* AI Area */}
            <div className="h-1/5 flex items-center justify-center -space-x-8 opacity-50 scale-75">
                {aiHand.map((_: any, i: number) => (
                    <div key={i} className="w-12 h-20 bg-indigo-950 border border-white/30 rounded-lg shadow-2xl" />
                ))}
            </div>

            {/* Center Area */}
            <div className="flex-1 flex items-center justify-center gap-16 relative">
                <div className={`absolute w-64 h-64 rounded-full blur-[80px] opacity-40 animate-pulse ${colorMap[activeColor]}`} />

                <div onClick={() => drawCard(0)} className="group cursor-pointer">
                    <div className="w-24 h-36 bg-indigo-900 border-4 border-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
                        <span className="text-white font-black rotate-90">UNO</span>
                    </div>
                </div>

                <div className="relative z-10">
                    <UnoCard card={topCard} />
                    <div className={`absolute -inset-4 border-8 rounded-2xl animate-ping opacity-20 ${activeColor === 'red' ? 'border-red-500' : activeColor === 'blue' ? 'border-blue-500' : activeColor === 'green' ? 'border-green-500' : 'border-yellow-400'}`} />
                </div>
            </div>

            {/* Player Area */}
            <div className="h-2/5 flex flex-col items-center justify-end pb-10 px-4">
                <div className="flex flex-wrap justify-center -space-x-4 mb-10 max-w-5xl">
                    {playerHand.map((card: Card) => (
                        <div
                            key={card.id}
                            onClick={() => setSelectedIds((prev: string[]) => prev.includes(card.id) ? prev.filter((i: string) => i !== card.id) : [...prev, card.id])}
                            className={`transform transition-all duration-300 cursor-pointer ${selectedIds.includes(card.id) ? '-translate-y-12 scale-110 z-50' : 'hover:-translate-y-4'}`}
                        >
                            <UnoCard card={card} />
                        </div>
                    ))}
                </div>

                {selectedIds.length > 0 && (
                    <button onClick={handlePlay} className="px-12 py-4 bg-white text-black font-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-yellow-400 transition-all uppercase tracking-tighter">
                        Play {selectedIds.length} Card{selectedIds.length > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* 色選択モーダル */}
            {isSelectingColor && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
                    <h2 className="text-white text-3xl font-black mb-12 tracking-tighter uppercase italic">Choose Next Color</h2>
                    <div className="grid grid-cols-2 gap-6">
                        {(['red', 'blue', 'green', 'yellow'] as Color[]).map(color => (
                            <button
                                key={color}
                                onClick={() => executeMove(0, pendingCards, color)}
                                className={`${colorMap[color]} w-40 h-40 rounded-3xl border-4 border-white/50 hover:border-white hover:scale-110 transition-all flex items-center justify-center shadow-2xl group`}
                            >
                                <span className="text-white font-black text-xl opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                                    {color}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};