/**
 * 客户端API库
 * 使用模拟数据替代真实API调用
 */

// 生成唯一ID
const generateId = () => `demo_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

// 创建支付意向
export async function createPaymentIntent(amount, currency = 'CNY') {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // 返回模拟数据
  return {
    id: generateId(),
    client_secret: `secret_${generateId()}`,
    amount,
    currency,
    status: 'REQUIRES_PAYMENT_METHOD'
  };
}

// 创建订阅支付意向
export async function createSubscription(plan, price, currency = 'CNY', customer) {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // 返回模拟数据
  return {
    id: generateId(),
    client_secret: `secret_${generateId()}`,
    amount: price,
    currency,
    status: 'REQUIRES_PAYMENT_METHOD',
    metadata: {
      subscription_plan: plan,
      subscription_type: 'monthly',
      customer_email: customer.email,
      customer_name: customer.name
    }
  };
} 