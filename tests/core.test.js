import test from 'node:test';
import assert from 'node:assert/strict';
import { adaptiveCount, physicsStep } from '../js/core.js';

test('adaptive count scales by device class', () => {
  assert.equal(adaptiveCount('low', 1000), 450);
  assert.equal(adaptiveCount('mid', 1000), 750);
  assert.equal(adaptiveCount('high', 1000), 1000);
});

test('physics step applies gravity and decay', () => {
  const p = { x: 1, y: 1, vx: 0, vy: 0, life: 1 };
  const alive = physicsStep(p, { gravity: 0.1, velocity: 1, collision: false, w: 10, h: 10, decay: 0.5 }, 1);
  assert.equal(alive, true);
  assert.ok(p.vy > 0);
  assert.equal(p.life, 0.5);
});
