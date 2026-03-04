import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async function() {

    const container = document.getElementById("noticiaCompleta");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) {
        container.innerHTML = "<h2 style='text-align:center;'>Notícia não encontrada.</h2>";
        return;
    }

    try {
        const docRef = doc(db, "noticias", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            container.innerHTML = "<h2 style='text-align:center;'>Notícia não encontrada.</h2>";
            return;
        }

        const noticia = docSnap.data();

        container.innerHTML = `
            <div class="layout-noticia">

                <div class="imagem-noticia">
                    <img src="${noticia.imagem}" alt="${noticia.titulo}">
                </div>

                <div class="conteudo-noticia-individual">
                    <h1>${noticia.titulo}</h1>
                    <div class="linha"></div>
                    <p>${noticia.conteudo}</p>
                </div>

            </div>
        `;

    } catch (e) {
        console.error("Erro ao carregar notícia:", e);
        container.innerHTML = "<h2 style='text-align:center;'>Erro ao carregar notícia.</h2>";
    }
});

// botão voltar
window.voltarPagina = function() {
    window.history.back();
}