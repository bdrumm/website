// Module coordinates stay in source millimetres. The system root never recentres.
export const CONFIGURATION_TIMING = Object.freeze({ prepare: .18, lift: .18, across: .25, depth: .18, drop: .14, bounce: .22, gap: .025 });
export const EXPLODED_ROW_PITCH = 400;
export function rowExplosionOffset(index, amount) { return (index - 1) * (EXPLODED_ROW_PITCH - 200) * Math.max(0, Math.min(1, amount)); }
export function explodedRowView(aspect) {
  const fit = Math.max(1, 1.3 / Math.max(.1, aspect));
  return {target: [0, 1.1, 0], camera: [.75 * fit, 1.1 + 6 * fit, 18 * fit]};
}
const layouts = new Set(['garage', 'row', 'stack']);
const parked = index => [650 + (index - 1) * 250, 0, 0];
const targetFor = (layout, index, pitch) => index === 0 ? [0, 0, 0] : layout === 'garage' ? parked(index) : layout === 'row' ? [index * 200, 0, 0] : [0, index * pitch, 0];
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const samePosition = (a, b) => a.every((value, axis) => Math.abs(value - b[axis]) < .001);

export function planConfiguration(snapshot, layout, { pitch = 128 } = {}) {
  if (!layouts.has(layout)) throw new Error('Unknown garage configuration.');
  const destinations = snapshot.map((_, index) => targetFor(layout, index, pitch));
  const candidates = snapshot.map((unit, index) => ({ index, from: unit.position.slice(), to: destinations[index], wasVisible: unit.visible, visible: layout !== 'garage' || index === 0 })).filter(move => move.index !== 0 && (move.wasVisible || move.visible) && !samePosition(move.from, move.to));
  // Clear the top of a stack first; assemble a new stack from its base upward.
  candidates.sort((a, b) => layout === 'stack' ? a.to[1] - b.to[1] : b.from[1] - a.from[1] || b.index - a.index);
  const settled = snapshot.map(unit => ({ position: unit.position.slice(), visible: unit.visible }));
  let cursor = CONFIGURATION_TIMING.prepare;
  const moves = candidates.map(move => {
    const from = move.wasVisible ? move.from : parked(move.index);
    const pathMin = Math.min(from[0], move.to[0]);
    const pathMax = Math.max(from[0], move.to[0]);
    const obstacles = settled.filter((unit, index) => index !== move.index && unit.visible && unit.position[0] + 200 > pathMin && unit.position[0] < pathMax + 200);
    const obstacleTop = Math.max(0, ...obstacles.map(unit => unit.position[1] + 133));
    const cruise = Math.max(from[1] + 46, move.to[1] + 46, obstacleTop + 44);
    const acrossTime = Math.abs(from[0] - move.to[0]) > .001 ? CONFIGURATION_TIMING.across : 0;
    const depthTime = Math.abs(from[2] - move.to[2]) > .001 ? CONFIGURATION_TIMING.depth : 0;
    const duration = CONFIGURATION_TIMING.lift + acrossTime + depthTime + CONFIGURATION_TIMING.drop + CONFIGURATION_TIMING.bounce;
    const planned = { ...move, from, cruise, acrossTime, depthTime, start: cursor, duration };
    cursor += duration + CONFIGURATION_TIMING.gap;
    settled[move.index] = { position: move.to.slice(), visible: move.visible };
    return planned;
  });
  return { layout, destinations, moves, duration: moves.length ? cursor - CONFIGURATION_TIMING.gap : 0 };
}

export function sampleModuleMove(move, elapsed) {
  let time = elapsed - move.start;
  if (time <= 0) return { position: move.from.slice(), phase: 'waiting', done: false };
  const { lift, drop, bounce } = CONFIGURATION_TIMING;
  if (time < lift) return { position: [move.from[0], lerp(move.from[1], move.cruise, ease(time / lift)), move.from[2]], phase: 'lift', done: false };
  time -= lift;
  if (time < move.acrossTime) return { position: [lerp(move.from[0], move.to[0], ease(time / move.acrossTime)), move.cruise, move.from[2]], phase: 'across', done: false };
  time -= move.acrossTime;
  if (time < move.depthTime) return { position: [move.to[0], move.cruise, lerp(move.from[2], move.to[2], ease(time / move.depthTime))], phase: 'depth', done: false };
  time -= move.depthTime;
  if (time < drop) return { position: [move.to[0], lerp(move.cruise, move.to[1], Math.pow(time / drop, 2)), move.to[2]], phase: 'drop', done: false };
  time -= drop;
  if (time < bounce) {
    const progress = time / bounce;
    const rebound = 16 * Math.pow(1 - progress, 2) * Math.abs(Math.sin(Math.PI * 2 * progress));
    return { position: [move.to[0], move.to[1] + rebound, move.to[2]], phase: 'bounce', done: false };
  }
  return { position: move.to.slice(), phase: 'settled', done: true };
}

export function createConfigurationMotion(units, { pitch = 128, onChange = () => {} } = {}) {
  let layout = '', plan = null, elapsed = 0;
  function settle(destination) {
    units.forEach((unit, index) => { unit.position.fromArray(targetFor(destination, index, pitch)); unit.visible = destination !== 'garage' || index === 0; });
  }
  return {
    get active() { return !!plan; },
    get preparation() { return plan ? Math.min(1, elapsed / CONFIGURATION_TIMING.prepare) : 1; },
    get layout() { return layout; },
    setLayout(destination, reduced = false) {
      if (!layouts.has(destination)) throw new Error('Unknown garage configuration.');
      if (destination === layout) {
        if (reduced && plan) { plan = null; settle(destination); onChange(false); }
        return;
      }
      const initial = layout === '';
      layout = destination;
      if (initial || reduced) { plan = null; settle(destination); onChange(false); return; }
      const snapshot = units.map(unit => ({ position: unit.position.toArray(), visible: unit.visible }));
      plan = planConfiguration(snapshot, destination, { pitch }); elapsed = 0;
      if (!plan.duration) { settle(destination); plan = null; }
      onChange(!!plan);
    },
    update(dt) {
      if (!plan) return;
      elapsed += Math.max(0, dt);
      for (const move of plan.moves) {
        const sample = sampleModuleMove(move, elapsed);
        const unit = units[move.index];
        unit.position.fromArray(sample.position);
        // Arriving modules enter from storage; departing ones remain until their exit ends.
        unit.visible = sample.done ? move.visible : move.wasVisible || elapsed >= move.start;
      }
      if (elapsed >= plan.duration) { settle(plan.layout); plan = null; onChange(false); }
    },
  };
}
