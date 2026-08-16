import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Header, HTTPException
from ..services.storage_service import get_all_claims, save_all_claims

router = APIRouter(prefix="/api/claims", tags=["Claims"])

def get_user_email(x_user_email: Optional[str] = Header(None)) -> str:
    return (x_user_email or "").strip().lower()

@router.get("")
async def list_claims(x_user_email: Optional[str] = Header(None)):
    user_email = get_user_email(x_user_email)
    claims = get_all_claims()
    
    customer_claims = [
        c for c in claims 
        if (c.get("userEmail") or "").strip().lower() == user_email
    ] if user_email else []
    
    return {
        "success": True,
        "count": len(customer_claims),
        "data": customer_claims
    }

@router.post("")
async def create_claim(body: Dict[str, Any], x_user_email: Optional[str] = Header(None)):
    user_email = get_user_email(x_user_email) or body.get("userEmail") or "anilkumar@warrantywala.ai"
    claims = get_all_claims()
    brand = body.get("brand") or "Manufacturer"
    
    new_claim = {
        "id": body.get("id") or f"clm-{str(uuid.uuid4())[:6]}",
        "userEmail": user_email,
        "warrantyId": body.get("warrantyId"),
        "productName": body.get("productName") or "Untitled Product",
        "brand": brand,
        "serialNumber": body.get("serialNumber") or "N/A",
        "invoiceNumber": body.get("invoiceNumber") or "N/A",
        "purchaseDate": body.get("purchaseDate") or datetime.now().strftime("%Y-%m-%d"),
        "defectDescription": body.get("defectDescription") or "",
        "customerName": body.get("customerName") or "Valued Customer",
        "customerPhone": body.get("customerPhone") or "",
        "customerEmail": body.get("customerEmail") or user_email,
        "recipient": body.get("recipient") or f"{brand.lower().replace(' ', '')}.care@escalations.com",
        "status": body.get("status") or "Notice Drafted",
        "estimatedTurnaround": body.get("estimatedTurnaround") or "48 - 72 Hours",
        "letter": body.get("letter") or "",
        "createdAt": datetime.now().isoformat()
    }
    
    claims.insert(0, new_claim)
    save_all_claims(claims)
    
    return {
        "success": True,
        "message": "Legal claim recorded in vault",
        "data": new_claim
    }

@router.delete("/{claim_id}")
async def delete_claim(claim_id: str, x_user_email: Optional[str] = Header(None)):
    claims = get_all_claims()
    filtered = [c for c in claims if c.get("id") != claim_id]
    save_all_claims(filtered)
    return {"success": True, "message": "Claim deleted from vault"}
