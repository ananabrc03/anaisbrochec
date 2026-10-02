// Navigation, filters and shared interactions. Contact/admin keep their own scripts.
const lang = document.body.dataset.lang || 'fr';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const motion = reduced ? 'instant' : 'smooth';
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
document.querySelector('.burger')?.addEventListener('click', () => menu?.showModal());
document.querySelector('.menu-close')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('click', (e) => {
  if (e.target === menu && e.clientX < menu.getBoundingClientRect().left) menu.close();
});
window.addEventListener(
  'scroll',
  () => document.querySelector('.header')?.classList.toggle('compact', scrollY > 40),
  { passive: true },
);
document
  .querySelector<HTMLAnchorElement>('[data-language-switch]')
  ?.addEventListener('click', function () {
    this.hash = location.hash;
    this.search = location.search;
    try {
      localStorage.setItem('lang', lang === 'fr' ? 'en' : 'fr');
    } catch {}
  });
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(b.dataset.copy!);
      const old = b.textContent;
      b.textContent = b.dataset.copied!;
      b.setAttribute('aria-live', 'polite');
      setTimeout(() => (b.textContent = old), 2000);
    } catch {}
  }),
);
if (!reduced) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll('.project-card,.all-projects,.timeline-card,.kpi').forEach((el) => {
    el.classList.add('reveal-ready');
    observer.observe(el);
  });
  const moving = new IntersectionObserver((entries) =>
    entries.forEach((e) => e.target.classList.toggle('paused', !e.isIntersecting)),
  );
  document.querySelectorAll('.portrait-stage,.marquee,.ribbon').forEach((e) => moving.observe(e));
}
document.addEventListener('visibilitychange', () =>
  document.body.classList.toggle('paused', document.hidden),
);
const projectFilters = [...document.querySelectorAll<HTMLButtonElement>('[data-project-filter]')];
function filterProjects(value: string) {
  projectFilters.forEach((b) => {
    const active = b.dataset.projectFilter === value;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  let visible = 0;
  document.querySelectorAll<HTMLElement>('[data-domains]').forEach((p) => {
    p.hidden = value !== 'all' && !p.dataset.domains?.split(' ').includes(value);
    if (!p.hidden) visible++;
  });
  const empty = document.querySelector<HTMLElement>('.empty-projects');
  if (empty) empty.hidden = visible > 0;
}
projectFilters.forEach((b) =>
  b.addEventListener('click', () => {
    const value = b.dataset.projectFilter!;
    filterProjects(value);
    const url = new URL(location.href);
    value === 'all' ? url.searchParams.delete('domaine') : url.searchParams.set('domaine', value);
    history.replaceState(null, '', url);
  }),
);
if (projectFilters.length) {
  const initial = new URL(location.href).searchParams.get('domaine') || 'all';
  filterProjects(projectFilters.some((b) => b.dataset.projectFilter === initial) ? initial : 'all');
}
const modeButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-mode]')];
function setMode(mode: string) {
  modeButtons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.mode === mode)));
  document.querySelectorAll<HTMLDetailsElement>('[data-skill-mode]').forEach((d) => {
    d.open = false;
    d.hidden = d.dataset.skillMode !== mode;
  });
}
modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode!)));
document.querySelector('.segmented')?.addEventListener('keydown', (e) => {
  const k = e as KeyboardEvent;
  if (['ArrowLeft', 'ArrowRight'].includes(k.key)) {
    k.preventDefault();
    const current = modeButtons.findIndex((b) => b.getAttribute('aria-checked') === 'true');
    const next = modeButtons[(current + 1) % 2];
    setMode(next.dataset.mode!);
    next.focus();
  }
});
function filterTools(value: string) {
  document.querySelectorAll<HTMLButtonElement>('[data-tool-filter]').forEach((b) => {
    const active = b.dataset.toolFilter === value;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  document
    .querySelectorAll<HTMLElement>('[data-tool-category]')
    .forEach((t) => (t.hidden = t.dataset.toolCategory !== value));
}
document
  .querySelectorAll<HTMLButtonElement>('[data-tool-filter]')
  .forEach((b) => b.addEventListener('click', () => filterTools(b.dataset.toolFilter!)));
const entries = [...document.querySelectorAll<HTMLElement>('.timeline-entry')];
const timelineToggle = document.querySelector<HTMLButtonElement>('.timeline-toggle');
let timelineExpanded = false,
  timelineCategory = 'all';
function updateTimeline() {
  let count = 0;
  entries.forEach((e) => {
    const match = timelineCategory === 'all' || e.dataset.category === timelineCategory;
    e.hidden = !match || (!timelineExpanded && count >= 3);
    if (match) count++;
  });
  if (timelineToggle) {
    timelineToggle.hidden = count <= 3;
    timelineToggle.textContent = timelineExpanded
      ? timelineToggle.dataset.less!
      : timelineToggle.dataset.more!;
    timelineToggle.setAttribute('aria-expanded', String(timelineExpanded));
  }
}
timelineToggle?.addEventListener('click', () => {
  timelineExpanded = !timelineExpanded;
  updateTimeline();
  if (!timelineExpanded) document.querySelector('#parcours')?.scrollIntoView({ behavior: motion });
});
document.querySelectorAll<HTMLButtonElement>('[data-timeline-filter]').forEach((b) =>
  b.addEventListener('click', () => {
    timelineCategory = b.dataset.timelineFilter!;
    timelineExpanded = false;
    document.querySelectorAll<HTMLButtonElement>('[data-timeline-filter]').forEach((x) => {
      const active = x === b;
      x.setAttribute('aria-pressed', String(active));
      x.classList.toggle('active', active);
    });
    updateTimeline();
  }),
);
updateTimeline();
// Deep links open the matching accordion and reveal hidden tools before scrolling.
function openHash() {
  let hash = '';
  try {
    hash = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  const skill = target.closest<HTMLDetailsElement>('[data-skill-mode]');
  if (skill) {
    setMode(skill.dataset.skillMode!);
    skill.open = true;
  }
  if (target.matches('[data-tool-category]')) filterTools(target.dataset.toolCategory!);
  let current: HTMLElement | null = target;
  while (current) {
    if (current instanceof HTMLDetailsElement) current.open = true;
    current = current.parentElement;
  }
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: motion }));
}
openHash();
window.addEventListener('hashchange', openHash);
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', () => {
    const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (target instanceof HTMLDetailsElement) target.open = true;
    if (a.hash === location.hash) openHash();
  }),
);
const cvButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-cv-domain]')];
function selectCV(b: HTMLButtonElement) {
  cvButtons.forEach((x) => {
    x.setAttribute('aria-checked', String(x === b));
    x.tabIndex = x === b ? 0 : -1;
  });
  const panel = document.querySelector<HTMLElement>('.cv-downloads');
  if (panel) panel.hidden = false;
  document.querySelectorAll<HTMLAnchorElement>('[data-cv-lang]').forEach((a) => {
    a.href = '/cv/cv-anais-brochec-' + b.dataset.cvDomain + '-' + a.dataset.cvLang + '.pdf';
    a.dataset.domain = b.dataset.cvDomain;
  });
}
cvButtons.forEach((b, i) => {
  b.tabIndex = i === 0 ? 0 : -1;
  b.addEventListener('click', () => selectCV(b));
  b.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const step = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : -1;
      const next = cvButtons[(i + step + cvButtons.length) % cvButtons.length];
      selectCV(next);
      next.focus();
    }
  });
});
// Native touch scrolling, plus click-and-drag on desktop, without scrollbars.
document.querySelectorAll<HTMLElement>('.carousel').forEach((c) => {
  const slides = c.querySelector<HTMLElement>('.slides')!;
  const prev = c.querySelector<HTMLButtonElement>('[data-prev]'),
    next = c.querySelector<HTMLButtonElement>('[data-next]');
  const step = () =>
    ((slides.firstElementChild as HTMLElement)?.offsetWidth || slides.clientWidth) + 16;
  prev?.addEventListener('click', () => slides.scrollBy({ left: -step(), behavior: motion }));
  next?.addEventListener('click', () => slides.scrollBy({ left: step(), behavior: motion }));
  const controls = () => {
    if (prev) prev.disabled = slides.scrollLeft < 2;
    if (next) next.disabled = slides.scrollLeft + slides.clientWidth >= slides.scrollWidth - 2;
  };
  slides.addEventListener('scroll', controls, { passive: true });
  new ResizeObserver(controls).observe(slides);
  controls();
  let start = 0,
    left = 0,
    dragging = false,
    active = false,
    suppress = false;
  slides.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    start = e.clientX;
    left = slides.scrollLeft;
    active = true;
    suppress = false;
  });
  slides.addEventListener('pointermove', (e) => {
    if (!active) return;
    if (Math.abs(e.clientX - start) > 5 && !dragging) {
      dragging = true;
      suppress = true;
      slides.setPointerCapture(e.pointerId);
      slides.classList.add('is-dragging');
    }
    if (dragging) {
      e.preventDefault();
      slides.scrollLeft = left - (e.clientX - start);
    }
  });
  const end = () => {
    active = false;
    dragging = false;
    slides.classList.remove('is-dragging');
  };
  slides.addEventListener('pointerup', end);
  slides.addEventListener('pointercancel', end);
  slides.addEventListener('pointerleave', () => {
    if (!dragging) active = false;
  });
  slides.addEventListener(
    'click',
    (e) => {
      if (suppress) {
        e.preventDefault();
        e.stopPropagation();
        suppress = false;
      }
    },
    true,
  );
});
const lightbox = document.querySelector<HTMLDialogElement>('.lightbox');
const zoomers = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')];
let gallery: HTMLButtonElement[] = [],
  zoomIndex = 0;
