const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const names = {
  arena: "Arena",
  bus: "Bus",
  arcade: "Game",
  website: "Website",
};
const number = (n) =>
  Number.isFinite(n) ? `${n > 0 ? "+" : ""}${n.toFixed(2)}` : "—";

export function behaviorMarkup(state, { preview = false, stale = false } = {}) {
  const behavior = state.behavior || {},
    current = behavior.current;
  const terminal =
    ["completed", "stopped", "failed"].includes(state.status) || !state.active;
  const unavailable =
    preview || ["ready", "loading"].includes(state.status) || !current;
  const status = stale
    ? "Connection lost · last received observation"
    : preview
      ? "Scenario preview · no live behavior"
      : unavailable
        ? "Awaiting an observed decision"
        : state.status === "paused"
          ? "Paused · last observed behavior"
          : terminal
            ? `${state.status === "completed" ? "Run complete" : state.status === "failed" ? "Run failed" : "Run stopped"} · last observed behavior`
            : state.frame_kind === "feedback" || state.status === "feedback"
              ? "Reinforcement window · no new action"
              : "Latest observed behavior";
  if (unavailable)
    return `<p class="mind-status">${escape(status)}</p><h4>Waiting for the fly</h4><p class="hint">Behavior summaries appear after a neural action produces an observable outcome.</p>`;
  const learning = behavior.learning || {};
  const window = current.window || {};
  const comparisons = (learning.comparisons || [])
    .map(
      (c) =>
        `<li><strong>${escape(names[c.task] || c.task)}</strong> · ${escape(c.pairs)} matched case(s): collisions ${number(c.collisions)}, food ${number(c.food)}, success ${(Number(c.success) * 100).toFixed(0)} percentage points.</li>`,
    )
    .join("");
  const timeline = (behavior.timeline || [])
    .slice(-8)
    .reverse()
    .map(
      (row) =>
        `<li><span>EP ${escape(row.episode)} · ${escape(names[row.task] || row.task)} · ${escape(row.phase)} · steps ${escape(row.start_step)}${row.end_step !== row.start_step ? `–${escape(row.end_step)}` : ""}</span><strong>${escape(row.label)}</strong></li>`,
    )
    .join("");
  const terms =
    Object.entries(current.reward_terms || {})
      .filter(([, value]) => value !== 0)
      .map(([key, value]) => `${key.replaceAll("_", " ")} ${number(value)}`)
      .join(" · ") || "No reward components";
  return `<p class="mind-status">${escape(status)}</p>
    <h4>${escape(current.label)}</h4><p class="mind-summary">${escape(current.summary)}</p>
    <p class="mind-time">${escape(names[current.task] || current.task)} · episode ${escape(current.episode)} · step ${escape(current.step)} · ${escape(current.phase)} · ${current.basis === "interpretation" ? "Behavior interpretation" : "Recorded outcome"}</p>
    <p class="mind-learning">${escape(learning.mode || "Learning state unavailable")} · ${learning.weight_change_observed ? "Synaptic change observed" : "No weight change established"}</p>
    <ul class="mind-evidence">${(current.evidence || []).map((e) => `<li>${escape(e)}</li>`).join("")}</ul>
    <div class="mind-window">Last ${escape(window.decisions || 1)} decisions <strong>${escape(window.novel_decisions || 0)} new-area visits · ${escape(window.collision_decisions || 0)} collisions · ${escape(window.food_collected || 0)} food</strong></div>
    <details><summary>Learning &amp; reward evidence</summary>
      <p>${escape(learning.mode || "Learning state unavailable")}</p><p>${escape(learning.memory || "Memory comparison unavailable")}</p>
      <p>Outcome reward ${number(current.reward_received)}. Feedback delivered to this neural decision ${number(current.reward_delivered)} (previous outcome plus any manual input).</p>
      <p class="hint">${escape(terms)}</p>${comparisons ? `<ul class="mind-comparisons">${comparisons}</ul>` : ""}<p class="hint">${escape(learning.comparison_note)}</p>
      <p class="hint">${escape(learning.limitation)}</p>
    </details>
    <details><summary>Recent behavior timeline</summary><ol class="mind-timeline">${timeline}</ol><p class="hint">Latest observed segments; the complete decision summaries are saved with the run. This observation window is not the fly’s memory.</p></details>
    <details><summary>Scenario goal</summary><p>${escape(current.goal)}</p><p class="hint">The configured goal supplies context; it does not establish intention.</p></details>`;
}

let previousMarkup;
export function renderBehavior(state, options) {
  const element = document.getElementById("mind-content");
  if (!element) return;
  const markup = behaviorMarkup(state, options);
  if (markup === previousMarkup) return;
  const expanded = [...element.querySelectorAll("details")].map(
    (detail) => detail.open,
  );
  element.innerHTML = markup;
  element.querySelectorAll("details").forEach((detail, i) => {
    detail.open = expanded[i] || false;
  });
  previousMarkup = markup;
}
