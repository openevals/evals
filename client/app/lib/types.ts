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

export interface IStateResponse {
  state: string;
}

export interface IUserProfileResponse {
  username: string;
  email: string;
  affiliation: string | null;
  githubLogin: string;
  githubAvatar: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  profile: IUserProfileResponse;
}

export interface IModelResponse {
  id: number;
  modelDeveloper: string;
  modelName: string;
  checked?: boolean;
}

export interface ITaskInstanceResponse {
  id: number;
  isPublic: boolean;
  input: string;
  ideal: string;
}

export interface IModelSystemResponse {
  id: number;
  modelId: number;
  systemPrompt: string;
  userPrompt: string;
}

export interface IEvalResponse {
  id: number;
  name: string;
  description: string;
  validationToken: string;
  taskInstances: ITaskInstanceResponse[];
  modelSystems: IModelSystemResponse[];
}

export interface ITaskInstanceOutputResponse {
  id: number;
  output: string;
  status: string;
  taskInstanceId: number;
  numTokens: number;
}

export interface IEvalRunResponse {
  id: number;
  model: IModelResponse;
  systemPrompt: string;
  userPrompt: string;
  score: number;
  datetime: string;
  validatorType: string;
  status: string;
  evalId: number;
  taskInstanceOutputs: ITaskInstanceOutputResponse[];
}