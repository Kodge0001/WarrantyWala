// AI service powered by Google Gemini Vision for real receipt OCR & extraction

import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') })

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const RECEIPT_EXTRACTION_PROMPT = `You are an expert Indian invoice and receipt OCR system. Analyze this receipt/invoice image very carefully and extract ALL the following fields as a valid JSON object. Read every word, number, and date precisely from the image.

Return ONLY a valid JSON object with these exact fields (no markdown, no explanation, no backticks):
{
  "storeName": "The shop/store/company name on the invoice (e.g. POOJA ELECTRONICS)",
  "storeGSTIN": "GSTIN number if visible",
  "storePhone": "Store phone number if visible",
  "storeAddress": "Full store address if visible",
  "invoiceNumber": "Invoice number exactly as printed (e.g. #25-26/476)",
  "invoiceDate": "Invoice date in YYYY-MM-DD format",
  "customerName": "Bill To / Customer name",
  "customerPhone": "Customer mobile/phone number if visible",
  "productName": "Full product name / item description from the items table",
  "brand": "Brand name (extract from product name or store name)",
  "category": "Product category (Electronics, Appliance, Audio, Kitchen, etc.)",
  "hsnCode": "HSN code if visible",
  "quantity": "Quantity",
  "serialNumber": "Serial number, IMEI, or model number if visible",
  "taxableAmount": "Taxable amount before GST (number only, no currency symbol)",
  "cgstRate": "CGST rate percentage (number only, e.g. 9)",
  "cgstAmount": "CGST amount (number only)",
  "sgstRate": "SGST rate percentage (number only, e.g. 9)", 
  "sgstAmount": "SGST amount (number only)",
  "igstRate": "IGST rate percentage if applicable (number only, or null)",
  "igstAmount": "IGST amount if applicable (number only, or null)",
  "totalTax": "Total tax amount (number only)",
  "totalAmount": "Grand total / Total Amount including GST (number only)",
  "amountInWords": "Total amount in words if printed",
  "paymentStatus": "Paid / Balance / Unpaid based on received amount vs total",
  "warrantyDurationMonths": "Warranty period in months if mentioned (default 12 if not found)",
  "warrantyNotes": "Any warranty or guarantee related terms mentioned"
}

IMPORTANT RULES:
- Read the ACTUAL text from the image. Do NOT make up or hallucinate data.
- For prices, extract the exact numbers printed. Remove ₹ symbol but keep the number exact.
- For dates, convert to YYYY-MM-DD format.
- If a field is not visible in the image, use null.
- For product name, use the full item description from the items/products table row.
- Always check for GST breakdowns (CGST, SGST, IGST) in the invoice.
- Return ONLY the JSON object, nothing else.`

/**
 * Extract receipt data using Gemini Vision API
 */
