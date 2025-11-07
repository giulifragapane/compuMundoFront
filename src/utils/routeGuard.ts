// ==============================
// 🔒 Route Guard Centralizado
// ==============================

import { getUserRole, isAuthenticated } from "./auth";
import { PATHS, navigateTo } from "./navigate";

/**
 * Protege una vista según el tipo de acceso requerido.
 * @param access "PUBLIC" (sin restricción), "USER" (cliente) o "ADMIN" (administrador).
 */
export function routeGuard(access: "PUBLIC" | "USER" | "ADMIN"): void {
  const role = getUserRole();
  const isAuth = isAuthenticated();

  // 1️⃣ Si es pública, no se aplica control
  if (access === "PUBLIC") return;

  // 2️⃣ Si no hay sesión → redirigir al login
  if (!isAuth) {
    navigateTo(PATHS.LOGIN);
    return;
  }

  // 3️⃣ Restricciones por rol
  if (access === "ADMIN" && role?.toUpperCase() !== "ADMIN") {
    // Usuario o visitante intenta entrar a zona admin
    navigateTo(PATHS.HOME_CLIENT);
    return;
  }

  if (access === "USER" && role?.toUpperCase() === "ADMIN") {
    // Admin intenta entrar a zona cliente (privacidad del usuario)
    navigateTo(PATHS.HOME_ADMIN);
    return;
  }
}
