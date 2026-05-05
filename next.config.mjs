/** @type {import('next').NextConfig} */
const nextConfig = {
    // 1. 静的出力
    output: 'export',

    // 2. 画像の最適化無効化
    images: {
        unoptimized: true,
    },

    // 3. リポジトリ名を設定（前後にスラッシュを付ける）
    basePath: '/uno-game',

    // 4. assetPrefix は basePath と同じにするが、末尾にスラッシュが必要な場合がある
    // ※実は、最近のNext.jsなら assetPrefix 自体を消しても basePath だけで動くことが多いです
    assetPrefix: '/uno-game/',
};

export default nextConfig;