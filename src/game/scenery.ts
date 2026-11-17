// Scenery for /play, drawn in ink lines with a pixel pen. Every function takes screen
// coordinates; the engine works out where things are on screen.
import { G, W, Pen, type Pal, textWidth } from './art';

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Small per-frame wobble, so lines boil like the rest of the site. */
export const wob = (i: number, boil: number) => (hash(i * 13.7 + boil * 101.3) > 0.82 ? -1 : 0);

// ---------------------------------------------------------------- sky

export function sky(p: Pen, pal: Pal, night: number, t: number) {
  // sun by day, moon by night (and always a moon in dark mode)
  const moon = pal.dark || night > 0.5;
  const sx = W - 38, sy = 26;
  if (moon) {
    // a crescent drawn as two arcs, no fill, so it reads on any background
    p.c(pal.line);
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const ox = sx + Math.cos(a) * 7, oy = sy + Math.sin(a) * 7;
      if (Math.hypot(ox - (sx + 4), oy - (sy - 2)) > 6) p.px(ox, oy);
      const ix = sx + 4 + Math.cos(a) * 6, iy = sy - 2 + Math.sin(a) * 6;
      if (Math.hypot(ix - sx, iy - sy) < 7) p.px(ix, iy);
    }
    for (let i = 0; i < 14; i++) {
      const x = Math.round(hash(i * 3.1) * W), y = Math.round(6 + hash(i * 7.7) * 60);
      if (Math.abs(x - sx) < 14 && Math.abs(y - sy) < 14) continue;
      if (hash(i + Math.floor(t * 2)) > 0.15) p.px(x, y);
    }
  } else {
    p.c(pal.line).circle(sx, sy, 6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + t * 0.2;
      p.line(sx + Math.cos(a) * 9, sy + Math.sin(a) * 9, sx + Math.cos(a) * 12, sy + Math.sin(a) * 12);
    }
  }
}

export function cloud(p: Pen, pal: Pal, x: number, y: number, s: number, col: string) {
  const r = [4, 6, 5].map((v) => Math.round(v * s));
  const xs = [x, x + 6 * s, x + 13 * s];
  p.c(pal.bg);
  xs.forEach((cx, i) => p.disc(cx, y, r[i]));
  p.rect(x - r[0], y, 13 * s + r[0] + r[2], r[1] - 1);
  p.c(col);
  xs.forEach((cx, i) => {
    // top arcs only
    for (let a = Math.PI; a <= Math.PI * 2; a += 0.12) p.px(cx + Math.cos(a) * r[i], y + Math.sin(a) * r[i]);
  });
  p.h(x - r[0], x + 13 * s + r[2], y + Math.max(...r) - 2);
}

// ---------------------------------------------------------------- distant layers

/** Far layer for one stretch of a scene. `x0`..`x1` is that stretch on screen. */
export function far(p: Pen, pal: Pal, scene: string, x0: number, x1: number, seed: number, boil: number, t: number) {
  const a = Math.max(x0, -20), b = Math.min(x1, W + 20);
  if (a > b) return;
  p.c(pal.faint);
  if (scene === 'kathmandu') {
    // the Himalaya: a ridge with snow lines under each peak
    let prev: number[] | null = null;
    for (let x = Math.floor((a - x0) / 6) * 6 + x0; x <= b + 6; x += 6) {
      const k = Math.round((x - x0) / 6) + seed;
      const y = G - 44 - Math.round(16 * Math.abs(Math.sin(k * 0.55)) + 10 * hash(k) + wob(k, boil));
      if (prev) p.line(prev[0], prev[1], x, y);
      const ny = G - 44 - Math.round(16 * Math.abs(Math.sin((k + 1) * 0.55)) + 10 * hash(k + 1));
      const py = G - 44 - Math.round(16 * Math.abs(Math.sin((k - 1) * 0.55)) + 10 * hash(k - 1));
      if (y < ny && y < py && y < G - 60) {
        p.line(x - 3, y + 4, x - 1, y + 6);
        p.line(x - 1, y + 6, x + 1, y + 4);
        p.line(x + 1, y + 4, x + 3, y + 6);
      }
      prev = [x, y];
    }
  } else if (scene === 'ohio') {
    p.h(a, b, G - 22);
    for (let x = Math.floor((a - x0) / 26) * 26 + x0; x <= b; x += 26) {
      const k = Math.round((x - x0) / 26) + seed;
      if (hash(k) > 0.4) {
        const r = 4 + Math.round(hash(k * 2) * 4);
        for (let ang = Math.PI; ang <= Math.PI * 2; ang += 0.2) p.px(x + Math.cos(ang) * r, G - 22 + Math.sin(ang) * r);
      }
      if (k % 9 === 4) {
        // water tower
        p.v(x - 4, G - 22, G - 34); p.v(x + 4, G - 22, G - 34);
        p.box(x - 7, G - 44, 15, 10);
        p.line(x - 7, G - 44, x, G - 48); p.line(x, G - 48, x + 7, G - 44);
      }
    }
  } else {
    // rooftops and skyline
    const tall = scene === 'city';
    for (let x = Math.floor((a - x0) / 18) * 18 + x0; x <= b; x += 18) {
      const k = Math.round((x - x0) / 18) + seed;
      const h = (tall ? 30 : 14) + Math.round(hash(k) * (tall ? 46 : 18));
      const w = 12 + Math.round(hash(k * 3) * 10);
      p.box(x, G - 18 - h, w, h + 1);
      if (tall) {
        for (let j = G - 14 - h; j < G - 22; j += 6) {
          if (hash(k * 5 + j) > 0.55) p.px(x + 3 + ((j * 7) % (w - 6)), j);
        }
      } else if (hash(k * 7) > 0.5) {
        p.c(pal.yellow).rect(x + 4, G - 12 - h, 2, 2);
        p.c(pal.faint);
      }
    }
  }
  // a few drifting clouds in every scene
  for (let i = 0; i < 3; i++) {
    const cx = x0 + ((hash(seed + i) * (x1 - x0) + t * 3) % Math.max(1, x1 - x0));
    if (cx > a - 30 && cx < b) cloud(p, pal, cx, 30 + hash(seed * 3 + i) * 30, 1, pal.faint);
  }
}

