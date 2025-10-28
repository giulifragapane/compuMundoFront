export function Navbar(userName?: string) {
  const navbar = document.createElement("nav");
  navbar.className = "navbar";

  navbar.innerHTML = `
    <div class="navbar-left">
      <a href="/" class="logo">MyStore</a>
      <a href="/index.html">Inicio</a>
      <a href="/src/pages/admin/adminHome/adminHome.html">Admin</a>
    </div>
    <div class="navbar-right">
      <span class="user">${userName ? userName : "Invitado"}</span>
      <button id="logoutBtn">Salir</button>
    </div>
  `;

  return navbar;
}
