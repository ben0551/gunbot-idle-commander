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
| Anywhere | Click / tap tabs | Hangar · Battle · Medals · Skills |
| Battle | `DEPLOY` | Start the current sector |
| Battle | `1`–`5` | Arm Cryo / Incendiary / Cortex / Paralysis / Repair |
| Battle | tap an item, then tap an enemy | Deploy that item on it |
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
- **Medals (achievements)** — 29 permanent achievements across Combat, Bosses, Economy, Progress,
  Rebirth and Oddities: first blood, first loss, first rebirth, 100/1,000/10,000 kills, flawless
  wins, boss milestones, credit milestones, sector milestones, every chassis owned, every supply
  owned, 3-enemies-in-one-net, and so on. **Medals never reset** — not on rebirth, not on a new
  run. Locked medals show live progress bars (e.g. `347 / 1,000`), and unlocking one pops a banner.

- **Prestige (Scrap & Rebuild)** — once you reach **Lava tier (LV 150)** you can scrap the army.
  Credits, units, unit levels, XP, chassis tier, hero level and frontier reset to zero. Trophies,
  the whole skill tree, blueprints, supplies and salvage are kept. You bank **Salvage** based on
  the best tier and frontier the run reached, then spend it on seven permanent upgrades:

  | Upgrade | Effect | Ranks |
  |---|---|---|
  | Salvage Contracts | +20% credits, forever | 8 |
  | Field Manuals | +20% XP, forever | 8 |
  | War Doctrine | +15% unit/ace damage and HP | 8 |
  | War Chest | start each run with more credits | 6 |
  | Head Start | begin each run one tier higher | 4 |
  | Trophy Hunter | +1 trophy per boss | 5 |
  | Refinery | +15% salvage per rebirth | 6 |

  Measured with the headless bot: first run reaches Lava in ~155 min, the second run takes ~120 min
  on the same investment — and it compounds from there.

- **Field supplies** — bought with credits in the hangar, carried into any battle. Arm one, then
  tap the target:
  - **Cryo Grenade** (400 ₡) — freezes one enemy solid for 4.5 s: no movement, no attacks.
  - **Incendiary** (320 ₡) — target burns for 6 s at 5% max HP per second.
  - **Cortex Spike** (900 ₡) — target is mind-hacked for 6 s and attacks its own side.
  - **Paralysis Net** (600 ₡) — stuns up to 3 clustered enemies. Duration upgrades with credits
    (3.0 s → 7.8 s over 5 marks).
  - **Repair Kit** (300 ₡) — restores 45% HP to one of *your* units (or your ace in a boss fight).
  Boss battles spawn **escort minions** so there is something worth targeting; a hacked minion
  turns its guns on the boss, and a hacked boss shells its own escorts.
- **Boss loot** — every boss kill rolls drops, quality scaling with mini vs major: credit caches,
  +50% XP for 3 min, +50% damage for 3 min, free consumables, and **blueprints** that unlock a
  chassis up to two tiers early. Buffs show as chips under the top bar and count down in play time.

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
| Consumables (heal potion + paralysis net) | Done — Repair Kit and Paralysis Net (upgradeable duration) |
| Boss loot drops (credits / XP boost / damage buff / blueprint / item) | Done |
| Prestige — Scrap & Rebuild | Done — unlocks at Lava tier, pays Salvage, 7 permanent upgrades |
| Achievements | Done — 29 permanent medals, survive rebirth |

Nothing from the spec is outstanding. See `PRESTIGE-OPTIONS.md` for the alternatives not taken and
the mega-boss idea parked for every 2nd rebirth.

## Balance notes

Tested headlessly with `sim.js` (greedy auto-player, no skill purchases):

| Playtime | Tier | Sector | Trophies |
|---|---|---|---|
| 5 min | Iron | 16 | 9 |
| 30 min | Obsidian | 33 | 63 |
| 2 h | Amethyst | 36 | 191 |
| 4 h | Infinity | 51 | 373 |

Early game hooks in ~2 minutes; the full tier ladder takes a long session, which is the point.
