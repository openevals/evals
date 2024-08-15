import { API_URL } from '../lib/constants';

export async function getEvalItem(id: number) {
  try {
    const res = await fetch(`${API_URL}/evals/${id}/get`);
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}