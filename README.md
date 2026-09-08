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

The contact form is visibly marked coming soon and disabled until the form service is configured. It does not currently send or store messages.

## Design

The homepage uses the 3D PS logo and locally hosted Geist fonts in `assets/`.

## DNS

`parametric.space` is registered at GoDaddy. The apex points at GitHub Pages
via four A records (185.199.108–111.153); `www` is a CNAME to
`bdrumm.github.io` and GitHub redirects it to the apex. Google Workspace MX
and SPF/DMARC records are untouched — changing the A records does not affect
email.
