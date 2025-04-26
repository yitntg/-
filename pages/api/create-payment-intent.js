// 该API端点用于创建Airwallex支付意向
import { getAirwallexApiKey, getAirwallexClientId, checkRequiredEnvVars } from '../../lib/env';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '仅支持POST请求' });
  }

  try {
    // 检查必要的环境变量
    const { isValid, missingVars } = checkRequiredEnvVars();
    if (!isValid) {
      console.error('缺少必要的环境变量:', missingVars);
      return res.status(500).json({ message: '服务器配置错误' });
    }

    const { amount, currency = 'CNY' } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: '请提供有效的金额' });
    }
    
    // 获取Airwallex API密钥和Client ID
    const apiKey = getAirwallexApiKey();
    const clientId = getAirwallexClientId();
    
    // 获取Airwallex认证Token
    const authResponse = await fetch('https://api.airwallex.com/api/v1/authentication/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-client-id': clientId
      }
    });
    
    if (!authResponse.ok) {
      const authError = await authResponse.json();
      console.error('Airwallex 认证失败:', authError);
      return res.status(500).json({ message: '支付服务认证失败' });
    }
    
    const { token } = await authResponse.json();
    
    // 创建支付意向
    const paymentResponse = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount,
        currency,
        merchant_order_id: `order_${Date.now()}`,
        request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      })
    });
    
    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      console.error('Airwallex 创建支付意向失败:', paymentError);
      return res.status(500).json({ message: '创建支付失败' });
    }
    
    const paymentIntent = await paymentResponse.json();
    
    return res.status(200).json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });
    
  } catch (error) {
    console.error('创建支付意向时出错:', error);
    return res.status(500).json({ message: '处理支付时发生错误' });
  }
} 