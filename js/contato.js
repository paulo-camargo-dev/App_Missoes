const WHATSAPP_CONTACTS = [
    { nome: "Atendimento 1", numero: "5511913563576" },
    { nome: "Missionario 2", numero: "5511961748743" },
    { nome: "Atendimento 3", numero: "5511913563576" },
    { nome: "Atendimento 4", numero: "5511913563576" },
    { nome: "Atendimento 5", numero: "5511913563576" }
];

const form = document.getElementById("formContato");

function sanitizePhone(value) {
    return (value || "").replace(/\D/g, "");
}

function isValidPhone(value) {
    const digits = sanitizePhone(value);
    return digits.length >= 10 && digits.length <= 15;
}

function montarMensagem({ nome, telefone, email, endereco, pedido }) {
    return [
        "Pedido de oracao via site:",
        `Nome: ${nome}`,
        `Telefone: ${telefone}`,
        `E-mail: ${email}`,
        `Endereco: ${endereco || "-"}`,
        `Pedido: ${pedido}`
    ].join("\n");
}

function buildWhatsUrl(numero, mensagem) {
    const numeroLimpo = sanitizePhone(numero);
    const texto = encodeURIComponent(mensagem);
    return `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${texto}`;
}

function abrirWhatsApp(numero, mensagem, mesmaAba) {
    const webUrl = buildWhatsUrl(numero, mensagem);
    if (mesmaAba) {
        window.location.href = webUrl;
        return;
    }
    window.open(webUrl, "_blank", "noopener,noreferrer");
}

function getFormData() {
    return {
        nome: document.getElementById("nome")?.value.trim(),
        telefone: document.getElementById("telefone")?.value.trim(),
        email: document.getElementById("email")?.value.trim(),
        endereco: document.getElementById("endereco")?.value.trim(),
        pedido: document.getElementById("pedido")?.value.trim()
    };
}

function validarCampos(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.nome || !data.telefone || !data.email || !data.pedido) {
        return "Preencha os campos obrigatorios.";
    }
    if (!emailRegex.test(data.email)) {
        return "Digite um e-mail valido.";
    }
    if (!isValidPhone(data.telefone)) {
        return "Digite um telefone valido com DDD.";
    }
    return "";
}

function enviarParaCincoContatos(mensagem) {
    WHATSAPP_CONTACTS.slice(1).forEach((contato) => {
        abrirWhatsApp(contato.numero, mensagem, false);
    });
    abrirWhatsApp(WHATSAPP_CONTACTS[0].numero, mensagem, true);
}

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = getFormData();
        const erro = validarCampos(data);
        if (erro) {
            alert(erro);
            return;
        }

        const mensagem = montarMensagem(data);
        enviarParaCincoContatos(mensagem);
    });
}
