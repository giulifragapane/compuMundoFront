import { logout } from "../../../utils/auth";

// ---------------------- BOTÓN DE CERRAR SESIÓN ----------------------
const logoutButton = document.getElementById("btn-logout");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    // Elimina datos de sesión
    logout();

    // Limpieza manual por si tu función logout() no borra todo
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    // Redirigir al login
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
    // Si no hay nombre, mostramos uno genérico según rol
    if (storedRole?.toUpperCase() === "ADMIN") {
      userNameSpan.textContent = "Administrador";
    } else {
      userNameSpan.textContent = "Usuario";
    }
  }
}

// ==============================
// Tipos de datos
// ==============================
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  categoryId: number;
  categoryName: string;
  available: boolean;
};

// ==============================
// Utilidades
// ==============================
const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
const money = (v: number) =>
  `$${v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Badge de carrito en el header
function updateCartBadge() {
  const badge = $("#cartBadge");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (badge) badge.textContent = String(cart.reduce((n: number, i: any) => n + (i.qty || 0), 0));
}

// ==============================
// Mock de datos (solo si no hay)
// ==============================
function ensureDemoProducts() {
  const key = "products";
  if (!localStorage.getItem(key)) {
    const demo: Product[] = [
      {
        id: 1,
        name: "Hamburguesa triple",
        description: "Hamburguesa triple smash",
        price: 25000,
        image:
          "https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1200&auto=format&fit=crop",
        stock: 30,
        categoryId: 1,
        categoryName: "Hamburguesas",
        available: true,
      },
    ];
    localStorage.setItem(key, JSON.stringify(demo));
  }
}
ensureDemoProducts();

// ==============================
// Carga de datos
// ==============================
function getProducts(): Product[] {
  return JSON.parse(localStorage.getItem("products") || "[]");
}
function getCategories() {
  const map = new Map<number, string>();
  getProducts().forEach((p) => map.set(p.categoryId, p.categoryName));
  return [{ id: 0, name: "Todos los productos" }].concat(
    Array.from(map, ([id, name]) => ({ id, name }))
  );
}

// ==============================
// Render de sidebar de categorías
// ==============================
const categoryList = $("#categoryList");
let ACTIVE_CATEGORY: number = 0;

function renderCategories() {
  if (!categoryList) return;
  categoryList.innerHTML = "";
  getCategories().forEach((c, i) => {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "cat-item" + (i === 0 ? " active" : "");
    a.innerHTML = `<span class="icon">${i === 0 ? "📦" : "📁"}</span><span>${c.name}</span>`;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      ACTIVE_CATEGORY = c.id;
      // marcar activo
      categoryList.querySelectorAll(".cat-item").forEach((x) => x.classList.remove("active"));
      a.classList.add("active");
      renderProducts();
    });
    categoryList.appendChild(a);
  });
}

// ==============================
// Render de productos con filtros
// ==============================
const grid = $("#productsGrid");
const counter = $("#productsCounter");
const searchInput = $("#searchInput") as HTMLInputElement;
const orderBy = $("#orderBy") as HTMLSelectElement;
const availability = $("#availability") as HTMLSelectElement;

function card(p: Product) {
  const el = document.createElement("article");
  el.className = "product-card";
  el.innerHTML = `
    <img src="${p.image}" alt="${p.name}">
    <div class="content">
      <small>${p.categoryName}</small>
      <h3>${p.name}</h3>
      <div class="status">
        <span class="price">${money(p.price)}</span>
        <span class="badge ${p.available ? "" : "out"}">${
    p.available ? "Disponible" : "No disp."
  }</span>
      </div>
    </div>`;
  // Al hacer click, ir a detalle
  el.addEventListener("click", () => {
    location.href = `../productDetail/productDetail.html?id=${p.id}`;
  });
  return el;
}

function renderProducts() {
  if (!grid || !counter) return;

  let list = getProducts().slice();

  // Filtros
  const q = (searchInput?.value || "").toLowerCase().trim();
  if (q) list = list.filter((p) => (p.name + " " + p.description).toLowerCase().includes(q));

  if (ACTIVE_CATEGORY !== 0) list = list.filter((p) => p.categoryId === ACTIVE_CATEGORY);

  if (availability?.value === "available") list = list.filter((p) => p.available);
  if (availability?.value === "unavailable") list = list.filter((p) => !p.available);

  // Orden
  switch (orderBy?.value) {
    case "priceAsc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "priceDesc":
      list.sort((a, b) => b.price - a.price);
      break;
    default:
      list.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Render
  grid.innerHTML = "";
  list.forEach((p) => grid.appendChild(card(p)));
  counter.textContent = `${list.length} producto${list.length !== 1 ? "s" : ""}`;
}

// Listeners
[searchInput, orderBy, availability].forEach((el) =>
  el?.addEventListener("input", renderProducts)
);

// Boot
renderCategories();
renderProducts();
updateCartBadge();
