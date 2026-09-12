# Fly Lab public project

Project: https://parametric.space/fly-lab/
Simulation: https://parametric.space/fly-lab/simulation/

The public project is in shop-config.js, linked from the homepage project index,
and rendered as two static pages. project.html?id=fly-lab forwards to its project page.
Existing catalog, cart, contact, theme, and other project behavior are preserved.

The simulation reuses the tested Stonkfly lab frontend and assets. Source is in
src/fly-lab; published bundles and fixtures are in fly-lab. Its Three.js 0.180.0
is pinned separately from the rest of the website. Rebuild with:

    npm --prefix src/fly-lab ci
    npm --prefix src/fly-lab run build

The browser runs manual arena physics, with original body constraints and real
static neuron anatomy. No neural activity, learning, checkpoints or compute
credentials are included. Arena verification covered 67 decisions and pixel-identical
sensory images; body verification covered 264 action cases in the source preview.
The other task modes retain controls and default previews but require compute to run.

GitHub Pages cannot host the Python engine or the original Sites server proxy.
fly-lab/runtime-config.js therefore leaves FLY_LAB_COMPUTE_BASE null. A future
HTTPS gateway must provide user authentication, credentialed CORS for parametric.space,
per-user jobs, quotas and the existing lab /api contract. Set COMPUTE_BASE to the
fully qualified API base only after those controls are ready. Never put backend
bearer tokens in static JavaScript. Connect compute shows an accurate unavailable
message until then. Keep the local Python lab loopback-only behind the gateway.

Body/mesh assets preserve their original license and provenance under fly-lab/assets.
