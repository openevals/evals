
import { API_URL } from '../lib/constants';
import { IEvalUpvoteResponse } from '../lib/types';

export async function upvoteEval(accessToken: string, evalId: number): Promise<IEvalUpvoteResponse> {
  try {
    const res = await fetch(`${API_URL}/evals/${evalId}/upvote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/json',
      }
    });
    return await res.json() as IEvalUpvoteResponse
  } catch (e) {
    console.error(e);
    throw e
  }
}