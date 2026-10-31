import { TILE, VIEW_W, VIEW_H, isUnlocked, giftUnlocked } from './config.js';
import { MAP_W, MAP_H, T, GIFT_HOUSE, SPORTS_FIELD, SCHOOL, KINDERGARTEN, PLAYGROUND, ROOM } from './world.js';

const rect = (ctx, c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };

function mulberry(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Hintergrund (einmal vorgerendert) ----------
export function buildBackground(world) {
  const c = document.createElement('canvas');
  c.width = MAP_W * TILE; c.height = MAP_H * TILE;
  const ctx = c.getContext('2d');
  const rnd = mulberry(42);
  for (let ty = 0; ty < MAP_H; ty++) for (let tx = 0; tx < MAP_W; tx++) {
    const t = world.tiles[ty][tx];
    const x = tx * TILE, y = ty * TILE;
    if (t === T.PATH) {
      rect(ctx, '#dccb9c', x, y, TILE, TILE);
      for (let i = 0; i < 5; i++) rect(ctx, '#c8b480', x + ((rnd() * 14) | 0), y + ((rnd() * 14) | 0), 2, 1);
    } else if (t === T.DIKE) {
      rect(ctx, '#5a9152', x, y, TILE, TILE);
      rect(ctx, '#4a7d44', x, y, TILE, 3);
      for (let i = 0; i < 4; i++) rect(ctx, '#6ba562', x + ((rnd() * 14) | 0), y + 5 + ((rnd() * 9) | 0), 2, 1);
    } else if (t === T.BOARDWALK) {
      rect(ctx, '#8a6239', x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) rect(ctx, '#6e4c2a', x, y + i * 4 + 1, TILE, 1);
      rect(ctx, '#3f2c17', x + 7, y, 1, TILE);
    } else if (t === T.MARSH) {
      rect(ctx, '#7a7a4a', x, y, TILE, TILE);
      rect(ctx, '#6b6b3e', x, y, TILE, TILE / 2);
      for (let i = 0; i < 3; i++) rect(ctx, '#4f7a4a', x + ((rnd() * 13) | 0), y + ((rnd() * 13) | 0), 1, 3);
    } else if (t === T.WATER) {
      rect(ctx, '#3b82c4', x, y, TILE, TILE);
      rect(ctx, '#6aa8e0', x + 2 + ((rnd() * 4) | 0), y + 4, 5, 1);
      rect(ctx, '#6aa8e0', x + 8 + ((rnd() * 3) | 0), y + 11, 5, 1);
    } else {
      rect(ctx, '#e9f1f4', x, y, TILE, TILE); // Schneeboden
      rect(ctx, '#d9e6ec', x, y, TILE, TILE);
      for (let i = 0; i < 4; i++) rect(ctx, '#f8fcff', x + ((rnd() * 14) | 0), y + ((rnd() * 14) | 0), 2, 1);
      if (t === T.FLOWER) {
        const col = ['#e84c4c', '#f2c94c', '#9b5de5'][(rnd() * 3) | 0];
        rect(ctx, '#3f8f3f', x + 7, y + 9, 1, 4);
        rect(ctx, col, x + 6, y + 7, 3, 3);
        rect(ctx, '#fff7a8', x + 7, y + 8, 1, 1);
      }
    }
  }
  return c;
}

// ---------- Figuren ----------
export function drawChar(ctx, x, y, dir, step, pal) {
  const bx = Math.round(x) - 8, by = Math.round(y) - 15;
  rect(ctx, 'rgba(0,0,0,.25)', bx + 3, by + 14, 10, 2);
  rect(ctx, '#5b3a1e', bx + 4, by + 12, 3, 3 - (step === 1 ? 1 : 0));
  rect(ctx, '#5b3a1e', bx + 9, by + 12, 3, 3 - (step === 3 ? 1 : 0));
  rect(ctx, pal.tunic, bx + 3, by + 7, 10, 5);
  rect(ctx, '#7a4b12', bx + 3, by + 10, 10, 1);
  rect(ctx, pal.skin, bx + 2, by + 8, 2, 3);
  rect(ctx, pal.skin, bx + 12, by + 8, 2, 3);
  rect(ctx, pal.skin, bx + 3, by + 1, 10, 7);
  if (dir === 'up') {
    rect(ctx, pal.hat, bx + 2, by, 12, 6);
    rect(ctx, pal.hat, bx + 5, by + 6, 6, 1);
  } else {
    rect(ctx, pal.hat, bx + 2, by, 12, 3);
    if (dir === 'down') {
      rect(ctx, '#222', bx + 5, by + 4, 2, 2);
      rect(ctx, '#222', bx + 9, by + 4, 2, 2);
      rect(ctx, pal.hat, bx + 12, by + 1, 3, 3);
    } else if (dir === 'left') {
      rect(ctx, '#222', bx + 4, by + 4, 2, 2);
      rect(ctx, pal.hat, bx + 11, by + 1, 4, 3);
    } else {
      rect(ctx, '#222', bx + 10, by + 4, 2, 2);
      rect(ctx, pal.hat, bx + 1, by + 1, 4, 3);
    }
    rect(ctx, '#fff', bx + 2, by + 2, 12, 1); // Bommel-Rand
    if (pal.beard) rect(ctx, '#f4f4f4', bx + 4, by + 6, 8, 3);
  }
}

export const PLAYER_PAL = { tunic: '#2e9e3e', hat: '#2e9e3e', skin: '#f0c090' };

// ---------- Weltobjekte ----------
function drawTree(ctx, x, y) {
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 13, 12, 3);
  rect(ctx, '#6b4423', x + 6, y + 10, 4, 6);
  rect(ctx, '#2f7d32', x + 2, y + 4, 12, 7);
  rect(ctx, '#2f7d32', x + 4, y + 1, 8, 12);
  rect(ctx, '#46a047', x + 5, y + 4, 3, 2);
  rect(ctx, '#fff', x + 4, y + 1, 8, 2);
  rect(ctx, '#fff', x + 2, y + 4, 4, 1);
  rect(ctx, '#fff', x + 10, y + 7, 4, 1);
}

