// Importações Firestore
import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===================== HERO DINÂMICO =====================
export async function carregarHeroHome() {
    const hero = document.getElementById("heroBanners");
    if (!hero) return;

    let banners = [];
    try {
        const querySnapshot = await getDocs(collection(db, "heroBanners"));
        querySnapshot.forEach(docSnap => {
            banners.push(docSnap.data());
        });
    } catch(e) {
        console.error("Erro ao carregar banners do Firestore:", e);
    }

    if(banners.length === 0){
        // Caso não tenha banners cadastrados, use padrões
        banners = [
            {imagem:"assets/images/banner1.jpg", titulo:"Levando esperança onde há necessidade", subtitulo:"Junte-se à nossa missão e faça parte da transformação."},
            {imagem:"assets/images/banner2.jpg", titulo:"Impactando famílias", subtitulo:"Através de ações sociais e evangelismo."},
            {imagem:"assets/images/banner3.jpeg", titulo:"Missões pelo mundo", subtitulo:"Expandindo o Reino de Deus."}
        ];
    }

    hero.innerHTML = "";

    banners.forEach((b,i)=>{
        const div = document.createElement("div");
        div.classList.add("hero-slide");
        if(i===0) div.classList.add("active");
        div.style.backgroundImage = `url('${b.imagem}')`;
        div.innerHTML = `
            <div class="hero-overlay"></div>
            <div class="hero-content">
                <h1>${b.titulo}</h1>
                <p>${b.subtitulo}</p>
            </div>
        `;
        hero.appendChild(div);
    });

    // Troca automática de slides
    let current = 0;
    setInterval(() => {
        const slides = document.querySelectorAll('.hero-slide');
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
    }, 5000);
}

// ===================== ADMIN HERO =====================
export async function carregarHeroAdmin(){
    const lista = document.getElementById("listaHeroAdmin");
    if(!lista) return;

    lista.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "heroBanners"));
        querySnapshot.forEach((docSnap, i)=>{
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

// ===================== SALVAR HERO =====================
window.salvarHero = async function(){
    const titulo = document.getElementById("tituloHero").value;
    const subtitulo = document.getElementById("subtituloHero").value;
    const file = document.getElementById("imagemHero").files[0];

    if(!file) return alert("Selecione uma imagem");
    if(!titulo || !subtitulo) return alert("Preencha todos os campos");

    const reader = new FileReader();
    reader.onload = async function(){
        try {
            await addDoc(collection(db, "heroBanners"), {
                titulo,
                subtitulo,
                imagem: reader.result
            });
            alert("Banner adicionado com sucesso!");
            carregarHeroAdmin();
            document.getElementById("tituloHero").value = "";
            document.getElementById("subtituloHero").value = "";
            document.getElementById("imagemHero").value = "";
            document.getElementById("previewHero").style.display = "none";
        } catch(e){
            console.error("Erro ao salvar banner:", e);
            alert("Erro ao salvar banner, veja console.");
        }
    }
    reader.readAsDataURL(file);
}

// ===================== REMOVER HERO =====================
window.removerHero = async function(id){
    if(confirm("Deseja excluir este banner?")){
        try {
            await deleteDoc(doc(db, "heroBanners", id));
            carregarHeroAdmin();
        } catch(e){
            console.error("Erro ao remover banner:", e);
        }
    }
}

// ===================== SOBRE DINÂMICO =====================
export async function carregarSobre(){
    const sobreSection = document.getElementById("sobreSection");
    if(!sobreSection) return;

    let sobreData = {titulo: "Quem Somos", texto:"Somos um ministério missionário..."};

    try {
        const querySnapshot = await getDocs(collection(db, "sobre"));
        querySnapshot.forEach(docSnap => {
            sobreData = docSnap.data(); // Pega o primeiro documento
        });
    } catch(e){
        console.error("Erro ao carregar 'Quem Somos':", e);
    }

    sobreSection.innerHTML = `
        <div class="container">
            <h2>${sobreData.titulo}</h2>
            <p>${sobreData.texto}</p>
        </div>
    `;
}

// ===================== SALVAR SOBRE =====================
window.salvarSobre = async function(){
    const titulo = document.getElementById("tituloSobre").value;
    const texto = document.getElementById("textoSobre").value;
    if(!titulo || !texto) return alert("Preencha todos os campos");

    try {
        // Sobrescreve documento fixo "sobreDoc"
        await setDoc(doc(db, "sobre", "sobreDoc"), {titulo, texto});
        alert("Seção 'Quem Somos' atualizada!");
        carregarSobre();
    } catch(e){
        console.error("Erro ao salvar 'Quem Somos':", e);
        alert("Erro ao salvar a seção, veja console.");
    }
}

// ===================== PREVIEW IMAGEM HERO =====================
document.getElementById("imagemHero")?.addEventListener("change", function(){
    const file = this.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(){
            const img = document.getElementById("previewHero");
            img.src = reader.result;
            img.style.display = "block";
        }
        reader.readAsDataURL(file);
    }
});

// ===================== INICIALIZAÇÃO =====================
document.addEventListener("DOMContentLoaded", function(){
    carregarHeroHome();
    carregarHeroAdmin();
    carregarSobre();
});