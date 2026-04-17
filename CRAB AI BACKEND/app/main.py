from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from .config import settings
from .database import create_tables, init_directories
from .api import (
    auth_router, resume_router, ats_router, match_router,
    interview_router, course_router, portfolio_router, profile_router,
)

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="CRAB AI — Career Resume Assistant Bot",
    docs_url="/docs",   # always show docs (useful in dev)
    redoc_url="/redoc",
)

# ── CORS — allow all origins (safe for local dev; restrict in production) ──────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def timing_middleware(request, call_next):
    start = time.time()
    response = await call_next(request)
    response.headers["X-Process-Time"] = f"{time.time()-start:.3f}s"
    return response

@app.exception_handler(Exception)
async def global_error_handler(request, exc):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    create_tables()
    init_directories()
    if not settings.supabase_jwt_secret:
        logger.warning("⚠️  SUPABASE_JWT_SECRET not set — auth will not work!")
    if not settings.gemini_api_key:
        logger.warning("⚠️  GEMINI_API_KEY not set — AI features will use rule-based fallback")
    logger.info("Startup complete ✓")

@app.get("/health")
def health():
    return {"status": "ok", "app": settings.app_name, "version": settings.app_version}

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name}", "docs": "/docs"}

# Route registration
app.include_router(auth_router,      prefix="/api/auth",           tags=["Auth"])
app.include_router(resume_router,    prefix="/api/resume-builder", tags=["Resume Builder"])
app.include_router(resume_router,    prefix="/api/resumes",         tags=["Resumes"])
app.include_router(ats_router,       prefix="/api/ats",            tags=["ATS Scoring"])
app.include_router(match_router,     prefix="/api/resume-matcher", tags=["Resume Matcher"])
app.include_router(interview_router, prefix="/api/interview",      tags=["Interview Prep"])
app.include_router(course_router,    prefix="/api/courses",        tags=["Courses"])
app.include_router(portfolio_router, prefix="/api/portfolio",      tags=["Portfolio"])
app.include_router(profile_router,   prefix="/api/profile",        tags=["Profile"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.debug)
