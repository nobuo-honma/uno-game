"use client";
import { useState, useEffect, useCallback } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import type { GameState, Card, Color } from '../types/uno';

export const useUnoOnline = (roomId: string | null) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [playerIndex, setPlayerIndex] = useState<number | null>(null);

    // 1. サーバー上のゲーム状態をリアルタイム購読
    useEffect(() => {
        if (!roomId) return;
        const gameRef = ref(database, `rooms/${roomId}`);

        const unsubscribe = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setGameState(data);
        });

        return () => unsubscribe();
    }, [roomId]);

    // 2. カードを出す・引く操作をサーバーへ同期
    const updateRemoteGame = useCallback(async (newState: GameState) => {
        if (!roomId) return;
        await set(ref(database, `rooms/${roomId}`), newState);
    }, [roomId]);

    // 3. ルームへの入室処理
    const joinRoom = useCallback(async (id: string) => {
        const roomRef = ref(database, `rooms/${id}/players`);
        // 簡易的な入室ロジック（実際は認証や空き状況確認が必要）
        // ここでは「何番目のプレイヤーか」を決定する
        onValue(roomRef, (snapshot) => {
            const currentPlayers = snapshot.val() || [];
            if (playerIndex === null) {
                setPlayerIndex(currentPlayers.length);
            }
        }, { onlyOnce: true });
    }, [playerIndex]);

    return { gameState, playerIndex, updateRemoteGame, joinRoom };
};