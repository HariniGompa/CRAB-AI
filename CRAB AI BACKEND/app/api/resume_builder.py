"""Resume Builder API — save/load full resume data."""
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..api.auth import get_current_active_user

router = APIRouter()

# Simple in-memory + SQLite storage for resume data
# We store the full resume JSON in the existing Resume model's content field

class ResumeData(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: str
    user_type: Optional[str] = "fresher"
    template: Optional[str] = "professional"
    form_data: Optional[Dict[str, Any]] = {}
    experiences: Optional[List[Any]] = []
    education: Optional[List[Any]] = []
    projects: Optional[List[Any]] = []
    profile_links: Optional[List[Any]] = []
    achievements: Optional[List[Any]] = []
    certifications: Optional[List[Any]] = []
    internships: Optional[List[Any]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


@router.post("/save")
def save_resume(
    data: ResumeData,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Save a full resume to the database."""
    from ..models.resume import Resume
    now = datetime.utcnow().isoformat()
    resume = Resume(
        user_id=current_user.id,
        title=data.name or "My Resume",
        resume_type=data.user_type or "fresher",
        template=data.template or "professional",
        content={
            "name": data.name,
            "user_type": data.user_type,
            "template": data.template,
            "form_data": data.form_data or {},
            "experiences": data.experiences or [],
            "education": data.education or [],
            "projects": data.projects or [],
            "profile_links": data.profile_links or [],
            "achievements": data.achievements or [],
            "certifications": data.certifications or [],
            "internships": data.internships or [],
        },
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return {
        "id": str(resume.id),
        "name": data.name,
        "template": data.template,
        "user_type": data.user_type,
        "created_at": now,
        "updated_at": now,
        **({k: v for k, v in data.dict().items() if k not in ["id", "user_id", "created_at", "updated_at"]}),
    }


@router.get("/list")
def list_resumes(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List all resumes for the current user."""
    from ..models.resume import Resume
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_active == True,
    ).order_by(Resume.updated_at.desc()).all()

    result = []
    for r in resumes:
        content = r.content or {}
        result.append({
            "id": str(r.id),
            "name": content.get("name", r.title),
            "template": content.get("template", r.template),
            "user_type": content.get("user_type", r.resume_type),
            "form_data": content.get("form_data", {}),
            "experiences": content.get("experiences", []),
            "education": content.get("education", []),
            "projects": content.get("projects", []),
            "profile_links": content.get("profile_links", []),
            "achievements": content.get("achievements", []),
            "certifications": content.get("certifications", []),
            "internships": content.get("internships", []),
            "created_at": r.created_at.isoformat() if r.created_at else "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else "",
        })
    return result


@router.put("/{resume_id}")
def update_resume(
    resume_id: str,
    data: ResumeData,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from ..models.resume import Resume
    resume = db.query(Resume).filter(
        Resume.id == int(resume_id),
        Resume.user_id == current_user.id,
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    resume.title = data.name or resume.title
    resume.content = {
        "name": data.name,
        "user_type": data.user_type,
        "template": data.template,
        "form_data": data.form_data or {},
        "experiences": data.experiences or [],
        "education": data.education or [],
        "projects": data.projects or [],
        "profile_links": data.profile_links or [],
        "achievements": data.achievements or [],
        "certifications": data.certifications or [],
        "internships": data.internships or [],
    }
    db.commit()
    return {"message": "Updated", "id": resume_id}


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    from ..models.resume import Resume
    try:
        resume = db.query(Resume).filter(
            Resume.id == int(resume_id),
            Resume.user_id == current_user.id,
        ).first()
        if resume:
            resume.is_active = False
            db.commit()
    except Exception:
        pass
    return {"message": "Deleted"}
