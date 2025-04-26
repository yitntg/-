/**
 * Airwallex支付服务工具类
 * 提供与Airwallex API交互的方法
 */
import { getAirwallexApiKey, getAirwallexClientId } from './env';

// 获取Airwallex API认证令牌
export async function getAuthToken() {
  const apiKey = getAirwallexApiKey();
  const clientId = getAirwallexClientId();
  
  if (!apiKey || !clientId) {
    throw new Error('缺少Airwallex API凭证');
  }
  
  const response = await fetch('https://api.airwallex.com/api/v1/authentication/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-client-id': clientId
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airwallex认证失败: ${error.message || JSON.stringify(error)}`);
  }
  
  const { token } = await response.json();
  return token;
}

// 创建支付意向
export async function createPaymentIntent(amount, currency = 'CNY', customerId = null) {
  const token = await getAuthToken();
  
  const paymentBody = {
    amount,
    currency,
    merchant_order_id: `order_${Date.now()}`,
    request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
  };
  
  if (customerId) {
    paymentBody.customer_id = customerId;
  }
  
  const response = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(paymentBody)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建支付意向失败: ${error.message || JSON.stringify(error)}`);
  }
  
  return await response.json();
}

// 创建客户
export async function createCustomer(customerInfo) {
  const token = await getAuthToken();
  
  const customerBody = {
    request_id: `req_customer_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    first_name: customerInfo.name.split(' ')[0],
    last_name: customerInfo.name.split(' ').length > 1 ? customerInfo.name.split(' ').slice(1).join(' ') : '-',
    email: customerInfo.email,
  };
  
  if (customerInfo.phone) {
    customerBody.phone_number = customerInfo.phone;
  }
  
  const response = await fetch('https://api.airwallex.com/api/v1/pa/customers/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(customerBody)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`创建客户失败: ${error.message || JSON.stringify(error)}`);
  }
  
  return await response.json();
}

// 查询客户
export async function findCustomerByEmail(email) {
  const token = await getAuthToken();
  
  const response = await fetch(
    `https://api.airwallex.com/api/v1/pa/customers/list?email=${encodeURIComponent(email)}`, 
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`查询客户失败: ${error.message || JSON.stringify(error)}`);
  }
  
  const result = await response.json();
  return result.items && result.items.length > 0 ? result.items[0] : null;
}

// 获取支付状态
export async function getPaymentStatus(paymentIntentId) {
  const token = await getAuthToken();
  
  const response = await fetch(
    `https://api.airwallex.com/api/v1/pa/payment_intents/${paymentIntentId}`, 
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`获取支付状态失败: ${error.message || JSON.stringify(error)}`);
  }
  
  return await response.json();
}

// 更新支付意图
export async function updatePaymentIntent(paymentIntentId, data) {
  const token = await getAuthToken();
  
  const response = await fetch(
    `https://api.airwallex.com/api/v1/pa/payment_intents/${paymentIntentId}`, 
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`更新支付意图失败: ${error.message || JSON.stringify(error)}`);
  }
  
  return await response.json();
} 