/* ============================================================
   Interactions: starfield, scroll reveals, stat counters, year
   ============================================================ */

/* ---- Footer year ---- */
document.getElementById("year").textContent = new Date().getFullYear();

/* ---- Scroll reveal (progressive enhancement) ----
   Content is visible by default; we only hide+animate once we KNOW
   JS is running, and a safety timer guarantees nothing stays hidden. */
(function scrollReveal() {
  // Mark glass blocks as reveal targets.
  document.querySelectorAll(".glass").forEach((el) => el.classList.add("reveal"));
  const targets = Array.from(document.querySelectorAll(".reveal"));

  // Signal JS is active so CSS can hide reveal elements pre-animation.
  document.documentElement.classList.add("js-reveal");

  const showAll = () => targets.forEach((el) => el.classList.add("in"));

  if (!("IntersectionObserver" in window)) {
    showAll();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
  );
  targets.forEach((el) => io.observe(el));

  // Safety net: guarantee nothing ever stays hidden, even if the observer
  // never fires for a given element (e.g. user never scrolls to it).
  const revealRemaining = () => setTimeout(showAll, 1800);
  if (document.readyState === "complete") revealRemaining();
  else window.addEventListener("load", revealRemaining);
})();

/* ---- Animated stat counters ---- */
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = el.dataset.count;
      statObserver.unobserve(el);
      if (target === "∞" || isNaN(parseInt(target))) {
        el.textContent = target;
        return;
      }
      const end = parseInt(target, 10);
      let cur = 0;
      const step = Math.max(1, Math.round(end / 30));
      const tick = () => {
        cur = Math.min(end, cur + step);
        el.textContent = cur;
        if (cur < end) requestAnimationFrame(tick);
      };
      tick();
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll(".stat__num").forEach((el) => statObserver.observe(el));

/* ---- Starfield canvas ---- */
(function starfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let meteors = [];
  let w, h;

  // Subtle deep-space star tints: mostly pale starlight, a few faint
  // blue, gold and violet stars — nothing saturated or neon.
  const STAR_TINTS = [
    "225, 228, 240", // pale white
    "225, 228, 240",
    "200, 210, 240", // faint blue
    "235, 222, 200", // faint warm gold
    "210, 200, 235", // faint violet
  ];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(170, Math.floor((w * h) / 11000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.25,
      a: Math.random() * 0.5 + 0.15,
      tw: Math.random() * 0.018 + 0.003,
      dir: Math.random() < 0.5 ? 1 : -1,
      vy: Math.random() * 0.08 + 0.01,
      tint: STAR_TINTS[(Math.random() * STAR_TINTS.length) | 0],
    }));
  }

  function spawnMeteor() {
    const fromLeft = Math.random() < 0.5;
    meteors.push({
      x: fromLeft ? Math.random() * w * 0.4 : w * (0.6 + Math.random() * 0.4),
      y: Math.random() * h * 0.5,
      len: 90 + Math.random() * 140,
      speed: 6 + Math.random() * 5,
      angle: (fromLeft ? 0.32 : 0.68) * Math.PI, // shallow downward diagonal
      life: 0,
      ttl: 60 + Math.random() * 30,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // Twinkling, slowly drifting stars.
    for (const s of stars) {
      s.a += s.tw * s.dir;
      if (s.a > 0.7 || s.a < 0.12) s.dir *= -1;
      s.y += s.vy;
      if (s.y > h) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.tint}, ${s.a})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `rgba(${s.tint}, 0.5)`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Shooting stars / meteors.
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life++;
      m.x += Math.cos(m.angle) * m.speed;
      m.y += Math.sin(m.angle) * m.speed;
      const fade = 1 - m.life / m.ttl;
      const tailX = m.x - Math.cos(m.angle) * m.len;
      const tailY = m.y - Math.sin(m.angle) * m.len;
      const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
      grad.addColorStop(0, `rgba(214, 220, 245, ${0.85 * fade})`);
      grad.addColorStop(1, "rgba(214, 220, 245, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();
      if (m.life >= m.ttl || m.x > w + m.len || m.y > h + m.len) meteors.splice(i, 1);
    }

    // Occasionally launch a new meteor.
    if (meteors.length < 2 && Math.random() < 0.006) spawnMeteor();

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  if (!reduce) {
    setTimeout(spawnMeteor, 1200);
    draw();
  }
})();

/* ---- Subtle parallax on background ---- */
(function parallax() {
  const bg = document.querySelector(".bg-image");
  if (!bg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.04;
    bg.style.transform = `scale(1.08) translateY(${y}px)`;
  }, { passive: true });
})();
