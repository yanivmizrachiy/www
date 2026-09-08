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

  function icon(name) {
    const map = {
      search: '⌕',
      grid: '◫',
      activity: '↗',
      native: '↶',
      sparkle: '✦'
    };
    const span = el('span', 'august-icon', map[name] || '•');
    span.setAttribute('aria-hidden', 'true');
    return span;
  }

  function installEscapeHatch(root) {
    const button = el('button', 'august-native-toggle');
    button.type = 'button';
    button.append(icon('native'), el('span', null, 'תצוגת Moodle רגילה'));
    button.addEventListener('click', () => {
      const native = document.documentElement.classList.toggle(NATIVE_CLASS);
      button.lastChild.textContent = native ? 'חזרה לתצוגת אוגוסט' : 'תצוגת Moodle רגילה';
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
      const link = el('a', 'august-activity-link');
      link.href = activity.href;
      const marker = el('span', 'august-activity-marker');
      marker.append(icon('activity'));
      const text = el('span', 'august-activity-text', activity.label);
      const arrow = el('span', 'august-activity-arrow', '←');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(marker, text, arrow);
      item.append(link);
      list.append(item);
      count += 1;
    }
    section.append(list);
    return count;
  }

  function installSearch(root) {
    const toolbar = el('div', 'august-command-bar');
    const label = el('label', 'august-search-label');
    label.append(icon('search'));
    const input = el('input', 'august-search-input');
    input.type = 'search';
    input.placeholder = 'חיפוש מהיר בכל המרחב…';
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

  function statCard(label, value, iconName) {
    const card = el('div', 'august-stat-card');
    const visual = el('div', 'august-stat-icon');
    visual.append(icon(iconName));
    const content = el('div', 'august-stat-content');
    content.append(el('strong', 'august-stat-value', String(value)), el('span', 'august-stat-label', label));
    card.append(visual, content);
    return card;
  }

  function buildShell(model) {
    const root = el('section', 'august-shell');
    root.id = ROOT_ID;
    root.dir = 'rtl';
    root.setAttribute('aria-label', 'המודל של אוגוסט');

    const totalActivities = model.sections.reduce((sum, section) => sum + (section.activities?.length || 0), 0);

    const hero = el('header', 'august-hero');
    const glowA = el('span', 'august-glow august-glow-a');
    const glowB = el('span', 'august-glow august-glow-b');
    const heroTop = el('div', 'august-hero-top');
    const brand = el('div', 'august-brand-pill');
    brand.append(icon('sparkle'), el('span', null, 'AUGUST EXPERIENCE'));
    heroTop.append(brand);
    installEscapeHatch(heroTop);

    const headingWrap = el('div', 'august-heading-wrap');
    const eyebrow = el('span', 'august-eyebrow', 'סביבת העבודה החדשה של המורה');
    const title = el('h1', 'august-course-title', model.title);
    const status = el('p', 'august-status', 'אותו Moodle. אותה הרשאה. אותה אמת. חוויית עבודה אחרת לגמרי.');
    headingWrap.append(eyebrow, title, status);

    const stats = el('div', 'august-stats');
    stats.append(
      statCard('יחידות במרחב', model.sections.length, 'grid'),
      statCard('פעילויות זמינות', totalActivities, 'activity')
    );

    hero.append(glowA, glowB, heroTop, headingWrap, stats);
    root.append(hero, installSearch(root));

    const sectionHeader = el('div', 'august-content-heading');
    sectionHeader.append(el('div', 'august-content-kicker', 'מרחב הלמידה'), el('h2', 'august-content-title', 'כל התוכן, מסודר לעבודה מהירה'));
    root.append(sectionHeader);

    const grid = el('div', 'august-section-grid');
    let sectionIndex = 0;
    for (const sectionModel of model.sections) {
      sectionIndex += 1;
      const section = el('article', 'august-section-card');
      section.dataset.augustSearch = sectionModel.title.toLocaleLowerCase('he');
      section.style.setProperty('--august-index', String(sectionIndex));

      const cardHead = el('div', 'august-card-head');
      const number = el('span', 'august-section-number', String(sectionIndex).padStart(2, '0'));
      const titleWrap = el('div', 'august-section-title-wrap');
      titleWrap.append(
        el('h3', 'august-section-title', sectionModel.title),
        el('span', 'august-section-meta', `${sectionModel.activities?.length || 0} פעילויות`)
      );
      cardHead.append(number, titleWrap);
      section.append(cardHead);
      renderActivities(section, sectionModel.activities || []);
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
