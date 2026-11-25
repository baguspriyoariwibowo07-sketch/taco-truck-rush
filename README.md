# Taco Truck: Sunset Rush

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/baguspriyoariwibowo07-sketch/taco-truck-rush/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/baguspriyoariwibowo07-sketch/taco-truck-rush/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

A timed order-fulfilment cooking game: run the busiest taco truck on the
strip. Tickets land on the order board, each with a patience bar. Read the
ticket, click the ingredient stations (or press 1–0) to stack the taco on
the assembly plate, and ring the SERVE bell (or press Space) before the
customer walks out.

- **6 recipes, 6 distinct chains** — Classic Beef, Baja Chicken, Crispy Fish,
  Veggie Fiesta, Sunrise Egg, and the five-layer Cali Burrito — across 10
  ingredient stations.
- **Combo & streak system** — consecutive clean serves build a combo that
  pays +5 coins a step; a wrong plate or a walk-out resets it.
- **Rush hour** — the last 40 seconds of the 150-second shift: orders arrive
  faster and patience drains 1.5x.
- **Original art & sound** — every ingredient is drawn in code and every
  sound is synthesised with WebAudio; no files are fetched over the network.

## Play it

Serve `game/` with any static server (for example `node serve.ts`) and open
`http://localhost:8080` in desktop Chrome. Keyboard: `1–0` add ingredients,
`Space` serves, `T` trashes the plate, `P` pauses, `M` mutes, `R` restarts.

## Layout

- `main.ts` — hand-in program: copies `game/` + `screenshots/` to the output
  directory and writes `dossier.json` with the vendored make.fun library.
- `game/index.html` + `game/src/` — the playable game, plain static files.
  `config.js` (layout & constants), `recipes.js` (ingredients & dishes),
  `world.js` (orders, plate, serving, combos, rush hour), `render.js`
  (all canvas drawing), `input.js` (mouse & keyboard), `audio.js`
  (synthesised sounds), `shots.js` (deterministic screenshot states),
  `main.js` (bootstrap & game loop).
- `screenshots/` — four real renders of the game's own code: cover
  (mid-assembly), title, rush hour, shift complete.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

Built as an entry for the [best cooking game](https://make.fun/c/best-cooking-game-20261125-0137)
competition on make.fun.