const ROOF = ['#c0392b', '#2e7d32', '#1565c0', '#8e44ad', '#d35400', '#00838f'];

function drawSign(ctx, x, y, w, text, gold) {
  rect(ctx, gold ? '#ffd85a' : '#d9b46a', x, y, w, 11);
  rect(ctx, gold ? '#8a6a10' : '#5a3a14', x + 1, y + 1, w - 2, 9);
  ctx.fillStyle = gold ? '#ffe9a0' : '#fff';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x + w / 2, y + 9);
}

function drawLock(ctx, x, y) {
  rect(ctx, '#ffd85a', x, y + 3, 6, 5);
  rect(ctx, '#b8941c', x + 2, y + 5, 2, 2);
  rect(ctx, '#ddd', x + 1, y, 1, 3);
  rect(ctx, '#ddd', x + 4, y, 1, 3);
  rect(ctx, '#ddd', x + 1, y, 4, 1);
}

function drawHouse(ctx, h, state) {
  const x = h.x * TILE, y = h.y * TILE;
  const open = isUnlocked(h.day);
  const solved = !!state.solved[h.day];
  const roof = ROOF[(h.day - 1) % ROOF.length];
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 46, 46, 3);
  // Dach
  rect(ctx, roof, x, y + 2, 48, 22);
  for (let r = 0; r < 5; r++) rect(ctx, 'rgba(0,0,0,.18)', x, y + 7 + r * 4, 48, 1);
  for (let r = 0; r < 5; r++) for (let c = r % 2 ? 4 : 0; c < 48; c += 8) rect(ctx, 'rgba(0,0,0,.12)', x + c, y + 3 + r * 4, 1, 4);
  rect(ctx, '#fff', x, y, 48, 4);
  rect(ctx, '#fff', x + 3, y + 4, 10, 2);
  rect(ctx, '#fff', x + 30, y + 4, 12, 2);
  rect(ctx, 'rgba(0,0,0,.25)', x, y + 22, 48, 2);
  drawSign(ctx, x + 14, y + 9, 20, String(h.day), solved);
  // Wand
  rect(ctx, '#f1e3c3', x + 2, y + 24, 44, 24);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 44, 2);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 2, 24);
  rect(ctx, '#8b5a2b', x + 44, y + 24, 2, 24);
  for (const wx of [x + 6, x + 32]) {
    rect(ctx, '#8b5a2b', wx - 1, y + 28, 12, 11);
    rect(ctx, open ? '#ffe58a' : '#2b3a55', wx, y + 29, 10, 9);
    rect(ctx, '#8b5a2b', wx + 4, y + 29, 1, 9);
    rect(ctx, '#8b5a2b', wx, y + 33, 10, 1);
  }
  // Tür
  rect(ctx, '#3d230e', x + 18, y + 31, 12, 17);
  rect(ctx, '#6b3f1d', x + 19, y + 32, 10, 16);
  rect(ctx, '#7d4c26', x + 20, y + 33, 3, 14);
  rect(ctx, '#ffd85a', x + 26, y + 41, 2, 2);
  if (!open) drawLock(ctx, x + 21, y + 36);
}

