const SHAPES = ['circle', 'rounded', 'triangle', 'star', 'heart', 'emoji'];

export class ParticleEngine {
  constructor(canvas, notify) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.offscreen = document.createElement('canvas');
    this.offCtx = this.offscreen.getContext('2d');
    this.notify = notify;
    this.particles = [];
    this.pointer = { x: 0, y: 0, down: false, speed: 0, mode: 'attract' };
    this.keys = new Set();
    this.touchStart = 0;
    this.dragTrail = [];
    this.config = {
      shape: 'circle', count: 260, size: 4, speed: 1.6, alpha: 0.75,
      attractRadius: 140, linkDistance: 120, spawnRate: 4, bloom: .5,
      blur: .2, glitch: .08, scanline: false, theme: 'cute', fps: 60,
    };
    this.flow = { x: 0, y: 0 };
    this.last = performance.now();
    this.initEvents();
    this.resize();
    this.populate();
  }

  setConfig(next) { Object.assign(this.config, next); }
  getConfig() { return structuredClone(this.config); }

  resize() {
    const { innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window;
    this.canvas.width = w * dpr; this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`; this.canvas.style.height = `${h}px`;
    this.offscreen.width = this.canvas.width; this.offscreen.height = this.canvas.height;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.offCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  populate() {
    this.particles.length = 0;
    const perf = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 6 ? 0.7 : 1;
    const target = Math.round(this.config.count * perf * (window.innerWidth < 700 ? 0.65 : 1));
    for (let i = 0; i < target; i++) this.particles.push(this.makeParticle());
  }

  makeParticle(x = Math.random() * window.innerWidth, y = Math.random() * window.innerHeight) {
    const size = Math.random() * this.config.size + 1;
    return {
      x, y, vx: (Math.random() - .5) * this.config.speed, vy: (Math.random() - .5) * this.config.speed,
      size, life: 0, ttl: 250 + Math.random() * 450, hue: Math.random() * 360, shape: this.config.shape,
      bounce: .88, friction: .992, emoji: ['✨', '⭐', '💖', '😊'][Math.floor(Math.random() * 4)],
    };
  }

  spawnBurst(x, y, amount = 34, energy = 1) {
    for (let i = 0; i < amount; i++) {
      const p = this.makeParticle(x, y);
      const a = (Math.PI * 2 * i) / amount;
      const force = (1 + Math.random() * 3) * energy;
      p.vx += Math.cos(a) * force;
      p.vy += Math.sin(a) * force;
      this.particles.push(p);
    }
    this.notify('burst');
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('pointermove', (e) => {
      const dx = e.clientX - this.pointer.x; const dy = e.clientY - this.pointer.y;
      this.pointer.speed = Math.min(2, Math.hypot(dx, dy) / 20);
      this.pointer.x = e.clientX; this.pointer.y = e.clientY;
      if (this.pointer.down) this.dragTrail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    });
    this.canvas.addEventListener('pointerdown', (e) => { this.pointer.down = true; this.pointer.x = e.clientX; this.pointer.y = e.clientY; this.spawnBurst(e.clientX, e.clientY, 24, 1.2); });
    this.canvas.addEventListener('pointerup', () => { this.pointer.down = false; this.dragTrail.length = 0; });
    this.canvas.addEventListener('wheel', (e) => { this.pointer.mode = e.deltaY > 0 ? 'repel' : 'attract'; this.notify(`mode:${this.pointer.mode}`); });
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key);
      if (e.key === ' ') this.spawnBurst(this.pointer.x || innerWidth / 2, this.pointer.y || innerHeight / 2, 60, 1.8);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key));

    this.canvas.addEventListener('touchstart', (e) => {
      this.touchStart = performance.now();
      const t = e.touches[0]; this.pointer.x = t.clientX; this.pointer.y = t.clientY; this.spawnBurst(t.clientX, t.clientY, 20, 1);
    }, { passive: true });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0]; this.pointer.x = t.clientX; this.pointer.y = t.clientY; this.dragTrail.push({x:t.clientX,y:t.clientY,t:performance.now()});
      }
      if (e.touches.length === 2) {
        const [a,b] = e.touches;
        const pinch = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
        this.setConfig({ count: Math.max(80, Math.min(900, pinch * 2)) });
      }
    }, { passive: true });
    this.canvas.addEventListener('touchend', () => {
      const longPress = performance.now() - this.touchStart > 500;
      if (longPress) this.notify('quick-panel');
    });
  }

  step(delta) {
    this.flow.x = (this.keys.has('ArrowRight') - this.keys.has('ArrowLeft')) * 0.03;
    this.flow.y = (this.keys.has('ArrowDown') - this.keys.has('ArrowUp')) * 0.03;
    for (const p of this.particles) {
      p.life += delta;
      const dx = this.pointer.x - p.x; const dy = this.pointer.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < this.config.attractRadius) {
        const pull = (1 - dist / this.config.attractRadius) * 0.5;
        const dir = this.pointer.mode === 'repel' ? -1 : 1;
        p.vx += (dx / dist) * pull * dir;
        p.vy += (dy / dist) * pull * dir;
      }
      if (this.pointer.down && this.dragTrail.length) {
        const trail = this.dragTrail[Math.floor(Math.random() * this.dragTrail.length)];
        p.vx += (trail.x - p.x) * 0.0005;
        p.vy += (trail.y - p.y) * 0.0005;
      }
      p.vx += this.flow.x + Math.sin((p.life + p.hue) * 0.002) * 0.003;
      p.vy += this.flow.y + 0.01;
      p.vx *= p.friction; p.vy *= p.friction;
      p.x += p.vx * delta * 0.08; p.y += p.vy * delta * 0.08;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -p.bounce;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -p.bounce;
      p.x = Math.max(0, Math.min(innerWidth, p.x));
      p.y = Math.max(0, Math.min(innerHeight, p.y));
      if (p.life > p.ttl) Object.assign(p, this.makeParticle());
    }

    if (this.pointer.down && Math.random() < this.config.spawnRate / 60) {
      this.particles.push(this.makeParticle(this.pointer.x, this.pointer.y));
    }
    if (this.particles.length > this.config.count * 1.4) this.particles.splice(0, this.particles.length - this.config.count);
  }

  drawShape(ctx, p) {
    const s = p.size;
    switch (p.shape) {
      case 'rounded':
        ctx.beginPath(); ctx.roundRect(p.x - s, p.y - s, s * 2, s * 2, s * 0.5); ctx.fill(); break;
      case 'triangle':
        ctx.beginPath(); ctx.moveTo(p.x, p.y - s); ctx.lineTo(p.x + s, p.y + s); ctx.lineTo(p.x - s, p.y + s); ctx.closePath(); ctx.fill(); break;
      case 'star': {
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? s * .45 : s;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          const px = p.x + Math.cos(a) * r; const py = p.y + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.fill(); break;
      }
      case 'heart':
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + s * .4);
        ctx.bezierCurveTo(p.x - s * 1.2, p.y - s * .5, p.x - s * .8, p.y - s * 1.4, p.x, p.y - s * .4);
        ctx.bezierCurveTo(p.x + s * .8, p.y - s * 1.4, p.x + s * 1.2, p.y - s * .5, p.x, p.y + s * .4);
        ctx.fill();
        break;
      case 'emoji':
        ctx.font = `${s * 2}px serif`; ctx.fillText(p.emoji, p.x - s, p.y + s); break;
      default:
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, Math.PI * 2); ctx.fill();
    }
  }

  render() {
    const ctx = this.offCtx;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.save();
    ctx.filter = `blur(${this.config.blur * 7}px)`;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const hue = (p.hue + p.life * 0.05) % 360;
      ctx.fillStyle = `hsla(${hue},95%,70%,${this.config.alpha})`;
      if (this.config.bloom) {
        ctx.shadowBlur = 16 * this.config.bloom + this.pointer.speed * 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.9)`;
      }
      p.shape = this.config.shape;
      this.drawShape(ctx, p);

      for (let j = i + 1; j < i + 8 && j < this.particles.length; j++) {
        const q = this.particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < this.config.linkDistance) {
          ctx.strokeStyle = `hsla(${hue},95%,75%,${(1 - d / this.config.linkDistance) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    if (this.config.scanline) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      for (let y = 0; y < innerHeight; y += 4) ctx.fillRect(0, y, innerWidth, 1);
    }
    ctx.restore();
    this.ctx.clearRect(0, 0, innerWidth, innerHeight);
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.drawImage(this.offscreen, 0, 0, innerWidth, innerHeight);
    if (this.config.glitch > 0.02 && Math.random() < this.config.glitch * 0.3) {
      const y = Math.random() * innerHeight;
      this.ctx.drawImage(this.offscreen, 0, y, innerWidth, 8, Math.random() * 8, y + Math.random() * 4, innerWidth, 8);
    }
    this.ctx.globalCompositeOperation = 'source-over';
  }

  start(onFrame) {
    const loop = (now) => {
      const frameMs = this.config.fps === 30 ? 33 : 16;
      const delta = now - this.last;
      if (delta >= frameMs) {
        this.last = now;
        this.step(delta);
        this.render();
        onFrame?.({ pointerSpeed: this.pointer.speed, particleCount: this.particles.length });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  static getShapes() { return SHAPES; }
}
