import { DAYS } from './config.js';
import { EGGS } from './content.js';

// Grob nach Cäciliengroden (Ortsteil von Schortens, Friesland) nachempfunden:
// Seedeich zum Jadebusen am oberen Rand, Sportplatz + Grundschule oben links,
// eine Straßenschleife (eine lange Straße von unten bis zum Deich, zwei
// Querstraßen, rechts wieder verbunden) mit Häusern auf den Innenseiten,
// Dorfplatz mit Spielplatz und Geschenkhaus in der Mitte der Schleife.
export const MAP_W = 60;
export const MAP_H = 36;
export const T = { GRASS: 0, PATH: 1, TREE: 2, FLOWER: 3, WATER: 4, MARSH: 5, BOARDWALK: 6, DIKE: 7 };

export const SPORTS_FIELD = { x: 2, y: 5, w: 10, h: 6 };
export const SCHOOL = { x: 5, y: 12, w: 3, h: 3 }; // wie ein normales Haus
export const KINDERGARTEN = { x: 5, y: 16, w: 3, h: 3 }; // unterhalb der Schule
export const PLAYGROUND = { x: 24, y: 17, w: 5, h: 4 };
export const GIFT_HOUSE = { x: 35, y: 17, w: 5, h: 4, door: { x: 37, y: 21 } };
export const BOARDWALK_X = 26; // über dem zweiten Haus der oberen Reihe

// Straßenschleife: links eine lange Straße (vom unteren Rand bis zum Deich),
// zwei Querstraßen (höher/tiefer), rechts wieder verbunden. Häuser stehen auf
// den Innenseiten – zur Schleifenmitte hin.
const LV = 16, RV = 52, TH = 10, BH = 28;
const LEFT_YS = [6, 11, 15, 19, 23, 30];
const TOP_XS = [21, 25, 29, 33, 37, 41, 45];
const BOT_XS = [21, 25, 29, 33, 37, 41, 45];
const RIGHT_YS = [14, 18, 22];

// Feste Reihenfolge der Hausplätze (gleiche Reihenfolge wie beim Platzieren unten).
const SLOTS = [
  ...LEFT_YS.map((y) => ({ x: LV + 1, y })),
  ...TOP_XS.map((x) => ({ x, y: TH - 3 })),
  ...BOT_XS.map((x) => ({ x, y: BH - 3 })),
  ...RIGHT_YS.map((y) => ({ x: RV - 4, y })),
];
// Feste Durchmischung: Platz 0 bleibt Haus 1 (= Startpunkt), der Rest ist gemischt.
const DAY_ORDER = [1, 3, 14, 21, 2, 16, 6, 4, 18, 19, 22, 9, 13, 12, 5, 23, 10, 15, 8, 11, 20, 7, 17];
if (DAY_ORDER.length !== DAYS) console.warn(`DAY_ORDER hat ${DAY_ORDER.length} statt ${DAYS} Einträge`);

// Reine Dekohäuser (keine Tür, kein Tag) zum Auffüllen leerer Flächen am Rand der Karte.
const DECOR_HOUSES = [
  { x: 55, y: 6 }, { x: 55, y: 14 }, { x: 55, y: 22 }, { x: 55, y: 30 },
  { x: 22, y: 30 }, { x: 38, y: 30 }, { x: 46, y: 30 },
  { x: 9, y: 24 }, { x: 9, y: 29 },
];

const grid = (v) => Array.from({ length: MAP_H }, () => Array(MAP_W).fill(v));

