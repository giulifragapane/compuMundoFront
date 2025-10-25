import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";

    const credentials = { // Objeto con los datos de inicio de sesión
        email: (document.getElementById("email") as HTMLInputElement).value,
        contrasena: (document.getElementById("password") as HTMLInputElement).value,
    };

    try {
        const user = await postData("/login", credentials);
        saveAuthData(user.token, user.rol);

        

        const role = getUserRole();
        
        
        if (!role) {
            errorMsg.textContent = "Error al iniciar sesión";
            return;
        }

        // Redirección según el rol
        switch (role.toUpperCase()) {
            case "ADMIN":
                window.location.href = "../../../admin/home/home.html";
                break;
            case "USUARIO":
                window.location.href = "../../../client/home/home.html";
                break;
            default:
                errorMsg.textContent = "Rol inválido";
                break;
        }
    } catch (err: any) {
        errorMsg.textContent = err.message || "Error al iniciar sesión";
    }
});
