const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// ── IDIOMA ──
// El HTML está en español; js/i18n.js aporta el inglés. El idioma inicial lo decide
// el script inline del <head> (elección guardada o idioma del dispositivo).
const I18N = window.I18N || { en: {}, meta: {}, ui: {} };
let lang = root.lang === 'en' ? 'en' : 'es';
const t = key => ((I18N.ui || {})[lang] || {})[key] || key;

function parseI18nAttrs(el) {
  return el.dataset.i18nAttr.split(';').map(pair => pair.split(':').map(part => part.trim()));
}

function splitLines(el) {
  el.innerHTML = el.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line, i) => `<span class="ln"><span style="--i:${i}">${line.trim()}</span></span>`)
    .join('');
  el.classList.add('is-split');
}

const i18nEls = [...document.querySelectorAll('[data-i18n]')];
const i18nAttrEls = [...document.querySelectorAll('[data-i18n-attr]')];
const originalHTML = new Map(i18nEls.map(el => [el, el.innerHTML]));
const originalAttrs = new Map(i18nAttrEls.map(el => [el, parseI18nAttrs(el).map(([attr]) => el.getAttribute(attr))]));
const metaDescription = document.querySelector('meta[name="description"]');
const originalMeta = [document.title, metaDescription ? metaDescription.content : ''];
const langButtons = document.querySelectorAll('[data-lang]');

const applyLang = next => {
  lang = next;
  root.lang = next;
  const dict = next === 'es' ? null : (I18N[next] || {});

  i18nEls.forEach(el => {
    const original = originalHTML.get(el);
    const value = dict && dict[el.dataset.i18n] !== undefined ? dict[el.dataset.i18n] : original;
    if (value === original && !el.classList.contains('is-split') && el.innerHTML === original) return;
    el.innerHTML = value;
    if (el.hasAttribute('data-lines')) splitLines(el);
  });

  i18nAttrEls.forEach(el => {
    const originals = originalAttrs.get(el);
    parseI18nAttrs(el).forEach(([attr, key], i) => {
      el.setAttribute(attr, dict && dict[key] !== undefined ? dict[key] : originals[i]);
    });
  });

  const meta = (I18N.meta && I18N.meta[next] || {})[document.body.dataset.page];
  document.title = meta ? meta[0] : originalMeta[0];
  if (metaDescription) metaDescription.content = meta ? meta[1] : originalMeta[1];

  langButtons.forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.lang === next)));
  const toggle = document.querySelector('.nav-toggle');
  if (toggle) toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'menuClose' : 'menuOpen'));
  root.classList.remove('i18n-pending');
};

applyLang(lang);

langButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const next = btn.dataset.lang;
    if (next === lang) return;
    try { localStorage.setItem('lang', next); } catch (e) { /* sin almacenamiento: solo esta visita */ }
    if (reduceMotion) { applyLang(next); return; }
    root.classList.add('lang-fade');
    setTimeout(() => {
      applyLang(next);
      requestAnimationFrame(() => root.classList.remove('lang-fade'));
    }, 220);
  });
});

// ── CURSOR (nota musical) ──
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = '<span class="cursor-stem"></span><span class="cursor-head"></span>';
  document.body.appendChild(cursor);

  let cx = 0, cy = 0, pending = false;
  const render = () => {
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    pending = false;
  };

  // Color según el fondo real bajo el puntero (los botones cambian de relleno al hover)
  const onDarkBg = el => {
    const btn = el.closest('.btn-primary, .btn-outline');
    if (btn) return btn.classList.contains('btn-outline') && !btn.closest('.on-dark');
    return !!el.closest('.on-dark, .site-footer');
  };

  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    cx = e.clientX; cy = e.clientY;
    if (!cursor.classList.contains('is-visible')) {
      document.documentElement.classList.add('has-cursor');
      cursor.classList.add('is-visible');
      render();
    }
    if (!pending) { pending = true; requestAnimationFrame(render); }
  }, { passive: true });

  document.addEventListener('pointerover', e => {
    const el = e.target instanceof Element ? e.target : document.body;
    cursor.classList.toggle('is-link', !!el.closest('a, button, label'));
    cursor.classList.toggle('is-text', !!el.closest('input, textarea, select'));
    cursor.classList.toggle('is-dark', onDarkBg(el));
  });

  document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
}

