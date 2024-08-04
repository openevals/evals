from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Type

import google.generativeai as gemini
from anthropic import Anthropic
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


class ModelProvider(ABC):
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
    def query(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
    ) -> tuple[ModelInput, ModelResponse]:
        response = cls.query_model_provider(
            model_name=model_name,
            input_message=input_message,
            temperature=temperature,
            max_tokens=max_tokens,
            stop_sequences=stop_sequences,
        )
        return cls.parse_model_response(
            response=response,
            input_message=input_message,
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
    @classmethod
    def create_client(cls, model_name: str, api_key: str) -> gemini.GenerativeModel:
        gemini.configure(api_key=api_key)
        return gemini.GenerativeModel(model_name)

    @classmethod
    def query(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        stop_sequences: List[str],
        api_key: str,
    ) -> tuple[ModelInput, ModelResponse]:
        response = cls.query_model_provider(
            model_name=model_name,
            input_message=input_message,
            temperature=temperature,
            max_tokens=max_tokens,
            stop_sequences=stop_sequences,
            api_key=api_key,
        )
        return cls.parse_model_response(
            response=response,
            input_message=input_message,
            model_name=model_name,
            api_key=api_key,
        )

    @classmethod
    def query_model_provider(
        cls,
        model_name: str,
        input_message: str,
        temperature: float,
        max_tokens: int,
        api_key: str,
        stop_sequences: List[str],
    ):
        model = cls.create_client(model_name, api_key)
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
        response,
        input_message: str,
        model_name: str,
        api_key: str,
    ) -> tuple[ModelInput, ModelResponse]:
        model = cls.create_client(model_name, api_key)
        model_input = ModelInput(
            value=input_message,
            num_tokens=model.count_tokens(input_message).total_tokens,
        )
        model_response = ModelResponse(
            value=response.text,
            num_tokens=response.usage_metadata.candidates_token_count,
        )
        return model_input, model_response


@dataclass
class BaseModelInput(ABC):
    model_name: str
    input_message: str
    temperature: float
    max_tokens: int
    stop_sequences: List[str]
    api_key: str

    @classmethod
    @abstractmethod
    def get_provider(cls) -> Type[ModelProvider]:
        pass
