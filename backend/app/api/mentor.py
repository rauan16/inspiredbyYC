from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.mentor import MentorMessageCreate, MentorMessageResponse
from app.services.ai import get_mentor_response

router = APIRouter(prefix="/api/mentor", tags=["mentor"])


@router.get("/messages", response_model=list[MentorMessageResponse])
async def get_messages(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    response = await supabase_request(
        method="GET",
        path="mentor_messages",
        user_token=current_user.get("token"),
        params={
            "user_id": f"eq.{user_id}",
            "select": "*",
            "order": "created_at.asc",
        },
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch messages",
        )

    return [_map_message(item) for item in response.json()]


@router.post("/messages", response_model=MentorMessageResponse)
async def send_message(
    message: MentorMessageCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]

    student_response = await supabase_request(
        method="POST",
        path="mentor_messages",
        user_token=current_user.get("token"),
        json={
            "user_id": user_id,
            "role": "student",
            "content": message.content,
        },
        prefer="return=representation",
    )

    if student_response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save message",
        )

    history_response = await supabase_request(
        method="GET",
        path="mentor_messages",
        user_token=current_user.get("token"),
        params={
            "user_id": f"eq.{user_id}",
            "select": "role,content",
            "order": "created_at.asc",
        },
    )

    conversation_history = []
    if history_response.status_code == 200:
        for msg in history_response.json():
            if msg.get("role") in ("student", "mentor"):
                conversation_history.append(msg)

    profile_response = await supabase_request(
        method="GET",
        path="profiles",
        user_token=current_user.get("token"),
        params={"id": f"eq.{user_id}", "select": "*"},
    )

    profile = None
    if profile_response.status_code == 200 and profile_response.json():
        profile = profile_response.json()[0]

    portfolio_response = await supabase_request(
        method="GET",
        path="portfolio_items",
        user_token=current_user.get("token"),
        params={
            "user_id": f"eq.{user_id}",
            "select": "section,title,date",
            "order": "sort_order.asc",
        },
    )

    portfolio = []
    if portfolio_response.status_code == 200:
        portfolio = portfolio_response.json()

    ai_content = await get_mentor_response(
        student_message=message.content,
        conversation_history=conversation_history,
        profile=profile,
        portfolio=portfolio,
    )

    mentor_response = await supabase_request(
        method="POST",
        path="mentor_messages",
        user_token=current_user.get("token"),
        json={
            "user_id": user_id,
            "role": "mentor",
            "content": ai_content,
        },
        prefer="return=representation",
    )

    if mentor_response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save mentor response",
        )

    data = mentor_response.json()
    if isinstance(data, list) and data:
        return _map_message(data[0])

    return MentorMessageResponse(
        id="",
        role="mentor",
        content=ai_content,
    )


def _map_message(item: dict) -> MentorMessageResponse:
    return MentorMessageResponse(
        id=item.get("id", ""),
        role=item.get("role", ""),
        content=item.get("content", ""),
        actions=item.get("actions"),
        created_at=str(item.get("created_at", "")),
    )
