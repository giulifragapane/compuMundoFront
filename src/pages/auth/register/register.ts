// Obtenemos el formulario y el elemento de error
const form = document.getElementById("registerForm");
const errorMsg = document.getElementById("error");

// Evento al enviar el formulario
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Evita recargar la página

  // Tomamos los valores de los campos
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validación simple de contraseña mínima
  if (password.length < 6) {
    errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  try {
    // Enviamos la solicitud al backend (endpoint de registro)
    const res = await fetch("http://localhost:8080/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    // Si la respuesta no fue exitosa
    if (!res.ok) throw new Error("Error al registrar usuario");

    // Convertimos la respuesta en JSON
    const user = await res.json();

    // Guardamos el usuario en localStorage (auto-login)
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigimos al home del cliente
    window.location.href = "../../store/home/home.html";

  } catch (err) {
    // Mostramos el error si ocurre algo
    errorMsg.textContent = err.message;
  }
});
