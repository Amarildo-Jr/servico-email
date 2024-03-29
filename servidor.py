import json
from  http.server import SimpleHTTPRequestHandler
import socketserver
from datetime import datetime
import conexaoDB as db

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

class RequestHandler(SimpleHTTPRequestHandler):

    def do_GET(self):
        if self.path == '/messages':
            username = self.headers["Username"]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            mensagensPagina = []
            mensagens = db.recuperarMensagensUsuario(username, "ambos")
            mensagens.sort(key=lambda x: x[0], reverse=True)
            for linha in mensagens:
                mensagensPagina.append({'id': linha[0],'data': linha[5], 'assunto': linha[3], 'mensagem': linha[4], 'remetente': db.recuperarUsuario(linha[1])[0], 'destinatario': db.recuperarUsuario(linha[2])[0], 'lida': linha[6], 'deletada': linha[7], 'resposta_id': linha[8]}) 
            self.wfile.write(json.dumps(mensagensPagina).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/messages":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            remetente = json.loads(post_data.decode('utf-8'))['remetente']
            destinatario = json.loads(post_data.decode('utf-8'))['destino']
            assunto = json.loads(post_data.decode('utf-8'))['assunto']
            messagem = json.loads(post_data.decode('utf-8'))['mensagem']
            data_atual = datetime.now().strftime('%d/%m/%Y %H:%M')
            if db.inserirMensagem(remetente, destinatario, assunto, messagem, data_atual):
                self.send_response(200)
            elif db.recuperarUsuario(destinatario) == []:
                self.send_response(404)
            else:
                self.send_response(400)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))

        elif self.path == "/user":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            login = json.loads(post_data.decode('utf-8'))['login']
            if(login):
                user_email = json.loads(post_data.decode('utf-8'))['email']
                usuario = db.recuperarUsuario(user_email)
                if usuario != []:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"email": usuario[0][0], "nome": usuario[0][1]}).encode('utf-8'))
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"email": user_email}).encode('utf-8'))
            else:
                user_email = json.loads(post_data.decode('utf-8'))['email']
                user_nome = json.loads(post_data.decode('utf-8'))['nome']
                usuario = db.recuperarUsuario(user_email)
                if usuario != []:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"email": user_email}).encode('utf-8'))
                else:
                    db.inserirUsuario(user_email, user_nome)
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"email": user_email, "nome": user_nome}).encode('utf-8'))
                    db.inserirMensagem("naoresponda@mail.com", user_email, "Bem-vindo(a) ao AJR Mail", f"Olá, {user_nome}! Seja bem-vindo(a) ao AJR Mail, o melhor serviço de e-mail do mundo (ao menos tentamos ser). \nEsperamos que se divirta no processo e aproveite a nova era da comunicação! \n\nAté logo!", datetime.now().strftime('%d/%m/%Y %H:%M'))
    def do_PUT(self):
        if self.path == "/messages":
            content_length = int(self.headers['Content-Length'])
            put_data = self.rfile.read(content_length)
            id = json.loads(put_data.decode('utf-8'))['id']
            db.marcarMensagemLida(id)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
    def do_DELETE(self):
        if self.path == "/messages":
            content_length = int(self.headers['Content-Length'])
            delete_data = self.rfile.read(content_length)
            id = json.loads(delete_data.decode('utf-8'))['id']
            usuario = self.headers["Username"]
            db.apagarMensagem(id, usuario)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True}).encode('utf-8'))

if __name__ == "__main__":
    porta = 5055
    host = "localhost"

    with socketserver.TCPServer((host, porta), RequestHandler, NoCacheHTTPRequestHandler) as httpd:
        print(f"Servidor executando em http://{host}:{porta}")
        httpd.serve_forever()