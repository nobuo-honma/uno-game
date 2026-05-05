import type { Card, Color, CardValue } from '../types/uno';

export const createDeck = (): Card[] => {
    const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
    const values: CardValue[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];
    const deck: Card[] = [];

    colors.forEach(color => {
        values.forEach(value => {
            deck.push({ id: `${color}-${value}-${Math.random()}`, color, value });
            if (value !== '0') deck.push({ id: `${color}-${value}-extra-${Math.random()}`, color, value });
        });
    });

    for (let i = 0; i < 4; i++) {
        deck.push({ id: `wild-${i}`, color: 'wild', value: 'wild' });
        deck.push({ id: `wild4-${i}`, color: 'wild', value: 'wild4' });
    }
    return deck;
};

export const shuffle = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = newArray[i] as T;
        newArray[i] = newArray[j] as T;
        newArray[j] = temp;
    }
    return newArray;
};

export const canPlayCards = (selectedCards: Card[], topCard: Card, activeColor: Color | null): boolean => {
    if (selectedCards.length === 0) return false;

    const first = selectedCards[0];
    if (!first) return false;

    const currentColor = activeColor || topCard.color;
    const isWild = first.color === 'wild' || first.value === 'wild' || first.value === 'wild4';

    // 1枚目が出せるかチェック
    const canFirstBePlayed =
        isWild ||
        first.color === currentColor ||
        first.value === topCard.value;

    if (!canFirstBePlayed) return false;

    // 2枚目以降がある場合、全て同じ数字/記号であることを確認
    return selectedCards.every(c => c.value === first.value);
};