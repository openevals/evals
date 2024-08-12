from pydantic import BaseModel
from typing import Optional, List
from backend.db.models import ValidatorType


class ModelSchema(BaseModel):
    model_id: int
    system_prompt: Optional[str]
    user_prompt: Optional[str]
    validator_type: ValidatorType


class TaskInstanceSchema(BaseModel):
    is_public: bool = False
    input: str
    ideal: str


class EvalSchema(BaseModel):
    name: str
    description: Optional[str]
    validator_type: ValidatorType
    task_instances: List[TaskInstanceSchema]
    system_prompt: Optional[str]
    user_prompt: Optional[str]
    models: List[ModelSchema]


class EvalResponseSchema(BaseModel):
    id: int
