from pydantic import BaseModel, Field
from validation_schemas.account import UserProfileResponseSchema


class StateResponseSchema(BaseModel):
    state: str


class CodeExchangeSchema(BaseModel):
    code: str
    state: str


class OAuthTokenResponseSchema(BaseModel):
    access_token: str = Field(..., serialization_alias="accessToken")
    refresh_token: str = Field(..., serialization_alias="refreshToken")
    profile: UserProfileResponseSchema


class RefreshTokenSchema(BaseModel):
    refresh_token: str = Field(..., alias="refreshToken")
