from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.opportunity import OpportunityResponse

router = APIRouter(prefix="/api/saved-opportunities", tags=["saved-opportunities"])


class SaveRequest(BaseModel):
    opportunity_id: str


@router.get("", response_model=list[OpportunityResponse])
async def list_saved_opportunities(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    response = await supabase_request(
        method="GET",
        path="saved_opportunities",
        user_token=current_user.get("token"),
        params={
            "user_id": f"eq.{user_id}",
            "select": "opportunity_id,opportunities(*)",
            "order": "created_at.desc",
        },
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch saved opportunities",
        )

    opportunities = []
    for item in response.json():
        opp = item.get("opportunities")
        if opp:
            opportunities.append(_map_saved_opportunity(opp))
    return opportunities


@router.post("", status_code=status.HTTP_201_CREATED)
async def save_opportunity(
    request: SaveRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    response = await supabase_request(
        method="POST",
        path="saved_opportunities",
        user_token=current_user.get("token"),
        json={"user_id": user_id, "opportunity_id": request.opportunity_id},
        prefer="return=minimal",
    )

    if response.status_code not in (200, 201):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save opportunity",
        )

    return {"message": "Opportunity saved"}


@router.delete("/{opportunity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unsave_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    response = await supabase_request(
        method="DELETE",
        path="saved_opportunities",
        user_token=current_user.get("token"),
        params={"user_id": f"eq.{user_id}", "opportunity_id": f"eq.{opportunity_id}"},
    )

    if response.status_code not in (200, 204):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to unsave opportunity",
        )


def _map_saved_opportunity(item: dict) -> OpportunityResponse:
    return OpportunityResponse(
        id=item.get("id", ""),
        title=item.get("title", ""),
        organization=item.get("organization", ""),
        category=item.get("category", ""),
        category_label=item.get("category_label"),
        deadline=item.get("deadline"),
        location=item.get("location"),
        format=item.get("format"),
        eligibility=item.get("eligibility"),
        description=item.get("description"),
        requirements=item.get("requirements"),
        timeline=item.get("timeline"),
        color=item.get("color"),
        website=item.get("website"),
        recommended=item.get("recommended"),
    )
