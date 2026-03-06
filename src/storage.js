const KEY = 'moonoo-config-v1';
const PRESETS_KEY = 'moonoo-presets-v1';

export const saveConfig = (config) => localStorage.setItem(KEY, JSON.stringify(config));
export const loadConfig = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
};

export const savePreset = (name, config) => {
  const presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
  presets[name] = config;
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
};

export const loadPreset = (name) => {
  const presets = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
  return presets[name] || null;
};

export const listPresets = () => Object.keys(JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}'));
