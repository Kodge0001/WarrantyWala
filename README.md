# 🛡️ WarrantyWala — AI Receipt & Warranty Intelligence Platform

<div align="center">

[![Live Website](https://img.shields.io/badge/Live_App-warrantywala--orcin.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://warrantywala-orcin.vercel.app)
[![Python 3.13](https://img.shields.io/badge/Python_3.13-FastAPI-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://fastapi.tiangolo.com)
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

### 1. 👁️ Google Gemini 3.7 Flash Vision OCR (Python + Node.js)
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

---

## 🛠️ Architecture & Tech Stack

```
WarrantyWala/
├── app.py                 # 🐍 Python FastAPI Unified Runner
├── server_python/         # 🐍 Python 3.13 + FastAPI Backend
│   ├── main.py            # FastAPI App & Swagger Docs (/docs)
│   ├── routes/            # Python Routers (auth, warranties, claims, ai)
│   ├── services/          # Gemini 3.7 Flash AI & Storage Services
│   └── requirements.txt   # Python Dependencies
├── api/                   # Vercel Serverless Function entry point
│   └── index.js           # Serverless Express handler
├── server/                # Node.js Express Backend
├── src/                   # React 19 Frontend (3D Parallax UI)
├── vercel.json            # Vercel Edge & Serverless Config
└── render.yaml            # Render Blueprint for Cloud Deployments
```

| Layer | Technology |
| :--- | :--- |
| **Python Backend** | **FastAPI**, **Uvicorn**, **Pydantic**, **Google GenAI Python SDK** |
| **Frontend UI** | **React 19**, **Vite**, **Framer Motion**, **Lucide Icons** |
| **Styling** | Neo-Luxury Monochrome Design System, Vanilla CSS, Glassmorphism |
| **AI Vision & LLM** | **Google Gemini 3.7 Flash** (`google-genai` SDK) |
| **Hosting** | Vercel Edge CDN & Serverless Cloud |

---

## 🚀 Quick Start with Python

### 1. Clone the Repository
```bash
git clone https://github.com/Kodge0001/WarrantyWala.git
cd WarrantyWala
```

### 2. Install Python Dependencies
```bash
pip install -r server_python/requirements.txt
```

### 3. Run the Python Backend
```bash
python app.py
```

- 🌐 **Web App**: [http://localhost:5050](http://localhost:5050)
- 📖 **Interactive Swagger API Docs**: [http://localhost:5050/docs](http://localhost:5050/docs)
- 📡 **API Healthcheck**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

---

## 📡 API Reference (FastAPI / Express)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate customer with ID / Email + Password |
| `POST` | `/api/auth/register` | Create a new isolated customer vault |
| `POST` | `/api/auth/biometric` | Authenticate via 3D biometric signature |
| `GET` | `/api/warranties` | Retrieve warranties scoped to active customer |
| `POST` | `/api/warranties/scan-receipt` | Upload invoice & extract metadata with Gemini Vision |
| `POST` | `/api/warranties` | Save a new warranty entry |
| `DELETE`| `/api/warranties/:id` | Remove a warranty from the vault |
| `GET` | `/api/warranties/analytics` | Get portfolio value (₹), active & expiring counts |
| `GET` | `/api/claims` | Fetch all saved legal claim notices |
| `POST` | `/api/claims` | Save a drafted claim notice to customer vault |
| `POST` | `/api/ai/draft-claim` | Generate legal claim notice via Gemini AI |
| `POST` | `/api/ai/chat` | Chat with the AI Warranty Advisor |

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>Built with ❤️ by <a href="https://github.com/Kodge0001">Kodge0001</a></b>
</div>
