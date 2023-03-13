import subprocess
import webbrowser
import conexaoDB as db

# define a porta que você deseja limpar o cache
port = 5050

db.criarTabelas()

webbrowser.open('http://localhost:5500/index.html')
subprocess.run(['python', 'servidor.py'])