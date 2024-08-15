from pydantic import BaseModel, Field
from typing import Optional


class UserProfileResponseSchema(BaseModel):
    username: str
    email: str
    affiliation: Optional[str]
    github_login: str = Field(..., serialization_alias="githubLogin")
    github_avatar: str = Field(..., serialization_alias="githubAvatar")
