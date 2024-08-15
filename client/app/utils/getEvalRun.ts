import { API_URL } from "@/app/lib/constants";
import { ValidatorType, TaskInstance, ModelSystem, IModelResponse, IEvalResponse, IEvalRunResponse } from '@/app/lib/types';

export async function postNewEval(accessToken: string, body: {
  name: string;
  description: string;
  validatorType: ValidatorType;
  modelSystems: ModelSystem[];
  taskInstances: TaskInstance[];
}): Promise<IEvalResponse> {
  try {
    const res = await fetch(`${API_URL}/evals/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return await res.json() as IEvalResponse;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Wait for the given amount of milliseconds
export function waitMS(timeout: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}


// This function will be Promise.all'd. It is called for every model system to test
export async function getEvalRun(evalId: number, evalRunId: number, latency = 1000): Promise<IEvalRunResponse> {
  try {
    await waitMS(latency);
    const res = await fetch(`${API_URL}/evals/${evalId}/run/${evalRunId}/get`, { // TODO: get proper route name
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await res.json() as IEvalRunResponse;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getSupportedModels(): Promise<IModelResponse[]> {
  try {
    const res = await fetch(`${API_URL}/models/all`);
    return await res.json() as IModelResponse[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

