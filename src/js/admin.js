/* ================= ADMIN / CUSTOMIZATION DASHBOARD =================
   Everything about the surprise is editable here.
   ================================================================== */
(function () {
  "use strict";
  const { $, $$, esc, Cfg, deepMerge, photoURL, toast, uid } = window.Core;
  const Core = window.Core;

  let work = null;
  let panel = null;

  /* ---------- helpers ---------- */
  const getPath = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  const setPath = (o, path, v) => {
    const ks = path.split(".");
    let cur = o;
    for (let i = 0; i < ks.length - 1; i++) { if (cur[ks[i]] == null) cur[ks[i]] = {}; cur = cur[ks[i]]; }
    cur[ks[ks.length - 1]] = v;
  };
  const readFile = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const RELS = ["Sister", "Brother", "Mother", "Father", "Grandparent", "Relative", "Friend", "Other"];
  const THEMES = ["cinematic", "elegant", "family", "cute", "luxury", "colorful", "dark", "minimal"];

  const field = (label, path, type, placeholder) => `
    <div class="ad-row">
      <label>${label}</label>
      <input type="${type || "text"}" data-path="${path}" placeholder="${esc(placeholder || "")}">
    </div>`;
  const area = (label, path, rows, hint) => `
    <div class="ad-row">
      <label>${label}</label>
      <textarea data-path="${path}" rows="${rows || 3}"></textarea>
      ${hint ? `<p class="ad-tip">${hint}</p>` : ""}
    </div>`;
  const check = (label, path) => `
    <div class="ad-row ad-check">
      <label>${label}</label>
      <input type="checkbox" data-path="${path}">
    </div>`;

  /* ---------- bind simple inputs ---------- */
  function bindInputs(root) {
    $$("input[data-path], select[data-path]", root).forEach((inp) => {
      const p = inp.dataset.path;
      const val = getPath(work, p);
      if (inp.type === "checkbox") inp.checked = !!val;
      else if (val != null) inp.value = val;
      const apply = () => {
        let v = inp.type === "checkbox" ? inp.checked : inp.value;
        if (inp.type === "number") v = parseFloat(v) || "";
        setPath(work, p, v);
        if (p === "birthday.year") updateAgeDisplay(root);
      };
      inp.addEventListener("input", apply);
      if (inp.tagName === "SELECT") inp.addEventListener("change", apply);
    });
    $$("textarea[data-path]", root).forEach((ta) => {
      const p = ta.dataset.path;
      const val = getPath(work, p);
      if (Array.isArray(val)) ta.value = val.join("\n\n");
      else if (val != null) ta.value = val;
      ta.addEventListener("input", () => {
        const v = ta.value;
        if (Array.isArray(getPath(work, p))) setPath(work, p, v.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean));
        else setPath(work, p, v);
      });
    });
  }

  function updateAgeDisplay(root) {
    const el = $(".ad-age-num", root);
    if (!el) return;
    const y = parseInt(work.birthday.year || "", 10);
    const now = new Date().getFullYear();
    el.textContent = (y && y >= 1900 && y <= now) ? (now - y) : "— (enter birth year)";
  }

  /* ================= GENERIC LIST EDITOR (CRUD + reorder) ================= */
  function listEditor(root, listKey, fields, opts) {
    opts = opts || {};
    const box = $(opts.container || ".ad-list", root);
    if (!box) return;
    const arr = work[listKey] || [];
    box.innerHTML = arr.map((item, i) => `
      <div class="ad-card" data-i="${i}">
        <div class="ad-card-head">${opts.title || listKey.toUpperCase()} #${i + 1}
          <span>
            <button class="mini" data-move="-1" aria-label="move up">↑</button>
            <button class="mini" data-move="1" aria-label="move down">↓</button>
            <button class="mini warn" data-del aria-label="delete">✕</button>
          </span>
        </div>
        ${fields.map((f) => {
          const val = item[f.key] || "";
          if (f.type === "area") return `<div class="ad-row"><label>${f.label}</label><textarea data-f="${f.key}" rows="${f.rows || 2}">${esc(val)}</textarea></div>`;
          if (f.type === "photo") {
            return `<div class="ad-photo-mini">
              ${val ? `<img src="${photoURL(val)}" alt="">` : `<span class="no-ph">no photo</span>`}
              <label class="mini">Photo<input type="file" accept="image/*" data-f-file="${f.key}"></label>
              ${val ? `<button class="mini warn" data-f-clear="${f.key}">clear</button>` : ""}
            </div>`;
          }
          return `<div class="ad-row"><label>${f.label}</label><input data-f="${f.key}" value="${esc(val)}"></div>`;
        }).join("")}
      </div>`).join("");
    box.querySelectorAll(".ad-card").forEach((card) => {
      const idx = parseInt(card.dataset.i, 10);
      const item = arr[idx];
      card.querySelectorAll("[data-f]").forEach((inp) => {
        const key = inp.dataset.f;
        if (inp.tagName === "TEXTAREA") { inp.value = item[key] || ""; }
        inp.addEventListener("input", () => { item[key] = inp.value; });
      });
      card.querySelectorAll("[data-f-file]").forEach((inp) => {
        inp.addEventListener("change", async () => {
          if (!inp.files[0]) return;
          item[inp.dataset.fFile] = await readFile(inp.files[0]);
          listEditor(root, listKey, fields, opts);
          toast("Photo updated ✓");
        });
      });
      card.querySelectorAll("[data-f-clear]").forEach((b) => b.addEventListener("click", () => { item[b.dataset.fClear] = ""; listEditor(root, listKey, fields, opts); }));
      card.querySelectorAll("[data-move]").forEach((b) => b.addEventListener("click", () => {
        const j = idx + parseInt(b.dataset.move, 10);
        if (j < 0 || j >= arr.length) return;
        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        listEditor(root, listKey, fields, opts);
      }));
      card.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => { arr.splice(idx, 1); listEditor(root, listKey, fields, opts); }));
    });
    const addBtn = $(opts.addSel || ".btn-add", root);
    if (addBtn) addBtn.onclick = () => {
      const blank = {};
      fields.forEach((f) => { blank[f.key] = ""; });
      arr.push(blank);
      listEditor(root, listKey, fields, opts);
    };
  }

  /* ================= GALLERY TAB ================= */
  function renderGalleryTab(root) {
    const box = $(".ad-photos", root);
    if (!box) return;
    const cats = Object.keys(work.photos);
    box.innerHTML = cats.map((cat) => `
      <div class="ad-group">
        <div class="ad-group-title">${cat.toUpperCase()} PHOTOS</div>
        <div class="ad-photo-list" data-cat="${cat}">
          ${work.photos[cat].map((key, i) => {
            const note = work.notes[key] || {};
            return `
            <div class="ad-photo" data-cat="${cat}" data-idx="${i}">
              ${photoURL(key) ? `<img class="ad-thumb" src="${photoURL(key)}" alt="">` : `<div class="ad-thumb ph-empty">no photo</div>`}
              <div class="ad-photo-actions">
                <span class="mini-ph">
                  <button class="mini" data-move="-1">↑</button>
                  <button class="mini" data-move="1">↓</button>
                </span>
                <label class="mini">Replace<input type="file" accept="image/*" class="ph-file"></label>
                <button class="mini warn" data-del>Remove</button>
              </div>
              <div class="ad-photo-notes">
                <input data-note="caption" placeholder="Caption" value="${esc(note.caption || "")}">
                <input data-note="date" placeholder="Date" value="${esc(note.date || "")}">
                <input data-note="memory" placeholder="Memory" value="${esc(note.memory || "")}">
              </div>
            </div>`;
          }).join("")}
        </div>
        <button class="mini" data-addcat="${cat}">+ Add photo</button>
      </div>`).join("");

    $$(".ph-file", box).forEach((inp) => inp.addEventListener("change", async () => {
      const ph = inp.closest(".ad-photo");
      if (!inp.files[0]) return;
      const cat = ph.dataset.cat, idx = parseInt(ph.dataset.idx, 10);
      const url = await readFile(inp.files[0]);
      const old = work.photos[cat][idx];
      work.photos[cat][idx] = url;
      work.notes[url] = work.notes[old] || { caption: "", date: "", memory: "" };
      renderGalleryTab(root);
      toast("Photo replaced ✓");
    }));
    $$("[data-addcat]", box).forEach((b) => b.addEventListener("click", () => {
      const inp = document.createElement("input");
      inp.type = "file"; inp.accept = "image/*";
      inp.onchange = async () => {
        if (!inp.files[0]) return;
        const url = await readFile(inp.files[0]);
        work.photos[b.dataset.addcat].push(url);
        work.notes[url] = { caption: "", date: "", memory: "" };
        renderGalleryTab(root);
        toast("Photo added ✓");
      };
      inp.click();
    }));
    $$("[data-del]", box).forEach((b) => b.addEventListener("click", () => {
      const ph = b.closest(".ad-photo");
      work.photos[ph.dataset.cat].splice(parseInt(ph.dataset.idx, 10), 1);
      renderGalleryTab(root);
    }));
    $$("[data-move]", box).forEach((b) => b.addEventListener("click", () => {
      const ph = b.closest(".ad-photo");
      const cat = ph.dataset.cat, idx = parseInt(ph.dataset.idx, 10);
      const arr = work.photos[cat];
      const j = idx + parseInt(b.dataset.move, 10);
      if (j < 0 || j >= arr.length) return;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      renderGalleryTab(root);
    }));
    $$(".ad-photo input[data-note]", box).forEach((inp) => inp.addEventListener("input", () => {
      const ph = inp.closest(".ad-photo");
      const key = work.photos[ph.dataset.cat][parseInt(ph.dataset.idx, 10)];
      if (!work.notes[key]) work.notes[key] = { caption: "", date: "", memory: "" };
      work.notes[key][inp.dataset.note] = inp.value;
    }));
  }

  /* ================= TABS ================= */
  const TABS = [
    { id: "kajal", label: "Kajal", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">The birthday girl</p>
        ${field("Full name", "birthday.name")}
        ${field("Short name (shown big)", "birthday.shortName")}
        ${field("Date of birth", "birthday.dob")}
        ${field("Birthday digits (shown on cake)", "birthday.birthdayDigits")}
        ${field("Birthday label", "birthday.birthdayLabel")}
        ${field("Month-day label", "birthday.monthDay")}
        ${field("Birth year (optional)", "birthday.year", "number", "e.g. 2006 — age auto-calculates from this")}
        <div class="ad-row"><label>Calculated age</label><div class="ad-age-box">🎂 <span class="ad-age-num">—</span></div></div>
        ${field("Full birthday label", "birthday.fullBirthday")}
        <div class="ad-row"><label>Profile photo</label>
          <div class="ad-photo-mini">
            <img id="kajal-photo-prev" src="${photoURL(work.birthday.photo)}" alt="">
            <label class="mini">Replace<input type="file" accept="image/*" id="kajal-photo-file"></label>
          </div>
        </div>
      </div>` },
    { id: "sender", label: "Sender", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Who this surprise is from</p>
        ${field("Sender name", "sender.name", "text", "e.g. Suraj")}
        ${area("Personal message", "sender.intro", 2)}
        <div class="ad-row">
          <label>Relationship to Kajal</label>
          <select data-path="sender.relationship">
            <option value="">— choose —</option>
            ${RELS.map((r) => `<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>
        <div class="ad-row"><label>Sender photo</label>
          <div class="ad-photo-mini">
            <img id="sender-photo-prev" src="${photoURL(work.sender.photo)}" alt="">
            <label class="mini">Replace<input type="file" accept="image/*" id="sender-photo-file"></label>
          </div>
        </div>
      </div>` },
    { id: "story", label: "Story", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Opening lines &amp; the family story</p>
        ${area("Opening lines (blank line = new line)", "opening.lines", 4)}
        <div class="ad-list"></div>
        <button class="btn-add" id="add-story">+ Add story chapter</button>
      </div>` },
    { id: "gallery", label: "Gallery", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Add, replace, reorder &amp; caption photos. (Sender, Kajal, Together, Memories)</p>
        <div class="ad-photos"></div>
      </div>` },
    { id: "qualities", label: "Qualities", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">What makes Kajal special</p>
        <div class="ad-list"></div>
        <button class="btn-add" id="add-qual">+ Add quality</button>
      </div>` },
    { id: "funny", label: "Funny", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Funny family &amp; sister moments</p>
        <div class="ad-list"></div>
        <button class="btn-add" id="add-fun">+ Add funny moment</button>
      </div>` },
    { id: "wishes", label: "Wishes", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Wishes from parents, siblings, grandparents, relatives &amp; friends</p>
        <div class="ad-list"></div>
        <button class="btn-add" id="add-wish">+ Add wish</button>
      </div>` },
    { id: "messages", label: "Messages", build: () => `
      <div class="ad-tab">
        ${area("Birthday wish (blank line = new paragraph)", "wish", 8)}
        ${area("The letter (blank line = new paragraph)", "letter", 8)}
        ${area("Final quote", "finalQuote", 2)}
        ${area("Closing line", "closing", 2)}
        ${area("Share text", "shareText", 2)}
      </div>` },
    { id: "music", label: "Music", build: () => `
      <div class="ad-tab">
        ${field("Song title", "music.title")}
        <div class="ad-row"><label>Upload song (mp3)</label><label class="mini">Choose file<input type="file" accept="audio/*" id="music-file"></label></div>
        ${check("Use built-in melody (Happy Birthday music box)", "music.useMusicBox")}
        <div class="ad-row"><label>Volume (0–1)</label><input type="number" data-path="music.volume" min="0" max="1" step="0.05"></div>
        <p class="ad-tip">♪ Music starts after the first tap/click on the page (browser policy).</p>
      </div>` },
    { id: "gift", label: "Final Gift", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">What's inside the last surprise gift</p>
        <div class="ad-row">
          <label>Surprise type</label>
          <select data-path="gift.type">
            <option value="photo">Special photo + message</option>
            <option value="message">Secret message</option>
            <option value="video">Video message</option>
          </select>
        </div>
        <div id="gift-photo-box">
          <div class="ad-row"><label>Photo</label>
            <select data-path="gift.photo" id="gift-photo-select"></select>
            <label class="mini">Upload<input type="file" accept="image/*" id="gift-photo-file"></label>
          </div>
        </div>
        ${area("Message", "gift.message", 3)}
        <div id="gift-video-box">${field("Video URL", "gift.videoUrl")}</div>
      </div>` },
    { id: "theme", label: "Theme", build: () => `
      <div class="ad-tab">
        <p class="ad-hint">Change the look &amp; feel of the whole site</p>
        <div class="ad-row">
          <label>Theme</label>
          <select data-path="theme">
            ${THEMES.map((t) => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join("")}
          </select>
        </div>
        <div class="theme-swatches">
          ${THEMES.map((t) => `<div class="swatch" data-t="${t}" title="${t}"></div>`).join("")}
        </div>
        <p class="ad-tip">Cinematic = deep blue &amp; gold (default) · Elegant = champagne &amp; ivory · Family = warm cream &amp; rose · Cute = pink &amp; peach · Luxury = black &amp; gold · Colorful = vibrant · Dark = deep violet · Minimal = light &amp; clean.</p>
      </div>` }
  ];

  /* ================= PANEL ================= */
  function buildPanel() {
    work = Core.clone(Cfg);
    panel = document.createElement("aside");
    panel.id = "admin";
    panel.setAttribute("aria-label", "Admin panel");
    panel.innerHTML = `
      <div class="admin-head">
        <h3><span class="gear">⚙</span> Personalize this surprise</h3>
        <button id="admin-close" class="close-x" aria-label="close">✕</button>
      </div>
      <nav class="admin-nav">${TABS.map((t) => `<button data-tab="${t.id}">${t.label}</button>`).join("")}</nav>
      <div class="admin-body"></div>
      <div class="admin-foot">
        <button id="admin-save" class="btn-gold">Save &amp; Apply ✨</button>
        <button id="admin-reset" class="link-btn">Reset</button>
      </div>`;
    document.body.appendChild(panel);
    const fab = document.createElement("button");
    fab.id = "admin-fab";
    fab.title = "Personalize (admin)";
    fab.setAttribute("aria-label", "Open personalization panel");
    fab.textContent = "⚙";
    document.body.appendChild(fab);

    const navBtns = $$(".admin-nav button", panel);
    const body = $(".admin-body", panel);
    const showTab = (id) => {
      navBtns.forEach((b) => b.classList.toggle("on", b.dataset.tab === id));
      const tab = TABS.find((t) => t.id === id);
      body.innerHTML = tab.build();
      bindTab(id);
    };
    navBtns.forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
    fab.addEventListener("click", () => { work = Core.clone(Cfg); panel.classList.add("open"); showTab("kajal"); });
    $("#admin-close", panel).addEventListener("click", () => panel.classList.remove("open"));
    $("#admin-save", panel).addEventListener("click", save);
    $("#admin-reset", panel).addEventListener("click", async () => {
      if (await confirmReset()) {
        Core.reset();
        Core.applyTheme();
        window.App.renderAll();
        toast("Back to defaults ✓");
        panel.classList.remove("open");
      }
    });
    showTab("kajal");
  }

  function confirmReset() {
    const ov = document.createElement("div");
    ov.className = "confirm";
    ov.innerHTML = `<div class="confirm-card glass"><p>Reset everything to the default content?</p>
      <div><button class="btn-gold" id="cf-yes">Yes, reset</button><button class="link-btn" id="cf-no">Cancel</button></div></div>`;
    document.body.appendChild(ov);
    return new Promise((res) => {
      $("#cf-yes", ov).onclick = () => { ov.remove(); res(true); };
      $("#cf-no", ov).onclick = () => { ov.remove(); res(false); };
    });
  }

  /* ================= PER-TAB BINDING ================= */
  function bindTab(id) {
    const root = $(".ad-tab", panel);
    if (!root) return;
    bindInputs(root);
    if (id === "kajal") {
      updateAgeDisplay(root);
      const pf = $("#kajal-photo-file", root);
      if (pf) pf.addEventListener("change", async () => {
        if (!pf.files[0]) return;
        work.birthday.photo = await readFile(pf.files[0]);
        $("#kajal-photo-prev", root).src = work.birthday.photo;
        toast("Kajal's photo updated ✓");
      });
    }
    if (id === "sender") {
      const sel = $('select[data-path="sender.relationship"]', root);
      if (sel) {
        sel.value = work.sender.relationship || "";
        sel.addEventListener("change", () => {
          if (sel.value === "Other") {
            const inp = document.createElement("input");
            inp.placeholder = "Type relationship...";
            inp.className = "ad-inline-input";
            sel.parentNode.appendChild(inp);
            inp.focus();
            inp.addEventListener("change", () => { work.sender.relationship = inp.value; inp.remove(); });
            inp.addEventListener("keydown", (e) => { if (e.key === "Enter") { work.sender.relationship = inp.value; inp.remove(); } });
          } else work.sender.relationship = sel.value;
        });
      }
      const pf = $("#sender-photo-file", root);
      if (pf) pf.addEventListener("change", async () => {
        if (!pf.files[0]) return;
        work.sender.photo = await readFile(pf.files[0]);
        $("#sender-photo-prev", root).src = work.sender.photo;
        toast("Sender photo updated ✓");
      });
    }
    if (id === "story") {
      listEditor(root, "story", [
        { key: "title", label: "Chapter title" },
        { key: "text", label: "Story", type: "area", rows: 3 },
        { key: "photo", label: "Photo", type: "photo" }
      ], { container: ".ad-list", addSel: "#add-story", title: "STORY CHAPTER" });
    }
    if (id === "gallery") renderGalleryTab(root);
    if (id === "qualities") {
      listEditor(root, "qualities", [
        { key: "title", label: "Quality" },
        { key: "text", label: "Description", type: "area", rows: 2 }
      ], { container: ".ad-list", addSel: "#add-qual", title: "QUALITY" });
    }
    if (id === "funny") {
      listEditor(root, "funny", [
        { key: "title", label: "Title" },
        { key: "caption", label: "Caption", type: "area", rows: 2 },
        { key: "photo", label: "Photo", type: "photo" }
      ], { container: ".ad-list", addSel: "#add-fun", title: "FUNNY MOMENT" });
    }
    if (id === "wishes") {
      listEditor(root, "familyWishes", [
        { key: "name", label: "Name" },
        { key: "relationship", label: "Relationship" },
        { key: "message", label: "Message", type: "area", rows: 3 },
        { key: "photo", label: "Photo", type: "photo" }
      ], { container: ".ad-list", addSel: "#add-wish", title: "WISH" });
    }
    if (id === "music") {
      const mf = $("#music-file", root);
      if (mf) mf.addEventListener("change", async () => { if (mf.files[0]) { work.music.file = await readFile(mf.files[0]); work.music.useMusicBox = false; toast("Song uploaded ✓ (Save to apply)"); } });
    }
    if (id === "gift") {
      const typeSel = $('select[data-path="gift.type"]', root);
      if (typeSel) {
        typeSel.value = work.gift.type;
        const upd = () => {
          const isPhoto = work.gift.type === "photo";
          const isVideo = work.gift.type === "video";
          $("#gift-photo-box", root).style.display = isPhoto ? "" : "none";
          $("#gift-video-box", root).style.display = isVideo ? "" : "none";
          const sel = $("#gift-photo-select", root);
          const opts = [];
          Object.keys(work.photos).forEach((cat) => (work.photos[cat] || []).forEach((k) => opts.push([k, cat + " — " + String(k).slice(0, 16)])));
          sel.innerHTML = opts.map(([k, lab]) => `<option value="${esc(k)}" ${k === work.gift.photo ? "selected" : ""}>${esc(lab)}</option>`).join("");
          sel.onchange = () => { work.gift.photo = sel.value; };
        };
        typeSel.addEventListener("change", () => { work.gift.type = typeSel.value; upd(); });
        upd();
      }
      const gf = $("#gift-photo-file", root);
      if (gf) gf.addEventListener("change", async () => { if (gf.files[0]) { work.gift.photo = await readFile(gf.files[0]); toast("Gift photo set ✓"); } });
    }
    if (id === "theme") {
      $$(".swatch", root).forEach((s) => s.addEventListener("click", () => {
        work.theme = s.dataset.t;
        const sel = $('select[data-path="theme"]', root);
        if (sel) sel.value = work.theme;
        applyThemePreview(work.theme);
      }));
    }
  }

  function applyThemePreview(t) {
    try { document.documentElement.setAttribute("data-theme", t); } catch (e) {}
  }

  /* ================= SAVE ================= */
  function save() {
    const before = JSON.stringify(Cfg);
    Core.applyCfg(Core.clone(work));
    try {
      Core.applyTheme();
      window.App.renderAll();
      if (window.AudioX) AudioX.stopMusic();
      if (window.SceneX && window.SceneX.refreshCake) window.SceneX.refreshCake();
      toast("Saved & applied ✨");
      work = Core.clone(Cfg);
      const active = $(".admin-nav button.on", panel);
      if (active) active.click();
    } catch (e) {
      Core.applyCfg(JSON.parse(before));
      console.error(e);
      toast("Something went wrong — nothing changed");
    }
  }

  /* ================= BOOT ================= */
  function bootAdmin() {
    if (document.getElementById("admin")) return;
    buildPanel();
  }
  window.AdminX = { boot: bootAdmin };
})();
