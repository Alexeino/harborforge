// The day the fire was lit. Change this if you want the counter to start elsewhere.
const FIRE_LIT = new Date("2026-10-25T00:00:00");

document.documentElement.classList.remove("no-js");

const reduceMotion =window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // Pre-render one glowing ember; drawing a bitmap is far cheaper than shadowBlur per particle.
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext("2d");
  const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, "rgba(255, 230, 180, 1)");
  grad.addColorStop(0.2, "rgba(255, 160, 70, 0.9)");
  grad.addColorStop(0.5, "rgba(255, 110, 40, 0.25)");
  grad.addColorStop(1, "rgba(255, 90, 30, 0)");
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 32, 32);

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

    ctx.globalCompositeOperation = "lighter";
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
