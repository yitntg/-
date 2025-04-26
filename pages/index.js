import { useState } from 'react'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

export default function Home() {
  const [selectedPlan, setSelectedPlan] = useState(null)
  
  const plans = [
    { id: 'basic', name: '基础套餐', price: 99, period: '月', features: ['功能1', '功能2', '功能3'] },
    { id: 'pro', name: '专业套餐', price: 199, period: '月', features: ['功能1', '功能2', '功能3', '功能4', '功能5'] },
    { id: 'enterprise', name: '企业套餐', price: 499, period: '月', features: ['全部功能', '优先支持', '自定义集成'] }
  ]
  
  return (
    <div className="container">
      <main>
        <h1 className={styles.title}>欢迎使用我们的支付系统</h1>
        
        <p className={styles.description}>
          选择适合您的套餐，开始使用我们的服务
        </p>
        
        <div className={styles.grid}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`${styles.card} ${selectedPlan === plan.id ? styles.selected : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <h2>{plan.name}</h2>
              <p className={styles.price}>
                ¥{plan.price}<span>/{plan.period}</span>
              </p>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className={styles.action}>
                <button 
                  className="button"
                  disabled={selectedPlan !== plan.id}
                  onClick={() => {
                    if (selectedPlan === plan.id) {
                      window.location.href = `/checkout?plan=${plan.id}&price=${plan.price}`;
                    }
                  }}
                >
                  选择此套餐
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.oneTimePayment}>
          <h2>一次性支付</h2>
          <p>需要进行一次性支付？</p>
          <Link href="/payment">
            <button className="button">立即付款</button>
          </Link>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} 支付系统. 保留所有权利.
        </p>
      </footer>
    </div>
  )
} 