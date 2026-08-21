/* ================= AUDIO ENGINE =================
   Music-box style "Happy Birthday" synthesized with WebAudio
   (works offline, no files needed) + optional uploaded song.
   ================================================ */
(function () {
  "use strict";

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let ctx = null;
  let master = null;
  let musicGain = null;
  let playing = false;
  let timer = null;
  let uploadedAudio = null;
  let uploadedSource = null;
  let analyser = null;
  let volume = 0.7;

  const unlock = () => {
    if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.5;
      musicGain.connect(master);
    } catch (e) { /* no audio */ }
  };
  document.addEventListener("pointerdown", unlock, { capture: true, once: false });
  document.addEventListener("keydown", unlock, { capture: true, once: false });
  window.addEventListener("touchstart", unlock, { capture: true, once: false });

  /* ---------- music box note ---------- */
  const NOTE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
    A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.26,
    F5: 698.46, G5: 783.99, A5: 880.00, C3: 130.81, G3: 196.00,
    A3: 220.00, F3: 174.61, E3: 164.81, D3: 146.83
  };

  // Happy Birthday — melody [freq, beats] + gentle chord pad
  const MELODY = [
    [NOTE.G4, .75], [NOTE.G4, .25], [NOTE.A4, 1], [NOTE.G4, 1], [NOTE.C5, 1], [NOTE.B4, 2],
    [NOTE.G4, .75], [NOTE.G4, .25], [NOTE.A4, 1], [NOTE.G4, 1], [NOTE.D5, 1], [NOTE.C5, 2],
    [NOTE.G4, .75], [NOTE.G4, .25], [NOTE.G5, 1], [NOTE.E5, 1], [NOTE.C5, 1], [NOTE.B4, 1], [NOTE.A4, 2],
    [NOTE.F5, .75], [NOTE.F5, .25], [NOTE.E5, 1], [NOTE.C5, 1], [NOTE.D5, 1], [NOTE.C5, 2.5],
    [NOTE.C5, .5], [NOTE.D5, .5], [NOTE.C5, .5], [NOTE.G4, .5], [NOTE.E5, 1], [NOTE.C5, 1], [NOTE.B4, 2]
  ];
  const CHORDS = [
    [NOTE.C4, NOTE.E4, NOTE.G4], [NOTE.C4, NOTE.E4, NOTE.G4], [NOTE.F4, NOTE.A4, NOTE.C5], [NOTE.C4, NOTE.E4, NOTE.G4],
    [NOTE.F4, NOTE.A4, NOTE.C5], [NOTE.G4, NOTE.B4, NOTE.D5], [NOTE.C4, NOTE.E4, NOTE.G4], [NOTE.G3, NOTE.B3 || NOTE.G4, NOTE.D4 || NOTE.D5]
  ];

  const BEAT = 0.42; // seconds per beat

  const tone = (freq, t, dur, vol, type) => {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musicGain);
    o.start(t); o.stop(t + dur + 0.05);
  };

  const playMelody = (startTime) => {
    let t = startTime;
    let bar = 0;
    MELODY.forEach(([f, beats]) => {
      tone(f * 2, t, beats * BEAT * 0.92, 0.15, "triangle");
      tone(f * 1.002, t, beats * BEAT * 0.92, 0.07, "sine"); // detune shimmer
      t += beats * BEAT;
    });
    // soft chord pads
    let ct = startTime;
    CHORDS.forEach((chord) => {
      chord.forEach((f, i) => tone(f * 0.5, ct, 3.6 * BEAT, 0.045, "sine"));
      ct += 3.5 * BEAT;
    });
    return t;
  };

  const scheduleLoop = () => {
    if (!ctx || !playing) return;
    const t = ctx.currentTime + 0.15;
    const end = playMelody(t);
    timer = setTimeout(scheduleLoop, (end - ctx.currentTime - 0.4) * 1000);
  };

  /* ---------- public API ---------- */
  const Audio = {
    ready: () => !!ctx,
    startMusic() {
      unlock();
      if (!ctx) return;
      const cfg = window.Core.Cfg;
      const useFile = cfg.music && cfg.music.file && !cfg.music.useMusicBox;
      if (useFile && cfg.music.file) {
        if (!uploadedAudio) {
          uploadedAudio = new Audio(cfg.music.file);
          uploadedAudio.loop = true;
          uploadedAudio.volume = volume;
          try {
            uploadedSource = ctx.createMediaElementSource(uploadedAudio);
            analyser = ctx.createAnalyser();
            analyser.fftSize = 128;
            uploadedSource.connect(analyser);
            analyser.connect(master);
          } catch (e) { /* media element source may fail; still play */ }
        }
        uploadedAudio.play().catch(() => {});
      } else if (cfg.music && cfg.music.useMusicBox !== false) {
        if (!playing) { playing = true; scheduleLoop(); }
        return;
      }
      playing = true;
    },
    stopMusic() {
      playing = false;
      clearTimeout(timer);
      if (uploadedAudio) { uploadedAudio.pause(); }
    },
    toggle() {
      if (playing) { this.stopMusic(); return false; }
      this.startMusic(); return true;
    },
    isPlaying: () => playing,
    duck() {
      if (musicGain && ctx) musicGain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.4);
      if (uploadedAudio) uploadedAudio.volume = volume * 0.25;
    },
    unduck() {
      if (musicGain && ctx) musicGain.gain.setTargetAtTime(volume * 0.7, ctx.currentTime, 0.6);
      if (uploadedAudio) uploadedAudio.volume = volume;
    },
    setVolume(v) {
      volume = clamp(v, 0, 1);
      if (musicGain && ctx) musicGain.gain.setTargetAtTime(volume * 0.7, ctx.currentTime, 0.1);
      if (uploadedAudio) uploadedAudio.volume = volume;
    },
    getVolume: () => volume,
    getLevel() {
      if (!analyser || !ctx || !playing) return -1;
      try {
        const d = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        let s = 0;
        for (let i = 0; i < d.length; i++) s += d[i];
        return s / d.length / 255;
      } catch (e) { return -1; }
    },
    _dbg: () => ({ hasCtx: !!ctx, state: ctx ? ctx.state : "no-ctx", playing, musicGain: !!musicGain }),
    /* ---------- one-shot SFX ---------- */
    chime() {
      unlock(); if (!ctx || !musicGain) return;
      const t = ctx.currentTime;
      [523.25, 659.26, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.09, 1.4, 0.12, "sine"));
    },
    pop() {
      unlock(); if (!ctx) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.18);
      g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
    },
    whoosh() {
      unlock(); if (!ctx) return;
      const t = ctx.currentTime;
      const len = 0.9;
      const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3200, t + len);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    },
    boom() {
      unlock(); if (!ctx) return;
      const t = ctx.currentTime;
      const len = 1.6;
      const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(120, t + len);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      src.connect(f); f.connect(g); g.connect(master); src.start(t);
    },
    softBell() {
      unlock(); if (!ctx) return;
      const t = ctx.currentTime;
      [783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, t + i * 0.12, 2.2, 0.08, "sine"));
    }
  };

  window.AudioX = Audio;
})();
