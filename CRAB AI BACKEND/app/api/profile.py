from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.user import UserResponse, UserUpdate
from ..services.auth_service import AuthService
from ..api.auth import get_current_active_user

router = APIRouter()

@router.get("/", response_model=UserResponse)
def get_profile(current_user=Depends(get_current_active_user)):
    return UserResponse(**current_user.to_dict())

@router.put("/", response_model=UserResponse)
def update_profile(data: UserUpdate, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    updated = AuthService(db).update_user_profile(current_user.id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**updated.to_dict())

@router.get("/stats")
def get_stats(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    from ..services.resume_service import ResumeService
    from ..services.portfolio_service import PortfolioService
    resumes = ResumeService(db).get_user_resumes(current_user.id)
    portfolios = PortfolioService(db).get_user_portfolios(current_user.id)
    return {
        "resumes": len(resumes),
        "portfolios": len(portfolios),
        "email": current_user.email,
        "display_name": current_user.display_name,
    }
