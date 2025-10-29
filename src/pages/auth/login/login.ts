
import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";


const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;


form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.textContent = "";    

    const credentials = { // Objeto con los datos de inicio de sesión
        mail: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value,
    };
    
    try {
        
        const user = await postData("/auth/login", credentials);
        saveAuthData(user.token, user.rol);
        const role = getUserRole();
        console.log("Usuario logueado:", role);
        
        
        
        if (!role) {
            errorMsg.textContent = "Error al iniciar sesión";
            return;
        }
        
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
        errorMsg.textContent = err.message || "Error al iniciar sesión";
    }
});
