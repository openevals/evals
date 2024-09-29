import { API_URL } from "@/app/lib/constants";
import {
  ValidatorType,
  TaskInstance,
  ModelSystem,
  IModelResponse,
  IEvalResponse,
  IEvalRunResponse,
  IModelKeys,
} from "@/app/lib/types";

export async function postNewEval(
  accessToken: string,
  body: {
    name: string;
    description: string;
    validatorType: ValidatorType;
    modelSystems: ModelSystem[];
    taskInstances: TaskInstance[];
  },
): Promise<IEvalResponse> {
  try {
    const res = await fetch(`${API_URL}/evals/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const response = (await res.json()) as IEvalResponse;
    response.modelSystems = response.modelSystems.sort(
      (a, b) => a.modelId - b.modelId,
    );
    response.taskInstances = response.taskInstances.sort((a, b) => a.id - b.id);
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Wait for the given amount of milliseconds
export function waitMS(timeout: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

// This function will be Promise.all'd. It is called for every model system to test
export async function getEvalRun(
  evalId: number,
  evalRunId: number,
  latency = 1000,
): Promise<IEvalRunResponse> {
  try {
    await waitMS(latency);
    const res = await fetch(`${API_URL}/evals/${evalId}/run/${evalRunId}/get`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    const response = (await res.json()) as IEvalRunResponse;
    response.taskInstanceOutputs = response.taskInstanceOutputs.sort(
      (a, b) => a.taskInstanceId - b.taskInstanceId,
    );
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getSupportedModels(): Promise<IModelResponse[]> {
  try {
    const res = await fetch(`${API_URL}/models/all`);
    let response = (await res.json()) as IModelResponse[];
    response = response.sort((a, b) => a.id - b.id);
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function addNewEvalRuns(
  accessToken: string,
  evalId: number,
  modelKeys: IModelKeys,
  modelSystems: ModelSystem[],
): Promise<IEvalResponse> {
  try {
    const res = await fetch(`${API_URL}/evals/${evalId}/run`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-type": "application/json",
      },
      body: JSON.stringify({ keys: modelKeys, systems: modelSystems }),
    });
    const response = (await res.json()) as IEvalResponse;
    response.modelSystems = response.modelSystems.sort(
      (a, b) => a.modelId - b.modelId,
    );
    response.taskInstances = response.taskInstances.sort((a, b) => a.id - b.id);
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
