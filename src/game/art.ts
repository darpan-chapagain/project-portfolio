// Pixel art for /play: a theme-aware palette, a tiny pen, a 3x5 font and the people.
// Everything is drawn from text, so there are no image files to load.

export const W = 320;
export const H = 180;
export const G = 146; // ground line

export type Pal = {
  dark: boolean;
  bg: string;
  line: string;
  mid: string;
  fill: string;
  soft: string;
  faint: string;
  yellow: string;
  red: string;
  blue: string;
  green: string;
  shade: string;
};

/** Read the site's own colours so the game follows the light or dark theme. */
export function readPal(): Pal {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const v = (n: string, d: string) => cs.getPropertyValue(n).trim() || d;
  const dark = root.dataset.theme === 'dark';
  const rgb = v('--paper-rgb', dark ? '232 225 209' : '28 25 21').split(/[\s,]+/).map(Number);
  const a = (alpha: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
  return {
    dark,
    bg: v('--ink', dark ? '#15130f' : '#ece5d5'),
    line: v('--paper', dark ? '#e8e1d1' : '#1c1915'),
    mid: v('--chalk-2', dark ? '#9d968a' : '#7d7668'),
    fill: dark ? v('--ink-2', '#1f1c17') : v('--card', '#fbf8f0'),
    soft: a(dark ? 0.07 : 0.06),
    faint: a(dark ? 0.16 : 0.14),
    yellow: '#ecd96f',
    red: dark ? '#d9795f' : '#b9553f',
    blue: dark ? '#86a3c7' : '#5f7fa8',
    green: dark ? '#8fb487' : '#5f8a5a',
    shade: dark ? 'rgba(0,0,0,0.5)' : 'rgba(28,25,21,0.42)',
  };
}

// ---------------------------------------------------------------- pen

export class Pen {
  x: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.x = ctx;
  }
  c(col: string) {
    this.x.fillStyle = col;
    return this;
  }
  px(x: number, y: number) {
    this.x.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  rect(x: number, y: number, w: number, h: number) {
    this.x.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  h(x0: number, x1: number, y: number) {
    const a = Math.round(Math.min(x0, x1));
    const b = Math.round(Math.max(x0, x1));
    this.x.fillRect(a, Math.round(y), b - a + 1, 1);
  }
  v(x: number, y0: number, y1: number) {
    const a = Math.round(Math.min(y0, y1));
    const b = Math.round(Math.max(y0, y1));
    this.x.fillRect(Math.round(x), a, 1, b - a + 1);
  }
  line(x0: number, y0: number, x1: number, y1: number) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (let i = 0; i < 2000; i++) {
      this.x.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  box(x: number, y: number, w: number, h: number) {
    this.h(x, x + w - 1, y);
    this.h(x, x + w - 1, y + h - 1);
    this.v(x, y, y + h - 1);
    this.v(x + w - 1, y, y + h - 1);
  }
  /** A filled box with an ink outline. */
  panel(x: number, y: number, w: number, h: number, fill: string, line: string) {
    this.c(fill).rect(x, y, w, h);
    this.c(line).box(x, y, w, h);
  }
  dashH(x0: number, x1: number, y: number, on = 3, off = 3) {
    for (let x = Math.round(x0); x <= x1; x += on + off) this.h(x, Math.min(x + on - 1, x1), y);
  }
  dashBox(x: number, y: number, w: number, h: number) {
    this.dashH(x, x + w - 1, y);
    this.dashH(x, x + w - 1, y + h - 1);
    for (let j = Math.round(y); j < y + h; j += 6) {
      this.v(x, j, Math.min(j + 2, y + h - 1));
      this.v(x + w - 1, j, Math.min(j + 2, y + h - 1));
    }
  }
  circle(cx: number, cy: number, r: number) {
    cx = Math.round(cx); cy = Math.round(cy);
    let x = r, y = 0, d = 1 - r;
    while (x >= y) {
      for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) this.px(cx + a, cy + b);
      y++;
      if (d < 0) d += 2 * y + 1;
      else { x--; d += 2 * (y - x) + 1; }
    }
  }
  disc(cx: number, cy: number, r: number) {
    for (let j = -r; j <= r; j++) {
      const w = Math.floor(Math.sqrt(r * r - j * j));
      this.h(cx - w, cx + w, cy + j);
    }
  }
  /** Filled triangle by scanlines, then an outline on top if `line` is given. */
  tri(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, fill: string, line?: string) {
    const pts = [[ax, ay], [bx, by], [cx, cy]].sort((p, q) => p[1] - q[1]);
    const [p0, p1, p2] = pts;
    const edge = (a: number[], b: number[], y: number) => (b[1] === a[1] ? a[0] : a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]));
    this.c(fill);
    for (let y = Math.ceil(p0[1]); y <= p2[1]; y++) {
      const xa = edge(p0, p2, y);
      const xb = y < p1[1] ? edge(p0, p1, y) : edge(p1, p2, y);
      this.h(xa, xb, y);
    }
    if (line) {
      this.c(line);
      this.line(ax, ay, bx, by);
      this.line(bx, by, cx, cy);
      this.line(cx, cy, ax, ay);
    }
  }
  text(str: string, x: number, y: number, align: 'left' | 'center' | 'right' = 'left') {
    const s = str.toUpperCase();
    const w = textWidth(s);
    let cx = Math.round(align === 'center' ? x - w / 2 : align === 'right' ? x - w : x);
    for (const ch of s) {
      const g = FONT[ch] ?? FONT['?'];
      for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j][i] === 'k') this.x.fillRect(cx + i, Math.round(y) + j, 1, 1);
      cx += 4;
    }
  }
}

