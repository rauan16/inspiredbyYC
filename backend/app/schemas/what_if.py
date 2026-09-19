from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from enum import Enum


class WhatIfField(str, Enum):
    IELTS = "ielts"
    SAT = "sat"
    BUDGET = "budget"
    PREFERRED_COUNTRY = "preferred_country"
    INTENDED_MAJOR = "intended_major"


class WhatIfRequest(BaseModel):
    field: WhatIfField
    value: str | int | float | List[str]


class ScenarioProfile(BaseModel):
    field: str
    before: str | int | float | List[str] | None
    after: str | int | float | List[str]


class UniversityMatchDiff(BaseModel):
    university_id: str
    name: str
    country: str
    before_score: int | None
    after_score: int | None
    score_change: int
    before_category: str | None
    after_category: str | None
    category_changed: bool


class RecommendationsDiff(BaseModel):
    before_top_matches: List[UniversityMatchDiff]
    after_top_matches: List[UniversityMatchDiff]
    added: List[UniversityMatchDiff]
    removed: List[UniversityMatchDiff]
    changed_scores: List[UniversityMatchDiff]


class RoadmapTaskDiff(BaseModel):
    id: str
    title: str
    category: str
    priority: str
    status: str = "pending"


class RoadmapDiff(BaseModel):
    added_tasks: List[RoadmapTaskDiff]
    removed_tasks: List[RoadmapTaskDiff]
    unchanged_count: int


class NextActionDiff(BaseModel):
    before: Optional[RoadmapTaskDiff] = None
    after: Optional[RoadmapTaskDiff] = None
    changed: bool


class WhatIfResponse(BaseModel):
    scenario: ScenarioProfile
    recommendations: RecommendationsDiff
    roadmap: RoadmapDiff
    next_action: NextActionDiff
    summary: str