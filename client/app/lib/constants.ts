import { ValidatorType } from "./types";

export const MIN_EXAMPLES = 10;
export const MIN_INSTANCES = 5;

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";

export const GITHUB_SCOPES = ["read:user", "user:email"];

export const defaultEvalItem = {
  id: 0,
  name: "",
  description: "",
  validatorType: ValidatorType.ExactMatch,
  taskInstances: [],
  modelSystems: [],
  authors: [],
  contributors: [],
};

export const AI_PROVIDER_A_AN = {
  openai: "an",
  anthropic: "an",
  google: "a",
};

export const AI_PROVIDER_NAME = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Gemini",
};

export const AI_PROVIDER_URL = {
  openai: "https://platform.openai.com/account/api-keys",
  anthropic: "https://console.anthropic.com/settings/keys",
  google: "https://ai.google.dev/gemini-api/docs/api-key",
};

export const VALIDATOR_TITLE="Validator";

export const VALIDATOR_EXPLANATION = `A validator function determines the correctness of the model output.

Types:
- Includes: Checks if the input contains a specific value.
- ExactMatch: Verifies if the input exactly matches a given value
- FuzzyMatch: Allows for approximate matching, tolerating minor differences.
`

export const SYSTEM_PROMPT_TITLE='System Prompt'

export const SYSTEM_PROMPT_EXPLANATION='This system prompt is applied at the beginning of each run of a task instance.'