// ── NAV ──
const nav = document.getElementById('nav');
const navToggle = document.querySelector('.nav-toggle');

const setMenuState = isOpen => {
  if (!nav || !navToggle) return;
  nav.classList.toggle('menu-open', isOpen);
  document.body.classList.toggle('menu-lock', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', t(isOpen ? 'menuClose' : 'menuOpen'));
};

if (navToggle) {
  navToggle.addEventListener('click', () => setMenuState(!nav.classList.contains('menu-open')));
  nav.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => setMenuState(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenuState(false); });
  window.matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenuState(false); });
}

// ── SCROLL (un único listener, agrupado por frame) ──
let lastY = window.scrollY;
let ticking = false;

const onScroll = () => {
  const y = window.scrollY;

  if (nav) {
    nav.classList.toggle('scrolled', y > 40);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > 320 && !nav.classList.contains('menu-open')) nav.classList.add('is-hidden');
    else if (goingUp || y < 320) nav.classList.remove('is-hidden');
  }

  lastY = y;
  ticking = false;
};

window.addEventListener('scroll', () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
}, { passive: true });
onScroll();

// ── TITULARES POR LÍNEAS ──
document.querySelectorAll('[data-lines]:not(.is-split)').forEach(splitLines);

// ── SCROLL REVEAL ──
const revealTargets = document.querySelectorAll('.reveal, [data-lines], .staff, .method-step');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach(el => el.classList.add('visible'));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));
}

// ── BANDA PENTAGRAMA: se pausa fuera de pantalla ──
const staffBand = document.querySelector('.staff-band');
if (staffBand && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => {
    staffBand.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(staffBand);
}

// ── CIFRAS: contador de rodillo ──
// Cada cifra es una tira 0–9 que gira hasta su valor; las unidades dan más vueltas.
const stats = document.querySelector('.hero-stats');

if (stats) {
  stats.querySelectorAll('[data-count]').forEach(el => {
    const value = el.dataset.count;
    const digits = value.split('');
    el.innerHTML = `<span class="sr-only">${value}</span>` + digits.map((digit, i) => {
      const steps = (i + 1) * 10 + Number(digit);
      let strip = '';
      for (let k = 0; k <= steps; k++) strip += `<span>${k % 10}</span>`;
      return `<span class="odo-col" aria-hidden="true" style="--steps:${steps};--i:${i}"><span class="odo-strip">${strip}</span></span>`;
    }).join('');
  });
  stats.classList.add('is-ready');

  const startCount = () => setTimeout(() => stats.classList.add('is-counting'), reduceMotion ? 0 : 650);
  if ('IntersectionObserver' in window) {
    const statsIO = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { startCount(); statsIO.disconnect(); }
    });
    statsIO.observe(stats);
  } else {
    startCount();
  }
}

// ── FORMULARIO DE CONTACTO ──
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  const serviceSelect = contactForm.querySelector('#tipo-proyecto');
  const preset = new URLSearchParams(window.location.search).get('servicio');
  if (serviceSelect && preset && serviceSelect.querySelector(`option[value="${CSS.escape(preset)}"]`)) {
    serviceSelect.value = preset;
  }

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;

    const data = new FormData(contactForm);
    const service = serviceSelect && serviceSelect.value ? serviceSelect.selectedOptions[0].textContent : t('project');
    const subject = `${service} · ${data.get('nombre')}`;
    const body = `${data.get('mensaje')}\n\n— ${data.get('nombre')} (${data.get('email')})`;
    window.location.href = `mailto:${contactForm.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
