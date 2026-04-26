/* ═══════════════════════════════════════════
   LIMINAL ATLAS — Shared JavaScript
   Injects the site header and footer into
   every page automatically.
   To add a nav link, edit NAV_LINKS below.
   To update footer columns, edit FOOTER.
═══════════════════════════════════════════ */

// ─── SITE CONFIG ───────────────────────────
const SITE = {
  name: 'Liminal Atlas',
  tagline: 'Knowledge at the edge of the map',
};

// Add new nav items here — they appear everywhere
const NAV_LINKS = [
  { label: 'Home',          href: '/index.html' },
  { label: 'Physics',       href: '/categories/physics.html' },
  { label: 'Religion',      href: '/categories/religion.html' },
  { label: 'UAP',           href: '/categories/uap.html' },
  { label: 'Consciousness', href: '/categories/consciousness.html' },
  { label: 'Archive',       href: '/archive.html' },
];

const FOOTER_COLS = [
  {
    heading: 'Liminal Atlas',
    links: [
      { label: 'Est. 2026',           href: '/index.html' },
      { label: 'Subscribe',           href: '/subscribe.html' },
    ],
  },
  {
    heading: 'Topics',
    links: [
      { label: 'Frontier Physics',    href: '/categories/physics.html' },
      { label: 'Comparative Religion',href: '/categories/religion.html' },
      { label: 'UAP Research',        href: '/categories/uap.html' },
      { label: 'Consciousness',       href: '/categories/consciousness.html' },
      { label: 'Contact Narratives',  href: '/categories/uap.html' },
    ],
  },
  {
    heading: 'Reference',
    links: [
      { label: "Maxwell's Equations", href: 'https://en.wikipedia.org/wiki/Maxwell%27s_equations', external: true },
      { label: 'Superconductivity',   href: 'https://en.wikipedia.org/wiki/Superconductivity', external: true },
      { label: 'General Relativity',  href: 'https://en.wikipedia.org/wiki/General_relativity', external: true },
      { label: 'Zero-Point Energy',   href: 'https://en.wikipedia.org/wiki/Zero-point_energy', external: true },
      { label: 'UAP (Wikipedia)',      href: 'https://en.wikipedia.org/wiki/Unidentified_aerial_phenomenon', external: true },
    ],
  },
];

// ─── INJECT HEADER ─────────────────────────
function buildHeader() {
  const currentPath = window.location.pathname;

  const navHTML = NAV_LINKS.map(link => {
    // Mark link active if URL matches
    const isActive = currentPath === link.href ||
      (link.href !== '/index.html' && currentPath.startsWith(link.href.replace('.html', '')));
    return `<li><a href="${link.href}" ${isActive ? 'class="active"' : ''}>${link.label}</a></li>`;
  }).join('');

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <a href="/index.html" class="site-logo">${SITE.name}</a>
    <nav><ul class="site-nav">${navHTML}</ul></nav>
  `;

  document.body.prepend(header);
}

// ─── INJECT FOOTER ─────────────────────────
function buildFooter() {
  const colsHTML = FOOTER_COLS.map(col => {
    const linksHTML = col.links.map(l =>
      `<li><a href="${l.href}" ${l.external ? 'target="_blank" rel="noopener"' : ''}>${l.label}</a></li>`
    ).join('');
    return `<div class="footer-col"><h4>${col.heading}</h4><ul>${linksHTML}</ul></div>`;
  }).join('');

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="footer-grid">${colsHTML}</div>
    <div class="footer-copy">${SITE.name} · ${SITE.tagline} · Not credulity — curiosity</div>
  `;

  document.body.append(footer);
}

// ─── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
  buildFooter();
});
