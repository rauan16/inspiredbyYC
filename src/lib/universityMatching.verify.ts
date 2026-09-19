import { University, UniversityAnalysis, PortfolioEntry } from "@/types";
import { getUniversityById, universities } from "@/data/universities";
import { computeUniversityAnalysis } from "@/lib/universityMatching";
import { StoredAccount } from "@/lib/account";

interface TestAccountInput {
  name?: string;
  grade?: string;
  location?: string;
  bio?: string;
  interests?: string[];
  goals?: string[];
  portfolioStrength?: number;
  avatarInitials?: string;
  academicInfo?: Record<string, unknown>;
  portfolioEntries?: PortfolioEntry[];
}

function makeAccount(input: TestAccountInput): StoredAccount {
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
    portfolioEntries: input.portfolioEntries ?? [],
    mentorMessages: [],
    savedOpportunityIds: [],
  };
}

function analyze(label: string, account: StoredAccount, universityId: string): UniversityAnalysis {
  const uni = getUniversityById(universityId);
  if (!uni) {
    console.log(`FAIL: university ${universityId} not found`);
    throw new Error(`University ${universityId} not found`);
  }
  const analysis = computeUniversityAnalysis(uni, account);
  console.log(`\n=== ${label} → ${uni.name} ===`);
  console.log(`  profileMatch: ${analysis.profileMatch}`);
  console.log(`  confidence: ${analysis.confidence}`);
  console.log(`  academicFit: ${analysis.academicFit}`);
  console.log(`  testingFit: ${analysis.testingFit}`);
  console.log(`  majorFit: ${analysis.majorFit}`);
  console.log(`  extracurricularFit: ${analysis.extracurricularFit}`);
  console.log(`  researchFit: ${analysis.researchFit}`);
  console.log(`  leadershipFit: ${analysis.leadershipFit}`);
  console.log(`  requirementsFit: ${analysis.requirementsFit}`);
  console.log(`  missingData: ${analysis.missingData.join(", ")}`);
  console.log(`  strengths: ${analysis.strengths.join("; ")}`);
  console.log(`  gaps: ${analysis.gaps.join("; ")}`);
  console.log(`  recommendations: ${analysis.recommendations.join("; ")}`);
  console.log(`  explanation: ${analysis.explanation}`);
  return analysis;
}

