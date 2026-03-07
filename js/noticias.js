import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("listaNoticias");

async function carregarNoticias(){
    if (!container) return;

    container.innerHTML = "<p class='estado-carregando'>Carregando noticias...</p>";

    try {
        const q = query(collection(db, "noticias"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = "<p class='estado-vazio'>Nenhuma noticia publicada ainda.</p>";
            return;
        }

        let html = "";
        querySnapshot.forEach((docItem) => {
            const noticia = docItem.data();
            const id = docItem.id;

            const conteudo = noticia?.conteudo || "";
            const preview = conteudo.length > 100 
                ? conteudo.substring(0, 100) + "..."
                : conteudo;

            html += `
                <a href="noticia.html?id=${id}" class="card-noticia">
                    <div class="imagem-wrapper">
                        <img
                            src="${noticia.imagem}"
                            alt="${noticia.titulo}"
                            loading="lazy"
                            decoding="async"
                            onload="this.parentElement.classList.add('carregada')"
                            onerror="this.parentElement.classList.add('carregada')"
                        >
                    </div>
                    <div class="conteudo-noticia">
                        <h3>${noticia.titulo}</h3>
                        <p>${preview}</p>
                        <span class="btn-saiba-mais">Saiba Mais -&gt;</span>
                    </div>
                </a>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Erro ao carregar noticias:", e);
        container.innerHTML = "<p class='estado-erro'>Nao foi possivel carregar as noticias.</p>";
    }
}

carregarNoticias();
