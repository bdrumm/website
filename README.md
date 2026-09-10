# website

Static site for **Parametric Space**, served by GitHub Pages.

**Live:** https://parametric.space

Served from the `main` branch at the repo root. The `CNAME` file pins the
custom domain — do not delete it, or Pages reverts to `bdrumm.github.io/website/`.

## Layout

```
index.html    the whole homepage
styles.css    design tokens at the top; change those six colors first
script.js     footer year + mobile nav toggle; page works without it
404.html      custom not-found page
.nojekyll     tells Pages to serve files as-is (no Jekyll build)
CNAME         pins the custom domain (parametric.space)
```

## Editing

There is no build step and no dependencies. Edit the HTML and CSS directly,
commit to `main`, and Pages redeploys in a minute or two.

To preview locally:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Contact form

The form opens a mailto draft addressed to **info@parametric.space** containing the visitor's name, email, and message. The visitor reviews it and presses Send in their own email app. The website never claims an email was sent. A configured email app is required; a direct email link remains visible.

## Projects and shop

- `projects.html`: project catalogue.
- `project.html?id=...`: a distinct detail page URL for each catalogue project, with description, optional image, shop link, and cart action.
- `cart.html`: local-device cart with quantity editing, removal, subtotal, and Stripe Checkout redirect.
- `checkout-result.html`: verifies payment status through the server before showing confirmation. It does not fulfill orders.
- `shop-config.js`: approved project data and checkout endpoint. The catalogue is empty pending real project details. No fabricated products or prices are published.
- `services/checkout/`: Stripe Checkout Worker, configuration, tests, and activation instructions. It has not been deployed. Live checkout is disabled by default.

Tests: `node --test shop-core.test.mjs services/checkout/worker.test.mjs`.

## DNS

GitHub Pages is configured for `parametric.space`, with a valid certificate and HTTPS enforced. However, the live apex A records verified on 2026-09-08 were `76.223.105.230` and `13.248.243.5`, and the domain served the GoDaddy Website Builder site. `www` is a CNAME to `bdrumm.github.io` and redirects to the apex. The GitHub Pages origin was separately verified to serve the updated Parametric Space site.

The apex DNS needs to be pointed at GitHub Pages through the domain's DNS provider. Preserve email-related MX, TXT, SPF, DKIM, and DMARC records. No DNS settings were changed in this update.

## Arowana print model

`project.html?id=arowana` displays the supplied ArowanaFixedEyes.3mf geometry, designed by HappyFish, assembled from its two printable halves. Colors and silk surface material are estimated from the reference photo. The GLB retains millimetre dimensions; the viewer scales it for display. The original 3MF is unchanged. The project is not enabled for purchase.

Run `npm ci` and `npm run build` to bundle the self-hosted viewer. To regenerate the colored model from your source file:

```sh
python3 scripts/extract-arowana.py /path/to/ArowanaFixedEyes.3mf /tmp/arowana-geometry.json
npm run build:model -- /tmp/arowana-geometry.json
```

Run `npm test` for cart and checkout checks. Generated assets are committed for GitHub Pages.

## Trout V10

`project.html?id=trout` and the 3D catalogue use `assets/models/trout-v10.glb`, including the rebuilt dorsal attachment and rounded rear fin. The existing coral, mint and violet display finish and swim action are preserved. The colored-model download uses the same V10 asset.

The matching `Articulated_Trout_V10.blend` assembly was verified against the supplied `Articulated_Trout_V10.3mf`: all 2,580,594 vertices match within 0.0000005 mm of export rounding, with identical indices for all 5,163,156 triangles after the print-plate transforms. Both 57-island halves are assembled before reducing geometry for the web. The mirrored half's winding is corrected when baking its transform. The original 3MF and Blender files are unchanged; source provenance is recorded in `assets/models/trout-v10.provenance.json` and the GLB metadata. Colors are visualization styling.

Regenerate using the verified matching assembly:

```sh
blender --background --factory-startup --disable-autoexec /path/to/Articulated_Trout_V10.blend \
  --python scripts/export-trout.py -- \
  --source-3mf /path/to/Articulated_Trout_V10.3mf \
  --output assets/models/trout-v10.glb
```

## Baguette holder

`project.html?id=baguette-holder` shows a continuous display assembly from the matching `baguette_case_v2.py` design source. The lid and base each span the center with one watertight shell. The display geometry is extracted before the print-segment spigot, socket and backward joint chamfer, eliminating the deep center reveal while retaining the original dimensions, ribs, hinge axis, latches and strap lugs. This is presentation geometry; the original 3MF and manufacturing source are unchanged.

