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

`project.html?id=baguette-holder` now presents the working manufacturing preview from `reviews/baguette-v3/`. `src/baguette-project.js` reuses that page's model controls, revision notes, fifteen CAD renders, print archive and editable-source download links. Relative links are resolved against the review directory, and the model revision is taken from the working preview's versioned script URL. The review HTML and model are revalidated when the project page loads.

`src/baguette-viewer.js` mounts the same `mountReview` renderer used by the working preview, adding the site's rotation-only controls. Wheel and vertical touch gestures scroll the page. The eight camera/section presets, 0–100° lid slider, segment separation, cutaway, and shared-view URLs all remain available. `baguette.css` adapts the review layout to the site's existing light/dark themes.

Run `npm run build:baguette-page` after changing the shared review renderer; it is also part of `npm run build`. This page integration changes no CAD geometry, manufacturing meshes, renders or print archives. Geometry revisions continue to follow `reviews/baguette-v3/AGENTS.md`.

The catalogue and homepage retain the continuous V2 presentation model generated by `scripts/extract-baguette-display.py`, `scripts/build-baguette.mjs`, and `scripts/build-home-models.py`. The detailed project page uses the current manufacturing model directly.

## Station hardware project

`project.html?id=station` adapts the existing rotary-display Station promotion site into the Hardware section. Geometry in `src/station-model.js` is derived from that site's centimetre-scale device reconstruction (51 mm diameter, 12.1 mm shell). It is visual geometry, not manufacturing CAD. Rebuild with `node scripts/build-station.mjs`. Screen assets in `assets/station/` were extracted from that same local promotion site and represent Station OS demo captures, not live device state. No hardware commands, accounts, voice APIs or home automation services are connected to the public preview. Eight app controls select animated screen walkthroughs; device interactions elsewhere remain unchanged. The preview enclosure omits the keychain attachment, left-side port detail and right-side grille. The project preview presents the bottom-right rim closer to the camera, with a gentle horizontal sway, a small bounded drag tilt and native page scrolling over the canvas.

Station now uses eight scroll chapters with a sticky device viewer and particle dematerialization/reassembly between states. Chapter buttons remain available as navigation, Voice plays its walkthrough on entry, and reduced-motion mode skips the transporter transition. The standalone catalogue viewer retains manual app selection.

### Live Station UI showcase

The Station screen uses independently drawn canvas UI elements (`station-app-ui.js`), with walkthroughs for all eight apps. The 512-unit circular layout renders into a 1024 × 1024 texture for sharper close-up detail. The showcase adds luminous edge accents, gradient cards, animated rain forecasts, a flowing gradient voice animation, a glowing countdown ring, warm brightness controls and scene confirmations. These are enhanced web demo visuals, not pixel-exact reproductions of the reference UI. The screenshot-slice renderer is no longer used. The voice field adapts mode palettes, attack/release smoothing, the 1.15-second thinking heartbeat, 0.30-second onset decay, 0.55-second mode easing and rotating 2/3/5-harmonic rim waves from `station/libraries/voiceui/src/voice_blob.c`; transcript reveal follows `voice_ui.c`'s 260 ms word fade. Demo audio envelopes are scripted; no microphone, speech service or home device is connected. Other apps use representative demo data and state sequences; this is a web reimplementation rather than the embedded firmware itself.

## Modular garage 3D print project

`project.html?id=modular-garage` displays the September 10 `Garage_Simplified_Structure.blend` revision from the 3D prints project. Its continuous structural shells, tapered rear supports, inset fronts and underfolding roofs replace the older simple-hinge export. The matching source SHA-256 is recorded in `assets/models/garage-simplified-structure-audit.json` and embedded in both published GLBs.

