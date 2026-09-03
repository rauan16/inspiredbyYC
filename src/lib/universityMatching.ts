import { AcademicInfo, University, UniversityAnalysis } from "@/types";
import { StoredAccount } from "@/lib/account";

type FitLevel = "Strong" | "Good" | "Moderate" | "Weak" | "Insufficient data";
type OverallFitLevel = "Strong Fit" | "Moderate Fit" | "Weak Fit" | "Not reliably estimable";
type ConfidenceLevel = "High" | "Medium" | "Low";

interface ProfileSnapshot {
  student: {
    name: string;
    grade: string;
    location: string;
    bio: string;
    interests: string[];
    goals: string[];
  };
  academicInfo?: AcademicInfo;
  portfolio: {
    section: string;
    title: string;
    subtitle?: string;
    date?: string;
    description?: string;
    link?: string;
    issuer?: string;
  }[];
}

function extractProfile(account: StoredAccount): ProfileSnapshot {
  return {
    student: {
      name: account.name || "",
      grade: account.grade || "",
      location: account.location || "",
      bio: account.bio || "",
      interests: account.interests || [],
      goals: account.goals || [],
    },
    academicInfo: account.academicInfo,
    portfolio: (account.portfolioEntries || []).map((e) => ({
      section: e.section,
      title: e.title || "",
      subtitle: e.subtitle,
      date: e.date,
      description: e.description,
      link: e.link,
      issuer: e.issuer,
    })),
  };
}

function portfolioEntriesBySection(profile: ProfileSnapshot): Record<string, ProfileSnapshot["portfolio"]> {
  const sections: Record<string, ProfileSnapshot["portfolio"]> = {};
  for (const entry of profile.portfolio) {
    if (!sections[entry.section]) sections[entry.section] = [];
    sections[entry.section].push(entry);
  }
  return sections;
}

function parseTestScoreFromPortfolio(sections: Record<string, ProfileSnapshot["portfolio"]>): {
  sat?: number;
  act?: number;
  ielts?: number;
  toefl?: number;
  gpa?: number;
} {
  const certEntries = sections["certificates"] || [];
  const achEntries = sections["achievements"] || [];
  const all = [...certEntries, ...achEntries];
  const result: { sat?: number; act?: number; ielts?: number; toefl?: number; gpa?: number } = {};

  for (const entry of all) {
    const text = (entry.title + " " + (entry.description || "") + " " + (entry.issuer || "")).toLowerCase();

    if (!result.sat && (text.includes("sat") || text.includes("sat "))) {
      const match = text.match(/sat\D*(\d{3,4})/);
      if (match) result.sat = parseInt(match[1]);
    }
    if (!result.act && text.includes("act")) {
      const match = text.match(/act\D*(\d{1,2})/);
      if (match) result.act = parseInt(match[1]);
    }
    if (!result.ielts && text.includes("ielts")) {
      const match = text.match(/ielts\D*(\d\.\d)/);
      if (match) result.ielts = parseFloat(match[1]);
    }
    if (!result.toefl && text.includes("toefl")) {
      const match = text.match(/toefl\D*(\d{2,3})/);
      if (match) result.toefl = parseInt(match[1]);
    }
    if (!result.gpa && (text.includes("gpa") || text.includes("средний"))) {
      const match = text.match(/(?:gpa|средний)\D*(\d\.\d+)/i);
      if (match) result.gpa = parseFloat(match[1]);
    }
  }

  return result;
}

function analyzeAcademicFit(profile: ProfileSnapshot, sections: Record<string, ProfileSnapshot["portfolio"]>): FitLevel {
  const education = sections["education"] || [];
  const achievements = sections["achievements"] || [];
  const olympiadEntries = achievements.filter((a) =>
    /олимпиад|olympiad|тур|round|диплом|diploma/i.test(a.title + " " + (a.description || ""))
  );

  if (olympiadEntries.length > 0) return "Strong";
  if ((sections["certificates"] || []).length > 0) return "Good";
  if (education.length > 0) return "Moderate";
  if ((sections["achievements"] || []).length > 0) return "Moderate";
  return "Insufficient data";
}

