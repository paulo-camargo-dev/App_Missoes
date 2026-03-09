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

const HERO_COLLECTION = "hero";
const SOBRE_COLLECTION = "sobre";
const SOBRE_DOC_ID = "principal";

const lista = document.getElementById("listaHeroAdmin");

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Falha ao ler imagem."));
        reader.readAsDataURL(file);
    });
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

    if (!titulo || !subtitulo || !file) {
        alert("Preencha título, subtítulo e imagem.");
        return;
    }

    try {
        const imagem = await fileToDataURL(file);
        await addDoc(collection(db, HERO_COLLECTION), {
            titulo,
            subtitulo,
            imagem,
            createdAt: new Date()
        });

        tituloEl.value = "";
        subtituloEl.value = "";
        imagemEl.value = "";
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
    inputImg.addEventListener("change", function onChange() {
        const file = this.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = document.getElementById("previewHero");
            if (!img) return;
            img.src = reader.result;
            img.style.display = "block";
        };
        reader.readAsDataURL(file);
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
