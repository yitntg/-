/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 启用SWC压缩，提高性能
  swcMinify: true,
  
  // 静态导出设置
  output: 'export',
  distDir: 'out',
  
  // 确保生成的静态文件可以在任何路径下工作
  assetPrefix: './',
  trailingSlash: true,
  
  // 禁用图像优化，因为静态导出不支持
  images: {
    unoptimized: true,
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