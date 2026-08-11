/* The hero slider.

   Five slides, crossfaded on a timer, with arrows, a clickable chapter
   rail, keyboard control and swipe. Everything it needs is already in the
   markup — this module only decides which slide is the live one.

   It replaced a scroll-scrubbed "world": a full-viewport engine that pinned
   five fixed layers over the document and mapped scroll distance onto a
   camera flight. That cost the reader five screens of scrolling before the
   first section of the page, kept a fixed apparatus alive behind the whole
   document, and ran a scrub loop on every scroll event. A slider says the
   same five things without asking for any of that.

   `.js-hero` on <html> is the handover: the stylesheet keeps slide one
   visible on its own, and only once this module has run does it start
   hiding the others. Anything that throws before that line leaves a
   perfectly readable static banner rather than five stacked photographs
   with no copy. */

/* One turn per slide. Long enough to read a headline and a supporting line
   out loud, which is the actual test — nobody finishes a 4s banner. */
const DUR = 6500;

export function initHero() {
  const hero = document.getElementById('hero');
  if (!hero) return false;

  const slides = [...hero.querySelectorAll('.hero__slide')];
  const copies = [...hero.querySelectorAll('.hero__copy')];
  if (slides.length < 2) return false;

  const N = slides.length;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js-hero');

  let index = 0;
  let timer = 0;
  let held = 0;   /* reasons the timer is currently held off */

  /* ---- the one state change ----
     Photograph and plaque are crossfaded by class alone; every transition,
     the push-in on the picture and the staggered entrance of the copy all
     hang off `.is-active` in the stylesheet. */
  const show = (next) => {
    index = (next + N) % N;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    copies.forEach((c, i) => {
      const live = i === index;
      c.classList.toggle('is-active', live);
      /* The plaques you cannot see are still in the tab order and still
         read out by a screen reader — four hidden copies of the same call
         to action. `inert` takes them out of both in one property. */
      if (c.inert === live) c.inert = !live;
    });
  };

  /* ---- the timer ----
     `held` is a count, not a flag. Hovering the banner and tabbing into it
     are two independent reasons to stop, and they overlap constantly — a
     boolean lets whichever one ends first restart the slideshow under the
     other one's feet. */
  const stop = () => { clearTimeout(timer); timer = 0; };
  const play = () => {
    stop();
    if (reduced || held > 0 || document.hidden) return;
    timer = setTimeout(() => { show(index + 1); play(); }, DUR);
  };

  const hold = (on) => {
    held = Math.max(0, held + (on ? 1 : -1));
    hero.classList.toggle('is-paused', held > 0);
    if (held > 0) stop(); else play();
  };

  const goto = (next) => { show(next); play(); };

  /* ---- controls ---- */
  const prev = hero.querySelector('[data-hero-prev]');
  const next = hero.querySelector('[data-hero-next]');
  if (prev) prev.addEventListener('click', () => goto(index - 1));
  if (next) next.addEventListener('click', () => goto(index + 1));

  /* Arrow keys, but only while the reader is actually inside the banner —
     the page has its own left/right meaning elsewhere (the tab strip, the
     gallery), and a global listener would fight them. */
  hero.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goto(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goto(index + 1); }
  });

  /* Pause while it is being looked at or operated. A banner that advances
     out from under a cursor mid-sentence is the single most common way a
     slider annoys people. */
  hero.addEventListener('pointerenter', () => hold(true));
  hero.addEventListener('pointerleave', () => hold(false));
  hero.addEventListener('focusin',  () => hold(true));
  hero.addEventListener('focusout', () => hold(false));

  /* A background tab should not burn through all five slides and land back
     on the first one by the time the reader returns. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else play();
  });

  /* ---- swipe ----
     Passive listeners, and no preventDefault anywhere: a horizontal flick
     advances the banner, a vertical one has to go on scrolling the page.
     The 46px threshold and the 1.4× ratio are what separate the two — below
     either, the gesture was meant for the document.

     `stop`/`play` rather than `hold`, deliberately. `hold` is a counter, and
     touch already raises pointerenter/pointerleave around the same gesture;
     a second, differently-shaped pair of increments is how a counter ends
     up permanently above zero and the banner never advances again on a
     phone. Restarting the timer is all this needs. */
  let x0 = 0, y0 = 0, tracking = false;
  hero.addEventListener('touchstart', (e) => {
    tracking = e.touches.length === 1;
    if (!tracking) return;
    x0 = e.touches[0].clientX;
    y0 = e.touches[0].clientY;
    stop();
  }, { passive: true });

  hero.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - x0;
    const dy = t.clientY - y0;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      show(index + (dx < 0 ? 1 : -1));
    }
    play();
  }, { passive: true });

  hero.addEventListener('touchcancel', () => {
    tracking = false;
    play();
  }, { passive: true });

  show(0);
  play();
  return true;
}
