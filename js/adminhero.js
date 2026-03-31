import { db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { compressImageToDataURL, formatKB } from "./image-optimizer.js";

const HERO_COLLECTION = "hero";
const SOBRE_COLLECTION = "sobre";
const SOBRE_DOC_ID = "principal";

const lista = document.getElementById("listaHeroAdmin");
let imagemHeroBase64 = "";
let processamentoHero = null;

const HERO_IMAGE_OPTIONS = {
    maxWidth: 1920,
    maxHeight: 1080,
    targetKB: 360,
    maxPermitidoKB: 520
};

async function prepararImagemHero(file) {
    const resultado = await compressImageToDataURL(file, {
        maxWidth: HERO_IMAGE_OPTIONS.maxWidth,
        maxHeight: HERO_IMAGE_OPTIONS.maxHeight,
        targetKB: HERO_IMAGE_OPTIONS.targetKB
    });

    if (!resultado.dataUrl) {
        throw new Error("Nao foi possivel converter a imagem do banner.");
    }

    if (resultado.compressedBytes > HERO_IMAGE_OPTIONS.maxPermitidoKB * 1024) {
        throw new Error(
            `A imagem ainda ficou pesada (${formatKB(resultado.compressedBytes)}). ` +
            "Tente uma foto menor para evitar erro no upload."
        );
    }

    console.log(
        `Banner comprimido: ${formatKB(resultado.originalBytes)} -> ${formatKB(resultado.compressedBytes)}`
    );
    return resultado.dataUrl;
}

export async function carregarHeroAdmin() {
    if (!lista) return;

    lista.innerHTML = "";
    try {
        const querySnapshot = await getDocs(collection(db, HERO_COLLECTION));
        querySnapshot.forEach((docSnap, i) => {
            const b = docSnap.data();
            const div = document.createElement("div");
            div.classList.add("admin-item");
            div.innerHTML = `
                <img src="${b.imagem}" alt="Banner ${i + 1}">
                <div>
                    <strong>${b.titulo ?? ""}</strong><br>
                    <small>${b.subtitulo ?? ""}</small>
                </div>
                <button onclick="removerHero('${docSnap.id}')">Excluir</button>
            `;
            lista.appendChild(div);
        });
    } catch (e) {
        console.error("Erro ao carregar banners admin:", e);
    }
}

async function carregarSobreAdmin() {
    const tituloSobreInput = document.getElementById("tituloSobre");
    const textoSobreInput = document.getElementById("textoSobre");
    if (!tituloSobreInput || !textoSobreInput) return;

    try {
        const principalRef = doc(db, SOBRE_COLLECTION, SOBRE_DOC_ID);
        const principalSnap = await getDoc(principalRef);

        if (principalSnap.exists()) {
            const data = principalSnap.data();
            tituloSobreInput.value = data.titulo ?? "";
            textoSobreInput.value = data.texto ?? "";
            return;
        }

        // Compatibilidade com dados antigos salvos via addDoc()
        const legacySnap = await getDocs(collection(db, SOBRE_COLLECTION));
        if (!legacySnap.empty) {
            const legacyData = legacySnap.docs[0].data();
            tituloSobreInput.value = legacyData.titulo ?? "";
            textoSobreInput.value = legacyData.texto ?? "";
        }
    } catch (e) {
        console.error("Erro ao carregar seção sobre:", e);
    }
}

window.salvarHero = async function salvarHero() {
    const tituloEl = document.getElementById("tituloHero");
    const subtituloEl = document.getElementById("subtituloHero");
    const imagemEl = document.getElementById("imagemHero");
    const previewEl = document.getElementById("previewHero");

    if (!tituloEl || !subtituloEl || !imagemEl) return;

    const titulo = tituloEl.value.trim();
    const subtitulo = subtituloEl.value.trim();
    const file = imagemEl.files?.[0];

    if (processamentoHero) {
        await processamentoHero.catch(() => null);
    }

    if (!titulo || !subtitulo || !file) {
        alert("Preencha título, subtítulo e imagem.");
        return;
    }

    if (!imagemHeroBase64) {
        alert("Selecione uma imagem valida para o banner.");
        return;
    }

    try {
        await addDoc(collection(db, HERO_COLLECTION), {
            titulo,
            subtitulo,
            imagem: imagemHeroBase64,
            createdAt: new Date()
        });

        tituloEl.value = "";
        subtituloEl.value = "";
        imagemEl.value = "";
        imagemHeroBase64 = "";
        if (previewEl) previewEl.style.display = "none";
        await carregarHeroAdmin();
        alert("Banner adicionado com sucesso.");
    } catch (e) {
        console.error("Erro ao salvar banner:", e);
        alert("Erro ao salvar banner.");
    }
};

window.removerHero = async function removerHero(id) {
    try {
        await deleteDoc(doc(db, HERO_COLLECTION, id));
        await carregarHeroAdmin();
    } catch (e) {
        console.error("Erro ao remover banner:", e);
    }
};

window.salvarSobre = async function salvarSobre() {
    const tituloEl = document.getElementById("tituloSobre");
    const textoEl = document.getElementById("textoSobre");
    if (!tituloEl || !textoEl) return;

    const titulo = tituloEl.value.trim();
    const texto = textoEl.value.trim();
    if (!titulo || !texto) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        await setDoc(doc(db, SOBRE_COLLECTION, SOBRE_DOC_ID), { titulo, texto }, { merge: true });
        alert("Seção 'Quem Somos' atualizada!");
    } catch (e) {
        console.error("Erro ao salvar seção sobre:", e);
        alert("Erro ao salvar a seção.");
    }
};

const inputImg = document.getElementById("imagemHero");
if (inputImg) {
    inputImg.addEventListener("change", async function onChange() {
        const file = this.files?.[0];
        if (!file) {
            imagemHeroBase64 = "";
            return;
        }

        processamentoHero = prepararImagemHero(file);
        try {
            imagemHeroBase64 = await processamentoHero;
            const img = document.getElementById("previewHero");
            if (!img || !imagemHeroBase64) return;
            img.src = imagemHeroBase64;
            img.style.display = "block";
        } catch (erro) {
            imagemHeroBase64 = "";
            this.value = "";
            const img = document.getElementById("previewHero");
            if (img) img.style.display = "none";
            alert(erro.message || "Nao foi possivel processar o banner.");
        } finally {
            processamentoHero = null;
        }
    });
}

async function initAdminHero() {
    await Promise.all([carregarHeroAdmin(), carregarSobreAdmin()]);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdminHero);
} else {
    initAdminHero();
}
