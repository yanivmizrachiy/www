(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  const WEIGHTS = Object.freeze({
    courseSurface: 30,
    teacherSignal: 30,
    contextConfidence: 15,
    adapter: 15,
    model: 10
  });

  function level(score) {
    if (score >= 90) return 'verified-shape';
    if (score >= 70) return 'provisional';
    return 'unsupported';
  }

  August.evaluateCompatibility = function evaluateCompatibility({ context, adapter, model } = {}) {
    let score = 0;
    const checks = [];

    const add = (id, passed, weight) => {
      checks.push(Object.freeze({ id, passed: Boolean(passed), weight }));
      if (passed) score += weight;
    };

    add('course-surface', context?.isCourse, WEIGHTS.courseSurface);
    add('teacher-signal', context?.teacherCapabilityVerified, WEIGHTS.teacherSignal);
    add('context-confidence', context?.confidence === 'high', WEIGHTS.contextConfidence);
    add('adapter-selected', Boolean(adapter), WEIGHTS.adapter);
    add('model-confidence', model?.confidence === 'high' && Boolean(model?.sections?.length), WEIGHTS.model);

    const result = Object.freeze({
      score,
      level: level(score),
      safeToRender: score >= 70 && Boolean(context?.teacherCapabilityVerified) && model?.confidence === 'high',
      checks: Object.freeze(checks)
    });

    August.diagnostics?.record('compatibility-evaluated', {
      score: result.score,
      level: result.level,
      safeToRender: result.safeToRender
    });

    return result;
  };
})();
