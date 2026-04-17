from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.user import User
from ..schemas.user import UserUpdate
from ..utils.security import SecurityUtils

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_supabase_user(self, supabase_uid: str, email: str, display_name: str) -> User:
        user = self.db.query(User).filter(User.supabase_uid == supabase_uid).first()
        if user:
            user.last_login = datetime.utcnow()
            self.db.commit()
            return user
        user = self.db.query(User).filter(User.email == email).first()
        if user:
            user.supabase_uid = supabase_uid
            user.last_login = datetime.utcnow()
            self.db.commit()
            return user
        user = User(
            supabase_uid=supabase_uid,
            email=email,
            display_name=display_name or email.split("@")[0],
            is_active=True,
            is_verified=True,
            last_login=datetime.utcnow(),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user_profile(self, user_id: int, update_data: UserUpdate) -> Optional[User]:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if update_data.display_name is not None:
            user.display_name = update_data.display_name
        if update_data.avatar_url is not None:
            user.avatar_url = update_data.avatar_url
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: int) -> bool:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        user.is_active = False
        self.db.commit()
        return True
