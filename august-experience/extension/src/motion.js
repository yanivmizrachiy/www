(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  function animateIn(root) {
    if (!root || !August.config?.flags?.premiumMotion || !Element.prototype.animate) return;
    const cards = [...root.querySelectorAll('.august-section-card')];
    const hero = root.querySelector('.august-shell-header');
    const toolbar = root.querySelector('.august-toolbar');

    hero?.animate(
      [
        { opacity: 0, transform: 'translateY(16px) scale(.985)', filter: 'blur(10px)' },
        { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0)' }
      ],
      { duration: August.config.motion.durationSlow, easing: August.config.motion.easing, fill: 'both' }
    );

    toolbar?.animate(
      [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: August.config.motion.durationMedium, delay: 90, easing: August.config.motion.easing, fill: 'both' }
    );

    cards.forEach((card, index) => {
      card.animate(
        [
          { opacity: 0, transform: 'translateY(18px) scale(.985)' },
          { opacity: 1, transform: 'translateY(0) scale(1)' }
        ],
        {
          duration: August.config.motion.durationMedium,
          delay: Math.min(index * 42, 420),
          easing: August.config.motion.easing,
          fill: 'both'
        }
      );
    });
  }

  August.motion = Object.freeze({ animateIn });
})();
