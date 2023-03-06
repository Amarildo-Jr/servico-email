import sqlite3

def criarTabelas():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", ("mensagens",))
    resultado = cursor.fetchone()
    if resultado:
        conn.close()
        return
    cursor.execute("CREATE TABLE usuarios (username TEXT PRIMARY KEY)")
    cursor.execute("CREATE TABLE mensagens (id INTEGER PRIMARY KEY AUTOINCREMENT, remetente TEXT, destinatario TEXT, mensagem TEXT, data TEXT, FOREIGN KEY (remetente) REFERENCES usuarios (username), FOREIGN KEY (destinatario) REFERENCES usuarios (username))")
    cursor.execute("CREATE TABLE chat (id INTEGER PRIMARY KEY AUTOINCREMENT, id_mensagem INTEGER, FOREIGN KEY (id_mensagem) REFERENCES mensagens (id)")
    conn.commit()
    conn.close()

def inserirUsuario(username):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO usuarios (username) VALUES (?)", (username,))

    conn.commit()
    conn.close()

def recuperarUsuario(username):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios where username = ?', (username,))
    usuario = cursor.fetchall()
    conn.close()
    return usuario

def recuperarUsuarios():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios')
    usuarios = cursor.fetchall()
    conn.close()
    return usuarios

def apagarTodosUsuarios():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM usuarios')
    conn.commit()
    conn.close()

def recuperarMensagens():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mensagens')
    mensagens = cursor.fetchall()
    conn.close()
    return mensagens

def inserirMensagem(remetente, destinatario, mensagem, data):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO mensagens (remetente, destinatario, mensagem, data) VALUES (?, ?, ?, ?)", (remetente, destinatario, mensagem, data))
    conn.commit()
    conn.close()

def recuperarMensagensUsuario(usuario):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mensagens WHERE remetente = ? OR destinatario = ?', (usuario, usuario))
    mensagens = cursor.fetchall()
    conn.close()
    mensagens_usuario = []
    for mensagem in mensagens:
        if mensagem[1] == usuario or mensagem[2] == usuario:
            mensagens_usuario.append(mensagem)
    return mensagens_usuario

def apagarMensagem(id):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM mensagens WHERE id = ?', (id,))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    criarTabelas()