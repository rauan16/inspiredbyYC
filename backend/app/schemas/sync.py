from pydantic import BaseModel
from typing import Optional, Any


class SyncPortfolioItem(BaseModel):
    id: str
    section: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    deleted: Optional[bool] = None


class SyncPortfolioCreate(BaseModel):
    section: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


class SyncPortfolioReorderItem(BaseModel):
    id: str
    sort_order: int


class SyncSavedOpportunity(BaseModel):
    opportunity_id: str
    saved: bool


class SyncProfile(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None
    goals: Optional[list[str]] = None
    portfolio_strength: Optional[int] = None
    avatar_initials: Optional[str] = None
    academic_info: Optional[Any] = None


class SyncRequest(BaseModel):
    profile: Optional[SyncProfile] = None
    portfolio_creates: Optional[list[SyncPortfolioCreate]] = None
    portfolio: Optional[list[SyncPortfolioItem]] = None
    portfolio_reorder: Optional[list[SyncPortfolioReorderItem]] = None
    saved_opportunities: Optional[list[SyncSavedOpportunity]] = None


class SyncResponse(BaseModel):
    profile_updated: bool = False
    portfolio_created: int = 0
    portfolio_updated: int = 0
    portfolio_deleted: int = 0
    portfolio_reordered: bool = False
    saved_updated: int = 0
    saved_removed: int = 0
