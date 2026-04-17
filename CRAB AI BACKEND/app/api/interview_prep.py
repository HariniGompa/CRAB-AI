"""Interview Preparation API — supports coding questions, show_answer, variable question count."""
from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.ai_service import AIService
from ..api.auth import get_current_active_user

router = APIRouter()


class InterviewGenerateRequest(BaseModel):
    resume_content: Optional[str] = ""
    job_role: str
    company: Optional[str] = None
    difficulty_level: Optional[str] = "mid"
    questions_per_round: Optional[int] = 5
    include_coding: Optional[bool] = False
    session_seed: Optional[str] = None  # unique per session for fresh questions


class InterviewQuestionsResponse(BaseModel):
    technical: List[str]
    hr: List[str]
    behavioral: List[str]
    coding: List[str] = []


class AnswerFeedbackRequest(BaseModel):
    question: str
    answer: str
    job_role: str
    show_answer: Optional[bool] = False


class AnswerFeedbackResponse(BaseModel):
    feedback: str


@router.post("/generate", response_model=InterviewQuestionsResponse)
async def generate_interview_questions(
    request: InterviewGenerateRequest,
    current_user=Depends(get_current_active_user),
):
    ai_service = AIService()
    n = max(3, min(10, request.questions_per_round or 5))

    result = await ai_service.generate_interview_questions(
        resume_content=request.resume_content or "",
        job_role=request.job_role,
        company=request.company,
        difficulty_level=request.difficulty_level or "mid",
        questions_per_round=n,
        include_coding=request.include_coding or False,
        session_seed=request.session_seed,
    )
    return InterviewQuestionsResponse(
        technical=result.get("technical", []),
        hr=result.get("hr", []),
        behavioral=result.get("behavioral", []),
        coding=result.get("coding", []),
    )


@router.post("/feedback", response_model=AnswerFeedbackResponse)
async def evaluate_answer(
    request: AnswerFeedbackRequest,
    current_user=Depends(get_current_active_user),
):
    ai_service = AIService()
    feedback = await ai_service.evaluate_interview_answer(
        question=request.question,
        answer=request.answer,
        job_role=request.job_role,
        show_answer=request.show_answer or False,
    )
    return AnswerFeedbackResponse(feedback=feedback)


@router.get("/sessions")
def get_sessions(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    return []


@router.post("/sessions")
def save_session(current_user=Depends(get_current_active_user), db: Session = Depends(get_db)):
    return {"message": "Session saved", "id": 1}
