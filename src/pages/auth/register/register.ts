
import { postData } from "../../../utils/api";
//import { saveAuthData } from "../../../utils/auth";
import { PATHS, navigateTo } from "../../../utils/navigate";

const form = document.getElementById("registerForm") as HTMLFormElement | null;
const errorMsg = document.getElementById("error") as HTMLParagraphElement | null;
const messageEl = document.getElementById("message") as HTMLParagraphElement | null;

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorMsg) errorMsg.textContent = "";

        const userData = {
            nombre: (document.getElementById("name") as HTMLInputElement)?.value,
            apellido: (document.getElementById("lastName") as HTMLInputElement)?.value,
            email: (document.getElementById("email") as HTMLInputElement)?.value,
            contrasena: (document.getElementById("password") as HTMLInputElement)?.value,
            rol: ((document.getElementById("role") as HTMLSelectElement)?.value || '').toUpperCase()
        };

        if (!userData.contrasena || userData.contrasena.length < 6) {
            if (errorMsg) errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        try {
            const res = await postData(PATHS.REGISTER, userData);
            if (messageEl) messageEl.textContent = 'Registro completado exitosamente';
            // after register, optionally redirect
            setTimeout(() => { navigateTo(PATHS.LOGIN + 'login.html'); }, 900);
        } catch (err: any) {
            if (errorMsg) errorMsg.textContent = err.message || "Error al registrar usuario";
        }
    });
}
