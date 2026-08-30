from pydantic import BaseModel
from typing import Optional


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
    location: Optional[str] = None
    format: Optional[str] = None
    eligibility: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[list[str]] = None
    timeline: Optional[list[OpportunityTimelineItem]] = None
    color: Optional[str] = None
    website: Optional[str] = None
    recommended: Optional[bool] = None