`assets/models/garage-simplified-structure.glb` packages all 60 source objects (47 printable objects and 13 display references) and 21 animation tracks. `scripts/build-garage-snapshot.mjs` packages the verified `garage-preview.glb` and `garage-preview.json` from the 3D prints project without editing the Blender file or changing its geometry. Its 80 sampled transforms are embedded as standard glTF animations. Source-meter geometry sits beneath millimeter module controls, preserving the existing configuration planner. Run `node scripts/build-garage-snapshot.mjs /path/to/preview-assets` to refresh both the full model and individual preview together.

Door controls use source frames 1–40; roofs use 1–80, including the raise, underfold, half-open and rear-stowed sequence. The 128 mm stack detaches the lower garage and kitchen roofs, matching the source assembly. Exploded inspection separates removable fronts and roofs while keeping each structural shell whole. Studio renders in `assets/garage/simplified-*.jpg` come from the same source revision. The structural shells measure approximately 200 × 244.4 × 130 mm; physical fit still requires test printing.

Configuration changes close the model before lifting, moving and lowering modules, with a small landing bounce. The base garage remains anchored. Reduced-motion mode settles immediately. Dragging or keyboard arrows rotate the interactive model at a fixed viewing distance; wheel and vertical touch gestures scroll the page. Model zoom and pan remain disabled.

`npm test` verifies source identity, all 80 motion frames, independent doors and roofs, reversible exploded inspection, stack alignment and the single-garage preview. `npm run build:garage` bundles the renderer.

## Shared themes and project space

The home page now opens with the four catalogue models in one interactive Three.js scene. Select a model or its label to open the project; drag to nudge the objects through their shared spring and collision field. The fixed project index provides ordinary links for keyboard, touch, unavailable WebGL, or failed model loads. Motion can be paused and follows reduced-motion preferences. The contact form remains below the scene.

`theme.js` applies a saved light/dark preference before paint, defaults to the operating system, and synchronizes tabs. Dark colors come from Station’s navy, mint, blue and violet palette. Station’s story layout now works in either theme, and the garage floor, fog and controls switch with the rest of the site.

`projects.html` lists all projects together. The previous `projects-3d.html` and `projects-hardware.html` URLs also show the complete catalogue, and project back links return to `projects.html`.

`src/home-space.js` renders the navigation scene; `src/home-physics.js` supplies its motion and collision response. `npm run build` also produces `assets/home-space.js`, and `npm test` includes motion checks. `scripts/build-home-models.py` creates the legacy navigation GLBs with Blender. The current garage snapshot is packaged separately with `scripts/build-garage-snapshot.mjs`, retaining its full mesh detail.

The transparent logo is `assets/logo-ps-transparent.png` (RGBA, transparent background). It was edited with the built-in imagegen tool using this prompt: “Remove only the black background and make it truly transparent, including the negative space between and inside the letters. Preserve the existing lime-green and dark metallic extruded PS geometry, perspective, colors, surface texture, highlights, spacing and composition.” The original raster remains available as `assets/logo-ps-3d.png`.

The page opens in Side by side. All three modules enter in sequence using the same lift, horizontal travel, drop and bounce; normal configuration changes keep the settled garage anchored. Entrance progress waits for a visible 3D canvas, and reduced-motion mode shows the assembled row immediately. Reset all returns to Side by side.


Station’s navigation model is generated with `npm run build:home-station`: a regular 360-segment shell and the complete circular screen, bezel and exterior details replace the decimated mesh. The home display uses the same Station UI as the project page, drawn at 1024 × 1024 with anisotropic filtering. It sways from side to side while keeping its screen facing forward; hovering, pausing, or reduced-motion preferences freeze the turn. The center monogram and tagline have been removed, and the larger models use a closer, staggered arrangement.


## Station preview

`project.html?id=station` presents eight animated screen demos on a circular aluminum device. The model omits the keychain attachment, left-side port detail and right-side grille. It uses a closer camera with the bottom-right rim forward, a gentle left-to-right sway, limited drag tilt and native page scrolling over the preview. Reduced-motion preferences and pause controls are respected.

