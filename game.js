'use strict';
/* ===========================================================
   GUNBOT IDLE COMMANDER — pure game engine (no DOM)
   =========================================================== */

const TIERS = [
  { name: 'Wood',     xpReq: 0,   body: '#b98a52', trim: '#f0d0a0', glow: '#ffe0a8' },
  { name: 'Stone',    xpReq: 5,   body: '#9aa4ae', trim: '#e2ebf4', glow: '#eef6ff' },
  { name: 'Iron',     xpReq: 10,  body: '#6f8bac', trim: '#c2dcf7', glow: '#d0e8ff' },
  { name: 'Gold',     xpReq: 20,  body: '#d3a52c', trim: '#ffe07a', glow: '#fff0b0' },
  { name: 'Diamond',  xpReq: 35,  body: '#43a4c2', trim: '#bff4ff', glow: '#e0fbff' },
  { name: 'Obsidian', xpReq: 50,  body: '#4e4580', trim: '#a89aff', glow: '#cfc2ff' },
  { name: 'Amethyst', xpReq: 75,  body: '#7d4bb8', trim: '#e0bbff', glow: '#f2dcff' },
  { name: 'Emerald',  xpReq: 100, body: '#339a63', trim: '#9dffcb', glow: '#d8ffe9' },
  { name: 'Lava',     xpReq: 150, body: '#b8431c', trim: '#ffb27a', glow: '#ffd0a0' },
  { name: 'Infinity', xpReq: 200, body: '#a1208a', trim: '#ffa8f0', glow: '#ffd8f8' },
];

const UNITS = [
  { id:'recruit',   name:'Recruit',   tier:0, cost:15,     role:'melee',  base:{hp:80,  atk:10, def:4,  spd:36, range:46,  aspd:1.00}, desc:'Wood-frame grunt. Cheap, disposable, surprisingly scrappy.' },
  { id:'sentinel',  name:'Sentinel',  tier:1, cost:140,    role:'melee',  base:{hp:170, atk:22, def:12, spd:32, range:46,  aspd:1.05}, desc:'Stone-plated line mech. Holds a flank.' },
  { id:'striker',   name:'Striker',   tier:2, cost:700,    role:'melee',  base:{hp:110, atk:34, def:5,  spd:46, range:44,  aspd:0.58}, desc:'ATTACK CLASS — fast blades, faster swings.' },
  { id:'bulwark',   name:'Bulwark',   tier:2, cost:900,    role:'tank',   base:{hp:340, atk:16, def:28, spd:26, range:46,  aspd:1.30}, desc:'DEFENCE CLASS — heavy shield, blocks the front rank.' },
  { id:'lancer',    name:'Lancer',    tier:2, cost:1500,   role:'ranged', base:{hp:90,  atk:52, def:6,  spd:30, range:340, aspd:1.90}, desc:'CANNON CLASS — long range, paper armour.' },
  { id:'medic',     name:'Medic',     tier:3, cost:3000,   role:'healer', base:{hp:130, atk:6,  def:8,  spd:34, range:130, aspd:1.60}, desc:'SUPPORT — patches up nearby allies.' },
  { id:'herald',    name:'Herald',    tier:3, cost:4600,   role:'buffer', base:{hp:180, atk:8,  def:10, spd:34, range:120, aspd:2.20}, desc:'SUPPORT — aura buffs allied attack.' },
  { id:'trapper',   name:'Trapper',   tier:4, cost:8000,   role:'trapper',base:{hp:160, atk:26, def:10, spd:33, range:200, aspd:2.40}, desc:'INTEL — seeds mines ahead of the line.' },
  { id:'recon',     name:'Recon',     tier:4, cost:12000,  role:'melee',  base:{hp:130, atk:38, def:8,  spd:54, range:48,  aspd:0.55}, desc:'INTEL — dodges 25% of incoming hits, jumps attacks.' },
  { id:'archmedic', name:'Archmedic', tier:6, cost:20000,  role:'healer', base:{hp:230, atk:8,  def:14, spd:34, range:160, aspd:0.95}, desc:'ADVANCED SUPPORT — heals twice as often, hits harder.' },
  { id:'jammer',    name:'Jammer',    tier:6, cost:30000,  role:'debuff', base:{hp:200, atk:10, def:14, spd:34, range:180, aspd:2.00}, desc:'DEBUFF — slows enemies and cuts their attack.' },
  { id:'barricade', name:'Barricade', tier:6, cost:42000,  role:'tank',   base:{hp:440, atk:14, def:32, spd:24, range:60,  aspd:1.60}, desc:'TRAP PATH B — deploys barrier traps that stall the wave.' },
  { id:'detonator', name:'Detonator', tier:7, cost:70000,  role:'suicide',base:{hp:90,  atk:0,  def:4,  spd:52, range:40,  aspd:99},   desc:'SUICIDE — manual trigger only. Walks in and detonates.' },
  { id:'foundry',   name:'Foundry',   tier:7, cost:100000, role:'income', base:{hp:240, atk:0,  def:12, spd:20, range:0,   aspd:99},   desc:'INCOME — prints money every second. Killable in battle.' },
  { id:'bastion',   name:'Bastion',   tier:8, cost:180000, role:'reflect',base:{hp:400, atk:26, def:36, spd:28, range:50,  aspd:1.20}, desc:'REFLECTION DEFENDER — returns 35% of melee damage taken.' },
];
const UNIT_BY_ID = {};
UNITS.forEach(u => { UNIT_BY_ID[u.id] = u; });
UNITS.sort((a,b) => a.tier - b.tier || a.cost - b.cost);

const SKILLS = [
  { id:'eco1', branch:'Economy',  name:'War Bonds',        cost:2, max:6, desc:'+20% money from battles per rank' },
  { id:'eco2', branch:'Economy',  name:'Supply Lines',     cost:3, max:6, desc:'+25% passive income per rank' },
  { id:'eco3', branch:'Economy',  name:'Bulk Contracts',   cost:4, max:5, desc:'-4% unit purchase cost per rank' },
  { id:'com1', branch:'Combat',   name:'Targeting Uplink', cost:2, max:8, desc:'+12% attack for all units per rank' },
  { id:'com2', branch:'Combat',   name:'Servo Tuning',     cost:3, max:6, desc:'+7% attack speed per rank' },
  { id:'com3', branch:'Combat',   name:'Reinforced Plate', cost:3, max:8, desc:'+15% unit HP per rank' },
  { id:'tec1', branch:'Technology',name:'Retrofit Program',cost:3, max:8, desc:'-5% unit upgrade cost per rank' },
  { id:'tec2', branch:'Technology',name:'Field Data',      cost:2, max:8, desc:'+18% XP from battles per rank' },
  { id:'tec3', branch:'Technology',name:'Reactor Overclock',cost:5, max:5, desc:'+6% tier bonus on all units per rank' },
  { id:'her1', branch:'Hero',     name:'Ace Pilot',        cost:2, max:8, desc:'+15% hero attack per rank' },
  { id:'her2', branch:'Hero',     name:'Reinforced Frame', cost:2, max:8, desc:'+15% hero HP per rank' },
  { id:'her3', branch:'Hero',     name:'Perfect Guard',    cost:4, max:3, desc:'Blocks stop +20% more damage, reflect 15% while blocking' },
];
const SKILL_BY_ID = {};
SKILLS.forEach(s => { SKILL_BY_ID[s.id] = s; });