/** Middle layer: hills, houses, fences. */
export function mid(p: Pen, pal: Pal, scene: string, x0: number, x1: number, seed: number, night: number) {
  const a = Math.max(x0, -40), b = Math.min(x1, W + 40);
  if (a > b) return;
  p.c(pal.mid);
  if (scene === 'kathmandu' || scene === 'remote') {
    for (let x = Math.floor((a - x0) / 34) * 34 + x0; x <= b; x += 34) {
      const k = Math.round((x - x0) / 34) + seed;
      if (hash(k) < 0.35) continue;
      const h = 10 + Math.round(hash(k * 2) * 10), w = 16 + Math.round(hash(k * 4) * 8);
      p.c(pal.bg).rect(x, G - 8 - h, w, h);
      p.c(pal.mid).box(x, G - 8 - h, w, h + 1);
      p.line(x - 2, G - 8 - h, x + w / 2, G - 14 - h);
      p.line(x + w / 2, G - 14 - h, x + w + 1, G - 8 - h);
      const lit = scene === 'remote' || night > 0.5;
      p.c(lit && hash(k * 9) > 0.3 ? pal.yellow : pal.mid).rect(x + 4, G - 4 - h, 3, 3);
      p.c(pal.mid);
    }
  } else if (scene === 'ohio') {
    for (let x = Math.floor((a - x0) / 10) * 10 + x0; x <= b; x += 10) p.v(x, G - 9, G - 3);
    p.h(a, b, G - 8); p.h(a, b, G - 5);
  } else {
    for (let x = Math.floor((a - x0) / 40) * 40 + x0; x <= b; x += 40) {
      const k = Math.round((x - x0) / 40) + seed;
      const h = 22 + Math.round(hash(k) * 22), w = 22;
      p.c(pal.bg).rect(x, G - 4 - h, w, h);
      p.c(pal.mid).box(x, G - 4 - h, w, h + 1);
      for (let j = G - h; j < G - 8; j += 6) for (let i = x + 4; i < x + w - 4; i += 6) {
        p.c(night > 0.5 && hash(i * j) > 0.6 ? pal.yellow : pal.mid).rect(i, j, 2, 2);
      }
      p.c(pal.mid);
    }
  }
}

// ---------------------------------------------------------------- ground

export function ground(p: Pen, pal: Pal, scene: string, x0: number, x1: number, worldX0: number, boil: number) {
  const a = Math.max(Math.floor(x0), -8), b = Math.min(Math.ceil(x1), W + 8);
  if (a >= b) return;
  p.c(pal.line);
  for (let x = a; x < b; x += 8) {
    const k = Math.floor((x - x0 + worldX0) / 8);
    p.h(x, Math.min(x + 7, b), G + wob(k, boil));
  }
  p.c(pal.faint);
  for (let x = a - ((a - x0 + worldX0) % 9 + 9) % 9; x < b; x += 9) {
    const k = Math.floor((x - x0 + worldX0) / 9);
    if (hash(k) < 0.6) p.line(x, G + 6, x + 3, G + 3);
    if (scene === 'city' && hash(k * 3) > 0.5) p.h(x, x + 4, G + 10);
    if (scene === 'ohio' && hash(k * 5) > 0.55) { p.c(pal.green).v(x + 1, G - 2, G - 1); p.v(x + 3, G - 3, G - 1); p.c(pal.faint); }
  }
}

