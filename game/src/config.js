// Taco Truck: Sunset Rush — shared constants and layout.
// One logical canvas of 1280x720, scaled to the window; every panel, bin and
// button below is placed from these numbers so input and render always agree.

export const W = 1280;
export const H = 720;

export const SHIFT_LEN = 150; // seconds per shift
export const MAX_TICKETS = 4;
export const RUSH_AT = 40; // last 40 seconds are rush hour
export const BASE_PATIENCE = 48; // seconds a customer waits (32 in rush)
export const COMBO_BONUS = 5; // coins per combo step on a serve

export const COLORS = {
  sky: '#ff9a5c',
  skyTop: '#ffb347',
  wall: '#7a4a2b',
  wallDark: '#5d3620',
  counter: '#c98d4b',
  counterEdge: '#8a5a28',
  board: '#2b2118',
  boardEdge: '#5a4632',
  ticket: '#fff6e0',
  ticketSel: '#ffe9a8',
  paper: '#fff8e7',
  ink: '#2b2118',
  muted: '#7a6a55',
  red: '#e5484d',
  green: '#3fae5a',
  gold: '#ffc53d',
  cream: '#fff3d6',
};

export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 16, y: 72, w: 280, h: 468 },
  menu: { x: 980, y: 72, w: 284, h: 468 },
  plate: { x: 640, y: 330, r: 108 },
  bell: { x: 892, y: 300, r: 46 },
  trash: { x: 892, y: 424, r: 34 },
  pass: { x: 980, y: 468, w: 284, h: 72 }, // the pass shelf under the menu
  stations: { x: 16, y: 556, w: 1248, h: 148, count: 10, gap: 4 },
  message: { x: 312, y: 478, w: 652, h: 44 },
};

// Station rectangles, left to right across the counter.
export function stationRect(i) {
  const s = LAYOUT.stations;
  const bw = (s.w - s.gap * (s.count - 1)) / s.count;
  return { x: s.x + i * (bw + s.gap), y: s.y, w: bw, h: s.h };
}

// Ticket rectangles inside the order board, top to bottom.
export function ticketRect(i) {
  const b = LAYOUT.board;
  return { x: b.x + 10, y: b.y + 46 + i * 106, w: b.w - 20, h: 96 };
}

export function fmtTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}
