import logging
import httpx
from fastapi import HTTPException
from app.config import settings


logger = logging.getLogger(__name__)


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

Если у студента есть цели, интересы или портфолио, учитывай их в ответах."""


async def get_mentor_response(
    student_message: str,
    conversation_history: list[dict],
    profile: dict | None = None,
    portfolio: list[dict] | None = None,
) -> str:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    if profile:
        profile_context = _format_profile_context(profile)
        if portfolio:
            portfolio_context = _format_portfolio_context(portfolio)
            messages.append({
                "role": "system",
                "content": f"Контекст студента:\n{profile_context}\n\nПортфолио студента:\n{portfolio_context}",
            })
        else:
            messages.append({
                "role": "system",
                "content": f"Контекст студента:\n{profile_context}",
            })

    for msg in conversation_history[-20:]:
        role = "assistant" if msg.get("role") == "mentor" else "user"
        messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": student_message})

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
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
        except httpx.TimeoutException:
            logger.error("AI provider error: timeout (60s)")
            raise HTTPException(
                status_code=502,
                detail="AI service timed out. Please try again later.",
            )
        except httpx.ConnectError as e:
            logger.error("AI provider error: connection failed")
            raise HTTPException(
                status_code=502,
                detail="AI service unavailable. Please try again later.",
            )

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
        # Propagate upstream error details for diagnostics (status + safe message)
        raise HTTPException(
            status_code=502,
            detail=f"AI service error: upstream status={response.status_code}",
            headers={"X-AI-Error-Message": safe_detail[:200]} if safe_detail else {},
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
    return "\n".join(parts) if parts else "Профиль не заполнен"


def _format_portfolio_context(portfolio: list[dict]) -> str:
    if not portfolio:
        return "Портфолио пустое"
    lines = []
    for item in portfolio:
        line = f"- [{item.get('section', '?')}] {item.get('title', '')}"
        if item.get("date"):
            line += f" ({item['date']})"
        lines.append(line)
    return "\n".join(lines)
