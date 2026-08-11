/* Smooth scrolling (Lenis) + scrub-linked parallax (GSAP ScrollTrigger).

   Both libraries are optional. If either is missing — CDN blocked,
   offline, corporate proxy — we simply skip that enhancement and the
   page keeps working with native scrolling. */

export function initScroll({ reduced = false } = {}) {
  if (reduced) return;

  const isTouch = window.matchMedia('(hover: none)').matches;
  let lenis = null;

  /* ---------- Lenis smooth scroll ---------- */
  const Lenis = window.Lenis;
  if (Lenis && !isTouch) {
    /* `lerp` rather than `duration`. A duration-based tween restarts on
       every wheel tick, so a quick flick queues a ~1s animation that keeps
       being re-aimed — the wheel feels like it lags behind the hand. A
       lerp is frame-rate independent and starts moving on the same frame
       as the input. */
    lenis = new Lenis({
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    /* Published so the drawer can stop and start it. `body{overflow:hidden}`
       does not hold Lenis — it animates the window's scroll position itself
       and will happily keep running underneath an open overlay. nav.js reads
       this lazily, because initNav() runs before initScroll(). */
    window.__lenis = lenis;

    /* Anchor links must go through Lenis or they fight each other. */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -90 });
      });
    });
  }

  /* ---------- GSAP ScrollTrigger ---------- */
  const { gsap, ScrollTrigger } = window;

  /* No GSAP? Lenis still needs a rAF loop of its own. */
  if (!gsap || !ScrollTrigger) {
    if (lenis) {
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (lenis) {
    /* One clock, not two. Driving lenis.raf from GSAP's ticker means the
       scroll position and every scrubbed animation are computed in the
       same frame; running Lenis on its own requestAnimationFrame alongside
       GSAP's ticker lets them interleave and visibly judder. */
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Polaroids drift at individually authored rates. */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const rate = parseFloat(el.dataset.parallax) || 0.1;
    gsap.to(el, {
      yPercent: rate * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.scatter',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });

  /* The EST. 2011 watermark slides opposite the scatter for parallax depth. */
  const watermark = document.querySelector('.scatter__watermark');
  if (watermark) {
    gsap.fromTo(
      watermark,
      { xPercent: -4 },
      {
        xPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: '.scatter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      }
    );
  }

  ScrollTrigger.refresh();
}
