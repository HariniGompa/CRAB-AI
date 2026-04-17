from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.portfolio import Portfolio
from ..schemas.portfolio import PortfolioCreate

class PortfolioService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_portfolios(self, user_id: int) -> List[Portfolio]:
        return self.db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

    def get_portfolio_by_id(self, portfolio_id: int, user_id: int) -> Optional[Portfolio]:
        return self.db.query(Portfolio).filter(
            Portfolio.id == portfolio_id, Portfolio.user_id == user_id
        ).first()

    def create_portfolio(self, user_id: int, data: PortfolioCreate) -> Portfolio:
        portfolio = Portfolio(
            user_id=user_id,
            resume_id=data.resume_id,
            name=data.name,
            portfolio_type=data.portfolio_type,
            template=data.template,
            content=data.content or {},
        )
        self.db.add(portfolio)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio

    def delete_portfolio(self, portfolio_id: int, user_id: int) -> bool:
        p = self.get_portfolio_by_id(portfolio_id, user_id)
        if not p:
            return False
        self.db.delete(p)
        self.db.commit()
        return True

    def get_portfolio_stats(self, user_id: int) -> dict:
        portfolios = self.get_user_portfolios(user_id)
        return {
            "total_portfolios": len(portfolios),
            "published_portfolios": sum(1 for p in portfolios if p.is_published),
        }
