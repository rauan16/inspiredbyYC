import httpx
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.config import settings
from app.schemas.auth import AuthResponse, LoginRequest, SignupRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignupRequest):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/signup",
                headers={
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": request.email,
                    "password": request.password,
                    "data": {"name": request.name},
                },
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unavailable",
        )

    if response.status_code not in (200, 201):
        detail = response.json().get("msg", "Signup failed")
        raise HTTPException(
            status_code=response.status_code,
            detail=detail,
        )

    data = response.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    user = data.get("user", {})

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No access token returned",
        )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.get("id", ""),
            email=user.get("email"),
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password",
                headers={
                    "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": request.email,
                    "password": request.password,
                },
            )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Auth service unavailable",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    data = response.json()
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    user = data.get("user", {})

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No access token returned",
        )

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse(
            id=user.get("id", ""),
            email=user.get("email"),
        ),
    )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user.get("id", ""),
        email=current_user.get("email"),
    )
