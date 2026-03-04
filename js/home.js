document.addEventListener("DOMContentLoaded", function(){

let slides = document.querySelectorAll(".hero-slide");
let current = 0;

function trocarSlide(){
    slides[current].classList.remove("active");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
}

setInterval(trocarSlide, 5000);

});