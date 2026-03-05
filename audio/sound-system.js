export class SoundSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.45;
  }

  ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setVolume(v) { this.volume = v; }
  setEnabled(v) { this.enabled = v; }

  play(type = 'click', intensity = 1) {
    if (!this.enabled) return;
    this.ensureCtx();
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const map = {
      click: [520, 0.06, 'triangle'],
      burst: [180, 0.22, 'sawtooth'],
      spawn: [720, 0.05, 'sine'],
      attract: [320, 0.09, 'square'],
    };
    const [freq, dur, wave] = map[type] || map.click;
    osc.type = wave;
    osc.frequency.value = freq + intensity * 80;
    filter.type = 'lowpass';
    filter.frequency.value = 1200 + intensity * 800;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume * 0.25), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(now); osc.stop(now + dur + 0.01);
  }
}
