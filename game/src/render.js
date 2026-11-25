// Taco Truck: Sunset Rush — every pixel the player (and the judge) sees.
// One canvas, one logical size (1280x720). Ingredients are drawn from code,
// so the game ships no image files at all.

import { W, H, COLORS, LAYOUT, stationRect, ticketRect, fmtTime } from './config.js';
import { INGREDIENTS, INGREDIENT_BY_ID, RECIPES, RECIPE_BY_ID } from './recipes.js';
import { selectedTicket, selectedRecipe, plateProgress } from './world.js';
import { isMuted } from './audio.js';

// ---- ingredient art -------------------------------------------------------
// Each ingredient has one unmistakable drawn shape, so a ticket's dots, the
// station bins and the plate all read the same way at a glance.

export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'tortilla': {
      ctx.fillStyle = '#f2d492';
      ctx.strokeStyle = '#c9a45e';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d9b06a';
      for (const [dx, dy] of [[-0.4, -0.3], [0.35, -0.35], [0, 0.3], [0.45, 0.25], [-0.35, 0.4]]) {
        ctx.beginPath(); ctx.arc(dx * r, dy * r, r * 0.09, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'beef': {
      ctx.fillStyle = '#8a4b2d';
      for (const [dx, dy, rr] of [[-0.35, -0.2, 0.42], [0.3, -0.3, 0.38], [0, 0.25, 0.45], [0.4, 0.3, 0.3], [-0.3, 0.4, 0.3]]) {
        ctx.beginPath(); ctx.arc(dx * r, dy * r, rr * r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#5f3018';
      ctx.beginPath(); ctx.arc(-0.1 * r, -0.1 * r, r * 0.16, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'chicken': {
      ctx.fillStyle = '#e8a33d';
      ctx.strokeStyle = '#b57a1e';
      ctx.lineWidth = 2;
      for (const a of [-0.5, 0.15, 0.8]) {
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.roundRect(-r * 0.85, -r * 0.2, r * 1.7, r * 0.4, r * 0.2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      break;
    }
    case 'fish': {
      ctx.fillStyle = '#f4ede0';
      ctx.strokeStyle = '#c9b896';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#a8875a';
      ctx.lineWidth = 2;
      for (const dx of [-0.4, 0, 0.4]) {
        ctx.beginPath(); ctx.moveTo(dx * r, -r * 0.4); ctx.lineTo(dx * r, r * 0.4); ctx.stroke();
      }
      break;
    }
    case 'beans': {
      ctx.fillStyle = '#6e2f1d';
      for (const [dx, dy, a] of [[-0.35, -0.25, 0.4], [0.3, -0.3, -0.5], [-0.1, 0.3, 0.2], [0.4, 0.25, 0.9]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.34, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      break;
    }
    case 'rice': {
      ctx.fillStyle = '#fff8ea';
      ctx.strokeStyle = '#d9cba6';
      ctx.lineWidth = 1.5;
      for (const [dx, dy] of [[-0.45, -0.3], [0.1, -0.45], [0.5, -0.2], [-0.2, 0.05], [0.35, 0.2], [-0.5, 0.35], [0.05, 0.45]]) {
        ctx.beginPath(); ctx.ellipse(dx * r, dy * r, r * 0.2, r * 0.11, dx, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#fdf3d0';
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffb703';
      ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e09a00';
      ctx.beginPath(); ctx.arc(r * 0.1, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cheese': {
      ctx.strokeStyle = '#ffc53d';
      ctx.lineWidth = r * 0.16;
      ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [[-0.7, -0.4, 0.6, -0.6], [-0.6, 0, 0.7, -0.1], [-0.7, 0.45, 0.5, 0.35], [-0.2, -0.7, 0.3, 0.6]]) {
        ctx.beginPath(); ctx.moveTo(x1 * r, y1 * r); ctx.lineTo(x2 * r, y2 * r); ctx.stroke();
      }
      break;
    }
    case 'salsa': {
      ctx.fillStyle = '#d9382b';
      for (const [dx, dy, s] of [[-0.35, -0.3, 0.5], [0.3, -0.35, 0.45], [0, 0.1, 0.55], [0.4, 0.3, 0.4], [-0.4, 0.35, 0.42]]) {
        ctx.save();
        ctx.translate(dx * r, dy * r); ctx.rotate(dx);
        ctx.fillRect(-s * r / 2, -s * r / 2, s * r, s * r);
        ctx.restore();
      }
      ctx.fillStyle = '#3fae5a';
      ctx.beginPath(); ctx.arc(-0.1 * r, -0.45 * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(0.45 * r, 0.05 * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'slaw': {
      ctx.strokeStyle = '#9ed67a';
      ctx.lineWidth = r * 0.18;
      ctx.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [[-0.7, -0.5, 0.7, -0.3], [-0.7, 0, 0.6, 0.2], [-0.6, 0.5, 0.7, 0.35]]) {
        ctx.beginPath(); ctx.moveTo(x1 * r, y1 * r); ctx.lineTo(x2 * r, y2 * r); ctx.stroke();
      }
      ctx.strokeStyle = '#fff8ea';
      ctx.lineWidth = r * 0.14;
      for (const [x1, y1, x2, y2] of [[-0.5, -0.25, 0.5, -0.45], [-0.4, 0.25, 0.6, 0.05]]) {
        ctx.beginPath(); ctx.moveTo(x1 * r, y1 * r); ctx.lineTo(x2 * r, y2 * r); ctx.stroke();
      }
      break;
    }
    default:
      ctx.fillStyle = '#888';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function roundPanel(ctx, x, y, w, h, r, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function text(ctx, s, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function ingredientDots(ctx, steps, x, y, r, doneSet = null) {
  steps.forEach((id, i) => {
    const cx = x + i * (r * 2 + 8) + r;
    drawIngredient(ctx, id, cx, y, r);
    if (doneSet && doneSet.has(id)) {
      ctx.strokeStyle = COLORS.green;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, y, r + 4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = COLORS.green;
      ctx.beginPath(); ctx.arc(cx + r * 0.7, y + r * 0.7, r * 0.45, 0, Math.PI * 2); ctx.fill();
      text(ctx, '✓', cx + r * 0.7, y + r * 0.72, r * 0.7, '#fff', 'bold', 'center');
    }
  });
}

// ---- scene ----------------------------------------------------------------

export function render(ctx, state) {
  drawBackground(ctx);
  drawTopBar(ctx, state);
  drawBoard(ctx, state);
  drawMenu(ctx, state);
  drawAssembly(ctx, state);
  drawStations(ctx, state);
  drawPass(ctx, state);
  drawFloats(ctx, state);
  drawMessage(ctx, state);
  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawEnd(ctx, state);
  if (state.paused && state.screen === 'play') {
    ctx.fillStyle = 'rgba(20,12,6,0.6)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED', W / 2, H / 2 - 10, 54, '#fff', 'bold', 'center');
    text(ctx, 'Press P to keep cooking', W / 2, H / 2 + 40, 22, COLORS.cream, 'normal', 'center');
  }
}

function drawBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, COLORS.skyTop);
  g.addColorStop(0.45, COLORS.sky);
  g.addColorStop(1, '#e2703a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Awning stripes across the top of the truck.
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 ? '#fff3d6' : '#e5484d';
    ctx.fillRect(i * 80, 56, 80, 16);
  }
  // Counter surface.
  ctx.fillStyle = COLORS.counter;
  ctx.fillRect(0, 540, W, 16);
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(0, 556, W, 4);
  ctx.fillStyle = COLORS.wallDark;
  ctx.fillRect(0, 560, W, 160);
}

function drawTopBar(ctx, state) {
  const b = LAYOUT.topBar;
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(b.x, b.y, b.w, b.h);
  text(ctx, 'TACO TRUCK', 20, 20, 26, COLORS.gold, 'bold');
  text(ctx, 'SUNSET RUSH', 20, 44, 13, COLORS.cream, 'bold');
  text(ctx, `SCORE  ${state.score}`, 330, 28, 22, '#fff', 'bold');
  if (state.combo >= 2) {
    text(ctx, `COMBO x${state.combo}`, 520, 28, 22, '#ff9a5c', 'bold');
  }
  text(ctx, `SERVED ${state.served}`, 700, 28, 18, COLORS.cream, 'bold');
  // Timer: big digits plus a draining bar.
  const urgent = state.timeLeft <= 15 && state.screen === 'play';
  text(ctx, fmtTime(state.timeLeft), 1180, 24, 30, urgent ? '#ff6b5e' : '#fff', 'bold', 'right');
  const bw = 180;
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(1180 - bw, 42, bw, 8);
  ctx.fillStyle = urgent ? '#ff6b5e' : COLORS.green;
  ctx.fillRect(1180 - bw, 42, bw * (state.timeLeft / 150), 8);
  text(ctx, state.rush ? 'RUSH HOUR' : 'SHIFT', 1180 - bw - 12, 46, 13, urgent ? '#ff6b5e' : COLORS.cream, 'bold', 'right');
  if (isMuted()) text(ctx, 'MUTED (M)', 860, 28, 14, COLORS.muted, 'normal');
}

function drawBoard(ctx, state) {
  const b = LAYOUT.board;
  roundPanel(ctx, b.x, b.y, b.w, b.h, 12, COLORS.board, COLORS.boardEdge);
  text(ctx, 'ORDER BOARD', b.x + 14, b.y + 24, 18, COLORS.gold, 'bold');
  text(ctx, `${state.tickets.length}/${4} tickets`, b.x + b.w - 14, b.y + 24, 13, COLORS.cream, 'normal', 'right');
  if (state.tickets.length === 0 && state.screen === 'play') {
    text(ctx, 'No orders yet —', b.x + b.w / 2, b.y + 120, 16, COLORS.cream, 'normal', 'center');
    text(ctx, 'the lunch crowd is coming!', b.x + b.w / 2, b.y + 146, 16, COLORS.cream, 'normal', 'center');
  }
  state.tickets.forEach((t, i) => {
    const r = ticketRect(i);
    const recipe = RECIPE_BY_ID[t.recipeId];
    const sel = i === state.selected;
    roundPanel(ctx, r.x, r.y, r.w, r.h, 10, sel ? COLORS.ticketSel : COLORS.ticket, sel ? COLORS.gold : '#d9cba6');
    if (sel) {
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4, 12); ctx.stroke();
    }
    text(ctx, recipe.name, r.x + 12, r.y + 18, 17, COLORS.ink, 'bold');
    text(ctx, `$${recipe.price}`, r.x + r.w - 12, r.y + 18, 17, '#8a5a28', 'bold', 'right');
    ingredientDots(ctx, recipe.steps, r.x + 12, r.y + 48, 11);
    if (sel) text(ctx, 'COOKING', r.x + r.w - 12, r.y + 48, 11, '#b57a1e', 'bold', 'right');
    if (t.fresh) text(ctx, 'NEW', r.x + r.w - 12, r.y + 48, 11, COLORS.green, 'bold', 'right');
    // Patience bar.
    const frac = Math.max(0, t.patience / t.maxPatience);
    ctx.fillStyle = '#e5d9bd';
    ctx.fillRect(r.x + 12, r.y + 76, r.w - 24, 9);
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? '#ff9a3c' : COLORS.red;
    ctx.fillRect(r.x + 12, r.y + 76, (r.w - 24) * frac, 9);
  });
}

function drawMenu(ctx, state) {
  const m = LAYOUT.menu;
  roundPanel(ctx, m.x, m.y, m.w, m.h, 12, COLORS.board, COLORS.boardEdge);
  text(ctx, "TONIGHT'S MENU — 6 TACOS", m.x + 14, m.y + 24, 16, COLORS.gold, 'bold');
  RECIPES.forEach((r, i) => {
    const y = m.y + 52 + i * 68;
    const sel = selectedRecipe(state)?.id === r.id;
    if (sel) roundPanel(ctx, m.x + 8, y - 26, m.w - 16, 58, 8, '#3d2c1c', null);
    text(ctx, r.name, m.x + 14, y - 8, 16, sel ? COLORS.gold : '#fff', 'bold');
    text(ctx, `$${r.price}`, m.x + m.w - 14, y - 8, 15, COLORS.cream, 'bold', 'right');
    ingredientDots(ctx, r.steps, m.x + 14, y + 16, 10);
  });
}

function drawAssembly(ctx, state) {
  const p = LAYOUT.plate;
  const recipe = selectedRecipe(state);
  // Ghost steps: what the selected ticket still needs.
  if (recipe && state.screen === 'play') {
    text(ctx, `BUILDING: ${recipe.name.toUpperCase()}`, 640, 100, 18, '#fff', 'bold', 'center');
    const done = new Set(state.plate.filter((g) => recipe.steps.includes(g)));
    ingredientDots(ctx, recipe.steps, 640 - (recipe.steps.length * 38) / 2 - 6, 134, 15, done);
    const prog = plateProgress(state);
    text(ctx, `${prog.done}/${prog.total} ingredients on the plate`, 640, 164, 14, COLORS.cream, 'normal', 'center');
  }
  // The plate on the counter.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 78, p.r + 14, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8ea';
  ctx.strokeStyle = '#d9cba6';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 40, p.r, 52, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Taco shell + stacked layers, in click order.
  if (state.plate.length > 0) {
    ctx.fillStyle = '#f2d492';
    ctx.strokeStyle = '#c9a45e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 40, 62, Math.PI, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    state.plate.forEach((id, i) => {
      const y = p.y + 34 - i * 12;
      drawIngredient(ctx, id, p.x, y, 20);
    });
    const prog = plateProgress(state);
    if (prog.wrong.length > 0) {
      text(ctx, `✕ ${prog.wrong.map((g) => INGREDIENT_BY_ID[g].name).join(', ')} does not belong`, p.x, p.y + 108, 14, '#ff8a7a', 'bold', 'center');
    }
  } else if (state.screen === 'play') {
    text(ctx, 'Click ingredients below', p.x, p.y + 30, 16, COLORS.muted, 'normal', 'center');
    text(ctx, 'to build the ticket', p.x, p.y + 54, 16, COLORS.muted, 'normal', 'center');
  }
  // Serve bell.
  const bell = LAYOUT.bell;
  const ready = state.screen === 'play' && plateReady(state);
  ctx.fillStyle = ready ? COLORS.gold : '#8a7a5e';
  ctx.strokeStyle = '#5d3620';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(bell.x, bell.y, bell.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5d3620';
  ctx.beginPath(); ctx.arc(bell.x, bell.y - bell.r - 2, 8, 0, Math.PI * 2); ctx.fill();
  text(ctx, 'SERVE', bell.x, bell.y - 8, 15, '#5d3620', 'bold', 'center');
  text(ctx, 'SPACE', bell.x, bell.y + 14, 11, '#5d3620', 'bold', 'center');
  if (ready) {
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bell.x, bell.y, bell.r + 7, 0, Math.PI * 2); ctx.stroke();
  }
  // Trash can.
  const tr = LAYOUT.trash;
  ctx.fillStyle = '#6e6252';
  ctx.strokeStyle = '#4a3f30';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(tr.x - 24, tr.y - 26, 48, 52, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(tr.x - 28, tr.y - 32, 56, 10, 4); ctx.fill(); ctx.stroke();
  text(ctx, 'TRASH (T)', tr.x, tr.y + 44, 11, '#fff', 'bold', 'center');
  // Rush banner.
  if (state.rush && state.screen === 'play') {
    ctx.fillStyle = 'rgba(229,72,77,0.92)';
    ctx.beginPath(); ctx.roundRect(420, 184, 440, 34, 8); ctx.fill();
    text(ctx, 'RUSH HOUR — ORDERS COMING FAST', 640, 202, 17, '#fff', 'bold', 'center');
  }
}

function plateReady(state) {
  const recipe = selectedRecipe(state);
  if (!recipe) return false;
  return state.plate.length === recipe.steps.length &&
    [...state.plate].sort().join(',') === [...recipe.steps].sort().join(',');
}

function drawStations(ctx, state) {
  const recipe = selectedRecipe(state);
  const need = recipe ? new Set(recipe.steps) : new Set();
  INGREDIENTS.forEach((g, i) => {
    const r = stationRect(i);
    const inRecipe = need.has(g.id);
    roundPanel(ctx, r.x, r.y, r.w, r.h, 12, inRecipe ? '#fff3d6' : '#efe3c8', inRecipe ? COLORS.gold : '#c9b896');
    if (inRecipe) {
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, 10); ctx.stroke();
    }
    drawIngredient(ctx, g.id, r.x + r.w / 2, r.y + 52, 30);
    text(ctx, g.name, r.x + r.w / 2, r.y + 106, 16, COLORS.ink, 'bold', 'center');
    // Hotkey badge.
    ctx.fillStyle = COLORS.board;
    ctx.beginPath(); ctx.arc(r.x + r.w - 18, r.y + 18, 12, 0, Math.PI * 2); ctx.fill();
    text(ctx, g.key, r.x + r.w - 18, r.y + 19, 13, '#fff', 'bold', 'center');
    text(ctx, 'click or press ' + g.key, r.x + r.w / 2, r.y + 130, 11, COLORS.muted, 'normal', 'center');
  });
}

function drawPass(ctx, state) {
  const p = LAYOUT.pass;
  roundPanel(ctx, p.x, p.y, p.w, p.h, 12, '#3d2c1c', COLORS.boardEdge);
  if (state.passDish && state.passT > 0) {
    const r = RECIPE_BY_ID[state.passDish];
    drawIngredient(ctx, 'tortilla', p.x + 40, p.y + 36, 22);
    text(ctx, 'ON THE PASS:', p.x + 74, p.y + 18, 12, COLORS.gold, 'bold');
    text(ctx, r.name, p.x + 74, p.y + 38, 15, '#fff', 'bold');
    text(ctx, 'READY TO SERVE', p.x + 74, p.y + 58, 12, '#9ed67a', 'bold');
  } else {
    text(ctx, 'THE PASS — finished plates wait here', p.x + p.w / 2, p.y + 36, 14, COLORS.cream, 'normal', 'center');
  }
}

function drawFloats(ctx, state) {
  state.floats.forEach((f) => {
    ctx.globalAlpha = Math.min(1, f.t);
    text(ctx, f.text, f.x, f.y, 24, f.color, 'bold', 'center');
    ctx.globalAlpha = 1;
  });
}

function drawMessage(ctx, state) {
  if (!state.message || state.messageT <= 0) return;
  const m = LAYOUT.message;
  ctx.globalAlpha = Math.min(1, state.messageT);
  ctx.fillStyle = 'rgba(43,33,24,0.92)';
  ctx.beginPath(); ctx.roundRect(m.x, m.y, m.w, m.h, 10); ctx.fill();
  text(ctx, state.message, m.x + m.w / 2, m.y + 23, 17, state.messageColor, 'bold', 'center');
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, state) {
  // Solid backdrop: the title screen is a poster of its own, not a dimmed
  // game — nothing from the kitchen shows through to clutter it.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a1c0e');
  g.addColorStop(1, '#241610');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'TACO TRUCK', 640, 108, 72, COLORS.gold, 'bold', 'center');
  text(ctx, 'S U N S E T   R U S H', 640, 162, 26, '#fff', 'bold', 'center');
  // The truck.
  ctx.fillStyle = '#e5484d';
  ctx.beginPath(); ctx.roundRect(440, 205, 400, 120, 16); ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.beginPath(); ctx.roundRect(460, 225, 180, 70, 10); ctx.fill();
  ctx.fillStyle = '#2b2118';
  ctx.beginPath(); ctx.arc(520, 333, 26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(760, 333, 26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffc53d';
  ctx.fillRect(440, 205, 400, 18);
  text(ctx, 'Run the busiest taco truck on the strip. Six tacos, one rush hour,', 640, 392, 19, COLORS.cream, 'normal', 'center');
  text(ctx, 'zero walk-outs. Read the ticket, stack the ingredients, ring the bell.', 640, 420, 19, COLORS.cream, 'normal', 'center');
  // Menu preview, two columns.
  RECIPES.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 330 + col * 330;
    const y = 466 + row * 34;
    text(ctx, `${r.name}  $${r.price}`, x, y, 16, '#fff', 'bold');
    ingredientDots(ctx, r.steps, x + 190, y, 9);
  });
  text(ctx, 'CLICK OR PRESS ENTER TO START', 640, 592, 24, COLORS.gold, 'bold', 'center');
  text(ctx, 'Keys 1–0 add ingredients · Space serves · T trashes the plate · P pauses', 640, 626, 15, COLORS.cream, 'normal', 'center');
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(30,16,6,0.78)';
  ctx.fillRect(0, 0, W, H);
  roundPanel(ctx, 340, 90, 600, 500, 18, COLORS.paper, COLORS.gold);
  text(ctx, 'SHIFT COMPLETE!', 640, 140, 40, COLORS.ink, 'bold', 'center');
  text(ctx, `GRADE  ${state.grade}`, 640, 205, 52, state.grade === 'S' ? '#e09a00' : COLORS.ink, 'bold', 'center');
  const rows = [
    ['Tacos served', String(state.served)],
    ['Coins earned', `$${state.coins}`],
    ['Best combo', `x${state.bestCombo}`],
    ['Walk-outs', String(state.walkouts)],
    ['Wrong plates', String(state.failedServes)],
  ];
  rows.forEach(([k, v], i) => {
    const y = 280 + i * 44;
    text(ctx, k, 420, y, 20, COLORS.muted, 'normal');
    text(ctx, v, 860, y, 20, COLORS.ink, 'bold', 'right');
  });
  roundPanel(ctx, 390, 520, 500, 60, 12, COLORS.gold, '#b57a1e');
  text(ctx, 'PLAY AGAIN  (R)', 640, 551, 24, '#5d3620', 'bold', 'center');
}
