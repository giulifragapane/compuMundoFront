import { api } from "../../../utils/api";
import { saveAuthData } from "../../../utils/auth";

const form = document.getElementById("registerForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  const userData = {
    nombre: (document.getElementById("name") as HTMLInputElement).value.trim(),
    apellido: (document.getElementById("lastName") as HTMLInputElement).value.trim(),
    mail: (document.getElementById("email") as HTMLInputElement).value.trim(),
    password: (document.getElementById("password") as HTMLInputElement).value.trim(),
    rol: (document.getElementById("role") as HTMLSelectElement).value.toUpperCase(),
  };

  // Validaciones básicas
  if (!userData.nombre || !userData.apellido || !userData.mail || !userData.password) {
    errorMsg.textContent = "Por favor, completa todos los campos.";
    return;
  }

  if (userData.password.length < 6) {
    errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  try {
    const user = await api.post("/auth/register", userData);

    if (!user?.token || !user?.rol) {
      throw new Error("Respuesta del servidor inválida.");
    }

    saveAuthData(user.token, user.rol);
    window.location.href = "../login/login.html";

  } catch (err: any) {
    errorMsg.textContent = err.message || "Error al registrar usuario.";
  }
});
