import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const grid = document.getElementById("gridGaleria");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

async function carregarGaleria() {
    grid.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "galeria"));

        querySnapshot.forEach((docItem) => {
            const foto = docItem.data();
            grid.innerHTML += `
                <div class="item-galeria">
                    <div style="position:relative;">
                        <img src="${foto.imagem}" onclick="abrirLightbox('${foto.imagem}')">
                        <h2>${foto.titulo}</h2>
                    </div>
                    <div class="descricao-card">
                        <p>${foto.descricao || ''}</p>
                    </div>
                </div>
            `;
        });
    } catch (e) {
        console.error("Erro ao carregar galeria:", e);
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