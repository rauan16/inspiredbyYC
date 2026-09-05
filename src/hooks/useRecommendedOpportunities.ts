import { useMemo } from "react";
import { Opportunity } from "@/types";
import { getAccount, StoredAccount } from "@/lib/account";

export interface RecommendationScore {
  opportunity: Opportunity;
  score: number;
  reasons: string[];
}

const CATEGORY_ALIASES: Record<string, string[]> = {
  olympiad: ["олимпиада", "math", "physics", "informatics", "history", "biology", "chemistry", "diploma"],
  hackathon: ["хакатон", "hackathon", "programming", "coding", "ai", "ml", "data", "software"],
  volunteering: ["волонтёрство", "volunteering", "community", "social", "service"],
  internship: ["стажировка", "internship", "company", "office", "professional", "experience"],
  scholarship: ["стипендия", "scholarship", "grant", "funding"],
  forum: ["форум", "forum", "discussion", "youth", "model"],
  conference: ["конференция", "conference", "research", "science", "paper"],
  program: ["программа", "program", "exchange", "abroad", "summer", "camp"],
  research: ["исследование", "research", "lab", "science", "published"],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-zа-яё0-9\s]/g, "").trim();
}

function scoreOpportunity(opportunity: Opportunity, account: StoredAccount): RecommendationScore {
  const reasons: string[] = [];
  let score = 0;

  const interests = (account.interests || []).map(normalizeText);
  const goals = (account.goals || []).map(normalizeText);
  const intendedMajor = normalizeText(account.academicInfo?.intendedMajor || "");
  const portfolioEntries = account.portfolioEntries || [];
  const userTexts = [
    ...interests,
    ...goals,
    intendedMajor,
    normalizeText(account.bio || ""),
    ...portfolioEntries.map((e) => normalizeText(`${e.title} ${e.description || ""} ${e.section}`)),
  ].filter(Boolean);

  const opportunityTags = (opportunity.tags || []).map(normalizeText);
  const opportunitySubjects = (opportunity.relevantSubjects || []).map(normalizeText);
  const opportunityUserTypes = (opportunity.targetUserTypes || []).map(normalizeText);
  const opportunityCategory = normalizeText(opportunity.category);

  // Interest/tag matching
  for (const interest of interests) {
    for (const tag of opportunityTags) {
      if (interest && tag && (tag.includes(interest) || interest.includes(tag))) {
        score += 2;
        reasons.push(`Matches your interest: ${interest}`);
        break;
      }
    }
  }

  // Major/subject matching
  if (intendedMajor) {
    for (const subject of opportunitySubjects) {
      if (subject && (subject.includes(intendedMajor) || intendedMajor.includes(subject))) {
        score += 3;
        reasons.push(`Relevant for ${account.academicInfo?.intendedMajor || "your major"}`);
        break;
      }
    }
  }

  // Category aliases vs portfolio/interest signals
  const aliases = CATEGORY_ALIASES[opportunity.category] || [];
  for (const alias of aliases) {
    for (const userText of userTexts) {
      if (userText.includes(alias) || alias.includes(userText)) {
        score += 1;
        reasons.push(`Matches your profile signal: ${alias}`);
        break;
      }
    }
  }

  // Existing hardcoded recommendation as a small prior
  if (opportunity.recommended) {
    score += 1;
  }

  const uniqueReasons = Array.from(new Set(reasons));

  return { opportunity, score, reasons: uniqueReasons };
}

export function useRecommendedOpportunities(opportunities: Opportunity[], limit = 6) {
  const account = getAccount();

  const recommendations = useMemo(() => {
    if (!opportunities || opportunities.length === 0) {
      return [];
    }

    const scored = opportunities
      .map((opp: Opportunity) => scoreOpportunity(opp, account))
      .filter((r: RecommendationScore) => r.score > 0)
      .sort((a: RecommendationScore, b: RecommendationScore) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }, [opportunities, account, limit]);

  return { recommendations, account };
}
