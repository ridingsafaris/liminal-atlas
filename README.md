# Liminal Atlas

Knowledge at the edge of the map — close readings at the intersection of frontier physics, UAP research, comparative religion, and consciousness studies.

**Live:** liminal-atlas.vercel.app

## Stack
- Static HTML/CSS/JS
- Vercel (auto-deploy from GitHub)
- [Pagefind](https://pagefind.app) for full-text search

## Deployment

Push to GitHub → Vercel auto-deploys. The `vercel.json` build command runs Pagefind automatically on each deploy:

```json
"buildCommand": "npx -y pagefind --site . --output-path _pagefind"
```

This indexes all article content and generates the `_pagefind/` directory that powers `/search`.

## Adding a new article

1. Create `articles/your-slug.html` using an existing article as template
2. Make sure `<main>` has `data-pagefind-body` attribute (for search indexing)
3. Add a card to `index.html` and the relevant category pages
4. Push — Vercel rebuilds the search index automatically

## Local development

```bash
# Serve locally
npx serve .

# Build search index locally (requires Node)
npx pagefind --site . --output-path _pagefind
```
