from fastapi import APIRouter
from version import OPENEVALS_VERSION
from controllers.evals import ModelQueryInput
from models.model_provider import (
    query,
    ModelQueryInput,
    ModelProviderType,
    ModelProvider,
    ModelProviderValidationModel,
)
from validation_schemas.validate_keys import (
    AIKeyValidationSchema,
    AIKeyValidationResponseSchema,
)

validate_keys_router = APIRouter()


@validate_keys_router.post(
    "/{provider}", response_model=AIKeyValidationResponseSchema, status_code=200
)
def validate_key(provider: str, body: AIKeyValidationSchema) -> dict:
    """
    Validate a key for a given provider
    """
    model_provider = ModelProviderType[provider.upper()]
    model_query = ModelQueryInput(
        model_provider=model_provider,
        model_name=ModelProviderValidationModel[model_provider],
        system_message="You are an instruction follower",
        input_message="Say this is a test",
        temperature=0,
        max_tokens=4096,
        stop_sequences=["<END>"],
        api_key=body.key,
    )
    model_input, model_response = query(input=model_query)
    print(model_input)
    print(model_response)

    return {"is_valid": True}
