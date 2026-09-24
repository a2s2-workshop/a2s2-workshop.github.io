# a2s2-workshop

Landing site for **A²S² — Auditing AI and Sociotechnical Systems**, a workshop
series on auditing AI and algorithmic systems as they are actually built,
deployed, and lived with.

Served at <https://a2s2-workshop.github.io/>. Each yearly edition lives in its
own repo under the same org (e.g. [`2027`](https://github.com/a2s2-workshop/2027),
served at `/2027/`) and is linked from `data/editions.json`.

## Running locally

The page loads its content from `data/*.json` with `fetch()`, which browsers
block over `file://`. **Opening `index.html` by double-clicking it will show
empty sections.** Serve it instead:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Layout

```
index.html          the entire site — one page, anchor-navigated
css/style.css       all styling; theme tokens live in the :root block at the top
js/main.js          renders the Editions and Organizers sections from JSON
data/editions.json  one row per yearly edition, linking out to its site
data/organizers.json  standing organizer list
favicon.svg
```

There is no build step, no framework, and no CI. Deploying is `git push` to
`main`; GitHub Pages serves the repo root.

`css/style.css` is intentionally identical to the copy in each year repo — if
you change theming, copy the file across so the editions do not drift apart.

## Editing content

- **Prose** (the About section) is hardcoded in `index.html`.
- **Editions** — add an object to `data/editions.json`.
- **Organizers** — edit `data/organizers.json`:

  ```json
  {
    "name": "Full Name",
    "affiliation": "Institution",
    "website": "https://example.com/",
    "links": [
      { "label": "Bluesky", "url": "https://bsky.app/profile/..." }
    ]
  }
  ```

  Array order is display order. `website` is optional. Each `links[].label`
  must be a key in the `ICONS` map in `js/main.js` — currently `X`, `Bluesky`,
  `Mastodon`, `LinkedIn`, `GitHub`, `Google Scholar`, `ORCID`. **Any other
  label is silently dropped**, so add the icon first.

