import {
  GUIDE_SECTIONS as SOURCE_GUIDE_SECTIONS,
  GUIDE_SLIDES as SOURCE_GUIDE_SLIDES,
} from './guideDeckSource';

export type {
  GuideLink,
  GuideScreenshot,
  GuideSection,
  GuideSlide,
  GuideSlideStatus,
} from './guideDeckSource';

export const GUIDE_SECTIONS = SOURCE_GUIDE_SECTIONS;

function toModernScreenshotFilename(src: string) {
  return src.replace(/\.[^.]+$/, '.avif');
}

// Normalize the source once before anything reaches the application:
// 1) unresolved screenshot requirements are always needs-capture;
// 2) every existing screenshot uses the verified AVIF derivative for faster loading.
export const GUIDE_SLIDES = SOURCE_GUIDE_SLIDES.map((slide) => ({
  ...slide,
  status:
    slide.missingCaptureId && slide.status === 'ready'
      ? ('needs-capture' as const)
      : slide.status,
  screenshots: slide.screenshots?.map((screenshot) => ({
    ...screenshot,
    src: toModernScreenshotFilename(screenshot.src),
  })),
}));

// Publication invariant: a slide is public only when the normalized source
// explicitly marks it ready AND there is no unresolved real-screenshot requirement.
export const PUBLISHED_GUIDE_SLIDES = GUIDE_SLIDES.filter(
  (slide) => slide.status === 'ready' && !slide.missingCaptureId
);

const PUBLISHED_SLIDE_IDS = new Set(PUBLISHED_GUIDE_SLIDES.map((slide) => slide.id));

const QUICK_START_CANDIDATES = [
  'quick-start',
  'login',
  'my-courses',
  'create-space',
  'self-learning-space',
  'edit-mode',
  'add-content',
  'student-view',
  'self-enrol',
  'quiz-settings',
  'assignment-submissions',
  'gradebook',
  'report-chooser',
  'final-checklist',
];

// Quick Start must never point at a slide that publication policy withheld.
export const QUICK_START_SLIDE_IDS = QUICK_START_CANDIDATES.filter((slideId) =>
  PUBLISHED_SLIDE_IDS.has(slideId)
);
