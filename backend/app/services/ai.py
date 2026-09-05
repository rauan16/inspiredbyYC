import asyncio
import logging
import re
import httpx
from fastapi import HTTPException
from app.config import settings


logger = logging.getLogger(__name__)


MAX_RETRIES = 5
RETRY_DELAY_BASE = 3  # seconds, doubled each retry


SYSTEM_PROMPT = """Ты — ULIE, ИИ-наставник. Отвечай кратко, по делу, на русском.

Правила:
1. Не выдумывай факты, цифры, требования, if not in context.
2. Если данных недостаточно — «Недостаточно данных».
3. Если SAT/IELTS/проекты/олимпиады уже есть — НЕ предлагай их снова.
4. Portfolio semantics: startup = entrepreneurship/leadership/innovation, hackathon = technology/competition, marathon = sports/discipline.
5. Не допускай двойного счёта: один activity может иметь несколько категорий, но это не делает его несколькими independent achievements.
6. Никогда не выдавай процент поступления как проверенную статистику. Используй только PRE-COMPUTED ADMISSION ESTIMATE из контекста.
7. Для анализа поступления используй структуру ONE-SHOT (см. контекст).

ONE-SHOT ANALYSIS (когда пользователь спрашивает о конкретном университете/программе):
🎯 Admission: XX–YY%
Confidence: High/Medium/Low

📚 Academic fit
- GPA: требуется → есть → оценка
- SAT/ACT: требуется → есть → оценка (только если university его учитывает)
- English: требуется → есть → оценка

💻 [Program] fit
- Объясни relevance каждого activity конкретно к программе
- Full-stack dev → strong direct CS relevance
- Hackathon win → strong technical/competition signal
- Technical startup → entrepreneurship + technology + initiative

🚀 Extracurricular fit
- Сильные сигналы: entrepreneurship, technology, competitions, leadership, research, sports, projects
- Без double-counting

🎓 Scholarship / Grant
- Доступные scholarships из контекста
- Конкурентоспособность: High/Moderate/Low
- НЕ придумывай проценты для scholarship, если нет данных

⚠️ Weaknesses / Gaps: 2–4 пункта
📈 Best next actions: 1–3 пункта
**Verdict:** 2–4 предложения

Ограничения:
- Strengths: max 4 bullets
- Weaknesses: max 3 bullets
- Next actions: max 3 bullets
- Academic: max 3–5 lines
- CS fit: max 4 bullets
- Scholarship: max 5 lines
- Verdict: max 3 sentences
- Не повторяй информацию"""


