// ===============================
// Admin Home (SPA + CRUD + Kanban)
// ===============================
import { api } from "../../../utils/api";
import { logout } from "../../../utils/auth";
import { routeGuard } from "../../../utils/routeGuard.ts";
import "./adminHome.css";

// Módulos existentes de tu proyecto (CRUD real)
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} from "../categories/categories.ts";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../products/products.ts";

// ===============================
// Tipos
// ===============================
type Estado = "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";

interface PedidoItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Pedido {
  id: number;
  cliente?: string;
  telefono?: string;
  direccion?: string;
  metodoPago?: string;
  fecha?: string;      // ISO o texto
  envio?: number;      // costo envío
  total: number;       // total final
  estado: Estado;
  productos?: PedidoItem[]; // si viene expandido
}

const ESTADOS: Estado[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];

// Util
const fmtCurrency = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// ===============================
// Arranque protegido
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  routeGuard("ADMIN");
  inicializarPanelAdmin();
});

// ===============================
// SPA helpers
// ===============================
function showSection(id: string) {
  document.querySelectorAll<HTMLElement>(".section").forEach((s) => {
    s.classList.add("hidden");
    s.classList.remove("active");
  });
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove("hidden");
    el.classList.add("active");
  }
}

function setActiveMenuBySection(sectionId: string) {
  // Quita activo de todos
  document.querySelectorAll<HTMLAnchorElement>(".menu a").forEach((a) => a.classList.remove("active"));

  const map: Record<string, string> = {
    "dashboard-section": "",                  // no hay id dedicado en sidebar
    "categorias-section": "menu-categorias",
    "productos-section": "menu-productos",
    "pedidos-section": "menu-pedidos",
  };
  const menuId = map[sectionId];
  if (menuId) document.getElementById(menuId)?.classList.add("active");
}

// ===============================
// Inicialización global
// ===============================
function inicializarPanelAdmin() {
  // Header: nombre, logout y navegación superior
  const userNameSpan = document.getElementById("user-name");
  const storedUser = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");
  if (userNameSpan) {
    userNameSpan.textContent =
      storedUser || (storedRole?.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario");
  }

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    logout();
    window.location.href = "/src/pages/auth/login/login.html";
  });

  // Header: enlaces superiores
  document.querySelector(".brand-left .brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard-section");
    setActiveMenuBySection("dashboard-section");
  });
  document.querySelector('.nav-links a[href="#"]')?.addEventListener("click", (e) => {
    // "Panel Admin" activo
    e.preventDefault();
    showSection("dashboard-section");
    setActiveMenuBySection("dashboard-section");
  });

  // Menú lateral
  document.querySelector('.menu a[href="#"]')?.addEventListener("click", (e) => {
    // primer item "Dashboard"
    e.preventDefault();
    showSection("dashboard-section");
    setActiveMenuBySection("dashboard-section");
  });
  document.getElementById("menu-categorias")?.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("categorias-section");
    setActiveMenuBySection("categorias-section");
  });
  document.getElementById("menu-productos")?.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("productos-section");
    setActiveMenuBySection("productos-section");
  });
  document.getElementById("menu-pedidos")?.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("pedidos-section");
    setActiveMenuBySection("pedidos-section");
  });

  // Botones de tarjetas del dashboard
  document.getElementById("btn-categorias")?.addEventListener("click", () => {
    showSection("categorias-section");
    setActiveMenuBySection("categorias-section");
  });
  document.getElementById("btn-productos")?.addEventListener("click", () => {
    showSection("productos-section");
    setActiveMenuBySection("productos-section");
  });
  document.getElementById("btn-pedidos")?.addEventListener("click", () => {
    showSection("pedidos-section");
    setActiveMenuBySection("pedidos-section");
  });

  // Mostrar dashboard por defecto
  showSection("dashboard-section");

  // Cargar dashboard + tablas
  bootstrapDashboardYTablas();

  // Pedidos (Kanban)
  inicializarPedidosKanban();
}

