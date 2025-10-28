export function SidebarAdmin() {
  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.innerHTML = `
    <h2>Panel Admin</h2>
    <ul>
      <li><a href="/src/pages/admin/adminHome/adminHome.html">Dashboard</a></li>
      <li><a href="/src/pages/admin/categories/adminCategories.html">Categorías</a></li>
      <li><a href="/src/pages/admin/products/adminProducts.html">Productos</a></li>
      <li><a href="/src/pages/admin/orders/adminOrders.html">Pedidos</a></li>
    </ul>
  `;
  return sidebar;
}
