
import { SidebarAdmin } from "../../components/sidebar/sidebar";
import { Navbar } from "../../components/navbar/navbar";
import { Modal } from "../../components/modals/Modal";

// Función para renderizar la página de categorías en el contenedor principal
export function renderCategoriesPage(containerId: string = "app") {
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
  title.textContent = "Gestión de Categorías";
  main.appendChild(title);

  // Botón agregar categoría
  const btnAdd = document.createElement("button");
  btnAdd.className = "btn-add";
  btnAdd.textContent = "+ Nueva Categoría";
  main.appendChild(btnAdd);

  // Tabla de categorías (ejemplo estático)
  const table = document.createElement("table");
  table.className = "table-admin";
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Imagen</th>
        <th>Nombre</th>
        <th>Descripción</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><img src="https://ejemplo.com/img.jpg" alt="cat" class="img-thumb" /></td>
        <td>Hamburguesas</td>
        <td>Diferentes hamburguesas de tipo smash</td>
        <td>
          <button class="btn-edit">Editar</button>
          <button class="btn-delete">Eliminar</button>
        </td>
      </tr>
    </tbody>
  `;
  main.appendChild(table);

  // Modal ejemplo (opcional, solo si se quiere mostrar al cargar)
  // const modal = Modal("Categoría", "Contenido del modal");
  // main.appendChild(modal);

  adminContainer.appendChild(main);
  container.appendChild(adminContainer);
}
