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

type Product = {
  id:number; name:string; description:string; price:number;
  image:string; stock:number; categoryId:number; categoryName:string; available:boolean
};

const $ = (s:string)=>document.querySelector(s) as HTMLElement;
const money = (v:number)=>`$${v.toLocaleString("es-AR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;

function getById(id:number):Product|null{
  const items:Product[] = JSON.parse(localStorage.getItem("products") || "[]");
  return items.find(p=>p.id===id) || null;
}
function updateCartBadge(){
  const b = $("#cartBadge");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if(b) b.textContent = String(cart.reduce((n:number,i:any)=>n+(i.qty||0),0));
}

// Parámetro ?id=...
const params = new URLSearchParams(location.search);
const id = parseInt(params.get("id") || "0",10);

// Elementos
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
if(p){
  img.src = p.image;
  nameEl.textContent = p.name;
  priceEl.textContent = money(p.price);
  descEl.textContent = p.description;
  stockBadge.textContent = p.available ? `Disponible (Stock: ${p.stock})` : "No disponible";
  if(!p.available){ add.disabled = true; add.classList.add("ghost"); }
}
plus.onclick = ()=> qty.value = String(Math.max(1,(parseInt(qty.value||"1")||1)+1));
minus.onclick = ()=> qty.value = String(Math.max(1,(parseInt(qty.value||"1")||1)-1));

add.onclick = ()=>{
  if(!p) return;
  const n = Math.max(1, parseInt(qty.value||"1")||1);
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const idx = cart.findIndex((i:any)=>i.id===p.id);
  if(idx>=0) cart[idx].qty += n;
  else cart.push({id:p.id, name:p.name, price:p.price, image:p.image, qty:n});
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  // Ir al carrito como en las capturas
  location.href = "../cart/cart.html";
};

updateCartBadge();
