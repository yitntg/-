// 该API端点用于创建订阅支付
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

    const { plan, price, currency = 'CNY', customer } = req.body;
    
    if (!plan || !price || isNaN(price) || price <= 0) {
      return res.status(400).json({ message: '请提供有效的套餐和价格' });
    }
    
    if (!customer || !customer.name || !customer.email) {
      return res.status(400).json({ message: '请提供有效的客户信息' });
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
    
    // 创建或获取客户
    let customerId;
    
    // 查询客户是否已存在
    const customerSearchResponse = await fetch(
      `https://api.airwallex.com/api/v1/pa/customers/list?email=${encodeURIComponent(customer.email)}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (customerSearchResponse.ok) {
      const customerData = await customerSearchResponse.json();
      if (customerData.items && customerData.items.length > 0) {
        customerId = customerData.items[0].id;
      }
    }
    
    // 如果客户不存在，创建新客户
    if (!customerId) {
      const customerResponse = await fetch('https://api.airwallex.com/api/v1/pa/customers/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: `req_customer_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
          first_name: customer.name.split(' ')[0],
          last_name: customer.name.split(' ').length > 1 ? customer.name.split(' ').slice(1).join(' ') : '-',
          email: customer.email,
          phone_number: customer.phone || undefined,
        })
      });
      
      if (!customerResponse.ok) {
        console.error('创建客户失败:', await customerResponse.text());
        // 即使客户创建失败也继续，因为可以不绑定客户ID创建支付意向
      } else {
        const customerData = await customerResponse.json();
        customerId = customerData.id;
      }
    }
    
    // 创建订阅支付意向
    const subscriptionPaymentBody = {
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
      }
    };
    
    // 如果有客户ID，添加到请求中
    if (customerId) {
      subscriptionPaymentBody.customer_id = customerId;
    }
    
    const paymentResponse = await fetch('https://api.airwallex.com/api/v1/pa/payment_intents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionPaymentBody)
    });
    
    if (!paymentResponse.ok) {
      const paymentError = await paymentResponse.json();
      console.error('Airwallex 创建订阅支付意向失败:', paymentError);
      return res.status(500).json({ message: '创建订阅失败' });
    }
    
    const paymentIntent = await paymentResponse.json();
    
    // 关联订阅信息到支付意图的元数据
    const updateResponse = await fetch(`https://api.airwallex.com/api/v1/pa/payment_intents/${paymentIntent.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: {
          subscription_plan: plan,
          subscription_type: 'monthly',
          customer_email: customer.email,
          customer_name: customer.name
        }
      })
    });
    
    if (!updateResponse.ok) {
      console.warn('更新支付意向元数据失败:', await updateResponse.text());
      // 继续，因为这只是元数据更新
    }
    
    return res.status(200).json({
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_id: customerId || null
    });
    
  } catch (error) {
    console.error('创建订阅时出错:', error);
    return res.status(500).json({ message: '处理订阅支付时发生错误' });
  }
} 