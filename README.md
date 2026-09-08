# website

Static site for **Company Name**, served by GitHub Pages.

**Live:** https://bdrumm.github.io/website/

## Layout

```
index.html    the whole homepage
styles.css    design tokens at the top; change those six colors first
script.js     footer year + mobile nav toggle; page works without it
404.html      custom not-found page
.nojekyll     tells Pages to serve files as-is (no Jekyll build)
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

## Custom domain

Add a file named `CNAME` at the repo root containing just the domain
(e.g. `example.com`), then point DNS at GitHub per
[their docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).
With a custom domain, change the `/website/` paths in `404.html` and the
brand/homepage links to plain `/`.
