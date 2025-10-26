import { defineConfig } from "vite";
import { resolve } from "path";



export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                //d:aplicaion/dist/
                index: resolve(__dirname, "index.html"),
                login: resolve(__dirname, "src/pages/auth/login/login.html"),
                register: resolve(__dirname, "src/pages/auth/register/register.html"),
                adminHome: resolve(__dirname, "src/pages/admin/adminHome/adminHome.html"),
                home: resolve(__dirname, "src/pages/store/home/home.html")
            },
        },
    },
    base: "./",
});

/**
 *  import { defineConfig } from "vite";
    import { resolve } from "path";

 * export default defineConfig({
    build: {
    rollupOptions: {
        input: {
        //d:aplicaion/dist/
        index: resolve(dirname, "index.html"),
        login: resolve(dirname, "src/pages/auth/login/login.html"),
        registro: resolve(dirname, "src/pages/auth/registro/registro.html"),
        adminHome: resolve(dirname, "src/pages/admin/home/home.html"),
        clientHome: resolve(dirname, "src/pages/client/home/home.html"),
        },
    },
    },
    base: "./",
});

 */