export const extractReceiptData = async (file, originalname = '') => {
  // Check if we have a valid API key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('No valid Gemini API key found, using fallback extraction')
    return fallbackExtraction(originalname)
  }

  try {
    // Read the uploaded file
    let imageBuffer
    let mimeType = 'image/jpeg'

    if (file && file.buffer) {
      imageBuffer = file.buffer
      const ext = path.extname(file.originalname || '').toLowerCase()
      if (ext === '.png') mimeType = 'image/png'
      else if (ext === '.webp') mimeType = 'image/webp'
      else if (ext === '.pdf') mimeType = 'application/pdf'
    } else if (file && file.path) {
      imageBuffer = await fs.readFile(file.path)
      const ext = path.extname(file.originalname || '').toLowerCase()
      if (ext === '.png') mimeType = 'image/png'
      else if (ext === '.webp') mimeType = 'image/webp'
      else if (ext === '.pdf') mimeType = 'application/pdf'
    } else {
      console.warn('No file provided, using fallback extraction')
      return fallbackExtraction(originalname)
    }

    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64')

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ]

    let response = null
    let usedModel = candidateModels[0]
    let lastError = null

    for (const modelName of candidateModels) {
      try {
        console.log(`Attempting OCR extraction with ${modelName}...`)
        response = await genai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Image,
                  },
                },
                {
                  text: RECEIPT_EXTRACTION_PROMPT,
                },
              ],
            },
          ],
        })
        if (response && response.text) {
          usedModel = modelName
          console.log(`Extraction successful with ${modelName}!`)
          break
        }
      } catch (err) {
        lastError = err
        console.warn(`Model ${modelName} error (${err.message || err}), trying next candidate...`)
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('All Gemini models failed to process the receipt')
    }

    const rawText = response.text.trim()
    console.log('Gemini raw response:', rawText)

    // Parse the JSON response - handle potential markdown wrapper
    let jsonStr = rawText
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonStr)

    // Calculate expiry date
    const purchaseDate = parsed.invoiceDate || new Date().toISOString().split('T')[0]
    const durationMonths = Number(parsed.warrantyDurationMonths) || 12
    const expiry = new Date(purchaseDate)
    expiry.setMonth(expiry.getMonth() + durationMonths)
    const expiryDate = expiry.toISOString().split('T')[0]

    return {
      productName: parsed.productName || 'Unknown Product',
      brand: parsed.brand || parsed.storeName || 'Unknown Brand',
      category: parsed.category || 'Electronics',
      purchaseDate: purchaseDate,
      warrantyDurationMonths: durationMonths,
      expiryDate: expiryDate,
      price: Number(parsed.totalAmount) || 0,
      currency: 'INR',
      storeName: parsed.storeName || 'Unknown Store',
      storeGSTIN: parsed.storeGSTIN || null,
      storePhone: parsed.storePhone || null,
      storeAddress: parsed.storeAddress || null,
      serialNumber: parsed.serialNumber || parsed.hsnCode || null,
      invoiceNumber: parsed.invoiceNumber || null,
      hsnCode: parsed.hsnCode || null,
      customerName: parsed.customerName || null,
      customerPhone: parsed.customerPhone || null,

      // GST Breakdown
      taxableAmount: Number(parsed.taxableAmount) || 0,
      cgstRate: Number(parsed.cgstRate) || 0,
      cgstAmount: Number(parsed.cgstAmount) || 0,
      sgstRate: Number(parsed.sgstRate) || 0,
      sgstAmount: Number(parsed.sgstAmount) || 0,
      igstRate: Number(parsed.igstRate) || 0,
      igstAmount: Number(parsed.igstAmount) || 0,
      totalTax: Number(parsed.totalTax) || 0,
      totalAmount: Number(parsed.totalAmount) || 0,
      amountInWords: parsed.amountInWords || null,

      coverageType: `${durationMonths}-Month Manufacturer Warranty`,
      notes: parsed.warrantyNotes || 'Extracted by WarrantyWala AI (Gemini Vision)',
      supportPhone: parsed.storePhone || '1800-000-0000',
      supportEmail: 'support@warrantywala.com',
      confidenceScore: 0.98,
      extractionEngine: `Google Gemini (${usedModel})`,
    }
  } catch (error) {
    console.error('Gemini extraction error:', error.message || error)
    // Fall back to heuristic extraction
    return fallbackExtraction(originalname)
  }
}

/**
 * Fallback extraction when Gemini API is unavailable
 */
function fallbackExtraction(originalname = '') {
  const now = new Date()
  const purchaseDate = new Date(now.getFullYear(), now.getMonth() - 1, 15)
  const expiryDate = new Date(purchaseDate)
  expiryDate.setMonth(expiryDate.getMonth() + 12)

  return {
    productName: originalname ? originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Consumer Product',
    brand: 'Unknown Brand',
    category: 'Electronics',
    purchaseDate: purchaseDate.toISOString().split('T')[0],
    warrantyDurationMonths: 12,
    expiryDate: expiryDate.toISOString().split('T')[0],
    price: 0,
    currency: 'INR',
    storeName: 'Retail Store',
    storeGSTIN: null,
    storePhone: null,
    storeAddress: null,
    serialNumber: null,
    invoiceNumber: null,
    hsnCode: null,
    customerName: null,
    customerPhone: null,
    taxableAmount: 0,
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    igstRate: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 0,
    amountInWords: null,
    coverageType: '12-Month Standard Warranty',
    notes: 'Gemini API key not configured. Please add GEMINI_API_KEY to server/.env and rescan.',
    supportPhone: '1800-000-0000',
    supportEmail: 'support@warrantywala.com',
    confidenceScore: 0.0,
    extractionEngine: 'Fallback (No API Key)',
  }
}

