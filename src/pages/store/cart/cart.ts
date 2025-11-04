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
const $ = (s:string)=>document.querySelector(s) as HTMLElement;
const money = (v:number)=>`$${v.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const SHIPPING = 500;

function updateCartBadge(){
  const b = $("#cartBadge");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if(b) b.textContent = String(cart.reduce((n:number,i:any)=>n+(i.qty||0),0));
}

function render(){
  const itemsEl = $("#items");
  const subtotalEl = $("#subtotal");
  const totalEl = $("#total");
  const shippingEl = $("#shipping");

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  let subtotal = 0;
  itemsEl.innerHTML = "";

  cart.forEach((i:any, idx:number)=>{
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

  // Eventos de cada fila
  itemsEl.querySelectorAll<HTMLButtonElement>(".plus").forEach(btn=>{
    btn.addEventListener("click", (e:any)=>{
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart[idx].qty++; localStorage.setItem("cart", JSON.stringify(cart));
      render(); updateCartBadge();
    });
  });
  itemsEl.querySelectorAll<HTMLButtonElement>(".minus").forEach(btn=>{
    btn.addEventListener("click", (e:any)=>{
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart[idx].qty = Math.max(1, cart[idx].qty-1);
      localStorage.setItem("cart", JSON.stringify(cart));
      render(); updateCartBadge();
    });
  });
  itemsEl.querySelectorAll<HTMLButtonElement>(".remove").forEach(btn=>{
    btn.addEventListener("click", (e:any)=>{
      const idx = parseInt(e.currentTarget.dataset.idx);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.splice(idx,1);
      localStorage.setItem("cart", JSON.stringify(cart));
      render(); updateCartBadge();
    });
  });
}

// Botones del resumen
($("#checkout") as HTMLButtonElement).onclick = ()=>{
  alert("Simulación de pago: aquí llamarías al endpoint para crear el pedido.");
};
($("#clear") as HTMLButtonElement).onclick = ()=>{
  localStorage.removeItem("cart");
  render(); updateCartBadge();
};

// Boot
render();
updateCartBadge();