async def get_mentor_response(
    student_message: str,
    conversation_history: list[dict],
    profile: dict | None = None,
    portfolio: list[dict] | None = None,
    universities: list[dict] | None = None,
) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    context_parts = []
    if profile:
        context_parts.append(_format_profile_context(profile))
    if portfolio:
        context_parts.append(_format_portfolio_context(portfolio))

    target_university = None
    if universities:
        msg_lower = student_message.lower()
        for uni in universities:
            uni_name = uni.get("name", "")
            if uni_name and uni_name.lower() in msg_lower:
                target_university = uni
                break

        if target_university:
            context_parts.append(_format_target_university_context(target_university))
            estimate = compute_admission_estimate(profile or {}, portfolio or [], target_university)
            context_parts.append(_format_estimate_context(estimate))
        else:
            context_parts.append(_format_universities_context(universities))

    if context_parts:
        messages.append({
            "role": "system",
            "content": f"Контекст студента:\n{chr(10).join(context_parts)}",
        })

    for msg in conversation_history[-20:]:
        role = "assistant" if msg.get("role") == "mentor" else "user"
        messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": student_message})

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{settings.AI_API_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://ulys-gamma.vercel.app",
                        "X-Title": "ULYS",
                    },
                    json={
                        "model": settings.AI_MODEL,
                        "messages": messages,
                        "max_tokens": 1024,
                        "temperature": 0.7,
                    },
                )

            if response.status_code == 429:
                retry_after = response.headers.get("retry-after", "").strip()
                if retry_after.isdigit():
                    delay = int(retry_after)
                else:
                    delay = RETRY_DELAY_BASE * (2 ** attempt)
                logger.warning(
                    f"AI provider rate limited (429). Retrying in {delay}s "
                    f"(attempt {attempt + 1}/{MAX_RETRIES})"
                )
                await asyncio.sleep(delay)
                continue

            if response.status_code != 200:
                safe_detail = ""
                try:
                    err_data = response.json()
                    safe_detail = str(err_data.get("error", {}).get("message", ""))[:200]
                except Exception:
                    safe_detail = response.text[:200]
                logger.error(
                    f"AI provider error: status={response.status_code}, message={safe_detail}"
                )
                raise HTTPException(
                    status_code=502,
                    detail="AI service error",
                )

            data = response.json()
            choices = data.get("choices", [])
            if not choices:
                logger.error("AI provider error: no choices in response")
                raise HTTPException(
                    status_code=502,
                    detail="AI service returned no response",
                )

            return choices[0].get("message", {}).get("content", "")

        except httpx.TimeoutException:
            logger.error("AI provider error: timeout (60s)")
            last_error = "timeout"
        except httpx.ConnectError:
            logger.error("AI provider error: connection failed")
            last_error = "connection"

        if attempt < MAX_RETRIES - 1 and last_error:
            delay = RETRY_DELAY_BASE * (2 ** attempt)
            logger.warning(
                f"Retrying after {last_error} in {delay}s "
                f"(attempt {attempt + 1}/{MAX_RETRIES})"
            )
            await asyncio.sleep(delay)

    if last_error:
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again later.",
        )
    raise HTTPException(
        status_code=502,
        detail="AI service error",
    )


def _format_profile_context(profile: dict) -> str:
    parts = []
    if profile.get("name"):
        parts.append(f"Имя: {profile['name']}")
    if profile.get("grade"):
        parts.append(f"Класс: {profile['grade']}")
    if profile.get("location"):
        parts.append(f"Город: {profile['location']}")
    if profile.get("bio"):
        parts.append(f"О себе: {profile['bio']}")
    if profile.get("interests"):
        parts.append(f"Интересы: {', '.join(profile['interests'])}")
    if profile.get("goals"):
        parts.append(f"Цели: {', '.join(profile['goals'])}")

    academic = profile.get("academicInfo")
    if academic:
        parts.append("Академическая информация:")
        if academic.get("school"):
            parts.append(f"  Школа: {academic['school']}")
        if academic.get("curriculum"):
            parts.append(f"  Курriculum: {academic['curriculum']}")
        if academic.get("intendedMajor"):
            parts.append(f"  Целевой major: {academic['intendedMajor']}")
        if academic.get("gpa"):
            parts.append(f"  GPA: {academic['gpa']}")
        if academic.get("sat"):
            parts.append(f"  SAT: {academic['sat']}")
        if academic.get("act"):
            parts.append(f"  ACT: {academic['act']}")
        if academic.get("ielts"):
            parts.append(f"  IELTS: {academic['ielts']}")
        if academic.get("toefl"):
            parts.append(f"  TOEFL: {academic['toefl']}")
        if academic.get("graduationYear"):
            parts.append(f"  Год выпуска: {academic['graduationYear']}")

    if not profile.get("academicInfo"):
        parts.append("Академическая информация: не указана")

    if not parts:
        return "Профиль не заполнен"
    return "\n".join(parts)