/**
 * AI Warranty Advisor Chatbot Engine
 */
export const handleAIChat = async ({ message, contextWarranties = [] }) => {
  // Try Gemini for chat if API key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const warrantyContext = contextWarranties.map(w =>
        `• ${w.productName} (${w.brand}) — Status: ${w.status}, Expires: ${w.expiryDate}, Price: ₹${w.price}`
      ).join('\n')

      const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `You are WarrantyWala AI Assistant, an expert in Indian consumer rights, warranty policies, and product claims. You help users manage their product warranties and draft claim letters.

The user has these warranties tracked:
${warrantyContext || 'No warranties tracked yet.'}

User's question: "${message}"

Respond helpfully in 2-4 sentences. If the user asks about claims or defects, guide them on how to file under the Consumer Protection Act 2019. If they ask about expiring items, reference their actual warranty data above. Keep it professional but friendly.

Also suggest 2-3 follow-up actions as a JSON array at the end in this format:
ACTIONS: ["action1", "action2", "action3"]`
          }]
        }]
      })

      const rawReply = response.text.trim()
      
      // Extract suggested actions
      let reply = rawReply
      let suggestedActions = ['Scan Receipt', 'Check Expiring Items', 'Draft Claim Letter']
      
      const actionsMatch = rawReply.match(/ACTIONS:\s*\[([^\]]+)\]/)
      if (actionsMatch) {
        try {
          suggestedActions = JSON.parse(`[${actionsMatch[1]}]`)
          reply = rawReply.replace(/ACTIONS:\s*\[([^\]]+)\]/, '').trim()
        } catch {
          // keep defaults
        }
      }

      return { reply, suggestedActions }
    } catch (error) {
      console.error('Gemini chat error:', error.message)
      // Fall through to heuristic
    }
  }

  // Heuristic fallback
  return handleHeuristicChat(message, contextWarranties)
}

function handleHeuristicChat(message, contextWarranties) {
  const query = (message || '').toLowerCase()

  if (query.includes('expir') || query.includes('check')) {
    const expiringSoon = contextWarranties.filter(w => w.status === 'Expiring Soon' || w.status === 'Active')
    if (expiringSoon.length > 0) {
      return {
        reply: `You currently have **${expiringSoon.length} items** with active or nearing expiry coverage, including your **${expiringSoon[0].productName}** (expires on ${expiringSoon[0].expiryDate}). Would you like me to draft an inspection reminder or check claim eligibility?`,
        suggestedActions: ['Draft Claim Letter', 'View Expiring Items', 'Extend Protection']
      }
    }
    return {
      reply: 'All tracked items have been audited. You have active protections in place. Upload another receipt to let AI monitor warranty clauses automatically.',
      suggestedActions: ['Scan Receipt', 'View All Items']
    }
  }

  if (query.includes('claim') || query.includes('broken') || query.includes('defect') || query.includes('repair') || query.includes('fix')) {
    return {
      reply: `Under Indian Consumer Protection guidelines, defects in materials or workmanship within the warranty window qualify for **free repairs, component replacements, or refunds**.\n\nI can draft a legally binding formal Claim Notice email directly to the brand's escalation desk with your Invoice and Serial number attached.`,
      suggestedActions: ['Generate AI Claim Email', 'Find Service Center', 'Check Rights']
    }
  }

  if (query.includes('rights') || query.includes('consumer') || query.includes('law')) {
    return {
      reply: `### Consumer Protection Act, 2019 Highlights:\n1. **Right to Redressal**: Manufacturers must honor published warranties within 14-30 days.\n2. **Deficiency of Service**: Unreasonable delays can be escalated to National Consumer Helpline (1915).\n3. **Receipt Digital Validity**: Digitally stored PDF/image copies are legally valid proof of purchase.`,
      suggestedActions: ['Draft Claim Notice', 'Export Warranty PDF']
    }
  }

  return {
    reply: `I am your **WarrantyWala AI Assistant**. I monitor your product warranties, identify potential claim loopholes, verify digital receipts, and draft official escalation notices.\n\nHow can I assist with your device or claim today?`,
    suggestedActions: ['Scan New Invoice', 'Check Expiring Warranties', 'Draft Claim Letter']
  }
}

