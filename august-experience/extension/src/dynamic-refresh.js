(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  let timer = null;
  let observer = null;

  function schedule(reason) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      August.diagnostics?.record('refresh-requested', { reason });
      window.dispatchEvent(new CustomEvent('august:refresh', { detail: { reason } }));
    }, 180);
  }

  August.startDynamicRefresh = function startDynamicRefresh() {
    if (observer || !document.body) return;

    observer = new MutationObserver((mutations) => {
      const meaningful = mutations.some((mutation) => {
        if (mutation.type !== 'childList') return false;
        return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => {
          if (!(node instanceof Element)) return false;
          if (node.closest?.('#august-experience-root')) return false;
          return node.matches?.('.course-content, .course-section, li.section, .activity, .activity-item') ||
            node.querySelector?.('.course-section, li.section, .activity, .activity-item');
        });
      });
      if (meaningful) schedule('moodle-dom-change');
    });

    observer.observe(document.body, { childList: true, subtree: true });
    August.diagnostics?.record('dynamic-refresh-started');
  };

  August.stopDynamicRefresh = function stopDynamicRefresh() {
    observer?.disconnect();
    observer = null;
    clearTimeout(timer);
  };
})();
