import os
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

# Load env variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

# Import Routers
from .routes.auth import router as auth_router
from .routes.warranties import router as warranties_router
from .routes.claims import router as claims_router
from .routes.ai import router as ai_router

app = FastAPI(
    title="WarrantyWala AI Backend (Python 3.13 + FastAPI)",
    description="Full-featured Python backend with Google Gemini 3.7 Flash Vision OCR, GST pricing engine, and legal claim drafter.",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory
UPLOADS_DIR = os.path.join(BASE_DIR, "../server/uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Healthcheck
@app.get("/api/health")
async def health():
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "service": "WarrantyWala AI Core Backend (Python FastAPI)",
        "version": "2.0.0",
        "engine": "FastAPI + Google Gemini 3.7 Flash"
    }

# Register Routers
app.include_router(auth_router)
app.include_router(warranties_router)
app.include_router(claims_router)
app.include_router(ai_router)

# Serve Frontend SPA Dist (if built)
DIST_DIR = os.path.join(BASE_DIR, "../dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("uploads/"):
            return JSONResponse(status_code=404, content={"message": "Endpoint not found"})
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse(status_code=404, content={"message": "Not found"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5050))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"⚡ Starting WarrantyWala Python Backend on http://localhost:{port}")
    print(f"📖 Swagger Interactive API Docs at http://localhost:{port}/docs")
    uvicorn.run("server_python.main:app", host=host, port=port, reload=True)
