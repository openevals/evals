"""
Some functions in this file were adapted from the openai/evals repository.
source: https://github.com/openai/evals/blob/main/evals/elsuite/modelgraded/classify_utils.py
"""

from typing import Iterable, Optional
import string
from backend.db.models import ModelGradedConfig, TaskInstance

MODEL_GRADE_FORMAT_PROMPTS = {
    # e.g. "Yes"
    "classify": "Answer the question by printing only a single choice from {choices} (without quotes or punctuation) corresponding to the correct answer with no other text.".strip(),
    # e.g. "Yes\n The reasons are: ..."
    "classify_cot": "First, answer by printing a single choice from {choices} (without quotes or punctuation) corresponding to the correct answer. Then, from the next line, explain your reasonings step by step.".strip(),
    # e.g. "Let's think step by step. ...\nYes"
    "cot_classify": """
First, write out in a step by step manner your reasoning to be sure that your conclusion is correct. Avoid simply stating the correct answer at the outset. Then print only a single choice from {choices} (without quotes or punctuation) on its own line corresponding to the correct answer. At the end, repeat just the answer by itself on a new line.

Reasoning:""".strip(),
}

MATCH_FNS = {
    "include": lambda x, y: float(x in y),
    "exact": lambda x, y: float(x == y),
    "endswith": lambda x, y: x.endswith(y),
    "starts_or_endswith": lambda x, y: x.startswith(y) or x.endswith(y),
}

INVALID_STR = "__invalid__"


def choice_to_str(choice_strings: Iterable[str]) -> str:
    """Return a string of choices, e.g. '"Yes" or "No" or "Maybe"'."""
    return " or ".join(f'"{choice}"' for choice in choice_strings)


def get_choice(
    text: str,
    eval_type: str,
    choice_strings: Iterable[str],
    match_fn: Optional[str] = "starts_or_endswith",
) -> str:
    """Clean the answer string to a choice string to one of choice_strings. Return '__invalid__.' if no match."""
    if isinstance(match_fn, str):
        match_fn = MATCH_FNS[match_fn]
    lines = text.strip().split("\n")
    if eval_type.startswith("cot_classify"):
        lines = lines[::-1]  # reverse lines
    for line in lines:
        line = line.strip()
        line = "".join(c for c in line if c not in string.punctuation)
        if not line:
            continue
        for choice in choice_strings:
            if match_fn(line, choice):
                return choice
    return INVALID_STR


def get_model_grader_prompt(
    task_isntance: TaskInstance,
    model_graded_config: ModelGradedConfig,
    output_data: str,
    # choice_strings: Iterable[str], model_grader_eval_type: str
) -> str:
    """
    Return a formatted model grader prompt.
    FIXME: make the input completion adaptable to all fo]ormats, including multiple completions.
    """
    grader_prompt = model_graded_config.prompt.format(completion=output_data)
    if "{input}" in grader_prompt:
        grader_prompt = grader_prompt.format(input=task_isntance.input)
    format_prompt = MODEL_GRADE_FORMAT_PROMPTS[
        model_graded_config.model_grader_eval_type
    ].format(choices=choice_to_str(model_graded_config.choice_strings))
    return f"{grader_prompt}\n{format_prompt}"
