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

function iconsFor(links) {
  return (links || []).reduce((html, l) => {
    const icon = ICONS[l.label];
    return icon && l.url
      ? html + `<a href="${l.url}" class="org-icon" ${EXT_LINK} title="${l.label}">${icon}</a>`
      : html;
  }, '');
}

async function loadEditions() {
  const tbody = document.getElementById('editions-tbody');
  try {
    const { editions } = await fetchJSON('data/editions.json');
    tbody.innerHTML = editions.map(e => `
      <a class="editions-row" role="row" href="${e.url}" ${EXT_LINK}>
        <span class="editions-year" role="cell">${e.year}</span>
        <span role="cell">${e.conference}</span>
        <span class="editions-location" role="cell">${e.location}</span>
      </a>`).join('');
  } catch {
    tbody.innerHTML = '<p class="data-error">Could not load edition data.</p>';
  }
}

async function loadOrganizers() {
  const list = document.getElementById('org-list');
  try {
    const { organizers } = await fetchJSON('data/organizers.json');
    list.innerHTML = organizers.map(org => {
      const nameHtml = org.website
        ? `<a href="${org.website}" class="org-item-name" ${EXT_LINK}>${org.name}</a>`
        : `<span class="org-item-name">${org.name}</span>`;
      const icons = iconsFor(org.links);
      return `<li class="org-item">
        ${nameHtml}
        <span class="org-item-affil">${org.affiliation}</span>
        ${icons ? `<span class="org-card-icons">${icons}</span>` : ''}
      </li>`;
    }).join('');
  } catch {
    list.innerHTML = '<p class="data-error">Could not load organizer data.</p>';
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
