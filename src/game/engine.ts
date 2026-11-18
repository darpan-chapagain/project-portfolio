// The game loop for /play. Reads the level data the page hands it, builds one long street,
// and plays it with keyboard, mouse or touch.
import { W, H, G, Pen, readPal, type Pal, makePerson, type FrameSet, sprite, type Sprite, STAR, DIPLOMA, suitcase, heroSprite, iconSprites, bigText } from './art';
import * as S from './scenery';
import * as Shots from './shots';
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
  skillIcons: Record<string, string>;
};

type Section = { i: number; level?: LevelData; s?: LevelScript; x0: number; x1: number; scene: string; kind: 'level' | 'sky' | 'end'; seed: number };
type HomeState = { door?: number; hutDoor?: number; lit?: number[]; figures?: boolean; unpacked?: boolean; folded?: boolean; progress?: number; label?: string };
type Thing = { kind: 'building' | 'prop' | 'kiosk' | 'mirror' | 'sequel'; x: number; w: number; type: string; sign?: string; note?: string; done?: boolean; clear?: boolean; active?: boolean; st: HomeState };
type Npc = { who: string; look: string; x: number; homeX: number; facing: 1 | -1; mask: boolean; party: boolean; joined: boolean; left: boolean; wave: boolean; inside: boolean; y: number; vy: number; walking: boolean; order: number };
type Pickup = { x: number; y: number; label: string; got: boolean; kind: 'skill' | 'reward'; icon: string; skill?: boolean; then?: { text: string; icon?: string }[] };
type Boss = { look: string; name: string; x: number; min: number; max: number; dir: number; hp: number; maxHp: number; alive: boolean; hit: number; cd: number; gateX: number; gateOpen: number; beaten: string[]; reward?: LevelScript['reward']; section: number };
/** A building you can go into: anywhere between x0 and x1 counts, the prompt sits over the door at x. */
type Door = { x: number; x0: number; x1: number; card: string; top: number };
type Trigger = { x: number; fired: boolean; beat: Beat; section: number };
type Particle = { x: number; y: number; vx: number; vy: number; life: number; col: 'line' | 'yellow' | 'mid' | 'red' | 'tear' };

const SPEED = 72;
const GRAV = 620;
const JUMP = -214;
const BOSS_TOP: Record<string, number> = { clock: 28, outage: 30, records: 25, queue: 20, blob: 17 };

