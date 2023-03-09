import subprocess
import webbrowser
import conexaoDB as db
import socket

# define a porta que você deseja limpar o cache
port = 8000

webbrowser.open('http://localhost:8000/index.html')
subprocess.run(['python', 'servidor.py'])

# crie um objeto socket e se conecte à porta
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('localhost', port))

# envie o comando para limpar o cache
s.sendall(b'clear cache')

# feche a conexão
s.close()

db.criarTabelas()