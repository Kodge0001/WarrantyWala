import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const WARRANTIES_FILE = path.join(__dirname, '../data/warranties.json')
const USERS_FILE = path.join(__dirname, '../data/users.json')
const CLAIMS_FILE = path.join(__dirname, '../data/claims.json')
const CHATS_FILE = path.join(__dirname, '../data/chats.json')

const memoryCache = new Map()

// Generic JSON reader & writer helpers
const readJson = async (filePath, defaultValue = []) => {
  if (memoryCache.has(filePath)) {
    return memoryCache.get(filePath)
  }
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(data)
    memoryCache.set(filePath, parsed)
    return parsed
  } catch (error) {
    console.warn(`Reading ${filePath} from disk failed (${error.message}), using memory cache.`)
    return memoryCache.get(filePath) || defaultValue
  }
}

const writeJson = async (filePath, data) => {
  memoryCache.set(filePath, data)
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.warn(`Disk write to ${filePath} failed (serverless environment), stored in memory cache:`, error.message)
    return true
  }
}

// Warranties CRUD
export const getWarranties = async () => {
  return readJson(WARRANTIES_FILE, [])
}

export const saveWarranties = async (warranties) => {
  return writeJson(WARRANTIES_FILE, warranties)
}

// Users CRUD
export const getUsers = async () => {
  return readJson(USERS_FILE, [])
}

export const saveUsers = async (users) => {
  return writeJson(USERS_FILE, users)
}

export const findUserByIdentifier = async (identifier) => {
  const users = await getUsers()
  const lower = (identifier || '').toLowerCase().trim()
  return users.find(
    (u) =>
      u.identifier?.toLowerCase() === lower ||
      u.vaultId?.toLowerCase() === lower ||
      u.phone === lower
  )
}

// Claims CRUD
export const getClaims = async () => {
  return readJson(CLAIMS_FILE, [])
}

export const saveClaims = async (claims) => {
  return writeJson(CLAIMS_FILE, claims)
}

// Chats CRUD
export const getChatHistory = async () => {
  return readJson(CHATS_FILE, [])
}

export const saveChatMessage = async (messageObj) => {
  const history = await getChatHistory()
  history.push({
    id: `msg-${Date.now()}`,
    ...messageObj,
    timestamp: new Date().toISOString()
  })
  if (history.length > 50) history.shift() // keep last 50
  await writeJson(CHATS_FILE, history)
  return history
}

export const calculateStatus = (expiryDateStr) => {
  if (!expiryDateStr) return 'Active'
  const now = new Date()
  const expiry = new Date(expiryDateStr)
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Expired'
  if (diffDays <= 30) return 'Expiring Soon'
  return 'Active'
}
