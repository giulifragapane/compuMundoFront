import { logout } from "../../../utils/auth";
import { protectRoute } from "../../../utils/navigate";
import { obtenerCategorias } from "../../admin/categories/categories";
import { obtenerProductos } from "../../admin/products/products";
import type { IProduct } from "../../../types/IProduct";

document.addEventListener("DOMContentLoaded", () => {
  protectRoute("USER");
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
  }

  // ---------------------- MOSTRAR NOMBRE EN HEADER ----------------------
  const userNameSpan = document.getElementById("user-name");
  const storedUser = localStorage.getItem("username");
  const storedRole = localStorage.getItem("role");
  if (userNameSpan) {
    userNameSpan.textContent =
      storedUser || (storedRole?.toUpperCase() === "ADMIN" ? "Administrador" : "Usuario");
  }

  // ---------------------- UTILIDADES ----------------------
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
  const money = (v: number) =>
    `$${v.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  function updateCartBadge() {
    const badge = $("#cartBadge");
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (badge)
      badge.textContent = String(cart.reduce((n: number, i: any) => n + (i.qty || 0), 0));
  }

  // ---------------------- MOCK DE PRODUCTOS (FALLBACK) ----------------------
  function getMockProducts(): IProduct[] {
    const demo: IProduct[] = [
      {
        id: 1,
        nombre: "Hamburguesa triple",
        descripcion: "Hamburguesa triple smash con cheddar y panceta",
        precio: 25000,
        imagen:
          "https://images.unsplash.com/photo-1550317138-10000687a72b?q=80&w=1200&auto=format&fit=crop",
        stock: 30,
        categoriaId: 1,
        categoriaNombre: "Hamburguesas",
        disponible: true,
      },
      {
        id: 2,
        nombre: "Papas fritas clásicas",
        descripcion: "Porción de papas fritas crujientes",
        precio: 6000,
        imagen:
          "https://images.unsplash.com/photo-1585238341986-8b295aba95b9?q=80&w=1200&auto=format&fit=crop",
        stock: 50,
        categoriaId: 2,
        categoriaNombre: "Acompañamientos",
        disponible: true,
      },
    ];
    return demo;
  }

  // ---------------------- CARGA DE DATOS DESDE BACKEND ----------------------
  async function getProducts(): Promise<IProduct[]> {
    try {
      const [productos, categorias] = await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
      ]);

      // Crear mapa de categorías (id -> nombre)
      const categoriasMap = new Map(
        categorias
          .filter((c: any) => !c.eliminado)
          .map((c: any) => [c.id, c.nombre])
      );

      // Mapear productos con su nombre de categoría
      const productosConCategoria: IProduct[] = productos.map((p: any) => {
        const categoriaId = p.categoria?.id || p.categoriaId || p.categoria;
        return {
          ...p,
          categoriaId,
          categoriaNombre: categoriasMap.get(categoriaId) || "Sin categoría",
        };
      });

      console.log("✅ Productos con categoría:", productosConCategoria);
      return productosConCategoria;
    } catch (error) {
      console.error("❌ Error al obtener productos:", error);
      return getMockProducts();
    }
  }

  // ---------------------- CATEGORÍAS ----------------------
  async function getCategories() {
    try {
      const categorias = await obtenerCategorias();
      const activas = categorias.filter((c: any) => !c.eliminado);
      return [{ id: 0, nombre: "Todos los productos" }, ...activas];
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      return [{ id: 0, nombre: "Todos los productos" }];
    }
  }

  // ---------------------- RENDER DE CATEGORÍAS ----------------------
  const categoryList = $("#categoryList");
  let ACTIVE_CATEGORY: number = 0;

  async function renderCategories() {
    if (!categoryList) return;
    categoryList.innerHTML = "";

    const categorias = await getCategories();
    categorias.forEach((c, i) => {
      const a = document.createElement("a");
      a.href = "#";
      a.className = "cat-item" + (i === 0 ? " active" : "");
      a.innerHTML = `
        <span class="icon">${i === 0 ? "📦" : "📁"}</span>
        <span>${c.nombre}</span>
      `;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        ACTIVE_CATEGORY = c.id;
        categoryList.querySelectorAll(".cat-item").forEach((x) => x.classList.remove("active"));
        a.classList.add("active");
        renderProducts();
      });
      categoryList.appendChild(a);
    });
  }

  // ---------------------- RENDER DE PRODUCTOS ----------------------
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

  async function renderProducts() {
    if (!grid || !counter) return;

    let list = await getProducts();

    // 🔍 Filtros
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

    // 🔽 Orden
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

    // 🎨 Renderizado
    grid.innerHTML = "";
    list.forEach((p) => grid.appendChild(card(p)));
    counter.textContent = `${list.length} producto${list.length !== 1 ? "s" : ""}`;
  }

  // ---------------------- EVENTOS Y ARRANQUE ----------------------
  [searchInput, orderBy, availability].forEach((el) =>
    el?.addEventListener("input", renderProducts)
  );

  renderCategories();
  renderProducts();
  updateCartBadge();
}
