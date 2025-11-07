
// === Constantes de claves ===
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_ROLE = "userRole";
const AUTH_USERNAME = "username"; // opcional si guardás nombre del usuario
const AUTH_ID = "userId"; // opcional si guardás ID del usuario

// === Guardar datos ===
export function saveAuthData(token: string, role: string, username?: string, userId?: number): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_ROLE, role);
  if (username) localStorage.setItem(AUTH_USERNAME, username);
  if (userId) localStorage.setItem(AUTH_ID, String(userId));
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

export function getUserId(): number | null {
  const id = localStorage.getItem(AUTH_ID);
  return id ? Number(id) : null;
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
  localStorage.removeItem(AUTH_ID);
}

// === Verificación general de acceso ===
export function checkAccess(requiredRole?: "ADMIN" | "USER"): boolean {
  if (!isAuthenticated()) return false;

  if (requiredRole === "ADMIN" && !isAdmin()) return false;
  if (requiredRole === "USER" && !isUser() && !isAdmin()) return false;

  return true;
}
