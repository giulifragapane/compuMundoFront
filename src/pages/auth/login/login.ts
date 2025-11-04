import { api } from "../../../utils/api";
import { saveAuthData } from "../../../utils/auth";

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
    // 🔹 Llamada al backend
    const response = await api.post("/auth/login", credentials);
    console.log("Respuesta del backend:", response);

    // 🔹 Detectar si el usuario viene dentro de un objeto "usuario"
    const user = response.usuario || response;

    // 🔹 Validar datos mínimos
    if (!response?.token || !user?.rol) {
      throw new Error("Respuesta del servidor inválida. Falta token o rol.");
    }

    // ------------------ GUARDAR DATOS EN LOCALSTORAGE ------------------

    // Guarda token y rol
    saveAuthData(response.token, user.rol);

    // Determinar el nombre visible del usuario
    let displayName = "Usuario"; // valor por defecto
    if (user.nombre && user.nombre.trim() !== "") {
      // Si viene el nombre, usarlo
      displayName = user.nombre.trim();
    } else {
      // Si no viene nombre, mostrar según su rol
      if (user.rol.toUpperCase() === "ADMIN") {
        displayName = "Administrador";
      } else if (user.rol.toUpperCase() === "USUARIO") {
        displayName = "Usuario";
      }
    }

    // Guardar nombre y rol para el header
    localStorage.setItem("username", displayName);
    localStorage.setItem("role", user.rol);

    console.log("Usuario logueado:", displayName, "-", user.rol);

    // ------------------ REDIRECCIÓN SEGÚN ROL ------------------
    const rol = user.rol.toUpperCase();

    if (rol === "ADMIN") {
      window.location.href = "/src/pages/admin/adminHome/adminHome.html";
    } else if (rol === "USUARIO") {
      window.location.href = "/src/pages/store/home/storeHome.html";
    } else {
      errorMsg.textContent = "Rol no reconocido. Contacte con soporte.";
      console.warn("Rol no válido:", user.rol);
    }

  } catch (err: any) {
    console.error("Error al iniciar sesión:", err);
    errorMsg.textContent =
      err.message || "Error al iniciar sesión. Verifica tus credenciales.";
  }
});
