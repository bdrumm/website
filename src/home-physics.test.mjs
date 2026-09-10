import test from 'node:test';
import assert from 'node:assert/strict';
import { stepSpace } from './home-physics.js';

const bounds = { x: 8, y: 5, drift: .6 };
const body = (x, y, vx = 0) => ({ x, y, vx, vy: 0, homeX: x, homeY: y, radius: 1,
  extentX: 1.4, extentY: 1.3, held: false });

test('colliding objects separate and transfer momentum', () => {
  const a = body(-.8, 0, 2), b = body(.8, 0, -2);
  stepSpace([a, b], 1 / 60, 0, bounds);
  assert.ok(Math.hypot(b.x - a.x, b.y - a.y) >= 2 - 1e-8);
  assert.ok(a.vx < 0 && b.vx > 0);
});

test('a dragged object pushes its neighbour without being displaced', () => {
  const a = body(0, 0, 2), b = body(.5, 0);
  a.held = true;
  stepSpace([a, b], 1 / 60, 0, bounds);
  assert.equal(a.x, 0);
  assert.equal(a.y, 0);
  assert.ok(Math.hypot(b.x, b.y) >= 2 - 1e-8);
  assert.ok(b.vx > 0);
});

test('coincident objects separate without producing invalid positions', () => {
  const a = body(0, 0), b = body(0, 0);
  stepSpace([a, b], 0, 0, bounds);
  assert.equal(b.x - a.x, 2);
  assert.ok([a.x, a.y, b.x, b.y].every(Number.isFinite));
});

test('objects stay in view during sustained pointer interactions on narrow screens', () => {
  const mobile = { x: 4, y: 6.4, drift: .25 };
  const objects = [body(-2, 3), body(2, 3), body(-2, -3), body(2, -3)];
  for (let frame = 0; frame < 3600; frame++) {
    stepSpace(objects, frame === 300 ? 5 : 1 / 60, frame / 60, mobile,
      { active: true, x: Math.sin(frame / 60) * 3, y: Math.cos(frame / 60) * 4 });
    for (const item of objects) {
      assert.ok(Number.isFinite(item.x) && Number.isFinite(item.y));
      assert.ok(Math.abs(item.x) <= mobile.x - item.extentX + 1e-8);
      assert.ok(Math.abs(item.y) <= mobile.y - item.extentY + 1e-8);
    }
  }
});
