/**
 * 环境变量帮助工具
 * 用于获取云平台（如Cloudflare Pages）上的环境变量
 */

export function getEnvVariable(key, defaultValue = '') {
  // 尝试从进程环境变量获取
  const processValue = process.env[key];
  if (processValue) return processValue;
  
  // 尝试从Cloudflare Pages环境变量获取（如果在Cloudflare Pages上运行）
  if (typeof globalThis.ENVIRONMENT_VARIABLES !== 'undefined') {
    const cfValue = globalThis.ENVIRONMENT_VARIABLES[key];
    if (cfValue) return cfValue;
  }
  
  // 如果都没有找到，返回默认值
  return defaultValue;
}

// 获取Airwallex API密钥
export function getAirwallexApiKey() {
  return getEnvVariable('AIRWALLEX_API_KEY');
}

// 获取Airwallex Client ID
export function getAirwallexClientId() {
  return getEnvVariable('AIRWALLEX_CLIENT_ID');
}

// 检查环境变量是否设置完整
export function checkRequiredEnvVars() {
  const requiredVars = [
    'AIRWALLEX_API_KEY',
    'AIRWALLEX_CLIENT_ID'
  ];
  
  const missingVars = requiredVars.filter(key => !getEnvVariable(key));
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
} 