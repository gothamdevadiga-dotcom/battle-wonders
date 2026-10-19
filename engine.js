const { TYPES, CREATURES, NAMES } = require('./data');

const rnd = n => Math.floor(Math.random() * n);
const ev = (b, msg) => b.events.push(msg);
const label = (s, m) => (s === 'p' ? m.name : 'Foe ' + m.name);

function mon(sp, lvl, mult = 1) {
  const b = sp.base;
  const st = i => Math.floor((Math.floor(b[i] * lvl / 25) + 5) * mult);
  const maxHp = Math.floor((Math.floor(b[0] * lvl / 25) + lvl + 10) * mult);
  return { id: sp.id, name: sp.name, type: sp.type, color: sp.color, shape: sp.shape,
    moves: sp.moves, lvl, maxHp, hp: maxHp, atk: st(1), def: st(2), spd: st(3), status: null };
}

function randomTeam(lv, mult) {
  return [...CREATURES].sort(() => Math.random() - .5).slice(0, 3).map(sp => mon(sp, lv, mult));
}

function dmg(a, d, mv, est) {
  const eff = (TYPES[mv[1]] || {})[d.type] ?? 1;
  const stab = a.type === mv[1] ? 1.5 : 1;
  const base = Math.floor(Math.floor(Math.floor(2 * a.lvl / 5 + 2) * mv[2] * a.atk / d.def) / 50) + 2;
  return Math.max(1, Math.floor(base * stab * eff * (est ? .925 : .85 + Math.random() * .15)));
}

function createBattle(floor, elite) {
  const lv = 30 + floor * 2;                 // level 32 on floor 1, 70 on floor 20
  const mult = 1 + .02 * floor + .02 * elite;
  const foeName = NAMES[((floor - 1) * 5 + elite) % NAMES.length];
  return {
    phase: 'battle', floor, elite, foeName, needSwitch: false,
    events: [`Elite ${foeName} challenges you!`],
    p: { team: randomTeam(lv), idx: 0, items: { potion: 3, medicine: 2, revive: 1 + rnd(2) } },
    e: { team: randomTeam(lv + (elite >= 3 ? 2 : 0), mult), idx: 0,
         items: { potion: 2 + (floor > 10 ? 1 : 0), medicine: 0, revive: 0 } }
  };
}

function useItem(b, s, item) {
  const side = b[s], me = side.team[side.idx];
  if (item === 'potion' && side.items.potion > 0 && me.hp < me.maxHp) {
    side.items.potion--;
    const h = Math.floor(me.maxHp * .4);
    me.hp = Math.min(me.maxHp, me.hp + h);
    ev(b, `${label(s, me)} recovered ${h} HP!`);
  } else if (item === 'revive' && side.items.revive > 0) {
    const f = side.team.find(x => x.hp <= 0);
    if (f) { side.items.revive--; f.hp = Math.floor(f.maxHp / 2); f.status = null; ev(b, `${label(s, f)} was revived!`); }
  } else if (item === 'medicine' && side.items.medicine > 0 && me.status) {
    side.items.medicine--; me.status = null; ev(b, `${label(s, me)} was cured!`);
  }
}

function act(b, s, a) {
  const o = s === 'p' ? 'e' : 'p', side = b[s], foeSide = b[o];
  const me = side.team[side.idx], foe = foeSide.team[foeSide.idx];
  if (a.type === 'switch') {
    const t = side.team[a.index];
    if (!t || t.hp <= 0 || a.index === side.idx) return;
    side.idx = a.index;
    ev(b, s === 'p' ? `Go, ${t.name}!` : `Foe sends out ${t.name}!`);
    return;
  }
  if (me.hp <= 0) return;
  if (a.type === 'item') return useItem(b, s, a.item);
  if (a.type === 'move') {
    const mv = me.moves[a.index];
    if (!mv || foe.hp <= 0) return;
    ev(b, `${label(s, me)} used ${mv[0]}!`);
    if (Math.random() < .05) { ev(b, 'It missed!'); return; }
    const d = dmg(me, foe, mv), eff = (TYPES[mv[1]] || {})[foe.type] ?? 1;
    foe.hp = Math.max(0, foe.hp - d);
    if (eff > 1) ev(b, "It's super effective!");
    else if (eff < 1) ev(b, "It's not very effective...");
    ev(b, `${label(o, foe)} took ${d} damage.`);
    if (mv[3] && !foe.status && foe.hp > 0 && Math.random() < mv[3]) {
      foe.status = 'poison'; ev(b, `${label(o, foe)} was poisoned!`);
    }
  }
}

