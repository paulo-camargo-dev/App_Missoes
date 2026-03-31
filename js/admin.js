// =================== IMPORTS FIRESTORE ===================
import { db } from "./firebase-config.js";
import { collection, addDoc, getDocs, deleteDoc, doc }
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { compressImageToDataURL, formatKB } from "./image-optimizer.js";

// =================== VARIAVEIS ===================
let imagemNoticiaBase64 = "";
let imagemFotoBase64 = "";
let processamentoNoticia = null;
let processamentoFoto = null;

const LIMITES_IMAGEM = {
    noticia: { maxWidth: 1600, maxHeight: 1600, targetKB: 320, maxPermitidoKB: 480 },
    galeria: { maxWidth: 1600, maxHeight: 1600, targetKB: 300, maxPermitidoKB: 450 }
};

async function prepararImagem(input, opcoes) {
    const file = input?.files?.[0];
    if (!file) {
        return null;
    }

    const resultado = await compressImageToDataURL(file, {
        maxWidth: opcoes.maxWidth,
        maxHeight: opcoes.maxHeight,
        targetKB: opcoes.targetKB
    });

    if (!resultado.dataUrl) {
        throw new Error("Nao foi possivel converter esta imagem.");
    }

    if (resultado.compressedBytes > opcoes.maxPermitidoKB * 1024) {
        throw new Error(
            `A imagem ainda ficou pesada (${formatKB(resultado.compressedBytes)}). ` +
            "Use uma foto menor para evitar erro no upload."
        );
    }

    console.log(
        `Imagem comprimida: ${formatKB(resultado.originalBytes)} -> ${formatKB(resultado.compressedBytes)}`
    );
    return resultado.dataUrl;
}

// =================== PREVIEW DE IMAGENS ===================
document.getElementById("imagemNoticia")?.addEventListener("change", async function() {
    const preview = document.getElementById("previewNoticia");
    processamentoNoticia = prepararImagem(this, LIMITES_IMAGEM.noticia);

    try {
        imagemNoticiaBase64 = await processamentoNoticia;
        if (preview && imagemNoticiaBase64) {
            preview.src = imagemNoticiaBase64;
            preview.style.display = "block";
        }
    } catch (erro) {
        imagemNoticiaBase64 = "";
        this.value = "";
        if (preview) preview.style.display = "none";
        alert(erro.message || "Nao foi possivel processar a imagem da noticia.");
    } finally {
        processamentoNoticia = null;
    }
});

document.getElementById("imagemFoto")?.addEventListener("change", async function() {
    processamentoFoto = prepararImagem(this, LIMITES_IMAGEM.galeria);

    try {
        imagemFotoBase64 = await processamentoFoto;
        console.log("Imagem da galeria pronta para upload");
    } catch (erro) {
        imagemFotoBase64 = "";
        this.value = "";
        alert(erro.message || "Nao foi possivel processar a imagem da galeria.");
    } finally {
        processamentoFoto = null;
    }
});

// =================== SALVAR NOTICIAS ===================
window.salvarNoticia = async function() {
    const titulo = document.getElementById("tituloNoticia").value.trim();
    const conteudo = document.getElementById("conteudoNoticia").value.trim();
    if (processamentoNoticia) {
        await processamentoNoticia.catch(() => null);
    }
    if(!titulo || !conteudo || !imagemNoticiaBase64) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        await addDoc(collection(db, "noticias"), { titulo, conteudo, imagem: imagemNoticiaBase64, data: new Date() });
        alert("Noticia publicada com sucesso!");
        document.getElementById("tituloNoticia").value = "";
        document.getElementById("conteudoNoticia").value = "";
        document.getElementById("imagemNoticia").value = "";
        document.getElementById("previewNoticia").style.display = "none";
        imagemNoticiaBase64 = "";
        carregarNoticiasAdmin();
    } catch (e) {
        console.error("Erro ao salvar noticia:", e);
        alert("Erro ao salvar noticia, veja console.");
    }
}

// =================== SALVAR FOTOS ===================
window.salvarFoto = async function() {
    const titulo = document.getElementById("tituloFoto").value.trim();
    const descricao = document.getElementById("descricaoFoto").value.trim();
    if (processamentoFoto) {
        await processamentoFoto.catch(() => null);
    }
    if(!titulo || !imagemFotoBase64) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        await addDoc(collection(db, "galeria"), { titulo, descricao, imagem: imagemFotoBase64, data: new Date() });
        alert("Foto publicada com sucesso!");
        document.getElementById("tituloFoto").value = "";
        document.getElementById("descricaoFoto").value = "";
        document.getElementById("imagemFoto").value = "";
        imagemFotoBase64 = "";
        carregarFotosAdmin();
    } catch (e) {
        console.error("Erro ao salvar foto:", e);
        alert("Erro ao salvar foto, veja console.");
    }
}

// =================== CARREGAR NOTICIAS ===================
async function carregarNoticiasAdmin() {
    const container = document.getElementById("listaNoticiasAdmin");
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
        console.error("Erro ao carregar noticias:", e);
    }
}

window.excluirNoticiaAdmin = async function(id){
    if(confirm("Deseja excluir esta noticia?")){
        try {
            await deleteDoc(doc(db, "noticias", id));
            carregarNoticiasAdmin();
        } catch(e){
            console.error("Erro ao excluir noticia:", e);
        }
    }
}

// =================== CARREGAR FOTOS ===================
async function carregarFotosAdmin() {
    const container = document.getElementById("listaFotosAdmin");
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

window.excluirFotoAdmin = async function(id){
    if(confirm("Deseja excluir esta foto?")){
        try {
            await deleteDoc(doc(db, "galeria", id));
            carregarFotosAdmin();
        } catch(e){
            console.error("Erro ao excluir foto:", e);
        }
    }
}

window.carregarGaleriaAdmin = async function() {
    await carregarFotosAdmin();
};

// =================== INICIALIZACAO ===================
function initAdmin() {
    carregarNoticiasAdmin();
    carregarFotosAdmin();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
} else {
    initAdmin();
}