export function buildWorld() {
  const tiles = grid(T.GRASS);
  const solid = grid(false);
  const doors = new Map(); // "x,y" -> { type: 'house', day } | { type: 'gift' }

  const fill = (x0, y0, x1, y1, t) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y][x] = t;
  };
  // Wege überschreiben immer (auch bereits gestreute Blumen), damit Straßen nicht unterbrochen wirken.
  const path = (x0, y0, x1, y1) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y][x] = T.PATH;
  };

  // Jadebusen (Bucht), Watt und Seedeich
  fill(0, 0, MAP_W - 1, 0, T.WATER);
  fill(0, 1, MAP_W - 1, 1, T.MARSH);
  fill(0, 2, MAP_W - 1, 2, T.DIKE);
  fill(0, 3, MAP_W - 1, 4, T.GRASS);

  // Bohlenweg durchs Watt
  for (let y = 0; y <= 4; y++) tiles[y][BOARDWALK_X] = T.BOARDWALK;

  // Rand aus Bäumen (West/Ost/Süd) – nach Norden schließt der Deich ab
  for (let y = 4; y < MAP_H; y++) { tiles[y][0] = T.TREE; tiles[y][MAP_W - 1] = T.TREE; }
  for (let x = 0; x < MAP_W; x++) { tiles[MAP_H - 1][x] = T.TREE; tiles[MAP_H - 2][x] = T.TREE; }

  // Blumen, deterministisch gestreut
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 5; y < MAP_H - 2; y++) for (let x = 1; x < MAP_W - 1; x++) {
    if (tiles[y][x] === T.GRASS && rnd() < 0.06) tiles[y][x] = T.FLOWER;
  }

  const houses = [];
  const placeHouse = (day, x, y) => {
    houses.push({ day, x, y });
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
      if (dx === 1 && dy === 2) { doors.set(`${x + 1},${y + 2}`, { type: 'house', day }); continue; }
      solid[y + dy][x + dx] = true;
    }
  };
  const solidBlock = (b) => {
    for (let dy = 0; dy < b.h; dy++) for (let dx = 0; dx < b.w; dx++) solid[b.y + dy][b.x + dx] = true;
  };

  // Straßenschleife
  path(LV, 5, LV, MAP_H - 3);
  path(LV, TH, RV, TH);
  path(LV, BH, RV, BH);
  path(RV, TH, RV, BH);

  SLOTS.forEach((slot, i) => placeHouse(DAY_ORDER[i], slot.x, slot.y));

  // Sportplatz, Grundschule (wie ein Haus)
  for (let dy = 0; dy < SPORTS_FIELD.h; dy++) for (let dx = 0; dx < SPORTS_FIELD.w; dx++) {
    tiles[SPORTS_FIELD.y + dy][SPORTS_FIELD.x + dx] = T.GRASS; // begehbar
  }
  solidBlock(SCHOOL);
  solidBlock(KINDERGARTEN);

  // Spielplatz, begehbar
  for (let dy = 0; dy < PLAYGROUND.h; dy++) for (let dx = 0; dx < PLAYGROUND.w; dx++) {
    tiles[PLAYGROUND.y + dy][PLAYGROUND.x + dx] = T.GRASS;
  }

  // Dekohäuser, nur Kulisse
  const decor = DECOR_HOUSES.map((d, i) => ({ x: d.x, y: d.y, variant: i % 4 }));
  for (const d of decor) solidBlock({ x: d.x, y: d.y, w: 3, h: 3 });

  // Dorfplatz vor dem Geschenkhaus
  path(GIFT_HOUSE.x - 2, GIFT_HOUSE.door.y, GIFT_HOUSE.x + GIFT_HOUSE.w + 1, GIFT_HOUSE.door.y + 1);

  // Geschenkhaus in der Mitte der Schleife
  for (let dy = 0; dy < GIFT_HOUSE.h; dy++) for (let dx = 0; dx < GIFT_HOUSE.w; dx++) {
    solid[GIFT_HOUSE.y + dy][GIFT_HOUSE.x + dx] = true;
  }
  solid[GIFT_HOUSE.door.y][GIFT_HOUSE.door.x] = false;
  doors.set(`${GIFT_HOUSE.door.x},${GIFT_HOUSE.door.y}`, { type: 'gift' });

  // Objekte (Easter Eggs) blockieren ihr Feld
  const objects = EGGS.map((e) => ({ ...e }));
  for (const o of objects) { tiles[o.ty][o.tx] = tiles[o.ty][o.tx] === T.PATH ? T.PATH : T.GRASS; solid[o.ty][o.tx] = true; }

  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    if (tiles[y][x] === T.TREE || tiles[y][x] === T.WATER || tiles[y][x] === T.MARSH) solid[y][x] = true;
  }
  // Bohlenweg bleibt trotz Watt begehbar
  for (let y = 0; y <= 4; y++) solid[y][BOARDWALK_X] = false;

  // Start direkt vor Haus 1
  return { tiles, solid, doors, houses, objects, decor, spawn: { x: 18 * 16 + 8, y: 10 * 16 + 8 } };
}

// Innenraum, für alle Häuser gleich
export const ROOM = {
  w: 11, h: 9,
  exit: { x: 5, y: 8 },
  spawn: { x: 5, y: 7 },
  npc: { x: 5, y: 3 },
  solid: (() => {
    const s = Array.from({ length: 9 }, () => Array(11).fill(false));
    for (let x = 0; x < 11; x++) { s[0][x] = s[1][x] = true; s[8][x] = x !== 5; }
    for (let y = 0; y < 9; y++) { s[y][0] = s[y][10] = true; }
    s[3][9] = s[4][9] = true; // Christbaum
    s[3][5] = true;           // NPC
    return s;
  })(),
};
