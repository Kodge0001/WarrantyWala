/**
 * WarrantyWala Unified API Client
 * Automatically attaches customer identity headers for full account isolation
 */

const getAuthHeaders = (extraHeaders = {}) => {
  let userEmail = ''
  let token = ''
  try {
    const raw =
      localStorage.getItem('warrantywala_user') ||
      sessionStorage.getItem('warrantywala_user')
    if (raw) {
      const u = JSON.parse(raw)
      userEmail = (u.identifier || u.email || '').toLowerCase().trim()
      token = u.token || ''
    }
  } catch {
    // ignore
  }

  const headers = { ...extraHeaders }
  if (userEmail) {
    headers['x-user-email'] = userEmail
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export const api = {
  // Authentication & Users
  async login(credentials) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')
    return data
  },

  async register(userData) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    return data
  },

  async biometricLogin() {
    const res = await fetch('/api/auth/biometric', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Biometric login failed')
    return data
  },

  // Warranties CRUD & Analytics (Customer Scoped)
  async getWarranties() {
    const res = await fetch('/api/warranties', {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch warranties')
    return res.json()
  },

  async getAnalytics() {
    const res = await fetch('/api/warranties/analytics', {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch analytics')
    return res.json()
  },

  async scanReceipt(formData) {
    const res = await fetch('/api/warranties/scan-receipt', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!res.ok) throw new Error('Failed to scan receipt')
    return res.json()
  },

  async createWarranty(data) {
    const res = await fetch('/api/warranties', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create warranty')
    return res.json()
  },

  async updateWarranty(id, data) {
    const res = await fetch(`/api/warranties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update warranty')
    return res.json()
  },

  async deleteWarranty(id) {
    const res = await fetch(`/api/warranties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete warranty')
    return res.json()
  },

  // Claims Management (Customer Scoped)
  async getClaims() {
    const res = await fetch('/api/claims', {
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to fetch claims')
    return res.json()
  },

  async createClaim(claimData) {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(claimData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to save claim')
    return data
  },

  async updateClaim(id, claimData) {
    const res = await fetch(`/api/claims/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(claimData),
    })
    if (!res.ok) throw new Error('Failed to update claim')
    return res.json()
  },

  async deleteClaim(id) {
    const res = await fetch(`/api/claims/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!res.ok) throw new Error('Failed to delete claim')
    return res.json()
  },

  // AI Services (Customer Scoped)
  async sendAIChat(message) {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ message }),
    })
    if (!res.ok) throw new Error('AI Chat request failed')
    return res.json()
  },

  async draftClaimLetter(claimDetails) {
    const res = await fetch('/api/ai/draft-claim', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(claimDetails),
    })
    if (!res.ok) throw new Error('Failed to draft claim letter')
    return res.json()
  },
}
