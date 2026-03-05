const KEY = 'ptcmoo-config';

export function saveConfig(config) {
  localStorage.setItem(KEY, JSON.stringify(config));
}

export function loadConfig() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function exportConfig(config) {
  return JSON.stringify(config, null, 2);
}

export function importConfig(raw) {
  return JSON.parse(raw);
}
