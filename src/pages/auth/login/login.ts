
import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";
import { PATHS, navigateTo } from "../../../utils/navigate";

const form = document.getElementById("loginForm") as HTMLFormElement | null;
const errorMsg = document.getElementById("error") as HTMLParagraphElement | null;
const messageEl = document.getElementById("message") as HTMLParagraphElement | null;

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorMsg) errorMsg.textContent = "";

        const credentials = {
            email: (document.getElementById("email") as HTMLInputElement)?.value,
            contrasena: (document.getElementById("password") as HTMLInputElement)?.value,
        };

        try {
            const res = await postData(PATHS.LOGIN, credentials);
            // res should be AuthResponse { id, mail, rol, token, nombre }
            if (messageEl) {
                if (res && res.nombre) {
                    messageEl.textContent = `Bienvenido ${res.nombre}`;
                } else {
                    messageEl.textContent = `Bienvenido ${res.mail}`;
                }
            }
            // save token and role
            saveAuthData(res.token, res.rol);
            // optionally redirect based on role
            const role = getUserRole();
            if (role === 'ADMIN') {
                navigateTo(PATHS.HOME_ADMIN + "adminHome.html");
            } else {
                navigateTo(PATHS.HOME_CLIENT + "home.html");
            }
        } catch (err: any) {
            if (errorMsg) errorMsg.textContent = err.message || "Credenciales incorrectas";
        }
    });
}
