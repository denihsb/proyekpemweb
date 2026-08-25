// ── Custom Cursor ─────────────────────────────────────────────
export function initCursor() {
  // The new visual direction intentionally avoids decorative cursor motion.
  return;
}

// ── Scroll Reveal ─────────────────────────────────────────────
export function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

// ── Grain Overlay ─────────────────────────────────────────────
export function initGrain() {
  return;
}

// ── Page Transition ───────────────────────────────────────────
export function initPageTransition() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('page-transition--out');
  });

  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    e.preventDefault();
    overlay.classList.remove('page-transition--out');
    setTimeout(() => { window.location.href = href; }, 220);
  });
}
