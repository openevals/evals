import { ValidatorType, TaskInstance, ModelSystem } from '../lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL;



export async function postNewEval(body: {
  name: string;
  description: string;
  validatorType: ValidatorType;
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


// This function will be Promise.all'd. It is called for every model system to test
export async function getEvalRun(body: {
  modelSystem: ModelSystem,
  taskInstances: TaskInstance[]
}) {
  try {
    const res = await fetch('http://localhost:8000/eval-run', { // TODO: get proper route name
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    const {
      // TODO: figure out what response is
    } = res.json();

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

