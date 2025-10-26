import { postData } from "../../../utils/api";
import { PATHS } from "../../../utils/navigate";

const form = document.getElementById("registerForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;
const messageEl = document.getElementById("message") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const userData = {
        nombre: (document.getElementById("name") as HTMLInputElement).value,
        apellido: (document.getElementById("lastName") as HTMLInputElement).value,
        email: (document.getElementById("email") as HTMLInputElement).value,
        contrasena: (document.getElementById("password") as HTMLInputElement).value,
        rol: (document.getElementById("role") as HTMLSelectElement).value.toUpperCase()
    };

    if (userData.contrasena.length < 6) {
        errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
        return;
    }

    try {
        const res = await postData(PATHS.REGISTER, userData);
        if(res.status(200)){  
            messageEl.textContent = 'Registro completado exitosamente';
        }else {
            throw new Error(`Error en el registro, estado: ${res.status}. Intente nuevamente.`);
        };
        // after register, optionally redirect
        setTimeout(()=>{ window.location.href = '../login/login.html'; }, 900);
    } catch (err: any) {
        errorMsg.textContent = err.message || "Error al registrar usuario";
    }
});
