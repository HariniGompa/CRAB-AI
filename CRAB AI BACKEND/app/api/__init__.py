from .auth import router as auth_router
from .resume_builder import router as resume_router
from .ats_scoring import router as ats_router
from .resume_matcher import router as match_router
from .interview_prep import router as interview_router
from .course_recommendation import router as course_router
from .portfolio_generator import router as portfolio_router
from .profile import router as profile_router

__all__ = [
    "auth_router", "resume_router", "ats_router", "match_router",
    "interview_router", "course_router", "portfolio_router", "profile_router",
]
