window.onload = function() {
    document.getElementById("blur-background").style.display = "block";
    document.getElementById("popup").style.display = "block";

    const formPopup = document.querySelector('#form-popup');
    formPopup.addEventListener('submit', (event) => {
        event.preventDefault();
        submitUsername();
    });

    const formMensagem = document.querySelector('#form-message');
    formMensagem.addEventListener('submit', (event) => {
        event.preventDefault();
        submitMessage();
    });
}

let username = ""

let painelAtivo = "inbox"
  
function hidePopup() {
  document.getElementById("blur-background").style.display = "none";
  document.getElementById("popup").style.display = "none";
  
  const input = document.querySelector('#boas-vindas');
  input.textContent = 'Bem-vindo(a), ' + username + '!';
}

function submitUsername() {
    username = document.getElementById("username").value;

    if (username !== "") {
      hidePopup();
    }   

    fetch('/username', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({username})
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Erro ao enviar formulário.");
      }
      return response.json();
    })
    .then(data => {
      hidePopup();
    })
    .catch(error => {
      alert(error.message);
    });
}

function novaMensagem() {
  document.getElementById("painel-direita").style.width = "32%";
  document.getElementById("painel-mensagem").style.display = "none";
  painelEnviarMensagem = document.getElementById("painel-enviar-mensagem");

  painelEnviarMensagem.style.display = "flex";
  painelEnviarMensagem.style.width = "55%";
}

function submitMessage(respostaId = 0) {
  const inputDestino = document.querySelector('#input-destino');
  const destino = inputDestino.value;
  const inputAssunto = document.querySelector('#input-assunto');
  const assunto = inputAssunto.value;
  const input = document.querySelector('#input-message');
  const message = input.value;
  input.value = '';

  const mensagemDados = {
    "remetente": username,
    "destino": destino,
    "assunto": assunto,
    "mensagem": message,
    "data": new Date(),
    "respostaId": respostaId
  };

  fetch('/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(mensagemDados)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    console.log(error.message);
  });
  fecharMensagem()
}

function renderMessages(messages) {
  const tbody = document.querySelector('#table-body');
  tbody.innerHTML = '';
  let quantidadeMensagens = 0;
  for (const message of messages) {
    const tr = document.createElement('tr');
    tr.addEventListener('click', () => {
      abrirMensagem(message);
    });
    const tdRemetenteAssunto = document.createElement('td');
    tdRemetenteAssunto.id = "table-remetente-assunto"
    const tdDate = document.createElement('td');
    tdDate.id = "table-data"
    const sectionRemetente = document.createElement('section');
    sectionRemetente.id = "table-remetente"
    const sectionAssunto = document.createElement('section');
    const tdVisualizar = document.createElement('td');
    tdVisualizar.id = "table-visualizar"
    const arrowVisualizar = document.createElement('img');
    arrowVisualizar.src = "img/right-arrow.png"
    sectionAssunto.id = "table-assunto"
    if(!message.lida) {
      tr.style.fontWeight = "bold";
      quantidadeMensagens++;
    }
    sectionRemetente.textContent = "@" + message.remetente;
    sectionAssunto.textContent = message.assunto;
    tdDate.textContent = message.data;
    tdVisualizar.appendChild(arrowVisualizar);
    tdRemetenteAssunto.appendChild(sectionRemetente);
    tdRemetenteAssunto.appendChild(sectionAssunto);
    tr.appendChild(tdRemetenteAssunto);
    tr.appendChild(tdDate);
    tr.appendChild(tdVisualizar);
    tbody.appendChild(tr);
  }
  document.getElementById("quantidade-mensagens").textContent = quantidadeMensagens;
}

function fetchMessages() {
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Username': username,
      'Painel': painelAtivo,
    }
  })
  .then(response => response.json())
  .then(data => renderMessages(data))
  .catch(error => console.error(error));
}

let primeiraVerificacao = true;
function abrirPainelMensagens(botaoAtivado) {
    document.getElementsByClassName("btn-ativo")[0].classList.remove("btn-ativo");
  if (botaoAtivado === "inbox") {
    painelAtivo = "inbox"
    document.getElementById("btn-inbox").classList.add("btn-ativo");
  } else if (botaoAtivado === "saida") {
    painelAtivo = "saida"
    document.getElementById("btn-saida").classList.add("btn-ativo");
  } else if (botaoAtivado === "spam") {
    painelAtivo = "spam"
    document.getElementById("btn-spam").classList.add("btn-ativo");
  }
}

let mensagemAtual = null;

function abrirMensagem(mensagem) {
  document.getElementById("painel-enviar-mensagem").style.display = "none";
  document.getElementById("painel-direita").style.width = "32%";
  painelMensagem = document.getElementById("painel-mensagem");

  mensagemAtual = mensagem;

  painelMensagem.style.display = "flex";
  painelMensagem.style.width = "55%";
  document.getElementById("head-assunto").textContent = mensagem.assunto;
  if(painelAtivo === "inbox") {
    document.getElementById("head-remetente").textContent = "@" + mensagem.remetente;
    document.getElementById("head-destinatario").textContent = "Você";
  } else if(painelAtivo === "saida") {
    document.getElementById("head-remetente").textContent = "Você";
    document.getElementById("head-destinatario").textContent = "@" + mensagem.destinatario;
  }
  document.getElementById("head-data").textContent = mensagem.data;
  
  document.getElementById("mensagem-texto").textContent = mensagem.mensagem;
  
  if (painelAtivo === "inbox") {
    fetch('/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Username': username
      },
      body: JSON.stringify(mensagem)
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
  }
}

function fecharMensagem() {
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "none";
  document.getElementById("painel-direita").style.width = "82%";
}

fetchMessages();
setInterval(fetchMessages, 3000);

function logout() {
  location.reload();
}

function apagarMensagem() {
  const modal = document.getElementById("confirm-delete-modal");
  modal.style.display = "none";
  fecharMensagem();
  fetch('/messages', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Username': username,
    },
    body: JSON.stringify(mensagemAtual)
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));
}

function popupApagarMensagem() {
  const modal = document.getElementById("confirm-delete-modal");
  modal.style.display = "block";
}

function fecharPopupMensagem() {
  const modal = document.getElementById("confirm-delete-modal");
  modal.style.display = "none";
}

function responderMensagem() {
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "flex";
  document.getElementById("painel-direita").style.width = "32%";
  document.getElementById("input-destino").value = mensagemAtual.remetente;
  document.getElementById("input-destino").disabled = true;
  document.getElementById("input-destino").style.backgroundColor = "#e4e4e4";
  if (mensagemAtual.respostaId == 0)  {
    document.getElementById("input-assunto").value = "Re: " + mensagemAtual.assunto;
  } else {
    document.getElementById("input-assunto").value = mensagemAtual.assunto;
  }
}

function encaminharMensagem() {
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "flex";
  document.getElementById("painel-direita").style.width = "32%";
  document.getElementById("input-assunto").value = "Enc: " + mensagemAtual.assunto;
  document.getElementById("input-mensagem").value = "De: " + mensagemAtual.remetente + "\nPara: " + mensagemAtual.destinatario + "\n" + mensagemAtual.mensagem;
}