// ===============================
// MENU HAMBURGUER PROFISSIONAL
// ===============================

document.addEventListener("DOMContentLoaded", function () {

    const toggle = document.getElementById("menuToggle");
    const menu = document.getElementById("menu");

    // Criar overlay dinamicamente se não existir
    let overlay = document.querySelector(".menu-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.classList.add("menu-overlay");
        document.body.appendChild(overlay);
    }

    // Função abrir/fechar menu
    function toggleMenu() {
        menu.classList.toggle("ativo");
        overlay.classList.toggle("ativo");
        document.body.classList.toggle("no-scroll"); // impede scroll quando menu aberto
    }

    // Clique no botão hamburguer
    toggle.addEventListener("click", function(e){
        e.preventDefault();
        toggleMenu();
    });

    // Clique no overlay fecha menu
    overlay.addEventListener("click", toggleMenu);

    // Fecha clicando em qualquer link do menu
    menu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", toggleMenu);
    });

    // Fecha ao clicar fora do menu
    document.addEventListener("click", function(e){
        if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains("ativo")) {
            toggleMenu();
        }
    });

});




const slides = document.querySelectorAll('.slide');
let current = 0;

function changeSlide() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
}

setInterval(changeSlide, 5000);

// Parte da Doação 

function mostrarAba(id) {

    document.querySelectorAll(".conteudo").forEach(sec => {
        sec.classList.remove("active");
    });

    document.querySelectorAll(".tab").forEach(btn => {
        btn.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
    event.target.classList.add("active");
}

function copiarPix() {
    navigator.clipboard.writeText("missoes@exemplo.com.br");
    alert("Chave PIX copiada!");
}

function copiarTransferencia() {
    const dados = `
Banco: Banco do Brasil
Agência: 0001
Conta: 12345-6
Nome: Missões Transformando Vidas
`;
    navigator.clipboard.writeText(dados);
    alert("Dados copiados!");
}

//card clicavel 

document.querySelectorAll('.post-card').forEach((card, index) => {
    card.style.cursor = 'pointer'; // mostra que é clicável
    card.addEventListener('click', () => {
        window.location.href = `paginaDetalhe.html?id=${index+1}`;
    });
});
