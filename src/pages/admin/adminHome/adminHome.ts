import { logout } from "../../../utils/auth";
import { routeGuard } from "../../../utils/routeGuard.ts"; 
import "./adminHome.css";
import {obtenerCategorias, obtenerCategoriaPorId, crearCategoria, actualizarCategoria, eliminarCategoria} 
from "../categories/categories.ts";

import {obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto} 
from "../products/products.ts";

// ==========================
// 🔐 PROTECCIÓN DE RUTA ADMIN
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  routeGuard("ADMIN"); // ✅ Solo permite acceso a administradores

  inicializarPanelAdmin(); // encapsulamos el resto del código en una función
});

// ==========================
// FUNCIÓN PRINCIPAL DEL PANEL
// ==========================
function inicializarPanelAdmin() {

  // ---------------------- BOTÓN DE CERRAR SESIÓN ----------------------
  const logoutButton = document.getElementById("btn-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logout();
      window.location.href = "/src/pages/auth/login/login.html";
    });
  } else {
    console.warn("⚠️ No se encontró el botón de Cerrar Sesión (#btn-logout).");
  }

  // ---------------------- MOSTRAR NOMBRE EN HEADER ----------------------
  const userNameSpan = document.getElementById("user-name");
  const storedUser = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");

  if (userNameSpan) {
    if (storedUser) {
      userNameSpan.textContent = storedUser;
    } else {
      userNameSpan.textContent =
        storedRole?.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario";
    }
  }

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
  const tablaCategorias = document.getElementById("tabla-categorias") as HTMLElement;
  const tablaProductos = document.getElementById("tabla-productos") as HTMLElement;

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

  async function abrirFormulario(modo: "categoria" | "producto", datos: any = null) {
    modoActual = modo;
    idEditando = datos?.id ?? null;

    formTitle.textContent = datos
      ? `Editar ${modo === "categoria" ? "Categoría" : "Producto"}`
      : `Nuevo ${modo === "categoria" ? "Categoría" : "Producto"}`;

    if (modo === "categoria") {
      formContainer.innerHTML = `
        <label>Nombre</label>
        <input id="nombre" type="text" value="${datos?.nombre ?? ""}" required>
        <label>Descripción</label>
        <textarea id="descripcion" rows="3">${datos?.descripcion ?? ""}</textarea>
        <label>Imagen (URL)</label>
        <input id="imagen" type="text" value="${datos?.imagen ?? ""}">
        <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
      `;
    } else {
      try {
        const categorias = await obtenerCategorias();
        const categoriasActivas = categorias.filter((c: any) => !c.eliminado);

        const opcionesCategorias = categoriasActivas
          .map(
            (c: any) => `
              <option value="${c.id}" ${datos?.categoria?.id === c.id ? "selected" : ""}>
                ${c.nombre}
              </option>`
          )
          .join("");

        formContainer.innerHTML = `
          <label>Nombre</label>
          <input id="nombre" type="text" value="${datos?.nombre ?? ""}" required>
          <label>Descripción</label>
          <textarea id="descripcion" rows="3">${datos?.descripcion ?? ""}</textarea>
          <label>Precio</label>
          <input id="precio" type="number" step="0.01" min="0" value="${datos?.precio ?? ""}" required>
          <label>Stock</label>
          <input id="stock" type="number" min="0" value="${datos?.stock ?? 0}" required>
          <label>Imagen (URL)</label>
          <input id="imagen" type="text" value="${datos?.imagen ?? ""}">
          <label>Categoría</label>
          <select id="categoria" required>
            <option value="">Seleccionar</option>
            ${opcionesCategorias}
          </select>
          <label class="checkbox-label">
            <input id="disponible" type="checkbox" ${datos?.disponible ? "checked" : ""}>
            Producto disponible
          </label>
          <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
        `;
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        formContainer.innerHTML = `
          <p style="color:red;">Error al cargar categorías. Intente nuevamente.</p>
        `;
      }
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

    const data =
      modoActual === "categoria"
        ? {
            nombre: (document.getElementById("nombre") as HTMLInputElement).value.trim(),
            descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
            imagen: (document.getElementById("imagen") as HTMLInputElement).value.trim(),
            eliminado: false,
          }
        : {
            nombre: (document.getElementById("nombre") as HTMLInputElement).value.trim(),
            descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
            precio: parseFloat((document.getElementById("precio") as HTMLInputElement).value),
            stock: parseInt((document.getElementById("stock") as HTMLInputElement).value),
            imagen: (document.getElementById("imagen") as HTMLInputElement).value.trim(),
            categoriaId: parseInt((document.getElementById("categoria") as HTMLSelectElement).value),
            disponible: (document.getElementById("disponible") as HTMLInputElement).checked,
            eliminado: false,
          };

    try {
      if (modoActual === "categoria") {
        idEditando ? await actualizarCategoria(idEditando, data) : await crearCategoria(data);
        await cargarCategorias();
      } else {
        idEditando ? await actualizarProducto(idEditando, data) : await crearProducto(data);
        await cargarProductos();
      }

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
    try {
      const categorias = await obtenerCategorias();
      categorias
        .filter((c: any) => !c.eliminado)
        .forEach((c: any) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${c.id ?? "-"}</td>
            <td><img src="${c.imagen ?? 'https://via.placeholder.com/60'}" alt="${c.nombre ?? 'Sin nombre'}" width="60"></td>
            <td>${c.nombre ?? "Sin nombre"}</td>
            <td>${c.descripcion ?? "Sin descripción"}</td>
            <td>
              <button class="editar btn-edit" data-id="${c.id}">✏️</button>
              <button class="eliminar btn-delete" data-id="${c.id}">🗑️</button>
            </td>`;
          tablaCategorias.appendChild(tr);
        });
      agregarEventosCategorias();
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      tablaCategorias.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar categorías.</td></tr>`;
    }
  }

  async function cargarProductos() {
    tablaProductos.innerHTML = "";
    try {
      const [productos, categorias] = await Promise.all([obtenerProductos(), obtenerCategorias()]);
      const categoriasMap = new Map(
        categorias.filter((c: any) => !c.eliminado).map((c: any) => [c.id, c.nombre])
      );
      productos
        .filter((p: any) => !p.eliminado)
        .forEach((p: any) => {
          const tr = document.createElement("tr");
          const categoriaId = p.categoria?.id || p.categoriaId || p.categoria;
          const categoriaNombre = categoriasMap.get(categoriaId) || "Sin categoría";
          tr.innerHTML = `
            <td>${p.id ?? "-"}</td>
            <td><img src="${p.imagen || 'https://via.placeholder.com/60'}" alt="${p.nombre || 'Sin nombre'}" width="60"></td>
            <td>${p.nombre || "Sin nombre"}</td>
            <td>${p.descripcion || "Sin descripción"}</td>
            <td>${p.precio ? `$${p.precio.toFixed(2)}` : "$0.00"}</td>
            <td>${p.stock ?? 0}</td>
            <td>${categoriaNombre}</td>
            <td>${p.disponible ? "✅" : "❌"}</td>
            <td>
              <button class="editar btn-edit" data-id="${p.id}">✏️</button>
              <button class="eliminar btn-delete" data-id="${p.id}">🗑️</button>
            </td>`;
          tablaProductos.appendChild(tr);
        });
      agregarEventosProductos();
    } catch (error) {
      console.error("Error al cargar productos:", error);
      tablaProductos.innerHTML = `<tr><td colspan="9" style="color:red;">Error al cargar productos.</td></tr>`;
    }
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

  // ================================
  // 🔁 ACTUALIZACIÓN AUTOMÁTICA
  // ================================

  async function actualizarTablasPeriodicamente() {
    try {
      await Promise.all([cargarCategorias(), cargarProductos()]);
    } catch (err) {
      console.error("Error al actualizar las tablas automáticamente:", err);
    }
  }

  actualizarTablasPeriodicamente();        // primera carga inmediata
  setInterval(actualizarTablasPeriodicamente, 60000); // luego cada 10s
}