function analyzeTestingFit(
  profile: ProfileSnapshot,
  sections: Record<string, ProfileSnapshot["portfolio"]>,
  university: University,
  parsedScores: ReturnType<typeof parseTestScoreFromPortfolio> | null,
): { level: FitLevel; missing: string[] } {
  const parsed = parsedScores || {};

  const sat = profile.academicInfo?.sat ?? parsed.sat;
  const act = profile.academicInfo?.act ?? parsed.act;
  const ielts = profile.academicInfo?.ielts ?? profile.academicInfo?.toefl ?? parsed.ielts ?? parsed.toefl;
  const gpa = profile.academicInfo?.gpa ?? parsed.gpa;

  const missing: string[] = [];

  const hasLangReq =
    university.languageRequirements &&
    (university.languageRequirements.includes("Required") ||
      university.languageRequirements.includes("required") ||
      /ielts|toefl/i.test(university.languageRequirements));
  const hasSatReq =
    university.satRequirements &&
    !university.satRequirements.includes("Optional") &&
    !university.satRequirements.includes("не используется") &&
    !university.satRequirements.includes("не основной") &&
    !university.satRequirements.includes("не указана") &&
    !university.satRequirements.includes("Not specified");

  const satMet = sat !== undefined || act !== undefined;
  const ieltsMet = ielts !== undefined;
  const gpaMet = gpa !== undefined;

  if (hasSatReq && !satMet) missing.push("SAT/ACT score");
  if (hasLangReq && !ieltsMet) missing.push("IELTS/TOEFL score");
  if (university.gpaRequirements && !gpaMet) missing.push("GPA");

  const testCount = [satMet, ieltsMet, gpaMet].filter(Boolean).length;

  if (missing.length > 0) return { level: "Insufficient data", missing };
  if (testCount >= 3) return { level: "Strong", missing };
  if (testCount >= 2) return { level: "Moderate", missing };
  return { level: "Insufficient data", missing };
}

function analyzeMajorFit(profile: ProfileSnapshot, university: University): FitLevel {
  const interestSet = new Set(profile.student.interests.map((i) => i.toLowerCase()));
  const majorSet = new Set(
    (university.majors || []).map((m) => m.toLowerCase())
  );

  let matches = 0;
  for (const interest of interestSet) {
    for (const major of majorSet) {
      if (major.includes(interest) || interest.includes(major)) {
        matches++;
        break;
      }
    }
  }

  if (profile.academicInfo?.intendedMajor) {
    const intendedMajor = profile.academicInfo.intendedMajor.toLowerCase();
    if (majorSet.has(intendedMajor) || [...majorSet].some((m) => m.includes(intendedMajor))) {
      matches++;
    }
  }

  if (matches >= 2) return "Strong";
  if (matches >= 1) return "Moderate";
  if (interestSet.size === 0 && !profile.academicInfo?.intendedMajor) return "Insufficient data";
  return "Weak";
}

function analyzeExtracurricularFit(sections: Record<string, ProfileSnapshot["portfolio"]>): FitLevel {
  const activities = [
    sections["projects"] || [],
    sections["volunteering"] || [],
    sections["competitions"] || [],
    sections["interests"] || [],
  ].flat();

  if (activities.length >= 3) return "Strong";
  if (activities.length >= 1) return "Moderate";
  return "Insufficient data";
}

function analyzeResearchFit(sections: Record<string, ProfileSnapshot["portfolio"]>): FitLevel {
  const researchEntries = sections["projects"] || [];
  const matching = researchEntries.filter(
    (p) =>
      /research|исслед|research|lab|лаборатор/i.test(p.title + " " + (p.description || ""))
  );

  if (matching.length >= 2) return "Strong";
  if (matching.length >= 1) return "Moderate";
  return "Insufficient data";
}

