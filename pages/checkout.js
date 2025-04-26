import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from '../styles/Checkout.module.css'
import { createSubscription } from '../lib/clientApi'

export default function Checkout() {
  const router = useRouter()
  const { plan, price } = router.query
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isPaymentReady, setIsPaymentReady] = useState(false)
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
  
  // 初始化支付SDK
  useEffect(() => {
    const initPayment = async () => {
      try {
        // 模拟SDK加载
        setTimeout(() => {
          setIsPaymentReady(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to load payment SDK:', error);
        setError('载入支付组件失败，请刷新页面重试');
      }
    };
    
    // 如果路由已准备好且有plan和price参数，则初始化支付SDK
    if (router.isReady && plan && price) {
      initPayment();
    }
    
    return () => {
      // 清理代码
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
      // 模拟API调用
      setTimeout(() => {
        setPaymentIntentId("demo_" + Date.now());
        setClientSecret("demo_secret_" + Date.now());
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('订阅错误:', error);
      setError(error.message || '订阅处理过程中出错，请重试');
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = (response) => {
    console.log('支付成功:', response);
    window.location.href = `/subscription-success?id=demo_${Date.now()}&plan=${plan}`;
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
            
            {isPaymentReady && (
              <div id="payment-card" className={styles.paymentDemo}>
                <div className={styles.demoCard}>
                  <h3>模拟支付卡</h3>
                  <div className={styles.formGroup}>
                    <label>卡号</label>
                    <input type="text" placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>有效期</label>
                      <input type="text" placeholder="MM/YY" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>CVC</label>
                      <input type="text" placeholder="123" />
                    </div>
                  </div>
                  <button 
                    className="button"
                    onClick={handlePaymentSuccess}
                  >
                    确认支付
                  </button>
                </div>
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