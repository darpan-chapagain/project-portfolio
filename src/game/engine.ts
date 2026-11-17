// The game loop for /play. Reads the level data the page hands it, builds one long street,
// and plays it with keyboard, mouse or touch.
import { W, H, G, Pen, readPal, type Pal, makePerson, type FrameSet, sprite, type Sprite, STAR, DIPLOMA } from './art';
import * as S from './scenery';
import type { Beat, Line, LevelScript } from '../data/game';

export type LevelData = {
  id: string;
  n: number;
  title: string;
  script: LevelScript;
  skills: string[];
};

export type GameData = {
  levels: LevelData[];
  cast: Record<string, { name: string; en?: string; look: string }>;
  sequel: { n: number; poster: string[] };
};

type Section = { i: number; level?: LevelData; s?: LevelScript; x0: number; x1: number; scene: string; kind: 'level' | 'sky' | 'end'; seed: number };
type Thing = { kind: 'building' | 'prop' | 'kiosk' | 'mirror' | 'sequel'; x: number; w: number; type: string; sign?: string; note?: string; done?: boolean; clear?: boolean; active?: boolean };
type Npc = { who: string; look: string; x: number; homeX: number; facing: 1 | -1; mask: boolean; party: boolean; joined: boolean; left: boolean; wave: boolean; y: number; vy: number; walking: boolean; order: number };
type Pickup = { x: number; y: number; label: string; got: boolean; kind: 'star' | 'diploma'; then?: string[] };
type Boss = { look: string; name: string; x: number; min: number; max: number; dir: number; hp: number; maxHp: number; alive: boolean; hit: number; cd: number; gateX: number; gateOpen: number; beaten: string[]; reward?: LevelScript['reward']; section: number };
type Door = { x: number; card: string };
type Trigger = { x: number; fired: boolean; beat: Beat; section: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; col: 'line' | 'yellow' | 'mid' | 'red' };

const SPEED = 72;
const GRAV = 620;
const JUMP = -214;
const BOSS_TOP: Record<string, number> = { clock: 28, outage: 30, records: 25, queue: 20, blob: 17 };

