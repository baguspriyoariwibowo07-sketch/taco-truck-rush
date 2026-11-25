// Taco Truck: Sunset Rush — the shift itself: orders, the plate, serving,
// combos, rush hour and scoring. No drawing here; render.js reads this state.

import { SHIFT_LEN, MAX_TICKETS, RUSH_AT, BASE_PATIENCE, COMBO_BONUS } from './config.js';
import { RECIPES, RECIPE_BY_ID, serveValue } from './recipes.js';
import { sfx } from './audio.js';

let nextTicketId = 1;

export function newShift() {
  return {
    screen: 'title', // title | play | over
    time: 0,
    timeLeft: SHIFT_LEN,
    score: 0,
    coins: 0,
    served: 0,
    walkouts: 0,
    failedServes: 0,
    combo: 0,
    bestCombo: 0,
    tickets: [],
    selected: 0,
    plate: [], // ingredient ids on the assembly plate, in click order
    passDish: null, // recipe id of the last served plate, shown on the pass
    passT: 0,
    spawnT: 2, // first order arrives 2s in
    rush: false,
    rushAnnounced: false,
    message: '',
    messageT: 0,
    messageColor: '#ffc53d',
    floats: [], // {x, y, text, color, t}
    paused: false,
    grade: '',
    seed: 1,
  };
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function startShift(state, seed = 1) {
  const fresh = newShift();
  fresh.screen = 'play';
  fresh.seed = seed;
  Object.assign(state, fresh);
  state.rng = mulberry(seed * 7919 + 13);
  spawnTicket(state, true);
}

function spawnTicket(state, first = false) {
  if (state.tickets.length >= MAX_TICKETS) return;
  const rng = state.rng || Math.random;
  const recipe = RECIPES[Math.floor(rng() * RECIPES.length)];
  const maxPatience = state.rush ? BASE_PATIENCE * 0.66 : BASE_PATIENCE;
  state.tickets.push({
    id: nextTicketId++,
    recipeId: recipe.id,
    patience: maxPatience,
    maxPatience,
    born: state.time,
    fresh: true,
  });
  if (!first) sfx.tick();
  if (state.tickets.length === 1) state.selected = 0;
}

export function selectedTicket(state) {
  return state.tickets[state.selected] ?? null;
}

export function selectedRecipe(state) {
  const t = selectedTicket(state);
  return t ? RECIPE_BY_ID[t.recipeId] : null;
}

// How many of the plate's ingredients belong to the selected recipe.
export function plateProgress(state) {
  const recipe = selectedRecipe(state);
  if (!recipe) return { done: 0, total: 0, wrong: [] };
  const need = new Set(recipe.steps);
  const wrong = state.plate.filter((g) => !need.has(g));
  const done = new Set(state.plate.filter((g) => need.has(g))).size;
  return { done, total: recipe.steps.length, wrong };
}

export function plateMatches(state) {
  const recipe = selectedRecipe(state);
  if (!recipe || state.plate.length !== recipe.steps.length) return false;
  const plate = [...state.plate].sort().join(',');
  const want = [...recipe.steps].sort().join(',');
  return plate === want;
}

export function addIngredient(state, id) {
  if (state.screen !== 'play' || state.paused) return;
  const recipe = selectedRecipe(state);
  if (!recipe) return;
  if (state.plate.length >= 5) {
    flash(state, 'PLATE IS FULL — SERVE OR TRASH IT', '#e5484d');
    sfx.wrong();
    return;
  }
  state.plate.push(id);
  if (recipe.steps.includes(id)) sfx.add();
  else {
    sfx.wrong();
    flash(state, 'NOT IN THIS RECIPE', '#e5484d');
  }
}

export function trashPlate(state) {
  if (state.screen !== 'play' || state.paused || state.plate.length === 0) return;
  state.plate = [];
  sfx.click();
  flash(state, 'PLATE CLEARED', '#9ed67a');
}

export function servePlate(state) {
  if (state.screen !== 'play' || state.paused) return;
  const ticket = selectedTicket(state);
  if (!ticket) return;
  const recipe = RECIPE_BY_ID[ticket.recipeId];
  if (plateMatches(state)) {
    const value = serveValue(recipe, ticket.patience, ticket.maxPatience, state.combo);
    state.score += value;
    state.coins += value;
    state.served += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.passDish = recipe.id;
    state.passT = 3;
    state.floats.push({ x: 640, y: 220, text: `+${value}  ${recipe.name.toUpperCase()} SERVED!`, color: '#ffc53d', t: 1.6 });
    if (state.combo >= 3) {
      state.floats.push({ x: 640, y: 250, text: `COMBO x${state.combo}!`, color: '#ff9a5c', t: 1.6 });
    }
    state.tickets.splice(state.selected, 1);
    state.selected = Math.min(state.selected, Math.max(0, state.tickets.length - 1));
    state.plate = [];
    sfx.serve();
  } else {
    state.failedServes += 1;
    state.combo = 0;
    state.score = Math.max(0, state.score - 5);
    state.plate = [];
    flash(state, 'WRONG PLATE — CUSTOMER SENT IT BACK', '#e5484d');
    sfx.fail();
  }
}

function flash(state, text, color) {
  state.message = text;
  state.messageT = 2.2;
  state.messageColor = color;
}

function gradeFor(state) {
  if (state.served >= 14) return 'S';
  if (state.served >= 10) return 'A';
  if (state.served >= 7) return 'B';
  if (state.served >= 4) return 'C';
  return 'D';
}

export function endShift(state) {
  state.screen = 'over';
  state.timeLeft = 0;
  state.grade = gradeFor(state);
  state.tickets = [];
  state.plate = [];
}

export function update(state, dt) {
  if (state.screen !== 'play' || state.paused) return;
  state.time += dt;
  state.timeLeft = Math.max(0, SHIFT_LEN - state.time);

  // Rush hour: the last RUSH_AT seconds.
  if (!state.rush && state.timeLeft <= RUSH_AT) {
    state.rush = true;
    flash(state, 'RUSH HOUR! ORDERS COME FASTER', '#ff5a3c');
    sfx.rush();
  }

  // Spawn orders on a quickening schedule.
  state.spawnT -= dt;
  if (state.spawnT <= 0) {
    spawnTicket(state);
    const base = state.rush ? 6.5 : 13;
    state.spawnT = base + (state.rng ? state.rng() * 4 : Math.random() * 4);
  }

  // Patience drains; a starved ticket walks out.
  const drain = state.rush ? 1.5 : 1;
  for (let i = state.tickets.length - 1; i >= 0; i--) {
    const t = state.tickets[i];
    t.patience -= dt * drain;
    t.fresh = state.time - t.born < 3;
    if (t.patience <= 0) {
      const recipe = RECIPE_BY_ID[t.recipeId];
      state.tickets.splice(i, 1);
      state.walkouts += 1;
      state.combo = 0;
      state.score = Math.max(0, state.score - 10);
      flash(state, `${recipe.name.toUpperCase()} WALKED OUT!`, '#e5484d');
      sfx.walkout();
      if (state.selected >= state.tickets.length) state.selected = Math.max(0, state.tickets.length - 1);
    }
  }

  if (state.messageT > 0) state.messageT -= dt;
  if (state.passT > 0) state.passT -= dt;
  for (let i = state.floats.length - 1; i >= 0; i--) {
    state.floats[i].t -= dt;
    state.floats[i].y -= dt * 24;
    if (state.floats[i].t <= 0) state.floats.splice(i, 1);
  }

  if (state.timeLeft <= 0) endShift(state);
}

export { COMBO_BONUS };
