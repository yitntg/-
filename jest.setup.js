// 导入jest-dom扩展
import '@testing-library/jest-dom'

// 模拟Airwallex全局对象
global.Airwallex = {
  createElement: jest.fn(() => ({
    mount: jest.fn(),
  })),
  destroy: jest.fn(),
};

// 模拟环境变量
process.env = {
  ...process.env,
  AIRWALLEX_API_KEY: 'test_api_key',
  AIRWALLEX_CLIENT_ID: 'test_client_id',
}; 