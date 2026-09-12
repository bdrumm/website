const $ = (id) => document.getElementById(id);
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const names = {
  start: "Opened website",
  click: "Click",
  back: "Back",
  scroll_up: "Scroll up",
  scroll_down: "Scroll down",
  focus_previous: "Previous control",
  focus_next: "Next control",
  rest: "Wait",
};

export function journeyRows(rows, filter = "actions") {
  return rows
    .filter(
      (row) =>
        filter === "all" ||
        row.action === "start" ||
        row.navigation_observed ||
        row.between_actions ||
        (filter === "actions" &&
          !["rest", "focus_previous", "focus_next"].includes(row.action)),
    )
    .slice(-100);
}

export function journeyMarkup(row) {
  const from = row.from?.url,
    to = row.to?.url;
  const between = row.between_actions
    ? `<span class="journey-result">Page changed between actions: ${escape(row.between_actions.from?.url)} → ${escape(row.between_actions.to?.url)}</span>`
    : "";
  const changed = !!row.navigation_observed;
  const status = ["blocked", "failed", "restrained"].includes(row.status)
    ? "blocked"
    : changed
      ? "visited"
      : "neutral";
  const reward = Number.isFinite(row.reward)
    ? `${row.reward > 0 ? "+" : ""}${row.reward.toFixed(3)}`
    : "—";
  const destination =
    row.requested_destination && row.requested_destination !== to
      ? `<span class="journey-request">Requested: ${escape(row.requested_destination)}</span>`
      : "";
  const url =
    changed && from
      ? `<span class="journey-from">${escape(from)}</span><span class="journey-to">→ ${escape(to)}</span>`
      : `<span class="journey-to">${escape(to || "Destination not recorded")}</span>`;
  const scroll = row.scroll
    ? ` · ${Math.round(row.scroll.y)} px in ${row.scroll.container}`
    : "";
  const target =
    row.action !== "start" && row.target?.label ? ` · ${row.target.label}` : "";
  return `<li class="journey-row">
    <div class="journey-step"><span>EP ${escape(row.episode)}</span><strong>${row.action === "start" ? "Start" : `#${escape(row.step)}`}</strong></div>
    <div class="journey-detail"><div class="journey-row-heading"><strong>${escape(names[row.action] || row.action)}${escape(target)}</strong><span class="journey-status ${status}">${escape(changed ? `Page changed${status === "blocked" ? ` · ${row.status}` : ""}` : row.status)}</span></div>
      ${between}${row.to?.title ? `<span class="journey-title">${escape(row.to.title)}</span>` : ""}<div class="journey-url">${url}${destination}</div>
      <span class="journey-result">${escape(row.message)}${escape(scroll)}${row.legacy ? " · from saved observations" : ""}</span>
      ${row.requested_action && row.effective_action !== row.requested_action ? `<span class="journey-result">Requested ${escape(row.requested_action)} · executed ${escape(row.effective_action)}</span>` : ""}
    </div><span class="journey-reward ${Number(row.reward) < 0 ? "negative" : ""}" title="Reward received after this action">${reward}</span></li>`;
}

export class JourneyView {
  constructor(api) {
    this.api = api;
    this.saved = null;
    this.state = null;
    this.key = "";
    this.request = 0;
    $("journey-filter").onchange = () => {
      this.key = "";
      this.render(this.state);
    };
    $("journey-run").onchange = async () => {
      const id = $("journey-run").value,
        request = ++this.request;
      this.saved = null;
      this.key = "";
      $("journey-export").hidden = true;
      $("journey-export").href = "";
      $("journey-summary").textContent = "Loading recorded journey…";
      if (!id) {
        this.render(this.state);
        return;
      }
      $("journey-list").innerHTML =
        '<li class="journey-empty">Loading recorded journey…</li>';
      try {
        const result = await this.api(
          `/api/journey?run_id=${encodeURIComponent(id)}`,
        );
        if (request !== this.request) return;
        this.saved = result;
        this.render(this.state);
      } catch (error) {
        if (request === this.request) {
          $("journey-list").innerHTML =
            `<li class="journey-empty">${escape(error.message)}</li>`;
          $("journey-summary").textContent = "Journey unavailable";
        }
      }
    };
  }
  setRuns(runs) {
    const selected = $("journey-run").value;
    $("journey-run").innerHTML =
      '<option value="">Current run</option>' +
      runs
        .filter((r) => ["website", "super"].includes(r.config?.task))
        .map(
          (r) =>
            `<option value="${escape(r.id)}">${escape(r.name)} · ${escape(r.id.slice(8, 23))}</option>`,
        )
        .join("");
    $("journey-run").value = selected;
  }
  render(state) {
    if (!state) return;
    this.state = state;
    const source = this.saved || state;
    const rows = source.journey || [],
      total = source.journey_count || 0;
    $("journey-section").hidden =
      !total &&
      !["website", "super"].includes(state.config?.task) &&
      $("journey-run").options.length <= 1;
    if ($("journey-run").value && !this.saved) return;
    const filter = $("journey-filter").value;
    const key = `${source.run_id}:${total}:${rows.at(-1)?.id}:${filter}`;
    if (key === this.key) return;
    this.key = key;
    const visible = journeyRows(rows, filter);
    const list = $("journey-list"),
      nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 65;
    list.innerHTML = visible.length
      ? visible.map(journeyMarkup).join("")
      : '<li class="journey-empty">No matching actions yet. The fly’s recorded journey appears here as it explores.</li>';
    if (nearBottom) list.scrollTop = list.scrollHeight;
    $("journey-summary").textContent =
      `${total} recorded steps · showing ${visible.length}${total > rows.length ? " from the latest 500" : ""}`;
    $("journey-export").hidden = !source.run_id;
    $("journey-export").href =
      `/api/fly-lab/journey/download?run_id=${encodeURIComponent(source.run_id || "")}`;
  }
}