The display renders at 1024 × 1024, with gradient voice animation, a thicker brightness arc, and no bottom callout pills or perimeter ticks. Data and interactions are simulated. `npm run build:station-model` rebuilds the device; `npm run build:station-viewer` bundles its viewer. The existing project viewers remain separate. `station.css` is loaded only for the Station route.

The home page and project catalogue render the individual garage from `assets/models/home/modular-garage-simplified.glb`, with the September 10 roof and rolling door in their half-open source pose. The catalogue supports rotation and keyboard controls; the garage detail page retains the complete three-module experience.


## CSI Presence — multi-floor sensing demonstration

`project.html?id=csi-presence` presents a simulated sensor network across two to four floors, with independent presence and room holds, sensor heights, global Z coordinates and stairwell transitions. It is linked from the homepage project index and the catalogue. Six hardware presets compare CSI, camera/range hybrid, 3D mmWave, tagged UWB, depth plus radar and optical marker tracking.

The demo is source-reviewed browser code, with synthetic observations and explicit accuracy assumptions. It does not connect to physical ESP32 devices or configure the firmware/Python host. The original RTI reconstruction remains per floor; the simulated precision observations supply building-wide XYZ. See `docs/csi-presence-review.md`, `docs/csi-hardware-research.md` and `docs/csi-building-presence.md` for source review, hardware options and multi-floor setup. The hardware survey remains a single-floor benchmark, not measured hardware or cross-floor validation.

The radar modules in `src/radar-*.js` load directly as browser modules on the project page. `npm test` includes their geometry, scenario, hardware and building checks. Normal GitHub Pages publication uses the `main` branch at the repository root, preserving `CNAME` and `.nojekyll`.

CSI Presence presents one main floor plan with Hybrid, Wi-Fi / RTI, Camera evidence and agreement display modes in the right sidebar. The floor-selection menu, lower building-level visualization and headline metrics panel have been removed. The “A shared picture” component summary follows the visualization. Hardware versions, live readings, signal pipeline, system/recovery, accuracy research and evidence remain in keyboard-accessible tabs, preserving controls, comparisons and walkthrough state.

The “A shared picture” section includes source-based signal schematics for the Wi-Fi CSI mesh, LD2410 reports, both camera capture paths and the Python host. They show data interfaces and processing stages, not electrical wiring. SVG sources are in `assets/csi-*-schematic.svg`.

CSI now opens directly on the sensing visualization, without the former floor/building-size summary. The component schematics use abstract interference, range-band, optical-field and fusion graphics. The Hardware versions tab includes an interactive precision/accuracy example with eight constructed XY readings, a fixed ±5 cm scale and a 1 cm tolerance radius. Its computed spread, mean offset and RMS error are independent of hardware presets.


## September 11 garage review update

The garage uses `Garage_Standard_Brick.blend` (SHA-256 `927d05540c9b9b6cd0d337579b4c7e2f78ed2a34b7d64a655ca3dcf93f35db3e`), with 63 source objects and 21 animated objects over 80 frames. Matching brick recesses are added to the kitchen and dining shells. The other 61 source mesh payloads and all source motion are preserved. New renders show the same source revision.

The project page adds roof presets and fine sliders, removable-part separation, five camera presets, a 24-second sequence, PNG capture and shareable assembly states. Side-by-side entrance motion and zoom controls are retained. Print layout loads lazily and includes 43 parts with category/search filters, list and mesh selection, dimensions/orientation notes, underside highlighting and display tiles. Its latest colored 3MF download includes the revised brick shells. Print tiles are illustrations of supplied orientations, not a single build plate.

Only two print-layout geometries were replaced; all other 41 meshes, numbered labels and tile transforms are preserved. Source assets were recovered from verified temporary exports because macOS denied access to the relocated Documents source. The source Blender files were not changed.

The garage also has a standalone sharing page at `/modular-garage/`, with a domain-only header and no shop navigation. The garage stats strip is removed in both views. Copy view link opens this standalone page and preserves the configuration, camera angle, and zoom.
