// Small, decorative brand overlays follow the visible photograph bounds.
(() => {
  const marks = new Map();
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; marks.forEach(place); });
  };
  const resize = new ResizeObserver(schedule);
  function place(mark, photo) {
    if (!photo.isConnected) { resize.unobserve(photo); mark.remove(); marks.delete(photo); return; }
    const parent = photo.parentElement;
    const bounds = parent.getBoundingClientRect();
    const rect = photo.getBoundingClientRect();
    let width = rect.width, height = rect.height;
    if (getComputedStyle(photo).objectFit === 'contain' && photo.naturalWidth) {
      const scale = Math.min(width / photo.naturalWidth, height / photo.naturalHeight);
      width = photo.naturalWidth * scale; height = photo.naturalHeight * scale;
    }
    const size = Math.min(94, Math.max(16, width * .15));
    const inset = Math.max(6, width * .035);
    const extra = photo.id === 'scene' ? 70 : photo.classList.contains('multi-image') ? 42 : 0;
    Object.assign(mark.style, {
      width: size + 'px', height: size * .7 + 'px',
      left: (rect.left - bounds.left + parent.scrollLeft - parent.clientLeft + (rect.width + width) / 2 - size - inset) + 'px',
      top: (rect.top - bounds.top + parent.scrollTop - parent.clientTop + (rect.height + height) / 2 - size * .7 - inset - extra) + 'px',
      visibility: width && height ? 'visible' : 'hidden'
    });
  }
  function scan() {
    document.querySelectorAll('main img, #product-dialog img, #scene').forEach(photo => {
      if (marks.has(photo)) return;
      const parent = photo.parentElement;
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      const mark = document.createElement('span');
      mark.className = 'westend-watermark'; mark.setAttribute('aria-hidden', 'true');
      parent.append(mark); marks.set(photo, mark); resize.observe(photo);
      photo.addEventListener('load', schedule);
    });
    schedule();
  }
  new MutationObserver(scan).observe(document.body, {childList: true, subtree: true});
  window.addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  scan();
})();
