import { ParticleEngine, adaptiveCount, deviceClass } from './js/core.js';
import { bindControls } from './js/ui.js';
import { AudioController } from './js/audio.js';
import { applyI18n } from './js/i18n.js';
import { loadPreset } from './js/presets.js';
import { saveConfig, loadConfig, exportConfig, importConfig } from './js/storage.js';

const config = Object.assign({
  size: 3,
  opacity: 0.8,
  velocity: 1,
  palette: '#00d2ff',
  neon: 1,
  attractRadius: 120,
  linkThickness: 1.2,
  spawnLimit: 1200,
  bloom: 0.4,
  motionBlur: 0.2,
  shaderStrength: 0.5,
  fps: 60,
  adaptive: true,
  gravity: 0.02,
  collision: true,
  decay: 0.004,
  lang: 'en-US',
}, loadConfig() || {});

const canvas = document.getElementById('particle-canvas');
const engine = new ParticleEngine(canvas, config);
const audio = new AudioController();
const overlay = document.getElementById('loading-overlay');
const progress = document.getElementById('loading-progress');

function preloadFake() {
  overlay.setAttribute('aria-hidden', 'false');
  let p = 0;
  const timer = setInterval(() => {
    p += 20;
    progress.style.width = `${p}%`;
    if (p >= 100) {
      clearInterval(timer);
      overlay.setAttribute('aria-hidden', 'true');
    }
  }, 120);
}

function applyAdaptive() {
  if (!config.adaptive) return;
  config.spawnLimit = adaptiveCount(deviceClass(), Number(document.getElementById('spawn-limit').value || 1200));
  document.getElementById('spawn-limit').value = config.spawnLimit;
}

function bindInput() {
  const setPointer = (x, y, active = true, pressure = 0.5) => {
    engine.pointer.x = x * devicePixelRatio;
    engine.pointer.y = y * devicePixelRatio;
    engine.pointer.active = active;
    engine.pointer.pressure = pressure;
  };

  canvas.addEventListener('pointermove', (e) => {
    setPointer(e.offsetX, e.offsetY, true, e.pressure || 0.5);
    engine.spawn(e.offsetX * devicePixelRatio, e.offsetY * devicePixelRatio, 3);
  });
  canvas.addEventListener('pointerdown', (e) => {
    engine.pointer.mode = e.button === 2 ? 'repel' : 'attract';
    engine.burst(e.offsetX * devicePixelRatio, e.offsetY * devicePixelRatio);
    audio.ping(420 + (e.pressure || 0.5) * 330, 'triangle');
  });
  canvas.addEventListener('pointerup', () => { engine.pointer.active = false; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  let longPressTimer = null;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    setPointer(t.clientX - rect.left, t.clientY - rect.top, true, 0.7);
    longPressTimer = setTimeout(() => engine.burst(engine.pointer.x, engine.pointer.y), 420);
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    setPointer(t.clientX - rect.left, t.clientY - rect.top, true, 0.7);
    engine.spawn(engine.pointer.x, engine.pointer.y, 5);
  }, { passive: true });
  canvas.addEventListener('touchend', () => clearTimeout(longPressTimer), { passive: true });

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'b') engine.burst(engine.pointer.x, engine.pointer.y);
    if (e.key.toLowerCase() === 'm') {
      audio.setMute(!audio.muted);
      document.getElementById('mute').textContent = audio.muted ? 'Unmute' : 'Mute';
    }
  });
}

function bindUi() {
  bindControls(config, () => saveConfig(config));

  document.getElementById('language-select').value = config.lang;
  document.getElementById('language-select').addEventListener('change', (e) => {
    config.lang = e.target.value;
    applyI18n(config.lang);
    saveConfig(config);
  });

  document.getElementById('contrast-btn').addEventListener('click', (e) => {
    document.documentElement.classList.toggle('high-contrast');
    const on = document.documentElement.classList.contains('high-contrast');
    e.currentTarget.setAttribute('aria-pressed', String(on));
  });

  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const p = await loadPreset(btn.dataset.preset);
      Object.assign(config, p);
      saveConfig(config);
      audio.ping(560, 'square', 100);
    });
  });

  document.getElementById('save-btn').addEventListener('click', () => saveConfig(config));
  document.getElementById('load-btn').addEventListener('click', () => {
    const data = loadConfig();
    if (data) Object.assign(config, data);
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    document.getElementById('share-output').value = exportConfig(config);
  });
  document.getElementById('share-output').addEventListener('change', (e) => {
    try { Object.assign(config, importConfig(e.target.value)); } catch { /* ignore */ }
  });

  document.getElementById('volume').addEventListener('input', (e) => audio.setVolume(e.target.value));
  document.getElementById('mute').addEventListener('click', () => {
    audio.setMute(!audio.muted);
    document.getElementById('mute').textContent = audio.muted ? 'Unmute' : 'Mute';
  });
}

function loop() {
  engine.draw();
  requestAnimationFrame(loop);
}

function boot() {
  applyI18n(config.lang);
  preloadFake();
  engine.resize();
  applyAdaptive();
  bindInput();
  bindUi();
  window.addEventListener('resize', () => engine.resize());
  loop();
}

boot();
