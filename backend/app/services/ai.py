import asyncio
import logging
import re
import httpx
from fastapi import HTTPException
from app.config import settings
from app.services.admission_estimate import compute_admission_estimate


logger = logging.getLogger(__name__)


MAX_RETRIES = 3
RETRY_DELAY_BASE = 2  # seconds
AI_TIMEOUT = 90.0  # seconds

# Base max_tokens, reduced on retry
BASE_MAX_TOKENS = 20


SYSTEM_PROMPT = """Ты — ULIE, ИИ-наставник для абитуриентов в университеты. Отвечай кратко на русском языке.

Ты получаешь ТОЛЬКО досьйе студента (профиль, портфолио, рекомендации ULYS, roadmap) — объясняй, опирайся на эти данные.

ЖЕСТКИЕ ПРАВИЛА (не выдумывай под любую цену):
1. Никогда не выдумывай требования вузов (SAT, GPA, IELTS, язык и т.д.). Используй только те данные, которые есть в контексте.
2. Никогда не выдумывай сроки подачи, дедлайны, стоимость обучения (tuition) или стипендии. 
3. Никогда не выдумывай вероятности зачисления, проценты шансов, admission estimates.
4. Никогда не выдумывай задачи roadmap — только существующие из контекста.
5. Никогда не выдумывай имена вузов, программ или требований.
6. Если данные отсутствуют в контексте — скажи об этом честно: «У меня нет данных, чтобы оценить/оценить это».
7. ULYS Match — это совместимость профиля с программой, а не вероятность зачисения. Объясняй эту разницу.
8. Ссылайся на конкретные данные из контекста (названия вузов, цены, требования, задачи) — не обобщайся.
9. Давай actionable советы, основанные на реальных пробелах и рекомендациях ULYS.
"""