export function startGame(root: HTMLElement, data: GameData) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const screen = canvas.getContext('2d')!;
  screen.imageSmoothingEnabled = false;
  // Everything is drawn into a 320x180 buffer, then copied to the screen, zoomed in when a
  // cutscene wants a close-up.
  const buf = document.createElement('canvas');
  buf.width = W;
  buf.height = H;
  const ctx = buf.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const pen = new Pen(ctx);
  const view = { z: 1, sx: 0, sy: 0 };
  let zoom = 1, zoomTo = 1;
  let focus = { x: 0, y: H / 2 }, focusTo = { x: 0, y: H / 2 };
  const ui = {
    level: root.querySelector<HTMLElement>('[data-hud-level]')!,
    skills: root.querySelector<HTMLElement>('[data-hud-skills]')!,
    extra: root.querySelector<HTMLElement>('[data-hud-extra]')!,
    bubbles: root.querySelector<HTMLElement>('[data-bubbles]')!,
    caption: root.querySelector<HTMLElement>('[data-caption]')!,
    toast: root.querySelector<HTMLElement>('[data-toast]')!,
    subtitle: root.querySelector<HTMLElement>('[data-subtitle]')!,
    start: root.querySelector<HTMLElement>('[data-start]')!,
    cards: root.querySelector<HTMLElement>('[data-cards]')!,
    jump: root.querySelector<HTMLButtonElement>('[data-jump]'),
  };

  let pal: Pal = readPal();
  let cache = new Map<string, FrameSet>();
  let stars: Sprite, diploma: Sprite, bag: Sprite, planeSprite: Sprite;
  let backUp: Sprite | null = null;
  let icons: Record<string, Sprite> = {};
  let phone: HTMLCanvasElement;
  const iconURLs = new Map<string, string>();
  const paint = () => {
    pal = readPal();
    cache = new Map();
    stars = sprite(STAR, pal);
    diploma = sprite(DIPLOMA, pal);
    bag = suitcase(pal);
    backUp = null;
    icons = iconSprites(pal);
    icons.diploma = sprite(DIPLOMA, pal);
    phone = S.phoneApp(pal);
    iconURLs.clear();
    // the plane, drawn once at 1x so the flight shots can show it bigger
    planeSprite = document.createElement('canvas');
    planeSprite.width = 66;
    planeSprite.height = 30;
    const pctx = planeSprite.getContext('2d')!;
    S.plane(new Pen(pctx), pal, 2, 24, false, 0);
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
  let kiosks: { thing: Thing; section: number; label: string; total: number; per: number; done?: Line; result?: string }[] = [];
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
      things.push({ kind: 'building', x: bx, w: bw, type: s.building.type, sign: s.building.sign, note: s.building.note, st: {} });
      // the IN tag sits just above each door, clear of the building's signs
      const doorTop: Record<string, number> = { college: 24, homeoffice: 66, tower: 26, office: 24, airport: 14, university: 20 };
      doors.push({ x: s.building.type === 'airport' ? bx + 65 : bx + bw / 2, x0: bx, x1: bx + (s.building.type === 'airport' ? 130 : bw), card: lv.id, top: G - (doorTop[s.building.type] ?? 24) });
      (s.props ?? []).forEach((pr) => {
        things.push({ kind: pr.type === 'mirror' ? 'mirror' : 'prop', x: x + pr.at, w: S.PROP_W[pr.type] ?? 20, type: pr.type, clear: pr.clear, st: {} });
      });
      npcs[si] = (s.npcs ?? []).map((n, k) => ({
        who: n.who, look: data.cast[n.who]?.look ?? 'student', x: x + n.at, homeX: x + n.at, facing: n.facing ?? 1,
        mask: !!n.mask, party: !!n.party, joined: false, left: false, wave: !!n.wave, inside: !!n.inside, y: G, vy: 0, walking: false, order: k,
      }));
      (s.beats ?? []).forEach((b) => triggers.push({ x: x + b.at, fired: false, beat: b, section: si }));
      totalSkills += lv.skills.length;
      if (s.skills) {
        lv.skills.forEach((label, k) => pickups.push({ x: x + s.skills!.from + k * s.skills!.gap, y: G - 30, label, got: false, kind: 'skill', icon: data.skillIcons[label] ?? 'star' }));
      }
      if (s.rating) rating = s.rating;
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
          const thing: Thing = { kind: 'kiosk', x: x + a, w: 43, type: 'bank', done: false, st: {} };
          things.push(thing);
          kiosks.push({ thing, section: si, label: s.deliver!.label, total: s.deliver!.total, per, done: s.deliver!.done, result: s.deliver!.result });
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
    things.push({ kind: 'sequel', x: x + 40, w: 104, type: 'sequel', st: {} });
    doors.push({ x: x + 92, x0: x + 40, x1: x + 144, card: 'next', top: G - 40 });
    worldEnd = x + 240;
  }

  // ------------------------------------------------------------ state
  const player = { x: 24, y: G, vx: 0, vy: 0, ground: true, facing: 1 as 1 | -1, anim: 0, hidden: false, senior: false, tika: false, carry: false, walking: false, onRoof: null as null | { x: number; y: number } };
  const crying = new Set<string>();
  const hugging = new Set<string>();
  let tearClock = 0;
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
  let rating = 0, ratingGlow = 0;
  let attackT = 0, attackCd = 0, attackQueued = false;
  let grindDay = 0;
  let levelUp: null | { t: number; title: string; sub: string } = null;
  const seenLevels = new Set<number>();

  function reset() {
    build();
    Object.assign(player, { x: 24, y: G, vx: 0, vy: 0, ground: true, facing: 1, hidden: false, senior: false, tika: false, carry: false, walking: false, onRoof: null });
    crying.clear(); hugging.clear();
    if (flight) plane = { x: flight.planeX, y: G, gear: true, active: false };
    cam = 0; camOverride = null; locks = 0; forcedNight = null; fade = 0; skillsGot = 0; delivered = 0; flown = false;
    history = []; particles = []; target = null; currentSection = -1;
    attackT = 0; attackCd = 0; attackQueued = false; grindDay = 0; levelUp = null; seenLevels.clear(); ratingGlow = 0;
    ui.bubbles.innerHTML = '';
    passive.length = 0; active.forEach((a) => a.el.remove()); active = [];
    ui.caption.hidden = true;
    shot = null;
    zoom = zoomTo = 1;
    fadeColor = '';
    cinema(false);
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

  // ------------------------------------------------------------ cinema
  let shot: null | { kind: 'terrace' | 'himalaya' | 'ocean' | 'usa'; k: number; dawn: number; star: number } = null;
  let fadeColor = '';
  function cinema(on: boolean) {
    root.classList.toggle('cinema', on);
    if (!on) { zoomTo = 1; subtitle(''); }
  }
  function subtitle(text: string, thought = false) {
    ui.subtitle.textContent = text;
    ui.subtitle.classList.toggle('thought', thought);
    ui.subtitle.hidden = !text;
  }
  /** Ease the camera onto a world point at a zoom level. */
  function aim(x: number, y: number, z: number) {
    focusTo = { x, y };
    zoomTo = z;
  }
  async function cut(sec = 0.5) {
    fadeColor = '#0e0d0b';
    await fadeTo(1, sec);
  }
  async function uncut(sec = 0.5) {
    await fadeTo(0, sec);
    fadeColor = '';
  }

  // ------------------------------------------------------------ words on screen
  type Anchor = () => { x: number; y: number };
  const passive: { line: Line; anchor: Anchor }[] = [];
  // Up to three people can talk at once, one bubble each; a speaker's next line waits its turn.
  let active: { el: HTMLElement; anchor: Anchor; left: number; who: string; lift: number }[] = [];

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
  function place(el: HTMLElement, anchor: Anchor, lift = 0) {
    const a = anchor();
    const bx = (a.x - cam - view.sx) * view.z, by = (a.y - lift - view.sy) * view.z;
    const x = Math.min(W - 30, Math.max(30, bx));
    el.style.left = `${(x / W) * 100}%`;
    el.style.top = `${(Math.max(30, by) / H) * 100}%`;
  }
  const lineTime = (l: Line) => Math.min(4, Math.max(1.9, 1.2 + l.text.length * 0.05));

  function anchorFor(line: Line, sec: number): Anchor {
    if (line.who) {
      // the nearest person with that name, in case the same person appears twice
      const all = npcs.flat().filter((m) => m && m.who === line.who && !m.inside);
      const n = all.sort((p, q) => Math.abs(p.x - player.x) - Math.abs(q.x - player.x))[0];
      if (n) return () => ({ x: n.x, y: n.y - frames(n.look).h - 4 });
    }
    const ph = () => frames(playerLook()).h + 4;
    if (player.onRoof) { const r = player.onRoof; return () => ({ x: r.x, y: r.y - ph() }); }
    return () => ({ x: player.x, y: player.y - ph() });
  }

  async function say(line: Line, sec: number) {
    if (line.narrate) {
      const film = root.classList.contains('cinema');
      if (film) subtitle(line.text); else { ui.caption.textContent = line.text; ui.caption.hidden = false; }
      await wait(lineTime(line) + 0.4);
      if (film) subtitle(''); else ui.caption.hidden = true;
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

  let toastQueue: { msg: string; icon?: string }[] = [];
  let toastLeft = 0;
  function toast(msg: string, icon?: string) { toastQueue.push({ msg, icon }); }
  function iconURL(key: string) {
    if (!iconURLs.has(key) && icons[key]) iconURLs.set(key, icons[key].toDataURL());
    return iconURLs.get(key) ?? '';
  }

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
    // these play their lines first (locked), then their moment
    if (b.action === 'levelUp' || b.action === 'build' || b.action === 'grind') {
      lock();
      player.vx = 0;
      for (const l of b.lines ?? []) await say(l, sec);
      if (b.action === 'levelUp') {
        player.senior = true;
        await powerUp('LEVEL UP!', 'SENIOR');
        toast('Level up: Senior', 'tie');
      } else if (b.action === 'build') await buildFeature(tr);
      else await grind(tr);
      unlock();
      return;
    }
    switch (b.action) {
      case 'fold': {
        const apt = things.find((th) => th.type === 'apartment' && th.x >= sections[sec].x0 && th.x < sections[sec].x1);
        if (apt) { apt.st.folded = true; burst(apt.x + 117, G - 14, 'yellow', 8); }
        break;
      }
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
      case 'goHome':
        await goHome(tr);
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

  /** The work desk nearest to a beat, in the same level. */
  function deskNear(tr: Trigger) {
    const sec = sections[tr.section];
    return things
      .filter((th) => th.type === 'workdesk' && th.x >= sec.x0 && th.x < sec.x1)
      .sort((a, b) => Math.abs(a.x - tr.x) - Math.abs(b.x - tr.x))[0];
  }

  // Build a feature: walk to the desk, type, the bar fills, it ships, the rating goes up.
  async function buildFeature(tr: Trigger) {
    const desk = deskNear(tr);
    if (!desk) return;
    await walkPlayer(desk.x + 17);
    player.facing = 1;
    desk.st.label = tr.beat.label ?? 'FEATURE';
    let k = 0;
    while (k < 1) {
      const dt = await nextFrame();
      k = Math.min(1, k + dt / 2.6);
      desk.st.progress = k;
      if (Math.random() < dt * 8) particles.push({ x: desk.x + 18 + (Math.random() - 0.5) * 10, y: G - 15, vx: (Math.random() - 0.5) * 20, vy: -30, life: 0.3, col: 'mid' });
    }
    desk.st.progress = 1.01;
    burst(desk.x + 17, G - 44, 'yellow', 14);
    toast(`Shipped: ${tr.beat.shipped ?? (tr.beat.label ?? 'feature').toLowerCase()}`, 'code');
    if (tr.beat.value) {
      rating = tr.beat.value;
      ratingGlow = 1.5;
      toast(`App rating: ${rating.toFixed(1)}`, 'star');
    }
    await wait(0.9, false);
    desk.st.progress = 0;
  }

  // Fourteen straight days: the counter runs, day and night flick past, you keep going.
  async function grind(tr: Trigger) {
    const desk = deskNear(tr);
    if (desk) { await walkPlayer(desk.x + 17); player.facing = 1; }
    for (let d = 1; d <= 14; d++) {
      grindDay = d;
      forcedNight = d % 2 ? 0.85 : 0.1;
      if (desk) { desk.st.label = 'FIXING THE SYNC'; desk.st.progress = d / 14; }
      await wait(d < 3 || d > 12 ? 0.45 : 0.22, false);
    }
    forcedNight = null;
    grindDay = 0;
    if (desk) desk.st.progress = 0;
  }

  // Like eating a mushroom: you flicker between sizes, then the level name stamps in.
  async function powerUp(title: string, sub = '') {
    levelUp = { t: 0, title, sub };
    burst(player.x, player.y - 12, 'yellow', 26);
    let k = 0;
    while (k < 1.5) {
      const dt = await nextFrame();
      k += dt;
      if (levelUp) levelUp.t = k;
    }
    levelUp = null;
  }

  async function walkPlayer(to: number, roof = false) {
    const get = () => (roof && player.onRoof ? player.onRoof.x : player.x);
    const set = (v: number) => { if (roof && player.onRoof) player.onRoof.x = v; else player.x = v; };
    player.walking = true;
    while (Math.abs(get() - to) > 1) {
      const dt = await nextFrame();
      const d = Math.sign(to - get());
      player.facing = d as 1 | -1;
      set(get() + d * Math.min(Math.abs(to - get()), SPEED * 0.8 * dt));
      player.anim += SPEED * 0.8 * dt;
    }
    player.walking = false;
  }

  async function tweenNight(from: number, to: number, sec: number) {
    let k = 0;
    while (k < 1) {
      k = Math.min(1, k + (await nextFrame()) / sec);
      forcedNight = from + (to - from) * k;
    }
    if (to === 0) forcedNight = null;
  }

  // In the front door, up the stairs (the lights follow you), out onto the terrace. Then the
  // camera goes behind you while you look at the sky. In the morning you come down with a
  // suitcase, and only then does the family come out.
  async function goHome(tr: Trigger) {
    const sec = sections[tr.section];
    const home = things.find((th) => th.type === 'familyhome' && th.x >= sec.x0 && th.x < sec.x1);
    if (!home) return;
    const st = home.st;
    const doorX = home.x + 68;
    lock();
    cinema(true);
    player.vx = 0;
    camOverride = home.x - 90;
    aim(doorX - 6, G - 20, 1.5);
    await walkPlayer(doorX);
    st.door = 1;
    await wait(0.35, false);
    player.hidden = true;
    await wait(0.3, false);
    st.door = 0;
    aim(home.x + 42, G - 40, 1.25);
    void tweenNight(0, 1, 2.8);
    await wait(0.4, false);
    st.lit = [1];
    await wait(0.6, false);
    st.lit = [1, 4];
    await wait(0.6, false);
    st.hutDoor = 1;
    await wait(0.3, false);
    player.onRoof = { x: home.x + 16, y: G - 56 };
    aim(home.x + 34, G - 70, 1.9);
    await wait(0.3, false);
    st.hutDoor = 0;
    await walkPlayer(home.x + 47, true);
    player.facing = 1;
    st.lit = [0, 1, 2, 3, 4];
    await wait(0.5, false);
    // the camera goes behind you
    await cut(0.7);
    shot = { kind: 'terrace', k: 0, dawn: 0, star: 0 };
    zoomTo = zoom = 1;
    await uncut(0.9);
    await wait(1.2, false);
    const lines = tr.beat.lines ?? [];
    for (let i = 0; i < lines.length; i++) {
      subtitle(lines[i].text, true);
      await wait(lineTime(lines[i]) + 0.5);
      subtitle('');
      await wait(0.35, false);
      if (i === lines.length - 1) {
        // a shooting star, just after the last thought
        let k = 0;
        while (k < 1) { k += (await nextFrame()) / 1.1; if (shot) shot.star = k; }
      }
    }
    await wait(0.6, false);
    // morning comes up behind the mountains
    let d = 0;
    while (d < 1) { d = Math.min(1, d + (await nextFrame()) / 3); if (shot) shot.dawn = d; }
    await wait(0.6, false);
    await cut(0.7);
    shot = null;
    forcedNight = null;
    st.lit = undefined;
    player.onRoof = { x: home.x + 47, y: G - 56 };
    aim(home.x + 34, G - 70, 1.9);
    focus = { ...focusTo };
    zoom = zoomTo;
    await uncut(0.7);
    await walkPlayer(home.x + 16, true);
    st.hutDoor = 1;
    await wait(0.3, false);
    player.onRoof = null;
    await wait(0.3, false);
    st.hutDoor = 0;
    aim(doorX + 20, G - 20, 1.4);
    st.lit = [3];
    await wait(0.5, false);
    st.lit = [1];
    await wait(0.5, false);
    st.lit = undefined;
    st.door = 1;
    await wait(0.3, false);
    player.x = doorX;
    player.hidden = false;
    player.carry = true;
    camOverride = home.x - 40;
    const spots = (npcs[tr.section] ?? []).filter((n) => n.inside).map((n) => n.homeX);
    const stand = (spots.length ? Math.max(...spots) : doorX) + 16;
    await walkPlayer(stand);
    player.facing = -1;
    await wait(0.5, false);
    // one by one, they come out
    aim((doorX + stand) / 2, G - 18, 1.5);
    const out = (npcs[tr.section] ?? []).filter((n) => n.inside);
    for (const n of out) {
      n.x = doorX;
      n.inside = false;
      void walkNpc(n, n.homeX, n.look === 'bhai' ? 60 : n.look.startsWith('hajur') ? 26 : 40);
      await wait(0.55, false);
    }
    while (out.some((n) => n.walking)) await nextFrame();
    out.forEach((n) => { n.facing = 1; });
    st.door = 0;
    unlock();
  }

  async function farewell(tr: Trigger) {
    const list = npcs[tr.section] ?? [];
    const b = tr.beat;
    lock();
    player.vx = 0;
    player.facing = -1;
    const lines = b.lines ?? [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      Object.entries(b.cry ?? {}).forEach(([who, at]) => { if (at === i) crying.add(who); });
      if (l.narrate && l.who) {
        const n = list.find((m) => m.who === l.who);
        if (n) {
          const from = n.x;
          await walkNpc(n, player.x - 11, 30);
          n.facing = 1;
          aim(player.x - 6, G - 16, 2.2);
          player.tika = true;
          burst(player.x - 3, player.y - 17, 'red', 5);
          subtitle(l.text);
          await wait(lineTime(l) + 0.4);
          subtitle('');
          aim(player.x - 30, G - 18, 1.5);
          await walkNpc(n, from, 30);
          n.facing = 1;
          continue;
        }
      }
      await say(l, tr.section);
    }
    // the hugs
    for (const who of b.hug ?? []) {
      const n = list.find((m) => m.who === who);
      if (!n) continue;
      const from = n.x;
      await walkNpc(n, player.x - (n.look === 'bhai' ? 9 : 10), n.look === 'bhai' ? 70 : 40);
      n.facing = 1;
      aim(player.x - 5, G - 14, 2.3);
      hugging.add(who);
      hugging.add('me');
      await wait(2.4);
      hugging.delete(who);
      hugging.delete('me');
      aim(player.x - 30, G - 18, 1.5);
      await walkNpc(n, from, 40);
      n.facing = 1;
    }
    list.forEach((n) => { n.wave = true; });
    await wait(0.7, false);
    player.facing = 1;
    camOverride = null;
    cinema(false);
    unlock();
  }

  async function walkNpc(n: Npc, to: number, speed = 40) {
    n.walking = true;
    n.facing = to < n.x ? -1 : 1;
    while (Math.abs(n.x - to) > 1) {
      const dt = await nextFrame();
      n.x += Math.sign(to - n.x) * Math.min(Math.abs(to - n.x), speed * dt);
    }
    n.x = to;
    n.walking = false;
  }

  async function lookBack() {
    lock();
    cinema(true);
    player.vx = 0;
    await wait(0.3, false);
    // frame the whole family waving, with you at the right edge
    const sec = sections[currentSection];
    const wavers = (npcs[sec?.i ?? -1] ?? []).filter((n) => n.wave && !n.inside);
    const left = wavers.length ? Math.min(...wavers.map((n) => n.x)) : player.x - 230;
    camOverride = Math.max(left - 24, player.x - 300);
    player.facing = -1;
    await wait(2.4);
    player.facing = 1;
    await wait(0.4, false);
    crying.delete('me');
    camOverride = null;
    cinema(false);
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

  async function playShot(kind: 'himalaya' | 'ocean' | 'usa', sec: number, line: string) {
    await cut(0.6);
    shot = { kind, k: 0, dawn: 0, star: 0 };
    subtitle(line);
    await uncut(0.6);
    let k = 0;
    while (k < 1) {
      k = Math.min(1, k + (await nextFrame()) / sec);
      if (shot) shot.k = k;
    }
  }

  async function fly() {
    if (!flight || !landing) return;
    const f = flight, l = landing;
    lock();
    cinema(true);
    player.vx = 0;
    player.hidden = true;
    plane.active = true;
    plane.gear = true;
    burst(f.planeX + 50, G - 8, 'mid', 6);
    // taxi and take off, close in
    let v = 0;
    zoom = zoomTo = 1.6;
    focus = focusTo = { x: plane.x + 30 - cam, y: G - 14 };
    subtitle(f.caption);
    while (plane.x < f.planeX + 300) {
      const dt = await nextFrame();
      v = Math.min(160, v + 70 * dt);
      plane.x += v * dt;
      if (plane.x > f.planeX + 120) plane.y = Math.max(G - 70, plane.y - 40 * dt);
      if (plane.y < G - 10) plane.gear = false;
      camOverride = plane.x - 120;
      aim(plane.x + 30, plane.y - 8, plane.y < G - 30 ? 1.2 : 1.6);
    }
    // the long way round
    await playShot('himalaya', 6, 'Over the Himalayas.');
    await playShot('ocean', 6, 'Across the ocean.');
    await playShot('usa', 7.5, '');
    // down into Ohio
    await cut(0.6);
    shot = null;
    subtitle('');
    const touchdown = l.x0 + 70;
    plane.x = touchdown - 260;
    plane.y = G - 60;
    camOverride = plane.x - 120;
    cam = camOverride;
    zoom = zoomTo = 1.3;
    focus = focusTo = { x: plane.x + 30 - cam, y: plane.y - 8 };
    await uncut(0.6);
    const startX = plane.x, startY = plane.y;
    while (plane.x < touchdown) {
      const dt = await nextFrame();
      plane.x += 120 * dt;
      const k = Math.min(1, (plane.x - startX) / (touchdown - startX));
      plane.y = startY + (G - startY) * k;
      plane.gear = k > 0.5;
      camOverride = plane.x - 120;
      aim(plane.x + 30, plane.y - 8, 1.3 + k * 0.3);
    }
    plane.y = G;
    burst(plane.x + 20, G - 1, 'mid', 8);
    v = 120;
    while (v > 0) {
      const dt = await nextFrame();
      v = Math.max(0, v - 100 * dt);
      plane.x += v * dt;
      camOverride = plane.x - 120;
      aim(plane.x + 30, G - 10, 1.6);
    }
    flown = true;
    player.tika = false;
    player.hidden = false;
    player.x = plane.x + 70;
    player.y = G;
    player.facing = 1;
    burst(player.x, G - 10, 'yellow', 10);
    aim(player.x, G - 14, 1.6);
    await wait(1.2, false);
    camOverride = null;
    cinema(false);
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
    if ('fFxXjJ'.includes(e.key) && e.key.length === 1) attackQueued = true;
    if (e.key === 'e' || e.key === 'E' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') enterQueued = true;
    if (isLeft() || isRight()) target = null;
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key));
  window.addEventListener('blur', () => keys.clear());

  const toWorld = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: view.sx + (((e.clientX - r.left) / r.width) * W) / view.z + cam, y: view.sy + (((e.clientY - r.top) / r.height) * H) / view.z };
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (state !== 'play') return;
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    if (locks > 0) { skip = true; return; }
    const p = toWorld(e);
    // a boss: walk up and hit it
    const b = bosses.find((q) => q.alive && Math.abs(p.x - q.x) < 16 && p.y > G - 38);
    if (b) { target = { x: b.x, boss: b, set: t }; return; }
    // a building: its door, or anywhere on its walls above head height
    const d = doors.find((q) => (Math.abs(p.x - q.x) < 13 && p.y > G - 28 && p.y < G + 6) || (p.x > q.x0 && p.x < q.x1 && p.y < G - 26 && p.y > G - 130));
    if (d) { target = { x: d.x, door: d, set: t }; return; }
    if (Math.abs(p.x - player.x) < 8 && p.y > player.y - 22 && p.y < player.y + 3) { jumpQueued = true; return; }
    target = { x: Math.max(6, Math.min(worldEnd - 6, p.x)), jump: p.y < G - 24, set: t };
  });
  ui.jump?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (locks > 0) { skip = true; return; }
    jumpQueued = true;
  });
  root.querySelector('[data-attack]')?.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (locks > 0) { skip = true; return; }
    attackQueued = true;
  });

  function begin() {
    if (state !== 'title') return;
    ui.start.hidden = true;
    state = 'play';
    canvas.focus({ preventScroll: true });
  }
  ui.start.querySelector('[data-begin]')?.addEventListener('click', begin);

  function hitBoss(b: Boss) {
    if (!b.alive || b.cd > 0) return;
    const top = G - (BOSS_TOP[b.look] ?? 20);
    b.hp--;
    b.hit = 0.25;
    b.cd = 0.35;
    burst(b.x, top, 'line', 8);
    npcs.flat().forEach((n) => { if (n && n.joined) n.vy = -110; });
    if (b.hp <= 0) {
      b.alive = false;
      burst(b.x, G - 14, 'yellow', 26);
      b.beaten.forEach((m) => toast(m));
      if (b.reward) {
        pickups.push({ x: b.x, y: G - 30, label: b.reward.label, got: false, kind: 'reward', icon: b.reward.item, skill: b.reward.skill, then: b.reward.then });
      }
    }
  }

  // ------------------------------------------------------------ update
  const doorHere = () => doors.find((q) => player.x > q.x0 - 4 && player.x < q.x1 + 4);

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
            if (Math.abs(dx) < 20) {
              player.facing = dx >= 0 ? 1 : -1;
              attackQueued = true;
              target = null;
            } else dir = Math.sign(dx);
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

    // attack: a quick swing in front of you
    attackT = Math.max(0, attackT - dt);
    attackCd = Math.max(0, attackCd - dt);
    if (control && attackQueued && attackCd === 0 && !player.hidden) {
      attackT = 0.22;
      attackCd = 0.38;
      const reach = player.x + player.facing * 12;
      burst(reach, player.y - 12, 'line', 3);
      const b = bosses.find((q) => q.alive && Math.abs(q.x - reach) < 16 && player.y > G - 36);
      if (b) {
        b.x = Math.max(b.min, Math.min(b.max, b.x + player.facing * 10));
        hitBoss(b);
      }
    }
    attackQueued = false;

    // doors
    if (control && enterQueued) {
      const d = doorHere();
      if (d) openCard(d.card);
    }
    enterQueued = false;

    // section change
    const si = sectionAt(player.x);
    if (si !== currentSection && si >= 0) {
      currentSection = si;
      // the blazer is for the office; home and grad school are casual
      if (!sections[si]?.s?.beats?.some((b) => b.action === 'levelUp')) player.senior = false;
      updateHud();
    }

    // a new level: power up before anything else happens
    const here = sections[currentSection];
    if (state === 'play' && locks === 0 && !levelUp && here?.kind === 'level' && here.level && !seenLevels.has(here.i)) {
      seenLevels.add(here.i);
      if (here.i > 0) {
        const lv = here.level;
        void (async () => { lock(); player.vx = 0; await powerUp(`LEVEL ${lv.n}`, lv.title); unlock(); })();
      }
    }
    ratingGlow = Math.max(0, ratingGlow - dt);

    // triggers
    if (state === 'play' && locks === 0) {
      for (const tr of triggers) {
        if (!tr.fired && player.x >= tr.x) { tr.fired = true; void fire(tr); if (locks > 0) break; }
      }
    }

    // skills and rewards
    for (const pk of pickups) {
      if (pk.got) continue;
      const reach = pk.kind === 'reward'
        ? Math.abs(pk.x - player.x) < 12
        : Math.abs(pk.x - player.x) < 11 && player.y - 18 < pk.y + 6 && player.y > pk.y - 6;
      if (reach) {
        pk.got = true;
        if (pk.kind === 'skill' || pk.skill) skillsGot++;
        burst(pk.x, pk.y, 'yellow', 14);
        toast(pk.kind === 'reward' ? pk.label : `Skill unlocked: ${pk.label}`, pk.icon);
        (pk.then ?? []).forEach((m) => toast(m.text, m.icon));
        updateHud();
      }
    }

    // bank kiosks
    for (const k of kiosks) {
      if (k.thing.done || Math.abs(k.thing.x + 20 - player.x) > 18) continue;
      k.thing.done = true;
      delivered = Math.min(k.total, delivered + k.per);
      burst(k.thing.x + 20, G - 50, 'yellow', 12);
      toast(`Mobile banking live: ${delivered}/${k.total} banks`, 'phone');
      updateHud();
      if (delivered >= k.total) {
        if (k.done) passive.push({ line: k.done, anchor: () => ({ x: player.x, y: player.y - frames(playerLook()).h - 4 }) });
        if (k.result) toast(`Revenue target hit: ${k.result}`, 'chart');
      }
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
        player.vy = -190;
        player.y = top - 1;
        player.ground = false;
        hitBoss(b);
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
        } else if (!n.walking && !n.left && !n.inside && locks === 0 && Math.abs(n.x - player.x) < 60) {
          n.facing = player.x < n.x ? -1 : 1;
        }
        if (n.vy !== 0 || n.y < G) {
          n.vy += GRAV * dt;
          n.y += n.vy * dt;
          if (n.y >= G) { n.y = G; n.vy = 0; }
        }
      }
    }

    // tears
    tearClock -= dt;
    if (tearClock <= 0 && crying.size) {
      tearClock = 0.28;
      const eye = (x: number, y: number, h: number, facing: number) => {
        particles.push({ x: x + facing * 3 + (Math.random() - 0.5), y: y - h + 9, vx: facing * 6, vy: 10, life: 0.5, col: 'tear' });
      };
      if (crying.has('me') && !player.hidden) {
        const r = player.onRoof;
        eye(r ? r.x : player.x, r ? r.y : player.y, frames(playerLook()).h, player.facing);
      }
      npcs.flat().forEach((n) => { if (n && crying.has(n.who) && !n.inside) eye(n.x, n.y, frames(n.look).h, n.facing); });
    }
    // the suitcase stays in the new apartment
    if (player.carry && flown) {
      const apt = things.find((th) => th.type === 'apartment');
      if (apt && player.x > apt.x + 34) { player.carry = false; apt.st.unpacked = true; }
    }

    // particles
    particles = particles.filter((q) => (q.life -= dt) > 0 && !(q.col === 'tear' && q.y >= G - 1));
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

    // zoom eases toward its target
    zoom += (zoomTo - zoom) * Math.min(1, dt * 2.2);
    focus.x += (focusTo.x - cam - focus.x) * Math.min(1, dt * 3);
    focus.y += (focusTo.y - focus.y) * Math.min(1, dt * 3);
    if (Math.abs(zoomTo - 1) < 0.001 && Math.abs(zoom - 1) < 0.01) zoom = 1;

    // camera
    const want = camOverride ?? player.x - 110;
    cam += (want - cam) * Math.min(1, dt * (camOverride !== null ? 3 : 6));
    cam = Math.max(0, Math.min(worldEnd - W, cam));

    // words
    if (locks === 0) {
      for (let i = 0; i < passive.length && active.length < 3; i++) {
        const next = passive[i];
        const who = next.line.who ?? 'me';
        if (active.some((a) => a.who === who)) continue;
        passive.splice(i--, 1);
        // skip lines whose speaker has scrolled out of view
        const ax = next.anchor().x;
        if (ax < cam - 40 || ax > cam + W + 40) continue;
        // stack bubbles that would sit on top of each other
        const lift = active.filter((a) => Math.abs(a.anchor().x - ax) < 60).length * 21;
        active.push({ el: bubble(next.line, next.anchor), anchor: next.anchor, left: lineTime(next.line), who, lift });
      }
    }
    active = active.filter((a) => {
      a.left -= dt;
      place(a.el, a.anchor, a.lift);
      const ax = a.anchor().x;
      const gone = ax < cam - 60 || ax > cam + W + 60;
      if (a.left <= 0 || locks > 0 || gone) { a.el.remove(); return false; }
      return true;
    });
    toastLeft -= dt;
    if (toastLeft <= 0) {
      if (toastQueue.length) {
        const next = toastQueue.shift()!;
        ui.toast.textContent = '';
        if (next.icon && iconURL(next.icon)) {
          const img = document.createElement('img');
          img.src = iconURL(next.icon);
          img.alt = '';
          ui.toast.append(img);
        }
        ui.toast.append(next.msg);
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
    if (shot) {
      drawShot();
      finish();
      return;
    }
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
      else if (th.type === 'worldmap') S.worldmap(pen, pal, sx, t);
      else if (th.type === 'rating') S.ratingBoard(pen, pal, sx, rating, ratingGlow);
      else if (th.type === 'workdesk') S.workdesk(pen, pal, sx, t, th.st.progress ?? 0, th.st.label ?? '');
      else if (th.type === 'chart') {
        const k = kiosks.find((q) => q.thing.x > th.x - 2000 && q.thing.x < th.x + 2000);
        S.chart(pen, pal, sx, k ? delivered / k.total : 0, k?.result ?? '');
      }
      else if (th.kind === 'prop') {
        const family = th.type === 'familyhome' && npcs.flat().some((n) => n?.inside);
        S.prop(pen, pal, th.type, sx, t, night, { ...th.st, figures: family });
      }
      else if (th.kind === 'kiosk') S.bankBranch(pen, pal, sx, !!th.done, t, phone);
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
    // skills float in little badges; rewards float bigger, with a glint going round them
    for (const pk of pickups) {
      if (pk.got) continue;
      const sx = Math.round(pk.x - c), y = Math.round(pk.y + Math.sin(t * 3 + pk.x) * 1.5);
      if (sx < -16 || sx > W + 16) continue;
      const img = icons[pk.icon] ?? stars;
      if (pk.kind === 'reward') {
        const s2 = pk.icon === 'diploma' ? 1 : 2;
        ctx.drawImage(img, sx - (img.width * s2) / 2, y - (img.height * s2) / 2, img.width * s2, img.height * s2);
      } else {
        pen.c(pal.fill).disc(sx, y, 8);
        pen.c(pal.line).circle(sx, y, 8);
        ctx.drawImage(img, sx - 5, y - 5);
      }
      const a = t * 4 + pk.x;
      pen.c(pal.yellow).px(sx + Math.cos(a) * 11, y + Math.sin(a) * 11);
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
      for (const n of list) {
        if (n.inside) continue;
        const pose = hugging.has(n.who) ? 'hug' : crying.has(n.who) && !n.walking ? 'cry' : undefined;
        drawPerson(n.look, n.x - c, n.y, n.facing, n.walking, n.y < G, n.mask ? { mask: true } : {}, n.wave && !hugging.has(n.who), t * 60, pose);
      }
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
    const myPose = (moving: boolean) => (hugging.has('me') || attackT > 0 ? 'hug' : crying.has('me') && !moving ? 'cry' : undefined);
    if (player.onRoof) drawPerson(playerLook(), player.onRoof.x - c, player.onRoof.y, player.facing, player.walking, false, playerExtra(), false, player.anim, myPose(player.walking));
    if (!player.hidden) {
      const moving = (Math.abs(player.vx) > 1 && player.ground) || player.walking;
      if (levelUp && levelUp.t < 1.1 && Math.floor(levelUp.t * 10) % 2) {
        // the mushroom flicker: big, small, big
        const f = frames(playerLook(), playerExtra());
        const img = player.facing === 1 ? f.r.idle : f.l.idle;
        ctx.drawImage(img, Math.round(player.x - c - img.width * 0.75), Math.round(player.y - img.height * 1.5), img.width * 1.5, img.height * 1.5);
      } else {
        drawPerson(playerLook(), player.x - c, player.y, player.facing, moving, !player.ground, playerExtra(), false, player.anim, myPose(moving));
      }
      if (player.carry) ctx.drawImage(bag, Math.round(player.x - c + (player.facing === 1 ? 3 : -11)), G - 9);
      if (attackT > 0) {
        // the swing
        const fx = player.x - c + player.facing * 10, fy = player.y - 13;
        pen.c(pal.line);
        for (let i = 0; i < 7; i++) {
          const a = -0.9 + i * 0.3;
          pen.px(fx + player.facing * Math.cos(a) * 7, fy + Math.sin(a) * 7);
        }
        pen.c(pal.yellow).px(fx + player.facing * 8, fy);
      }
    }

    // particles
    for (const q of particles) {
      pen.c(pal[q.col]).rect(q.x - c, q.y, q.life > 0.3 ? 2 : 1, q.life > 0.3 ? 2 : 1);
    }

    // a prompt over the door when you are anywhere in front of the building
    if (state === 'play' && locks === 0 && !player.hidden) {
      const d = doorHere();
      if (d) {
        const sx = d.x - c, y = d.top - 5 + Math.round(Math.sin(t * 5) * 1.5);
        pen.panel(sx - 8, y - 9, 17, 9, pal.fill, pal.line);
        pen.c(pal.line).text('IN', sx + 1, y - 7, 'center');
        pen.c(pal.line);
        pen.h(sx - 2, sx + 2, y + 1); pen.h(sx - 1, sx + 1, y + 2); pen.px(sx, y + 3);
      }
    }
    // the 14 days, counted out big
    if (grindDay > 0) {
      pen.c(pal.line);
      bigText(pen, `DAY ${grindDay}`, W / 2, 26, 3, 'center');
    }
    // LEVEL N and its name, stamped in while you flicker
    if (levelUp) {
      const k = levelUp.t;
      const alpha = k < 0.15 ? k / 0.15 : k > 1.3 ? Math.max(0, (1.5 - k) / 0.2) : 1;
      ctx.globalAlpha = alpha;
      const pop = k < 0.2 ? Math.round((0.2 - k) * 20) : 0;
      pen.panel(W / 2 - 70, 22 - pop, 140, levelUp.sub ? 36 : 26, pal.fill, pal.line);
      pen.c(pal.line);
      bigText(pen, levelUp.title, W / 2, 26 - pop, 3, 'center');
      if (levelUp.sub) pen.c(pal.mid).text(levelUp.sub, W / 2, 46 - pop, 'center');
      ctx.globalAlpha = 1;
      if (Math.random() < 0.5) particles.push({ x: player.x + (Math.random() - 0.5) * 24, y: player.y - 30 * Math.random(), vx: 0, vy: -40, life: 0.5, col: 'yellow' });
    }
    // where you tapped
    if (target && t - target.set < 0.5) {
      const sx = target.x - c;
      pen.c(pal.line);
      pen.line(sx - 2, G + 3, sx + 2, G + 7); pen.line(sx + 2, G + 3, sx - 2, G + 7);
    }

    finish();
  }

  function drawShot() {
    if (!shot) return;
    if (shot.kind === 'terrace') {
      backUp = backUp ?? heroSprite('me', 'backUp', pal);
      if (backUp) Shots.terrace(pen, pal, t, shot.dawn, backUp, shot.star);
    } else if (shot.kind === 'himalaya') Shots.himalaya(pen, pal, t, shot.k, planeSprite);
    else if (shot.kind === 'ocean') Shots.ocean(pen, pal, t, shot.k, planeSprite);
    else Shots.usa(pen, pal, t, shot.k, planeSprite);
  }

  /** Fade, then copy the buffer to the screen, zoomed in on the focus if there is one. */
  function finish() {
    if (fade > 0) {
      ctx.globalAlpha = fade;
      pen.c(fadeColor || pal.bg).rect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    const z = shot ? 1 : zoom;
    const sw = W / z, sh = H / z;
    view.z = z;
    view.sx = Math.max(0, Math.min(W - sw, focus.x - sw / 2));
    view.sy = Math.max(0, Math.min(H - sh, focus.y - sh / 2));
    screen.imageSmoothingEnabled = false;
    screen.clearRect(0, 0, W, H);
    screen.drawImage(buf, view.sx, view.sy, sw, sh, 0, 0, W, H);
  }
  const hashOff = (i: number) => S.hash(i * 1.7 + 4.2);

  const playerLook = () => (player.senior ? 'meSenior' : 'me');
  const playerExtra = () => {
    const mask = !!sections[currentSection]?.s?.npcs?.some((n) => n.mask) && sections[currentSection]?.level?.id === data.levels[0]?.id;
    return { mask, tika: player.tika };
  };

  function drawPerson(look: string, sx: number, y: number, facing: 1 | -1, moving: boolean, air: boolean, extra: Record<string, boolean> = {}, wave = false, anim = t * 60, pose?: 'cry' | 'hug') {
    if (sx < -16 || sx > W + 16) return;
    const f = frames(look, extra);
    const fr = facing === 1 ? f.r : f.l;
    let img = fr.idle;
    if (pose) img = fr[pose];
    else if (air) img = fr.jump;
    else if (moving) img = Math.floor(anim / 7) % 2 ? fr.walkA : fr.walkB;
    const bob = moving && !air && Math.floor(anim / 7) % 2 ? -1 : 0;
    const x = Math.round(sx - f.w / 2), top = Math.round(y - f.h + bob);
    ctx.drawImage(img, x, top);
    if (wave) {
      const up = Math.floor(t * 3) % 2;
      pen.c(pal.line);
      const hx = facing === 1 ? x + f.w - 2 : x;
      const hy = top + Math.round(f.h * 0.42);
      pen.c(pal.skin).rect(hx, hy - 5 - up * 3, 2, 2);
      pen.c(pal.line).v(hx + (facing === 1 ? 0 : 1), hy - 3 - up * 3, hy);
    }
  }

  // ------------------------------------------------------------ loop
  // The loop sleeps while the game is scrolled out of view or the tab is hidden.
  let last = performance.now();
  let onScreen = true;
  let running = false;
  function frame(now: number) {
    if (!onScreen || document.hidden) { running = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  const wake = () => {
    if (running || !onScreen || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; wake(); }).observe(root);
  document.addEventListener('visibilitychange', wake);
  reset();
  wake();

  // A small hook for automated playtests: /play/?debug
  if (location.search.includes('debug')) {
    (window as unknown as Record<string, unknown>).__game = {
      get state() { return { shot: shot?.kind ?? null, zoom: Math.round(zoom * 100) / 100, state, x: Math.round(player.x), y: Math.round(player.y), locks, cam: Math.round(cam), skillsGot, totalSkills, delivered, flown, section: currentSection, worldEnd, view: { ...view }, rating, bosses: bosses.map((b) => ({ x: Math.round(b.x), hp: b.hp, alive: b.alive, gate: b.gateX })) }; },
      teleport(x: number) {
        triggers.forEach((tr) => { if (tr.x < x) tr.fired = true; });
        if (landing && flight) {
          flown = x >= landing.x0;
          plane.x = flown ? landing.x0 + 200 : flight.planeX;
          plane.y = G;
        }
        passive.length = 0;
        npcs.forEach((n) => { if (n.joined) { n.joined = false; n.left = true; } });
        player.x = x; player.y = G; cam = x - 110;
      },
      openGates() { bosses.forEach((b) => { if (b.gateX < player.x + 400) { b.alive = false; b.gateOpen = 1; } }); },
      begin,
      sections: () => sections.map((s) => ({ kind: s.kind, x0: s.x0, x1: s.x1, id: s.level?.id })),
    };
  }
}
