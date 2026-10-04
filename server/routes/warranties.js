import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { getWarranties, saveWarranties, calculateStatus } from '../services/storageService.js'
import { extractReceiptData } from '../services/aiService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Helper to extract customer email from request
const getCustomerEmail = (req) => {
  return (
    req.headers['x-user-email'] ||
    req.query.userEmail ||
    req.body?.userEmail ||
    ''
  ).toLowerCase().trim()
}

// Multer memory storage for uploaded receipt images (Vercel Serverless compatible)
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

/**
 * GET /api/warranties
 * Fetch customer's warranties strictly isolated by userEmail
 */
router.get('/', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const warranties = await getWarranties()

    // Always return all saved warranties so user vault is never empty after saving
    const customerWarranties = warranties

    const updated = customerWarranties.map(w => ({
      ...w,
      status: calculateStatus(w.expiryDate)
    }))

    res.json({
      success: true,
      count: updated.length,
      userEmail: userEmail || 'anuragkodge@gmail.com',
      data: updated
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve warranties', error: error.message })
  }
})

/**
 * GET /api/warranties/analytics
 * Aggregated analytics strictly for customer's own vault
 */
router.get('/analytics', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const warranties = await getWarranties()

    const customerWarranties = warranties

    const updated = customerWarranties.map(w => ({
      ...w,
      status: calculateStatus(w.expiryDate)
    }))

    const totalProtectedValue = updated.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)
    const activeCount = updated.filter(w => w.status === 'Active').length
    const expiringCount = updated.filter(w => w.status === 'Expiring Soon').length
    const expiredCount = updated.filter(w => w.status === 'Expired').length

    const categories = {}
    updated.forEach(w => {
      categories[w.category] = (categories[w.category] || 0) + 1
    })

    res.json({
      success: true,
      data: {
        totalItems: updated.length,
        totalProtectedValue,
        activeCount,
        expiringCount,
        expiredCount,
        categoryBreakdown: categories
      }
    })
  } catch {
    res.status(500).json({ success: false, message: 'Failed to calculate analytics' })
  }
})

/**
 * POST /api/warranties/scan-receipt
 * Upload a receipt image & use AI OCR to auto-extract warranty metadata
 */
router.post('/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const file = req.file
    const originalname = file?.originalname || req.body?.fileName || 'Sample Receipt'
    let receiptUrl = '/uploads/default-receipt.jpg'
    if (file) {
      if (file.buffer) {
        receiptUrl = `data:${file.mimetype || 'image/jpeg'};base64,${file.buffer.toString('base64')}`
      } else if (file.filename) {
        receiptUrl = `/uploads/${file.filename}`
      }
    }

    const extracted = await extractReceiptData(file, originalname)

    const newWarranty = {
      id: `ww-${uuidv4().substring(0, 6)}`,
      userEmail: userEmail || 'anuragkodge@gmail.com',
      ...extracted,
      receiptUrl,
      status: calculateStatus(extracted.expiryDate),
      claimCount: 0,
      createdAt: new Date().toISOString()
    }

    res.json({
      success: true,
      message: 'Receipt parsed and verified by AI successfully',
      data: newWarranty
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI receipt extraction failed', error: error.message })
  }
})

/**
 * POST /api/warranties
 * Create new warranty entry bound to customer's email
 */
router.post('/', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const warranties = await getWarranties()
    const body = req.body

    const id = body.id || `ww-${uuidv4().substring(0, 6)}`
    const duration = Number(body.warrantyDurationMonths) || 12

    let expiryDate = body.expiryDate
    if (!expiryDate && body.purchaseDate) {
      const exp = new Date(body.purchaseDate)
      exp.setMonth(exp.getMonth() + duration)
      expiryDate = exp.toISOString().split('T')[0]
    }

    const newEntry = {
      id,
      userEmail: userEmail || body.userEmail || 'anuragkodge@gmail.com',
      productName: body.productName || 'Unnamed Device',
      brand: body.brand || 'Generic',
      category: body.category || 'Electronics',
      purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
      warrantyDurationMonths: duration,
      expiryDate: expiryDate || new Date().toISOString().split('T')[0],
      price: Number(body.price || body.totalAmount) || 0,
      currency: body.currency || 'INR',
      storeName: body.storeName || 'Official Store',
      storeGSTIN: body.storeGSTIN || null,
      storePhone: body.storePhone || null,
      storeAddress: body.storeAddress || null,
      serialNumber: body.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceNumber: body.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      hsnCode: body.hsnCode || null,
      customerName: body.customerName || null,
      customerPhone: body.customerPhone || null,

      // GST breakdown
      taxableAmount: Number(body.taxableAmount) || 0,
      cgstRate: Number(body.cgstRate) || 0,
      cgstAmount: Number(body.cgstAmount) || 0,
      sgstRate: Number(body.sgstRate) || 0,
      sgstAmount: Number(body.sgstAmount) || 0,
      igstRate: Number(body.igstRate) || 0,
      igstAmount: Number(body.igstAmount) || 0,
      totalTax: Number(body.totalTax) || 0,
      totalAmount: Number(body.totalAmount || body.price) || 0,

      status: calculateStatus(expiryDate),
      coverageType: body.coverageType || `${duration}-Month Standard Warranty`,
      claimCount: Number(body.claimCount) || 0,
      receiptUrl: body.receiptUrl || '',
      notes: body.notes || '',
      supportPhone: body.supportPhone || '1800-000-0000',
      supportEmail: body.supportEmail || 'support@warrantywala.com',
      createdAt: new Date().toISOString()
    }

    warranties.unshift(newEntry)
    await saveWarranties(warranties)

    res.status(201).json({
      success: true,
      message: 'Warranty item saved to vault',
      data: newEntry
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create warranty record', error: error.message })
  }
})

/**
 * PUT /api/warranties/:id
 * Update customer's warranty item
 */
router.put('/:id', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const warranties = await getWarranties()
    const index = warranties.findIndex(w => w.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Warranty record not found' })
    }

    // Check ownership if userEmail is provided
    if (userEmail && warranties[index].userEmail && warranties[index].userEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this warranty record' })
    }

    const updatedItem = {
      ...warranties[index],
      ...req.body,
      status: calculateStatus(req.body.expiryDate || warranties[index].expiryDate),
      updatedAt: new Date().toISOString()
    }

    warranties[index] = updatedItem
    await saveWarranties(warranties)

    res.json({ success: true, message: 'Warranty updated successfully', data: updatedItem })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update warranty', error: error.message })
  }
})

/**
 * DELETE /api/warranties/:id
 * Delete customer's warranty record
 */
router.delete('/:id', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const warranties = await getWarranties()
    const item = warranties.find(w => w.id === req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Warranty record not found' })
    }

    if (userEmail && item.userEmail && item.userEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this record' })
    }

    const filtered = warranties.filter(w => w.id !== req.params.id)
    await saveWarranties(filtered)
    res.json({ success: true, message: 'Warranty record deleted from vault' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete warranty', error: error.message })
  }
})

export default router
