(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  const ROOT_ID = 'august-experience-root';
  const NATIVE_CLASS = 'august-native-view';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function installEscapeHatch(root) {
    const button = el('button', 'august-native-toggle', 'תצוגת Moodle רגילה');
    button.type = 'button';
    button.addEventListener('click', () => {
      const native = document.documentElement.classList.toggle(NATIVE_CLASS);
      button.textContent = native ? 'חזרה לתצוגת אוגוסט' : 'תצוגת Moodle רגילה';
    });
    root.append(button);
  }

  function renderActivities(section, activities) {
    if (!activities.length) return;
    const list = el('ul', 'august-activity-list');
    for (const activity of activities) {
      const item = el('li', 'august-activity-item');
      const link = el('a', 'august-activity-link', activity.label);
      link.href = activity.href;
      item.append(link);
      list.append(item);
    }
    section.append(list);
  }

  August.renderShell = function renderShell(model) {
    if (!model || model.confidence !== 'high' || !model.sections?.length) return false;
    if (document.getElementById(ROOT_ID)) return true;

    const root = el('section', 'august-shell');
    root.id = ROOT_ID;
    root.dir = 'rtl';
    root.setAttribute('aria-label', 'המודל של אוגוסט');

    const header = el('header', 'august-shell-header');
    const headingWrap = el('div', 'august-heading-wrap');
    const eyebrow = el('span', 'august-eyebrow', 'סביבת עבודה למורה');
    const title = el('h2', 'august-course-title', model.title);
    const status = el('p', 'august-status', 'אותו מרחב Moodle, בתצוגה מסודרת יותר. כל הפעולות נשארות פעולות Moodle מקוריות.');
    headingWrap.append(eyebrow, title, status);
    header.append(headingWrap);
    installEscapeHatch(header);
    root.append(header);

    const grid = el('div', 'august-section-grid');
    for (const sectionModel of model.sections) {
      const section = el('article', 'august-section-card');
      section.append(el('h3', 'august-section-title', sectionModel.title));
      renderActivities(section, sectionModel.activities);
      grid.append(section);
    }
    root.append(grid);

    const nativeMain = document.querySelector('#page-content, [role="main"], main');
    if (!nativeMain) return false;
    nativeMain.parentNode.insertBefore(root, nativeMain);
    document.documentElement.classList.add('august-active');
    return true;
  };
})();
