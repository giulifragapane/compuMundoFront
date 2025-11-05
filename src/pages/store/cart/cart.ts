import { logout } from "../../../utils/auth";
import { api } from "../../../utils/api";

// ---------------------- BOTÓN DE CERRAR SESIÓN ----------------------
const logoutButton = document.getElementById("btn-logout");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    logout();
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
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
    if (storedRole?.toUpperCase() === "ADMIN") {
      userNameSpan.textContent = "Administrador";
    } else {
      userNameSpan.textContent = "Usuario";
    }
  }
}

// ---------------------- UTILIDADES ----------------------
const $ = (s: string) => document.querySelector(s) as HTMLElement;
const money = (v: number) =>
  `$${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const SHIPPING = 500;

// ---------------------- ACTUALIZAR CANTIDAD EN ICONO ----------------------
function updateCartBadge() {
  const b = $("#cartBadge");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (b) b.textContent = String(cart.reduce((n: number, i: any) => n + (i.qty || 0), 0));
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

  // Eventos de botones
  itemsEl.querySelectorAll<HTMLButtonElement>(".plus").forEach((btn) => {
    btn.addEventListener("click", (e: any) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart[idx].qty++;
      localStorage.setItem("cart", JSON.stringify(cart));
      render();
      updateCartBadge();
    });
  });

  itemsEl.querySelectorAll<HTMLButtonElement>(".minus").forEach((btn) => {
    btn.addEventListener("click", (e: any) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart[idx].qty = Math.max(1, cart[idx].qty - 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      render();
      updateCartBadge();
    });
  });

  itemsEl.querySelectorAll<HTMLButtonElement>(".remove").forEach((btn) => {
    btn.addEventListener("click", (e: any) => {
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      render();
      updateCartBadge();
    });
  });
}

// ------------------- ANIMACIÓN DE CONFIRMACIÓN -------------------
function showConfirmationAnimation() {
  const overlay = document.createElement("div");
  overlay.classList.add("confirm-overlay");

  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="checkmark">
        <span class="check"></span>
      </div>
      <h2>¡Compra confirmada!</h2>
      <p>Gracias por tu pedido 🍔</p>
    </div>
  `;

  document.body.appendChild(overlay);

  // ⏳ Mostrar animación y luego cerrar
  setTimeout(() => {
    overlay.classList.add("hide");
    setTimeout(() => {
      localStorage.removeItem("cart");
      overlay.remove();
      window.location.href = "/src/pages/store/home/storeHome.html";
    }, 600);
  }, 2800);
}

// ---------------------- ENVIAR PEDIDO AL BACKEND ----------------------
async function enviarPedidoAlBackend() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const username = localStorage.getItem("username") || "Usuario";
  const token = localStorage.getItem("token");

  if (!cart.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  try {
    // 🔊 Reproducir sonido inmediatamente (evita bloqueo)
    const audio = new Audio("/sounds/confirm.mp3");
    audio.volume = 0.5;
    audio.play().catch(err => console.warn("⚠️ Audio bloqueado:", err));

    // 🎬 Mostrar animación al mismo tiempo
    showConfirmationAnimation();

    // 🟥 Descomentar cuando esté conectado al backend
    /*
    const pedido = {
      usuario: username,
      items: cart.map((item: any) => ({
        idProducto: item.id,
        cantidad: item.qty,
      })),
    };

    const response = await api.post("/pedidos/confirmar", pedido, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Pedido confirmado:", response);
    */

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
