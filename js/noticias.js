import { db } from "./firebase-config.js";
import { collection, getDocs, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const container = document.getElementById("listaNoticias");

async function carregarNoticias(){
    container.innerHTML = "";

    try {
        const q = query(collection(db, "noticias"), orderBy("data", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docItem) => {
            const noticia = docItem.data();
            const id = docItem.id;

            // Limitar preview
            const preview = noticia.conteudo.length > 100 
                ? noticia.conteudo.substring(0, 100) + "..."
                : noticia.conteudo;

            container.innerHTML += `
                <a href="noticia.html?id=${id}" class="card-noticia">
                    <img src="${noticia.imagem}" alt="${noticia.titulo}">
                    <div class="conteudo-noticia">
                        <h3>${noticia.titulo}</h3>
                        <p>${preview}</p>
                        <span class="btn-saiba-mais">Saiba Mais →</span>
                    </div>
                </a>
            `;
        });
    } catch (e) {
        console.error("Erro ao carregar notícias:", e);
    }
}

carregarNoticias();