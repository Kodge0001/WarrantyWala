import express from 'express'
import { handleAIChat, generateClaimLetter } from '../services/aiService.js'
import { getWarranties } from '../services/storageService.js'

const router = express.Router()

/**
 * POST /api/ai/chat
 * AI Advisor Chat Assistant
 */
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' })
    }

    const userEmail = (
      req.headers['x-user-email'] ||
      req.query.userEmail ||
      req.body?.userEmail ||
      ''
    ).toLowerCase().trim()

    const allWarranties = await getWarranties()
    const contextWarranties = userEmail
      ? allWarranties.filter(w => (w.userEmail || '').toLowerCase().trim() === userEmail)
      : []

    const result = await handleAIChat({ message, contextWarranties })

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'AI Chat failed', error: error.message })
  }
})

/**
 * POST /api/ai/draft-claim
 * Generate an official, legally sound Warranty Claim Notice
 */
router.post('/draft-claim', async (req, res) => {
  try {
    const {
      productName,
      brand,
      serialNumber,
      invoiceNumber,
      purchaseDate,
      defectDescription,
      customerName,
      customerPhone,
      customerEmail
    } = req.body

    const claimData = await generateClaimLetter({
      productName,
      brand,
      serialNumber,
      invoiceNumber,
      purchaseDate,
      defectDescription,
      customerName,
      customerPhone,
      customerEmail
    })

    res.json({
      success: true,
      data: claimData
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to draft claim letter', error: error.message })
  }
})

export default router