def _format_portfolio_context(portfolio: list[dict]) -> str:
    if not portfolio:
        return "Портфолио пустое"
    lines = []
    seen = set()
    for item in portfolio:
        key = ((item.get('title') or '') + ' ' + (item.get('description') or '')).strip().lower()
        if key in seen:
            continue
        seen.add(key)

        line = f"- [{item.get('section', '?')}] {item.get('title', '')}"
        if item.get("date"):
            line += f" ({item['date']})"
        if item.get("description"):
            line += f" — {item['description']}"

        text = ((item.get('title') or '') + ' ' + (item.get('description') or '')).lower()
        signals = []
        if any(k in text for k in ['startup', 'founder', 'business', 'entrepreneur']):
            signals.append('entrepreneurship/leadership/innovation')
        elif any(k in text for k in ['hackathon', 'competition', 'contest', 'olympiad', 'winner', '1st']):
            signals.append('competition/achievement')
        elif any(k in text for k in ['research', 'исследователь', 'lab', 'published']):
            signals.append('research/academic')
        elif any(k in text for k in ['volunteer', 'charity', 'community', 'service']):
            signals.append('community/volunteering')
        elif any(k in text for k in ['intern', 'experience', 'company']):
            signals.append('professional experience')
        elif any(k in text for k in ['marathon', 'sport', 'football', 'swim', 'athletic']):
            signals.append('sports/achievement')
        elif any(k in text for k in ['project', 'built', 'developed', 'created', 'app', 'application']):
            signals.append('project/technology')
        elif any(k in text for k in ['lead', 'organiz', 'headed', 'managed', 'president']):
            signals.append('leadership')
        elif any(k in text for k in ['art', 'music', 'theater', 'film', 'design', 'creative']):
            signals.append('arts/creativity')
        elif any(k in text for k in ['hobby', 'interest', 'club', 'personal']):
            signals.append('personal interest')
        elif any(k in text for k in ['international', 'exchange', 'abroad', 'global']):
            signals.append('international experience')
        elif any(k in text for k in ['certificate', 'certification']):
            signals.append('certification')

        if signals:
            line += f" [signals: {', '.join(signals)}]"

        lines.append(line)
    return "\n".join(lines)


def _format_universities_context(universities: list[dict]) -> str:
    if not universities:
        return "Университеты: не указаны"
    lines = ["Университеты:"]
    for uni in universities:
        parts = [f"- {uni.get('name', '?')}"]
        if uni.get("languageRequirements"):
            parts.append(f"язык={uni['languageRequirements']}")
        if uni.get("satRequirements"):
            parts.append(f"SAT/ACT={uni['satRequirements']}")
        if uni.get("gpaRequirements"):
            parts.append(f"GPA={uni['gpaRequirements']}")
        if uni.get("majors"):
            parts.append(f"majors={', '.join(uni['majors'])}")
        if uni.get("scholarshipAvailability"):
            parts.append("scholarship=available")
        lines.append("; ".join(parts))
    return "\n".join(lines)


def _format_target_university_context(university: dict) -> str:
    parts = [f"ТАРГЕТНЫЙ УНИВЕРСИТЕТ: {university.get('name', '?')}"]
    if university.get("country"):
        parts.append(f"  Страна: {university['country']}")
    if university.get("location"):
        parts.append(f"  Локация: {university['location']}")
    if university.get("rankingContext"):
        parts.append(f"  Рейтинг: {university['rankingContext']}")
    if university.get("acceptanceInfo"):
        parts.append(f"  Приём: {university['acceptanceInfo']}")
    if university.get("majors"):
        parts.append(f"  Программы: {', '.join(university['majors'])}")
    if university.get("undergraduatePrograms"):
        parts.append(f"  Undergraduate: {', '.join(university['undergraduatePrograms'])}")
    if university.get("languageRequirements"):
        parts.append(f"  Язык: {university['languageRequirements']}")
    if university.get("satRequirements"):
        parts.append(f"  SAT/ACT: {university['satRequirements']}")
    if university.get("gpaRequirements"):
        parts.append(f"  GPA: {university['gpaRequirements']}")
    if university.get("requirements"):
        parts.append(f"  Требования: {'; '.join(university['requirements'])}")
    if university.get("curriculumRequirements"):
        parts.append(f"  Curriculum: {', '.join(university['curriculumRequirements'])}")
    if university.get("subjectRequirements"):
        parts.append(f"  Subjects: {', '.join(university['subjectRequirements'])}")
    if university.get("internationalRequirements"):
        parts.append(f"  International: {', '.join(university['internationalRequirements'])}")
    if university.get("kazakhstanRequirements"):
        parts.append(f"  Kazakhstan: {', '.join(university['kazakhstanRequirements'])}")
    if university.get("scholarshipAvailability"):
        parts.append("  Scholarship: Available")
    if university.get("tuition"):
        parts.append(f"  Tuition: {university['tuition']}")
    if university.get("financialAid"):
        parts.append(f"  Financial Aid: {university['financialAid']}")
    if university.get("officialAdmissionsUrl"):
        parts.append(f"  URL: {university['officialAdmissionsUrl']}")
    return "\n".join(parts)


