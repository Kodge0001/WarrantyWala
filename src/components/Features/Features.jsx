import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import {
  Camera,
  Shield,
  BarChart3,
  Mail,
  Bell,
  Sword,
  Brain,
  Users,
  ShoppingBag,
  Trophy,
  Mic,
  Gift,
} from 'lucide-react'
import './Features.css'

const coreFeatures = [
  {
    icon: Camera,
    title: 'Snap & Parse',
    description: 'Point your camera at any receipt. AI extracts product, price, store, and date in seconds.',
    color: '#6c5ce7',
    tag: 'Core',
  },
  {
    icon: Shield,
    title: 'Warranty Tracker',
    description: 'Auto-detects warranty period from receipt. Never forget when your products are covered.',
    color: '#00b894',
    tag: 'Core',
  },
  {
    icon: BarChart3,
    title: 'Spend Insights',
    description: 'Categorizes all spending — food, electronics, clothing — with beautiful monthly trend charts.',
    color: '#0984e3',
    tag: 'Core',
  },
  {
    icon: Mail,
    title: 'Email Receipt Scanner',
    description: 'Connects to Gmail and auto-pulls digital receipts. Zero effort, total coverage.',
    color: '#e17055',
    tag: 'Core',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: '"Your Samsung TV warranty expires in 30 days" — get timely notifications before it\'s too late.',
    color: '#fdcb6e',
    tag: 'Core',
  },
  {
    icon: Sword,
    title: 'Fight For Me',
    description: 'Product broke? One click drafts a complaint email, finds consumer court info, and attaches your receipt.',
    color: '#fd79a8',
    tag: '🔥 Viral',
  },
]

const powerFeatures = [
  {
    icon: Brain,
    title: 'AI Price Memory',
    description: 'Remembers every price you\'ve paid. Warns you when you\'re being overcharged.',
    color: '#a29bfe',
  },
  {
    icon: Users,
    title: 'Family Wallet',
    description: 'One dashboard for the whole family. Combined spending, individual tracking, budget health scores.',
    color: '#00cec9',
  },
  {
    icon: ShoppingBag,
    title: '"Should I Buy This?"',
    description: 'Scan a price tag before buying. AI tells you if it\'s a good deal based on your history.',
    color: '#e17055',
  },
  {
    icon: Trophy,
    title: 'Savings Streaks',
    description: 'Gamified budgeting with badges like "Budget Boss" and funny AI spending roasts.',
    color: '#fdcb6e',
  },
  {
    icon: Mic,
    title: 'Voice Logging',
    description: '"I spent 450 on groceries" — works in Hindi, Tamil, Telugu. Perfect for quick entries.',
    color: '#fd79a8',
  },
  {
    icon: Gift,
    title: 'Spending Wrapped',
    description: 'Annual Spotify-style spending report. Shareable, beautiful, and surprisingly honest.',
    color: '#00b894',
  },
]

function FeatureCard({ feature, index, isPower }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={`feature-card ${isPower ? 'feature-card--power' : ''}`}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      id={`feature-${isPower ? 'power' : 'core'}-${index}`}
    >
      <div className="feature-card__glow" style={{ '--card-color': feature.color }} />
      <div className="feature-card__icon" style={{ background: `${feature.color}15`, color: feature.color }}>
        <feature.icon size={24} />
      </div>
      {feature.tag && (
        <span
          className="feature-card__tag"
          style={{
            background: feature.tag === '🔥 Viral' ? 'rgba(253, 121, 168, 0.15)' : 'rgba(108, 92, 231, 0.15)',
            color: feature.tag === '🔥 Viral' ? '#fd79a8' : '#a29bfe',
          }}
        >
          {feature.tag}
        </span>
      )}
      <h3 className="feature-card__title">{feature.title}</h3>
      <p className="feature-card__description">{feature.description}</p>
    </motion.div>
  )
}

export default function Features() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="features" id="features" ref={sectionRef}>
      <div className="features__bg-grid" />
      <div className="container">
        <motion.div
          className="features__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="features__label">Features</span>
          <h2 className="features__title">
            Everything Your{' '}
            <span className="gradient-text">Receipts Need</span>
          </h2>
          <p className="features__subtitle">
            From scanning to claiming — WarrantyWala handles every step of managing
            your purchases, warranties, and spending.
          </p>
        </motion.div>

        <div className="features__grid">
          {coreFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>

        <motion.div
          className="features__divider"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <span className="features__divider-text">✨ Power Features</span>
        </motion.div>

        <div className="features__grid features__grid--power">
          {powerFeatures.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} isPower />
          ))}
        </div>
      </div>
    </section>
  )
}
