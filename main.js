/* Abhishek Photofilms: scroll choreography
   Each section is one scene, driven by scroll position so it can be paused,
   reversed and replayed at any instant. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ok = !!(window.gsap && window.ScrollTrigger) && !reduced;

  buildPetals();
  initEnquiry();
  opticalCentre();

  if (!ok) {
    document.documentElement.classList.add('no-motion');
    initTopPlain();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const EASE = 'expo.out';

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: t => 1 - Math.pow(1 - t, 4) });
    lenis.on('scroll', ScrollTrigger.update);
    window.__lenis = lenis;
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { duration: 1.8 }) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  const akshata = makeAkshata($('.akshata'));

  /* ================= 1. Antarpaat ================= */
  // Opening: the cloth is already up; the words settle in like a held breath.
  gsap.from('.antarpaat__words > *', { y: 40, opacity: 0, duration: 1.6, stagger: .18, ease: EASE, delay: .2 });
  gsap.from('.antarpaat__motif', { scale: .85, opacity: 0, duration: 2.2, ease: EASE });
  gsap.from('.top', { opacity: 0, duration: 1.2, ease: 'power2.out', delay: .6, clearProps: 'opacity' });
  gsap.from('.mandap__hint', { opacity: 0, y: 10, duration: 1, ease: EASE, delay: 1.2 });
  gsap.set('.mandap__title h1 span', { yPercent: 105 });
  gsap.set('.mandap__kicker', { opacity: 0, y: 14 });
  gsap.set('.triptych figure', { scale: 1.18 });

  let thrown = false;
  const drop = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.mandap', start: 'top top', end: '+=220%', pin: true, scrub: 1,
      onUpdate: s => {
        if (s.progress > .2 && !thrown) { thrown = true; akshata.burst(260); }
        if (s.progress < .05) thrown = false;
      }
    }
  });
  drop
    .to('.mandap__hint', { opacity: 0, duration: .05 }, 0)
    .to('.antarpaat__small', { opacity: 0, y: -20, duration: .1 }, 0)
    .to('.antarpaat__big', { scale: 1.08, duration: .15, ease: 'power1.out' }, 0)
    // the antarpaat is lowered: it falls away from the top edge, folding toward us
    .to('.antarpaat-wrap', { yPercent: 108, rotationX: -28, transformPerspective: 1400, transformOrigin: '50% 100%', duration: .5, ease: 'power2.in' }, .12)
    .to('.triptych figure', { scale: 1, duration: .6, stagger: .04, ease: 'power2.out' }, .2)
    .to('.mandap__kicker', { opacity: 1, y: 0, duration: .12 }, .55)
    .to('.mandap__title h1 span', { yPercent: 0, duration: .2, stagger: .06, ease: 'power3.out' }, .55)
    .to('.triptych figure:nth-child(1)', { yPercent: -8, duration: .3 }, .7)
    .to('.triptych figure:nth-child(3)', { yPercent: 8, duration: .3 }, .7);

  /* ================= 2. Statement ================= */
  $$('.sl').forEach((line, i) => {
    gsap.from(line.childNodes.length ? line : line, {
      yPercent: 100, opacity: 0, duration: 1.3, ease: EASE,
      scrollTrigger: { trigger: line, start: 'top 90%' }
    });
  });
  $$('.pill').forEach(p => {
    gsap.fromTo(p, { width: 0 }, {
      width: '1.9em', ease: 'none',
      scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 45%', scrub: .6 }
    });
    gsap.fromTo(p.querySelector('img'), { scale: 1.6 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: p, start: 'top 85%', end: 'top 45%', scrub: .6 } });
  });
  gsap.from('.statement__aside', { y: 40, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.statement__aside', start: 'top 90%' } });

  /* ================= 3. Chapters ================= */
  const chs = $$('.ch');
  const chNum = $('.js-ch');
  const mr = ['१', '२', '३', '४', '५'];
  chs.forEach(ch => { ch.querySelector('img').style.objectPosition = ch.dataset.pos || '50% 50%'; });
  const OVAL = 'inset(32% 34% 32% 34% round 999px)';
  gsap.set(chs, { clipPath: (i) => i === 0 ? OVAL : 'inset(50% 50% 50% 50% round 999px)' });
  gsap.set($$('.n1'), { xPercent: -60, opacity: 0 });
  gsap.set($$('.n2'), { xPercent: 60, opacity: 0 });
  gsap.set($$('.amp, .ch__cap'), { opacity: 0, y: 20 });
  gsap.set($$('.ch > img'), { scale: 1.35 });

  const chTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.chapters', start: 'top top', end: () => '+=' + (chs.length * 130) + '%', pin: true, scrub: 1,
      onUpdate: s => { chNum.textContent = mr[Math.min(chs.length - 1, Math.floor(s.progress * chs.length * .999))]; }
    }
  });
  chs.forEach((ch, i) => {
    const img = ch.querySelector('img'), n1 = ch.querySelector('.n1'), n2 = ch.querySelector('.n2');
    const t = i * 1;
    // an oval window opens over the previous couple, then widens to the full frame
    if (i > 0) chTl.to(ch, { clipPath: OVAL, duration: .2, ease: 'power2.out' }, t - .12);
    chTl.to(ch, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: .45, ease: 'power2.inOut' }, t)
        .to(img, { scale: 1, duration: .6, ease: 'power1.out' }, t)
        .to(n1, { xPercent: 0, opacity: 1, duration: .35, ease: 'power3.out' }, t + .22)
        .to(n2, { xPercent: 0, opacity: 1, duration: .35, ease: 'power3.out' }, t + .28)
        .to(ch.querySelectorAll('.amp, .ch__cap'), { opacity: 1, y: 0, duration: .2 }, t + .35)
        .to(img, { yPercent: -4, duration: .4 }, t + .6);
    if (i < chs.length - 1) {
      chTl.to([n1, n2], { opacity: 0, yPercent: -30, duration: .2 }, t + .85)
          .to(ch.querySelectorAll('.amp, .ch__cap'), { opacity: 0, duration: .15 }, t + .85)
          .to(img, { scale: .92, filter: 'brightness(.45)', duration: .3 }, t + .85);
    }
  });

  /* ================= 4. Album: loose prints settle onto the spread ================= */
  const prints = $$('.pr');
  const rand = gsap.utils.random;
  prints.forEach((p, i) => {
    const side = i % 2 ? 1 : -1;
    p.dataset.x = rand(30, 70) * side;
    p.dataset.y = rand(-60, 80);
    p.dataset.r = rand(-28, 28);
  });
  gsap.timeline({
    scrollTrigger: { trigger: '.album', start: 'top top', end: '+=160%', pin: true, scrub: 1 }
  })
    .from('.album__book', { rotationX: 38, y: 120, scale: .86, transformPerspective: 1600, transformOrigin: '50% 100%', duration: .5, ease: 'power2.out' }, 0)
    .from(prints, {
      x: (i, el) => el.dataset.x + 'vw', y: (i, el) => el.dataset.y + 'vh', rotation: (i, el) => el.dataset.r,
      scale: 1.25, duration: .8, stagger: .06, ease: 'power3.out'
    }, .05)
    .from('.album__head > *', { y: 40, opacity: 0, stagger: .08, duration: .3 }, 0);

  /* ================= 5. Film strip ================= */
  const track = $('.strip__track'), strip = $('.strip');
  const stripDist = () => strip.scrollWidth - innerWidth * .55;
  gsap.set(strip, { x: () => innerWidth * .9 });
  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: '.films', start: 'top top', end: () => '+=' + (stripDist() + innerWidth), pin: true, scrub: 1, invalidateOnRefresh: true }
  })
    .to(strip, { x: () => -stripDist(), duration: 1 })
    .from('.films__head > *', { y: 50, opacity: 0, stagger: .05, duration: .15 }, 0)
    .fromTo($$('.fr img'), { yPercent: -6 }, { yPercent: 6, duration: 1 }, 0);
  // the strip leans into fast scrolling, like film running through a gate
  const skewTo = gsap.quickTo(strip, 'skewX', { duration: .6, ease: 'power3.out' });
  ScrollTrigger.create({ trigger: '.films', start: 'top bottom', end: 'bottom top', onUpdate: s => skewTo(gsap.utils.clamp(-6, 6, s.getVelocity() / -400)) });

  /* ================= 6. Covers fan out like a hand of cards ================= */
  const cvs = $$('.cv'), mid = (cvs.length - 1) / 2;
  gsap.set(cvs, { xPercent: -50, y: '60vh', rotation: 0 });
  gsap.timeline({
    scrollTrigger: { trigger: '.covers', start: 'top top', end: '+=170%', pin: true, scrub: 1 }
  })
    .to(cvs, { y: 0, duration: .35, stagger: .03, ease: 'power3.out' }, 0)
    .to(cvs, { rotation: i => (i - mid) * 9.5, duration: .5, ease: 'power2.inOut' }, .35)
    .to(cvs, { y: i => Math.abs(i - mid) * 14, duration: .5, ease: 'power2.inOut' }, .35)
    .from('.covers__head > *', { y: 40, opacity: 0, stagger: .08, duration: .25 }, 0);

  /* ================= 7. Occasions: the word at the centre lights up ================= */
  const items = $$('.occasions__list li');
  const ovA = $('.ov__a'), ovB = $('.ov__b');
  let shown = ovA.getAttribute('src');
  const showImg = src => {
    if (src === shown) return;
    shown = src;
    ovB.src = src;
    gsap.killTweensOf([ovA, ovB]);
    gsap.fromTo(ovB, { clipPath: 'inset(100% 0 0 0)', scale: 1.15 }, {
      clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1, ease: 'expo.inOut',
      onComplete: () => { ovA.src = src; gsap.set(ovB, { clipPath: 'inset(100% 0 0 0)' }); }
    });
  };
  const line = innerWidth < 820 ? '72%' : '55%';
  items.forEach(li => ScrollTrigger.create({
    trigger: li, start: 'top ' + line, end: 'bottom ' + line,
    onToggle: s => { if (s.isActive) { items.forEach(x => x.classList.toggle('is-on', x === li)); showImg(li.dataset.img); } }
  }));
  items[0].classList.add('is-on');
  gsap.from('.occasions__list h2', { y: 50, opacity: 0, duration: 1.2, ease: EASE, scrollTrigger: { trigger: '.occasions', start: 'top 75%' } });
  gsap.fromTo('.ov', { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.occasions', start: 'top 85%', end: 'top 20%', scrub: .6 } });

  /* ================= 8. The invitation opens ================= */
  gsap.from('.invite__head h2', { y: 60, opacity: 0, duration: 1.3, ease: EASE, scrollTrigger: { trigger: '.invite', start: 'top 70%' } });
  gsap.timeline({
    scrollTrigger: {
      trigger: '.patrika', start: 'top 80%', end: 'top 15%', scrub: 1,
      onLeave: () => { $('.patrika__cover').style.pointerEvents = 'none'; },
      onEnterBack: () => { $('.patrika__cover').style.pointerEvents = ''; }
    }
  })
    .from('.patrika', { y: 120, rotationX: 18, transformPerspective: 1600, duration: .4, ease: 'power2.out' }, 0)
    .to('.patrika__cover', { rotationY: -168, duration: .6, ease: 'power2.inOut' }, .35)
    .to('.patrika__cover', { opacity: 0, duration: .05 }, .92);

  gsap.from('.foot__phone', { yPercent: 50, opacity: 0, duration: 1.4, ease: EASE, scrollTrigger: { trigger: '.foot', start: 'top 85%' } });

  /* ---------- top bar: colour follows the section underneath ---------- */
  const top = $('.top');
  const darkZones = $$('.mandap, .chapters, .films, .invite, .foot');
  let lastY = 0;
  gsap.ticker.add(() => {
    const y = scrollY, probe = 30;
    const onDark = darkZones.some(z => { const r = z.getBoundingClientRect(); return r.top <= probe && r.bottom > probe; });
    top.classList.toggle('is-light', !onDark);
    top.classList.toggle('is-dark-bg', onDark);
    top.classList.toggle('is-solid', y > innerHeight * 3.2 && !$('.chapters').contains(document.elementFromPoint(innerWidth / 2, probe)));
    if (Math.abs(y - lastY) > 4) { top.classList.toggle('is-away', y > lastY && y > innerHeight * 3.4); lastY = y; }
  });

  // Celebrate a sent invitation with a handful of akshata
  document.addEventListener('enquiry:sent', () => akshata.burst(160));

  addEventListener('load', () => ScrollTrigger.refresh());

  function initTopPlain() {}
})();

