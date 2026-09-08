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

The contact form is visibly marked coming soon and disabled until the form service is configured. It does not currently send or store messages. Visitors can email info@parametric.space directly. The service implementation and activation steps are in [services/contact](services/contact/README.md); set `contact-config.js` only after live delivery is verified.

## Design

The homepage uses the 3D PS logo and locally hosted Geist fonts in `assets/`.

## DNS

GitHub Pages is configured for `parametric.space`, with a valid certificate and HTTPS enforced. However, the live apex A records verified on 2026-09-08 were `76.223.105.230` and `13.248.243.5`, and the domain served the GoDaddy Website Builder site. `www` is a CNAME to `bdrumm.github.io` and redirects to the apex. The GitHub Pages origin was separately verified to serve the updated Parametric Space site.

The apex DNS needs to be pointed at GitHub Pages through the domain's DNS provider. Preserve email-related MX, TXT, SPF, DKIM, and DMARC records. No DNS settings were changed in this update.
