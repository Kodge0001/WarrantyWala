import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getClaims, saveClaims } from '../services/storageService.js'

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

/**
 * GET /api/claims
 * List claims belonging strictly to this customer
 */
router.get('/', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const claims = await getClaims()

    const customerClaims = userEmail
      ? claims.filter((c) => (c.userEmail || '').toLowerCase().trim() === userEmail)
      : []

    res.json({ success: true, count: customerClaims.length, data: customerClaims })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve claims', error: error.message })
  }
})

/**
 * POST /api/claims
 * Save a newly drafted claim notice for the logged-in customer
 */
router.post('/', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const body = req.body
    const claims = await getClaims()

    const newClaim = {
      id: body.id || `clm-${uuidv4().substring(0, 6)}`,
      userEmail: userEmail || body.userEmail || 'anilkumar@warrantywala.ai',
      warrantyId: body.warrantyId || null,
      productName: body.productName || 'Untitled Product',
      brand: body.brand || 'Manufacturer',
      serialNumber: body.serialNumber || 'N/A',
      invoiceNumber: body.invoiceNumber || 'N/A',
      purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
      defectDescription: body.defectDescription || '',
      customerName: body.customerName || 'Valued Customer',
      customerPhone: body.customerPhone || '',
      customerEmail: body.customerEmail || userEmail || '',
      recipient: body.recipient || `${body.brand ? body.brand.toLowerCase().replace(/\s+/g, '') : 'support'}.care@escalations.com`,
      status: body.status || 'Notice Drafted',
      estimatedTurnaround: body.estimatedTurnaround || '48 - 72 Hours',
      letter: body.letter || '',
      createdAt: new Date().toISOString()
    }

    claims.unshift(newClaim)
    await saveClaims(claims)

    res.status(201).json({
      success: true,
      message: 'Claim recorded in vault',
      data: newClaim
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save claim', error: error.message })
  }
})

/**
 * PUT /api/claims/:id
 * Update status of a claim
 */
router.put('/:id', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const claims = await getClaims()
    const index = claims.findIndex(c => c.id === req.params.id)

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Claim not found' })
    }

    if (userEmail && claims[index].userEmail && claims[index].userEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({ success: false, message: 'Unauthorized claim access' })
    }

    claims[index] = {
      ...claims[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    await saveClaims(claims)
    res.json({ success: true, message: 'Claim status updated', data: claims[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update claim', error: error.message })
  }
})

/**
 * DELETE /api/claims/:id
 * Delete a claim record
 */
router.delete('/:id', async (req, res) => {
  try {
    const userEmail = getCustomerEmail(req)
    const claims = await getClaims()
    const item = claims.find(c => c.id === req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Claim not found' })
    }

    if (userEmail && item.userEmail && item.userEmail.toLowerCase() !== userEmail) {
      return res.status(403).json({ success: false, message: 'Unauthorized claim access' })
    }

    const filtered = claims.filter(c => c.id !== req.params.id)
    await saveClaims(filtered)
    res.json({ success: true, message: 'Claim deleted from vault' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete claim', error: error.message })
  }
})

export default router
