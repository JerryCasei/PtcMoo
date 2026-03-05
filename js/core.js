export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function deviceClass(width = window.innerWidth) {
  if (width < 680) return 'low';
  if (width < 1200) return 'mid';
  return 'high';
}

export function adaptiveCount(device, base = 1200) {
  if (device === 'low') return Math.floor(base * 0.45);
  if (device === 'mid') return Math.floor(base * 0.75);
  return base;
}

export function physicsStep(p, cfg, dt) {
  p.vy += cfg.gravity * dt;
  p.x += p.vx * cfg.velocity * dt;
  p.y += p.vy * cfg.velocity * dt;

  if (cfg.collision) {
    if (p.x < 0 || p.x > cfg.w) p.vx *= -0.9;
    if (p.y < 0 || p.y > cfg.h) p.vy *= -0.9;
    p.x = clamp(p.x, 0, cfg.w);
    p.y = clamp(p.y, 0, cfg.h);
  }
  p.life -= cfg.decay * dt;
  return p.life > 0;
}

export class ParticleEngine {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
    this.particles = [];
    this.links = [];
    this.pointer = { x: -999, y: -999, active: false, pressure: 0.5, mode: 'attract' };
    this.last = performance.now();
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth * devicePixelRatio;
    this.canvas.height = this.canvas.clientHeight * devicePixelRatio;
  }

  spawn(x, y, amount = 8) {
    for (let i = 0; i < amount && this.particles.length < this.config.spawnLimit; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1,
        size: this.config.size * (0.8 + Math.random() * 0.4),
      });
    }
  }

  burst(x, y) { this.spawn(x, y, 40); }

  pointerForce(p) {
    const dx = this.pointer.x - p.x;
    const dy = this.pointer.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    if (!this.pointer.active || d > this.config.attractRadius) return;
    const f = (1 - d / this.config.attractRadius) * 0.8;
    const dir = this.pointer.mode === 'repel' ? -1 : 1;
    p.vx += (dx / d) * f * dir;
    p.vy += (dy / d) * f * dir;
  }

  draw() {
    const now = performance.now();
    const dt = Math.min(0.04, (now - this.last) / 16.67);
    this.last = now;
    const ctx = this.ctx;

    ctx.fillStyle = `rgba(5,8,22,${Math.max(0.08, 0.32 - this.config.motionBlur * 0.2)})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter((p) => {
      this.pointerForce(p);
      return physicsStep(p, { ...this.config, w: this.canvas.width, h: this.canvas.height }, dt);
    });

    ctx.save();
    ctx.globalAlpha = this.config.opacity;
    ctx.fillStyle = this.config.palette;
    this.links.length = 0;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < this.particles.length; j += 12) {
        const q = this.particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 90) this.links.push([p, q, 1 - d / 90]);
      }
    }
    ctx.lineWidth = this.config.linkThickness;
    for (const [a, b, strength] of this.links) {
      ctx.strokeStyle = `rgba(255,255,255,${strength * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }
}
