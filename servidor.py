import http.server
import json

messages = []

class MessageHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/messages':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'messages': messages
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/messages':
            content_length = int(self.headers['Content-Length'])
            message_data = json.loads(self.rfile.read(content_length))
            messages.append(message_data['message'])
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'message': message_data['message']
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)

if __name__ == '__main__':
    print('Iniciando servidor...')
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, MessageHandler)
    httpd.serve_forever()
