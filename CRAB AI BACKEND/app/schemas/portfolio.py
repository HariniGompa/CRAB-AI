from typing import Optional, Any, Dict, List
from datetime import datetime
from pydantic import BaseModel

class PortfolioCreate(BaseModel):
    name: str
    portfolio_type: Optional[str] = "experienced"
    template: Optional[str] = "modern"
    content: Optional[Dict[str, Any]] = None
    resume_id: Optional[int] = None

class PortfolioResponse(BaseModel):
    id: int
    user_id: int
    name: str
    portfolio_type: Optional[str] = None
    template: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    is_published: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
