'use strict';
/* ===========================================================
   GUNBOT IDLE COMMANDER — UI + canvas renderer
   =========================================================== */

/* ---------------- colour helpers ---------------- */
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgb2hex(a) {
  return '#' + a.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function sh(hex, amt) {
  const c = hex2rgb(hex);
  if (amt < 0) { const k = 1 + amt; return rgb2hex([c[0] * k, c[1] * k, c[2] * k]); }
  return rgb2hex([c[0] + (255 - c[0]) * amt, c[1] + (255 - c[1]) * amt, c[2] + (255 - c[2]) * amt]);
}
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  if (ctx.roundRect) { ctx.roundRect(x, y, w, h, r); return; }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------------- mech renderer ---------------- */
function drawMech(ctx, cx, cy, s, pal, o) {
  o = o || {};
  const dir = o.dir === undefined ? 1 : o.dir;
  const anim = o.anim || 0;
  const walking = !!o.walking;
  const swing = walking ? Math.sin(anim * 9) : 0;
  const bob = walking ? Math.abs(Math.sin(anim * 9)) * 1.4 : 0;
  const kind = o.kind || 'recruit';
  const flash = o.flash || 0;
  const t = performance.now() / 1000;

  const body = flash > 0.3 ? '#ffffff' : pal.body;
  const trim = flash > 0.3 ? '#ffffff' : pal.trim;
  const glow = pal.glow;

  // ground shadow
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 16 * s, 4.5 * s, 0, 0, 6.283);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy - bob * s);
  ctx.scale(dir * s, s);

  // ---- legs ----
  const ls = swing * 2.2;
  ctx.fillStyle = sh(body, -0.28);
  rr(ctx, -13 + ls, -22, 9, 22, 3); ctx.fill();
  rr(ctx, 4 - ls, -22, 9, 22, 3); ctx.fill();
  ctx.fillStyle = sh(body, -0.45);
  rr(ctx, -16 + ls, -5, 14, 5, 2); ctx.fill();
  rr(ctx, 2 - ls, -5, 14, 5, 2); ctx.fill();

  // ---- torso ----
  ctx.beginPath();
  ctx.moveTo(-12, -22); ctx.lineTo(12, -22); ctx.lineTo(15, -44); ctx.lineTo(-15, -44);
  ctx.closePath();
  ctx.fillStyle = body; ctx.fill();
  ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.stroke();
  // rim light down the leading edge
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(9, -22); ctx.lineTo(12, -22); ctx.lineTo(15, -44); ctx.lineTo(11, -44);
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;
  // waist
  ctx.fillStyle = sh(body, -0.35);
  rr(ctx, -10, -24, 20, 4, 1.5); ctx.fill();

  // chest core
  ctx.save();
  ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 7;
  ctx.beginPath(); ctx.arc(0, -33, 3.2, 0, 6.283); ctx.fill();
  ctx.restore();

  // ---- shoulders + arms ----
  ctx.fillStyle = trim;
  rr(ctx, -22, -46, 9, 13, 3); ctx.fill();
  rr(ctx, 13, -46, 9, 13, 3); ctx.fill();
  ctx.fillStyle = sh(body, -0.2);
  rr(ctx, -21, -34, 7, 14, 2.5); ctx.fill();
  rr(ctx, 14, -34, 7, 14, 2.5); ctx.fill();

  // ---- head ----
  ctx.fillStyle = sh(body, -0.12);
  rr(ctx, -7, -54, 14, 11, 3); ctx.fill();
  ctx.strokeStyle = trim; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.save();
  ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 6;
  rr(ctx, -5, -50, 10, 2.4, 1.2); ctx.fill();
  ctx.restore();

  /* ---- per-class hardware ---- */
  const heroTrim = o.hero;
  if (kind === 'hero') {
    // cape
    ctx.fillStyle = 'rgba(60,110,200,0.5)';
    ctx.beginPath();
    ctx.moveTo(-13, -45);
    ctx.lineTo(-27, -33 + swing * 1.5);
    ctx.lineTo(-19, -19 + swing * 2);
    ctx.lineTo(-8, -26);
    ctx.closePath(); ctx.fill();
    // V-fin
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(-13, -64); ctx.lineTo(-4, -55); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -58); ctx.lineTo(13, -64); ctx.lineTo(4, -55); ctx.closePath(); ctx.fill();
    // shoulder wings
    ctx.fillStyle = '#e8f1ff';
    rr(ctx, -27, -48, 7, 15, 2); ctx.fill();
    rr(ctx, 20, -48, 7, 15, 2); ctx.fill();
    // blade
    ctx.fillStyle = '#dff3ff';
    rr(ctx, 18, -40, 24, 3.4, 1.7); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.8; ctx.fillStyle = '#8fe4ff';
    ctx.shadowColor = '#8fe4ff'; ctx.shadowBlur = 8;
    rr(ctx, 38, -41, 6, 5.4, 2); ctx.fill(); ctx.restore();
  } else if (kind === 'lancer') {
    ctx.fillStyle = trim;
    rr(ctx, 16, -40, 30, 5, 2); ctx.fill();
    ctx.fillStyle = sh(body, -0.3);
    rr(ctx, 12, -43, 8, 11, 2); ctx.fill();
    ctx.save(); ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(46, -37.5, 2.6, 0, 6.283); ctx.fill(); ctx.restore();
  } else if (kind === 'bulwark' || kind === 'barricade') {
    ctx.fillStyle = trim;
    rr(ctx, -31, -46, 11, 28, 3); ctx.fill();
    ctx.strokeStyle = sh(trim, -0.4); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = sh(body, -0.35);
    rr(ctx, -28, -41, 5, 18, 2); ctx.fill();
    if (kind === 'barricade') {
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.moveTo(-31, -46); ctx.lineTo(-36, -52); ctx.lineTo(-26, -46); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = sh(body, -0.15);
    rr(ctx, 14, -34, 7, 12, 2.5); ctx.fill();
  } else if (kind === 'medic' || kind === 'archmedic') {
    ctx.fillStyle = '#eafff4'; ctx.shadowColor = '#7bffb6'; ctx.shadowBlur = 6;
    rr(ctx, -1.6, -38, 3.2, 10, 1); ctx.fill();
    rr(ctx, -5, -34.6, 10, 3.2, 1); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(123,255,182,0.75)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, -62 + Math.sin(t * 2) * 1.5, 7, 0, 6.283); ctx.stroke();
  } else if (kind === 'herald') {
    ctx.strokeStyle = trim; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, -54); ctx.lineTo(0, -66); ctx.stroke();
    ctx.save(); ctx.fillStyle = glow; ctx.shadowColor = glow; ctx.shadowBlur = 9;
    ctx.beginPath(); ctx.arc(0, -68, 3, 0, 6.283); ctx.fill(); ctx.restore();
  } else if (kind === 'trapper') {
    ctx.fillStyle = sh(body, -0.3);
    rr(ctx, -20, -42, 9, 13, 2); ctx.fill();
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(-15.5, -36, 2.2, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(-15.5, -30, 2.2, 0, 6.283); ctx.fill();
  } else if (kind === 'recon') {
    ctx.fillStyle = '#dff3ff';
    rr(ctx, 17, -41, 20, 2.4, 1.2); ctx.fill();
    rr(ctx, 17, -35, 20, 2.4, 1.2); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1;
    rr(ctx, -7, -57, 14, 4, 2); ctx.stroke();
  } else if (kind === 'striker') {
    ctx.fillStyle = '#dff3ff';
    rr(ctx, 18, -40, 22, 3, 1.5); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t * 14);
    ctx.fillStyle = '#9fe8ff'; ctx.shadowColor = '#9fe8ff'; ctx.shadowBlur = 7;
    rr(ctx, 38, -41.5, 5, 6, 2); ctx.fill(); ctx.restore();
  } else if (kind === 'detonator') {
    const blink = 0.45 + 0.55 * Math.abs(Math.sin(t * 5));
    ctx.save(); ctx.globalAlpha = blink;
    ctx.fillStyle = '#ff3b3b'; ctx.shadowColor = '#ff3b3b'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, -33, 5, 0, 6.283); ctx.fill(); ctx.restore();
  } else if (kind === 'foundry') {
    ctx.strokeStyle = trim; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(6, -44); ctx.lineTo(16, -52); ctx.lineTo(22, -52); ctx.stroke();
    ctx.fillStyle = glow;
    ctx.font = 'bold 11px sans-serif'; ctx.fillText('₡', 18, -45);
    ctx.fillStyle = sh(body, -0.3);
    rr(ctx, -18, -30, 7, 8, 2); ctx.fill();
  } else if (kind === 'bastion') {
    ctx.fillStyle = trim;
    rr(ctx, -32, -47, 12, 30, 3); ctx.fill();
    ctx.fillStyle = sh(trim, 0.35);
    rr(ctx, -30, -44, 4, 22, 2); ctx.fill();
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.moveTo(-26, -47); ctx.lineTo(-26, -53); ctx.lineTo(-20, -47); ctx.closePath(); ctx.fill();
  } else if (kind === 'enemyE') {
    ctx.fillStyle = '#ff5a6e';
    ctx.beginPath(); ctx.moveTo(-7, -55); ctx.lineTo(-14, -66); ctx.lineTo(-3, -57); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, -55); ctx.lineTo(14, -66); ctx.lineTo(3, -57); ctx.closePath(); ctx.fill();
  } else if (kind === 'enemy') {
    ctx.fillStyle = sh(trim, -0.15);
    rr(ctx, -23, -45, 6, 4, 1); ctx.fill();
  }

  if (heroTrim) {
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 0.7; ctx.globalAlpha = 0.85;
    rr(ctx, -15, -44, 30, 22, 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

const ENEMY_PAL = { body: '#8a2a38', trim: '#ff9aa8', glow: '#ff5a6e' };
function palFor(tierIdx, side) {
  if (side === 'e') return ENEMY_PAL;
  const t = TIERS[clamp(tierIdx, 0, 9)];
  return { body: t.body, trim: t.trim, glow: t.glow };
}

/* ---------------- small widgets ---------------- */
function drawBar(ctx, x, y, w, h, pct, col, bg) {
  ctx.fillStyle = bg || 'rgba(0,0,0,0.6)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = col;
  ctx.fillRect(x, y, Math.max(0, w * clamp(pct, 0, 1)), h);
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawStatus(ctx, x, y, s, o) {
  const t = performance.now() / 1000;

  if (o.freeze > 0) {
    const bw = 48 * s, bh = 70 * s;
    const bx = x - bw / 2, by = y - bh;
    ctx.save();
    // glassy block
    const g = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
    g.addColorStop(0, 'rgba(150,235,255,0.55)');
    g.addColorStop(0.5, 'rgba(90,190,235,0.30)');
    g.addColorStop(1, 'rgba(170,240,255,0.55)');
    ctx.fillStyle = g;
    rr(ctx, bx, by, bw, bh, 7 * s);
    ctx.fill();
    ctx.strokeStyle = '#bff4ff';
    ctx.lineWidth = Math.max(1.2, 1.4 * s);
    ctx.stroke();
    // frost cracks
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(1, 0.9 * s);
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.22, by); ctx.lineTo(bx + bw * 0.52, by + bh * 0.55); ctx.lineTo(bx + bw * 0.3, y);
    ctx.moveTo(bx + bw * 0.8, by + bh * 0.1); ctx.lineTo(bx + bw * 0.5, by + bh * 0.6); ctx.lineTo(bx + bw * 0.78, by + bh * 0.92);
    ctx.stroke();
    // shimmer
    ctx.globalAlpha = 0.35 + 0.25 * Math.sin(t * 3);
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(bx + bw * 0.15, y); ctx.lineTo(bx + bw * 0.32, by + bh * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  if (o.burn > 0) {
    // warm glow at the base
    const gr = ctx.createRadialGradient(x, y - 20 * s, 2, x, y - 20 * s, 34 * s);
    gr.addColorStop(0, 'rgba(255,140,60,0.35)');
    gr.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y - 20 * s, 34 * s, 0, 6.283); ctx.fill();
    for (let i = 0; i < 4; i++) {
      const ph = (t * 1.9 + i * 0.25) % 1;
      const fx = x + Math.sin(t * 3 + i * 2.1) * 9 * s;
      const fy = y - 44 * s - ph * 34 * s;
      ctx.globalAlpha = (1 - ph) * 0.95;
      ctx.fillStyle = i % 2 ? '#ffd166' : '#ff6a2c';
      ctx.beginPath(); ctx.arc(fx, fy, (5.2 - ph * 3.2) * s, 0, 6.283); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (o.insane > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(200,130,255,' + (0.55 + 0.35 * Math.sin(t * 7)) + ')';
    ctx.lineWidth = Math.max(1.6, 2 * s);
    ctx.beginPath();
    ctx.arc(x, y - 34 * s, (27 + Math.sin(t * 4) * 3) * s, 0, 6.283);
    ctx.stroke();
    ctx.fillStyle = '#d8a6ff';
    ctx.font = '900 ' + Math.round(14 * s) + 'px "Segoe UI",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', x, y - 62 * s);
    ctx.restore();
  }
}

/* ===========================================================
   UI
   =========================================================== */
class UI {
  constructor(game) {
    this.game = game;
    this.screen = 'hangar';
    this.last = performance.now();
    this.lastLogLen = -1;
    this.battleHandled = false;
    this.heroMove = 0;
    this.blocking = false;
    this.keys = {};
    this.previewLevels = {};
    this.scenery = null;
    this.acc = 0;
    this.saveAcc = 0;

    this.canvas = document.getElementById('battle-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.heroCv = document.getElementById('hero-portrait');
    this.heroCtx = this.heroCv.getContext('2d');

    this.armedItem = null;
    this.buildGrid();
    this.buildSkills();
    this.buildShop();
    this.buildItemBar();
    this.bind();
    this.resize();
    this.refreshAll(true);
    window.addEventListener('resize', () => this.resize());
    if (window.ResizeObserver) new ResizeObserver(() => this.resize()).observe(this.canvas.parentElement);

    this.lastFrameTs = Date.now();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.lastFrameTs = Date.now(); return; }
      const away = Math.max(0, (Date.now() - this.lastFrameTs) / 1000);
      if (away > 5) {
        const gain = this.game.idlePerSec() * Math.min(away, 8 * 3600) * 0.6;
        this.game.state.money += gain;
        this.game.log('Away for ' + Math.round(away / 60) + ' min — collected ' + fmt(gain) + ' credits.', 'good');
        this.renderLog();
        this.refreshHud();
      }
      this.last = performance.now();
    });

    this.last = performance.now();
    requestAnimationFrame(t => this.loop(t));
  }

  /* ---------- events ---------- */
  bind() {
    document.querySelectorAll('.tab').forEach(b => {
      b.addEventListener('click', () => this.showScreen(b.dataset.screen));
    });
    document.getElementById('fight-btn').addEventListener('click', () => this.startFront());
    document.getElementById('boss-btn').addEventListener('click', () => this.startBoss());
    document.getElementById('stage-prev').addEventListener('click', () => this.shiftStage(-1));
    document.getElementById('stage-next').addEventListener('click', () => this.shiftStage(1));
    document.getElementById('speed-btn').addEventListener('click', () => {
      const s = this.game.state.speed;
      this.game.state.speed = s >= 3 ? 1 : s + 1;
      this.refreshControls();
    });
    document.getElementById('auto-btn').addEventListener('click', () => {
      const g = this.game;
      if (!g.state.autoBattleOwned) { this.showScreen('skills'); this.toast('Auto battle requires 100 ★'); return; }
      g.state.autoBattle = !g.state.autoBattle;
      this.refreshControls();
    });
    document.getElementById('manual-btn').addEventListener('click', () => {
      const b = this.game.battle;
      if (!b || b.mode !== 'front') { this.toast('Deploy to the field first.'); return; }
      b.manual = !b.manual;
      this.refreshControls();
    });
    document.getElementById('detonate-btn').addEventListener('click', () => {
      const b = this.game.battle;
      if (b && b.mode === 'front') b.detonate();
    });
    document.getElementById('hero-upgrade').addEventListener('click', () => {
      if (!this.game.buyHeroLevel()) this.toast('Not enough credits.');
    });
    document.getElementById('autobattle-btn').addEventListener('click', () => {
      if (!this.game.buyAutoBattle()) this.toast('Need 100 ★');
    });
    document.getElementById('save-btn').addEventListener('click', () => {
      this.game.save(); this.toast('Saved.');
    });
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (confirm('Wipe all progress and start over?')) {
        this.game.reset();
        this.buildGrid(); this.buildSkills(); this.refreshAll(true);
      }
    });

    // overlay continue
    document.getElementById('canvas-overlay').addEventListener('click', () => this.dismissOverlay());

    // touch / key input
    const setKey = (k, v) => { this.keys[k] = v; };
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      // must fire on auto-repeat too, otherwise a held arrow scrolls the page
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(k)) e.preventDefault();
      if (e.repeat) return;
      if (k === '1') this.armItem('freeze');
      if (k === '2') this.armItem('fire');
      if (k === '3') this.armItem('insanity');
      if (k === 'escape') { this.armedItem = null; this.refreshItemBar(); }
      setKey(k, true);
    });
    window.addEventListener('keyup', e => setKey(e.key.toLowerCase(), false));
    window.addEventListener('blur', () => { this.keys = {}; });

    // d-pad: pointer capture so a held finger keeps moving the ace even if it
    // drifts off the button, and no long-press callout / context menu.
    document.querySelectorAll('#mobilepad button').forEach(btn => {
      const dir = btn.dataset.dir;
      const press = e => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        this.keys['pad_' + dir] = true;
        if (dir === 'attack') this.keys[' '] = true;
        btn.classList.add('down');
      };
      const release = e => {
        if (e) e.preventDefault();
        this.keys['pad_' + dir] = false;
        if (dir === 'attack') this.keys[' '] = false;
        btn.classList.remove('down');
        try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('contextmenu', e => e.preventDefault());
      btn.addEventListener('dragstart', e => e.preventDefault());
    });
    ['mobilepad', 'battle-canvas', 'itembar'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('contextmenu', e => e.preventDefault());
    });

    // tap an enemy on the canvas to deploy the armed item
    this.canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      this.canvasTap(e);
    });
  }

  canvasTap(e) {
    const b = this.game.battle;
    if (!b || b.over) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (this.cw / rect.width);
    const y = (e.clientY - rect.top) * (this.ch / rect.height);
    const pool = this.armedItem ? this.itemPool(this.armedItem)
      : (b.mode === 'boss' ? [b.boss].concat(b.minions || []) : b.units.filter(u => u.side === 'e'));
    let best = null, bd = 1e9;
    for (const t of pool) {
      if (!t || t.dead || t._hx === undefined) continue;
      const d = Math.hypot(t._hx - x, t._hy - y);
      if (d < bd) { bd = d; best = t; }
    }
    const def = this.armedItem ? ITEM_BY_ID[this.armedItem] : null;
    if (!best || bd > 80) {
      if (def) this.toast('No target there — tap directly on ' + (def.target === 'ally' ? 'one of your units.' : 'a hostile mech.'));
      return;
    }
    if (!this.armedItem) { this.toast('Pick an item first (❄ 🔥 🌀 above the battlefield).'); return; }
    const id = this.armedItem;
    if (this.game.tryUseItem(id, best)) {
      if ((this.game.state.items[id] || 0) <= 0) this.armedItem = null;
      this.refreshItemBar();
      this.refreshHangar(false);
    }
  }

  showScreen(name) {
    this.screen = name;
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.screen === name));
    if (name === 'skills') this.refreshSkills();
    if (name === 'hangar') { this.refreshHangar(true); this.refreshShop(); }
  }

  toast(msg) {
    this.game.log(msg, 'sys');
    this.renderLog();
  }

  /* ---------- sizing ---------- */
  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(200, r.width), h = Math.max(120, r.height);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.cw = w; this.ch = h; this.dpr = dpr;
  }

  /* ---------- hangar ---------- */
  buildGrid() {
    const grid = document.getElementById('unit-grid');
    grid.innerHTML = '';
    this.cards = {};
    const ti = this.game.state.tierIndex;
    const list = UNITS.slice().sort((a, b) => {
      const la = this.game.unitUnlocked(a.id) ? 0 : 1;
      const lb = this.game.unitUnlocked(b.id) ? 0 : 1;
      if (la !== lb) return la - lb;
      return a.tier - b.tier || a.cost - b.cost;
    });
    list.forEach(u => {
      const el = document.createElement('div');
      el.className = 'ucard';
      el.innerHTML =
        '<div class="ucard-top">' +
          '<canvas width="80" height="92"></canvas>' +
          '<div style="min-width:0;flex:1">' +
            '<div class="uname">' + u.name + '</div>' +
            '<div class="uclass">T' + (u.tier + 1) + ' · ' + u.role + '</div>' +
            '<div class="ustats"></div>' +
          '</div>' +
        '</div>' +
        '<div class="u-row">' +
          '<div class="u-owned">×0</div>' +
          '<button class="btn cyan buy">BUY</button>' +
          '<button class="btn upg">LV1</button>' +
        '</div>' +
        '<div class="u-lockmsg"></div>';
      grid.appendChild(el);
      const cv = el.querySelector('canvas');
      const refs = {
        el, cv, ctx: cv.getContext('2d'),
        owned: el.querySelector('.u-owned'),
        buy: el.querySelector('.buy'),
        upg: el.querySelector('.upg'),
        stats: el.querySelector('.ustats'),
        lock: el.querySelector('.u-lockmsg'),
      };
      refs.buy.addEventListener('click', () => {
        if (!this.game.buy(u.id)) this.toast('Not enough credits for ' + u.name + '.');
      });
      refs.upg.addEventListener('click', () => {
        if (!this.game.upgrade(u.id)) this.toast('Need credits, or buy the unit first.');
      });
      this.cards[u.id] = refs;
      this.previewLevels[u.id] = -1;
    });
    this.refreshHangar(true);
  }

  drawPreview(id) {
    const refs = this.cards[id];
    const u = UNIT_BY_ID[id];
    const g = this.game;
    const ctx = refs.ctx;
    ctx.clearRect(0, 0, 80, 92);
    const locked = !g.unitUnlocked(id);
    ctx.save();
    if (locked) ctx.globalAlpha = 0.5;
    drawMech(ctx, 40, 84, 1.28, palFor(u.tier, 'p'), {
      kind: id, anim: 0, walking: false, dir: 1,
    });
    ctx.restore();
  }

  refreshHangar(force) {
    const g = this.game, s = g.state;
    // hero
    const hs = g.heroStats();
    document.getElementById('hero-lvl').textContent = s.heroLevel;
    document.getElementById('hero-mk').textContent = 'MK' + Math.max(1, Math.ceil(s.heroLevel / 5));
    document.getElementById('hero-stats').textContent = 'HP ' + fmt(hs.hp) + ' · ATK ' + fmt(hs.atk) + ' · DEF ' + fmt(hs.def);
    const nextMk = 5 - (s.heroLevel % 5);
    document.getElementById('hero-next').textContent = s.heroLevel >= 50
      ? 'MAX LEVEL — frame fully evolved'
      : 'Chassis evolution in ' + nextMk + ' level' + (nextMk === 1 ? '' : 's');
    const upBtn = document.getElementById('hero-upgrade');
    upBtn.textContent = s.heroLevel >= 50 ? 'MAX LEVEL' : 'UPGRADE · ' + fmt(g.heroCost());
    upBtn.disabled = s.heroLevel >= 50 || s.money < g.heroCost();

    // tier banner
    const tb = document.getElementById('tier-banner');
    const nt = g.nextTier();
    if (nt) {
      const need = nt.xpReq;
      tb.innerHTML = 'TIER ' + (s.tierIndex + 1) + ' — <b>' + g.tier().name.toUpperCase() + '</b>' +
        ' <span class="nextreq">next: ' + nt.name + ' @ LV ' + need + '</span>';
      tb.classList.remove('ready');
    } else {
      tb.innerHTML = 'FINAL TIER — <b>INFINITY</b> <span class="nextreq">skill tree online</span>';
      tb.classList.add('ready');
    }

    document.getElementById('field-count').textContent = g.fieldedUnits().length;

    // cards
    const ti = s.tierIndex;
    UNITS.forEach(u => {
      const refs = this.cards[u.id];
      if (!refs) return;
      const st = s.units[u.id];
      const unlocked = g.unitUnlocked(u.id);
      refs.el.classList.toggle('locked', !unlocked);
      if (!unlocked) {
        const need = TIERS[u.tier];
        refs.lock.textContent = 'LOCKED — NEEDS ' + need.name.toUpperCase() + ' TIER · LV ' + need.xpReq;
        refs.lock.style.display = 'block';
        refs.stats.textContent = 'HP ' + fmt(u.base.hp) + ' · ATK ' + fmt(u.base.atk) + ' · DEF ' + fmt(u.base.def);
        return;
      }
      refs.lock.style.display = 'none';
      const stats = g.unitStats(u.id);
      refs.stats.textContent = 'HP ' + fmt(stats.hp) + ' · ATK ' + fmt(stats.atk) + ' · DEF ' + fmt(stats.def);
      refs.owned.textContent = '×' + st.count;
      const bc = g.buyCost(u.id);
      refs.buy.textContent = 'BUY ' + fmt(bc);
      refs.buy.disabled = s.money < bc;
      const uc = g.upgradeCost(u.id);
      refs.upg.textContent = st.level >= 50 ? 'MAX' : 'LV' + st.level + ' · ' + fmt(uc);
      refs.upg.disabled = st.level >= 50 || st.count === 0 || s.money < uc;
      refs.el.classList.toggle('affordable', s.money >= bc);
      if (this.previewLevels[u.id] !== st.level || force) {
        this.previewLevels[u.id] = st.level;
        this.drawPreview(u.id);
      }
    });

    this.drawHeroPortrait();
  }

  drawHeroPortrait() {
    const ctx = this.heroCtx;
    const s = this.game.state;
    ctx.clearRect(0, 0, 120, 150);
    const tier = Math.min(9, s.tierIndex);
    const t = TIERS[tier];
    drawMech(ctx, 60, 138, 2.1, { body: '#cdd9ee', trim: '#6fb6ff', glow: '#bfe9ff' }, {
      kind: 'hero', anim: 0, walking: false, dir: 1, hero: true,
    });
    // accent base ring
    ctx.strokeStyle = t.trim; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(60, 140, 34, 7, 0, 0, 6.283); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  /* ---------- field supplies ---------- */
  buildShop() {
    const wrap = document.getElementById('item-shop');
    wrap.innerHTML = '';
    this.shopRefs = {};
    ITEMS.forEach(it => {
      const row = document.createElement('div');
      row.className = 'item-card';
      row.innerHTML =
        '<div class="ic-icon" style="color:' + it.color + ';border-color:' + it.color + '55;background:' + it.color + '12">' + it.icon + '</div>' +
        '<div class="ic-body">' +
          '<div class="ic-name">' + it.name + '<span class="ic-count"></span><span class="ic-lv"></span></div>' +
          '<div class="ic-desc"></div>' +
        '</div>' +
        '<div class="ic-btns">' +
          '<button class="btn cyan ic-buy">' + fmt(it.cost) + '</button>' +
          (it.upCost ? '<button class="btn gold ic-up">MK</button>' : '') +
        '</div>';
      wrap.appendChild(row);
      const btn = row.querySelector('.ic-buy');
      btn.addEventListener('click', () => {
        if (!this.game.buyItem(it.id)) this.toast('Not enough credits for ' + it.name + '.');
      });
      const up = row.querySelector('.ic-up');
      if (up) up.addEventListener('click', () => {
        if (!this.game.upgradeItem(it.id)) this.toast('Not enough credits, or already maxed.');
      });
      this.shopRefs[it.id] = {
        row, btn, up, count: row.querySelector('.ic-count'),
        desc: row.querySelector('.ic-desc'), lv: row.querySelector('.ic-lv'),
      };
    });
  }

  refreshShop() {
    if (!this.shopRefs) return;
    const s = this.game.state;
    ITEMS.forEach(it => {
      const ref = this.shopRefs[it.id];
      const have = s.items[it.id] || 0;
      ref.count.textContent = have ? '×' + have : '';
      ref.btn.textContent = fmt(it.cost) + ' ₡';
      ref.btn.disabled = s.money < it.cost;
      if (it.upCost) {
        const lv = this.game.state.itemLevels[it.id] || 1;
        const maxed = lv >= it.maxLevel;
        ref.lv.textContent = ' MK' + lv;
        ref.desc.textContent = maxed
          ? 'Stuns up to ' + it.maxTargets + ' in a cluster for ' + this.game.itemDuration(it.id).toFixed(1) + 's. MAXED.'
          : 'Stuns up to ' + it.maxTargets + ' in a cluster for ' + this.game.itemDuration(it.id).toFixed(1) + 's. Upgradeable.';
        ref.up.textContent = maxed ? 'MAX' : 'MK' + (lv + 1) + ' · ' + fmt(this.game.itemUpgradeCost(it.id));
        ref.up.disabled = maxed || s.money < this.game.itemUpgradeCost(it.id);
      } else {
        ref.desc.textContent = it.desc;
      }
    });
  }

  buildItemBar() {
    const bar = document.getElementById('itembar');
    this.itemRefs = {};
    ITEMS.forEach(it => {
      const btn = document.createElement('button');
      btn.className = 'item-btn';
      btn.dataset.item = it.id;
      btn.innerHTML =
        '<span class="ii" style="color:' + it.color + '">' + it.icon + '</span>' +
        '<span class="iname">' + it.name.split(' ')[0].toUpperCase() + '</span>' +
        '<span class="icount">0</span>';
      btn.addEventListener('click', () => this.armItem(it.id));
      bar.appendChild(btn);
      this.itemRefs[it.id] = btn;
    });
  }

  itemPool(id) {
    const b = this.game.battle;
    if (!b) return [];
    const def = ITEM_BY_ID[id];
    if (def && def.target === 'ally') {
      return b.mode === 'boss'
        ? [b.hero].concat(b.allies || []).filter(t => t && !t.dead)
        : b.units.filter(u => u.side === 'p' && !u.dead);
    }
    return b.mode === 'boss'
      ? [b.boss].concat(b.minions || []).filter(t => t && !t.dead)
      : b.units.filter(u => u.side === 'e' && !u.dead);
  }

  armItem(id) {
    const b = this.game.battle;
    if (!b || b.over) { this.toast('Deploy first — items are used in battle.'); return; }
    if ((this.game.state.items[id] || 0) <= 0) {
      this.armedItem = null;
      this.showScreen('hangar');
      this.toast('Out of ' + ITEM_BY_ID[id].name + ' — buy more in the hangar.');
      return;
    }
    this.armedItem = this.armedItem === id ? null : id;
    this.refreshItemBar();
  }

  refreshItemBar() {
    if (!this.itemRefs) return;
    const s = this.game.state;
    const b = this.game.battle;
    const live = !!b && !b.over;
    ITEMS.forEach(it => {
      const btn = this.itemRefs[it.id];
      const have = s.items[it.id] || 0;
      btn.querySelector('.icount').textContent = '×' + have;
      btn.classList.toggle('armed', this.armedItem === it.id);
      btn.classList.toggle('empty', have <= 0);
      btn.disabled = !live;
    });
    const hint = document.getElementById('ib-hint');
    const armedDef = this.armedItem ? ITEM_BY_ID[this.armedItem] : null;
    hint.textContent = !live
      ? 'NO ACTIVE ENGAGEMENT'
      : armedDef
        ? 'TAP ' + (armedDef.target === 'ally' ? 'ONE OF YOUR UNITS' : 'A HOSTILE') + ' TO DEPLOY ' + armedDef.name.toUpperCase()
        : 'TAP AN ITEM, THEN TAP A TARGET';
    hint.classList.toggle('hot', !!this.armedItem && live);
  }

  /* ---------- skills ---------- */
  buildSkills() {
    const tree = document.getElementById('skill-tree');
    tree.innerHTML = '';
    this.skillNodes = {};
    const branches = ['Economy', 'Combat', 'Technology', 'Hero'];
    branches.forEach(br => {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<div class="branch-head">' + br.toUpperCase() + '</div>';
      SKILLS.filter(s => s.branch === br).forEach(sk => {
        const node = document.createElement('div');
        node.className = 'skill-node';
        node.innerHTML =
          '<div class="sn-info">' +
            '<div class="sn-name">' + sk.name + '<span class="sn-rank"></span></div>' +
            '<div class="sn-desc">' + sk.desc + '</div>' +
            '<div class="pips"></div>' +
          '</div>' +
          '<button class="btn gold">' + sk.cost + ' ★</button>';
        wrap.appendChild(node);
        const btn = node.querySelector('button');
        btn.addEventListener('click', () => {
          if (!this.game.buySkill(sk.id)) this.toast('Not enough trophies.');
        });
        this.skillNodes[sk.id] = { node, btn, rank: node.querySelector('.sn-rank'), pips: node.querySelector('.pips') };
      });
      tree.appendChild(wrap);
    });
    this.refreshSkills();
  }

  refreshSkills() {
    const g = this.game, s = g.state;
    document.getElementById('sk-trophies').textContent = fmt(s.trophies);
    SKILLS.forEach(sk => {
      const ref = this.skillNodes[sk.id];
      if (!ref) return;
      const lv = g.skill(sk.id);
      ref.rank.textContent = lv + '/' + sk.max;
      ref.btn.disabled = lv >= sk.max || s.trophies < sk.cost;
      ref.btn.textContent = lv >= sk.max ? 'MAX' : sk.cost + ' ★';
      ref.node.classList.toggle('maxed', lv >= sk.max);
      if (ref.pips.childElementCount !== sk.max) {
        ref.pips.innerHTML = '';
        for (let i = 0; i < sk.max; i++) {
          const p = document.createElement('div');
          p.className = 'pip';
          ref.pips.appendChild(p);
        }
      }
      Array.from(ref.pips.children).forEach((p, i) => p.classList.toggle('on', i < lv));
    });
    const ab = document.getElementById('autobattle-card');
    const abBtn = document.getElementById('autobattle-btn');
    if (s.autoBattleOwned) {
      abBtn.textContent = 'OWNED';
      abBtn.disabled = true;
      ab.querySelector('.skill-desc').textContent = 'Installed. Toggle it from the battle screen.';
    } else {
      abBtn.textContent = '100 ★';
      abBtn.disabled = s.trophies < 100;
    }
  }

  /* ---------- HUD ---------- */
  refreshAll(force) {
    this.refreshHud();
    this.refreshHangar(force);
    this.refreshSkills();
    this.refreshControls();
    this.refreshStage();
    this.refreshShop();
    this.refreshItemBar();
    this.renderLog();
  }

  refreshBuffs() {
    const bar = document.getElementById('buffbar');
    const b = this.game.state.buffs || {};
    const mm = t => {
      const s = Math.max(0, Math.ceil(t));
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    };
    const chips = [];
    if (b.xp > 0) chips.push('<span class="buffchip xp">▲ XP +50% <i>' + mm(b.xp) + '</i></span>');
    if (b.atk > 0) chips.push('<span class="buffchip atk">⚔ DMG +50% <i>' + mm(b.atk) + '</i></span>');
    if (!chips.length) { bar.classList.add('hidden'); bar.innerHTML = ''; return; }
    bar.classList.remove('hidden');
    bar.innerHTML = chips.join('');
  }

  refreshHud() {
    const g = this.game, s = g.state;
    document.getElementById('hud-money').textContent = fmt(s.money);
    document.getElementById('hud-mps').textContent = '+' + fmt1(g.idlePerSec()) + '/s';
    document.getElementById('hud-level').textContent = 'LV ' + s.level;
    document.getElementById('hud-tier').textContent = g.tier().name.toUpperCase();
    document.getElementById('hud-trophies').textContent = fmt(s.trophies);
    document.getElementById('hud-wins').textContent = s.wins + ' wins';
    const cur = xpForLevel(s.level), nxt = xpForLevel(s.level + 1);
    const into = Math.max(0, s.xp - cur);
    const pct = clamp(into / Math.max(1, nxt - cur), 0, 1);
    document.getElementById('hud-xpfill').style.width = (pct * 100).toFixed(1) + '%';
    document.getElementById('hud-xptext').textContent = fmt(into) + ' / ' + fmt(nxt - cur) + ' XP';
    const dot = document.getElementById('tab-dot');
    dot.classList.toggle('hidden', !s.pendingBoss);
    this.refreshBuffs();
  }

  refreshStage() {
    const s = this.game.state;
    document.getElementById('stage-label').textContent = 'SECTOR ' + s.stage;
    document.getElementById('stage-best').textContent = 'frontier ' + s.battleNumber;
    document.getElementById('stage-prev').disabled = s.stage <= 1;
    document.getElementById('stage-next').disabled = s.stage >= s.battleNumber;
    const inBossFight = this.game.battle && this.game.battle.mode === 'boss' && !this.game.battle.over;
    document.getElementById('boss-banner').classList.toggle('hidden', !s.pendingBoss || inBossFight);
    if (s.pendingBoss) {
      document.getElementById('boss-btn').textContent = s.pendingBoss === 'major' ? 'MAJOR BOSS' : 'MINI BOSS';
    }
  }

  refreshControls() {
    const g = this.game, s = g.state, b = g.battle;
    document.getElementById('speed-btn').textContent = s.speed + '×';
    const ab = document.getElementById('auto-btn');
    ab.textContent = s.autoBattleOwned ? (s.autoBattle ? 'AUTO ON' : 'AUTO OFF') : 'BUY AUTO';
    const mb = document.getElementById('manual-btn');
    mb.textContent = (b && b.mode === 'front' && b.manual) ? 'MANUAL · ON' : 'MANUAL HERO';
    const pad = document.getElementById('mobilepad');
    const showPad = (b && b.mode === 'boss') || (b && b.mode === 'front' && b.manual);
    pad.classList.toggle('hidden', !showPad);
    const det = document.getElementById('detonate-btn');
    const hasDet = b && b.mode === 'front' && b.units.some(u => !u.dead && u.role === 'suicide' && !u.manualTriggered);
    det.classList.toggle('hidden', !hasDet);
    const fight = document.getElementById('fight-btn');
    fight.textContent = b && !b.over ? 'RESTART' : 'DEPLOY';
  }

  shiftStage(d) {
    const s = this.game.state;
    s.stage = clamp(s.stage + d, 1, s.battleNumber);
    this.refreshStage();
  }

  startFront() {
    this.game.state.lastDrops = [];
    this.game.state.stage = clamp(this.game.state.stage, 1, this.game.state.battleNumber);
    this.game.startBattle();
    this.scenery = this.makeScenery();
    this.battleHandled = false;
    document.getElementById('canvas-overlay').classList.add('hidden');
    this.showScreen('battle');
    this.refreshStage();
    this.refreshControls();
  }

  startBoss() {
    this.game.state.lastDrops = [];
    this.game.startBoss();
    this.battleHandled = false;
    document.getElementById('canvas-overlay').classList.add('hidden');
    this.showScreen('battle');
    this.refreshControls();
    this.refreshStage();
  }

  dismissOverlay() {
    document.getElementById('canvas-overlay').classList.add('hidden');
    const b = this.game.battle;
    if (b && b.over && !this._advancing) this.advance(b);
  }

  makeScenery() {
    let seed = 1337;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const buildings = [];
    for (let i = 0; i < 26; i++) {
      buildings.push({ x: i / 26, w: 0.02 + rnd() * 0.035, h: 0.2 + rnd() * 0.9, lit: rnd() });
    }
    return { buildings, stars: Array.from({ length: 60 }, () => ({ x: rnd(), y: rnd() * 0.45, a: 0.2 + rnd() * 0.7 })) };
  }

  /* ---------- log ---------- */
  renderLog() {
    const panel = document.getElementById('battle-log');
    const logs = this.game.logs;
    if (logs.length === this.lastLogLen && !this._forceLog) return;
    this.lastLogLen = logs.length;
    const slice = logs.slice(-60);
    panel.innerHTML = slice.map(l => {
      const ts = new Date(l.t).toLocaleTimeString('en-AU', { hour12: false, timeZone: 'Australia/Sydney' });
      return '<div class="logline ' + l.type + '"><span class="t">' + ts + '</span>' + l.msg + '</div>';
    }).join('');
    panel.scrollTop = panel.scrollHeight;
  }

  /* ---------- main loop ---------- */
  loop(now) {
    const dtReal = Math.min(0.06, (now - this.last) / 1000);
    this.last = now;
    this.lastFrameTs = Date.now();
    const g = this.game;
    const spd = g.state.speed;
    const dt = dtReal * spd;

    g.tick(dt);

    const b = g.battle;
    if (b) {
      this.applyInput(b);
      b.update(dt);
      this.renderBattle(b);
      if (b.over && !this.battleHandled) {
        this.battleHandled = true;
        this.onBattleOver(b);
      }
      if (b.over && this.battleHandled && g.state.autoBattle && b.resultTimer > 1.6) this.advance(b);
    } else {
      this.renderIdle();
    }

    // periodic DOM refresh
    this.acc += dtReal;
    if (this.acc > 0.12) {
      this.acc = 0;
      this.refreshHud();
      if (this.screen === 'hangar') { this.refreshHangar(false); this.refreshShop(); }
      if (this.screen === 'battle') { this.refreshStage(); this.refreshControls(); this.refreshItemBar(); }
      if (this.screen === 'skills') this.refreshSkills();
      this.renderLog();
    }

    this.saveAcc += dtReal;
    if (this.saveAcc > 5) { this.saveAcc = 0; g.save(); }

    requestAnimationFrame(t => this.loop(t));
  }

  applyInput(b) {
    const k = this.keys;
    if (b.mode === 'boss') {
      b.input.left = !!(k['arrowleft'] || k['a'] || k['pad_left']);
      b.input.right = !!(k['arrowright'] || k['d'] || k['pad_right']);
      b.input.up = !!(k['arrowup'] || k['w'] || k['pad_up']);
      b.input.down = !!(k['arrowdown'] || k['s'] || k['pad_down']);
      b.input.attack = !!(k[' '] || k['j'] || k['pad_attack']);
      b.input.block = !!(k['shift'] || k['k'] || k['pad_block']);
    } else if (b.manual) {
      this.game.heroMove = (k['arrowright'] || k['d'] || k['pad_right'] ? 1 : 0) - (k['arrowleft'] || k['a'] || k['pad_left'] ? 1 : 0);
      b.blocking = !!(k['shift'] || k['k'] || k['pad_block']);
      if (k[' '] || k['j'] || k['pad_attack']) {
        const h = b.hero;
        if (h && !h.dead) h.cd = Math.min(h.cd, 0.05);
      }
    } else {
      this.game.heroMove = 0;
    }
  }

  onBattleOver(b) {
    const ov = document.getElementById('canvas-overlay');
    const title = document.getElementById('ov-title');
    const sub = document.getElementById('ov-sub');
    title.textContent = b.win ? 'VICTORY' : 'DEFEAT';
    title.classList.toggle('lose', !b.win);
    let msg = '';
    if (b.win) {
      if (b.mode === 'boss') {
        msg = b.kind === 'major' ? 'Major boss destroyed. Trophies secured.' : 'Mini-boss destroyed. Trophies secured.';
      } else {
        msg = 'Sector ' + b.stage + ' cleared.' + (this.game.state.pendingBoss ? '  ⚠ BOSS SIGNATURE DETECTED' : '');
      }
      if (b.mode === 'boss') {
        const drops = this.game.state.lastDrops || [];
        if (drops.length) msg += '\n\n' + drops.map(d => d.icon + '  ' + d.label).join('\n');
      }
    } else {
      msg = b.mode === 'boss'
        ? 'Your hero was destroyed. Spend trophies or upgrade, then re-engage.'
        : 'Squad wiped. Buy more units or farm a lower sector.';
    }
    sub.textContent = msg + '\n\nTAP TO CONTINUE';
    ov.classList.remove('hidden');
    this.refreshAll(false);
  }

  advance(b) {
    this._advancing = true;
    const g = this.game;
    const s = g.state;
    if (b.win && b.mode === 'boss') {
      document.getElementById('canvas-overlay').classList.add('hidden');
      g.battle = null;
      this.showScreen('skills');
      this.toast('Boss rewards banked — spend your trophies.');
      this._advancing = false;
      return;
    }
    if (g.state.autoBattle && b.win) {
      this.dismissOverlay();
      this.startFront();
      return;
    }
    if (g.state.autoBattle && !b.win) {
      g.state.autoBattle = false;
      this.toast('Auto battle paused after a wipe.', 'bad');
      this.refreshControls();
    }
    document.getElementById('canvas-overlay').classList.add('hidden');
    g.battle = null;
    this.refreshAll(false);
    this.renderIdle();
    this._advancing = false;
  }

  /* ---------- renderers ---------- */
  renderIdle() {
    document.getElementById('battle-hud').classList.add('hidden');
    const ctx = this.ctx, W = this.cw, H = this.ch;
    if (!this.scenery) this.scenery = this.makeScenery();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080c18'); g.addColorStop(1, '#0d1424');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // idle hint
    const s = this.game.state;
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.font = '700 ' + Math.round(W / 26) + 'px "Segoe UI",sans-serif';
    ctx.fillStyle = '#4a5878';
    ctx.textAlign = 'center';
    ctx.fillText('SECTOR ' + s.stage + ' — AWAITING DEPLOYMENT', W / 2, H / 2 - 6);
    ctx.font = '600 ' + Math.round(W / 40) + 'px "Segoe UI",sans-serif';
    ctx.fillStyle = '#37425c';
    ctx.fillText('FRONTIER ' + s.battleNumber + '  ·  ' + s.wins + ' WINS', W / 2, H / 2 + 18);
    ctx.restore();
  }

  renderBattle(b) {
    if (b.mode === 'front') this.renderFront(b);
    else this.renderBoss(b);
    document.getElementById('battle-hud').classList.remove('hidden');
    document.getElementById('bf-mode').textContent =
      b.mode === 'boss' ? (b.kind === 'major' ? 'MAJOR BOSS' : 'MINI BOSS')
        : (b.manual ? 'MANUAL CONTROL' : 'AUTO BATTLE');
    document.getElementById('bf-timer').textContent = b.time.toFixed(1) + 's';
  }

  renderFront(b) {
    const ctx = this.ctx, W = this.cw, H = this.ch;
    if (!this.scenery) this.scenery = this.makeScenery();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const horizon = H * 0.44;
    const vpx = W / 2;

    // sky
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#060912'); sky.addColorStop(0.6, '#141d38'); sky.addColorStop(1, '#2b2440');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, horizon + 1);

    // stars
    ctx.fillStyle = '#cfe3ff';
    this.scenery.stars.forEach(s => {
      ctx.globalAlpha = s.a * 0.7;
      ctx.fillRect(s.x * W, s.y * horizon, 1.4, 1.4);
    });
    ctx.globalAlpha = 1;

    // skyline
    ctx.fillStyle = '#0b1020';
    this.scenery.buildings.forEach(bd => {
      const bw = bd.w * W, bh = bd.h * horizon * 0.7;
      ctx.fillRect(bd.x * W, horizon - bh, bw, bh);
    });
    ctx.fillStyle = 'rgba(79,209,255,0.25)';
    this.scenery.buildings.forEach(bd => {
      if (bd.lit > 0.6) {
        const bw = bd.w * W, bh = bd.h * horizon * 0.7;
        ctx.fillRect(bd.x * W + bw * 0.3, horizon - bh + 4, 1.5, 1.5);
        ctx.fillRect(bd.x * W + bw * 0.6, horizon - bh + 10, 1.5, 1.5);
      }
    });

    // ground
    const gr = ctx.createLinearGradient(0, horizon, 0, H);
    gr.addColorStop(0, '#131a2c'); gr.addColorStop(1, '#05070d');
    ctx.fillStyle = gr; ctx.fillRect(0, horizon, W, H - horizon);

    // perspective grid
    ctx.strokeStyle = 'rgba(79,209,255,0.09)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const t = i / 13;
      const y = horizon + Math.pow(t, 1.9) * (H - horizon);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let i = -9; i <= 9; i++) {
      ctx.beginPath();
      ctx.moveTo(vpx + i * (W / 7), H);
      ctx.lineTo(vpx + i * 9, horizon);
      ctx.stroke();
    }
    // horizon glow
    const hg = ctx.createLinearGradient(0, horizon - 8, 0, horizon + 8);
    hg.addColorStop(0, 'rgba(79,209,255,0)'); hg.addColorStop(0.5, 'rgba(79,209,255,0.25)'); hg.addColorStop(1, 'rgba(79,209,255,0)');
    ctx.fillStyle = hg; ctx.fillRect(0, horizon - 8, W, 16);

    const laneFrac = [0.50, 0.70, 0.92];
    const laneScl = [0.48, 0.62, 0.78];
    const base = clamp(H / 330, 0.65, 1.5);
    const sx = wx => 16 + (wx / 1000) * (W - 32);
    const sy = lane => horizon + laneFrac[lane] * (H - horizon);
    const sc = lane => laneScl[lane] * base;

    // depth sort: far lanes first
    const drawable = b.units.filter(u => !u.dead).slice().sort((a, c) => a.lane - c.lane || a.x - c.x);

    for (const u of drawable) {
      const x = sx(u.x), y = sy(u.lane), s = sc(u.lane);
      const isE = u.side === 'e';
      const pal = u.isHero ? { body: '#cdd9ee', trim: '#6fb6ff', glow: '#bfe9ff' } : palFor(u.tier, u.side);
      drawMech(ctx, x, y, s, pal, {
        kind: isE ? (u.elite ? 'enemyE' : 'enemy') : u.kind,
        anim: u.anim, walking: true, dir: isE ? -1 : 1,
        flash: u.flash, hero: u.isHero,
      });
      u._hx = x; u._hy = y - 24 * s; u._hr = Math.max(24, 34 * s);
      drawStatus(ctx, x, y, s, u);
      if (u.jam > 0 && !(u.insane > 0)) {
        ctx.strokeStyle = 'rgba(192,123,255,0.8)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y - 30 * s, 14 * s, 0, 6.283); ctx.stroke();
      }
      // hp bar
      const pct = u.hp / u.maxHp;
      if (isE || pct < 0.999) {
        const bw = 30 * s, bh = 4 * s;
        drawBar(ctx, x - bw / 2, y - 64 * s, bw, bh, pct, isE ? '#ff5a6e' : '#4be08a');
      }
      if (u.isHero && b.manual) {
        ctx.fillStyle = '#4fd1ff';
        ctx.font = '700 ' + Math.round(8 * s) + 'px "Segoe UI",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▼ YOU', x, y - 74 * s);
      }
    }

    // mines
    for (const m of b.mines) {
      const x = sx(m.x), y = sy(m.lane);
      const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 120);
      ctx.fillStyle = 'rgba(255,179,71,' + (0.4 + pulse * 0.5) + ')';
      ctx.beginPath(); ctx.ellipse(x, y - 3, 7, 3, 0, 0, 6.283); ctx.fill();
    }

    // projectiles
    for (const p of b.projectiles) {
      const prog = clamp(p.t / p.life, 0, 1);
      const x0 = sx(p.x), y0 = sy(p.lane) - 26 * sc(p.lane);
      const x1 = sx(p.tx !== undefined ? p.tx : p.x), y1 = sy(p.lane) - 26 * sc(p.lane);
      const xx = x0 + (x1 - x0) * prog;
      ctx.fillStyle = p.heal ? '#7bffb6' : '#ffd166';
      ctx.shadowColor = p.heal ? '#7bffb6' : '#ffd166';
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(xx, y0, p.heal ? 2.5 : 2, 0, 6.283); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // fx
    for (const f of b.fx) {
      const t = f.t / f.life;
      if (f.type === 'ring') {
        const cx = sx(f.x), cy = sy(f.lane) - 14 * sc(f.lane);
        ctx.strokeStyle = f.color || '#ffd166';
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, (f.max || 100) * 0.001 * (W) * t, 0, 6.283); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.type === 'boom') {
        const cx = sx(f.x), cy = f.y !== undefined ? this.by(f, W, H) : sy(f.lane) - 16 * sc(f.lane);
        const r = (6 + t * 26) * (f.y !== undefined ? 1 : sc(f.lane));
        ctx.globalAlpha = 1 - t;
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        bg.addColorStop(0, 'rgba(255,255,220,0.95)');
        bg.addColorStop(0.4, 'rgba(255,170,60,0.85)');
        bg.addColorStop(1, 'rgba(255,80,40,0)');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (f.type === 'hit') {
        const cx = sx(f.x), cy = sy(f.lane) - 26 * sc(f.lane);
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const a = i * 1.57 + 0.3;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * 8 * (1 + t), cy + Math.sin(a) * 8 * (1 + t));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (f.type === 'dodge') {
        const cx = sx(f.x), cy = sy(f.lane) - 30 * sc(f.lane);
        ctx.globalAlpha = (1 - t) * 0.8;
        ctx.fillStyle = '#a8f0ff';
        ctx.font = '700 9px "Segoe UI",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MISS', cx, cy - t * 12);
        ctx.globalAlpha = 1;
      } else if (f.type === 'muzzle') {
        const cx = sx(f.x), cy = sy(f.lane) - 30 * sc(f.lane);
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // sidebar: remaining counts
    const pa = b.alive('p').length, ea = b.alive('e').length;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(6, H - 22, 86, 16);
    ctx.fillRect(W - 92, H - 22, 86, 16);
    ctx.font = '700 9px "Segoe UI",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4be08a';
    ctx.fillText('ALLY ' + pa, 12, H - 10);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff5a6e';
    ctx.fillText('HOSTILE ' + ea, W - 12, H - 10);
    ctx.textAlign = 'left';
  }

  by(f, W, H) {
    // boss-space y for boom fx
    const sc = this.bossScale();
    return (f.y * sc) + this.offY;
  }

  bossScale() {
    const W = this.cw, H = this.ch;
    return Math.min(W / 1000, H / 620);
  }

  renderBoss(b) {
    const ctx = this.ctx, W = this.cw, H = this.ch;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const sc = Math.min(W / 1000, H / 620);
    const offX = (W - 1000 * sc) / 2;
    const offY = (H - 620 * sc) / 2;
    this.offX = offX; this.offY = offY;

    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(offX, offY);
    ctx.scale(sc, sc);

    // arena floor
    const fg = ctx.createRadialGradient(500, 330, 40, 500, 330, 620);
    fg.addColorStop(0, '#1a2138'); fg.addColorStop(0.6, '#0c1120'); fg.addColorStop(1, '#04060b');
    ctx.fillStyle = fg;
    ctx.fillRect(-200, -200, 1400, 1100);

    ctx.strokeStyle = 'rgba(79,209,255,0.10)';
    ctx.lineWidth = 1;
    for (let x = -200; x <= 1200; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, -150); ctx.lineTo(x, 800); ctx.stroke();
    }
    for (let y = -150; y <= 800; y += 80) {
      ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(1200, y); ctx.stroke();
    }
    // arena ring
    ctx.strokeStyle = 'rgba(255,79,216,0.18)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(500, 320, 430, 0, 6.283); ctx.stroke();

    // slam telegraphs
    for (const s of b.slams) {
      const t = clamp(s.t / s.telegraph, 0, 1);
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(performance.now() / 90));
      ctx.fillStyle = '#ff5a3c';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = '#ff9a52'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.3 + 0.7 * t), 0, 6.283); ctx.stroke();
      ctx.restore();
    }

    // allies
    for (const a of b.allies) {
      if (a.dead) continue;
      drawMech(ctx, a.x, a.y, 0.8, palFor(a.tier, 'p'), { kind: a.id, anim: a.anim, walking: false, dir: b.boss.y > a.y ? 1 : -1, flash: a.flash });
      drawBar(ctx, a.x - 16, a.y - 56, 32, 4, a.hp / a.maxHp, '#4be08a');
      a._hx = offX + a.x * sc;
      a._hy = offY + (a.y - 30) * sc;
      a._hr = 30;
    }

    // escort minions
    for (const m of b.minions || []) {
      if (m.dead) continue;
      drawMech(ctx, m.x, m.y, 0.72, ENEMY_PAL, {
        kind: 'enemy', anim: m.anim, walking: true, dir: m.x > b.hero.x ? -1 : 1, flash: m.flash,
      });
      drawBar(ctx, m.x - 17, m.y - 56, 34, 4, m.hp / m.maxHp, '#ff5a6e');
      drawStatus(ctx, m.x, m.y, 0.72, m);
      m._hx = offX + m.x * sc;
      m._hy = offY + (m.y - 22) * sc;
      m._hr = 34;
    }

    // boss
    const bo = b.boss;
    const bs = bo.major ? 3.0 : 2.2;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.ellipse(bo.x, bo.y + bo.r * 0.55 + 4, bo.r * 0.8, bo.r * 0.26, 0, 0, 6.283); ctx.fill();
    ctx.restore();
    drawMech(ctx, bo.x, bo.y + bo.r * 0.55, bs, ENEMY_PAL, {
      kind: bo.major ? 'enemyE' : 'enemy', anim: bo.anim, walking: false, dir: -1, flash: 0,
    });
    bo._hx = offX + bo.x * sc;
    bo._hy = offY + (bo.y - bo.r * 0.4) * sc;
    bo._hr = Math.max(44, bo.r * sc * 1.1);
    drawStatus(ctx, bo.x, bo.y + bo.r * 0.55, bs * 0.95, bo);
    if (bo.enraged) {
      ctx.strokeStyle = 'rgba(255,90,60,' + (0.4 + 0.3 * Math.sin(performance.now() / 100)) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(bo.x, bo.y, bo.r + 14, 0, 6.283); ctx.stroke();
    }

    // hero
    const h = b.hero;
    if (h.hp > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(h.x, h.y + 4, 20, 7, 0, 0, 6.283); ctx.fill();
      ctx.restore();
      drawMech(ctx, h.x, h.y, 1.3, { body: '#cdd9ee', trim: '#6fb6ff', glow: '#bfe9ff' },
        { kind: 'hero', anim: h.anim, walking: false, dir: h.facing, flash: h.flash, hero: true });
      h._hx = offX + h.x * sc;
      h._hy = offY + (h.y - 46) * sc;
      h._hr = 46;
      if (h.blocking) {
        ctx.strokeStyle = 'rgba(79,209,255,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(h.x, h.y - 22, 30, -0.9 + Math.PI, 0.9 + Math.PI); ctx.stroke();
      }
    }

    // projectiles
    for (const p of b.projectiles) {
      if (p.hostile) {
        ctx.fillStyle = '#ff5a6e';
        ctx.shadowColor = '#ff5a6e'; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r || 7, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        const t = clamp(p.t / p.life, 0, 1);
        ctx.fillStyle = '#ffd166';
        ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x + (p.tx - p.x) * t, p.y + (p.ty - p.y) * t, 3, 0, 6.283); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // fx
    for (const f of b.fx) {
      const t = clamp(f.t / f.life, 0, 1);
      if (t < 0) continue;
      if (f.type === 'ring') {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = f.color || '#ffd166';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(f.x, f.y, (f.max || 100) * t, 0, 6.283); ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.type === 'boom') {
        const r = 10 + t * 46;
        ctx.globalAlpha = 1 - t;
        const bg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        bg.addColorStop(0, 'rgba(255,255,220,0.95)');
        bg.addColorStop(0.4, 'rgba(255,170,60,0.9)');
        bg.addColorStop(1, 'rgba(255,80,40,0)');
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (f.type === 'slash') {
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = '#dff3ff'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 26, -0.9 + t * 1.2, 0.9 + t * 1.2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      } else if (f.type === 'muzzle') {
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = '#ffd166';
        ctx.beginPath(); ctx.arc(f.x, f.y, 14 * (1 - t) + 4, 0, 6.283); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    ctx.restore();

    /* --- HUD in screen space --- */
    // boss hp bar
    const bw = W - 40;
    const bpct = clamp(bo.hp / bo.maxHp, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(20, 28, bw, 12);
    const bg2 = ctx.createLinearGradient(20, 0, 20 + bw, 0);
    bg2.addColorStop(0, '#ff2d55'); bg2.addColorStop(1, '#ff8a5c');
    ctx.fillStyle = bg2;
    ctx.fillRect(20, 28, bw * bpct, 12);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.strokeRect(20.5, 28.5, bw - 1, 11);
    ctx.fillStyle = '#ffd9e2';
    ctx.font = '700 10px "Segoe UI",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bo.name.toUpperCase() + '  ·  ' + fmt(bo.hp) + ' / ' + fmt(bo.maxHp), W / 2, 52);

    // hero hp bar
    const hw = Math.min(220, W * 0.45);
    drawBar(ctx, 16, H - 26, hw, 10, b.hero.hp / b.hero.maxHp, '#4be08a');
    ctx.fillStyle = '#a8ffcf';
    ctx.font = '700 9px "Segoe UI",sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ACE  ' + fmt(Math.max(0, b.hero.hp)), 20, H - 34);
    ctx.textAlign = 'left';
  }
}

/* ---------------- boot ---------------- */
window.addEventListener('load', () => {
  const game = new Game();
  window.GAME = game;
  window.APP = new UI(game);
  game.log('Gunbot Idle Commander online. Buy units, deploy, repeat.', 'sys');
  window.APP.renderLog();
});
