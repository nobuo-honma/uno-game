export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
    id: string;
    color: Color;
    value: CardValue;
}

export interface GameState {
    deck: Card[];
    discardPile: Card[];
    players: Card[][]; // インデックス0が自分、1-3がCPU
    turn: number;
    direction: 1 | -1;
    gameEnd: boolean;
    winner: number | null;
    activeColor: Color | null;
    playerCount: number; // 2〜4人で可変
}