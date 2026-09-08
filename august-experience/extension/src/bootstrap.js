(() => {
  'use strict';

  const ROOT_ID = 'august-experience-root';
  const NATIVE_CLASS = 'august-native-view';

  function detectContext() {
    const body = document.body;
    const path = location.pathname;
    const isCourse = /\/course\/view\.php$/i.test(path) || body.classList.contains('path-course-view');

    // Moodle commonly exposes editing controls only to users allowed to edit the course.
    // This is deliberately conservative: absence/ambiguity means no activation.
    const editingSignals = [
      '[data-action="editmode"]',
      'form.editmode-switch-form',
      '.editingbutton',
      'a[href*="edit=on"]'
    ];
    const evidence = editingSignals.filter((selector) => document.querySelector(selector));

    return {
      isCourse,
      teacherCapabilityVerified: evidence.length > 0,
      evidenceCount: evidence.length
    };
  }

  function installEscapeHatch(root) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'august-native-toggle';
    button.textContent = 'תצוגת Moodle רגילה';
    button.addEventListener('click', () => {
      document.documentElement.classList.toggle(NATIVE_CLASS);
      button.textContent = document.documentElement.classList.contains(NATIVE_CLASS)
        ? 'חזרה לתצוגת אוגוסט'
        : 'תצוגת Moodle רגילה';
    });
    root.append(button);
  }

  function mount() {
    if (document.getElementById(ROOT_ID)) return;

    const context = detectContext();
    if (!context.isCourse || !context.teacherCapabilityVerified) return;

    const root = document.createElement('aside');
    root.id = ROOT_ID;
    root.setAttribute('dir', 'rtl');
    root.setAttribute('aria-label', 'המודל של אוגוסט');

    const title = document.createElement('strong');
    title.textContent = 'המודל של אוגוסט';
    const status = document.createElement('span');
    status.textContent = 'תצוגת מורה ניסיונית — Moodle נשאר מקור האמת';

    root.append(title, status);
    installEscapeHatch(root);
    document.body.prepend(root);
  }

  // Fail-open: an exception must never block native Moodle.
  try {
    mount();
  } catch (error) {
    console.warn('[August] Native Moodle preserved after bootstrap failure.', error);
    document.getElementById(ROOT_ID)?.remove();
  }
})();