export const textWidth = (s: string) => Math.max(0, s.length * 4 - 1);

const FONT: Record<string, string[]> = {
  A: ['.k.', 'k.k', 'kkk', 'k.k', 'k.k'], B: ['kk.', 'k.k', 'kk.', 'k.k', 'kk.'], C: ['.kk', 'k..', 'k..', 'k..', '.kk'],
  D: ['kk.', 'k.k', 'k.k', 'k.k', 'kk.'], E: ['kkk', 'k..', 'kk.', 'k..', 'kkk'], F: ['kkk', 'k..', 'kk.', 'k..', 'k..'],
  G: ['.kk', 'k..', 'k.k', 'k.k', '.kk'], H: ['k.k', 'k.k', 'kkk', 'k.k', 'k.k'], I: ['kkk', '.k.', '.k.', '.k.', 'kkk'],
  J: ['..k', '..k', '..k', 'k.k', '.k.'], K: ['k.k', 'k.k', 'kk.', 'k.k', 'k.k'], L: ['k..', 'k..', 'k..', 'k..', 'kkk'],
  M: ['k.k', 'kkk', 'kkk', 'k.k', 'k.k'], N: ['kk.', 'k.k', 'k.k', 'k.k', 'k.k'], O: ['.k.', 'k.k', 'k.k', 'k.k', '.k.'],
  P: ['kk.', 'k.k', 'kk.', 'k..', 'k..'], Q: ['.k.', 'k.k', 'k.k', 'kk.', '.kk'], R: ['kk.', 'k.k', 'kk.', 'k.k', 'k.k'],
  S: ['.kk', 'k..', '.k.', '..k', 'kk.'], T: ['kkk', '.k.', '.k.', '.k.', '.k.'], U: ['k.k', 'k.k', 'k.k', 'k.k', 'kkk'],
  V: ['k.k', 'k.k', 'k.k', 'k.k', '.k.'], W: ['k.k', 'k.k', 'kkk', 'kkk', 'k.k'], X: ['k.k', 'k.k', '.k.', 'k.k', 'k.k'],
  Y: ['k.k', 'k.k', '.k.', '.k.', '.k.'], Z: ['kkk', '..k', '.k.', 'k..', 'kkk'],
  '0': ['kkk', 'k.k', 'k.k', 'k.k', 'kkk'], '1': ['.k.', 'kk.', '.k.', '.k.', 'kkk'], '2': ['kk.', '..k', '.k.', 'k..', 'kkk'],
  '3': ['kk.', '..k', '.k.', '..k', 'kk.'], '4': ['k.k', 'k.k', 'kkk', '..k', '..k'], '5': ['kkk', 'k..', 'kk.', '..k', 'kk.'],
  '6': ['.kk', 'k..', 'kkk', 'k.k', 'kkk'], '7': ['kkk', '..k', '.k.', '.k.', '.k.'], '8': ['kkk', 'k.k', 'kkk', 'k.k', 'kkk'],
  '9': ['kkk', 'k.k', 'kkk', '..k', 'kk.'],
  ' ': ['...', '...', '...', '...', '...'], '.': ['...', '...', '...', '...', '.k.'], ',': ['...', '...', '...', '.k.', 'k..'],
  '-': ['...', '...', 'kkk', '...', '...'], '?': ['kk.', '..k', '.k.', '...', '.k.'], '!': ['.k.', '.k.', '.k.', '...', '.k.'],
  ':': ['...', '.k.', '...', '.k.', '...'], '/': ['..k', '..k', '.k.', 'k..', 'k..'], '+': ['...', '.k.', 'kkk', '.k.', '...'],
  "'": ['.k.', '.k.', '...', '...', '...'], '<': ['..k', '.k.', 'k..', '.k.', '..k'], '>': ['k..', '.k.', '..k', '.k.', 'k..'],
};