const ITEMS = [
  { id:'freeze',   name:'Cryo Grenade',  cost:400, dur:4.5, target:'enemy', color:'#7fe3ff', icon:'❄',
    desc:'Freezes a target solid — no movement, no attacks.' },
  { id:'fire',     name:'Incendiary',    cost:320, dur:6,   target:'enemy', color:'#ff9a52', icon:'✹',
    desc:'Sets a target burning — 5% max HP per second.' },
  { id:'insanity', name:'Cortex Spike',  cost:900, dur:6,   target:'enemy', color:'#c07bff', icon:'◉',
    desc:'Mind-hacks a target — it attacks its own side.' },
  { id:'net',      name:'Paralysis Net', cost:600, dur:3,   target:'enemy', color:'#8fe3b0', icon:'▣',
    upCost:700, baseDur:3, durPerLevel:1.2, maxLevel:5, splash:140, maxTargets:3,
    desc:'Stuns up to 3 clustered enemies. Duration upgrades with credits.' },
  { id:'heal',     name:'Repair Kit',    cost:300, dur:0,   target:'ally',  color:'#7bffb6', icon:'✚',
    healPct:0.45, desc:'Restores 45% HP to one of your own units.' },
];
const SALVAGE_UPGRADES = [
  { id:'credits', name:'Salvage Contracts', max:8, base:8,  growth:1.8, desc:'+20% credits from battles, idle income and loot, forever.' },
  { id:'xp',      name:'Field Manuals',     max:8, base:8,  growth:1.8, desc:'+20% XP from every battle, forever.' },
  { id:'start',   name:'War Chest',         max:6, base:10, growth:2.0, desc:'Start each run with a bigger credit balance.' },
  { id:'tier',    name:'Head Start',        max:4, base:40, growth:3.0, desc:'Begin each run one chassis tier higher.' },
  { id:'trophy',  name:'Trophy Hunter',     max:5, base:25, growth:2.2, desc:'+1 trophy from every boss kill.' },
  { id:'salvage', name:'Refinery',          max:6, base:30, growth:1.9, desc:'+15% salvage on every rebirth.' },
  { id:'power',   name:'War Doctrine',      max:8, base:18, growth:1.95, desc:'+15% damage and HP for every unit and your ace, forever.' },
];
const SALVAGE_BY_ID = {};
SALVAGE_UPGRADES.forEach(s => { SALVAGE_BY_ID[s.id] = s; });
const PRESTIGE_TIER = 8;   // Lava — the earliest tier you may rebirth from

const ITEM_BY_ID = {};
ITEMS.forEach(i => { ITEM_BY_ID[i.id] = i; });

