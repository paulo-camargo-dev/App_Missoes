const form = document.getElementById('contactForm');

  form.addEventListener('submit', function(e){
    e.preventDefault();

    // Captura os valores do formulário
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const prayer = document.getElementById('prayer').value.trim();

    if(!name || !address || !prayer){
      alert("Por favor, preencha todos os campos!");
      return;
    }

    // Número do WhatsApp da ONG (use no formato internacional, ex: 55DDDNUMERO)
    const whatsappNumber = "5511999999999";

    // Cria a mensagem formatada
    const message = `🙏 Pedido de oração via site:%0A
*Nome:* ${name}%0A
*Endereço:* ${address}%0A
*Pedido:* ${prayer}`;

    // Abre o WhatsApp Web ou app
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, "_blank");
  });