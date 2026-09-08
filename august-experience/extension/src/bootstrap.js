(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  function disableAugust(reason, error) {
    document.documentElement.classList.remove('august-active');
    document.getElementById('august-experience-root')?.remove();
    August.diagnostics?.record('disabled', { reason, error: Boolean(error) });
    if (error) console.warn(`[August] Native Moodle preserved: ${reason}`, error);
  }

  function buildModel() {
    if (typeof August.detectContext !== 'function') return { ok: false, reason: 'detector unavailable' };
    const context = August.detectContext();
    August.diagnostics?.record('context-detected', {
      isCourse: Boolean(context.isCourse),
      teacherCapabilityVerified: Boolean(context.teacherCapabilityVerified),
      confidence: context.confidence || 'unknown'
    });

    if (!context.isCourse) return { ok: false, reason: 'not-course' };
    if (!context.teacherCapabilityVerified) return { ok: false, reason: 'teacher-capability-unverified' };
    if (context.confidence === 'low') return { ok: false, reason: 'low-context-confidence' };

    if (typeof August.selectAdapter !== 'function') return { ok: false, reason: 'adapter registry unavailable' };
    const adapter = August.selectAdapter(context);
    if (!adapter) return { ok: false, reason: 'no-compatible-adapter' };

    const model = adapter.extract(context);
    if (!model || model.confidence !== 'high') return { ok: false, reason: 'low-model-confidence' };
    return { ok: true, model };
  }

  function mount({ refresh = false } = {}) {
    try {
      const result = buildModel();
      if (!result.ok) {
        if (!['not-course', 'teacher-capability-unverified'].includes(result.reason)) {
          August.diagnostics?.record('mount-declined', { reason: result.reason });
        }
        return false;
      }

      if (typeof August.renderShell !== 'function') return disableAugust('shell unavailable');
      const rendered = August.renderShell(result.model, { refresh });
      if (!rendered) return disableAugust('shell declined unsupported page');

      August.diagnostics?.record(refresh ? 'refreshed' : 'mounted', {
        sections: result.model.sections?.length || 0
      });
      August.startDynamicRefresh?.();
      return true;
    } catch (error) {
      disableAugust(refresh ? 'refresh failure' : 'bootstrap failure', error);
      return false;
    }
  }

  window.addEventListener('august:refresh', () => mount({ refresh: true }));
  mount();
})();
