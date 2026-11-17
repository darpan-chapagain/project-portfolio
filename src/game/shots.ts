// Cinematic shots for /play: full-screen scenes the engine cuts to during cutscenes.
// Each one draws the whole 320x180 frame. `k` runs from 0 to 1 across the shot.
import { W, H, Pen, type Pal, type Sprite, bigText } from './art';
import { hash, cloud } from './scenery';

/** A mountain range drawn column by column: snow on the peaks, hatching on the rock. */
function range(p: Pen, pal: Pal, base: number, height: number, seed: number, scroll: number, opts: { snow?: boolean; line?: string; rock?: string; fill?: string } = {}) {
  const line = opts.line ?? pal.line;
  let prev = -1;
  for (let x = 0; x < W; x++) {
    const u = (x + scroll) / 24 + seed;
    const ridge = Math.abs(Math.sin(u * 0.9)) * 0.65 + Math.abs(Math.sin(u * 2.3 + 1.7)) * 0.25 + hash(Math.floor(u * 3)) * 0.1;
    const y = Math.round(base - ridge * height);
    if (opts.fill) p.c(opts.fill).v(x, y, base);
    if (opts.snow) {
      const depth = Math.max(0, Math.round((ridge - 0.45) * height * 0.5));
      if (depth > 0) p.c(pal.fill).v(x, y, y + depth);
      if (opts.rock) {
        p.c(opts.rock);
        for (let yy = y + depth + 2; yy < base; yy++) if ((x + yy) % 5 === 0) p.px(x, yy);
      }
      if (depth > 1) { p.c(pal.mid); if (x % 3 === 0) p.px(x, y + depth); }
    }
    p.c(line);
    if (prev >= 0) p.v(x, Math.min(prev, y), Math.max(prev, y));
    else p.px(x, y);
    prev = y;
  }
}

function skyShade(p: Pen, pal: Pal, amount: number) {
  p.c(pal.bg).rect(0, 0, W, H);
  if (amount > 0) {
    p.x.globalAlpha = amount;
    p.c(pal.shade).rect(0, 0, W, H);
    p.x.globalAlpha = 1;
  }
}

function stars(p: Pen, pal: Pal, t: number, alpha: number, n = 60, maxY = 110) {
  if (alpha <= 0) return;
  p.x.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const x = Math.round(hash(i * 3.3) * W), y = Math.round(hash(i * 9.1) * maxY);
    const tw = hash(i + Math.floor(t * 3)) > 0.2;
    p.c(i % 7 === 0 ? pal.yellow : pal.dark ? pal.line : pal.fill);
    if (tw) p.px(x, y);
    if (i % 11 === 0 && tw) { p.px(x - 1, y); p.px(x + 1, y); p.px(x, y - 1); p.px(x, y + 1); }
  }
  p.x.globalAlpha = 1;
}

/**
 * The terrace at night, seen from behind you: the Himalaya on the horizon, the city's lights,
 * prayer flags overhead, and you looking up. `dawn` goes 0 to 1 as morning comes.
 */
