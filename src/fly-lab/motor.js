const regions = {
  L1: "Left front leg",
  R1: "Right front leg",
  L2: "Left middle leg",
  R2: "Right middle leg",
  L3: "Left hind leg",
  R3: "Right hind leg",
  LW: "Left wing",
  RW: "Right wing",
  LH: "Left haltere",
  RH: "Right haltere",
};
const safe = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export class MotorView {
  constructor(neurons) {
    this.neurons = neurons;
    this.selected = "L1";
    this.highlight = false;
    this.activity = null;
    this.root = document.getElementById("motor-regions");
    this.root.innerHTML = Object.entries(regions)
      .map(
        ([key, label]) =>
          `<button data-region="${key}" title="${label}"><span>${key}</span><strong>—</strong></button>`,
      )
      .join("");
    this.root
      .querySelectorAll("button")
      .forEach((b) => (b.onclick = () => this.select(b.dataset.region)));
    document.getElementById("show-all-neurons").onclick = () => {
      this.highlight = false;
      this.neurons.motorHighlight = false;
      this.neurons.setSelection([]);
      this.render();
    };
    document.getElementById("export-motor").onclick = () => this.export();
  }
  select(region) {
    if (!regions[region]) return;
    this.selected = region;
    this.highlight = true;
    this.neurons.motorHighlight = true;
    this.render();
  }
  update(activity, body, kind) {
    this.activity = activity;
    this.body = body;
    this.kind = kind;
    this.render();
  }
  render() {
    const catalog = this.neurons.data?.motor_catalog;
    const pools =
      catalog?.pools.filter((p) => p.region === this.selected) || [];
    const live = this.activity?.regions || {};
    const region = live[this.selected];
    this.root.querySelectorAll("button").forEach((b) => {
      b.classList.toggle(
        "active",
        this.highlight && b.dataset.region === this.selected,
      );
      const r = live[b.dataset.region];
      b.querySelector("strong").textContent = r
        ? `${r.mean_hz.toFixed(1)}`
        : "—";
    });
    if (this.neurons.motorHighlight)
      this.neurons.setSelection(
        this.highlight ? pools.flatMap((p) => p.ids) : [],
      );
    document.getElementById("motor-region-title").textContent =
      regions[this.selected];
    document.getElementById("motor-window").textContent = this.activity
      ? `${this.activity.duration_ms} ms · ${this.kind === "feedback" ? "feedback" : "decision"}`
      : "Awaiting neural input";
    document.getElementById("motor-summary").textContent = region
      ? `${region.active_cells}/${region.neurons} cells active · ${region.spikes} spikes`
      : "Anatomical mapping ready; no measured window yet.";
    const values = new Map((this.activity?.pools || []).map((p) => [p.key, p]));
    const open = new Set(
      [...document.querySelectorAll("#motor-pools details[open]")].map(
        (e) => e.dataset.pool,
      ),
    );
    document.getElementById("motor-pools").innerHTML =
      pools
        .map((p) => {
          const a = values.get(p.key);
          return `<details data-pool="${safe(p.key)}" ${open.has(p.key) ? "open" : ""}><summary><span>${safe(p.type)}</span><strong>${a ? a.mean_hz.toFixed(1) : "—"} Hz</strong></summary><p>${safe(p.ids.length)} cells · ${a ? a.spikes : "—"} spikes</p><p class="motor-ids">${p.ids.map((id, i) => `${safe(id)}${a ? ` (${a.cell_spikes[i]})` : ""}`).join(", ")}</p></details>`;
        })
        .join("") || '<p class="hint">Loading retained motor annotations…</p>';
    const isWing = this.selected.endsWith("W"),
      motion = isWing
        ? this.body?.motor_response?.wings[this.selected[0]]
        : this.body?.motor_response?.legs[this.selected];
    document.getElementById("motor-motion-status").textContent = motion
      ? `${this.kind === "feedback" ? "Last decision pose · " : ""}${motion.reason || "Illustrative motion"} · ${motion.applied_degrees.toFixed(2)}° applied`
      : "Color shows measured activity. Motion awaits a decision.";
  }
  export() {
    const catalog = this.neurons.data?.motor_catalog;
    if (!catalog) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ catalog, window: this.activity }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "fly-motor-map.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function colorMotorBody(legs, wings, activity, selected) {
  const regions = activity?.regions || {};
  for (const [name, mesh] of Object.entries(legs)) {
    const hz = regions[name]?.mean_hz || 0,
      intensity = Math.min(1, Math.log1p(hz) / Math.log(101));
    mesh.upper.material.color.set(name === selected ? 0x89dce8 : 0x594639);
    mesh.upper.material.emissive.set(0x53e5ad);
    mesh.upper.material.emissiveIntensity = intensity * 0.9;
    for (const material of mesh.materials || []) {
      material.emissive.set(name === selected ? 0x469aca : 0x31866d);
      material.emissiveIntensity = name === selected ? 0.35 : intensity * 0.35;
    }
  }
  wings.forEach((wing) => {
    const key = wing.userData.region,
      hz = regions[key]?.mean_hz || 0;
    wing.userData.surface.material.emissive.set(
      key === selected ? 0x40a8e0 : 0x44d9aa,
    );
    wing.userData.surface.material.emissiveIntensity =
      key === selected ? 0.35 : Math.min(0.8, Math.log1p(hz) / Math.log(101));
  });
}
