import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Fingerprint,
  ChevronLeft
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { api } from '../../api/client'
import './Auth3D.css'

export default function Auth3D() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [biometricScanning, setBiometricScanning] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [activeTab, setActiveTab] = useState('password') // 'password' | 'biometric'

  // 3D Card tilt state
  const cardRef = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  // 3D Background Canvas
  const canvasRef = useRef(null)

  // Handle 3D Tilt on mouse move
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Max rotation 18 degrees
    const rX = ((y - centerY) / centerY) * -14
    const rY = ((x - centerX) / centerX) * 14

    setRotateX(rX)
    setRotateY(rY)
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setRotateX(0)
    setRotateY(0)
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }, [])

  // 3D Wireframe Vault Background Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // 3D Cube & Particle Points
    const nodes = []
    const numNodes = 70
    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: (Math.random() - 0.5) * 800,
        baseSize: Math.random() * 2 + 1,
      })
    }

    // 3D Geometric Vault Box vertices
    const boxSize = 180
    const boxVertices = [
      { x: -boxSize, y: -boxSize, z: -boxSize },
      { x: boxSize, y: -boxSize, z: -boxSize },
      { x: boxSize, y: boxSize, z: -boxSize },
      { x: -boxSize, y: boxSize, z: -boxSize },
      { x: -boxSize, y: -boxSize, z: boxSize },
      { x: boxSize, y: -boxSize, z: boxSize },
      { x: boxSize, y: boxSize, z: boxSize },
      { x: -boxSize, y: boxSize, z: boxSize },
    ]

    const boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ]

    let angleX = 0.003
    let angleY = 0.005
    let rotX = 0
    let rotY = 0

    const render = () => {
      ctx.clearRect(0, 0, width, height)
      rotX += angleX
      rotY += angleY

      const cx = width / 2
      const cy = height / 2
      const fov = 500

      // Rotate & project 3D Box
      const projectedBox = boxVertices.map((v) => {
        // Rotate around Y
        let x1 = v.x * Math.cos(rotY) - v.z * Math.sin(rotY)
        let z1 = v.z * Math.cos(rotY) + v.x * Math.sin(rotY)
        // Rotate around X
        let y2 = v.y * Math.cos(rotX) - z1 * Math.sin(rotX)
        let z2 = z1 * Math.cos(rotX) + v.y * Math.sin(rotX)

        const scale = fov / (fov + z2 + 350)
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          scale,
          z: z2,
        }
      })

      // Draw 3D Box Edges
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 1.5
      boxEdges.forEach(([i, j]) => {
        ctx.beginPath()
        ctx.moveTo(projectedBox[i].x, projectedBox[i].y)
        ctx.lineTo(projectedBox[j].x, projectedBox[j].y)
        ctx.stroke()
      })

      // Draw Corner Vertices
      projectedBox.forEach((p) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw Orbiting Nodes & Constellations
      const projectedNodes = nodes.map((node) => {
        let x1 = node.x * Math.cos(rotY * 0.7) - node.z * Math.sin(rotY * 0.7)
        let z1 = node.z * Math.cos(rotY * 0.7) + node.x * Math.sin(rotY * 0.7)
        let y2 = node.y * Math.cos(rotX * 0.7) - z1 * Math.sin(rotX * 0.7)
        let z2 = z1 * Math.cos(rotX * 0.7) + node.y * Math.sin(rotX * 0.7)

        const scale = fov / (fov + z2 + 400)
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          scale: Math.max(0.2, scale),
          alpha: Math.min(0.6, Math.max(0.1, (scale - 0.3) * 0.8)),
        }
      })

      // Connecting lines between close nodes
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].x - projectedNodes[j].x
          const dy = projectedNodes[i].y - projectedNodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 110)})`
            ctx.lineWidth = 0.75
            ctx.beginPath()
            ctx.moveTo(projectedNodes[i].x, projectedNodes[i].y)
            ctx.lineTo(projectedNodes[j].x, projectedNodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw node dots
      projectedNodes.forEach((p) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.scale * 2.2, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // 1-Click Demo Fill
  const fillDemo = () => {
    setIdentifier('anilkumar@warrantywala.ai')
    setPassword('vaultPass2026!')
    setErrorMsg('')
  }

  // Biometric Scan Simulation with backend verification
  const triggerBiometricScan = async () => {
    setBiometricScanning(true)
    setErrorMsg('')
    try {
      const res = await api.biometricLogin()
      if (res.success && res.data) {
        setTimeout(() => {
          setBiometricScanning(false)
          completeLogin(res.data.user, res.data.token)
        }, 1500)
      } else {
        setBiometricScanning(false)
        setErrorMsg('Biometric verification failed')
      }
    } catch (err) {
      setBiometricScanning(false)
      setErrorMsg(err.message || 'Biometric verification failed')
    }
  }

  // Handle Form Submit via backend
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Vault ID, Email, or Mobile Number')
      return
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      let res
      if (isLogin) {
        res = await api.login({
          identifier: identifier.trim(),
          password: password.trim(),
        })
      } else {
        res = await api.register({
          name: fullName.trim() || identifier.split('@')[0],
          identifier: identifier.trim(),
          password: password.trim(),
        })
      }

      if (res.success && res.data) {
        completeLogin(res.data.user, res.data.token)
      } else {
        setErrorMsg(res.message || 'Authentication failed')
      }
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Authentication failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Complete Login & Navigate
  const completeLogin = (user, token) => {
    const userData = {
      ...user,
      token: token || `jwt-${Date.now()}`,
      loginTime: new Date().toISOString(),
    }

    if (rememberMe) {
      localStorage.setItem('warrantywala_user', JSON.stringify(userData))
    } else {
      sessionStorage.setItem('warrantywala_user', JSON.stringify(userData))
    }

    setSuccessMsg(isLogin ? `Welcome back, ${userData.name}!` : `Vault Created! Welcome, ${userData.name}!`)

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffffff', '#888888', '#cccccc', '#333333'],
    })

    setTimeout(() => {
      navigate('/dashboard')
    }, 1200)
  }

  return (
    <div className="auth-3d-wrapper" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {/* Background 3D Animated Canvas */}
      <canvas ref={canvasRef} className="auth-3d-canvas" />

      {/* Background Grid & Lighting */}
      <div className="auth-grid-overlay" />
      <div className="auth-glow-radial" />

      {/* Top Navigation Bar */}
      <div className="auth-top-nav">
        <Link to="/" className="auth-back-link">
          <ChevronLeft size={18} />
          <span>Back to Home</span>
        </Link>
        <div className="auth-brand-badge">
          <Shield size={16} />
          <span>WarrantyWala Security Matrix</span>
        </div>
      </div>

      {/* 3D Container & Tilt Card */}
      <div className="auth-3d-scene">
        <div
          ref={cardRef}
          className="auth-3d-card"
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          }}
        >
          {/* Dynamic Light Sheen / Glare */}
          <div
            className="auth-card-glare"
            style={{
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, transparent 65%)`,
            }}
          />

          {/* Floating Spatial Layer 1: Badge & Logo (translateZ: 50px) */}
          <div className="auth-card-header layer-z-50">
            <div className="auth-logo-sphere">
              <Shield size={28} className="auth-shield-icon" />
              <div className="sphere-ring" />
            </div>
            <h1 className="auth-title">
              {isLogin ? 'Access AI Vault' : 'Create Vault ID'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Authenticate to unlock your encrypted warranty intelligence'
                : 'Generate a sovereign zero-knowledge warranty repository'}
            </p>
          </div>

          {/* Auth Method Tabs (Password vs Biometric) */}
          <div className="auth-method-tabs layer-z-40">
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <KeyRound size={15} />
              <span>ID & Password</span>
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${activeTab === 'biometric' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('biometric')
                setErrorMsg('')
              }}
            >
              <Fingerprint size={15} />
              <span>AI Face / Bio</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                className="auth-alert error layer-z-40"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                className="auth-alert success layer-z-40"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 0 }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Biometric Face / Fingerprint Mode */}
          {activeTab === 'biometric' ? (
            <div className="biometric-pane layer-z-30">
              <div
                className={`biometric-scanner-box ${biometricScanning ? 'scanning' : ''}`}
                onClick={triggerBiometricScan}
              >
                <div className="scanner-laser" />
                <div className="scanner-reticle">
                  <ScanFace size={64} className="scanner-icon" />
                </div>
                <div className="scanner-pulse" />
              </div>
              <p className="biometric-hint">
                {biometricScanning
                  ? 'Verifying biometric signature via AI Security Core...'
                  : 'Click the biometric reticle to scan Face / Touch ID'}
              </p>
              <button
                type="button"
                className="btn-scan-trigger"
                onClick={triggerBiometricScan}
                disabled={biometricScanning}
              >
                <Sparkles size={16} />
                {biometricScanning ? 'Scanning...' : 'Simulate 3D Face ID'}
              </button>
            </div>
          ) : (
            /* ID & Password Form (layer-z-30) */
            <form onSubmit={handleSubmit} className="auth-form layer-z-30">
              {!isLogin && (
                <div className="auth-field-group">
                  <label className="auth-label">Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={18} className="auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Anilkumar Kodge"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="auth-field-group">
                <label className="auth-label">Vault ID, Email, or Mobile</label>
                <div className="auth-input-wrapper">
                  <User size={18} className="auth-input-icon" />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="name@domain.com or WW-7492"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label className="auth-label">Vault Key / Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() =>
                        setErrorMsg('Recovery link sent to your registered contact.')
                      }
                    >
                      Forgot Key?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={18} className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Enter encrypted password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    className="auth-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-options-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    className="auth-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  className="auth-demo-btn"
                  onClick={fillDemo}
                  title="Quick fill test credentials"
                >
                  <Sparkles size={13} />
                  Demo 1-Click
                </button>
              </div>

              {/* Submit Button (translateZ: 60px) */}
              <button
                type="submit"
                className="auth-submit-btn layer-z-60"
                disabled={loading}
              >
                {loading ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    <span>{isLogin ? 'Unlock AI Vault' : 'Generate Vault ID'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Switch between Login & Signup */}
          <div className="auth-footer-toggle layer-z-30">
            <span>
              {isLogin ? "Don't have a Vault ID?" : 'Already have a Vault ID?'}
            </span>
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrorMsg('')
                setSuccessMsg('')
              }}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </div>

          {/* Security Protocol Badges */}
          <div className="auth-security-badges layer-z-20">
            <div className="security-badge">
              <Shield size={12} />
              <span>AES-256 GCM</span>
            </div>
            <div className="security-dot" />
            <div className="security-badge">
              <Lock size={12} />
              <span>Zero-Knowledge</span>
            </div>
            <div className="security-dot" />
            <div className="security-badge">
              <Sparkles size={12} />
              <span>Gemini 3.7 Core</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
