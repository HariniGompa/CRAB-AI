from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    resume_type = Column(String(20), nullable=True)
    template = Column(String(50), nullable=True)
    file_path = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(100), nullable=True)
    content = Column(JSON, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="resumes")
    interview_sessions = relationship("InterviewSession", back_populates="resume", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="resume", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id, "user_id": self.user_id, "title": self.title,
            "resume_type": self.resume_type, "template": self.template,
            "file_name": self.file_name, "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
