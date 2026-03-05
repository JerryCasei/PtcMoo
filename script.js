import { ParticleEngine } from './core/particle-engine.js';
import { WebGLBackdrop } from './render/webgl-shaders.js';
import { ControlPanel } from './ui/control-panel.js';
import { SoundSystem } from './audio/sound-system.js';
import { LanguageSystem } from './i18n/language-system.js';
import { PresetManager, THEMES } from './config/preset-manager.js';

const loadingText = document.getElementById('loadingText');
const loadingOverlay = document.getElementById('loadingOverlay');
const toastRegion = document.getElementById('toastRegion');

const notifyToast = (msg) => {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
};

const sound = new SoundSystem();
const lang = new LanguageSystem();
const particle = new ParticleEngine(document.getElementById('particleCanvas'), (event) => {
  if (event === 'burst') sound.play('burst', 1.2);
  if (event === 'quick-panel') {
    document.getElementById('controlPanel').classList.remove('collapsed');
    notifyToast(lang.lang === 'zh' ? '快捷面板已展开' : 'Quick panel expanded');
  }
});
const presetMgr = new PresetManager(particle.getConfig());
const imported = presetMgr.importFromQuery();
if (imported) particle.setConfig(imported);
else particle.setConfig(presetMgr.loadConfig());

const webgl = new WebGLBackdrop(document.getElementById('webglCanvas'));
const panel = new ControlPanel(document.getElementById('controlPanel'), (id, value) => {
  if (id === 'theme') return applyTheme(value);
  particle.setConfig({ [id]: value });
  if (id === 'volume') sound.setVolume(value);
  if (id === 'bloom') webgl.setIntensity(value * 0.7 + 0.1);
  presetMgr.saveConfig(particle.getConfig());
}, (action) => {
  const cfg = particle.getConfig();
  if (action === 'save') {
    const name = prompt(lang.lang === 'zh' ? '输入预设名称' : 'Preset name');
    if (name) { presetMgr.saveNamedPreset(name, cfg); notifyToast(`✓ ${name}`); }
  }
  if (action === 'load') {
    const names = Object.keys(presetMgr.getNamedPresets());
    const chosen = prompt((lang.lang === 'zh' ? '可用预设: ' : 'Available: ') + names.join(', '));
    const p = chosen && presetMgr.loadNamedPreset(chosen);
    if (p) { particle.setConfig(p); panel.sync(p); applyTheme(p.theme || 'cute'); notifyToast(`↺ ${chosen}`); }
  }
  if (action === 'reset') {
    particle.setConfig(presetMgr.defaultConfig); panel.sync(presetMgr.defaultConfig); applyTheme('cute'); notifyToast(lang.lang === 'zh' ? '已重置' : 'Reset');
  }
  if (action === 'share') {
    navigator.clipboard.writeText(presetMgr.exportConfig(cfg));
    notifyToast(lang.lang === 'zh' ? '分享链接已复制' : 'Share link copied');
  }
  sound.play('click');
});

panel.setOptions({ shapes: ParticleEngine.getShapes(), themes: Object.keys(THEMES) });
panel.sync(particle.getConfig());
lang.apply();

function applyTheme(theme) {
  const t = THEMES[theme] || THEMES.cute;
  document.body.classList.remove('theme-cute', 'theme-cyber', 'theme-minimal');
  document.body.classList.add(`theme-${theme}`);
  particle.setConfig(t);
  panel.sync(particle.getConfig());
  sound.play('click', theme === 'cyber' ? 1.4 : 1);
}
applyTheme(particle.getConfig().theme || 'cute');

document.getElementById('languageToggle').addEventListener('click', () => {
  const l = lang.toggle();
  notifyToast(l === 'zh' ? '已切换中文' : 'Switched to English');
  sound.play('click');
});

const themeOrder = Object.keys(THEMES);
document.getElementById('themeQuickToggle').addEventListener('click', () => {
  const idx = themeOrder.indexOf(particle.getConfig().theme);
  applyTheme(themeOrder[(idx + 1) % themeOrder.length]);
});

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'h') document.body.classList.toggle('high-contrast');
  if (e.key.toLowerCase() === 'f') {
    const fps = particle.getConfig().fps === 60 ? 30 : 60;
    particle.setConfig({ fps });
    notifyToast(`FPS ${fps}`);
  }
});

particle.start(({ pointerSpeed }) => {
  webgl.setPointerSpeed(pointerSpeed);
});
webgl.start();

let progress = 0;
const timer = setInterval(() => {
  progress += Math.round(Math.random() * 18);
  const n = Math.min(100, progress);
  loadingText.textContent = `${lang.lang === 'zh' ? '初始化粒子宇宙中' : 'Booting particle universe'}... ${n}%`;
  if (n >= 100) {
    clearInterval(timer);
    loadingOverlay.classList.add('hidden');
    setTimeout(() => loadingOverlay.remove(), 600);
  }
}, 120);
