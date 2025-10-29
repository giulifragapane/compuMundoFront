export function StatCard(
  title: string,
  value: number,
  color: "blue" | "pink" | "cyan" | "green"
): HTMLElement {
  const card = document.createElement("div");
  card.className = `card-stats card-${color}`;

  const h3 = document.createElement("h3");
  h3.textContent = title;

  const p = document.createElement("p");
  p.textContent = value.toString();

  const button = document.createElement("button");
  button.textContent = "Gestionar";
  button.className = "manage-btn";

  card.append(h3, p, button);
  return card;
}
