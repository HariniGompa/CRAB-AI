from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

class ResumeCreate(BaseModel):
    title: str
    resume_type: Optional[str] = "experienced"
    template: Optional[str] = "professional"
    content: Optional[Dict[str, Any]] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    resume_type: Optional[str] = None
    template: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    resume_type: Optional[str] = None
    template: Optional[str] = None
    file_name: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