Crease-aware normals keep the curved shell smooth and the mechanical edges crisp. The gold silk material uses broad studio reflections without per-vertex high-frequency color stripes. Both the detailed model and the lightweight homepage model share this continuous geometry.

Regenerate using the source design's Python environment (with its existing manifold3d, trimesh and shapely dependencies):

```sh
python scripts/extract-baguette-display.py /path/to/baguette_case_v2.py /tmp/baguette-display.json
node scripts/build-baguette.mjs /tmp/baguette-display.json
blender --background --factory-startup --python scripts/build-home-models.py -- baguette-holder
```

## Station hardware project

`project.html?id=station` adapts the existing rotary-display Station promotion site into the Hardware section. Geometry in `src/station-model.js` is derived from that site's centimetre-scale device reconstruction (51 mm diameter, 12.1 mm shell). It is visual geometry, not manufacturing CAD. Rebuild with `node scripts/build-station.mjs`. Screen assets in `assets/station/` were extracted from that same local promotion site and represent Station OS demo captures, not live device state. No hardware commands, accounts, voice APIs or home automation services are connected to the public preview. Eight app controls select animated screen walkthroughs; device interactions elsewhere remain unchanged. The preview enclosure omits the keychain attachment, left-side port detail and right-side grille. The project preview presents the bottom-right rim closer to the camera, with a gentle horizontal sway, a small bounded drag tilt and native page scrolling over the canvas.

Station now uses eight scroll chapters with a sticky device viewer and particle dematerialization/reassembly between states. Chapter buttons remain available as navigation, Voice plays its walkthrough on entry, and reduced-motion mode skips the transporter transition. The standalone catalogue viewer retains manual app selection.

### Live Station UI showcase

The Station screen uses independently drawn canvas UI elements (`station-app-ui.js`), with walkthroughs for all eight apps. The 512-unit circular layout renders into a 1024 × 1024 texture for sharper close-up detail. The showcase adds luminous edge accents, gradient cards, animated rain forecasts, a flowing gradient voice animation, a glowing countdown ring, warm brightness controls and scene confirmations. These are enhanced web demo visuals, not pixel-exact reproductions of the reference UI. The screenshot-slice renderer is no longer used. The voice field adapts mode palettes, attack/release smoothing, the 1.15-second thinking heartbeat, 0.30-second onset decay, 0.55-second mode easing and rotating 2/3/5-harmonic rim waves from `station/libraries/voiceui/src/voice_blob.c`; transcript reveal follows `voice_ui.c`'s 260 ms word fade. Demo audio envelopes are scripted; no microphone, speech service or home device is connected. Other apps use representative demo data and state sequences; this is a web reimplementation rather than the embedded firmware itself.

## Modular garage 3D print project

`project.html?id=modular-garage` is Print Study / 003 in `projects-3d.html`. The page uses Parametric Space’s shared navigation, palette, typography and project routing, with scoped styles in `garage.css`. `src/garage-project.js` builds the controls and configuration cards; `src/garage-scene.js` renders the original separate meshes and 20 Blender animation clips. `npm run build` bundles both the existing viewer and the garage viewer; the garage bundle loads only on its own project page.

Derived from `Garage_Simple_Roof_Hinges.blend`, `assets/models/garage-simple-hinges.glb` retains the garage, kitchen and dining module roots, twelve door slats, and the replacement simple-hinge roof meshes. Six roof clips drive both translation and rotation directly; the two additional entry-door clips share the rolling-door opening interval. It is a display model rather than a sliced print file. The model has a nominal 200 × 240 mm footprint per module and a 200 × 261.7 × 132.6 mm closed garage envelope including the handle and hinges. The 128 mm stacked arrangement is a visualization study; physical fit is untested. Original source files remain unchanged.

Door controls sample source frames 1–40 at 24 fps; roof controls sample frames 1–80. Module positions use the source millimetres inside the `.01`-scaled SYSTEM_ROOT. Closed roofs and assembled parts are enforced in the stacked view. Studio renders in `assets/garage/` remain available if WebGL cannot initialize. Keyboard arrows orbit the interactive model; plus and minus zoom.

Configuration changes use `src/garage-configuration.js`: modules close before moving, lift vertically, travel horizontally, lower, then make a small positive landing bounce. The source root stays fixed and the camera frames each arrangement. Unstacking removes the top module first; hidden modules enter from outboard storage positions. New selections continue from the current pose, and reduced-motion mode settles immediately. `npm test` covers the phased motion alongside the existing checkout checks. Updated studio images are the `simple-*` assets in `assets/garage/`.

