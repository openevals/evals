
import { API_URL } from '@/app/lib/constants';
import { IEvalListItemResponse } from '@/app/lib/types';

export async function getEvals(accessToken?: string): Promise<IEvalListItemResponse[]> {
  try {
    const headers: any = {
      'Content-type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/evals/all`, {
      method: 'get',
      headers
    });
    return await res.json() as IEvalListItemResponse[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getUserEvals(accessToken: string): Promise<IEvalListItemResponse[]> {
  try {
    const res = await fetch(`${API_URL}/evals/created`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    return await res.json() as IEvalListItemResponse[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getUserUpvotedEvals(accessToken: string): Promise<IEvalListItemResponse[]> {
  try {
    const res = await fetch(`${API_URL}/evals/upvoted`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });
    return await res.json() as IEvalListItemResponse[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}



export async function getTopEvals(accessToken?: string): Promise<IEvalListItemResponse[]> {
  try {
    const headers: any = {
      'Content-type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/evals/trending`, {
      method: 'get',
      headers
    });
    return await res.json() as IEvalListItemResponse[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}