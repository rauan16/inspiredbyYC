from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.auth import get_current_user
from app.database import supabase_request
from app.schemas.opportunity import OpportunityResponse

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])


@router.get("", response_model=list[OpportunityResponse])
async def list_opportunities(
    category: str | None = None,
    format: str | None = None,
    search: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    params = {"select": "*", "order": "deadline.asc"}
    if category:
        params["category"] = f"eq.{category}"
    if format:
        params["format"] = f"eq.{format}"
    if search:
        params["or"] = f"(title.ilike.*{search}*,organization.ilike.*{search}*)"

    response = await supabase_request(
        method="GET",
        path="opportunities",
        user_token=current_user.get("token"),
        params=params,
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch opportunities",
        )

    opportunities = []
    for item in response.json():
        opportunities.append(_map_opportunity(item))
    return opportunities


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
async def get_opportunity(
    opportunity_id: str,
    current_user: dict = Depends(get_current_user),
):
    response = await supabase_request(
        method="GET",
        path="opportunities",
        user_token=current_user.get("token"),
        params={"id": f"eq.{opportunity_id}", "select": "*"},
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch opportunity",
        )

    data = response.json()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Opportunity not found",
        )

    return _map_opportunity(data[0])


def _map_opportunity(item: dict) -> OpportunityResponse:
    timeline = item.get("timeline")
    if isinstance(timeline, str):
        import json
        try:
            timeline = json.loads(timeline)
        except Exception:
            timeline = None

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
        timeline=timeline,
        color=item.get("color"),
        website=item.get("website"),
        recommended=item.get("recommended"),
    )
