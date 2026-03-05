export function bindControls(config, onChange) {
  const map = {
    size: 'size', opacity: 'opacity', velocity: 'velocity', palette: 'palette', neon: 'neon',
    'attract-radius': 'attractRadius', 'link-thickness': 'linkThickness', 'spawn-limit': 'spawnLimit',
    bloom: 'bloom', 'motion-blur': 'motionBlur', 'shader-strength': 'shaderStrength', 'fps-limit': 'fps',
  };

  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    el.value = config[key];
    el.addEventListener('input', () => {
      const value = el.type === 'color' ? el.value : Number(el.value);
      config[key] = value;
      onChange(key, value);
    });
  });

  document.getElementById('adaptive').addEventListener('change', (e) => {
    config.adaptive = e.target.checked;
    onChange('adaptive', config.adaptive);
  });

  const panel = document.getElementById('control-panel');
  const btn = document.getElementById('toggle-panel');
  btn.addEventListener('click', () => {
    panel.classList.toggle('collapsed');
    btn.setAttribute('aria-expanded', String(!panel.classList.contains('collapsed')));
  });
}
