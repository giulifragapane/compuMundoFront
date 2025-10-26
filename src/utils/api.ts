import { getToken } from "./auth";

// Base URL de tu backend

const API_BASE_URL = import.meta.env.VITE_API_URL;
/**
 * Función genérica para hacer POST al backend.
 * Recibe endpoint relativo y datos a enviar.
 */
export async function postData(endpoint: string, data: any): Promise<any> { 
    const token = getToken(); // Obtenemos token para endpoints protegidos
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status}`);
    }

    return response.json(); // Retorna la respuesta parseada
}

/**
 * Función genérica para hacer GET al backend con token si aplica.
 */
export async function getData(endpoint: string): Promise<any> {
    const token = getToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: "GET", headers });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Error ${response.status})`);
    }

    return response.json();
}