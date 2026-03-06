import { DEFAULT_CONFIG, THEMES, I18N } from './config.js';
import { ParticleEngine } from './particleEngine.js';
import { WebGLFx } from './webglFx.js';
import { AudioEngine } from './audio.js';
import { loadConfig, saveConfig, savePreset, loadPreset, listPresets } from './storage.js';

const config = { ...DEFAULT_CONFIG, ...(loadConfig() || {}) };
const app = document.body;
const particleCanvas = document.getElementById('particle-canvas');
const fxCanvas = document.getElementById('fx-canvas');
const panel = document.getElementById('control-panel');
const toggleBtn = document.getElementById('panel-toggle');
const toastRoot = document.getElementById('toast-root');
const loading = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');
const audioBtn = document.getElementById('audio-btn');

const audio = new AudioEngine();
audio.setEnabled(config.audioEnabled);
audio.setVolume(config.volume);

const engine = new ParticleEngine(particleCanvas, config, THEMES[config.theme].palette);
const fx = new WebGLFx(fxCanvas, particleCanvas, config);

const controls = ['shape', 'maxParticles', 'speed', 'opacity', 'size', 'attractRadius', 'linkDistance', 'spawnRate', 'interactionStrength', 'bloom', 'motionBlur', 'chromatic', 'scanline', 'fpsMode'];
controls.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = config[id];
  else el.value = config[id];
  el.addEventListener('input', () => {
    config[id] = el.type === 'checkbox' ? el.checked : (el.type === 'range' ? Number(el.value) : el.value);
    if (id === 'fpsMode') showToast(config.fpsMode ? '60 FPS' : '30 FPS');
    engine.setConfig(config);
    fx.setConfig(config);
    saveConfig(config);
  });
});

function showToast(msg) {
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = msg;
  toastRoot.appendChild(node);
  setTimeout(() => node.remove(), 1800);
}

function setTheme(name) {
  config.theme = name;
  app.classList.remove('theme-cute', 'theme-cyber', 'theme-minimal');
  app.classList.add(THEMES[name].className);
  config.shape = THEMES[name].shape;
  document.getElementById('shape').value = config.shape;
  engine.setThemePalette(THEMES[name].palette);
  engine.setConfig(config);
  saveConfig(config);
  showToast(`Theme: ${name}`);
}

function applyLang(lang) {
  config.language = lang;
  document.body.dataset.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.animate([{ opacity: 1 }, { opacity: 0.25 }, { opacity: 1 }], { duration: 280, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
    el.textContent = I18N[lang][el.dataset.i18n] || el.textContent;
  });
  loadingText.textContent = I18N[lang].loading;
  saveConfig(config);
}

let themeIndex = ['cute', 'cyber', 'minimal'].indexOf(config.theme);
document.getElementById('theme-btn').onclick = () => {
  themeIndex = (themeIndex + 1) % 3;
  setTheme(['cute', 'cyber', 'minimal'][themeIndex]);
  audio.beep('triangle', 480, 0.06, 0.8);
};

document.getElementById('lang-btn').onclick = () => {
  applyLang(config.language === 'zh' ? 'en' : 'zh');
  audio.beep('square', 520, 0.05, 0.7);
};

toggleBtn.onclick = () => {
  panel.classList.toggle('collapsed');
  const expanded = !panel.classList.contains('collapsed');
  toggleBtn.setAttribute('aria-expanded', String(expanded));
  audio.beep('sine', expanded ? 440 : 330, 0.04, 0.7);
};

