/* Count-up statistics, triggered once on first view. */

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function run(el) {
  const target   = parseFloat(el.dataset.count);
  const decimals = parseInt(el.dataset.decimals || '0', 10);
  if (Number.isNaN(target)) return;

  const duration = 1500;
  const start    = performance.now();

  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const value = target * easeOut(p);
    el.textContent = decimals
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = decimals ? target.toFixed(decimals) : target.toLocaleString('en-IN');
  };

  requestAnimationFrame(tick);
}

export function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    nums.forEach((el) => {
      const t = parseFloat(el.dataset.count);
      const d = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = d ? t.toFixed(d) : t.toLocaleString('en-IN');
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  nums.forEach((el) => io.observe(el));
}
