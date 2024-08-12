import pytest
from fuzzywuzzy import fuzz

from backend.controllers.validation import (
    validator_exact_match,
    validator_fuzzy_match,
    validator_includes,
)


def test_validator_exact_match():
    assert validator_exact_match("hello", "hello") == True
    assert validator_exact_match("hello", "Hello") == False
    assert validator_exact_match("", "") == True
    assert validator_exact_match("hello", "world") == False


@pytest.mark.parametrize(
    "ideal,model,expected",
    [
        ("hello", "hello", True),
        (
            "this string aims to achieve a 90 percent match",
            "this string aims to achieve a 80 percent match",
            True,
        ),
        ("hello", "world", False),
        ("", "", True),
    ],
)
def test_validator_fuzzy_match(ideal, model, expected):
    assert validator_fuzzy_match(ideal, model) == expected


def test_validator_includes():
    assert validator_includes("hello", "hello world") == True
    assert validator_includes("hello", "world") == False
    assert validator_includes("", "") == True
    assert validator_includes("hello", "hello") == True
    assert validator_includes("hello", "Hello") == False