export function runway(p: Pen, pal: Pal, x0: number, x1: number) {
  p.c(pal.mid);
  p.dashH(Math.max(x0, -6), Math.min(x1, W + 6), G + 7, 6, 5);
  p.c(pal.yellow);
  for (let x = Math.ceil(x0 / 1) ; x < x1; x += 30) if (x > -4 && x < W + 4) p.rect(x, G - 1, 2, 1);
}

// ---------------------------------------------------------------- buildings

export const BUILDING_W: Record<string, number> = {
  college: 112, homeoffice: 86, tower: 116, office: 88, airport: 160, university: 132,
};

function door(p: Pen, pal: Pal, cx: number, w = 14, h = 22) {
  p.panel(cx - w / 2, G - h, w, h + 1, pal.bg, pal.line);
  p.c(pal.line).v(cx, G - h + 1, G);
  p.px(cx - 2, G - h / 2); p.px(cx + 2, G - h / 2);
}

export function building(p: Pen, pal: Pal, type: string, sx: number, sign: string, note: string | undefined, t: number, night: number) {
  const w = BUILDING_W[type] ?? 90;
  const mid = sx + w / 2;
  const L = pal.line, F = pal.fill;
  if (type === 'college') {
    const top = G - 48;
    p.panel(sx, top, w, 49, F, L);
    p.tri(sx - 5, top, mid, top - 18, sx + w + 5, top, F, L);
    p.c(L).h(sx - 5, sx + w + 4, top);
    p.text(sign, mid, top - 9, 'center');
    for (let i = 0; i < 6; i++) {
      const cx = Math.round(sx + 9 + i * ((w - 18) / 5));
      if (Math.abs(cx - mid) < 12) continue;
      p.panel(cx - 2, top + 4, 5, 42, F, L);
      p.c(L).h(cx - 3, cx + 3, top + 4);
    }
    p.c(L).h(sx - 3, sx + w + 2, G - 2);
    door(p, pal, mid, 16, 24);
    // flag on the roof
    p.c(L).v(mid, top - 32, top - 18);
    const wv = Math.round(Math.sin(t * 4));
    p.c(pal.yellow).rect(mid + 1, top - 32 + wv, 8, 5);
    p.c(L).box(mid + 1, top - 32 + wv, 8, 5);
    if (note) {
      // closed sign, taped across the door
      p.c(L).line(mid - 7, G - 23, mid + 7, G - 2);
      p.line(mid + 7, G - 23, mid - 7, G - 2);
      const bw = textWidth(note) + 6;
      p.panel(mid - bw / 2, G - 34, bw, 9, pal.yellow, L);
      p.c('#2b2614').text(note, mid, G - 32, 'center');
    }
  } else if (type === 'homeoffice') {
    // a room with the front wall cut away, lit by a laptop at night
    p.panel(sx, G - 44, w, 45, F, L);
    p.tri(sx - 6, G - 44, mid, G - 64, sx + w + 6, G - 44, F, L);
    p.c(L).text(sign, mid, G - 53, 'center');
    if (note) p.c(pal.mid).text(note, mid, G - 40, 'center');
    // window with the moon
    p.panel(sx + 8, G - 32, 18, 14, pal.bg, L);
    p.c(L).circle(sx + 17, G - 25, 3);
    // desk, laptop, chair
    p.c(L).h(sx + 40, sx + 78, G - 14);
    p.v(sx + 42, G - 13, G); p.v(sx + 76, G - 13, G);
    p.panel(sx + 50, G - 30, 22, 15, L, L);
    p.c(pal.yellow).text('</>', sx + 61, G - 25, 'center');
    p.c(L).h(sx + 47, sx + 75, G - 15);
    p.box(sx + 30, G - 18, 8, 8);
    p.v(sx + 31, G - 10, G); p.v(sx + 36, G - 10, G);
    // lamp glow
    p.c(pal.yellow).rect(sx + 74, G - 26, 3, 3);
    p.c(L).v(sx + 75, G - 23, G - 15);
  } else if (type === 'tower') {
    const top = G - 128;
    p.panel(sx, top, w, 129, F, L);
    p.c(L).h(sx, sx + w - 1, top + 12);
    p.text(sign, mid, top + 4, 'center');
    for (let y = top + 18; y < G - 32; y += 8) {
      for (let x = sx + 7; x < sx + w - 10; x += 9) {
        const k = x * 31 + y * 17;
        if (hash(k) > 0.72) p.c(pal.yellow).rect(x, y, 5, 4);
        p.c(pal.mid).box(x, y, 5, 4);
      }
    }
    p.c(L).h(sx - 6, sx + w + 5, G - 26);
    p.panel(mid - 18, G - 24, 36, 25, pal.bg, L);
    p.c(L).v(mid - 6, G - 23, G); p.v(mid + 6, G - 23, G);
    p.c(L).v(sx + w - 20, top - 16, top);
    if (Math.floor(t * 2) % 2) p.c(pal.red).rect(sx + w - 21, top - 18, 3, 2);
  } else if (type === 'office') {
    const top = G - 92;
    p.panel(sx, top, w, 93, F, L);
    p.c(pal.mid);
    for (let y = top + 16; y < G - 26; y += 9) p.h(sx + 1, sx + w - 2, y);
    for (let x = sx + 11; x < sx + w - 2; x += 11) p.v(x, top + 16, G - 27);
    p.panel(mid - 22, top + 4, 44, 9, pal.yellow, L);
    p.c('#2b2614').text(sign, mid, top + 6, 'center');
    p.c(L).h(sx, sx + w - 1, G - 26);
    door(p, pal, mid, 18, 24);
    // plant by the door
    p.c(L).box(sx + w - 18, G - 7, 8, 7);
    p.c(pal.green).disc(sx + w - 14, G - 12, 5);
    p.c(L).circle(sx + w - 14, G - 12, 5);
  } else if (type === 'airport') {
    const top = G - 38;
    p.panel(sx, top, 130, 39, F, L);
    p.c(L).h(sx - 6, sx + 135, top);
    p.panel(sx + 6, top + 8, 118, 14, pal.bg, L);
    p.c(pal.mid);
    for (let x = sx + 14; x < sx + 122; x += 8) p.v(x, top + 9, top + 20);
    const bw = textWidth(sign) + 8;
    p.panel(sx + 65 - bw / 2, top - 11, bw, 9, pal.yellow, L);
    p.c('#2b2614').text(sign, sx + 65, top - 9, 'center');
    door(p, pal, sx + 65, 20, 14);
    // control tower
    p.panel(sx + 138, G - 80, 12, 81, F, L);
    p.panel(sx + 132, G - 94, 24, 14, F, L);
    p.c(pal.mid);
    for (let x = sx + 136; x < sx + 154; x += 5) p.v(x, G - 91, G - 83);
    p.c(L).v(sx + 144, G - 104, G - 94);
    if (Math.floor(t * 2) % 2) p.c(pal.red).rect(sx + 143, G - 106, 3, 2);
  } else if (type === 'university') {
    const top = G - 54;
    p.panel(sx, top, w, 55, F, L);
    p.c(pal.faint);
    for (let y = top + 4, r = 0; y < G - 2; y += 4, r++) for (let x = sx + (r % 2 ? 2 : 6); x < sx + w - 6; x += 8) p.h(x, x + 4, y);
    // tower with a clock
    p.panel(mid - 15, G - 84, 30, 31, F, L);
    p.tri(mid - 18, G - 84, mid, G - 98, mid + 18, G - 84, F, L);
    p.c(L).circle(mid, G - 72, 6);
    const a = t * 0.6;
    p.line(mid, G - 72, mid + Math.cos(a) * 4, G - 72 + Math.sin(a) * 4);
    p.line(mid, G - 72, mid, G - 76);
    // arched windows
    for (const x of [sx + 10, sx + 26, sx + 42, sx + w - 52, sx + w - 36, sx + w - 20]) {
      p.panel(x, top + 14, 9, 13, pal.bg, L);
      p.c(pal.bg).rect(x + 1, top + 13, 7, 1);
      p.c(L).h(x + 2, x + 6, top + 12);
      p.px(x + 1, top + 13); p.px(x + 7, top + 13);
    }
    const bw = textWidth(sign) + 8;
    p.panel(mid - bw / 2, top - 1 + 12, bw, 9, pal.yellow, L);
    p.c('#2b2614').text(sign, mid, top + 13, 'center');
    door(p, pal, mid, 18, 24);
  }
}

