// All page motion in one place: smooth scroll, reveals, parallax and the
// cursor-following lines in the hero. One requestAnimationFrame loop drives it.
import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

/* ---------- Smooth scroll ---------- */
let lenis: Lenis | null = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: true, autoRaf: false });
  root.classList.add('smooth');
}

/* ---------- Theme ---------- */
// Canvas lines read their colours from CSS, so they follow the theme.
let lineRGB = '214 207 191';
let dotRGB = '232 225 209';
const readColours = () => {
  const cs = getComputedStyle(root);
  lineRGB = cs.getPropertyValue('--chalk-rgb').trim() || lineRGB;
  dotRGB = cs.getPropertyValue('--paper-rgb').trim() || dotRGB;
};
readColours();

const toggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
const labelToggle = () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  toggle?.setAttribute('aria-label', `Switch to ${next} theme`);
  toggle?.setAttribute('title', `Switch to ${next} theme`);
};
labelToggle();

function setTheme(next: 'light' | 'dark', save: boolean) {
  root.dataset.theme = next;
  if (save) { try { localStorage.setItem('theme', next); } catch { /* storage may be blocked */ } }
  readColours();
  labelToggle();
}

toggle?.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
  if (reduce || !doc.startViewTransition) { setTheme(next, true); return; }
  // A circle of the new theme grows out of the button.
  const r = toggle.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const vt = doc.startViewTransition(() => setTheme(next, true));
  vt.ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
    );
  });
});

// Follow the device setting until the visitor picks one. Light unless the device is dark.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  let saved: string | null = null;
  try { saved = localStorage.getItem('theme'); } catch { /* ignore */ }
  if (!saved) setTheme(e.matches ? 'dark' : 'light', false);
});

/* ---------- Sticky navbar ---------- */
const topbar = document.querySelector<HTMLElement>('.topbar');
let barTicking = false;
const updateBar = () => {
  topbar?.classList.toggle('scrolled', window.scrollY > 24);
  barTicking = false;
};
window.addEventListener('scroll', () => {
  if (!barTicking) { barTicking = true; requestAnimationFrame(updateBar); }
}, { passive: true });
updateBar();

/* ---------- Reveal on scroll ---------- */
const revealables = document.querySelectorAll<HTMLElement>('.echo, .echo-ring, [data-reveal]');
if (reduce || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.25, rootMargin: '0px 0px -8% 0px' }
  );
  revealables.forEach((el) => io.observe(el));
}

/* ---------- Parallax ----------
   data-depth: how far an element drifts with the mouse (0 to 1).
   data-speed: scroll parallax. Positive lags behind (feels far away), negative runs ahead. */
type Item = { el: HTMLElement; depth: number; speed: number; left: number; top: number; w: number; h: number; x: number; y: number; firstScreen: boolean };
const items: Item[] = Array.from(document.querySelectorAll<HTMLElement>('[data-depth], [data-speed]')).map((el) => ({
  el,
  depth: Number(el.dataset.depth || 0),
  speed: Number(el.dataset.speed || 0),
  left: 0, top: 0, w: 0, h: 0, x: 0, y: 0, firstScreen: false,
}));

const mouse = { tx: 0, ty: 0, x: 0, y: 0 };
const pointer = { x: -1, y: -1, active: 0 };

function measure() {
  const sy = window.scrollY;
  for (const it of items) {
    it.el.style.translate = '0px 0px';
    it.x = 0;
    it.y = 0;
    const r = it.el.getBoundingClientRect();
    it.left = r.left;
    it.top = r.top + sy;
    it.w = r.width;
    it.h = r.height;
    // Things visible on load stay put until you scroll; everything else is centred on its way through.
    it.firstScreen = it.top + it.h / 2 < window.innerHeight;
  }
  hubs.forEach((h) => h.measure());
}

if (finePointer && !reduce) {
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = performance.now();
  }, { passive: true });
} else if (!reduce) {
  window.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    pointer.x = t.clientX;
    pointer.y = t.clientY;
    pointer.active = performance.now();
  }, { passive: true });
}

/* ---------- Lines that meet at the cursor ----------
   Any element with data-sky gets them: a canvas.hub inside it, and its .d children as anchors.
   data-sky holds the strongest line opacity, so quieter sections can ask for less. */
