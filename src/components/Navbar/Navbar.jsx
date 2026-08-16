import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X, Sparkles } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/app'

  const [user, setUser] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    
    // Check logged in user
    try {
      const stored = localStorage.getItem('warrantywala_user') || sessionStorage.getItem('warrantywala_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {
      // ignore
    }

    return () => window.removeEventListener('scroll', onScroll)
  }, [location])

  const handleLogout = () => {
    localStorage.removeItem('warrantywala_user')
    sessionStorage.removeItem('warrantywala_user')
    setUser(null)
  }

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" id="nav-logo">
          <div className="navbar__logo-icon">
            <Shield size={20} />
          </div>
          <span className="navbar__logo-text">
            Warranty<span className="navbar__logo-accent">Wala</span>
          </span>
          <span className="ai-badge">AI Core</span>
        </Link>

        <div className="navbar__links" id="nav-links">
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/dashboard" className={`navbar__link ${isDashboard ? 'active' : ''}`}>
            Dashboard & Vault
          </Link>
          <a href="/#features" className="navbar__link">
            Features
          </a>
          <a href="/#how-it-works" className="navbar__link">
            How It Works
          </a>
          <a href="/#pricing" className="navbar__link">
            Pricing
          </a>
        </div>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user-pill">
              <span className="user-dot" />
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={handleLogout} title="Sign Out">
                Exit
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__signin-btn" id="nav-signin">
              Sign In
            </Link>
          )}

          {isDashboard ? (
            <Link to="/" className="navbar__cta">
              Landing Page
            </Link>
          ) : (
            <Link to="/dashboard" className="navbar__cta" id="nav-cta">
              <Sparkles size={14} /> Open AI Vault
            </Link>
          )}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="nav-mobile-toggle"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/dashboard" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              Dashboard & Vault
            </Link>
            <a href="/#features" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              Features
            </a>
            <a href="/#how-it-works" className="navbar__mobile-link" onClick={() => setMobileOpen(false)}>
              How It Works
            </a>
            <Link to="/dashboard" className="navbar__cta navbar__cta--mobile" onClick={() => setMobileOpen(false)}>
              Launch App
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