// ---------------------------------------------------------------- props

export const PROP_W: Record<string, number> = {
  stupa: 66, flags: 90, desk: 96, familyhome: 84, whiteboard: 38, apartment: 128, mirror: 14, studytable: 44, lamp: 8, tree: 24,
};

export function prop(
  p: Pen, pal: Pal, type: string, sx: number, t: number, night: number,
  opts: { lit?: number[]; door?: number; hutDoor?: number; figures?: boolean; unpacked?: boolean; lamp?: boolean } = {},
) {
  const L = pal.line, F = pal.fill;
  if (type === 'stupa') {
    const cx = sx + 33;
    p.panel(sx, G - 6, 66, 7, F, L);
    p.panel(sx + 6, G - 11, 54, 6, F, L);
    p.c(F);
    for (let j = -21; j <= 0; j++) { const hw = Math.floor(Math.sqrt(441 - j * j)); p.h(cx - hw, cx + hw, G - 11 + j); }
    p.c(L);
    for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += 0.02) p.px(cx + Math.cos(a) * 21, G - 11 + Math.sin(a) * 21);
    p.panel(cx - 8, G - 40, 17, 9, F, L);
    p.c(L).h(cx - 6, cx - 3, G - 37); p.h(cx + 3, cx + 6, G - 37);
    p.px(cx - 4, G - 36); p.px(cx + 4, G - 36);
    p.px(cx, G - 35); p.px(cx - 1, G - 34);
    p.tri(cx - 7, G - 40, cx, G - 62, cx + 7, G - 40, pal.yellow, L);
    p.c(L);
    for (let y = G - 58; y < G - 40; y += 3) {
      const hw = Math.round(((y - (G - 62)) / 22) * 7);
      p.h(cx - hw, cx + hw, y);
    }
    // prayer flag lines from the spire
    const cols = [pal.blue, F, pal.red, pal.green, pal.yellow];
    for (const side of [-1, 1]) {
      p.c(pal.mid).line(cx, G - 60, cx + side * 34, G - 6);
      for (let i = 1; i < 10; i++) {
        const x = cx + side * i * 3.4, y = G - 60 + i * 5.4 + Math.round(Math.sin(t * 3 + i) * 0.6);
        p.c(cols[i % 5]).rect(x - 1, y + 1, 3, 3);
      }
    }
  } else if (type === 'flags') {
    p.c(L).v(sx, G - 40, G); p.v(sx + 88, G - 40, G);
    const cols = [pal.blue, F, pal.red, pal.green, pal.yellow];
    for (let i = 0; i <= 88; i += 2) {
      const sag = Math.round(10 * Math.sin((i / 88) * Math.PI));
      p.c(L).px(sx + i, G - 40 + sag);
      if (i % 8 === 4 && i < 86) {
        const wv = Math.round(Math.sin(t * 3 + i * 0.4));
        p.c(cols[(i / 8) % 5 | 0]).rect(sx + i - 2, G - 39 + sag, 5, 5 + wv);
        p.c(L).box(sx + i - 2, G - 39 + sag, 5, 5 + wv);
      }
    }
  } else if (type === 'desk') {
    // a Kathmandu room with the front wall cut away: one laptop, two windows open
    const w = 96;
    p.panel(sx, G - 46, w, 47, F, L);
    p.c(L).h(sx - 3, sx + w + 2, G - 46); p.h(sx - 3, sx + w + 2, G - 49);
    p.v(sx - 3, G - 49, G - 46); p.v(sx + w + 2, G - 49, G - 46);
    // wall clock
    p.circle(sx + 14, G - 34, 5);
    const a = t * 5;
    p.line(sx + 14, G - 34, sx + 14 + Math.cos(a) * 3, G - 34 + Math.sin(a) * 3);
    p.line(sx + 14, G - 34, sx + 14, G - 37);
    // desk and laptop
    p.c(L).h(sx + 26, sx + 88, G - 13);
    p.v(sx + 28, G - 12, G); p.v(sx + 86, G - 12, G);
    p.panel(sx + 33, G - 38, 50, 24, L, L);
    p.panel(sx + 35, G - 36, 22, 18, F, L);
    p.panel(sx + 59, G - 36, 22, 18, F, L);
    p.c(pal.blue).rect(sx + 36, G - 35, 20, 3);
    p.c(pal.yellow).rect(sx + 60, G - 35, 20, 3);
    p.c(L).text('CLASS', sx + 46, G - 30, 'center');
    p.text('WORK', sx + 70, G - 30, 'center');
    p.c(pal.mid).h(sx + 38, sx + 53, G - 23); p.h(sx + 62, sx + 77, G - 23);
    p.c(L).h(sx + 30, sx + 86, G - 14);
    // chair
    p.box(sx + 50, G - 10, 10, 6);
    p.v(sx + 51, G - 4, G); p.v(sx + 58, G - 4, G);
    if (night > 0.5) p.c(pal.yellow).rect(sx + 4, G - 24, 4, 4);
  } else if (type === 'familyhome') {
    // A Kathmandu house: two floors, a terrace with a stair hut, and a black water tank.
    const w = 84, top = G - 56;
    p.panel(sx, top, w, 57, F, L);
    p.c(L).h(sx, sx + w - 1, G - 28);
    // terrace railing
    p.c(L).h(sx - 2, sx + w + 1, top);
    p.h(sx - 2, sx + w + 1, top - 5);
    for (let x = sx - 2; x <= sx + w + 1; x += 6) p.v(x, top - 5, top);
    // stair hut on the left of the terrace, with its own little door
    p.panel(sx + 4, top - 18, 24, 18, F, L);
    p.c(L).h(sx + 2, sx + 29, top - 18);
    p.panel(sx + 12, top - 13, 9, 13, (opts.hutDoor ?? 0) > 0.5 ? L : pal.bg, L);
    // water tank
    p.panel(sx + 62, top - 17, 13, 12, L, L);
    p.c(F).h(sx + 63, sx + 73, top - 14);
    p.c(L).v(sx + 64, top - 5, top - 1); p.v(sx + 73, top - 5, top - 1);
    // windows: lit ones glow, and at night the family shows as shapes inside
    const wins = [[sx + 8, G - 22], [sx + 34, G - 22], [sx + 8, top + 8], [sx + 34, top + 8], [sx + 58, top + 8]];
    const lit = opts.lit ?? (night > 0.5 ? [0, 1, 2, 3, 4] : []);
    wins.forEach(([x, y], i) => {
      const on = lit.includes(i);
      p.panel(x, y, 14, 12, on ? pal.yellow : pal.bg, L);
      if (on && opts.figures && (i === 1 || i === 3 || i === 4)) {
        p.c('#2b2614');
        const fx = x + 4 + (i % 2) * 2;
        p.rect(fx, y + 4, 4, 3); p.rect(fx - 1, y + 7, 6, 4);
        if (i === 1) { p.rect(fx + 6, y + 6, 3, 2); p.rect(fx + 5, y + 8, 5, 3); }
      }
      p.c(L).v(x + 7, y, y + 11);
    });
    // front door, open or shut
    const open = opts.door ?? 0;
    if (open > 0.5) {
      p.panel(sx + 61, G - 22, 14, 23, L, L);
      p.c(pal.yellow).rect(sx + 63, G - 20, 10, 2);
    } else door(p, pal, sx + 68, 14, 22);
    // prayer flags from the tank to the stair hut
    const cols = [pal.blue, F, pal.red, pal.green, pal.yellow];
    for (let i = 0; i < 8; i++) {
      const x = sx + 30 + i * 4, y = top - 17 + Math.round(Math.sin(i / 2.5) * 2 + i * 0.3);
      p.c(cols[i % 5]).rect(x, y, 3, 3);
    }
  } else if (type === 'whiteboard') {
    p.c(L).v(sx + 4, G - 30, G); p.v(sx + 33, G - 30, G);
    p.panel(sx, G - 34, 38, 22, F, L);
    p.c(pal.blue).box(sx + 4, G - 30, 8, 6);
    p.c(pal.red).line(sx + 13, G - 27, sx + 20, G - 27);
    p.line(sx + 18, G - 29, sx + 20, G - 27); p.line(sx + 18, G - 25, sx + 20, G - 27);
    p.c(pal.green).box(sx + 22, G - 30, 10, 6);
    p.c(pal.mid).h(sx + 4, sx + 30, G - 20); p.h(sx + 4, sx + 22, G - 17);
    p.c(L).h(sx + 2, sx + 35, G - 12);
  } else if (type === 'apartment') {
    const w = 128, top = G - 50;
    p.panel(sx, top, w, 51, F, L);
    p.c(L).h(sx - 3, sx + w + 2, top);
    p.v(sx + 44, top + 1, G); p.v(sx + 88, top + 1, G);
    // bed
    p.panel(sx + 6, G - 12, 32, 8, F, L);
    p.panel(sx + 8, G - 16, 9, 5, F, L);
    p.c(L).v(sx + 6, G - 4, G); p.v(sx + 37, G - 4, G);
    // window
    p.panel(sx + 14, top + 8, 18, 14, pal.bg, L);
    p.c(L).v(sx + 23, top + 8, top + 21);
    // stove and a pot, still smoking
    p.panel(sx + 52, G - 16, 26, 16, F, L);
    p.c(L).h(sx + 54, sx + 75, G - 12);
    p.panel(sx + 58, G - 22, 14, 6, L, L);
    p.c(pal.mid);
    for (let i = 0; i < 3; i++) {
      const y = G - 26 - i * 5 - ((t * 8) % 5);
      p.px(sx + 63 + Math.round(Math.sin(t * 2 + i) * 2), y);
      p.px(sx + 64 + Math.round(Math.sin(t * 2 + i + 1) * 2), y - 2);
    }
    // laundry pile
    const cols = [pal.blue, pal.red, pal.green, pal.yellow, pal.mid];
    for (let i = 0; i < 18; i++) {
      const x = sx + 96 + (i % 6) * 4 + (Math.floor(i / 6) % 2) * 2, y = G - 4 - Math.floor(i / 6) * 4;
      p.c(cols[i % 5]).rect(x, y, 4, 3);
    }
    p.c(L).h(sx + 94, sx + 122, G);
    // lamp
    p.c(L).v(sx + 120, G - 26, G);
    p.c(pal.yellow).rect(sx + 117, G - 30, 7, 4);
    if (opts.unpacked) {
      p.panel(sx + 39, G - 9, 7, 9, pal.redShade, L);
      p.c(L).box(sx + 41, G - 11, 3, 2);
    }
  } else if (type === 'studytable') {
    p.c(L).h(sx, sx + 43, G - 12);
    p.v(sx + 2, G - 11, G); p.v(sx + 41, G - 11, G);
    p.c(pal.red).rect(sx + 6, G - 15, 10, 3);
    p.c(pal.blue).rect(sx + 7, G - 18, 9, 3);
    p.c(pal.green).rect(sx + 26, G - 15, 8, 3);
    p.c(L).box(sx + 18, G - 16, 6, 4);
    p.v(sx + 36, G - 22, G - 13);
    p.c(pal.yellow).rect(sx + 34, G - 25, 6, 3);
  } else if (type === 'lamp') {
    p.c(L).v(sx + 3, G - 38, G);
    p.h(sx + 3, sx + 8, G - 38);
    p.c(night > 0.3 || opts.lamp ? pal.yellow : pal.mid).rect(sx + 6, G - 37, 4, 3);
  } else if (type === 'tree') {
    p.c(L).v(sx + 11, G - 14, G); p.v(sx + 12, G - 14, G);
    p.c(F).disc(sx + 12, G - 24, 11);
    p.c(L).circle(sx + 12, G - 24, 11);
    p.c(pal.green);
    for (let i = 0; i < 6; i++) p.line(sx + 6 + i * 2, G - 24 + (i % 2) * 3, sx + 8 + i * 2, G - 22 + (i % 2) * 3);
  }
}

