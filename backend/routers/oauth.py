from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi import HTTPException
import uuid
from backend.db.db import get_db
from backend.db.models import OAuth2Sates, User
from backend.validation_schemas.oauth import (
    StateResponseSchema,
    CodeExchangeSchema,
    OAuthTokenResponseSchema,
)
from backend.controllers.github import (
    exchange_auth_code,
    get_user_info,
    get_user_emails,
)
from backend.controllers.jwt import generate_tokens, validate_refresh_token

oauth_router = APIRouter()


@oauth_router.get("/state", response_model=StateResponseSchema, status_code=200)
async def oauth_generate_state(db: Session = Depends(get_db)) -> dict:
    """
    Generate new random state code
    """
    hash = str(uuid.uuid4())
    new_state = OAuth2Sates(state=hash)
    db.add(new_state)
    db.commit()
    return new_state


@oauth_router.post("/token", response_model=OAuthTokenResponseSchema, status_code=200)
async def oauth_token(code: CodeExchangeSchema, db: Session = Depends(get_db)) -> dict:
    """
    Exchange authorization code by access token
    """
    # Validate the state
    state = db.query(OAuth2Sates).filter(OAuth2Sates.state == code.state).first()
    if not state:
        raise HTTPException(
            status_code=401, detail={"error": "invalid-authorization-state"}
        )

    # Clear the state
    db.delete(state)
    db.commit()

    # Exchange authorization code by access token
    response = await exchange_auth_code(code.code)

    # Get Github user information
    user_info = await get_user_info(response.get("access_token"))
    user_emails = await get_user_emails(response.get("access_token"))

    # Extract user primary email
    primary_email = next((obj for obj in user_emails if obj.get("primary")), None)
    if primary_email == None:
        if len(user_emails) > 0:
            primary_email = user_emails[0]
        else:
            raise HTTPException(
                status_code=401, detail={"error": "user-dont-have-email"}
            )

    # Search user by Github user ID
    user = db.query(User).filter(User.github_id == user_info.get("id")).first()
    if not user:
        # User don't exists, new one is created
        user = User(
            username=user_info.get("name"),
            email=primary_email.get("email"),
            github_access_token=response.get("access_token"),
            github_id=user_info.get("id"),
            github_login=user_info.get("login"),
            github_avatar=user_info.get("avatar_url"),
        )
        db.add(user)
    else:
        user.username = user_info.get("name")
        user.email = primary_email.get("email")
        user.github_access_token = response.get("access_token")
        user.github_login = user_info.get("login")
        user.github_avatar = user_info.get("avatar_url")

    # Update all user changes to database
    db.commit()

    # Generate the access/refresh tokens pair
    (access_token, refresh_token) = generate_tokens(user)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "profile": user,
    }


@oauth_router.post("/refresh", response_model=OAuthTokenResponseSchema, status_code=200)
async def oauth_refresh(auth: dict = Depends(validate_refresh_token)) -> dict:
    """
    Refresh an access token for new access/refresh pair
    """
    # Generate the access/refresh tokens pair
    print(auth)
    (access_token, refresh_token) = generate_tokens(auth["user"])

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "profile": auth["user"],
    }
