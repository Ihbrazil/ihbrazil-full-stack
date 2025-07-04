document.addEventListener("DOMContentLoaded", function () {
  const sanduiche = document.getElementById("sanduiche");
  const menu = document.getElementById("menu");
  const links = document.querySelectorAll(".menu a");

  // Alterna o menu ao clicar no botão
  sanduiche.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  // Permite abrir/fechar com Enter ou Espaço
  sanduiche.addEventListener("keypress", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      menu.classList.toggle("active");
    }
  });

  // Fecha o menu ao clicar em qualquer link dentro dele
  links.forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });

  // Fecha o menu ao pressionar ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("active");
    }
  });
});