import { ValidatorType, TaskInstance, ModelSystem } from '../lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL;



export async function postNewEval(body: {
  name: string;
  description: string;
  validator: ValidatorType;
  modelSystems: ModelSystem[];
  taskInstances: TaskInstance[];
}) {
  try {
    const res = await fetch(`${API_URL}/evals/create`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    });

  } catch (e) {
    console.error(e);
  }

  return {
    // TODO: what is returned?

  };
};

// Wait for the given amount of milliseconds
export function waitMS(timeout: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout)
  })
}


// This function will be Promise.all'd. It is called for every model system to test
export async function getEvalRun(evalId: number, evalRunId: number, latency = 1000) {
  try {
    await waitMS(latency);
    const res = await fetch(`${API_URL}/evals/${evalId}/run/${evalRunId}/get`, { // TODO: get proper route name
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }

  return { // todo: fill in based on response
    taskInstanceOutput: [] // series of strings that are the model system's output, in the same order as taskInstances
  };
}

export async function getSupportedModels() {
  try {
    const res = await fetch(`${API_URL}/models/all`);
    console.log(res);
    return await res.json();
  } catch (e) {
    console.error(e);
  }

}

