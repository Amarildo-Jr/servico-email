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
            mensagens = db.recuperarMensagensUsuario(username)
            mensagensPagina = []
            for linha in mensagens:
                mensagensPagina.append({'data': linha[4], 'mensagem': linha[3], 'remetente': linha[1], 'destinatario': linha[2]})
            self.wfile.write(json.dumps(mensagensPagina).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == "/messages":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            messagem = json.loads(post_data.decode('utf-8'))['mensagem']
            remetente = json.loads(post_data.decode('utf-8'))['remetente']
            destinatario = json.loads(post_data.decode('utf-8'))['destino']
            data_atual = datetime.now().strftime('%d/%m/%Y %H:%M')
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))
            db.inserirMensagem(remetente, destinatario, messagem, data_atual)
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

if __name__ == "__main__":
    porta = 8000
    host = "localhost"

    with socketserver.TCPServer((host, porta), RequestHandler, NoCacheHTTPRequestHandler) as httpd:
        print(f"Servidor executando em http://{host}:{porta}")
        httpd.serve_forever()