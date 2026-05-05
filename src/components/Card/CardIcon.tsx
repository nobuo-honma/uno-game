"use client";
import React from 'react';
import type { CardValue } from '../../types/uno';

export const CardIcon = ({ value, className = "w-10 h-10" }: { value: CardValue, className?: string }) => {
    const props = {
        className,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "3",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const
    };

    switch (value) {
        case 'skip': return (
            <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
        );
        case 'reverse': return (
            <svg {...props}><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
        );
        case 'draw2': return <div className="font-black text-xl">+2</div>;
        case 'wild': return <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-tr from-red-500 via-blue-500 to-yellow-500" />;
        case 'wild4': return <div className="font-black text-xl text-yellow-300">+4</div>;
        default: return <span className="text-3xl font-black italic">{value}</span>;
    }
};