from pydantic import BaseModel


class ModelSchema(BaseModel):
    id: int
    model_developer: str
    model_name: str
