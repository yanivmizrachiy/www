(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});
  const adapters = [];

  August.registerAdapter = function registerAdapter(adapter) {
    if (!adapter || typeof adapter.supports !== 'function' || typeof adapter.extract !== 'function') {
      throw new TypeError('Invalid August adapter');
    }
    adapters.push(adapter);
  };

  August.selectAdapter = function selectAdapter(context) {
    for (const adapter of adapters) {
      try {
        if (adapter.supports(context)) return adapter;
      } catch (error) {
        console.warn('[August] Adapter support check failed.', error);
      }
    }
    return null;
  };
})();
