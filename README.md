# 🎂 Happy Birthday Kajal Bhoi ❤️ — a 3D family surprise

A single-file, self-contained **premium cinematic 3D birthday website** created for **Kajal Bhoi**
(2 February). Everything — Three.js, photos, styles, scripts, music — is inlined into one file,
so it works offline, from a USB stick, or opened directly in any browser.

## 📄 The deliverable

| File | What it is |
|---|---|
| **`index.html`** | The complete birthday experience — open this. |
| `src/` | Editable source (CSS/JS/config) + `build.py` that regenerates `index.html`. |
| `README.md` | This file. |

Open `index.html` → click **OPEN YOUR SURPRISE 🎁** → the journey begins.

## ✨ The experience (18 chapters)

1. **Cinematic opening** — dark screen, glowing particles, three quotes → floating 3D gift box → golden light, photo flashes
2. **Birthday hero** — Kajal's photo in a floating 3D frame, **HAPPY BIRTHDAY KAJAL 🎂**, **02 • 02 / FEBRUARY 2ND**
3. **Live countdown** — real ticking days/hours/minutes/seconds to the next **2 February**; on the day it becomes **TODAY IS KAJAL'S DAY! 🎉** with fireworks
4. **A Special Wish For Kajal ❤️** — message reveals line-by-line with a typing cursor (fully editable)
5. **A Story That Started With Family ❤️** — childhood → growing up → today (editable chapters)
6. **Kajal's Journey Through Memories** — 3D timeline (childhood → school → family → celebrations → recent → today → new chapter)
7. **Memories We'll Never Forget 📸** — floating polaroid gallery, lightbox with blur, swipe on mobile
8. **3D Memory Museum** — a virtual gallery you walk through; scroll turns the room, photos fade by depth
9. **Because Kajal Is Kajal 😂❤️** — funny family & sister moments
10. **What Makes Kajal Special ❤️** — animated quality cards (smile, kindness, laughter…)
11. **Interactive 3D birthday cake** — KAJAL · 02 • 02, glowing candles → **MAKE A WISH ✨** → blow → smoke, fireworks, confetti
12. **Wait... There's One More Surprise 🎁** — second 3D gift box (reveals photo / secret message / video)
13. **A Little Journey Through Kajal's Memories 🎬** — cinematic video player
14. **🎵 A Song For Kajal** — floating music player with animated waveform, volume, mute
15. **Wishes From The People Who Love You ❤️** — cards for parents, siblings, grandparents, relatives, friends
16. **A Letter For Kajal 💌** — 3D envelope, letter slides out line by line
17. **Final celebration** — a glowing point expands into KAJAL → HAPPY BIRTHDAY → ❤️ → 02 FEBRUARY, elegant fireworks
18. **Final photo & message** + **Share the surprise** (WhatsApp / Instagram / Facebook / Copy Link / native share)

## ⚙ How the family personalizes it

Tap the **⚙ button** (bottom-right, above the music note). The admin panel has tabs for:

- **Kajal** — name, date of birth, **birth year (age auto-calculates from it)**, birthday labels, profile photo
- **Sender** — name (Suraj, her brother), photo, relationship, personal message
- **Story** — opening lines + the family story chapters
- **Timeline** — add / remove / reorder / edit memories (era, year, title, description, photo, location, video)
- **Gallery** — add, replace, **reorder**, caption & delete photos
- **Qualities / Funny / Wishes** — add unlimited cards (what makes Kajal special, funny moments, family wishes)
- **Messages** — the birthday wish, the letter, final quote, closing line, share text
- **Video** — upload a personal video (or paste a URL) + thumbnail
- **Music** — upload a song or keep the built-in music-box *Happy Birthday* melody; volume control
- **Final Gift** — choose what's inside the last box: photo / secret message / video
- **Theme** — 8 looks: Cinematic, Elegant, Family, Cute, Luxury, Colorful, Dark, Minimal

Press **Save & Apply ✨** — the site rebuilds instantly. Settings persist in the browser (localStorage).

> 💡 Nothing personal is invented: no birth year, no age, no sender name, and no memories were
> assumed — everything shown is either provided in the brief or is an editable placeholder.

## 📸 Real photos

Kajal's real photos (`k1`–`k8`) are embedded directly into the page — used for the hero,
the gallery (8 polaroids), the 3D memory museum, the timeline, funny moments and the final
gift. To swap or add more, use **⚙ → Gallery** (replace / add / reorder / caption) or send
more photos to have them embedded directly.


## 🛠 Rebuilding from source

```
python3 src/build.py      # regenerates index.html from src/ (inlines Three.js + images)
```

Edit `src/config.js` for defaults, `src/css/main.css` for styling, `src/js/*.js` for behavior.

## 🎧 Audio & accessibility

- Music starts right after the gift opens (music-box *Happy Birthday* — no files needed). The ♪
  button pauses/resumes; the music player adds volume/mute/waveform.
- The ⏸ button pauses/resumes all CSS animations; `prefers-reduced-motion` is respected
  (typing animation is skipped, reveals become instant).
- Low-end devices automatically get reduced particle counts and a capped pixel ratio.

## 💡 Tips

- Best on a laptop/desktop with sound; works on phones too (swipe gallery & museum, tap to open).
- If the in-app preview looks dim, download `index.html` and open it directly — it's 100% self-contained.

Made with ❤️ by family, for Kajal. 🎂
