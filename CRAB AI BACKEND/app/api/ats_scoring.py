"""ATS Scoring API — accepts both JSON text and file upload."""
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import io, logging
from ..services.ai_service import AIService
from ..api.auth import get_current_active_user

router = APIRouter()
logger = logging.getLogger(__name__)


def extract_pdf_text(content: bytes) -> str:
    text = ""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(io.BytesIO(content))
        pages = []
        for page in reader.pages:
            try:
                t = page.extract_text()
                if t: pages.append(t)
            except Exception: pass
        text = " ".join(pages)
    except Exception as e:
        logger.warning(f"PyPDF2 failed: {e}")
    if not text.strip():
        text = content.decode("latin-1", errors="ignore")
    if not text.strip():
        text = content.decode("utf-8", errors="replace")
    return text


class ATSJsonRequest(BaseModel):
    resume_text: str
    job_description: Optional[str] = None


async def _analyze(text: str, job_description: Optional[str]) -> dict:
    if not text.strip():
        return None
    ai = AIService()
    if ai._is_available() and job_description and job_description.strip():
        result = await ai.analyze_resume_job_match(text, job_description)
        if result and result.get("match_percentage") is not None:
            return {
                "overall_score": result.get("match_percentage", 0),
                "score": result.get("match_percentage", 0),
                "suggestions": result.get("improvements", []),
                "missing_keywords": result.get("missing_skills", []),
                "matched_skills": result.get("matched_skills", []),
                "summary": result.get("summary", ""),
                "found_sections": [],
                "word_count": len(text.split()),
                "action_verb_count": 0,
                "ai_powered": True,
            }
    # Fallback rule-based
    rb = ai.calculate_ats_score_rule_based(text)
    known_tech = {
        "python","java","javascript","typescript","react","angular","vue","nodejs","sql",
        "mongodb","aws","azure","gcp","docker","kubernetes","git","linux","html","css",
        "django","flask","fastapi","machine learning","tensorflow","pytorch","scikit-learn",
        "pandas","numpy","tableau","power bi","excel","r","spark","hadoop","postgresql",
        "mysql","redis","nosql","nlp","openai","github","gitlab","kotlin","swift","flutter",
    }
    missing = []
    if job_description:
        job_kw  = set(ai.extract_keywords_rule_based(job_description))
        res_kw  = set(ai.extract_keywords_rule_based(text))
        missing = [k for k in list(job_kw - res_kw) if k.lower() in known_tech][:10]
    return {
        "overall_score": rb["score"], "score": rb["score"],
        "suggestions": rb["suggestions"], "missing_keywords": missing,
        "found_sections": rb["found_sections"], "word_count": rb["word_count"],
        "action_verb_count": rb["action_verb_count"], "ai_powered": False,
    }


@router.post("/analyze-text")
async def analyze_resume_json(
    request: ATSJsonRequest,
    current_user=Depends(get_current_active_user),
):
    """Accept JSON with resume_text field."""
    result = await _analyze(request.resume_text, request.job_description)
    if result is None:
        return JSONResponse(status_code=400, content={"detail": "Resume text is empty."})
    return result


@router.post("/analyze-file")
async def analyze_resume_file(
    file: Optional[UploadFile] = File(None),
    job_description: Optional[str] = Form(None),
    current_user=Depends(get_current_active_user),
):
    """Accept multipart file upload."""
    text = ""
    if file and file.filename:
        content  = await file.read()
        filename = file.filename.lower()
        logger.info(f"File: {filename}, size: {len(content)}")
        if filename.endswith(".pdf"):
            text = extract_pdf_text(content)
        elif filename.endswith(".docx"):
            try:
                import docx
                doc  = docx.Document(io.BytesIO(content))
                text = " ".join(p.text for p in doc.paragraphs)
            except Exception:
                text = content.decode("utf-8", errors="ignore")
        else:
            text = content.decode("utf-8", errors="ignore")
        logger.info(f"Extracted {len(text)} chars")
    result = await _analyze(text, job_description)
    if result is None:
        return JSONResponse(status_code=400, content={"detail": "Could not extract text. Try a TXT file."})
    return result


@router.get("/user")
def get_user_ats_scores(current_user=Depends(get_current_active_user)):
    return []
