// ── CURSOR ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});

(function loop() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(loop);
})();

document.querySelectorAll('a, button, .service-item, .portfolio-item').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    ring.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    ring.classList.remove('hover');
  });
});

// ── NAV ──
const nav = document.getElementById('nav');
const navToggle = document.querySelector('.nav-toggle');
const navToggleIcon = document.querySelector('.nav-toggle-icon');

if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

if (nav && navToggle) {
  const setMenuState = isOpen => {
    nav.classList.toggle('menu-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

    if (navToggleIcon) {
      navToggleIcon.textContent = isOpen ? '×' : '☰';
    }
  };

  navToggle.addEventListener('click', () => {
    setMenuState(!nav.classList.contains('menu-open'));
  });

  nav.querySelectorAll('.nav-links a, .nav-cta a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuState(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenuState(false);
    }
  });
}

// ── SCROLL REVEAL ──
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(r => io.observe(r));

// ── PORTFOLIO FILTERS ──
const filterButtons = document.querySelectorAll('[data-filter]');
const filterCards = document.querySelectorAll('.portfolio-card[data-category]');

if (filterButtons.length && filterCards.length) {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedFilter = button.dataset.filter;

      filterButtons.forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');

      filterCards.forEach(card => {
        const shouldShow = selectedFilter === 'all' || card.dataset.category === selectedFilter;
        card.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });
}

// ── HERO CANVAS PARTICLES ──
const heroCanvas = document.getElementById('heroCanvas');
const heroMImage = document.getElementById('heroMImage');

if (heroCanvas) {
  const heroCtx = heroCanvas.getContext('2d');
  const convergenceFactor = 0.03;
  const arrivalThresholdSq = 4;
  let heroParticles = [];
  let heroAnimationId = 0;
  let heroStartTimeout = 0;
  let pageLoaded = false;
  let imageLoaded = false;
  let heroHasCrossfaded = false;

  const logoImage = new Image();
  logoImage.src = 'assets/logos/logo-m-verde.png';

  heroCanvas.style.transition = 'opacity 1.8s cubic-bezier(.4,0,.2,1)';
  if (heroMImage) {
    heroMImage.style.transition = 'opacity 1.8s cubic-bezier(.4,0,.2,1)';
  }

  const setupHeroCanvasSize = () => {
    heroCanvas.width = logoImage.naturalWidth;
    heroCanvas.height = logoImage.naturalHeight;
  };

  const buildHeroParticles = () => {
    const offscreen = document.createElement('canvas');
    const offscreenCtx = offscreen.getContext('2d');
    offscreen.width = logoImage.naturalWidth;
    offscreen.height = logoImage.naturalHeight;
    offscreenCtx.drawImage(logoImage, 0, 0);

    const pixels = offscreenCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
    const sx = heroCanvas.width / offscreen.width;
    const sy = heroCanvas.height / offscreen.height;
    const scatterMinX = -heroCanvas.width;
    const scatterMaxX = heroCanvas.width * 2;
    const scatterMinY = -heroCanvas.height;
    const scatterMaxY = heroCanvas.height * 2;

    heroParticles = [];

    for (let y = 0; y < offscreen.height; y += 3) {
      for (let x = 0; x < offscreen.width; x += 3) {
        const index = (y * offscreen.width + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 128) {
          heroParticles.push({
            x: scatterMinX + Math.random() * (scatterMaxX - scatterMinX),
            y: scatterMinY + Math.random() * (scatterMaxY - scatterMinY),
            tx: x * sx,
            ty: y * sy,
            color: `rgba(${pixels[index]}, ${pixels[index + 1]}, ${pixels[index + 2]}, ${alpha / 255})`
          });
        }
      }
    }
  };

  const animateHeroParticles = timestamp => {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    let arrivedParticles = 0;

    for (const particle of heroParticles) {
      particle.x += (particle.tx - particle.x) * convergenceFactor;
      particle.y += (particle.ty - particle.y) * convergenceFactor;

      const dx = particle.tx - particle.x;
      const dy = particle.ty - particle.y;
      if ((dx * dx + dy * dy) <= arrivalThresholdSq) {
        arrivedParticles += 1;
      }

      heroCtx.fillStyle = particle.color;
      heroCtx.fillRect(particle.x, particle.y, 2, 2);
    }

    const arrivalRatio = heroParticles.length ? arrivedParticles / heroParticles.length : 0;

    if (arrivalRatio >= 0.98 && !heroHasCrossfaded) {
      heroHasCrossfaded = true;

      heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      for (const particle of heroParticles) {
        heroCtx.fillStyle = particle.color;
        heroCtx.fillRect(particle.tx, particle.ty, 2, 2);
      }

      heroCanvas.classList.add('is-faded');
      if (heroMImage) {
        heroMImage.classList.add('is-visible');
      }

      return;
    }

    heroAnimationId = requestAnimationFrame(animateHeroParticles);
  };

  const initHeroParticles = () => {
    cancelAnimationFrame(heroAnimationId);
    clearTimeout(heroStartTimeout);
    heroHasCrossfaded = false;

    heroCanvas.classList.remove('is-faded');
    if (heroMImage) {
      heroMImage.classList.remove('is-visible');
    }

    if (!pageLoaded || !imageLoaded) {
      return;
    }

    setupHeroCanvasSize();
    buildHeroParticles();

    heroStartTimeout = setTimeout(() => {
      heroAnimationId = requestAnimationFrame(animateHeroParticles);
    }, 800);
  };

  logoImage.addEventListener('load', () => {
    imageLoaded = true;
    initHeroParticles();
  });

  window.addEventListener('load', () => {
    pageLoaded = true;
    initHeroParticles();
  });

  if (logoImage.complete) {
    imageLoaded = true;
  }

  if (document.readyState === 'complete') {
    pageLoaded = true;
  }

  initHeroParticles();
  window.addEventListener('resize', initHeroParticles);
}