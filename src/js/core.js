/* ================= CORE RUNTIME ================= */
(function () {
  "use strict";

  /* ---------- tiny DOM helpers ---------- */
  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const uid = () => "id" + Math.random().toString(36).slice(2, 9);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- safe storage (sandboxed iframes block localStorage) ---------- */
  const Store = {
    _mem: null,
    ok: (() => { try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; } catch (e) { return false; } })(),
    load() {
      try {
        if (this.ok) {
          const raw = localStorage.getItem("seema_birthday_cfg");
          if (raw) return JSON.parse(raw);
        } else if (this._mem) return this._mem;
      } catch (e) { /* ignore */ }
      return null;
    },
    save(cfg) {
      try {
        const raw = JSON.stringify(cfg);
        if (this.ok) localStorage.setItem("seema_birthday_cfg", raw);
        else this._mem = cfg;
      } catch (e) { /* ignore */ }
    },
    clear() { try { if (this.ok) localStorage.removeItem("seema_birthday_cfg"); } catch (e) {} }
  };

  /* ---------- config merge ---------- */
  const deepMerge = (base, extra) => {
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    if (extra && typeof extra === "object" && !Array.isArray(extra)) {
      Object.keys(extra).forEach((k) => {
        if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k]) && !String(extra[k]).startsWith("data:") && !String(extra[k]).startsWith("http")) {
          out[k] = deepMerge(out[k] || {}, extra[k]);
        } else {
          out[k] = extra[k];
        }
      });
    }
    return out;
  };

  /* single mutable state object — identity never changes, so modules that
     captured a reference always see the latest values */
  const _state = deepMerge(window.DEFAULT_CONFIG, Store.load() || {});
  const Cfg = _state;

  const photoURL = (p) => {
    if (!p) return "";
    if (String(p).indexOf("data:") === 0 || String(p).indexOf("http") === 0) return p;
    return (window.IMG && IMG[p]) || "";
  };

  const imgTag = (key, cls, alt) => {
    const url = photoURL(key);
    if (!url) return `<div class="ph-empty" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#b8ad9c;">no photo</div>`;
    return `<img class="${cls || ""}" src="${url}" alt="${esc(alt || "")}" loading="lazy" draggable="false">`;
  };

  /* computed age — only when a birth year is provided (never invented) */
  const age = () => {
    const y = _state.birthday && _state.birthday.year;
    if (!y) return null;
    const n = parseInt(y, 10);
    if (!n || n < 1900 || n > new Date().getFullYear()) return null;
    return new Date().getFullYear() - n;
  };

  /* theme application (CSS variables on <html data-theme=...>) */
  const applyTheme = () => {
    const t = (_state.theme || "cinematic");
    try { document.documentElement.setAttribute("data-theme", t); } catch (e) { /* not in DOM yet */ }
  };

  /* ---------- toast ---------- */
  let toastTimer = null;
  const toast = (msg) => {
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  };

  /* ---------- reveal on scroll ---------- */
  const revealObserver = (() => {
    let obs = null;
    return {
      watch() {
        if (!("IntersectionObserver" in window)) {
          $$(".reveal").forEach((el) => el.classList.add("in-view"));
          return;
        }
        if (obs) obs.disconnect();
        obs = new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add("in-view"); obs.unobserve(en.target); }
          });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        $$(".reveal").forEach((el) => obs.observe(el));
      },
      observe(el) {
        if (!obs) return;
        el.classList.remove("in-view");
        obs.observe(el);
      }
    };
  })();

  /* ---------- shared exports ---------- */
  window.Core = {
    $, $$, esc, clamp, lerp, rand, uid, sleep,
    Store, Cfg, deepMerge, photoURL, imgTag, toast,
    revealObserver, save: () => { Store.save(_state); },
    age,
    applyTheme,
    quality: (() => {
      let q = null;
      return () => {
        if (q) return q;
        try {
          const nav = navigator;
          const low = (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
                      (nav.deviceMemory && nav.deviceMemory <= 2) ||
                      (nav.maxTouchPoints && nav.maxTouchPoints > 0 && /Android|iPhone|iPad/i.test(nav.userAgent || "") && (nav.deviceMemory ? nav.deviceMemory <= 4 : true)) ||
                      /swiftshader|software|llvmpipe/i.test((window.__glRenderer) || "");
          q = low ? "low" : ((nav.deviceMemory && nav.deviceMemory <= 4) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 6) ? "med" : "high");
        } catch (e) { q = "med"; }
        return q;
      };
    })(),
    clone: (o) => JSON.parse(JSON.stringify(o)),
    applyCfg(cfg) {
      const merged = deepMerge(_state, cfg);
      Object.keys(_state).forEach((k) => { if (!(k in merged)) delete _state[k]; });
      Object.assign(_state, merged);
      Store.save(_state);
    },
    reset() {
      Store.clear();
      const merged = deepMerge(window.DEFAULT_CONFIG, {});
      Object.keys(_state).forEach((k) => delete _state[k]);
      Object.assign(_state, merged);
      Store.save(_state);
    }
  };
})();
