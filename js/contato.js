  const form = document.getElementById('contactForm');

form.addEventListener('submit', function(e){
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const address = document.getElementById('address').value.trim();
  const prayer = document.getElementById('prayer').value.trim();

  if(!name || !address || !prayer){
    alert("Por favor, preencha todos os campos!");
    return;
  }

  // Seu número já configurado
  const whatsappNumber = "5511913563576";

  // Mensagem formatada bonita
  const message = `🙏 *Pedido de oração via site:*
*Nome:* ${name}
*Endereço:* ${address}
*Pedido:* ${prayer}`;

  // Codificação segura
  const encodedMessage = encodeURIComponent(message);

  const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Melhor forma para APP (abre direto no WhatsApp)
  window.location.href = whatsappURL;
});