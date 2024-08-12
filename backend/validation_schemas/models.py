from pydantic import BaseModel, Field


class ModelSchema(BaseModel):
    id: int
    model_developer: str = Field(..., serialization_alias="modelDeveloper")
    model_name: str = Field(..., serialization_alias="modelName")