export function terrace(p: Pen, pal: Pal, t: number, dawn: number, me: Sprite, shooting: number) {
  const night = 1 - dawn;
  p.c(pal.bg).rect(0, 0, W, H);
  // the Himalaya on the horizon, and the valley's houses under it
  range(p, pal, 104, 40, 3.1, 0, { snow: true, line: pal.mid, rock: pal.faint, fill: pal.bg });
  p.c(pal.faint);
  for (let i = 0; i < 26; i++) {
    const x = Math.round(hash(i * 2.9) * W), y = 110 + Math.round(hash(i * 6.1) * 26), w = 6 + Math.round(hash(i) * 8);
    p.box(x, y - 5, w, 6);
  }
  // you, from behind, three times the size, at the railing
  const s = 3, mx = 112, my = 166 - me.height * s;
  p.x.imageSmoothingEnabled = false;
  p.x.drawImage(me, mx, my, me.width * s, me.height * s);
  p.c(pal.line);
  p.h(0, W, 146); p.h(0, W, 147); p.h(0, W, 156);
  for (let x = 4; x < W; x += 14) p.rect(x, 146, 2, 11);
  p.c(pal.bg).rect(0, 157, W, 23);
  p.c(pal.faint);
  for (let x = 0; x < W; x += 16) p.v(x, 160, 180);
  p.h(0, W, 168);
  // the black water tank
  p.panel(266, 104, 40, 42, pal.dark ? pal.fill : pal.line, pal.line);
  // prayer flags overhead
  const cols = [pal.blue, pal.fill, pal.red, pal.green, pal.yellow];
  for (let x = 0; x <= W; x += 2) {
    const sag = Math.round(Math.sin((x / W) * Math.PI) * 18);
    p.c(pal.line).px(x, 22 + sag);
    if (x % 12 === 6) {
      const wv = Math.round(Math.sin(t * 2.5 + x * 0.2) * 1.2);
      p.c(cols[(x / 12) % 5 | 0]).rect(x - 3, 23 + sag, 7, 8 + wv);
      p.c(pal.line).box(x - 3, 23 + sag, 7, 8 + wv);
    }
  }
  // night falls over everything; only lights show through
  if (night > 0) {
    p.x.globalAlpha = night * 0.68;
    p.c(pal.shade).rect(0, 0, W, H);
    p.x.globalAlpha = 1;
  }
  stars(p, pal, t, night * 1.3 - 0.3, 90, 96);
  if (night > 0.3) {
    // crescent moon
    p.c(pal.dark ? pal.line : pal.fill);
    for (let a = 0; a < Math.PI * 2; a += 0.04) {
      const ox = 62 + Math.cos(a) * 8, oy = 46 + Math.sin(a) * 8;
      if (Math.hypot(ox - 66, oy - 44) > 7) p.px(ox, oy);
    }
  }
  if (shooting > 0 && shooting < 1) {
    const x = 260 - shooting * 160, y = 40 + shooting * 36;
    p.c(pal.yellow);
    for (let i = 0; i < 16; i++) { p.x.globalAlpha = (1 - i / 16) * (1 - shooting * 0.5); p.px(x + i * 2, y - i * 0.45); }
    p.x.globalAlpha = 1;
  }
  // the valley's lights, and the sun coming up behind the mountains
  for (let i = 0; i < 150; i++) {
    const x = Math.round(hash(i * 1.7) * W), y = 107 + Math.round(Math.pow(hash(i * 5.3), 0.7) * 34);
    // not on you or the water tank
    if ((x > mx - 2 && x < mx + me.width * s + 2) || (x > 264 && x < 308)) continue;
    if (night > 0.25 && hash(i + Math.floor(t * 0.7)) > 0.08) { p.x.globalAlpha = Math.min(1, night * 1.4); p.c(pal.yellow).px(x, y); }
  }
  p.x.globalAlpha = 1;
  if (dawn > 0) {
    p.x.globalAlpha = Math.min(1, dawn * 1.2);
    p.c(pal.yellow);
    const r = Math.round(3 + dawn * 9);
    for (let j = -r; j <= 0; j++) { const hw = Math.floor(Math.sqrt(r * r - j * j)); p.h(220 - hw, 220 + hw, 97 + j); }
    p.x.globalAlpha = 1;
  }
}

/** Over the Himalaya: three ranges sliding past and the plane crossing. */
export function himalaya(p: Pen, pal: Pal, t: number, k: number, plane: Sprite) {
  skyShade(p, pal, 0);
  p.c(pal.yellow).disc(54, 34, 9);
  p.c(pal.line).circle(54, 34, 9);
  for (let i = 0; i < 4; i++) cloud(p, pal, ((i * 97 - t * 6) % 380 + 380) % 380 - 40, 26 + i * 9, 1, pal.faint);
  range(p, pal, 120, 50, 1.3, t * 8, { line: pal.faint, fill: pal.bg });
  range(p, pal, 140, 74, 7.7, t * 18, { snow: true, line: pal.mid, rock: pal.faint, fill: pal.bg });
  range(p, pal, 180, 70, 4.2, t * 40, { snow: true, line: pal.line, rock: pal.mid, fill: pal.bg });
  for (let i = 0; i < 3; i++) cloud(p, pal, ((i * 140 - t * 30) % 420 + 420) % 420 - 50, 96 + i * 12, 1.4, pal.mid);
  drawPlane(p, plane, -80 + k * 470, 58 + Math.sin(t * 1.5) * 2);
}

/** Across the ocean: rolling waves, a ship on the horizon, the plane crossing. */
export function ocean(p: Pen, pal: Pal, t: number, k: number, plane: Sprite) {
  skyShade(p, pal, 0.18);
  const sunY = 70 + k * 18;
  p.c(pal.yellow).disc(230, Math.round(sunY), 12);
  p.c(pal.line).circle(230, Math.round(sunY), 12);
  p.c(pal.bg).rect(0, 100, W, 80);
  p.c(pal.line).h(0, W, 100);
  // waves get longer and faster as they come closer
  for (let row = 0; row < 13; row++) {
    const y = 104 + row * row * 0.45 + row * 2;
    const len = 2 + row, gap = 10 + row * 3, speed = 6 + row * 4;
    const off = (t * speed + row * 17) % (len + gap);
    for (let x = -off; x < W; x += len + gap) {
      const reflect = Math.abs(x - 230) < 14 + row * 2;
      p.c(reflect ? pal.yellow : row % 2 ? pal.blue : pal.mid).h(x, x + len, y);
    }
  }
  // a little ship
  const sx = 70 - k * 20;
  p.c(pal.line).h(sx, sx + 12, 99); p.h(sx + 1, sx + 11, 98); p.rect(sx + 4, 95, 4, 3); p.v(sx + 6, 91, 95);
  for (let i = 0; i < 3; i++) cloud(p, pal, ((i * 120 - t * 10) % 400 + 400) % 400 - 40, 30 + i * 14, 1.2, pal.faint);
  drawPlane(p, plane, -80 + k * 470, 50 + Math.sin(t * 1.5) * 2);
}