def _format_estimate_context(estimate: dict) -> str:
    if not estimate.get("available"):
        return ""
    parts = [
        "PRE-COMPUTED ADMISSION ESTIMATE (authoritative, используй именно этот диапазон):",
        f"  Admission: {estimate['min']}–{estimate['max']}%",
        f"  Confidence: {estimate['confidence']}",
    ]
    if estimate.get("factors"):
        parts.append(f"  Strong factors: {', '.join(estimate['factors'][:8])}")
    if estimate.get("gaps"):
        parts.append(f"  Gaps: {', '.join(estimate['gaps'][:8])}")
    return "\n".join(parts)


def classify_activity(entry: dict) -> dict:
    text = f"{entry.get('title', '')} {entry.get('description', '')} {entry.get('subtitle', '')}".lower()
    categories = []

    if any(k in text for k in ["olympiad", "диплом", "academic"]):
        categories.append("Academic")
    if any(k in text for k in ["research", "исследователь", "lab", "published"]):
        categories.append("Research")
    if any(k in text for k in ["tech", "software", "ai", "python", "code", "programming", "application", "app", "digital", "data", "it", "developer", "engineering", "hackathon", "startup"]):
        categories.append("Technology")
    if any(k in text for k in ["startup", "founder", "co-founder", "business", "entrepreneur", "product", "revenue", "funding", "venture"]):
        categories.append("Entrepreneurship")
        categories.append("Innovation")
    if any(k in text for k in ["lead", "organiz", "headed", "managed", "president", "founder", "director", "captain", "chair"]):
        categories.append("Leadership")
    if any(k in text for k in ["hackathon", "competition", "contest", "olympiad", "award", "prize", "winner", "1st", "2nd", "3rd", "finalist", "championship"]):
        categories.append("Competition")
    if any(k in text for k in ["marathon", "sport", "football", "basketball", "swim", "run", "athletic", "gym", "fitness"]):
        categories.append("Sports")
    if any(k in text for k in ["art", "music", "theater", "film", "photography", "design", "drawing", "painting", "creative"]):
        categories.append("Arts")
    if any(k in text for k in ["volunteer", "charity", "community", "service", "social", "ngo", "campaign", "help"]):
        categories.append("Community")
    if any(k in text for k in ["intern", "experience", "company", "firm", "office", "professional", "career", "job"]):
        categories.append("Professional")
    if any(k in text for k in ["project", "built", "developed", "created", "launched", "implemented", "designed"]):
        categories.append("Project")
    if any(k in text for k in ["international", "exchange", "abroad", "global", "world", "overseas", "foreign"]):
        categories.append("International")
    if any(k in text for k in ["hobby", "interest", "club", "personal", "fun", "leisure"]):
        categories.append("Personal")

    if not categories:
        categories.append("Other")

    strength = "Weak"
    if any(k in text for k in ["won", "winner", "1st", "first", "gold", "published", "founded", "built", "led", "head", "managed", "national", "international", "top"]):
        strength = "Strong"
    elif any(k in text for k in ["participated", "attended", "organized", "created", "developed", "project", "intern", "member", "team"]):
        strength = "Moderate"

    if "Entrepreneurship" in categories or "Research" in categories:
        relevance = "Demonstrates initiative and real-world impact"
    elif "Competition" in categories and strength == "Strong":
        relevance = "Demonstrates competitive excellence"
    elif "Technology" in categories or "Project" in categories:
        relevance = "Demonstrates practical technical experience"
    elif "Leadership" in categories:
        relevance = "Demonstrates leadership and initiative"
    elif "Sports" in categories:
        relevance = "Demonstrates discipline and commitment"
    elif "Community" in categories:
        relevance = "Demonstrates social engagement and initiative"
    elif "Professional" in categories:
        relevance = "Demonstrates professional experience"
    elif "Academic" in categories:
        relevance = "Demonstrates academic achievement"
    else:
        relevance = "Adds a personal dimension to the profile"

    return {"categories": categories, "strength": strength, "relevance": relevance}


