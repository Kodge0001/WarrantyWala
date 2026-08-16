import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import './CTA.css'

export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="cta" id="cta" ref={ref}>
      <div className="cta__bg-orb cta__bg-orb--1" />
      <div className="cta__bg-orb cta__bg-orb--2" />
      
      <div className="container">
        <motion.div
          className="cta__card glass-strong"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="cta__content">
            <motion.div
              className="cta__emoji"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🧾
            </motion.div>
            <h2 className="cta__title">
              Stop Losing Money on
              <br />
              <span className="gradient-text">Forgotten Warranties</span>
            </h2>
            <p className="cta__subtitle">
              Join 10,000+ smart Indians who never miss a warranty claim. 
              Start free, upgrade when you love it. Takes 30 seconds.
            </p>
            <div className="cta__actions">
              <Link to="/dashboard" className="cta__btn cta__btn--primary" id="cta-primary-btn">
                <Sparkles size={18} />
                Launch AI Vault — Free
              </Link>
              <Link to="/dashboard" className="cta__btn cta__btn--secondary" id="cta-secondary-btn">
                Open Dashboard
                <ArrowRight size={18} />
              </Link>
            </div>
            <p className="cta__fine-print">
              No credit card required • Cancel anytime • Works on all devices
            </p>
          </div>
          
          <div className="cta__stats-row">
            <div className="cta__mini-stat">
              <span className="cta__mini-stat-value">4.9★</span>
              <span className="cta__mini-stat-label">User Rating</span>
            </div>
            <div className="cta__mini-stat-divider" />
            <div className="cta__mini-stat">
              <span className="cta__mini-stat-value">₹2.4L+</span>
              <span className="cta__mini-stat-label">Claims Saved</span>
            </div>
            <div className="cta__mini-stat-divider" />
            <div className="cta__mini-stat">
              <span className="cta__mini-stat-value">50K+</span>
              <span className="cta__mini-stat-label">Receipts Processed</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
