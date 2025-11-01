import { getToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL;

async function request(method: string, endpoint: string, data?: any): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options: RequestInit = { method, headers };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Error ${response.status}`);
  }

  return response.json();
}

// Métodos CRUD genéricos
export const api = {
  get: (endpoint: string) => request("GET", endpoint),
  post: (endpoint: string, data: any) => request("POST", endpoint, data),
  put: (endpoint: string, data: any) => request("PUT", endpoint, data),
  del: (endpoint: string) => request("DELETE", endpoint),
};
