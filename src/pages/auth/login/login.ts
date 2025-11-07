import { api } from "../../../utils/api";
import { saveAuthData } from "../../../utils/auth";
import { publicGuard,navigateTo,PATHS } from "../../../utils/navigate.ts"; // 🧩 Protección pública

document.addEventListener("DOMContentLoaded", () => {
  publicGuard(); // Evita acceso a login si ya hay sesión
});

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const credentials = {
    mail: (document.getElementById("email") as HTMLInputElement).value.trim(),
    password: (document.getElementById("password") as HTMLInputElement).value.trim(),
  };

  if (!credentials.mail || !credentials.password) {
    errorMsg.textContent = "Por favor, completa todos los campos.";
    return;
  }

  try {
    const response = await api.post("/auth/login", credentials);
    console.log("Respuesta del backend:", response);

    const user = response.usuario || response;

    if (!response?.token || !user?.rol) {
      throw new Error("Respuesta del servidor inválida. Falta token o rol.");
    }

    saveAuthData(response.token, user.rol);

    let displayName = user.nombre?.trim() || (user.rol.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario");
    localStorage.setItem("username", displayName);
    localStorage.setItem("role", user.rol);

    const rol = user.rol.toUpperCase();
    if (rol === "ADMIN") {
      navigateTo(PATHS.HOME_ADMIN);
    } else if (rol === "USUARIO") {
      navigateTo(PATHS.HOME_CLIENT);
    } else {
      errorMsg.textContent = "Rol no reconocido. Contacte con soporte.";
    }

  } catch (err: any) {
    console.error("Error al iniciar sesión:", err);
    errorMsg.textContent = err.message || "Error al iniciar sesión. Verifica tus credenciales.";
  }
});
