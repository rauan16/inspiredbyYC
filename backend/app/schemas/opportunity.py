from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone


class OpportunityTimelineItem(BaseModel):
    label: str
    date: str


class OpportunityResponse(BaseModel):
    id: str
    title: str
    organization: str
    category: str
    category_label: Optional[str] = None
    deadline: Optional[str] = None
    deadline_type: str = "date"
    location: Optional[str] = None
    format: Optional[str] = None
    eligibility: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[list[str]] = None
    timeline: Optional[list[OpportunityTimelineItem]] = None
    color: Optional[str] = None
    website: Optional[str] = None
    recommended: Optional[bool] = None
    status: str = "active"
    verification_status: str = "verified"
    verified: bool = True
    tags: list[str] = []
    relevant_subjects: list[str] = []
    target_user_types: list[str] = []
    is_free: bool = True
    last_verified_at: str = ""
    official_source_url: str = ""
    age_grade: Optional[str] = None
    event_date: Optional[str] = None

    class Config:
        populate_by_name = True
