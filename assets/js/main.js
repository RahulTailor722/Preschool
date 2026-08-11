/* ============================================================
   Gulmohar Early Years — entry point
   ------------------------------------------------------------
   Motion strategy:
     · Reveals + counters  → IntersectionObserver (always works,
       zero dependencies, so content is never trapped invisible)
     · Smooth scroll       → Lenis, if it loaded
     · Parallax / scrub    → GSAP ScrollTrigger, if it loaded
   Every enhancement is optional. Blocking the CDN degrades the
   page to a perfectly readable static site.
   ============================================================ */

import { initNav }       from './modules/nav.js';
import { initReveal }    from './modules/reveal.js';
import { initCounters }  from './modules/counters.js';
import { initTabs }      from './modules/tabs.js';
import { initAccordion } from './modules/accordion.js';
import { initGallery }   from './modules/gallery.js';
import { initLightbox }  from './modules/lightbox.js';
import { initTrain }     from './modules/train.js';
import { initForm }      from './modules/form.js';
import { initScroll }    from './modules/scroll.js';
import { initHero }      from './modules/hero.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Only opt into hide-then-reveal when we can guarantee we'll reveal. */
if (!prefersReduced) {
  document.documentElement.classList.add('js-motion');
}

const boot = () => {
  initHero();
  initNav();
  initTabs();
  initAccordion();
  initGallery();
  initLightbox();
  initTrain({ reduced: prefersReduced });
  initForm();
  initCounters();
  initReveal({ reduced: prefersReduced });
  initScroll({ reduced: prefersReduced });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

/* Last-resort safety net: if anything above threw before reveals ran,
   make certain nothing is left invisible. */
window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight) el.classList.add('is-in');
    });
  });
});
