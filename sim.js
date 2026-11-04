const { Game, FrontBattle, BossBattle, UNITS, TIERS } = require('./game.js');

function s0(h, s) { return h.x < s.x ? -170 : 170; }

function simPolicy(g) {
  let guard = 0;
  while (guard++ < 60) {
    const fielded = g.fieldedUnits().length;
    const unlocked = UNITS.filter(u => g.unitUnlocked(u.id));
    let best = null;
    for (const u of unlocked) {
      const c = g.buyCost(u.id);
      if (c <= g.state.money) { if (!best || u.cost > best.cost) best = u; }
    }
    if (best) { g.buy(best.id); continue; }
    let cand = null, bestTier = -1, bestCost = Infinity;
    for (const u of unlocked) {
      const st = g.state.units[u.id];
      if (st.count > 0 && st.level < 50) {
        const c = g.upgradeCost(u.id);
        if (c <= g.state.money) {
          if (u.tier > bestTier || (u.tier === bestTier && c < bestCost)) { bestTier = u.tier; cand = u; bestCost = c; }
        }
      }
    }
    if (cand) { g.upgrade(cand.id); continue; }
    if (g.state.heroLevel < 50 && g.heroCost() <= g.state.money) { g.buyHeroLevel(); continue; }
    break;
  }
}

function run(label, minutes, log) {
  const g = new Game();
  g.state.money = 40;
  let t = 0, wins = 0, losses = 0, bossTries = 0, bossWins = 0;
  let wantBoss = false, skipBoss = false;
  const dt = 1 / 20;
  let lastSec = -1;
  while (t < minutes * 60) {
    g.tick(dt); t += dt;
    const sec = Math.floor(t);
    if (sec !== lastSec && sec % 2 === 0) { lastSec = sec; simPolicy(g); }
    if (!g.battle) {
      if (g.state.pendingBoss && wantBoss && !skipBoss) {
        g.battle = new BossBattle(g, g.state.pendingBoss);
        g.battle.__boss = true; bossTries++;
      } else {
        g.battle = new FrontBattle(g, g.state.stage);
      }
    }
    if (g.battle.mode === 'boss') {
      const bb = g.battle, h = bb.hero, b = bb.boss;
      // crude bot: walk at the boss, swing, dodge slam circles
      const danger = bb.slams.find(s => !s.fired && Math.hypot(h.x - s.x, h.y - s.y) < s.r + 40);
      let tx = b.x, ty = b.y + b.r + 60;
      if (danger) { tx = h.x + (s0(h, danger)); ty = h.y + 160; }
      bb.input.left = tx < h.x - 20; bb.input.right = tx > h.x + 20;
      bb.input.up = ty < h.y - 20; bb.input.down = ty > h.y + 20;
      bb.input.attack = Math.random() < 0.5;
    }
    g.battle.update(dt);
    if (g.battle.over) {
      if (g.battle.__boss) { if (g.battle.win) bossWins++; else skipBoss = true; }
      else {
        if (g.battle.win) { wins++; wantBoss = !skipBoss; if (g.state.stage < g.state.battleNumber) g.state.stage++; }
        else { losses++; skipBoss = false; wantBoss = false; if (g.state.stage > 1) g.state.stage = Math.max(1, g.state.stage - 2); }
      }
      g.battle = null;
    }
  }
  const line = { stage: g.state.stage, frontier: g.state.battleNumber, lvl: g.state.level,
    tier: TIERS[g.state.tierIndex].name, wins, losses, bossTries, bossWins,
    money: Math.round(g.state.money), troph: g.state.trophies, mps: +g.idlePerSec().toFixed(1),
    fielded: g.fieldedUnits().length };
  console.log(label, JSON.stringify(line));
}

for (const [m, log] of [[2,0],[5,0],[15,0],[30,0],[60,0],[120,0],[240,0]]) run('after ' + m + 'min', m, log);
