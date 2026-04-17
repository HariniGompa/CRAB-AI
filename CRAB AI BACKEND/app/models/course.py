from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class CourseRecommendation(Base):
    __tablename__ = "course_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    career_goal = Column(String(500), nullable=False)
    current_skills = Column(JSON, nullable=True)
    target_skills = Column(JSON, nullable=True)
    skill_gaps = Column(JSON, nullable=True)
    recommended_courses = Column(JSON, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="course_recommendations")
