(() => {
  'use strict';

  const August = (window.AugustExperience ||= {});

  const SELECTORS = Object.freeze({
    courseTitle: ['h1', '.page-header-headings h1', '[data-region="page-header"] h1'],
    section: ['li.section', '.course-section'],
    sectionTitle: ['.sectionname', '.course-section-header h3', 'h3'],
    activity: ['.activity', 'li.activity'],
    activityLink: ['a.aalink', '.activityinstance a', 'a']
  });

  function firstText(root, selectors) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      const text = node?.textContent?.replace(/\s+/g, ' ').trim();
      if (text) return text;
    }
    return '';
  }

  function firstNode(root, selectors) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  }

  function findAllByAlternatives(root, selectors) {
    for (const selector of selectors) {
      const nodes = Array.from(root.querySelectorAll(selector));
      if (nodes.length) return nodes;
    }
    return [];
  }

  August.registerAdapter({
    id: 'moodle-course-v1',
    supports(context) {
      return context?.surface === 'course-view' && context.teacherCapabilityVerified && context.confidence !== 'low';
    },
    extract() {
      const title = firstText(document, SELECTORS.courseTitle) || 'מרחב Moodle';
      const sections = findAllByAlternatives(document, SELECTORS.section).map((sectionNode, sectionIndex) => {
        const sectionTitle = firstText(sectionNode, SELECTORS.sectionTitle) || `יחידה ${sectionIndex + 1}`;
        const activities = findAllByAlternatives(sectionNode, SELECTORS.activity)
          .map((activityNode) => {
            const link = firstNode(activityNode, SELECTORS.activityLink);
            const label = link?.textContent?.replace(/\s+/g, ' ').trim();
            if (!link || !label) return null;
            return {
              label,
              href: link.href,
              nativeNode: activityNode
            };
          })
          .filter(Boolean);

        return {
          title: sectionTitle,
          activities,
          nativeNode: sectionNode
        };
      });

      const confidence = sections.length > 0 ? 'high' : 'low';
      return Object.freeze({
        adapterId: 'moodle-course-v1',
        confidence,
        title,
        sections
      });
    }
  });
})();