/* ---------- Akshata: turmeric rice thrown at "Shubhmangal Savdhan" ---------- */
function makeAkshata(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), grains = [], running = false;
  const size = () => { W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener('resize', size);
  const colors = ['#f2c14e', '#e8ab2a', '#f6d77c', '#e09a1f', '#fbe3a1', '#c8261f'];
  function burst(n) {
    for (let i = 0; i < n; i++) {
      const fromLeft = i % 2 === 0;
      grains.push({
        x: fromLeft ? -10 + Math.random() * W * .25 : W * .75 + Math.random() * W * .25,
        y: H * (.55 + Math.random() * .5),
        vx: (fromLeft ? 1 : -1) * (2 + Math.random() * 6),
        vy: -(9 + Math.random() * 9),
        r: Math.random() * Math.PI, vr: (Math.random() - .5) * .35,
        len: 3.5 + Math.random() * 2.5,
        c: colors[(Math.random() * (Math.random() < .12 ? colors.length : colors.length - 1)) | 0],
        life: 0
      });
    }
    if (!running) { running = true; requestAnimationFrame(step); }
  }
  function step() {
    ctx.clearRect(0, 0, W, H);
    grains = grains.filter(g => g.y < H + 30 && g.life < 600);
    for (const g of grains) {
      g.vy += .32; g.vx *= .985; g.vy *= .985;
      g.x += g.vx; g.y += g.vy; g.r += g.vr; g.life++;
      ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.r);
      ctx.fillStyle = g.c; ctx.beginPath(); ctx.ellipse(0, 0, g.len, g.len * .38, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    if (grains.length) requestAnimationFrame(step); else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  return { burst };
}

/* ---------- Optical centring of "शुभमंगल सावधान" ----------
   Devanagari ink sits unevenly inside its line box (shirorekha, anusvara,
   lower matras), so box-centring looks off. Measure the real ink of both
   lines and shift the block until the ink is centred on the lotus ring. */
function opticalCentre() {
  const wrap = document.querySelector('.antarpaat__words');
  const motif = document.querySelector('.antarpaat__motif');
  if (!wrap || !motif) return;
  const inkOf = el => {
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    const mark = document.createElement('i');
    mark.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    el.appendChild(mark);
    // baseline from layout positions only, so entrance/scroll transforms don't skew it
    const baseline = wrap.getBoundingClientRect().top + el.offsetTop + (mark.getBoundingClientRect().top - el.getBoundingClientRect().top);
    mark.remove();
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(el.getBoundingClientRect().width) + 40; cv.height = Math.ceil(fs * 3);
    const x = cv.getContext('2d');
    x.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const by = Math.round(fs * 1.8);
    x.fillText(el.textContent, 20, by);
    const d = x.getImageData(0, 0, cv.width, cv.height).data;
    let t = -1, b = -1;
    for (let y = 0; y < cv.height && t < 0; y++) for (let i = 0; i < cv.width; i++) if (d[(y * cv.width + i) * 4 + 3] > 40) { t = y; break; }
    for (let y = cv.height - 1; y >= 0 && b < 0; y--) for (let i = 0; i < cv.width; i++) if (d[(y * cv.width + i) * 4 + 3] > 40) { b = y; break; }
    return { top: baseline - (by - t), bot: baseline + (b - by) };
  };
  const run = () => {
    wrap.style.setProperty('--optical', '0px');
    const lines = [...wrap.querySelectorAll('.antarpaat__big')].map(inkOf);
    const inkMid = (Math.min(...lines.map(l => l.top)) + Math.max(...lines.map(l => l.bot))) / 2;
    const stage = document.querySelector('.antarpaat').getBoundingClientRect();
    const target = stage.top + stage.height / 2; // the ring is centred on the cloth
    wrap.style.setProperty('--optical', (target - inkMid).toFixed(2) + 'px');
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    // wait for the entrance tween on the words to settle so measurements are true
    setTimeout(run, 50);
    let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 150); });
  });
}