function showZoom(index: number) {
  if (!gallery.length || !lightbox) return;
  zoomIndex = (index + gallery.length) % gallery.length;
  const b = gallery[zoomIndex],
    img = lightbox.querySelector('img')!;
  img.src = b.dataset.lightbox!;
  img.alt = b.getAttribute('aria-label') || '';
  lightbox.querySelector('p')!.textContent =
    img.alt + ' · ' + (zoomIndex + 1) + ' / ' + gallery.length;
  lightbox
    .querySelectorAll<HTMLButtonElement>('.lightbox-prev,.lightbox-next')
    .forEach((button) => (button.hidden = gallery.length < 2));
  if (!lightbox.open) lightbox.showModal();
}
zoomers.forEach((b) =>
  b.addEventListener('click', () => {
    gallery = [...b.closest('.carousel')!.querySelectorAll<HTMLButtonElement>('[data-lightbox]')];
    showZoom(gallery.indexOf(b));
  }),
);
lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => showZoom(zoomIndex - 1));
lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => showZoom(zoomIndex + 1));
lightbox?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    showZoom(zoomIndex - 1);
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    showZoom(zoomIndex + 1);
  }
});
let swipeX = 0,
  swipeY = 0,
  swiping = false;
lightbox?.addEventListener('pointerdown', (e) => {
  if ((e.target as HTMLElement).closest('button')) return;
  swipeX = e.clientX;
  swipeY = e.clientY;
  swiping = true;
  lightbox.setPointerCapture(e.pointerId);
});
lightbox?.addEventListener('pointerup', (e) => {
  if (
    swiping &&
    Math.abs(e.clientX - swipeX) > 45 &&
    Math.abs(e.clientX - swipeX) > Math.abs(e.clientY - swipeY)
  )
    showZoom(zoomIndex + (e.clientX < swipeX ? 1 : -1));
  swiping = false;
});
lightbox?.addEventListener('pointercancel', () => (swiping = false));
const sidebar = document.querySelector('.project-sidebar');
if (sidebar) {
  const spy = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting)
          sidebar
            .querySelectorAll('a')
            .forEach((a) => a.classList.toggle('active', a.hash === '#' + e.target.id));
      }),
    { rootMargin: '-15% 0px -60% 0px' },
  );
  document.querySelectorAll('.project-body [id],#resultats').forEach((e) => spy.observe(e));
}
// Existing anonymous visit/download counters, disabled for local previews and bots.
const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const url = document.body.dataset.supabaseUrl,
  key = document.body.dataset.supabaseKey;
