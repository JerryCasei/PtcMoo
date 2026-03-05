export class AudioController {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.5;
  }

  ensureCtx() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  setVolume(v) { this.volume = Number(v); }
  setMute(m) { this.muted = m; }

  ping(freq = 440, type = 'sine', ms = 80) {
    if (this.muted) return;
    this.ensureCtx();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    gain.gain.value = this.volume * 0.08;
    osc.frequency.value = freq;
    osc.type = type;
    osc.connect(gain).connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + ms / 1000);
  }
}
