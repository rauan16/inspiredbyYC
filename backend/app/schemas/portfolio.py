from pydantic import BaseModel
from typing import Optional


class PortfolioEntryResponse(BaseModel):
    id: str
    section: str
    title: str
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class PortfolioEntryCreate(BaseModel):
    section: str
    title: str
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


class PortfolioEntryUpdate(BaseModel):
    section: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


class PortfolioReorderItem(BaseModel):
    id: str
    sort_order: int


class PortfolioReorderRequest(BaseModel):
    items: list[PortfolioReorderItem]
