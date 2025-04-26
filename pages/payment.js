import { useState, useEffect } from 'react'
import styles from '../styles/Payment.module.css'
import { loadAirwallex } from '@airwallex/components'

export default function Payment() {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [isAirwallexReady, setIsAirwallexReady] = useState(false)
  
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
    
    initAirwallex();
    
    return () => {
      if (window.Airwallex) {
        window.Airwallex.destroy();
      }
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
      // 创建支付意向
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'CNY',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '创建支付失败');
      }
      
      setPaymentIntentId(data.id);
      setClientSecret(data.client_secret);
      
    } catch (error) {
      console.error('支付错误:', error);
      setError(error.message || '支付处理过程中出错，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = (response) => {
    console.log('支付成功:', response);
    window.location.href = `/payment-success?id=${paymentIntentId}`;
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
          <a href="/">&larr; 返回首页</a>
        </div>
      </div>
    </div>
  )
} 