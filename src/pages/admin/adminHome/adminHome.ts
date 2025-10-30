import { logout } from "../../../utils/auth";
import "./adminHome.css";

const logoutButton = document.getElementById("btn-logout");
logoutButton?.addEventListener("click", () => {
  logout();
  window.location.href = "/src/pages/auth/login/login.html";
});
document.addEventListener("DOMContentLoaded", () => {
  
  const user = localStorage.getItem("username") || "Administrador";
  console.log("Bienvenido al Panel de Administración"+ user);
  
  // Si existe un usuario en el localStorage, lo mostramos
  if (user) {
    // Reemplaza el texto del span
    const userNameSpan = document.getElementById("user-name");
    if (userNameSpan) userNameSpan.textContent = user;

  //   // Y también actualiza el mensaje de saludo si existe el elemento
  //   const greeting = document.getElementById("greeting");
  //   if (greeting) greeting.textContent = `Hola ${user}, disfruta tus compras`;
  // }
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll<HTMLAnchorElement>(".menu a");
  const sections = document.querySelectorAll<HTMLElement>(".section");

  // Mostrar Dashboard por defecto
  sections.forEach((s) => s.classList.remove("active"));
  document.getElementById("dashboard-section")?.classList.add("active");

  menuLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Quitar clase activa del menú
      menuLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Ocultar todas las secciones
      sections.forEach((s) => s.classList.remove("active"));

      // Detectar la sección según texto
      const text = link.innerText.trim().toLowerCase();
      let targetId = "";

      if (text.includes("dashboard")) targetId = "dashboard-section";
      else if (text.includes("categorías")) targetId = "categorias-section";
      else if (text.includes("productos")) targetId = "productos-section";
      else if (text.includes("pedidos")) targetId = "pedidos-section";
      else if (text.includes("tienda")) targetId = "tienda-section";

      document.getElementById(targetId)?.classList.add("active");
    });
  });
});
