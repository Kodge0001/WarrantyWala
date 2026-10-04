import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  UploadCloud,
  Sparkles,
  Clock,
  Search,
  RefreshCw,
  Layers,
  ArrowUpRight,
  User,
  LogIn,
} from 'lucide-react'
import { api } from '../../api/client'
import WarrantyCard from '../WarrantyCard/WarrantyCard'
import ScannerModal from '../ScannerModal/ScannerModal'
import ClaimAssistant from '../ClaimAssistant/ClaimAssistant'
import AIChat from '../AIChat/AIChat'
import './DashboardView.css'

export default function DashboardView() {
  const [currentUser, setCurrentUser] = useState(null)
  const [warranties, setWarranties] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isClaimOpen, setIsClaimOpen] = useState(false)
  const [selectedWarranty, setSelectedWarranty] = useState(null)

  // Load customer profile from storage
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('warrantywala_user') ||
        sessionStorage.getItem('warrantywala_user')
      if (stored) {
        setCurrentUser(JSON.parse(stored))
      } else {
        // Default to demo if completely unauthenticated so first-time visitors can explore
        const demoUser = {
          name: 'Anilkumar Kodge',
          identifier: 'anilkumar@warrantywala.ai',
          vaultId: 'WW-8392',
          role: 'Pro Vault Member',
        }
        localStorage.setItem('warrantywala_user', JSON.stringify(demoUser))
        setCurrentUser(demoUser)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [wResponse, aResponse] = await Promise.all([
        api.getWarranties(),
        api.getAnalytics(),
      ])

      if (wResponse.success) setWarranties(wResponse.data)
      if (aResponse.success) setAnalytics(aResponse.data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, currentUser])

  const handleClaimClick = (item) => {
    setSelectedWarranty(item)
    setIsClaimOpen(true)
  }

  const handleDeleteWarranty = async (id) => {
    if (!window.confirm('Remove this product from your warranty vault?')) return
    try {
      const res = await api.deleteWarranty(id)
      if (res.success) {
        setWarranties(warranties.filter((w) => w.id !== id))
        fetchData()
      }
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleNewItemAdded = (newItem) => {
    setWarranties([newItem, ...warranties])
    fetchData()
  }

  // Filtering with safe null checks
  const filteredWarranties = warranties.filter((w) => {
    const pName = (w.productName || '').toLowerCase()
    const bName = (w.brand || '').toLowerCase()
    const sNum = (w.serialNumber || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch = !query || pName.includes(query) || bName.includes(query) || sNum.includes(query)
    const matchesCategory = filterCategory === 'All' || w.category === filterCategory
    const matchesStatus = filterStatus === 'All' || w.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Unique categories
  const categories = ['All', ...new Set(warranties.map((w) => w.category))]

  return (
    <div className="dashboard-root">
      {/* Top Banner / Breadcrumb */}
      <header className="dashboard-topbar">
        <div className="container topbar-content">
          <div className="topbar-left">
            {currentUser && (
              <div className="customer-vault-badge">
                <span className="vault-dot" />
                <span>
                  Vault ID: {currentUser.vaultId || 'WW-8392'} &bull; {currentUser.identifier || currentUser.email}
                </span>
              </div>
            )}
            <h1 className="dashboard-headline">
              {currentUser?.name ? `${currentUser.name}'s Vault` : 'Warranty Vault & AI Desk'}
            </h1>
            <p className="dashboard-subtext">
              Personalized warranty intelligence, Google Gemini OCR verification, and consumer claim legal notice drafter.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-secondary" onClick={fetchData} title="Refresh data">
              <RefreshCw size={15} />
            </button>
            <button className="btn btn-primary" onClick={() => setIsScannerOpen(true)}>
              <Sparkles size={16} /> Scan Receipt (AI)
            </button>
          </div>
        </div>
      </header>

      <main className="container dashboard-main">
        {/* KPI Metrics Row */}
        <section className="metrics-grid">
          <motion.div
            className="metric-card glass-panel"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-header">
              <span className="metric-title">Protected Portfolio</span>
              <div className="metric-icon-box">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="metric-value">
              ₹{analytics ? analytics.totalProtectedValue.toLocaleString('en-IN') : '0'}
            </div>
            <div className="metric-footer">
              <span className="footer-tag">{analytics ? analytics.totalItems : 0} Devices Active</span>
            </div>
          </motion.div>

          <motion.div
            className="metric-card glass-panel"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-header">
              <span className="metric-title">Expiring Soon (&le;30d)</span>
              <div className="metric-icon-box">
                <Clock size={18} />
              </div>
            </div>
            <div className="metric-value">
              {analytics ? analytics.expiringCount : 0}
            </div>
            <div className="metric-footer">
              <span className="footer-tag highlight">Immediate Attention</span>
            </div>
          </motion.div>

          <motion.div
            className="metric-card glass-panel"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-header">
              <span className="metric-title">Active Protections</span>
              <div className="metric-icon-box">
                <Layers size={18} />
              </div>
            </div>
            <div className="metric-value">
              {analytics ? analytics.activeCount : 0}
            </div>
            <div className="metric-footer">
              <span className="footer-tag">100% Policy Compliant</span>
            </div>
          </motion.div>

          <motion.div
            className="metric-card glass-panel"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <div className="metric-header">
              <span className="metric-title">AI Claim Assistant</span>
              <div className="metric-icon-box">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="metric-value">Instant</div>
            <div className="metric-footer">
              <button
                className="ai-action-link"
                onClick={() => {
                  setSelectedWarranty(null)
                  setIsClaimOpen(true)
                }}
              >
                Draft Claim Letter <ArrowUpRight size={13} />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Filter and Search Bar */}
        <section className="vault-controls-bar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search product, serial number, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <div className="select-wrapper">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="select-wrapper">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Expiring Soon">Expiring Soon</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vault Grid */}
        <section className="vault-grid-section">
          {isLoading ? (
            <div className="loading-state">
              <RefreshCw size={24} className="spin" />
              <p>Syncing your personal warranty vault from backend...</p>
            </div>
          ) : filteredWarranties.length === 0 ? (
            <div className="empty-state glass-panel">
              <UploadCloud size={48} className="empty-icon" />
              <h3>Your Vault is Ready & Clean</h3>
              <p>
                No warranties recorded for <strong>{currentUser?.identifier || 'your account'}</strong> yet.
                <br />
                Upload a bill or digital invoice — Google Gemini AI will extract all product, store, and GST specs automatically.
              </p>
              <button className="btn btn-primary" onClick={() => setIsScannerOpen(true)}>
                <Sparkles size={16} /> Scan Your First Receipt (AI)
              </button>
            </div>
          ) : (
            <div className="warranties-grid">
              {filteredWarranties.map((item) => (
                <WarrantyCard
                  key={item.id}
                  item={item}
                  onClaimClick={handleClaimClick}
                  onDeleteClick={handleDeleteWarranty}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* AI Modals */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaveSuccess={handleNewItemAdded}
      />

      <ClaimAssistant
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        selectedWarranty={selectedWarranty}
      />

      {/* Floating AI Chat Assistant */}
      <AIChat
        onOpenClaimAssistant={() => setIsClaimOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
      />
    </div>
  )
}
