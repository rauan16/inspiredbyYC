export type OpportunityCategory =
  | "olympiad"
  | "hackathon"
  | "volunteering"
  | "internship"
  | "scholarship"
  | "forum"
  | "conference"
  | "program"
  | "research";

export type OpportunityColor = "red" | "yellow" | "blue" | "violet";

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  categoryLabel: string;
  deadline: string; // ISO date
  location: string;
  format: "online" | "offline" | "hybrid";
  eligibility: string;
  description: string;
  requirements: string[];
  timeline: { label: string; date: string }[];
  color: OpportunityColor;
  saved?: boolean;
  recommended?: boolean;
  website: string;
}

export interface UniversityAnalysis {
  profileMatch: number; // 0-100
  academicFit: "Слабое" | "Среднее" | "Хорошее" | "Сильное";
  applicationStrength: "Начальный уровень" | "Развивается" | "Конкурентоспособно" | "Отличный уровень";
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface University {
  id: string;
  name: string;
  country: string;
  location: string;
  deadline: string;
  requirements: string[];
  overview: string;
  analysis: UniversityAnalysis;
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
}

export interface MentorMessage {
  id: string;
  role: "student" | "mentor";
  content: string;
  actions?: string[];
}

export interface Student {
  name: string;
  grade: string;
  location: string;
  bio: string;
  interests: string[];
  goals: string[];
  portfolioStrength: number;
  avatarInitials: string;
}
