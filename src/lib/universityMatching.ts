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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type ActivityCategory =
  | "Academic"
  | "Research"
  | "Technology"
  | "Entrepreneurship"
  | "Leadership"
  | "Competition"
  | "Sports"
  | "Arts"
  | "Community"
  | "Professional"
  | "Project"
  | "Innovation"
  | "International"
  | "Personal"
  | "Other";

interface ClassifiedActivity {
  entry: ProfileSnapshot["portfolio"][0];
  categories: ActivityCategory[];
  strength: "Strong" | "Moderate" | "Weak";
  relevance: string;
}

export function classifyActivity(entry: ProfileSnapshot["portfolio"][0]): ClassifiedActivity {
  const text = ((entry.title || "") + " " + (entry.description || "") + " " + (entry.subtitle || "")).toLowerCase();
  const categories: ActivityCategory[] = [];
  let strength: "Strong" | "Moderate" | "Weak" = "Weak";
  let relevance = "";

  if (/olympiad|диплом|academic|academic/i.test(text)) {
    categories.push("Academic");
  }
  if (/research|исследователь|lab|лаборатор|published|paper/i.test(text)) {
    categories.push("Research");
  }
  if (/tech|software|ai|python|code|programming|application|app|digital|data|it|developer|engineering|hackathon|startup/i.test(text)) {
    categories.push("Technology");
  }
  if (/startup|founder|co-founder|business|entrepreneur|product|revenue|funding|venture/i.test(text)) {
    categories.push("Entrepreneurship");
    categories.push("Innovation");
  }
  if (/lead|organiz|headed|managed|president|founder|director|captain|chair/i.test(text)) {
    categories.push("Leadership");
  }
  if (/hackathon|competition|contest|olympiad|award|prize|winner|1st|2nd|3rd|finalist|championship/i.test(text)) {
    categories.push("Competition");
  }
  if (/marathon|sport|football|basketball|swim|run|athletic|gym|fitness|competition/i.test(text)) {
    categories.push("Sports");
  }
  if (/art|music|theater|film|photography|design|drawing|painting|creative/i.test(text)) {
    categories.push("Arts");
  }
  if (/volunteer|charity|community|service|social|ngo|campaign|help/i.test(text)) {
    categories.push("Community");
  }
  if (/intern|experience|company|firm|office|professional|career|job/i.test(text)) {
    categories.push("Professional");
  }
  if (/project|built|developed|created|launched|implemented|designed/i.test(text)) {
    categories.push("Project");
  }
  if (/international|exchange|abroad|global|world|overseas|foreign/i.test(text)) {
    categories.push("International");
  }
  if (/hobby|interest|club|personal|fun|leisure/i.test(text)) {
    categories.push("Personal");
  }

  if (categories.length === 0) {
    categories.push("Other");
  }

  const strongIndicators = /won|winner|1st|first|gold|published|founded|built|led|head|managed|national|international|top/i.test(text);
  const moderateIndicators = /participated|attended|organized|created|developed|project|intern|member|team/i.test(text);

  if (strongIndicators) {
    strength = "Strong";
  } else if (moderateIndicators) {
    strength = "Moderate";
  }

  if (categories.includes("Entrepreneurship") || categories.includes("Research")) {
    relevance = "Demonstrates initiative and real-world impact";
  } else if (categories.includes("Competition") && strength === "Strong") {
    relevance = "Demonstrates competitive excellence";
  } else if (categories.includes("Technology") || categories.includes("Project")) {
    relevance = "Demonstrates practical technical experience";
  } else if (categories.includes("Leadership")) {
    relevance = "Demonstrates leadership and initiative";
  } else if (categories.includes("Sports")) {
    relevance = "Demonstrates discipline and commitment";
  } else if (categories.includes("Community")) {
    relevance = "Demonstrates social engagement and initiative";
  } else if (categories.includes("Professional")) {
    relevance = "Demonstrates professional experience";
  } else if (categories.includes("Academic")) {
    relevance = "Demonstrates academic achievement";
  } else {
    relevance = "Adds a personal dimension to the profile";
  }

  return { entry, categories, strength, relevance };
}

export function classifyPortfolio(portfolio: ProfileSnapshot["portfolio"]): ClassifiedActivity[] {
  const classified: ClassifiedActivity[] = [];
  const seen = new Set<string>();

  for (const entry of portfolio) {
    const key = (entry.title + (entry.description || "")).toLowerCase().trim();
    if (seen.has(key)) continue;
    seen.add(key);

    const result = classifyActivity(entry);
    classified.push(result);
  }

  return classified;
}

export function getProgramFocus(university: University): string {
  const majors = (university.majors || []).join(" ").toLowerCase();
  const programs = (university.undergraduatePrograms || []).join(" ").toLowerCase();
  const text = majors + " " + programs;

  if (/computer|software|engineer|tech|information|data|math|physics|chemistry|biology|science/i.test(text)) {
    return "STEM";
  }
  if (/business|management|economics|finance|entrepreneur|marketing/i.test(text)) {
    return "Business";
  }
  if (/medicine|health|medical|nursing|pharmacy/i.test(text)) {
    return "Medicine";
  }
  if (/law|legal|justice/i.test(text)) {
    return "Law";
  }
  if (/arts|humanities|literature|history|philosophy|social|political|economics/i.test(text)) {
    return "LiberalArts";
  }
  return "General";
}

