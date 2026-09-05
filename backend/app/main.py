from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import admission, auth, mentor, opportunities, portfolio, profile, saved_opportunities, sync, universities
from app.config import settings
from app.database import init_db, seed_opportunities, seed_universities

app = FastAPI(
    title="ULYS API",
    description="Backend API for ULYS — student opportunity platform with AI mentor",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    init_db()
    seed_opportunities()
    seed_universities()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(opportunities.router)
app.include_router(saved_opportunities.router)
app.include_router(portfolio.router)
app.include_router(mentor.router)
app.include_router(sync.router)
app.include_router(admission.router)
app.include_router(universities.router)
