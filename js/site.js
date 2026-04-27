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
  { label: 'People',        href: '/people.html' },
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
    heading: 'Popular Topics',
    links: [
      { label: 'Townsend Brown',         href: '/articles/jre-jesse-michels.html#ch4' },
      { label: 'Biefeld-Brown Effect',   href: '/articles/jre-jesse-michels.html#ch4' },
      { label: 'Havana Syndrome',        href: '/articles/nsa-director-ufo.html#ch6' },
      { label: 'Nazca Mummies',          href: '/articles/jre-jesse-michels.html#ch8' },
      { label: 'Alcubierre Warp Drive',  href: '/articles/nsa-director-ufo.html#ch8' },
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

  const isDark = localStorage.getItem('theme') !== 'light';
  const toggleLabel = isDark ? '&#9788; Light' : '&#9790; Dark';

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <a href="/index.html" class="site-logo">${SITE.name}</a>
    <div class="site-search-wrap">
      <input type="search" class="site-search" id="siteSearch" placeholder="Search articles…" autocomplete="off">
      <div class="site-search-results" id="searchResults"></div>
    </div>
    <div class="site-header-right">
      <nav><ul class="site-nav">${navHTML}</ul></nav>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">${toggleLabel}</button>
    </div>
  `;

  document.body.prepend(header);

  // Apply saved theme immediately
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.setAttribute('data-theme', 'light');

  document.getElementById('themeToggle').addEventListener('click', function() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      this.innerHTML = '&#9788; Light';
    } else {
      document.body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      this.innerHTML = '&#9790; Dark';
    }
  });

  // ── Search
  const SEARCH_INDEX = [
    { title: 'Jesse Michels on The Joe Rogan Experience #2331', url: '/articles/jre-jesse-michels.html', tags: 'townsend brown lazar nazca rogan uap' },
    { title: 'Former NSA Director Breaks Silence on UAPs', url: '/articles/nsa-director-ufo.html', tags: 'hazelton gilbert nsa havana syndrome warp drive' },
    { title: 'Jason Jorjani on American Alchemy', url: '/articles/jorjani-american-alchemy.html', tags: 'jorjani kant swedenborg epstein spectral revolution' },
    { title: 'Pais & Rossi on Hard Truths', url: '/articles/pais-rossi-hard-truths.html', tags: 'pais rossi zpe electrodynamics casimir' },
    { title: 'Navy Scientist: A Cosmic War Is Happening', url: '/articles/sal-pais-close-reading.html', tags: 'salvatore pais navy patents hybrid craft pais effect' },
    { title: 'Dave Rossi on American Alchemy', url: '/articles/dave-rossi-close-reading.html', tags: 'dave rossi electrodynamics scalar waves superconductor' },
    { title: 'William Bramley — The Gods of Eden', url: '/articles/bramley-gods-of-eden.html', tags: 'bramley custodians black plague brotherhood snake' },
    { title: 'Frances Yates — The Rosicrucian Enlightenment', url: '/articles/yates-rosicrucian-enlightenment.html', tags: 'yates rosicrucian dee palatinate royal society' },
    { title: 'Swedenborg — Arcana Coelestia', url: '/articles/swedenborg-arcana-coelestia.html', tags: 'swedenborg kant arcana genesis heaven hell' },
    { title: 'Frances Yates — The Occult Philosophy', url: '/articles/yates-occult-philosophy.html', tags: 'yates hermetic cabalist elizabethan dee spenser' },
    { title: 'Swedenborg — The Earths in the Universe', url: '/articles/swedenborg-earths-in-universe.html', tags: 'swedenborg mars mercury planets kant jorjani' },
    { title: 'People Directory', url: '/people.html', tags: 'people hosts guests figures directory' },
  ];

  const searchInput = document.getElementById('siteSearch');
  const searchResults = document.getElementById('searchResults');

  searchInput.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    if (q.length < 2) { searchResults.style.display = 'none'; return; }
    const matches = SEARCH_INDEX.filter(a =>
      a.title.toLowerCase().includes(q) || a.tags.includes(q)
    ).slice(0, 5);
    if (!matches.length) { searchResults.style.display = 'none'; return; }
    searchResults.innerHTML = matches.map(a =>
      `<a href="${a.url}" class="sr-item">${a.title}</a>`
    ).join('');
    searchResults.style.display = 'block';
  });

  document.addEventListener('click', function(e) {
    if (!header.contains(e.target)) searchResults.style.display = 'none';
  });
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
