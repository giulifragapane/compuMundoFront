
import { SidebarAdmin } from "../../components/sidebar/sidebar";
import { Navbar } from "../../components/navbar/navbar";
import { Modal } from "../../components/modals/Modal";

// Función para renderizar la página de pedidos en el contenedor principal
export function renderOrdersPage(containerId: string = "app") {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Limpiar el contenedor
  container.innerHTML = "";

  // Crear estructura principal
  const adminContainer = document.createElement("div");
  adminContainer.className = "admin-container";

  // Sidebar
  const sidebar = SidebarAdmin();
  adminContainer.appendChild(sidebar);

  // Main content
  const main = document.createElement("div");
  main.className = "admin-main";

  // Navbar (opcional, si se quiere mostrar)
  // const navbar = Navbar();
  // main.appendChild(navbar);

  // Título
  const title = document.createElement("h2");
  title.textContent = "Gestión de Pedidos";
  main.appendChild(title);

  // Filtro de estado
  const select = document.createElement("select");
  select.className = "filter";
  select.innerHTML = `
    <option value="all">Todos</option>
    <option value="pendiente">Pendiente</option>
    <option value="enviado">Enviado</option>
    <option value="entregado">Entregado</option>
  `;
  main.appendChild(select);

  // Lista de pedidos (ejemplo estático)
  const ordersList = document.createElement("div");
  ordersList.className = "orders-list";
  ordersList.innerHTML = `
    <div class="order-card">
      <h4>Pedido #001</h4>
      <p>Cliente: Juan Pérez</p>
      <p>Fecha: 27/10/2025</p>
      <span class="badge-status">Pendiente</span>
      <p>Total: $75.000</p>
      <button class="btn-view">Ver Detalle</button>
    </div>
  `;
  main.appendChild(ordersList);

  // Modal ejemplo (opcional, solo si se quiere mostrar al cargar)
  // const modal = Modal("Pedido", "Contenido del modal");
  // main.appendChild(modal);

  adminContainer.appendChild(main);
  container.appendChild(adminContainer);
}