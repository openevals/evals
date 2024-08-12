
export const MIN_EXAMPLES = 10;
export const MIN_INSTANCES = 5;

// This matches ValidatorType in the backend
export enum ValidatorType {
  Includes = "Includes",
  ExactMatch = "ExactMatch",
  FuzzyMatch = "FuzzyMatch", 
}

export interface TaskInstance {
  isPublic: boolean;
  input: string;
  ideal: string;
}

export interface ModelSystem {
  modelId: number;
  userPrompt: string;
  systemPrompt: string;
};

export interface EvalRunOutput {
  score: number,
  model: ModelSystem,
}
