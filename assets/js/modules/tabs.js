/* Accessible tabs — roving tabindex, arrow-key navigation.
   Follows the WAI-ARIA Authoring Practices tabs pattern. */

export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    const select = (tab) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => select(tab));

      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        let next = null;

        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        else return;

        e.preventDefault();
        select(next);
        next.focus();
      });
    });
  });
}
