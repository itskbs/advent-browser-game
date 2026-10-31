import { TILE, VIEW_W, VIEW_H, DAYS, SOLUTION, SOLUTION_WORDS, CHEAT, SOLVE_ALL, NOW, isUnlocked, giftUnlocked, applyAdmin } from './config.js';
import { buildWorld, ROOM, MAP_W, MAP_H } from './world.js';
import { HOUSES, GIFT, EGGS } from './content.js';
import { loadState } from './state.js';
import { createUI } from './ui.js';
import { runHouse } from './quizzes/index.js';
import { buildBackground, drawWorld, drawInterior, drawSnow, drawFade } from './render.js';
import { fetchMe, login, logout } from './auth.js';

// ---------- Login ----------
function showLoginScreen() {
  const overlay = document.getElementById('login-overlay');
  const form = document.getElementById('login-form');
  const usernameEl = document.getElementById('login-username');
  const birthdateEl = document.getElementById('login-birthdate');
  const errorEl = document.getElementById('login-error');
  overlay.hidden = false;

  return new Promise((resolve) => {
    form.addEventListener('submit', async function onSubmit(e) {
      e.preventDefault();
      errorEl.textContent = '';
      try {
        const session = await login(usernameEl.value, birthdateEl.value);
        form.removeEventListener('submit', onSubmit);
        overlay.hidden = true;
        resolve(session);
      } catch (err) {
        errorEl.textContent = err.message;
      }
    });
  });
}

