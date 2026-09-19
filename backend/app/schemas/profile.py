from pydantic import BaseModel
from typing import Optional, Any


class ProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    name: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None
    goals: Optional[list[str]] = None
    portfolio_strength: Optional[int] = None
    avatar_initials: Optional[str] = None
    academic_info: Optional[dict[str, Any]] = None
    onboarding_completed: bool = False


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None
    goals: Optional[list[str]] = None
    portfolio_strength: Optional[int] = None
    avatar_initials: Optional[str] = None
    academic_info: Optional[dict[str, Any]] = None
    onboarding_completed: Optional[bool] = None
