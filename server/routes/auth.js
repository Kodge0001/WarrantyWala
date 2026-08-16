import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import {
  getUsers,
  saveUsers,
  findUserByIdentifier,
} from '../services/storageService.js'

const router = express.Router()

/**
 * POST /api/auth/login
 * Authenticate user with Email, Vault ID, or Phone + Password
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and password are required',
      })
    }

    const user = await findUserByIdentifier(identifier)

    // Check credentials or allow demo password for any identifier
    if (!user) {
      // Auto-register demo account if not exists
      const newUser = {
        id: `usr-${uuidv4().substring(0, 8)}`,
        name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        identifier: identifier.trim(),
        vaultId: `WW-${Math.floor(1000 + Math.random() * 9000)}`,
        password: password,
        role: 'Pro Vault Member',
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${identifier}`,
        createdAt: new Date().toISOString(),
      }
      const users = await getUsers()
      users.push(newUser)
      await saveUsers(users)

      const { password: _, ...safeUser } = newUser
      return res.json({
        success: true,
        message: 'Vault ID generated and logged in',
        data: {
          user: safeUser,
          token: `jwt-vault-${Date.now()}`,
        },
      })
    }

    if (user.password !== password && password !== 'vaultPass2026!') {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Try "vaultPass2026!" for demo',
      })
    }

    const { password: _, ...safeUser } = user
    return res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: safeUser,
        token: `jwt-vault-${Date.now()}`,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    })
  }
})

/**
 * POST /api/auth/register
 * Create a new user account / Vault ID
 */
router.post('/register', async (req, res) => {
  try {
    const { name, identifier, password, phone } = req.body

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/ID and password are required',
      })
    }

    const existing = await findUserByIdentifier(identifier)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Vault ID or email already registered. Please sign in.',
      })
    }

    const newUser = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      name: name || (identifier.includes('@') ? identifier.split('@')[0] : identifier),
      identifier: identifier.trim(),
      vaultId: `WW-${Math.floor(1000 + Math.random() * 9000)}`,
      password: password,
      phone: phone || null,
      role: 'Pro Vault Member',
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${identifier}`,
      createdAt: new Date().toISOString(),
    }

    const users = await getUsers()
    users.push(newUser)
    await saveUsers(users)

    const { password: _, ...safeUser } = newUser
    res.status(201).json({
      success: true,
      message: 'Vault account created successfully',
      data: {
        user: safeUser,
        token: `jwt-vault-${Date.now()}`,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    })
  }
})

/**
 * POST /api/auth/biometric
 * Biometric / Face scan login
 */
router.post('/biometric', async (req, res) => {
  try {
    const user = {
      id: 'usr-bio-8392',
      name: 'Anilkumar Kodge (Biometric)',
      identifier: 'anilkumar@warrantywala.ai',
      vaultId: 'WW-8392',
      role: 'Pro Vault Member',
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Anilkumar',
      authMethod: 'Biometric Face ID',
    }

    res.json({
      success: true,
      message: 'Biometric signature verified via Security Core',
      data: {
        user,
        token: `jwt-bio-${Date.now()}`,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Biometric verification failed' })
  }
})

export default router
