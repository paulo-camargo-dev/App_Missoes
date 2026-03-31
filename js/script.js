const slides = document.querySelectorAll(".slide");
let current = 0;

function changeSlide() {
    if (!slides.length) return;
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
}

if (slides.length) {
    setInterval(changeSlide, 5000);
}

function mostrarAba(id) {
    document.querySelectorAll(".conteudo").forEach((sec) => {
        sec.classList.remove("active");
    });

    document.querySelectorAll(".tab").forEach((btn) => {
        btn.classList.remove("active");
    });

    document.getElementById(id)?.classList.add("active");
    if (typeof event !== "undefined" && event?.target) {
        event.target.classList.add("active");
    }
}

function copiarPix() {
    navigator.clipboard.writeText("missoes@exemplo.com.br");
    alert("Chave PIX copiada!");
}

function copiarTransferencia() {
    const dados = `
Banco: Banco do Brasil
Agencia: 0001
Conta: 12345-6
Nome: Missoes Transformando Vidas
`;
    navigator.clipboard.writeText(dados);
    alert("Dados copiados!");
}

document.querySelectorAll(".post-card").forEach((card, index) => {
    const linkPai = card.closest("a[href]");
    card.style.cursor = "pointer";

    // Se o card ja estiver dentro de um link, deixa o link do HTML controlar a navegacao.
    if (linkPai) return;

    const fallbackPages = ["paginaDetalhe2.html?id=2", "paginaDetalhe3.html?id=3"];
    const destino = fallbackPages[index % fallbackPages.length];
    card.addEventListener("click", () => {
        window.location.href = destino;
    });
});

window.mostrarAba = mostrarAba;
window.copiarPix = copiarPix;
window.copiarTransferencia = copiarTransferencia;