function getCategoryProgramRelevance(category: ActivityCategory, programFocus: string): number {
  const relevance: Record<string, Record<string, number>> = {
    STEM: { Research: 3, Technology: 3, Competition: 2, Project: 2, Innovation: 2, Academic: 2, Leadership: 1, Sports: 1, Personal: 1, Community: 1, Professional: 1, Arts: 1, Entrepreneurship: 1, International: 1, Other: 0 },
    Business: { Entrepreneurship: 3, Leadership: 3, Competition: 2, Project: 2, Innovation: 2, Professional: 2, Community: 1, Academic: 1, Sports: 1, Personal: 1, Research: 1, Technology: 1, Arts: 1, International: 1, Other: 0 },
    Medicine: { Research: 3, Community: 3, Academic: 2, Professional: 2, Competition: 2, Project: 1, Leadership: 1, Sports: 1, Personal: 1, Technology: 1, Innovation: 1, Arts: 1, International: 1, Entrepreneurship: 1, Other: 0 },
    Law: { Leadership: 3, Community: 3, Competition: 2, Academic: 2, Project: 1, Professional: 1, Sports: 1, Personal: 1, Research: 1, Technology: 1, Innovation: 1, Arts: 1, International: 1, Entrepreneurship: 1, Other: 0 },
    LiberalArts: { Leadership: 3, Community: 3, Arts: 3, Competition: 2, Academic: 2, Project: 2, Research: 2, Sports: 1, Personal: 1, Technology: 1, Innovation: 1, International: 1, Professional: 1, Entrepreneurship: 1, Other: 0 },
    General: { Leadership: 2, Competition: 2, Project: 2, Research: 2, Technology: 2, Innovation: 2, Community: 2, Professional: 2, Academic: 2, Sports: 1, Personal: 1, Arts: 1, International: 1, Entrepreneurship: 1, Other: 0 },
  };

  return relevance[programFocus]?.[category] ?? 0;
}

