import asyncio
import logging
import re
import httpx
from fastapi import HTTPException
from app.config import settings
from app.services.admission_estimate import compute_admission_estimate


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


