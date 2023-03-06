import subprocess
import webbrowser
import conexaoDB as db

db.criarTabelas()

webbrowser.open('http://localhost:8000/index.html')
subprocess.run(['python', 'servidor.py'])