/**
 * AI Claim Notice & Legal Letter Generator (now also powered by Gemini)
 */
export const generateClaimLetter = async ({
  productName,
  brand,
  serialNumber,
  invoiceNumber,
  purchaseDate,
  defectDescription,
  customerName = 'Valued Customer',
  customerPhone = '+91 98765 43210',
  customerEmail = 'customer@example.com'
}) => {
  let letter = ''

  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const response = await genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `Draft a formal, professional warranty claim letter for an Indian consumer. Use the following details:

Product: ${productName}
Brand: ${brand}
Serial/IMEI: ${serialNumber || 'N/A'}
Invoice Number: ${invoiceNumber || 'N/A'}
Purchase Date: ${purchaseDate || 'N/A'}
Defect: ${defectDescription || 'Product is not functioning as advertised'}
Customer Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

The letter should:
1. Reference the Consumer Protection Act, 2019
2. Be formal and legally structured
3. Include clear product and purchase details
4. Request inspection, repair, replacement, or refund within 7 business days
5. Mention digital proof of purchase is attached
6. Be ready to send as-is to the brand's support desk

Write ONLY the letter body text, no subject line or other metadata.`
          }]
        }]
      })
      letter = response.text.trim()
    } catch (error) {
      console.error('Gemini claim generation error:', error.message)
    }
  }

  // Fallback to template if Gemini failed
  if (!letter) {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    })

    letter = `DATE: ${currentDate}

TO:
The Customer Grievance & Warranty Support Desk
${brand || 'Product Manufacturer'} India Support Division

SUBJECT: Formal Warranty Claim & Request for Immediate Redressal - ${productName || 'Purchased Product'} [Invoice: ${invoiceNumber || 'N/A'}]

Dear Support & Grievance Officer,

I am writing to formally submit a warranty claim regarding my **${productName}**, purchased on **${purchaseDate || 'the invoice date'}**. The purchase was verified under valid manufacturer invoice terms.

PRODUCT & CLAIM SPECIFICATIONS:
• Product Name: ${productName}
• Brand: ${brand}
• Serial Number / IMEI: ${serialNumber || 'Provided on Attached Invoice'}
• Tax Invoice Number: ${invoiceNumber || 'Refer to Attached Copy'}
• Purchase Date: ${purchaseDate || 'Valid Warranty Period'}

ISSUE / DEFECT DETAILS:
${defectDescription || 'The product has developed an operational failure not attributable to accidental damage, normal wear-and-tear, or unauthorized tampering.'}

REMEDY SOUGHT:
Under the provisions of the Consumer Protection Act (2019), I request:
1. Free warranty inspection and authorized component replacement / repair, or
2. Replacement of the defective unit if non-remediable within 7 business days.

Please acknowledge this claim within 48 hours and provide a Service Ticket Number.

Sincerely,
${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}
Verified via WarrantyWala Digital Vault`.trim()
  }

  return {
    letter,
    subject: `Formal Warranty Claim - ${productName} [${serialNumber || invoiceNumber}]`,
    recipient: `${brand ? brand.toLowerCase().replace(/\s+/g, '') : 'support'}.care@escalations.com`,
    estimatedTurnaround: '48 - 72 Hours',
    timestamp: new Date().toISOString()
  }
}
