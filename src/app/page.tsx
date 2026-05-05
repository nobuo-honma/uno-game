import { GameBoard } from '../components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950">
      {/* 
        ゲーム画面を表示。
        Next.jsのクライアントコンポーネントとしてGameBoardが動作します。
      */}
      <GameBoard />
    </main>
  );
}