/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 启用静态导出
  output: 'export',
  
  // 禁用图像优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
  
  // 确保资源引用正确
  assetPrefix: './',
  
  // 使路径包含斜杠，避免路由问题
  trailingSlash: true,
}

module.exports = nextConfig 