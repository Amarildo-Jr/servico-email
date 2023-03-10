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
            recuperacao = self.headers["Painel"]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            mensagensPagina = []
            if recuperacao ==  "inbox":
                mensagens = db.recuperarMensagensUsuario(username, "destinatario")
                for linha in mensagens:
                    if linha[7] != 2:
                        mensagensPagina.append({'id': linha[0],'data': linha[5], 'assunto': linha[3], 'mensagem': linha[4], 'remetente': linha[1], 'destinatario': linha[2], 'lida': linha[6], 'deletada': linha[7], 'resposta_id': linha[8]})
            elif recuperacao == "saida":
                mensagens = db.recuperarMensagensUsuario(username, "remetente")
                for linha in mensagens:
                    if linha[7] != 1:
                        mensagensPagina.append({'id': linha[0],'data': linha[5], 'assunto': linha[3], 'mensagem': linha[4], 'remetente': linha[1], 'destinatario': linha[2], 'lida': 1, 'deletada': linha[7], 'resposta_id': linha[8]})    
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
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
            db.inserirMensagem(remetente, destinatario, assunto, messagem, data_atual)
        elif self.path == "/username":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            username_resposta = json.loads(post_data.decode('utf-8'))['username']
            username = username_resposta
            db.inserirUsuario(username)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"username": username}).encode('utf-8'))
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
    porta = 8000
    host = "localhost"

    with socketserver.TCPServer((host, porta), RequestHandler, NoCacheHTTPRequestHandler) as httpd:
        print(f"Servidor executando em http://{host}:{porta}")
        httpd.serve_forever()