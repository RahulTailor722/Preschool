/* Header: condense-on-scroll, hide-on-scroll-down, reading progress,
   sliding nav highlight, scroll-spy and the mobile drawer.

   Everything here is additive. Without JS the header is a static cream
   pill with a plain link row, which is a perfectly good header. */

export function initNav() {
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav    = document.getElementById('nav');
  if (!header || !burger || !nav) return;

  const links = [...nav.querySelectorAll('ul a[href^="#"]')];
  const spot  = nav.querySelector('.nav__spot');
  const fill  = header.querySelector('.header__progress i');
  const desktop = window.matchMedia('(min-width: 1024px)');

  /* ---------- condense, hide, progress ---------- */
  let lastY = window.scrollY;
  let drawerOpen = false;

  const onScroll = () => {
    const y = Math.max(0, window.scrollY);

    header.classList.toggle('is-stuck', y > 40);

    /* Park the bar once the reader is clearly moving down the page, and
       bring it back on the first upward flick. The 6px deadband stops
       Lenis' easing tail from flapping it at the end of a scroll. */
    const down = y > lastY + 6;
    const up   = y < lastY - 6;
    if (!drawerOpen && y > 520 && down) header.classList.add('is-hidden');
    else if (up || y < 520) header.classList.remove('is-hidden');
    if (down || up) lastY = y;

    if (fill) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- sliding highlight ---------- */
  /* One pill that travels between links, rather than six that fade. It
     follows the pointer while the reader is in the nav, and falls back to
     whichever section is on screen the moment they leave. */
  let current = null;   // scroll-spy target
  let hovered = null;

  const moveSpot = (link) => {
    if (!spot) return;
    links.forEach((a) => a.classList.toggle('is-lit', a === link && desktop.matches));
    if (!link || !desktop.matches) { nav.classList.remove('has-spot'); return; }
    spot.style.setProperty('--spot-x', `${link.offsetLeft}px`);
    spot.style.setProperty('--spot-w', `${link.offsetWidth}px`);
    /* Alternate the tilt on each landing so a run along the nav rocks
       back and forth instead of sliding flat. */
    if (nav.classList.contains('has-spot')) spot.classList.toggle('is-flipped');
    nav.classList.add('has-spot');
  };
  const syncSpot = () => moveSpot(hovered || current);

  links.forEach((a) => {
    a.addEventListener('pointerenter', () => { hovered = a; syncSpot(); });
    a.addEventListener('focus', () => { hovered = a; syncSpot(); });
  });
  nav.addEventListener('pointerleave', () => { hovered = null; syncSpot(); });
  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget)) { hovered = null; syncSpot(); }
  });
  window.addEventListener('resize', syncSpot);

  /* ---------- scroll-spy ---------- */
  /* The band runs from just under the header to a little above the fold, so
     a section counts as "current" while its opening is on screen. */
  const targets = links
    .map((a) => ({ a, el: document.querySelector(a.getAttribute('href')) }))
    .filter((t) => t.el);

  if (targets.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      /* Topmost visible section wins, so overlapping bands can't flicker. */
      let best = null;
      targets.forEach((t) => {
        if (!seen.has(t.el)) return;
        if (!best || t.el.getBoundingClientRect().top < best.el.getBoundingClientRect().top) best = t;
      });
      const next = best ? best.a : null;
      if (next === current) return;
      links.forEach((a) => a.classList.toggle('is-current', a === next));
      current = next;
      syncSpot();
    }, { rootMargin: '-88px 0px -55% 0px', threshold: 0 });

    targets.forEach((t) => spy.observe(t.el));
  }

  /* ---------- mobile drawer ---------- */
  const closeBtn = nav.querySelector('.nav__close');

  const setOpen = (open, restoreFocus) => {
    drawerOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);

    /* Lenis drives the window's scroll position on its own clock, so hiding
       body overflow does not stop it — the page keeps gliding behind the
       drawer. Stopping the instance is the only thing that holds it, and it
       brings `.lenis-stopped { overflow: hidden }` with it. Looked up per
       call rather than cached: initNav() runs before initScroll(), and on
       touch devices Lenis is never created at all, which is what the body
       fallback is for. */
    const lenis = window.__lenis;
    if (lenis) {
      open ? lenis.stop() : lenis.start();
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = open ? 'hidden' : '';
    }

    if (open) {
      header.classList.remove('is-hidden');
      /* Land the caret inside the panel, so the next Tab walks the menu
         rather than the page behind it.

         `preventScroll` is what makes the drawer slide at all. At the moment
         this runs the panel is still parked at translateX(100%), and .nav —
         `overflow: hidden` — is a scroll container all the same. A plain
         focus() therefore asks the browser to bring the button into view, and
         it obliges by scrolling .nav a full panel-width sideways: the drawer
         snaps open on the first frame, then the scroll offset eases back to 0
         against the transform easing in. The two cancel, the panel appears
         nailed in place while everything around it lurches, and the 0.45s
         slide is never seen. */
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    } else if (restoreFocus) {
      burger.focus();
    }
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (e) => {
    /* A link, the close button, or the scrim outside the sliding panel all
       close the drawer. */
    if (e.target.closest('.nav__close')) return setOpen(false, true);
    if (e.target.closest('a') || !e.target.closest('.nav__panel')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false, true);
    }
  });

  /* Reset the drawer if the viewport grows past the breakpoint. */
  desktop.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
    syncSpot();
  });
}
