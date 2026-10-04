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

  const calculateItemStatus = (expiryDateStr) => {
    if (!expiryDateStr) return 'Active'
    const now = new Date()
    const expiry = new Date(expiryDateStr)
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return 'Expired'
    if (diffDays <= 30) return 'Expiring Soon'
    return 'Active'
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [wResponse, aResponse] = await Promise.all([
        api.getWarranties(),
        api.getAnalytics(),
      ])

      let serverWarranties = wResponse.success ? wResponse.data : []
      let customWarranties = []
      try {
        const raw = localStorage.getItem('warrantywala_custom_warranties')
        if (raw) customWarranties = JSON.parse(raw)
      } catch {
        // ignore
      }

      // Merge custom saved warranties with server warranties
      const combinedMap = new Map()
      customWarranties.forEach((item) => {
        if (item && item.id) combinedMap.set(item.id, { ...item, status: calculateItemStatus(item.expiryDate) })
      })
      serverWarranties.forEach((item) => {
        if (item && item.id && !combinedMap.has(item.id)) {
          combinedMap.set(item.id, { ...item, status: calculateItemStatus(item.expiryDate) })
        }
      })

      const finalWarranties = Array.from(combinedMap.values())
      setWarranties(finalWarranties)

      if (aResponse.success) {
        const totalVal = finalWarranties.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
        const activeC = finalWarranties.filter(w => w.status === 'Active').length
        const expiringC = finalWarranties.filter(w => w.status === 'Expiring Soon').length
        const expiredC = finalWarranties.filter(w => w.status === 'Expired').length

        setAnalytics({
          ...aResponse.data,
          totalItems: finalWarranties.length,
          totalProtectedValue: totalVal,
          activeCount: activeC,
          expiringCount: expiringC,
          expiredCount: expiredC
        })
      }
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
      api.deleteWarranty(id).catch(() => {})
      try {
        const raw = localStorage.getItem('warrantywala_custom_warranties')
        if (raw) {
          const existing = JSON.parse(raw)
          localStorage.setItem('warrantywala_custom_warranties', JSON.stringify(existing.filter((w) => w.id !== id)))
        }
      } catch {
        // ignore
      }
      setWarranties((prev) => {
        const updated = prev.filter((w) => w.id !== id)
        const totalVal = updated.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
        const activeC = updated.filter(w => w.status === 'Active').length
        const expiringC = updated.filter(w => w.status === 'Expiring Soon').length
        const expiredC = updated.filter(w => w.status === 'Expired').length

        setAnalytics(prevAnalytics => ({
          ...(prevAnalytics || {}),
          totalItems: updated.length,
          totalProtectedValue: totalVal,
          activeCount: activeC,
          expiringCount: expiringC,
          expiredCount: expiredC
        }))
        return updated
      })
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleNewItemAdded = (newItem) => {
    if (!newItem) return
    const formattedItem = {
      ...newItem,
      id: newItem.id || `ww-${Math.floor(100000 + Math.random() * 900000)}`,
      productName: newItem.productName || 'Scanned Receipt Product',
      brand: newItem.brand || 'Scanned Brand',
      category: newItem.category || 'Electronics',
      status: calculateItemStatus(newItem.expiryDate),
      price: Number(newItem.price || newItem.totalAmount) || 0,
    }

    try {
      const raw = localStorage.getItem('warrantywala_custom_warranties')
      const existing = raw ? JSON.parse(raw) : []
      const updatedCustom = [formattedItem, ...existing.filter((w) => w.id !== formattedItem.id)]
      localStorage.setItem('warrantywala_custom_warranties', JSON.stringify(updatedCustom))
    } catch {
      // ignore
    }

    setWarranties((prev) => {
      const updated = [formattedItem, ...prev.filter((w) => w.id !== formattedItem.id)]
      const totalVal = updated.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
      const activeC = updated.filter(w => w.status === 'Active').length
      const expiringC = updated.filter(w => w.status === 'Expiring Soon').length
      const expiredC = updated.filter(w => w.status === 'Expired').length

      setAnalytics(prevAnalytics => ({
        ...(prevAnalytics || {}),
        totalItems: updated.length,
        totalProtectedValue: totalVal,
        activeCount: activeC,
        expiringCount: expiringC,
        expiredCount: expiredC
      }))
      return updated
    })
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