/** A standing mirror. The engine draws the reflection inside the frame. */
export function mirrorFrame(p: Pen, pal: Pal, sx: number) {
  p.c(pal.line).box(sx, G - 26, 14, 24);
  p.box(sx + 1, G - 25, 12, 22);
  p.v(sx + 3, G - 2, G); p.v(sx + 10, G - 2, G);
}

export function kiosk(p: Pen, pal: Pal, sx: number, done: boolean, t: number) {
  const L = pal.line;
  p.panel(sx, G - 26, 32, 27, pal.fill, L);
  for (let i = 0; i < 4; i++) p.c(i % 2 ? pal.fill : pal.red).rect(sx - 2 + i * 9, G - 32, 9, 5);
  p.c(L).box(sx - 2, G - 32, 36, 6);
  p.text('BANK', sx + 16, G - 22, 'center');
  p.panel(sx + 8, G - 15, 16, 9, pal.bg, L);
  if (done) {
    const bob = Math.round(Math.sin(t * 4));
    p.panel(sx + 13, G - 14 + bob, 6, 8, pal.fill, L);
    p.c(pal.yellow).rect(sx + 14, G - 13 + bob, 4, 4);
    p.c(pal.green).line(sx + 26, G - 40, sx + 28, G - 38);
    p.line(sx + 28, G - 38, sx + 32, G - 43);
  }
}