async def get_mentor_response(
    student_message: str,
    conversation_history: list[dict],
    profile: dict | None = None,
    portfolio: list[dict] | None = None,
    universities: list[dict] | None = None,
    recommendations: list[dict] | None = None,
    roadmap: dict | None = None,
) -> str:
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"get_mentor_response called: message={student_message}, profile={profile}, portfolio_len={len(portfolio) if portfolio else 0}, universities_len={len(universities) if universities else 0}, recommendations_len={len(recommendations) if recommendations else 0}, roadmap_tasks={len(roadmap.get('tasks', [])) if roadmap else 0}")
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    context_parts = []
    if profile:
        context_parts.append(_format_profile_context(profile))
    if portfolio:
        context_parts.append(_format_portfolio_context(portfolio))

    target_university = None
    needs_universities = False
    if universities:
        msg_lower = student_message.lower()
        for uni in universities:
            uni_name = uni.get("name", "")
            if uni_name and uni_name.lower() in msg_lower:
                target_university = uni
                break
        
        # Only include universities for SPECIFIC university name mentions
        specific_uni_keywords = ['imperial', 'mit', 'stanford', 'harvard', 'oxford', 'cambridge', 'eth', 'nus', 'ntu', 'university of']
        needs_universities = any(kw in msg_lower for kw in specific_uni_keywords)

        if target_university:
            context_parts.append(_format_target_university_context(target_university))
            estimate = compute_admission_estimate(profile or {}, portfolio or [], target_university)
            context_parts.append(_format_estimate_context(estimate))
        elif needs_universities:
            context_parts.append(_format_universities_context(universities))

    if recommendations:
        context_parts.append(_format_recommendations_context(recommendations))

    if roadmap:
        context_parts.append(_format_roadmap_context(roadmap))

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
    max_tokens = BASE_MAX_TOKENS
    for attempt in range(MAX_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
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
                        "max_tokens": max_tokens,
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

            if response.status_code == 402:
                # Token limit exceeded - reduce max_tokens and retry
                if attempt < MAX_RETRIES - 1:
                    max_tokens = max_tokens // 2
                    logger.warning(
                        f"AI provider token limit (402). Reducing max_tokens to {max_tokens} "
                        f"and retrying (attempt {attempt + 1}/{MAX_RETRIES})"
                    )
                    await asyncio.sleep(RETRY_DELAY_BASE)
                    continue
                else:
                    logger.error(f"AI provider error: status=402, token limit exceeded even after retries")
                    raise HTTPException(
                        status_code=502,
                        detail="AI service error: token limit",
                    )

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
            logger.error("AI provider error: timeout")
            last_error = "timeout"
        except httpx.ConnectError:
            logger.error("AI provider error: connection failed")
            last_error = "connection"
        except httpx.ReadTimeout:
            logger.error("AI provider error: read timeout")
            last_error = "timeout"

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
    academic = profile.get("academicInfo")
    if academic:
        if academic.get("intendedMajor"):
            parts.append(f"Major: {academic['intendedMajor']}")
        if academic.get("gpa"):
            parts.append(f"GPA: {academic['gpa']}")
        if academic.get("sat"):
            parts.append(f"SAT: {academic['sat']}")
        if academic.get("ielts"):
            parts.append(f"IELTS: {academic['ielts']}")
    return "; ".join(parts) if parts else "Профиль пуст"


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


def _format_recommendations_context(recommendations: list[dict]) -> str:
    if not recommendations:
        return "ULYS Match: рекомендации не найдены — профиль может быть неполным."
    recs = recommendations[:5]
    lines = ["ULYS MATCH RECOMMENDATIONS:"]
    for rec in recs:
        score = rec.get("match_score", 0)
        category = rec.get("category", "")
        name = rec.get("name", "?")
        country = rec.get("country", "")
        program = rec.get("program", "")
        reasons = rec.get("reasons", [])
        gaps = rec.get("gaps", [])
        next_actions = rec.get("next_actions", [])

        lines.append(f"  - {name} ({country}), программа: {program}")
        lines.append(f"    Match Score: {score}% | Категория: {category}")
        lines.append(f"    Причины: {'; '.join(reasons[:3]) if reasons else 'нет данных'}")
        if gaps:
            lines.append(f"    Пробелы: {'; '.join(gaps[:3])}")
        if next_actions:
            lines.append(f"    След. действия: {'; '.join(next_actions[:3])}")
    return "\n".join(lines)


def _format_roadmap_context(roadmap: dict) -> str:
    tasks = roadmap.get("tasks", [])
    next_best = roadmap.get("next_best_action")
    completeness = roadmap.get("profile_completeness", 0)

    lines = [
        "ROADMAP:",
        f"  Полнота профиля: {completeness}%",
        f"  Всего задач: {len(tasks)}",
    ]

    if next_best:
        lines.append("")
        lines.append("  СЛЕДУЮЩИЙ ШАГ (Next Best Action):")
        lines.append(f"    Задача: {next_best.get('title', '')}")
        lines.append(f"    Категория: {next_best.get('category', '')}")
        lines.append(f"    Приоритет: {next_best.get('priority', '')}")
        target_date = next_best.get("target_date")
        if target_date:
            lines.append(f"    Срок: {target_date}")
        lines.append(f"    Причина: {next_best.get('reason', '')}")

    if tasks:
        lines.append("")
        lines.append("  АКТИВНЫЕ ЗАДАЧИ:")
        for t in tasks[:8]:
            status = t.get("status", "pending")
            if status == "completed":
                continue
            lines.append(
                f"    - [{t.get('priority', '')}] {t.get('title', '')} "
                f"(категория: {t.get('category', '')}, статус: {status}, "
                f"срок: {t.get('target_date', 'не указан')})"
            )

    return "\n".join(lines)


def _format_universities_context(universities: list[dict]) -> str:
    if not universities:
        return "Университеты: не указаны"
    universities = universities[:2]
    lines = []
    for uni in universities:
        parts = [uni.get('name', '?')]
        if uni.get("country"):
            parts.append(uni['country'])
        if uni.get("satRequirements"):
            parts.append(f"SAT={uni['satRequirements']}")
        if uni.get("gpaRequirements"):
            parts.append(f"GPA={uni['gpaRequirements']}")
        lines.append("; ".join(parts))
    return "Университеты: " + " | ".join(lines)


def _format_target_university_context(university: dict) -> str:
    parts = [f"ТАРГЕТ: {university.get('name', '?')}"]
    if university.get("country"):
        parts.append(f"Страна: {university['country']}")
    if university.get("location"):
        parts.append(f"Локация: {university['location']}")
    if university.get("majors"):
        parts.append(f"Программы: {', '.join(university['majors'][:2])}")
    if university.get("languageRequirements"):
        parts.append(f"Язык: {university['languageRequirements']}")
    if university.get("satRequirements"):
        parts.append(f"SAT: {university['satRequirements']}")
    if university.get("gpaRequirements"):
        parts.append(f"GPA: {university['gpaRequirements']}")
    if university.get("scholarshipAvailability"):
        parts.append("Стипендия: есть")
    if university.get("tuition"):
        parts.append(f"Tuition: {university['tuition']}")
    return "\n".join(parts)


def _format_estimate_context(estimate: dict) -> str:
    if not estimate.get("available"):
        return ""
    parts = [
        "FIT SCORE:",
        f"  Profile-University Fit: {estimate['min']}–{estimate['max']}",
        f"  Confidence: {estimate['confidence']}",
    ]
    if estimate.get("factors"):
        parts.append(f"  Strengths: {', '.join(estimate['factors'][:4])}")
    if estimate.get("gaps"):
        parts.append(f"  Gaps: {', '.join(estimate['gaps'][:4])}")
    return "\n".join(parts)


