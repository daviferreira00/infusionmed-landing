// InfusionMed — Experiência (rota /experience)
// Motor de scroll: cada [data-scene] recebe --p (0 → 1) suavizado; o CSS faz o resto.

const WHATSAPP_NUMBER = '5583981947777';
const DEFAULT_MESSAGE = 'Olá! Gostaria de agendar um atendimento na InfusionMed.';
const whatsappUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const root = document.documentElement;
root.classList.add('js');

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---------- WhatsApp e ano ----------
document.querySelectorAll('[data-whatsapp]').forEach((el) => {
  el.href = whatsappUrl(el.dataset.msg || DEFAULT_MESSAGE);
  el.target = '_blank';
  el.rel = 'noopener';
});
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

// ---------- Altura de viewport estável (evita saltos com a barra do navegador no mobile) ----------
let vh = window.innerHeight;
const setVh = () => {
  vh = window.innerHeight;
  root.style.setProperty('--vh', `${vh}px`);
};
setVh();

// ---------- Texto que acende palavra por palavra ----------
document.querySelectorAll('[data-split]').forEach((el) => {
  const frag = document.createDocumentFragment();
  let i = 0;
  const pushWords = (text, extraClass) => {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
      const span = document.createElement('span');
      span.className = extraClass ? `w ${extraClass}` : 'w';
      span.style.setProperty('--i', i++);
      span.textContent = part;
      frag.appendChild(span);
    });
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) pushWords(node.textContent, '');
    else pushWords(node.textContent, 'w--grad');
  });
  el.replaceChildren(frag);
  el.style.setProperty('--n', i);
});

// ---------- Topbar ----------
const topbar = document.querySelector('.topbar');
const onScrollTopbar = () => topbar.classList.toggle('is-scrolled', window.scrollY > 24);
onScrollTopbar();
window.addEventListener('scroll', onScrollTopbar, { passive: true });

