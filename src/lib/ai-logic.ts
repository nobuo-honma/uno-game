import type { Card, Color } from '../types/uno';
import { canPlayCards } from './uno-utils';

export const selectAiCards = (hand: Card[], topCard: Card, activeColor: Color | null): Card[] => {
    const currentColor = activeColor || topCard.color;

    // 1. 出せる全てのカードをリストアップ
    const playable = hand.filter(c =>
        c.color === 'wild' || c.value === 'wild' || c.value === 'wild4' || c.color === currentColor || c.value === topCard.value
    );

    if (playable.length === 0) return [];

    // 2. その中から、手札に同じ数字が最も多いものを選ぶ
    const sortedPlayable = [...playable].sort((a, b) => {
        const countA = hand.filter(c => c.value === a.value).length;
        const countB = hand.filter(c => c.value === b.value).length;
        return countB - countA;
    });

    const bestBaseCard = sortedPlayable[0];
    if (!bestBaseCard) return [];

    // 3. 同じ数字のカードを全部まとめて返す
    return hand.filter(c => c.value === bestBaseCard.value);
};