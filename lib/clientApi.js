/**
 * 客户端API库
 * 由于静态导出不支持API路由，我们将API调用移至客户端
 */

// Airwallex API基础URL
const AIRWALLEX_BASE_URL = 'https://api.airwallex.com/api/v1';

// 从环境变量或配置获取API密钥和Client ID
// 注意：生产环境中不应在客户端暴露API密钥，
// 这里仅作为示例，实际应通过安全的后端服务或Cloudflare Worker处理
const getApiCredentials = () => {
  // 这应该由后端安全地提供，或使用Cloudflare Worker
  return {
    apiKey: process.env.NEXT_PUBLIC_AIRWALLEX_API_KEY || '',
    clientId: process.env.NEXT_PUBLIC_AIRWALLEX_CLIENT_ID || ''
  };
};

// 获取认证令牌
export async function getAuthToken() {
  const { apiKey, clientId } = getApiCredentials();
  
  if (!apiKey || !clientId) {
    throw new Error('缺少Airwallex API凭证');
  }
  
  try {
    const response = await fetch(`${AIRWALLEX_BASE_URL}/authentication/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-client-id': clientId
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`认证失败: ${error.message || JSON.stringify(error)}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('获取认证令牌失败:', error);
    throw error;
  }
}

// 创建支付意向
export async function createPaymentIntent(amount, currency = 'CNY') {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${AIRWALLEX_BASE_URL}/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_order_id: `order_${Date.now()}`,
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`创建支付意向失败: ${error.message || JSON.stringify(error)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建支付意向失败:', error);
    throw error;
  }
}

// 创建订阅支付意向
export async function createSubscription(plan, price, currency = 'CNY', customer) {
  try {
    const token = await getAuthToken();
    
    // 为了简化，这里不处理客户创建和查询
    // 在实际生产应用中，应通过安全的后端服务或Cloudflare Worker处理
    
    const response = await fetch(`${AIRWALLEX_BASE_URL}/pa/payment_intents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: price,
        currency,
        merchant_order_id: `subscription_${plan}_${Date.now()}`,
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
        order: {
          products: [
            {
              name: `${plan} 订阅`,
              quantity: 1,
              price,
              desc: `${plan} 月度订阅`
            }
          ]
        },
        metadata: {
          subscription_plan: plan,
          subscription_type: 'monthly',
          customer_email: customer.email,
          customer_name: customer.name
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`创建订阅支付意向失败: ${error.message || JSON.stringify(error)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建订阅支付意向失败:', error);
    throw error;
  }
} 