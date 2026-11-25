// Taco Truck: Sunset Rush — mouse and keyboard input.
// Clicks are hit-tested against the same layout rects render.js draws, so a
// button is exactly where it looks. Keys 1-0 pick ingredients, Space serves.

import { LAYOUT, stationRect, ticketRect } from './config.js';
import { INGREDIENTS } from './recipes.js';
import { addIngredient, servePlate, trashPlate, selectedTicket } from './world.js';
import { ensureAudio, toggleMute } from './audio.js';

function pointIn(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
function circleHit(px, py, c) {
  const dx = px - c.x;
  const dy = py - c.y;
  return dx * dx + dy * dy <= c.r * c.r;
}

export function attachInput(canvas, state, toLogical) {
  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio();
    const p = toLogical(e.clientX, e.clientY);
    handleClick(state, p.x, p.y);
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (state.screen === 'title') {
      if (key === 'enter' || key === ' ') {
        ensureAudio();
        state._startRequested = true;
      }
      return;
    }
    if (state.screen === 'over') {
      if (key === 'r') state._startRequested = true;
      return;
    }
    if (key === 'p' || key === 'escape') {
      state.paused = !state.paused;
      return;
    }
    if (state.paused) return;
    if (key === 'm') {
      toggleMute();
      return;
    }
    if (key === ' ') {
      e.preventDefault();
      servePlate(state);
      return;
    }
    if (key === 't' || key === 'backspace' || key === 'delete') {
      trashPlate(state);
      return;
    }
    const ing = INGREDIENTS.find((g) => g.key === key);
    if (ing) addIngredient(state, ing.id);
  });
}

function handleClick(state, x, y) {
  if (state.screen === 'title') {
    state._startRequested = true;
    return;
  }
  if (state.screen === 'over') {
    // Clicking the "play again" panel restarts.
    if (x > 390 && x < 890 && y > 520 && y < 580) state._startRequested = true;
    return;
  }
  if (state.paused) {
    state.paused = false;
    return;
  }

  // Order tickets: click one to cook for it.
  for (let i = 0; i < state.tickets.length; i++) {
    if (pointIn(x, y, ticketRect(i))) {
      if (state.selected !== i) {
        state.selected = i;
        state.plate = [];
      }
      return;
    }
  }

  // Serve bell and trash can.
  if (circleHit(x, y, LAYOUT.bell)) {
    servePlate(state);
    return;
  }
  if (circleHit(x, y, LAYOUT.trash)) {
    trashPlate(state);
    return;
  }

  // Ingredient stations along the counter.
  for (let i = 0; i < INGREDIENTS.length; i++) {
    if (pointIn(x, y, stationRect(i))) {
      addIngredient(state, INGREDIENTS[i].id);
      return;
    }
  }

  void selectedTicket;
}
