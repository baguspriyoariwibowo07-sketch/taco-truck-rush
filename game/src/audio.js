// Taco Truck: Sunset Rush — all sounds are synthesised with WebAudio.
// No audio files ship with the game; every blip is an oscillator, so the
// game stays silent until the player first clicks (browsers demand a gesture).

let audioCtx = null;
let muted = false;

export function ensureAudio() {
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}
export function isMuted() {
  return muted;
}

function tone(freq, dur, type = 'sine', vol = 0.12, when = 0) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  add() {
    tone(520, 0.07, 'triangle', 0.1);
    tone(780, 0.06, 'triangle', 0.08, 0.04);
  },
  wrong() {
    tone(160, 0.18, 'sawtooth', 0.08);
  },
  serve() {
    // Happy little arpeggio when a plate goes out.
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, 'triangle', 0.11, i * 0.07));
  },
  fail() {
    tone(220, 0.15, 'square', 0.07);
    tone(147, 0.25, 'square', 0.07, 0.12);
  },
  walkout() {
    tone(330, 0.12, 'square', 0.06);
    tone(262, 0.12, 'square', 0.06, 0.1);
    tone(196, 0.22, 'square', 0.06, 0.2);
  },
  tick() {
    tone(880, 0.05, 'square', 0.05);
  },
  rush() {
    // The rush-hour horn: two rising notes.
    tone(392, 0.16, 'triangle', 0.12);
    tone(587, 0.22, 'triangle', 0.12, 0.14);
  },
  click() {
    tone(660, 0.05, 'triangle', 0.07);
  },
};
