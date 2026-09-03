import asyncio
import logging
import httpx
from fastapi import HTTPException
from app.config import settings


logger = logging.getLogger(__name__)


MAX_RETRIES = 5
RETRY_DELAY_BASE = 3  # seconds, doubled each retry


SYSTEM_PROMPT = """Ты — ULIE, ИИ-наставник для школьников на платформе ULYS. Ты помогаешь студентам находить возможности, улучшать портфолио и готовиться к поступлению в университет.

Твой стиль:
- Дружелюбный, поддерживающий, как старший друг или ментор
- Конкретный и практичный
- Пиши на русском языке
- Короткие ответы, без воды
- Давай конкретные шаги и рекомендации

Форматирование ответов:
- Используй Markdown для структуры: #, ##, ###, **bold**, -, 1., `code`, >
- Начинай с короткого введения (1-2 предложения)
- Разбивай длинные ответы на секции с заголовками ##
- Используй короткие абзацы (1-3 предложения)
- Используй списки для перечислений более чем из 3 пунктов
- Используй эмодзи экономно (примерно 1 на секцию): 🎯💡🚀📚🏆⚙️⚠️✅
- Выделяй важные числа **жирным**: **1st place**, **200+ participants**
- Заканчивай с **конкретным следующим шагом**

Структура для подробных ответов:
## 🔥 Основной заголовок

Краткое вступление.

### 💻 Секция 1
Краткое описание.

* Пункт 1
* Пункт 2
* Пункт 3

### 🎯 Next step
**Действие:** Выбери один пункт и пришли мне детали.

Для простых вопросов: отвечай в 2-5 предложений.
Для портфолио: используй ### Strengths, ### Weaknesses, ### What to improve, ### 🎯 Next step

Не используй HTML, таблицы (только если действительно улучшают понимание), или чрезмерное форматирование.

Если у студента есть цели, интересы или портфолио, учитывай их в ответах.

ВАЖНЫЕ ПРАВИЛА — НИКОГДА не нарушай:
1. Никогда не выдумывай факты, цифры, сертификаты, дипломы, баллы SAT/IELTS/GPA или другие данные, которых нет в профиле студента.
2. Никогда не придумывай требования университетов, acceptance rate, средние баллы или другие статистические данные, если они не переданы в контексте.
3. Никогда не выдавай ИИ-оценку или процент поступления как проверенную статистику.
4. Если данных недостаточно, скажи прямо: «Недостаточно данных для оценки» или «Этого не указано в твоём профиле».
5. Никогда не придумывай возможности, конкурсы, дедлайны или организации, которые не переданы в контексте.
6. Если профиль пустой — попроси добавить информацию в портфолио и профиль.
7. Опираться ТОЛЬКО на переданные данные о профиле и портфолие. Никаких «наведённых» предположений.
8. Если спрашивают о шансах поступления — объясняй: насколько профиль соответствует требованиям, какие есть strengths и gaps, что нужно улучшить. Никогда не выдавай процент как «chance of admission».
9. Никогда не упоминай конкретные даты дедлайнов, если они не переданы в контексте."""


async def get_mentor_response(
    student_message: str,
    conversation_history: list[dict],
    profile: dict | None = None,
    portfolio: list[dict] | None = None,
    universities: list[dict] | None = None,
) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if profile or portfolio or universities:
        context_parts = []
        if profile:
            context_parts.append(_format_profile_context(profile))
        if portfolio:
            context_parts.append(_format_portfolio_context(portfolio))
        if universities:
            context_parts.append(_format_universities_context(universities))
        messages.append({
            "role": "system",
            "content": f"""Контекст студента:
{chr(10).join(context_parts)}""",
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
                        "Authorization": f"Bearer {settings.AI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.AI_MODEL,
                        "messages": messages,
                        "max_tokens": 1024,
                        "temperature": 0.7,
                    },
                )

            if response.status_code == 429:
                # Rate limited — wait and retry with exponential backoff
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
                # Safe error logging: status code + sanitized message only
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

        # If not a 429 (handled above by continue), retry on timeout/connection errors
        if attempt < MAX_RETRIES - 1 and last_error:
            delay = RETRY_DELAY_BASE * (2 ** attempt)
            logger.warning(
                f"Retrying after {last_error} in {delay}s "
                f"(attempt {attempt + 1}/{MAX_RETRIES})"
            )
            await asyncio.sleep(delay)

    # Exhausted all retries
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
    for item in portfolio:
        line = f"- [{item.get('section', '?')}] {item.get('title', '')}"
        if item.get("date"):
            line += f" ({item['date']})"
        if item.get("description"):
            line += f" — {item['description']}"
        lines.append(line)
    return "\n".join(lines)


def _format_universities_context(universities: list[dict]) -> str:
    if not universities:
        return "Университеты: не указаны"
    lines = ["Университеты и их требования:"]
    for uni in universities:
        line = f"  - {uni.get('name', '?')}: "
        if uni.get("languageRequirements"):
            line += f"язык={uni['languageRequirements']}; "
        if uni.get("satRequirements"):
            line += f"SAT/ACT={uni['satRequirements']}; "
        if uni.get("gpaRequirements"):
            line += f"GPA={uni['gpaRequirements']}; "
        if uni.get("majors"):
            line += f"majors={', '.join(uni['majors'])}"
        lines.append(line)
    return "\n".join(lines)
