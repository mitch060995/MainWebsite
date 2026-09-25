// Scroll-driven "build a website" hero animation
(function () {
  const section = document.querySelector('.build');
  const steps = section.querySelectorAll('.steps li');
  const blocks = section.querySelectorAll('.blk');
  const urlText = section.querySelector('.url-text');
  const URL = 'yourbusiness.com.au';
  const STAGES = 5;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(progress) {
    const stage = Math.min(STAGES - 1, Math.floor(progress * STAGES));
    const within = progress * STAGES - stage; // 0..1 inside current stage

    section.dataset.stage = stage;

    steps.forEach((li, i) => {
      li.classList.toggle('active', i === stage);
      li.classList.toggle('done', i < stage);
    });

    // Stage 0: wireframe blocks draw in one after another
    blocks.forEach((b, i) => {
      b.classList.toggle('drawn', stage > 0 || within > i / blocks.length);
    });

    // Stage 3+: the address types into the browser bar
    let chars = 0;
    if (stage === 3) chars = Math.ceil(Math.min(1, within * 1.6) * URL.length);
    if (stage > 3) chars = URL.length;
    urlText.textContent = URL.slice(0, chars);
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const total = section.offsetHeight - window.innerHeight;
    const progress = Math.min(0.9999, Math.max(0, -rect.top / total));
    render(progress);
  }

  if (reduced) {
    render(0.9999); // show the finished, maintained site
  } else {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => { onScroll(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }
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
