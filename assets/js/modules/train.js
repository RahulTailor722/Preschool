/* The toy train gallery.

   Baseline (no JS, blocked CDN, reduced motion): `.rail__viewport` is an
   ordinary horizontally-scrollable strip. Everyone can reach every carriage
   by swiping or dragging, and nothing is hidden.

   Enhanced: this module pins the stage to the viewport and converts vertical
   scroll into the train's horizontal travel, so the train drives across as
   you read down the page.

   Written against plain scroll + rAF rather than GSAP ScrollTrigger, because
   GSAP loads from a CDN and is explicitly optional on this site — the
   gallery must not depend on it. */

/* Matches the 64px carriage wheel in style.css. Only used to convert distance
   travelled into a believable number of turns, so it needs to be about right,
   not exact. */
const WHEEL_CIRCUMFERENCE = Math.PI * 64;

export function initTrain({ reduced = false } = {}) {
  const rail = document.getElementById('rail');
  const train = document.getElementById('train');
  if (!rail || !train) return;

  const stage = rail.querySelector('.rail__stage');
  const viewport = rail.querySelector('.rail__viewport');
  if (!stage || !viewport) return;

  /* Coarse pointers get the native swipe strip: it is the better interaction
     on a phone, and pinning a tall section on a touch device fights the
     browser's own scroll handling. */
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (reduced || coarse) return;

  rail.classList.add('is-driven');

  let distance = 0;   // how far the train must travel, in px
  let railTop = 0;    // the rail's top in DOCUMENT coordinates
  let span = 0;       // scroll distance over which the journey plays out
  let raf = 0;

  function measure() {
    /* Travel is the overflow measured against the viewport's CONTENT box,
       not clientWidth. clientWidth includes the horizontal padding, so using
       it leaves the train short by one gutter and the final carriage never
       fully arrives — it stops half-cropped at the right edge. */
    const cs = getComputedStyle(viewport);
    const inner = viewport.clientWidth
                - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    distance = Math.max(0, train.scrollWidth - inner);
    /* Enough height for the whole journey plus one viewport of dwell, so the
       train both starts and finishes on screen. */
    rail.style.setProperty('--travel', distance + 'px');
    rail.style.height = (window.innerHeight + distance) + 'px';
    viewport.scrollLeft = 0;    // the driver owns X now, not the scrollbar

    /* Must be the document offset, not offsetTop. offsetTop is measured from
       the offsetParent, and <main> is position:relative — so offsetTop here
       is relative to <main>, which additionally carries a negative margin to
       cover the banner's dead scroll. getBoundingClientRect + scrollY is the
       only reading that survives both. */
    railTop = rail.getBoundingClientRect().top + window.scrollY;
    span = rail.offsetHeight - window.innerHeight;
    apply();
  }

  function apply() {
    const p = span <= 0 ? 0 : Math.min(1, Math.max(0, (window.scrollY - railTop) / span));
    const travelled = distance * p;
    train.style.transform = 'translate3d(' + (-travelled).toFixed(2) + 'px,0,0)';
    rail.style.setProperty('--progress', p.toFixed(4));
    /* Wheel rotation derived from actual distance covered, so the wheels turn
       at the speed the train is really moving — and stop dead when it stops.
       One revolution per circumference travelled. */
    rail.style.setProperty('--spin', (travelled / WHEEL_CIRCUMFERENCE * 360).toFixed(2) + 'deg');
    raf = 0;
  }

  const onScroll = () => { if (!raf) raf = requestAnimationFrame(apply); };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  /* Filtering adds or removes carriages, so the journey length changes. */
  window.addEventListener('train:relayout', measure);
  /* Late-loading carriage images change scrollWidth after first measure. */
  window.addEventListener('load', measure);

  measure();
}
