// InfusionMed — landing page interactions

const WHATSAPP_NUMBER = '5583981919999';
const DEFAULT_MESSAGE = 'Olá! Gostaria de agendar um atendimento na InfusionMed.';

const whatsappUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

document.documentElement.classList.add('js');

// WhatsApp links
document.querySelectorAll('[data-whatsapp]').forEach((el) => {
  el.href = whatsappUrl(el.dataset.msg || DEFAULT_MESSAGE);
  el.target = '_blank';
  el.rel = 'noopener';
});

// Marquee: duplicate the logos once so the -50% loop is seamless
document.querySelectorAll('.marquee__track').forEach((track) => {
  [...track.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('button, a').forEach((el) => el.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
  });
});

// Header: shadow on scroll + mobile menu
const header = document.querySelector('.header');
const toggle = document.querySelector('.header__toggle');

const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const setMenu = (open) => {
  header.classList.toggle('is-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};
toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Active nav link for the section in view
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]:not(.btn)')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObserver.observe(s));

  // Reveal on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    revealObserver.observe(el);
  });
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

// Structure photos: open the clicked photo in a modal and browse with buttons/arrow keys
const lightbox = document.querySelector('.lightbox');
const photoButtons = [...document.querySelectorAll('.photo-card:not([aria-hidden="true"] .photo-card)')];
if (lightbox && photoButtons.length) {
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lightbox__caption');
  const lbCount = lightbox.querySelector('.lightbox__count');
  let current = 0;
  let opener = null;

  const show = (i) => {
    current = (i + photoButtons.length) % photoButtons.length;
    const img = photoButtons[current].querySelector('img');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = photoButtons[current].dataset.label;
    lbCount.textContent = `${current + 1} / ${photoButtons.length}`;
  };

  document.querySelectorAll('.photo-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      opener = btn;
      show(Number(btn.dataset.photo));
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  lightbox.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
