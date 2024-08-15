import { API_URL } from "@/app/lib/constants";
import { IStateResponse, IAuthResponse } from "@/app/lib/types";

/**
 * Request state code for Oauth flow
 * @returns 
 */
export async function requestStateCode(): Promise<IStateResponse> {
  try {
    const res = await fetch(`${API_URL}/oauth/state`, {
      method: 'get',
      headers: {
        'Content-type': 'application/json',
      }
    });
    return await res.json() as IStateResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Call to exchange the authorization code by access token
 * @param code 
 * @param state 
 * @returns 
 */
export async function exchangeOAuthCode(code: string, state: string): Promise<IAuthResponse> {
  try {
    const res = await fetch(`${API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ code, state })
    });
    return await res.json() as IAuthResponse;
  } catch (error) {
    throw error;
  }
};


/**
 * Call to refresh the access token
 * @param accessToken 
 * @param refreshToken 
 * @returns 
 */
export async function refreshToken(accessToken: string, refreshToken: string): Promise<IAuthResponse> {
  try {
    const res = await fetch(`${API_URL}/oauth/refresh`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });
    return await res.json() as IAuthResponse;
  } catch (error) {
    throw error;
  }
};
