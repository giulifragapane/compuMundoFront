import { logout } from "../../../utils/auth";
import "./adminHome.css";
import {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../categories/categories";

import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../products/products";

// ---------------------- LOGOUT Y USUARIO ----------------------
const logoutButton = document.getElementById("btn-logout");
logoutButton?.addEventListener("click", () => {
  logout();
  window.location.href = "/src/pages/auth/login/login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  cargarProductos();

  const user = localStorage.getItem("username") || "Administrador";
  const userNameSpan = document.getElementById("user-name");
  if (userNameSpan) userNameSpan.textContent = user;
});



// ---------------------- VARIABLES GLOBALES ----------------------
let modoActual: "categoria" | "producto" | null = null;
let idEditando: number | null = null;

// ---------------------- REFERENCIAS ----------------------
const menuLinks = document.querySelectorAll<HTMLAnchorElement>(".menu a");
const sections = document.querySelectorAll<HTMLElement>(".section");
const modal = document.getElementById("form-modal")!;
const closeModal = document.getElementById("close-modal")!;
const formTitle = document.getElementById("form-title")!;
const formContainer = document.getElementById("formulario-dinamico")!;
const btnNuevaCategoria = document.getElementById("btn-nueva-categoria")!;
const btnNuevoProducto = document.getElementById("btn-nuevo-producto")!;
const tablaCategorias = document.querySelector("tabla-categorias") as HTMLElement;
const tablaProductos = document.querySelector("tabla-productos") as HTMLElement;

// ---------------------- NAVEGACIÓN ENTRE SECCIONES ----------------------
sections.forEach((s) => s.classList.remove("active"));
document.getElementById("dashboard-section")?.classList.add("active");

menuLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menuLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    sections.forEach((s) => s.classList.remove("active"));

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

// ---------------------- ABRIR FORMULARIOS ----------------------
btnNuevaCategoria.addEventListener("click", () => abrirFormulario("categoria"));
btnNuevoProducto.addEventListener("click", () => abrirFormulario("producto"));

function abrirFormulario(modo: "categoria" | "producto", datos: any = null) {
  modoActual = modo;
  idEditando = datos?.id ?? null;
  formTitle.textContent = datos
    ? `Editar ${modo === "categoria" ? "Categoría" : "Producto"}`
    : `Nuevo ${modo === "categoria" ? "Categoría" : "Producto"}`;

  // Generar formulario dinámico
  if (modo === "categoria") {
    formContainer.innerHTML = ` 
      <label>Nombre</label>
      <input id="nombre" type="text" value="${datos?.nombre ?? ""}" required>
      <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
    `;
  } else {
    formContainer.innerHTML = `
      <label>Nombre</label>
      <input id="nombre" type="text" value="${datos?.nombre ?? ""}" required>
      <label>Descripción</label>
      <textarea id="descripcion" >${datos?.descripcion ?? ""}</textarea>
      <label>Precio</label>
      <input id="precio" type="number" step="0.01" min="0" value="${datos?.precio ?? ""}" required>
      <label>Stock</label>
      <input id="stock" type="number" min="0" value="${datos?.stock ?? ""}" >
      <label>Categoría</label>
      <select id="categoria" required>
        <option value="">Seleccionar</option>
        <option value="Hamburguesas" ${datos?.categoria === "Hamburguesas" ? "selected" : ""}>Hamburguesas</option>
        <option value="Pizzas" ${datos?.categoria === "Pizzas" ? "selected" : ""}>Pizzas</option>
        <option value="Bebidas" ${datos?.categoria === "Bebidas" ? "selected" : ""}>Bebidas</option>
      </select>
      <label>URL de la Imagen</label>
      <input id="imagen" type="url" value="${datos?.imagen ?? ""}" >
      <label class="checkbox-label">
        <input id="disponible" type="checkbox" ${datos?.disponible ? "checked" : ""}> Disponible
      </label>
      <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
    `;
  }

  modal.classList.remove("hidden");
}

// ---------------------- CERRAR MODAL ----------------------
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  modoActual = null;
  idEditando = null;
});

