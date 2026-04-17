from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.portfolio import PortfolioCreate, PortfolioResponse
from ..services.portfolio_service import PortfolioService
from ..api.auth import get_current_active_user

router = APIRouter()

def _to_response(p) -> PortfolioResponse:
    return PortfolioResponse(
        id=p.id, user_id=p.user_id, name=p.name,
        portfolio_type=p.portfolio_type, template=p.template,
        content=p.content, is_published=p.is_published,
        created_at=p.created_at,
    )

@router.get("/", response_model=List[PortfolioResponse])
def get_portfolios(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    return [_to_response(p) for p in PortfolioService(db).get_user_portfolios(current_user.id)]

@router.post("/", response_model=PortfolioResponse, status_code=201)
def create_portfolio(data: PortfolioCreate, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    return _to_response(PortfolioService(db).create_portfolio(current_user.id, data))

@router.delete("/{portfolio_id}")
def delete_portfolio(portfolio_id: int, current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    if not PortfolioService(db).delete_portfolio(portfolio_id, current_user.id):
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"message": "Portfolio deleted"}
