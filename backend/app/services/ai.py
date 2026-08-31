import httpx
from app.config import settings


SYSTEM_PROMPT = """Ты — ULIE, ИИ-наставник для школьников на платформе ULYS. Ты помогаешь студентам находить возможности, улучшать портфолио и готовиться к поступлению в университет.

Твой стиль:
- Дружелюбный, поддерживающий, как старший друг или ментор
- Конкретный и практичный
- Пиши на русском языке
- Короткие ответы, без воды
- Давай конкретные шаги и рекомендации

Если у студента есть цели, интересы или портфолио, учитывай их в ответах."""

FALLBACK_RESPONSES = {
    "привет": "Привет! Я ULIE, твой ИИ-наставник. Чем могу помочь? Могу помочь с портфолио, поступлением или найти возможности для тебя.",
    "возможности": "Рекомендую посмотреть вкладку 'Opportunities' — там собраны олимпиады, хакатоны и стажировки. Фильтруй по категориям и сохраняй понравившееся!",
    "портфолио": "Хорошее портфолио — это 5-7 сильных проектов. Добавь достижения из олимпиад, проекты с хакатонов и волонтёрский опыт. Используй раздел 'Portfolio'.",
    "поступление": "Для поступления важны: 1) Средний балл 4.5+, 2) Олимпиадные достижения, 3) Портфолио проектов, 4) Рекомендательные письма. Какой вуз тебя интересует?",
    "default": "Спасибо за вопрос! К сожалению, сервис ИИ временно недоступен. Попробуй спросить о портфолио, возможностях или поступлении — у меня есть базовые рекомендации."
}


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

    # Try to call AI service
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
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

        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
    except (httpx.RequestError, Exception):
        pass

    # Fallback response based on keywords
    msg_lower = student_message.lower()
    for keyword, response in FALLBACK_RESPONSES.items():
        if keyword in msg_lower:
            return response

    return FALLBACK_RESPONSES["default"]


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
