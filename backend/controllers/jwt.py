import os
import base64
from fastapi import FastAPI, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
from jwt import PyJWTError, ExpiredSignatureError
from backend.db.db import get_db
from backend.db.models import User

# Get JWT private/public key
private_key = base64.b64decode(os.getenv("PRIVATE_KEY")).decode()
public_key = base64.b64decode(os.getenv("PUBLIC_KEY")).decode()

# Define keys parameters
TOKEN_AUD_ISS = os.getenv("WEB_URL")
TOKEN_AUDIENCE = os.getenv("WEB_URL")
ACCESS_TOKEN_TTL = 7
REFRESH_TOKEN_TTL = 30
TOKEN_SECURITY = HTTPBearer()


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


def validate_token(
    http_auth: HTTPAuthorizationCredentials = Security(TOKEN_SECURITY),
    db: Session = Depends(get_db),
):
    """Validate the access token"""
    try:
        payload = jwt.decode(
            http_auth.credentials,
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