const pointer = { x: innerWidth / 2, y: innerHeight / 2, mode: 'attract' };
let lastX = pointer.x;
let lastY = pointer.y;
addEventListener('mousemove', (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  const speed = Math.hypot(e.clientX - lastX, e.clientY - lastY);
  pointer.speed = speed;
  config.motionBlur = Math.min(1, 0.1 + speed / 80);
  lastX = e.clientX;
  lastY = e.clientY;
  if (speed > 20) engine.spawn(pointer.x, pointer.y, true);
  engine.input(pointer);
});
addEventListener('mousedown', (e) => { engine.explode(e.clientX, e.clientY); audio.beep('sawtooth', 180, 0.08, 1); });
addEventListener('dblclick', (e) => { engine.gather(e.clientX, e.clientY); audio.beep('triangle', 620, 0.08, 0.9); });
addEventListener('wheel', (e) => {
  config.maxParticles = Math.max(80, Math.min(600, config.maxParticles + (e.deltaY < 0 ? 12 : -12)));
  document.getElementById('maxParticles').value = config.maxParticles;
  showToast(`Particles: ${config.maxParticles}`);
});
addEventListener('contextmenu', (e) => { e.preventDefault(); pointer.mode = pointer.mode === 'attract' ? 'repel' : 'attract'; showToast(pointer.mode); });

addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  pointer.x = t.clientX; pointer.y = t.clientY;
  engine.spawn(pointer.x, pointer.y, true);
  engine.input(pointer);
}, { passive: true });
addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (!t) return;
  const now = performance.now();
  if (now - engine.lastTouch < 280) engine.explode(t.clientX, t.clientY);
  engine.lastTouch = now;
  setTimeout(() => engine.gather(t.clientX, t.clientY), 360);
});

addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') engine.flow.y = -1;
  if (e.key === 'ArrowDown') engine.flow.y = 1;
  if (e.key === 'ArrowLeft') engine.flow.x = -1;
  if (e.key === 'ArrowRight') engine.flow.x = 1;
  if (e.key.toLowerCase() === 'x') engine.explode(pointer.x, pointer.y);
});
addEventListener('keyup', () => { engine.flow.x = 0; engine.flow.y = 0; });

window.addEventListener('resize', () => { engine.resize(); fx.resize(); });

['reset-btn', 'save-btn', 'load-btn', 'export-btn', 'audio-btn'].forEach((id) => document.getElementById(id).addEventListener('click', () => {
  document.getElementById(id).animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
}));

document.getElementById('reset-btn').onclick = () => {
  Object.assign(config, DEFAULT_CONFIG);
  controls.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = config[id]; else el.value = config[id];
  });
  setTheme(config.theme);
  applyLang(config.language);
  showToast('Reset done');
};

document.getElementById('save-btn').onclick = () => {
  const name = prompt('Preset name?') || `preset-${Date.now()}`;
  savePreset(name, config);
  showToast(`Saved: ${name}`);
};

document.getElementById('load-btn').onclick = () => {
  const names = listPresets();
  const picked = prompt(`Pick preset:\n${names.join('\n')}`);
  if (!picked) return;
  const data = loadPreset(picked);
  if (!data) return showToast('Preset not found');
  Object.assign(config, data);
  controls.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = config[id]; else el.value = config[id];
  });
  setTheme(config.theme);
  applyLang(config.language);
  showToast(`Loaded: ${picked}`);
};

document.getElementById('export-btn').onclick = () => {
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'moonoo-config.json';
  a.click();
};

document.getElementById('import-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const data = JSON.parse(await file.text());
  Object.assign(config, data);
  controls.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = config[id]; else el.value = config[id];
  });
  setTheme(config.theme);
  applyLang(config.language);
  showToast('Import success');
});

audioBtn.onclick = () => {
  config.audioEnabled = !config.audioEnabled;
  audio.setEnabled(config.audioEnabled);
  audioBtn.textContent = config.audioEnabled ? '🔊' : '🔇';
  showToast(config.audioEnabled ? 'Audio on' : 'Audio off');
};

function bootLoading() {
  let p = 0;
  const timer = setInterval(() => {
    p = Math.min(100, p + Math.random() * 18);
    progressBar.style.width = `${p}%`;
    if (p >= 100) {
      clearInterval(timer);
      loading.classList.add('hide');
    }
  }, 120);
}

setTheme(config.theme);
applyLang(config.language);
bootLoading();

let last = 0;
function animate(t) {
  const frameInterval = config.fpsMode ? 16 : 33;
  if (t - last >= frameInterval) {
    engine.update();
    engine.render();
    fx.render();
    last = t;
  }
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
