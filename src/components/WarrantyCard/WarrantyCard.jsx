import { motion } from 'framer-motion'
import {
  Calendar,
  Tag,
  Clock,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react'
import './WarrantyCard.css'

export default function WarrantyCard({ item, onClaimClick, onDeleteClick }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="badge badge-active">Active Coverage</span>
      case 'Expiring Soon':
        return <span className="badge badge-expiring">Expiring Soon</span>
      default:
        return <span className="badge badge-expired">Expired</span>
    }
  }

  // Calculate days remaining
  const calculateDaysLeft = (expiryDate) => {
    if (!expiryDate) return null
    const diff = new Date(expiryDate) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)} days ago`
    if (days === 0) return 'Expires today'
    return `${days} days left`
  }

  const daysLeftStr = calculateDaysLeft(item.expiryDate)

  const handleOpenReceipt = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!item.receiptUrl) {
      alert('No receipt document attached.')
      return
    }

    try {
      if (item.receiptUrl.startsWith('data:')) {
        const parts = item.receiptUrl.split(';base64,')
        const contentType = parts[0].replace('data:', '') || 'image/png'
        const base64Data = parts[1]

        const binaryStr = atob(base64Data)
        const len = binaryStr.length
        const bytes = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: contentType })
        const blobUrl = URL.createObjectURL(blob)

        const win = window.open(blobUrl, '_blank')
        if (!win) {
          const a = document.createElement('a')
          a.href = blobUrl
          a.target = '_blank'
          a.download = `${(item.productName || 'receipt').replace(/\s+/g, '_')}-invoice`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }
      } else {
        window.open(item.receiptUrl, '_blank')
      }
    } catch (err) {
      console.error('Error opening receipt:', err)
      window.open(item.receiptUrl, '_blank')
    }
  }

  return (
    <motion.div
      className="warranty-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-top">
        <div className="brand-tag">
          <span>{item.brand}</span>
          <span className="category-pill">{item.category}</span>
        </div>
        {getStatusBadge(item.status)}
      </div>

      <div className="card-main">
        <h3 className="item-title">{item.productName}</h3>
        <p className="coverage-text">{item.coverageType || 'Standard Protection'}</p>
      </div>

      <div className="card-specs-grid">
        <div className="spec-box">
          <Calendar size={13} className="spec-icon" />
          <div className="spec-info">
            <span className="spec-label">Expires</span>
            <span className="spec-val">{item.expiryDate}</span>
          </div>
        </div>

        <div className="spec-box">
          <Clock size={13} className="spec-icon" />
          <div className="spec-info">
            <span className="spec-label">Time Remaining</span>
            <span className="spec-val highlight">{daysLeftStr}</span>
          </div>
        </div>

        <div className="spec-box">
          <Tag size={13} className="spec-icon" />
          <div className="spec-info">
            <span className="spec-label">Value</span>
            <span className="spec-val">₹{Number(item.price).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="spec-box">
          <FileText size={13} className="spec-icon" />
          <div className="spec-info">
            <span className="spec-label">Serial / S.N</span>
            <span className="spec-val code-val">{item.serialNumber || item.invoiceNumber || 'N/A'}</span>
          </div>
        </div>
      </div>

      {item.storeName && (
        <div className="card-store-row">
          <span className="store-label">🏪 Store:</span>
          <span className="store-name">{item.storeName}</span>
          {item.storeGSTIN && (
            <span className="gstin-badge" title="Verified GSTIN">
              GSTIN: {item.storeGSTIN}
            </span>
          )}
          {item.totalTax > 0 && (
            <span className="gst-badge" title={`CGST: ₹${item.cgstAmount || 0} + SGST: ₹${item.sgstAmount || 0}`}>
              GST ₹{Number(item.totalTax).toLocaleString('en-IN')}
            </span>
          )}
        </div>
      )}

      <div className="card-footer">
        <button
          className="btn-card-action"
          onClick={() => onClaimClick(item)}
          title="Draft AI Claim Notice"
        >
          <Sparkles size={14} /> AI Claim
        </button>

        {item.receiptUrl && (
          <button
            type="button"
            className="btn-receipt-view"
            onClick={handleOpenReceipt}
            title="View Original Receipt / Invoice"
          >
            <FileText size={14} /> Receipt
          </button>
        )}

        <button
          className="delete-item-btn"
          onClick={() => onDeleteClick(item.id)}
          title="Remove from vault"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  )
}
