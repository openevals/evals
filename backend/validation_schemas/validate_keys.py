from pydantic import BaseModel, Field


class AIKeyValidationSchema(BaseModel):
    key: str


class AIKeyValidationResponseSchema(BaseModel):
    is_valid: bool = Field(..., serialization_alias="isValid")
