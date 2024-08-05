
export const MIN_EXAMPLES = 1;
export const MIN_INSTANCES = 5;

// This matches ValidatorType in the backend
export enum ValidatorType {
  ExactMatch = "ExactMatch",
  FuzzyMatch = "FuzzyMatch", 
  ModelGraded = "ModelGraded"
}

export interface TaskInstanceInput {
  isPublic: boolean;
  input: string;
  ideal: string;
}

export enum ModelName {
  GPT_4 = "GPT-4",
  Gemini_1_5_Pro_Exp_0801 = "Gemini-1.5-Pro-Exp-0801",
  GPT_4o_2024_05_13 = "GPT-4o-2024-05-13",
  GPT_4o_mini_2024_07_18 = "GPT-4o-mini-2024-07-18",
  claude_3_sonnet_20240620 = "claude-3-sonnet-20240620",
  Gemini_Advanced_0514 = "Gemini-Advanced-0514",
  claude_3_opus_20240229 = "claude-3-opus-20240229"
}

export interface EvalRunOutput {
  score: number,
  model: ModelName,
}
