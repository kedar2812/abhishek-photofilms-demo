/* Abhishek Photofilms: interaction layer
   Motion rules: everything animates from its current value (interruptible),
   critically-damped easing by default, overshoot only after a throw. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);

  /* ---------- Always-on, no-dependency features ---------- */
  initClock();
  initEnquiry();

  if (!hasGsap || reduced) {
    // Graceful path: show everything, keep it calm.
    document.body.classList.remove('is-loading');
    const l = $('.loader'); if (l) l.remove();
    initNavPlain();
    return;
  }

  document.documentElement.classList.add('js');
  gsap.registerPlugin(ScrollTrigger);
  const EXPO = 'expo.out';

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const t = id.length > 1 ? $(id) : document.body;
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- Loader → hero entrance ---------- */
  const heroLines = $$('.hero__title .line > span');
  gsap.set(heroLines, { yPercent: 115 });
  gsap.set('.hero__visual .frame', { clipPath: 'inset(100% 0 0 0)' });
  gsap.set('.stamp', { scale: 0, rotate: -90 });
  gsap.set('.nav', { yPercent: -100, opacity: 0 });

  const firstImg = $('.frame__slide img');
  const imgReady = new Promise(res => {
    if (!firstImg || firstImg.complete) return res();
    firstImg.addEventListener('load', res, { once: true });
    firstImg.addEventListener('error', res, { once: true });
  });
  const minTime = new Promise(res => setTimeout(res, 1500));
  const counter = { v: 0 };
  const countEl = $('.js-count');
  const countTween = gsap.to(counter, {
    v: 92, duration: 1.4, ease: 'power2.inOut',
    onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(3, '0'); }
  });
  gsap.to('.loader__bar i', { scaleX: .92, duration: 1.4, ease: 'power2.inOut' });

  Promise.race([Promise.all([imgReady, minTime]), new Promise(r => setTimeout(r, 4500))]).then(() => {
    countTween.kill();
    const tl = gsap.timeline({ defaults: { ease: EXPO } });
    tl.to(counter, { v: 100, duration: .35, ease: 'power1.out', onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(3, '0'); } })
      .to('.loader__bar i', { scaleX: 1, duration: .35, ease: 'power1.out' }, '<')
      .to('.loader__inner', { yPercent: -20, opacity: 0, duration: .6, ease: 'power3.in' }, '+=.05')
      .to('.loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '-=.2')
      .add(() => { document.body.classList.remove('is-loading'); lenis && lenis.start(); }, '-=.5')
      .to(heroLines, { yPercent: 0, duration: 1.4, stagger: .09 }, '-=.55')
      .to('.hero__visual .frame', { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut' }, '<')
      .fromTo('.frame__slide.is-active img', { scale: 1.35 }, { scale: 1.12, duration: 2.2 }, '<')
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1.1, stagger: .08 }, '-=1.1')
      .to('.nav', { yPercent: 0, opacity: 1, duration: 1 }, '<')
      .to('.stamp', { scale: 1, rotate: 0, duration: 1.2, ease: 'back.out(1.6)' }, '-=.9')
      .from('.hero__foot', { opacity: 0, y: 12, duration: 1 }, '<')
      .add(() => { $('.loader')?.remove(); startHeroCycle(); });
  });

  /* ---------- Hero: shot-by-shot slideshow ---------- */
  const slides = $$('.frame__slide');
  const captions = [
    'Rajas Shringar · Bridal portrait',
    'Pramila & Amol · Temple pre-wedding',
    'Shyamal & Prathmesh · Lakeside',
    'Marathmola Thaat · Heritage shoot',
    'Forever · Morning light, Pune'
  ];
  const capEl = $('.js-cap'), idxEl = $('.js-idx');
  let cur = 0, cycleTimer = null, heroVisible = true;

  function goTo(n) {
    const prev = slides[cur], next = slides[n];
    if (prev === next) return;
    gsap.set(next, { zIndex: 2, clipPath: 'inset(100% 0 0 0)' });
    gsap.set(prev, { zIndex: 1 });
    gsap.timeline({ defaults: { ease: 'expo.inOut' } })
      .to(next, { clipPath: 'inset(0% 0 0 0)', duration: 1.3 })
      .fromTo(next.querySelector('img'), { scale: 1.3, yPercent: 6 }, { scale: 1.12, yPercent: 0, duration: 1.6, ease: EXPO }, '<')
      .to(prev.querySelector('img'), { yPercent: -8, duration: 1.3 }, '<')
      .add(() => {
        prev.classList.remove('is-active'); next.classList.add('is-active');
        gsap.set(prev, { clipPath: 'inset(100% 0 0 0)', zIndex: 0 });
        gsap.set(prev.querySelector('img'), { yPercent: 0 });
      });
    gsap.timeline()
      .to(capEl, { yPercent: -60, opacity: 0, duration: .35, ease: 'power2.in' })
      .add(() => { capEl.textContent = captions[n]; idxEl.textContent = String(n + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0'); })
      .fromTo(capEl, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: EXPO });
    cur = n;
  }
  function startHeroCycle() {
    clearInterval(cycleTimer);
    cycleTimer = setInterval(() => { if (heroVisible && !document.hidden) goTo((cur + 1) % slides.length); }, 3600);
  }
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: s => { heroVisible = s.isActive; } });

  // Timecode on the viewfinder, 25 fps
  const tc = $('.js-tc'); const t0 = performance.now();
  gsap.ticker.add(() => {
    if (!heroVisible) return;
    const ms = performance.now() - t0, f = Math.floor(ms / 40) % 25, s = Math.floor(ms / 1000);
    tc.textContent = `00:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
  });

  // Hero scroll-away parallax
  gsap.to('.hero__copy', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__visual', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.stamp', { rotate: 220, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Nav: translucent after scroll, hides on the way down ---------- */
  const nav = $('.nav'); let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      nav.classList.toggle('is-hidden', y > 700 && y > lastY + 2);
      if (y < lastY - 2) nav.classList.remove('is-hidden');
      lastY = y;
    }
  });

  // Nav switches material over dark chapters
  const darkSecs = $$('.marathi, .films, .book, .footer');
  const checkDark = () => {
    const probe = 36;
    nav.classList.toggle('is-dark', darkSecs.some(sec => { const r = sec.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; }));
  };
  gsap.ticker.add(checkDark);

  /* ---------- Marquee: velocity-aware, follows scroll direction ---------- */
  const mq = $('.marquee__track');
  if (mq) {
    let x = 0, dir = -1, boost = 0, sk = 0, half = mq.scrollWidth / 2;
    addEventListener('resize', () => { half = mq.scrollWidth / 2; });
    gsap.ticker.add((t, dt) => {
      const k = dt / 16.67, v = lenis ? lenis.velocity : 0;
      if (Math.abs(v) > .1) dir = v > 0 ? -1 : 1;
      boost += (Math.min(Math.abs(v) * 1.4, 30) - boost) * .08 * k;
      sk += (gsap.utils.clamp(-7, 7, -v * .22) - sk) * .1 * k;
      x += dir * (0.9 + boost) * k;
      if (x <= -half) x += half; if (x > 0) x -= half;
      mq.style.transform = `translate3d(${x}px,0,0) skewX(${sk}deg)`;
    });
  }

  /* ---------- Manifesto: words light up as you read ---------- */
  const mt = $('.js-words');
  if (mt) {
    mt.innerHTML = mt.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    gsap.to($$('.w', mt), {
      opacity: 1, stagger: .5, ease: 'none',
      scrollTrigger: { trigger: mt, start: 'top 78%', end: 'bottom 42%', scrub: .6 }
    });
  }

  /* ---------- Generic parallax ---------- */
  $$('[data-speed]').forEach(el => {
    const sp = parseFloat(el.dataset.speed) || 0;
    gsap.fromTo(el, { yPercent: -sp }, {
      yPercent: sp, ease: 'none',
      scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  });

  /* ---------- Section reveals ---------- */
  const revealSel = ['.label:not(.hero .label)', '.h2:not(.story--end .h2)', '.marathi__copy', '.films__copy', '.covers__copy', '.occ__row', '.step', '.book__mr', '.enquiry', '.footer__top > *'];
  const revealEls = $$(revealSel.join(',')).filter(el => !el.closest('.hero'));
  gsap.set(revealEls, { opacity: 0, y: 40 });
  ScrollTrigger.batch(revealEls, {
    start: 'top 88%',
    onEnter: b => gsap.to(b, { opacity: 1, y: 0, duration: 1.2, stagger: .08, ease: EXPO, overwrite: true })
  });

  // Photographs open like a shutter
  $$('.c, .manifesto__img, .film figure').forEach(el => {
    const img = el.querySelector('img');
    gsap.set(el, { clipPath: 'inset(100% 0 0 0)' });
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut' });
        if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1.04, duration: 2, ease: EXPO });
      }
    });
  });

  // Big book title, line-by-line
  gsap.from('.book__title', { yPercent: 30, opacity: 0, duration: 1.4, ease: EXPO, scrollTrigger: { trigger: '.book', start: 'top 70%' } });
  gsap.from('.footer__word', { yPercent: 40, opacity: 0, duration: 1.6, ease: EXPO, scrollTrigger: { trigger: '.footer', start: 'top 85%' } });

  // Process: the sindoor line draws across each step
  $$('.step').forEach((s, i) => {
    gsap.to(s, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: `top ${80 - i * 6}%`, end: `top ${40 - i * 6}%`, scrub: true } });
  });

  /* ---------- Stories: pinned horizontal scroll (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('.stories__track');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.stories', pin: '.stories__pin', start: 'top top',
        end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => gsap.set('.stories__progress i', { scaleX: s.progress })
      }
    });
    // inner parallax inside each frame while it travels
    $$('.story figure img').forEach(img => {
      gsap.fromTo(img, { xPercent: -6 }, {
        xPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.closest('.story'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true }
      });
    });
    gsap.from('.story', { y: 80, opacity: 0, duration: 1.3, stagger: .08, ease: EXPO, scrollTrigger: { trigger: '.stories', start: 'top 70%' } });
    return () => gsap.set(track, { x: 0 });
  });

  /* ---------- Covers: auto-drift + drag with momentum ---------- */
  const rowsWrap = $('.covers__rows');
  if (rowsWrap) {
    const rows = $$('.covers__row', rowsWrap).map((el, i) => ({ el, x: i ? -el.scrollWidth / 4 : 0, dir: i ? 1 : -1, half: el.scrollWidth / 2 }));
    addEventListener('resize', () => rows.forEach(r => { r.half = r.el.scrollWidth / 2; }));
    let dragging = false, lastX = 0, vel = 0, hist = [], hover = 0, hoverTarget = 0;
    rowsWrap.addEventListener('pointerenter', () => { hoverTarget = 1; });
    rowsWrap.addEventListener('pointerleave', () => { hoverTarget = 0; });
    rowsWrap.addEventListener('pointerdown', e => {
      dragging = true; lastX = e.clientX; vel = 0; hist = [{ x: e.clientX, t: performance.now() }];
      rowsWrap.setPointerCapture(e.pointerId); rowsWrap.classList.add('is-dragging');
    });
    rowsWrap.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX;
      rows.forEach(r => { r.x += dx; }); // rows track the finger 1:1
      const now = performance.now(); hist.push({ x: e.clientX, t: now }); hist = hist.filter(h => now - h.t < 100);
    });
    const release = () => {
      if (!dragging) return; dragging = false; rowsWrap.classList.remove('is-dragging');
      const a = hist[0], b = hist[hist.length - 1];
      vel = a && b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) * 16.67 : 0; // px per frame, handed off to inertia
    };
    rowsWrap.addEventListener('pointerup', release);
    rowsWrap.addEventListener('pointercancel', release);
    gsap.ticker.add((t, dt) => {
      const k = dt / 16.67;
      hover += (hoverTarget - hover) * .06;
      if (!dragging) { vel *= Math.pow(0.95, k); }
      rows.forEach(r => {
        if (!dragging) r.x += (r.dir * 0.6 * (1 - hover * .8) + vel) * k;
        if (r.x <= -r.half) r.x += r.half; if (r.x > 0) r.x -= r.half;
        r.el.style.transform = `translate3d(${r.x}px,0,0)`;
      });
    });
  }

  /* ---------- Pointer niceties (desktop only) ---------- */
  if (finePointer) {
    // Cursor: follows with a critically-damped lag
    const cur = $('.cursor'), label = $('.cursor__label');
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3.out' });
    const cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3.out' });
    let px = innerWidth / 2, py = innerHeight / 2;
    addEventListener('pointermove', e => {
      px = e.clientX; py = e.clientY; cx(px); cy(py);
      const t = e.target instanceof Element ? e.target : null;
      const lab = t && t.closest('[data-cursor]');
      cur.classList.toggle('has-label', !!lab);
      if (lab) label.textContent = lab.dataset.cursor;
      cur.classList.toggle('is-on-dark', !!(t && t.closest('.marathi, .films, .book, .footer')));
      cur.classList.toggle('is-hidden', !!(t && t.closest('input, .occ__row')));
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));

    // Magnetic buttons, spring back on leave
    $$('.magnetic').forEach(btn => {
      const mx = gsap.quickTo(btn, 'x', { duration: .5, ease: 'power3.out' });
      const my = gsap.quickTo(btn, 'y', { duration: .5, ease: 'power3.out' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * .28); my((e.clientY - r.top - r.height / 2) * .38);
      });
      btn.addEventListener('pointerleave', () => { gsap.to(btn, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1, .55)', overwrite: true }); });
    });

    // Films: tilt toward the pointer
    $$('.film').forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .6, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .6, ease: 'power3.out' });
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 14); rx(-((e.clientY - r.top) / r.height - .5) * 10);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });

    // Occasions: a photograph rides along with the pointer, tilting with its velocity
    const hv = $('.hover-img'), hvImg = hv && hv.querySelector('img');
    if (hv) {
      const hx = gsap.quickTo(hv, 'x', { duration: .55, ease: 'power3.out' });
      const hy = gsap.quickTo(hv, 'y', { duration: .55, ease: 'power3.out' });
      const hr = gsap.quickTo(hv, 'rotation', { duration: .8, ease: 'power3.out' });
      let lx = 0;
      $('.occ').addEventListener('pointermove', e => {
        hx(e.clientX + 30); hy(e.clientY - 160); hr(gsap.utils.clamp(-12, 12, (e.clientX - lx) * .6)); lx = e.clientX;
      });
      $$('.occ__row').forEach(row => {
        row.addEventListener('pointerenter', () => {
          if (hvImg.getAttribute('src') !== row.dataset.img) hvImg.src = row.dataset.img;
          gsap.to(hv, { opacity: 1, scale: 1, duration: .6, ease: EXPO, overwrite: 'auto' });
          gsap.fromTo(hvImg, { scale: 1.25 }, { scale: 1, duration: .9, ease: EXPO });
        });
      });
      $('.occ').addEventListener('pointerleave', () => gsap.to(hv, { opacity: 0, scale: .6, duration: .5, ease: 'power3.out', overwrite: 'auto' }));
    }
  }

  addEventListener('load', () => ScrollTrigger.refresh());

  /* ================= helpers ================= */
  function initNavPlain() {
    const nav = $('.nav');
    addEventListener('scroll', () => nav.classList.toggle('is-scrolled', scrollY > 40), { passive: true });
  }
})();

function initClock() {
  const el = document.querySelector('.js-clock'); if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);
}

function initEnquiry() {
  const form = document.querySelector('.enquiry'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const occ = d.get('occ') || 'Shoot';
    const names = (d.get('names') || '').toString().trim();
    const city = (d.get('city') || '').toString().trim();
    const raw = (d.get('date') || '').toString();
    const date = raw ? new Date(raw + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not fixed yet';
    const lines = [
      'Namaskar Abhishek Photofilms 🙏',
      `I'd like to check your availability for a ${occ.toLowerCase()} shoot.`,
      '',
      `Date: ${date}`,
      names ? `Names: ${names}` : null,
      city ? `City / venue: ${city}` : null
    ].filter(l => l !== null);
    window.open('https://wa.me/918698067523?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
}
