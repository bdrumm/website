import { labApi, isDemo } from "./runtime.js";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const $ = (id) => document.getElementById(id),
  safe = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
export class NeuronView {
  constructor(container, label, tooltip) {
    Object.assign(this, {
      container,
      label,
      tooltip,
      counts: [],
      selected: new Set(),
      activity: null,
      mode: "spikes",
      showEdges: true,
      playhead: null,
      windowKey: null,
      pinned: null,
    });
    try {
      this.reducedMotion = matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
      this.camera.position.set(80, 12, 110);
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      container.append(this.renderer.domElement);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.minDistance = 5;
      this.controls.maxDistance = 260;
      new ResizeObserver(() => {
        const r = container.getBoundingClientRect();
        this.renderer.setSize(r.width, r.height);
        this.camera.aspect = r.width / r.height;
        this.camera.updateProjectionMatrix();
      }).observe(container);
      this.renderer.domElement.addEventListener("pointermove", (e) =>
        this.hover(e),
      );
      this.renderer.domElement.addEventListener("pointerleave", () => {
        this.tooltip.hidden = true;
      });
      let down;
      this.renderer.domElement.addEventListener(
        "pointerdown",
        (e) => (down = [e.clientX, e.clientY]),
      );
      this.renderer.domElement.addEventListener("pointerup", (e) => {
        if (down && Math.hypot(e.clientX - down[0], e.clientY - down[1]) < 4) {
          const i = this.hit(e);
          if (i !== undefined) this.inspect(this.data.ids[i]);
        }
      });
      $("neuron-color").onchange = (e) => {
        this.mode = e.target.value;
        this.playhead = null;
        this.binCounts = null;
        this.paint();
      };
      $("neuron-bin").oninput = (e) => {
        this.playhead = null;
        this.showBin(Number(e.target.value) - 1);
      };
      $("neuron-edges").onchange = (e) => {
        this.showEdges = e.target.checked;
        this.paint();
      };
      $("neuron-replay").onclick = () => this.replay();
      $("neuron-expand").onclick = () => {
        const panel = container.closest(".brain-panel");
        const expanded = panel.classList.toggle("expanded");
        $("neuron-expand").textContent = expanded ? "Close ×" : "Expand ↗";
      };
      $("neuron-search").onchange = (e) => this.search(e.target.value);
      $("neuron-search-button").onclick = () =>
        this.search($("neuron-search").value);
      let lastRender = 0;
      const animate = (now) => {
        requestAnimationFrame(animate);
        if (document.hidden || now - lastRender < 1000 / 60 - 0.5) return;
        lastRender = now;
        if (this.playhead !== null && this.activity?.bins?.length) {
          const bins = this.activity.bins,
            duration = bins.at(-1).end_ms,
            elapsed = (now - this.playhead) / 6;
          const index = bins.findIndex((b) => b.end_ms >= elapsed);
          if (index < 0) {
            this.playhead = null;
            this.binCounts = null;
            this.paint();
          } else if (index !== this.binIndex) {
            this.showBin(index);
            const b = bins[index];
            $("neuron-timing").textContent =
              `Recorded bins · ${b.end_ms.toFixed(1)} / ${duration} ms · 6× slower`;
          }
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      };
      requestAnimationFrame(animate);
    } catch (error) {
      label.textContent = `Neuron view unavailable: ${error.message}`;
    }
  }
  async load() {
    try {
      const data = await labApi("/api/anatomy");
      this.data = data;
      this.positions = new Float32Array(data.xyz.length * 3);
      data.xyz.forEach(([x, y, z], i) => this.positions.set([x, -z, y], i * 3));
      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(this.positions, 3),
      );
      this.geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(this.positions.length), 3),
      );
      this.points = new THREE.Points(
        this.geometry,
        new THREE.PointsMaterial({
          size: 1.05,
          vertexColors: true,
          transparent: true,
          opacity: 0.94,
          sizeAttenuation: true,
        }),
      );
      this.scene.add(this.points);
      const edge = data.connections,
        positions = new Float32Array(edge.pre.length * 6);
      edge.pre.forEach((p, i) => {
        positions.set(this.positions.subarray(p * 3, p * 3 + 3), i * 6);
        const q = edge.post[i];
        positions.set(this.positions.subarray(q * 3, q * 3 + 3), i * 6 + 3);
      });
      this.edgeGeometry = new THREE.BufferGeometry();
      this.edgeGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      this.edgeGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(new Float32Array(positions.length), 3),
      );
      this.lines = new THREE.LineSegments(
        this.edgeGeometry,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.52,
          depthWrite: false,
        }),
      );
      this.scene.add(this.lines);
      this.label.textContent = `${data.displayed.toLocaleString()} real neurons · ${edge.displayed.toLocaleString()} real connections`;
      this.container.title = `${data.positioned.toLocaleString()} neurons have soma positions; ${data.missing.toLocaleString()} lack coordinates. ${data.sampling}. ${edge.selection}.`;
      this.label.title = `${edge.displayed.toLocaleString()} of ${edge.between_displayed.toLocaleString()} connections among displayed cells. Lines connect somata schematically; they are not reconstructed axons.`;
      this.paint();
      if (!this.reducedMotion) this.replay();
    } catch (error) {
      this.label.textContent = error.message;
    }
  }
  setActivity(activity) {
    this.activity = activity;
    this.counts = activity?.counts || [];
    const key = activity?.window_id ?? activity?.sim_ms ?? null;
    if (key !== this.windowKey) {
      this.windowKey = key;
      if (!this.reducedMotion) this.replay();
    }
    if (!activity) {
      this.playhead = null;
      this.binCounts = null;
    }
    this.paint();
    this.liveInspector();
  }
  showBin(index) {
    this.binIndex = index;
    this.binCounts = null;
    const b = this.activity?.bins?.[index];
    if (b) {
      this.binCounts = new Uint32Array(this.data.displayed);
      b.indices.forEach((i, n) => (this.binCounts[i] = b.counts[n]));
    }
    this.paint();
    this.liveInspector();
    if (b)
      $("neuron-timing").textContent =
        `Recorded bin ${index + 1} · ${(b.end_ms - b.duration_ms).toFixed(1)}–${b.end_ms.toFixed(1)} ms`;
  }
  replay() {
    if (!this.data || this.mode !== "spikes" || !this.activity?.bins?.length)
      return;
    this.playhead = performance.now();
    this.binIndex = -1;
    this.binCounts = null;
  }
  paint() {
    if (!this.geometry) return;
    $("neuron-replay").disabled =
      this.mode !== "spikes" || !this.activity?.bins?.length;
    $("neuron-bin").disabled =
      this.mode !== "spikes" || !this.activity?.bins?.length;
    $("neuron-bin").max = this.activity?.bins?.length || 0;
    $("neuron-bin").value = this.binCounts ? this.binIndex + 1 : 0;
    const legends =
      this.mode === "voltage"
        ? ["−70 mV", "−35 mV", "linear-gradient(90deg,#2440a6,#fc973b)"]
        : this.mode === "type"
          ? [
              "Sensory · motor",
              "Other classes",
              "linear-gradient(90deg,#59e6a6,#fa9e57,#708cbb)",
            ]
          : [
              "Quiet",
              "Measured spikes",
              "linear-gradient(90deg,#213648,#76dbcf,#ffdb42)",
            ];
    $("neuron-legend-low").textContent = legends[0];
    $("neuron-legend-high").textContent = legends[1];
    $("neuron-gradient").style.background = legends[2];
    const counts = this.binCounts || this.counts,
      c = this.geometry.attributes.color.array;
    for (let i = 0; i < this.data.displayed; i++) {
      const n = counts[i] || 0,
        v = Math.min(1, Math.log1p(n) / Math.log(this.binCounts ? 7 : 31));
      let color = [0.11, 0.21, 0.29];
      if (this.mode === "voltage" && this.activity?.voltage_mv) {
        const p = Math.max(
          0,
          Math.min(1, (this.activity.voltage_mv[i] + 70) / 35),
        );
        color = [0.14 + p * 0.85, 0.24 + p * 0.35, 0.65 - p * 0.42];
      } else if (this.mode === "type") {
        const name = this.data.classes[i];
        color = name.includes("motor")
          ? [0.98, 0.62, 0.34]
          : name.includes("descending")
            ? [0.5, 0.65, 1]
            : name.includes("sensory")
              ? [0.35, 0.9, 0.65]
              : [0.3, 0.43, 0.62];
      } else if (n) color = [0.32 + 0.68 * v, 0.72 + 0.28 * v, 0.72 - 0.47 * v];
      if (this.selected.size && !this.selected.has(this.data.ids[i]))
        color = color.map((x) => x * 0.28);
      if (this.selected.has(this.data.ids[i]))
        color = [Math.max(color[0], 0.35), Math.max(color[1], 0.8), 1];
      c.set(color, i * 3);
    }
    this.geometry.attributes.color.needsUpdate = true;
    if (this.lines) {
      this.lines.visible = this.showEdges;
      const edge = this.data.connections,
        ec = this.edgeGeometry.attributes.color.array;
      edge.pre.forEach((p, i) => {
        const q = edge.post[i],
          chosen =
            !this.selected.size ||
            this.selected.has(this.data.ids[p]) ||
            this.selected.has(this.data.ids[q]),
          firing = counts[p] || 0;
        const intensity = chosen
          ? firing
            ? 0.7 + Math.min(0.3, Math.log1p(firing) / 3)
            : 0.48
          : 0.06;
        const weight =
          this.activity?.edge_weights?.[i] ?? edge.baseline_weight[i];
        const color =
          weight < 0
            ? [intensity, intensity * 0.4, intensity * 0.53]
            : [intensity * 0.3, intensity * 0.85, intensity];
        ec.set(color, i * 6);
        ec.set(
          color.map((x) => x * 0.42),
          i * 6 + 3,
        );
      });
      this.edgeGeometry.attributes.color.needsUpdate = true;
    }
    if (this.playhead === null && !this.binCounts)
      $("neuron-timing").textContent = this.activity
        ? `${this.mode === "voltage" ? "End-of-window voltage" : "Window total"} · ${this.activity.active_displayed} displayed cells fired · ${this.activity.sim_ms.toFixed(1)} ms neural time`
        : "Awaiting measured neural activity";
  }
  setSelection(ids) {
    const key = ids.join(",");
    if (key === this.selectionKey) return;
    this.selectionKey = key;
    this.selected = new Set(ids);
    if (this.highlightPoints) {
      this.scene.remove(this.highlightPoints);
      this.highlightPoints.geometry.dispose();
      this.highlightPoints.material.dispose();
      this.highlightPoints = null;
    }
    if (this.positions && ids.length) {
      const positions = [];
      this.data.ids.forEach((id, i) => {
        if (this.selected.has(id))
          positions.push(...this.positions.subarray(i * 3, i * 3 + 3));
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      this.highlightPoints = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: 0x90dcff,
          size: ids.length === 1 ? 9 : 4,
          sizeAttenuation: false,
          transparent: true,
          depthWrite: false,
          depthTest: false,
        }),
      );
      this.highlightPoints.renderOrder = 10;
      this.scene.add(this.highlightPoints);
    }
    if (!ids.length) {
      this.controls.target.set(0, 0, 0);
      this.camera.position.set(80, 12, 110);
    }
    this.paint();
  }
  hit(event) {
    if (!this.points) return;
    const r = this.renderer.domElement.getBoundingClientRect(),
      ray = new THREE.Raycaster();
    ray.params.Points.threshold = 0.7;
    ray.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - r.left) / r.width) * 2 - 1,
        (-(event.clientY - r.top) / r.height) * 2 + 1,
      ),
      this.camera,
    );
    return ray.intersectObject(this.points)[0]?.index;
  }
  hover(event) {
    const i = this.hit(event);
    if (i === undefined) {
      this.tooltip.hidden = true;
      return;
    }
    const count = this.counts[i] || 0,
      v = this.activity?.voltage_mv?.[i];
    this.tooltip.hidden = false;
    this.tooltip.textContent = `${this.data.types[i] || "Unassigned"} · ${this.data.ids[i]} · ${this.activity ? count + " spikes" : "static anatomy · no activity"}${v !== undefined ? ` · ${v.toFixed(1)} mV` : ""}`;
  }
  search(query) {
    if (!this.data) return;
    const text = query.trim();
    if (!text) return;
    const exact = this.data.ids.indexOf(text),
      type = this.data.types.findIndex(
        (t) => t.toLowerCase() === text.toLowerCase(),
      );
    this.inspect(exact >= 0 ? text : type >= 0 ? this.data.ids[type] : text);
  }
  async inspect(id) {
    try {
      const n = await labApi("/api/neuron?id=" + encodeURIComponent(id));
      this.pinned = n;
      this.motorHighlight = false;
      this.setSelection([id]);
      if (n.display_index >= 0) {
        const position = new THREE.Vector3().fromArray(
          this.positions,
          n.display_index * 3,
        );
        const delta = position.clone().sub(this.controls.target);
        this.controls.target.copy(position);
        this.camera.position.add(delta);
      }
      const content = $("neuron-inspector");
      content.hidden = false;
      content.innerHTML = `<strong>${safe(n.type || "Unassigned neuron")} · ${safe(id)}</strong><p>${safe(n.superclass)} / ${safe(n.subclass)} · ${safe(n.side)} · ${safe(n.status)}</p><div id="neuron-live"></div><p>${n.incoming_connections} inputs / ${n.outgoing_connections} outputs<br>${n.incoming_contacts.toLocaleString()} incoming / ${n.outgoing_contacts.toLocaleString()} outgoing contacts</p>${["incoming", "outgoing"].map((direction) => `<details><summary>${direction === "incoming" ? "Strongest inputs" : "Strongest outputs"} · up to ${n.partner_limit}</summary>${n[direction].map((p) => `<button class="neuron-partner" data-neuron-id="${safe(p.id)}"><span>${safe(p.type || p.id)}</span><strong>${p.contacts} contacts →</strong></button>`).join("")}</details>`).join("")}`;
      content
        .querySelectorAll("[data-neuron-id]")
        .forEach((b) => (b.onclick = () => this.inspect(b.dataset.neuronId)));
      this.liveInspector();
    } catch (error) {
      this.tooltip.hidden = false;
      this.tooltip.textContent = error.message;
    }
  }
  liveInspector() {
    const n = this.pinned;
    if (!n || !$("neuron-live")) return;
    const i = n.display_index;
    if (i < 0) {
      $("neuron-live").textContent =
        "Outside the display sample; full connectivity shown below.";
      return;
    }
    const hz =
      (this.counts[i] || 0) /
      ((this.activity?.bins?.at(-1)?.end_ms || 100) / 1000);
    $("neuron-live").textContent = this.activity
      ? `Window: ${this.counts[i] || 0} spikes · ${hz.toFixed(1)} Hz · end voltage ${this.activity.voltage_mv[i].toFixed(1)} mV · predicted ${this.data.neurotransmitters[i]}${this.binCounts ? `\nSelected bin: ${this.binCounts[i]} spikes / ${this.activity.bins[this.binIndex].duration_ms} ms` : ""}`
      : `${this.data.neurotransmitters[i]} · no neural window yet`;
  }
}
