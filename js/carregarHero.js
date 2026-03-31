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

/* ===============================
CONFIG
================================ */

const HERO_COLLECTION = "hero";
const SOBRE_COLLECTION = "sobre";
const SOBRE_DOC_ID = "principal";

/* ===============================
FALLBACK (CARREGA IMEDIATO)
================================ */

const fallbackBanners = [
{
imagem:"assets/images/banner1.jpg",
titulo:"Levando esperança onde há necessidade",
subtitulo:"Junte-se a nossa missão e faça parte da transformação."
},
{
imagem:"assets/images/banner2.jpg",
titulo:"Impactando famílias",
subtitulo:"Ações sociais e evangelismo para alcançar mais pessoas."
},
{
imagem:"assets/images/banner3.jpeg",
titulo:"Missões pelo mundo",
subtitulo:"Expandindo o Reino de Deus."
}
];

const fallbackSobre = {
titulo:"Quem Somos",
texto:"Somos um ministério missionário comprometido com evangelismo e ação social."
};

/* ===============================
RENDER HERO
================================ */

function renderHero(hero,banners){

hero.innerHTML="";

banners.forEach((banner,index)=>{

const slide=document.createElement("div");

slide.classList.add("hero-slide");

if(index===0) slide.classList.add("active");

slide.style.backgroundImage=`url('${banner.imagem}')`;

slide.innerHTML=`
<div class="hero-overlay"></div>

<div class="hero-content">
<h1>${banner.titulo}</h1>
<p>${banner.subtitulo}</p>
</div>
`;

hero.appendChild(slide);

});

}

/* ===============================
SLIDER
================================ */

let sliderInterval=null;

function iniciarSlider(){

if(sliderInterval) clearInterval(sliderInterval);

let current=0;

sliderInterval=setInterval(()=>{

const slides=document.querySelectorAll(".hero-slide");

if(slides.length<2) return;

slides[current].classList.remove("active");

current=(current+1)%slides.length;

slides[current].classList.add("active");

},5000);

}

/* ===============================
CARREGAR HERO HOME
================================ */

async function carregarHeroHome(){

const hero=document.getElementById("heroBanners");

if(!hero) return;

if(!hero.querySelector(".hero-slide")){
renderHero(hero,fallbackBanners);
iniciarSlider();
}

try{

const q=query(
collection(db,HERO_COLLECTION),
orderBy("createdAt","desc")
);

const querySnapshot=await getDocs(q);

let banners=[];

querySnapshot.forEach(docSnap=>{

banners.push(docSnap.data());

});

if(banners.length>0){

renderHero(hero,banners);

iniciarSlider();

}else{

renderHero(hero,fallbackBanners);

iniciarSlider();

}

}catch(error){

console.error("Erro ao carregar banners:",error);

renderHero(hero,fallbackBanners);

iniciarSlider();

}

}

/* ===============================
ADMIN HERO
================================ */

async function carregarHeroAdmin(){

const lista=document.getElementById("listaHeroAdmin");

if(!lista) return;

lista.innerHTML="";

try{

const q=query(
collection(db,HERO_COLLECTION),
orderBy("createdAt","desc")
);

const querySnapshot=await getDocs(q);

querySnapshot.forEach((docSnap,index)=>{

const banner=docSnap.data();

const item=document.createElement("div");

item.classList.add("admin-item");

item.innerHTML=`

<img src="${banner.imagem}" alt="Banner ${index+1}">

<div>
<strong>${banner.titulo}</strong><br>
<small>${banner.subtitulo}</small>
</div>

<button onclick="removerHero('${docSnap.id}')">
Excluir
</button>

`;

lista.appendChild(item);

});

}catch(error){

console.error("Erro ao carregar banners admin:",error);

}

}

/* ===============================
SALVAR HERO
================================ */

async function fileToDataURL(file){

return new Promise((resolve,reject)=>{

const reader=new FileReader();

reader.onload=()=>resolve(reader.result);

reader.onerror=()=>reject("Erro ao ler imagem");

reader.readAsDataURL(file);

});

}

window.salvarHero=async function(){

const titulo=document.getElementById("tituloHero")?.value.trim();
const subtitulo=document.getElementById("subtituloHero")?.value.trim();
const file=document.getElementById("imagemHero")?.files?.[0];
const preview=document.getElementById("previewHero");

if(!titulo||!subtitulo||!file){

alert("Preencha todos os campos");

return;

}

if(file.size>700*1024){

alert("Imagem muito grande (máx 700kb)");

return;

}

try{

const imagemBase64=await fileToDataURL(file);

await addDoc(collection(db,HERO_COLLECTION),{

titulo,
subtitulo,
imagem:imagemBase64,
createdAt:new Date()

});

alert("Banner salvo com sucesso");

if(preview) preview.style.display="none";

await carregarHeroAdmin();

}catch(error){

console.error(error);

alert("Erro ao salvar banner");

}

};

/* ===============================
REMOVER HERO
================================ */

window.removerHero=async function(id){

if(!confirm("Deseja excluir este banner?")) return;

try{

await deleteDoc(doc(db,HERO_COLLECTION,id));

await carregarHeroAdmin();

}catch(error){

console.error(error);

}

};

/* ===============================
SOBRE
================================ */

async function carregarSobre(){

let sobreData=fallbackSobre;

try{

const docRef=doc(db,SOBRE_COLLECTION,SOBRE_DOC_ID);

const docSnap=await getDoc(docRef);

if(docSnap.exists()){

sobreData=docSnap.data();

}

}catch(error){

console.error("Erro ao carregar sobre:",error);

}

const sobreSection=document.getElementById("sobreSection");

if(sobreSection){

sobreSection.innerHTML=`

<div class="container">
<h2>${sobreData.titulo}</h2>
<p>${sobreData.texto}</p>
</div>

`;

}

const tituloInput=document.getElementById("tituloSobre");

const textoInput=document.getElementById("textoSobre");

if(tituloInput) tituloInput.value=sobreData.titulo??"";

if(textoInput) textoInput.value=sobreData.texto??"";

}

window.salvarSobre=async function(){

const titulo=document.getElementById("tituloSobre")?.value.trim();
const texto=document.getElementById("textoSobre")?.value.trim();

if(!titulo||!texto){

alert("Preencha todos os campos");

return;

}

try{

await setDoc(
doc(db,SOBRE_COLLECTION,SOBRE_DOC_ID),
{titulo,texto},
{merge:true}
);

alert("Seção atualizada");

}catch(error){

console.error(error);

alert("Erro ao salvar");

}

};

/* ===============================
PREVIEW IMAGEM
================================ */

const inputImg=document.getElementById("imagemHero");

if(inputImg){

inputImg.addEventListener("change",function(){

const file=this.files?.[0];

if(!file) return;

const reader=new FileReader();

reader.onload=()=>{

const img=document.getElementById("previewHero");

if(!img) return;

img.src=reader.result;

img.style.display="block";

};

reader.readAsDataURL(file);

});

}

/* ===============================
INIT
================================ */

document.addEventListener("DOMContentLoaded",async()=>{

await carregarHeroHome();

await carregarHeroAdmin();

await carregarSobre();

});