// ---------------------- SUBMIT DEL FORMULARIO ----------------------
formContainer.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!modoActual) return;

  // --- Construcción de datos según el modo ---
  const data =
    modoActual === "categoria"
      ? {
          nombre: (document.getElementById("nombre") as HTMLInputElement).value.trim(),
          //descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
          //imagen: (document.getElementById("imagen") as HTMLInputElement).value.trim(),
          eliminado: false,
        }
      : {
          nombre: (document.getElementById("nombre") as HTMLInputElement).value.trim(),
          //descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
          precio: parseFloat((document.getElementById("precio") as HTMLInputElement).value),
          //stock: parseInt((document.getElementById("stock") as HTMLInputElement).value),
          categoria: (document.getElementById("categoria") as HTMLSelectElement).value,
          //imagen: (document.getElementById("imagen") as HTMLInputElement).value.trim(),
          //disponible: (document.getElementById("disponible") as HTMLInputElement)?.checked ?? false,
          eliminado: false,
        };

  try {
    // --- Diferenciar creación vs actualización ---
    if (modoActual === "categoria") {
      if (idEditando) {
        await actualizarCategoria(idEditando, data);
      } else {
        await crearCategoria(data);
      }
      await cargarCategorias(); // refrescar tabla
    } else if (modoActual === "producto") {
      if (idEditando) {
        await actualizarProducto(idEditando, data);
      } else {
        await crearProducto(data);
      }
      await cargarProductos(); // refrescar tabla
    }

    // --- Resetear modal y estados ---
    modal.classList.add("hidden");
    idEditando = null;
    modoActual = null;

  } catch (error: any) {
    console.error("Error al guardar:", error);
    alert(error.message || "Ocurrió un error al guardar los datos.");
  }
});


// ---------------------- FUNCIONES DE CARGA ----------------------
async function cargarCategorias() {
  tablaCategorias.innerHTML = "";
  const categorias = await obtenerCategorias();
  
  categorias
    .filter((c: any) => !c.eliminado)
    .forEach((c: any) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>
          <button class="editar" data-id="${c.id}">✏️</button>
          <button class="eliminar" data-id="${c.id}">🗑️</button>
        </td>`;
        console.log(c.nombre);
      tablaCategorias.appendChild(tr);
    });

  agregarEventosCategorias();
}

async function cargarProductos() {
  tablaProductos.innerHTML = "";
  const productos = await obtenerProductos();

  productos
    .filter((p: any) => !p.eliminado)
    .forEach((p: any) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.descripcion}</td>
        <td>${p.precio}</td>
        <td>${p.stock}</td>
        <td>${p.categoria}</td>
        <td><img src="${p.imagen}" width="60"></td>
        <td>${p.disponible ? "✅" : "❌"}</td>
        <td>
          <button class="editar" data-id="${p.id}">✏️</button>
          <button class="eliminar" data-id="${p.id}">🗑️</button>
        </td>`;
      tablaProductos.appendChild(tr);
    });

  agregarEventosProductos();
}

// ---------------------- EVENTOS ----------------------
function agregarEventosCategorias() {
  document.querySelectorAll("#tabla-categorias .editar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.currentTarget as HTMLElement).dataset.id);
      const categoria = await obtenerCategoriaPorId(id);
      abrirFormulario("categoria", categoria);
    });
  });

  document.querySelectorAll("#tabla-categorias .eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.currentTarget as HTMLElement).dataset.id);
      if (confirm("¿Eliminar categoría?")) {
        await eliminarCategoria(id);
        await cargarCategorias();
      }
    });
  });
}

function agregarEventosProductos() {
  document.querySelectorAll("#tabla-productos .editar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.currentTarget as HTMLElement).dataset.id);
      const producto = await obtenerProductoPorId(id);
      abrirFormulario("producto", producto);
    });
  });

  document.querySelectorAll("#tabla-productos .eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = Number((e.currentTarget as HTMLElement).dataset.id);
      if (confirm("¿Eliminar producto?")) {
        await eliminarProducto(id);
        await cargarProductos();
      }
    });
  });
}