export function gate(p: Pen, pal: Pal, sx: number, open: number) {
  const L = pal.line;
  // the bar points back at the player and swings up as `open` goes from 0 to 1
  const a = open * (Math.PI / 2);
  const len = 26;
  p.c(L);
  for (let i = 2; i <= len; i++) {
    const x = sx - Math.cos(a) * i, y = G - 15 - Math.sin(a) * i;
    p.c(L).rect(x - 1, y - 2, 3, 5);
  }
  for (let i = 2; i < len; i++) {
    const x = sx - Math.cos(a) * i, y = G - 15 - Math.sin(a) * i;
    p.c(Math.floor(i / 4) % 2 ? pal.red : pal.fill).rect(x, y - 1, 1, 3);
  }
  p.panel(sx - 2, G - 18, 5, 19, pal.fill, L);
}

export function plane(p: Pen, pal: Pal, sx: number, y: number, gear: boolean, t: number) {
  const L = pal.line, F = pal.fill;
  // tail
  p.tri(sx, y - 10, sx + 6, y - 22, sx + 14, y - 10, F, L);
  // body
  p.panel(sx, y - 12, 56, 10, F, L);
  p.c(F).rect(sx + 55, y - 11, 4, 8);
  p.c(L).line(sx + 56, y - 12, sx + 62, y - 7);
  p.line(sx + 62, y - 7, sx + 56, y - 3);
  p.c(pal.blue).h(sx + 2, sx + 55, y - 5);
  p.c(L);
  for (let x = sx + 14; x < sx + 50; x += 5) p.rect(x, y - 10, 2, 2);
  p.panel(sx + 52, y - 10, 4, 3, pal.bg, L);
  // wing and engine
  p.c(L).line(sx + 22, y - 5, sx + 34, y + 3);
  p.line(sx + 34, y + 3, sx + 40, y + 3);
  p.line(sx + 40, y + 3, sx + 34, y - 5);
  p.panel(sx + 30, y - 2, 8, 4, F, L);
  if (gear) {
    p.c(L).v(sx + 16, y - 2, y); p.v(sx + 44, y - 2, y);
    p.rect(sx + 15, y - 1, 3, 2); p.rect(sx + 43, y - 1, 3, 2);
  }
  void t;
}

