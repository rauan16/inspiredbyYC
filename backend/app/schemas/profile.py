from pydantic import BaseModel
from typing import Optional, Any


class AcademicInfo(BaseModel):
    school: Optional[str] = None
    curriculum: Optional[str] = None
    gpa: Optional[float] = None
    gpaScale: Optional[str] = None
    sat: Optional[float] = None
    act: Optional[float] = None
    ielts: Optional[float] = None
    toefl: Optional[float] = None
    intendedMajor: Optional[str] = None
    graduationYear: Optional[str] = None


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
    academic_info: Optional[Any] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    interests: Optional[list[str]] = None
    goals: Optional[list[str]] = None
    portfolio_strength: Optional[int] = None
    avatar_initials: Optional[str] = None
    academic_info: Optional[Any] = None
