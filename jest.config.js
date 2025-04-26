const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // 指向Next.js应用的路径
  dir: './',
})

// Jest的自定义配置
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // 处理模块别名
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

// createJestConfig会异步地加载next.config.js和.env文件
module.exports = createJestConfig(customJestConfig) 