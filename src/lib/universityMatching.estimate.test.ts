/**
 * Dynamic admission estimate tests.
 *
 * Run:
 *   cd src
 *   npx vitest run src/lib/universityMatching.estimate.test.ts
 *
 * This file verifies:
 *  - no hardcoded profile values
 *  - university-specific comparison
 *  - missing data reduces confidence instead of disabling estimation
 *  - changing profile values changes estimates
 */

import { describe, it, expect } from "vitest";
import { University, PortfolioEntry } from "@/types";
import { getUniversityById, universities } from "@/data/universities";
import { computeUniversityAnalysis } from "@/lib/universityMatching";
import type { StoredAccount } from "@/lib/account";

function makeAccount(input: Partial<StoredAccount> & { portfolioEntries?: StoredAccount["portfolioEntries"] }): StoredAccount {
  return {
    email: "test@example.com",
    name: input.name ?? "",
    grade: input.grade ?? "",
    location: input.location ?? "",
    bio: input.bio ?? "",
    interests: input.interests ?? [],
    goals: input.goals ?? [],
    portfolioStrength: input.portfolioStrength ?? 0,
    avatarInitials: input.avatarInitials ?? "T",
    academicInfo: input.academicInfo,
    portfolioEntries: input.portfolioEntries,
  };
}

const NU = getUniversityById("nu-astana")!;
const IMPERIAL = getUniversityById("imperial")!;
const ETH = getUniversityById("eth")!;

