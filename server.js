const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const MAP_SIZE = 3000;
const BALL_RADIUS = 22;
const players = new Map();

app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_req, res) => res.json({ ok: true, players: players.size }));

function cleanPlayer(input, socketId) {
  if (!input || typeof input !== 'object') return null;
  const palette = ['#00f0ff', '#ff2a6d', '#05ffa1', '#ffb703', '#7000ff',
                   '#ff7b00', '#38bdf8', '#f43f5e', '#a855f7', '#10b981'];
  const id = socketId;
  const name = String(input.name || 'Bolinha').replace(/[<>]/g, '').trim().slice(0, 15) || 'Bolinha';
  const color = palette.includes(input.color) ? input.color : '#38bdf8';
  const x = Number.isFinite(input.x) ? Math.max(BALL_RADIUS, Math.min(MAP_SIZE - BALL_RADIUS, input.x)) : MAP_SIZE / 2;
  const y = Number.isFinite(input.y) ? Math.max(BALL_RADIUS, Math.min(MAP_SIZE - BALL_RADIUS, input.y)) : MAP_SIZE / 2;
  return { id, name, color, x, y, lastActive: Date.now() };
}

function broadcastPlayers() {
  const message = JSON.stringify({ type: 'players', players: Array.from(players.values()) });
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
}

wss.on('connection', (ws) => {
  const id = 'p_' + Math.random().toString(36).slice(2, 11);
  ws.playerId = id;
  ws.send(JSON.stringify({ type: 'welcome', id }));

  ws.on('message', (raw) => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }
    if (message.type !== 'update') return;

    const player = cleanPlayer(message.player, id);
    if (!player) return;
    players.set(id, player);
    broadcastPlayers();
  });

  ws.on('close', () => {
    players.delete(id);
    broadcastPlayers();
  });

  ws.on('error', () => {
    players.delete(id);
    broadcastPlayers();
  });

  broadcastPlayers();
});

// Remove abandoned connections if a client unexpectedly disappears.
setInterval(() => {
  const cutoff = Date.now() - 30000;
  let changed = false;
  for (const [id, player] of players) {
    if (player.lastActive < cutoff) {
      players.delete(id);
      changed = true;
    }
  }
  if (changed) broadcastPlayers();
}, 10000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Arena das Bolinhas rodando na porta ${PORT}`);
});
