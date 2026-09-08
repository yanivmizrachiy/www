(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  August.detectContext = function detectContext() {
    const body = document.body;
    const path = location.pathname;
    const isCourse = /\/course\/view\.php$/i.test(path) || body.classList.contains('path-course-view');

    const teacherSignals = [
      '[data-action="editmode"]',
      'form.editmode-switch-form',
      '.editingbutton',
      'a[href*="edit=on"]',
      '[data-region="editmode-switch"]'
    ];

    const evidence = teacherSignals
      .map((selector) => ({ selector, found: Boolean(document.querySelector(selector)) }))
      .filter((item) => item.found);

    const courseId = new URL(location.href).searchParams.get('id');
    const confidence = isCourse && evidence.length >= 2 ? 'high' : isCourse && evidence.length === 1 ? 'medium' : 'low';

    return Object.freeze({
      surface: isCourse ? 'course-view' : 'unsupported',
      isCourse,
      courseId,
      teacherCapabilityVerified: isCourse && evidence.length > 0,
      confidence,
      evidence
    });
  };
})();
