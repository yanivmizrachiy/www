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
export const GUIDE_SLIDES = SOURCE_GUIDE_SLIDES;

// Publication invariant: an operational slide is public only when its real
// screenshot sequence is complete and no factual answer is still unresolved.
// Incomplete slides remain fully preserved in GUIDE_SLIDES / guideDeckSource.ts.
export const PUBLISHED_GUIDE_SLIDES = GUIDE_SLIDES.filter(
  (slide) =>
    slide.status !== 'needs-capture' &&
    slide.status !== 'needs-fact' &&
    !slide.missingCaptureId
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