function drawSchool(ctx) {
  // Grundschule im Format eines normalen Hauses
  const x = SCHOOL.x * TILE, y = SCHOOL.y * TILE;
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 46, 46, 3);
  rect(ctx, '#c0392b', x, y + 2, 48, 22);
  for (let r = 0; r < 5; r++) rect(ctx, 'rgba(0,0,0,.18)', x, y + 7 + r * 4, 48, 1);
  rect(ctx, '#fff', x, y, 48, 4);
  rect(ctx, 'rgba(0,0,0,.25)', x, y + 22, 48, 2);
  drawSign(ctx, x + 10, y + 9, 28, 'SCHULE', false);
  rect(ctx, '#f1e3c3', x + 2, y + 24, 44, 24);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 44, 2);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 2, 24);
  rect(ctx, '#8b5a2b', x + 44, y + 24, 2, 24);
  for (const wx of [x + 6, x + 32]) {
    rect(ctx, '#8b5a2b', wx - 1, y + 28, 12, 11);
    rect(ctx, '#ffe58a', wx, y + 29, 10, 9);
    rect(ctx, '#8b5a2b', wx + 4, y + 29, 1, 9);
    rect(ctx, '#8b5a2b', wx, y + 33, 10, 1);
  }
  rect(ctx, '#3d230e', x + 18, y + 31, 12, 17);
  rect(ctx, '#6b3f1d', x + 19, y + 32, 10, 16);
  rect(ctx, '#7d4c26', x + 20, y + 33, 3, 14);
  rect(ctx, '#ffd85a', x + 26, y + 41, 2, 2);
}

function drawKindergarten(ctx) {
  // Kindergarten, etwas verspielter als die Schule
  const x = KINDERGARTEN.x * TILE, y = KINDERGARTEN.y * TILE;
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 46, 46, 3);
  rect(ctx, '#e8a33d', x, y + 2, 48, 22);
  for (let r = 0; r < 5; r++) rect(ctx, 'rgba(0,0,0,.15)', x, y + 7 + r * 4, 48, 1);
  rect(ctx, '#fff', x, y, 48, 4);
  rect(ctx, 'rgba(0,0,0,.25)', x, y + 22, 48, 2);
  drawSign(ctx, x + 12, y + 9, 24, 'KITA', false);
  rect(ctx, '#fcefd0', x + 2, y + 24, 44, 24);
  rect(ctx, '#e8a33d', x + 2, y + 24, 44, 2);
  rect(ctx, '#e8a33d', x + 2, y + 24, 2, 24);
  rect(ctx, '#e8a33d', x + 44, y + 24, 2, 24);
  for (const wx of [x + 6, x + 32]) {
    rect(ctx, '#e8a33d', wx - 1, y + 28, 12, 11);
    rect(ctx, '#9bd6e8', wx, y + 29, 10, 9);
    rect(ctx, '#e8a33d', wx + 4, y + 29, 1, 9);
    rect(ctx, '#e8a33d', wx, y + 33, 10, 1);
  }
  rect(ctx, '#3d230e', x + 18, y + 31, 12, 17);
  rect(ctx, '#2e9e3e', x + 19, y + 32, 10, 16);
  rect(ctx, '#246b2e', x + 20, y + 33, 3, 14);
  rect(ctx, '#ffd85a', x + 26, y + 41, 2, 2);
}

