import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.mentor import MentorMessageCreate, MentorMessageResponse
from app.services.ai import get_mentor_response

router = APIRouter(prefix="/api/mentor", tags=["mentor"])


@router.get("/messages", response_model=list[MentorMessageResponse])
async def get_messages(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM mentor_messages WHERE user_id = ? ORDER BY created_at ASC",
        (user_id,),
    ).fetchall()
    conn.close()

    return [_map_message(row) for row in rows]


@router.post("/messages", response_model=MentorMessageResponse)
async def send_message(
    message: MentorMessageCreate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    conn = get_db()

    # Save student message
    student_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO mentor_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)",
        (student_id, user_id, "student", message.content),
    )
    conn.commit()

    # Get conversation history
    history_rows = conn.execute(
        "SELECT role, content FROM mentor_messages WHERE user_id = ? ORDER BY created_at ASC",
        (user_id,),
    ).fetchall()

    conversation_history = [
        {"role": row["role"], "content": row["content"]}
        for row in history_rows
    ]

    # Get profile
    profile_row = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()
    profile = None
    if profile_row:
        interests = profile_row["interests"]
        if isinstance(interests, str):
            try:
                interests = json.loads(interests)
            except (json.JSONDecodeError, TypeError):
                interests = []

        goals = profile_row["goals"]
        if isinstance(goals, str):
            try:
                goals = json.loads(goals)
            except (json.JSONDecodeError, TypeError):
                goals = []

        academic_info = None
        if "academic_info" in profile_row.keys():
            raw_academic = profile_row["academic_info"]
            if isinstance(raw_academic, str):
                try:
                    academic_info = json.loads(raw_academic)
                except (json.JSONDecodeError, TypeError):
                    academic_info = None
            elif raw_academic is not None:
                academic_info = raw_academic

        profile = {
            "name": profile_row["name"],
            "grade": profile_row["grade"],
            "location": profile_row["location"],
            "bio": profile_row["bio"],
            "interests": interests or [],
            "goals": goals or [],
            "academicInfo": academic_info,
        }

    # Get portfolio (include description for richer context)
    portfolio_rows = conn.execute(
        "SELECT section, title, date, description FROM portfolio_items WHERE user_id = ? ORDER BY sort_order ASC",
        (user_id,),
    ).fetchall()
    portfolio = [
        {"section": row["section"], "title": row["title"], "date": row["date"], "description": row["description"]}
        for row in portfolio_rows
    ]

    # Get universities data for reference
    uni_rows = conn.execute(
        "SELECT data FROM universities ORDER BY name"
    ).fetchall()
    universities = []
    for row in uni_rows:
        if row["data"]:
            try:
                universities.append(json.loads(row["data"]))
            except (json.JSONDecodeError, TypeError):
                pass

    conn.close()

    # Get AI response
    try:
        ai_content = await get_mentor_response(
            student_message=message.content,
            conversation_history=conversation_history,
            profile=profile,
            portfolio=portfolio,
            universities=universities,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail="AI service unavailable. Please try again later.",
        )

    # Save mentor response
    conn = get_db()
    mentor_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO mentor_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)",
        (mentor_id, user_id, "mentor", ai_content),
    )
    conn.commit()

    row = conn.execute(
        "SELECT * FROM mentor_messages WHERE id = ?", (mentor_id,)
    ).fetchone()
    conn.close()

    return _map_message(row)


def _map_message(row) -> MentorMessageResponse:
    actions = row["actions"]
    if isinstance(actions, str):
        try:
            actions = json.loads(actions)
        except (json.JSONDecodeError, TypeError):
            actions = []

    return MentorMessageResponse(
        id=row["id"],
        role=row["role"],
        content=row["content"],
        actions=actions,
        created_at=str(row["created_at"] or ""),
    )
