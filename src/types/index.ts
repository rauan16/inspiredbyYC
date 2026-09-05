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
  gpaScale?: "4.0" | "5.0" | "100" | "percentage";
  sat?: number;
  act?: number;
  ielts?: number;
  toefl?: number;
  intendedMajor?: string;
  graduationYear?: string;
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
}
