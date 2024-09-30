import { API_URL } from "@/app/lib/constants";
import { IKeyValidationResponse } from "@/app/lib/types";

/**
 * Validate AI model key
 * @param provider Model provider: openai, anthropic, google.
 * @param key API key
 * @returns
 */
export async function isValidAIModelKey(
  provider: string,
  key: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/validate/${provider}`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ key }),
    });
    return ((await res.json()) as IKeyValidationResponse).isValid;
  } catch (error) {
    console.error("Error validating AI model key:", error);
    return false;
  }
}
