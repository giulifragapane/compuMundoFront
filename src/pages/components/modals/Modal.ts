export function Modal(title: string, content: string) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal">
      <h2>${title}</h2>
      <div class="modal-content">${content}</div>
      <button class="close-modal">Cerrar</button>
    </div>
  `;

  modal.querySelector(".close-modal")?.addEventListener("click", () => {
    modal.remove();
  });

  return modal;
}
