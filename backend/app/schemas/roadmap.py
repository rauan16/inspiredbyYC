from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from enum import Enum


class TaskCategory(str, Enum):
    ACADEMICS = "ACADEMICS"
    LANGUAGE = "LANGUAGE"
    UNIVERSITY_RESEARCH = "UNIVERSITY_RESEARCH"
    APPLICATION = "APPLICATION"
    ESSAYS = "ESSAYS"
    DOCUMENTS = "DOCUMENTS"
    EXTRACURRICULARS = "EXTRACURRICULARS"


class TaskPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class RoadmapTask(BaseModel):
    id: str
    title: str
    description: str
    category: TaskCategory
    priority: TaskPriority
    status: TaskStatus = TaskStatus.PENDING
    deadline: Optional[date] = None
    target_date: Optional[date] = None
    reason: str
    related_university: Optional[str] = None


class RoadmapResponse(BaseModel):
    tasks: List[RoadmapTask]
    generated_at: str
    profile_completeness: int
    top_matches_count: int
    next_best_action: Optional["NextBestAction"] = None


class NextBestAction(BaseModel):
    task_id: str
    title: str
    category: TaskCategory
    priority: TaskPriority
    deadline: Optional[date] = None
    target_date: Optional[date] = None
    reason: str
    completed: bool = False


class RoadmapTaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None