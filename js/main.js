/* A2S2 landing page. Content is fetched from data/*.json at runtime, so this
   page must be served over HTTP — opening index.html via file:// will leave
   the Editions and Organizers sections empty. See README.md. */

/* Social links are keyed by `label` against this map. A label that is not
   listed here is silently dropped, so add the icon before adding the link. */
const ICONS = {
  'X':              `<i class="fa-brands fa-x-twitter" aria-label="X"></i>`,
  'Bluesky':        `<i class="fa-brands fa-bluesky" aria-label="Bluesky"></i>`,
  'Mastodon':       `<i class="fa-brands fa-mastodon" aria-label="Mastodon"></i>`,
  'LinkedIn':       `<i class="fa-brands fa-linkedin" aria-label="LinkedIn"></i>`,
  'GitHub':         `<i class="fa-brands fa-github" aria-label="GitHub"></i>`,
  'Google Scholar': `<i class="ai ai-google-scholar-square" aria-label="Google Scholar"></i>`,
  'ORCID':          `<i class="ai ai-orcid-square" aria-label="ORCID"></i>`,
};

const EXT_LINK = 'target="_blank" rel="noopener noreferrer"';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

/* Everything from data/*.json goes through esc() before it reaches innerHTML,
   so a name or affiliation containing &, <, or a quote cannot break the markup. */
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ESC_MAP[c]);

function iconsFor(links) {
  return (links || []).reduce((html, l) => {
    const icon = ICONS[l.label];
    return icon && l.url
      ? html + `<a href="${esc(l.url)}" class="org-icon" ${EXT_LINK} title="${esc(l.label)}">${icon}</a>`
      : html;
  }, '');
}

async function loadEditions() {
  const tbody = document.getElementById('editions-tbody');
  try {
    const { editions } = await fetchJSON('data/editions.json');
    /* The link lives inside the year cell and is stretched over the whole row
       in CSS, so the row stays a real table row for assistive tech. A missing
       field shows as TBD, and an edition without a url renders unlinked. */
    tbody.innerHTML = editions.map(e => {
      const year = esc(e.year) || 'TBD';
      const yearHtml = e.url
        ? `<a class="editions-link" href="${esc(e.url)}" ${EXT_LINK}>${year}</a>`
        : year;
      return `
      <div class="editions-row" role="row">
        <span class="editions-year" role="cell">${yearHtml}</span>
        <span role="cell">${esc(e.conference) || 'TBD'}</span>
        <span class="editions-location" role="cell">${esc(e.location) || 'TBD'}</span>
      </div>`;
    }).join('');
  } catch {
    tbody.innerHTML = '<div class="editions-row" role="row"><span class="data-error editions-error" role="cell">Could not load edition data.</span></div>';
  }
}

async function loadOrganizers() {
  const list = document.getElementById('org-list');
  try {
    const { organizers } = await fetchJSON('data/organizers.json');
    list.innerHTML = organizers.map(org => {
      const nameHtml = org.website
        ? `<a href="${esc(org.website)}" class="org-item-name" ${EXT_LINK}>${esc(org.name)}</a>`
        : `<span class="org-item-name">${esc(org.name)}</span>`;
      const icons = iconsFor(org.links);
      return `<li class="org-item">
        ${nameHtml}
        <span class="org-item-affil">${esc(org.affiliation)}</span>
        ${icons ? `<span class="org-card-icons">${icons}</span>` : ''}
      </li>`;
    }).join('');
  } catch {
    list.innerHTML = '<li class="data-error">Could not load organizer data.</li>';
  }
}

Promise.all([loadEditions(), loadOrganizers()]).catch(console.error);

/* ---- Mobile nav ---- */

const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.getElementById('nav-links');

const closeNav = () => {
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', false);
};

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
});

navLinks.addEventListener('click', e => {
  if (e.target.closest('a')) closeNav();
});

document.addEventListener('click', e => {
  if (!navLinks.classList.contains('open')) return;
  if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) closeNav();
});

/* ---- Hero: let the backronym initials settle in when scrolled into view.
   Plays at most twice, then stops observing. CSS suppresses it entirely
   under prefers-reduced-motion. ---- */

const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle && 'IntersectionObserver' in window) {
  let plays = 0;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heroSubtitle.classList.remove('is-revealing');
        void heroSubtitle.offsetWidth;
        heroSubtitle.classList.add('is-revealing');
        plays++;
        if (plays >= 2) observer.disconnect();
      } else {
        heroSubtitle.classList.remove('is-revealing');
      }
    });
  }, { threshold: 0.6 });
  observer.observe(heroSubtitle);
}
