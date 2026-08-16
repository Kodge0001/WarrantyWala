import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Zap, Crown, ArrowRight } from 'lucide-react'
import './Pricing.css'

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for getting started with smart receipt management.',
    icon: Zap,
    color: '#a29bfe',
    features: [
      '10 receipt scans/month',
      'Basic warranty tracking',
      'Spend categories',
      'Email alerts',
      '1 user account',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₹99',
    period: '/month',
    description: 'Unlimited power for individuals who take their money seriously.',
    icon: Crown,
    color: '#6c5ce7',
    features: [
      'Unlimited receipt scans',
      'AI warranty detection',
      'Fight For Me™ claim assistant',
      'Price Memory alerts',
      'Gmail receipt scanner',
      'Voice logging (Hindi, Tamil, Telugu)',
      'Spending Wrapped annual report',
      'Priority support',
    ],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Family',
    price: '₹199',
    period: '/month',
    description: 'Complete household financial protection for the whole family.',
    icon: Crown,
    color: '#00cec9',
    features: [
      'Everything in Pro',
      'Up to 5 family members',
      'Family budget dashboard',
      'Combined spend insights',
      'Family health score',
      'Shared warranty tracking',
      'Dedicated family support',
    ],
    cta: 'Start Family Plan',
    popular: false,
  },
]

export default function Pricing() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="pricing" id="pricing" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="pricing__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="pricing__label">Pricing</span>
          <h2 className="pricing__title">
            Simple Pricing,{' '}
            <span className="gradient-text">Massive Value</span>
          </h2>
          <p className="pricing__subtitle">
            Start free. Upgrade when you're convinced. Cancel anytime. No hidden fees. No contracts.
          </p>
        </motion.div>

        <div className="pricing__grid">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
              id={`pricing-card-${i}`}
            >
              {plan.popular && (
                <div className="pricing-card__badge">Most Popular 🔥</div>
              )}
              <div className="pricing-card__header">
                <div className="pricing-card__icon" style={{ background: `${plan.color}15`, color: plan.color }}>
                  <plan.icon size={24} />
                </div>
                <h3 className="pricing-card__name">{plan.name}</h3>
                <div className="pricing-card__price-row">
                  <span className="pricing-card__price">{plan.price}</span>
                  <span className="pricing-card__period">{plan.period}</span>
                </div>
                <p className="pricing-card__description">{plan.description}</p>
              </div>

              <ul className="pricing-card__features">
                {plan.features.map((feature, j) => (
                  <li key={j} className="pricing-card__feature">
                    <Check size={16} style={{ color: plan.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`pricing-card__cta ${plan.popular ? 'pricing-card__cta--primary' : ''}`}
                style={plan.popular ? {} : { borderColor: `${plan.color}40`, color: plan.color }}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
