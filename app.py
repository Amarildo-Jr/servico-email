import subprocess
import webbrowser
import conexaoDB as db

port = 5050

db.criarTabelas()
db.inserirUsuario("naoresponda@mail.com", "AJR Mail")

webbrowser.open('http://localhost:5055/index.html')
subprocess.run(['python', 'servidor.py'])