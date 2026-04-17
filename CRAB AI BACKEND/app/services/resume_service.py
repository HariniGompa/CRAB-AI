import os
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import UploadFile
from ..models.resume import Resume
from ..schemas.resume import ResumeCreate, ResumeUpdate
from ..utils.file_handler import FileHandler
from ..config import settings

class ResumeService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_resumes(self, user_id: int) -> List[Resume]:
        return self.db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active == True).all()

    def get_resume_by_id(self, resume_id: int, user_id: Optional[int] = None) -> Optional[Resume]:
        q = self.db.query(Resume).filter(Resume.id == resume_id)
        if user_id:
            q = q.filter(Resume.user_id == user_id)
        return q.first()

    def create_resume(self, user_id: int, data: ResumeCreate) -> Resume:
        resume = Resume(
            user_id=user_id,
            title=data.title,
            resume_type=data.resume_type,
            template=data.template,
            content=data.content or {},
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    async def upload_resume(self, user_id: int, file: UploadFile, title: str) -> Resume:
        if not FileHandler.is_allowed(file.filename):
            raise ValueError("Only PDF, DOC, DOCX and TXT files are allowed")
        file_path, file_name = await FileHandler.save(file, settings.resume_dir)
        resume = Resume(
            user_id=user_id,
            title=title,
            file_path=file_path,
            file_name=file_name,
            file_type=file.content_type,
            content={"text": "", "word_count": 0},
        )
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def update_resume(self, resume_id: int, user_id: int, data: ResumeUpdate) -> Optional[Resume]:
        resume = self.get_resume_by_id(resume_id, user_id)
        if not resume:
            return None
        if data.title is not None:
            resume.title = data.title
        if data.resume_type is not None:
            resume.resume_type = data.resume_type
        if data.template is not None:
            resume.template = data.template
        if data.content is not None:
            resume.content = data.content
        resume.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(resume)
        return resume

    def delete_resume(self, resume_id: int, user_id: int) -> bool:
        resume = self.get_resume_by_id(resume_id, user_id)
        if not resume:
            return False
        if resume.file_path:
            FileHandler.delete(resume.file_path)
        self.db.delete(resume)
        self.db.commit()
        return True
