/*
  login.js - controla el formulario de inicio de sesión.
  Envía un POST a /api/auth/login y guarda la sesión en localStorage.
*/

const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("error");

// Escuchamos el evento "submit" del formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // evita recargar

  // Capturamos los valores de los campos
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value; // ✅ NUEVA LÍNEA

  try {
    // Llamada al backend (según documentación: /api/auth/login)
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }), // ✅ Agregamos el rol
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Credenciales incorrectas");
    }

    const user = await res.json();

    // Guardamos los datos del usuario en el localStorage (simula la sesión)
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigir según rol
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