// ---------- Capítulo ativo (trilho lateral + menu + tema claro/escuro do trilho) ----------
const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterLinks = [...document.querySelectorAll('.rail a, .topbar__nav a')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      chapterLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === id));
      document.body.classList.toggle('on-light', entry.target.hasAttribute('data-light'));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach((s) => io.observe(s));

  // Revelação simples das seções sem cena fixa
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      reveal.unobserve(entry.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.io').forEach((el) => reveal.observe(el));

  // Contadores
  const stats = document.querySelector('[data-stats]');
  if (stats) {
    const counters = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      counters.disconnect();
      stats.querySelectorAll('[data-count]').forEach((el) => {
        const target = +el.dataset.count;
        if (REDUCE) { el.textContent = target; return; }
        const t0 = performance.now();
        const tick = (now) => {
          const k = clamp((now - t0) / 1400, 0, 1);
          const eased = 1 - Math.pow(1 - k, 3);
          el.textContent = Math.round(target * eased);
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: .4 });
    counters.observe(stats);
  }
} else {
  document.querySelectorAll('.io').forEach((el) => el.classList.add('in'));
}

// ---------- Medição das cenas ----------
const scenes = [...document.querySelectorAll('[data-scene]')].map((el) => ({
  el, top: 0, len: 1, raw: 0, cur: -1, last: -1,
  steps: +el.dataset.steps || 0, step: -1,
  stepItems: el.dataset.steps ? [...el.querySelectorAll('[data-i]')] : [],
}));
const panels = [...document.querySelectorAll('[data-panel]')].map((el) => ({ el, top: 0, last: -1 }));
const track = document.querySelector('[data-track]');

let docH = 1;
const measure = () => {
  setVh();
  docH = Math.max(1, root.scrollHeight - vh);
  const y = window.scrollY;
  scenes.forEach((s) => {
    s.top = s.el.getBoundingClientRect().top + y;
    s.len = Math.max(1, s.el.offsetHeight - vh);
  });
  if (panels.length) {
    const parent = panels[0].el.parentElement;
    const parentTop = parent.getBoundingClientRect().top + y;
    const stickyTop = parseFloat(getComputedStyle(panels[0].el).top) || 0;
    panels.forEach((p, i) => {
      const step = p.el.offsetHeight + (parseFloat(getComputedStyle(p.el).marginBottom) || 0);
      p.top = parentTop + i * step - stickyTop;
    });
  }
  if (track) {
    const stage = track.closest('.stage');
    const shift = Math.max(0, track.offsetWidth + 24 - stage.clientWidth);
    track.style.setProperty('--shift', `${shift}px`);
  }
};

// ---------- Marquees reativos à velocidade do scroll ----------
const marquees = [...document.querySelectorAll('[data-marquee]')].map((m) => {
  const ul = m.querySelector('ul');
  [...ul.children].forEach((li) => {
    const clone = li.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    ul.appendChild(clone);
  });
  return { ul, dir: +m.dataset.dir || 1, x: 0, half: 0 };
});
const measureMarquees = () => marquees.forEach((r) => { r.half = r.ul.scrollWidth / 2; });

// ---------- Laço de animação ----------
const SMOOTH = REDUCE ? 1 : 0.16;
let lastY = window.scrollY;
let vel = 0;
let lastT = performance.now();

const frame = (now) => {
  const dt = Math.min(64, now - lastT) / 1000;
  lastT = now;
  const y = window.scrollY;
  vel += ((y - lastY) - vel) * 0.12;
  lastY = y;

  root.style.setProperty('--sp', clamp(y / docH, 0, 1).toFixed(4));

  scenes.forEach((s) => {
    s.raw = clamp((y - s.top) / s.len, 0, 1);
    if (s.cur < 0) s.cur = s.raw;
    else s.cur += (s.raw - s.cur) * SMOOTH;
    if (Math.abs(s.raw - s.cur) < 0.0004) s.cur = s.raw;
    if (s.cur !== s.last) {
      s.last = s.cur;
      s.el.style.setProperty('--p', s.cur.toFixed(4));
    }
    if (s.steps) {
      const st = Math.min(s.steps - 1, Math.floor(s.cur * s.steps));
      if (st !== s.step) {
        s.step = st;
        s.el.dataset.step = st;
        s.stepItems.forEach((n) => n.classList.toggle('is-active', +n.dataset.i === st));
      }
    }
  });

  panels.forEach((p) => {
    const cover = clamp((y - p.top) / vh, 0, 1);
    if (cover !== p.last) {
      p.last = cover;
      p.el.style.setProperty('--cover', cover.toFixed(4));
    }
  });

  if (!REDUCE) {
    const speed = 42 + Math.min(900, Math.abs(vel) * 40);
    marquees.forEach((r) => {
      if (!r.half) return;
      r.x -= r.dir * speed * dt;
      if (r.x <= -r.half) r.x += r.half;
      if (r.x > 0) r.x -= r.half;
      r.ul.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
    });
  }

  requestAnimationFrame(frame);
};

// ---------- Brilho que segue o cursor no hero ----------
const hero = document.querySelector('.hero .stage');
const glow = document.querySelector('.hero__glow');
if (hero && glow && FINE_POINTER && !REDUCE) {
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    glow.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
    glow.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
  }, { passive: true });
}

// ---------- Botão magnético ----------
if (FINE_POINTER && !REDUCE) {
  document.querySelectorAll('.magnetic').forEach((btn) => {
    const parent = btn.parentElement;
    parent.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const reach = 140;
      if (dist > reach) { btn.style.transform = ''; return; }
      const k = (1 - dist / reach) * 0.35;
      btn.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px)`;
    });
    parent.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// ---------- Inicialização ----------
let resizeTimer;
const remeasure = () => { measure(); measureMarquees(); };
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(remeasure, 120);
});
window.addEventListener('load', remeasure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
if ('ResizeObserver' in window) {
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(remeasure, 60); }).observe(document.body);
}
remeasure();
requestAnimationFrame(frame);
