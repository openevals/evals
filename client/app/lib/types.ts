import { Dispatch, SetStateAction } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";

export type AIProvider = "openai" | "anthropic" | "google";

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

export interface IModelKeys {
  openai?: string;
  anthropic?: string;
  google?: string;
}

export interface ModelSystem {
  modelId: number;
  systemPrompt: string;
}

export interface EvalRunOutput {
  score: number;
  model: ModelSystem;
}

export interface IStateResponse {
  state: string;
}

export interface IUserProfileResponse {
  id: number;
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
  systemPrompt: string;
  userPrompt: string;
}

export interface IModelSystemResponse {
  id: number;
  modelId: number;
}

export interface IAuthorResponse {
  id: number;
  username: string;
  githubLogin: string;
  avatar: string;
}

export interface IEvalResponse {
  id: number;
  name: string;
  description: string;
  validatorType: string;
  taskInstances: ITaskInstanceResponse[];
  modelSystems: IModelSystemResponse[];
  authors: IAuthorResponse[];
  contributors: IAuthorResponse[];
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
  score: number;
  datetime: string;
  validatorType: string;
  status: string;
  evalId: number;
  taskInstanceOutputs: ITaskInstanceOutputResponse[];
}

export interface IEvalUpvoteResponse {
  upvotes: number;
  upvoted: boolean;
}

export interface IEvalListItemResponse {
  id: number;
  name: string;
  description?: string;
  validatorType: string;
  upvotes: number;
  upvoted: boolean;
  authors: IAuthorResponse[];
}

export interface IVoteResult {
  id: number;
  upvotes: number;
  upvoted: boolean;
}
export interface DesktopEditorProps {
  isTryingEval: boolean;
  name: string;
  setName: (name: string) => void;
  step: number;
  setStep: (step: 1 | 2 | 3) => void;
  panel1Collapsed: boolean;
  setPanel1Collapsed: (collapsed: boolean) => void;
  panel2Collapsed: boolean;
  setPanel2Collapsed: (collapsed: boolean) => void;
  panel3Collapsed: boolean;
  setPanel3Collapsed: (collapsed: boolean) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => void;
  panel1Ref: React.RefObject<ImperativePanelHandle>;
  panel2Ref: React.RefObject<ImperativePanelHandle>;
  panel3Ref: React.RefObject<ImperativePanelHandle>;
  addInstance: () => void;
  onInstancesChange: () => void;
  clickSubmitButton: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  instances: TaskInstance[];
  setInstances: Dispatch<SetStateAction<TaskInstance[]>>;
  instanceInputRef: React.RefObject<HTMLTextAreaElement>;
  tabIndex: number;
  handleTabsChange: (index: number) => void;
  evalObj: IEvalResponse;
  evalRunIds: number[];
  description: string;
  setDescription: (description: string) => void;
  validator: ValidatorType | "";
  setValidator: (validator: ValidatorType | "") => void;
  models: IModelResponse[];
  setModels: (models: IModelResponse[]) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

export interface MobileEditorProps {
  isTryingEval: boolean;
  name: string;
  setName: (name: string) => void;
  step: number;
  setStep: (step: 1 | 2 | 3) => void;
  handleKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>,
  ) => void;
  addInstance: () => void;
  onInstancesChange: () => void;
  clickSubmitButton: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  instances: TaskInstance[];
  setInstances: Dispatch<SetStateAction<TaskInstance[]>>;
  instanceInputRef: React.RefObject<HTMLTextAreaElement>;
  tabIndex: number;
  handleTabsChange: (index: number) => void;
  evalObj: IEvalResponse;
  evalRunIds: number[];
  description: string;
  setDescription: (description: string) => void;
  validator: ValidatorType | "";
  setValidator: (validator: ValidatorType | "") => void;
  models: IModelResponse[];
  setModels: (models: IModelResponse[]) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

export interface IKeyValidationResponse {
  isValid: boolean;
}