function drawPlayground(ctx) {
  const x = PLAYGROUND.x * TILE, y = PLAYGROUND.y * TILE;
  const w = PLAYGROUND.w * TILE, h = PLAYGROUND.h * TILE;
  rect(ctx, '#d9c48a', x, y, w, h); // Sand
  // Schaukel
  rect(ctx, '#8b5a2b', x + 6, y + 4, 2, 20);
  rect(ctx, '#8b5a2b', x + 22, y + 4, 2, 20);
  rect(ctx, '#8b5a2b', x + 6, y + 4, 18, 2);
  rect(ctx, '#3d230e', x + 13, y + 16, 6, 3);
  rect(ctx, '#555', x + 9, y + 6, 1, 10); rect(ctx, '#555', x + 20, y + 6, 1, 10);
  // Rutsche
  rect(ctx, '#e8741c', x + w - 20, y + 2, 6, 14);
  rect(ctx, '#ffd85a', x + w - 22, y + 14, 20, 4);
}

function drawSportsField(ctx) {
  const x = SPORTS_FIELD.x * TILE, y = SPORTS_FIELD.y * TILE;
  const w = SPORTS_FIELD.w * TILE, h = SPORTS_FIELD.h * TILE;
  // Rasenstreifen
  const stripes = 6;
  for (let i = 0; i < stripes; i++) rect(ctx, i % 2 ? '#3f8f3f' : '#479349', x, y + Math.round((h / stripes) * i), w, Math.ceil(h / stripes));
  // Spielfeldrand
  rect(ctx, '#fff', x, y, w, 2); rect(ctx, '#fff', x, y + h - 2, w, 2);
  rect(ctx, '#fff', x, y, 2, h); rect(ctx, '#fff', x + w - 2, y, 2, h);
  // Mittellinie + Anstoßkreis
  rect(ctx, '#fff', x + w / 2 - 1, y, 2, h);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 14, 0, Math.PI * 2); ctx.stroke();
  rect(ctx, '#fff', x + w / 2 - 1, y + h / 2 - 1, 2, 2);
  // Strafräume links/rechts
  const boxW = 22, boxH = h - 24;
  const boxY = y + 12;
  rect(ctx, '#fff', x, boxY, boxW, 2); rect(ctx, '#fff', x, boxY + boxH - 2, boxW, 2); rect(ctx, '#fff', x + boxW - 2, boxY, 2, boxH);
  rect(ctx, '#fff', x + w - boxW, boxY, boxW, 2); rect(ctx, '#fff', x + w - boxW, boxY + boxH - 2, boxW, 2); rect(ctx, '#fff', x + w - boxW, boxY, 2, boxH);
  // Tore
  rect(ctx, '#e8edf2', x - 4, y + h / 2 - 9, 4, 18);
  rect(ctx, '#e8edf2', x + w, y + h / 2 - 9, 4, 18);
}

