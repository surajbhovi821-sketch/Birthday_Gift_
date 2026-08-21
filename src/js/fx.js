/* ================= 2D FX OVERLAY (screen-space confetti / hearts) ================= */
(function () {
  "use strict";
  const canvas = document.createElement("canvas");
  canvas.id = "fx";
  const ctx = canvas.getContext("2d");
  const hasCtx = !!ctx;
  if (hasCtx) document.body.appendChild(canvas);

  let W = 0, H = 0;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener("resize", resize);

  const parts = [];
  const COLORS = ["#ffd88a", "#ff9fb0", "#ffdf9e", "#ffffff", "#ffb4c8", "#ffe066", "#c9b8ff"];

  const QUAL = window.Core ? Core.quality() : "med";
  const scale = QUAL === "high" ? 1 : (QUAL === "med" ? 0.6 : 0.35);

  function spawnConfetti(n, x, y) {
    n = Math.round(n * scale);
    for (let i = 0; i < n; i++) {
      const fromX = x != null ? x + rand(-40, 40) : rand(0, W);
      const fromY = y != null ? y + rand(-30, 30) : rand(-H * 0.3, 0);
      parts.push({
        kind: "confetti", x: fromX, y: fromY,
        vx: rand(-2.4, 2.4), vy: rand(-4.5, -1.5),
        g: rand(0.08, 0.16), rot: rand(0, Math.PI * 2), vr: rand(-0.18, 0.18),
        w: rand(5, 11), h: rand(8, 15), color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0, max: rand(120, 220), shape: Math.random() < 0.5 ? "rect" : "circle"
      });
    }
  }

  function spawnHeart(x, y) {
    parts.push({
      kind: "heart", x: x != null ? x : rand(0, W), y: y != null ? y : H + 20,
      vx: rand(-0.5, 0.5), vy: y != null ? rand(-4, -2.5) : rand(-2.2, -1.1),
      rot: rand(-0.3, 0.3), vr: rand(-0.02, 0.02), s: rand(10, 26),
      color: ["#ff7f9e", "#ff9fb0", "#ffb4c8", "#ff5f7a"][Math.floor(Math.random() * 4)],
      life: 0, max: rand(140, 240)
    });
  }

  function heartPath(g, s) {
    g.beginPath();
    g.moveTo(0, s * 0.32);
    g.bezierCurveTo(-s * 0.55, -s * 0.25, -s * 0.28, -s * 0.7, 0, -s * 0.22);
    g.bezierCurveTo(s * 0.28, -s * 0.7, s * 0.55, -s * 0.25, 0, s * 0.32);
    g.closePath();
  }

  function step() {
    requestAnimationFrame(step);
    if (!hasCtx) return;
    if (!parts.length) return;
    if (document.body.classList.contains("paused")) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      if (p.life > p.max) { parts.splice(i, 1); continue; }
      if (p.kind === "confetti") {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const a = 1 - p.life / p.max;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        else { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      } else {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const a = Math.min(1, (p.max - p.life) / 60) * (1 - Math.max(0, (p.life - p.max * 0.6) / (p.max * 0.4)));
        ctx.save();
        ctx.globalAlpha = Math.max(0, a);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        heartPath(ctx, p.s);
        ctx.fill();
        ctx.restore();
      }
    }
  }
  step();

  window.FX = {
    confettiBurst: (n, x, y) => spawnConfetti(n || 60, x, y),
    confettiRain: (sec) => {
      const t0 = performance.now();
      const iv = setInterval(() => {
        if (performance.now() - t0 > (sec || 5) * 1000) { clearInterval(iv); return; }
        spawnConfetti(14);
      }, 300);
    },
    heartRise: (n) => { for (let i = 0; i < (n || 24); i++) setTimeout(() => spawnHeart(null, null), i * 90); },
    heartBurst: (x, y, n) => { for (let i = 0; i < (n || 18); i++) setTimeout(() => spawnHeart(x + rand(-60, 60), y + rand(-40, 40)), i * 40); },
    heart: spawnHeart,
    confetti: spawnConfetti
  };
  const { rand } = window.Core;
})();
