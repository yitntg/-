import { useState, useEffect } from 'react'
import styles from '../styles/Payment.module.css'
import { createPaymentIntent } from '../lib/clientApi'

export default function Payment() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isPaymentReady, setIsPaymentReady] = useState(false)
  
  // 模拟初始化支付SDK
  useEffect(() => {
    const initPayment = async () => {
      try {
        // 这里我们只是模拟，不实际加载Airwallex
        setTimeout(() => {
          setIsPaymentReady(true);
        }, 1000);
      } catch (error) {
        console.error('Failed to load payment SDK:', error);
        setError('载入支付组件失败，请刷新页面重试');
      }
    };
    
    initPayment();
    
    return () => {
      // 清理代码
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('请输入有效的金额');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 使用模拟数据
      setTimeout(() => {
        setPaymentIntentId("demo_" + Date.now());
        setClientSecret("demo_secret_" + Date.now());
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('支付错误:', error);
      setError(error.message || '支付处理过程中出错，请重试');
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = (response) => {
    console.log('支付成功:', response);
    window.location.href = `/payment-success?id=demo_${Date.now()}`;
  };
  
  const handlePaymentError = (error) => {
    console.error('支付错误:', error);
    setError('支付失败: ' + (error.message || '未知错误'));
  };
  
  return (
    <div className="container">
      <div className={styles.paymentContainer}>
        <h1 className={styles.title}>一次性支付</h1>
        
        {!clientSecret ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label htmlFor="amount">金额 (CNY)</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="输入支付金额"
                step="0.01"
                min="0.01"
                required
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
            <p>金额: ¥{amount}</p>
            
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
          <a href="/">&larr; 返回首页</a>
        </div>
      </div>
    </div>
  )
} 