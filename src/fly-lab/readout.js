const clickActions = (decoder) =>
  (decoder.actions || []).filter((a) => ["click", "forward"].includes(a.name));
export function websiteClickWeight(decoder) {
  const action = clickActions(decoder)[0];
  return action ? (action.task_weights?.website ?? action.weight ?? 1) : null;
}
export function setWebsiteClickWeight(decoder, weight) {
  if (!Number.isFinite(weight) || weight < 0.1 || weight > 20)
    throw new Error("Click weight must be between 0.1 and 20.");
  const result = structuredClone(decoder),
    actions = clickActions(result);
  if (actions.length !== 1)
    throw new Error(
      "Configure exactly one click / forward readout before adjusting its weight.",
    );
  actions[0].task_weights = { ...actions[0].task_weights, website: weight };
  return result;
}
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const number = (n) => (Number.isFinite(n) ? n.toFixed(1) : "—");
export function rateBarsMarkup(neural, fallbackActions, label = (s) => s) {
  const rates =
    neural?.rates_hz ||
    Object.fromEntries(fallbackActions.map((a) => [a.name, 0]));
  const maxRate = Math.max(20, ...Object.values(rates));
  return Object.entries(rates)
    .map(([name, rate]) => {
      const weight = neural?.action_weights?.[name] ?? 1;
      const score = neural?.selection_scores?.[name] ?? rate;
      return `<div class="rate-bar ${neural?.action === name ? "winner" : ""}"><div><span>${escape(label(name))}</span><strong>${number(rate)} Hz</strong></div><div class="bar-track"><i style="width:${Math.max(0, Math.min(100, (rate / maxRate) * 100))}%"></i></div><small class="rate-score">×${number(weight)} weight · ${number(score)} selection score</small></div>`;
    })
    .join("");
}
