import { ValidatorType } from '../lib/constants';

type ModelSystem = {
  model: string;
  userPrompt: string;
  systemMessage: string;
};

type TaskInstance = {
  input: string;
  idealOutput: string;
};

export async function postNewEval(body: {
  name: string;
  inputDescription: string;
  outputDescription: string;
  validator: ValidatorType;
  modelSystems: ModelSystem[];
  taskInstances: TaskInstance[];
}) {
  try {
    const res = await fetch('http://localhost:8000/eval-run', { // TODO: get proper route name
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    const {
      // TODO what is response? 
    } = res.json();

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
    const res = await fetch('http://localhost:8000/supported-models'); // TODO: get proper route name
    const {
      // TODO: need response
    } = res.json();

  } catch (e) {
    console.error(e);
  }

  return {
    //  TODO: what is returned? 
  };
}

