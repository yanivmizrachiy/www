(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  let overlay = null;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === 'string') node.textContent = text;
    return node;
  }

  function close() {
    overlay?.remove();
    overlay = null;
  }

  function runAction(action, root) {
    if (action === 'search') {
      close();
      root.querySelector('.august-search-input')?.focus();
      return;
    }
    if (action === 'native') {
      close();
      document.documentElement.classList.add('august-native-view');
      August.diagnostics?.record('command-native-view');
      return;
    }
    if (action === 'top') {
      close();
      root.scrollIntoView({ behavior: August.config?.flags?.premiumMotion ? 'smooth' : 'auto', block: 'start' });
      return;
    }
    if (action.startsWith('section:')) {
      const index = Number(action.split(':')[1]);
      close();
      root.querySelectorAll('.august-section-card')[index]?.scrollIntoView({
        behavior: August.config?.flags?.premiumMotion ? 'smooth' : 'auto',
        block: 'center'
      });
    }
  }

  function open(root, model) {
    if (overlay || !root) return;
    overlay = el('div', 'august-palette-overlay');
    overlay.setAttribute('role', 'presentation');

    const dialog = el('div', 'august-palette');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', 'פקודות מהירות');

    const title = el('div', 'august-palette-title', 'פקודות מהירות');
    const list = el('div', 'august-palette-list');
    const actions = [
      ['search', 'חיפוש במרחב', '⌘K'],
      ['top', 'חזרה לראש המרחב', 'Home'],
      ['native', 'תצוגת Moodle רגילה', 'Esc']
    ];

    model.sections.slice(0, 8).forEach((section, index) => {
      actions.push([`section:${index}`, `מעבר אל ${section.title}`, String(index + 1)]);
    });

    actions.forEach(([action, label, hint]) => {
      const button = el('button', 'august-palette-item');
      button.type = 'button';
      button.dataset.action = action;
      button.append(el('span', 'august-palette-label', label), el('kbd', 'august-palette-kbd', hint));
      button.addEventListener('click', () => runAction(action, root));
      list.append(button);
    });

    dialog.append(title, list);
    overlay.append(dialog);
    overlay.addEventListener('mousedown', (event) => {
      if (event.target === overlay) close();
    });
    document.body.append(overlay);
    requestAnimationFrame(() => dialog.querySelector('button')?.focus());
    August.diagnostics?.record('command-palette-opened');
  }

  August.installCommandPalette = function installCommandPalette(root, model) {
    if (!August.config?.flags?.commandPalette) return;
    if (root.dataset.augustPaletteBound === '1') return;
    root.dataset.augustPaletteBound = '1';

    const trigger = el('button', 'august-command-trigger');
    trigger.type = 'button';
    trigger.setAttribute('aria-label', 'פתיחת פקודות מהירות');
    trigger.append(el('span', null, 'פקודות'), el('kbd', null, 'Ctrl K'));
    trigger.addEventListener('click', () => open(root, model));
    root.querySelector('.august-command-bar')?.append(trigger);

    document.addEventListener('keydown', (event) => {
      const shortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (shortcut) {
        event.preventDefault();
        open(root, model);
      } else if (event.key === 'Escape' && overlay) {
        event.preventDefault();
        close();
      }
    }, { passive: false });
  };
})();