// ---------------------------------------------------------------- sprites from text

const CH: Record<string, keyof Pal> = {
  k: 'line', w: 'fill', g: 'mid', y: 'yellow', r: 'red', b: 'blue', n: 'green',
};

export type Sprite = HTMLCanvasElement;

export function sprite(rows: string[], pal: Pal): Sprite {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const key = CH[row[i]];
      if (!key) continue;
      x.fillStyle = pal[key] as string;
      x.fillRect(i, j, 1, 1);
    }
  });
  return c;
}

export function flipped(src: Sprite): Sprite {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const x = c.getContext('2d')!;
  x.translate(src.width, 0);
  x.scale(-1, 1);
  x.drawImage(src, 0, 0);
  return c;
}

/** A small character grid you can paint parts onto. ' ' keeps a pixel, '.' clears it. */
class Grid {
  m: string[][];
  constructor(w: number, h: number) {
    this.m = Array.from({ length: h }, () => Array(w).fill('.'));
  }
  put(x: number, y: number, rows: string[]) {
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ' ') continue;
        const yy = y + j, xx = x + i;
        if (yy < 0 || yy >= this.m.length || xx < 0 || xx >= this.m[0].length) continue;
        this.m[yy][xx] = ch;
      }
    });
    return this;
  }
  swap(from: string, to: string) {
    this.m.forEach((r) => r.forEach((c, i) => { if (c === from) r[i] = to; }));
    return this;
  }
  rows() {
    return this.m.map((r) => r.join(''));
  }
}

// People are 12 wide and 18 tall, facing right. 'h' is hair, recoloured per person.
const HEAD = [
  '....hhhh....',
  '...hhhhhhh..',
  '..hhhhhhhhh.',
  '..hhhwwwwwk.',
  '..hhwwwwkwk.',
  '..khwwwwwwk.',
  '...kwwwwwk..',
  '....kkkkk...',
];