function drawManhole(ctx, x, y, t) {
  // Gullydeckel
  rect(ctx, '#3a3a3a', x + 2, y + 10, 12, 5);
  rect(ctx, '#5a5a5a', x + 3, y + 10, 10, 4);
  for (let i = 0; i < 3; i++) rect(ctx, '#3a3a3a', x + 4 + i * 3, y + 11, 1, 2);
  rect(ctx, '#1a1a1a', x + 7, y + 11, 2, 2);
  // Person, über den Deckel gebeugt und lauschend
  rect(ctx, '#1b5e20', x, y + 4, 3, 5);       // Knie links
  rect(ctx, '#1b5e20', x + 11, y + 4, 3, 5);  // Knie rechts
  rect(ctx, '#2e9e3e', x + 3, y + 1, 8, 6);   // Rücken/Tunika, nach vorn gebeugt
  rect(ctx, '#f0c090', x + 4, y - 2, 6, 5);   // Kopf, nach unten geneigt
  rect(ctx, '#c0392b', x + 4, y - 3, 6, 2);   // Mütze
  if (Math.floor(t / 500) % 2) rect(ctx, '#ffe58a', x + 6, y + 9, 2, 1); // horcht ganz genau hin
}

function drawKoyer(ctx, x, y) {
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 13, 12, 3);
  rect(ctx, '#8d99a6', x + 2, y + 13, 12, 2); // Sockel
  rect(ctx, '#8a6a3a', x + 5, y + 2, 6, 8);   // bronzene Figur
  rect(ctx, '#8a6a3a', x + 7, y - 2, 2, 4);
  rect(ctx, '#6b5024', x + 3, y + 7, 10, 2);  // Spaten
  rect(ctx, '#b89a5a', x + 4, y, 8, 3);       // Kopf
}

function drawDecorHouse(ctx, d) {
  // Reine Kulisse zum Auffüllen leerer Flächen: kein Schild, kein Schloss.
  const x = d.x * TILE, y = d.y * TILE;
  const roof = ROOF[(d.variant + 3) % ROOF.length];
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 46, 46, 3);
  rect(ctx, roof, x, y + 2, 48, 22);
  for (let r = 0; r < 5; r++) rect(ctx, 'rgba(0,0,0,.18)', x, y + 7 + r * 4, 48, 1);
  rect(ctx, '#fff', x, y, 48, 4);
  rect(ctx, 'rgba(0,0,0,.25)', x, y + 22, 48, 2);
  rect(ctx, '#f1e3c3', x + 2, y + 24, 44, 24);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 44, 2);
  rect(ctx, '#8b5a2b', x + 2, y + 24, 2, 24);
  rect(ctx, '#8b5a2b', x + 44, y + 24, 2, 24);
  for (const wx of [x + 6, x + 32]) {
    rect(ctx, '#8b5a2b', wx - 1, y + 28, 12, 11);
    rect(ctx, '#ffe58a', wx, y + 29, 10, 9);
    rect(ctx, '#8b5a2b', wx + 4, y + 29, 1, 9);
    rect(ctx, '#8b5a2b', wx, y + 33, 10, 1);
  }
  rect(ctx, '#3d230e', x + 18, y + 31, 12, 17);
  rect(ctx, '#6b3f1d', x + 19, y + 32, 10, 16);
  rect(ctx, '#7d4c26', x + 20, y + 33, 3, 14);
  rect(ctx, '#ffd85a', x + 26, y + 41, 2, 2);
}

