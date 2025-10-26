import { postData } from "../../../utils/api";
import { saveAuthData } from "../../../utils/auth";

const form = document.getElementById("registerForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const userData = {
        nombre: (document.getElementById("name") as HTMLInputElement).value,
        apellido: (document.getElementById("lastName") as HTMLInputElement).value,
        mail: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
        rol: (document.getElementById("role") as HTMLSelectElement).value.toUpperCase()
    };

    if (userData.password.length < 6) {
        errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    try {
        const user = await postData("/register", userData);
        saveAuthData(user.token, user.rol);
        window.location.href = "../login/login.html";
    } catch (err: any) {
        errorMsg.textContent = err.message || "Error al registrar usuario";
    }
});
