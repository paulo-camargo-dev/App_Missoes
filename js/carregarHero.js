import { db } from "./firebase-config.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const HERO_COLLECTION = "hero";
const SOBRE_COLLECTION = "sobre";
const SOBRE_DOC_ID = "principal";

const fallbackBanners = [
    {
        imagem: "assets/images/banner1.jpg",
        titulo: "Levando esperanca onde ha necessidade",
        subtitulo: "Junte-se a nossa missao e faca parte da transformacao."
    },
    {
        imagem: "assets/images/banner2.jpg",
        titulo: "Impactando familias",
        subtitulo: "Acoes sociais e evangelismo para alcancar mais pessoas."
    },
    {
        imagem: "assets/images/banner3.jpeg",
        titulo: "Missoes pelo mundo",
        subtitulo: "Expandindo o Reino de Deus."
    }
];

const fallbackSobre = {
    titulo: "Quem Somos",
    texto: "Somos um ministerio missionario comprometido com evangelismo e acao social."
};

async function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Falha ao ler imagem."));
        reader.readAsDataURL(file);
    });
}

async function carregarHeroHome() {
    const hero = document.getElementById("heroBanners");
    if (!hero) return;

    let banners = [];
    try {
        const q = query(collection(db, HERO_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => banners.push(docSnap.data()));
    } catch (error) {
        console.error("Erro ao carregar banners:", error);
    }

    const source = banners.length > 0 ? banners : fallbackBanners;
    hero.innerHTML = "";

    source.forEach((banner, index) => {
        const slide = document.createElement("div");
        slide.classList.add("hero-slide");
        if (index === 0) slide.classList.add("active");
        slide.style.backgroundImage = `url('${banner.imagem}')`;
        slide.innerHTML = `
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>${banner.titulo}</h1>
                <p>${banner.subtitulo}</p>
            </div>
        `;
        hero.appendChild(slide);
    });

    let current = 0;
    setInterval(() => {
        const slides = hero.querySelectorAll(".hero-slide");
        if (slides.length < 2) return;
        slides[current].classList.remove("active");
        current = (current + 1) % slides.length;
        slides[current].classList.add("active");
    }, 5000);
}

async function carregarHeroAdmin() {
    const lista = document.getElementById("listaHeroAdmin");
    if (!lista) return;

    lista.innerHTML = "";
    try {
        const q = query(collection(db, HERO_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap, index) => {
            const banner = docSnap.data();
            const item = document.createElement("div");
            item.classList.add("admin-item");
            item.innerHTML = `
                <img src="${banner.imagem}" alt="Banner ${index + 1}">
                <div>
                    <strong>${banner.titulo}</strong><br>
                    <small>${banner.subtitulo}</small>
                </div>
                <button onclick="removerHero('${docSnap.id}')">Excluir</button>
            `;
            lista.appendChild(item);
        });
    } catch (error) {
        console.error("Erro ao carregar banners no admin:", error);
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

    if (!file || !titulo || !subtitulo) {
        alert("Preencha titulo, subtitulo e imagem.");
        return;
    }

    if (file.size > 700 * 1024) {
        alert("Imagem muito grande. Use uma imagem com ate 700KB.");
        return;
    }

    try {
        const imagemBase64 = await fileToDataURL(file);
        await addDoc(collection(db, HERO_COLLECTION), {
            titulo,
            subtitulo,
            imagem: imagemBase64,
            createdAt: new Date()
        });
        tituloEl.value = "";
        subtituloEl.value = "";
        imagemEl.value = "";
        if (previewEl) previewEl.style.display = "none";
        await carregarHeroAdmin();
        alert("Banner salvo com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar banner:", error);
        alert(`Nao foi possivel salvar o banner. ${error?.message ?? ""}`);
    }
};

window.removerHero = async function removerHero(id) {
    if (!id || !confirm("Deseja excluir este banner?")) return;
    try {
        await deleteDoc(doc(db, HERO_COLLECTION, id));
        await carregarHeroAdmin();
    } catch (error) {
        console.error("Erro ao remover banner:", error);
    }
};

async function carregarSobre() {
    let sobreData = fallbackSobre;
    try {
        const docRef = doc(db, SOBRE_COLLECTION, SOBRE_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) sobreData = docSnap.data();
    } catch (error) {
        console.error("Erro ao carregar secao sobre:", error);
    }

    const sobreSection = document.getElementById("sobreSection");
    if (sobreSection) {
        sobreSection.innerHTML = `
            <div class="container">
                <h2>${sobreData.titulo}</h2>
                <p>${sobreData.texto}</p>
            </div>
        `;
    }

    const tituloSobreInput = document.getElementById("tituloSobre");
    const textoSobreInput = document.getElementById("textoSobre");
    if (tituloSobreInput) tituloSobreInput.value = sobreData.titulo ?? "";
    if (textoSobreInput) textoSobreInput.value = sobreData.texto ?? "";
}

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
        alert("Secao atualizada com sucesso.");
    } catch (error) {
        console.error("Erro ao salvar secao sobre:", error);
        alert(`Nao foi possivel salvar a secao. ${error?.message ?? ""}`);
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

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([carregarHeroHome(), carregarHeroAdmin(), carregarSobre()]);
});


