import { isAuthenticated, getUserRole, logout } from "./auth";

// ========================
// 🌐 RUTAS CLAVE (constantes globales)
// ========================
export const PATHS = {
  // Públicas
  HOME_PUBLIC: "/index.html",
  LOGIN: "/src/pages/auth/login/login.html",
  REGISTER: "/src/pages/auth/register/register.html",

  // Usuario (cliente)
  HOME_CLIENT: "/src/pages/store/home/storeHome.html",

  // Administrador
  HOME_ADMIN: "/src/pages/admin/adminHome/adminHome.html",
};

// ========================
// 🚀 FUNCIÓN DE NAVEGACIÓN
// ========================
export function navigateTo(path: string): void {
  const role = getUserRole()?.toUpperCase();
  const loggedIn = isAuthenticated();

  // Bloque: Protección según tipo de ruta
  if (path.includes("/admin/")) {
    if (!loggedIn || role !== "ADMIN") {
      alert("🚫 Acceso denegado: solo administradores pueden acceder a esta sección.");
      logout();
      window.location.href = PATHS.LOGIN;
      return;
    }
  } else if (path.includes("/store/")) {
    if (!loggedIn) {
      alert("🔐 Debes iniciar sesión para acceder a la tienda.");
      window.location.href = PATHS.LOGIN;
      return;
    }
    if (role === "ADMIN") {
      alert("⚠️ Acceso restringido: los administradores no pueden acceder a la vista del cliente.");
      window.location.href = PATHS.HOME_ADMIN;
      return;
    }
  }

  // ✅ Acceso permitido → redirigir
  window.location.href = path;
}

// ========================
// 🔒 PROTECCIÓN DE RUTAS PRIVADAS
// ========================
/**
 * Protege una página verificando el rol del usuario al cargarla.
 * @param requiredRole Rol requerido para acceder a la vista ("ADMIN", "USER", o "PUBLIC")
 */
export function protectRoute(requiredRole?: "ADMIN" | "USER" | "PUBLIC"): void {
  const role = getUserRole()?.toUpperCase();
  const loggedIn = isAuthenticated();

  // 1️⃣ No autenticado → solo permitir rutas públicas
  if (!loggedIn && requiredRole !== "PUBLIC") {
    alert("🔐 Debes iniciar sesión para continuar.");
    window.location.href = PATHS.LOGIN;
    return;
  }

  // 2️⃣ Admin intentando acceder a vistas de usuario
  if (requiredRole === "USER" && role === "ADMIN") {
    alert("⚠️ Los administradores no pueden acceder a la vista de usuario.");
    window.location.href = PATHS.HOME_ADMIN;
    return;
  }

  // 3️⃣ Usuario intentando acceder a vistas de administrador
  if (requiredRole === "ADMIN" && role !== "ADMIN") {
    alert("🚫 Acceso denegado: esta sección es solo para administradores.");
    window.location.href = PATHS.HOME_CLIENT;
    return;
  }

  console.log(`✅ Acceso permitido a ${window.location.pathname} (${role || "público"})`);
}

// ========================
// 🌍 PROTECCIÓN DE RUTAS PÚBLICAS
// ========================
/**
 * Evita que un usuario autenticado acceda a páginas públicas (login / register).
 * Redirige automáticamente según su rol.
 */
export function publicGuard(): void {
  if (!isAuthenticated()) return;

  const role = getUserRole()?.toUpperCase();
  switch (role) {
    case "ADMIN":
      window.location.href = PATHS.HOME_ADMIN;
      break;
    case "USUARIO":
      window.location.href = PATHS.HOME_CLIENT;
      break;
    default:
      // En caso de token inválido o rol desconocido
      logout();
      window.location.href = PATHS.LOGIN;
      break;
  }
}
