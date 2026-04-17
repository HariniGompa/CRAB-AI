from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    job_role = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    difficulty_level = Column(String(20), nullable=True)
    technical_questions = Column(JSON, nullable=True)
    hr_questions = Column(JSON, nullable=True)
    behavioral_questions = Column(JSON, nullable=True)
    total_questions = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completion_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interview_sessions")
    resume = relationship("Resume", back_populates="interview_sessions")
