import os
import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException
from pydantic import BaseModel
from ..services.storage_service import (
    get_all_warranties,
    save_all_warranties,
    calculate_status
)
from ..services.ai_service import extract_receipt_data

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "../server/uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

router = APIRouter(prefix="/api/warranties", tags=["Warranties"])

def get_user_email(x_user_email: Optional[str] = Header(None)) -> str:
    return (x_user_email or "").strip().lower()

@router.get("")
async def list_warranties(x_user_email: Optional[str] = Header(None)):
    user_email = get_user_email(x_user_email)
    warranties = get_all_warranties()
    
    customer_items = [
        w for w in warranties 
        if (w.get("userEmail") or "").strip().lower() == user_email
    ] if user_email else []
    
    updated = [
        {**w, "status": calculate_status(w.get("expiryDate"))}
        for w in customer_items
    ]
    
    return {
        "success": True,
        "count": len(updated),
        "userEmail": user_email or "guest",
        "data": updated
    }

@router.get("/analytics")
async def get_analytics(x_user_email: Optional[str] = Header(None)):
    user_email = get_user_email(x_user_email)
    warranties = get_all_warranties()
    
    customer_items = [
        w for w in warranties 
        if (w.get("userEmail") or "").strip().lower() == user_email
    ] if user_email else []
    
    updated = [
        {**w, "status": calculate_status(w.get("expiryDate"))}
        for w in customer_items
    ]
    
    total_val = sum(float(w.get("price") or 0.0) for w in updated)
    active_count = sum(1 for w in updated if w.get("status") == "Active")
    expiring_count = sum(1 for w in updated if w.get("status") == "Expiring Soon")
    expired_count = sum(1 for w in updated if w.get("status") == "Expired")
    
    categories = {}
    for w in updated:
        cat = w.get("category") or "Electronics"
        categories[cat] = categories.get(cat, 0) + 1
        
    return {
        "success": True,
        "data": {
            "totalItems": len(updated),
            "totalProtectedValue": total_val,
            "activeCount": active_count,
            "expiringCount": expiring_count,
            "expiredCount": expired_count,
            "categoryBreakdown": categories
        }
    }

@router.post("/scan-receipt")
async def scan_receipt(
    receipt: Optional[UploadFile] = File(None),
    x_user_email: Optional[str] = Header(None)
):
    user_email = get_user_email(x_user_email) or "anilkumar@warrantywala.ai"
    
    file_bytes = None
    receipt_url = "/uploads/default-receipt.jpg"
    mime_type = "image/jpeg"
    file_name = "Invoice.pdf"
    
    if receipt:
        file_bytes = await receipt.read()
        mime_type = receipt.content_type or "image/jpeg"
        file_name = receipt.filename or "receipt.jpg"
        
        ext = os.path.splitext(file_name)[1] or ".jpg"
        saved_filename = f"receipt-{int(datetime.now().timestamp())}-{str(uuid.uuid4())[:8]}{ext}"
        saved_path = os.path.join(UPLOADS_DIR, saved_filename)
        
        with open(saved_path, "wb") as f:
            f.write(file_bytes)
        receipt_url = f"/uploads/{saved_filename}"
        
    extracted = await extract_receipt_data(file_bytes, mime_type, file_name)
    
    new_warranty = {
        "id": f"ww-{str(uuid.uuid4())[:6]}",
        "userEmail": user_email,
        **extracted,
        "receiptUrl": receipt_url,
        "status": calculate_status(extracted.get("expiryDate")),
        "claimCount": 0,
        "createdAt": datetime.now().isoformat()
    }
    
    return {
        "success": True,
        "message": "Invoice verified and extracted via Python Google Gemini 3.7 Flash",
        "data": new_warranty
    }

@router.post("")
async def create_warranty(
    body: Dict[str, Any],
    x_user_email: Optional[str] = Header(None)
):
    user_email = get_user_email(x_user_email) or body.get("userEmail") or "anilkumar@warrantywala.ai"
    warranties = get_all_warranties()
    
    duration = int(body.get("warrantyDurationMonths") or 12)
    purchase_date_str = body.get("purchaseDate") or datetime.now().strftime("%Y-%m-%d")
    
    expiry_date_str = body.get("expiryDate")
    if not expiry_date_str:
        try:
            purchase_date = datetime.fromisoformat(purchase_date_str)
            expiry_date = purchase_date + timedelta(days=duration * 30.5)
            expiry_date_str = expiry_date.strftime("%Y-%m-%d")
        except Exception:
            expiry_date_str = purchase_date_str
            
    price = float(body.get("price") or body.get("totalAmount") or 0.0)
    
    new_entry = {
        "id": body.get("id") or f"ww-{str(uuid.uuid4())[:6]}",
        "userEmail": user_email,
        "productName": body.get("productName") or "Smart Device",
        "brand": body.get("brand") or "Generic",
        "category": body.get("category") or "Electronics",
        "purchaseDate": purchase_date_str,
        "warrantyDurationMonths": duration,
        "expiryDate": expiry_date_str,
        "price": price,
        "currency": body.get("currency") or "INR",
        "storeName": body.get("storeName") or "Official Retailer",
        "storeGSTIN": body.get("storeGSTIN"),
        "storePhone": body.get("storePhone"),
        "storeAddress": body.get("storeAddress"),
        "serialNumber": body.get("serialNumber") or f"SN-{int(datetime.now().timestamp()) % 1000000}",
        "invoiceNumber": body.get("invoiceNumber") or f"INV-{int(datetime.now().timestamp()) % 10000}",
        "hsnCode": body.get("hsnCode"),
        "customerName": body.get("customerName"),
        "customerPhone": body.get("customerPhone"),
        
        # GST breakdown
        "taxableAmount": float(body.get("taxableAmount") or 0.0),
        "cgstRate": float(body.get("cgstRate") or 0.0),
        "cgstAmount": float(body.get("cgstAmount") or 0.0),
        "sgstRate": float(body.get("sgstRate") or 0.0),
        "sgstAmount": float(body.get("sgstAmount") or 0.0),
        "igstRate": float(body.get("igstRate") or 0.0) if body.get("igstRate") else None,
        "igstAmount": float(body.get("igstAmount") or 0.0) if body.get("igstAmount") else None,
        "totalTax": float(body.get("totalTax") or 0.0),
        "totalAmount": price,
        
        "status": calculate_status(expiry_date_str),
        "coverageType": body.get("coverageType") or f"{duration}-Month Comprehensive Warranty",
        "claimCount": int(body.get("claimCount") or 0),
        "receiptUrl": body.get("receiptUrl") or "",
        "notes": body.get("notes") or "",
        "supportPhone": body.get("supportPhone") or "1800-100-2000",
        "supportEmail": body.get("supportEmail") or "support@warrantywala.com",
        "createdAt": datetime.now().isoformat()
    }
    
    warranties.insert(0, new_entry)
    save_all_warranties(warranties)
    
    return {
        "success": True,
        "message": "Warranty record saved to vault",
        "data": new_entry
    }

@router.delete("/{warranty_id}")
async def delete_warranty(warranty_id: str, x_user_email: Optional[str] = Header(None)):
    user_email = get_user_email(x_user_email)
    warranties = get_all_warranties()
    
    item = next((w for w in warranties if w.get("id") == warranty_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Warranty not found")
        
    filtered = [w for w in warranties if w.get("id") != warranty_id]
    save_all_warranties(filtered)
    
    return {"success": True, "message": "Warranty deleted successfully"}
