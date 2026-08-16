import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "../server/data")

# Fallback in-memory cache
_memory_cache: Dict[str, Any] = {}

def get_file_path(filename: str) -> str:
    os.makedirs(DATA_DIR, exist_ok=True)
    return os.path.join(DATA_DIR, filename)

def read_json(filename: str, default_val: Any = None) -> Any:
    if default_val is None:
        default_val = []
    
    path = get_file_path(filename)
    if filename in _memory_cache:
        return _memory_cache[filename]
        
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _memory_cache[filename] = data
                return data
        except Exception as e:
            print(f"Warning: Error reading {path}: {e}")
            return default_val
    return default_val

def write_json(filename: str, data: Any) -> bool:
    _memory_cache[filename] = data
    path = get_file_path(filename)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Warning: Error saving {path}: {e}")
        return True

def calculate_status(expiry_date_str: Optional[str]) -> str:
    if not expiry_date_str:
        return "Active"
    try:
        expiry = datetime.fromisoformat(expiry_date_str.split("T")[0])
        today = datetime.now()
        diff_days = (expiry - today).days
        
        if diff_days < 0:
            return "Expired"
        elif diff_days <= 30:
            return "Expiring Soon"
        else:
            return "Active"
    except Exception:
        return "Active"

# Data Access APIs
def get_all_warranties() -> List[Dict[str, Any]]:
    return read_json("warranties.json", [])

def save_all_warranties(items: List[Dict[str, Any]]) -> bool:
    return write_json("warranties.json", items)

def get_all_users() -> List[Dict[str, Any]]:
    return read_json("users.json", [])

def save_all_users(users: List[Dict[str, Any]]) -> bool:
    return write_json("users.json", users)

def get_all_claims() -> List[Dict[str, Any]]:
    return read_json("claims.json", [])

def save_all_claims(claims: List[Dict[str, Any]]) -> bool:
    return write_json("claims.json", claims)

def get_all_chats() -> List[Dict[str, Any]]:
    return read_json("chats.json", [])

def save_all_chats(chats: List[Dict[str, Any]]) -> bool:
    return write_json("chats.json", chats)
