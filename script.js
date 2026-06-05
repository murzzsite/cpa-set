(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/3PL59HDQVG';

  /* ── год ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── scroll progress bar ── */
  const scrollBar = document.createElement('div');
  scrollBar.className = 'scroll-bar';
  document.body.prepend(scrollBar);
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  };

  /* ── sticky header ── */
  const header = document.getElementById('header');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
    updateProgress();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── burger ── */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    nav.classList.toggle('is-open');
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
  }));

  /* ── smooth scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    });
  });

  /* ── ripple on every button ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = document.createElement('span');
      r.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });

  /* ── phone mask ── */
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  /* ── form submit ── */
  const form = document.getElementById('leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { alert('Заполните имя и телефон'); return; }
    btn.disabled = true;
    btn.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = '✓ Заявка отправлена';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => { btn.style.background = ''; }, 3000);
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3200);
    }
  });

  /* ── stagger delays ── */
  const applyStagger = parentSel => {
    document.querySelectorAll(parentSel).forEach(parent => {
      Array.from(parent.children).forEach((child, i) => {
        child.classList.add(`stagger-${Math.min(i + 1, 6)}`);
      });
    });
  };
  applyStagger('.adv-grid');
  applyStagger('.services-grid');
  applyStagger('.reviews-grid');
  applyStagger('.steps-grid');

  /* ── reveal on scroll ── */
  const revealEls = document.querySelectorAll(
    '.adv, .service, .step, .review, .contact-card, .faq__item, .form-wrap, .problem-card, .price-table'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      if (e.target.classList.contains('problem-card')) e.target.classList.add('anim-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* ── steps line draw ── */
  const stepsGrid = document.querySelector('.steps-grid');
  if (stepsGrid) {
    const lineIO = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { stepsGrid.classList.add('line-visible'); lineIO.disconnect(); }
    }, { threshold: 0.3 });
    lineIO.observe(stepsGrid);
  }

  /* ── animated counters with pop ── */
  const counters = document.querySelectorAll('[data-target]');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      if (Number.isNaN(target)) return;
      const dur = 1200, start = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
          const numEl = el.closest('.stat__num');
          if (numEl) {
            numEl.classList.add('pop');
            numEl.addEventListener('animationend', () => numEl.classList.remove('pop'), { once: true });
          }
        }
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => countIO.observe(el));

})();
