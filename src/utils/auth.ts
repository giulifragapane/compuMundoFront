const AUTH_TOKEN_KEY = 'authToken'; // Clave para almacenar el token
const AUTH_USER_ROLE = 'userRole'; // Clave para almacenar el rol

/*
Guarda el token y rol del usuario en localStorage.
Esto permite mantener la sesión abierta en el frontend.*/
export function saveAuthData(token: string, role: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_ROLE, role);
}

/*
Obtiene el token de autenticación del localStorage.*/
export function getToken(): string | null { // Función para obtener el token (String o Null en caso de no existir)
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

/*
Obtiene el rol del usuario del localStorage.*/
export function getUserRole(): string | null {
    return localStorage.getItem(AUTH_USER_ROLE);
}

/*
Verifica si el usuario está autenticado (si existe un token).*/
export function isAuthenticated(): boolean {
    return !!getToken(); // Devuelve true si el token existe
}

/**

Cierra la sesión eliminando token y rol.*/
export function logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_ROLE);
}
