import { logout } from "../../../utils/auth";

  
document.addEventListener("DOMContentLoaded", () => {
  const adminName = localStorage.getItem("adminName");
  document.getElementById("welcome")!.textContent = `Bienvenido, ${adminName}`;
  // cualquier otra lógica solo del panel admin
});

const logoutButton = document.getElementById("logoutButton");
logoutButton?.addEventListener("click", () => {
  logout();
  window.location.href = "/src/pages/auth/login/login.html"
});