const BODIES: Record<string, string[]> = {
  pack: ['...yykkkkk..', '..yyykwwwwk.', '..yyykwwwwk.', '..yyykwwkwk.', '..yyykwwkwk.', '...yykkkkk..'],
  blazer: ['....kkkkk...', '...kgwkwgk..', '...kygkggk..', '...kggkkgk..', '...kgggkgk..', '....kkkkk...'],
  suit: ['....kkkkk...', '...kgwkwgk..', '...kggkggk..', '...kggkkgk..', '...kgggkgk..', '....kkkkk...'],
  shirt: ['....kkkkk...', '...kwwwwwk..', '...kwwwwwk..', '...kwwwkwk..', '...kwwwkwk..', '....kkkkk...'],
  lanyard: ['....kkkkk...', '...kwwkwwk..', '...kwwywwk..', '...kwwwkwk..', '...kwwwkwk..', '....kkkkk...'],
  hoodie: ['...kkkkkk...', '...kgggggk..', '...kgkgggk..', '...kgggkgk..', '...kgggkgk..', '....kkkkk...'],
  green: ['....kkkkk...', '...knnnnnk..', '...knnnnnk..', '...knnnknk..', '...knnnknk..', '....kkkkk...'],
  daura: ['....kkkkk...', '...kgwwwgk..', '...kgwkwgk..', '...kgwwkgk..', '...kgwwkgk..', '...kgwwwgk..'],
  sari: ['....kkkkk...', '...krrwrrk..', '...krrrwrk..', '...krrrrwk..', '...krrrrrk..', '...krrrrrk..'],
  sariGreen: ['....kkkkk...', '...knnwnnk..', '...knnnwnk..', '...knnnnwk..', '...knnnnnk..', '...knnnnnk..'],
};

const LEGS: Record<string, string[]> = {
  idle: ['....kk.kk...', '....kk.kk...', '....kk.kk...', '...kkk.kkk..'],
  walkA: ['....kk.kk...', '...kk...kk..', '..kk.....kk.', '.kkk.....kkk'],
  walkB: ['.....kkk....', '.....kkk....', '....kkk.....', '....kkkk....'],
  jump: ['....kkkk....', '...kk..kk...', '...kkk.kkk..', '............'],
};
const SKIRT = (c: string) => [`...k${c}${c}${c}${c}${c}k..`, `...k${c}${c}${c}${c}${c}k..`, `..k${c}${c}${c}${c}${c}${c}${c}k.`, '..kkkkkkkkk.'];

export type Look = {
  hair: 'k' | 'g';
  style?: 'short' | 'long' | 'bun' | 'topi';
  body: keyof typeof BODIES;
  skirt?: string;
  mask?: boolean;
  glasses?: boolean;
  beard?: boolean;
  moustache?: boolean;
  cane?: boolean;
  tika?: boolean;
};

export const LOOKS: Record<string, Look> = {
  me: { hair: 'k', body: 'pack' },
  meSenior: { hair: 'k', body: 'blazer' },
  student: { hair: 'k', body: 'shirt', mask: true },
  dev: { hair: 'k', body: 'hoodie' },
  qa: { hair: 'k', style: 'long', body: 'green', glasses: true },
  exec: { hair: 'g', body: 'suit', glasses: true },
  intern: { hair: 'k', body: 'pack' },
  intern2: { hair: 'k', style: 'long', body: 'shirt' },
  junior: { hair: 'k', body: 'lanyard' },
  junior2: { hair: 'k', style: 'bun', body: 'lanyard' },
  aama: { hair: 'k', style: 'bun', body: 'sari', skirt: 'r' },
  buwa: { hair: 'k', body: 'shirt', moustache: true },
  hajuraama: { hair: 'g', style: 'bun', body: 'sariGreen', skirt: 'n' },
  hajurbuwa: { hair: 'g', style: 'topi', body: 'daura', cane: true },
  prof: { hair: 'g', body: 'shirt', glasses: true, beard: true },
  friend: { hair: 'k', body: 'hoodie' },
  friend2: { hair: 'k', style: 'long', body: 'green' },
};

