export class ControlPanel {
  constructor(root, onChange, onAction) {
    this.root = root;
    this.onChange = onChange;
    this.onAction = onAction;
    this.bind();
  }

  bind() {
    const toggle = document.getElementById('panelToggle');
    toggle.addEventListener('click', () => {
      this.root.classList.toggle('collapsed');
      toggle.setAttribute('aria-expanded', String(!this.root.classList.contains('collapsed')));
    });

    this.inputs = Array.from(this.root.querySelectorAll('input,select')).filter((el) => el.id);
    for (const input of this.inputs) {
      input.addEventListener('input', () => this.emitChange(input.id, input.type === 'checkbox' ? input.checked : input.value));
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') input.stepUp?.();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') input.stepDown?.();
      });
    }
    document.getElementById('savePreset').addEventListener('click', () => this.onAction('save'));
    document.getElementById('loadPreset').addEventListener('click', () => this.onAction('load'));
    document.getElementById('resetPreset').addEventListener('click', () => this.onAction('reset'));
    document.getElementById('sharePreset').addEventListener('click', () => this.onAction('share'));
  }

  emitChange(id, value) {
    const numeric = ['count','size','speed','alpha','attractRadius','linkDistance','spawnRate','volume','bloom','blur','glitch'];
    this.onChange(id, numeric.includes(id) ? Number(value) : value);
  }

  sync(config) {
    for (const input of this.inputs) {
      if (!(input.id in config)) continue;
      if (input.type === 'checkbox') input.checked = Boolean(config[input.id]);
      else input.value = config[input.id];
    }
  }

  setOptions({ shapes, themes }) {
    const shape = document.getElementById('shape');
    shape.innerHTML = shapes.map((s) => `<option value="${s}">${s}</option>`).join('');
    const theme = document.getElementById('theme');
    theme.innerHTML = themes.map((s) => `<option value="${s}">${s}</option>`).join('');
  }
}
