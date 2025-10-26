

import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";
import { PATHS } from "../../../utils/navigate";

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;
const messageEl = document.getElementById("message") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const credentials = { // Objeto con los datos de inicio de sesión
        mail: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
    };

    try {
        const res = await postData(PATHS.LOGIN, credentials);
        // res should be AuthResponse { id, mail, rol, token, nombre }
        if (res && res.nombre) {
            messageEl.textContent = `Bienvenido ${res.nombre}`;
        } else {
            messageEl.textContent = `Bienvenido ${res.mail}`;
        }

        // Redirección según el rol
        switch (role.toUpperCase()) {
            case "ADMIN":
                window.location.href = "../../../admin/adminHome/adminHome.html";
                break;
            case "USUARIO":
                window.location.href = "../../../store/home/home.html";
                break;
            default:
                errorMsg.textContent = "Rol inválido";
                break;
        }
    } catch (err: any) {
        errorMsg.textContent = err.message || "Credenciales incorrectas";
    }
});