// ===============================
// Dashboard (counters) + Tablas
// ===============================
async function bootstrapDashboardYTablas() {
  const categoriasCount = document.getElementById("count-categorias")!;
  const productosCount = document.getElementById("count-productos")!;
  const pedidosCount = document.getElementById("count-pedidos")!;

  try {
    const [cats, prods, peds] = await Promise.all([
      api.get("/categorias"),
      api.get("/productos"),
      api.get("/pedidos"),
    ]);
    animateCounter(categoriasCount, cats.length ?? 0);
    animateCounter(productosCount, prods.length ?? 0);
    animateCounter(pedidosCount, peds.length ?? 0);
  } catch (e) {
    categoriasCount.textContent = "-";
    productosCount.textContent = "-";
    pedidosCount.textContent = "-";
    console.error("Error dashboard:", e);
  }

  await Promise.all([cargarCategoriasUI(), cargarProductosUI()]);
}

function animateCounter(el: HTMLElement, target: number) {
  let v = 0;
  const step = Math.max(1, Math.ceil(target / 50));
  const it = setInterval(() => {
    v += step;
    if (v >= target) {
      el.textContent = String(target);
      clearInterval(it);
    } else {
      el.textContent = String(v);
    }
  }, 20);
}

// ===============================
// CRUD CATEGORÍAS
// ===============================
const tablaCategorias = document.getElementById("tabla-categorias")!;
const btnNuevaCategoria = document.getElementById("btn-nueva-categoria")!;

// Modal genérico para formularios
const modal = document.getElementById("form-modal")!;
const closeModalBtn = document.getElementById("close-modal")!;
const formTitle = document.getElementById("form-title")!;
const formContainer = document.getElementById("formulario-dinamico")!;

let modoActual: "categoria" | "producto" | null = null;
let idEditando: number | null = null;

async function cargarCategoriasUI() {
  tablaCategorias.innerHTML = "";
  const categorias = await obtenerCategorias(); // usa tu módulo real
  categorias
    .filter((c: any) => !c.eliminado)
    .forEach((c: any) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.id}</td>
        <td><img src="${c.imagen || "https://placehold.co/60x60"}" width="60" height="60" style="object-fit:cover;border-radius:8px"></td>
        <td>${c.nombre ?? ""}</td>
        <td>${c.descripcion ?? ""}</td>
        <td>
          <button class="btn-edit editar" data-id="${c.id}" title="Editar">✏️</button>
          <button class="btn-delete eliminar" data-id="${c.id}" title="Eliminar">🗑️</button>
        </td>
      `;
      tablaCategorias.appendChild(tr);
    });

  // Delegación de eventos
  tablaCategorias.querySelectorAll<HTMLButtonElement>("button.editar").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.dataset.id);
      // fetch detalle
      const cat = (await api.get(`/categorias/${id}`)) || null;
      abrirFormulario("categoria", cat);
    })
  );
  tablaCategorias.querySelectorAll<HTMLButtonElement>("button.eliminar").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.dataset.id);
      if (!confirm("¿Eliminar categoría?")) return;
      await eliminarCategoria(id);
      await cargarCategoriasUI();
    })
  );
}

btnNuevaCategoria.addEventListener("click", () => abrirFormulario("categoria"));

// ===============================
// CRUD PRODUCTOS
// ===============================
const tablaProductos = document.getElementById("tabla-productos")!;
const btnNuevoProducto = document.getElementById("btn-nuevo-producto")!;

async function cargarProductosUI() {
  tablaProductos.innerHTML = "";
  const [productos, categorias] = await Promise.all([api.get("/productos"), obtenerCategorias()]);
  console.log("✅ Productos cargados:", productos);
  console.log("✅ Categorías cargadas:", categorias);
  const mapCat = new Map(categorias.map((c: any) => [c.id, c.nombre]));

  productos.forEach((p: any) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td><img src="${p.imagen || "https://placehold.co/60x60"}" width="60" height="60" style="object-fit:cover;border-radius:8px"></td>
      <td>${p.nombre ?? ""}</td>
      <td>${p.descripcion ?? ""}</td>
      <td>$${Number(p.precio ?? 0).toFixed(2)}</td>
      <td>${p.stock ?? 0}</td>
      <td>${mapCat.get(p.categoriaId) || "Sin categoría"}</td>
      <td>${p.disponible ? "✅" : "❌"}</td>
      <td>
        <button class="btn-edit editar" data-id="${p.id}" title="Editar">✏️</button>
        <button class="btn-delete eliminar" data-id="${p.id}" title="Eliminar">🗑️</button>
      </td>
    `;
    tablaProductos.appendChild(tr);
  });

  // Delegación de eventos
  tablaProductos.querySelectorAll<HTMLButtonElement>("button.editar").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.dataset.id);
      const prod = await api.get(`/productos/${id}`);
      abrirFormulario("producto", prod);
    })
  );
  tablaProductos.querySelectorAll<HTMLButtonElement>("button.eliminar").forEach((b) =>
    b.addEventListener("click", async () => {
      const id = Number(b.dataset.id);
      if (!confirm("¿Eliminar producto?")) return;
      await eliminarProducto(id);
      await cargarProductosUI();
    })
  );
}

