# Arena das Bolinhas — Multiplayer

## Rodar localmente
1. Instale Node.js 18 ou mais recente.
2. Abra um terminal nesta pasta.
3. Execute `npm install`.
4. Execute `npm start`.
5. Abra `http://localhost:3000`.

## Publicar online
Envie todos os arquivos deste projeto para um repositório GitHub. No Render, crie um novo **Web Service** conectado ao repositório:
- Build Command: `npm install`
- Start Command: `npm start`

O Render fornece a variável `PORT` automaticamente. O servidor entrega o site e o WebSocket no mesmo endereço.
