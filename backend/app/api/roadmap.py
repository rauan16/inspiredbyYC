import json
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_db
from app.schemas.roadmap import RoadmapResponse, RoadmapTaskUpdate
from app.services.roadmap import generate_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])


@router.get("", response_model=RoadmapResponse)
async def get_roadmap(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    conn = get_db()

    profile_row = conn.execute(
        "SELECT * FROM profiles WHERE id = ?", (user_id,)
    ).fetchone()

    if profile_row is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    interests_raw = profile_row["interests"]
    if isinstance(interests_raw, str):
        try:
            interests = json.loads(interests_raw)
        except (json.JSONDecodeError, TypeError):
            interests = []
    else:
        interests = interests_raw or []

    goals_raw = profile_row["goals"]
    if isinstance(goals_raw, str):
        try:
            goals = json.loads(goals_raw)
        except (json.JSONDecodeError, TypeError):
            goals = []
    else:
        goals = goals_raw or []

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
        "id": user_id,
        "name": profile_row["name"],
        "grade": profile_row["grade"],
        "location": profile_row["location"],
        "bio": profile_row["bio"],
        "interests": interests,
        "goals": goals,
        "academicInfo": academic_info,
    }

    portfolio_rows = conn.execute(
        "SELECT section, title, subtitle, date, description FROM portfolio_items WHERE user_id = ? ORDER BY sort_order ASC",
        (user_id,),
    ).fetchall()
    portfolio = [
        {"section": row["section"], "title": row["title"], "subtitle": row["subtitle"], "date": row["date"], "description": row["description"]}
        for row in portfolio_rows
    ]

    # Get persisted task statuses
    task_status_rows = conn.execute(
        "SELECT task_id, status FROM roadmap_task_status WHERE user_id = ?",
        (user_id,),
    ).fetchall()
    conn.close()

    persisted_status = {row["task_id"]: row["status"] for row in task_status_rows}

    roadmap = generate_roadmap(profile, portfolio)

    # Apply persisted statuses to generated tasks
    for task in roadmap.tasks:
        if task.id in persisted_status:
            task.status = persisted_status[task.id]

    # Recompute next_best_action with updated statuses
    from app.services.roadmap import select_next_best_action
    roadmap.next_best_action = select_next_best_action(roadmap.tasks)

    return roadmap


@router.patch("/tasks/{task_id}", response_model=dict)
async def update_task_status(
    task_id: str,
    update: RoadmapTaskUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    new_status = update.status.value if update.status else "pending"
    
    conn = get_db()
    conn.execute(
        """INSERT INTO roadmap_task_status (id, user_id, task_id, status) 
           VALUES (?, ?, ?, ?)
           ON CONFLICT(user_id, task_id) DO UPDATE SET status = excluded.status, updated_at = CURRENT_TIMESTAMP""",
        (f"rts_{user_id}_{task_id}", user_id, task_id, new_status),
    )
    conn.commit()
    conn.close()
    
    return {"id": task_id, "status": new_status, "updated": True}