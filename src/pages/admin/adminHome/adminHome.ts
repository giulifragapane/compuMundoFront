import "./adminHome.css";

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