function aiChoose(b) {
  const m = b.e.team[b.e.idx], p = b.p.team[b.p.idx];
  const smart = Math.random() < Math.min(1, .2 + .04 * b.floor);
  if (smart && m.hp < m.maxHp * .3 && b.e.items.potion > 0) return { type: 'item', item: 'potion' };
  if (smart) {
    const best = x => Math.max(...x.moves.map(mv => dmg(x, p, mv, true)));
    const j = b.e.team.findIndex((x, k) => k !== b.e.idx && x.hp > 0 && best(x) > 1.5 * best(m));
    if (j >= 0 && Math.random() < .4) return { type: 'switch', index: j };
  }
  let i = rnd(m.moves.length);
  if (smart) {
    let bd = -1;
    m.moves.forEach((mv, k) => { const d = dmg(m, p, mv, true); if (d > bd) { bd = d; i = k; } });
  }
  return { type: 'move', index: i };
}

function faintCheck(b) {
  const e = b.e.team[b.e.idx];
  if (e.hp <= 0) {
    ev(b, `${e.name} fainted!`);
    const nx = b.e.team.findIndex(x => x.hp > 0);
    if (nx < 0) { b.phase = 'won'; return; }
    b.e.idx = nx; ev(b, `Foe sends out ${b.e.team[nx].name}!`);
  }
  const p = b.p.team[b.p.idx];
  if (p.hp <= 0) {
    ev(b, `${p.name} fainted!`);
    if (!b.p.team.some(x => x.hp > 0)) { b.phase = 'lost'; return; }
    b.needSwitch = true; ev(b, 'Choose your next monster!');
  }
}

function newGame() { return { floor: 1, elite: 0, phase: 'title', battle: null }; }

function startBattle(g) { g.battle = createBattle(g.floor, g.elite); g.phase = 'battle'; }

function sync(g) {
  const b = g.battle;
  if (b.phase === 'won') {
    g.elite++;
    if (g.elite === 5) { g.elite = 0; g.floor++; }
    g.phase = g.floor > 20 ? 'done' : 'won';
  } else if (b.phase === 'lost') g.phase = 'lost';
}

function turn(g, a) {
  const b = g.battle;
  if (g.phase !== 'battle' || b.phase !== 'battle') return;
  if (!['move', 'item', 'switch'].includes(a.type)) return;
  if (b.needSwitch && a.type !== 'switch') return;
  b.events = [];
  let order;
  if (b.needSwitch) order = [['p', a]];
  else {
    const ea = aiChoose(b), pm = b.p.team[b.p.idx], em = b.e.team[b.e.idx];
    const spd = (s, x) => x.type !== 'move' ? 1e9 : (s === 'p' ? pm : em).spd;
    const ps = spd('p', a), es = spd('e', ea);
    order = (ps > es || (ps === es && Math.random() < .5)) ? [['p', a], ['e', ea]] : [['e', ea], ['p', a]];
  }
  for (const [s, x] of order) act(b, s, x);
  b.needSwitch = false;
  for (const s of ['p', 'e']) {
    const m = b[s].team[b[s].idx];
    if (m.hp > 0 && m.status === 'poison') {
      m.hp = Math.max(0, m.hp - Math.max(1, Math.floor(m.maxHp / 8)));
      ev(b, `${label(s, m)} is hurt by poison!`);
    }
  }
  faintCheck(b);
  sync(g);
}

module.exports = { newGame, startBattle, turn };