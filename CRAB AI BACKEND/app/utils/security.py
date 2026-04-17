import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from ..config import settings

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityUtils:

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        try:
            return pwd_context.verify(plain, hashed)
        except Exception:
            return False

    @staticmethod
    def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
        secret = settings.supabase_jwt_secret
        if not secret:
            logger.error("SUPABASE_JWT_SECRET not set in .env")
            return None
        try:
            return jwt.decode(token, secret, algorithms=["HS256", "HS512", "RS256"], options={"verify_aud": False, "verify_signature": False})
        except jwt.ExpiredSignatureError:
            logger.warning("Supabase token expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid Supabase token: {e}")
            return None

    @staticmethod
    def create_reset_token(email: str) -> str:
        data = {"sub": email, "exp": datetime.utcnow() + timedelta(hours=1)}
        return jwt.encode(data, settings.jwt_secret_key, algorithm="HS256")

    @staticmethod
    def verify_reset_token(token: str) -> Optional[str]:
        try:
            payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
            return payload.get("sub")
        except Exception:
            return None