/** Arriving: the coast, the Statue of Liberty, a skyline, and the title card. */
export function usa(p: Pen, pal: Pal, t: number, k: number, plane: Sprite) {
  skyShade(p, pal, 0);
  for (let i = 0; i < 3; i++) cloud(p, pal, ((i * 110 - t * 8) % 400 + 400) % 400 - 40, 72 + i * 8, 1, pal.faint);
  // sea on the left
  p.c(pal.line).h(0, W, 140);
  for (let row = 0; row < 6; row++) {
    const y = 143 + row * 6;
    const off = (t * (6 + row * 3)) % 18;
    p.c(row % 2 ? pal.blue : pal.mid);
    for (let x = -off; x < 190; x += 18) p.h(x, x + 3 + row, y);
  }
  // skyline on the coast, then the land
  p.c(pal.faint);
  for (let i = 0; i < 9; i++) {
    const x = 196 + i * 13, h = 18 + Math.round(hash(i * 4.1) * 34);
    p.box(x, 140 - h, 11, h + 1);
    if (i === 4) { p.v(x + 5, 140 - h - 10, 140 - h); }
  }
  p.c(pal.line);
  p.line(186, 141, 200, 136); p.h(200, W, 136);
  p.c(pal.bg).rect(186, 137, W - 186, 43);
  p.c(pal.line).line(186, 141, 200, 137);
  p.c(pal.faint);
  for (let x = 204; x < W; x += 9) p.line(x, 150, x + 3, 147);
  // the plane, far off and coming in to land, behind the statue
  drawPlane(p, plane, -70 + k * 330, 64 + k * 46, 1);
  liberty(p, pal, 150, 140, t);
  // the title card, typed in
  const typed = Math.max(0, Math.min(1, (k - 0.08) / 0.3));
  bigText(p.c(pal.line), 'USA', W / 2, 30, 4, 'center', Math.ceil(typed * 3));
  if (k > 0.42) {
    const sub = Math.max(0, Math.min(1, (k - 0.42) / 0.3));
    const words = 'LAND OF OPPORTUNITIES';
    bigText(p.c(pal.line), words, W / 2, 56, 1, 'center', Math.ceil(sub * words.length));
    if (sub > 0.95) p.c(pal.yellow).rect(W / 2 - 42, 63, 84, 2);
  }
}

/** Liberty Enlightening the World, in patina green. */
function liberty(p: Pen, pal: Pal, x: number, base: number, t: number) {
  const L = pal.line;
  // island and pedestal
  p.panel(x - 18, base - 4, 37, 5, pal.fill, L);
  p.panel(x - 9, base - 18, 19, 14, pal.fill, L);
  p.panel(x - 6, base - 24, 13, 6, pal.fill, L);
  // robe
  p.tri(x - 5, base - 24, x, base - 50, x + 5, base - 24, pal.green, L);
  p.c(pal.greenShade).v(x - 1, base - 44, base - 25); p.v(x + 2, base - 40, base - 25);
  // head and crown
  p.c(pal.green).disc(x, base - 53, 3);
  p.c(L).circle(x, base - 53, 3);
  for (let i = -2; i <= 2; i++) p.line(x + i * 1.5, base - 56, x + i * 3, base - 60);
  // raised arm and torch
  p.c(L).line(x + 3, base - 48, x + 6, base - 62);
  p.c(pal.green).line(x + 4, base - 48, x + 7, base - 62);
  p.c(L).box(x + 5, base - 66, 4, 4);
  p.c(pal.yellow).rect(x + 6, base - 70 + Math.round(Math.sin(t * 8)), 2, 4);
  // tablet
  p.panel(x - 7, base - 42, 4, 6, pal.green, L);
}

function drawPlane(p: Pen, plane: Sprite, x: number, y: number, scale = 2) {
  p.x.imageSmoothingEnabled = false;
  p.x.drawImage(plane, Math.round(x), Math.round(y), plane.width * scale, plane.height * scale);
}
