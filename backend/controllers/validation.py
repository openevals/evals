from fuzzywuzzy import fuzz
from backend.db.models import ValidatorType


def validator_exact_match(ideal_response, model_response):
    """Return if the two response match exactly"""
    return ideal_response == model_response


def validator_fuzzy_match(ideal_response, model_response):
    """Return if the two strings are similar based on Levenstein distance"""
    return fuzz.ratio(ideal_response, model_response) > 90


def validator_includes(ideal_response, model_response):
    """Return if the ideal response is included in the model response"""
    return ideal_response in model_response


def validate_response(validator_type, ideal_response, model_response):
    """Validate the given response based on the validator type"""
    if validator_type == ValidatorType.ExactMatch:
        return validator_exact_match(ideal_response, model_response)
    if validator_type == ValidatorType.FuzzyMatch:
        return validator_fuzzy_match(ideal_response, model_response)
    if validator_type == ValidatorType.Includes:
        return validator_includes(ideal_response, model_response)
    raise Exception("Invalid validator")
