import { API_URL } from '../lib/constants';
import { IEvalResponse } from '../lib/types';

export async function getEvalItem(id: number) {
  try {
    const res = await fetch(`${API_URL}/evals/${id}/get`);
    const response = await res.json() as IEvalResponse;
    response.modelSystems = response.modelSystems.sort((a, b) => a.modelId - b.modelId);
    response.taskInstances = response.taskInstances.sort((a, b) => a.id - b.id);
    response.authors = response.authors.sort((a, b) => a.id - b.id);
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}