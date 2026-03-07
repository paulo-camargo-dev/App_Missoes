// Função para carregar includes
function loadComponent(id, file) {
  const target = document.getElementById(id);
  if (!target) return;

  fetch(file)
    .then(res => res.text())
    .then(data => {
      target.innerHTML = data;
      // Inicializa o menu APENAS depois que o header foi carregado
      if (id === "header") iniciarMenu();
    })
    .catch(() => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = "";
    });
}

// Função do menu hamburguer
function iniciarMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");

  if (!toggle || !menu) return;

  // Overlay (criado apenas uma vez)
  let overlay = document.querySelector(".menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("menu-overlay");
    // INSERE O OVERLAY ATRÁS DO MENU
    document.body.appendChild(overlay);
  }

  // Funções abrir/fechar menu
  function abrirMenu() {
    menu.classList.add("ativo");
    overlay.classList.add("ativo");
    document.body.classList.add("no-scroll");
  }

  function fecharMenu() {
    menu.classList.remove("ativo");
    overlay.classList.remove("ativo");
    document.body.classList.remove("no-scroll");
  }

  // Clique no hamburguer
  toggle.addEventListener("click", e => {
    e.stopPropagation();
    menu.classList.contains("ativo") ? fecharMenu() : abrirMenu();
  });

  // Clique no overlay
  overlay.addEventListener("click", fecharMenu);

  // Clique em qualquer link do menu
  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", fecharMenu);
  });

  // Clique fora do menu fecha
  document.addEventListener("click", e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains("ativo")) {
      fecharMenu();
    }
  });
}

// Inicializa includes
document.addEventListener("DOMContentLoaded", function () {
  loadComponent("header", "components/header.html");
  loadComponent("footer", "components/footer.html");
});

