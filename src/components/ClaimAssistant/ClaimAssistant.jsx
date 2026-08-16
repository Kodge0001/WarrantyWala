import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Copy,
  Check,
  Send,
  X,
  Sparkles,
  Loader2,
  Save,
} from 'lucide-react'
import { api } from '../../api/client'
import './ClaimAssistant.css'

export default function ClaimAssistant({ isOpen, onClose, selectedWarranty, onClaimSaved }) {
  const [formData, setFormData] = useState({
    productName: selectedWarranty?.productName || '',
    brand: selectedWarranty?.brand || '',
    serialNumber: selectedWarranty?.serialNumber || '',
    invoiceNumber: selectedWarranty?.invoiceNumber || '',
    purchaseDate: selectedWarranty?.purchaseDate || '',
    defectDescription: '',
    customerName: 'Anilkumar Kodge',
    customerPhone: '+91 9606069293',
    customerEmail: 'anilkumar@warrantywala.ai',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [claimResult, setClaimResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleGenerateClaim = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSaved(false)

    try {
      const res = await api.draftClaimLetter(formData)
      if (res.success) {
        setClaimResult(res.data)
      } else {
        setError('Failed to generate claim notice.')
      }
    } catch (err) {
      console.error(err)
      setError('AI Generator encountered a network error.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveClaim = async () => {
    if (!claimResult) return
    try {
      await api.createClaim({
        warrantyId: selectedWarranty?.id || null,
        productName: formData.productName,
        brand: formData.brand,
        serialNumber: formData.serialNumber,
        invoiceNumber: formData.invoiceNumber,
        purchaseDate: formData.purchaseDate,
        defectDescription: formData.defectDescription,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        recipient: claimResult.recipient,
        letter: claimResult.letter,
        status: 'Notice Drafted',
        estimatedTurnaround: claimResult.estimatedTurnaround || '48 - 72 Hours',
      })
      setSaved(true)
      if (onClaimSaved) onClaimSaved()
    } catch (err) {
      console.error(err)
      setError('Failed to save claim record to backend.')
    }
  }

  const handleCopy = () => {
    if (!claimResult) return
    navigator.clipboard.writeText(claimResult.letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setClaimResult(null)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={handleClose}>
        <motion.div
          className="claim-modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Modal Header */}
          <div className="claim-modal-header">
            <div className="claim-header-info">
              <div className="scanner-badge">
                <Sparkles size={14} /> Legal AI Assistant
              </div>
              <h2 className="modal-title">AI Warranty Claim Drafter</h2>
              <p className="modal-subtitle">
                Generate an official legal escalation email under the Consumer Protection Act (2019) to fast-track repairs or replacements.
              </p>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="claim-modal-body">
            {!claimResult ? (
              <form onSubmit={handleGenerateClaim} className="claim-form">
                <div className="form-row-2">
                  <div className="form-field">
                    <label className="field-label">Product Name</label>
                    <input
                      type="text"
                      className="field-input"
                      required
                      value={formData.productName}
                      onChange={(e) =>
                        setFormData({ ...formData, productName: e.target.value })
                      }
                      placeholder="e.g. Apple MacBook Pro 16"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Brand / Manufacturer</label>
                    <input
                      type="text"
                      className="field-input"
                      required
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      placeholder="e.g. Apple"
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-field">
                    <label className="field-label">Serial / IMEI</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, serialNumber: e.target.value })
                      }
                      placeholder="e.g. C02G8391MD6T"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Invoice Number</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, invoiceNumber: e.target.value })
                      }
                      placeholder="e.g. APL-IN-2025-9832"
                    />
                  </div>

                  <div className="form-field">
                    <label className="field-label">Purchase Date</label>
                    <input
                      type="date"
                      className="field-input"
                      value={formData.purchaseDate}
                      onChange={(e) =>
                        setFormData({ ...formData, purchaseDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Describe the Defect / Issue</label>
                  <textarea
                    className="field-textarea"
                    rows="3"
                    required
                    value={formData.defectDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, defectDescription: e.target.value })
                    }
                    placeholder="e.g., The display screen began flickering with horizontal black lines and stopped waking from sleep mode during standard usage."
                  ></textarea>
                </div>

                <div className="form-row-3">
                  <div className="form-field">
                    <label className="field-label">Your Name</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Contact Phone</label>
                    <input
                      type="text"
                      className="field-input"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Contact Email</label>
                    <input
                      type="email"
                      className="field-input"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, customerEmail: e.target.value })
                      }
                    />
                  </div>
                </div>

                {error && <div className="error-alert">{error}</div>}

                <div className="claim-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="spin" /> Drafting Legal Claim...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Draft Official Claim with AI
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Generated Claim Output */
              <div className="claim-result-container">
                <div className="claim-meta-bar">
                  <div className="meta-item">
                    <span className="meta-label">Subject:</span>
                    <span className="meta-value">{claimResult.subject}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Escalation Desk:</span>
                    <span className="meta-value">{claimResult.recipient}</span>
                  </div>
                </div>

                <div className="letter-preview">
                  <pre className="letter-text">{claimResult.letter}</pre>
                </div>

                <div className="result-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setClaimResult(null)}
                  >
                    Edit Details
                  </button>

                  <div className="right-buttons">
                    <button
                      className="btn btn-secondary"
                      onClick={handleSaveClaim}
                      disabled={saved}
                      title="Persist this claim in backend database"
                    >
                      {saved ? (
                        <>
                          <Check size={16} /> Claim Saved in Vault
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Claim to Vault
                        </>
                      )}
                    </button>
                    <button className="btn btn-secondary" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check size={16} /> Copied to Clipboard
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Claim Notice
                        </>
                      )}
                    </button>
                    <a
                      href={`mailto:${claimResult.recipient}?subject=${encodeURIComponent(
                        claimResult.subject
                      )}&body=${encodeURIComponent(claimResult.letter)}`}
                      className="btn btn-primary"
                    >
                      <Send size={16} /> Open in Email App
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
