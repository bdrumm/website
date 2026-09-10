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

## Arowana 3D study

`project.html?id=arowana` displays a procedural, photo-inspired GLB model with auto rotation, orbit/zoom controls, reduced-motion support, and the original reference photograph. It is an approximation from one image, not a scan or a manufacturing model. The project is not enabled for purchase.

Run `npm ci` and `npm run build` to regenerate the model and the self-hosted Three.js viewer. Run `npm test` for cart and checkout checks. Generated assets are committed so GitHub Pages needs no build service. The viewer module loads only on model project pages.

## Modular garage 3D print project

`project.html?id=modular-garage` is Print Study / 003 in `projects-3d.html`. The page uses Parametric Space’s shared navigation, palette, typography and project routing, with scoped styles in `garage.css`. `src/garage-project.js` builds the controls and configuration cards; `src/garage-scene.js` renders the original separate meshes and 20 Blender animation clips. `npm run build` bundles both the existing viewer and the garage viewer; the garage bundle loads only on its own project page.

Derived from `Garage_Simple_Roof_Hinges.blend`, `assets/models/garage-simple-hinges.glb` retains the garage, kitchen and dining module roots, twelve door slats, and the replacement simple-hinge roof meshes. Six roof clips drive both translation and rotation directly; the two additional entry-door clips share the rolling-door opening interval. It is a display model rather than a sliced print file. The model has a nominal 200 × 240 mm footprint per module and a 200 × 261.7 × 132.6 mm closed garage envelope including the handle and hinges. The 128 mm stacked arrangement is a visualization study; physical fit is untested. Original source files remain unchanged.

Door controls sample source frames 1–40 at 24 fps; roof controls sample frames 1–80. Module positions use the source millimetres inside the `.01`-scaled SYSTEM_ROOT. Closed roofs and assembled parts are enforced in the stacked view. Studio renders in `assets/garage/` remain available if WebGL cannot initialize. Keyboard arrows orbit the interactive model; plus and minus zoom.

Configuration changes use `src/garage-configuration.js`: modules close before moving, lift vertically, travel horizontally, lower, then make a small positive landing bounce. The source root stays fixed and the camera frames each arrangement. Unstacking removes the top module first; hidden modules enter from outboard storage positions. New selections continue from the current pose, and reduced-motion mode settles immediately. `npm test` covers the phased motion alongside the existing checkout checks. Updated studio images are the `simple-*` assets in `assets/garage/`.

The faster configuration moves finish in approximately 1.8 seconds. In the side-by-side exploded view, each module moves onto a 400 mm pitch, leaving 70 mm gaps between the 330 mm expanded assemblies. Separate display carrier groups keep this spacing out of the transport coordinates. The camera adopts a near-frontal, aspect-fitted view and fog starts beyond the assemblies.
