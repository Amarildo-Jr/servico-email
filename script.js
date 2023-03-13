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

function login() {
  btnLogin = document.getElementById("btn-login")
  if (!(btnLogin.classList.contains("active"))) {
    btnLogin.classList.add("active")
    btnLogin.classList.remove("inactive")
    btnLogin.classList.remove("underlineHover")
    let btnCadastrar = document.getElementById("btn-cadastrar")
    btnCadastrar.classList.add("inactive")
    btnCadastrar.classList.remove("active")
    btnCadastrar.classList.add("underlineHover")
    document.getElementById("nome-sobrenome").style.display = "none"
    document.getElementById("input-nome").removeAttribute("required")
    document.getElementById("input-sobrenome").removeAttribute("required")
    document.getElementById("btn-entrar-cadastrar").textContent = "Entrar"
    document.getElementById("email-invalido").style.display = "none"
  }
}

function cadastrar() {
  let btnCadastrar = document.getElementById("btn-cadastrar")
  if (!(btnCadastrar.classList.contains("active"))) {
    btnCadastrar.classList.add("active")
    btnCadastrar.classList.remove("inactive")
    btnCadastrar.classList.remove("underlineHover")
    let btnLogin = document.getElementById("btn-login")
    btnLogin.classList.add("inactive")
    btnLogin.classList.remove("active")
    btnLogin.classList.add("underlineHover")
    document.getElementById("nome-sobrenome").style.display = "flex"
    document.getElementById("input-nome").setAttribute("required", true);
    document.getElementById("input-sobrenome").setAttribute("required", true);
    document.getElementById("btn-entrar-cadastrar").textContent = "Cadastrar"
    document.getElementById("email-invalido").style.display = "none"
  }
}

let nomeAtual = ""
let emailAtual = ""

let painelAtivo = "inbox"

let mensagemAtual = null;
  
function hidePopup() {
  document.getElementById("blur-background").style.display = "none";
  document.getElementById("popup").style.display = "none";
  
  const perfilNome = document.querySelector('#boas-vindas');
  perfilNome.textContent = 'Olá, ' + nomeAtual + '!';
  const perfilEmail = document.querySelector('#email-usuario');
  perfilEmail.textContent = emailAtual;
}

function submitUsername() {
  let btnCadastrar = document.getElementById("btn-cadastrar")

  if (btnCadastrar.classList.contains("active")) {
    const email = document.getElementById("input-email").value.toLowerCase();
    const nome = document.getElementById("input-nome").value + " " + document.getElementById("input-sobrenome").value;
    const login = false
    fetch('/user', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({"email": email, "nome": nome, "login": login})
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Usuário já cadastrado");
      }
      return response.json();
    })
    .then(data => {
      emailAtual = data.email
      nomeAtual = data.nome
      hidePopup();
    })
    .catch(error => {
      const legendaErro = document.getElementById("email-invalido")
      legendaErro.style.display = "block"
      legendaErro.textContent = error.message
    });
  } else {
    const email = document.getElementById("input-email").value.toLowerCase();
    const login = true
    fetch('/user', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({"email": email, "login": login})
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Usuário não encontrado");
      }
      return response.json();
    })
    .then(data => {
      emailAtual = data.email
      nomeAtual = data.nome
      hidePopup();
    })
    .catch(error => {
      const legendaErro = document.getElementById("email-invalido")
      legendaErro.style.display = "block"
      legendaErro.textContent = error.message
    });
  }
  
  ativarLoader()
}

function novaMensagem() {
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "flex";
  document.getElementById("info-abrir-msg").style.display = "none";
  document.getElementById("input-destino").disabled = false;
  document.getElementById("input-destino").style.backgroundColor = "#f0f6fc";
}

