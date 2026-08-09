/* ==========================================================================
   Nova Wallet — Animated background
   Тонкое поле плавающих частиц поверх CSS-блобов (iOS wallpaper vibe)
   ========================================================================== */

(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(max-width: 480px)").matches) return; // на мобиле фон скрыт

  const bg = document.getElementById("bg");
  if (!bg) return;

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.55";
  bg.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  let W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  let particles = [];

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(36, Math.round((W * H) / 38000));
    particles = new Array(count).fill(0).map(() => spawn());
  }

  function spawn() {
    const palette = ["#5B9CFF", "#B98CFF", "#5BD7E8", "#FF9ECF"];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1.4 + Math.random() * 2.6,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -(0.08 + Math.random() * 0.22),
      a: 0.12 + Math.random() * 0.3,
      c: palette[(Math.random() * palette.length) | 0]
    };
  }

  let running = true;
  function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  // Пауза, когда вкладка не видна — экономим CPU
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) tick();
  });

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 200); });

  resize();
  tick();
})();
