"""
Course Recommendation API — domain-aware filtering
"""
from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.course_service import CourseService
from ..services.ai_service import AIService
from ..api.auth import get_current_active_user

router = APIRouter()


class CourseGenRequest(BaseModel):
    current_skills: List[str]
    target_skills: List[str]
    career_goal: Optional[str] = None
    resume_text: Optional[str] = ""


def detect_domain(career_goal: str) -> str:
    """Map career goal to a domain tag for strict course filtering."""
    g = career_goal.lower()
    if any(w in g for w in ["data analyst", "data analysis", "business analyst", "bi analyst"]):
        return "data_analysis"
    if any(w in g for w in ["data scientist", "data science", "machine learning", "ml engineer", "ai engineer"]):
        return "data_science_ml"
    if any(w in g for w in ["deep learning", "computer vision", "nlp", "natural language"]):
        return "deep_learning"
    if any(w in g for w in ["data engineer", "data pipeline", "etl", "big data"]):
        return "data_engineering"
    if any(w in g for w in ["frontend", "front-end", "react developer", "ui developer", "web developer"]):
        return "frontend"
    if any(w in g for w in ["backend", "back-end", "api developer", "node developer", "python developer", "django", "flask"]):
        return "backend"
    if any(w in g for w in ["full stack", "fullstack", "mern", "mean"]):
        return "fullstack"
    if any(w in g for w in ["devops", "sre", "infrastructure", "cloud engineer", "platform engineer"]):
        return "devops"
    if any(w in g for w in ["mobile", "android", "ios", "flutter", "react native"]):
        return "mobile"
    if any(w in g for w in ["game developer", "game dev", "unity", "unreal"]):
        return "game_dev"
    if any(w in g for w in ["cybersecurity", "security engineer", "ethical hack", "penetration"]):
        return "cybersecurity"
    if any(w in g for w in ["software engineer", "software developer", "sde", "swe"]):
        return "software_engineering"
    if any(w in g for w in ["product manager", "product management", "pm"]):
        return "product_management"
    return "general"


@router.post("/generate")
async def generate_course_recommendations(
    request: CourseGenRequest,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    ai_service = AIService()
    career_goal = request.career_goal or " ".join(request.target_skills)
    domain = detect_domain(career_goal)

    # AI skill gap analysis
    skill_gap_result = await ai_service.analyze_skill_gap(
        current_skills=request.current_skills,
        career_goal=career_goal,
        resume_text=request.resume_text or "",
    )

    ai_skill_gaps = skill_gap_result.get("skill_gaps", [])
    priority_skills = skill_gap_result.get("priority_skills", [])
    career_path_tip = skill_gap_result.get("career_path_tip", "")
    estimated_timeline = skill_gap_result.get("estimated_timeline", "")

    # Use AI gaps as targets, fall back to parsed goal keywords
    effective_targets = ai_skill_gaps if ai_skill_gaps else request.target_skills

    course_service = CourseService(db)
    result = await course_service.generate_course_recommendations(
        user_id=current_user.id,
        current_skills=request.current_skills,
        target_skills=effective_targets,
        career_goal=career_goal,
        domain=domain,  # pass domain for strict filtering
    )

    courses = result.recommended_courses if hasattr(result, "recommended_courses") else []

    return {
        "skill_gap_analysis": {
            "current_skills": request.current_skills,
            "career_goal": career_goal,
            "domain": domain,
            "skill_gaps": ai_skill_gaps,
            "priority_skills": priority_skills,
            "career_path_tip": career_path_tip,
            "estimated_timeline": estimated_timeline,
        },
        "recommended_skills": ai_skill_gaps,
        "courses": courses,
    }