function createHub(area: HTMLElement) {
  const canvas = area.querySelector<HTMLCanvasElement>('canvas.hub');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return null;

  const strength = Number(area.dataset.sky || 0.42);
  const anchors = items.filter((it) => area.contains(it.el) && it.el.matches('.d'));
  let box = { left: 0, top: 0, w: 0, h: 0 };
  let visible = false;
  const pos = { x: 0, y: 0, init: false };
  let pairs: [number, number][] = [];
  const phase = Math.random() * 10000;

  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(area);

  function measureHub() {
    const r = area.getBoundingClientRect();
    if (!r.width || !r.height) return;
    box = { left: r.left, top: r.top + window.scrollY, w: r.width, h: r.height };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(r.width * dpr);
    canvas!.height = Math.round(r.height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const c = anchors.map((a) => [a.left + a.w / 2, a.top + a.h / 2]);
    pairs = c.map((p, i) => {
      let best = -1, bd = Infinity;
      c.forEach((q, j) => {
        if (i === j) return;
        const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
        if (d < bd) { bd = d; best = j; }
      });
      return [i, best] as [number, number];
    });
  }

  function draw(t: number, scrollY: number) {
    if (!visible || !box.w) return;
    const { w, h } = box;
    const offY = box.top - scrollY;
    const recent = performance.now() - pointer.active < 2500;
    const px = pointer.x - box.left, py = pointer.y - offY;
    const inside = recent && px >= 0 && px <= w && py >= 0 && py <= h;
    const tt = t + phase;
    const tx = inside ? px : w * (0.5 + Math.sin(tt * 0.00023) * 0.3);
    const ty = inside ? py : h * (0.45 + Math.cos(tt * 0.00031) * 0.25);
    if (!pos.init) { pos.x = tx; pos.y = ty; pos.init = true; }
    pos.x += (tx - pos.x) * (inside ? 0.12 : 0.03);
    pos.y += (ty - pos.y) * (inside ? 0.12 : 0.03);

    ctx!.clearRect(0, 0, w, h);
    const pts = anchors.map((a) => [a.left + a.w / 2 + a.x - box.left, a.top + a.h / 2 + a.y - box.top]);
    const diag = Math.hypot(w, h);
    ctx!.lineWidth = 0.7;

    ctx!.strokeStyle = `rgb(${lineRGB} / ${(strength * 0.3).toFixed(3)})`;
    for (const [i, j] of pairs) {
      if (j < 0) continue;
      ctx!.beginPath();
      ctx!.moveTo(pts[i][0], pts[i][1]);
      ctx!.lineTo(pts[j][0], pts[j][1]);
      ctx!.stroke();
    }
    for (const [x, y] of pts) {
      const d = Math.hypot(x - pos.x, y - pos.y);
      const a = Math.max(strength * 0.12, strength - (d / diag) * strength * 1.3);
      ctx!.strokeStyle = `rgb(${lineRGB} / ${a.toFixed(3)})`;
      ctx!.beginPath();
      ctx!.moveTo(pos.x, pos.y);
      ctx!.lineTo(x, y);
      ctx!.stroke();
    }
    ctx!.fillStyle = `rgb(${dotRGB} / ${Math.min(0.9, strength * 2.1).toFixed(2)})`;
    ctx!.beginPath();
    ctx!.arc(pos.x, pos.y, 2.2, 0, Math.PI * 2);
    ctx!.fill();
    ctx!.strokeStyle = `rgb(${dotRGB} / ${(strength * 0.65).toFixed(3)})`;
    ctx!.beginPath();
    ctx!.arc(pos.x, pos.y, 8 + Math.sin(t * 0.004) * 1.5, 0, Math.PI * 2);
    ctx!.stroke();
  }

  return { measure: measureHub, draw };
}

const hubs = Array.from(document.querySelectorAll<HTMLElement>('[data-sky]'))
  .map(createHub)
  .filter((h): h is NonNullable<ReturnType<typeof createHub>> => h !== null);

/* ---------- The loop ---------- */
function frame(t: number) {
  lenis?.raf(t);
  const sy = lenis ? lenis.scroll : window.scrollY;
  const vh = window.innerHeight;
  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  for (const it of items) {
    const center = it.top + it.h / 2 - sy;
    if (center < -vh || center > vh * 2) continue;
    const x = -mouse.x * it.depth * 26;
    const scrollPart = it.firstScreen ? sy * it.speed : (center - vh / 2) * it.speed;
    const y = -mouse.y * it.depth * 18 + scrollPart;
    if (Math.abs(x - it.x) < 0.05 && Math.abs(y - it.y) < 0.05) continue;
    it.x = x;
    it.y = y;
    it.el.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
  }
  for (const h of hubs) h.draw(t, sy);
  requestAnimationFrame(frame);
}

function start() {
  measure();
  if (reduce) {
    hubs.forEach((h) => h.draw(0, window.scrollY));
    return;
  }
  requestAnimationFrame(frame);
}

let resizeTimer: number | undefined;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(measure, 150);
});
// Measure after fonts settle so positions are right.
(document.fonts?.ready ?? Promise.resolve()).then(start);
