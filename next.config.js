/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 启用SWC压缩，提高性能
  swcMinify: true,
  
  // 针对Cloudflare Pages的配置
  // 使用Edge Runtime，更好地支持Cloudflare Pages环境
  experimental: {
    runtime: 'experimental-edge',
  },
  
  // 这里可以使用静态导出，如果你的API调用全部是客户端的
  // 注意：启用后会失去服务端渲染能力，API路由也会失效
  // output: 'export',
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig 