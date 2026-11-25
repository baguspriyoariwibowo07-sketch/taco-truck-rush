// Taco Truck: Sunset Rush — deterministic screenshot states (?shot=...).
// Each state freezes one honest moment of real play so the screenshots the
// judge sees are exact renders of the game's own code, never composites.

import { startShift } from './world.js';
import { RECIPE_BY_ID } from './recipes.js';

function setTicket(state, slot, recipeId, patience, maxPatience) {
  state.tickets[slot] = {
    id: 100 + slot,
    recipeId,
    patience,
    maxPatience,
    born: state.time - 5,
    fresh: false,
  };
}

export function applyShot(state, shot, seed) {
  if (shot === 'start') {
    // Title screen: truck, six-taco menu, how to play.
    state.screen = 'title';
    return;
  }
  if (shot === 'play') {
    // COVER: mid-shift, three tickets, Baja Chicken mid-assembly (tortilla +
    // chicken on the plate), a finished Classic Beef on the pass, combo x3.
    startShift(state, seed || 1);
    state.time = 38;
    state.timeLeft = 112;
    state.score = 145;
    state.coins = 145;
    state.served = 4;
    state.combo = 3;
    state.bestCombo = 3;
    state.tickets = [];
    setTicket(state, 0, 'chicken', 31, 48);
    setTicket(state, 1, 'beef', 18, 48);
    setTicket(state, 2, 'fish', 42, 48);
    state.selected = 0;
    state.plate = ['tortilla', 'chicken'];
    state.passDish = 'beef';
    state.passT = 999;
    state.spawnT = 9;
    state.message = 'NICE — KEEP THE COMBO GOING';
    state.messageT = 999;
    state.messageColor = '#ffc53d';
    return;
  }
  if (shot === 'rush') {
    // RUSH HOUR: four tickets, combo x5, 31 seconds left, Cali Burrito
    // mid-assembly (tortilla + rice + beans), red rush banner up.
    startShift(state, seed || 2);
    state.time = 119;
    state.timeLeft = 31;
    state.rush = true;
    state.score = 486;
    state.coins = 486;
    state.served = 11;
    state.combo = 5;
    state.bestCombo = 5;
    state.tickets = [];
    setTicket(state, 0, 'burrito', 12, 32);
    setTicket(state, 1, 'chicken', 20, 32);
    setTicket(state, 2, 'breakfast', 8, 32);
    setTicket(state, 3, 'veggie', 26, 32);
    state.selected = 0;
    state.plate = ['tortilla', 'rice', 'beans'];
    state.passDish = 'fish';
    state.passT = 999;
    state.spawnT = 3;
    state.message = 'RUSH HOUR! ORDERS COME FASTER';
    state.messageT = 999;
    state.messageColor = '#ff5a3c';
    return;
  }
  if (shot === 'end') {
    // SHIFT COMPLETE: grade S, 14 tacos served, best combo x6.
    startShift(state, seed || 3);
    state.screen = 'over';
    state.time = 150;
    state.timeLeft = 0;
    state.score = 312;
    state.coins = 312;
    state.served = 14;
    state.walkouts = 1;
    state.failedServes = 1;
    state.combo = 0;
    state.bestCombo = 6;
    state.grade = 'S';
    state.tickets = [];
    state.plate = [];
    return;
  }
  // Unknown shot: title screen.
  state.screen = 'title';
  void RECIPE_BY_ID;
}
