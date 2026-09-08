(() => {
  'use strict';

  // Evidence-only focus overlays. Coordinates live beside this script in
  // focus-map.json so the same bundle works at /guide/ and repository-base
  // static paths such as /www/guide/. Missing/invalid evidence means no overlay.
  let focusMap = Object.freeze({});
  const OVERLAY_CLASS = 'guide-focus-overlay';
  const APPLIED_ATTR = 'data-guide-focus-applied';
  const ORIGINAL_ARIA_ATTR = 'data-guide-focus-original-aria-label';
  const HAD_ARIA_ATTR = 'data-guide-focus-had-aria-label';
  const scriptUrl = document.currentScript?.src || window.location.href;
  const focusMapUrl = new URL('focus-map.json', scriptUrl).href;

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

  function rememberAnchorAria(anchor) {
    if (anchor.hasAttribute(HAD_ARIA_ATTR)) return;
    const hadAria = anchor.hasAttribute('aria-label');
    anchor.setAttribute(HAD_ARIA_ATTR, hadAria ? 'true' : 'false');
    if (hadAria) anchor.setAttribute(ORIGINAL_ARIA_ATTR, anchor.getAttribute('aria-label') || '');
  }

  function restoreAnchorAria(anchor) {
    if (anchor.getAttribute(HAD_ARIA_ATTR) === 'true') {
      anchor.setAttribute('aria-label', anchor.getAttribute(ORIGINAL_ARIA_ATTR) || '');
    } else {
      anchor.removeAttribute('aria-label');
    }
  }

  function removeExistingOverlay(anchor) {
    anchor.querySelector(`:scope > .${OVERLAY_CLASS}`)?.remove();
    restoreAnchorAria(anchor);
  }

  function applyToImage(image) {
    if (!(image instanceof HTMLImageElement)) return;

    const filename = filenameFromImage(image);
    const box = focusMap[filename];
    const anchor = image.closest('a');
    if (!anchor) return;

    rememberAnchorAria(anchor);
    removeExistingOverlay(anchor);
    image.removeAttribute(APPLIED_ATTR);

    if (!validBox(box)) return;

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
    if (root instanceof HTMLImageElement && root.matches('img[src*="/guide/screenshots/"]')) {
      applyToImage(root);
    }
    root.querySelectorAll?.('img[src*="/guide/screenshots/"]').forEach(applyToImage);
  }

  async function loadFocusMap() {
    try {
      const response = await fetch(focusMapUrl, { cache: 'no-cache', credentials: 'same-origin' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || typeof data !== 'object' || Array.isArray(data)) return;
      focusMap = Object.freeze(data);
      scan();
    } catch {
      // Fail open: the Guide remains fully usable without focus overlays.
    }
  }

  function start() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) scan(node);
        }
      }
    });
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
    void loadFocusMap();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  Object.defineProperty(window, 'GUIDE_FOCUS_OVERLAYS', {
    value: Object.freeze({
      getFilenames: () => Object.freeze(Object.keys(focusMap)),
      rescan: () => scan(),
      reload: () => loadFocusMap(),
    }),
    configurable: false,
    enumerable: false,
    writable: false,
  });
})();
