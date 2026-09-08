(() => {
  'use strict';

  // Evidence-only focus map. Add an entry only after the real screenshot was
  // visually inspected and the target bounds were verified. Empty means no
  // overlay — never guess, never draw a fake Moodle control.
  // Coordinates are percentages of the rendered screenshot: x/y/w/h in 0..100.
  const FOCUS_MAP = Object.freeze({});

  const OVERLAY_CLASS = 'guide-focus-overlay';
  const APPLIED_ATTR = 'data-guide-focus-applied';

  function filenameFromImage(image) {
    try {
      const url = new URL(image.currentSrc || image.src, window.location.href);
      return url.pathname.split('/').pop() || '';
    } catch {
      return '';
    }
  }

  function validBox(box) {
    if (!box || typeof box !== 'object') return false;
    const values = [box.x, box.y, box.w, box.h];
    if (!values.every((value) => Number.isFinite(value))) return false;
    if (box.x < 0 || box.y < 0 || box.w <= 0 || box.h <= 0) return false;
    if (box.x + box.w > 100 || box.y + box.h > 100) return false;
    return typeof box.label === 'string' && box.label.trim().length > 0;
  }

  function applyToImage(image) {
    if (!(image instanceof HTMLImageElement)) return;
    if (image.getAttribute(APPLIED_ATTR) === 'true') return;

    const filename = filenameFromImage(image);
    const box = FOCUS_MAP[filename];
    if (!validBox(box)) return;

    const anchor = image.closest('a');
    if (!anchor) return;

    anchor.style.position = 'relative';
    anchor.style.display = 'block';

    const overlay = document.createElement('span');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.left = `${box.x}%`;
    overlay.style.top = `${box.y}%`;
    overlay.style.width = `${box.w}%`;
    overlay.style.height = `${box.h}%`;

    const label = document.createElement('span');
    label.className = `${OVERLAY_CLASS}__label`;
    label.textContent = box.label;
    overlay.appendChild(label);

    anchor.appendChild(overlay);
    anchor.setAttribute('aria-label', `${image.alt}. מוקד לחיצה: ${box.label}`);
    image.setAttribute(APPLIED_ATTR, 'true');
  }

  function scan(root = document) {
    root.querySelectorAll?.('img[src*="/guide/screenshots/"]').forEach(applyToImage);
  }

  function start() {
    scan();
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches?.('img[src*="/guide/screenshots/"]')) applyToImage(node);
          scan(node);
        }
      }
    });
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  // Read-only diagnostic surface for local verification; no page/student data.
  Object.defineProperty(window, 'GUIDE_FOCUS_OVERLAYS', {
    value: Object.freeze({
      filenames: Object.freeze(Object.keys(FOCUS_MAP)),
      rescan: () => scan(),
    }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
