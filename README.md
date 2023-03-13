> Universidade Federal do Piauí - UFPI<br>
Disciplina: Sistemas Distribuídos<br>
Professor: Weslley Lima<br>
Aluno: Amarildo Junior 

# Trabalho Webservice - Serviço de email

⇒ Implementação de um serviço de emails utilizando métodos HTTP conforme padrão REST. 
- A especificação do trabalho dizia que o serviço deveria ter um servidor e um cliente(front-end) em linguagens diferentes. 
- O servidor foi implementado em Python, sem o uso de frameworkes e o cliente em HTML, CSS e JavaScript.

# Como utilizar

Para usar essa aplicação basta digitar o seguinte comando no terminal :

```
git clone https://github.com/Amarildo-Jr/servico-email.git
```

⇒ É necessário ter o git instalado, além do Python versão 3, contendo as seguintes bibliotecas (padrão do Python):

- http.server
- json
- datetime
- sqlite3
- socketserver

⇒ Após isso basta executar o arquivo app.py. Isso pode ser feito pelo terminal da seguinte maneira (Windows):

```
python app.py
```

Caso não funcione, execute o seguinte comando:

```
python servidor.py
```

E abra em uma aba do navegador o seguinte endereço: [http://localhost:5055/index.html](http://localhost:5055/index.html)

# Métodos Implementados
## GET
- /messages - Retorna todas as mensagens

## POST
- /messages - Cria uma nova mensagem
- /username - Cria/Autentica um usuário

## PUT
- /messages - Atualiza os parâmetros de uma mensagem

## DELETE
- /messages - Deleta uma mensagem
