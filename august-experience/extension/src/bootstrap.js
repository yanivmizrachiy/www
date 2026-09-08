(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  function disableAugust(reason, error) {
    document.documentElement.classList.remove('august-active');
    document.getElementById('august-experience-root')?.remove();
    if (error) console.warn(`[August] Native Moodle preserved: ${reason}`, error);
  }

  function mount() {
    if (document.getElementById('august-experience-root')) return;
    if (typeof August.detectContext !== 'function') return disableAugust('detector unavailable');

    const context = August.detectContext();
    if (!context.isCourse || !context.teacherCapabilityVerified || context.confidence === 'low') return;

    if (typeof August.selectAdapter !== 'function') return disableAugust('adapter registry unavailable');
    const adapter = August.selectAdapter(context);
    if (!adapter) return;

    const model = adapter.extract(context);
    if (!model || model.confidence !== 'high') return;

    if (typeof August.renderShell !== 'function') return disableAugust('shell unavailable');
    if (!August.renderShell(model)) return disableAugust('shell declined unsupported page');
  }

  try {
    mount();
  } catch (error) {
    disableAugust('bootstrap failure', error);
  }
})();
