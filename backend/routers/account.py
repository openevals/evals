from fastapi import APIRouter, Depends
from backend.validation_schemas.account import UserProfileResponseSchema
from backend.controllers.jwt import validate_token

account_router = APIRouter()


@account_router.get("/me", response_model=UserProfileResponseSchema, status_code=200)
def get_my_profile(auth: dict = Depends(validate_token)) -> dict:
    """
    Get the current user profile
    """
    return auth["user"]
