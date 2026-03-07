import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const grid = document.getElementById("gridGaleria");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

async function carregarGaleria() {
    if (!grid) return;

    grid.innerHTML = "<p class='estado-carregando'>Carregando galeria...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "galeria"));

        if (querySnapshot.empty) {
            grid.innerHTML = "<p class='estado-vazio'>Nenhuma foto publicada ainda.</p>";
            return;
        }

        let html = "";
        querySnapshot.forEach((docItem) => {
            const foto = docItem.data();
            html += `
                <div class="item-galeria">
                    <div class="thumb-wrapper">
                        <img
                            src="${foto.imagem}"
                            onclick="abrirLightbox('${foto.imagem}')"
                            alt="${foto.titulo}"
                            loading="lazy"
                            decoding="async"
                            onload="this.parentElement.classList.add('carregada')"
                            onerror="this.parentElement.classList.add('carregada')"
                        >
                        <h2>${foto.titulo}</h2>
                    </div>
                    <div class="descricao-card">
                        <p>${foto.descricao || ""}</p>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    } catch (e) {
        console.error("Erro ao carregar galeria:", e);
        grid.innerHTML = "<p class='estado-erro'>Nao foi possivel carregar a galeria.</p>";
    }
}

window.abrirLightbox = function(src) {
    lightbox.style.display = "flex";
    lightboxImg.src = src;
}

lightbox.addEventListener("click", function() {
    lightbox.style.display = "none";
});

carregarGaleria();
