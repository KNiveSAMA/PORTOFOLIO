/* Portfolio interactions: nav, reveal, profile scroll animation, parallax, cursor, glitch */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Navbar: scrolled state, mobile menu, active link ---------- */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('.nav__toggle');
    const menu = $('#menu');
    const links = $$('a', menu);

    const setMenu = open => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    links.forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

    // Highlight link of the section currently in view
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(s => io.observe(s));

    return scrollY => nav.classList.toggle('is-scrolled', scrollY > 40);
  }

  /* ---------- Scroll reveal (runs once per element) ---------- */
  function initReveal() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        // Clear stagger delay afterwards so hover transitions stay instant
        setTimeout(() => { en.target.style.transitionDelay = ''; }, 1400);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$('[data-reveal], .skill').forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + 'ms'; // light stagger
      io.observe(el);
    });
  }

  /* ---------- Profile image: animation follows scroll progress ---------- */
  function initProfile() {
    const el = $('#profile');
    if (!el) return () => {};
    const MAX_ROT = 8, MAX_Y = 50;

    return () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -100 || r.top > vh + 100) return; // skip work when off-screen
      // p: 0 = element just entering at bottom, 1 = fully left through top
      const p = clamp((vh - r.top) / (vh + r.height));
      let o, rot, y;
      if (p < 0.35) {            // entering
        const t = p / 0.35;
        o = t; rot = -MAX_ROT * (1 - t); y = MAX_Y * (1 - t);
      } else if (p > 0.65) {     // leaving
        const t = (p - 0.65) / 0.35;
        o = 1 - t; rot = MAX_ROT * t; y = -MAX_Y * t;
      } else { o = 1; rot = 0; y = 0; }
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    };
  }

  /* ---------- Light parallax for decorative hero shapes ---------- */
  function initParallax() {
    const items = $$('[data-parallax]');
    return scrollY => {
      if (scrollY > window.innerHeight) return;
      items.forEach(el => {
        el.style.translate = `0 ${(scrollY * parseFloat(el.dataset.parallax)).toFixed(1)}px`;
      });
    };
  }

  /* ---------- Single rAF-throttled scroll loop ---------- */
  function initScrollLoop(tasks) {
    let ticking = false;
    const run = () => { tasks.forEach(t => t(window.scrollY)); ticking = false; };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    run();
  }

  /* ---------- Occasional light glitch on hero title ---------- */
  function initGlitch() {
    const g = $('.glitch');
    if (!g || reduceMotion) return;
    setInterval(() => {
      g.classList.add('is-glitching');
      setTimeout(() => g.classList.remove('is-glitching'), 160);
    }, 4200);
  }

  /* ---------- Custom cursor (fine pointers only) ---------- */
  function initCursor() {
    const c = $('.cursor');
    if (!c || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; c.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseleave', () => c.classList.remove('is-on'));
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => c.classList.toggle('is-hover', !!e.target.closest('a, button, .card, .proj')));
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    $('#year').textContent = new Date().getFullYear();
    const navTask = initNav();
    initReveal();
    initGlitch();
    initCursor();
    const tasks = [navTask, initProfile()];
    if (!reduceMotion) tasks.push(initParallax());
    if (!reduceMotion) initScrollLoop(tasks); else navTask(window.scrollY);
  });
})();
