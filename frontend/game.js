const $ = id => document.getElementById(id);
const cv = $('screen'), ctx = cv.getContext('2d');
let game = null, busy = false, menu = 'main';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function post(path, body = {}) {
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}

function dot(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }

function drawCreature(m, x, y) {
  ctx.save();
  if (m.hp <= 0) ctx.globalAlpha = .25;
  ctx.lineWidth = 3; ctx.strokeStyle = '#111'; ctx.fillStyle = m.color;
  const tri = (...p) => {
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[2], p[3]); ctx.lineTo(p[4], p[5]);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  };
  if (m.shape === 'ears') { tri(x - 40, y - 10, x - 44, y - 58, x - 14, y - 30); tri(x + 40, y - 10, x + 44, y - 58, x + 14, y - 30); }
  if (m.shape === 'spiky') for (let i = -2; i <= 2; i++) tri(x + i * 15 - 8, y - 26, x + i * 15, y - 54, x + i * 15 + 8, y - 26);
  ctx.beginPath();
  ctx.ellipse(x, y, 44, m.shape === 'tall' ? 48 : 38, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  dot(x - 14, y - 8, 10, '#fff'); dot(x + 14, y - 8, 10, '#fff');
  dot(x - 12, y - 6, 4, '#111'); dot(x + 16, y - 6, 4, '#111');
  ctx.beginPath(); ctx.arc(x, y + 12, 10, 0, Math.PI); ctx.stroke();
  ctx.restore();
}

function hpBox(m, x, y, mine) {
  const w = 200, h = mine ? 56 : 48;
  ctx.fillStyle = '#f8f8e8'; ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#222'; ctx.font = 'bold 15px monospace';
  ctx.fillText(m.name, x + 10, y + 18);
  ctx.font = '12px monospace';
  ctx.fillText('Lv' + m.lvl + (m.status ? ' PSN' : ''), x + w - 62, y + 18);
  const pct = Math.max(0, m.hp / m.maxHp);
  ctx.fillStyle = '#333'; ctx.fillRect(x + 30, y + 26, 150, 8);
  ctx.fillStyle = pct > .5 ? '#3c3' : pct > .2 ? '#ea3' : '#e33';
  ctx.fillRect(x + 30, y + 26, 150 * pct, 8);
  ctx.fillStyle = '#222'; ctx.fillText('HP', x + 10, y + 34);
  if (mine) ctx.fillText(`${Math.max(0, m.hp)}/${m.maxHp}`, x + w - 80, y + 48);
}

function drawBoard(b) {
  const g = ctx.createLinearGradient(0, 0, 0, cv.height);
  g.addColorStop(0, '#7fcfff'); g.addColorStop(.55, '#cdf3ff');
  g.addColorStop(.56, '#7dcb6e'); g.addColorStop(1, '#3f8f47');
  ctx.fillStyle = g; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#6cb861';
  ctx.beginPath(); ctx.ellipse(340, 130, 120, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(130, 240, 140, 30, 0, 0, Math.PI * 2); ctx.fill();
  if (!b) return;
  const e = b.e.team[b.e.idx], p = b.p.team[b.p.idx];
  drawCreature(e, 340, 100);
  drawCreature(p, 130, 210);
  hpBox(e, 12, 14, false);
  hpBox(p, 268, 150, true);
}

function btn(text, fn, on = true) {
  const b = document.createElement('button');
  b.textContent = text; b.disabled = busy || !on; b.onclick = fn;
  return b;
}

const back = () => { menu = 'main'; controls(); };

function controls() {
  const c = $('controls'); c.innerHTML = '';
  const g = game; if (!g) return;
  const add = x => c.appendChild(x);
  if (g.phase === 'title') return add(btn('Enter the Tower', startBattle));
  if (g.phase === 'won') return add(btn('Continue', startBattle));
  if (g.phase === 'lost') return add(btn('Try again', newGame));
  if (g.phase === 'done') return add(btn('Play again', newGame));

  const b = g.battle, p = b.p.team[b.p.idx];
  if (b.needSwitch) menu = 'switch';
  if (menu === 'main') {
    add(btn('FIGHT', () => { menu = 'fight'; controls(); }));
    add(btn('ITEM', () => { menu = 'item'; controls(); }));
    add(btn('SWITCH', () => { menu = 'switch'; controls(); }));
  } else if (menu === 'fight') {
    p.moves.forEach((mv, i) => add(btn(`${mv[0]} (${mv[1]})`, () => send({ type: 'move', index: i }))));
    add(btn('Back', back));
  } else if (menu === 'item') {
    const it = b.p.items;
    add(btn(`Potion x${it.potion}`, () => send({ type: 'item', item: 'potion' }), it.potion > 0 && p.hp < p.maxHp));
    add(btn(`Revive x${it.revive}`, () => send({ type: 'item', item: 'revive' }), it.revive > 0 && b.p.team.some(x => x.hp <= 0)));
    add(btn(`Medicine x${it.medicine}`, () => send({ type: 'item', item: 'medicine' }), it.medicine > 0 && !!p.status));
    add(btn('Back', back));
  } else if (menu === 'switch') {
    b.p.team.forEach((x, j) => add(btn(`${x.name} ${Math.max(0, x.hp)}/${x.maxHp}`,
      () => send({ type: 'switch', index: j }), x.hp > 0 && j !== b.p.idx)));
    if (!b.needSwitch) add(btn('Back', back));
  }
}

function refresh() {
  const g = game; if (!g) return;
  $('hud').textContent = `Floor ${g.floor}/20 · Elite ${Math.min(g.elite + 1, 5)}/5`;
  drawBoard(g.battle && g.phase !== 'title' ? g.battle : null);
  controls();
}

function promptText() {
  const g = game, b = g.battle;
  if (g.phase === 'title') return 'Welcome to the Tower! Beat all 5 elites on each floor.';
  if (g.phase === 'won') return 'Elite defeated! Onward.';
  if (g.phase === 'lost') return 'Your team has fallen...';
  if (g.phase === 'done') return 'You conquered the Tower!';
  if (b.needSwitch) return 'Choose your next monster!';
  return `What will ${b.p.team[b.p.idx].name} do?`;
}

// Shows the server's events one line at a time, then re-enables controls.
async function apply(r) {
  if (r.error) return;
  game = r; busy = true; refresh();
  const events = game.battle ? game.battle.events : [];
  for (const l of events) { $('log').textContent = l; await wait(700); }
  busy = false; menu = 'main';
  $('log').textContent = promptText();
  refresh();
}

async function newGame() {
  busy = true;
  game = await post('/api/new');
  busy = false;
  $('log').textContent = promptText();
  refresh();
}

async function startBattle() {
  await apply(await post('/api/start', { id: game.id }));
}

async function send(action) {
  if (busy) return;
  await apply(await post('/api/turn', { id: game.id, action }));
}

newGame();