function submitMessage(respostaId = 0) {
  const inputDestino = document.getElementById('input-destino');
  const destino = inputDestino.value;
  const inputAssunto = document.getElementById('input-assunto');
  const assunto = inputAssunto.value;
  const input = document.getElementById('input-mensagem');
  const message = input.value;
  input.value = '';

  const mensagemDados = {
    "remetente": emailAtual,
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
  let quantidadeMensagensNaoLidas = 0;
  let quantidadeMensagens = 0;
  for (const message of messages) {
    const tr = document.createElement('tr');
    if (mensagemAtual != null && message.id == mensagemAtual.id) {
      tr.classList.add("msg-aberta");
    }
    tr.addEventListener('click', () => {
      abrirMensagem(message);
      tr.classList.add("msg-aberta");
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
    sectionAssunto.id = "table-assunto"
    if(!message.lida && message.destinatario[0] === emailAtual) {
      tr.style.fontWeight = "bold";
      tr.style.borderRight = "0.3em solid #60A5FA";
      quantidadeMensagensNaoLidas++;
    }
    if (painelAtivo == "inbox") {
      sectionRemetente.textContent = message.remetente[1];
    } else if(painelAtivo == "saida") {
      sectionRemetente.textContent = message.destinatario[1];
    }
    sectionAssunto.textContent = message.assunto;
    tdDate.textContent = message.data;
    tdRemetenteAssunto.appendChild(sectionRemetente);
    tdRemetenteAssunto.appendChild(sectionAssunto);
    if(message.destinatario[0] === emailAtual && painelAtivo === "inbox") {
      tr.appendChild(tdDate);
      tr.appendChild(tdRemetenteAssunto);
      tr.appendChild(tdVisualizar);
      tbody.appendChild(tr);
      quantidadeMensagens++;
    } else if (message.remetente[0] === emailAtual && painelAtivo === "saida") {
      tr.appendChild(tdDate);
      tr.appendChild(tdRemetenteAssunto);
      tr.appendChild(tdVisualizar);
      tbody.appendChild(tr);
      quantidadeMensagens++;
    } 
  }
  document.getElementById("quantidade-mensagens").textContent = quantidadeMensagensNaoLidas;
  if (quantidadeMensagens === 0) {
    document.getElementById("img-info").src = "icons/vazio.png";
    document.getElementById("info-header").textContent = "Nenhuma mensagem encontrada";
  } else {
    document.getElementById("img-info").src = "icons/abrir_email.png";
    document.getElementById("info-header").textContent = "Selecione uma mensagem para visualizar";
  }
}

function fetchMessages() {
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Username': emailAtual,
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

function abrirMensagem(mensagem) {
  document.getElementById("info-abrir-msg").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "none";
  document.getElementById("painel-mensagem").style.display = "flex";
  painelMensagem = document.getElementById("painel-mensagem");

  if(document.getElementsByClassName("msg-aberta")[0] != null) {
    document.getElementsByClassName("msg-aberta")[0].classList.remove("msg-aberta")
  }
  mensagemAtual = mensagem;
  document.getElementById("head-assunto").textContent = mensagem.assunto;
  if(painelAtivo === "inbox") {
    document.getElementById("head-remetente").textContent = mensagem.remetente[1];
    document.getElementById("head-destinatario").textContent = "Você";
  } else if(painelAtivo === "saida") {
    document.getElementById("head-remetente").textContent = "Você";
    document.getElementById("head-destinatario").textContent = mensagem.destinatario[1];
  }
  document.getElementById("head-data").textContent = mensagem.data;
  
  document.getElementById("mensagem-texto").textContent = mensagem.mensagem;
  
  if (painelAtivo === "inbox") {
    fetch('/messages', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Username': emailAtual
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
  document.getElementById("info-abrir-msg").style.display = "flex";
  document.getElementById("input-destino").disabled = false;
  document.getElementById("input-destino").style.backgroundColor = "#f0f6fc";
}

fetchMessages();
setInterval(fetchMessages, 1000);

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
      'Username': emailAtual,
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
  document.getElementById("info-abrir-msg").style.display = "none";
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "flex";
  document.getElementById("input-destino").value = mensagemAtual.remetente[0];
  document.getElementById("input-destino").disabled = true;
  document.getElementById("input-destino").style.backgroundColor = "#e4e4e4";
  if (mensagemAtual.respostaId == 0)  {
    document.getElementById("input-assunto").value = "Re: " + mensagemAtual.assunto;
  } else {
    document.getElementById("input-assunto").value = mensagemAtual.assunto;
  }
}

function encaminharMensagem() {
  document.getElementById("info-abrir-msg").style.display = "none";
  document.getElementById("painel-mensagem").style.display = "none";
  document.getElementById("painel-enviar-mensagem").style.display = "flex";
  document.getElementById("input-assunto").value = "Enc: " + mensagemAtual.assunto;
  document.getElementById("input-destino").disabled = false;
  document.getElementById("input-destino").style.backgroundColor = "#f0f6fc";
  document.getElementById("input-mensagem").value = "De: " + mensagemAtual.remetente[1] + "\n " + mensagemAtual.remetente[0] + "\nPara: " + mensagemAtual.destinatario[1] + "\n " + mensagemAtual.destinatario[0] + "\n" + mensagemAtual.mensagem;
}

function ativarLoader() {
  document.getElementsByClassName("cs-loader")[0].style.display = "block";
  setTimeout(function() {
    document.getElementsByClassName("cs-loader")[0].style.display = "none";
  }, 2500);
}