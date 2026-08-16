import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Camera, Cpu, ShieldCheck, ArrowDown } from 'lucide-react'
import './HowItWorks.css'

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Snap Your Receipt',
    description: 'Take a photo of any receipt — paper, digital, handwritten. Our AI handles them all with 98% accuracy.',
    color: '#6c5ce7',
    visual: '📸',
    details: ['Paper receipts', 'Digital invoices', 'Handwritten bills', 'Email forwards'],
  },
  {
    number: '02',
    icon: Cpu,
    title: 'AI Extracts Everything',
    description: 'Our AI reads the receipt, identifies the product, price, store, date, and warranty period automatically.',
    color: '#00cec9',
    visual: '🧠',
    details: ['Product name & model', 'Price & tax details', 'Store information', 'Warranty duration'],
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'You\'re Protected',
    description: 'Get smart alerts before warranties expire, track spending trends, and let AI fight for your claims.',
    color: '#00b894',
    visual: '🛡️',
    details: ['Expiry alerts', 'Claim assistance', 'Spend analytics', 'Family sharing'],
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section className="how-it-works" id="how-it-works" ref={sectionRef}>
      <div className="how-it-works__bg-glow" />
      <div className="container">
        <motion.div
          className="how-it-works__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="how-it-works__label">How It Works</span>
          <h2 className="how-it-works__title">
            Three Steps to{' '}
            <span className="gradient-text">Total Control</span>
          </h2>
          <p className="how-it-works__subtitle">
            From receipt to protection in under 10 seconds. No typing, no filing, no forgetting.
          </p>
        </motion.div>

        <div className="how-it-works__steps">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="step"
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              id={`step-${i}`}
            >
              <div className="step__visual">
                <div className="step__number" style={{ color: step.color }}>
                  {step.number}
                </div>
                <motion.div
                  className="step__emoji"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                >
                  {step.visual}
                </motion.div>
                <div
                  className="step__icon-ring"
                  style={{
                    background: `${step.color}10`,
                    borderColor: `${step.color}30`,
                  }}
                >
                  <step.icon size={32} style={{ color: step.color }} />
                </div>
              </div>

              <div className="step__content">
                <h3 className="step__title">{step.title}</h3>
                <p className="step__description">{step.description}</p>
                <ul className="step__details">
                  {step.details.map((detail, j) => (
                    <li key={j} className="step__detail">
                      <span className="step__detail-dot" style={{ background: step.color }} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {i < steps.length - 1 && (
                <div className="step__connector">
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowDown size={20} className="step__connector-arrow" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
