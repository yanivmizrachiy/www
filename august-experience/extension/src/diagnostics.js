(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  const MAX_EVENTS = 40;
  const events = [];

  function safeEvent(type, detail = {}) {
    const event = {
      at: new Date().toISOString(),
      type,
      detail: {
        path: location.pathname,
        ...detail
      }
    };
    events.push(event);
    if (events.length > MAX_EVENTS) events.shift();
    return event;
  }

  August.diagnostics = {
    record: safeEvent,
    snapshot() {
      return {
        version: '0.3.0',
        host: location.host,
        path: location.pathname,
        active: document.documentElement.classList.contains('august-active'),
        nativeView: document.documentElement.classList.contains('august-native-view'),
        events: events.slice()
      };
    }
  };

  // Local-only diagnostics. No page content or student data is transmitted.
  Object.defineProperty(window, 'AUGUST_DIAGNOSTICS', {
    configurable: false,
    enumerable: false,
    get() {
      return August.diagnostics.snapshot();
    }
  });
})();
