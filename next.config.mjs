/** @type {import('next').NextConfig} */
const nextConfig = {
    // Vercelでは output: 'export' も不要ですが、あっても動きます。
    // 推奨は Vercel の最適化を活かすために最小限の設定にすることです。

    images: {
        unoptimized: true,
    },

    // 以下の GitHub Pages 用設定を「削除」または「コメントアウト」
    // basePath: '/uno-game',
    // assetPrefix: '/uno-game/', 
};

export default nextConfig;