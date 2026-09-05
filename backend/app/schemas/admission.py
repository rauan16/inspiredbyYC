from pydantic import BaseModel
from typing import Optional


class RequirementAnalysisItem(BaseModel):
    criterion: str
    status: str
    studentValue: Optional[str] = None
    requiredValue: Optional[str] = None
    explanation: str


class ProfileDimension(BaseModel):
    rating: str
    explanation: str


class ProfileAnalysis(BaseModel):
    academic: ProfileDimension
    extracurricular: ProfileDimension
    portfolio: ProfileDimension


class OverallAssessment(BaseModel):
    level: str
    explanation: str


class AdmissionEstimate(BaseModel):
    available: bool
    min: Optional[int] = None
    max: Optional[int] = None
    confidence: Optional[str] = None
    explanation: str


class RecommendationItem(BaseModel):
    priority: str
    action: str
    reason: str


class AdmissionAnalysisResponse(BaseModel):
    requirementAnalysis: list[RequirementAnalysisItem]
    profileAnalysis: ProfileAnalysis
    overallAssessment: OverallAssessment
    admissionEstimate: AdmissionEstimate
    weaknesses: list[str]
    recommendations: list[RecommendationItem]
    studentProfile: dict
    universityData: dict
