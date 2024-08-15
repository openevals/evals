from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from backend.db.models import ValidatorType, EvalRunStatus
from backend.validation_schemas.models import ModelSchema


class ModelSystemSchema(BaseModel):
    model_id: int = Field(..., alias="modelId")
    system_prompt: Optional[str] = Field(..., alias="systemPrompt")
    user_prompt: Optional[str] = Field(..., alias="userPrompt")


class TaskInstanceSchema(BaseModel):
    is_public: bool = Field(default=False, alias="isPublic")
    input: str
    ideal: str


class EvalSchema(BaseModel):
    name: str
    description: Optional[str]
    validator_type: ValidatorType = Field(..., alias="validatorType")
    task_instances: List[TaskInstanceSchema] = Field(..., alias="taskInstances")
    model_systems: List[ModelSystemSchema] = Field(..., alias="modelSystems")


class ModelSystemResponseSchema(BaseModel):
    id: int
    model_id: int = Field(..., serialization_alias="modelId")
    system_prompt: Optional[str] = Field(..., serialization_alias="systemPrompt")
    user_prompt: Optional[str] = Field(..., serialization_alias="userPrompt")


class TaskInstanceResponseSchema(BaseModel):
    id: int
    is_public: bool = Field(default=False, serialization_alias="isPublic")
    input: str
    ideal: str


class EvalAuthorResponse(BaseModel):
    username: str
    github_id: int = Field(..., serialization_alias="githubId")
    github_login: str = Field(..., serialization_alias="githubLogin")
    github_avatar: str = Field(..., serialization_alias="githubAvatar")


class EvalResponseSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    validator_type: ValidatorType = Field(..., serialization_alias="validatorType")
    task_instances: List[TaskInstanceResponseSchema] = Field(
        ..., serialization_alias="taskInstances"
    )
    eval_runs: List[ModelSystemResponseSchema] = Field(
        ..., serialization_alias="modelSystems"
    )
    authors: List[EvalAuthorResponse]
    upvotes: int


class EvalListItemResponseSchema(BaseModel):
    id: int
    name: str
    description: Optional[str]
    validator_type: ValidatorType = Field(..., serialization_alias="validatorType")


class TaskInstanceOutputResponseSchema(BaseModel):
    id: int
    output: str
    status: EvalRunStatus
    task_instance_id: int = Field(..., serialization_alias="taskInstanceId")
    num_tokens: int = Field(..., serialization_alias="numTokens")


class EvalRunResponseSchema(BaseModel):
    id: int
    model: ModelSchema
    system_prompt: Optional[str] = Field(..., serialization_alias="systemPrompt")
    user_prompt: Optional[str] = Field(..., serialization_alias="userPrompt")
    score: float
    datetime: datetime
    validator_type: ValidatorType = Field(..., serialization_alias="validatorType")
    status: EvalRunStatus
    eval_id: int = Field(..., serialization_alias="evalId")
    task_instance_outputs: List[TaskInstanceOutputResponseSchema] = Field(
        ..., serialization_alias="taskInstanceOutputs"
    )


class EvalUpvotesResponseSchema(BaseModel):
    upvotes: int
