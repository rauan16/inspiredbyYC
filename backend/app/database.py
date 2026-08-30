import httpx
from app.config import settings


def get_supabase_rest_url() -> str:
    return f"{settings.SUPABASE_URL}/rest/v1"


async def supabase_request(
    method: str,
    path: str,
    user_token: str | None = None,
    params: dict | None = None,
    json: dict | list | None = None,
    prefer: str = "",
) -> httpx.Response:
    url = f"{get_supabase_rest_url()}/{path}"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
    }
    if user_token:
        headers["Authorization"] = f"Bearer {user_token}"
    else:
        headers["Authorization"] = f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}"

    if prefer:
        headers["Prefer"] = prefer

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=json,
        )
    return response
