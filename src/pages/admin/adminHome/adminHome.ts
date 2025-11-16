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
// Tipos del dominio (interfaces nuevas)
// ===============================
import type { ICategoria } from "../../../types/ICategoria";
import type { IProduct } from "../../../types/IProduct";
import type { IUser } from "../../../types/IUser";
import type { IOrder, IOrderItem, OrderStatus } from "../../../types/IOrders";

// Estados válidos del pedido (coinciden con OrderStatus)
const ESTADOS: OrderStatus[] = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];

// Util para moneda
const fmtCurrency = (n: number | undefined | null) =>
  (n ?? 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

// ===============================
// Arranque protegido
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // Solo ADMIN puede entrar
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
    "dashboard-section": "", // no hay id dedicado en sidebar
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

  // Header: enlaces superiores (logo y "Panel Admin")
  document.querySelector(".brand-left .brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    showSection("dashboard-section");
    setActiveMenuBySection("dashboard-section");
  });

  document.querySelector('.nav-links a[href="#"]')?.addEventListener("click", (e) => {
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
    // Usamos las APIs reales
    const [cats, prods, peds] = await Promise.all([
      obtenerCategorias(), // ICategoria[]
      obtenerProductos(),  // IProduct[]
      api.get("/pedidos"), // IOrder[]
    ]);

    const pedidos = (Array.isArray(peds) ? (peds as IOrder[]) : []);

    animateCounter(categoriasCount, cats.length ?? 0);
    animateCounter(productosCount, prods.length ?? 0);
    animateCounter(pedidosCount, pedidos.length ?? 0);
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
  const categorias: ICategoria[] = await obtenerCategorias(); // usa tu módulo real

  categorias.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>
        <img 
          src="${c.imagen || "https://placehold.co/60x60"}" 
          width="60" height="60" 
          style="object-fit:cover;border-radius:8px"
        >
      </td>
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
      const cat = (await api.get(`/categorias/${id}`)) as ICategoria | null;
      abrirFormulario("categoria", cat ?? undefined);
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

  const [productosRaw, categorias] = await Promise.all([
    obtenerProductos(),    // IProduct[]
    obtenerCategorias(),   // ICategoria[]
  ]);

  const productos = productosRaw as IProduct[];
  console.log("✅ Productos cargados:", productos);
  console.log("✅ Categorías cargadas:", categorias);

  productos.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>
        <img 
          src="${p.imagen || "https://placehold.co/60x60"}" 
          width="60" height="60" 
          style="object-fit:cover;border-radius:8px"
        >
      </td>
      <td>${p.nombre ?? ""}</td>
      <td>${p.descripcion ?? ""}</td>
      <td>${fmtCurrency(p.precio)}</td>
      <td>${p.stock ?? 0}</td>
      <td>${p.categoriaNombre || "Sin categoría"}</td>
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
      const prod = (await api.get(`/productos/${id}`)) as IProduct;
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
function abrirFormulario(modo: "categoria" | "producto", datos?: ICategoria | IProduct) {
  modoActual = modo;
  idEditando = (datos as any)?.id ?? null;

  // Título dinámico
  formTitle.textContent = datos
    ? `Editar ${modo === "categoria" ? "Categoría" : "Producto"}`
    : `Nuevo ${modo === "categoria" ? "Categoría" : "Producto"}`;

  // ===========================
  // 📂 FORMULARIO CATEGORÍA
  // ===========================
  if (modo === "categoria") {
    const cat = datos as ICategoria | undefined;

    formContainer.innerHTML = `
      <label>Nombre</label>
      <input id="nombre" type="text" value="${cat?.nombre ?? ""}" placeholder="Ej: Hamburguesas" required>

      <label>Descripción</label>
      <textarea id="descripcion" rows="3" placeholder="Breve descripción...">${cat?.descripcion ?? ""}</textarea>

      <label>URL de Imagen</label>
      <input id="imagen" type="text" value="${cat?.imagen ?? ""}" placeholder="https://ejemplo.com/imagen.jpg">

      <button type="submit" class="btn-green">${cat ? "Actualizar" : "Guardar"}</button>
    `;
  } else {
 // ===========================
// 🍔 FORMULARIO PRODUCTO
// ===========================
const prod = datos as IProduct | undefined;
formContainer.innerHTML = `<p style="margin:0 0 8px">Cargando categorías...</p>`;

(async () => {
  try {
    // 👇 Forzamos el tipo de las categorías
    const categorias = (await obtenerCategorias()) as ICategoria[];

    const opciones = categorias
      .map((c: ICategoria) => 
        `<option value="${c.id}" ${
          prod?.categoriaId === c.id ? "selected" : ""
        }>${c.nombre}</option>`
      )
      .join("");

    formContainer.innerHTML = `
      <label>Nombre</label>
      <input id="nombre" type="text" value="${prod?.nombre ?? ""}" placeholder="Ej: Pizza Margarita" required>

      <label>Descripción</label>
      <textarea id="descripcion" rows="3" placeholder="Breve descripción del producto...">${prod?.descripcion ?? ""}</textarea>

      <label>Precio</label>
      <input id="precio" type="number" step="0.01" min="0" value="${prod?.precio ?? 0}" required>

      <label>Stock</label>
      <input id="stock" type="number" min="0" value="${prod?.stock ?? 0}" required>

      <label>Categoría</label>
      <select id="categoria" required>
        <option value="">Seleccionar categoría</option>
        ${opciones}
      </select>

      <label>URL de Imagen</label>
      <input id="imagen" type="text" placeholder="https://ejemplo.com/imagen.jpg" value="${prod?.imagen ?? ""}">

      <label class="checkbox-label">
        <input id="disponible" type="checkbox" ${prod?.disponible ? "checked" : ""}>
        Producto disponible
      </label>

      <button type="submit" class="btn-green">${prod ? "Actualizar" : "Guardar"}</button>
    `;
  } catch (error) {
    console.error(error);
    formContainer.innerHTML = `<p style="color:red;">Error al cargar categorías.</p>`;
  }
})();

}
  // Mostrar modal
  modal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

// Escuchamos el submit del formulario dinámico (delegado)
formContainer.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!modoActual) return;

  const getVal = (id: string) =>
    (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement).value.trim();

  try {
    if (modoActual === "categoria") {
      const payload = {
        nombre: getVal("nombre"),
        descripcion: (document.getElementById("descripcion") as HTMLTextAreaElement).value.trim(),
        imagen: getVal("imagen"),
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
// 🧱 PEDIDOS – Kanban real (API con IOrder)
// ===============================
let pedidosCache: IOrder[] = [];

async function fetchPedidos(): Promise<IOrder[]> {
  try {
    const pedidos = await api.get("/pedidos");
    return Array.isArray(pedidos) ? (pedidos as IOrder[]) : [];
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
  const counts: Record<OrderStatus, number> = {
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

function cardPedido(p: IOrder): HTMLElement {
  const card = document.createElement("div");
  card.className = `pedido-card ${p.estado.toLowerCase()}`;
  card.setAttribute("draggable", "true");
  card.dataset.id = String(p.id);
  card.dataset.estado = p.estado;

  card.innerHTML = `
    <h4>Pedido #${p.id}</h4>
    <p><b>Usuario ID:</b> ${p.usuarioId}</p>
    <p><b>Total:</b> ${fmtCurrency(p.total)}</p>
    <p><b>Estado:</b> ${p.estado}</p>
  `;

  // Click para abrir detalle
  card.addEventListener("click", () => abrirModalPedido(p));
  return card;
}

function renderPedidos(pedidos: IOrder[]) {
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
      const nuevo = (list.dataset.estado as OrderStatus) || "PENDIENTE";
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

async function updatePedidoEstado(id: number, estado: OrderStatus) {
  const p = pedidosCache.find((x) => x.id === id);
  if (p) {
    p.estado = estado;
    renderPedidos(pedidosCache);
  }
  try {
    // Se asume que el backend acepta { estado } en el PUT
    await api.put(`/pedidos/${id}`, { estado });
  } catch (err) {
    console.warn("⚠️ No se pudo actualizar en backend:", err);
    await recargarKanban();
  }
}

// ===============================
// 💬 MODAL DETALLE DE PEDIDO (usa IOrder.items)
// ===============================
async function abrirModalPedido(pedido: IOrder) {
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
  // OBTENER CLIENTE REAL POR usuarioId
  // --------------------------------
  try {
    const user = (await api.get(`/usuarios/${pedido.usuarioId}`)) as IUser;

    const nombreCompleto = [user.nombre, user.apellido].filter(Boolean).join(" ");
    cliente.textContent = nombreCompleto || `Usuario #${pedido.usuarioId}`;

    // celular puede venir como string o número
    const cel = (user.celular as any) ?? "";
    telefono.textContent = String(cel || "-");

    // Por ahora no tenemos dirección en IUser, lo dejamos como "-"
    direccion.textContent = "-";
  } catch (error) {
    console.error("Error cargando usuario de pedido", error);
    cliente.textContent = `Usuario #${pedido.usuarioId}`;
    telefono.textContent = "-";
    direccion.textContent = "-";
  }

  // Fecha (la mostramos tal cual viene, ya que es string ISO)
  fecha.textContent = pedido.fecha || "-";

  // Método de pago ya no viene en IOrder, se deja como "-"
  pago.textContent = "-";

  // -------------------------------
  // DETALLES DEL PEDIDO (items)
// -------------------------------
  const items: IOrderItem[] = pedido.items ?? [];
  tbody.innerHTML = "";

  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="4">Este pedido no tiene ítems.</td></tr>`;
  } else {
    let subtotalCalc = 0;

    for (const d of items) {
      subtotalCalc += d.subtotal;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.nombre}</td>
        <td>${d.cantidad}</td>
        <td>${fmtCurrency(d.precioUnitario)}</td>
        <td>${fmtCurrency(d.subtotal)}</td>
      `;
      tbody.appendChild(tr);
    }

    sub.textContent = fmtCurrency(subtotalCalc);

    // Ya no manejamos campo 'envio' en IOrder, asumimos 0
    const envio = 0;
    env.textContent = fmtCurrency(envio);
    tot.textContent = fmtCurrency(subtotalCalc + envio);
  }

  // -------------------------------
  // ESTADO EDITABLE
  // -------------------------------
  select.value = pedido.estado;

  btnGuardar.onclick = async () => {
    const nuevo = select.value as OrderStatus;
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