function analyzeLeadershipFit(sections: Record<string, ProfileSnapshot["portfolio"]>): FitLevel {
  const leadershipEntries = sections["leadership"] || [];

  if (leadershipEntries.length >= 2) return "Strong";
  if (leadershipEntries.length >= 1) return "Moderate";
  return "Insufficient data";
}

function analyzeRequirementsFit(
  profile: ProfileSnapshot,
  sections: Record<string, ProfileSnapshot["portfolio"]>,
  university: University,
  parsedScores: ReturnType<typeof parseTestScoreFromPortfolio> | null,
): { level: FitLevel; missing: string[]; matched: string[] } {
  const missing: string[] = [];
  const matched: string[] = [];

  const parsed = parsedScores || {};

  const hasEducation = (sections["education"] || []).length > 0 || !!profile.academicInfo?.school;
  const hasSat = profile.academicInfo?.sat !== undefined || parsed.sat !== undefined || profile.academicInfo?.act !== undefined || parsed.act !== undefined;
  const hasIelts = profile.academicInfo?.ielts !== undefined || profile.academicInfo?.toefl !== undefined || parsed.ielts !== undefined || parsed.toefl !== undefined;
  const hasGpa = profile.academicInfo?.gpa !== undefined || parsed.gpa !== undefined;

  if (university.satRequirements && university.satRequirements.includes("Optional")) {
    matched.push("SAT/ACT (optional, not required)");
  } else if (university.satRequirements && hasSat) {
    matched.push("SAT/ACT");
  } else if (university.satRequirements && !hasSat && !university.satRequirements.includes("не используется") && !university.satRequirements.includes("Not specified")) {
    missing.push("SAT/ACT score");
  }

  if (university.gpaRequirements && hasGpa) {
    matched.push("GPA");
  } else if (university.gpaRequirements && !hasGpa) {
    missing.push("GPA");
  }

  if (university.languageRequirements && hasIelts) {
    matched.push("English proficiency (IELTS/TOEFL)");
  } else if (university.languageRequirements && !hasIelts) {
    missing.push("English proficiency (IELTS/TOEFL)");
  }

  if (hasEducation) matched.push("Educational background");
  else missing.push("Educational background");

  if ((sections["achievements"] || []).length > 0) matched.push("Academic achievements");

  const level = missing.length === 0 ? "Strong" : missing.length <= 2 ? "Moderate" : missing.length === 0 ? "Strong" : "Insufficient data";
  return { level, missing, matched };
}

function computeStrengths(
  sections: Record<string, ProfileSnapshot["portfolio"]>,
  profile: ProfileSnapshot,
  university: University
): string[] {
  const strengths: string[] = [];

  if ((sections["education"] || []).length > 0) {
    strengths.push("Есть данные об образовании и школе");
  }

  const olympiads = (sections["achievements"] || []).filter((a) =>
    /олимпиад|olympiad/i.test(a.title + " " + (a.description || ""))
  );
  if (olympiads.length > 0) {
    strengths.push(`Участие в ${olympiads.length} олимпиаде(ах)`);
  }

  if ((sections["projects"] || []).length > 0) {
    strengths.push(`Реализовано ${(sections["projects"] || []).length} проект(а)`);
  }

  if ((sections["leadership"] || []).length > 0) {
    strengths.push("Есть опыт лидерства");
  }

  if ((sections["volunteering"] || []).length > 0) {
    strengths.push("Активность в волонтёрстве");
  }

  const interests = profile.student.interests;
  const majors = university.majors;
  const majorMatch = interests.some((i) =>
    majors?.some((m) => m.toLowerCase().includes(i.toLowerCase()))
  );
  if (majorMatch) {
    strengths.push("Интересы соответствуют программам университета");
  }

  return strengths;
}