function drawGiftHouse(ctx, state, t) {
  const x = GIFT_HOUSE.x * TILE, y = GIFT_HOUSE.y * TILE;
  const open = giftUnlocked();
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 62, 76, 3);
  rect(ctx, '#b3202a', x, y + 2, 80, 28);
  for (let r = 0; r < 6; r++) rect(ctx, 'rgba(0,0,0,.18)', x, y + 8 + r * 4, 80, 1);
  rect(ctx, '#ffd85a', x + 36, y + 2, 8, 28); // Schleife
  rect(ctx, '#ffd85a', x, y + 14, 80, 6);
  rect(ctx, '#fff', x, y, 80, 4);
  rect(ctx, '#ffd85a', x + 28, y - 4, 10, 6);
  rect(ctx, '#ffd85a', x + 42, y - 4, 10, 6);
  rect(ctx, '#c9a63a', x + 38, y - 2, 4, 4);
  drawSign(ctx, x + 28, y + 15, 24, '24', state.gift);
  rect(ctx, '#f1e3c3', x + 2, y + 30, 76, 34);
  rect(ctx, '#8b5a2b', x + 2, y + 30, 76, 2);
  rect(ctx, '#8b5a2b', x + 2, y + 30, 2, 34);
  rect(ctx, '#8b5a2b', x + 76, y + 30, 2, 34);
  for (const wx of [x + 8, x + 58]) {
    rect(ctx, '#8b5a2b', wx - 1, y + 36, 14, 14);
    rect(ctx, open ? '#ffe58a' : '#2b3a55', wx, y + 37, 12, 12);
    rect(ctx, '#8b5a2b', wx + 5, y + 37, 2, 12);
    rect(ctx, '#8b5a2b', wx, y + 42, 12, 2);
  }
  rect(ctx, '#3d230e', x + 30, y + 40, 20, 24);
  rect(ctx, state.gift ? '#2a1a08' : '#6b3f1d', x + 32, y + 42, 16, 22);
  rect(ctx, '#3d230e', x + 39, y + 42, 2, 22);
  if (!state.gift) {
    rect(ctx, '#ffd85a', x + 37, y + 52, 2, 2);
    rect(ctx, '#ffd85a', x + 41, y + 52, 2, 2);
    if (!open) drawLock(ctx, x + 37, y + 44);
  } else if (Math.floor(t / 300) % 2) {
    rect(ctx, '#fff7a8', x + 36, y + 46, 8, 1);
  }
}

function drawEgg(ctx, o, t) {
  const x = o.tx * TILE, y = o.ty * TILE;
  rect(ctx, 'rgba(0,0,0,.2)', x + 2, y + 13, 12, 3);
  if (o.kind === 'grave') {
    rect(ctx, '#8d99a6', x + 3, y + 4, 10, 10);
    rect(ctx, '#8d99a6', x + 4, y + 2, 8, 2);
    rect(ctx, '#5f6b78', x + 7, y + 5, 2, 6);
    rect(ctx, '#5f6b78', x + 5, y + 7, 6, 2);
    rect(ctx, '#fff', x + 3, y + 4, 10, 1);
  } else if (o.kind === 'snowman') {
    rect(ctx, '#fff', x + 3, y + 8, 10, 7);
    rect(ctx, '#fff', x + 4, y + 3, 8, 7);
    rect(ctx, '#222', x + 6, y + 5, 1, 1); rect(ctx, '#222', x + 9, y + 5, 1, 1);
    rect(ctx, '#e8741c', x + 7, y + 6, 3, 1);
    rect(ctx, '#222', x + 4, y + 1, 8, 2); rect(ctx, '#222', x + 5, y - 2, 6, 3);
    rect(ctx, '#c0392b', x + 4, y + 9, 8, 1);
  } else if (o.kind === 'bush') {
    rect(ctx, '#2f7d32', x + 1, y + 6, 14, 9);
    rect(ctx, '#46a047', x + 3, y + 4, 10, 4);
    rect(ctx, '#fff', x + 3, y + 4, 10, 1);
    rect(ctx, '#e84c4c', x + 5, y + 9, 2, 2); rect(ctx, '#e84c4c', x + 10, y + 8, 2, 2);
    if (Math.floor(t / 600) % 4 === 0) rect(ctx, '#ffe58a', x + 7, y + 6, 2, 1); // zwei Augen blitzen auf
  } else if (o.kind === 'angler') {
    drawChar(ctx, x + 8, y + 15, 'left', 0, { tunic: '#1565c0', hat: '#c0392b', skin: '#f0c090', beard: true });
    rect(ctx, '#6b4423', x - 12, y + 2, 14, 1);
    rect(ctx, '#ddd', x - 12, y + 2, 1, 14 + Math.floor(t / 500) % 2);
  } else if (o.kind === 'koyer') {
    drawKoyer(ctx, x, y);
  } else if (o.kind === 'manhole') {
    drawManhole(ctx, x, y, t);
  }
}