btnNuevoProducto.addEventListener("click", () => abrirFormulario("producto"));

// ===============================
// 🧾 Formularios dinámicos (Categorías / Productos)
// ===============================
function abrirFormulario(modo: "categoria" | "producto", datos: any = null) {
  modoActual = modo;
  idEditando = datos?.id ?? null;

  // Título dinámico
  formTitle.textContent = datos
    ? `Editar ${modo === "categoria" ? "Categoría" : "Producto"}`
    : `Nuevo ${modo === "categoria" ? "Categoría" : "Producto"}`;

  // ===========================
  // 📂 FORMULARIO CATEGORÍA
  // ===========================
  if (modo === "categoria") {
    formContainer.innerHTML = `
      <label>Nombre</label>
      <input id="nombre" type="text" value="${datos?.nombre ?? ""}" placeholder="Ej: Hamburguesas" required>

      <label>Descripción</label>
      <textarea id="descripcion" rows="3" placeholder="Breve descripción...">${datos?.descripcion ?? ""}</textarea>

      <label>URL de Imagen</label>
      <input id="imagen" type="text" value="${datos?.imagen ?? ""}" placeholder="https://ejemplo.com/imagen.jpg">

      <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
    `;
  } 
  // ===========================
  // 🍔 FORMULARIO PRODUCTO
  // ===========================
  else {
    formContainer.innerHTML = `<p style="margin:0 0 8px">Cargando categorías...</p>`;

    (async () => {
      try {
        const categorias = (await obtenerCategorias()).filter((c: any) => !c.eliminado);
        const opciones = categorias
          .map(
            (c: any) =>
              `<option value="${c.id}" ${datos?.categoria?.id === c.id ? "selected" : ""}>${c.nombre}</option>`
          )
          .join("");

        formContainer.innerHTML = `
          <label>Nombre</label>
          <input id="nombre" type="text" value="${datos?.nombre ?? ""}" placeholder="Ej: Pizza Margarita" required>

          <label>Descripción</label>
          <textarea id="descripcion" rows="3" placeholder="Breve descripción del producto...">${datos?.descripcion ?? ""}</textarea>

          <label>Precio</label>
          <input id="precio" type="number" step="0.01" min="0" value="${datos?.precio ?? 0}" required>

          <label>Stock</label>
          <input id="stock" type="number" min="0" value="${datos?.stock ?? 0}" required>

          <label>Categoría</label>
          <select id="categoria" required>
            <option value="">Seleccionar categoría</option>
            ${opciones}
          </select>

          <label>URL de Imagen</label>
          <input id="imagen" type="text" placeholder="https://ejemplo.com/imagen.jpg" value="${datos?.imagen ?? ""}">

          <label class="checkbox-label">
            <input id="disponible" type="checkbox" ${datos?.disponible ? "checked" : ""}>
            Producto disponible
          </label>

          <button type="submit" class="btn-green">${datos ? "Actualizar" : "Guardar"}</button>
        `;
      } catch (error) {
        formContainer.innerHTML = `<p style="color:red;">Error al cargar categorías.</p>`;
      }
    })();
  }

  // Mostrar modal
  modal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

formContainer.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!modoActual) return;

  const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement).value.trim();

  try {
    if (modoActual === "categoria") {
      const payload = {
        nombre: getVal("nombre"),
        descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
        imagen: getVal("imagen"),
        eliminado: false,
      };
      if (idEditando) await actualizarCategoria(idEditando, payload);
      else await crearCategoria(payload);
      await cargarCategoriasUI();
    } else {
      const payload = {
        nombre: getVal("nombre"),
        descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
        precio: parseFloat(getVal("precio")),
        stock: parseInt(getVal("stock")),
        imagen: getVal("imagen"),
        categoriaId: parseInt((document.getElementById("categoria") as HTMLSelectElement).value),
        disponible: (document.getElementById("disponible") as HTMLInputElement).checked,
        eliminado: false,
      };
      if (idEditando) await actualizarProducto(idEditando, payload);
      else await crearProducto(payload);
      await cargarProductosUI();
    }
    modal.classList.add("hidden");
  } catch (err) {
    console.error("Error guardando:", err);
    alert("No se pudo guardar. Revisá la consola para más detalles.");
  }
});

