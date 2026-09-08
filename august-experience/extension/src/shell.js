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
      August.diagnostics?.record(native ? 'native-view-enabled' : 'august-view-enabled');
    });
    root.append(button);
  }

  function renderActivities(section, activities) {
    if (!activities.length) return 0;
    const list = el('ul', 'august-activity-list');
    let count = 0;
    for (const activity of activities) {
      const item = el('li', 'august-activity-item');
      item.dataset.augustSearch = activity.label.toLocaleLowerCase('he');
      const link = el('a', 'august-activity-link', activity.label);
      link.href = activity.href;
      item.append(link);
      list.append(item);
      count += 1;
    }
    section.append(list);
    return count;
  }

  function installSearch(root) {
    const toolbar = el('div', 'august-toolbar');
    const label = el('label', 'august-search-label', 'חיפוש במרחב');
    const input = el('input', 'august-search-input');
    input.type = 'search';
    input.placeholder = 'חיפוש יחידה או פעילות…';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'חיפוש יחידה או פעילות במרחב');
    label.append(input);
    const result = el('span', 'august-search-result');
    result.setAttribute('aria-live', 'polite');
    toolbar.append(label, result);

    input.addEventListener('input', () => {
      const query = input.value.trim().toLocaleLowerCase('he');
      let visibleActivities = 0;
      let visibleSections = 0;
      for (const card of root.querySelectorAll('.august-section-card')) {
        const sectionMatches = (card.dataset.augustSearch || '').includes(query);
        let cardVisible = false;
        for (const item of card.querySelectorAll('.august-activity-item')) {
          const visible = !query || sectionMatches || (item.dataset.augustSearch || '').includes(query);
          item.hidden = !visible;
          if (visible) {
            visibleActivities += 1;
            cardVisible = true;
          }
        }
        if (!card.querySelector('.august-activity-item') && sectionMatches) cardVisible = true;
        card.hidden = Boolean(query) && !cardVisible;
        if (!card.hidden) visibleSections += 1;
      }
      result.textContent = query ? `${visibleSections} יחידות · ${visibleActivities} פעילויות` : '';
    });

    return toolbar;
  }

  function buildShell(model) {
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
    root.append(header, installSearch(root));

    const grid = el('div', 'august-section-grid');
    let totalActivities = 0;
    for (const sectionModel of model.sections) {
      const section = el('article', 'august-section-card');
      section.dataset.augustSearch = sectionModel.title.toLocaleLowerCase('he');
      section.append(el('h3', 'august-section-title', sectionModel.title));
      totalActivities += renderActivities(section, sectionModel.activities || []);
      grid.append(section);
    }
    root.append(grid);
    root.dataset.augustSectionCount = String(model.sections.length);
    root.dataset.augustActivityCount = String(totalActivities);
    return root;
  }

  August.renderShell = function renderShell(model, options = {}) {
    if (!model || model.confidence !== 'high' || !model.sections?.length) return false;

    const nativeMain = document.querySelector('#page-content, [role="main"], main');
    if (!nativeMain) return false;

    const previous = document.getElementById(ROOT_ID);
    const root = buildShell(model);
    if (previous) {
      const wasNative = document.documentElement.classList.contains(NATIVE_CLASS);
      previous.replaceWith(root);
      if (wasNative) document.documentElement.classList.add(NATIVE_CLASS);
    } else {
      nativeMain.parentNode.insertBefore(root, nativeMain);
    }

    document.documentElement.classList.add('august-active');
    if (options.refresh) August.diagnostics?.record('shell-rebuilt');
    return true;
  };
})();
