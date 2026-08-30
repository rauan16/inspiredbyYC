from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    response = await supabase_request(
        method="GET",
        path="profiles",
        user_token=current_user.get("token"),
        params={"id": f"eq.{user_id}", "select": "*"},
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile",
        )

    data = response.json()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    profile = data[0]
    return ProfileResponse(
        id=profile.get("id"),
        email=profile.get("email"),
        name=profile.get("name"),
        grade=profile.get("grade"),
        location=profile.get("location"),
        bio=profile.get("bio"),
        interests=profile.get("interests"),
        goals=profile.get("goals"),
        portfolio_strength=profile.get("portfolio_strength"),
        avatar_initials=profile.get("avatar_initials"),
    )


@router.patch("", response_model=ProfileResponse)
async def update_profile(
    update: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    update_data = update.model_dump(exclude_unset=True)

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )

    response = await supabase_request(
        method="PATCH",
        path="profiles",
        user_token=current_user.get("token"),
        params={"id": f"eq.{user_id}"},
        json=update_data,
        prefer="return=representation",
    )

    if response.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile",
        )

    if response.status_code == 204:
        return await get_profile(current_user)

    data = response.json()
    if data:
        profile = data[0]
    else:
        return await get_profile(current_user)

    return ProfileResponse(
        id=profile.get("id"),
        email=profile.get("email"),
        name=profile.get("name"),
        grade=profile.get("grade"),
        location=profile.get("location"),
        bio=profile.get("bio"),
        interests=profile.get("interests"),
        goals=profile.get("goals"),
        portfolio_strength=profile.get("portfolio_strength"),
        avatar_initials=profile.get("avatar_initials"),
    )
