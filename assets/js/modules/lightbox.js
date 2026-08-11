/* Gallery lightbox.

   Progressive enhancement: the tiles are plain <figure>s in the HTML. This
   module turns each into a real <button> so it is keyboard-reachable and
   announced correctly, then opens the full image in a modal dialog.

   Uses <dialog>.showModal(), which gives the top layer, the backdrop and
   focus containment for free — no hand-rolled focus trap to get wrong.
   Escape is handled natively; we only add arrow-key paging and restore the
   scroll lock, since showModal() alone does not stop the page behind from
   scrolling in every browser. */

export function initLightbox() {
  const grid = document.getElementById('train');
  if (!grid || typeof HTMLDialogElement === 'undefined') return;

  const figures = [...grid.querySelectorAll('.car')];
  if (!figures.length) return;

  /* ---- build the dialog once ---- */
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Photograph viewer');
  dlg.innerHTML = `
    <figure class="lightbox__frame">
      <img class="lightbox__img" alt="">
      <figcaption class="lightbox__cap"><span></span><b class="lightbox__count"></b></figcaption>
    </figure>
    <button class="lightbox__close" type="button" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photograph">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>
    </button>
    <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photograph">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </button>`;
  document.body.appendChild(dlg);

  const imgEl   = dlg.querySelector('.lightbox__img');
  const capEl   = dlg.querySelector('.lightbox__cap span');
  const countEl = dlg.querySelector('.lightbox__count');

  /* Only the tiles still on screen can be paged to — filtering the gallery
     hides tiles, and paging into a hidden one would look like a dead arrow. */
  const visible = () => figures.filter((f) => !f.classList.contains('is-hidden'));
  let index = 0;

  function show(i) {
    const list = visible();
    if (!list.length) return;
    index = (i + list.length) % list.length;
    const fig = list[index];
    const img = fig.querySelector('img');
    imgEl.src = img.currentSrc || img.src;
    imgEl.alt = img.alt || '';
    capEl.textContent = (fig.querySelector('figcaption') || {}).textContent?.trim() || '';
    countEl.textContent = `${index + 1} / ${list.length}`;
    dlg.querySelectorAll('.lightbox__nav').forEach((b) => {
      b.hidden = list.length < 2;
    });
  }

  function open(fig) {
    show(visible().indexOf(fig));
    if (!dlg.open) dlg.showModal();
    document.documentElement.classList.add('lightbox-open');
  }

  /* ---- promote each tile to a button ---- */
  figures.forEach((fig) => {
    const cap = fig.querySelector('figcaption');
    const label = cap ? cap.textContent.trim() : (fig.querySelector('img')?.alt || 'photograph');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'car__open';
    btn.setAttribute('aria-label', `View ${label}`);
    fig.appendChild(btn);
    btn.addEventListener('click', () => open(fig));
  });

  dlg.querySelector('.lightbox__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lightbox__nav--prev').addEventListener('click', () => show(index - 1));
  dlg.querySelector('.lightbox__nav--next').addEventListener('click', () => show(index + 1));

  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1); }
  });

  /* Click the backdrop (i.e. the dialog itself, outside the figure) to close. */
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });

  dlg.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    imgEl.removeAttribute('src');
  });
}
