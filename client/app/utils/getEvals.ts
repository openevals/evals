
import { API_URL } from '../lib/constants';

export async function getEvals() {
  try {
    const res = await fetch(`${API_URL}/evals/all`);
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}