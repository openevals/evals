import os
import base64
from fastapi import FastAPI, Request, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
from jwt import PyJWTError, ExpiredSignatureError
from db.db import get_db
from db.models import User
from validation_schemas.oauth import RefreshTokenSchema

# Get JWT private/public key
private_key = base64.b64decode(os.getenv("PRIVATE_KEY")).decode()
public_key = base64.b64decode(os.getenv("PUBLIC_KEY")).decode()

# Define keys parameters
TOKEN_AUD_ISS = os.getenv("WEB_URL")
TOKEN_AUDIENCE = os.getenv("WEB_URL")
ACCESS_TOKEN_TTL = 7
REFRESH_TOKEN_TTL = 30
TOKEN_SECURITY = HTTPBearer()
TOKEN_SECURITY_NO_ERR = HTTPBearer(auto_error=False)


def generate_tokens(user):
    """Generate access/refresh token pairs"""
    token_iat = datetime.utcnow()
    access_token_exp = token_iat + timedelta(days=ACCESS_TOKEN_TTL)
    refresh_token_exp = token_iat + timedelta(days=REFRESH_TOKEN_TTL)
    access_token = jwt.encode(
        {
            "iss": TOKEN_AUD_ISS,
            "aud": TOKEN_AUD_ISS,
            "sub": user.github_id,
            "iat": token_iat,
            "type": "access",
            "uid": user.id,
            "exp": access_token_exp,
        },
        private_key,
        algorithm="RS256",
    )
    refresh_token = jwt.encode(
        {
            "iss": TOKEN_AUD_ISS,
            "aud": TOKEN_AUD_ISS,
            "sub": user.github_id,
            "iat": token_iat,
            "type": "refresh",
            "uid": user.id,
            "exp": refresh_token_exp,
        },
        private_key,
        algorithm="RS256",
    )
    return (access_token, refresh_token)


def check_access_token(token, db):
    """Decode the access token and ensure is valid"""
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=TOKEN_AUD_ISS,
            issuer=TOKEN_AUD_ISS,
        )
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail={"error": "token-expired"})
    except PyJWTError as e:
        print(f"Validation error: {e}")
        raise HTTPException(status_code=401, detail={"error": "invalid-token"})

    if payload["type"] != "access":
        raise HTTPException(status_code=401, detail={"error": "invalid-token"})

    # Look for the associated user
    user = (
        db.query(User)
        .filter(User.id == payload["uid"], User.github_id == payload["sub"])
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=401, detail={"error": "invalid-user-credential"}
        )

    return {"payload": payload, "user": user}


def validate_token(
    http_auth: HTTPAuthorizationCredentials = Security(TOKEN_SECURITY),
    db: Session = Depends(get_db),
):
    """Validate the access token as required"""
    return check_access_token(http_auth.credentials, db)


def validate_optional_token(
    http_auth: HTTPAuthorizationCredentials = Security(TOKEN_SECURITY_NO_ERR),
    db: Session = Depends(get_db),
):
    """Validate the access token as optional"""

    if not http_auth or not http_auth.credentials:
        return {}

    return check_access_token(http_auth.credentials, db)


def validate_refresh_token(
    refresh: RefreshTokenSchema,
    http_auth: HTTPAuthorizationCredentials = Security(TOKEN_SECURITY),
    db: Session = Depends(get_db),
):
    """Validate the refresh token to validate new tokens pair"""
    try:
        # Decode access token ignoring if the token is expired
        access_payload = jwt.decode(
            http_auth.credentials,
            public_key,
            algorithms=["RS256"],
            audience=TOKEN_AUD_ISS,
            issuer=TOKEN_AUD_ISS,
            options={"verify_exp": False},
        )
    except PyJWTError as e:
        print(f"Validation error: {e}")
        raise HTTPException(status_code=401, detail={"error": "invalid-token"})

    if access_payload["type"] != "access":
        raise HTTPException(status_code=401, detail={"error": "invalid-token"})

    try:
        refresh_payload = jwt.decode(
            refresh.refresh_token,
            public_key,
            algorithms=["RS256"],
            audience=TOKEN_AUD_ISS,
            issuer=TOKEN_AUD_ISS,
        )
        if (
            refresh_payload["type"] != "refresh"
            or refresh_payload["iat"] != access_payload["iat"]
            or refresh_payload["sub"] != access_payload["sub"]
        ):
            raise Exception("Token mismatch")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail={"error": "token-expired"})
    except Exception as e:
        print(f"Validation error: {e}")
        raise HTTPException(status_code=401, detail={"error": "invalid-token"})

    # Look for the associated user
    user = (
        db.query(User)
        .filter(
            User.id == refresh_payload["uid"], User.github_id == refresh_payload["sub"]
        )
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=401, detail={"error": "invalid-user-credential"}
        )

    return {"payload": refresh_payload, "user": user}
