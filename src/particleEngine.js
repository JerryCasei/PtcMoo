const rand = (a, b) => Math.random() * (b - a) + a;

export class ParticleEngine {
  constructor(canvas, config, themePalette) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.config = config;
    this.palette = themePalette;
    this.particles = [];
    this.mouse = { x: 0, y: 0, down: false, speed: 0, mode: 'attract' };
    this.flow = { x: 0, y: 0 };
    this.lastTouch = 0;
    this.resize();
    this.seed();
  }

  resize() {
    this.canvas.width = innerWidth * devicePixelRatio;
    this.canvas.height = innerHeight * devicePixelRatio;
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    this.bounds = { w: innerWidth, h: innerHeight };
  }

  setThemePalette(palette) { this.palette = palette; }
  setConfig(config) { this.config = config; }

  spawn(x = rand(0, this.bounds.w), y = rand(0, this.bounds.h), burst = false) {
    const p = {
      x, y,
      vx: rand(-1, 1) * this.config.speed,
      vy: rand(-1, 1) * this.config.speed,
      ax: 0,
      ay: 0,
      life: rand(130, 320),
      age: 0,
      size: rand(1.8, this.config.size + 1.5),
      color: this.palette[(Math.random() * this.palette.length) | 0],
      shape: this.config.shape,
    };
    if (burst) {
      p.vx = rand(-4, 4);
      p.vy = rand(-4, 4);
    }
    this.particles.push(p);
    if (this.particles.length > this.config.maxParticles) this.particles.shift();
  }

  seed() { while (this.particles.length < this.config.maxParticles * 0.6) this.spawn(); }

  explode(x, y) { for (let i = 0; i < 36; i += 1) this.spawn(x, y, true); }
  gather(x, y) { this.particles.forEach((p) => { p.vx += (x - p.x) * 0.002; p.vy += (y - p.y) * 0.002; }); }

  input(pointer) {
    this.mouse = { ...this.mouse, ...pointer };
  }

  update() {
    const g = 0.008;
    for (let i = 0; i < this.config.spawnRate; i += 1) this.spawn();
    this.particles.forEach((p) => {
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < this.config.attractRadius) {
        const power = (1 - dist / this.config.attractRadius) * this.config.interactionStrength;
        const dir = this.mouse.mode === 'repel' ? -1 : 1;
        p.ax += (dx / dist) * power * 0.04 * dir;
        p.ay += (dy / dist) * power * 0.04 * dir;
      }
      p.ax += this.flow.x * 0.02;
      p.ay += this.flow.y * 0.02 + g;
      p.vx += p.ax;
      p.vy += p.ay;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      p.ax = 0;
      p.ay = 0;
      if (p.x < 0 || p.x > this.bounds.w) p.vx *= -0.92;
      if (p.y < 0 || p.y > this.bounds.h) p.vy *= -0.92;
      p.x = Math.max(0, Math.min(this.bounds.w, p.x));
      p.y = Math.max(0, Math.min(this.bounds.h, p.y));
      p.age += 1;
      if (p.age > p.life) {
        p.age = 0;
        p.x = rand(0, this.bounds.w);
        p.y = rand(0, this.bounds.h);
      }
    });
  }

  drawShape(p) {
    const { ctx } = this;
    const s = p.size;
    ctx.beginPath();
    if (p.shape === 'rounded') {
      ctx.roundRect(p.x - s, p.y - s, s * 2, s * 2, s * 0.55);
    } else if (p.shape === 'triangle') {
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s, p.y + s);
      ctx.lineTo(p.x - s, p.y + s);
      ctx.closePath();
    } else if (p.shape === 'star') {
      for (let i = 0; i < 5; i += 1) {
        const a = i * ((Math.PI * 2) / 5) - Math.PI / 2;
        const r = i % 2 ? s * 0.5 : s;
        ctx.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
      }
      ctx.closePath();
    } else if (p.shape === 'heart') {
      ctx.moveTo(p.x, p.y + s * 0.2);
      ctx.bezierCurveTo(p.x + s, p.y - s, p.x + s * 1.8, p.y + s * 0.8, p.x, p.y + s * 1.8);
      ctx.bezierCurveTo(p.x - s * 1.8, p.y + s * 0.8, p.x - s, p.y - s, p.x, p.y + s * 0.2);
    } else {
      ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  render() {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.bounds.w, this.bounds.h);
    ctx.globalAlpha = this.config.opacity;
    this.particles.forEach((p, idx) => {
      ctx.fillStyle = p.color;
      this.drawShape(p);
      for (let j = idx + 1; j < this.particles.length; j += 10) {
        const q = this.particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < this.config.linkDistance) {
          ctx.strokeStyle = `${p.color}33`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    });
  }
}
