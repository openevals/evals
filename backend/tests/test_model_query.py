import pytest
import tiktoken

from backend.models.model_provider import (
    ModelInput,
    ModelProvider,
    ModelProviderType,
    ModelQueryInput,
    ModelResponse,
    query,
)


@pytest.mark.live
def test_openai_request_live() -> None:
    model_query = ModelQueryInput(
        model_provider=ModelProviderType.OPENAI,
        model_name="gpt-4o",
        input_message="The quick brown fox jumps over the lazy dog",
        temperature=0.0,
        max_tokens=10,
        stop_sequences=["<END>"],
        api_key=ModelProvider._api_key(model_provider=ModelProviderType.OPENAI),
    )

    encoding = tiktoken.encoding_for_model(model_query.model_name)
    num_input_tokens = len(encoding.encode(model_query.input_message))

    model_input, model_response = query(input=model_query)

    assert isinstance(model_input, ModelInput)  # nosec B101
    assert isinstance(model_response, ModelResponse)  # nosec B101

    assert (
        model_input.value == "The quick brown fox jumps over the lazy dog"
    )  # nosec B101
    assert (
        model_input.num_tokens - num_input_tokens < 10
    )  # nosec B101 small difference in tokenization given the inclusion of messages List[dict]

    assert model_response.num_tokens > 0  # nosec B101


@pytest.mark.live
@pytest.mark.parametrize(
    "model_provider,model_name",
    [
        (ModelProviderType.OPENAI, "gpt-4o"),
        (ModelProviderType.ANTHROPIC, "claude-3-5-sonnet-20240620"),
        (ModelProviderType.GOOGLE, "gemini-1.5-pro-exp-0801"),
    ],
)
def test_multiple_models(model_provider: ModelProviderType, model_name: str) -> None:
    model_query = ModelQueryInput(
        model_provider=model_provider,
        model_name=model_name,
        input_message="The quick brown fox jumps over the lazy dog",
        temperature=0.0,
        max_tokens=10,
        stop_sequences=["<END>"],
        api_key=ModelProvider._api_key(model_provider=model_provider),
    )

    model_input, model_response = query(input=model_query)

    assert isinstance(model_input, ModelInput)  # nosec B101
    assert isinstance(model_response, ModelResponse)  # nosec B101

    assert (
        model_input.value == "The quick brown fox jumps over the lazy dog"
    )  # nosec B101
    assert model_input.num_tokens > 0  # nosec B101

    assert model_response.num_tokens > 0  # nosec B101