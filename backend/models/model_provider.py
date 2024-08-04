import os
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum, auto
from pathlib import Path
from typing import List

import google.generativeai as gemini
from anthropic import Anthropic
from dotenv import load_dotenv
from openai import OpenAI
from openai.types.chat import ChatCompletion


@dataclass
class ModelInput:
    value: str
    num_tokens: int


@dataclass
class ModelResponse:
    value: str
    num_tokens: int


@dataclass
class ModelQueryInput:
    model_provider: "ModelProviderType"
    model_name: str
    input_message: str
    temperature: float
    max_tokens: int
    stop_sequences: List[str]
    api_key: str


class ModelProvider(ABC):
    @classmethod
    def _api_key(cls, model_provider: "ModelProviderType") -> str:
        provider_name = model_provider.name
        env_var = f"{provider_name}_API_KEY"
        current_dir = Path(__file__).resolve().parent
        root_dir = current_dir.parent
        env_path = root_dir / ".env"
        if env_path.is_file():
            load_dotenv(dotenv_path=env_path)
        key = os.getenv(env_var)
        if not key:
            if env_path.is_file():
                raise ValueError(f"{env_var} not set in .env file")
            else:
                raise ValueError(
                    f"{env_var} not set in env vars, .env not found at {env_path}"
                )
        return key

    @classmethod
    def create_client(cls):
        return None

    @classmethod
    @abstractmethod
    def query_model_provider(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
        api_key: str,
    ):
        pass

    @classmethod
    @abstractmethod
    def parse_model_response(
        cls,
        response,
        input_message: str,
    ) -> tuple[ModelInput, ModelResponse]:
        pass

    @classmethod
    def query(cls, input: "ModelQueryInput") -> tuple[ModelInput, ModelResponse]:
        if not input.api_key:
            input.api_key = cls._api_key(input.model_provider)
        response = cls.query_model_provider(
            model_name=input.model_name,
            input_message=input.input_message,
            temperature=input.temperature,
            max_tokens=input.max_tokens,
            stop_sequences=input.stop_sequences,
            api_key=input.api_key,
        )
        provider = MODEL_PROVIDER_MAP[input.model_provider]
        return provider.parse_model_response(
            response=response,
            input_message=input.input_message,
        )


class OpenAIModels(ModelProvider):
    @classmethod
    def create_client(cls, api_key: str) -> OpenAI:
        return OpenAI(api_key=api_key)

    @classmethod
    def query_model_provider(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
        api_key: str,
    ) -> ChatCompletion:
        client = cls.create_client(api_key)
        return client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": input_message}],
            temperature=temperature,
            max_tokens=max_tokens,
            stop=stop_sequences,
        )

    @classmethod
    def parse_model_response(
        cls, response, input_message: str
    ) -> tuple[ModelInput, ModelResponse]:
        model_response = response.choices[0].message.content or ""
        model_input = ModelInput(
            value=input_message,
            num_tokens=response.usage.prompt_tokens,
        )
        model_response = ModelResponse(
            value=model_response,
            num_tokens=response.usage.completion_tokens,
        )
        return model_input, model_response


class AnthropicModels(ModelProvider):
    @classmethod
    def create_client(cls, api_key: str) -> Anthropic:
        return Anthropic(api_key=api_key)

    @classmethod
    def query_model_provider(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
        api_key: str,
    ):
        client = cls.create_client(api_key)
        return client.messages.create(
            model=model_name,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": input_message}],
            stop_sequences=stop_sequences,
        )

    @classmethod
    def parse_model_response(
        cls, response, input_message: str
    ) -> tuple[ModelInput, ModelResponse]:
        model_response = response.content[0].text  # type: ignore
        model_input = ModelInput(
            value=input_message, num_tokens=response.usage.input_tokens
        )
        model_response = ModelResponse(
            value=model_response,
            num_tokens=response.usage.output_tokens,
        )
        return model_input, model_response


class GoogleModels(ModelProvider):
    model_name: str

    @classmethod
    def create_client(cls, model_name: str, api_key: str) -> gemini.GenerativeModel:
        gemini.configure(api_key=api_key)
        return gemini.GenerativeModel(model_name)

    @classmethod
    def query(cls, input: ModelQueryInput) -> tuple[ModelInput, ModelResponse]:
        response = cls.query_model_provider(
            model_name=input.model_name,
            input_message=input.input_message,
            temperature=input.temperature,
            max_tokens=input.max_tokens,
            stop_sequences=input.stop_sequences,
            api_key=input.api_key,
        )
        return cls.parse_model_response(
            response=response,
            input=input,
        )

    @classmethod
    def query_model_provider(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
        api_key: str,
    ) -> gemini.types.GenerateContentResponse:
        model = cls.create_client(model_name=model_name, api_key=api_key)
        return model.generate_content(
            contents=input_message,
            generation_config=gemini.types.GenerationConfig(
                temperature=temperature,
                stop_sequences=stop_sequences,
                max_output_tokens=max_tokens,
            ),
        )

    @classmethod
    def parse_model_response(
        cls,
        response: gemini.types.GenerateContentResponse,
        input: ModelQueryInput,
    ) -> tuple[ModelInput, ModelResponse]:
        model_input = ModelInput(
            value=input.input_message,
            num_tokens=cls.count_tokens(input=input),
        )
        model_response = ModelResponse(
            value=response.text,
            num_tokens=response.usage_metadata.candidates_token_count,
        )
        return model_input, model_response

    @classmethod
    def count_tokens(cls, input: ModelQueryInput) -> int:
        model = cls.create_client(input.model_name, input.api_key)
        return model.count_tokens(input.input_message).total_tokens


class ModelProviderType(Enum):
    OPENAI = auto()
    ANTHROPIC = auto()
    GOOGLE = auto()


MODEL_PROVIDER_MAP = {
    ModelProviderType.OPENAI: OpenAIModels,
    ModelProviderType.ANTHROPIC: AnthropicModels,
    ModelProviderType.GOOGLE: GoogleModels,
}


def query(input: ModelQueryInput) -> tuple[ModelInput, ModelResponse]:
    if not input.api_key:
        input.api_key = ModelProvider._api_key(input.model_provider)
    provider_class = MODEL_PROVIDER_MAP[input.model_provider]
    return provider_class.query(input)