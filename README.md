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
