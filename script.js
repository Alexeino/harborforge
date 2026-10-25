// Content comes from config.js (window.SITE). Edit that file, not this one.
const SITE = window.SITE || {};

// "YYYY-MM-DD" parsed as local time (new Date("YYYY-MM-DD") would be UTC and can show the previous day).
function parseDate(str) {
  const [y, m, d] = String(str).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
const formatDate = (str) =>
  parseDate(str).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const FIRE_LIT = parseDate(SITE.startDate || "2026-10-25");

document.documentElement.classList.remove("no-js");

// ---------- Render content from config ----------
// Builds elements with textContent, so config text never gets parsed as HTML.
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

const isExternal = (url) => /^https?:\/\//i.test(url);
const linkAttrs = (url) =>
  isExternal(url) ? { href: url, target: "_blank", rel: "noopener" } : { href: url };

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const STATUS_LABELS = { hot: "Red hot", cooling: "Cooling", tempered: "Tempered", cold: "Cold iron" };

(function renderContent() {
  if (SITE.startDate) document.getElementById("fire-date").textContent = formatDate(SITE.startDate);
  if (SITE.intro) document.getElementById("intro").textContent = SITE.intro;

  document.getElementById("vows").append(
    ...(SITE.vows || []).map((vow, i) =>
      el("li", { class: "vow reveal" },
        el("span", { class: "vow-num mono" }, ROMAN[i] || i + 1),
        el("h3", {}, vow.title),
        el("p", {}, vow.text)
      )
    )
  );

  document.getElementById("projects").append(
    ...(SITE.projects || []).map((p) => {
      const status = STATUS_LABELS[p.status] ? p.status : "hot";
      return el("article", { class: status === "cold" ? "card card-empty reveal" : "card reveal", "data-status": status },
        el("div", { class: "card-top" },
          el("span", { class: "status mono" }, STATUS_LABELS[status]),
          p.tag && el("span", { class: "tag mono" }, p.tag)
        ),
        el("h3", {}, p.title),
        el("p", {}, p.text),
        p.link && p.link.url && el("a", { class: "card-link", ...linkAttrs(p.link.url) }, `${p.link.label || "Open"} →`)
      );
    })
  );

  document.getElementById("log-list").append(
    ...(SITE.log || []).map((entry) =>
      el("li", { class: entry.date ? "entry reveal" : "entry entry-future reveal" },
        entry.date
          ? el("time", { class: "mono", datetime: entry.date }, formatDate(entry.date))
          : el("time", { class: "mono" }, "Soon"),
        el("div", {}, el("h3", {}, entry.title), el("p", {}, entry.text))
      )
    )
  );

  const links = document.getElementById("contact-links");
  if (SITE.email) links.append(el("a", { class: "btn btn-primary", href: `mailto:${SITE.email}` }, "Email me"));
  (SITE.socials || [])
    .filter((s) => s.url)
    .forEach((s) => links.append(el("a", { class: "btn btn-ghost", ...linkAttrs(s.url) }, s.label)));
})();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Days counter ----------
(function daysBurning() {
  const el = document.getElementById("days");
  const label = document.getElementById("days-label");
  const days = Math.max(1, Math.floor((Date.now() - FIRE_LIT) / 86400000) + 1);
  label.textContent = days === 1 ? "day" : "days";

  if (reduceMotion || days < 2) {
    el.textContent = days;
    return;
  }
  const start = performance.now();
  const duration = 1400;
  (function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(days * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  })(start);
})();

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Theme ----------
const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const systemLight = window.matchMedia("(prefers-color-scheme: light)");

function applyTheme(theme, animate) {
  if (animate && !reduceMotion) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  }
  root.dataset.theme = theme;
  themeMeta.content = theme === "light" ? "#f6f1e8" : "#0b1320";
  themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
}

function savedTheme() {
  try { return localStorage.getItem("hf-theme"); } catch (e) { return null; }
}

applyTheme(root.dataset.theme || "dark", false);

themeToggle.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  try { localStorage.setItem("hf-theme", next); } catch (e) {}
  applyTheme(next, true);
});

// Follow the OS setting live, unless the visitor picked a theme themselves.
systemLight.addEventListener("change", (e) => {
  if (!savedTheme()) applyTheme(e.matches ? "light" : "dark", true);
});

// ---------- Nav ----------
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");

const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  links.classList.toggle("open", open);
  nav.classList.toggle("menu-open", open);
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ---------- Forge sparks ----------
(function sparks() {
  const canvas = document.getElementById("sparks");
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.parentElement;
  let w = 0, h = 0, dpr, particles = [], running = true;

  // Pre-render one glowing ember per theme; drawing a bitmap is far cheaper than shadowBlur per particle.
  function makeSprite(stops) {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const sctx = c.getContext("2d");
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    stops.forEach(([at, color]) => grad.addColorStop(at, color));
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
    return c;
  }
  const sprites = {
    dark: makeSprite([
      [0, "rgba(255, 230, 180, 1)"],
      [0.2, "rgba(255, 160, 70, 0.9)"],
      [0.5, "rgba(255, 110, 40, 0.25)"],
      [1, "rgba(255, 90, 30, 0)"],
    ]),
    // Additive blending vanishes on a light background, so light embers are darker and drawn normally.
    light: makeSprite([
      [0, "rgba(240, 110, 30, 1)"],
      [0.25, "rgba(228, 87, 15, 0.8)"],
      [0.55, "rgba(228, 87, 15, 0.18)"],
      [1, "rgba(228, 87, 15, 0)"],
    ]),
  };

  function resize() {
    const nw = hero.clientWidth;
    const nh = hero.clientHeight;
    // Mobile browsers fire resize when the address bar shows/hides; skip if nothing changed.
    if (nw === w && Math.abs(nh - h) < 80) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = nw;
    h = nh;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    return {
      x: w * (0.2 + Math.random() * 0.6),
      y: h + 10,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.6 + Math.random() * 1.6),
      life: 0,
      max: 220 + Math.random() * 260,
      size: 4 + Math.random() * 8,
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const target = w < 600 ? 30 : 60;
    if (particles.length < target && Math.random() < 0.5) particles.push(spawn());

    const light = root.dataset.theme === "light";
    const sprite = light ? sprites.light : sprites.dark;
    ctx.globalCompositeOperation = light ? "source-over" : "lighter";
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;
      p.x += p.vx + Math.sin((p.life + p.max) * 0.03) * 0.25;
      p.y += p.vy;
      const t = p.life / p.max;
      const alpha = t < 0.1 ? t * 10 : 1 - t;
      if (alpha <= 0 || p.y < -10) {
        particles.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    requestAnimationFrame(frame);
  }

  resize();
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  // Pause when the hero is off screen to save battery.
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) requestAnimationFrame(frame);
  }).observe(hero);

  requestAnimationFrame(frame);
})();
