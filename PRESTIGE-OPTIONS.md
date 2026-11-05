# Prestige — three options

"Prestige" is the idle-game idea that at some point you deliberately give something up in exchange
for a permanent boost, so the next run is faster than the last. The original design doc only said
"prestige balancing" without describing one, so here are three genuinely different versions.

The question to answer is really: **what is the player willing to lose?**

---

## Option 1 — Frontline Rotation (soft, lose nothing)

**What happens**
At any time the player presses "Rotate to the rear". Their frontier (the sector they're pushing)
resets to Sector 1. They **keep everything** — units, money, tier, skill tree, trophies.

**What they earn**
Each sector they clear again while rotating gives permanently stacking **Veterancy**: +2% credits
and XP per sector cleared, added to a multiplier that never goes away.

**Why it's fun**
It's a "prestige" with no punishment. You blast back through sectors 1–40 in a couple of minutes
because your army is already strong, banking a big multiplier, then hit your old wall again with
more money coming in.

**What it costs to build**
Low. A rotation button, a veterancy counter, a multiplier in the reward formula.

**Risk**
Careful with the numbers or it's free money — needs diminishing returns (e.g. each rotation pays
half as much as the last) or the multiplier gets silly after twenty rotations.

**Feels like:** "I'm not losing anything, I'm just doing laps."

---

## Option 2 — Scrap and Rebuild (classic hard prestige)

**What happens**
The player hits "Scrap the army". **Everything resets**: credits, units, unit levels, XP, tier,
frontier, hero level. They keep trophies, the skill tree, and unlocked blueprints.

**What they earn**
**Salvage**, based on the best sector they reached and the highest tier they unlocked. Salvage is a
new currency spent in a prestige shop on permanent upgrades:
- +10% credits forever
- +10% XP forever
- start each run with credits / a free unit / one tier already unlocked
- +1 trophy per boss

**Why it's fun**
This is the loop every big idle game uses. Run 2 is visibly faster than run 1 because you start
with multipliers and unlocks, so you push past where you stalled and earn even more Salvage. It
gives the game a long, repeating arc instead of one straight line.

**What it costs to build**
Medium. Reset logic, a Salvage formula with a preview ("you'll earn 240 Salvage"), and a second
upgrade shop.

**Risk**
The first scrap always feels bad. It needs a loud confirmation screen with the exact numbers, and
the first Salvage purchase should be obviously strong so the player *feels* the payoff immediately.
Kids in particular need to see the gain before losing the army.

**Feels like:** "I lost my army but the next run is twice as fast."

---

## Option 3 — No prestige (the skill tree is already the endgame)

**What happens**
Nothing resets, ever. Players keep pushing sectors and tiers forever, and trophies (the currency
that already exists) are the only permanent progression, spent on the four-branch skill tree.

**Why it's fine**
It's the honest reading of the spec: "spend trophies on permanent upgrades" *is* the prestige
system. No loss aversion to design around, nothing to explain, no confirmation screens.

**What it costs to build**
Zero — it's what's in the game today.

**Risk**
The game has a ceiling. Once every tier is unlocked and the skill tree is maxed, there's nothing
left to chase except a bigger sector number, and players who like progression stop opening it.
Mitigation without a reset: keep adding tiers/skills, or make sectors scale forever with a
leaderboard-style "best frontier".

**Feels like:** "Numbers go up, and that's the whole game."

---

## Recommendation

If the goal is a game the kids keep coming back to for weeks: **Option 2**, with Option 1's
rotational bonus layered on top later if the grind stalls. Option 2 is the only one with a real
long-term curve, and it's the one that makes the trophy tree and blueprints feel like they matter
across runs.

If the goal is "a complete, finished thing I can hand over": **Option 3** is already done, and
shipping a prestige you don't believe in is worse than not having one.

Option 1 is a good middle ground if the stakeholder hates the idea of losing the army but still
wants the "reset" ritual.

---

## What each option needs from the design doc (to pick)

1. Is losing the army acceptable, or is it a dealbreaker?
2. How long should one full run last before the player is expected to reset — 30 minutes, hours, days?
3. Should prestige currency buy power (credits/XP multipliers) or convenience (auto-battle, faster
   speed, start with a tier unlocked)?
4. Does the game need to be replayable for months, or is "finished the tiers" a satisfying ending?
