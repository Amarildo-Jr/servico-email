import urllib.request
import json

SERVER_URL = 'http://localhost:8000'

def get_messages():
    with urllib.request.urlopen(f'{SERVER_URL}/messages') as response:
        response_data = response.read().decode()
        response_json = json.loads(response_data)
        return response_json['messages']

def send_message(message):
    data = json.dumps({'message': message}).encode()
    req = urllib.request.Request(f'{SERVER_URL}/messages', data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        response_data = response.read().decode()
        response_json = json.loads(response_data)
        return response_json['message']

if __name__ == '__main__':
    # print('Enviando mensagens...')
    # send_message('Olá, mundo!')
    # send_message('Como vão as coisas?')
    # print('Mensagens enviadas!')
    
    print('Buscando mensagens...')
    messages = get_messages()
    print('Mensagens encontradas:')
    for message in messages:
        print(f'- {message}')