function computeGaps(
  testingMissing: string[],
  requirementsMissing: string[],
  sections: Record<string, ProfileSnapshot["portfolio"]>,
  profile: ProfileSnapshot
): string[] {
  const gaps = new Set<string>();

  for (const m of testingMissing) gaps.add(m);
  for (const m of requirementsMissing) gaps.add(m);

  if ((sections["research"] || []).length === 0 && (sections["projects"] || []).length === 0) {
    gaps.add("Нет исследовательских или технических проектов");
  }

  if ((sections["leadership"] || []).length === 0) {
    gaps.add("Нет опыта лидерства");
  }

  if ((sections["certificates"] || []).length === 0) {
    gaps.add("Нет языковых сертификатов или SAT/ACT");
  }

  if (!profile.student.bio || profile.student.bio.trim().length === 0) {
    gaps.add("Не указано 'О себе'");
  }

  return Array.from(gaps);
}

function computeRecommendations(
  testingMissing: string[],
  requirementsMissing: string[],
  profile: ProfileSnapshot,
  university: University
): string[] {
  const recs: string[] = [];

  for (const m of [...testingMissing, ...requirementsMissing]) {
    if (m.includes("SAT")) {
      recs.push("Сдайте SAT или ACT — это обязательное требование");
    } else if (m.includes("IELTS") || m.includes("TOEFL")) {
      recs.push("Сдайте IELTS или TOEFL для подтверждения уровня английского");
    } else if (m.includes("GPA")) {
      recs.push("Укажите GPA или добавьте академическую справку в портфолио");
    } else if (m.includes("Educational")) {
      recs.push("Добавьте информацию об образовании в портфолио");
    }
  }

  if ((profile.portfolio.filter((p) => p.section === "projects").length || 0) === 0) {
    recs.push("Добавьте технический проект в портфолио");
  }

  if ((profile.portfolio.filter((p) => p.section === "leadership").length || 0) === 0) {
    recs.push("Опиcывайте лидерство: возглавляйте проект или инициативу");
  }

  if (!profile.student.bio || profile.student.bio.trim().length === 0) {
    recs.push("Заполните раздел «О себе» в профиле");
  }

  return Array.from(new Set(recs));
}

