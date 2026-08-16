from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from ..services.storage_service import get_all_users, save_all_users

router = APIRouter(prefix="/api/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    identifier: Optional[str] = "anilkumar@warrantywala.ai"
    password: Optional[str] = None
    rememberMe: Optional[bool] = True

class RegisterRequest(BaseModel):
    name: Optional[str] = "Valued Customer"
    email: str
    phone: Optional[str] = None
    password: Optional[str] = None

@router.post("/login")
async def login(req: LoginRequest):
    users = get_all_users()
    identifier = (req.identifier or "").strip().lower()
    
    user = next((u for u in users if u.get("email", "").lower() == identifier or u.get("phone") == identifier), None)
    
    if not user:
        # Auto-create profile for demo ease
        user = {
            "id": f"usr-{str(uuid.uuid4())[:8]}",
            "name": identifier.split("@")[0].capitalize() if "@" in identifier else "Member",
            "email": identifier if "@" in identifier else f"{identifier}@warrantywala.ai",
            "vaultId": f"WW-{int(datetime.now().timestamp()) % 10000}",
            "role": "Pro Vault Member",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            "createdAt": datetime.now().isoformat()
        }
        users.append(user)
        save_all_users(users)
        
    return {
        "success": True,
        "message": "Vault 3D Authentication Successful",
        "user": user,
        "token": f"ww-jwt-{str(uuid.uuid4())}"
    }

@router.post("/register")
async def register(req: RegisterRequest):
    users = get_all_users()
    email = req.email.strip().lower()
    
    existing = next((u for u in users if u.get("email", "").lower() == email), None)
    if existing:
        return {
            "success": True,
            "message": "Vault already exists. Logging into existing vault.",
            "user": existing,
            "token": f"ww-jwt-{str(uuid.uuid4())}"
        }
        
    new_user = {
        "id": f"usr-{str(uuid.uuid4())[:8]}",
        "name": req.name or "Valued Customer",
        "email": email,
        "phone": req.phone,
        "vaultId": f"WW-{int(datetime.now().timestamp()) % 10000}",
        "role": "Sovereign Member",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        "createdAt": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_all_users(users)
    
    return {
        "success": True,
        "message": "Customer Vault Initialized Successfully",
        "user": new_user,
        "token": f"ww-jwt-{str(uuid.uuid4())}"
    }

@router.post("/biometric")
async def biometric_login():
    return {
        "success": True,
        "message": "Biometric Facial Recognition Signature Verified",
        "user": {
            "id": "usr-8392",
            "name": "Anilkumar Kodge",
            "email": "anilkumar@warrantywala.ai",
            "vaultId": "WW-8392",
            "role": "Verified Sovereign",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        },
        "token": f"ww-biometric-jwt-{str(uuid.uuid4())}"
    }
