# Liminal Atlas

A knowledge-sharing blog at the intersection of frontier physics, comparative religion, UAP research, and consciousness studies.

**Live site:** [liminal-atlas.vercel.app](https://liminal-atlas.vercel.app) *(update this once deployed)*

---

## File Structure

```
liminal-atlas/
│
├── index.html                  ← Homepage (article grid + filter)
├── about.html                  ← About page
├── archive.html                ← Full article list
│
├── articles/
│   ├── _template.html          ← COPY THIS to write a new article
│   └── dave-rossi-close-reading.html
│
├── categories/
│   ├── physics.html
│   ├── religion.html
│   ├── uap.html
│   ├── consciousness.html
│   └── biology.html
│
├── css/
│   └── style.css               ← Shared design system (edit here to restyle everything)
│
└── js/
    └── site.js                 ← Shared header/footer + nav (edit here to add nav links)
```

---

## How to Add a New Article

1. **Copy the template**
   - Go to `articles/_template.html`
   - Click the file → click the copy icon → name it `articles/your-article-title.html`

2. **Fill in the template**
   - Follow the `← EDIT THIS` comments inside the file
   - Add your chapters, dialogue blocks, science boxes, person cards, and link clusters

3. **Add it to the homepage** (`index.html`)
   - Find the `<div class="articles-grid">` section
   - Copy one of the existing `<a class="article-card">` blocks
   - Update the href, title, excerpt, date, and category pills

4. **Add it to the archive** (`archive.html`)
   - Find the `<!-- ADD NEW ARTICLES HERE -->` comment
   - Copy the `<a class="archive-row">` block above it and update

5. **Add it to the right category page** (e.g. `categories/physics.html`)
   - Copy an `<a class="article-card">` block and update

6. **Commit to GitHub** — Vercel auto-deploys in ~20 seconds

---

## How to Update Site-Wide Design

**Change colours / fonts:** Edit `css/style.css` — all pages inherit from there.  
The colour variables are at the top under `:root { }`.

**Add a nav link:** Edit `js/site.js` — find the `NAV_LINKS` array and add a new entry.

**Update footer columns:** Edit `js/site.js` — find the `FOOTER_COLS` array.

---

## Component Reference

| Component | Class / Usage | Where to find example |
|---|---|---|
| Chapter section | `<section class="chapter" id="chN">` | Any article |
| Dialogue block | `<div class="dialogue">` | dave-rossi article |
| Physics explainer | `<div class="sci-box">` | dave-rossi article |
| Person card | `<div class="person-card">` | dave-rossi article |
| Skeptic note | `<div class="skeptic-box">` | dave-rossi article |
| Pull quote | `<div class="pull-quote">` | dave-rossi article |
| Link cluster | `<div class="link-cluster">` | dave-rossi article |
| SVG diagram | `<div class="diagram-wrap">` | dave-rossi article |
| Category pill | `<span class="cat-pill physics">` | index.html |
| Article card | `<a class="article-card">` | index.html |

---

## Deployment

This is a plain HTML/CSS/JS site — no build step, no Node.js, no terminal needed.

- **Hosting:** Vercel (auto-deploys on every GitHub push)
- **Update the site:** Edit files on GitHub → commit → live in ~20 seconds
- **Custom domain:** Set in Vercel dashboard → Settings → Domains

---

## Categories

| Category | Class | Colour |
|---|---|---|
| Physics | `cat-pill physics` | Blue |
| Religion | `cat-pill religion` | Purple |
| UAP | `cat-pill uap` | Green |
| Consciousness | `cat-pill consciousness` | Amber |
| Biology | `cat-pill biology` | Pink |
