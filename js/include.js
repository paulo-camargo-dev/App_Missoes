function markActiveLink(menu) {
  if (!menu) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  menu.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isActive = href === currentPage;
    link.classList.toggle("active", isActive);
  });
}

function iniciarMenu() {
  const toggle = document.getElementById("menuToggle");
  const menu = document.getElementById("menu");

  if (!toggle || !menu) return;
  if (toggle.dataset.menuReady === "1") return;
  toggle.dataset.menuReady = "1";

  let overlay = document.querySelector(".menu-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.classList.add("menu-overlay");
    document.body.appendChild(overlay);
  }

  function abrirMenu() {
    menu.classList.add("ativo");
    overlay.classList.add("ativo");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }

  function fecharMenu() {
    menu.classList.remove("ativo");
    overlay.classList.remove("ativo");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.contains("ativo") ? fecharMenu() : abrirMenu();
  });

  overlay.addEventListener("click", fecharMenu);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", fecharMenu);
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains("ativo")) {
      fecharMenu();
    }
  });
}

function loadComponent(id, file) {
  const target = document.getElementById(id);
  if (!target) return;

  fetch(file)
    .then((res) => res.text())
    .then((data) => {
      target.innerHTML = data;
      if (id === "header") {
        const menu = document.getElementById("menu");
        markActiveLink(menu);
        iniciarMenu();
      }
    })
    .catch(() => {
      const element = document.getElementById(id);
      if (element) element.innerHTML = "";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "components/header.html");
  loadComponent("footer", "components/footer.html");
});
