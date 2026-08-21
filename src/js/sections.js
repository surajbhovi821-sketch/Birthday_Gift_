/* ================= SECTIONS & INTERACTIONS =================
   Birthday surprise for Kajal Bhoi — created by her family.
   =========================================================== */
(function () {
  "use strict";
  const { $, $$, esc, Cfg, photoURL, imgTag, toast, sleep, rand, age, revealObserver } = window.Core;
  const SceneX = window.SceneX, AudioX = window.AudioX, FX = window.FX;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const S = () => Cfg.sender, B = () => Cfg.birthday;

  /* ------------------------------------------------------------
     SECTION BUILDERS
  ------------------------------------------------------------ */
  const SECTIONS = [];

  /* ---------- 1. HERO — HAPPY BIRTHDAY KAJAL ---------- */
  SECTIONS.push({
    id: "sec-hero",
    render() {
      const s = S(), b = B();
      const yrs = age();
      const ageLine = yrs != null
        ? `<div class="age-line reveal"><span class="age-num">${yrs}</span> YEARS OF BEAUTIFUL MEMORIES</div>`
        : "";
      return `
      <section id="sec-hero" class="sec sec-hero">
        <div class="hero-sparkles" aria-hidden="true"></div>
        <div class="hero-inner">
          <div class="kicker reveal">FROM ${esc(s.name).toUpperCase()} ❤️</div>
          <div class="hero-birthday reveal">
            <div class="hero-photo-wrap tilt" data-tilt="10">
              <div class="polaroid-frame hero-main-photo">
                ${imgTag(b.photo, "photo-img", b.name)}
                <div class="polaroid-cap">${esc(b.shortName || b.name)} ✨</div>
              </div>
              <div class="hero-halo" aria-hidden="true"></div>
            </div>
            <h1 class="giant">HAPPY BIRTHDAY<br><span class="grad-text">${esc(b.name).toUpperCase()}</span> 🎂</h1>
            <div class="hero-sub">A SPECIAL DAY FOR A VERY SPECIAL SISTER ❤️</div>
            <div class="hero-bigdate grad-text">${esc(b.birthdayDigits || "02 • 02")}</div>
            <div class="hero-date">${esc(b.monthDay || "FEBRUARY 2ND")}</div>
            ${ageLine}
            <div class="hero-sender">
              <div class="sender-chip glass">
                ${s.photo ? imgTag(s.photo, "sender-photo", s.name) : `<span class="sender-avatar">❤</span>`}
                <span>with love, <b>${esc(s.name)}</b></span>
                ${s.relationship ? `<em class="rel-pill">${esc(s.relationship)}</em>` : ""}
              </div>
            </div>
          </div>
          <div class="scroll-hint reveal">scroll to begin the journey <span class="arrow">↓</span></div>
        </div>
      </section>`;
    }
  });

  /* ---------- 2. COUNTDOWN ---------- */
  SECTIONS.push({
    id: "sec-countdown",
    render() {
      return `
      <section id="sec-countdown" class="sec sec-countdown">
        <div class="sec-head reveal">
          <div class="kicker">THE WAIT</div>
          <h2 class="sec-title">COUNTDOWN TO ${esc(B().shortName || B().name).toUpperCase()}'S SPECIAL DAY</h2>
          <p class="sec-sub">${esc(B().monthDay || "FEBRUARY 2ND")} — it's coming</p>
        </div>
        <div class="cd-wrap reveal" id="cd-wrap">
          <div class="cd-grid">
            <div class="cd-cell"><div class="cd-num" id="cd-d">—</div><div class="cd-label">DAYS</div></div>
            <div class="cd-colon">:</div>
            <div class="cd-cell"><div class="cd-num" id="cd-h">—</div><div class="cd-label">HOURS</div></div>
            <div class="cd-colon">:</div>
            <div class="cd-cell"><div class="cd-num" id="cd-m">—</div><div class="cd-label">MINUTES</div></div>
            <div class="cd-colon">:</div>
            <div class="cd-cell"><div class="cd-num" id="cd-s">—</div><div class="cd-label">SECONDS</div></div>
          </div>
          <div class="cd-today hidden" id="cd-today">
            <h3 class="cd-today-title">TODAY IS KAJAL'S DAY! 🎉</h3>
          </div>
        </div>
      </section>`;
    },
    mount() {
      startCountdown();
    }
  });

  /* ---------- 3. PERSONAL WISH ---------- */
  SECTIONS.push({
    id: "sec-wish",
    render() {
      return `
      <section id="sec-wish" class="sec sec-wish">
        <div class="sec-head reveal">
          <div class="kicker">A FEW WORDS</div>
          <h2 class="sec-title">A SPECIAL WISH FOR <span class="grad-text">${esc(B().shortName || B().name).toUpperCase()}</span> <span class="heart-emoji">❤️</span></h2>
        </div>
        <div class="wish-card reveal" id="wish-card">
          <div class="wish-paper">
            <div id="wish-type" class="wish-type"></div>
          </div>
        </div>
      </section>`;
    },
    mount() {
      startWishTyping();
    }
  });

  /* ---------- 4. FAMILY STORY ---------- */
  SECTIONS.push({
    id: "sec-story",
    render() {
      const blocks = (Cfg.story.blocks || []).map((bl, i) => `
        <div class="story-block ${i % 2 ? "flip" : ""} reveal">
          <div class="story-photo polaroid-frame tilt" data-tilt="8">${imgTag(bl.photo, "photo-img", bl.title)}<div class="polaroid-cap">${esc(bl.title.toLowerCase())}</div></div>
          <div class="story-copy">
            <h3>${esc(bl.title)}</h3>
            <p class="story-text">“${esc(bl.text)}”</p>
          </div>
        </div>`).join("");
      return `
      <section id="sec-story" class="sec">
        <div class="sec-head reveal">
          <div class="kicker">OUR FAMILY</div>
          <h2 class="sec-title">A STORY THAT STARTED WITH FAMILY <span class="heart-emoji">❤️</span></h2>
          <p class="sec-sub">${esc(B().shortName || B().name)}'s journey — through our eyes</p>
        </div>
        <div class="story-body">${blocks}</div>
      </section>`;
    }
  });

  /* ---------- 6. GALLERY ---------- */
  SECTIONS.push({
    id: "sec-gallery",
    render() {
      const all = [];
      Object.keys(Cfg.photos).forEach((cat) => {
        (Cfg.photos[cat] || []).forEach((key) => {
          const note = Cfg.notes[key] || {};
          all.push({ key, url: photoURL(key), caption: note.caption || "Kajal ❤️", date: note.date || "", memory: note.memory || "" });
        });
      });
      window.__GALLERY = all;
      const cards = all.map((p, i) => `
        <div class="gal-item reveal tilt" data-tilt="9" data-i="${i}">
          <div class="polaroid-frame">
            ${p.url ? `<img class="photo-img" src="${p.url}" alt="memory" loading="lazy" draggable="false">` : `<div class="ph-empty"></div>`}
            <div class="polaroid-cap">${esc(p.caption)}</div>
          </div>
        </div>`).join("");
      return `
      <section id="sec-gallery" class="sec">
        <div class="sec-head reveal">
          <div class="kicker">THE PHOTOS</div>
          <h2 class="sec-title">MEMORIES WE'LL NEVER FORGET <span class="cam">📸</span></h2>
          <p class="sec-sub">tap any moment to relive it — swipe on mobile</p>
        </div>
        <div class="gallery">${cards}</div>
      </section>`;
    },
    mount() {
      const g = $("#sec-gallery .gallery");
      if (!g) return;
      g.addEventListener("click", (e) => {
        const item = e.target.closest(".gal-item");
        if (!item) return;
        openLightbox(parseInt(item.dataset.i, 10));
      });
    }
  });

  /* ---------- 7. 3D MEMORY MUSEUM ---------- */
  SECTIONS.push({
    id: "sec-museum",
    render() {
      const all = window.__GALLERY || [];
      const subset = all.slice(0, 8);
      const items = subset.map((p, i) => `
        <div class="mf" data-i="${i}" data-base="${Math.round((i / subset.length) * 360)}" style="--a:${Math.round((i / subset.length) * 360)}deg">
          <div class="mf-frame">
            ${p.url ? `<img src="${p.url}" alt="museum memory ${i + 1}" draggable="false">` : `<div class="ph-empty"></div>`}
          </div>
          <div class="mf-cap">${esc(p.caption)}</div>
        </div>`).join("");
      return `
      <section id="sec-museum" class="sec sec-museum">
        <div class="sec-head reveal">
          <div class="kicker">A WALK THROUGH TIME</div>
          <h2 class="sec-title">THE 3D MEMORY MUSEUM</h2>
          <p class="sec-sub">a little gallery built just for her — scroll to walk through it</p>
        </div>
        <div class="museum-wrap reveal">
          <div class="museum-viewport" id="museum-viewport">
            <div class="museum-room" id="museum-room">${items}</div>
            <div class="museum-dust" aria-hidden="true"></div>
            <div class="museum-hint">⟳ scroll — the gallery turns with you</div>
          </div>
        </div>
      </section>`;
    },
    mount() {
      bindMuseum();
    }
  });

  /* ---------- 8. FUNNY MOMENTS ---------- */
  SECTIONS.push({
    id: "sec-funny",
    render() {
      const cards = (Cfg.funny || []).map((f) => `
        <div class="funny-item reveal tilt" data-tilt="12">
          <div class="funny-card">
            ${f.photo ? `<div class="funny-photo">${imgTag(f.photo, "", f.title)}</div>` : ""}
            <h3>“${esc(f.title)}”</h3>
            <p>${esc(f.caption)}</p>
          </div>
        </div>`).join("");
      return `
      <section id="sec-funny" class="sec">
        <div class="sec-head reveal">
          <div class="kicker">THE FUNNY SIDE</div>
          <h2 class="sec-title">BECAUSE KAJAL IS KAJAL <span class="heart-emoji">😂❤️</span></h2>
          <p class="sec-sub">no filter needed</p>
        </div>
        <div class="funny-grid">${cards}</div>
      </section>`;
    }
  });

  /* ---------- 9. QUALITIES ---------- */
  SECTIONS.push({
    id: "sec-qualities",
    render() {
      const cards = (Cfg.qualities || []).map((q) => `
        <div class="qual-card glass reveal">
          <div class="qual-icon">✦</div>
          <h3>${esc(q.title)}</h3>
          <p>${esc(q.text)}</p>
        </div>`).join("");
      return `
      <section id="sec-qualities" class="sec">
        <div class="sec-head reveal">
          <div class="kicker">WHY SHE'S SPECIAL</div>
          <h2 class="sec-title">WHAT MAKES KAJAL SPECIAL <span class="heart-emoji">❤️</span></h2>
        </div>
        <div class="qual-grid">${cards}</div>
      </section>`;
    }
  });

  /* ---------- 10. CAKE ---------- */
  SECTIONS.push({
    id: "sec-cake",
    render() {
      const b = B();
      const yrs = age();
      return `
      <section id="sec-cake" class="sec sec-cake" data-focus="cake">
        <div class="cake-ui">
          <div class="kicker reveal">THE MOMENT</div>
          <h2 class="cake-name grad-text reveal">${esc(b.shortName || b.name).toUpperCase()}</h2>
          <div class="cake-digits reveal">${esc(b.birthdayDigits || "02 • 02")}</div>
          ${yrs != null ? `<div class="cake-age reveal"><span>${yrs}</span></div>` : ""}
          <div class="cake-sub reveal">${yrs != null ? yrs + " candles are waiting for you" : "the candles are waiting for you"} ✨</div>
          <div id="wish-ui">
            <button id="make-wish-btn" class="btn-gold reveal">MAKE A WISH ✨</button>
            <div id="wish-state" class="wish-state">
              <p class="wish-line">Close your eyes...</p>
              <p class="wish-line2">Make your wish, ${esc(b.shortName || b.name)}.</p>
              <button id="blow-btn" class="btn-soft hidden">💨 BLOW OUT THE CANDLES</button>
              <p id="wish-done" class="wish-done hidden">MAY ALL YOUR WISHES COME TRUE, ${esc(b.shortName || b.name).toUpperCase()} <span class="heart-emoji">❤️</span></p>
            </div>
          </div>
          <button id="relight-btn" class="link-btn hidden">🕯️ light the candles again</button>
        </div>
      </section>`;
    },
    mount() {
      const makeBtn = $("#make-wish-btn");
      const blowBtn = $("#blow-btn");
      const state = $("#wish-state");
      const done = $("#wish-done");
      const relight = $("#relight-btn");
      if (!makeBtn) return;
      makeBtn.addEventListener("click", () => {
        makeBtn.classList.add("hidden");
        state.classList.add("show");
        SceneX && SceneX.wishMode();
        AudioX && AudioX.softBell();
        AudioX && AudioX.duck();
        setTimeout(() => {
          blowBtn.classList.remove("hidden");
          FX && FX.heartRise(8);
        }, 4200);
      });
      blowBtn.addEventListener("click", () => {
        blowBtn.classList.add("hidden");
        const lines = $$("#wish-state .wish-line, #wish-state .wish-line2");
        lines.forEach((l) => l.classList.add("hidden"));
        SceneX && SceneX.blowCandles(() => {
          done.classList.remove("hidden");
          relight.classList.remove("hidden");
          FX && FX.confettiBurst(120);
          FX && FX.heartRise(20);
          SceneX && SceneX.fireworks(7, 520);
          AudioX && AudioX.chime();
          setTimeout(() => AudioX && AudioX.unduck(), 2500);
        });
      });
      relight.addEventListener("click", () => {
        SceneX && SceneX.relight();
        relight.classList.add("hidden");
        done.classList.add("hidden");
        makeBtn.classList.remove("hidden");
        state.classList.remove("show");
      });
    }
  });

  /* ---------- 11. FINAL GIFT ---------- */
  SECTIONS.push({
    id: "sec-gift2",
    render() {
      return `
      <section id="sec-gift2" class="sec" data-focus="gift2">
        <div class="sec-head reveal">
          <div class="kicker">ONE MORE THING</div>
          <h2 class="sec-title">WAIT... THERE'S ONE MORE SURPRISE <span class="gift-emoji">🎁</span></h2>
          <p class="sec-sub">saved for the very end</p>
        </div>
        <button id="open-gift2-btn" class="btn-gold reveal">OPEN IT</button>
        <div id="reveal-overlay" class="reveal-overlay">
          <div class="reveal-card glass">
            <button id="reveal-close" class="close-x">✕</button>
            <div id="reveal-content"></div>
          </div>
        </div>
      </section>`;
    },
    mount() {
      const btn = $("#open-gift2-btn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        btn.classList.add("hidden");
        SceneX && SceneX.showGift2();
        setTimeout(() => {
          SceneX && SceneX.openGift2(() => {
            setTimeout(() => showReveal(), 500);
          });
        }, 400);
      });
    }
  });

  /* ---------- 12. MUSIC PLAYER ---------- */
  SECTIONS.push({
    id: "sec-music",
    render() {
      const m = Cfg.music || {};
      const bars = Array.from({ length: 14 }, (_, i) => `<span class="bar" style="--i:${i}"></span>`).join("");
      return `
      <section id="sec-music" class="sec sec-music">
        <div class="sec-head reveal">
          <div class="kicker">WITH A LITTLE MUSIC</div>
          <h2 class="sec-title">🎵 A SONG FOR ${esc(B().shortName || B().name).toUpperCase()}</h2>
        </div>
        <div class="music-card glass reveal" id="music-card">
          <div class="waveform" id="waveform">${bars}</div>
          <div class="music-meta">
            <h4 id="song-title">${esc(m.title || "A Song For Kajal")}</h4>
            <span id="music-state">built-in melody ♪</span>
          </div>
          <div class="music-controls">
            <button id="mp-play" class="btn-gold">▶ PLAY</button>
            <button id="mp-mute" class="vc-btn" aria-label="mute">🔊</button>
            <input type="range" id="mp-vol" min="0" max="100" value="70" aria-label="volume">
            <button id="mp-stop" class="vc-btn" aria-label="stop">⏹</button>
          </div>
          <div class="mp-progress" id="mp-progress"><div class="mp-fill" id="mp-fill"></div></div>
        </div>
      </section>`;
    },
    mount() {
      bindMusicPlayer();
    }
  });

  /* ---------- 14. FAMILY WISHES ---------- */
  SECTIONS.push({
    id: "sec-wishes",
    render() {
      const list = Cfg.familyWishes || [];
      const cards = list.map((w) => `
        <div class="fw-card glass reveal tilt" data-tilt="8">
          ${w.photo ? `<div class="fw-photo">${imgTag(w.photo, "", w.name)}</div>` : `<div class="fw-photo fw-avatar">${esc((w.name || "?").charAt(0).toUpperCase())}</div>`}
          <h3>${esc(w.name)}</h3>
          <span class="fw-rel">${esc(w.relationship || "")}</span>
          <p>“${esc(w.message)}”</p>
        </div>`).join("");
      const empty = !list.length
        ? `<div class="fw-empty glass reveal"><p>💌 Wishes from parents, siblings, grandparents and friends will appear here.</p><p class="fw-hint">Add them in the ⚙ admin panel → Wishes.</p></div>`
        : "";
      return `
      <section id="sec-wishes" class="sec">
        <div class="sec-head reveal">
          <div class="kicker">FROM THE FAMILY</div>
          <h2 class="sec-title">WISHES FROM THE PEOPLE WHO LOVE YOU <span class="heart-emoji">❤️</span></h2>
        </div>
        <div class="fw-grid">${cards}${empty}</div>
      </section>`;
    }
  });

  /* ---------- 15. LETTER ---------- */
  SECTIONS.push({
    id: "sec-letter",
    render() {
      return `
      <section id="sec-letter" class="sec sec-letter">
        <div class="sec-head reveal">
          <div class="kicker">ONE LAST NOTE</div>
          <h2 class="sec-title">A LETTER FOR <span class="grad-text">${esc(B().shortName || B().name).toUpperCase()}</span></h2>
        </div>
        <div class="letter-stage reveal" id="letter-stage">
          <div class="env-scene" id="env-scene">
            <div class="env-back"></div>
            <div class="env-letter" id="env-letter">
              <div class="letter-paper">
                <div class="letter-lines" id="letter-lines"></div>
                <div class="letter-sign">With lots of love ❤️<br><span class="sign-name">${esc(S().name)}</span></div>
              </div>
            </div>
            <div class="env-body"></div>
            <div class="env-flap"></div>
            <div class="env-seal">♥</div>
          </div>
          <button id="open-letter-btn" class="btn-gold">OPEN LETTER 💌</button>
        </div>
      </section>`;
    },
    mount() {
      const btn = $("#open-letter-btn");
      const scene = $("#env-scene");
      const letter = $("#env-letter");
      const linesBox = $("#letter-lines");
      if (!btn || !scene) return;
      let opened = false;
      btn.addEventListener("click", async () => {
        if (opened) return;
        opened = true;
        AudioX && AudioX.pop();
        btn.classList.add("hidden");
        scene.classList.add("open");
        await sleep(900);
        letter.classList.add("out");
        $("#sec-letter").classList.add("letter-open");
        linesBox.innerHTML = (Cfg.letter || []).map((p) => `<p class="l-line">${esc(p)}</p>`).join("");
        $$("#letter-lines .l-line").forEach((el, i) => setTimeout(() => el.classList.add("show"), 260 + i * 420));
        setTimeout(() => { FX && FX.heartRise(10); }, 800);
      });
    }
  });

  /* ---------- 16. FINAL CELEBRATION ---------- */
  SECTIONS.push({
    id: "sec-final",
    render() {
      return `
      <section id="sec-final" class="sec sec-final" data-focus="final">
        <div class="final-glow reveal" id="final-glow" aria-hidden="true"></div>
        <div class="balloons" id="balloons" aria-hidden="true"></div>
        <div class="final-inner">
          <div class="fg-name grad-text reveal">${esc(B().shortName || B().name).toUpperCase()}</div>
          <div class="fg-hb reveal">HAPPY BIRTHDAY</div>
          <div class="fg-heart reveal">❤️</div>
          <div class="fg-date reveal">${esc(B().birthdayLabel || "02 FEBRUARY")}</div>
          <div class="fg-from reveal">WITH LOVE, ${esc(S().name).toUpperCase()}</div>
        </div>
      </section>`;
    },
    mount() {
      makeBalloons($("#balloons"));
    }
  });

  /* ---------- 17. END — FINAL PHOTO & MESSAGE ---------- */
  SECTIONS.push({
    id: "sec-end",
    render() {
      const b = B(), s = S();
      return `
      <section id="sec-end" class="sec sec-end">
        <div class="end-inner">
          <div class="end-photo polaroid-frame tilt reveal" data-tilt="8">
            ${imgTag(b.photo, "photo-img", b.name)}
            <div class="polaroid-cap">${esc(b.shortName || b.name)} ✨</div>
          </div>
          <div class="end-quote reveal">“${esc(Cfg.finalQuote)}”</div>
          <h2 class="end-happy reveal">HAPPY BIRTHDAY, <span class="grad-text">${esc(b.shortName || b.name).toUpperCase()}</span> <span class="heart-emoji">❤️</span></h2>
          <div class="end-date reveal">${esc(b.birthdayLabel || "02 FEBRUARY")}</div>
          <p class="end-closing reveal">${esc(Cfg.closing)}</p>
          <div class="end-love reveal">WITH LOTS OF LOVE <span class="heart-emoji">❤️</span></div>
          <div class="end-sig reveal">${esc(s.name)}</div>
        </div>
      </section>`;
    }
  });

  /* ---------- 18. SHARE ---------- */
  SECTIONS.push({
    id: "sec-share",
    render() {
      return `
      <section id="sec-share" class="sec sec-share">
        <div class="sec-head reveal">
          <div class="kicker">SPREAD THE JOY</div>
          <h2 class="sec-title">SHARE KAJAL'S BIRTHDAY SURPRISE</h2>
        </div>
        <div class="share-row reveal" id="share-row">
          <button class="share-btn wa" data-share="wa">WhatsApp</button>
          <button class="share-btn ig" data-share="ig">Instagram</button>
          <button class="share-btn fb" data-share="fb">Facebook</button>
          <button class="share-btn copy" data-share="copy">Copy Link</button>
          <button class="share-btn native" data-share="native">Share…</button>
        </div>
      </section>`;
    },
    mount() {
      bindShare();
    }
  });

  /* ------------------------------------------------------------
     RENDER ALL
  ------------------------------------------------------------ */
  function renderAll() {
    const app = $("#app");
    if (!app) return;
    stopIntervals();
    app.innerHTML = SECTIONS.map((s) => s.render()).join("");
    SECTIONS.forEach((s) => { if (s.mount) s.mount(); });
    revealObserver.watch();
    bindSectionFocus();
    bindTilt();
    bindParallax();
    initLightbox();
  }

  const _ivs = [];
  const stopIntervals = () => { while (_ivs.length) clearInterval(_ivs.pop()); };
  const every = (ms, fn) => { const i = setInterval(fn, ms); _ivs.push(i); return i; };

  /* ------------------------------------------------------------
     COUNTDOWN — next 2 February
  ------------------------------------------------------------ */
  function countdownTarget() {
    const now = new Date();
    const y = now.getFullYear();
    let t = new Date(y, 1, 2, 0, 0, 0, 0); // Feb 2
    if (t.getTime() <= now.getTime()) t = new Date(y + 1, 1, 2, 0, 0, 0, 0);
    return t;
  }
  function startCountdown() {
    const dd = $("#cd-d"), hh = $("#cd-h"), mm = $("#cd-m"), ss = $("#cd-s");
    const grid = $(".cd-grid"), today = $("#cd-today");
    if (!dd) return;
    let fired = false;
    const tick = () => {
      const diff = countdownTarget().getTime() - Date.now();
      if (diff <= 0) {
        grid.classList.add("hidden");
        today.classList.remove("hidden");
        if (!fired) {
          fired = true;
          FX.confettiRain(8); FX.heartRise(30);
          SceneX.fireworks(8, 500);
          AudioX.chime();
        }
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      dd.textContent = String(d).padStart(2, "0");
      hh.textContent = String(h).padStart(2, "0");
      mm.textContent = String(m).padStart(2, "0");
      ss.textContent = String(s).padStart(2, "0");
    };
    tick();
    every(1000, tick);
  }

  /* ------------------------------------------------------------
     WISH TYPING / LINE REVEAL
  ------------------------------------------------------------ */
  function startWishTyping() {
    const box = $("#wish-type");
    if (!box) return;
    const paras = (Cfg.wish || []).slice();
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { box.innerHTML = paras.map((p) => `<p class="w-para">${esc(p)}</p>`).join(""); return; }
    let pi = 0;
    box.innerHTML = "";
    const cursor = `<span class="w-cursor">|</span>`;
    const typePara = (text, done) => {
      const p = document.createElement("p");
      p.className = "w-para";
      p.innerHTML = `<span class="w-char"></span><span class="w-cursor">|</span>`;
      box.appendChild(p);
      const span = $(".w-char", p);
      const cursor = $(".w-cursor", p);
      let ci = 0;
      const iv = every(28, () => {
        ci++;
        span.textContent = text.slice(0, ci);
        if (ci >= text.length) { clearInterval(iv); cursor.style.display = "none"; done(); }
      });
    };
    const step = () => {
      if (pi >= paras.length) return;
      const text = paras[pi];
      typePara(text, () => { pi++; setTimeout(step, 420); });
    };
    setTimeout(step, 500);
  }

  /* ------------------------------------------------------------
     MUSEUM — scroll-driven 3D room
  ------------------------------------------------------------ */
  function bindMuseum() {
    const room = $("#museum-room");
    const viewport = $("#museum-viewport");
    if (!room || !viewport) return;
    const items = $$(".mf", room);
    if (!items.length) return;
    let mr = 0, cur = 0;
    const total = items.length;
    const update = () => {
      // scroll progress through the section
      const r = viewport.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const target = prog * 200 - 100; // degrees of rotation across the section
      cur = lerp(cur, target, 0.12);
      room.style.setProperty("--mr", cur.toFixed(2) + "deg");
      // depth fade: nearest items (front = angle near 0 relative to camera)
      items.forEach((it) => {
        const base = parseFloat(it.dataset.base);
        let rel = ((base - cur) % 360 + 540) % 360;
        rel = rel > 180 ? 360 - rel : rel; // 0..180
        const opacity = rel < 70 ? 1 : Math.max(0.12, 1 - (rel - 70) / 110);
        it.style.opacity = opacity.toFixed(2);
        it.style.zIndex = Math.round(1000 - rel);
      });
    };
    let ticking = false;
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    // click → lightbox
    room.addEventListener("click", (e) => {
      const it = e.target.closest(".mf");
      if (it) openLightbox(parseInt(it.dataset.i, 10));
    });
    // floating dust
    const dust = $(".museum-dust");
    if (dust) {
      let html = "";
      for (let i = 0; i < 16; i++) {
        const x = rand(4, 96), y = rand(8, 92), d = rand(0, 7), s = rand(0.5, 2);
        html += `<span class="dust-dot" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;animation-delay:${d.toFixed(1)}s;--ds:${s.toFixed(1)}px"></span>`;
      }
      dust.innerHTML = html;
    }
  }

  /* ------------------------------------------------------------
     MUSIC PLAYER
  ------------------------------------------------------------ */
  function bindMusicPlayer() {
    const play = $("#mp-play"), mute = $("#mp-mute"), vol = $("#mp-vol"),
      state = $("#music-state"), fill = $("#mp-fill"), card = $("#music-card"),
      stop = $("#mp-stop"), wf = $("#waveform");
    if (!play) return;
    const refresh = () => {
      const on = !!(AudioX && AudioX.isPlaying());
      play.textContent = on ? "⏸ PAUSE" : "▶ PLAY";
      if (card) card.classList.toggle("playing", on);
      if (state) state.textContent = on ? "playing… ♪" : "paused";
    };
    play.addEventListener("click", () => {
      if (AudioX.isPlaying()) AudioX.stopMusic(); else AudioX.startMusic();
      refresh();
    });
    stop.addEventListener("click", () => { AudioX.stopMusic(); refresh(); });
    mute.addEventListener("click", () => {
      const muted = AudioX.getVolume() === 0;
      AudioX.setVolume(muted ? 0.7 : 0);
      mute.textContent = muted ? "🔊" : "🔇";
      vol.value = muted ? 70 : 0;
    });
    vol.addEventListener("input", () => { AudioX.setVolume(parseInt(vol.value, 10) / 100); mute.textContent = parseInt(vol.value, 10) === 0 ? "🔇" : "🔊"; });
    every(300, refresh);
    // progress (only meaningful for uploaded files)
    every(500, () => {
      if (fill) {
        const p = AudioX.getProgress && AudioX.getProgress();
        fill.style.width = (p >= 0 ? p * 100 : 0) + "%";
      }
    });
    // waveform: analyser-driven if available, else CSS animation
    if (wf) {
      const bars = $$(".bar", wf);
      const tickWave = () => {
        const lvl = AudioX.getLevel && AudioX.getLevel();
        if (lvl >= 0 && AudioX.isPlaying()) {
          bars.forEach((b, i) => {
            const l = lvl * (0.5 + 0.5 * Math.sin((i * 0.7) + performance.now() / 180));
            b.style.height = (10 + l * 26) + "px";
          });
          requestAnimationFrame(tickWave);
        } else if (lvl >= 0) {
          bars.forEach((b) => b.style.height = "4px");
          requestAnimationFrame(tickWave);
        }
        // if no analyser, CSS animation handles it — no rAF loop needed
      };
      if (AudioX.getLevel && AudioX.getLevel() >= 0) tickWave();
    }
  }

  /* ------------------------------------------------------------
     SHARE
  ------------------------------------------------------------ */
  function bindShare() {
    const row = $("#share-row");
    if (!row) return;
    const url = (() => { try { return location.href; } catch (e) { return ""; } })();
    const text = Cfg.shareText || "Happy Birthday Kajal! ❤️";
    const full = text + " " + url;
    const open = (u) => { try { window.open(u, "_blank", "noopener"); } catch (e) { toast("Opening…"); } };
    row.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-share]");
      if (!b) return;
      const kind = b.dataset.share;
      if (kind === "wa") open("https://wa.me/?text=" + encodeURIComponent(full));
      else if (kind === "fb") open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url) + "&quote=" + encodeURIComponent(text));
      else if (kind === "ig") { try { await navigator.clipboard.writeText(full); toast("Caption copied — paste it in Instagram 📸"); open("https://www.instagram.com/"); } catch (err) { open("https://www.instagram.com/"); } }
      else if (kind === "copy") {
        try { await navigator.clipboard.writeText(full); toast("Link copied ✓"); }
        catch (err) {
          const ta = document.createElement("textarea");
          ta.value = full; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); toast("Link copied ✓"); } catch (e2) { toast("Press Ctrl+C to copy"); }
          ta.remove();
        }
      }
      else if (kind === "native") {
        if (navigator.share) { try { await navigator.share({ title: "Happy Birthday " + Cfg.birthday.shortName, text: text, url: url }); } catch (err) { /* cancelled */ } }
        else toast("Sharing not supported here — use Copy Link");
      }
    });
  }

  /* ------------------------------------------------------------
     SECTION FOCUS → Scene camera
  ------------------------------------------------------------ */
  function bindSectionFocus() {
    const map = { "cake": "cake", "gift2": "gift2", "final": "final" };
    if (!("IntersectionObserver" in window)) return;
    let curFocus = "intro";
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const f = map[en.target.dataset.focus];
        if (en.isIntersecting) {
          if (f) {
            curFocus = f;
            if (f === "cake") SceneX.showCake();
            if (f === "gift2") SceneX.showGift2();
            if (f === "final") {
              SceneX.focus("final");
              if (!window.__finalFired) {
                window.__finalFired = true;
                setTimeout(() => { SceneX.fireworks(9, 500); FX.confettiRain(7); FX.heartRise(26); AudioX.chime(); }, 600);
              }
            }
          } else {
            curFocus = "ambient";
            SceneX.focus("ambient");
          }
        } else if (curFocus === f) {
          curFocus = "ambient";
          SceneX.focus("ambient");
        }
      });
    }, { threshold: 0.35 });
    $$("[data-focus]").forEach((el) => obs.observe(el));
  }

  /* ------------------------------------------------------------
     TILT + PARALLAX
  ------------------------------------------------------------ */
  function bindTilt() {
    $$(".tilt").forEach((el) => {
      const max = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(6px)`;
        el.classList.add("tilted");
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
        el.classList.remove("tilted");
      });
    });
  }

  function bindParallax() {
    const els = $$("[data-parallax]");
    if (!els.length) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        const speed = parseFloat(el.dataset.parallax) || 0.08;
        el.style.transform = `translateY(${(-center * speed).toFixed(1)}px)`;
      });
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------
     LIGHTBOX
  ------------------------------------------------------------ */
  let lightbox = null;
  function initLightbox() {
    if (lightbox) lightbox.remove();
    lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.innerHTML = `
      <div class="lb-backdrop"></div>
      <div class="lb-card">
        <button class="lb-close" aria-label="close">✕</button>
        <button class="lb-nav lb-prev" aria-label="previous">‹</button>
        <button class="lb-nav lb-next" aria-label="next">›</button>
        <div class="lb-img-wrap"><img class="lb-img" alt="memory"></div>
        <div class="lb-info">
          <div class="lb-caption"></div>
          <div class="lb-label">Kajal ❤️</div>
          <div class="lb-date"></div>
          <div class="lb-memory"></div>
        </div>
      </div>`;
    document.body.appendChild(lightbox);
    let idx = 0;
    const gallery = () => window.__GALLERY || [];
    const show = (i) => {
      const g = gallery();
      if (!g.length) return;
      idx = (i + g.length) % g.length;
      const p = g[idx];
      const img = $(".lb-img", lightbox);
      img.src = p.url || "";
      $(".lb-caption", lightbox).textContent = p.caption || "";
      $(".lb-date", lightbox).textContent = p.date ? "📅 " + p.date : "";
      $(".lb-memory", lightbox).textContent = p.memory ? "💭 " + p.memory : "";
      lightbox.classList.add("show");
    };
    $(".lb-close", lightbox).addEventListener("click", () => lightbox.classList.remove("show"));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.classList.contains("lb-backdrop")) lightbox.classList.remove("show"); });
    $(".lb-next", lightbox).addEventListener("click", () => show(idx + 1));
    $(".lb-prev", lightbox).addEventListener("click", () => show(idx - 1));
    let sx = null, sy = null;
    lightbox.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) show(idx + 1); else show(idx - 1); }
      sx = sy = null;
    }, { passive: true });
    window.__showLightbox = show;
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("show")) return;
      if (e.key === "Escape") lightbox.classList.remove("show");
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }
  function openLightbox(i) { if (window.__showLightbox) window.__showLightbox(i); }

  /* ------------------------------------------------------------
     REVEAL MODAL (gift 2 content)
  ------------------------------------------------------------ */
  function showReveal() {
    const ov = $("#reveal-overlay");
    if (!ov) return;
    const g = Cfg.gift || {};
    const box = $("#reveal-content");
    if (g.type === "message") {
      box.innerHTML = `<div class="rv-message"><div class="rv-emoji">💌</div><p>${esc(g.message)}</p><div class="rv-sig">— ${esc(S().name)} ❤️</div></div>`;
    } else if (g.type === "video") {
      box.innerHTML = `<video class="rv-video" src="${esc(g.videoUrl)}" controls playsinline></video>`;
    } else {
      box.innerHTML = `${g.photo ? `<img class="rv-photo" src="${photoURL(g.photo)}" alt="surprise">` : ""}<div class="rv-message"><p>${esc(g.message || "")}</p><div class="rv-sig">— ${esc(S().name)} ❤️</div></div>`;
    }
    ov.classList.add("show");
    FX && FX.confettiBurst(80);
    FX && FX.heartRise(16);
    AudioX && AudioX.chime();
    const close = $("#reveal-close");
    if (close) close.onclick = () => ov.classList.remove("show");
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.remove("show"); });
  }

  /* ------------------------------------------------------------
     BALLOONS
  ------------------------------------------------------------ */
  function makeBalloons(container) {
    if (!container) return;
    const colors = ["#ff8fab", "#ffd88a", "#a8c8ff", "#ff9fb0", "#ffe066", "#ffb4c8", "#c9b8ff"];
    let html = "";
    for (let i = 0; i < 14; i++) {
      const left = (i / 14) * 100 + rand(-4, 4);
      const delay = rand(0, 6), dur = rand(9, 16), size = rand(46, 84);
      const c = colors[i % colors.length];
      html += `<div class="balloon" style="left:${left.toFixed(1)}%;animation-delay:${delay.toFixed(1)}s;animation-duration:${dur.toFixed(1)}s;--bs:${size.toFixed(0)}px;--bc:${c}"></div>`;
    }
    container.innerHTML = html;
  }

  /* ------------------------------------------------------------
     INTRO SEQUENCE
  ------------------------------------------------------------ */
  function startIntro() {
    const l1 = $("#line1"), l2 = $("#line2"), l3 = $("#line3"), cta = $("#intro-cta"), intro = $("#intro");
    if (!intro) return;
    const b = B(), s = S();
    document.title = "Happy Birthday " + b.name + " ❤️ — from " + s.name;
    document.body.classList.add("locked");
    SceneX.setPhase("intro");
    SceneX.intro();

    setTimeout(() => l1.classList.add("show"), 600);
    setTimeout(() => { l1.classList.add("soft"); l2.classList.add("show"); }, 3800);
    setTimeout(() => { l2.classList.add("soft"); l3.classList.add("show"); }, 7000);
    setTimeout(() => { l3.classList.add("soft"); cta.classList.add("show"); }, 10100);

    const btn = $("#open-gift-btn");
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.classList.add("pressed");
      AudioX && AudioX.pop();
      flashPhotos();
      SceneX.openGift(() => {});
      await sleep(1500);
      intro.classList.add("done");
      document.body.classList.remove("locked");
      SceneX.ambient();
      AudioX && AudioX.startMusic();   // after explicit user interaction
      await sleep(900);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function flashPhotos() {
    const flash = $("#flash");
    if (!flash) return;
    const imgs = $("#flash .flash-imgs");
    // use the real gallery photos (kajal category)
    const urls = (window.__GALLERY || []).map((g) => g.url).filter(Boolean);
    if (!urls.length) return;
    let i = 0;
    flash.classList.add("show");
    const iv = setInterval(() => {
      imgs.innerHTML = `<img src="${urls[i % urls.length]}" alt="memory">`;
      i++;
      if (i > urls.length * 2 + 2) { clearInterval(iv); flash.classList.remove("show"); setTimeout(() => { imgs.innerHTML = ""; }, 700); }
    }, 220);
  }

  window.App = {
    renderAll, startIntro, stopIntervals
  };
})();
