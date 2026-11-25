// Taco Truck: Sunset Rush — bootstrap: canvas scaling, the game loop and
// the ?shot= states the screenshots are taken from. The loop freezes while a
// shot is staged, so a screenshot is one exact frame of real play.

import { W, H } from './config.js';
import { newShift, startShift, update } from './world.js';
import { render } from './render.js';
import { applyShot } from './shots.js';
import { attachInput } from './input.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

const state = newShift();
let shotMode = null;

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.width = Math.round(W * scale * dpr);
  canvas.height = Math.round(H * scale * dpr);
  canvas.style.width = `${Math.round(W * scale)}px`;
  canvas.style.height = `${Math.round(H * scale)}px`;
  ctx.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
}

function toLogical(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * W,
    y: ((clientY - rect.top) / rect.height) * H,
  };
}

attachInput(canvas, state, toLogical);
window.addEventListener('resize', fitCanvas);
fitCanvas();

// A ?shot= URL stages one frozen moment for screenshots; without it the game
// opens on the title screen and plays normally.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = Number(params.get('seed') || '1') || 1;
if (shot) {
  shotMode = shot;
  applyShot(state, shot, seed);
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (state._startRequested) {
    state._startRequested = false;
    startShift(state, (Math.random() * 1e9) | 0);
  }
  if (!shotMode) update(state, dt);
  render(ctx, state);
  if (statusEl) {
    statusEl.textContent =
      state.screen === 'title'
        ? 'Taco Truck: Sunset Rush. Press Enter or click to start.'
        : state.screen === 'over'
          ? `Shift complete. Grade ${state.grade}. ${state.served} tacos served, $${state.coins} earned.`
          : `Score ${state.score}. ${state.timeLeft | 0} seconds left. ${state.tickets.length} orders on the board.`;
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
