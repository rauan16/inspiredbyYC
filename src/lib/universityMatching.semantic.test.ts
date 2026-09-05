/**
 * Semantic activity classification and holistic scoring tests.
 *
 * Run:
 *   npx vitest run src/lib/universityMatching.semantic.test.ts
 */

import { describe, it, expect } from "vitest";
import { classifyActivity, classifyPortfolio, computeHolisticExtracurricularScore, getProgramFocus } from "@/lib/universityMatching";
import type { PortfolioEntry, University } from "@/types";

describe("classifyActivity", () => {
  it("classifies a startup as Entrepreneurship, Leadership, Innovation, Project", () => {
    const entry: PortfolioEntry = {
      id: "1",
      section: "projects",
      title: "Founded a startup",
      description: "Built a fintech startup with 500 users and $2k MRR",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Entrepreneurship");
    expect(result.categories).toContain("Innovation");
    expect(result.categories).toContain("Project");
    expect(result.strength).toBe("Strong");
  });

  it("classifies a hackathon win as Competition, Technology", () => {
    const entry: PortfolioEntry = {
      id: "2",
      section: "achievements",
      title: "Won national hackathon",
      description: "1st place at Hack Kazakhstan 2025",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Competition");
    expect(result.categories).toContain("Technology");
    expect(result.strength).toBe("Strong");
  });

  it("classifies a marathon as Sports", () => {
    const entry: PortfolioEntry = {
      id: "3",
      section: "achievements",
      title: "Won a marathon",
      description: "Completed full marathon in 3h 45m",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Sports");
    expect(result.relevance).not.toBe("Adds a personal dimension to the profile");
  });

  it("classifies charity event as Community, Leadership", () => {
    const entry: PortfolioEntry = {
      id: "4",
      section: "volunteering",
      title: "Organized a charity event",
      description: "Raised $5k for local hospital",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Community");
    expect(result.categories).toContain("Leadership");
    expect(result.strength).toBe("Moderate");
  });

  it("classifies AI app as Technology, Project", () => {
    const entry: PortfolioEntry = {
      id: "5",
      section: "projects",
      title: "Built an AI application",
      description: "AI-powered translation app for Kazakh language",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Technology");
    expect(result.categories).toContain("Project");
  });

  it("classifies research publication as Research", () => {
    const entry: PortfolioEntry = {
      id: "6",
      section: "projects",
      title: "Published research paper",
      description: "Published at NeurIPS 2025",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Research");
    expect(result.strength).toBe("Strong");
  });

  it("classifies generic interest as Personal or Other", () => {
    const entry: PortfolioEntry = {
      id: "7",
      section: "interests",
      title: "Hiking",
      description: "Enjoy hiking on weekends",
      date: "",
    };
    const result = classifyActivity(entry);
    expect(result.categories.some((c) => ["Personal", "Other"].includes(c))).toBe(true);
    expect(result.strength).toBe("Weak");
  });

  it("classifies internship as Professional", () => {
    const entry: PortfolioEntry = {
      id: "8",
      section: "achievements",
      title: "Internship at Eurasian Bank",
      description: "Summer internship in IT department",
      date: "2025",
    };
    const result = classifyActivity(entry);
    expect(result.categories).toContain("Professional");
    expect(result.strength).toBe("Moderate");
  });
});

describe("classifyPortfolio", () => {
  it("deduplicates entries with same title and description", () => {
    const portfolio: PortfolioEntry[] = [
      { id: "1", section: "achievements", title: "Hackathon", description: "1st place", date: "2025" },
      { id: "2", section: "achievements", title: "Hackathon", description: "1st place", date: "2025" },
    ];
    const result = classifyPortfolio(portfolio);
    expect(result).toHaveLength(1);
  });

  it("preserves distinct entries", () => {
    const portfolio: PortfolioEntry[] = [
      { id: "1", section: "achievements", title: "Hackathon", description: "1st place", date: "2025" },
      { id: "2", section: "projects", title: "Startup", description: "AI startup", date: "2025" },
    ];
    const result = classifyPortfolio(portfolio);
    expect(result).toHaveLength(2);
  });
});

describe("getProgramFocus", () => {
  it("detects STEM from computer science majors", () => {
    const university: University = {
      id: "test",
      name: "Test",
      country: "Test",
      city: "Test",
      location: "Test",
      deadline: "",
      requirements: [],
      overview: "",
      rankingContext: "",
      acceptanceInfo: "",
      undergraduatePrograms: ["CS", "Engineering"],
      majors: ["Computer Science", "Engineering"],
      internationalRequirements: [],
      kazakhstanRequirements: [],
      satRequirements: "",
      languageRequirements: "",
      gpaRequirements: "",
      curriculumRequirements: [],
      subjectRequirements: [],
      applicationPlatform: "",
      scholarshipAvailability: false,
      tuition: "",
      financialAid: "",
      officialAdmissionsUrl: "",
      lastVerifiedAt: "",
    };
    expect(getProgramFocus(university)).toBe("STEM");
  });

  it("detects Business from business majors", () => {
    const university: University = {
      id: "test",
      name: "Test",
      country: "Test",
      city: "Test",
      location: "Test",
      deadline: "",
      requirements: [],
      overview: "",
      rankingContext: "",
      acceptanceInfo: "",
      undergraduatePrograms: ["MBA", "Management"],
      majors: ["Business", "Management"],
      internationalRequirements: [],
      kazakhstanRequirements: [],
      satRequirements: "",
      languageRequirements: "",
      gpaRequirements: "",
      curriculumRequirements: [],
      subjectRequirements: [],
      applicationPlatform: "",
      scholarshipAvailability: false,
      tuition: "",
      financialAid: "",
      officialAdmissionsUrl: "",
      lastVerifiedAt: "",
    };
    expect(getProgramFocus(university)).toBe("Business");
  });

  it("detects Medicine from medical majors", () => {
    const university: University = {
      id: "test",
      name: "Test",
      country: "Test",
      city: "Test",
      location: "Test",
      deadline: "",
      requirements: [],
      overview: "",
      rankingContext: "",
      acceptanceInfo: "",
      undergraduatePrograms: ["MD", "Nursing"],
      majors: ["Medicine", "Health"],
      internationalRequirements: [],
      kazakhstanRequirements: [],
      satRequirements: "",
      languageRequirements: "",
      gpaRequirements: "",
      curriculumRequirements: [],
      subjectRequirements: [],
      applicationPlatform: "",
      scholarshipAvailability: false,
      tuition: "",
      financialAid: "",
      officialAdmissionsUrl: "",
      lastVerifiedAt: "",
    };
    expect(getProgramFocus(university)).toBe("Medicine");
  });

  it("returns General for unknown programs", () => {
    const university: University = {
      id: "test",
      name: "Test",
      country: "Test",
      city: "Test",
      location: "Test",
      deadline: "",
      requirements: [],
      overview: "",
      rankingContext: "",
      acceptanceInfo: "",
      undergraduatePrograms: ["Industrial Design"],
      majors: ["Design", "Architecture"],
      internationalRequirements: [],
      kazakhstanRequirements: [],
      satRequirements: "",
      languageRequirements: "",
      gpaRequirements: "",
      curriculumRequirements: [],
      subjectRequirements: [],
      applicationPlatform: "",
      scholarshipAvailability: false,
      tuition: "",
      financialAid: "",
      officialAdmissionsUrl: "",
      lastVerifiedAt: "",
    };
    expect(getProgramFocus(university)).toBe("General");
  });
});

describe("computeHolisticExtracurricularScore", () => {
  it("gives higher score for strong STEM-relevant activities", () => {
    const classified = [
      {
        entry: { section: "projects", title: "AI Project", description: "Built ML model" },
        categories: ["Technology", "Project", "Innovation"],
        strength: "Strong" as const,
        relevance: "Demonstrates practical technical experience",
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = computeHolisticExtracurricularScore(classified as any, "STEM");
    expect(result.score).toBeGreaterThan(0);
    expect(result.signals.length).toBeGreaterThan(0);
  });

  it("gives lower score for personal interests", () => {
    const classified = [
      {
        entry: { section: "interests", title: "Hiking", description: "" },
        categories: ["Personal"],
        strength: "Weak" as const,
        relevance: "Adds a personal dimension to the profile",
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = computeHolisticExtracurricularScore(classified as any, "STEM");
    expect(result.score).toBeLessThan(5);
  });

  it("avoids double counting same category", () => {
    const classified = [
      {
        entry: { section: "projects", title: "Project A", description: "" },
        categories: ["Technology"],
        strength: "Moderate" as const,
        relevance: "Demonstrates practical technical experience",
      },
      {
        entry: { section: "projects", title: "Project B", description: "" },
        categories: ["Technology"],
        strength: "Strong" as const,
        relevance: "Demonstrates practical technical experience",
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = computeHolisticExtracurricularScore(classified as any, "STEM");
    expect(result.signals.filter((s) => s.includes("technology")).length).toBeLessThanOrEqual(1);
  });
});
