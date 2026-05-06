function toggleQuiz() {
  const popup = document.getElementById("quizPopup");
  popup.style.display = popup.style.display === "block" ? "none" : "block";
}

let perguntas = [];
let perguntasFiltradas = [];
let atual = 0;
let pontos = 0;
let carregado = false;

// 🔥 CARREGAR JSON COM SEGURANÇA
fetch('./perguntas.json')
  .then(res => {
    if (!res.ok) {
      throw new Error("Erro ao carregar perguntas.json");
    }
    return res.json();
  })
  .then(data => {
    perguntas = data;
    carregado = true;
    console.log("Perguntas carregadas:", perguntas.length);
  })
  .catch(err => {
    console.error("ERRO:", err);
    alert("Erro ao carregar perguntas.json");
  });

// 🔀 EMBARALHAR
function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

// ▶️ INICIAR QUIZ
function iniciar(nivel) {

  if (!carregado) {
    alert("Aguarde... carregando perguntas ⏳");
    return;
  }

  perguntasFiltradas = perguntas.filter(p => p.nivel === nivel);

  if (perguntasFiltradas.length === 0) {
    alert("Nenhuma pergunta encontrada para esse nível 😢");
    console.log("DEBUG:", perguntas);
    return;
  }

  perguntasFiltradas = embaralhar(perguntasFiltradas);

  atual = 0;
  pontos = 0;

  document.getElementById("telaInicio").style.display = "none";
  document.getElementById("telaQuiz").style.display = "block";
  document.getElementById("telaFinal").style.display = "none";

  mostrarPergunta();
}

// ❓ MOSTRAR PERGUNTA
function mostrarPergunta() {

  let p = perguntasFiltradas[atual];

  if (!p) {
    console.error("Pergunta indefinida");
    finalizar();
    return;
  }

  document.getElementById("pergunta").innerText = p.pergunta;
  document.getElementById("feedback").innerText = "";

  document.getElementById("progresso").innerText =
    `Pergunta ${atual + 1}/${perguntasFiltradas.length}`;

  document.getElementById("pontuacao").innerText =
    `⭐ ${pontos}`;

  document.getElementById("barraProgresso").style.width =
    ((atual / perguntasFiltradas.length) * 100) + "%";

  let respostasDiv = document.getElementById("respostas");
  respostasDiv.innerHTML = "";

  let alternativas = embaralhar(
    p.alternativas.map((texto, i) => ({ texto, i }))
  );

  alternativas.forEach(op => {
    let btn = document.createElement("button");
    btn.innerText = op.texto;

    btn.onclick = () => verificarResposta(op.i, p.correta, btn);

    respostasDiv.appendChild(btn);
  });
}

// ✅ VERIFICAR RESPOSTA
function verificarResposta(escolhida, correta, botao) {

  let botoes = document.querySelectorAll("#respostas button");
  botoes.forEach(b => b.disabled = true);

  if (escolhida === correta) {
    botao.classList.add("correto");
    pontos++;
    document.getElementById("feedback").innerText = "✅ Acertou!";
  } else {
    botao.classList.add("errado");
    document.getElementById("feedback").innerText = "❌ Errou!";
  }

  setTimeout(() => {
    atual++;

    if (atual < perguntasFiltradas.length) {
      mostrarPergunta();
    } else {
      finalizar();
    }

  }, 900);
}

// 🏁 FINALIZAR
function finalizar() {
  document.getElementById("telaQuiz").style.display = "none";
  document.getElementById("telaFinal").style.display = "block";

  document.getElementById("resultadoFinal").innerText =
    `Você fez ${pontos} de ${perguntasFiltradas.length}`;
}

// 🔁 REINICIAR
function reiniciar() {
  document.getElementById("telaFinal").style.display = "none";
  document.getElementById("telaInicio").style.display = "block";
}