def get_program_focus(university: dict) -> str:
    text = " ".join(
        (university.get("majors", []) or []) + (university.get("undergraduatePrograms", []) or [])
    ).lower()
    if any(k in text for k in ["computer", "software", "engineer", "tech", "information", "data", "math", "physics", "chemistry", "biology", "science"]):
        return "STEM"
    if any(k in text for k in ["business", "management", "economics", "finance", "entrepreneur", "marketing"]):
        return "Business"
    if any(k in text for k in ["medicine", "health", "medical", "nursing", "pharmacy"]):
        return "Medicine"
    if any(k in text for k in ["law", "legal", "justice"]):
        return "Law"
    if any(k in text for k in ["arts", "humanities", "literature", "history", "philosophy", "social", "political"]):
        return "LiberalArts"
    return "General"


CATEGORY_RELEVANCE = {
    "STEM": {"Research": 3, "Technology": 3, "Competition": 2, "Project": 2, "Innovation": 2, "Academic": 2, "Leadership": 1, "Sports": 1, "Personal": 1, "Community": 1, "Professional": 1, "Arts": 1, "Entrepreneurship": 1, "International": 1, "Other": 0},
    "Business": {"Entrepreneurship": 3, "Leadership": 3, "Competition": 2, "Project": 2, "Innovation": 2, "Professional": 2, "Community": 1, "Academic": 1, "Sports": 1, "Personal": 1, "Research": 1, "Technology": 1, "Arts": 1, "International": 1, "Other": 0},
    "Medicine": {"Research": 3, "Community": 3, "Academic": 2, "Professional": 2, "Competition": 2, "Project": 1, "Leadership": 1, "Sports": 1, "Personal": 1, "Technology": 1, "Innovation": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
    "Law": {"Leadership": 3, "Community": 3, "Competition": 2, "Academic": 2, "Project": 1, "Professional": 1, "Sports": 1, "Personal": 1, "Research": 1, "Technology": 1, "Innovation": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
    "LiberalArts": {"Leadership": 3, "Community": 3, "Arts": 3, "Competition": 2, "Academic": 2, "Project": 2, "Research": 2, "Sports": 1, "Personal": 1, "Technology": 1, "Innovation": 1, "International": 1, "Professional": 1, "Entrepreneurship": 1, "Other": 0},
    "General": {"Leadership": 2, "Competition": 2, "Project": 2, "Research": 2, "Technology": 2, "Innovation": 2, "Community": 2, "Professional": 2, "Academic": 2, "Sports": 1, "Personal": 1, "Arts": 1, "International": 1, "Entrepreneurship": 1, "Other": 0},
}


def compute_holistic_extracurricular_score(classified: list[dict], program_focus: str):
    score = 0
    signals = []
    seen = set()

    for activity in classified:
        category = activity.get("categories", ["Other"])[0]
        strength = activity.get("strength", "Weak")
        relevance = activity.get("relevance", "")
        cat_score = CATEGORY_RELEVANCE.get(program_focus, {}).get(category, 0)
        strength_multiplier = 1.0 if strength == "Strong" else 0.7 if strength == "Moderate" else 0.4

        if cat_score > 0 and category not in seen:
            score += cat_score * strength_multiplier
            seen.add(category)
            signals.append(f"{strength} {category.lower()}: {relevance}")

    return min(20, round(score)), signals[:5]


def compute_admission_estimate(profile: dict, portfolio: list[dict], university: dict) -> dict:
    academic = profile.get("academicInfo", {}) or {}
    sat = academic.get("sat")
    act = academic.get("act")
    ielts = academic.get("ielts") or academic.get("toefl")
    gpa = academic.get("gpa")

    sections: dict = {}
    for entry in portfolio:
        section = entry.get("section", "other")
        sections.setdefault(section, []).append(entry)

    sat_raw = university.get("satRequirements", "") or ""
    lang_raw = university.get("languageRequirements", "") or ""
    gpa_raw = university.get("gpaRequirements", "") or ""

    sat_optional = bool(re.search(r"optional|не используется|not specified", sat_raw, re.I))
    sat_considered = not sat_optional and bool(re.search(r"sat|act|requir|consider", sat_raw, re.I))
    ielts_required = bool(re.search(r"ielts|toefl|английский|english", lang_raw, re.I))
    gpa_required = bool(re.search(r"gpa|балл|grade", gpa_raw, re.I))

    has_sat = sat is not None or act is not None
    has_ielts = ielts is not None
    has_gpa = gpa is not None

    factors = []
    gaps = []

    if sat_considered:
        if has_sat:
            factors.append(f"SAT {sat or act}")
        else:
            gaps.append("SAT/ACT score")
    if ielts_required:
        if has_ielts:
            factors.append(f"IELTS {ielts}")
        else:
            gaps.append("IELTS/TOEFL score")
    if gpa_required:
        if has_gpa:
            factors.append(f"GPA {gpa}")
        else:
            gaps.append("GPA")

    classified = []
    for section_entries in sections.values():
        for entry in section_entries:
            classified.append(classify_activity(entry))

    program_focus = get_program_focus(university)
    holistic_score, holistic_signals = compute_holistic_extracurricular_score(classified, program_focus)
    factors.extend(holistic_signals)

    has_any_portfolio = bool(portfolio)
    if not has_any_portfolio:
        gaps.append("Portfolio is empty")

    score = 0
    if has_gpa and gpa_required:
        score += 10
    if has_sat and sat_considered:
        score += 10
    if has_ielts and ielts_required:
        score += 10

    if sat and sat >= 1400 and sat_considered:
        score += 15
    elif sat and sat >= 1200 and sat_considered:
        score += 10
    elif sat and sat_considered:
        score += 5

    if act and act >= 30 and sat_considered:
        score += 15
    elif act and act >= 24 and sat_considered:
        score += 10
    elif act and sat_considered:
        score += 5

    if ielts and ielts >= 7.0 and ielts_required:
        score += 15
    elif ielts and ielts >= 6.0 and ielts_required:
        score += 10
    elif ielts and ielts_required:
        score += 5

    score += holistic_score

    ranking = (university.get("rankingContext", "") or "").lower()
    acceptance = (university.get("acceptanceInfo", "") or "").lower()
    multiplier = 1.0
    if re.search(r"qs\s*(top\s*)?10|qs\s*2|qs\s*3|qs\s*4|qs\s*8|qs\s*9|qs\s*11|qs\s*17|qs\s*22|qs\s*37", ranking) or re.search(r"очень высокий конкурс|very high|highly competitive", acceptance):
        multiplier = 0.6
    elif re.search(r"qs\s*(50|51|100|101|200|251|300)", ranking) or re.search(r"высокий конкурс|competitive", acceptance):
        multiplier = 0.8
    elif "конкурс" in acceptance:
        multiplier = 0.9

    final_score = min(100, round(score * multiplier))

    if final_score >= 80:
        min_pct, max_pct = 70, 90
    elif final_score >= 60:
        min_pct, max_pct = 50, 70
    elif final_score >= 40:
        min_pct, max_pct = 30, 50
    elif final_score >= 20:
        min_pct, max_pct = 15, 35
    else:
        min_pct, max_pct = 5, 20

    required_fields = 0
    present_fields = 0
    if sat_considered:
        required_fields += 1
        if has_sat:
            present_fields += 1
    if ielts_required:
        required_fields += 1
        if has_ielts:
            present_fields += 1
    if gpa_required:
        required_fields += 1
        if has_gpa:
            present_fields += 1
    required_fields += 1
    if has_any_portfolio:
        present_fields += 1

    if required_fields == 0:
        confidence = "Medium"
    elif present_fields == required_fields:
        confidence = "High"
    elif present_fields >= (required_fields + 1) // 2:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "available": True,
        "min": min_pct,
        "max": max_pct,
        "confidence": confidence,
        "factors": factors,
        "gaps": gaps,
    }
