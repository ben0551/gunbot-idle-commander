# Gunbot Idle Commander

An idle / incremental mech army-battler that runs in one HTML page. Buy robots, level them,
send them into auto-resolving front-line battles, and take manual control of your ace pilot
when a boss shows up.

Original mech designs, drawn procedurally on canvas — no licensed assets, no backend, no build step.

## Run it

```bash
python3 -m http.server 8811     # then open http://localhost:8811
```

Or just open `index.html` directly — `file://` works, saves live in `localStorage`.

## Controls

| Where | Input | Action |
|---|---|---|
| Anywhere | Click / tap tabs | Hangar · Battle · Skills |
| Battle | `DEPLOY` | Start the current sector |
| Battle (hero manual) | `◀ ▶` / `A D` / on-screen d-pad | Move your ace |
| Battle (hero manual) | `Shift` / `K` / `B` | Block (75% damage reduction) |
| Battle (hero manual) | `Space` / `J` / `A` button | Force a swing |
| Boss battle | `WASD` / arrows / d-pad | Fly the ace |
| Boss battle | `Space` / `J` / `A` | Heavy strike (2.6× damage) |
| Boss battle | `Shift` / `K` / `B` | Block |
| Boss battle | — | The ace auto-swings in range; you just have to dodge |

## Systems

- **Economy** — passive income scales with every unit you own plus dedicated Foundry printers.
  Unit cost grows `baseCost × 1.15^owned`; upgrades go to level 50 per chassis.
- **XP / tiers** — ten chassis eras (Wood → Infinity) unlock at levels 5 / 10 / 20 / 35 / 50 /
  75 / 100 / 150 / 200. Each era multiplies every unit's stats.
- **Front battles** — side-on battlefield, three depth lanes. Squads march, engage, heal,
  lay mines, jam, buff, reflect. Front-view canvas drawn entirely in code.
- **Bosses** — a mini-boss queues every 5 wins, a major boss every 10. Top-down arena where you
  fly the ace around telegraphed volleys and slams. Boss HP scales off *your* squad's DPS, so a
  boss fight is always ~20 s (mini) / ~40 s (major) of dodging and striking.
- **Trophies** — boss-only currency. Spends on the skill tree (Economy / Combat / Technology /
  Hero branches) or on Auto Battle (100 ★), which chains sectors forever.
- **Manual hero** — toggle `MANUAL HERO` in a battle to steer the ace yourself.

## Files

```
index.html   screens, HUD, canvas hosts
style.css    all styling, mobile-first
game.js      pure engine: economy, tiers, front sim, boss sim (no DOM)
ui.js        DOM controller, canvas renderers, mech art, input
sim.js       headless balance harness  (`node sim.js`)
```

`game.js` has zero DOM references and exports its classes under `module.exports`, so `sim.js`
plays thousands of battles without a browser to sanity-check progression pacing.

## Phase status vs. the design spec

| Phase | Status |
|---|---|
| 1 — Idle (money, buying, upgrading, XP, tiers, save/load) | Done |
| 2 — Auto battle (front view, classes, waves, rewards) | Done |
| 3 — Boss system (mini/major, loot → trophies, pending-boss queue) | Done |
| 4 — Hero control (manual mode, A/B, mobile pad, top-down boss maps) | Done |
| 5 — Endgame (Infinity tier, trophy skill tree, auto battle) | Done |

Not built: prestige/reset loop, item drops as inventory objects (bosses pay trophies + credits +
XP instead), consumable heal potion / paralysis net, suicide-unit manual activation outside the
`DETONATE` button, and a per-run endless scaling curve.

## Balance notes

Tested headlessly with `sim.js` (greedy auto-player, no skill purchases):

| Playtime | Tier | Sector | Trophies |
|---|---|---|---|
| 5 min | Iron | 16 | 9 |
| 30 min | Obsidian | 33 | 63 |
| 2 h | Amethyst | 36 | 191 |
| 4 h | Infinity | 51 | 373 |

Early game hooks in ~2 minutes; the full tier ladder takes a long session, which is the point.
