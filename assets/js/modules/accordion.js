/* FAQ accordion. Height animation is pure CSS (grid-template-rows
   0fr → 1fr); JS only owns state. */

export function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    const items = Array.from(root.querySelectorAll('.acc'));

    items.forEach((item) => {
      const trigger = item.querySelector('.acc__trigger');
      const panel   = item.querySelector('.acc__panel');
      if (!trigger || !panel) return;

      /* Wire up ids so the trigger properly controls its panel. */
      if (!panel.id) panel.id = `acc-panel-${Math.random().toString(36).slice(2, 9)}`;
      trigger.setAttribute('aria-controls', panel.id);

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        /* One open at a time reads better on a long FAQ. */
        items.forEach((other) => {
          if (other === item) return;
          other.classList.remove('is-open');
          other.querySelector('.acc__trigger')?.setAttribute('aria-expanded', 'false');
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        item.classList.toggle('is-open', !isOpen);
      });
    });
  });
}
