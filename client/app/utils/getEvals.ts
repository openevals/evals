import { API_URL } from "@/app/lib/constants";
import { IEvalListItemResponse } from "@/app/lib/types";

export async function getEvals(
  accessToken?: string,
): Promise<IEvalListItemResponse[]> {
  try {
    const headers: Record<string, string> = {
      "Content-type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch(`${API_URL}/evals/all`, {
      method: "get",
      headers,
    });
    let response = (await res.json()) as IEvalListItemResponse[];
    if (Array.isArray(response)) {
      response = response.map((value) => {
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

async function getUserEvalsBase(
  type: "created" | "contributed" | "upvoted",
  accessToken: string,
): Promise<IEvalListItemResponse[]> {
  try {
    const res = await fetch(`${API_URL}/evals/${type}`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    let response = (await res.json()) as IEvalListItemResponse[];
    response = response.map((value) => {
      value.authors = value.authors.sort((a, b) => a.id - b.id);
      return value;
    });
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getUserCreatedEvals(
  accessToken: string,
): Promise<IEvalListItemResponse[]> {
  return getUserEvalsBase("created", accessToken);
}

export async function getUserContributedEvals(
  accessToken: string,
): Promise<IEvalListItemResponse[]> {
  return getUserEvalsBase("contributed", accessToken);
}

export async function getUserUpvotedEvals(
  accessToken: string,
): Promise<IEvalListItemResponse[]> {
  return getUserEvalsBase("upvoted", accessToken);
}

export async function getTopEvals(
  accessToken?: string,
): Promise<IEvalListItemResponse[]> {
  try {
    const headers: Record<string, string> = {
      "Content-type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const res = await fetch(`${API_URL}/evals/trending`, {
      method: "get",
      headers,
    });
    let response = (await res.json()) as IEvalListItemResponse[];
    if (Array.isArray(response)) {
      response = response.map((value) => {
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

export async function searchEvals(
  accessToken?: string,
  searchText?: string,
): Promise<IEvalListItemResponse[]> {
  try {
    const headers: Record<string, string> = {
      "Content-type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
    const params = new URLSearchParams({ query: searchText ?? "" });
    const res = await fetch(`${API_URL}/evals/search?${params.toString()}`, {
      method: "post",
      headers,
    });
    let response = (await res.json()) as IEvalListItemResponse[];
    response = response.map((value) => {
      value.authors = value.authors.sort((a, b) => a.id - b.id);
      return value;
    });
    return response;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function deleteEval(evalId: number, accessToken: string) {
  try {
    const res = await fetch(`${API_URL}/evals/${evalId}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (res.status !== 200) {
      throw new Error("Failed to delete eval");
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
}
