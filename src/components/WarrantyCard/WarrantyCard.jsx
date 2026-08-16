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
          <a
            href={item.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-receipt-view"
            title="View Original Receipt / Invoice"
          >
            <FileText size={14} /> Receipt
          </a>
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
