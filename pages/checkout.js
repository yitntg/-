import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Checkout.module.css'
import { loadAirwallex } from '@airwallex/components'

export default function Checkout() {
  const router = useRouter()
  const { plan, price } = router.query
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isAirwallexReady, setIsAirwallexReady] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  
  // 获取套餐名称
  const getPlanName = () => {
    switch(plan) {
      case 'basic': return '基础套餐';
      case 'pro': return '专业套餐';
      case 'enterprise': return '企业套餐';
      default: return '未知套餐';
    }
  }
  
  // 初始化Airwallex
  useEffect(() => {
    const initAirwallex = async () => {
      try {
        await loadAirwallex({
          env: 'prod', // 或 'staging' 用于测试环境
        });
        setIsAirwallexReady(true);
      } catch (error) {
        console.error('Failed to load Airwallex SDK:', error);
        setError('载入支付组件失败，请刷新页面重试');
      }
    };
    
    // 如果路由已准备好且有plan和price参数，则初始化Airwallex
    if (router.isReady && plan && price) {
      initAirwallex();
    }
    
    return () => {
      if (window.Airwallex) {
        window.Airwallex.destroy();
      }
    };
  }, [router.isReady, plan, price]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 简单的表单验证
    if (!customerInfo.name || !customerInfo.email) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (!plan || !price) {
      setError('套餐信息不完整');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 创建订阅支付意向
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          price: parseFloat(price),
          currency: 'CNY',
          customer: customerInfo
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '创建订阅失败');
      }
      
      setPaymentIntentId(data.id);
      setClientSecret(data.client_secret);
      
    } catch (error) {
      console.error('订阅错误:', error);
      setError(error.message || '订阅处理过程中出错，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = (response) => {
    console.log('支付成功:', response);
    window.location.href = `/subscription-success?id=${paymentIntentId}&plan=${plan}`;
  };
  
  const handlePaymentError = (error) => {
    console.error('支付错误:', error);
    setError('支付失败: ' + (error.message || '未知错误'));
  };
  
  // 如果路由还未准备好，显示加载状态
  if (!router.isReady) {
    return <div className="container">加载中...</div>;
  }
  
  // 如果没有套餐信息，重定向到首页
  if (router.isReady && (!plan || !price)) {
    return (
      <div className="container">
        <div className={styles.errorContainer}>
          <h1>无效的套餐信息</h1>
          <p>请返回首页选择一个有效的套餐。</p>
          <a href="/" className="button">返回首页</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container">
      <div className={styles.checkoutContainer}>
        <h1 className={styles.title}>订阅结账</h1>
        
        <div className={styles.planInfo}>
          <h2>{getPlanName()}</h2>
          <p className={styles.price}>¥{price}/月</p>
        </div>
        
        {!clientSecret ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label htmlFor="name">姓名 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                placeholder="输入您的姓名"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">电子邮箱 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                placeholder="输入您的电子邮箱"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">电话号码</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                placeholder="输入您的电话号码（选填）"
              />
            </div>
            
            {error && <p className="error">{error}</p>}
            
            <button 
              type="submit" 
              className="button" 
              disabled={loading}
            >
              {loading ? '处理中...' : '继续支付'}
            </button>
          </form>
        ) : (
          <div className={styles.paymentElement}>
            <h2>付款详情</h2>
            <p>套餐: {getPlanName()}</p>
            <p>金额: ¥{price}/月</p>
            
            {isAirwallexReady && (
              <div id="airwallex-card">
                {window.Airwallex && (
                  window.Airwallex.createElement('card', {
                    intent: {
                      id: paymentIntentId,
                      client_secret: clientSecret,
                    },
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#32325d',
                      },
                    },
                    onReady: (element) => {
                      element.mount('airwallex-card');
                    },
                    onSuccess: handlePaymentSuccess,
                    onError: handlePaymentError,
                  })
                )}
              </div>
            )}
            
            {error && <p className="error">{error}</p>}
          </div>
        )}
        
        <div className={styles.backLink}>
          <a href="/">&larr; 返回套餐选择</a>
        </div>
      </div>
    </div>
  )
} 