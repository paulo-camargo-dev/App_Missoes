import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const lista = document.getElementById("listaHeroAdmin");

// Carregar banners no admin
export async function carregarHeroAdmin() {
    if(!lista) return;
    lista.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, "hero"));
        querySnapshot.forEach((docSnap, i) => {
            const b = docSnap.data();
            const div = document.createElement("div");
            div.classList.add("admin-item");
            div.innerHTML = `
                <img src="${b.imagem}" alt="Banner ${i+1}">
                <div>
                    <strong>${b.titulo}</strong><br>
                    <small>${b.subtitulo}</small>
                </div>
                <button onclick="removerHero('${docSnap.id}')">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch(e){
        console.error("Erro ao carregar banners admin:", e);
    }
}

// Salvar banner
window.salvarHero = async function() {
    const titulo = document.getElementById("tituloHero").value;
    const subtitulo = document.getElementById("subtituloHero").value;
    const file = document.getElementById("imagemHero").files[0];
    if(!file) return alert("Selecione uma imagem");

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            await addDoc(collection(db, "hero"), {titulo, subtitulo, imagem: reader.result});
            carregarHeroAdmin();
        } catch(e) {
            console.error("Erro ao salvar banner:", e);
        }
    };
    reader.readAsDataURL(file);
}

// Remover banner
window.removerHero = async function(id){
    try {
        await deleteDoc(doc(db, "hero", id));
        carregarHeroAdmin();
    } catch(e){
        console.error("Erro ao remover banner:", e);
    }
}

// Salvar seção sobre
window.salvarSobre = async function(){
    const titulo = document.getElementById("tituloSobre").value;
    const texto = document.getElementById("textoSobre").value;
    if(!titulo || !texto) return alert("Preencha todos os campos");
    try {
        await addDoc(collection(db, "sobre"), {titulo, texto});
        alert("Seção 'Quem Somos' atualizada!");
    } catch(e){
        console.error("Erro ao salvar seção sobre:", e);
    }
}