export function computeHolisticExtracurricularScore(
  classified: ClassifiedActivity[],
  programFocus: string
): { score: number; signals: string[] } {
  let score = 0;
  const signals: string[] = [];

  const seen = new Set<ActivityCategory>();

  for (const activity of classified) {
    const categoryScore = getCategoryProgramRelevance(activity.categories[0], programFocus);
    const strengthMultiplier = activity.strength === "Strong" ? 1.0 : activity.strength === "Moderate" ? 0.7 : 0.4;

    if (categoryScore > 0 && !seen.has(activity.categories[0])) {
      score += categoryScore * strengthMultiplier;
      seen.add(activity.categories[0]);
      signals.push(`${activity.strength} ${activity.categories[0].toLowerCase()}: ${activity.relevance}`);
    }
  }

  return { score: Math.min(20, Math.round(score)), signals: signals.slice(0, 5) };
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

  if (profile.portfolio.length === 0) {
    fitLevel = "Not reliably estimable";
    confidence = "Low";
  } else {
    const fitScores: number[] = [];
    [academicFit, majorFit, extracurricularFit, researchFit, leadershipFit, requirementsResult.level].forEach((f) => {
      if (f === "Strong") fitScores.push(3);
      else if (f === "Good") fitScores.push(2);
      else if (f === "Moderate") fitScores.push(1);
      else if (f === "Weak") fitScores.push(0);
      else fitScores.push(0);
    });

    const avg = fitScores.reduce((a, b) => a + b, 0) / fitScores.length;

    if (avg >= 2.3) {
      fitLevel = "Strong Fit";
    } else if (avg >= 1.3) {
      fitLevel = "Moderate Fit";
    } else {
      fitLevel = "Weak Fit";
    }

    if (criticalMissing > 0) {
      confidence = "Low";
    } else if (fitScores.some((s) => s === 0)) {
      confidence = "Medium";
    } else {
      confidence = "High";
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

  const classified = classifyPortfolio(profile.portfolio);
  const programFocus = getProgramFocus(university);

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
    activitySignals: classified.map((c) => ({
      category: c.categories[0],
      strength: c.strength,
      title: c.entry.title,
      relevance: c.relevance,
    })),
    admissionEstimate: computeAdmissionEstimate(profile, sections, university, classified, programFocus),
  };

  const strengthValues = [analysis.academicStrength, analysis.testingStrength, analysis.extracurricularStrength, analysis.researchStrength, analysis.leadershipStrength];
  analysis.universityFit = Math.round(strengthValues.reduce((a, b) => a + b, 0) / strengthValues.length);
  analysis.overallProfileStrength = analysis.universityFit;

  return analysis;
}

function computeAdmissionEstimate(
  profile: ProfileSnapshot,
  sections: Record<string, ProfileSnapshot["portfolio"]>,
  university: University,
  classified: ClassifiedActivity[] = [],
  programFocus: string = "General"
): { available: boolean; min: number; max: number; confidence: "High" | "Medium" | "Low"; factors: string[]; gaps: string[] } {
  const factors: string[] = [];
  const gaps: string[] = [];

  const sat = profile.academicInfo?.sat;
  const act = profile.academicInfo?.act;
  const ielts = profile.academicInfo?.ielts ?? profile.academicInfo?.toefl;
  const gpa = profile.academicInfo?.gpa;

  const achievements = sections["achievements"] || [];
  const projects = sections["projects"] || [];
  const leadership = sections["leadership"] || [];
  const competitions = sections["competitions"] || [];
  const volunteering = sections["volunteering"] || [];
  const certificates = sections["certificates"] || [];
  const education = sections["education"] || [];

  const satRaw = university.satRequirements || "";
  const langRaw = university.languageRequirements || "";
  const gpaRaw = university.gpaRequirements || "";
  const satOptional = /optional/i.test(satRaw) || /не используется/i.test(satRaw) || /not specified/i.test(satRaw);
  const satConsidered = !satOptional && /sat|act|requir|consider/i.test(satRaw);
  const ieltsRequired = /ielts|toefl|английский|english/i.test(langRaw);
  const gpaRequired = /gpa|балл|grade/i.test(gpaRaw);

  const hasSat = sat !== undefined || act !== undefined;
  const hasIelts = ielts !== undefined;
  const hasGpa = gpa !== undefined;

  if (satConsidered) {
    if (hasSat) factors.push(`SAT ${sat ?? act}`);
    else gaps.push("SAT/ACT score");
  }
  if (ieltsRequired) {
    if (hasIelts) factors.push(`IELTS ${ielts}`);
    else gaps.push("IELTS/TOEFL score");
  }
  if (gpaRequired) {
    if (hasGpa) factors.push(`GPA ${gpa}`);
    else gaps.push("GPA");
  }

  const holistic = computeHolisticExtracurricularScore(classified, programFocus);

  for (const signal of holistic.signals) {
    factors.push(signal);
  }

  const hasAnyPortfolio = achievements.length + projects.length + leadership.length + competitions.length + volunteering.length + certificates.length + education.length > 0;
  if (!hasAnyPortfolio) gaps.push("Portfolio is empty");

  let score = 0;
  if (hasGpa && gpaRequired) score += 10;
  if (hasSat && satConsidered) score += 10;
  if (hasIelts && ieltsRequired) score += 10;

  if (sat && sat >= 1400 && satConsidered) score += 15;
  else if (sat && sat >= 1200 && satConsidered) score += 10;
  else if (sat && satConsidered) score += 5;

  if (act && act >= 30 && satConsidered) score += 15;
  else if (act && act >= 24 && satConsidered) score += 10;
  else if (act && satConsidered) score += 5;

  if (ielts && ielts >= 7.0 && ieltsRequired) score += 15;
  else if (ielts && ielts >= 6.0 && ieltsRequired) score += 10;
  else if (ielts && ieltsRequired) score += 5;

  score += holistic.score;

  const ranking = (university.rankingContext || "").toLowerCase();
  const acceptance = (university.acceptanceInfo || "").toLowerCase();
  let multiplier = 1.0;
  if (/qs\s*(top\s*)?10|qs\s*2|qs\s*3|qs\s*4|qs\s*8|qs\s*9|qs\s*11|qs\s*17|qs\s*22|qs\s*37/.test(ranking) || /очень высокий конкурс|very high|highly competitive/.test(acceptance)) {
    multiplier = 0.6;
  } else if (/qs\s*(50|51|100|101|200|251|300)/.test(ranking) || /высокий конкурс|competitive/.test(acceptance)) {
    multiplier = 0.8;
  } else if (/конкурс/.test(acceptance)) {
    multiplier = 0.9;
  }

  const finalScore = Math.min(100, Math.round(score * multiplier));

  let minPercent: number;
  let maxPercent: number;
  if (finalScore >= 80) { minPercent = 70; maxPercent = 90; }
  else if (finalScore >= 60) { minPercent = 50; maxPercent = 70; }
  else if (finalScore >= 40) { minPercent = 30; maxPercent = 50; }
  else if (finalScore >= 20) { minPercent = 15; maxPercent = 35; }
  else { minPercent = 5; maxPercent = 20; }

  let requiredFields = 0;
  let presentFields = 0;
  if (satConsidered) { requiredFields++; if (hasSat) presentFields++; }
  if (ieltsRequired) { requiredFields++; if (hasIelts) presentFields++; }
  if (gpaRequired) { requiredFields++; if (hasGpa) presentFields++; }
  requiredFields += 1;
  if (hasAnyPortfolio) presentFields += 1;

  const confidence: "High" | "Medium" | "Low" = requiredFields === 0 ? "Medium" : presentFields === requiredFields ? "High" : presentFields >= Math.ceil(requiredFields / 2) ? "Medium" : "Low";

  return { available: true, min: minPercent, max: maxPercent, confidence, factors, gaps };
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

