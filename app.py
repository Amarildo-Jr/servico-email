import subprocess
import webbrowser
import conexaoDB as db

# define a porta que você deseja limpar o cache
port = 8000

webbrowser.open('http://localhost:8000/index.html')
subprocess.run(['python', 'servidor.py'])

db.criarTabelas()