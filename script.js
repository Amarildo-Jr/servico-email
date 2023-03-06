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
  
function hidePopup() {
    document.getElementById("blur-background").style.display = "none";
    document.getElementById("popup").style.display = "none";
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


function submitMessage() {
    const input = document.querySelector('#input-message');
    const message = input.value;
    const inputDestino = document.querySelector('#input-destino');
    const destino = inputDestino.value;
    input.value = '';

    const mensagemDados = {
      "remetente": username,
      "destino": destino,
      "mensagem": message,
      "data": new Date()
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
    .catch(error => console.error(error));
}

function renderMessages(messages) {
  const tbody = document.querySelector('#table-body');
  tbody.innerHTML = '';
  for (const message of messages) {
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    const tdDestinatario = document.createElement('td');
    const tdMessage = document.createElement('td');
    tdDate.textContent = message.data;
    tdMessage.textContent = message.mensagem;
    tdDestinatario.textContent = message.destinatario;
    tr.appendChild(tdDate);
    tr.appendChild(tdMessage);
    tr.appendChild(tdDestinatario);
    tbody.appendChild(tr);
  }
}

function fetchMessages() {
  fetch('/messages', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Username': username
    }
  })
  .then(response => response.json())
  .then(data => renderMessages(data))
  .catch(error => console.error(error));
}

fetchMessages();
setInterval(fetchMessages, 10000);