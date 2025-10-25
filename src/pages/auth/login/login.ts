import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const credentials = {
        email: (document.getElementById("email") as HTMLInputElement).value,
        contrasena: (document.getElementById("password") as HTMLInputElement).value,
        role: (document.getElementById("role") as HTMLSelectElement).value,
    };

    try {
        const user = await postData("/login", credentials);
        saveAuthData(user.token, user.rol);

        const role = getUserRole();
        if (role === "admin") {
            window.location.href = "../../../admin/home/home.html";
        } else {
            window.location.href = "../../../client/home/home.html";
        }
    } catch (err: any) {
        errorMsg.textContent = err.message || "Error al iniciar sesión";
    }
});