function person(look: Look, legs: keyof typeof LEGS): string[] {
  const g = new Grid(12, 18);
  g.put(0, 0, HEAD);
  if (look.style === 'long') g.put(2, 5, ['hh', 'hh', 'hh', 'hh', 'h']);
  if (look.style === 'bun') g.put(1, 1, ['hh', 'hh']);
  if (look.style === 'topi') g.put(2, 0, ['.kkkkkkk.', 'krygrygrk', ' hhhhhhhk']);
  g.swap('h', look.hair);
  if (look.glasses) g.put(6, 4, ['kkkk']);
  if (look.moustache) g.put(7, 5, ['kkk']);
  if (look.beard) g.put(4, 5, ['  gggg', ' ggggg', '  gggg']);
  if (look.mask) g.put(6, 5, ['bbbb', 'bbb']);
  if (look.tika) g.put(9, 3, ['r']);
  g.put(0, 8, BODIES[look.body]);
  if (look.skirt) g.put(0, 14, SKIRT(look.skirt));
  else g.put(0, 14, LEGS[legs]);
  if (look.cane) g.put(10, 9, ['kk', '.k', '.k', '.k', '.k', '.k', '.k', '.k', '.k']);
  return g.rows();
}

const BHAI = [
  '...hhhh...',
  '..hhhhhh..',
  '.hhhwwwwk.',
  '.hhwwwkwk.',
  '.khwwwwwk.',
  '..kwwwwk..',
  '...kkkk...',
  '...kyyyk..',
  '..kyyyyyk.',
  '..kyyykyk.',
  '...kkkkk..',
  '...kk.kk..',
  '..kkk.kkk.',
];

export type Frames = { idle: Sprite; walkA: Sprite; walkB: Sprite; jump: Sprite };
export type FrameSet = { r: Frames; l: Frames; w: number; h: number };

export function makePerson(key: string, pal: Pal, extra: Partial<Look> = {}): FrameSet {
  if (key === 'bhai') {
    const rows = BHAI.map((r) => r.replace(/h/g, 'k'));
    const s = sprite(rows, pal);
    const r: Frames = { idle: s, walkA: s, walkB: s, jump: s };
    const fl = flipped(s);
    return { r, l: { idle: fl, walkA: fl, walkB: fl, jump: fl }, w: 10, h: 13 };
  }
  const look = { ...(LOOKS[key] ?? LOOKS.student), ...extra };
  const r: Frames = {
    idle: sprite(person(look, 'idle'), pal),
    walkA: sprite(person(look, 'walkA'), pal),
    walkB: sprite(person(look, 'walkB'), pal),
    jump: sprite(person(look, 'jump'), pal),
  };
  const l: Frames = { idle: flipped(r.idle), walkA: flipped(r.walkA), walkB: flipped(r.walkB), jump: flipped(r.jump) };
  return { r, l, w: 12, h: 18 };
}

// ---------------------------------------------------------------- objects

export const STUPA = [
  '...........k............',
  '..........kyk...........',
  '..........kyk...........',
  '.........kyyyk..........',
  '.........kyyyk..........',
  '........kyyyyyk.........',
  '........kkkkkkk.........',
  '.......kwwwwwwwk........',
  '.......kwkwwwkwk........',
  '.......kwwwkwwwk........',
  '.......kkkkkkkkk........',
  '.....kkwwwwwwwwwkk......',
  '...kkwwwwwwwwwwwwwkk....',
  '..kwwwwwwwwwwwwwwwwwk...',
  '.kwwwwwwwwwwwwwwwwwwwk..',
  '.kwwwwwwwwwwwwwwwwwwwk..',
  'kkkkkkkkkkkkkkkkkkkkkkk.',
  'kwwwwwwwwwwwwwwwwwwwwwk.',
  'kkkkkkkkkkkkkkkkkkkkkkk.',
];

export const STAR = [
  '....k....',
  '...kyk...',
  'kkkkyykkk',
  'kyyyyyyyk',
  '.kyyyyyk.',
  '..kyyyk..',
  '.kyykyyk.',
  '.kyk.kyk.',
  '.kk...kk.',
];

export const DIPLOMA = [
  '.kkkkkkkkkk.',
  'kwwwwwwwwwwk',
  'kwkkkkkkkkwk',
  'kwwwwwwwwwwk',
  'kwkkkkkkwwwk',
  'kwwwwwwwwryk',
  'kwkkkkwwwrrk',
  '.kkkkkkkkrk.',
];

export const PHONE = [
  'kkkkk',
  'kwwwk',
  'kwywk',
  'kwwwk',
  'kkkkk',
];
