// src/utils/navigate.ts

/**
 * Redirige al usuario a la ruta especificada.
 * @param path La ruta a la que se desea navegar (ej: '/auth/login/').
 */
export function navigateTo(path: string): void {
    // Usamos window.location.href para la navegación directa en un proyecto vanilla/multi-página.
    window.location.href = path;
}

// Rutas clave
export const PATHS = {
    // Autenticación
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',

    // Páginas del cliente
    HOME_CLIENT: '/store/home/',

    // Páginas del administrador
    HOME_ADMIN: '/admin/adminHome/'
}

