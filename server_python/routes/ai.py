from typing import Optional, Dict, Any
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from ..services.storage_service import get_all_warranties
from ..services.ai_service import handle_ai_chat, generate_claim_letter

router = APIRouter(prefix="/api/ai", tags=["AI Copilot"])

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def ai_chat(req: ChatRequest, x_user_email: Optional[str] = Header(None)):
    user_email = (x_user_email or "").strip().lower()
    warranties = get_all_warranties()
    
    context_warranties = [
        w for w in warranties 
        if (w.get("userEmail") or "").strip().lower() == user_email
    ] if user_email else []
    
    result = await handle_ai_chat(req.message, context_warranties)
    return {
        "success": True,
        "data": result
    }

@router.post("/draft-claim")
async def draft_claim(body: Dict[str, Any]):
    claim_data = await generate_claim_letter(body)
    return {
        "success": True,
        "data": claim_data
    }