// ---------- Szenen ----------
export function drawWorld(ctx, game, bg, t) {
  const { player: p, cam, world, state } = game;
  ctx.drawImage(bg, -cam.x, -cam.y);
  ctx.save();
  ctx.translate(-cam.x, -cam.y);

  drawSportsField(ctx);
  drawPlayground(ctx);
  for (const h of world.houses) drawHouse(ctx, h, state);
  for (const d of world.decor) drawDecorHouse(ctx, d);
  drawGiftHouse(ctx, state, t);
  drawSchool(ctx);
  drawKindergarten(ctx);

  const items = [];
  const x0 = Math.max(0, (cam.x / TILE | 0) - 1), x1 = Math.min(MAP_W - 1, ((cam.x + VIEW_W) / TILE | 0) + 1);
  const y0 = Math.max(0, (cam.y / TILE | 0) - 1), y1 = Math.min(MAP_H - 1, ((cam.y + VIEW_H) / TILE | 0) + 1);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (world.tiles[ty][tx] === T.TREE) items.push({ y: ty * TILE + TILE, draw: () => drawTree(ctx, tx * TILE, ty * TILE) });
  }
  for (const o of world.objects) items.push({ y: o.ty * TILE + TILE, draw: () => drawEgg(ctx, o, t) });
  items.push({ y: p.y, draw: () => drawChar(ctx, p.x, p.y, p.dir, p.moving ? [0, 1, 0, 3][Math.floor(t / 130) % 4] : 0, PLAYER_PAL) });
  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
  ctx.restore();
}

