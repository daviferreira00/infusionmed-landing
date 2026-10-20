// InfusionMed — landing page interactions

const WHATSAPP_NUMBER = '5583981947777';
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

// Contact form -> WhatsApp with the message filled in
const form = document.getElementById('contact-form');
const formError = form.querySelector('.form__error');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const missing = ['nome', 'telefone'].filter((k) => !data[k].trim());
  form.querySelectorAll('input').forEach((input) => input.setAttribute('aria-invalid', String(missing.includes(input.name))));
  formError.hidden = missing.length === 0;
  if (missing.length) {
    form.querySelector(`[name="${missing[0]}"]`).focus();
    return;
  }
  const lines = [
    'Olá! Vim pelo site da InfusionMed.',
    `Nome: ${data.nome.trim()}`,
    `Telefone: ${data.telefone.trim()}`,
    `Tratamento de interesse: ${data.tratamento}`,
  ];
  if (data.mensagem.trim()) lines.push(`Mensagem: ${data.mensagem.trim()}`);
  window.open(whatsappUrl(lines.join('\n')), '_blank', 'noopener');
});

// Footer year
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
