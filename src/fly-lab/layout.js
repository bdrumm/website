const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 340;
const MAX_WIDTH = 680;
const STORAGE_KEY = "fly-lab.monitor-width";

export function initMonitorResize() {
  const workspace = document.querySelector(".workspace");
  const sidebar = workspace.querySelector(".sidebar");
  const monitor = document.getElementById("live-monitor");
  const handle = document.getElementById("monitor-resize");
  const desktop = matchMedia("(min-width: 1201px)");
  let preferred = DEFAULT_WIDTH;
  let drag = null;
  try {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored >= MIN_WIDTH && stored <= MAX_WIDTH)
      preferred = stored;
  } catch {}

  function bounds() {
    const sceneMin = parseFloat(
      getComputedStyle(workspace).getPropertyValue("--scene-min-width"),
    );
    return {
      min: MIN_WIDTH,
      max: Math.max(
        MIN_WIDTH,
        Math.min(
          MAX_WIDTH,
          workspace.clientWidth - sidebar.offsetWidth - sceneMin,
        ),
      ),
    };
  }
  function apply() {
    if (!desktop.matches) return;
    const { min, max } = bounds();
    const width = Math.round(Math.max(min, Math.min(max, preferred)));
    workspace.style.setProperty("--monitor-width", `${width}px`);
    handle.setAttribute("aria-valuemin", min);
    handle.setAttribute("aria-valuemax", max);
    handle.setAttribute("aria-valuenow", width);
    handle.setAttribute("aria-valuetext", `${width} pixels wide`);
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, String(preferred));
    } catch {}
  }
  function setWidth(width) {
    const { min, max } = bounds();
    preferred = Math.max(min, Math.min(max, width));
    apply();
  }
  function finish() {
    if (!drag) return;
    const { pointerId } = drag;
    drag = null;
    if (handle.hasPointerCapture(pointerId))
      handle.releasePointerCapture(pointerId);
    handle.classList.remove("resizing");
    document.body.classList.remove("monitor-resizing");
    save();
  }
  handle.addEventListener("pointerdown", (event) => {
    if (!desktop.matches || event.button !== 0 || drag) return;
    event.preventDefault();
    drag = {
      x: event.clientX,
      width: monitor.getBoundingClientRect().width,
      pointerId: event.pointerId,
    };
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("resizing");
    document.body.classList.add("monitor-resizing");
  });
  handle.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    setWidth(drag.width + drag.x - event.clientX);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    handle.addEventListener(type, finish);
  handle.addEventListener("keydown", (event) => {
    if (!desktop.matches) return;
    const { min, max } = bounds();
    const step = event.shiftKey ? 40 : 10;
    const width = monitor.getBoundingClientRect().width;
    const next = {
      ArrowLeft: width + step,
      ArrowRight: width - step,
      Home: min,
      End: max,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setWidth(next);
    save();
  });
  handle.addEventListener("dblclick", () => {
    preferred = DEFAULT_WIDTH;
    apply();
    save();
  });
  desktop.addEventListener("change", () => {
    finish();
    apply();
  });
  new ResizeObserver(apply).observe(workspace);
  apply();
}
