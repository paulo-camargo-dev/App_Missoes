// =================== IMPORTS ===================
import { db } from "./firebase-config.js";

import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { 
  getAuth, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const auth = getAuth();


// =================== PROTEGER PÁGINA ===================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});


// =================== VARIÁVEIS ===================
let imagemNoticiaBase64 = "";
let imagemFotoBase64 = "";


// =================== PREVIEW DE IMAGEM NOTÍCIA ===================
document.getElementById("imagemNoticia")?.addEventListener("change", function(e){

    const reader = new FileReader();

    reader.onload = function(event){
        imagemNoticiaBase64 = event.target.result;

        const preview = document.getElementById("previewNoticia");

        if(preview){
            preview.src = imagemNoticiaBase64;
            preview.style.display = "block";
        }
    };

    reader.readAsDataURL(e.target.files[0]);
});


// =================== PREVIEW DE FOTO ===================
document.getElementById("imagemFoto")?.addEventListener("change", function(e){

    const reader = new FileReader();

    reader.onload = function(event){
        imagemFotoBase64 = event.target.result;
    };

    reader.readAsDataURL(e.target.files[0]);
});


// =================== SALVAR NOTÍCIA ===================
window.salvarNoticia = async function() {

    const titulo = document.getElementById("tituloNoticia").value.trim();
    const conteudo = document.getElementById("conteudoNoticia").value.trim();

    if(!titulo || !conteudo || !imagemNoticiaBase64){
        alert("Preencha todos os campos!");
        return;
    }

    try {

        await addDoc(collection(db, "noticias"), {
            titulo,
            conteudo,
            imagem: imagemNoticiaBase64,
            data: new Date()
        });

        alert("Notícia publicada com sucesso!");

        document.getElementById("tituloNoticia").value = "";
        document.getElementById("conteudoNoticia").value = "";
        document.getElementById("imagemNoticia").value = "";
        document.getElementById("previewNoticia").style.display = "none";

        imagemNoticiaBase64 = "";

        carregarNoticiasAdmin();

    } catch (e) {

        console.error("Erro ao salvar notícia:", e);
        alert("Erro ao salvar notícia.");

    }
};


// =================== SALVAR FOTO ===================
window.salvarFoto = async function() {

    const titulo = document.getElementById("tituloFoto").value.trim();
    const descricao = document.getElementById("descricaoFoto").value.trim();

    if(!titulo || !imagemFotoBase64){
        alert("Preencha todos os campos!");
        return;
    }

    try {

        await addDoc(collection(db, "galeria"), {
            titulo,
            descricao,
            imagem: imagemFotoBase64,
            data: new Date()
        });

        alert("Foto publicada com sucesso!");

        document.getElementById("tituloFoto").value = "";
        document.getElementById("descricaoFoto").value = "";
        document.getElementById("imagemFoto").value = "";

        imagemFotoBase64 = "";

        carregarFotosAdmin();

    } catch (e) {

        console.error("Erro ao salvar foto:", e);
        alert("Erro ao salvar foto.");

    }
};


// =================== CARREGAR NOTÍCIAS ===================
async function carregarNoticiasAdmin() {

    const container = document.getElementById("listaNoticiasAdmin");

    if(!container) return;

    container.innerHTML = "";

    try {

        const querySnapshot = await getDocs(collection(db, "noticias"));

        querySnapshot.forEach((docSnap) => {

            const noticia = docSnap.data();

            container.innerHTML += `
                <div class="admin-item">
                    <img src="${noticia.imagem}" width="80">
                    <span>${noticia.titulo}</span>
                    <button onclick="excluirNoticiaAdmin('${docSnap.id}')">Excluir</button>
                </div>
            `;

        });

    } catch (e) {

        console.error("Erro ao carregar notícias:", e);

    }
}


// =================== EXCLUIR NOTÍCIA ===================
window.excluirNoticiaAdmin = async function(id){

    if(confirm("Deseja excluir esta notícia?")){

        try {

            await deleteDoc(doc(db, "noticias", id));
            carregarNoticiasAdmin();

        } catch(e){

            console.error("Erro ao excluir notícia:", e);

        }

    }

};


// =================== CARREGAR FOTOS ===================
async function carregarFotosAdmin() {

    const container = document.getElementById("listaFotosAdmin");

    if(!container) return;

    container.innerHTML = "";

    try {

        const querySnapshot = await getDocs(collection(db, "galeria"));

        querySnapshot.forEach((docSnap) => {

            const foto = docSnap.data();

            container.innerHTML += `
                <div class="admin-item">
                    <img src="${foto.imagem}" width="80">
                    <span>${foto.titulo}</span>
                    <button onclick="excluirFotoAdmin('${docSnap.id}')">Excluir</button>
                </div>
            `;

        });

    } catch(e){

        console.error("Erro ao carregar fotos:", e);

    }

}


// =================== EXCLUIR FOTO ===================
window.excluirFotoAdmin = async function(id){

    if(confirm("Deseja excluir esta foto?")){

        try {

            await deleteDoc(doc(db, "galeria", id));
            carregarFotosAdmin();

        } catch(e){

            console.error("Erro ao excluir foto:", e);

        }

    }

};


// =================== INICIALIZAÇÃO ===================
document.addEventListener("DOMContentLoaded", () => {

    carregarNoticiasAdmin();
    carregarFotosAdmin();

    const logoutBtn = document.getElementById("logoutBtn");

    if(logoutBtn){

        logoutBtn.addEventListener("click", () => {

            signOut(auth).then(() => {

                window.location.href = "login.html";

            });

        });

    }

});
