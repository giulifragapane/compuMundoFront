export function Badge(text: string, type: "success" | "warning" | "danger") {
  const badge = document.createElement("span");
  badge.className = `badge ${type}`;
  badge.textContent = text;
  return badge;
}
