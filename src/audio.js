export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.2;
  }

  ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setEnabled(v) { this.enabled = v; }
  setVolume(v) { this.volume = v; }

  beep(type = 'sine', freq = 360, len = 0.04, velocity = 1) {
    if (!this.enabled) return;
    this.ensureCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = this.volume * velocity;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + len);
    osc.stop(this.ctx.currentTime + len);
  }
}
