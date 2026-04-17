from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: int; email: str; display_name: str; avatar_url: Optional[str] = None
    is_active: bool; is_verified: bool
    created_at: Optional[datetime] = None; updated_at: Optional[datetime] = None; last_login: Optional[datetime] = None
    class Config: from_attributes = True

class UserUpdate(BaseModel):
    display_name: Optional[str] = None; avatar_url: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str; new_password: str
