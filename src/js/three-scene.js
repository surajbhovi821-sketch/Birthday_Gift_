/* ================= THREE.JS SCENE MANAGER =================
   Fixed full-screen WebGL canvas behind the DOM content.
   Handles: ambient particles, intro gift box, birthday cake
   with 21 candles, second gift box, fireworks, golden light.
   ========================================================== */
(function () {
  "use strict";

  const T = window.THREE;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const makeGlowTexture = (color) => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, color || "rgba(255,235,190,1)");
    grad.addColorStop(0.35, (color || "rgba(255,235,190,1)").replace("1)", "0.45)"));
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  };

  const makeHeartTexture = () => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    g.translate(64, 64);
    g.scale(1, 1);
    g.beginPath();
    g.moveTo(0, 26);
    g.bezierCurveTo(-46, -22, -24, -58, 0, -20);
    g.bezierCurveTo(24, -58, 46, -22, 0, 26);
    g.closePath();
    const grad = g.createRadialGradient(0, -10, 2, 0, -10, 60);
    grad.addColorStop(0, "rgba(255,120,150,1)");
    grad.addColorStop(1, "rgba(255,60,110,0.9)");
    g.fillStyle = grad; g.fill();
    return new T.CanvasTexture(c);
  };

  const S = {
    ok: false, renderer: null, scene: null, camera: null, clock: null,
    phase: "boot", focus: "intro", focusChanged: false,
    ambient: null, hearts: [], fireworks: [], smoke: [], burstPts: [],
    gift: null, giftLid: null, giftRig: null, giftOpenT: -1, giftState: "closed",
    gift2: null, gift2Lid: null, gift2Rig: null, gift2State: "closed",
    cake: null, candles: [], flames: [], flameLight: null, cakeWish: 0,
    camPos: new T.Vector3(0, 0.5, 9), camLook: new T.Vector3(0, 0.7, 0),
    flashLight: null, golden: null,
    onGiftOpened: null, onGift2Opened: null, onCandlesOut: null,
    time: 0, smokeMat: null, glowTex: null, heartTex: null
  };

  /* ---------------- init ---------------- */
  S.init = function (canvas) {
    try {
      this.renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    } catch (e) { console.warn("WebGL unavailable", e); return false; }
    this.ok = true;
    // adaptive quality for low-end devices
    try {
      const gl = this.renderer.getContext();
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) window.__glRenderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "");
    } catch (e) { /* ignore */ }
    const q = window.Core ? Core.quality() : "med";
    const prCap = q === "low" ? 1 : (q === "med" ? 1.5 : 2);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prCap));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 0);

    this.scene = new T.Scene();
    this.scene.fog = new T.FogExp2(0x0a0d1c, 0.016);

    this.camera = new T.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 120);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    this.clock = new T.Clock();
    this.glowTex = makeGlowTexture("rgba(255,236,190,1)");
    this.heartTex = makeHeartTexture();

    // lights
    this.scene.add(new T.AmbientLight(0xffffff, 0.55));
    const key = new T.DirectionalLight(0xfff2d9, 0.9); key.position.set(3, 6, 4); this.scene.add(key);
    const rim = new T.DirectionalLight(0x8ab4ff, 0.35); rim.position.set(-4, 2, -5); this.scene.add(rim);
    this.flashLight = new T.PointLight(0xffd9a0, 0, 18, 2);
    this.flashLight.position.set(0, 1.4, 0); this.scene.add(this.flashLight);

    this.buildAmbient();

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.animate();
    return true;
  };

  /* ---------------- ambient particle field ---------------- */
  S.buildAmbient = function () {
    const q = window.Core ? Core.quality() : "med";
    const N = q === "high" ? 1100 : (q === "med" ? 650 : 340);
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 6 + Math.pow(Math.random(), 0.6) * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) * 0.75 + 1.2;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({
      size: 0.09, map: this.glowTex, transparent: true, opacity: 0.0,
      depthWrite: false, blending: T.AdditiveBlending, color: 0xffe7bd
    });
    this.ambient = new T.Points(geo, mat);
    this.scene.add(this.ambient);
    this.ambient.userData = { base: pos.slice(), t: 0 };
  };

  /* ---------------- gift box builder ---------------- */
  S.buildGift = function (opts) {
    opts = opts || {};
    const g = new T.Group();
    const boxCol = opts.box || 0xd63b4f, lidCol = opts.lid || 0xe04a60, ribCol = 0xffd88a;

    const mat = new T.MeshStandardMaterial({ color: boxCol, roughness: 0.38, metalness: 0.15 });
    const lidMat = new T.MeshStandardMaterial({ color: lidCol, roughness: 0.35, metalness: 0.2 });
    const ribMat = new T.MeshStandardMaterial({ color: ribCol, roughness: 0.3, metalness: 0.6, emissive: 0x33220a, emissiveIntensity: 0.2 });

    const body = new T.Mesh(new T.BoxGeometry(1.7, 1.15, 1.7), mat);
    body.position.y = 0.575;
    g.add(body);

    // ribbons on body
    const rb1 = new T.Mesh(new T.BoxGeometry(0.14, 1.17, 1.72), ribMat); rb1.position.y = 0.575; g.add(rb1);
    const rb2 = new T.Mesh(new T.BoxGeometry(1.72, 1.17, 0.14), ribMat); rb2.position.y = 0.575; g.add(rb2);

    // lid rig (pivot at back edge)
    const rig = new T.Group();
    rig.position.set(0, 1.15, 0.85);
    const lid = new T.Mesh(new T.BoxGeometry(1.85, 0.34, 1.85), lidMat);
    lid.position.set(0, 0.17, -0.85);
    rig.add(lid);
    const lr1 = new T.Mesh(new T.BoxGeometry(0.16, 0.36, 1.88), ribMat); lr1.position.set(0, 0.17, -0.85); rig.add(lr1);
    const lr2 = new T.Mesh(new T.BoxGeometry(1.88, 0.36, 0.16), ribMat); lr2.position.set(0, 0.17, -0.85); rig.add(lr2);
    g.add(rig);

    // bow
    const bowMat = new T.MeshStandardMaterial({ color: ribCol, roughness: 0.3, metalness: 0.5 });
    const bowG = new T.Group(); bowG.position.set(0, 0.44, 0);
    const l = new T.Mesh(new T.ConeGeometry(0.22, 0.4, 12), bowMat); l.rotation.z = -0.5; l.position.set(-0.22, 0, 0); bowG.add(l);
    const r = new T.Mesh(new T.ConeGeometry(0.22, 0.4, 12), bowMat); r.rotation.z = 0.5; r.position.set(0.22, 0, 0); bowG.add(r);
    const k = new T.Mesh(new T.SphereGeometry(0.1, 12, 12), bowMat); bowG.add(k);
    g.add(bowG);

    // golden light pillar (inside)
    const glowGeo = new T.ConeGeometry(0.85, 3.2, 24, 1, true);
    const glowMat = new T.MeshBasicMaterial({
      color: 0xffd98c, transparent: true, opacity: 0, side: T.DoubleSide,
      blending: T.AdditiveBlending, depthWrite: false
    });
    const pillar = new T.Mesh(glowGeo, glowMat);
    pillar.position.y = 2.6;
    g.add(pillar);

    const ball = new T.Mesh(new T.SphereGeometry(0.09, 10, 10), new T.MeshBasicMaterial({ color: 0xffe9b0, transparent: true, opacity: 0 }));
    ball.position.y = 2.6;
    g.add(ball);

    g.scale.set(0.001, 0.001, 0.001);
    this.scene.add(g);
    return { group: g, rig: rig, pillar: pillar, glowMat: glowMat, ball: ball };
  };

  /* ---------------- cake ---------------- */
  S.buildCake = function () {
    const g = new T.Group();

    const plate = new T.Mesh(new T.CylinderGeometry(2.35, 2.15, 0.14, 40),
      new T.MeshStandardMaterial({ color: 0xf7f0e6, roughness: 0.25, metalness: 0.35 }));
    plate.position.y = 0.07; g.add(plate);

    const layers = [
      { r: 1.95, h: 0.85, y: 0.56, c: 0xf7e3c6, drip: 0xefcfa0 },
      { r: 1.55, h: 0.8, y: 1.38, c: 0xf6c9d4, drip: 0xf2b6c6 },
      { r: 1.15, h: 0.75, y: 2.15, c: 0xf7e3c6, drip: 0xefcfa0 }
    ];
    layers.forEach((L) => {
      const mat = new T.MeshStandardMaterial({ color: L.c, roughness: 0.6, metalness: 0.02 });
      const cyl = new T.Mesh(new T.CylinderGeometry(L.r, L.r, L.h, 48), mat);
      cyl.position.y = L.y; g.add(cyl);
      // icing drip ring
      const dripMat = new T.MeshStandardMaterial({ color: L.drip, roughness: 0.7 });
      const drip = new T.Mesh(new T.TorusGeometry(L.r * 0.97, 0.1, 10, 48), dripMat);
      drip.rotation.x = Math.PI / 2; drip.position.y = L.y + L.h / 2 - 0.06; g.add(drip);
    });

    // plaque with name + 02 • 02 (+ age only if a birth year was provided)
    const txt = document.createElement("canvas"); txt.width = 1024; txt.height = 160;
    const tg = txt.getContext("2d");
    const cfg = window.Core.Cfg;
    tg.clearRect(0, 0, 1024, 160);
    tg.font = "700 72px Georgia, 'Times New Roman', serif";
    tg.textAlign = "center"; tg.textBaseline = "middle";
    tg.shadowColor = "rgba(255,215,140,0.9)"; tg.shadowBlur = 22;
    tg.fillStyle = "#fff3d6";
    const name = (cfg.birthday && cfg.birthday.name || "KAJAL").toUpperCase().split(" ")[0];
    const digits = (cfg.birthday && cfg.birthday.birthdayDigits) || "02 • 02";
    const yrs = (cfg.birthday && cfg.birthday.year) ? (new Date().getFullYear() - parseInt(cfg.birthday.year, 10)) : null;
    tg.fillText(name + "  ·  " + digits + (yrs ? "  ·  " + yrs : ""), 512, 80);
    const tex = new T.CanvasTexture(txt);
    const plaque = new T.Mesh(new T.PlaneGeometry(2.9, 0.45),
      new T.MeshBasicMaterial({ map: tex, transparent: true }));
    plaque.position.set(0, 0.42, 2.2); plaque.rotation.x = -0.12;
    g.add(plaque);

    // candles: age if known, else a decorative ring (no age claim)
    const count = (cfg.birthday && cfg.birthday.year) ? (new Date().getFullYear() - parseInt(cfg.birthday.year, 10)) : 9;
    const rRing = 0.72;
    const candleMat = new T.MeshStandardMaterial({ color: 0xfff0dc, roughness: 0.4, metalness: 0.05 });
    const candleStripe = new T.MeshStandardMaterial({ color: 0xff5f7a, roughness: 0.5 });
    const flameMat = new T.MeshBasicMaterial({ color: 0xffb84d, transparent: true });
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + 0.05;
      const x = Math.cos(a) * rRing, z = Math.sin(a) * rRing;
      const candle = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.6, 10), candleMat);
      candle.position.set(x, 2.75, z); g.add(candle);
      const stripe = new T.Mesh(new T.CylinderGeometry(0.052, 0.052, 0.12, 10), candleStripe);
      stripe.position.set(x, 2.86, z); g.add(stripe);
      const wick = new T.Mesh(new T.CylinderGeometry(0.008, 0.008, 0.07, 6), new T.MeshStandardMaterial({ color: 0x2a2a33 }));
      wick.position.set(x, 3.08, z); g.add(wick);
      // flame
      const flame = new T.Group();
      const inner = new T.Mesh(new T.SphereGeometry(0.05, 8, 8), new T.MeshBasicMaterial({ color: 0xffe9a8 }));
      inner.position.y = 0.04;
      const outer = new T.Mesh(new T.SphereGeometry(0.075, 8, 8), new T.MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.8 }));
      flame.add(outer); flame.add(inner);
      flame.position.set(x, 3.13, z);
      g.add(flame);
      this.candles.push({ group: flame, mat: flameMat, seed: Math.random() * 100 });
      this.flames.push(inner, outer);
    }

    this.flameLight = new T.PointLight(0xffb45c, 0, 12, 2);
    this.flameLight.position.set(0, 3.2, 0);
    g.add(this.flameLight);

    g.scale.set(0.001, 0.001, 0.001);
    g.position.set(0, -0.5, 0);
    this.scene.add(g);
    this.cake = g;
  };

  /* ---------------- fireworks ---------------- */
  S.launchFirework = function (x, y, z, color) {
    if (!this.ok) return;
    const colors = color || [0xffd88a, 0xff8fa8, 0xa8c8ff, 0xffe066, 0xf2a0ff];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const N = 70;
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sp = rand(1.2, 5.4);
      vel.push([Math.sin(phi) * Math.cos(theta) * sp, Math.cos(phi) * sp * 0.9, Math.sin(phi) * Math.sin(theta) * sp]);
    }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({
      size: 0.14, map: this.glowTex, transparent: true, opacity: 1,
      blending: T.AdditiveBlending, depthWrite: false, color: col
    });
    const pts = new T.Points(geo, mat);
    this.scene.add(pts);
    this.fireworks.push({ pts, vel, life: 0, maxLife: 1.9, seed: Math.random() * 10, hue: col });
  };

  S.bigShow = function (rounds, interval) {
    let i = 0;
    const step = () => {
      if (i >= rounds) return;
      const n = 1 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        this.launchFirework(rand(-7, 7), rand(1.5, 4.5), rand(-4, 1));
      }
      i++;
      setTimeout(step, interval || 650);
    };
    step();
  };

  /* ---------------- burst particles (golden light, hearts) ---------------- */
  S.burst = function (x, y, z, opts) {
    opts = opts || {};
    const N = opts.count || 90;
    const kind = opts.kind || "gold"; // gold | heart
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const sp = rand(0.8, 4.6);
      vel.push([Math.sin(phi) * Math.cos(theta) * sp, Math.cos(phi) * sp + 0.6, Math.sin(phi) * Math.sin(theta) * sp]);
    }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const mat = new T.PointsMaterial({
      size: kind === "heart" ? 0.32 : 0.12,
      map: kind === "heart" ? this.heartTex : this.glowTex,
      transparent: true, opacity: 1, depthWrite: false,
      blending: T.AdditiveBlending,
      color: kind === "heart" ? 0xff9fb0 : (opts.color || 0xffdf9e)
    });
    const pts = new T.Points(geo, mat);
    this.scene.add(pts);
    this.burstPts.push({ pts, vel, life: 0, maxLife: opts.life || 2.2 });
  };

  S.smokePuff = function (x, y, z) {
    const N = 14;
    const geo = new T.BufferGeometry();
    const pos = new Float32Array(N * 3);
    const vel = [];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = x + rand(-0.06, 0.06); pos[i * 3 + 1] = y; pos[i * 3 + 2] = z + rand(-0.06, 0.06);
      vel.push([rand(-0.25, 0.25), rand(0.5, 1.1), rand(-0.25, 0.25)]);
    }
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    if (!this.smokeMat) {
      this.smokeMat = new T.PointsMaterial({
        size: 0.42, map: this.glowTex, transparent: true, opacity: 0,
        depthWrite: false, color: 0xbfc3d1
      });
    }
    const pts = new T.Points(geo, this.smokeMat);
    this.scene.add(pts);
    this.smoke.push({ pts, vel, life: 0, maxLife: 2.6, startOp: 0.5 });
  };

  /* ---------------- gift open sequence ---------------- */
  S.animateGift = function (rig, pillar, glowMat, ball, onDone) {
    const t0 = performance.now();
    const dur = 1500;
    const step = () => {
      const t = Math.min((performance.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      rig.rotation.x = -e * (Math.PI * 0.85) * 0.55 - Math.sin(t * Math.PI) * 0.12;
      rig.position.y = 1.15 + e * 0.9;
      glowMat.opacity = t > 0.25 ? (t - 0.25) * 1.1 : 0;
      ball.material.opacity = t > 0.3 ? (t - 0.3) * 1.2 : 0;
      ball.scale.setScalar(1 + e * 2.2);
      pillar.scale.y = 1 + e * 0.5;
      if (t < 1) requestAnimationFrame(step);
      else onDone && onDone();
    };
    step();
  };

  /* ---------------- open gift (intro) ---------------- */
  S.openGift = function (onDone) {
    if (!this.ok || this.giftState !== "closed") return;
    this.giftState = "opening";
    const g = this.gift;
    if (!g) { onDone && onDone(); return; }
    this.flashLight.intensity = 6;
    this.animateGift(g.rig, g.pillar, g.glowMat, g.ball, () => {
      this.giftState = "open";
      this.flashLight.intensity = 0;
      this.burst(0, 1.4, 0, { kind: "gold", count: 130 });
      this.burst(0, 1.6, 0, { kind: "heart", count: 40 });
      this.launchFirework(0, 2.4, 0, [0xffe066]);
      if (window.AudioX) { AudioX.chime(); AudioX.whoosh(); }
      onDone && onDone();
    });
  };

  /* ---------------- wish / blow candles ---------------- */
  S.wishMode = function () {
    this.focus = "cake-wish";
    this.cakeWish = 1; // flames flicker stronger
    if (this.flameLight) this.flameLight.intensity = 5;
    if (window.AudioX) AudioX.softBell();
  };

  S.blowCandles = function (onDone) {
    if (!this.ok) { onDone && onDone(); return; }
    if (this.cakeWish === 0) this.cakeWish = 1;
    this.cakeWish = 2; // blowing
    const t0 = performance.now();
    if (window.AudioX) AudioX.whoosh();
    const loop = () => {
      const e = clamp((performance.now() - t0) / 800, 0, 1);
      this.candles.forEach((c, i) => {
        c.group.scale.setScalar(1 - e * (0.6 + 0.4 * Math.sin(i * 1.7 + c.seed)));
        c.group.position.y = 3.13 - e * 0.05 * (i % 3);
      });
      if (e >= 1) {
        this.candles.forEach((c) => c.group.visible = false);
        if (this.flameLight) this.flameLight.intensity = 0;
        // smoke from each candle
        this.candles.forEach((c, i) => {
          if (i % 3 === 0) this.smokePuff(c.group.position.x, 3.0, c.group.position.z);
        });
        if (window.AudioX) AudioX.pop();
        onDone && onDone();
        return;
      }
      requestAnimationFrame(loop);
    };
    loop();
  };

  S.relight = function () {
    this.candles.forEach((c) => { c.group.visible = true; c.group.scale.setScalar(1); });
    this.cakeWish = 1;
    if (this.flameLight) this.flameLight.intensity = 4;
  };

  /* ---------------- second gift ---------------- */
  S.showGift2 = function () {
    if (!this.gift2) this.gift2 = this.buildGift({ box: 0xb9905f, lid: 0xd9b478, box2: true });
    this.gift2.group.visible = true;
    this.focus = "gift2";
  };
  S.openGift2 = function (onDone) {
    if (!this.ok || this.gift2State !== "closed") return;
    this.gift2State = "opening";
    const g = this.gift2;
    this.flashLight.intensity = 7;
    this.animateGift(g.rig, g.pillar, g.glowMat, g.ball, () => {
      this.gift2State = "open";
      this.flashLight.intensity = 0;
      this.burst(0, 1.4, 0, { kind: "gold", count: 120 });
      this.burst(0, 1.6, 0, { kind: "heart", count: 50 });
      this.burst(0.6, 1.6, 0.6, { kind: "gold", count: 40, color: 0xff9fb0 });
      if (window.AudioX) { AudioX.chime(); AudioX.whoosh(); }
      onDone && onDone();
    });
  };

  /* ---------------- focus targets ---------------- */
  const FOCUS = {
    intro:    { p: [0, 0.5, 9.4], l: [0, 0.8, 0] },
    ambient:  { p: [0, 0.7, 8.4], l: [0, 0.5, 0] },
    cake:     { p: [0, 2.2, 7.2], l: [0, 2.1, 0] },
    "cake-wish": { p: [0, 1.9, 4.6], l: [0, 2.15, 0] },
    gift2:    { p: [0, 1.2, 7.0], l: [0, 1.0, 0] },
    final:    { p: [0, 0.8, 8.8], l: [0, 0.6, 0] }
  };

  S.setFocus = function (name) {
    this.focus = name;
    this.focusChanged = true;
  };

  /* ---------------- main loop ---------------- */
  S.animate = function () {
    const self = this;
    const loop = () => {
      requestAnimationFrame(loop);
      const dt = Math.min(self.clock.getDelta(), 0.05);
      self.time += dt;

      /* camera tween */
      const f = FOCUS[self.focus] || FOCUS.ambient;
      const k = 1 - Math.pow(0.0009, dt);
      self.camera.position.x = lerp(self.camera.position.x, f.p[0], k);
      self.camera.position.y = lerp(self.camera.position.y, f.p[1] + Math.sin(self.time * 0.5) * 0.08, k);
      self.camera.position.z = lerp(self.camera.position.z, f.p[2], k);
      self.camera.lookAt(f.l[0], f.l[1] + Math.sin(self.time * 0.4) * 0.05, f.l[2]);

      /* ambient particles: fade in after boot */
      if (self.ambient) {
        const mat = self.ambient.material;
        const target = (self.phase === "boot" || self.phase === "intro") ? 0.55 : 0.4;
        mat.opacity = lerp(mat.opacity, target, 1 - Math.pow(0.002, dt));
        self.ambient.rotation.y += dt * 0.008;
        const arr = self.ambient.geometry.attributes.position.array;
        const base = self.ambient.userData.base;
        for (let i = 0; i < arr.length; i += 3) {
          arr[i + 1] = base[i + 1] + Math.sin(self.time * 0.4 + base[i] * 0.3) * 0.35;
        }
        self.ambient.geometry.attributes.position.needsUpdate = true;
      }

      /* visibility by phase/focus */
      if (self.gift) self.gift.group.visible = (self.phase === "intro");
      if (self.gift2) self.gift2.group.visible = (self.focus === "gift2");
      if (self.cake) self.cake.visible = (self.focus.indexOf("cake") === 0 || self.focus === "final");

      /* intro gift float & bob */
      if (self.gift && self.giftState === "closed") {
        self.gift.group.rotation.y += dt * 0.35;
        self.gift.group.position.y = Math.sin(self.time * 1.4) * 0.12;
      }

      /* gift2 idle */
      if (self.gift2 && self.gift2State === "closed") {
        self.gift2.group.rotation.y += dt * 0.3;
        self.gift2.group.position.y = Math.sin(self.time * 1.2 + 2) * 0.1;
      }

      /* cake reveal scale */
      if (self.cake && self.cake.scale.x < 1 && self.focus.indexOf("cake") === 0) {
        const s = Math.min(self.cake.scale.x + dt * 0.9, 1);
        self.cake.scale.set(s, s, s);
      }

      /* flame flicker */
      if (self.candles.length) {
        const flick = self.cakeWish === 1 ? 1.6 : 0.8;
        self.candles.forEach((c) => {
          if (!c.group.visible) return;
          const s = 1 + Math.sin(self.time * 9 + c.seed) * 0.14 + Math.sin(self.time * 23 + c.seed * 2) * 0.08;
          c.group.scale.set(s * flick, s * flick, s * flick);
          c.group.children[1].material.color.setHSL(0.08 + Math.sin(self.time * 13 + c.seed) * 0.02, 1, 0.55);
        });
        if (self.flameLight) {
          self.flameLight.intensity = (self.cakeWish === 1 ? 4 : 1.6) + Math.sin(self.time * 11) * 0.7;
        }
      }

      /* burst particles */
      for (let i = self.burstPts.length - 1; i >= 0; i--) {
        const b = self.burstPts[i];
        b.life += dt;
        if (b.life >= b.maxLife) { self.scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); self.burstPts.splice(i, 1); continue; }
        const p = b.pts.geometry.attributes.position.array;
        const t = b.life / b.maxLife;
        for (let j = 0; j < p.length; j += 3) {
          b.vel[j / 3][1] -= dt * 2.2;
          p[j] += b.vel[j / 3][0] * dt;
          p[j + 1] += b.vel[j / 3][1] * dt;
          p[j + 2] += b.vel[j / 3][2] * dt;
        }
        b.pts.geometry.attributes.position.needsUpdate = true;
        b.pts.material.opacity = 1 - Math.pow(t, 1.6);
        b.pts.material.size = b.pts.material.size * (1 - dt * 0.4);
      }

      /* fireworks */
      for (let i = self.fireworks.length - 1; i >= 0; i--) {
        const fw = self.fireworks[i];
        fw.life += dt;
        if (fw.life >= fw.maxLife) { self.scene.remove(fw.pts); fw.pts.geometry.dispose(); fw.pts.material.dispose(); self.fireworks.splice(i, 1); continue; }
        const p = fw.pts.geometry.attributes.position.array;
        const t = fw.life / fw.maxLife;
        for (let j = 0; j < p.length; j += 3) {
          fw.vel[j / 3][1] -= dt * 1.4;
          p[j] += fw.vel[j / 3][0] * dt;
          p[j + 1] += fw.vel[j / 3][1] * dt;
          p[j + 2] += fw.vel[j / 3][2] * dt;
        }
        fw.pts.geometry.attributes.position.needsUpdate = true;
        fw.pts.material.opacity = Math.pow(1 - t, 1.2);
        fw.pts.material.size = 0.14 + Math.sin(t * 12 + fw.seed) * 0.04;
      }

      /* smoke */
      for (let i = self.smoke.length - 1; i >= 0; i--) {
        const sm = self.smoke[i];
        sm.life += dt;
        const t = sm.life / sm.maxLife;
        if (t >= 1) { self.scene.remove(sm.pts); sm.pts.geometry.dispose(); self.smoke.splice(i, 1); continue; }
        const p = sm.pts.geometry.attributes.position.array;
        for (let j = 0; j < p.length; j += 3) {
          p[j] += sm.vel[j / 3][0] * dt;
          p[j + 1] += sm.vel[j / 3][1] * dt;
          p[j + 2] += sm.vel[j / 3][2] * dt;
        }
        sm.pts.geometry.attributes.position.needsUpdate = true;
        sm.pts.material.opacity = sm.startOp * (1 - t);
        sm.pts.material.size = 0.42 + t * 0.9;
      }

      self.renderer.render(self.scene, self.camera);
    };
    loop();
  };

  /* ---------------- public API ---------------- */
  window.SceneX = {
    init: (c) => S.init(c),
    ok: () => S.ok,
    refreshCake() {
      if (!S.ok) return;
      if (S.cake) { S.scene.remove(S.cake); S.cake = null; }
      S.candles = []; S.flames = []; S.flameLight = null;
      if (S.focus.indexOf("cake") === 0 || S.focus === "final") S.buildCake();
    },
    setPhase: (p) => { S.phase = p; },
    intro: () => {
      if (!S.ok) return;
      S.phase = "intro";
      if (!S.gift) S.gift = S.buildGift({ box: 0xd63b4f, lid: 0xe04a60 });
      S.gift.group.visible = true;
      S.setFocus("intro");
      // pop-in scale
      const t0 = performance.now();
      const grow = () => {
        const t = Math.min((performance.now() - t0) / 1100, 1);
        const e = 1 - Math.pow(1 - t, 3);
        const s = Math.max(0.001, e * 0.85);
        S.gift.group.scale.set(s, s, s);
        if (t < 1) requestAnimationFrame(grow);
      };
      grow();
    },
    openGift: (cb) => S.openGift(cb),
    ambient: () => { S.phase = "scroll"; S.setFocus("ambient"); },
    showCake: () => { if (!S.ok) return; S.phase = "scroll"; if (!S.cake) S.buildCake(); S.setFocus("cake"); },
    wishMode: () => S.wishMode(),
    blowCandles: (cb) => S.blowCandles(cb),
    relight: () => S.relight(),
    showGift2: () => { if (!S.ok) return; S.showGift2(); },
    openGift2: (cb) => S.openGift2(cb),
    fireworks: (n, iv) => S.bigShow(n, iv),
    burst: (o) => S.burst(o.x || 0, o.y || 0, o.z || 0, o),
    focus: (f) => S.setFocus(f),
    _dbg: () => ({ time: S.time, cakeWish: S.cakeWish, candles: S.candles.length, flame0: S.candles[0] ? { v: S.candles[0].group.visible, sx: S.candles[0].group.scale.x } : null })
  };
})();
