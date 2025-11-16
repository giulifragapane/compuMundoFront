import { routeGuard } from "../../../utils/routeGuard";
import { logout, getUserId, getToken } from "../../../utils/auth";
import { PATHS } from "../../../utils/navigate";
import type { IOrder, IOrderItem } from "../../../types/IOrders";


// ==============================
// 🔐 Protección de ruta
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  routeGuard("USER");
  inicializarCarrito();
});

// ==============================
// 🛒 Lógica del carrito
// ==============================
function inicializarCarrito() {
  // ---------------------- BOTÓN DE CERRAR SESIÓN ----------------------
  const logoutButton = document.getElementById("btn-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logout();
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
      window.location.href = PATHS.LOGIN;
    });
  }

  // ---------------------- MOSTRAR NOMBRE EN HEADER ----------------------
  const userNameSpan = document.getElementById("user-name");
  const storedUser = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");

  if (userNameSpan) {
    userNameSpan.textContent = storedUser
      ? storedUser
      : storedRole?.toUpperCase() === "ADMIN"
      ? "Administrador"
      : "Usuario";
  }

  // ---------------------- UTILIDADES ----------------------
  const $ = (s: string) => document.querySelector(s) as HTMLElement;
  const money = (v: number) =>
    `$${v.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const SHIPPING = 0;

  function updateCartBadge() {
    const b = $("#cartBadge");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (b)
      b.textContent = String(cart.reduce((n: number, i: any) => n + (i.qty || 0), 0));
  }

  // ---------------------- RENDERIZAR CARRITO ----------------------
  function render() {
    const itemsEl = $("#items");
    const subtotalEl = $("#subtotal");
    const totalEl = $("#total");
    const shippingEl = $("#shipping");

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    let subtotal = 0;
    itemsEl.innerHTML = "";

    cart.forEach((i: any, idx: number) => {
      subtotal += i.price * i.qty;

      const row = document.createElement("div");
      row.className = "item";
      row.innerHTML = `
        <img src="${i.image}" alt="${i.name}">
        <div class="grow">
          <div style="font-weight:700">${i.name}</div>
          <div class="muted">${money(i.price)} c/u</div>
        </div>
        <div class="qty">
          <button class="minus" data-idx="${idx}">-</button>
          <span>${i.qty}</span>
          <button class="plus" data-idx="${idx}">+</button>
        </div>
        <div class="price">${money(i.price * i.qty)}</div>
        <button class="remove" title="Eliminar" data-idx="${idx}">🗑</button>
      `;
      itemsEl.appendChild(row);
    });

    subtotalEl.textContent = money(subtotal);
    shippingEl.textContent = money(cart.length ? SHIPPING : 0);
    totalEl.textContent = money(subtotal + (cart.length ? SHIPPING : 0));

    // Eventos de cantidad
    itemsEl.querySelectorAll<HTMLButtonElement>(".plus").forEach((btn) =>
      btn.addEventListener("click", (e: any) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart[idx].qty++;
        localStorage.setItem("cart", JSON.stringify(cart));
        render();
        updateCartBadge();
      })
    );

    itemsEl.querySelectorAll<HTMLButtonElement>(".minus").forEach((btn) =>
      btn.addEventListener("click", (e: any) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart[idx].qty = Math.max(1, cart[idx].qty - 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        render();
        updateCartBadge();
      })
    );

    itemsEl.querySelectorAll<HTMLButtonElement>(".remove").forEach((btn) =>
      btn.addEventListener("click", (e: any) => {
        const idx = parseInt(e.currentTarget.dataset.idx);
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart.splice(idx, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        render();
        updateCartBadge();
      })
    );
  }

  // ------------------- ANIMACIÓN DE CONFIRMACIÓN -------------------
  function showConfirmationAnimation() {
    const overlay = document.createElement("div");
     const audio = new Audio("/sounds/confirm.mp3");
    audio.volume = 0.6; // volumen moderado
    audio.play().catch(() => console.warn("No se pudo reproducir el sonido."));
    overlay.classList.add("confirm-overlay");
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="checkmark"><span class="check"></span></div>
        <h2>¡Compra confirmada!</h2>
        <p>Gracias por tu pedido 🍔</p>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add("hide");
      setTimeout(() => overlay.remove(), 600);
    }, 2800);
  }

  // ---------------------- ENVIAR PEDIDO Y DETALLES ----------------------
  async function enviarPedidoAlBackend(): Promise<void> {
    const cart: any[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const usuarioId: number | null = getUserId();
    const token: string | null = getToken();
    const API_BASE_URL: string = import.meta.env.VITE_API_URL;

    if (!cart.length) {
      alert("Tu carrito está vacío.");
      return;
    }

    if (usuarioId === null || isNaN(usuarioId)) {
      alert("Error: no se detectó un usuario autenticado.");
      return;
    }

    try {
      // 🔸 Convertimos el carrito al formato de items (IOrderItem[])
      const items: IOrderItem[] = cart.map((item) => ({
        productoId: item.id,
        nombre: item.name,
        cantidad: item.qty,
        precioUnitario: item.price,
        subtotal: item.qty * item.price,
      }));

      // 🔹 Calculamos el total del pedido
      const total: number = items.reduce(
        (acc: number, i: IOrderItem) => acc + i.subtotal,
        0
      ) + SHIPPING;

      // 🔹 Creamos el objeto pedido completo (IOrder)
      const pedido: Omit<IOrder, "id"> = {
        usuarioId: Number(usuarioId),
        fecha: new Date().toISOString(), // ← Genera la fecha actual en formato ISO
        total,
        estado: "PENDIENTE",
        items, // 🔥 los detalles van dentro del pedido
      };

      console.log("📦 Pedido enviado al backend:", pedido);

      // 🔸 Enviamos todo en una sola petición
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(pedido),
      });

      if (!response.ok) throw new Error("Error al crear el pedido");

      const result: IOrder = await response.json();
      console.log("✅ Pedido y detalles creados correctamente:", result);

      // 🎵 Efecto de confirmación + animación
      showConfirmationAnimation();

      setTimeout(() => {
        localStorage.removeItem("cart");
        window.location.href = "/src/pages/client/orders/orders.html";
      }, 3000);
    } catch (err: any) {
      console.error("Error al confirmar pedido:", err);
      alert("Error al confirmar tu compra. Intenta nuevamente.");
    }
  }


  // ---------------------- BOTONES DEL RESUMEN ----------------------
  ($("#checkout") as HTMLButtonElement).onclick = enviarPedidoAlBackend;
  ($("#clear") as HTMLButtonElement).onclick = () => {
    localStorage.removeItem("cart");
    render();
    updateCartBadge();
  };

  // ---------------------- INICIALIZACIÓN ----------------------
  render();
  updateCartBadge();
}