async function boot() {
  const session = (await fetchMe()) || (await showLoginScreen());
  applyAdmin(session.isAdmin);

  document.getElementById('user-name').textContent = session.username;
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    location.reload();
  });

  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const ui = createUI();
  const state = await loadState(() => renderHud());
  const world = buildWorld();
  const bg = buildBackground(world);

  const game = {
    scene: 'world', // 'world' | 'interior'
    player: { x: world.spawn.x, y: world.spawn.y, dir: 'down', moving: false },
    cam: { x: 0, y: 0 },
    state, world, house: null,
    locked: false,
    fade: 0, fadeTarget: 0, fadeDone: null,
  };
  const SPEED = 62; // px/s

  if (SOLVE_ALL) for (const h of HOUSES) if (!state.solved[h.day]) state.solve(h.day);

  // ---------- HUD ----------
  function renderHud() {
    const slots = HOUSES.map((h) => {
      const ok = state.solved[h.day];
      return `<span class="slot ${ok ? 'solved' : ''}">${ok ? h.letter : '?'}<small>${h.day}</small></span>`;
    }).join('');
    const found = EGGS.filter((e) => state.eggs[e.id]).length;
    const solvedCount = HOUSES.filter((h) => state.solved[h.day]).length;
    hud.innerHTML =
      `<div class="slots" title="Lösungswort">${slots}</div>` +
      `<span class="badge">Rätsel ${solvedCount}/${DAYS}</span>` +
      `<span class="badge">Eastereggs ${found}/${EGGS.length}</span>` +
      (CHEAT ? '<span class="badge cheat">Cheat-Modus</span>' : '') +
      (session.isAdmin && new URLSearchParams(location.search).has('date') ? `<span class="badge cheat">Datum: ${NOW.toLocaleDateString('de-DE')}</span>` : '');
  }
  renderHud();

  // ---------- Skalierung ----------
  function resize() {
    const s = Math.max(1, Math.min(Math.floor((window.innerWidth - 40) / VIEW_W), Math.floor((window.innerHeight - 150) / VIEW_H)));
    document.documentElement.style.setProperty('--s', s);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Eingabe ----------
  const keys = new Set();
  let interactQueued = false;
  const MOVE_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
  window.addEventListener('keydown', (e) => {
    if (ui.active) { ui.handleKey(e); return; }
    const k = e.key.toLowerCase();
    if (MOVE_KEYS.includes(k) || k === ' ') e.preventDefault();
    keys.add(k);
    if (!e.repeat && (k === 'enter' || k === ' ' || k === 'e')) interactQueued = true;
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  // ---------- Kollision ----------
  function blocked(tx, ty) {
    if (game.scene === 'interior') {
      if (tx < 0 || ty < 0 || tx >= ROOM.w || ty >= ROOM.h) return true;
      return ROOM.solid[ty][tx];
    }
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
    if (world.solid[ty][tx]) return true;
    const d = world.doors.get(`${tx},${ty}`);
    return d?.type === 'house' && !isUnlocked(d.day);
  }

  function collides(x, y) {
    for (const [cx, cy] of [[x - 5, y - 6], [x + 5, y - 6], [x - 5, y], [x + 5, y]]) {
      if (blocked(Math.floor(cx / TILE), Math.floor(cy / TILE))) return true;
    }
    return false;
  }

  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const frontTile = (p) => {
    const [dx, dy] = DIRS[p.dir];
    return [Math.floor((p.x + dx * 9) / TILE), Math.floor((p.y - 3 + dy * 9) / TILE)];
  };

  // ---------- Abläufe ----------
  async function flow(fn) {
    game.locked = true; keys.clear(); interactQueued = false;
    try { await fn(); } finally { game.locked = false; keys.clear(); interactQueued = false; }
  }

  function fadeTo(target) {
    return new Promise((res) => {
      if (game.fade === target) return res();
      game.fadeTarget = target; game.fadeDone = res;
    });
  }

  function lockedMessage(day) {
    return NOW.getMonth() === 11
      ? `Türchen ${day} öffnet sich am ${day}. Dezember. Noch ein bisschen Geduld!`
      : `Türchen ${day} öffnet sich am ${day}. Dezember. Der Advent hat noch nicht begonnen!`;
  }

  let lastBump = 0;
  function bump(day) {
    const now = performance.now();
    if (now - lastBump < 2600) return;
    lastBump = now;
    ui.toast(lockedMessage(day));
  }

  const houseByDay = (d) => HOUSES[d - 1];

  async function enterHouse(day) {
    await flow(async () => {
      const h = houseByDay(day);
      await fadeTo(1);
      game.scene = 'interior'; game.house = h;
      Object.assign(game.player, { x: ROOM.spawn.x * TILE + 8, y: ROOM.spawn.y * TILE + 8, dir: 'up', moving: false });
      await fadeTo(0);
      await runHouse(ui, h, state);
    });
  }

  async function leaveHouse() {
    await flow(async () => {
      const day = game.house.day;
      const door = [...world.doors].find(([, d]) => d.type === 'house' && d.day === day)[0].split(',').map(Number);
      await fadeTo(1);
      game.scene = 'world'; game.house = null;
      Object.assign(game.player, { x: door[0] * TILE + 8, y: (door[1] + 1) * TILE + 8, dir: 'down', moving: false });
      await fadeTo(0);
    });
  }

  async function visitGift() {
    await flow(async () => {
      const who = GIFT.npc.name;
      const letters = HOUSES.map((h) => (state.solved[h.day] ? h.letter : '_')).join('');
      const missing = HOUSES.filter((h) => !state.solved[h.day]).length;

      if (state.gift) {
        await ui.say(who, GIFT.replay);
      } else if (!giftUnlocked()) {
        await ui.say(who, GIFT.locked);
      } else if (missing > 0) {
        await ui.say(who, `Dir fehlen noch ${missing} Buchstaben, um das Lösungswort zu bilden.\n${letters.split('').join(' ')}`);
      } else {
        const blanks = SOLUTION_WORDS.map((w) => '_'.repeat(w.length)).join('   ');
        for (;;) {
          const a = await ui.ask(who, `${GIFT.ask}\nDeine Buchstaben: ${letters.split('').join(' ')}\n${blanks}`);
          if (a === null) break;
          if (a.toUpperCase().replace(/[^A-ZÄÖÜ!]/g, '') === SOLUTION) {
            state.openGift();
            for (const line of GIFT.win) await ui.say(who, line);
            break;
          }
          await ui.say(who, 'Das Schloss rührt sich nicht. Das ist nicht das richtige Wort.');
        }
      }
      // einen Schritt zurücktreten, damit die Tür nicht sofort wieder auslöst
      game.player.y += TILE * 1.5; game.player.dir = 'down';
    });
  }

  async function examine(obj) {
    await flow(async () => {
      for (const line of obj.text) await ui.say('', line);
      if (!state.eggs[obj.id]) {
        state.findEgg(obj.id);
        ui.toast(`Easteregg gefunden! (${EGGS.filter((e) => state.eggs[e.id]).length}/${EGGS.length})`);
      }
    });
  }

  function interact() {
    const p = game.player;
    if (game.scene === 'interior') {
      const nx = ROOM.npc.x * TILE + 8, ny = ROOM.npc.y * TILE + 8;
      const [dx, dy] = DIRS[p.dir];
      if (Math.hypot(p.x + dx * 10 - nx, p.y - 3 + dy * 10 - ny) < 14) flow(() => runHouse(ui, game.house, state));
      return;
    }
    const [tx, ty] = frontTile(p);
    const obj = world.objects.find((o) => o.tx === tx && o.ty === ty);
    if (obj) { examine(obj); return; }
    const d = world.doors.get(`${tx},${ty}`);
    if (d?.type === 'house' && !isUnlocked(d.day)) { lastBump = 0; bump(d.day); }
  }

  // ---------- Update / Draw ----------
  function update(dt) {
    // Überblendung
    if (game.fade !== game.fadeTarget) {
      const dir = Math.sign(game.fadeTarget - game.fade);
      game.fade += dir * dt * 4;
      if ((dir > 0 && game.fade >= game.fadeTarget) || (dir < 0 && game.fade <= game.fadeTarget)) {
        game.fade = game.fadeTarget;
        const f = game.fadeDone; game.fadeDone = null; f?.();
      }
    }

    const p = game.player;
    p.moving = false;
    const follow = () => {
      game.cam.x = Math.round(Math.max(0, Math.min(MAP_W * TILE - VIEW_W, p.x - VIEW_W / 2)));
      game.cam.y = Math.round(Math.max(0, Math.min(MAP_H * TILE - VIEW_H, p.y - VIEW_H / 2)));
    };
    follow();
    if (game.locked || ui.active) { interactQueued = false; return; }

    let dx = (keys.has('arrowright') || keys.has('d') ? 1 : 0) - (keys.has('arrowleft') || keys.has('a') ? 1 : 0);
    let dy = (keys.has('arrowdown') || keys.has('s') ? 1 : 0) - (keys.has('arrowup') || keys.has('w') ? 1 : 0);
    if (dx || dy) {
      p.moving = true;
      p.dir = dy ? (dy > 0 ? 'down' : 'up') : (dx > 0 ? 'right' : 'left');
      if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
      const nx = p.x + dx * SPEED * dt;
      if (!collides(nx, p.y)) p.x = nx;
      const ny = p.y + dy * SPEED * dt;
      if (!collides(p.x, ny)) p.y = ny;

      if (game.scene === 'world') {
        const [tx, ty] = frontTile(p);
        const d = world.doors.get(`${tx},${ty}`);
        if (d?.type === 'house' && !isUnlocked(d.day)) bump(d.day);
      }
    }

    if (interactQueued) { interactQueued = false; interact(); if (game.locked) return; }

    const tx = Math.floor(p.x / TILE), ty = Math.floor((p.y - 3) / TILE);
    if (game.scene === 'world') {
      const d = world.doors.get(`${tx},${ty}`);
      if (d?.type === 'house') enterHouse(d.day);
      else if (d?.type === 'gift') visitGift();
    } else if (tx === ROOM.exit.x && ty === ROOM.exit.y) {
      leaveHouse();
    }
    follow();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    ctx.imageSmoothingEnabled = false;
    if (game.scene === 'world') drawWorld(ctx, game, bg, now);
    else drawInterior(ctx, game, now);
    drawSnow(ctx, dt);
    drawFade(ctx, game.fade);
    requestAnimationFrame(frame);
  }

  // Kamera initial setzen
  game.cam.x = Math.round(Math.max(0, Math.min(MAP_W * TILE - VIEW_W, game.player.x - VIEW_W / 2)));
  game.cam.y = Math.round(Math.max(0, Math.min(MAP_H * TILE - VIEW_H, game.player.y - VIEW_H / 2)));
  requestAnimationFrame(frame);

  document.getElementById('app').hidden = false;
  window.__game = game; // für Debugging in der Konsole
}

boot();