// ===============================
// 🧱 PEDIDOS – Kanban real (API con detalles y usuario)
// ===============================
let pedidosCache: Pedido[] = [];

async function fetchPedidos(): Promise<Pedido[]> {
  try {
    const pedidos = await api.get("/pedidos");
    return Array.isArray(pedidos) ? pedidos : [];
  } catch (err) {
    console.error("Error al obtener pedidos:", err);
    return [];
  }
}

function limpiarColumnas() {
  ESTADOS.forEach((e) => {
    const col = document.getElementById(`col-${e.toLowerCase()}`);
    if (col) col.innerHTML = "";
  });
}

function actualizarBadges() {
  const counts: Record<Estado, number> = {
    PENDIENTE: 0,
    CONFIRMADO: 0,
    TERMINADO: 0,
    CANCELADO: 0,
  };

  pedidosCache.forEach((p) => {
    if (counts[p.estado] !== undefined) counts[p.estado]++;
  });

  for (const e of ESTADOS) {
    const el = document.getElementById(`count-${e.toLowerCase()}`);
    if (el) el.textContent = String(counts[e]);
  }
}


function cardPedido(p: Pedido): HTMLElement {
  const card = document.createElement("div");
  card.className = `pedido-card ${p.estado.toLowerCase()}`;
  card.setAttribute("draggable", "true");
  card.dataset.id = String(p.id);
  card.dataset.estado = p.estado;
  card.innerHTML = `
    <h4>Pedido #${p.id}</h4>
    <p><b>Cliente:</b> ${p.cliente ?? "Sin nombre"}</p>
    <p><b>Total:</b> ${fmtCurrency(p.total)}</p>
    <p><b>Estado:</b> ${p.estado}</p>
  `;
  card.addEventListener("click", () => abrirModalPedido(p));
  return card;
}

function renderPedidos(pedidos: Pedido[]) {
  limpiarColumnas();
  pedidos.forEach((p) => {
    const col = document.getElementById(`col-${p.estado.toLowerCase()}`);
    if (col) col.appendChild(cardPedido(p));
  });
  actualizarBadges();
}

async function recargarKanban() {
  pedidosCache = await fetchPedidos();
  renderPedidos(pedidosCache);
}

function inicializarDragAndDropPedidos() {
  const lists = document.querySelectorAll<HTMLElement>(".kanban-list");
  lists.forEach((list) => {
    list.addEventListener("dragover", (e) => {
      e.preventDefault();
      list.parentElement?.classList.add("drag-over");
    });
    list.addEventListener("dragleave", () => {
      list.parentElement?.classList.remove("drag-over");
    });
    list.addEventListener("drop", async (e) => {
      e.preventDefault();
      list.parentElement?.classList.remove("drag-over");
      const dragging = document.querySelector(".pedido-card.dragging") as HTMLElement | null;
      if (!dragging) return;
      const id = Number(dragging.dataset.id);
      const nuevo = (list.dataset.estado as Estado) || "PENDIENTE";
      await updatePedidoEstado(id, nuevo);
    });
  });
  document.addEventListener("dragstart", (e) => {
    const t = e.target as HTMLElement;
    if (t.classList.contains("pedido-card")) t.classList.add("dragging");
  });
  document.addEventListener("dragend", (e) => {
    const t = e.target as HTMLElement;
    t.classList.remove("dragging");
  });
}

