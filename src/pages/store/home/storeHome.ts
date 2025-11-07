import { logout } from "../../../utils/auth";
import { protectRoute } from "../../../utils/navigate"; 
import type { IProduct } from "../../../types/IProduct";

document.addEventListener("DOMContentLoaded", () => {
  protectRoute("USER"); // Solo usuarios o admins autenticados, pero ADMIN será redirigido al panel
  inicializarTienda();
});

function inicializarTienda() {

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
      userNameSpan.textContent =
        storedRole?.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario";
    }
  }

  // UTILIDADES
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
  const money = (v: number) =>
    `$${v.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // Actualiza el badge del carrito en el header
  function updateCartBadge() {
    const badge = $("#cartBadge");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (badge)
      badge.textContent = String(
        cart.reduce((n: number, i: any) => n + (i.qty || 0), 0)
      );
  }
  // MOCK DE DATOS (si no hay nada guardado)
  function ensureDemoProducts() {
    const key = "products";
    if (!localStorage.getItem(key)) {
      const demo: IProduct[] = [
        {
          id: 1,
          nombre: "Hamburguesa triple",
          descripcion: "Hamburguesa triple smash",
          precio: 25000,
          imagen:
            "https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1200&auto=format&fit=crop",
          stock: 30,
          categoriaId: 1,
          categoriaNombre: "Hamburguesas",
          disponible: true,
        },
      ];
      localStorage.setItem(key, JSON.stringify(demo));
    }
  }
  ensureDemoProducts();

  // CARGA DE DATOS  
  function getProducts(): IProduct[] {
    return JSON.parse(localStorage.getItem("products") || "[]");
  }

  function getCategories() {
    const map = new Map<number, string>();
    getProducts().forEach((p) => map.set(p.categoriaId, p.categoriaNombre));
    return [{ id: 0, nombre: "Todos los productos" }].concat(
      Array.from(map, ([id, nombre]) => ({ id, nombre }))
    );
  }

  // RENDER DE SIDEBAR DE CATEGORÍAS
  const categoryList = $("#categoryList");
  let ACTIVE_CATEGORY: number = 0;

  function renderCategories() {
    if (!categoryList) return;
    categoryList.innerHTML = "";
    getCategories().forEach((c, i) => {
      const a = document.createElement("a");
      a.href = "#";
      a.className = "cat-item" + (i === 0 ? " active" : "");
      a.innerHTML = `<span class="icon">${
        i === 0 ? "📦" : "📁"
      }</span><span>${c.nombre}</span>`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        ACTIVE_CATEGORY = c.id;
        categoryList.querySelectorAll(".cat-item").forEach((x) =>
          x.classList.remove("active")
        );
        a.classList.add("active");
        renderProducts();
      });
      categoryList.appendChild(a);
    });
  }

  // RENDER DE PRODUCTOS CON FILTROS
  const grid = $("#productsGrid");
  const counter = $("#productsCounter");
  const searchInput = $("#searchInput") as HTMLInputElement;
  const orderBy = $("#orderBy") as HTMLSelectElement;
  const availability = $("#availability") as HTMLSelectElement;

  function card(p: IProduct) {
    const el = document.createElement("article");
    el.className = "product-card";
    el.innerHTML = `
      <img src="${p.imagen}" alt="${p.nombre}">
      <div class="content">
        <small>${p.categoriaNombre}</small>
        <h3>${p.nombre}</h3>
        <div class="status">
          <span class="price">${money(p.precio)}</span>
          <span class="badge ${p.disponible ? "" : "out"}">${
      p.disponible ? "Disponible" : "No disp."
    }</span>
        </div>
      </div>`;
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
    if (q)
      list = list.filter((p) =>
        (p.nombre + " " + p.descripcion).toLowerCase().includes(q)
      );

    if (ACTIVE_CATEGORY !== 0)
      list = list.filter((p) => p.categoriaId === ACTIVE_CATEGORY);

    if (availability?.value === "available")
      list = list.filter((p) => p.disponible);
    if (availability?.value === "unavailable")
      list = list.filter((p) => !p.disponible);

    // Orden
    switch (orderBy?.value) {
      case "priceAsc":
        list.sort((a, b) => a.precio - b.precio);
        break;
      case "priceDesc":
        list.sort((a, b) => b.precio - a.precio);
        break;
      default:
        list.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    // Renderizado
    grid.innerHTML = "";
    list.forEach((p) => grid.appendChild(card(p)));
    counter.textContent = `${list.length} producto${
      list.length !== 1 ? "s" : ""
    }`;
  }

  // EVENTOS Y ARRANQUE
  [searchInput, orderBy, availability].forEach((el) =>
    el?.addEventListener("input", renderProducts)
  );

  renderCategories();
  renderProducts();
  updateCartBadge();
}
