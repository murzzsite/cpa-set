(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/3PL59HDQVG';

  /* ─────────────── ГОД ─────────────── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────── CUSTOM CURSOR ─────────────── */
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
  let dot, ring, mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my, rafId;

  if (!isTouchDevice()) {
    dot  = document.createElement('div'); dot.className  = 'cur-dot';
    ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.append(dot, ring);

    const moveDot = (x, y) => {
      dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
    };

    const animRing = () => {
      rx += (mx - rx) * 0.13;
      ry += (my - ry) * 0.13;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      rafId = requestAnimationFrame(animRing);
    };
    animRing();

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      moveDot(mx, my);
    });

    document.addEventListener('mousedown', () => {
      dot.classList.add('click'); ring.classList.add('click');
    });
    document.addEventListener('mouseup', () => {
      dot.classList.remove('click'); ring.classList.remove('click');
    });

    const hoverEls = 'a, button, .btn, .adv, .service, .review, .faq__question, .step, .problem-card';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('hover'); ring.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('hover'); ring.classList.remove('hover'); });
    });
  }

  /* ─────────────── SCROLL PROGRESS ─────────────── */
  const scrollBar = document.createElement('div');
  scrollBar.className = 'scroll-bar';
  document.body.prepend(scrollBar);

  const header = document.getElementById('header');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────── BURGER ─────────────── */
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

  /* ─────────────── SMOOTH SCROLL ─────────────── */
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

  /* ─────────────── RIPPLE ─────────────── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = document.createElement('span');
      r.className = 'btn-ripple';
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
      btn.appendChild(r);
      r.addEventListener('animationend', () => r.remove());
    });
  });

  /* ─────────────── PHONE MASK ─────────────── */
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

  /* ─────────────── FORM ─────────────── */
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
    btn.disabled = true; btn.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = '✓ Заявка отправлена';
      btn.style.background = '#16a34a';
      form.reset();
      setTimeout(() => { btn.style.background = ''; }, 3200);
    } catch { btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3200); }
  });

  /* ─────────────── 3-D TILT ─────────────── */
  const tiltEls = document.querySelectorAll('.adv, .service, .hero__card, .review');
  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transition = 'transform .08s ease';
      el.style.transform  = `perspective(700px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-4px) scale(1.01)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .45s ease';
      el.style.transform  = '';
    });
  });

  /* ─────────────── STAGGER ─────────────── */
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

  /* ─────────────── REVEAL ─────────────── */
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

  /* ─────────────── STEP LINE ─────────────── */
  const stepsGrid = document.querySelector('.steps-grid');
  if (stepsGrid) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { stepsGrid.classList.add('line-visible'); }
    }, { threshold: 0.3 }).observe(stepsGrid);
  }

  /* ─────────────── COUNTERS ─────────────── */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      if (Number.isNaN(target)) return;
      const dur = 1300, start = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - start) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) { requestAnimationFrame(tick); } else {
          el.textContent = target;
          const num = el.closest('.stat__num');
          if (num) { num.classList.add('pop'); num.addEventListener('animationend', () => num.classList.remove('pop'), { once: true }); }
        }
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-target]').forEach(el => countIO.observe(el));

  /* ─────────────── ACTIVITY TOASTS ─────────────── */
  const toasts = [
    { icon: '🚀', name: 'Мария К.', label: 'подключила ЦПА-сеть — ниша психология' },
    { icon: '📈', name: 'Дмитрий В.', label: 'получил 23 заявки за 7 дней' },
    { icon: '✅', name: 'Алексей С.', label: 'закрыл 5 замеров за первые 3 недели' },
    { icon: '💰', name: 'Анна Р.', label: 'окупила упаковку за 11 дней' },
    { icon: '⚡', name: 'Сергей М.', label: 'запустил воронку в нише юриспруденции' },
  ];
  let toastIdx = 0;
  const showToast = () => {
    const t = toasts[toastIdx++ % toasts.length];
    const el = document.createElement('div');
    el.className = 'act-toast';
    el.innerHTML = `<div class="act-toast__icon">${t.icon}</div><div><div class="act-toast__name">${t.name}</div><div class="act-toast__label">${t.label}</div></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 500); }, 4200);
  };
  if (!isTouchDevice()) {
    setTimeout(() => { showToast(); setInterval(showToast, 9000); }, 4000);
  }

})();
