// Scroll-driven hero: particles take a new shape at each step
// (Plan → lightbulb, Design → wireframe, Build → </>, Launch → the real site, Maintain → orbiting the site)
(function () {
  const section = document.querySelector('.build');
  const steps = section.querySelectorAll('.steps li');
  const stage = section.querySelector('.stage');
  const site = section.querySelector('.site');
  const canvas = section.querySelector('.particles');
  const hint = section.querySelector('.scroll-hint');
  const hintText = hint.querySelector('.hint-text');
  const HINTS = [
    'Scroll to watch a site come together',
    'Keep scrolling, the design is taking shape',
    'Nearly there, it’s being built',
    'Going live…',
    '✓ Finished, and looked after',
  ];
  let hintStep = 0, hintTimer;
  const ctx = canvas.getContext('2d');
  const STAGES = 5;
  const N = 1400;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Colour pair per step: [main, highlight]
  const PALETTES = [
    [[245, 158, 11], [253, 230, 138]],  // Plan: warm idea
    [[56, 189, 248], [232, 236, 242]],  // Design: blueprint
    [[74, 222, 128], [56, 189, 248]],   // Build: code
    [[74, 222, 128], [187, 247, 208]],  // Launch
    [[74, 222, 128], [56, 189, 248]],   // Maintain
  ];

  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let w = 0, h = 0, shapes = null, perimeter = null, time = 0;
  const parts = Array.from({ length: N }, () => ({
    phase: Math.random() * 7, speed: 0.4 + Math.random(), tone: Math.random(),
    size: 0.9 + Math.random() * 1.4, delay: Math.random() * 0.3, jitter: (Math.random() - 0.5) * 12,
  }));

  // Draw a shape offscreen, then pick N random points from its pixels
  function sample(draw) {
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const c = off.getContext('2d');
    c.strokeStyle = c.fillStyle = '#fff';
    c.lineWidth = 2;
    draw(c);
    const data = c.getImageData(0, 0, w, h).data, pts = [];
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (data[(y * w + x) * 4 + 3] > 128) pts.push([x, y]);
    return parts.map(() => pts[Math.floor(Math.random() * pts.length)] || [w / 2, h / 2]);
  }

  // Rectangles of the real site's parts, relative to the stage
  function rects() {
    const base = stage.getBoundingClientRect();
    return [site, ...site.querySelectorAll('.site-bar, .site-hero, .site-cards div')].map((el) => {
      const r = el.getBoundingClientRect();
      return [r.left - base.left, r.top - base.top, r.width, r.height];
    });
  }

  function build() {
    const box = stage.getBoundingClientRect();
    if (!box.width) return;
    w = Math.round(box.width); h = Math.round(box.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const blocks = rects();
    const m = Math.min(w, h);

    const cloud = parts.map(() => {
      const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * m * 0.55;
      return [w / 2 + Math.cos(a) * r * 1.3, h / 2 + Math.sin(a) * r];
    });

    const bulb = sample((c) => {
      const cx = w / 2, cy = h * 0.4, r = m * 0.22;
      c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25); c.stroke();
      c.beginPath(); c.moveTo(cx - r * 0.7, cy + r * 0.7); c.lineTo(cx - r * 0.45, cy + r * 1.25);
      c.lineTo(cx + r * 0.45, cy + r * 1.25); c.lineTo(cx + r * 0.7, cy + r * 0.7); c.stroke();
      c.fillRect(cx - r * 0.45, cy + r * 1.35, r * 0.9, 5);
      c.fillRect(cx - r * 0.35, cy + r * 1.5, r * 0.7, 5);
      c.beginPath(); c.moveTo(cx - r * 0.3, cy + r * 0.2); c.lineTo(cx - r * 0.12, cy - r * 0.15);
      c.lineTo(cx, cy + r * 0.1); c.lineTo(cx + r * 0.12, cy - r * 0.15); c.lineTo(cx + r * 0.3, cy + r * 0.2); c.stroke();
      for (let i = 0; i < 7; i++) {  // rays
        const a = Math.PI * (1.05 + i * 0.15);
        c.beginPath(); c.moveTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25);
        c.lineTo(cx + Math.cos(a) * r * 1.55, cy + Math.sin(a) * r * 1.55); c.stroke();
      }
    });

    const wire = sample((c) => {
      c.setLineDash([6, 5]);
      blocks.forEach(([x, y, bw, bh]) => { c.beginPath(); c.roundRect(x + 1, y + 1, bw - 2, bh - 2, 8); c.stroke(); });
      c.setLineDash([]); c.lineWidth = 6;
      const [hx, hy, hw, hh] = blocks[2];  // text placeholders in the hero
      [[0.3, 0.55], [0.48, 0.4]].forEach(([yy, len]) => {
        c.beginPath(); c.moveTo(hx + hw * 0.07, hy + hh * yy); c.lineTo(hx + hw * (0.07 + len), hy + hh * yy); c.stroke();
      });
    });

    const code = sample((c) => {
      c.font = `700 ${Math.round(m * 0.5)}px "Space Grotesk", sans-serif`;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('</>', w / 2, h / 2);
    });

    const solid = sample((c) => {
      blocks.slice(1).forEach(([x, y, bw, bh]) => c.fillRect(x, y, bw, bh));
    });

    shapes = [cloud, bulb, wire, code, solid];
    const [x, y, bw, bh] = blocks[0];
    perimeter = { x, y, w: bw, h: bh };
  }

  // A point that travels around the edge of the site (Maintain)
  function orbit(p, i) {
    const { x, y, w: pw, h: ph } = perimeter, len = 2 * (pw + ph);
    let d = (((i / N) + time * 0.02) % 1) * len;
    const j = p.jitter;
    if (d < pw) return [x + d, y + j];
    d -= pw; if (d < ph) return [x + pw + j, y + d];
    d -= ph; if (d < pw) return [x + pw - d, y + ph + j];
    d -= pw; return [x + j, y + ph - d];
  }

  function render(progress) {
    const step = Math.min(STAGES - 1, Math.floor(progress * STAGES));
    const within = progress * STAGES - step;  // 0..1 inside current step

    section.dataset.stage = step;
    if (step !== hintStep) {  // fade the hint out, swap the words, fade back in
      hintStep = step;
      clearTimeout(hintTimer);
      hint.classList.add('swap');
      hintTimer = setTimeout(() => { hintText.textContent = HINTS[hintStep]; hint.classList.remove('swap'); }, 200);
    }
    steps.forEach((li, i) => {
      li.classList.toggle('active', i === step);
      li.classList.toggle('done', i < step);
    });
    if (!shapes) return;

    // Launch: the real site fades in over the particles; Maintain: it stays
    const reveal = step === 3 ? clamp01((within - 0.45) / 0.3) : step === 4 ? 1 : 0;
    site.style.opacity = reveal;

    ctx.clearRect(0, 0, w, h);
    const from = shapes[step], to = shapes[step + 1];
    const pal0 = PALETTES[Math.max(0, step - 1)], pal1 = PALETTES[step];

    parts.forEach((p, i) => {
      const k = ease(clamp01((within - p.delay) / 0.55));
      const [tx, ty] = step === 4 ? orbit(p, i) : to[i];
      const [fx, fy] = from[i];
      const wobble = (1 - k) * 16 + 1.2;
      const x = lerp(fx, tx, k) + Math.sin(time * p.speed + p.phase) * wobble;
      const y = lerp(fy, ty, k) + Math.cos(time * p.speed * 0.8 + p.phase) * wobble;

      const tone = p.tone < 0.65 ? 0 : 1;
      const a = pal0[tone], b = pal1[tone], ck = step === 0 ? 1 : k;
      let alpha = 0.9;
      if (step === 3) alpha = 0.9 - reveal * 0.8;
      if (step === 4) alpha = lerp(0.1, 0.85, k);
      ctx.fillStyle = `rgba(${lerp(a[0], b[0], ck) | 0},${lerp(a[1], b[1], ck) | 0},${lerp(a[2], b[2], ck) | 0},${alpha})`;
      ctx.fillRect(x, y, p.size, p.size);
    });
  }

  function progressNow() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    return Math.min(0.9999, Math.max(0, -rect.top / total));
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); render(reduced ? 0.9999 : progressNow()); }, 150);
  });

  document.fonts.ready.then(() => {
    build();
    if (reduced) { render(0.9999); return; }  // show the finished, maintained site
    (function frame() {
      requestAnimationFrame(frame);
      if (section.getBoundingClientRect().bottom < 0) return;  // off screen: skip work
      time += 0.016;
      render(progressNow());
    })();
  });
})();

// Contact form: opens the visitor's email app with the enquiry filled in.
// Swap CONTACT_EMAIL for your real address (or hook up Formspree/Netlify Forms later).
(function () {
  const CONTACT_EMAIL = 'hello@example.com';
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = `Website enquiry from ${d.get('name')}`;
    const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nBusiness: ${d.get('business') || '-'}\n\n${d.get('message')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
