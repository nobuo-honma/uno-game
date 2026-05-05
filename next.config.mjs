/** @type {import('next').NextConfig} */
const nextConfig = {
    // 静的エクスポートを有効にする（GitHub Pagesに必須）
    output: 'export',

    // 画像の最適化を無効化（静的サイトではサーバーサイドの画像処理ができないため）
    images: {
        unoptimized: true,
    },

    // 重要：リポジトリ名をパスに含める
    // URLが https://nobuo-honma.github.io/uno-game/ になる場合は '/uno-game'
    basePath: '/uno-game',

    // 資産（JS/CSS）の読み込みパスを合わせる
    assetPrefix: '/uno-game',
};

export default nextConfig;