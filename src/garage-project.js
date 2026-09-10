const layouts = [
  { id: 'garage', name: 'Single garage', number: '01', modules: '1 module', image: 'simple-garage-studio.jpg', thumbnail: 'simple-garage-thumbnail.jpg', copy: 'A rolling door, a folding roof, and a fully equipped workshop.' },
  { id: 'row', name: 'Side by side', number: '02', modules: '3 modules', image: 'simple-row-studio.jpg', thumbnail: 'simple-row-studio.jpg', copy: 'Garage, kitchen, and dining arranged along one street.' },
  { id: 'stack', name: 'Stacked', number: '03', modules: '3 modules', image: 'simple-stack-studio.jpg', thumbnail: 'simple-stack-studio.jpg', copy: 'The same three modules arranged on a smaller footprint.' },
];
const presets = {
  closed: { door: 0, roof: 0, explode: 0 },
  door: { door: 100, roof: 0, explode: 0 },
  roof: { door: 100, roof: 100, explode: 0 },
  exploded: { door: 45, roof: 0, explode: 100 },
};

export function buildGarageProject(container, project) {
  const experience = document.createElement('section');
  experience.className = 'garage-experience';
  experience.setAttribute('aria-label', 'Modular garage configurations and animation');
  experience.innerHTML = `
    <div class="garage-workbench">
      <section class="garage-stage" aria-label="Garage model viewer">
        <div class="garage-canvas"></div>
        <img class="garage-poster" src="assets/garage/simple-row-studio.jpg" width="1600" height="1100" alt="Garage, kitchen, and dining modules arranged side by side in a studio render.">
        <div class="garage-stage-top"><span class="section-number" data-view-label>INTERACTIVE 3D</span><div class="garage-view-mode" role="group" aria-label="Viewing mode"><button type="button" data-view="3d" aria-pressed="true">3D view</button><button type="button" data-view="studio" aria-pressed="false">Studio</button></div></div>
        <p class="garage-load-status" role="status" aria-live="polite">Preparing interactive model…</p>
        <div class="garage-stage-bottom"><div class="garage-caption"><span class="section-number" data-figure>FIG. 02</span><strong data-layout-name>Side by side</strong><span data-view-hint>Drag to orbit · Scroll to move the page</span></div><div class="garage-camera-controls"><button type="button" data-reset-camera aria-label="Reset camera" title="Reset camera">↺</button><button type="button" data-fullscreen aria-label="Expand viewer" title="Expand viewer">⛶</button></div></div>
      </section>
      <aside class="garage-controls" aria-label="Garage controls">
        <div class="garage-controls-title"><h2>Make it yours</h2><span class="section-number">01—03</span></div>
        <fieldset class="garage-control-section garage-layouts"><legend><span>01</span> Configuration</legend>
          ${layouts.map(l => `<label class="garage-layout-option"><input type="radio" name="garage-layout" value="${l.id}"${l.id === 'row' ? ' checked' : ''}><span class="garage-layout-number">${l.number}</span><span><strong>${l.name}</strong><small>${l.modules}</small></span></label>`).join('')}
        </fieldset>
        <fieldset class="garage-control-section"><legend><span>02</span> In motion</legend>
          <div class="garage-presets" role="group" aria-label="Model state"><button type="button" data-preset="closed" aria-pressed="false" disabled>Closed</button><button type="button" data-preset="door" aria-pressed="false" disabled>Door open</button><button type="button" data-preset="roof" aria-pressed="false" disabled>Roof open</button><button type="button" data-preset="exploded" aria-pressed="false" disabled>Exploded</button></div>
          <div class="garage-range"><div><label for="garage-door">Rolling door</label><output for="garage-door" data-door-value>45%</output></div><input id="garage-door" type="range" min="0" max="100" step="1" value="45" disabled><div class="garage-range-ends"><span>Closed</span><span>Open</span></div></div>
          <div class="garage-range"><div><label for="garage-roof">Folding roof</label><output for="garage-roof" data-roof-value>0%</output></div><input id="garage-roof" type="range" min="0" max="100" step="1" value="0" disabled></div>
          <p class="garage-stack-note" hidden>Roofs stay closed in the stacked view.</p>
          <button type="button" class="garage-play" aria-pressed="false" disabled><span data-play-label>▶ Play the sequence</span><small>16 s</small></button>
        </fieldset>
        <div class="garage-control-section garage-control-footer"><label class="garage-orbit"><span>Orbit automatically</span><input type="checkbox" data-orbit disabled></label><button type="button" class="garage-reset" data-reset-all>↺ Reset all</button></div>
      </aside>
    </div>
    <dl class="garage-facts"><div><dt>MODULE FOOTPRINT</dt><dd>200 × 240 <small>mm</small></dd></div><div><dt>STACK PITCH</dt><dd>128 <small>mm</small></dd></div><div><dt>ROLLING DOOR</dt><dd>12 <small>articulated slats</small></dd></div><div><dt>SOURCE</dt><dd>Original <small>Blender geometry</small></dd></div></dl>
    <section class="garage-configurations" aria-labelledby="garage-config-title"><div class="garage-section-heading"><div><span class="section-number">THE MODULAR SYSTEM</span><h2 id="garage-config-title">Build out. Stack up.</h2></div><p>The garage, kitchen, and dining modules share a common footprint. Explore how the original parts come together.</p></div><div class="garage-config-grid">
      ${layouts.map(l => `<button type="button" class="garage-config-card" data-configuration="${l.id}" aria-pressed="${l.id === 'row'}"><div class="garage-card-visual"><img src="assets/garage/${l.thumbnail}" width="720" height="540" alt="${l.name} configuration, rendered from the original model." loading="lazy"><span class="garage-card-number">${l.number}</span><span class="garage-card-arrow" aria-hidden="true">↗</span></div><div class="garage-card-copy"><h3>${l.name}</h3><p>${l.copy}</p></div></button>`).join('')}
    </div></section>
    <section class="garage-about" aria-labelledby="garage-about-title"><div><span class="section-number">PRINT STUDY / 003</span><h2 id="garage-about-title">A garage with room to grow.</h2><div data-project-description></div></div><div class="garage-source-note"><h3>From the original model</h3><p>Nominal module footprint: 200 × 240 mm. The closed garage exterior is 200 × 261.7 × 132.6 mm, including its handle and roof hinges.</p><p>Stacking uses the source’s 128 mm pitch. Configurations are visualization studies; physical fit has not been tested.</p><a class="secondary-button" data-model-download>Download display model ↗</a><p class="muted">Display geometry in GLB format. Not a sliced print file.</p></div></section>
  `;
  container.append(experience);
  const q = selector => experience.querySelector(selector);
  const qa = selector => [...experience.querySelectorAll(selector)];
  for (const paragraph of project.description || []) {
    const text = document.createElement('p'); text.textContent = paragraph; q('[data-project-description]').append(text);
  }
  q('[data-model-download]').href = project.modelUrl;
  const stage = q('.garage-stage');
  const canvas = q('.garage-canvas');
  const poster = q('.garage-poster');
  const status = q('.garage-load-status');
  const doorInput = q('#garage-door');
  const roofInput = q('#garage-roof');
  const playButton = q('.garage-play');
  const orbit = q('[data-orbit]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const initial = () => ({ layout: 'row', door: 45, roof: 0, explode: 0, rotate: false, reset: 0, visible: true });
  let state = initial(), mode = '3d', activePreset = '', ready = false, failed = false, playing = false, configuring = false;
  let disposed = false, scene, tourFrame = 0, tourTime = 0, lastTime = 0, inView = true;
  const intersection = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; });
  intersection.observe(stage);

  function sync() {
    const layout = layouts.find(item => item.id === state.layout);
    const stacked = state.layout === 'stack';
    state.visible = mode === '3d';
    const renderVisible = mode === 'studio' || !ready || failed;
    poster.hidden = !renderVisible;
    canvas.classList.toggle('garage-canvas-hidden', renderVisible);
    const source = `assets/garage/${layout.image}`;
    if (poster.getAttribute('src') !== source) poster.src = source;
    poster.alt = `${layout.name} configuration in a fixed studio pose, rendered from the original model.`;
    q('[data-layout-name]').textContent = layout.name;
    q('label[for="garage-door"]').textContent = state.layout === 'garage' ? 'Rolling door' : 'Rolling + entry doors';
    q('[data-figure]').textContent = `FIG. ${layout.number}`;
    q('[data-view-label]').textContent = mode === 'studio' || failed ? 'STUDIO RENDER' : 'INTERACTIVE 3D';
    q('[data-view-hint]').textContent = mode === 'studio' || failed ? 'Cycles render · fixed studio pose' : 'Drag to orbit · Scroll to move the page';
    qa('[data-view]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.view === mode)); button.disabled = failed && button.dataset.view === '3d'; });
    qa('[name="garage-layout"]').forEach(input => { input.checked = input.value === state.layout; });
    qa('[data-configuration]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.configuration === state.layout)));
    qa('[data-preset]').forEach(button => {
      button.disabled = !ready || failed || configuring || (stacked && ['roof', 'exploded'].includes(button.dataset.preset));
      button.setAttribute('aria-pressed', String(button.dataset.preset === activePreset));
    });
    doorInput.disabled = !ready || failed || configuring;
    roofInput.disabled = !ready || failed || stacked || configuring;
    playButton.disabled = !ready || failed || stacked || configuring;
    playButton.setAttribute('aria-pressed', String(playing));
    q('[data-play-label]').textContent = playing ? 'Ⅱ Pause animation' : '▶ Play the sequence';
    orbit.disabled = !ready || failed || configuring || mode === 'studio'; orbit.checked = state.rotate;
    q('.garage-stack-note').hidden = !stacked;
    q('[data-reset-camera]').disabled = !ready || failed || mode === 'studio';
    syncRanges();
  }
  function syncRanges() {
    doorInput.value = String(Math.round(state.door)); roofInput.value = String(Math.round(state.roof));
    q('[data-door-value]').textContent = `${Math.round(state.door)}%`; q('[data-roof-value]').textContent = `${Math.round(state.roof)}%`;
  }
  function stopTour() { playing = false; cancelAnimationFrame(tourFrame); }
  function chooseLayout(layout) {
    if (!layouts.some(item => item.id === layout)) return;
    if (state.layout !== layout) { stopTour(); state.door = 0; state.roof = 0; state.explode = 0; activePreset = 'closed'; configuring = ready && !failed; }
    state.layout = layout; state.reset++; mode = failed ? 'studio' : '3d';
    sync();
  }
  function tour(now) {
    if (!playing || disposed) return;
    if (!document.hidden && inView) tourTime += Math.min((now - lastTime) / 1000, .06);
    lastTime = now;
    const phase = tourTime % 16;
    const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
    state.door = 100 * (phase < 10 ? ease(phase / 3) : 1 - ease((phase - 12) / 3));
    state.roof = 100 * (phase < 8 ? ease((phase - 4) / 3) : 1 - ease((phase - 8) / 3));
    state.explode = 0; syncRanges(); tourFrame = requestAnimationFrame(tour);
  }
  qa('[name="garage-layout"]').forEach(input => input.addEventListener('change', () => chooseLayout(input.value)));
  qa('[data-configuration]').forEach(button => button.addEventListener('click', () => { chooseLayout(button.dataset.configuration); stage.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }); }));
  qa('[data-view]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.view; if (mode === 'studio') stopTour(); sync(); }));
  qa('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const preset = presets[button.dataset.preset];
    if (!ready || failed || configuring || !preset || (state.layout === 'stack' && (preset.roof || preset.explode))) return;
    stopTour(); mode = '3d'; activePreset = button.dataset.preset; Object.assign(state, preset); sync();
  }));
  for (const [input, key] of [[doorInput, 'door'], [roofInput, 'roof']]) input.addEventListener('input', () => { stopTour(); mode = '3d'; activePreset = ''; state[key] = Number(input.value); sync(); });
  playButton.addEventListener('click', () => {
    if (!ready || failed || configuring || state.layout === 'stack') return;
    if (playing) stopTour();
    else { playing = true; activePreset = ''; mode = '3d'; tourTime = 0; lastTime = performance.now(); tourFrame = requestAnimationFrame(tour); }
    sync();
  });
  orbit.addEventListener('change', () => { state.rotate = orbit.checked; });
  q('[data-reset-camera]').addEventListener('click', () => { state.reset++; state.rotate = false; sync(); });
  q('[data-reset-all]').addEventListener('click', () => { stopTour(); const reset = state.reset + 1; state = initial(); state.reset = reset; activePreset = ''; mode = failed ? 'studio' : '3d'; sync(); });
  q('[data-fullscreen]').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); }
    catch { status.hidden = false; status.textContent = 'Fullscreen is unavailable in this browser.'; }
  });
  sync();
  import('../assets/garage-viewer.js?v=68e73feecc').then(async ({ createGarageScene }) => {
    if (disposed) return;
    const result = await createGarageScene(canvas, () => state, project.modelUrl, active => { configuring = active; sync(); });
    if (disposed) { result.dispose(); return; }
    scene = result; ready = true; status.textContent = ''; status.hidden = true; sync();
  }).catch(() => { if (disposed) return; failed = true; mode = 'studio'; status.textContent = '3D is unavailable in this browser. You can explore all three studio renders.'; sync(); });
  window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    disposed = true; stopTour(); scene?.dispose(); intersection.disconnect();
  }, { once: true });
  return experience;
}
