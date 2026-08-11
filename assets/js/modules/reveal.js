/* Scroll reveals + word-split headlines.
   Uses IntersectionObserver so it never depends on a CDN. */

function splitWords(el) {
  /* Only split plain text nodes; leaves nested markup alone. */
  const text = el.textContent.trim();
  if (!text) return;
  const words = text.split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const outer = document.createElement('span');
    outer.className = 'word';
    outer.style.setProperty('--i', i);
    const inner = document.createElement('span');
    inner.textContent = w;
    outer.append(inner);
    el.append(outer);
    if (i < words.length - 1) el.append(document.createTextNode(' '));
  });
}

export function initReveal({ reduced = false } = {}) {
  const targets = document.querySelectorAll('[data-reveal], [data-split]');
  if (!targets.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  document.querySelectorAll('[data-split]').forEach(splitWords);

  /* Stagger siblings that share a parent so groups feel authored,
     not mechanical. */
  const groups = new Map();
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, 0);
    const idx = groups.get(parent);
    el.style.setProperty('--d', `${Math.min(idx, 5) * 90}ms`);
    groups.set(parent, idx + 1);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  targets.forEach((el) => io.observe(el));
}
