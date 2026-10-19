const http = require('http'), fs = require('fs'), path = require('path');
const { newGame, startBattle, turn } = require('./engine');

const FRONT = path.join(__dirname, '..', 'frontend');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const games = new Map();

const json = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};
const readBody = req => new Promise(resolve => {
  let d = '';
  req.on('data', c => (d += c));
  req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } });
});

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    const body = req.method === 'POST' ? await readBody(req) : {};
    if (url.pathname === '/api/new') {
      const g = newGame();
      g.id = Math.random().toString(36).slice(2, 10);
      games.set(g.id, g);
      return json(res, 200, g);
    }
    const g = games.get(body.id || url.searchParams.get('id'));
    if (!g) return json(res, 404, { error: 'no such game' });
    if (url.pathname === '/api/state') return json(res, 200, g);
    if (url.pathname === '/api/start') {
      if (!['title', 'won'].includes(g.phase)) return json(res, 400, { error: 'cannot start now' });
      startBattle(g);
      return json(res, 200, g);
    }
    if (url.pathname === '/api/turn') {
      if (g.phase !== 'battle') return json(res, 400, { error: 'not in battle' });
      turn(g, body.action || {});
      return json(res, 200, g);
    }
    return json(res, 404, { error: 'unknown route' });
  }

  const file = path.join(FRONT, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!file.startsWith(FRONT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}).listen(3000, () => console.log('Tower Trials running at http://localhost:3000'));