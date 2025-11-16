import { api } from "../../../utils/api";
import { getToken, logout } from "../../../utils/auth";
import { navigateTo, PATHS } from "../../../utils/navigate";

document.addEventListener("DOMContentLoaded", async () => {
  // ============================
  // 🔒 Verificar sesión activa
  // ============================
  const token = getToken();
  if (!token) {
    navigateTo(PATHS.LOGIN);
    return;
  }

  // ============================
  // 👤 Usuario actual (corregido)
  // ============================
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = localStorage.getItem("userId"); // ✅ ID guardado al loguear
  const ordersList = document.getElementById("ordersList") as HTMLElement;

  // Si no existe el ID, no seguimos
  if (!userId) {
    console.error("⚠️ No se encontró el ID de usuario en localStorage");
    ordersList.innerHTML = `<p class="error">❌ No se pudo identificar al usuario. Iniciá sesión nuevamente.</p>`;
    return;
  }

  const userNameEl = document.getElementById("user-name") as HTMLElement;
  userNameEl.textContent = userData.nombre || "Usuario";

  // ============================
  // 🚪 Botón de cerrar sesión
  // ============================
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      logout();
      navigateTo(PATHS.LOGIN);
    });
  }

  // ============================
  // 🎯 Elementos DOM
  // ============================
  const modal = document.getElementById("orderModal") as HTMLElement;
  const closeModal = document.getElementById("closeModal") as HTMLElement;
  const filterSelect = document.getElementById("filterStatus") as HTMLSelectElement;
  closeModal.addEventListener("click", () => modal.classList.add("hidden"));

  // ============================
  // 📦 Cargar pedidos del usuario
  // ============================
  try {
    ordersList.innerHTML = `<p class="loading">Cargando pedidos...</p>`; // loader simple
    const pedidos = await api.get(`/pedidos/usuario/${userId}`);
    renderPedidos(pedidos);
  } catch (err) {
    console.error("Error al cargar pedidos:", err);
    ordersList.innerHTML = `<p class="error">❌ No se pudieron cargar los pedidos.</p>`;
  }

  // ============================
  // 🎛️ Filtrar pedidos por estado
  // ============================
  filterSelect.addEventListener("change", async () => {
    const estado = filterSelect.value;
    try {
      const pedidos = await api.get(`/pedidos/usuario/${userId}`);
      let filtrados = pedidos;
      if (estado !== "all")
        filtrados = pedidos.filter((p: any) => p.estado === estado);
      renderPedidos(filtrados);
    } catch (e) {
      ordersList.innerHTML = `<p>Error al filtrar pedidos.</p>`;
    }
  });

  // ============================
  // 🧾 Renderizar lista de pedidos
  // ============================
  function renderPedidos(pedidos: any[]) {
    if (!pedidos || pedidos.length === 0) {
      ordersList.innerHTML = `<p>No tienes pedidos registrados.</p>`;
      return;
    }

    ordersList.innerHTML = pedidos
      .map(
        (pedido) => `
        <div class="pedido-card" data-id="${pedido.id}">
          <div class="pedido-header">
            <span><strong>Pedido #ORD-${pedido.id}</strong></span>
            <span class="estado ${pedido.estado.toLowerCase()}">${pedido.estado}</span>
          </div>
          <small>📅 ${new Date(pedido.fecha).toLocaleDateString()}</small>
          <p class="precio">Total: $${pedido.total.toFixed(2)}</p>
        </div>
      `
      )
      .join("");
      console.log("Pedidos renderizados:", pedidos);
    // Evento para ver el detalle de cada pedido
    document.querySelectorAll(".pedido-card").forEach((card) => {
      card.addEventListener("click", async () => {
        const id = (card as HTMLElement).dataset.id;
        if (id) await showDetalle(parseInt(id));
      });
    });
  }

  // ============================
  // 🔍 Mostrar detalle del pedido
  // ============================
  async function showDetalle(pedidoId: number) {
    try {
      const pedido = await api.get(`/pedidos/${pedidoId}`);
      const detalles = await api.get(`/detalles`);
      const detallesFiltrados = detalles.filter(
        (d: any) => d.pedidoId === pedidoId
      );

      (document.getElementById("estadoPedido") as HTMLElement).textContent =
        pedido.estado;
      (document.getElementById("fechaPedido") as HTMLElement).textContent =
        new Date(pedido.fecha).toLocaleString();

      (document.getElementById("direccionEntrega") as HTMLElement).textContent =
        pedido.direccion || "Calle única 254";
      (document.getElementById("telefonoEntrega") as HTMLElement).textContent =
        pedido.telefono || "26547366";
      (document.getElementById("metodoPago") as HTMLElement).textContent =
        pedido.metodoPago || "Efectivo";

      const subtotal = pedido.total - 500;
      (document.getElementById("subtotalPedido") as HTMLElement).textContent =
        `$${subtotal.toFixed(2)}`;
      (document.getElementById("envioPedido") as HTMLElement).textContent =
        "$500.00";
      (document.getElementById("totalPedido") as HTMLElement).textContent =
        `$${pedido.total.toFixed(2)}`;

      const productosLista = document.getElementById("productosLista")!;
      productosLista.innerHTML = detallesFiltrados
        .map(
          (d: any) => `
          <div class="producto-item">
            <span>${d.productoNombre || "Producto #" + d.productoId} (x${d.cantidad})</span>
            <span>$${d.subtotal}</span>
          </div>
        `
        )
        .join("");

      modal.classList.remove("hidden");
    } catch (e) {
      console.error("Error al cargar detalle:", e);
      alert("No se pudo cargar el detalle del pedido.");
    }
  }
});
