
import { postData } from "../../../utils/api";
import { saveAuthData, getUserRole } from "../../../utils/auth";
//import { PATHS, navigateTo } from "../../../utils/navigate";

const form = document.getElementById("loginForm") as HTMLFormElement;
const errorMsg = document.getElementById("error") as HTMLParagraphElement;
//const form = document.getElementById("loginForm") as HTMLFormElement | null;
//const errorMsg = document.getElementById("error") as HTMLParagraphElement | null;
//const messageEl = document.getElementById("message") as HTMLParagraphElement | null;

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

//if (form) {
//    form.addEventListener("submit", async (e) => {
//        e.preventDefault();
//        if (errorMsg) errorMsg.textContent = "";
//
//        const credentials = {
//            email: (document.getElementById("email") as HTMLInputElement)?.value,
//            contrasena: (document.getElementById("password") as HTMLInputElement)?.value,
//        };
//
//        try {
//            const res = await postData(PATHS.LOGIN, credentials);
            // res should be AuthResponse { id, mail, rol, token, nombre }
//            if (messageEl) {
//                if (res && res.nombre) {
//                    messageEl.textContent = `Bienvenido ${res.nombre}`;
//                } else {
//                    messageEl.textContent = `Bienvenido ${res.mail}`;
//                }
//            }
            // save token and role
//            saveAuthData(res.token, res.rol);
            // optionally redirect based on role
//            const role = getUserRole();
//            if (role === 'ADMIN') {
//                navigateTo(PATHS.HOME_ADMIN + "adminHome.html");
//            } else {
//                navigateTo(PATHS.HOME_CLIENT + "home.html");
//            }
//        } catch (err: any) {
//            if (errorMsg) errorMsg.textContent = err.message || "Credenciales incorrectas";
//        }
//    });


