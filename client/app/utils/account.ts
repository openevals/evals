import { API_URL } from "@/app/lib/constants";
import { IAuthResponse } from "@/app/lib/types";

/**
 * Get current user profile
 * @param accessToken 
 * @returns 
 */
export async function getUserProfile(accessToken: string): Promise<IAuthResponse> {
  try {
    const res = await fetch(`${API_URL}/account/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-type': 'application/json',
      },
    });
    return await res.json() as IAuthResponse
  } catch (error) {
    throw error
  }
};
