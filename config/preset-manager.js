const KEY = 'ptcmoo-config';
const PRESET_KEY = 'ptcmoo-custom-presets';

export const THEMES = {
  cute: { theme: 'cute', shape: 'heart', bloom: 0.65, glitch: 0.04, alpha: 0.8, scanline: false },
  cyber: { theme: 'cyber', shape: 'triangle', bloom: 0.9, glitch: 0.35, alpha: 0.75, scanline: true },
  minimal: { theme: 'minimal', shape: 'circle', bloom: 0.18, glitch: 0.02, alpha: 0.55, scanline: false },
};

export class PresetManager {
  constructor(defaultConfig) { this.defaultConfig = defaultConfig; }

  saveConfig(config) { localStorage.setItem(KEY, JSON.stringify(config)); }
  loadConfig() {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...this.defaultConfig, ...JSON.parse(raw) } : { ...this.defaultConfig };
  }

  saveNamedPreset(name, config) {
    const list = this.getNamedPresets();
    list[name] = config;
    localStorage.setItem(PRESET_KEY, JSON.stringify(list));
  }

  getNamedPresets() { return JSON.parse(localStorage.getItem(PRESET_KEY) || '{}'); }

  loadNamedPreset(name) { return this.getNamedPresets()[name]; }

  exportConfig(config) {
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(config))));
    const url = new URL(location.href);
    url.searchParams.set('preset', payload);
    return url.toString();
  }

  importFromQuery() {
    const encoded = new URL(location.href).searchParams.get('preset');
    if (!encoded) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))); } catch { return null; }
  }
}