export function computeUniversityAnalysis(
  university: University,
  account: StoredAccount
): UniversityAnalysis {
  const profile = extractProfile(account);
  const sections = portfolioEntriesBySection(profile);

  const academicFit = analyzeAcademicFit(profile, sections);
  const parsedScores = profile.academicInfo ? null : parseTestScoreFromPortfolio(sections);
  const testingResult = analyzeTestingFit(profile, sections, university, parsedScores);
  const majorFit = analyzeMajorFit(profile, university);
  const extracurricularFit = analyzeExtracurricularFit(sections);
  const researchFit = analyzeResearchFit(sections);
  const leadershipFit = analyzeLeadershipFit(sections);
  const requirementsResult = analyzeRequirementsFit(profile, sections, university, parsedScores);

  const missingData = new Set<string>();
  testingResult.missing.forEach((m) => missingData.add(m));
  requirementsResult.missing.forEach((m) => missingData.add(m));

  if (profile.student.bio && !profile.student.bio.trim()) {
    missingData.add("Описание профиля («О себе»)");
  }

  if (!profile.student.interests || profile.student.interests.length === 0) {
    missingData.add("Интересы");
  }

  if (profile.portfolio.length === 0) {
    missingData.add("Заполните портфолио");
  } else {
    if ((sections["education"] || []).length === 0) {
      missingData.add("Образование");
    }
    if ((sections["achievements"] || []).length === 0) {
      missingData.add("Достижения");
    }
  }

  const criticalMissing = testingResult.missing.length + requirementsResult.missing.length;

  let fitLevel: OverallFitLevel;
  let confidence: ConfidenceLevel;

  if (criticalMissing > 0) {
    fitLevel = "Not reliably estimable";
    confidence = "Low";
  } else if (profile.portfolio.length === 0) {
    fitLevel = "Not reliably estimable";
    confidence = "Low";
  } else {
    const fitScores: number[] = [];
    [academicFit, majorFit, extracurricularFit, researchFit, leadershipFit, requirementsResult.level].forEach((f) => {
      if (f === "Strong") fitScores.push(3);
      else if (f === "Good") fitScores.push(2);
      else if (f === "Moderate") fitScores.push(1);
      else if (f === "Weak") fitScores.push(0);
    });

    const avg = fitScores.reduce((a, b) => a + b, 0) / fitScores.length;

    if (avg >= 2.3) {
      fitLevel = "Strong Fit";
      confidence = criticalMissing > 0 ? "Medium" : "High";
    } else if (avg >= 1.3) {
      fitLevel = "Moderate Fit";
      confidence = "Medium";
    } else {
      fitLevel = "Weak Fit";
      confidence = criticalMissing > 0 ? "Medium" : "Low";
    }
  }

  const strengths = computeStrengths(sections, profile, university);
  const gaps = computeGaps(testingResult.missing, requirementsResult.missing, sections, profile);
  const recommendations = computeRecommendations(
    testingResult.missing,
    requirementsResult.missing,
    profile,
    university
  );

  const explanation = buildExplanation(fitLevel, confidence, profile, university, missingData, criticalMissing);

  const analysis: UniversityAnalysis = {
    profileMatch: fitLevel,
    confidence,
    missingData: Array.from(missingData),
    academicStrength: academicFit === "Strong" ? 85 : academicFit === "Good" ? 70 : academicFit === "Moderate" ? 50 : 30,
    testingStrength: testingResult.level === "Strong" ? 80 : testingResult.level === "Moderate" ? 50 : testingResult.level === "Insufficient data" ? 30 : 40,
    extracurricularStrength: extracurricularFit === "Strong" ? 75 : extracurricularFit === "Moderate" ? 50 : 30,
    researchStrength: researchFit === "Strong" ? 80 : researchFit === "Moderate" ? 50 : 30,
    leadershipStrength: leadershipFit === "Strong" ? 80 : leadershipFit === "Moderate" ? 50 : 30,
    universityFit: 0,
    overallProfileStrength: 0,
    academicFit,
    testingFit: testingResult.level,
    majorFit,
    extracurricularFit,
    researchFit,
    leadershipFit,
    requirementsFit: requirementsResult.level,
    applicationStrength: "На оценке",
    strengths,
    gaps,
    recommendations,
    explanation,
  };

  const strengthValues = [analysis.academicStrength, analysis.testingStrength, analysis.extracurricularStrength, analysis.researchStrength, analysis.leadershipStrength];
  analysis.universityFit = Math.round(strengthValues.reduce((a, b) => a + b, 0) / strengthValues.length);
  analysis.overallProfileStrength = analysis.universityFit;

  return analysis;
}

function buildExplanation(
  fitLevel: OverallFitLevel,
  confidence: ConfidenceLevel,
  profile: ProfileSnapshot,
  university: University,
  missingData: Set<string>,
  criticalMissing: number
): string {
  if (fitLevel === "Not reliably estimable") {
    if (profile.portfolio.length === 0) {
      return `ULYS не может оценить вашу совместимость с ${university.name} без данных о портфолио. Добавьте информацию об образовании, достижениях, проектах и языковых сертификатах в профиль.`;
    }
    if (criticalMissing > 0) {
      const missingList = Array.from(missingData);
      return `Для оценки совместимости с ${university.name} недостаточно данных о: ${missingList.join(", ")}. Добавьте недостающюю информацию в портфолио для точной оценки.`;
    }
    return `Для оценки совместимости с ${university.name} недостаточно данных. Заполните профиль и портфолио подробнее.`;
  }

  const strengths = profile.portfolio.length > 0 ? "вашего портфолио" : "вашем профиле";

  return `${fitLevel.toLowerCase()} для ${university.name}. Оценка основана на данных ${strengths}. Confidence: ${confidence === "High" ? "высокая" : confidence === "Medium" ? "средняя" : "низкая"} — добавьте больше данных для более точной рекомендации.`;
}
