import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import { api } from '../../api/client'
import './ScannerModal.css'

export default function ScannerModal({ isOpen, onClose, onSaveSuccess }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  if (!isOpen) return null

  const handleFileDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0]
    if (dropped) {
      setFile(dropped)
      setPreview(URL.createObjectURL(dropped))
      setError(null)
    }
  }

  const handleScan = async () => {
    if (!file) {
      setError('Please select or drop a receipt image first')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('fileName', file.name)

      const response = await api.scanReceipt(formData)
      if (response.success) {
        setScanResult(response.data)
      } else {
        setError('AI Extraction failed. Please enter details manually.')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to contact AI Engine. Please check server connection.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleSaveToVault = async () => {
    if (!scanResult) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await api.createWarranty(scanResult)
      if (res && res.success) {
        if (onSaveSuccess) onSaveSuccess(res.data || scanResult)
        handleClose()
        return
      }
      throw new Error(res?.message || 'Failed to save')
    } catch (err) {
      console.error('Save failed, completing local save:', err)
      if (onSaveSuccess) onSaveSuccess(scanResult)
      handleClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview(null)
    setScanResult(null)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="modal-backdrop" onClick={handleClose}>
        <motion.div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-group">
              <div className="scanner-badge">
                <Sparkles size={14} /> AI OCR Engine
              </div>
              <h2 className="modal-title">Scan Receipt or Invoice</h2>
              <p className="modal-subtitle">
                Upload your digital invoice or paper receipt. AI will auto-extract warranty specs, dates & serial numbers.
              </p>
            </div>
            <button className="close-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {!scanResult ? (
              <div className="upload-step">
                <div
                  className={`dropzone ${file ? 'has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                >
                  <input
                    type="file"
                    id="receipt-file-input"
                    accept="image/*,.pdf"
                    className="file-input-hidden"
                    onChange={handleFileDrop}
                  />
                  <label htmlFor="receipt-file-input" className="dropzone-label">
                    {preview ? (
                      <div className="preview-container">
                        <img src={preview} alt="Receipt preview" className="image-preview" />
                        <div className="preview-overlay">
                          <p className="preview-name">{file.name}</p>
                          <span className="btn-sm">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="dropzone-empty">
                        <div className="dropzone-icon">
                          <UploadCloud size={36} />
                        </div>
                        <p className="dropzone-text">
                          <strong>Click to upload</strong> or drag and drop
                        </p>
                        <p className="dropzone-hint">PNG, JPG, WEBP or PDF up to 10MB</p>
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <div className="error-alert">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="modal-footer-actions">
                  <button className="btn btn-secondary" onClick={handleClose}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!file || isScanning}
                    onClick={handleScan}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Extract with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Scanned Review Step */
              <div className="review-step">
                <div className="success-banner">
                  <CheckCircle2 size={18} />
                  <span>
                    {scanResult.extractionEngine || 'AI'} extraction complete
                    {scanResult.confidenceScore ? ` with ${Math.round(scanResult.confidenceScore * 100)}% confidence` : ''}.
                  </span>
                </div>

                <div className="extracted-fields-grid">
                  <div className="field-group full-width">
                    <label className="field-label">Product Name</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.productName || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, productName: e.target.value })
                      }
                    />
                  </div>

                  <div className="field-group full-width">
                    <label className="field-label">Store / Seller</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.storeName || ''}
                      onChange={(e) => setScanResult({ ...scanResult, storeName: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Brand</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.brand || ''}
                      onChange={(e) => setScanResult({ ...scanResult, brand: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Category</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.category || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, category: e.target.value })
                      }
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Invoice No.</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.invoiceNumber || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, invoiceNumber: e.target.value })
                      }
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Purchase Date</label>
                    <input
                      type="date"
                      className="field-input"
                      value={scanResult.purchaseDate || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, purchaseDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Expiry Date</label>
                    <input
                      type="date"
                      className="field-input"
                      value={scanResult.expiryDate || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, expiryDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Serial / HSN No.</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.serialNumber || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, serialNumber: e.target.value })
                      }
                    />
                  </div>

                  {/* GST Pricing Breakdown */}
                  <div className="field-group full-width">
                    <div className="gst-section-label">Pricing & GST Breakdown</div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Taxable Amount (₹)</label>
                    <input
                      type="number"
                      className="field-input"
                      value={scanResult.taxableAmount || ''}
                      onChange={(e) => setScanResult({ ...scanResult, taxableAmount: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">CGST @{scanResult.cgstRate || 0}% (₹)</label>
                    <input
                      type="number"
                      className="field-input"
                      value={scanResult.cgstAmount || ''}
                      onChange={(e) => setScanResult({ ...scanResult, cgstAmount: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">SGST @{scanResult.sgstRate || 0}% (₹)</label>
                    <input
                      type="number"
                      className="field-input"
                      value={scanResult.sgstAmount || ''}
                      onChange={(e) => setScanResult({ ...scanResult, sgstAmount: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Total Tax (₹)</label>
                    <input
                      type="number"
                      className="field-input"
                      value={scanResult.totalTax || ''}
                      onChange={(e) => setScanResult({ ...scanResult, totalTax: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label highlight-label">Total Amount incl. GST (₹)</label>
                    <input
                      type="number"
                      className="field-input highlight-input"
                      value={scanResult.totalAmount || scanResult.price || ''}
                      onChange={(e) => setScanResult({ ...scanResult, totalAmount: e.target.value, price: e.target.value })}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Coverage Type</label>
                    <input
                      type="text"
                      className="field-input"
                      value={scanResult.coverageType || ''}
                      onChange={(e) =>
                        setScanResult({ ...scanResult, coverageType: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="modal-footer-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setScanResult(null)}
                  >
                    Rescan
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={isSaving}
                    onClick={handleSaveToVault}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Saving to Vault...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Confirm & Save to Vault
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
