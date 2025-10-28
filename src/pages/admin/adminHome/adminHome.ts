import { Navbar } from "../../components/navbar/navbar";
import { SidebarAdmin } from "../../components/sidebar/sidebar";
import { StatCard } from "../../components/cards/StatCard";

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  if (!app) return;

  const navbar = Navbar("Admin");
  const sidebar = SidebarAdmin();

  const main = document.createElement("div");
  main.className = "admin-main";

  // Navbar container
  const navbarContainer = document.createElement("div");
  navbarContainer.className = "navbar";
  navbarContainer.appendChild(navbar);

  // Título
  const title = document.createElement("h2");
  title.textContent = "Panel de Administración";

  // Stats
  const stats: { title: string; value: number; color: "blue" | "pink" | "cyan" | "green" }[] = [
    { title: "Categorías", value: 8, color: "blue" },
    { title: "Productos", value: 120, color: "pink" },
    { title: "Pedidos", value: 54, color: "cyan" },
    { title: "Disponibles", value: 112, color: "green" },
  ];

  const statsContainer = document.createElement("div");
  statsContainer.className = "stats-grid";

  stats.forEach(s => {
    const card = StatCard(s.title, s.value, s.color);
    statsContainer.appendChild(card);
  });

  // Summary
  const summary = document.createElement("section");
  summary.className = "summary-panel";
  summary.innerHTML = `
    <h3>Resumen Rápido</h3>
    <p>Cargando estadísticas...</p>
  `;

  main.append(navbarContainer, title, statsContainer, summary);
  app.append(sidebar, main);
});