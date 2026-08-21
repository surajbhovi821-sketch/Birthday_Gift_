#!/usr/bin/env python3
"""Build script: assembles src/ into a single self-contained index.html
(Three.js + all images inlined, works offline & in the sandboxed preview)."""
import base64
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def b64_file(path, mime):
    with open(path, "rb") as f:
        return "data:%s;base64,%s" % (mime, base64.b64encode(f.read()).decode())


def main():
    # images — the real photos of Kajal (k1..k8); AI placeholders removed
    images = {}
    for i in range(1, 9):
        images["k%d" % i] = b64_file(os.path.join(ROOT, "assets", "k%d.jpg" % i), "image/jpeg")

    css = read(os.path.join(ROOT, "css", "main.css"))
    three = read(os.path.join(ROOT, "..", "vendor", "three.min.js"))

    js_parts = []
    for name in ["config.js", "core.js", "audio.js", "fx.js", "three-scene.js", "sections.js", "admin.js", "main.js"]:
        src = read(os.path.join(ROOT, "js", name)) if os.path.exists(os.path.join(ROOT, "js", name)) else read(os.path.join(ROOT, name))
        js_parts.append("/* ============ %s ============ */\n" % name + src)
    js = "\n\n".join(js_parts)

    template = read(os.path.join(ROOT, "template.html"))
    html = (template
            .replace("{{CSS}}", css)
            .replace("{{IMAGES}}", json.dumps(images, separators=(",", ":")))
            .replace("{{THREE}}", three)
            .replace("{{JS}}", js))

    out = os.path.join(ROOT, "..", "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    print("Built %s (%.2f MB)" % (os.path.abspath(out), os.path.getsize(out) / 1e6))


if __name__ == "__main__":
    main()
