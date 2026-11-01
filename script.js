/* ================================================================
   Motown Stories Café — script.js  (v3 restored)
   Locomotive Scroll · Navbar · Menu Tabs · Lightbox · Mobile Nav
   ================================================================ */
'use strict';

// ── 1. Locomotive Scroll ──────────────────────────────────────
const locoScroll = new LocomotiveScroll({
  el: document.querySelector('#main-container'),
  smooth: true,
  multiplier: 0.85,
  lerp: 0.075,
  smartphone: { smooth: false },
  tablet:     { smooth: false },
});

// ── 2. Navbar: transparent → dark on scroll ───────────────────
const navbar = document.getElementById('navbar');
locoScroll.on('scroll', ({ scroll }) => {
  navbar.classList.toggle('scrolled', scroll.y > 60);
});

// ── 3. Scroll Reveal ─────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealIO  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealIO.unobserve(entry.target);
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealIO.observe(el));

// ── 4. Menu Tabs ──────────────────────────────────────────────
const tabs   = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected','true');

    const cat = tab.dataset.tab;
    panels.forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + cat));

    setTimeout(() => locoScroll.update(), 380);
  });
});

// ── 5. Gallery Lightbox ───────────────────────────────────────
const galleryBtns = Array.from(document.querySelectorAll('.gi[data-lightbox]'));
const lightbox    = document.getElementById('lightbox');
const lbImg       = document.getElementById('lb-img');
const lbCaption   = document.getElementById('lb-caption');
const lbClose     = document.getElementById('lb-close');
const lbPrev      = document.getElementById('lb-prev');
const lbNext      = document.getElementById('lb-next');
const lbBackdrop  = document.getElementById('lb-backdrop');
let   lbCurrent   = 0;
let   prevFocus   = null;

function openLb(idx) {
  lbCurrent = idx;
  const btn = galleryBtns[idx];
  lbImg.src = btn.dataset.lightbox;
  lbImg.alt = btn.querySelector('img').alt;
  lbCaption.textContent = btn.dataset.caption || '';
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  prevFocus = document.activeElement;
  lbClose.focus();
}

function closeLb() {
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
  if (prevFocus) prevFocus.focus();
}

function navLb(dir) {
  lbCurrent = (lbCurrent + dir + galleryBtns.length) % galleryBtns.length;
  lbImg.style.opacity = '0';
  setTimeout(() => {
    const btn = galleryBtns[lbCurrent];
    lbImg.src = btn.dataset.lightbox;
    lbImg.alt = btn.querySelector('img').alt;
    lbCaption.textContent = btn.dataset.caption || '';
    lbImg.style.opacity = '1';
  }, 180);
}

galleryBtns.forEach((btn, idx) => btn.addEventListener('click', () => openLb(idx)));
lbClose.addEventListener('click', closeLb);
lbBackdrop.addEventListener('click', closeLb);
lbPrev.addEventListener('click', e => { e.stopPropagation(); navLb(-1); });
lbNext.addEventListener('click', e => { e.stopPropagation(); navLb(1); });

document.addEventListener('keydown', e => {
  if (lightbox.classList.contains('hidden')) return;
  if (e.key === 'Escape')     closeLb();
  if (e.key === 'ArrowLeft')  navLb(-1);
  if (e.key === 'ArrowRight') navLb(1);
});

// Touch swipe
let lbTX = null;
lbImg.style.transition = 'opacity .18s ease';
lightbox.addEventListener('touchstart', e => { lbTX = e.touches[0].clientX; }, { passive:true });
lightbox.addEventListener('touchend',   e => {
  if (lbTX === null) return;
  const dx = e.changedTouches[0].clientX - lbTX;
  if (Math.abs(dx) > 45) navLb(dx < 0 ? 1 : -1);
  lbTX = null;
});

// Start hidden
lightbox.classList.add('hidden');

// ── 6. Mobile Nav Drawer ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const drawer    = document.getElementById('nav-drawer');

function toggleDrawer(forceClose) {
  const opening = !forceClose && !drawer.classList.contains('open');
  drawer.classList.toggle('open', opening);
  hamburger.setAttribute('aria-expanded', opening);
}

hamburger.addEventListener('click', () => toggleDrawer());

document.querySelectorAll('.drawer-link, .drawer-cta').forEach(link => {
  link.addEventListener('click', () => toggleDrawer(true));
});

document.addEventListener('click', e => {
  if (!drawer.classList.contains('open')) return;
  if (!drawer.contains(e.target) && !hamburger.contains(e.target)) toggleDrawer(true);
});

// ── 7. Smooth anchor scroll ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const href   = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    locoScroll.scrollTo(target, { offset: -80 });
  });
});

// ── 8. Resize sync ───────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => locoScroll.update(), 250);
});

// ── 9. First-load reveal (items already in viewport) ─────────
window.addEventListener('load', () => {
  revealEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) el.classList.add('visible');
  });
  locoScroll.update();
});