async function updatePedidoEstado(id: number, estado: Estado) {
  const p = pedidosCache.find((x) => x.id === id);
  if (p) {
    p.estado = estado;
    renderPedidos(pedidosCache);
  }
  try {
    await api.put(`/pedidos/${id}`, { estado });
  } catch (err) {
    console.warn("⚠️ No se pudo actualizar en backend:", err);
    await recargarKanban();
  }
}

// ===============================
// 💬 MODAL DETALLE DE PEDIDO
// ===============================
async function abrirModalPedido(pedido: Pedido) {
  const modal = document.getElementById("pedido-modal")!;
  const pill = document.getElementById("pedido-status-pill")!;
  const title = document.getElementById("pedido-title")!;
  const cliente = document.getElementById("pedido-cliente")!;
  const fecha = document.getElementById("pedido-fecha")!;
  const telefono = document.getElementById("pedido-telefono")!;
  const direccion = document.getElementById("pedido-direccion")!;
  const pago = document.getElementById("pedido-pago")!;
  const tbody = document.getElementById("pedido-items")!;
  const sub = document.getElementById("pedido-subtotal")!;
  const env = document.getElementById("pedido-envio")!;
  const tot = document.getElementById("pedido-total")!;
  const select = document.getElementById("estado-select") as HTMLSelectElement;
  const btnGuardar = document.getElementById("btn-guardar-estado")!;

  // -------------------------------
  // CABECERA
  // -------------------------------
  title.textContent = `Detalle del Pedido #${pedido.id}`;
  pill.textContent = pedido.estado;
  pill.className = `status-pill ${pedido.estado.toLowerCase()}`;

  // --------------------------------
  // OBTENER CLIENTE REAL
  // --------------------------------
  try {
    const user = await api.get(`/usuarios/${(pedido as any).usuario_id}`);
    cliente.textContent = `${user.nombre} ${user.apellido}`;
    telefono.textContent = user.celular || "-";
    direccion.textContent = user.direccion || "-";
  } catch {
    cliente.textContent = "Sin nombre";
    telefono.textContent = "-";
    direccion.textContent = "-";
  }

  // Fecha formateada
  fecha.textContent = pedido.fecha || "-";

  // Método de pago
  pago.textContent = pedido.metodoPago || "-";

  // -------------------------------
  // DETALLES DEL PEDIDO
  // -------------------------------
  tbody.innerHTML = `<tr><td colspan="4">Cargando...</td></tr>`;

  try {
    const detalles = await api.get(`/pedidos/${pedido.id}/detalles`);
    tbody.innerHTML = "";

    let subtotalCalc = 0;

    for (const d of detalles) {
      const producto = await api.get(`/productos/${d.producto_id}`);

      const line = d.cantidad * producto.precio;
      subtotalCalc += line;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${producto.nombre}</td>
        <td>${d.cantidad}</td>
        <td>${fmtCurrency(producto.precio)}</td>
        <td>${fmtCurrency(line)}</td>
      `;
      tbody.appendChild(tr);
    }

    sub.textContent = fmtCurrency(subtotalCalc);
    env.textContent = fmtCurrency(pedido.envio || 0);
    tot.textContent = fmtCurrency(subtotalCalc + (pedido.envio || 0));

  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="4">Error al cargar productos</td></tr>`;
  }

  // -------------------------------
  // ESTADO EDITABLE
  // -------------------------------
  select.value = pedido.estado;

  btnGuardar.onclick = async () => {
    const nuevo = select.value as Estado;
    await updatePedidoEstado(pedido.id, nuevo);
    modal.classList.add("hidden");
  };

  document.getElementById("close-pedido-modal")?.addEventListener(
    "click",
    () => modal.classList.add("hidden"),
    { once: true }
  );

  modal.classList.remove("hidden");
}

// ===============================
// 🚀 Bootstrap Pedidos
// ===============================
function inicializarPedidosKanban() {
  (document.getElementById("col-pendiente") as HTMLElement)?.setAttribute("data-estado", "PENDIENTE");
  (document.getElementById("col-confirmado") as HTMLElement)?.setAttribute("data-estado", "CONFIRMADO");
  (document.getElementById("col-terminado") as HTMLElement)?.setAttribute("data-estado", "TERMINADO");
  (document.getElementById("col-cancelado") as HTMLElement)?.setAttribute("data-estado", "CANCELADO");

  inicializarDragAndDropPedidos();
  recargarKanban();
}
