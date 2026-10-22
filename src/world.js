import { DAYS } from './config.js';
import { EGGS } from './content.js';

export const MAP_W = 40;
export const MAP_H = 26;
export const T = { GRASS: 0, PATH: 1, TREE: 2, FLOWER: 3, WATER: 4 };

export const GIFT_HOUSE = { x: 17, y: 16, w: 5, h: 4, door: { x: 19, y: 19 } };

const grid = (v) => Array.from({ length: MAP_H }, () => Array(MAP_W).fill(v));

export function buildWorld() {
  const tiles = grid(T.GRASS);
  const solid = grid(false);
  const doors = new Map(); // "x,y" -> { type: 'house', day } | { type: 'gift' }

  const fill = (x0, y0, x1, y1, t) => {
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y][x] = t;
  };

  // Wege
  fill(1, 5, 38, 6, T.PATH);
  fill(1, 12, 38, 13, T.PATH);
  fill(1, 5, 1, 13, T.PATH);
  fill(38, 5, 38, 13, T.PATH);
  fill(1, 20, 38, 21, T.PATH);
  fill(2, 12, 3, 21, T.PATH);
  fill(36, 12, 37, 21, T.PATH);

  // Teich
  fill(6, 15, 11, 19, T.WATER);

  // Rand aus Bäumen
  for (let x = 0; x < MAP_W; x++) { tiles[0][x] = T.TREE; tiles[MAP_H - 1][x] = T.TREE; tiles[MAP_H - 2][x] = T.TREE; }
  for (let y = 0; y < MAP_H; y++) { tiles[y][0] = T.TREE; tiles[y][MAP_W - 1] = T.TREE; }
  for (const [x, y] of [[5, 23], [9, 22], [14, 23], [25, 22], [30, 23], [33, 22], [8, 8], [15, 8], [26, 8], [32, 8], [24, 15], [31, 18], [34, 16], [14, 16], [15, 18]]) {
    if (tiles[y][x] === T.GRASS) tiles[y][x] = T.TREE;
  }

  // Blumen, deterministisch gestreut
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 1; y < MAP_H - 2; y++) for (let x = 1; x < MAP_W - 1; x++) {
    if (tiles[y][x] === T.GRASS && rnd() < 0.07) tiles[y][x] = T.FLOWER;
  }

  // Häuser: Tag 1-12 obere Reihe, 13-23 untere Reihe
  const houses = [];
  for (let i = 0; i < DAYS; i++) {
    const top = i < 12;
    const x = 2 + 3 * (top ? i : i - 12);
    const y = top ? 2 : 9;
    houses.push({ day: i + 1, x, y });
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
      if (dx === 1 && dy === 2) { doors.set(`${x + 1},${y + 2}`, { type: 'house', day: i + 1 }); continue; }
      solid[y + dy][x + dx] = true;
    }
  }

  // Geschenkhaus
  for (let dy = 0; dy < GIFT_HOUSE.h; dy++) for (let dx = 0; dx < GIFT_HOUSE.w; dx++) {
    solid[GIFT_HOUSE.y + dy][GIFT_HOUSE.x + dx] = true;
  }
  solid[GIFT_HOUSE.door.y][GIFT_HOUSE.door.x] = false;
  doors.set(`${GIFT_HOUSE.door.x},${GIFT_HOUSE.door.y}`, { type: 'gift' });

  // Objekte (Easter Eggs) blockieren ihr Feld
  const objects = EGGS.map((e) => ({ ...e }));
  for (const o of objects) { tiles[o.ty][o.tx] = tiles[o.ty][o.tx] === T.PATH ? T.PATH : T.GRASS; solid[o.ty][o.tx] = true; }

  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    if (tiles[y][x] === T.TREE || tiles[y][x] === T.WATER) solid[y][x] = true;
  }

  return { tiles, solid, doors, houses, objects, spawn: { x: 20 * 16 + 8, y: 13 * 16 + 8 } };
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