const SAVE_KEY = 'gunbot-idle-v1';
const FIELD_CAP = 9;
const AUTOBATTLE_COST = 100;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function fmt(n) {
  n = Math.floor(n);
  if (n < 1000) return String(n);
  const units = ['K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
  let i = -1, x = n;
  while (x >= 1000 && i < units.length - 1) { x /= 1000; i++; }
  return (x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : x.toFixed(0)) + units[i];
}
function fmt1(n) {
  if (n < 100) return (Math.round(n * 10) / 10).toString();
  return fmt(n);
}

/* XP curve: cumulative XP to reach level L */
function xpForLevel(L) {
  if (L <= 1) return 0;
  return Math.floor(5.1 * Math.pow(L, 2.35));
}
function levelFromXp(xp) {
  let L = 1;
  while (L < 400 && xpForLevel(L + 1) <= xp) L++;
  return L;
}

/* ===========================================================
   Game
   =========================================================== */
class Game {
  constructor() {
    this.state = null;
    this.logs = [];
    this.listeners = [];
    this.battle = null;
    this.offlineGain = 0;
    this.heroMove = 0;
    this.reset(true);
    const loaded = this.load();
    if (!loaded) this.log('Welcome, Commander. Your hangar is empty — buy a Recruit.', 'sys');
  }

  on(fn) { this.listeners.push(fn); }
  emit() { this.listeners.forEach(fn => fn()); }

  reset(silent) {
    this.state = {
      money: 40,
      xp: 0,
      level: 1,
      trophies: 0,
      wins: 0,
      totalBattles: 0,
      battleNumber: 1,
      stage: 1,
      tierIndex: 0,
      units: {},
      heroLevel: 1,
      skills: {},
      autoBattle: false,
      autoBattleOwned: false,
      pendingBoss: null,
      bossesKilled: 0,
      speed: 1,
      lastTick: Date.now(),
      seenTiers: 1,
      items: { freeze: 0, fire: 0, insanity: 0, net: 0, heal: 0 },
      itemLevels: { net: 1 },
      buffs: { xp: 0, atk: 0 },
      blueprints: {},
      lastDrops: [],
      salvage: 0,
      prestiges: 0,
      salvageUpgrades: {},
      runTier: 0,
      runFrontier: 1,
    };
    UNITS.forEach(u => { this.state.units[u.id] = { count: 0, level: 1 }; });
    this.battle = null;
    if (!silent) { this.save(); this.emit(); }
  }

  /* ---------- persistence ---------- */
  save() {
    this.state.lastTick = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(this.state)); } catch (e) {}
  }
  load() {
    let raw;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
    if (!raw) return false;
    try {
      const s = JSON.parse(raw);
      const base = {
        money: 40, xp: 0, level: 1, trophies: 0, wins: 0, totalBattles: 0,
        battleNumber: 1, stage: 1, tierIndex: 0, units: {}, heroLevel: 1,
        skills: {}, autoBattle: false, autoBattleOwned: false, pendingBoss: null,
        bossesKilled: 0, speed: 1, lastTick: Date.now(), seenTiers: 1,
        items: { freeze: 0, fire: 0, insanity: 0, net: 0, heal: 0 },
        itemLevels: { net: 1 }, buffs: { xp: 0, atk: 0 }, blueprints: {}, lastDrops: [],
        salvage: 0, prestiges: 0, salvageUpgrades: {}, runTier: 0, runFrontier: 1,
      };
      this.state = Object.assign(base, s);
      this.state.speed = 1;
      UNITS.forEach(u => {
        if (!this.state.units[u.id]) this.state.units[u.id] = { count: 0, level: 1 };
      });
      this.state.items = Object.assign({ freeze: 0, fire: 0, insanity: 0, net: 0, heal: 0 }, s.items || {});
      this.state.itemLevels = Object.assign({ net: 1 }, s.itemLevels || {});
      this.state.buffs = Object.assign({ xp: 0, atk: 0 }, s.buffs || {});
      this.state.blueprints = s.blueprints || {};
      this.state.salvageUpgrades = s.salvageUpgrades || {};
      this.state.runTier = s.runTier === undefined ? this.state.tierIndex : s.runTier;
      this.state.runFrontier = s.runFrontier === undefined ? this.state.battleNumber : s.runFrontier;
      // offline income
      const elapsed = clamp((Date.now() - (s.lastTick || Date.now())) / 1000, 0, 8 * 3600);
      const gain = this.idlePerSec() * elapsed * 0.6;
      this.offlineGain = gain;
      if (gain > 1) {
        this.state.money += gain;
        setTimeout(() => this.log('Offline for ' + Math.round(elapsed / 60) + ' min — collected ' + fmt(gain) + ' credits.', 'good'), 400);
      }
      this.state.lastTick = Date.now();
      return true;
    } catch (e) { return false; }
  }

  log(msg, type) {
    this.logs.push({ msg, type: type || 'sys', t: Date.now() });
    if (this.logs.length > 200) this.logs.shift();
  }

  /* ---------- derived ---------- */
  skill(id) { return this.state.skills[id] || 0; }
  atkBuff() { return (this.state.buffs && this.state.buffs.atk > 0) ? 1.5 : 1; }
  xpBuff() { return (this.state.buffs && this.state.buffs.xp > 0) ? 1.5 : 1; }

  /* ---------- salvage (prestige) ---------- */
  salvageUpg(id) { return (this.state.salvageUpgrades && this.state.salvageUpgrades[id]) || 0; }
  creditsMult() { return 1 + 0.20 * this.salvageUpg('credits'); }
  powerMult() { return 1 + 0.15 * this.salvageUpg('power'); }
  salvageXpMult() { return 1 + 0.20 * this.salvageUpg('xp'); }
  salvageCost(id) {
    const def = SALVAGE_BY_ID[id];
    if (!def) return 0;
    const lv = this.salvageUpg(id);
    if (lv >= def.max) return 0;
    return Math.floor(def.base * Math.pow(def.growth, lv));
  }
  buySalvage(id) {
    const def = SALVAGE_BY_ID[id];
    if (!def) return false;
    const lv = this.salvageUpg(id);
    if (lv >= def.max) return false;
    const c = this.salvageCost(id);
    if (this.state.salvage < c) return false;
    this.state.salvage -= c;
    this.state.salvageUpgrades[id] = lv + 1;
    this.log('Salvage spent: ' + def.name + ' MK' + (lv + 1) + '.', 'tier');
    this.save(); this.emit();
    return true;
  }
  canPrestige() { return this.state.tierIndex >= PRESTIGE_TIER; }
  salvageGain() {
    const tier = Math.max(PRESTIGE_TIER, this.state.runTier || 0);
    const front = Math.max(1, this.state.runFrontier || 1);
    const raw = Math.pow(tier + 1, 2) * 3 + Math.pow(front, 1.3) / 4;
    return Math.floor(raw * (1 + 0.15 * this.salvageUpg('salvage')));
  }

  prestige() {
    if (!this.canPrestige()) return 0;
    const gain = this.salvageGain();
    const kept = {
      trophies: this.state.trophies,
      skills: this.state.skills,
      blueprints: this.state.blueprints,
      items: this.state.items,
      itemLevels: this.state.itemLevels,
      salvage: this.state.salvage + gain,
      salvageUpgrades: this.state.salvageUpgrades,
      prestiges: this.state.prestiges + 1,
      autoBattleOwned: this.state.autoBattleOwned,
      bossesKilled: this.state.bossesKilled,
    };
    const hs = this.salvageUpg('tier');
    const chest = this.salvageUpg('start');

    this.reset(true);
    Object.assign(this.state, kept);
    this.state.tierIndex = Math.min(9, hs);
    this.state.seenTiers = this.state.tierIndex + 1;
    this.state.runTier = this.state.tierIndex;
    this.state.runFrontier = 1;
    this.state.money = chest > 0 ? Math.floor(500 * Math.pow(3, chest - 1)) : 40;
    this.state.buffs = { xp: 0, atk: 0 };
    this.state.stage = 1;
    this.state.battleNumber = 1;
    this.state.pendingBoss = null;
    this.state.lastDrops = [];
    this.battle = null;

    this.log('ARMY SCRAPPED. Rebirth #' + this.state.prestiges + ' — banked ' + gain + ' salvage.', 'tier');
    if (hs > 0) this.log('Head Start: beginning at ' + TIERS[this.state.tierIndex].name + ' tier.', 'good');
    if (chest > 0) this.log('War Chest: starting with ' + fmt(this.state.money) + ' credits.', 'good');
    this.save(); this.emit();
    return gain;
  }
  itemDuration(id) {
    const d = ITEM_BY_ID[id];
    if (!d) return 0;
    if (!d.upCost) return d.dur;
    const lv = this.state.itemLevels[id] || 1;
    return d.baseDur + (lv - 1) * d.durPerLevel;
  }
  itemUpgradeCost(id) {
    const d = ITEM_BY_ID[id];
    if (!d || !d.upCost) return 0;
    const lv = this.state.itemLevels[id] || 1;
    if (lv >= d.maxLevel) return 0;
    return Math.floor(d.upCost * Math.pow(2, lv - 1));
  }

  tier() { return TIERS[this.state.tierIndex]; }
  nextTier() {
    const n = TIERS[this.state.tierIndex + 1];
    return n || null;
  }

  checkLevelUp() {
    const L = levelFromXp(this.state.xp);
    if (L !== this.state.level) {
      const before = this.state.level;
      this.state.level = L;
      if (L > before) this.log('Level up! Now level ' + L + '.', 'good');
      // tier unlock
      let ti = this.state.tierIndex;
      while (ti + 1 < TIERS.length && TIERS[ti + 1].xpReq <= L) ti++;
      if (ti > this.state.tierIndex) {
        this.state.tierIndex = ti;
        this.state.seenTiers = ti + 1;
        this.state.runTier = Math.max(this.state.runTier || 0, ti);
        this.log('TIER UNLOCKED — ' + TIERS[ti].name + '. New chassis available in the hangar.', 'tier');
      }
    }
  }

  tierBonus() {
    const s = this.skill('tec3');
    return Math.pow(1.14, this.state.tierIndex) * (1 + 0.06 * s);
  }
  levelMult(level) { return 1 + 0.09 * (level - 1); }

  unitStats(id) {
    const u = UNIT_BY_ID[id];
    const st = this.state.units[id];
    const lm = this.levelMult(st.level);
    const tb = this.tierBonus();
    return {
      hp: u.base.hp * lm * tb * (1 + 0.15 * this.skill('com3')) * this.powerMult(),
      atk: u.base.atk * lm * tb * (1 + 0.12 * this.skill('com1')) * this.atkBuff() * this.powerMult(),
      def: u.base.def * lm * tb * this.powerMult(),
      spd: u.base.spd,
      range: u.base.range,
      aspd: u.base.aspd / (1 + 0.07 * this.skill('com2')),
      role: u.role,
    };
  }

  heroStats() {
    const lm = 1 + 0.12 * (this.state.heroLevel - 1);
    const tb = this.tierBonus();
    return {
      hp: 300 * lm * tb * (1 + 0.15 * this.skill('her2')) * this.powerMult(),
      atk: 26 * lm * tb * (1 + 0.15 * this.skill('her1')) * this.atkBuff() * this.powerMult(),
      def: 10 * lm * tb * this.powerMult(),
      spd: 60,
      range: 62,
      aspd: 0.55,
      role: 'hero',
    };
  }

  heroCost() {
    return Math.floor(120 * Math.pow(1.22, this.state.heroLevel - 1));
  }

  buyCost(id) {
    const u = UNIT_BY_ID[id];
    const owned = this.state.units[id].count;
    return Math.floor(u.cost * Math.pow(1.15, owned) * (1 - 0.04 * this.skill('eco3')));
  }
  upgradeCost(id) {
    const u = UNIT_BY_ID[id];
    const lv = this.state.units[id].level;
    return Math.floor(u.cost * 1.6 * Math.pow(1.17, lv - 1) * (1 - 0.05 * this.skill('tec1')));
  }

  unitUnlocked(id) {
    return UNIT_BY_ID[id].tier <= this.state.tierIndex || !!(this.state.blueprints && this.state.blueprints[id]);
  }
  totalOwned() {
    return UNITS.reduce((a, u) => a + this.state.units[u.id].count, 0);
  }

  idlePerSec() {
    let base = 0.5 + this.state.wins * 0.06;
    UNITS.forEach(u => {
      const st = this.state.units[u.id];
      if (!st.count) return;
      const tierW = 1 + u.tier * 0.25;
      base += u.cost * 0.0025 * st.count * tierW * (1 + 0.05 * (st.level - 1));
    });
    // foundry: dedicated money printer, linear in level
    const f = this.state.units.foundry;
    if (f.count) base += 60 * f.count * (1 + 0.55 * (f.level - 1));
    return base * (1 + 0.25 * this.skill('eco2')) * this.creditsMult();
  }

  /* ---------- actions ---------- */
  buy(id) {
    const c = this.buyCost(id);
    if (!this.unitUnlocked(id)) return false;
    if (this.state.money < c) return false;
    this.state.money -= c;
    this.state.units[id].count++;
    this.log('Purchased ' + UNIT_BY_ID[id].name + ' (' + this.state.units[id].count + ' owned).', 'good');
    this.emit();
    return true;
  }
  buyHeroLevel() {
    const c = this.heroCost();
    if (this.state.money < c) return false;
    if (this.state.heroLevel >= 50) return false;
    this.state.money -= c;
    this.state.heroLevel++;
    if (this.state.heroLevel % 5 === 0) this.log('Hero frame evolved — MK' + Math.floor(this.state.heroLevel / 5) + ' chassis online.', 'tier');
    this.emit();
    return true;
  }
  upgrade(id) {
    const st = this.state.units[id];
    if (st.level >= 50 || st.count === 0) return false;
    const c = this.upgradeCost(id);
    if (this.state.money < c) return false;
    this.state.money -= c;
    st.level++;
    this.emit();
    return true;
  }
  buySkill(id) {
    const def = SKILL_BY_ID[id];
    const lvl = this.skill(id);
    if (lvl >= def.max) return false;
    if (this.state.trophies < def.cost) return false;
    this.state.trophies -= def.cost;
    this.state.skills[id] = lvl + 1;
    this.log('Skill rank up: ' + def.name + ' [' + (lvl + 1) + '/' + def.max + ']', 'tier');
    this.emit();
    return true;
  }
  buyItem(id) {
    const def = ITEM_BY_ID[id];
    if (!def || this.state.money < def.cost) return false;
    this.state.money -= def.cost;
    this.state.items[id] = (this.state.items[id] || 0) + 1;
    this.log('Bought ' + def.name + ' (×' + this.state.items[id] + ').', 'good');
    this.emit();
    return true;
  }

  upgradeItem(id) {
    const def = ITEM_BY_ID[id];
    if (!def || !def.upCost) return false;
    const lv = this.state.itemLevels[id] || 1;
    if (lv >= def.maxLevel) return false;
    const c = this.itemUpgradeCost(id);
    if (this.state.money < c) return false;
    this.state.money -= c;
    this.state.itemLevels[id] = lv + 1;
    this.log(def.name + ' upgraded to Mk' + (lv + 1) + ' — stun lasts ' + this.itemDuration(id).toFixed(1) + 's.', 'tier');
    this.emit();
    return true;
  }

  tryUseItem(id, target) {
    const def = ITEM_BY_ID[id];
    const b = this.battle;
    if (!def || !b || b.over) return false;
    if ((this.state.items[id] || 0) <= 0) { this.log('No ' + def.name + ' left — buy more in the hangar.', 'bad'); this.emit(); return false; }
    if (!b.applyItem(id, target)) return false;
    this.state.items[id]--;
    this.log(def.name + ' fired — ' + def.desc.split(' —')[0] + '.', 'good');
    this.save();
    this.emit();
    return true;
  }

  buyAutoBattle() {
    if (this.state.autoBattleOwned) return false;
    if (this.state.trophies < AUTOBATTLE_COST) return false;
    this.state.trophies -= AUTOBATTLE_COST;
    this.state.autoBattleOwned = true;
    this.state.autoBattle = true;
    this.log('AUTO BATTLE installed. The war runs itself now.', 'tier');
    this.emit();
    return true;
  }

  /* units actually fielded, strongest first */
  fieldedUnits() {
    const list = [];
    const supportRoles = { healer: 1, buffer: 1, debuff: 1, trapper: 1 };
    const scored = UNITS
      .filter(u => this.state.units[u.id].count > 0 && u.role !== 'income')
      .map(u => {
        let p = (u.base.hp * 0.10 + u.base.atk * 1.7 + u.base.def * 0.7) * (1 + u.tier * 0.18);
        if (supportRoles[u.role]) p *= 2.2;
        return { u, p };
      })
      .sort((a, b) => b.p - a.p);
    // detonators earn reserved slots — they exist to be triggered by hand
    const det = this.state.units.detonator;
    if (det.count > 0) {
      for (let i = 0; i < Math.min(det.count, 2); i++) list.push({ id: 'detonator', stats: this.unitStats('detonator') });
    }
    for (const { u } of scored) {
      if (u.role === 'suicide') continue;
      const st = this.state.units[u.id];
      const n = Math.min(st.count, FIELD_CAP - list.length);
      for (let i = 0; i < n; i++) list.push({ id: u.id, stats: this.unitStats(u.id) });
      if (list.length >= FIELD_CAP) break;
    }
    return list;
  }

  /* ---------- battle lifecycle ---------- */
  startBattle() {
    this.battle = new FrontBattle(this, this.state.stage);
    this.log('Deploying to sector ' + this.state.stage + '.', 'sys');
    this.emit();
    return this.battle;
  }
  startBoss() {
    const kind = this.state.pendingBoss || (this.state.wins > 0 && this.state.wins % 10 === 0 ? 'major' : 'mini');
    this.battle = new BossBattle(this, kind);
    this.log((kind === 'major' ? 'MAJOR BOSS' : 'MINI BOSS') + ' engagement — take the controls.', 'tier');
    this.emit();
    return this.battle;
  }

  battleRewards(stage, isBoss, kind) {
    const moneyMul = (1 + 0.2 * this.skill('eco1')) * (isBoss ? (kind === 'major' ? 9 : 4.5) : 1);
    const xpMul = (1 + 0.18 * this.skill('tec2')) * (isBoss ? (kind === 'major' ? 8 : 4) : 1);
    return {
      money: Math.floor(30 * Math.pow(1.13, stage - 1) * moneyMul * this.creditsMult()),
      xp: Math.floor(11 * Math.pow(1.16, stage - 1) * xpMul * this.xpBuff() * this.salvageXpMult()),
    };
  }

  onBattleEnd(result) {
    this.state.totalBattles++;
    if (result.mode === 'boss') {
      if (result.win) {
        const baseTroph = result.kind === 'major' ? 5 + Math.floor(this.state.wins / 20) : 2;
        const troph = baseTroph + this.salvageUpg('trophy');
        this.state.trophies += troph;
        this.state.bossesKilled++;
        this.state.pendingBoss = null;
        const r = this.battleRewards(this.state.stage, true, result.kind);
        this.state.money += r.money;
        this.state.xp += r.xp;
        this.state.wins += result.kind === 'major' ? 3 : 1;
        this.checkLevelUp();
        this.log('Boss down! +' + troph + ' trophies, +' + fmt(r.money) + ' credits, +' + fmt(r.xp) + ' XP.', 'good');
        this.state.lastDrops = this.rollBossLoot(result.kind, result.stage);
        this.state.lastDrops.forEach(d => this.log('Loot: ' + d.label, 'tier'));
        this.afterWinBoss();
      } else {
        this.log('Boss repelled your assault. Regroup and try again.', 'bad');
      }
      this.save(); this.emit();
      return;
    }

    if (result.win) {
      const r = this.battleRewards(this.state.stage, false);
      this.state.money += r.money;
      this.state.xp += r.xp;
      this.state.wins++;
      const beatCurrent = this.state.stage >= this.state.battleNumber;
      if (beatCurrent) {
        this.state.battleNumber = this.state.stage + 1;
        this.state.stage = this.state.battleNumber;
        this.state.runFrontier = Math.max(this.state.runFrontier || 1, this.state.battleNumber);
      }
      this.checkLevelUp();
      this.log('Sector ' + result.stage + ' cleared. +' + fmt(r.money) + ' credits, +' + fmt(r.xp) + ' XP.', 'good');
      // boss scheduling
      if (this.state.pendingBoss) { /* already queued */ }
      else if (this.state.wins > 0 && this.state.wins % 10 === 0) {
        this.state.pendingBoss = 'major';
        this.log('WARNING: major boss signature detected. Boss battle available.', 'tier');
      } else if (this.state.wins > 0 && this.state.wins % 5 === 0) {
        this.state.pendingBoss = 'mini';
        this.log('Mini-boss signature detected. Boss battle available.', 'tier');
      }
    } else {
      this.log('Squad wiped in sector ' + result.stage + '. Buy reinforcements or farm an earlier sector.', 'bad');
    }
    this.save(); this.emit();
  }
  afterWinBoss() { /* hook for ui */ }

  /* next chassis that a blueprint could unlock (a tier or two ahead) */
  nextBlueprintTarget() {
    const pool = UNITS.filter(u =>
      !this.unitUnlocked(u.id) && u.tier <= this.state.tierIndex + 2);
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  rollBossLoot(kind, stage) {
    const major = kind === 'major';
    const rolls = major ? 3 : 1;
    const base = this.battleRewards(stage, true, kind);
    const table = [
      ['credits', major ? 26 : 34],
      ['xp', major ? 22 : 26],
      ['atk', major ? 20 : 24],
      ['item', major ? 20 : 14],
      ['blueprint', major ? 12 : 2],
    ];
    const total = table.reduce((a, t) => a + t[1], 0);
    const drops = [];
    for (let i = 0; i < rolls; i++) {
      let r = Math.random() * total, pick = 'credits';
      for (const [id, w] of table) { if (r < w) { pick = id; break; } r -= w; }
      if (pick === 'blueprint' && !this.nextBlueprintTarget()) pick = 'item';

      if (pick === 'credits') {
        const amt = Math.floor(base.money * (0.8 + Math.random() * 1.4));
        this.state.money += amt;
        drops.push({ icon: '₡', label: 'Credit cache +' + fmt(amt), color: '#ffc44d' });
      } else if (pick === 'xp') {
        this.state.buffs.xp = Math.min(1200, this.state.buffs.xp) + 180;
        drops.push({ icon: '▲', label: 'XP boost +50% (3 min)', color: '#4fd1ff' });
      } else if (pick === 'atk') {
        this.state.buffs.atk = Math.min(1200, this.state.buffs.atk) + 180;
        drops.push({ icon: '⚔', label: 'Weapons overclock +50% damage (3 min)', color: '#ff8a5c' });
      } else if (pick === 'item') {
        const it = ITEMS[Math.floor(Math.random() * ITEMS.length)];
        this.state.items[it.id] = (this.state.items[it.id] || 0) + 1;
        drops.push({ icon: it.icon, label: it.name + ' ×1', color: it.color });
      } else {
        const u = this.nextBlueprintTarget();
        this.state.blueprints[u.id] = true;
        drops.push({ icon: '◈', label: 'BLUEPRINT — ' + u.name + ' unlocked early', color: '#c07bff' });
      }
    }
    return drops;
  }

  /* ---------- idle loop ---------- */
  tick(dt) {
    const gain = this.idlePerSec() * dt;
    this.state.money += gain;
    const b = this.state.buffs;
    if (b) {
      b.xp = Math.max(0, b.xp - dt);
      b.atk = Math.max(0, b.atk - dt);
    }
    return gain;
  }
}

