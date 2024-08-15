from fuzzywuzzy import fuzz
from typing import Optional, Union
from db.models import ValidatorType, TaskInstance, ModelGradedConfig
from models.model_provider import (
    query,
    ModelQueryInput,
    ModelProviderType,
    ModelProvider,
)
from controllers.model_graded_utils import get_model_grader_prompt, get_choice


def validator_exact_match(ideal_response, model_response):
    """Return if the two response match exactly"""
    return ideal_response == model_response


def validator_fuzzy_match(ideal_response, model_response):
    """Return if the two strings are similar based on Levenstein distance"""
    return fuzz.ratio(ideal_response, model_response) > 90


def validator_includes(ideal_response, model_response):
    """Return if the ideal response is included in the model response"""
    return ideal_response in model_response


def validator_model_graded(
    task_instance: TaskInstance,
    model_response: str,
    model_graded_config: ModelGradedConfig,
) -> float:
    """Validate the response based on the model graded config. Return a score based on the choice."""
    model_provider = ModelProviderType[
        model_graded_config.model.model_developer.upper()
    ]
    grader_promopt = get_model_grader_prompt(
        task_instance, model_graded_config, model_response
    )
    grader_model_query = ModelQueryInput(
        model_provider=model_provider,
        model_name=model_graded_config.model.model_name,
        input_message=grader_promopt,
        temperature=0,
        max_tokens=4096,
        stop_sequences=["<END>"],
        api_key=ModelProvider._api_key(model_provider=model_provider),
    )
    [_, grader_output] = query(grader_model_query)
    print(f"Model Response: {model_response}\n\n")
    print(f"Grader Output: {grader_output.value}\n\n")
    print("************\n\n")
    choice = get_choice(
        grader_output.value,
        model_graded_config.model_grader_eval_type,
        model_graded_config.choice_strings,
    )
    score = model_graded_config.choice_scores[choice]
    return score


def validate_response(
    validator_type: ValidatorType,
    task_instance: TaskInstance,
    model_response: str,
    model_graded_config: Optional[ModelGradedConfig] = None,
) -> Union[bool, float]:
    """Validate the given response based on the validator type"""
    if validator_type == ValidatorType.ExactMatch:
        return validator_exact_match(task_instance.ideal, model_response)
    if validator_type == ValidatorType.FuzzyMatch:
        return validator_fuzzy_match(task_instance.ideal, model_response)
    if validator_type == ValidatorType.Includes:
        return validator_includes(task_instance.ideal, model_response)
    if validator_type == ValidatorType.ModelGraded:
        return validator_model_graded(
            task_instance, model_response, model_graded_config
        )
    raise Exception("Invalid validator")
