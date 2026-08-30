from pydantic import BaseModel
from typing import Optional


class MentorMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    actions: Optional[list[str]] = None
    created_at: Optional[str] = None


class MentorMessageCreate(BaseModel):
    content: str