/* ===========================================================
   Front battle simulation
   =========================================================== */
class FrontBattle {
  constructor(game, stage) {
    this.game = game;
    this.stage = stage;
    this.mode = 'front';
    this.units = [];
    this.projectiles = [];
    this.mines = [];
    this.fx = [];
    this.time = 0;
    this.over = false;
    this.win = false;
    this.resultTimer = 0;
    this.manual = false;
    this.blocking = false;
    this.build();
  }

  build() {
    const g = this.game;
    const playerSpots = this.spawnSlots(9, 120, 1);
    const heroSt = g.heroStats();
    const hero = {
      side: 'p', id: 'hero', name: 'Hero', kind: 'hero', role: 'hero',
      x: 70, lane: 2, hp: heroSt.hp, maxHp: heroSt.hp, atk: heroSt.atk, def: heroSt.def,
      spd: heroSt.spd, range: heroSt.range, aspd: heroSt.aspd, cd: 0, anim: Math.random() * 6,
      isHero: true, tier: g.state.tierIndex, heroname: 'ACE', dead: false, flash: 0, block: 0,
    };
    this.hero = hero;
    this.units.push(hero);

    const fielded = g.fieldedUnits();
    fielded.forEach((f, i) => {
      const spot = playerSpots[i];
      this.units.push({
        side: 'p', id: f.id, name: UNIT_BY_ID[f.id].name, kind: f.id, role: f.stats.role,
        x: spot.x, lane: spot.lane, hp: f.stats.hp, maxHp: f.stats.hp, atk: f.stats.atk,
        def: f.stats.def, spd: f.stats.spd, range: f.stats.range, aspd: f.stats.aspd,
        cd: Math.random() * 0.4, anim: Math.random() * 6, tier: UNIT_BY_ID[f.id].tier,
        dead: false, flash: 0, used: false,
      });
    });

    // enemies
    const n = this.stage;
    const count = clamp(2 + Math.floor(n / 3), 2, 9);
    const ehp = 62 * Math.pow(1.09, n - 1) * clamp(1 + n * 0.006, 1, 1.6);
    const eatk = 11 * Math.pow(1.075, n - 1);
    const edef = 4 * Math.pow(1.055, n - 1);
    const espots = this.spawnSlots(count, 880, -1);
    for (let i = 0; i < count; i++) {
      const spot = espots[i];
      const elite = i === count - 1 && n >= 6;
      const tierIdx = clamp(Math.floor(n / 12), 0, 9);
      this.units.push({
        side: 'e', id: 'enemy', name: 'Hostile', kind: 'enemy' + (elite ? 'E' : ''),
        role: i % 4 === 3 ? 'ranged' : 'melee',
        x: spot.x, lane: spot.lane,
        hp: ehp * (elite ? 1.8 : 1) * (0.9 + (i % 3) * 0.08),
        maxHp: ehp * (elite ? 1.8 : 1) * (0.9 + (i % 3) * 0.08),
        atk: eatk * (elite ? 1.4 : 1), def: edef, spd: 30 + (i % 3) * 4,
        range: i % 4 === 3 ? 300 : 46, aspd: i % 4 === 3 ? 2.1 : 1.1,
        cd: 1 + Math.random(), anim: Math.random() * 6, tier: tierIdx,
        dead: false, flash: 0, elite,
      });
    }
  }