/* ---------- Lotus ring on the antarpaat ---------- */
function buildPetals() {
  const g = document.querySelector('.petal-ring'); if (!g) return;
  const n = 24, cx = 200, cy = 200, r1 = 128, r2 = 162;
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, a1 = a - .11, a2 = a + .11;
    const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)} ${(cy + Math.sin(ang) * r).toFixed(1)}`;
    d += `<path d="M${p(a1, r1)} Q${p(a - .02, (r1 + r2) / 2 + 8)} ${p(a, r2)} Q${p(a + .02, (r1 + r2) / 2 + 8)} ${p(a2, r1)}"/>`;
    d += `<circle cx="${(cx + Math.cos(a + Math.PI / n) * (r2 + 6)).toFixed(1)}" cy="${(cy + Math.sin(a + Math.PI / n) * (r2 + 6)).toFixed(1)}" r="1.6" fill="#e3a82b" stroke="none"/>`;
  }
  g.innerHTML = d;
}

/* ---------- Invitation → WhatsApp ---------- */
function initEnquiry() {
  const form = document.querySelector('.enquiry'); if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const names = (d.get('names') || '').toString().trim();
    const occ = (d.get('occ') || 'shoot').toString();
    const city = (d.get('city') || '').toString().trim();
    const raw = (d.get('date') || '').toString();
    const date = raw ? new Date(raw + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'a date we are still fixing';
    const text = `Namaskar Abhishek 🙏\nWe are ${names || '(names)'} and our ${occ} is on ${date}${city ? ' at ' + city : ''}.\nWe would love for you to shoot it. Are you available?`;
    document.dispatchEvent(new CustomEvent('enquiry:sent'));
    window.open('https://wa.me/918698067523?text=' + encodeURIComponent(text), '_blank', 'noopener');
  });
}
