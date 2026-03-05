# Interactive Particle Page (PtcMoo)

An immersive HTML5 Canvas particle playground with modular JavaScript architecture, runtime controls, bilingual UI (`zh-CN`/`en-US`), accessibility support, and shareable presets.

## Run

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

## Deliverables

- `index.html`: semantic structure + control panel + ARIA hooks.
- `styles.css`: compiled-style CSS with glassmorphism + neumorphism-inspired panel.
- `main.js`: app bootstrap and module wiring.
- `js/{core,ui,audio,i18n,presets,storage}.js`: modular features.
- `shaders/*.glsl`: starter shader programs for post-processing effects.
- `presets/{cute,cyber,minimal}.json`: runtime theme presets.
- `assets/{fonts,icons,audio,images}`: asset folders ready for production files.

## Feature Map

- Interactions: hover, click, keyboard (`B` burst, `M` mute), touch move + long-press burst, right-click repel mode.
- Physics: gravity, collision/bounce, lifecycle decay.
- Visuals: linked particle grid + trail spawn + motion blur style feedback.
- Runtime customization: immediate control updates, save/load/export JSON.
- Accessibility: skip link, keyboard shortcuts, high contrast toggle, semantic labels.
- i18n: language switch with font mapping (`Inter` / `Noto Sans SC`).

## Configuration API (JSON)

```json
{
  "size": 3,
  "opacity": 0.8,
  "velocity": 1,
  "palette": "#00d2ff",
  "attractRadius": 120,
  "linkThickness": 1.2,
  "spawnLimit": 1200,
  "bloom": 0.4,
  "motionBlur": 0.2,
  "shaderStrength": 0.5,
  "fps": 60,
  "adaptive": true,
  "lang": "en-US"
}
```

## Tests

```bash
npm test
```

Includes unit coverage for:
- core physics/adaptive logic
- config persistence import/export
- i18n key fallback/translations
