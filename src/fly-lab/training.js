const $ = (id) => document.getElementById(id);
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const memoryNumber = (value) =>
  Number.isFinite(value) ? value.toFixed(6) : "—";
const number = (value) => (Number.isFinite(value) ? value.toFixed(2) : "—");
const names = {
  arena: "Fly arena",
  bus: "Bus route",
  arcade: "Foraging game",
  website: "Website",
};
export function comparisonMarkup(evaluation) {
  if (!evaluation || evaluation.status === "disabled")
    return '<p class="hint">Enable matched tests to compare the brain before and after practice.</p>';
  const rows = Object.entries(evaluation.by_task || {})
    .map(([task, data]) => {
      const pairs = (evaluation.paired_cases || []).filter(
        (p) => p.task === task && p.controlled && p.initial_state_match,
      );
      const mean = (phase, key) =>
        pairs.reduce((n, p) => n + p[phase][key], 0) / pairs.length;
      return `<tr><td>${escape(names[task] || task)}</td><td>${number(mean("baseline", "success") * 100)}% → ${number(mean("after", "success") * 100)}%</td><td>${number(mean("baseline", "reward"))} → ${number(mean("after", "reward"))}</td><td>${number(data.mean_delta.collisions)}</td></tr>`;
    })
    .join("");
  const tests = (evaluation.evaluation_cases || [])
    .map(
      (c) =>
        `<tr><td>${escape(names[c.task] || c.task)}</td><td>${c.success ? "Goal reached" : "Not reached"}</td><td>${number(c.reward)}</td><td>${number(c.collisions)}</td></tr>`,
    )
    .join("");
  const integrity = evaluation.frozen_integrity_failed
    ? "Memory check failed"
    : evaluation.frozen_integrity_verified
      ? "Frozen memory verified"
      : "Frozen checks pending";
  return `<p class="hint">${escape(evaluation.status)} · ${evaluation.completed_pairs || 0}/${evaluation.planned_pairs || 0} paired cases · ${integrity}</p>${rows || tests ? `<div class="episode-table-wrap"><table><thead><tr><th>Scenario</th><th>${rows ? "Success before → after" : "Result"}</th><th>${rows ? "Reward before → after" : "Reward"}</th><th>${rows ? "Collision change" : "Collisions"}</th></tr></thead><tbody>${rows || tests}</tbody></table></div>` : ""}<p class="hint">${evaluation.controlled_pairs || 0} matched local cases. External websites are recorded separately because their content can change. Repeated static scenes do not establish general skill.</p>`;
}
export function renderTraining(state) {
  const training = state.training,
    checkpoint = state.checkpoint;
  if (!training) return;
  const phase =
    {
      loading: "Preparing",
      baseline: "Baseline test · memory frozen",
      train: training.learning
        ? "Learning through practice"
        : "Practice · memory frozen",
      after: "After-training test · memory frozen",
      evaluate: "Evaluation · memory frozen",
      stop_food: "Food reward after stopping",
    }[training.phase] || training.phase;
  $("training-progress-summary").textContent =
    `${phase} · ${training.completed_training_episodes || 0} training episodes · ${training.training_decisions || 0} learning decisions`;
  const parent = training.parent;
  const before = training.memory_before,
    after = training.memory_after;
  $("training-memory").innerHTML =
    `<p>Starting brain: ${escape(parent?.run_id || "Fresh baseline")}${parent ? ` · verified ${escape(parent.sha256?.slice(0, 12))}` : ""}</p><p>${checkpoint ? `Saved at decision ${checkpoint.tick ?? state.tick} · ${escape(checkpoint.sha256?.slice(0, 12))} · ${escape(checkpoint.saved_at)}` : "Waiting for the first checkpoint"}</p>${before && after ? `<p>Mean synaptic efficacy: ${memoryNumber(before.mean_efficacy)}× → ${memoryNumber(after.mean_efficacy)}× · ${after.sha256 === before.sha256 ? "same" : "changed"} expressed weights. Weight changes alone do not prove improved behavior.</p>` : ""}`;
  $("training-comparison").innerHTML = comparisonMarkup(state.evaluation);
}