export function biplane(p: Pen, pal: Pal, sx: number, y: number, t: number) {
  const L = pal.line;
  p.c(L).h(sx, sx + 16, y);
  p.h(sx + 3, sx + 13, y - 5); p.h(sx + 3, sx + 13, y + 3);
  p.v(sx + 5, y - 5, y + 3); p.v(sx + 11, y - 5, y + 3);
  p.line(sx, y, sx - 3, y - 3);
  p.c(Math.floor(t * 10) % 2 ? L : pal.mid).v(sx + 17, y - 2, y + 2);
}

export function sequel(p: Pen, pal: Pal, sx: number, n: number, poster: string[]) {
  const L = pal.line;
  p.c(pal.mid).dashBox(sx, G - 96, 104, 97);
  p.dashH(sx - 8, sx + 112, G - 96);
  door(p, pal, sx + 52, 18, 26);
  const label = `LEVEL ${n}`;
  const bw = textWidth(label) + 8;
  p.panel(sx + 52 - bw / 2, G - 38, bw, 9, pal.yellow, L);
  p.c('#2b2614').text(label, sx + 52, G - 36, 'center');
  // poster
  const pw = Math.max(...poster.map(textWidth)) + 8;
  p.panel(sx + 80, G - 74, pw, 8 + poster.length * 8, pal.fill, L);
  p.c(L);
  poster.forEach((line, i) => p.text(line, sx + 80 + pw / 2, G - 70 + i * 8, 'center'));
}

