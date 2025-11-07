import { routeGuard } from "../../../utils/routeGuard";
import { logout } from "../../../utils/auth";
import type { IProduct } from "../../../types/IProduct"; // ✅ Importamos la interfaz

// ==============================
// 🔐 Protección de ruta
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  routeGuard("USER"); // Solo usuarios autenticados pueden acceder
  inicializarDetalleProducto();
});

// ==============================
// 🛍️ Lógica del detalle de producto
// ==============================
function inicializarDetalleProducto() {
  // ---------------------- BOTÓN DE CERRAR SESIÓN ----------------------
  const logoutButton = document.getElementById("btn-logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      logout();

      // Limpieza adicional
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
      userNameSpan.textContent =
        storedRole?.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario";
    }
  }

  // ---------------------- UTILIDADES ----------------------
  const $ = (s: string) => document.querySelector(s) as HTMLElement;
  const money = (v: number) =>
    `$${v.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ---------------------- FUNCIONES DE UTILIDAD ----------------------
  function getById(id: number): IProduct | null {
    const items: IProduct[] = JSON.parse(localStorage.getItem("products") || "[]");
    return items.find((p) => p.id === id) || null;
  }

  function updateCartBadge() {
    const b = $("#cartBadge");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (b) b.textContent = String(cart.reduce((n: number, i: any) => n + (i.qty || 0), 0));
  }

  // ---------------------- PARÁMETROS Y ELEMENTOS ----------------------
  const params = new URLSearchParams(location.search);
  const id = parseInt(params.get("id") || "0", 10);

  const img = $("#img") as HTMLImageElement;
  const nameEl = $("#name");
  const priceEl = $("#price");
  const descEl = $("#desc");
  const stockBadge = $("#stockBadge");
  const qty = $("#qty") as HTMLInputElement;
  const plus = $("#plus") as HTMLButtonElement;
  const minus = $("#minus") as HTMLButtonElement;
  const add = $("#addCart") as HTMLButtonElement;

  const p = getById(id);
  if (p) {
    img.src = p.imagen;
    nameEl.textContent = p.nombre;
    priceEl.textContent = money(p.precio);
    descEl.textContent = p.descripcion;
    stockBadge.textContent = p.disponible
      ? `Disponible (Stock: ${p.stock})`
      : "No disponible";

    if (!p.disponible) {
      add.disabled = true;
      add.classList.add("ghost");
    }
  }

  // ---------------------- EVENTOS ----------------------
  plus.onclick = () =>
    (qty.value = String(Math.max(1, (parseInt(qty.value || "1") || 1) + 1)));

  minus.onclick = () =>
    (qty.value = String(Math.max(1, (parseInt(qty.value || "1") || 1) - 1)));

  add.onclick = () => {
    if (!p) return;
    const n = Math.max(1, parseInt(qty.value || "1") || 1);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((i: any) => i.id === p.id);
    if (idx >= 0) cart[idx].qty += n;
    else
      cart.push({
        id: p.id,
        name: p.nombre,
        price: p.precio,
        image: p.imagen,
        qty: n,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    location.href = "../cart/cart.html"; // Ir al carrito
  };

  updateCartBadge();
}
