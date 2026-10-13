/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // 本地开发替代 nginx 的 /api 代理（Docker 部署由 survey-client.conf 提供）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3005/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
