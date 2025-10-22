// src/utils/auth.ts

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_ROLE = 'userRole'; // También guardaremos el rol para la redirección

/**
 * Guarda el token de autenticación y el rol del usuario en localStorage.
 * @param token El JWT recibido del backend.
 * @param role El rol del usuario (ej: 'cliente', 'admin').
 */
export function saveAuthData(token: string, role: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_ROLE, role);
}

/**
 * Obtiene el token de autenticación.
 */
export function getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Obtiene el rol del usuario.
 */
export function getUserRole(): string | null {
    return localStorage.getItem(AUTH_USER_ROLE);
}

/**
 * Verifica si el usuario está autenticado (si el token existe).
 */
export function isAuthenticated(): boolean {
    // Una simple comprobación de existencia del token.
    // En un entorno real, se haría una comprobación de expiración/validez.
    return !!getToken();
}

/**
 * Cierra la sesión eliminando los datos de autenticación.
 */
export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_ROLE);
}