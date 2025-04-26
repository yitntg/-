import { useRouter } from 'next/router'
import styles from '../styles/Success.module.css'

export default function SubscriptionSuccess() {
  const router = useRouter()
  const { id, plan } = router.query
  
  // 获取套餐名称
  const getPlanName = () => {
    switch(plan) {
      case 'basic': return '基础套餐';
      case 'pro': return '专业套餐';
      case 'enterprise': return '企业套餐';
      default: return '未知套餐';
    }
  }
  
  return (
    <div className="container">
      <div className={styles.successContainer}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 4L12 14.01L9 11.01" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h1 className={styles.title}>订阅成功！</h1>
        
        <p className={styles.description}>
          您已成功订阅了{plan && getPlanName()}。感谢您的订阅！
        </p>
        
        {id && (
          <p className={styles.orderNumber}>
            订阅编号: <span>{id}</span>
          </p>
        )}
        
        <div className={styles.additionalInfo}>
          <h2>下一步</h2>
          <p>我们已经发送了一封确认邮件到您的邮箱。请查收邮件了解更多信息。</p>
        </div>
        
        <div className={styles.actions}>
          <a href="/" className="button">返回首页</a>
        </div>
      </div>
    </div>
  )
} 