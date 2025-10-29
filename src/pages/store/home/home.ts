import { logout } from "../../../utils/auth";

document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("username");
  document.getElementById("greeting")!.textContent = `Hola ${user}, disfruta tus compras`;
});

const logoutButton = document.getElementById("logoutButton");
logoutButton?.addEventListener("click", () => {
  logout();
  window.location.href = "/src/pages/auth/login/login.html";
});