export function startGame(root: HTMLElement, data: GameData) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const pen = new Pen(ctx);
  const ui = {
    level: root.querySelector<HTMLElement>('[data-hud-level]')!,
    skills: root.querySelector<HTMLElement>('[data-hud-skills]')!,
    extra: root.querySelector<HTMLElement>('[data-hud-extra]')!,
    bubbles: root.querySelector<HTMLElement>('[data-bubbles]')!,
    caption: root.querySelector<HTMLElement>('[data-caption]')!,
    toast: root.querySelector<HTMLElement>('[data-toast]')!,
    start: root.querySelector<HTMLElement>('[data-start]')!,
    cards: root.querySelector<HTMLElement>('[data-cards]')!,
    jump: root.querySelector<HTMLButtonElement>('[data-jump]'),
  };

  let pal: Pal = readPal();
  let cache = new Map<string, FrameSet>();
  let stars: Sprite, diploma: Sprite;
  const paint = () => {
    pal = readPal();
    cache = new Map();
    stars = sprite(STAR, pal);
    diploma = sprite(DIPLOMA, pal);
  };
  paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const frames = (look: string, extra: Record<string, boolean> = {}) => {
    const key = look + JSON.stringify(extra);
    let f = cache.get(key);
    if (!f) { f = makePerson(look, pal, extra); cache.set(key, f); }
    return f;
  };

  // ------------------------------------------------------------ world
  let sections: Section[] = [];
  let things: Thing[] = [];
  let npcs: Npc[][] = [];
  let pickups: Pickup[] = [];
  let bosses: Boss[] = [];
  let doors: Door[] = [];
  let triggers: Trigger[] = [];
  let kiosks: { thing: Thing; section: number; label: string; total: number; per: number; done?: Line }[] = [];
  let worldEnd = 0;
  let flight: { section: number; planeX: number; runway: [number, number]; caption: string } | null = null;
  let landing: { x0: number; runway: [number, number] } | null = null;
  let totalSkills = 0;

  function build() {
    sections = []; things = []; npcs = []; pickups = []; bosses = []; doors = []; triggers = []; kiosks = [];
    flight = null; landing = null; totalSkills = 0;
    let x = 0;
    data.levels.forEach((lv, i) => {
      const s = lv.script;
      const sec: Section = { i: sections.length, level: lv, s, x0: x, x1: x + s.length, scene: s.scene, kind: 'level', seed: i * 97 + 13 };
      sections.push(sec);
      const si = sec.i;
      const bw = S.BUILDING_W[s.building.type] ?? 90;
      const bx = x + s.building.at;
      things.push({ kind: 'building', x: bx, w: bw, type: s.building.type, sign: s.building.sign, note: s.building.note });
      doors.push({ x: s.building.type === 'airport' ? bx + 65 : bx + bw / 2, card: lv.id });
      (s.props ?? []).forEach((pr) => {
        things.push({ kind: pr.type === 'mirror' ? 'mirror' : 'prop', x: x + pr.at, w: S.PROP_W[pr.type] ?? 20, type: pr.type, clear: pr.clear });
      });
      npcs[si] = (s.npcs ?? []).map((n, k) => ({
        who: n.who, look: data.cast[n.who]?.look ?? 'student', x: x + n.at, homeX: x + n.at, facing: n.facing ?? 1,
        mask: !!n.mask, party: !!n.party, joined: false, left: false, wave: !!n.wave, y: G, vy: 0, walking: false, order: k,
      }));
      (s.beats ?? []).forEach((b) => triggers.push({ x: x + b.at, fired: false, beat: b, section: si }));
      totalSkills += lv.skills.length;
      if (s.skills) {
        lv.skills.forEach((label, k) => pickups.push({ x: x + s.skills!.from + k * s.skills!.gap, y: G - 30, label, got: false, kind: 'star' }));
      }
      if (s.boss) {
        const bxx = x + s.boss.at;
        bosses.push({
          look: s.boss.look, name: s.boss.name, x: bxx, min: bxx - 36, max: bxx + 36, dir: -1, hp: s.boss.hp ?? 3, maxHp: s.boss.hp ?? 3,
          alive: true, hit: 0, cd: 0, gateX: bxx + 90, gateOpen: 0, beaten: s.boss.beaten ?? [], reward: s.reward, section: si,
        });
      }
      if (s.deliver) {
        const per = s.deliver.total / s.deliver.at.length;
        s.deliver.at.forEach((a) => {
          const thing: Thing = { kind: 'kiosk', x: x + a, w: 32, type: 'kiosk', done: false };
          things.push(thing);
          kiosks.push({ thing, section: si, label: s.deliver!.label, total: s.deliver!.total, per, done: s.deliver!.done });
        });
      }
      if (landing === null && sections.length > 1 && sections[sections.length - 2].kind === 'sky') {
        landing = { x0: x, runway: [x, x + 260] };
      }
      x += s.length;
      if (s.flight) {
        flight = { section: si, planeX: sec.x0 + s.flight.plane, runway: [sec.x0 + s.flight.plane - 110, sec.x1], caption: s.flight.caption };
        sections.push({ i: sections.length, x0: x, x1: x + 900, scene: 'sky', kind: 'sky', seed: 777 });
        x += 900;
      }
    });
    const last = sections[sections.length - 1];
    sections.push({ i: sections.length, x0: x, x1: x + 240, scene: last.scene === 'sky' ? 'city' : last.scene, kind: 'end', seed: 999 });
    things.push({ kind: 'sequel', x: x + 40, w: 104, type: 'sequel' });
    doors.push({ x: x + 92, card: 'next' });
    worldEnd = x + 240;
  }

  // ------------------------------------------------------------ state
  const player = { x: 24, y: G, vx: 0, vy: 0, ground: true, facing: 1 as 1 | -1, anim: 0, hidden: false, senior: false, tika: false, onRoof: null as null | { x: number; y: number } };
  let plane = { x: 0, y: G, gear: true, active: false };
  let cam = 0;
  let camOverride: number | null = null;
  let state: 'title' | 'play' | 'card' = 'title';
  let locks = 0;
  let night = 0;
  let forcedNight: number | null = null;
  let fade = 0;
  let skillsGot = 0;
  let delivered = 0;
  let flown = false;
  let t = 0;
  let boil = 0;
  let history: number[] = [];
  let particles: Particle[] = [];
  let target: null | { x: number; jump?: boolean; door?: Door; boss?: Boss; set: number } = null;
  let jumpQueued = false;
  let enterQueued = false;
  let skip = false;
  const keys = new Set<string>();
  let currentSection = -1;

  function reset() {
    build();
    Object.assign(player, { x: 24, y: G, vx: 0, vy: 0, ground: true, facing: 1, hidden: false, senior: false, tika: false, onRoof: null });
    if (flight) plane = { x: flight.planeX, y: G, gear: true, active: false };
    cam = 0; camOverride = null; locks = 0; forcedNight = null; fade = 0; skillsGot = 0; delivered = 0; flown = false;
    history = []; particles = []; target = null; currentSection = -1;
    ui.bubbles.innerHTML = '';
    passive.length = 0; current = null;
    ui.caption.hidden = true;
    updateHud();
  }

  // ------------------------------------------------------------ frames and waits
  const waiters: ((dt: number) => void)[] = [];
  const nextFrame = () => new Promise<number>((res) => waiters.push(res));
  async function wait(sec: number, skippable = true) {
    let left = sec;
    while (left > 0) {
      left -= await nextFrame();
      if (skippable && skip) { skip = false; return; }
    }
  }
  const lock = () => { locks++; target = null; };
  const unlock = () => { locks = Math.max(0, locks - 1); };

  // ------------------------------------------------------------ words on screen
  type Anchor = () => { x: number; y: number };
  const passive: { line: Line; anchor: Anchor }[] = [];
  let current: { el: HTMLElement; anchor: Anchor; left: number } | null = null;

  function bubble(line: Line, anchor: Anchor) {
    const el = document.createElement('div');
    const who = line.who ? data.cast[line.who] : null;
    el.className = 'bubble' + (who ? '' : ' thought');
    if (who) {
      const name = document.createElement('span');
      name.className = 'who';
      name.textContent = who.name;
      if (who.en) {
        const en = document.createElement('small');
        en.textContent = who.en;
        name.append(en);
      }
      el.append(name);
    }
    const text = document.createElement('span');
    text.className = 'says';
    text.textContent = line.text;
    el.append(text);
    ui.bubbles.append(el);
    place(el, anchor);
    return el;
  }
  function place(el: HTMLElement, anchor: Anchor) {
    const a = anchor();
    const x = Math.min(W - 30, Math.max(30, a.x - cam));
    el.style.left = `${(x / W) * 100}%`;
    el.style.top = `${(Math.max(30, a.y) / H) * 100}%`;
  }
  const lineTime = (l: Line) => Math.min(4, Math.max(1.9, 1.2 + l.text.length * 0.05));

  function anchorFor(line: Line, sec: number): Anchor {
    if (line.who) {
      const n = (npcs[sec] ?? []).find((m) => m.who === line.who) ?? npcs.flat().find((m) => m.who === line.who);
      if (n) return () => ({ x: n.x, y: n.y - (n.look === 'bhai' ? 16 : 21) });
    }
    if (player.onRoof) { const r = player.onRoof; return () => ({ x: r.x, y: r.y - 22 }); }
    return () => ({ x: player.x, y: player.y - 22 });
  }

  async function say(line: Line, sec: number) {
    if (line.narrate) {
      ui.caption.textContent = line.text;
      ui.caption.hidden = false;
      await wait(lineTime(line) + 0.4);
      ui.caption.hidden = true;
      return;
    }
    const anchor = anchorFor(line, sec);
    const el = bubble(line, anchor);
    const tick = () => place(el, anchor);
    let left = lineTime(line);
    while (left > 0) {
      left -= await nextFrame();
      tick();
      if (skip) { skip = false; break; }
    }
    el.remove();
    await wait(0.12, false);
  }

  let toastQueue: string[] = [];
  let toastLeft = 0;
  function toast(msg: string) { toastQueue.push(msg); }

  function updateHud() {
    const sec = sections[currentSection];
    if (sec?.kind === 'end') ui.level.textContent = `Level ${data.sequel.n}: The sequel`;
    else {
      const lv = sec?.level ?? (sec?.kind === 'sky' ? sections[currentSection - 1]?.level : data.levels[0]);
      if (lv) ui.level.textContent = `Level ${lv.n}: ${lv.title}`;
    }
    ui.skills.textContent = `Skills ${skillsGot}/${totalSkills}`;
    const k = kiosks.find((q) => q.section === currentSection);
    if (k) { ui.extra.hidden = false; ui.extra.textContent = `${k.label} ${delivered}/${k.total}`; }
    else ui.extra.hidden = true;
  }

  // ------------------------------------------------------------ cards
  function openCard(id: string) {
    const card = ui.cards.querySelector<HTMLElement>(`[data-card="${id}"]`);
    if (!card) return;
    state = 'card';
    keys.clear();
    target = null;
    ui.cards.hidden = false;
    ui.cards.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => { c.hidden = c !== card; });
    card.scrollTop = 0;
    card.querySelector<HTMLElement>('[data-close]')?.focus({ preventScroll: true });
  }
  function closeCard() {
    ui.cards.hidden = true;
    state = 'play';
    canvas.focus({ preventScroll: true });
  }
  ui.cards.addEventListener('click', (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-close], [data-replay]');
    if (!el) { if (e.target === ui.cards) closeCard(); return; }
    if (el.hasAttribute('data-replay')) { reset(); closeCard(); return; }
    closeCard();
  });

  // ------------------------------------------------------------ beats
  async function fire(tr: Trigger) {
    const b = tr.beat;
    const sec = tr.section;
    const list = npcs[sec] ?? [];
    switch (b.action) {
      case 'levelUp':
        player.senior = true;
        burst(player.x, player.y - 12, 'yellow', 22);
        toast('Level up: Senior');
        break;
      case 'join': {
        const n = list[b.target ?? 0];
        if (n) { n.joined = true; n.vy = -120; n.order = list.filter((m) => m.joined).length - 1; }
        break;
      }
      case 'leaveParty':
        list.forEach((n) => { if (n.joined) { n.joined = false; n.left = true; n.wave = true; n.facing = 1; } });
        break;
      case 'mirror': {
        const mirrors = things.filter((m) => m.kind === 'mirror' && m.x >= sections[sec].x0 && m.x < sections[sec].x1);
        const m = (s0PropIndex(sec, b.target ?? 0) as Thing | undefined) ?? mirrors[0];
        if (m) m.active = true;
        break;
      }
      case 'unmask':
        break;
      case 'roof':
        await roof(tr);
        return;
      case 'farewell':
        await farewell(tr);
        return;
      case 'lookBack':
        await lookBack();
        return;
    }
    if (b.lines?.length) {
      if (b.lock) {
        lock();
        player.vx = 0;
        for (const l of b.lines) await say(l, sec);
        unlock();
      } else {
        b.lines.forEach((line) => passive.push({ line, anchor: anchorFor(line, sec) }));
      }
    }
  }
  // props keep their order from the script, so `target` can point at one
  function s0PropIndex(sec: number, idx: number) {
    const s = sections[sec];
    const pr = s.s?.props?.[idx];
    if (!pr) return undefined;
    return things.find((th) => th.x === s.x0 + pr.at && th.type === pr.type);
  }

  async function roof(tr: Trigger) {
    const sec = sections[tr.section];
    const home = things.find((th) => th.type === 'familyhome' && th.x >= sec.x0 && th.x < sec.x1);
    lock();
    player.vx = 0;
    await fadeTo(1, 0.7);
    forcedNight = 1;
    if (home) player.onRoof = { x: home.x + 30, y: G - 56 };
    player.hidden = true;
    camOverride = home ? home.x - 110 : null;
    await fadeTo(0, 0.7);
    for (const l of tr.beat.lines ?? []) await say(l, tr.section);
    await wait(0.6, false);
    await fadeTo(1, 0.7);
    forcedNight = null;
    player.onRoof = null;
    player.hidden = false;
    player.facing = 1;
    player.x = home ? home.x + 78 : player.x;
    camOverride = null;
    await fadeTo(0, 0.7);
    unlock();
  }

  async function farewell(tr: Trigger) {
    const list = npcs[tr.section] ?? [];
    lock();
    player.vx = 0;
    player.facing = 1;
    for (const l of tr.beat.lines ?? []) {
      if (l.narrate && l.who) {
        const n = list.find((m) => m.who === l.who);
        if (n) {
          const from = n.x;
          await walkNpc(n, player.x + 13);
          player.tika = true;
          burst(player.x + 4, player.y - 16, 'red', 6);
          void say(l, tr.section);
          await wait(lineTime(l) + 0.4);
          await walkNpc(n, from);
          n.facing = -1;
          continue;
        }
      }
      await say(l, tr.section);
    }
    list.forEach((n) => { n.wave = true; });
    unlock();
  }

  async function walkNpc(n: Npc, to: number) {
    n.walking = true;
    n.facing = to < n.x ? -1 : 1;
    while (Math.abs(n.x - to) > 1) {
      const dt = await nextFrame();
      n.x += Math.sign(to - n.x) * Math.min(Math.abs(to - n.x), 40 * dt);
    }
    n.walking = false;
  }

  async function lookBack() {
    lock();
    player.vx = 0;
    await wait(0.3, false);
    camOverride = player.x - 255;
    player.facing = -1;
    await wait(2.2);
    player.facing = 1;
    await wait(0.4, false);
    camOverride = null;
    unlock();
  }

  async function fadeTo(to: number, sec: number) {
    const from = fade;
    let k = 0;
    while (k < 1) {
      k = Math.min(1, k + (await nextFrame()) / sec);
      fade = from + (to - from) * k;
    }
  }

  async function fly() {
    if (!flight || !landing) return;
    const f = flight, l = landing;
    lock();
    player.vx = 0;
    player.hidden = true;
    plane.active = true;
    plane.gear = true;
    burst(f.planeX + 50, G - 8, 'mid', 6);
    // taxi and take off
    let v = 0;
    while (plane.x < f.planeX + 260) {
      const dt = await nextFrame();
      v = Math.min(150, v + 70 * dt);
      plane.x += v * dt;
      if (plane.x > f.planeX + 120) plane.y = Math.max(G - 58, plane.y - 34 * dt);
      if (plane.y < G - 10) plane.gear = false;
      camOverride = plane.x - 120;
    }
    ui.caption.textContent = f.caption;
    ui.caption.hidden = false;
    // cruise to the far side
    const touchdown = l.x0 + 70;
    while (plane.x < touchdown - 230) {
      const dt = await nextFrame();
      plane.x += 150 * dt;
      plane.y = Math.max(G - 60, plane.y - 30 * dt);
      camOverride = plane.x - 120;
    }
    ui.caption.hidden = true;
    // descend and land
    const startX = plane.x, startY = plane.y;
    while (plane.x < touchdown) {
      const dt = await nextFrame();
      plane.x += 130 * dt;
      const k = Math.min(1, (plane.x - startX) / (touchdown - startX));
      plane.y = startY + (G - startY) * k;
      plane.gear = k > 0.5;
      camOverride = plane.x - 120;
    }
    plane.y = G;
    burst(plane.x + 20, G - 1, 'mid', 8);
    v = 130;
    while (v > 0) {
      const dt = await nextFrame();
      v = Math.max(0, v - 110 * dt);
      plane.x += v * dt;
      camOverride = plane.x - 120;
    }
    flown = true;
    player.tika = false;
    player.hidden = false;
    player.x = plane.x + 70;
    player.y = G;
    player.facing = 1;
    burst(player.x, G - 10, 'yellow', 10);
    camOverride = null;
    unlock();
  }

  // ------------------------------------------------------------ effects
  function burst(x: number, y: number, col: Particle['col'], n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 30 + Math.random() * 60;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.5 + Math.random() * 0.4, col });
    }
  }

  // ------------------------------------------------------------ input
  const isLeft = () => keys.has('ArrowLeft') || keys.has('a') || keys.has('A');
  const isRight = () => keys.has('ArrowRight') || keys.has('d') || keys.has('D');
  const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Spacebar'];

  window.addEventListener('keydown', (e) => {
    if (state === 'card') {
      if (e.key === 'Escape') { e.preventDefault(); closeCard(); }
      return;
    }
    if (state === 'title') {
      if (e.key === 'Enter' || e.key === ' ') { if (document.activeElement === document.body || root.contains(document.activeElement)) { e.preventDefault(); begin(); } }
      return;
    }
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (GAME_KEYS.includes(e.key)) e.preventDefault();
    if (locks > 0) {
      if ([' ', 'Enter', 'e', 'E', 'ArrowUp', 'w', 'W'].includes(e.key)) skip = true;
      return;
    }
    keys.add(e.key);
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') jumpQueued = true;
    if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') enterQueued = true;
    if (isLeft() || isRight()) target = null;
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  window.addEventListener('blur', () => keys.clear());

  const toWorld = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W + cam, y: ((e.clientY - r.top) / r.height) * H };
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (locks > 0) { skip = true; return; }
    const p = toWorld(e);
    const d = doors.find((q) => Math.abs(p.x - q.x) < 13 && p.y > G - 28 && p.y < G + 6);
    if (d) { target = { x: d.x, door: d, set: t }; return; }
    const b = bosses.find((q) => q.alive && Math.abs(p.x - q.x) < 15 && p.y > G - 34);
    if (b) { target = { x: b.x, boss: b, set: t }; return; }
    if (Math.abs(p.x - player.x) < 8 && p.y > player.y - 22 && p.y < player.y + 3) { jumpQueued = true; return; }
    target = { x: Math.max(6, Math.min(worldEnd - 6, p.x)), jump: p.y < G - 24, set: t };
  });
  ui.jump?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (locks > 0) { skip = true; return; }
    jumpQueued = true;
  });

  function begin() {
    if (state !== 'title') return;
    ui.start.hidden = true;
    state = 'play';
    canvas.focus({ preventScroll: true });
  }
  ui.start.querySelector('[data-begin]')?.addEventListener('click', begin);

  // ------------------------------------------------------------ update
  function sectionAt(x: number) {
    return sections.findIndex((s) => x >= s.x0 && x < s.x1);
  }

  function update(dt: number) {
    t += dt;
    boil = Math.floor(t / 0.2) % 3;
    const control = state === 'play' && locks === 0;

    // walking
    let dir = 0;
    if (control) {
      dir = (isRight() ? 1 : 0) - (isLeft() ? 1 : 0);
      if (dir === 0 && target) {
        if (target.boss) {
          if (!target.boss.alive) target = null;
          else {
            target.x = target.boss.x;
            const dx = target.boss.x - player.x;
            if (Math.abs(dx) < 34 && player.ground) { jumpQueued = true; }
            dir = Math.abs(dx) > 2 ? Math.sign(dx) : 0;
          }
        }
        if (target && !target.boss) {
          const dx = target.x - player.x;
          if (Math.abs(dx) > 2) dir = Math.sign(dx);
          else {
            if (target.jump) jumpQueued = true;
            if (target.door) openCard(target.door.card);
            target = null;
          }
        }
      }
    }
    if (state === 'play' && !player.hidden) {
      player.vx = dir * SPEED;
      if (dir !== 0) player.facing = dir as 1 | -1;
      if (control && jumpQueued && player.ground) {
        player.vy = JUMP;
        player.ground = false;
        burst(player.x, G, 'mid', 3);
      }
      const prevX = player.x;
      player.x += player.vx * dt;
      player.vy += GRAV * dt;
      player.y += player.vy * dt;
      if (player.y >= G) {
        if (!player.ground && player.vy > 160) burst(player.x, G, 'mid', 3);
        player.y = G; player.vy = 0; player.ground = true;
      }
      // walls: world edges, locked gates, the runway before take-off
      player.x = Math.max(6, Math.min(worldEnd - 6, player.x));
      for (const b of bosses) {
        if (b.gateOpen < 0.9 && prevX <= b.gateX - 6 && player.x > b.gateX - 6) player.x = b.gateX - 6;
      }
      if (flight && !flown && player.x > flight.planeX + 6) {
        player.x = flight.planeX + 6;
        if (control) void fly();
      }
      if (flown && flight && player.x < (landing?.x0 ?? 0) + 4) player.x = (landing?.x0 ?? 0) + 4;
      player.anim += Math.abs(player.vx) * dt;
    }
    jumpQueued = false;

    // doors
    if (control && enterQueued) {
      const d = doors.find((q) => Math.abs(q.x - player.x) < 13);
      if (d) openCard(d.card);
    }
    enterQueued = false;

    // section change
    const si = sectionAt(player.x);
    if (si !== currentSection && si >= 0) { currentSection = si; updateHud(); }

    // triggers
    if (state === 'play' && locks === 0) {
      for (const tr of triggers) {
        if (!tr.fired && player.x >= tr.x) { tr.fired = true; void fire(tr); if (locks > 0) break; }
      }
    }

    // skills and rewards
    for (const pk of pickups) {
      if (pk.got) continue;
      const w = pk.kind === 'diploma' ? 7 : 5;
      if (Math.abs(pk.x - player.x) < w + 4 && player.y - 18 < pk.y + 4 && player.y > pk.y - 5) {
        pk.got = true;
        skillsGot++;
        burst(pk.x, pk.y, 'yellow', 12);
        toast(pk.kind === 'diploma' ? pk.label : `Skill unlocked: ${pk.label}`);
        (pk.then ?? []).forEach(toast);
        updateHud();
      }
    }

    // bank kiosks
    for (const k of kiosks) {
      if (k.thing.done || Math.abs(k.thing.x + 16 - player.x) > 16) continue;
      k.thing.done = true;
      delivered = Math.min(k.total, delivered + k.per);
      burst(k.thing.x + 16, G - 20, 'yellow', 10);
      toast(`${k.label}: ${delivered}/${k.total}`);
      updateHud();
      if (delivered >= k.total && k.done) passive.push({ line: k.done, anchor: () => ({ x: player.x, y: player.y - 22 }) });
    }

    // bosses
    for (const b of bosses) {
      b.hit = Math.max(0, b.hit - dt);
      b.cd = Math.max(0, b.cd - dt);
      if (!b.alive) { b.gateOpen = Math.min(1, b.gateOpen + dt * 1.5); continue; }
      b.x += b.dir * 22 * dt;
      if (b.x < b.min) { b.x = b.min; b.dir = 1; }
      if (b.x > b.max) { b.x = b.max; b.dir = -1; }
      if (player.hidden) continue;
      const top = G - (BOSS_TOP[b.look] ?? 20);
      const dx = player.x - b.x;
      if (Math.abs(dx) < 13 && b.cd === 0 && player.vy > 0 && player.y >= top - 4 && player.y <= top + 9) {
        b.hp--;
        b.hit = 0.25;
        b.cd = 0.35;
        player.vy = -190;
        player.y = top - 1;
        player.ground = false;
        burst(b.x, top, 'line', 8);
        npcs.flat().forEach((n) => { if (n.joined) n.vy = -110; });
        if (b.hp <= 0) {
          b.alive = false;
          burst(b.x, G - 14, 'yellow', 26);
          b.beaten.forEach(toast);
          if (b.reward) {
            pickups.push({ x: b.x, y: G - 30, label: b.reward.label, got: false, kind: 'diploma', then: b.reward.then });
          }
        }
      } else if (Math.abs(dx) < 12 && player.y > top + 9) {
        player.x = b.x + Math.sign(dx || -1) * 12;
        if (player.ground) { player.vy = -90; player.ground = false; }
      }
    }

    // people
    // breadcrumbs every 2px walked, so followers keep their spacing when you stop
    if (!history.length || Math.abs(player.x - history[history.length - 1]) >= 2) history.push(player.x);
    if (history.length > 200) history.shift();
    for (const list of npcs) {
      if (!list) continue;
      for (const n of list) {
        if (n.joined) {
          const idx = history.length - 1 - (n.order + 1) * 7;
          const tx = history[Math.max(0, idx)] ?? n.x;
          const mv = tx - n.x;
          n.walking = Math.abs(mv) > 0.4;
          if (n.walking) n.facing = mv > 0 ? 1 : -1;
          n.x += mv * Math.min(1, dt * 10);
        } else if (!n.walking && !n.left && Math.abs(n.x - player.x) < 60) {
          n.facing = player.x < n.x ? -1 : 1;
        }
        if (n.vy !== 0 || n.y < G) {
          n.vy += GRAV * dt;
          n.y += n.vy * dt;
          if (n.y >= G) { n.y = G; n.vy = 0; }
        }
      }
    }

    // particles
    particles = particles.filter((q) => (q.life -= dt) > 0);
    for (const q of particles) { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 160 * dt; }

    // night: forced for the roof, or flipping faster and faster across a stretch
    const sec = sections[currentSection];
    let n = 0;
    const nc = sec?.s?.nightCycle;
    if (nc && sec) {
      const u = (player.x - sec.x0 - nc.from) / (nc.to - nc.from);
      if (u > 0 && u < 1) n = 0.5 - 0.5 * Math.cos(Math.pow(u, 1.6) * 5 * Math.PI * 2);
    }
    night = forcedNight ?? n;

    // camera
    const want = camOverride ?? player.x - 110;
    cam += (want - cam) * Math.min(1, dt * (camOverride !== null ? 3 : 6));
    cam = Math.max(0, Math.min(worldEnd - W, cam));

    // words
    while (!current && passive.length && locks === 0) {
      const next = passive.shift()!;
      // skip lines whose speaker has scrolled out of view
      const ax = next.anchor().x;
      if (ax < cam - 40 || ax > cam + W + 40) continue;
      current = { el: bubble(next.line, next.anchor), anchor: next.anchor, left: lineTime(next.line) };
    }
    if (current) {
      current.left -= dt;
      place(current.el, current.anchor);
      const ax = current.anchor().x;
      const gone = ax < cam - 60 || ax > cam + W + 60;
      if (current.left <= 0 || locks > 0 || gone) { current.el.remove(); current = null; }
    }
    toastLeft -= dt;
    if (toastLeft <= 0) {
      if (toastQueue.length) {
        ui.toast.textContent = toastQueue.shift()!;
        ui.toast.hidden = false;
        ui.toast.classList.remove('pop'); void ui.toast.offsetWidth; ui.toast.classList.add('pop');
        toastLeft = 2.4;
      } else ui.toast.hidden = true;
    }

    // hand the frame to any waiting cutscene
    const ws = waiters.splice(0);
    ws.forEach((w) => w(dt));
  }

  // ------------------------------------------------------------ draw
  function draw() {
    const c = Math.round(cam);
    ctx.globalAlpha = 1;
    pen.c(pal.bg).rect(0, 0, W, H);
    // sketchbook grid, moving with the world
    pen.c(pal.soft);
    for (let x = -(c % 16); x < W; x += 16) pen.v(x, 0, H);
    for (let y = 2; y < H; y += 16) pen.h(0, W, y);

    S.sky(pen, pal, night, t);
    const pp = (wx: number, p: number) => (wx - (c + W / 2)) * p + W / 2;
    for (const s of sections) {
      const scene = s.scene === 'sky' ? 'sky' : s.scene;
      if (scene === 'sky') continue;
      S.far(pen, pal, scene, pp(s.x0, 0.35), pp(s.x1, 0.35), s.seed, boil, t);
    }
    for (const s of sections) {
      if (s.scene === 'sky') continue;
      S.mid(pen, pal, s.scene, pp(s.x0, 0.65), pp(s.x1, 0.65), s.seed, night);
    }
    for (const s of sections) {
      const x0 = s.x0 - c, x1 = s.x1 - c;
      if (x1 < -10 || x0 > W + 10) continue;
      if (s.scene === 'sky') {
        for (let i = 0; i < 12; i++) {
          const wx = s.x0 + i * 80 + hashOff(i) * 30;
          S.cloud(pen, pal, wx - c, 40 + hashOff(i * 3) * 90, 1 + hashOff(i * 5), i % 2 ? pal.faint : pal.mid);
        }
        continue;
      }
      S.ground(pen, pal, s.scene, x0, x1, s.x0, boil);
    }
    if (flight) S.runway(pen, pal, flight.runway[0] - c, flight.runway[1] - c);
    if (landing) S.runway(pen, pal, landing.runway[0] - c, landing.runway[1] - c);

    // buildings and props
    for (const th of things) {
      const sx = th.x - c;
      if (sx > W + 20 || sx + th.w < -60) continue;
      if (th.kind === 'building') S.building(pen, pal, th.type, sx, th.sign ?? '', th.note, t, night);
      else if (th.kind === 'prop') S.prop(pen, pal, th.type, sx, t, night);
      else if (th.kind === 'kiosk') S.kiosk(pen, pal, sx, !!th.done, t);
      else if (th.kind === 'mirror') S.mirrorFrame(pen, pal, sx);
      else if (th.kind === 'sequel') S.sequel(pen, pal, sx, data.sequel.n, data.sequel.poster);
    }

    if (night > 0.01) {
      ctx.globalAlpha = night * 0.55;
      pen.c(pal.shade).rect(0, 0, W, H);
      ctx.globalAlpha = 1;
      if (night > 0.5) S.sky(pen, pal, 1, t);
    }

    // gates
    for (const b of bosses) {
      const sx = b.gateX - c;
      if (sx > -30 && sx < W + 30) S.gate(pen, pal, sx, b.gateOpen);
    }
    // skills
    for (const pk of pickups) {
      if (pk.got) continue;
      const sx = pk.x - c, bob = Math.round(Math.sin(t * 3 + pk.x) * 1.5);
      if (sx < -12 || sx > W + 12) continue;
      if (pk.kind === 'diploma') ctx.drawImage(diploma, Math.round(sx - 6), Math.round(pk.y - 4 + bob));
      else ctx.drawImage(stars, Math.round(sx - 4), Math.round(pk.y - 4 + bob));
    }
    // bosses and their names
    for (const b of bosses) {
      if (!b.alive) continue;
      const sx = b.x - c;
      if (sx < -30 || sx > W + 30) continue;
      S.boss(pen, pal, b.look, sx, b.hp, t, b.hit);
      const top = G - (BOSS_TOP[b.look] ?? 20) - 12;
      pen.c(pal.line).text(b.name, sx, top - 4, 'center');
      for (let i = 0; i < b.maxHp; i++) {
        const x = sx - (b.maxHp * 4) / 2 + i * 4;
        if (i < b.hp) pen.c(pal.red).rect(x, top + 3, 3, 2);
        else pen.c(pal.line).box(x, top + 3, 3, 2);
      }
    }
    // the plane
    if (flight) S.plane(pen, pal, plane.x - c, plane.y, plane.gear, t);

    // people
    for (const list of npcs) {
      if (!list) continue;
      for (const n of list) drawPerson(n.look, n.x - c, n.y, n.facing, n.walking, n.y < G, n.mask ? { mask: true } : {}, n.wave);
    }
    // mirrors: a scribble at first, then a clear reflection
    for (const th of things) {
      if (th.kind !== 'mirror') continue;
      const sx = th.x - c;
      if (sx < -20 || sx > W + 20 || Math.abs(player.x - (th.x + 7)) > 60 || player.hidden) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx + 2, G - 24, 10, 21);
      ctx.clip();
      const f = frames(playerLook(), playerExtra());
      const fr = player.facing === 1 ? f.l : f.r;
      ctx.drawImage(fr.idle, Math.round(sx + 1), G - 22);
      if (!th.clear) {
        pen.c(pal.line);
        for (let i = 0; i < 7; i++) {
          const k = i * 11 + boil * 37;
          pen.line(sx + 2 + S.hash(k) * 10, G - 24 + S.hash(k + 1) * 21, sx + 2 + S.hash(k + 2) * 10, G - 24 + S.hash(k + 3) * 21);
        }
      } else if (th.active) {
        pen.c(pal.yellow);
        if (Math.floor(t * 4) % 2) { pen.px(sx + 4, G - 20); pen.px(sx + 10, G - 9); }
      }
      ctx.restore();
    }
    // the player, or the player sitting on the roof
    if (player.onRoof) drawPerson(playerLook(), player.onRoof.x - c, player.onRoof.y, 1, false, false, playerExtra());
    if (!player.hidden) {
      const moving = Math.abs(player.vx) > 1 && player.ground;
      drawPerson(playerLook(), player.x - c, player.y, player.facing, moving, !player.ground, playerExtra(), false, player.anim);
    }

    // particles
    for (const q of particles) {
      pen.c(pal[q.col]).rect(q.x - c, q.y, q.life > 0.3 ? 2 : 1, q.life > 0.3 ? 2 : 1);
    }

    // a prompt over a door you can go into
    if (state === 'play' && locks === 0 && !player.hidden) {
      const d = doors.find((q) => Math.abs(q.x - player.x) < 13);
      if (d) {
        const sx = d.x - c, y = G - 48 + Math.round(Math.sin(t * 5) * 1.5);
        pen.panel(sx - 8, y - 9, 17, 9, pal.fill, pal.line);
        pen.c(pal.line).text('IN', sx + 1, y - 7, 'center');
        pen.c(pal.line);
        pen.h(sx - 2, sx + 2, y + 1); pen.h(sx - 1, sx + 1, y + 2); pen.px(sx, y + 3);
      }
    }
    // where you tapped
    if (target && t - target.set < 0.5) {
      const sx = target.x - c;
      pen.c(pal.line);
      pen.line(sx - 2, G + 3, sx + 2, G + 7); pen.line(sx + 2, G + 3, sx - 2, G + 7);
    }

    if (fade > 0) {
      ctx.globalAlpha = fade;
      pen.c(pal.bg).rect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  const hashOff = (i: number) => S.hash(i * 1.7 + 4.2);

  const playerLook = () => (player.senior ? 'meSenior' : 'me');
  const playerExtra = () => {
    const mask = !!sections[currentSection]?.s?.npcs?.some((n) => n.mask) && sections[currentSection]?.level?.id === data.levels[0]?.id;
    return { mask, tika: player.tika };
  };

  function drawPerson(look: string, sx: number, y: number, facing: 1 | -1, moving: boolean, air: boolean, extra: Record<string, boolean> = {}, wave = false, anim = t * 60) {
    if (sx < -16 || sx > W + 16) return;
    const f = frames(look, extra);
    const fr = facing === 1 ? f.r : f.l;
    let img = fr.idle;
    if (air) img = fr.jump;
    else if (moving) img = Math.floor(anim / 7) % 2 ? fr.walkA : fr.walkB;
    const bob = moving && !air && Math.floor(anim / 7) % 2 ? -1 : 0;
    const x = Math.round(sx - f.w / 2), top = Math.round(y - f.h + bob);
    ctx.drawImage(img, x, top);
    if (wave) {
      const up = Math.floor(t * 3) % 2;
      pen.c(pal.line);
      const hx = facing === 1 ? x + f.w - 1 : x;
      pen.rect(hx, top + 6 - up * 3, 2, 2);
      pen.v(hx + (facing === 1 ? 0 : 1), top + 8 - up * 3, top + 10);
    }
  }

  // ------------------------------------------------------------ loop
  let last = performance.now();
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  reset();
  requestAnimationFrame(frame);

  // A small hook for automated playtests: /play/?debug
  if (location.search.includes('debug')) {
    (window as unknown as Record<string, unknown>).__game = {
      get state() { return { state, x: Math.round(player.x), y: Math.round(player.y), locks, cam: Math.round(cam), skillsGot, totalSkills, delivered, flown, section: currentSection, worldEnd, bosses: bosses.map((b) => ({ x: Math.round(b.x), hp: b.hp, alive: b.alive, gate: b.gateX })) }; },
      teleport(x: number) {
        triggers.forEach((tr) => { if (tr.x < x) tr.fired = true; });
        passive.length = 0;
        player.x = x; player.y = G; cam = x - 110;
      },
      openGates() { bosses.forEach((b) => { if (b.gateX < player.x + 400) { b.alive = false; b.gateOpen = 1; } }); },
      begin,
      sections: () => sections.map((s) => ({ kind: s.kind, x0: s.x0, x1: s.x1, id: s.level?.id })),
    };
  }
}
