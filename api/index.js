import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import warrantiesRouter from '../server/routes/warranties.js'
import aiRouter from '../server/routes/ai.js'
import authRouter from '../server/routes/auth.js'
import claimsRouter from '../server/routes/claims.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../server/.env') })

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file serving for receipt uploads
const uploadsDir = path.join(__dirname, '../server/uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// API Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'WarrantyWala AI Core Backend (Vercel Serverless)',
    version: '1.0.0'
  })
})

// Route registration
app.use('/api/auth', authRouter)
app.use('/api/claims', claimsRouter)
app.use('/api/warranties', warrantiesRouter)
app.use('/api/ai', aiRouter)

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Serverless Error:', err)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

export default app
