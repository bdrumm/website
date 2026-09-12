const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const fixed = (n, digits = 2) => (Number.isFinite(n) ? n.toFixed(digits) : "—");
const signed = (n) => `${n > 0 ? "+" : ""}${fixed(n)}`;

export function internalMarkup(state, { preview = false, stale = false } = {}) {
  if (preview) return "";
  const context = state.assay?.last_internal_state || state.internal_state,
    signals = state.neural?.internal;
  if (!context)
    return '<p class="hint">This recording predates the internal-state model. Enable it under Training for the next run.</p>';
  if (!context.settings?.enabled && !signals?.enabled)
    return '<p class="hint">Hunger input is disabled for this run.</p>';
  const body = context.body,
    active = state.active && state.status === "running" && !stale;
  const label = stale
    ? "Last received internal state · disconnected"
    : state.assay
      ? state.active
        ? "Controlled assay condition"
        : "Last recorded assay condition"
      : active
        ? "Modeled internal state"
        : state.active
          ? "Internal state · no new completed window"
          : "Saved body state";
  const input = signals
    ? `<p class="internal-chain">Input hunger ${fixed(signals.hunger * 100, 1)}% → MBON11 current ${fixed(signals.applied_current)} → measured MBON11 ${fixed(signals.pools?.MBON11?.mean_hz)} Hz</p><p class="hint">${fixed(signals.duration_ms, 0)} ms neural window · ${escape(signals.current_units)} · ${signals.enabled ? "input enabled" : "input disabled"}</p>`
    : '<p class="hint">Awaiting a neural window with the internal-state input.</p>';
  const pools = Object.entries(signals?.pools || {})
    .map(
      ([name, pool]) =>
        `<tr><th>${escape(name)}<small>${escape((pool.ids || []).join(", "))}</small></th><td>${fixed(pool.mean_hz)}</td><td>${escape((pool.end_voltage_mv || []).map((v) => fixed(v, 1)).join(" / "))}</td></tr>`,
    )
    .join("");
  return `<div class="internal-state"><p class="mind-status">${escape(label)}</p><div class="internal-reserve"><span>Energy reserve <strong>${fixed(body.energy * 100, 1)}%</strong></span><progress max="1" value="${Math.max(0, Math.min(1, body.energy))}" aria-label="Modeled energy reserve"></progress></div>${input}<details><summary>Internal-state evidence</summary><p>Reserve change ${signed(body.last_change?.energy_delta)} · food events ${escape(body.last_change?.food_delta)} · ${fixed(body.simulated_seconds, 2)} simulated seconds.</p><p class="hint">${escape(context.source)}. Reserve is updated after each completed window; the input above records the reserve used at its start.</p>${pools ? `<div class="episode-table-wrap"><table><thead><tr><th>Measured cells</th><th>Hz</th><th>End mV</th></tr></thead><tbody>${pools}</tbody></table></div>` : ""}<p class="hint">The hunger input is an engineered excitability bias. Reserve units, metabolic rates and input amplitude are uncalibrated. These signals do not establish intention or subjective experience.</p></details></div>`;
}

export function assayMarkup(assay) {
  if (!assay)
    return '<p class="hint">Run the controlled cue assay under Training to compare neural responses before and after conditioning at fixed hunger levels.</p>';
  const report = assay.report || {},
    valid = report.comparison_valid,
    c = assay.case;
  const heading = c
    ? `Cue ${c.cue} · ${c.branch.replaceAll("_", " ")} · ${c.stage} · reserve ${fixed(c.energy * 100, 0)}%`
    : "Preparing controlled cues";
  const effects = (report.energy_effects || [])
    .filter((e) => e.phase === "baseline")
    .map(
      (e) =>
        `<tr><th>Cue ${escape(e.cue)}</th><td>${signed(e.hungry_minus_sated_hz.pools_hz.MBON11)}</td><td>${signed(e.hungry_minus_sated_hz.pools_hz.MBON07)}</td><td>${signed((report.energy_voltage_effects || []).find((v) => v.cue === e.cue)?.MBON11_hungry_minus_sated_mv)}</td></tr>`,
    )
    .join("");
  const interactions = (report.reward_assignment_interactions || [])
    .map(
      (e) =>
        `<tr><th>${fixed(e.energy * 100, 0)}% reserve</th><td>${signed(e.interaction_hz.pools_hz.MBON11)}</td><td>${signed(e.interaction_hz.pools_hz.MBON07)}</td></tr>`,
    )
    .join("");
  return `<p>${escape(heading)}</p><p class="hint">${escape(assay.observed || 0)}/${escape(assay.windows || report.planned_cases || 48)} measured windows · ${valid ? "Comparison integrity verified" : "Comparison pending or incomplete"}</p>${(report.errors || []).map((error) => `<p class="assay-error">${escape(error)}</p>`).join("")}${valid ? `<p>${report.response_change_observed ? "Conditioning changed at least one measured cue response." : "No cue-response rate change was detected in this assay."} This does not establish a useful learned behavior.</p>` : ""}${valid && effects ? `<h4>Hunger input effect before conditioning</h4><p class="hint">Mean rate at 20% reserve minus 90% reserve, on the same starting brain.</p><div class="episode-table-wrap"><table><thead><tr><th>Input</th><th>MBON11 ΔHz</th><th>MBON07 ΔHz</th><th>MBON11 ΔmV</th></tr></thead><tbody>${effects}</tbody></table></div>` : ""}${valid && interactions ? `<h4>Effect of reversing the rewarded cue</h4><p class="hint">Change in the A−B response contrast: reward-A branch minus reward-B branch. Zero means no differential rate response detected.</p><div class="episode-table-wrap"><table><thead><tr><th>Condition</th><th>MBON11 ΔHz</th><th>MBON07 ΔHz</th></tr></thead><tbody>${interactions}</tbody></table></div>` : ""}<p class="hint">Two visual patterns with equal average brightness; opposite reward assignments start from the same saved memory. Every probe resets neural transients, freezes memory and supplies no reward pulse. Repeated deterministic probes are not independent trials. Readouts are measured without executing body actions.</p><p class="hint">Results and both conditioned branches are saved separately. Your continuing training checkpoint is preserved. Export run includes this report.</p>`;
}

function update(id, markup) {
  const element = document.getElementById(id);
  if (!element || element.dataset.markup === markup) return;
  const opened = [...element.querySelectorAll("details")].map((e) => e.open);
  element.innerHTML = markup;
  element.dataset.markup = markup;
  element
    .querySelectorAll("details")
    .forEach((e, i) => (e.open = opened[i] || false));
}
export function renderInternal(state, options) {
  update("internal-content", internalMarkup(state, options));
  update("assay-results", assayMarkup(state.assay));
}
