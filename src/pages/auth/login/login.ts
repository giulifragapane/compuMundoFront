// Obtenemos el formulario y el elemento donde se mostrarán los errores
const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

// Escuchamos el evento "submit" del formulario
form.addEventListener("submit", async (e) => {
  // Evita que el formulario recargue la página
  e.preventDefault();

  // Capturamos los valores de los campos
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    // Enviamos una petición POST al backend (Spring Boot)
    const res = await fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Enviamos el email y la contraseña en formato JSON
      body: JSON.stringify({ email, password }),
    });

    // Si la respuesta no es OK, lanzamos un error
    if (!res.ok) throw new Error("Credenciales incorrectas");

    // Convertimos la respuesta a JSON (datos del usuario)
    const user = await res.json();

    // Guardamos los datos del usuario en el localStorage (simula la sesión)
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigimos según el rol del usuario
    if (user.role === "admin") {
      window.location.href = "../../admin/adminHome/adminHome.html";
    } else {
      window.location.href = "../../store/home/home.html";
    }

  } catch (err) {
    // Si ocurre un error (credenciales inválidas, conexión, etc)
    errorMsg.textContent = err.message;
  }
});