export function drawInterior(ctx, game, t) {
  const { player: p, house } = game;
  const ox = (VIEW_W - ROOM.w * TILE) / 2, oy = (VIEW_H - ROOM.h * TILE) / 2;
  rect(ctx, '#0b0e1e', 0, 0, VIEW_W, VIEW_H);
  ctx.save();
  ctx.translate(ox, oy);

  // Boden
  for (let y = 2; y < ROOM.h; y++) for (let x = 0; x < ROOM.w; x++) {
    rect(ctx, (x + y) % 2 ? '#b8854f' : '#a9773f', x * TILE, y * TILE, TILE, TILE);
    rect(ctx, 'rgba(0,0,0,.15)', x * TILE, y * TILE + TILE - 1, TILE, 1);
  }
  // Wand
  rect(ctx, '#7b4a2d', 0, 0, ROOM.w * TILE, 2 * TILE);
  for (let r = 0; r < 4; r++) for (let c = (r % 2) * 8; c < ROOM.w * TILE; c += 16) rect(ctx, 'rgba(0,0,0,.2)', c, r * 8, 15, 1);
  rect(ctx, '#4a2a14', 0, 2 * TILE - 3, ROOM.w * TILE, 3);
  rect(ctx, '#4a2a14', 0, 0, TILE, ROOM.h * TILE); rect(ctx, '#4a2a14', (ROOM.w - 1) * TILE, 0, TILE, ROOM.h * TILE);
  for (let x = 0; x < ROOM.w; x++) if (x !== ROOM.exit.x) rect(ctx, '#4a2a14', x * TILE, (ROOM.h - 1) * TILE, TILE, TILE);
  // Fenster
  rect(ctx, '#e8d8a8', 4 * TILE - 1, 5, 2 * TILE + 2, 22);
  rect(ctx, '#7fb6e8', 4 * TILE + 1, 7, 2 * TILE - 2, 18);
  rect(ctx, '#e8d8a8', 5 * TILE - 1, 7, 2, 18);
  rect(ctx, '#fff', 4 * TILE + 4, 10, 1, 1); rect(ctx, '#fff', 5 * TILE + 8, 16, 1, 1);
  // Kamin
  rect(ctx, '#6e6e78', 1 * TILE + 2, 6, 28, 26);
  rect(ctx, '#1b1008', 1 * TILE + 6, 14, 20, 18);
  const fl = Math.floor(t / 150) % 2;
  rect(ctx, '#f28c28', 1 * TILE + 9, 22 - fl * 2, 14, 10 + fl * 2);
  rect(ctx, '#ffd85a', 1 * TILE + 12, 26 - fl, 8, 6 + fl);
  // Bücherregal
  rect(ctx, '#5a3a14', 8 * TILE + 1, 4, 30, 28);
  for (let r = 0; r < 3; r++) {
    rect(ctx, '#3a240c', 8 * TILE + 2, 12 + r * 9, 28, 1);
    ['#c0392b', '#2e7d32', '#1565c0', '#d4a017'].forEach((c, i) => rect(ctx, c, 8 * TILE + 3 + i * 7, 6 + r * 9, 5, 6));
  }
  // Teppich
  rect(ctx, game.house.npc.pal.tunic, 3 * TILE, 3 * TILE, 5 * TILE, 3 * TILE);
  rect(ctx, 'rgba(255,255,255,.25)', 3 * TILE + 3, 3 * TILE + 3, 5 * TILE - 6, 3 * TILE - 6);
  rect(ctx, game.house.npc.pal.tunic, 3 * TILE + 5, 3 * TILE + 5, 5 * TILE - 10, 3 * TILE - 10);
  // Tür-Matte
  rect(ctx, '#3d230e', ROOM.exit.x * TILE, ROOM.exit.y * TILE, TILE, TILE);
  rect(ctx, '#d6e6f0', ROOM.exit.x * TILE + 2, ROOM.exit.y * TILE, TILE - 4, 3);

  const items = [];
  // Christbaum
  items.push({ y: 5 * TILE, draw: () => {
    const x = 9 * TILE, y = 3 * TILE;
    rect(ctx, '#6b4423', x + 6, y + 26, 4, 6);
    rect(ctx, '#1f6f2e', x + 1, y + 16, 14, 11);
    rect(ctx, '#27853a', x + 3, y + 8, 10, 10);
    rect(ctx, '#2f9a45', x + 5, y + 2, 6, 8);
    rect(ctx, '#ffd85a', x + 6, y - 2, 4, 4);
    [[4, 20, '#e84c4c'], [10, 22, '#f2c94c'], [7, 13, '#4cc3e8'], [9, 8, '#e84c4c'], [6, 17, '#f2c94c']].forEach(([dx, dy, c]) => rect(ctx, c, x + dx, y + dy, 2, 2));
  } });
  items.push({ y: ROOM.npc.y * TILE + TILE, draw: () => drawChar(ctx, ROOM.npc.x * TILE + 8, ROOM.npc.y * TILE + 15, 'down', 0, game.house.npc.pal) });
  items.push({ y: p.y, draw: () => drawChar(ctx, p.x, p.y, p.dir, p.moving ? [0, 1, 0, 3][Math.floor(t / 130) % 4] : 0, PLAYER_PAL) });
  items.sort((a, b) => a.y - b.y).forEach((i) => i.draw());
  ctx.restore();
}

// ---------- Schnee & Überblendung ----------
const flakes = Array.from({ length: 70 }, (_, i) => ({ x: (i * 37) % VIEW_W, y: (i * 53) % VIEW_H, v: 8 + (i % 5) * 4, d: i % 7 }));
export function drawSnow(ctx, dt) {
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const f of flakes) {
    f.y += f.v * dt; f.x += Math.sin(f.y / 14 + f.d) * 0.3;
    if (f.y > VIEW_H) { f.y = -2; f.x = (f.x * 7 + 31) % VIEW_W; }
    ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
  }
}

export function drawFade(ctx, a) {
  if (a <= 0) return;
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}
