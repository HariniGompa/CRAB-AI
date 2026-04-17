from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    name = Column(String(255), nullable=False)
    portfolio_type = Column(String(20), nullable=True)
    template = Column(String(50), nullable=True)
    content = Column(JSON, nullable=True)
    html_content = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="portfolios")
    resume = relationship("Resume", back_populates="portfolios")

    def to_dict(self):
        return {
            "id": self.id, "user_id": self.user_id, "name": self.name,
            "portfolio_type": self.portfolio_type, "template": self.template,
            "content": self.content, "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
