from pydantic import BaseModel, Field
from typing import Optional, List
from backend.db.models import ValidatorType


class ModelSchema(BaseModel):
    model_id: int = Field(..., alias='modelId')
    system_prompt: Optional[str] = Field(..., alias='systemPrompt')
    user_prompt: Optional[str] = Field(..., alias='userPrompt')
    validator_type: ValidatorType = Field(..., alias='validatorType')


class TaskInstanceSchema(BaseModel):
    is_public: bool = Field(default=False, alias='isPublic')
    input: str
    ideal: str


class EvalSchema(BaseModel):
    name: str
    description: Optional[str]
    validator_type: ValidatorType = Field(..., alias='validatorType')
    task_instances: List[TaskInstanceSchema] = Field(
        ..., alias='taskInstances')
    system_prompt: Optional[str] = Field(..., alias='systemPrompt')
    user_prompt: Optional[str] = Field(..., alias='userPrompt')
    models: List[ModelSchema]


class EvalResponseSchema(BaseModel):
    id: int
