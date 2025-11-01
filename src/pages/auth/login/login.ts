import { api } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";

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
    const user = await api.post("/auth/login", credentials);

    if (!user?.token || !user?.rol) {
      throw new Error("Respuesta del servidor inválida.");
    }

    saveAuthData(user.token, user.rol);
    const role = getUserRole();

    if (!role) {
      errorMsg.textContent = "Error al iniciar sesión";
      return;
    }

    console.log("Usuario logueado:", role);

    // Redirección según el rol
    switch (role.toUpperCase()) {
      case "ADMIN":
        window.location.href = "/src/pages/admin/adminHome/adminHome.html";
        break;
      case "USUARIO":
        window.location.href = "/src/pages/store/home/home.html";
        break;
      default:
        errorMsg.textContent = "Rol inválido";
        break;
    }

  } catch (err: any) {
    errorMsg.textContent = err.message || "Error al iniciar sesión. Verifica tus credenciales.";
  }
});
