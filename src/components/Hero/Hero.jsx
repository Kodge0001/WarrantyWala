import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Camera, Shield, Bell, ArrowRight, Sparkles, Star, LayoutDashboard } from 'lucide-react'
import './Hero.css'

const stats = [
  { value: '10K+', label: 'Receipts Scanned', icon: Camera },
  { value: '₹2.4L', label: 'Saved in Claims', icon: Shield },
  { value: '98%', label: 'AI Accuracy Rate', icon: Star },
]

const floatingReceipts = [
  { emoji: '🧾', x: '10%', y: '20%', delay: 0, duration: 7 },
  { emoji: '📱', x: '85%', y: '15%', delay: 1, duration: 8 },
  { emoji: '🛡️', x: '75%', y: '70%', delay: 2, duration: 6 },
  { emoji: '💰', x: '15%', y: '75%', delay: 0.5, duration: 9 },
  { emoji: '🔔', x: '90%', y: '45%', delay: 1.5, duration: 7.5 },
]

export default function Hero() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.4 + 0.1,
    }))

    let animationId
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()
      })

      // Monochrome connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section className="hero" id="hero">
      <canvas ref={canvasRef} className="hero__particles" />

      {/* Floating item emojis */}
      {floatingReceipts.map((item, i) => (
        <motion.div
          key={i}
          className="hero__floating-emoji"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <div className="hero__content container">
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles size={14} />
          <span>AI-Powered Receipt & Warranty Intelligence</span>
          <ArrowRight size={14} />
        </motion.div>

        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Never Lose a{' '}
          <span className="hero__title-highlight gradient-silver">Receipt</span>
          <br />
          or Miss a{' '}
          <span className="hero__title-highlight gradient-silver">Warranty</span>
          {' '}Again
        </motion.h1>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Snap a receipt. AI does the rest — extracts data, tracks warranties,
          alerts you before they expire, and generates official claim escalation letters.
          <strong> Your money deserves a bodyguard.</strong>
        </motion.p>

        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/dashboard" className="hero__btn hero__btn--primary" id="hero-cta-primary">
            <LayoutDashboard size={18} />
            Launch AI App & Vault
          </Link>
          <Link to="/login" className="hero__btn hero__btn--secondary" id="hero-cta-login">
            <Shield size={18} />
            3D Vault Login
          </Link>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat, i) => (
            <div key={i} className="hero__stat" id={`hero-stat-${i}`}>
              <stat.icon size={18} className="hero__stat-icon" />
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Animated Monochrome Receipt Card Preview */}
        <motion.div
          className="hero__preview"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 1, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div className="hero__preview-glow" />
          <div className="hero__preview-card">
            <div className="hero__preview-header">
              <div className="hero__preview-dots">
                <span /><span /><span />
              </div>
              <span className="hero__preview-title">Receipt Scanned with AI OCR ✓</span>
            </div>
            <div className="hero__preview-body">
              <div className="hero__preview-scan">
                <div className="hero__preview-scan-line" />
                <div className="hero__preview-receipt">
                  <div className="hero__receipt-line">
                    <span>🏪 Store</span>
                    <span className="hero__receipt-val">Apple Store BKC</span>
                  </div>
                  <div className="hero__receipt-line">
                    <span>📦 Product</span>
                    <span className="hero__receipt-val">MacBook Pro 16" M3</span>
                  </div>
                  <div className="hero__receipt-line">
                    <span>💰 Price</span>
                    <span className="hero__receipt-val hero__receipt-val--price">₹3,19,900</span>
                  </div>
                  <div className="hero__receipt-line">
                    <span>📅 Date</span>
                    <span className="hero__receipt-val">15 Nov 2025</span>
                  </div>
                  <div className="hero__receipt-line hero__receipt-line--warranty">
                    <span>🛡️ Warranty</span>
                    <span className="hero__receipt-val hero__receipt-val--warranty">2 Years AppleCare+</span>
                  </div>
                </div>
              </div>
              <div className="hero__preview-actions">
                <div className="hero__preview-tag">
                  <Shield size={12} /> Active Protection
                </div>
                <div className="hero__preview-tag">
                  <Bell size={12} /> Expiry Alert Set
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