  spawnSlots(n, baseX, dir) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / 3);
      out.push({
        x: baseX + dir * (row * 46 + (i % 3) * 12),
        lane: i % 3,
      });
    }
    return out;
  }

  alive(side) { return this.units.filter(u => !u.dead && u.side === side); }

  update(dt) {
    if (this.over) { this.resultTimer += dt; return; }
    this.time += dt;
    const g = this.game;

    for (const u of this.units) {
      if (u.dead) continue;
      u.flash = Math.max(0, u.flash - dt * 4);
      // field-item status effects
      if (u.burn > 0) {
        u.burn = Math.max(0, u.burn - dt);
        u.hp -= u.maxHp * 0.05 * dt;
        if (u.hp <= 0) { this.killUnit(u); continue; }
      }
      if (u.insane > 0) u.insane = Math.max(0, u.insane - dt);
      if (u.freeze > 0) {
        u.freeze = Math.max(0, u.freeze - dt);
        continue;                        // frozen solid: no move, no attack
      }
      if (u.role === 'income') continue;
      u.cd -= dt;
      if (u.role === 'suicide' && !u.manualTriggered) continue;

      const turned = u.insane > 0;
      const foes = this.alive(turned ? u.side : (u.side === 'p' ? 'e' : 'p')).filter(f => f !== u);
      if (!foes.length) continue;

      // hero manual control
      if (u.isHero && this.manual) {
        if (g.heroMove !== 0) u.x += g.heroMove * u.spd * 1.4 * dt;
        u.x = clamp(u.x, 40, 960);
        const target = this.nearest(u, foes);
        if (target && Math.abs(target.x - u.x) <= u.range + 8 && u.cd <= 0) {
          this.attack(u, target);
          u.cd = u.aspd * 0.8;
        }
        u.anim += dt * 8;
        continue;
      }

      // everyone closes to their preferred range — support units included, so a
      // battle can never stalemate with the squads parked at their spawn points
      const advanceTarget = this.nearest(u, foes);
      if (advanceTarget) {
        const want = (u.role === 'melee' || u.role === 'tank' || u.role === 'reflect')
          ? u.range
          : (u.role === 'ranged' ? u.range * 0.78 : u.range * 1.4);
        const d = Math.abs(advanceTarget.x - u.x);
        if (d > want) {
          const dir = advanceTarget.x > u.x ? 1 : -1;
          const speed = u.spd * (u.jam > 0 ? 0.55 : 1);
          u.x += dir * speed * dt;
          u.anim += dt * (speed / 12);
        }
      }

      if (u.role === 'healer') {
        const hurt = this.alive(u.side).filter(a => a.hp < a.maxHp * 0.85).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
        if (hurt && u.cd <= 0) {
          const amount = u.atk * 8 + hurt.maxHp * 0.06;
          hurt.hp = Math.min(hurt.maxHp, hurt.hp + amount);
          u.cd = u.aspd;
          this.projectiles.push({ x: u.x, y: 0, tx: hurt.x, ty: 0, t: 0, life: 0.35, side: u.side, heal: true, lane: u.lane, targetLane: hurt.lane });
          u.anim += 2;
        }
        continue;
      }
      if (u.role === 'debuff') {
        if (u.cd <= 0) {
          foes.slice(0, 3).forEach(f => { f.jam = 3.5; });
          u.cd = u.aspd;
          this.fx.push({ type: 'ring', x: u.x, lane: u.lane, r: 10, max: 150, t: 0, life: 0.6, color: '#c07bff' });
        }
        continue;
      }
      if (u.role === 'trapper') {
        if (u.cd <= 0 && this.mines.length < 12) {
          this.mines.push({ x: u.x + (u.side === 'p' ? 80 : -80), lane: u.lane, side: u.side, dmg: u.atk * 2.2, armed: 0.35 });
          u.cd = u.aspd;
        }
        continue;
      }
      if (u.role === 'buffer') {
        continue;
      }

      const target = advanceTarget;
      if (!target) continue;
      if (u.cd <= 0 && Math.abs(target.x - u.x) <= u.range + 6) {
        this.attack(u, target);
        u.cd = u.aspd * (u.jam > 0 ? 1.5 : 1);
      }
    }

    // buff aura
    const buffers = this.units.filter(u => !u.dead && u.side === 'p' && u.role === 'buffer');
    this.playerBuff = 1 + 0.18 * buffers.length;

    // jam decay
    for (const u of this.units) if (u.jam) u.jam = Math.max(0, u.jam - dt);

    // projectiles
    for (const p of this.projectiles) {
      p.t += dt;
      if (p.t >= p.life) {
        p.done = true;
        if (!p.heal) {
          const victim = p.victim;
          if (victim && !victim.dead) this.damage(victim, p.dmg, p.src, 'ranged');
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.done);

    // mines
    for (const m of this.mines) {
      m.armed -= dt;
      if (m.armed > 0) continue;
      const enemySide = m.side === 'p' ? 'e' : 'p';
      const trigger = this.alive(enemySide).find(e => Math.abs(e.x - m.x) < 32);
      if (trigger) {
        m.boom = true;
        this.fx.push({ type: 'ring', x: m.x, lane: m.lane, r: 8, max: 110, t: 0, life: 0.45, color: '#ffb347' });
        this.alive(enemySide).forEach(e => {
          if (Math.abs(e.x - m.x) < 95) this.damage(e, m.dmg, null, 'explosive');
        });
        this.fx.push({ type: 'boom', x: m.x, lane: m.lane, t: 0, life: 0.4 });
      }
    }
    this.mines = this.mines.filter(m => !m.boom);

    for (const f of this.fx) { f.t += dt; }
    this.fx = this.fx.filter(f => f.t < f.life);

    // end conditions
    if (!this.alive('e').length) this.finish(true);
    else if (!this.alive('p').length) this.finish(false);
    else if (this.time > 75) {
      const php = this.alive('p').reduce((a, u) => a + u.hp, 0);
      const ehp = this.alive('e').reduce((a, u) => a + u.hp, 0);
      this.finish(php > ehp);
    }
  }

  killUnit(u) {
    if (u.dead) return;
    u.hp = 0; u.dead = true;
    this.fx.push({ type: 'boom', x: u.x, lane: u.lane, t: 0, life: 0.5 });
    if (u.isHero) this.game.log('Your hero has been destroyed.', 'bad');
  }
  applyItem(id, target) {
    if (!target || target.dead) return false;
    const def = ITEM_BY_ID[id];
    if (!def) return false;

    if (id === 'heal') {
      if (target.side !== 'p') return false;
      target.hp = Math.min(target.maxHp, target.hp + target.maxHp * def.healPct);
      this.fx.push({ type: 'ring', x: target.x, lane: target.lane, r: 8, max: 120, t: 0, life: 0.55, color: def.color });
      return true;
    }

    if (target.side !== 'e') return false;

    if (id === 'net') {
      const dur = this.game.itemDuration('net');
      this.alive('e')
        .filter(e => Math.abs(e.x - target.x) < (def.splash || 140))
        .slice(0, def.maxTargets || 3)
        .forEach(e => { e.freeze = Math.max(e.freeze || 0, dur); });
      this.fx.push({ type: 'ring', x: target.x, lane: target.lane, r: 10, max: def.splash || 140, t: 0, life: 0.6, color: def.color });
      return true;
    }

    const dur = this.game.itemDuration(id);
    if (id === 'freeze') target.freeze = dur;
    else if (id === 'fire') target.burn = dur;
    else if (id === 'insanity') target.insane = dur;
    else return false;
    this.fx.push({ type: 'ring', x: target.x, lane: target.lane, r: 8, max: 140, t: 0, life: 0.55, color: def.color });
    return true;
  }

  nearest(u, foes) {
    let best = null, bd = 1e9;
    for (const f of foes) {
      const d = Math.abs(f.x - u.x);
      if (d < bd) { bd = d; best = f; }
    }
    return best;
  }

  attack(u, target) {
    u.anim += 3;
    const buff = u.side === 'p' ? (this.playerBuff || 1) : 1;
    let dmg = u.atk * buff;
    if (u.range > 150) {
      this.projectiles.push({ x: u.x, lane: u.lane, dmg, src: u, victim: target, t: 0, life: Math.max(0.08, Math.abs(target.x - u.x) / 900), side: u.side, tx: target.x });
      this.fx.push({ type: 'muzzle', x: u.x + (u.side === 'p' ? 12 : -12), lane: u.lane, t: 0, life: 0.15 });
    } else {
      this.damage(target, dmg, u, 'melee');
      this.fx.push({ type: 'hit', x: target.x, lane: target.lane, t: 0, life: 0.2 });
    }
  }

  damage(target, amount, src, kind) {
    if (target.dead) return;
    const mit = target.def / (target.def + 60);
    let dmg = amount * (1 - mit);
    if (target.isHero && this.manual && this.blocking && kind === 'melee') {
      dmg *= (0.25 - 0.06 * this.game.skill('her3'));
      const refl = 0.15 * this.game.skill('her3');
      if (refl > 0 && src && !src.dead) this.damage(src, dmg * refl, null, 'reflect');
      target.block = 0.25;
    }
    if (target.kind === 'recon' && Math.random() < 0.25) {
      this.fx.push({ type: 'dodge', x: target.x, lane: target.lane, t: 0, life: 0.4 });
      return;
    }
    if (target.role === 'reflect' && kind === 'melee' && src && !src.dead) {
      this.damage(src, dmg * 0.35, null, 'reflect');
    }
    target.hp -= dmg;
    target.flash = 1;
    if (target.hp <= 0) {
      target.hp = 0; target.dead = true;
      this.fx.push({ type: 'boom', x: target.x, lane: target.lane, t: 0, life: 0.5 });
      if (target.isHero) this.game.log('Your hero has been destroyed.', 'bad');
    }
  }

  detonate() {
    let any = false;
    for (const u of this.units) {
      if (u.dead || u.role !== 'suicide' || u.manualTriggered) continue;
      u.manualTriggered = true;
      any = true;
      const foes = this.alive('e');
      this.fx.push({ type: 'ring', x: u.x, lane: u.lane, r: 10, max: 220, t: 0, life: 0.6, color: '#ff4d4d' });
      this.fx.push({ type: 'boom', x: u.x, lane: u.lane, t: 0, life: 0.6 });
      foes.forEach(f => { if (Math.abs(f.x - u.x) < 170) this.damage(f, 900 + this.stage * 120, null, 'explosive'); });
      u.dead = true;
    }
    if (!any) this.game.log('No Detonators in the field.', 'bad');
    return any;
  }

  finish(win) {
    if (this.over) return;
    this.over = true;
    this.win = win;
    this.game.onBattleEnd({ mode: 'front', win, stage: this.stage });
  }
}

/* ===========================================================
   Boss battle (top-down)
   =========================================================== */
class BossBattle {
  constructor(game, kind) {
    this.game = game;
    this.kind = kind;
    this.mode = 'boss';
    this.W = 1000; this.H = 620;
    this.time = 0;
    this.over = false;
    this.win = false;
    this.resultTimer = 0;
    this.manual = true;
    this.projectiles = [];
    this.fx = [];
    this.input = { up: 0, down: 0, left: 0, right: 0, attack: false, block: false };
    this.build();
  }

  build() {
    const g = this.game;
    const st = g.heroStats();
    const major = this.kind === 'major';
    const stage = g.state.stage;
    this.hero = {
      x: 500, y: 500, r: 20, hp: st.hp, maxHp: st.hp, atk: st.atk, cd: 0,
      blocking: false, anim: 0, flash: 0, facing: -1, vy: 0, vx: 0,
    };
    this.boss = {
      x: 500, y: 240, r: major ? 92 : 60,
      hp: 1000,
      atk: st.hp * (major ? 0.038 : 0.030),
      name: major ? 'SIEG-LORD ' + (1 + g.state.bossesKilled) : 'SCOUT TITAN ' + (1 + g.state.bossesKilled),
      major, timer: 2.2, slamTimer: 7.5, phase: 0, enraged: false, flash: 0, anim: 0,
      volleyCount: 0, freeze: 0, burn: 0, insane: 0,
    };
    this.boss.maxHp = this.boss.hp;
    this.allies = [];
    const fielded = g.fieldedUnits();
    fielded.forEach((f, i) => {
      const angle = Math.PI * (0.15 + 0.7 * (i / Math.max(1, fielded.length - 1)));
      this.allies.push({
        x: 500 + Math.cos(angle) * 260, y: 480 - Math.sin(angle) * 60,
        hp: f.stats.hp, maxHp: f.stats.hp, atk: f.stats.atk, cd: Math.random(),
        id: f.id, r: 14, dead: false, flash: 0, anim: Math.random() * 6,
        tier: UNIT_BY_ID[f.id].tier, role: f.stats.role,
      });
    });
    // escort minions — these are what the field items are aimed at
    this.minions = [];
    const nMin = major ? 4 : 2;
    const mHp = Math.max(140, st.hp * 0.55);
    for (let i = 0; i < nMin; i++) {
      this.minions.push({
        x: 500 + (i - (nMin - 1) / 2) * 165,
        y: 350 + (i % 2) * 46,
        r: 17, hp: mHp, maxHp: mHp,
        atk: Math.max(4, st.hp * 0.012), spd: 115,
        cd: 1 + Math.random(), dead: false, flash: 0, anim: Math.random() * 6,
        freeze: 0, burn: 0, insane: 0, atkCd: 0,
      });
    }
    this.slams = [];
    const allyDps = this.allies.reduce((a, x) => a + x.atk / 1.5, 0);
    this.boss.hp = Math.max(400, (st.atk / 0.7 + allyDps) * (this.kind === 'major' ? 40 : 20));
    this.boss.maxHp = this.boss.hp;
  }

  update(dt) {
    if (this.over) { this.resultTimer += dt; return; }
    this.time += dt;
    const b = this.boss, h = this.hero, inp = this.input;

    // status effects on the boss
    const bossFrozen = b.freeze > 0;
    if (bossFrozen) b.freeze = Math.max(0, b.freeze - dt);
    if (b.burn > 0) {
      b.burn = Math.max(0, b.burn - dt);
      this.damageBoss(b.maxHp * 0.05 * dt, true);
    }
    if (b.insane > 0) b.insane = Math.max(0, b.insane - dt);

    // timing: enrage
    if (!b.enraged && b.hp < b.maxHp * 0.4) { b.enraged = true; b.slamTimer = 2.5; }

    // hero movement
    let dx = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    let dy = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);
    if (dx && dy) { dx *= 0.707; dy *= 0.707; }
    const speed = 300 * (h.blocking ? 0.5 : 1);
    h.x = clamp(h.x + dx * speed * dt, 30, this.W - 30);
    h.y = clamp(h.y + dy * speed * dt, 60, this.H - 30);
    if (dx) h.facing = dx;
    h.blocking = !!inp.block;
    h.anim += dt * (Math.abs(dx) + Math.abs(dy)) * 4;
    h.cd -= dt;
    h.flash = Math.max(0, h.flash - dt * 4);

    // hero attack — auto-swings in range, A fires a heavy strike
    const dist = Math.hypot(b.x - h.x, b.y - h.y);
    const inRange = dist < b.r + 92;
    if (inRange && h.cd <= 0) {
      const heavy = !!inp.attack;
      h.cd = heavy ? 0.95 : 0.62;
      this.damageBoss(h.atk * (heavy ? 2.6 : (dist < b.r + 60 ? 1.25 : 1)));
      this.fx.push({
        type: 'slash', x: h.x + (b.x - h.x) * 0.35, y: h.y + (b.y - h.y) * 0.35,
        t: 0, life: heavy ? 0.3 : 0.2,
      });
      // the swing also clips escorts standing next to you
      for (const m of this.minions) {
        if (m.dead || Math.hypot(m.x - h.x, m.y - h.y) > 95) continue;
        m.hp -= h.atk * 1.3; m.flash = 1;
        if (m.hp <= 0) this.killMinion(m);
      }
    }

    // allies fire
    for (const a of this.allies) {
      if (a.dead) continue;
      a.cd -= dt;
      a.flash = Math.max(0, a.flash - dt * 4);
      a.anim += dt * 3;
      if (a.cd <= 0) {
        a.cd = 1.2 + Math.random() * 0.6;
        const dmg = a.atk * 1.4;
        this.damageBoss(dmg);
        this.projectiles.push({ x: a.x, y: a.y, tx: b.x, ty: b.y, t: 0, life: 0.35, friendly: true });
      }
    }

    // escort minions
    for (const m of this.minions) {
      if (m.dead) continue;
      m.flash = Math.max(0, m.flash - dt * 4);
      m.anim += dt * 4;
      if (m.freeze > 0) {
        m.freeze = Math.max(0, m.freeze - dt);
        if (m.burn > 0) this.burnMinion(m, dt);
        continue;
      }
      if (m.burn > 0) { m.burn = Math.max(0, m.burn - dt); this.burnMinion(m, dt); }
      if (m.insane > 0) m.insane = Math.max(0, m.insane - dt);
      if (m.dead) continue;
      m.cd -= dt;
      if (m.insane > 0) {
        // turned: shoot the boss, or the nearest other escort
        if (b.hp > 0) {
          const d = Math.hypot(b.x - m.x, b.y - m.y);
          if (d > 70) this.moveToward(m, b.x, b.y, dt);
          else if (m.cd <= 0) {
            m.cd = 1.1;
            this.damageBoss(m.atk * 1.6);
            this.fx.push({ type: 'slash', x: (m.x + b.x) / 2, y: (m.y + b.y) / 2, t: 0, life: 0.2 });
          }
        } else {
          const o = this.minions.find(x => x !== m && !x.dead);
          if (o) {
            const d = Math.hypot(o.x - m.x, o.y - m.y);
            if (d > 34) this.moveToward(m, o.x, o.y, dt);
            else if (m.cd <= 0) { m.cd = 1.1; o.hp -= m.atk; o.flash = 1; if (o.hp <= 0) this.killMinion(o); }
          }
        }
      } else {
        const d = Math.hypot(h.x - m.x, h.y - m.y);
        if (d > 36) this.moveToward(m, h.x, h.y, dt);
        else if (m.cd <= 0 && h.hp > 0) {
          m.cd = 1.6;
          this.damageHero(m.atk);
          this.fx.push({ type: 'slash', x: m.x, y: m.y - 10, t: 0, life: 0.18 });
        }
      }
    }

    // boss volley
    if (!bossFrozen) b.timer -= dt;
    b.anim += dt;
    if (b.timer <= 0 && !bossFrozen) {
      b.timer = b.enraged ? 1.5 : (b.major ? 2.2 : 2.8);
      b.volleyCount = (b.volleyCount || 0) + 1;
      const shots = b.major ? (b.enraged ? 5 : 3) : 2;
      let aimX = h.x, aimY = h.y, atOwn = false;
      if (b.insane > 0) {
        const own = this.minions.filter(m => !m.dead);
        if (own.length) { aimX = own[0].x; aimY = own[0].y; atOwn = true; }
      }
      for (let i = 0; i < shots; i++) {
        const ang = Math.atan2(aimY - b.y, aimX - b.x) + (i - (shots - 1) / 2) * 0.28;
        this.projectiles.push({
          x: b.x, y: b.y + b.r * 0.4, vx: Math.cos(ang) * 300, vy: Math.sin(ang) * 300,
          dmg: b.atk, t: 0, life: 3.2, hostile: true, r: 8, atOwn,
        });
      }
      this.fx.push({ type: 'muzzle', x: b.x, y: b.y + b.r * 0.4, t: 0, life: 0.2 });
    }

    // boss slam telegraph
    if (!bossFrozen) b.slamTimer -= dt;
    if (b.slamTimer <= 0 && !bossFrozen) {
      b.slamTimer = b.enraged ? 4.5 : 7.5;
      this.slams.push({ x: b.x, y: b.y + 90, r: 200, t: 0, telegraph: 1.0, fired: false, dmg: b.atk * 2.0 });
    }
    for (const s of this.slams) {
      s.t += dt;
      if (!s.fired && s.t >= s.telegraph) {
        s.fired = true;
        this.fx.push({ type: 'ring', x: s.x, y: s.y, r: 20, max: s.r, t: 0, life: 0.5, color: '#ff7043' });
        if (Math.hypot(h.x - s.x, h.y - s.y) < s.r) this.damageHero(s.dmg);
        for (const a of this.allies) {
          if (!a.dead && Math.hypot(a.x - s.x, a.y - s.y) < s.r) this.damageAlly(a, s.dmg);
        }
      }
    }
    this.slams = this.slams.filter(s => s.t < s.telegraph + 0.8);

    // projectiles
    for (const p of this.projectiles) {
      p.t += dt;
      if (p.hostile) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (!p.atOwn && Math.hypot(p.x - h.x, p.y - h.y) < 22 + p.r) {
          p.done = true;
          this.damageHero(p.dmg);
        }
        if (p.atOwn) {
          for (const m of this.minions) {
            if (!m.dead && Math.hypot(p.x - m.x, p.y - m.y) < 18 + p.r) {
              p.done = true; m.hp -= p.dmg; m.flash = 1;
              if (m.hp <= 0) this.killMinion(m);
              break;
            }
          }
        }
        for (const a of this.allies) {
          if (!a.dead && Math.hypot(p.x - a.x, p.y - a.y) < 16 + p.r) {
            p.done = true; this.damageAlly(a, p.dmg);
          }
        }
      } else if (p.t >= p.life) p.done = true;
    }
    this.projectiles = this.projectiles.filter(p => !p.done && Math.abs(p.x) < 2000 && Math.abs(p.y) < 2000);

    for (const f of this.fx) f.t += dt;
    this.fx = this.fx.filter(f => f.t < f.life);

    if (b.hp <= 0) this.finish(true);
    else if (h.hp <= 0) this.finish(false);
    else if (this.time > 180) this.finish(false);
  }

  moveToward(o, tx, ty, dt) {
    const d = Math.hypot(tx - o.x, ty - o.y) || 1;
    o.x += (tx - o.x) / d * o.spd * dt;
    o.y += (ty - o.y) / d * o.spd * dt;
  }
  burnMinion(m, dt) {
    m.hp -= m.maxHp * 0.05 * dt;
    if (m.hp <= 0) this.killMinion(m);
  }
  killMinion(m) {
    if (m.dead) return;
    m.dead = true; m.hp = 0;
    this.fx.push({ type: 'boom', x: m.x, y: m.y - 10, t: 0, life: 0.45 });
  }
  applyItem(id, target) {
    if (!target || target.dead) return false;
    const def = ITEM_BY_ID[id];
    if (!def) return false;

    if (id === 'heal') {
      const isAlly = target === this.hero || this.allies.indexOf(target) >= 0;
      if (!isAlly) return false;
      target.hp = Math.min(target.maxHp, target.hp + target.maxHp * def.healPct);
      this.fx.push({ type: 'ring', x: target.x, y: target.y - 20, r: 10, max: 110, t: 0, life: 0.55, color: def.color });
      return true;
    }

    if (id === 'net') {
      const dur = this.game.itemDuration('net');
      const pool = [this.boss].concat(this.minions || [])
        .filter(t => t && !t.dead && Math.hypot(t.x - target.x, t.y - target.y) < (def.splash || 140))
        .slice(0, def.maxTargets || 3);
      if (!pool.length) return false;
      pool.forEach(t => { t.freeze = Math.max(t.freeze || 0, dur); });
      this.fx.push({ type: 'ring', x: target.x, y: target.y - 20, r: 12, max: def.splash || 140, t: 0, life: 0.6, color: def.color });
      return true;
    }

    const dur = this.game.itemDuration(id);
    if (id === 'freeze') target.freeze = dur;
    else if (id === 'fire') target.burn = dur;
    else if (id === 'insanity') target.insane = dur;
    else return false;
    this.fx.push({ type: 'ring', x: target.x, y: target.y - 20, r: 10, max: 120, t: 0, life: 0.55, color: def.color });
    return true;
  }

  damageBoss(amount, silent) {
    if (this.boss.hp <= 0) return;
    this.boss.hp -= amount;
    if (!silent) this.boss.flash = 1;
    if (this.boss.hp <= 0) {
      this.boss.hp = 0;
      for (let i = 0; i < 10; i++) {
        this.fx.push({ type: 'boom', x: this.boss.x + (Math.random() - 0.5) * 140, y: this.boss.y + (Math.random() - 0.5) * 140, t: -i * 0.08, life: 0.7 });
      }
    }
  }
  damageHero(amount) {
    const h = this.hero;
    let dmg = amount * (h.blocking ? (0.25 - 0.05 * this.game.skill('her3')) : 1);
    h.hp -= dmg;
    h.flash = 1;
    if (h.hp <= 0) h.hp = 0;
  }
  damageAlly(a, amount) {
    a.hp -= amount * 0.7;
    a.flash = 1;
    if (a.hp <= 0) { a.hp = 0; a.dead = true; this.fx.push({ type: 'boom', x: a.x, y: a.y, t: 0, life: 0.4 }); }
  }

  finish(win) {
    if (this.over) return;
    this.over = true;
    this.win = win;
    this.game.onBattleEnd({ mode: 'boss', win, stage: this.game.state.stage, kind: this.kind });
  }
}

if (typeof module !== 'undefined') module.exports = { Game, FrontBattle, BossBattle, TIERS, UNITS, SKILLS, fmt, xpForLevel };