// ---------------------------------------------------------------- bosses

export function boss(p: Pen, pal: Pal, look: string, cx: number, hp: number, t: number, hit: number) {
  const L = hit > 0 ? pal.red : pal.line, F = pal.fill;
  const y = G + (hit > 0 ? 2 : 0);
  const angry = (x: number, yy: number) => {
    p.c(L).line(x - 5, yy - 2, x - 2, yy); p.line(x + 5, yy - 2, x + 2, yy);
    p.rect(x - 4, yy + 1, 2, 2); p.rect(x + 3, yy + 1, 2, 2);
  };
  if (look === 'clock') {
    const cy = y - 15;
    p.c(F).disc(cx, cy, 11);
    p.c(L).circle(cx, cy, 11); p.circle(cx, cy, 10);
    p.rect(cx - 9, cy - 13, 4, 3); p.rect(cx + 6, cy - 13, 4, 3);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; p.px(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); }
    p.c(pal.red);
    p.line(cx, cy + 2, cx + Math.cos(t * 9) * 7, cy + 2 + Math.sin(t * 9) * 7);
    p.c(L).line(cx, cy + 2, cx + Math.cos(t * 1.3) * 4, cy + 2 + Math.sin(t * 1.3) * 4);
    angry(cx, cy - 5);
    p.c(L).line(cx - 5, y - 4, cx - 7, y); p.line(cx + 5, y - 4, cx + 7, y);
  } else if (look === 'outage') {
    const cy = y - 20 + Math.round(Math.sin(t * 3));
    p.c(F);
    p.disc(cx - 7, cy, 6); p.disc(cx, cy - 4, 8); p.disc(cx + 8, cy, 6); p.rect(cx - 12, cy, 25, 6);
    p.c(L);
    for (const [x, yy, r] of [[cx - 7, cy, 6], [cx, cy - 4, 8], [cx + 8, cy, 6]]) for (let a = Math.PI; a <= Math.PI * 2; a += 0.1) p.px(x + Math.cos(a) * r, yy + Math.sin(a) * r);
    p.h(cx - 13, cx + 14, cy + 6); p.v(cx - 13, cy, cy + 6); p.v(cx + 14, cy, cy + 6);
    angry(cx, cy - 2);
    p.c(pal.yellow);
    const z = [[cx - 2, cy + 7], [cx + 2, cy + 12], [cx - 1, cy + 12], [cx + 3, G]];
    for (let i = 0; i < 3; i++) p.line(z[i][0], z[i][1], z[i + 1][0], z[i + 1][1]);
  } else if (look === 'records') {
    const top = y - 24;
    p.panel(cx - 10, top + 3, 21, 20, F, L);
    for (let k = 0; k < 4; k++) {
      const yy = top + 3 + k * 6;
      p.c(F).rect(cx - 9, yy - 2, 19, 3);
      p.c(L).h(cx - 8, cx + 8, yy - 3); p.h(cx - 8, cx + 8, yy + 1);
      p.px(cx - 9, yy - 2); p.px(cx + 9, yy - 2); p.px(cx - 9, yy); p.px(cx + 9, yy);
    }
    angry(cx, top + 11);
    p.c(L).line(cx - 5, y - 1, cx - 7, y); p.line(cx + 5, y - 1, cx + 7, y);
  } else if (look === 'queue') {
    // one paper ticket per hit point; the front one has the face
    for (let i = hp - 1; i >= 0; i--) {
      const x = cx - 8 + i * 7, yy = y - 18 - i * 2;
      p.panel(x, yy, 17, 18, F, L);
      p.c(pal.mid).h(x + 3, x + 13, yy + 13); p.h(x + 3, x + 10, yy + 15);
    }
    angry(cx, y - 13);
    p.c(L).text('3D', cx, y - 5, 'center');
  } else {
    p.c(F).disc(cx, y - 8, 9);
    p.c(L).circle(cx, y - 8, 9);
    angry(cx, y - 10);
  }
}
