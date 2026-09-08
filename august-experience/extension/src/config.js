(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const reducedTransparency = window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches ?? false;

  August.config = Object.freeze({
    version: '0.4.0',
    flags: Object.freeze({
      commandPalette: true,
      premiumMotion: !reducedMotion,
      ambientGlow: !reducedTransparency,
      localSearch: true,
      dynamicRefresh: true,
      compatibilityBadge: true,
      keyboardShortcuts: true
    }),
    motion: Object.freeze({
      durationFast: reducedMotion ? 0 : 160,
      durationMedium: reducedMotion ? 0 : 360,
      durationSlow: reducedMotion ? 0 : 620,
      easing: 'cubic-bezier(.2,.8,.2,1)'
    })
  });
})();
