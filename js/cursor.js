
// ── Scroll Reveal ─────────────────────────────────────────────
export function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
}

// ── Grain Overlay ─────────────────────────────────────────────
export function initGrain() {
  const canvas = document.createElement('canvas');
  canvas.id = 'grain';
  canvas.style.cssText = `
    position:fixed;inset:0;width:100%;height:100%;
    pointer-events:none;z-index:9999;opacity:0.035;mix-blend-mode:overlay;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let frame = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function drawGrain() {
    frame++;
    if (frame % 3 !== 0) { requestAnimationFrame(drawGrain); return; }

    const { width, height } = canvas;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(drawGrain);
  }

  window.addEventListener('resize', resize);
  resize();
  drawGrain();
}

// ── Page Transition ───────────────────────────────────────────
export function initPageTransition() {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);

  // Fade in on load
  requestAnimationFrame(() => {
    overlay.classList.add('page-transition--out');
  });

  // Fade out on link click
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    e.preventDefault();
    overlay.classList.remove('page-transition--out');
    setTimeout(() => { window.location.href = href; }, 400);
  });
}
