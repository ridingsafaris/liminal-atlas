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
  { label: 'Home',          href: '/' },
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
      { label: 'Est. 2026',           href: '/' },
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
    const isActive = currentPath === link.href || (link.href === '/' && currentPath === '/index.html') ||
      (link.href !== '/' && currentPath.startsWith(link.href.replace('.html', '')));
    return `<li><a href="${link.href}" ${isActive ? 'class="active"' : ''}>${link.label}</a></li>`;
  }).join('');

  const isDark = localStorage.getItem('theme') !== 'light';
  const toggleLabel = isDark ? '&#9788; Light' : '&#9790; Dark';

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <a href="/" class="site-logo">${SITE.name}</a>
    <div class="site-search-wrap">
      <input type="search" class="site-search" id="siteSearch" placeholder="Search…" autocomplete="off">
      <div class="site-search-hint" id="searchHint" style="display:none;position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius);padding:8px 12px;font-family:var(--font-mono);font-size:10px;color:var(--text-dim);z-index:300;">Press Enter to search</div>
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

  // ── Search — sends to /search?q=... for Pagefind results
  const searchInput = document.getElementById('siteSearch');

  function doSearch(q) {
    if (q.trim().length > 1) {
      window.location.href = '/search?q=' + encodeURIComponent(q.trim());
    }
  }

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') doSearch(this.value);
  });

  // Show a small "press Enter" hint while typing
  searchInput.addEventListener('input', function() {
    const hint = document.getElementById('searchHint');
    if (hint) hint.style.display = this.value.length > 1 ? 'block' : 'none';
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

// ─── PEOPLE DIRECTORY ──────────────────────
function initPeopleDirectory() {
  var grid = document.querySelector('.pdir-grid');
  if (!grid) return;

  var cards = document.querySelectorAll('.pdir-card');
  var btns  = document.querySelectorAll('.filter-btn');

  // Sort alphabetically by surname using a DocumentFragment
  // to avoid repeated live DOM moves that cause image flicker
  var cardArr = Array.from(cards);
  cardArr.sort(function(a, b) {
    var na = a.querySelector('.pdir-name').textContent.trim();
    var nb = b.querySelector('.pdir-name').textContent.trim();
    var la = na.split(' ').pop(), lb = nb.split(' ').pop();
    return la.localeCompare(lb) || na.localeCompare(nb);
  });
  var frag = document.createDocumentFragment();
  cardArr.forEach(function(c) { frag.appendChild(c); });
  grid.appendChild(frag); // single DOM operation — no flicker

  // Expand / collapse on click
  cards.forEach(function(card) {
    card.querySelector('.pdir-card-inner').addEventListener('click', function() {
      var profile = card.querySelector('.pdir-profile');
      var isOpen  = card.classList.contains('open');
      document.querySelectorAll('.pdir-card.open').forEach(function(c) {
        c.classList.remove('open');
        c.querySelector('.pdir-profile').style.display = 'none';
      });
      if (!isOpen) {
        card.classList.add('open');
        profile.style.display = 'block';
      }
    });
  });

  // Filter buttons
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      cards.forEach(function(card) {
        if (filter === 'all') {
          card.classList.remove('hidden');
        } else if (['host', 'guest', 'figure'].includes(filter)) {
          card.classList.toggle('hidden', card.dataset.label !== filter);
        } else {
          card.classList.toggle('hidden', !card.hasAttribute('data-cat-' + filter));
        }
      });
    });
  });
}

// ─── INIT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
  buildFooter();
  initPeopleDirectory();
});
