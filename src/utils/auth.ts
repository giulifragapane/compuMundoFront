
// === Constantes de claves ===
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_ROLE = "userRole";
const AUTH_USERNAME = "username"; // opcional si guardás nombre del usuario

// === Guardar datos ===
export function saveAuthData(token: string, role: string, username?: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_ROLE, role);
  if (username) localStorage.setItem(AUTH_USERNAME, username);
}

// === Obtener token ===
export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// === Obtener rol ===
export function getUserRole(): string | null {
  return localStorage.getItem(AUTH_USER_ROLE);
}

// === Obtener nombre de usuario (si se guarda) ===
export function getUsername(): string | null {
  return localStorage.getItem(AUTH_USERNAME);
}

// === Verificar autenticación ===
export function isAuthenticated(): boolean {
  return !!getToken();
}

// === Verificar tipo de usuario ===
export function isAdmin(): boolean {
  return getUserRole()?.toUpperCase() === "ADMIN";
}

export function isUser(): boolean {
  return getUserRole()?.toUpperCase() === "USER";
}

// === Cerrar sesión ===
export function logout(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_ROLE);
  localStorage.removeItem(AUTH_USERNAME);
}

// === Verificación general de acceso ===
export function checkAccess(requiredRole?: "ADMIN" | "USER"): boolean {
  if (!isAuthenticated()) return false;

  if (requiredRole === "ADMIN" && !isAdmin()) return false;
  if (requiredRole === "USER" && !isUser() && !isAdmin()) return false;

  return true;
}
