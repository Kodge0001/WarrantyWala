#!/usr/bin/env python3
"""
WarrantyWala — Unified Python Runner
Runs the FastAPI server on port 5050 with Swagger Docs & Full-Stack UI
"""
import os
import sys
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5050))
    host = os.getenv("HOST", "0.0.0.0")
    print("=" * 60)
    print(" 🛡️  WARRANTYWALA AI BACKEND (PYTHON 3.13 + FASTAPI)")
    print("=" * 60)
    print(f" 🌐 Web Application:   http://localhost:{port}")
    print(f" 📖 Swagger API Docs:  http://localhost:{port}/docs")
    print(f" 📡 Healthcheck:       http://localhost:{port}/api/health")
    print("=" * 60)
    uvicorn.run("server_python.main:app", host=host, port=port, reload=True)
