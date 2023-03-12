import sqlite3

def criarTabelas():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", ("mensagens",))
    resultado = cursor.fetchone()
    if resultado:
        conn.close()
        return
    cursor.execute("CREATE TABLE usuarios (email TEXT PRIMARY KEY, nome TEXT)")
    cursor.execute("CREATE TABLE mensagens (id INTEGER PRIMARY KEY AUTOINCREMENT, remetente TEXT, destinatario TEXT, assunto TEXT, mensagem TEXT, data TEXT, lida INTEGER, deletada INTEGER, resposta_id INTEGER, FOREIGN KEY (remetente) REFERENCES usuarios (email), FOREIGN KEY (destinatario) REFERENCES usuarios (email))")
    cursor.execute("CREATE TABLE chat (id INTEGER PRIMARY KEY AUTOINCREMENT, id_mensagem INTEGER, FOREIGN KEY (id_mensagem) REFERENCES mensagens (id))")
    conn.commit()
    conn.close()

def inserirUsuario(email, nome):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    usuario = recuperarUsuario(email)
    if usuario != []:
        conn.close()
        return
    cursor.execute("INSERT INTO usuarios (email, nome) VALUES (?, ?)", (email, nome,))

    conn.commit()
    conn.close()

def recuperarUsuario(email):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios where email = ?', (email,))
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

def inserirMensagem(remetente, destinatario, assunto, mensagem, data, resposta_id=0):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (remetente,))
    remetente_existe = cursor.fetchone()
    
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (destinatario,))
    destinatario_existe = cursor.fetchone()
    if remetente_existe == None or destinatario_existe == None:
        conn.close()
        return False
    else:
        cursor.execute("INSERT INTO mensagens (remetente, destinatario, assunto, mensagem, data, lida, deletada, resposta_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (remetente, destinatario, assunto, mensagem, data, 0, 0, resposta_id))
        conn.commit()
        conn.close()
        return True

def recuperarMensagens():
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mensagens')
    mensagens = cursor.fetchall()
    conn.close()
    return mensagens

def marcarMensagemLida(id):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE mensagens SET lida = 1 WHERE id = ?', (id,))
    conn.commit()
    conn.close()

def recuperarMensagensUsuario(usuario, filtro=["remetente", "destinatario", "ambos"]):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    if "remetente" in filtro:
        cursor.execute('SELECT * FROM mensagens WHERE remetente = ?', (usuario,))
    if "destinatario" in filtro:
        cursor.execute('SELECT * FROM mensagens WHERE destinatario = ?', (usuario,))
    if "ambos" in filtro:
        cursor.execute('SELECT * FROM mensagens WHERE remetente = ? OR destinatario = ?', (usuario, usuario))
    mensagens = cursor.fetchall()
    conn.close()
    return mensagens

def apagarMensagem(id, usuario):
    conn = sqlite3.connect('chatTPG.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mensagens WHERE id = ?', (id,))
    mensagem = cursor.fetchall()
    # deletada = 1 significa que a mensagem foi deletada pelo remetente
    # deletada = 2 significa que a mensagem foi deletada pelo destinatário
    # deletada = 3 significa que a mensagem foi deletada por ambos
    if mensagem[0][1] == usuario and mensagem[0][2] == usuario:
        cursor.execute('DELETE FROM mensagens WHERE id = ?', (id,))
    elif mensagem[0][1] == usuario:
        if mensagem[0][7] == 0:
            cursor.execute('UPDATE mensagens SET deletada = 1 WHERE id = ?', (id,))
        elif mensagem[0][7] == 2:
            cursor.execute('DELETE FROM mensagens WHERE id = ?', (id,))
    elif mensagem[0][2] == usuario:
        if mensagem[0][7] == 0:
            cursor.execute('UPDATE mensagens SET deletada = 2 WHERE id = ?', (id,))
        elif mensagem[0][7] == 1:
            cursor.execute('DELETE FROM mensagens WHERE id = ?', (id,))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    criarTabelas()