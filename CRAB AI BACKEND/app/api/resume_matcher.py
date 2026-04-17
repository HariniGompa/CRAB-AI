"""
Resume Matcher API — accepts PDF file upload directly, uses Gemini AI.
"""

from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
import io
from ..services.ai_service import AIService
from ..api.auth import get_current_active_user

router = APIRouter()


@router.post("/analyze-text")
async def analyze_resume_match(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    current_user=Depends(get_current_active_user),
):
    """
    Match resume against job description.
    Accepts file upload or raw text.
    Uses Gemini AI for intelligent matching.
    """
    text = ""

    if file and file.filename:
        content = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".pdf"):
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(io.BytesIO(content))
                text = " ".join(page.extract_text() or "" for page in reader.pages)
            except Exception:
                text = content.decode("utf-8", errors="ignore")
        elif filename.endswith(".docx"):
            try:
                import docx
                doc = docx.Document(io.BytesIO(content))
                text = " ".join(para.text for para in doc.paragraphs)
            except Exception:
                text = content.decode("utf-8", errors="ignore")
        else:
            text = content.decode("utf-8", errors="ignore")
    elif resume_text:
        text = resume_text

    if not text.strip():
        return JSONResponse(status_code=400, content={"detail": "Could not extract resume text"})

    effective_jd = job_description or (f"Job role: {target_role}" if target_role else "")
    if not effective_jd.strip():
        return JSONResponse(status_code=400, content={"detail": "Please provide a job description or target role"})

    ai_service = AIService()
    result = await ai_service.analyze_resume_job_match(text, effective_jd)
    return result