The faster configuration moves finish in approximately 1.8 seconds. In the side-by-side exploded view, each module moves onto a 400 mm pitch, leaving 70 mm gaps between the 330 mm expanded assemblies. Separate display carrier groups keep this spacing out of the transport coordinates. The camera adopts a near-frontal, aspect-fitted view and fog starts beyond the assemblies.

## Shared themes and project space

The home page now opens with the four catalogue models in one interactive Three.js scene. Select a model or its label to open the project; drag to nudge the objects through their shared spring and collision field. The fixed project index provides ordinary links for keyboard, touch, unavailable WebGL, or failed model loads. Motion can be paused and follows reduced-motion preferences. The contact form remains below the scene.

`theme.js` applies a saved light/dark preference before paint, defaults to the operating system, and synchronizes tabs. Dark colors come from Station’s navy, mint, blue and violet palette. Station’s story layout now works in either theme, and the garage floor, fog and controls switch with the rest of the site.

`projects.html` lists all projects together. The previous `projects-3d.html` and `projects-hardware.html` URLs also show the complete catalogue, and project back links return to `projects.html`.

`src/home-space.js` renders the navigation scene; `src/home-physics.js` supplies its motion and collision response. `npm run build` also produces `assets/home-space.js`, and `npm test` includes motion checks. `scripts/build-home-models.py` creates simplified navigation-only GLBs with Blender; the home assets total approximately 6 MB. The detailed project models are unchanged.

The transparent logo is `assets/logo-ps-transparent.png` (RGBA, transparent background). It was edited with the built-in imagegen tool using this prompt: “Remove only the black background and make it truly transparent, including the negative space between and inside the letters. Preserve the existing lime-green and dark metallic extruded PS geometry, perspective, colors, surface texture, highlights, spacing and composition.” The original raster remains available as `assets/logo-ps-3d.png`.

The page opens in Side by side. All three modules enter in sequence using the same lift, horizontal travel, drop and bounce; normal configuration changes keep the settled garage anchored. Entrance progress waits for a visible 3D canvas, and reduced-motion mode shows the assembled row immediately. Reset all returns to Side by side.


Station’s navigation model is generated with `npm run build:home-station`: a regular 360-segment shell and the complete circular screen, bezel and exterior details replace the decimated mesh. The home display uses the same Station UI as the project page, drawn at 1024 × 1024 with anisotropic filtering. It sways from side to side while keeping its screen facing forward; hovering, pausing, or reduced-motion preferences freeze the turn. The center monogram and tagline have been removed, and the larger models use a closer, staggered arrangement.


## Station preview

`project.html?id=station` presents eight animated screen demos on a circular aluminum device. The model omits the keychain attachment, left-side port detail and right-side grille. It uses a closer camera with the bottom-right rim forward, a gentle left-to-right sway, limited drag tilt and native page scrolling over the preview. Reduced-motion preferences and pause controls are respected.

The display renders at 1024 × 1024, with gradient voice animation, a thicker brightness arc, and no bottom callout pills or perimeter ticks. Data and interactions are simulated. `npm run build:station-model` rebuilds the device; `npm run build:station-viewer` bundles its viewer. The existing project viewers remain separate. `station.css` is loaded only for the Station route.

The project catalogue renders the individual garage from `assets/models/home/modular-garage.glb` in the shared interactive viewer. It starts from a three-quarter angle and supports rotation, dragging and keyboard controls. The garage detail page retains its full multi-module experience.


## CSI Presence — multi-floor sensing demonstration

`project.html?id=csi-presence` presents a simulated sensor network across two to four floors, with independent presence and room holds, sensor heights, global Z coordinates and stairwell transitions. It is linked from the homepage project index and the catalogue. Six hardware presets compare CSI, camera/range hybrid, 3D mmWave, tagged UWB, depth plus radar and optical marker tracking.

The demo is source-reviewed browser code, with synthetic observations and explicit accuracy assumptions. It does not connect to physical ESP32 devices or configure the firmware/Python host. The original RTI reconstruction remains per floor; the simulated precision observations supply building-wide XYZ. See `docs/csi-presence-review.md`, `docs/csi-hardware-research.md` and `docs/csi-building-presence.md` for source review, hardware options and multi-floor setup. The hardware survey remains a single-floor benchmark, not measured hardware or cross-floor validation.

The radar modules in `src/radar-*.js` load directly as browser modules on the project page. `npm test` includes their geometry, scenario, hardware and building checks. Normal GitHub Pages publication uses the `main` branch at the repository root, preserving `CNAME` and `.nojekyll`.
