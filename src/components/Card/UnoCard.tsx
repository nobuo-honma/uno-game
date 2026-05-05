"use client";
import React from 'react';
import type { Card } from '../../types/uno';
import { CardIcon } from './CardIcon';

interface UnoCardProps {
    card: Card;
    onClick?: () => void;
}

const colorClasses: Record<string, string> = {
    red: 'bg-red-600',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-400',
    wild: 'bg-zinc-900'
};

export const UnoCard = ({ card, onClick }: UnoCardProps) => {

    return (
        <div
            onClick={onClick}
            className={`${colorClasses[card.color]} w-24 h-36 rounded-xl border-4 border-white shadow-lg flex flex-col items-center justify-between p-2 cursor-pointer hover:-translate-y-4 transition-all duration-200 group relative overflow-hidden`}
        >
            <div className="self-start text-white font-bold text-sm">{card.value}</div>
            <div className="bg-white/20 w-16 h-20 rounded-full flex items-center justify-center rotate-12 shadow-inner">
                <div className="-rotate-12 text-white">
                    <CardIcon value={card.value} />
                </div>
            </div>
            <div className="self-end text-white font-bold text-sm rotate-180">{card.value}</div>
        </div>
    );
};