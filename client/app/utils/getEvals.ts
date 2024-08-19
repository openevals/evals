
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
    let response = await res.json() as IEvalListItemResponse[];
    if (Array.isArray(response)) {
      response = response.map((value)=>{
        value.authors = value.authors.sort((a, b) => a.id - b.id);
        return value;
      });
      return response;
    } else {
      return [];
    }
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
    let response = await res.json() as IEvalListItemResponse[];
    response = response.map((value)=>{
      value.authors = value.authors.sort((a, b) => a.id - b.id);
      return value;
    });
    return response;
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
    let response = await res.json() as IEvalListItemResponse[];
    response = response.map((value)=>{
      value.authors = value.authors.sort((a, b) => a.id - b.id);
      return value;
    });
    return response;
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
    let response = await res.json() as IEvalListItemResponse[];
    if (Array.isArray(response)) {
      response = response.map((value)=>{
        value.authors = value.authors.sort((a, b) => a.id - b.id);
        return value;
      });
      return response;
    } else {
      return [];
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function searchEvals(accessToken?: string, searchText?: string): Promise<IEvalListItemResponse[]> {
  try {
    const headers: any = {
      'Content-type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const params = new URLSearchParams({ query: searchText ?? '' });
    const res = await fetch(`${API_URL}/evals/search?${params.toString()}`, {
      method: 'post',
      headers,
    });
    let response = await res.json() as IEvalListItemResponse[];
    response = response.map((value)=>{
      value.authors = value.authors.sort((a, b) => a.id - b.id);
      return value;
    });
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}