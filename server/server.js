import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'
import warrantiesRouter from './routes/warranties.js'
import aiRouter from './routes/ai.js'
import authRouter from './routes/auth.js'
import claimsRouter from './routes/claims.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 5050

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static file serving for receipt uploads
app.use('/uploads', express.static(uploadsDir))

// API Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'WarrantyWala AI Core Backend',
    version: '1.0.0'
  })
})

// Route registration
app.use('/api/auth', authRouter)
app.use('/api/claims', claimsRouter)
app.use('/api/warranties', warrantiesRouter)
app.use('/api/ai', aiRouter)

// Serve React Frontend Production Build (Single Unified Port)
const distPath = path.join(__dirname, '../dist')
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))

  // Fallback for React Router SPA (handles /login, /dashboard, etc.)
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

app.listen(PORT, () => {
  console.log(`⚡ WarrantyWala Production Server running on port ${PORT}`)
  console.log(`🌐 Application: http://localhost:${PORT}`)
})
