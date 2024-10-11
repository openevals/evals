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

export const VALIDATOR_TITLE = "Validator";

export const VALIDATOR_EXPLANATION = `A validator determines the correctness of the model output. At the moment, we support these 3 validators:

• ExactMatch: Checks whether the model's output exactly matches the ideal output
• Includes: Checks whether the model's output contains the ideal output
• FuzzyMatch: Checks wheher the model's output approximately matches the ideal output, tolerating minor differences.
`;

export const SYSTEM_PROMPT_TITLE = "System Prompt";

export const SYSTEM_PROMPT_EXPLANATION =
  "This system prompt is applied at the beginning of each task instance run.";
export const TASK_INSTANCES_TITLE = "Task Instances";

export const TASK_INSTANCES_EXPLANATION = "Each task instance consists of an input and an ideal output. For each instance, the model receives the input and matches the ideal output based on the eval's validator. If there is a system prompt, it is applied to the model before the input.";
