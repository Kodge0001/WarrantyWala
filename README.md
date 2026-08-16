# 🛡️ WarrantyWala — AI Receipt & Warranty Intelligence Platform

<div align="center">

[![Live Website](https://img.shields.io/badge/Live_App-warrantywala--orcin.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://warrantywala-orcin.vercel.app)
[![Powered by Gemini](https://img.shields.io/badge/Google_Gemini-3.7_Flash_Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![React 19](https://img.shields.io/badge/React_19-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-white?style=for-the-badge)](LICENSE)

<br/>

**Never lose an invoice, miss an expiry date, or forfeit a refund again.**  
*Instant multimodal invoice OCR, automatic GST calculation, legal notice generation under the Consumer Protection Act (2019), and sovereign customer-isolated vaults.*

[✨ Explore Live Demo](https://warrantywala-orcin.vercel.app) • [🔐 3D Vault Login](https://warrantywala-orcin.vercel.app/login) • [📊 Customer Vault](https://warrantywala-orcin.vercel.app/dashboard)

</div>

---

## 🌟 Key Features

### 1. 👁️ Google Gemini 3.7 Flash Vision OCR
- **High-Precision Multimodal OCR**: Reads paper receipts and digital PDF invoices with automatic image rotation and contrast correction.
- **Accurate Information Extraction**: Pulls store name, GSTIN, store address, phone, invoice number, purchase date, item description, serial/IMEI number, and HSN code.
- **Dynamic Multi-Model Cascade**: Automatic fallback across `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, and `gemini-3.5-flash-lite` for continuous uptime.

### 2. 💰 GST Pricing & Tax Breakdown Engine
- **Tax Breakdown**: Automatically separates **Taxable Amount**, **CGST (9%)**, **SGST (9%)**, **IGST**, and calculates **Total Tax** and **Grand Total**.
- Verified with real GST invoices (e.g., Pooja Electronics appliance bills).

### 3. 🔐 3D Interactive Parallax Login
- **Real-Time Mouse Parallax**: Multi-layer 3D tilt effect (`perspective(1200px)`, `rotateX`, `rotateY`) reacting to cursor movement with dynamic light sheen.
- **3D Canvas Tesseract**: Wireframe hypercube and particle constellation background.
- **Multi-Mode Access**: ID/Password, 1-Click Instant Demo Fill, and Biometric / AI Face Scan radar simulation.

### 4. ⚖️ AI Legal Claim Drafter (Consumer Protection Act 2019)
- Generates legally binding formal claim notices citing relevant consumer protection clauses for defective products.
- Auto-resolves manufacturer escalation desk email addresses.
- **1-Click Actions**: Save claim directly to your private backend vault, copy notice, or launch pre-filled in your default email client.

### 5. 🔒 Customer Account & Vault Isolation
- **Multi-Tenant Privacy**: Every customer who signs up with their email gets an independent, clean vault.
- Customers only see and manage what they upload.
- Seamless account switching with instant dashboard synchronization.

### 6. 🤖 Floating AI Warranty Copilot
- Real-time assistant to check expiring policies, explain manufacturer clauses, and calculate claim eligibility.

---

## 🛠️ Architecture & Tech Stack

```
WarrantyWala/
├── api/                   # Vercel Serverless Function entry point
│   └── index.js           # Serverless Express handler
├── server/                # Backend API Server
│   ├── routes/            # Isolated routes (auth, warranties, claims, ai)
│   ├── services/          # Gemini AI engine & JSON storage service
│   ├── data/              # Persistent stores (users, warranties, claims, chats)
│   └── uploads/           # Permanent storage for invoice images & PDFs
├── src/                   # Frontend React 19 Application
│   ├── components/        # 3D Auth, Vault Cards, Scanner, AI Chat, etc.
│   ├── pages/             # LandingPage, LoginPage, DashboardPage
│   └── api/               # Unified client with automatic customer auth headers
├── vercel.json            # Vercel Serverless & SPA edge routing config
└── render.yaml            # Blueprint for 1-click containerized deployment
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Framer Motion, Lucide Icons, Recharts |
| **Styling** | Neo-Luxury Monochrome Design System, Vanilla CSS, Glassmorphism |
| **Backend** | Node.js, Express.js (Single Unified / Serverless Engine) |
| **AI OCR & Copilot** | Google Gemini 3.7 Flash Vision (`@google/genai` SDK) |
| **Hosting** | Vercel Edge CDN & Serverless Functions |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v20+` or `v23+`
- A free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/Kodge0001/WarrantyWala.git
cd WarrantyWala
```

### 2. Install Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 3. Configure Environment Variables
Create a `server/.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5050
```

### 4. Run Development Servers
```bash
# Terminal 1: Run Backend Server
cd server && node server.js

# Terminal 2: Run Frontend Dev Server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate customer with ID / Email + Password |
| `POST` | `/api/auth/register` | Create a new isolated customer vault |
| `POST` | `/api/auth/biometric` | Authenticate via 3D biometric signature |
| `GET` | `/api/warranties` | Retrieve warranties scoped to the active customer |
| `POST` | `/api/warranties/scan-receipt` | Upload invoice & extract metadata with Gemini Vision |
| `POST` | `/api/warranties` | Save a new warranty entry |
| `DELETE`| `/api/warranties/:id` | Remove a warranty from the vault |
| `GET` | `/api/warranties/analytics` | Get portfolio value (₹), active & expiring counts |
| `GET` | `/api/claims` | Fetch all saved legal claim notices |
| `POST` | `/api/claims` | Save a drafted claim notice to the customer's vault |
| `POST` | `/api/ai/draft-claim` | Generate legal claim notice via Gemini AI |
| `POST` | `/api/ai/chat` | Chat with the AI Warranty Advisor |

---

## ☁️ Deployment

### Deploy to Vercel (1-Click)
1. Fork or import this repository on [Vercel](https://vercel.com/new).
2. Add the environment variable `GEMINI_API_KEY`.
3. Deploy! Vercel will automatically build the static assets and configure the serverless function.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/Kodge0001">Kodge0001</a></b>
</div>
