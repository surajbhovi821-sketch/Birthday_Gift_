/* ================= MAIN BOOT ================= */
(function () {
  "use strict";
  function boot() {
    window.Core.applyTheme();
    const canvas = document.getElementById("scene");
    if (canvas) window.SceneX.init(canvas);

    window.App.renderAll();
    window.App.startIntro();
    window.AdminX.boot();

    /* music fab */
    const fab = document.getElementById("music-fab");
    if (fab) {
      fab.addEventListener("click", () => {
        window.AudioX.toggle();
        fab.classList.toggle("on", !!window.AudioX.isPlaying());
        fab.textContent = window.AudioX.isPlaying() ? "♫" : "♪";
      });
    }

    /* pause animations fab */
    const pfab = document.getElementById("pause-fab");
    if (pfab) {
      let paused = false;
      pfab.addEventListener("click", () => {
        paused = !paused;
        document.body.classList.toggle("paused", paused);
        pfab.textContent = paused ? "▶" : "⏸";
        pfab.classList.toggle("on", paused);
      });
    }

    /* unlock audio on first gesture globally */
    const unlock = () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);

    /* scroll progress */
    const bar = document.getElementById("progress");
    if (bar) {
      window.addEventListener("scroll", () => {
        const h = document.documentElement;
        const max = h.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      }, { passive: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
