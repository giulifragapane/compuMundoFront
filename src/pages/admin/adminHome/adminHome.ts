import { logout } from "../../../utils/auth";
import "./adminHome.css";

// ---------------------- LOGOUT Y USUARIO ----------------------
const logoutButton = document.getElementById("btn-logout");
logoutButton?.addEventListener("click", () => {
  logout();
  window.location.href = "/src/pages/auth/login/login.html";
});

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("username") || "Administrador";
  console.log("Bienvenido al Panel de Administración " + user);

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
const tablaCategorias = document.querySelector("#tabla-categorias tbody") as HTMLElement;
const tablaProductos = document.querySelector("#tabla-productos tbody") as HTMLElement;

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
      <label>Descripción</label>
      <textarea id="descripcion" required>${datos?.descripcion ?? ""}</textarea>
      <label>URL de la Imagen</label>
      <input id="imagen" type="url" value="${datos?.imagen ?? ""}" required>
      <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
    `;
  } else {
    formContainer.innerHTML = `
      <label>Nombre</label>
      <input id="nombre" type="text" value="${datos?.nombre ?? ""}" required>
      <label>Descripción</label>
      <textarea id="descripcion" required>${datos?.descripcion ?? ""}</textarea>
      <label>Precio</label>
      <input id="precio" type="number" step="0.01" min="0" value="${datos?.precio ?? ""}" required>
      <label>Stock</label>
      <input id="stock" type="number" min="0" value="${datos?.stock ?? ""}" required>
      <label>Categoría</label>
      <select id="categoria" required>
        <option value="">Seleccionar</option>
        <option value="Hamburguesas" ${datos?.categoria === "Hamburguesas" ? "selected" : ""}>Hamburguesas</option>
        <option value="Pizzas" ${datos?.categoria === "Pizzas" ? "selected" : ""}>Pizzas</option>
        <option value="Bebidas" ${datos?.categoria === "Bebidas" ? "selected" : ""}>Bebidas</option>
      </select>
      <label>URL de la Imagen</label>
      <input id="imagen" type="url" value="${datos?.imagen ?? ""}" required>
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

  const urlBase =
    modoActual === "categoria"
      ? "http://localhost:8080/api/categorias"
      : "http://localhost:8080/api/productos";

  const data =
    modoActual === "categoria"
      ? {
          nombre: (document.getElementById("nombre") as HTMLInputElement).value,
          descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value,
          imagen: (document.getElementById("imagen") as HTMLInputElement).value,
          eliminado: false,
        }
      : {
          nombre: (document.getElementById("nombre") as HTMLInputElement).value,
          descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value,
          precio: parseFloat((document.getElementById("precio") as HTMLInputElement).value),
          stock: parseInt((document.getElementById("stock") as HTMLInputElement).value),
          categoria: (document.getElementById("categoria") as HTMLSelectElement).value,
          imagen: (document.getElementById("imagen") as HTMLInputElement).value,
          disponible: (document.getElementById("disponible") as HTMLInputElement)?.checked ?? false,
          eliminado: false,
        };

  await fetch(idEditando ? `${urlBase}/${idEditando}` : urlBase, {
    method: idEditando ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  modal.classList.add("hidden");
  idEditando = null;
  modoActual = null;

  if (modoActual === "categoria") await cargarCategorias();
  else await cargarProductos();
});

// ---------------------- CARGAR DATOS DESDE BACKEND ----------------------
async function cargarCategorias() {
  tablaCategorias.innerHTML = "";
  const resp = await fetch("http://localhost:8080/api/categorias");
  const categorias = await resp.json();

  categorias
    .filter((c: any) => !c.eliminado)
    .forEach((c: any) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.descripcion}</td>
        <td><img src="${c.imagen}" alt="${c.nombre}" width="60"></td>
        <td>
          <button class="editar" data-id="${c.id}">✏️</button>
          <button class="eliminar" data-id="${c.id}">🗑️</button>
        </td>
      `;
      tablaCategorias.appendChild(tr);
    });

  agregarEventosCategorias(); 
}

async function cargarProductos() {
  tablaProductos.innerHTML = "";
  const resp = await fetch("http://localhost:8080/api/productos");
  const productos = await resp.json();

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
        <td><img src="${p.imagen}" alt="${p.nombre}" width="60"></td>
        <td>${p.disponible ? "✅" : "❌"}</td>
        <td>
          <button class="editar" data-id="${p.id}">✏️</button>
          <button class="eliminar" data-id="${p.id}">🗑️</button>
        </td>
      `;
      tablaProductos.appendChild(tr);
    });

  agregarEventosProductos();
}

// ---------------------- EVENTOS DE EDITAR Y ELIMINAR ----------------------
function agregarEventosCategorias() {
  document.querySelectorAll("#tabla-categorias .editar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute("data-id");
      const resp = await fetch(`http://localhost:8080/api/categorias/${id}`);
      const categoria = await resp.json();
      abrirFormulario("categoria", categoria);
    });
  });

  document.querySelectorAll("#tabla-categorias .eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute("data-id");
      if (confirm("¿Seguro que deseas eliminar esta categoría?")) {
        await fetch(`http://localhost:8080/api/categorias/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eliminado: true }),
        });
        await cargarCategorias();
      }
    });
  });
}

function agregarEventosProductos() {
  document.querySelectorAll("#tabla-productos .editar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute("data-id");
      const resp = await fetch(`http://localhost:8080/api/productos/${id}`);
      const producto = await resp.json();
      abrirFormulario("producto", producto);
    });
  });

  document.querySelectorAll("#tabla-productos .eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute("data-id");
      if (confirm("¿Seguro que deseas eliminar este producto?")) {
        await fetch(`http://localhost:8080/api/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eliminado: true }),
        });
        await cargarProductos();
      }
    });
  });
}

// ---------------------- INICIALIZACIÓN ----------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  cargarProductos();
});
