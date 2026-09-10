// A small spring field with collision response, shared by every floating object.
export function stepSpace(bodies, dt, time, bounds, pointer) {
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];
    if (body.held) continue;
    const phase = time * .3 + i * 1.8;
    const targetX = body.homeX + Math.sin(phase) * bounds.drift;
    const targetY = body.homeY + Math.cos(phase * 1.3) * .32;
    body.vx += (targetX - body.x) * 1.4 * dt;
    body.vy += (targetY - body.y) * 1.4 * dt;
    if (pointer?.active) {
      const dx = body.x - pointer.x, dy = body.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > .001 && distance < 2.2) {
        const force = (2.2 - distance) * 3;
        body.vx += dx / distance * force * dt;
        body.vy += dy / distance * force * dt;
      }
    }
    body.vx *= Math.exp(-1.1 * dt);
    body.vy *= Math.exp(-1.1 * dt);
    body.x += body.vx * dt;
    body.y += body.vy * dt;
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i], b = bodies[j];
    const dx = b.x - a.x, dy = b.y - a.y, distance = Math.hypot(dx, dy);
    const contact = a.radius + b.radius;
    if (distance >= contact) continue;
    const nx = distance > .0001 ? dx / distance : 1;
    const ny = distance > .0001 ? dy / distance : 0;
    const weightA = a.held ? 0 : b.held ? 1 : .5, weightB = b.held ? 0 : a.held ? 1 : .5;
    const overlap = contact - distance;
    a.x -= nx * overlap * weightA; a.y -= ny * overlap * weightA;
    b.x += nx * overlap * weightB; b.y += ny * overlap * weightB;
    const speed = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (speed < 0) {
      const impulse = -speed * 1.65;
      a.vx -= impulse * nx * weightA; a.vy -= impulse * ny * weightA;
      b.vx += impulse * nx * weightB; b.vy += impulse * ny * weightB;
    }
  }
  for (const body of bodies) {
    for (const [axis, velocity, limit] of [['x', 'vx', bounds.x - body.extentX], ['y', 'vy', bounds.y - body.extentY]]) {
      if (Math.abs(body[axis]) > limit) {
        body[axis] = Math.sign(body[axis]) * Math.max(0, limit);
        body[velocity] *= -.6;
      }
    }
  }
}