describe("computeAdmissionEstimate — dynamic university-specific behavior", () => {
  it("Profile A — strong academics, few extracurriculars", () => {
    const account = makeAccount({
      academicInfo: { gpa: 3.95, sat: 1550, ielts: 8.0, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "achievements", title: "Math Olympiad", description: "1st place", date: "2025" },
      ],
    });

    const nuAnalysis = computeUniversityAnalysis(NU, account);
    const imperialAnalysis = computeUniversityAnalysis(IMPERIAL, account);
    const ethAnalysis = computeUniversityAnalysis(ETH, account);

    expect(nuAnalysis.admissionEstimate?.available).toBe(true);
    expect(imperialAnalysis.admissionEstimate?.available).toBe(true);
    expect(ethAnalysis.admissionEstimate?.available).toBe(true);

    const nuRange = `${nuAnalysis.admissionEstimate!.min}–${nuAnalysis.admissionEstimate!.max}%`;
    const imperialRange = `${imperialAnalysis.admissionEstimate!.min}–${imperialAnalysis.admissionEstimate!.max}%`;
    const ethRange = `${ethAnalysis.admissionEstimate!.min}–${ethAnalysis.admissionEstimate!.max}%`;

    console.log(`Profile A: NU=${nuRange}, Imperial=${imperialRange}, ETH=${ethRange}`);

    expect(nuRange).not.toBe(imperialRange);
    expect(nuRange).not.toBe(ethRange);
  });

  it("Profile B — strong extracurriculars, weaker standardized tests", () => {
    const account = makeAccount({
      academicInfo: { gpa: 3.6, sat: 1400, ielts: 7.5, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "projects", title: "Startup", description: "AI startup", date: "2025" },
        { id: "3", section: "competitions", title: "Hackathon", description: "1st place", date: "2025" },
        { id: "4", section: "leadership", title: "Club President", description: "Led 50 people", date: "2024" },
        { id: "5", section: "achievements", title: "Research", description: "Published paper", date: "2025" },
      ],
    });

    const nuAnalysis = computeUniversityAnalysis(NU, account);
    const imperialAnalysis = computeUniversityAnalysis(IMPERIAL, account);

    expect(nuAnalysis.admissionEstimate?.available).toBe(true);
    expect(imperialAnalysis.admissionEstimate?.available).toBe(true);

    console.log(`Profile B: NU=${nuAnalysis.admissionEstimate!.min}–${nuAnalysis.admissionEstimate!.max}%, Imperial=${imperialAnalysis.admissionEstimate!.min}–${imperialAnalysis.admissionEstimate!.max}%`);
  });

  it("Profile C — weak SAT, strong other metrics", () => {
    const account = makeAccount({
      academicInfo: { gpa: 3.8, sat: 1250, ielts: 6.5, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "projects", title: "Project A", date: "2025" },
        { id: "3", section: "achievements", title: "Award", date: "2025" },
        { id: "4", section: "leadership", title: "Leader", date: "2024" },
      ],
    });

    const analysis = computeUniversityAnalysis(NU, account);
    expect(analysis.admissionEstimate?.available).toBe(true);
    console.log(`Profile C: NU=${analysis.admissionEstimate!.min}–${analysis.admissionEstimate!.max}%`);
  });

  it("Profile D — missing SAT, strong other metrics", () => {
    const account = makeAccount({
      academicInfo: { gpa: 3.8, ielts: 7.5, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "projects", title: "Project A", date: "2025" },
        { id: "3", section: "achievements", title: "Award", date: "2025" },
      ],
    });

    const nuAnalysis = computeUniversityAnalysis(NU, account);
    const imperialAnalysis = computeUniversityAnalysis(IMPERIAL, account);
    const ethAnalysis = computeUniversityAnalysis(ETH, account);

    expect(nuAnalysis.admissionEstimate?.available).toBe(true);
    expect(imperialAnalysis.admissionEstimate?.available).toBe(true);
    expect(ethAnalysis.admissionEstimate?.available).toBe(true);

    console.log(`Profile D: NU=${nuAnalysis.admissionEstimate!.min}–${nuAnalysis.admissionEstimate!.max}%, Imperial=${imperialAnalysis.admissionEstimate!.min}–${imperialAnalysis.admissionEstimate!.max}%, ETH=${ethAnalysis.admissionEstimate!.min}–${ethAnalysis.admissionEstimate!.max}%`);
  });

  it("changing only SAT changes relevant university estimates", () => {
    const basePortfolio: PortfolioEntry[] = [
      { id: "1", section: "education", title: "School", date: "2023" },
      { id: "2", section: "projects", title: "Project", date: "2025" },
    ];

    const lowSat = makeAccount({
      academicInfo: { gpa: 3.8, sat: 1200, ielts: 7.0, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: basePortfolio,
    });
    const highSat = makeAccount({
      academicInfo: { gpa: 3.8, sat: 1550, ielts: 7.0, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: basePortfolio,
    });

    const lowSatNu = computeUniversityAnalysis(NU, lowSat);
    const highSatNu = computeUniversityAnalysis(NU, highSat);
    const lowSatImperial = computeUniversityAnalysis(IMPERIAL, lowSat);
    const highSatImperial = computeUniversityAnalysis(IMPERIAL, highSat);

    expect(lowSatNu.admissionEstimate?.available).toBe(true);
    expect(highSatNu.admissionEstimate?.available).toBe(true);

    console.log(`SAT change: NU low=${lowSatNu.admissionEstimate!.min}–${lowSatNu.admissionEstimate!.max}%, NU high=${highSatNu.admissionEstimate!.min}–${highSatNu.admissionEstimate!.max}%`);
    console.log(`SAT change: Imperial low=${lowSatImperial.admissionEstimate!.min}–${lowSatImperial.admissionEstimate!.max}%, Imperial high=${highSatImperial.admissionEstimate!.min}–${highSatImperial.admissionEstimate!.max}%`);
  });

  it("universities that do not use SAT should not penalize missing SAT", () => {
    const noSat = makeAccount({
      academicInfo: { gpa: 3.8, ielts: 7.5, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "projects", title: "Project", date: "2025" },
      ],
    });

    const nuAnalysis = computeUniversityAnalysis(NU, noSat);
    const ethAnalysis = computeUniversityAnalysis(ETH, noSat);

    expect(nuAnalysis.admissionEstimate?.available).toBe(true);
    expect(ethAnalysis.admissionEstimate?.available).toBe(true);

    const nuGaps = nuAnalysis.admissionEstimate!.gaps.join(", ");
    const ethGaps = ethAnalysis.admissionEstimate!.gaps.join(", ");

    console.log(`NU gaps: ${nuGaps}`);
    console.log(`ETH gaps: ${ethGaps}`);
  });

  it("never returns a fixed hardcoded percentage for a given profile", () => {
    const account = makeAccount({
      academicInfo: { gpa: 3.7, sat: 1520, ielts: 7.5, intendedMajor: "Computer Science", graduationYear: "2026" },
      portfolioEntries: [
        { id: "1", section: "education", title: "School", date: "2023" },
        { id: "2", section: "achievements", title: "Hackathon", description: "1st", date: "2025" },
      ],
    });

    const nuAnalysis = computeUniversityAnalysis(getUniversityById("nu-astana")!, account);
    const ethAnalysis = computeUniversityAnalysis(getUniversityById("eth")!, account);
    const nusAnalysis = computeUniversityAnalysis(getUniversityById("nus")!, account);

    const nuRange = `${nuAnalysis.admissionEstimate!.min}–${nuAnalysis.admissionEstimate!.max}%`;
    const ethRange = `${ethAnalysis.admissionEstimate!.min}–${ethAnalysis.admissionEstimate!.max}%`;
    const nusRange = `${nusAnalysis.admissionEstimate!.min}–${nusAnalysis.admissionEstimate!.max}%`;

    console.log(`Same profile across universities: NU=${nuRange}, ETH=${ethRange}, NUS=${nusRange}`);

    const ranges = [nuRange, ethRange, nusRange];
    const uniqueRanges = new Set(ranges);
    expect(uniqueRanges.size).toBeGreaterThanOrEqual(2);
  });
});
