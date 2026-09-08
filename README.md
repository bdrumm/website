# website

Static site for **Company Name**, served by GitHub Pages.

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

## Things to replace

- "Company Name" and the tagline throughout `index.html`
- `hello@example.com` in the contact section and footer
- The `<meta name="description">` and `og:` tags in `<head>`
- Add `og-image.png` (1200×630) to the repo root and reference it with an
  `og:image` meta tag for link previews

## DNS

`parametric.space` is registered at GoDaddy. The apex points at GitHub Pages
via four A records (185.199.108–111.153); `www` is a CNAME to
`bdrumm.github.io` and GitHub redirects it to the apex. Google Workspace MX
and SPF/DMARC records are untouched — changing the A records does not affect
email.
