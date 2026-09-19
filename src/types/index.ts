export type OpportunityCategory =
  | "olympiad"
  | "hackathon"
  | "volunteering"
  | "internship"
  | "scholarship"
  | "forum"
  | "conference"
  | "program"
  | "research"
  | "competition"
  | "grant"
  | "festival";

export type OpportunityFormat = "online" | "offline" | "hybrid";

export type VerificationStatus = "verified" | "partially_verified" | "unverified" | "expired";

export type OpportunityStatus = "active" | "expired" | "upcoming" | "closed";

export type DeadlineType = "date" | "rolling";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  categoryLabel: string;
  deadline: string;
  deadlineType: DeadlineType;
  eventDate?: string;
  location: string;
  format: OpportunityFormat;
  eligibility: string;
  ageGrade?: string;
  description: string;
  requirements: string[];
  timeline: { label: string; date: string }[];
  color: string;
  recommended?: boolean;
  recommendationReason?: string;
  saved?: boolean;
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  verified: boolean;
  officialSourceUrl: string;
  applicationUrl?: string;
  lastVerifiedAt: string;
  tags: string[];
  relevantSubjects: string[];
  targetUserTypes: string[];
  isFree: boolean;
  website: string;
}

export interface AdmissionRequirementAnalysis {
  criterion: string;
  status: "MET" | "NOT_MET" | "MISSING" | "UNKNOWN";
  studentValue?: string;
  requiredValue?: string;
  explanation: string;
}

export interface AdmissionProfileDimension {
  rating: "EXCELLENT" | "STRONG" | "GOOD" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA";
  explanation: string;
}

export interface AdmissionProfileAnalysis {
  academic: AdmissionProfileDimension;
  extracurricular: AdmissionProfileDimension;
  portfolio: AdmissionProfileDimension;
}

export interface AdmissionOverallAssessment {
  level: "HIGHLY_COMPETITIVE" | "COMPETITIVE" | "MODERATE" | "WEAK" | "INSUFFICIENT_DATA";
  explanation: string;
}

export interface AdmissionEstimate {
  available: boolean;
  min?: number;
  max?: number;
  confidence?: "HIGH" | "MEDIUM" | "LOW" | null;
  explanation: string;
}

export interface AdmissionRecommendation {
  priority: "HIGH" | "MEDIUM" | "LOW";
  action: string;
  reason: string;
}

export interface AdmissionAnalysis {
  requirementAnalysis: AdmissionRequirementAnalysis[];
  profileAnalysis: AdmissionProfileAnalysis;
  overallAssessment: AdmissionOverallAssessment;
  admissionEstimate: AdmissionEstimate;
  weaknesses: string[];
  recommendations: AdmissionRecommendation[];
  studentProfile: Record<string, unknown>;
  universityData: Record<string, unknown>;
}

export interface UniversityAnalysis {
  profileMatch: string;
  confidence: "High" | "Medium" | "Low";
  missingData: string[];
  academicStrength: number;
  testingStrength: number;
  extracurricularStrength: number;
  researchStrength: number;
  leadershipStrength: number;
  universityFit: number;
  overallProfileStrength: number;
  academicFit: string;
  testingFit: string;
  majorFit: string;
  extracurricularFit: string;
  researchFit: string;
  leadershipFit: string;
  requirementsFit: string;
  applicationStrength: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  explanation: string;
  admissionEstimate?: {
    available: boolean;
    min: number;
    max: number;
    confidence: "High" | "Medium" | "Low";
    factors: string[];
    gaps: string[];
  };
  activitySignals?: {
    category: string;
    strength: "Strong" | "Moderate" | "Weak";
    title: string;
    relevance: string;
  }[];
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  location: string;
  deadline: string;
  requirements: string[];
  overview: string;
  rankingContext?: string;
  acceptanceInfo?: string;
  undergraduatePrograms: string[];
  majors: string[];
  internationalRequirements: string[];
  kazakhstanRequirements: string[];
  satRequirements?: string;
  languageRequirements: string;
  gpaRequirements?: string;
  curriculumRequirements: string[];
  subjectRequirements: string[];
  applicationPlatform?: string;
  scholarshipAvailability: boolean;
  tuition?: string;
  financialAid?: string;
  officialAdmissionsUrl: string;
  lastVerifiedAt: string;
  analysis?: UniversityAnalysis;
}

export interface UniversityRecommendation {
  university_id: string;
  name: string;
  country: string;
  city: string;
  program: string;
  match_score: number;
  category: string;
  reasons: string[];
  strengths: string[];
  gaps: string[];
  next_actions: string[];
}