let session = '';
try {
  session = sessionStorage.getItem('portfolio-session') || crypto.randomUUID();
  sessionStorage.setItem('portfolio-session', session);
} catch {
  session = crypto.randomUUID();
}
let referrer = '';
try {
  const ref = new URL(document.referrer);
  if (ref.hostname !== location.hostname) referrer = ref.hostname;
} catch {}
function track(table: string, data: Record<string, unknown>) {
  if (
    local ||
    navigator.webdriver ||
    /bot|crawl|spider|preview/i.test(navigator.userAgent) ||
    location.pathname.startsWith('/admin') ||
    !url ||
    !key
  )
    return;
  fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    keepalive: true,
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ ...data, referrer, session_id: session }),
  }).catch(() => {});
}
window.addEventListener(
  'load',
  () =>
    track('page_views', {
      path: location.pathname,
      langue: lang,
      appareil: innerWidth < 640 ? 'mobile' : innerWidth < 1024 ? 'tablette' : 'ordinateur',
    }),
  { once: true },
);
document
  .querySelectorAll<HTMLAnchorElement>('[data-cv-lang]')
  .forEach((a) =>
    a.addEventListener('click', () =>
      track('cv_downloads', {
        domaine: a.dataset.domain,
        langue_cv: a.dataset.cvLang,
        langue_site: lang,
      }),
    ),
  );