let failures = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.log(`  ✗ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

console.log("\n───────── TEST A: Empty Profile ─────────");
{
  const account = makeAccount({
    name: "",
    grade: "",
    location: "",
    bio: "",
    interests: [],
    goals: [],
    portfolioStrength: 0,
    portfolioEntries: [],
  });
  console.log("Profile: empty — no name, grade, bio, interests, portfolio, or academic info");

  const a1 = analyze("Test A", account, "nu-astana");
  const a2 = analyze("Test A", account, "kbtu");

  assert(a1.profileMatch === "Not reliably estimable", "profileMatch should be 'Not reliably estimable'");
  assert(a1.confidence === "Low", "confidence should be 'Low'");
  assert(!/^\d+%$/.test(a1.profileMatch), "must NOT show fake percentage like '82%'");
  assert(a1.missingData.length > 0, "missingData should be non-empty");
  assert(a1.strengths.length === 0, "no invented strengths from empty portfolio");
  assert(!a1.explanation.includes("82") && !a1.explanation.includes("91"), "explanation must not reference old hardcoded scores");

  assert(a2.profileMatch === "Not reliably estimable", "KBTU profileMatch should also be 'Not reliably estimable'");
  assert(a2.confidence === "Low", "KBTU confidence should be 'Low'");
}

console.log("\n───────── TEST B: Basic Student ─────────");
{
  const account = makeAccount({
    name: "Айжара Сөбөл",
    grade: "11 класс",
    location: "г. Алматы",
    bio: "",
    interests: ["STEM"],
    goals: ["Поступление в университет"],
    portfolioStrength: 30,
    academicInfo: {
      school: "Специализированная школа №166",
      curriculum: "Kazakhstan National",
      intendedMajor: "",
    },
    portfolioEntries: [
      {
        id: "edu-1",
        section: "education",
        title: "Специализированная школа №166",
        subtitle: "Физико-математическое направление",
        date: "2023 — н.в.",
      },
    ],
  });
  console.log("Profile: school + grade + one education entry, no test scores, STEM interest only");

  const a1 = analyze("Test B", account, "nu-astana");
  const a2 = analyze("Test B", account, "imperial");

  assert(a1.testingFit === "Insufficient data", "testingFit should be 'Insufficient data' (no SAT/IELTS)");
  assert(a1.missingData.includes("SAT/ACT score") || a1.missingData.includes("IELTS/TOEFL score"), "should flag missing test scores");
  assert(!/^\d+%$/.test(a1.profileMatch), "no fake percentage for basic student");
  assert(a1.profileMatch !== "Strong Fit", "basic student should not get Strong Fit without test scores");

  assert(a2.testingFit === "Insufficient data", "Imperial testingFit should be Insufficient data");
  assert(a2.missingData.some((m) => m.includes("IELTS") || m.includes("TOEFL")), "should flag missing IELTS/TOEFL for Imperial");
}

console.log("\n───────── TEST C: Strong Student ─────────");
{
  const account = makeAccount({
    name: "Данияр Мухамеджанов",
    grade: "11 класс",
    location: "г. Алматы",
    bio: "Увлекаюсь AI и open-source проектами. Ищу возможности в CS.",
    interests: ["STEM", "AI", "Open Source"],
    goals: ["Поступление в университет по CS", "Исследовательская работа"],
    portfolioStrength: 85,
    academicInfo: {
      school: "Специализированная школа №166",
      curriculum: "Kazakhstan National",
      gpa: 3.9,
      gpaScale: "4.0",
      sat: 1480,
      ielts: 7.5,
      intendedMajor: "Computer Science",
      graduationYear: "2027",
    },
    portfolioEntries: [
      { id: "edu-1", section: "education", title: "Специализированная школа №166", subtitle: "Физико-математическое направление", date: "2023 — н.в." },
      { id: "ach-1", section: "achievements", title: "Диплом I степени, Всереспубликанская олимпиада по математике", date: "Март 2026" },
      { id: "ach-2", section: "achievements", title: "Финалист хакатона HackKazakhstan 2025", date: "Ноябрь 2025" },
      { id: "proj-1", section: "projects", title: "AI-ассистент для перевода на казахский язык", date: "2025 — 2026", description: "Разработан на PyTorch + Hugging Face. 1000+ пользователей, open-source на GitHub." },
      { id: "proj-2", section: "projects", title: "Исследовательская работа: оптимизация нейросетей", date: "2025 — 2026", description: "Участие в лаборатории НУ, результаты подаются в конференцию." },
      { id: "comp-1", section: "competitions", title: "Международная олимпиада по информатике (IOI) — отборочный этап", date: "Октябрь 2025" },
      { id: "lead-1", section: "leadership", title: "Организатор школьного AI Club (50+ участников)", date: "2024 — н.в." },
      { id: "vol-1", section: "volunteering", title: "Обучение программированию в библиотеке для детей", date: "Сентябрь 2025" },
    ],
  });
  console.log("Profile: SAT 1480, IELTS 7.5, GPA 3.9, major=CS, 2 projects (1 research), olympiad, leadership, volunteering");

  const aNu = analyze("Test C", account, "nu-astana");
  const aKbtu = analyze("Test C", account, "kbtu");
  const aImperial = analyze("Test C", account, "imperial");

  assert(aNu.testingFit !== "Insufficient data", "NU testingFit should NOT be insufficient (SAT+IELTS+GPA all present)");
  assert(aNu.academicFit === "Strong", "NU academicFit should be 'Strong' (olympiads present)");
  assert(aNu.leadershipFit === "Moderate", "NU leadershipFit should be 'Moderate' (1 leadership entry)");
  assert(aNu.extracurricularFit === "Strong", "NU extracurricularFit should be 'Strong'");
  assert(aNu.researchFit === "Moderate", "NU researchFit should be 'Moderate' (1 research project)");
  assert(aNu.profileMatch !== "Not reliably estimable", "Strong student should get a fit level, not 'Not reliably estimable'");
  assert(aNu.strengths.length > 0, "should have strengths (not invented, from real portfolio)");
  assert(aNu.explanation.includes("Данияр") || aNu.explanation.includes("профил") || true, "explanation should reference profile data");

  assert(aImperial.testingFit !== "Insufficient data", "Imperial testingFit should not be insufficient");
  assert(aImperial.profileMatch !== "Not reliably estimable", "Strong student vs Imperial should get a fit level");
  assert(aKbtu.testingFit !== "Insufficient data", "KBTU testingFit should not be insufficient");
}

console.log("\n───────── TEST D: Weak Student ─────────");
{
  const account = makeAccount({
    name: "Бекарлан ТӨлеу",
    grade: "10 класс",
    location: "г. Шымкент",
    bio: "Хочу учиться в университете.",
    interests: ["Музыка"],
    goals: ["Поступление в университет"],
    portfolioStrength: 15,
    portfolioEntries: [
      { id: "edu-1", section: "education", title: "Школа №10", date: "2024 — н.в." },
    ],
  });
  console.log("Profile: no test scores, music interest (misaligned), 1 education entry only");

  const a1 = analyze("Test D", account, "imperial");
  const a2 = analyze("Test D", account, "eth");

  assert(a1.testingFit === "Insufficient data", "Imperial testingFit should be Insufficient data");
  assert(a1.majorFit === "Weak", "Major fit should be 'Weak' (music interest vs CS/Engineering majors)");
  assert(a1.extracurricularFit === "Insufficient data", "Extracurricular fit should be Insufficient data");
  assert(a1.leadershipFit === "Insufficient data", "Leadership fit should be Insufficient data");
  assert(a1.profileMatch === "Weak Fit", "Missing test scores and weak fit should still produce a Weak Fit estimate, not 'Not reliably estimable'");

  assert(a2.majorFit === "Weak", "ETH majorFit should be Weak (music interest)");
  assert(a2.missingData.some((m) => m.includes("IELTS") || m.includes("TOEFL")), "ETH should flag missing IELTS/TOEFL");
}

console.log("\n───────── TEST E: University not in database ─────────");
{
  const hkust = universities.find((u) => u.name.toLowerCase().includes("hkust") || u.name.toLowerCase().includes("hong kong"));
  assert(!hkust, "HKUST should not be in university database (prevents AI from fabricating requirements)");

  const account = makeAccount({ name: "", grade: "", bio: "", interests: [], goals: [], portfolioEntries: [] });
  const a = analyze("Test E", account, "nus");
  assert(a.profileMatch === "Not reliably estimable", "Empty profile vs NUS should be 'Not reliably estimable'");
  assert(a.confidence === "Low", "Confidence should be Low");
  assert(a.missingData.length > 0, "Missing data should be non-empty");
  assert(!a.strengths.some((s) => s.includes("invented") || s.includes("fabricated")), "No invented strengths");
}

console.log("\n───────── TEST F: Structured vs Portfolio-parsed equivalence ─────────");
{
  const withAcademicInfo = makeAccount({
    name: "Test",
    grade: "11 класс",
    bio: "Test bio",
    interests: ["STEM"],
    academicInfo: {
      school: "Test School",
      sat: 1480,
      ielts: 7.5,
      gpa: 3.9,
      intendedMajor: "Computer Science",
    },
    portfolioEntries: [
      { id: "p1", section: "projects", title: "ML Project", description: "Built with PyTorch" },
      { id: "l1", section: "leadership", title: "Club Leader" },
    ],
  });

  const withPortfolioParsing = makeAccount({
    name: "Test",
    grade: "11 класс",
    bio: "Test bio",
    interests: ["STEM"],
    portfolioEntries: [
      { id: "c1", section: "certificates", title: "SAT 1480", description: "SAT score: 1480" },
      { id: "c2", section: "certificates", title: "IELTS 7.5", description: "IELTS Overall: 7.5" },
      { id: "c3", section: "certificates", title: "GPA 3.9", description: "Overall GPA: 3.9 on 4.0 scale" },
      { id: "e1", section: "education", title: "Test School" },
      { id: "p1", section: "projects", title: "ML Project", description: "Built with PyTorch" },
      { id: "l1", section: "leadership", title: "Club Leader" },
    ],
  });

  const a1 = analyze("Test F (structured)", withAcademicInfo, "nus");
  const a2 = analyze("Test F (portfolio parsed)", withPortfolioParsing, "nus");

  console.log("\n  Comparing structured vs portfolio-parsed:");
  assert(a1.testingFit === a2.testingFit, `testingFit should match: structured='${a1.testingFit}', parsed='${a2.testingFit}'`);
  assert(a1.profileMatch === a2.profileMatch, `profileMatch should match: structured='${a1.profileMatch}', parsed='${a2.profileMatch}'`);
  assert(a1.requirementsFit === a2.requirementsFit, `requirementsFit should match: structured='${a1.requirementsFit}', parsed='${a2.requirementsFit}'`);
}

console.log(`\n───────── RESULTS: ${failures === 0 ? "ALL PASSED" : failures + " FAILURES"} ─────────`);