export interface PortfolioEntry {
  id: string;
  section:
    | "education"
    | "achievements"
    | "projects"
    | "competitions"
    | "volunteering"
    | "leadership"
    | "certificates"
    | "skills"
    | "interests";
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  issuer?: string;
}

export interface PortfolioExport {
  name: string;
  profileSummary: string;
  education: PortfolioEntry[];
  academicAchievements: PortfolioEntry[];
  testScores: PortfolioEntry[];
  olympiads: PortfolioEntry[];
  competitions: PortfolioEntry[];
  projects: PortfolioEntry[];
  research: PortfolioEntry[];
  leadership: PortfolioEntry[];
  volunteering: PortfolioEntry[];
  internships: PortfolioEntry[];
  awards: PortfolioEntry[];
  certifications: PortfolioEntry[];
  skills: PortfolioEntry[];
  languages: PortfolioEntry[];
  links: { label: string; url: string }[];
  contact?: string;
  exportedAt: string;
}

export interface MentorMessage {
  id: string;
  role: "student" | "mentor";
  content: string;
  actions?: string[];
}

export interface AcademicInfo {
  school?: string;
  curriculum?: string;
  gpa?: number;
  sat?: number;
  act?: number;
  ielts?: number;
  toefl?: number;
  intendedMajor?: string;
  graduationYear?: string;
  educationLevel?: string;
  country?: string;
  countryOther?: string;
  city?: string;
  gpaValue?: number | null;
  gpaScale?: string | null;
  gpaScaleOther?: string;
  gpaUnknown?: boolean;
  englishTest?: string;
  englishStatus?: string;
  englishScore?: number | null;
  satStatus?: string;
  satScore?: number | null;
  actStatus?: string;
  actScore?: number | null;
  primaryField?: string;
  secondaryInterests?: string[];
  priorities?: string[];
  preferredCountries?: string[];
  countriesUndecided?: boolean;
  budgetMax?: number | null;
  budgetCurrency?: string;
  budgetUndecided?: boolean;
  scholarshipPreference?: string;
  studyLanguage?: string;
  studyLanguageOther?: string;
  targetYear?: string;
  targetIntake?: string;
  constraints?: string[];
  notes?: string;
  onboardingCompleted?: boolean;
}

export interface Student {
  name: string;
  grade: string;
  location: string;
  bio: string;
  interests: string[];
  goals: string[];
  portfolioStrength?: number;
  avatarInitials: string;
  academicInfo?: AcademicInfo;
  onboardingCompleted?: boolean;
}

export type WhatIfField = "ielts" | "sat" | "budget" | "preferred_country" | "intended_major";

export interface WhatIfRequest {
  field: WhatIfField;
  value: string | number | string[];
}

export interface ScenarioProfile {
  field: string;
  before: string | number | string[] | null;
  after: string | number | string[];
}

export interface UniversityMatchDiff {
  university_id: string;
  name: string;
  country: string;
  before_score: number | null;
  after_score: number | null;
  score_change: number;
  before_category: string | null;
  after_category: string | null;
  category_changed: boolean;
}

export interface RecommendationsDiff {
  before_top_matches: UniversityMatchDiff[];
  after_top_matches: UniversityMatchDiff[];
  added: UniversityMatchDiff[];
  removed: UniversityMatchDiff[];
  changed_scores: UniversityMatchDiff[];
}

export interface RoadmapTaskDiff {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}

export interface RoadmapDiff {
  added_tasks: RoadmapTaskDiff[];
  removed_tasks: RoadmapTaskDiff[];
  unchanged_count: number;
}

export interface NextActionDiff {
  before: RoadmapTaskDiff | null;
  after: RoadmapTaskDiff | null;
  changed: boolean;
}

export interface WhatIfResponse {
  scenario: ScenarioProfile;
  recommendations: RecommendationsDiff;
  roadmap: RoadmapDiff;
  next_action: NextActionDiff;
  summary: string;
}

export type TaskCategory = "ACADEMICS" | "LANGUAGE" | "UNIVERSITY_RESEARCH" | "APPLICATION" | "ESSAYS" | "DOCUMENTS" | "EXTRACURRICULARS";

export type TaskPriority = "high" | "medium" | "low";

export type TaskStatus = "pending" | "in_progress" | "completed";

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline?: string | null;
  target_date?: string | null;
  reason: string;
  related_university?: string | null;
}

export interface NextBestAction {
  task_id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  deadline?: string | null;
  target_date?: string | null;
  reason: string;
  completed: boolean;
}

export interface RoadmapResponse {
  tasks: RoadmapTask[];
  generated_at: string;
  profile_completeness: number;
  top_matches_count: number;
  next_best_action?: NextBestAction | null;
}
