/* Train carriage category filter. */

export function initGallery() {
  const chips = document.querySelectorAll('.chip[data-filter]');
  const items = document.querySelectorAll('#train .car');
  if (!chips.length || !items.length) return;

  const apply = (filter) => {
    items.forEach((item) => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('is-hidden', !show);
      item.setAttribute('aria-hidden', String(!show));
      /* the train got shorter or longer — retell the driver */
      window.dispatchEvent(new CustomEvent('train:relayout'));
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle('is-active', active);
        c.setAttribute('aria-pressed', String(active));
      });
      apply(chip.dataset.filter);
    });
  });
}
