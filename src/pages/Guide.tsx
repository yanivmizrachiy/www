import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Expand,
  ExternalLink,
  Home,
  List,
  Maximize2,
  Menu,
  Minimize2,
  PlayCircle,
  Search,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FIRST_GUIDE_SLIDE_ID,
  GUIDE_SECTIONS,
  PUBLISHED_GUIDE_SLIDES,
  QUICK_START_SLIDE_IDS,
  type GuideScreenshot,
  type GuideSlide,
} from '@/data/guideDeck';
import { getGuideScreenshotHotspots } from '@/data/guideHotspots';

type Panel = 'menu' | 'search' | null;
type DeckMode = 'all' | 'quick';

type LightboxState = {
  screenshot: GuideScreenshot;
  slideTitle: string;
} | null;

const MOODLE_HOME = 'https://moodlemoe.lms.education.gov.il/';

function imageUrl(src: string) {
  return `/guide/screenshots/${src}`;
}

function getSlideIndexFromUrl(): number {
  if (typeof window === 'undefined') return 0;
  const slideId = new URLSearchParams(window.location.search).get('slide');
  const index = PUBLISHED_GUIDE_SLIDES.findIndex((slide) => slide.id === slideId);
  return index >= 0 ? index : 0;
}

function getModeFromUrl(): DeckMode {
  if (typeof window === 'undefined') return 'all';
  const params = new URLSearchParams(window.location.search);
  const requestedMode = params.get('mode');
  const requestedSlide = params.get('slide');

  return requestedMode === 'quick' && requestedSlide && QUICK_START_SLIDE_IDS.includes(requestedSlide)
    ? 'quick'
    : 'all';
}

function HotspotLayer({ src }: { src: string }) {
  const hotspots = getGuideScreenshotHotspots(src);
  if (hotspots.length === 0) return null;

  return (
    <span className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
      {hotspots.map((hotspot) => (
        <span
          key={hotspot.id}
          className="absolute rounded-xl border-[3px] border-amber-300 bg-amber-300/10 shadow-[0_0_0_4px_rgba(15,23,42,0.28),0_0_24px_rgba(251,191,36,0.55)]"
          style={{
            left: `${hotspot.x}%`,
            top: `${hotspot.y}%`,
            width: `${hotspot.width}%`,
            height: `${hotspot.height}%`,
          }}
        >
          <span className="absolute -top-8 right-0 max-w-[240px] rounded-lg bg-slate-950/92 px-2 py-1 text-[10px] font-black leading-tight text-white shadow-lg">
            {hotspot.label}
          </span>
        </span>
      ))}
    </span>
  );
}

function ScreenshotCard({
  screenshot,
  slideTitle,
  onOpen,
}: {
  screenshot: GuideScreenshot;
  slideTitle: string;
  onOpen: (state: LightboxState) => void;
}) {
  const reducedMotion = Boolean(useReducedMotion());
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateYRaw = useTransform(pointerX, [-0.5, 0.5], [-7, 7]);
  const rotateXRaw = useTransform(pointerY, [-0.5, 0.5], [6, -6]);
  const rotateY = useSpring(rotateYRaw, { stiffness: 210, damping: 24, mass: 0.55 });
  const rotateX = useSpring(rotateXRaw, { stiffness: 210, damping: 24, mass: 0.55 });
  const [failed, setFailed] = useState(false);

  function resetTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div className="guide-shot-stage relative min-w-0">
      <m.button
        type="button"
        aria-label={`פתיחת הצילום בגודל מלא: ${screenshot.caption}`}
        onClick={() => onOpen({ screenshot, slideTitle })}
        onPointerMove={(event) => {
          if (reducedMotion || event.pointerType === 'touch') return;
          const rect = event.currentTarget.getBoundingClientRect();
          pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
          pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
        }}
        onPointerLeave={resetTilt}
        onPointerCancel={resetTilt}
        whileHover={reducedMotion ? undefined : { y: -8, scale: 1.012 }}
        whileTap={reducedMotion ? undefined : { scale: 0.988 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22, mass: 0.55 }}
        style={
          reducedMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1500,
                transformStyle: 'preserve-3d',
              }
        }
        className="guide-shot-card group relative block w-full rounded-[28px] text-right outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-5 bottom-[-18px] h-16 rounded-[32px] bg-slate-950/35 blur-2xl transition duration-300 group-hover:bg-blue-950/45"
          style={{ transform: 'translateZ(-36px) scale(.93)' }}
        />

        <span
          className="guide-shot-surface relative block overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28),0_10px_24px_rgba(15,23,42,0.18)]"
          style={{ transform: reducedMotion ? undefined : 'translateZ(24px)' }}
        >
          <span className="flex items-center gap-2 border-b border-slate-200/90 bg-gradient-to-b from-white to-slate-100 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-inner" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-inner" />
            <span className="mr-auto inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500">
              <Expand className="h-3.5 w-3.5" />
              לחצו להגדלה
            </span>
          </span>

          {failed ? (
            <span className="flex aspect-video items-center justify-center bg-slate-100 px-6 text-center text-sm font-black text-slate-500">
              הצילום לא נטען. אין מוצג תחליף.
            </span>
          ) : (
            <span className="relative block overflow-hidden bg-white">
              <img
                src={imageUrl(screenshot.src)}
                alt={screenshot.caption}
                loading="eager"
                decoding="async"
                onError={() => setFailed(true)}
                className="block max-h-[53vh] w-full bg-white object-contain"
              />
              <HotspotLayer src={screenshot.src} />
            </span>
          )}

          <span className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm font-black leading-relaxed text-slate-700">
            <span>{screenshot.caption}</span>
            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-800">צילום אמיתי</span>
          </span>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(115deg, transparent 12%, rgba(255,255,255,.26) 35%, transparent 55%)',
            }}
          />
        </span>
      </m.button>
    </div>
  );
}

function SlideContent({
  slide,
  onOpenScreenshot,
}: {
  slide: GuideSlide;
  onOpenScreenshot: (state: LightboxState) => void;
}) {
  const hasScreenshots = Boolean(slide.screenshots?.length);
  const link = slide.link ?? { href: MOODLE_HOME, label: 'פתיחת Moodle' };
  const isFirst = slide.id === FIRST_GUIDE_SLIDE_ID;

  return (
    <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.14),transparent_30%),radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.12),transparent_28%),linear-gradient(180deg,#ffffff,#f8fafc)] p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <div
        className={cn(
          'relative z-10 mx-auto grid min-h-full max-w-[1540px] content-center gap-6 lg:gap-8',
          hasScreenshots ? 'lg:grid-cols-[0.72fr_1.28fr]' : 'max-w-5xl'
        )}
      >
        <div className="flex min-w-0 flex-col justify-center">
          {isFirst && (
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/80 p-3 shadow-sm backdrop-blur">
              <picture className="block shrink-0">
                <source type="image/webp" srcSet="/guide/jerusalem-math-logo.webp" />
                <img
                  src="/guide/jerusalem-math-logo.png"
                  alt="יחידת מתמטיקה — מחוז ירושלים והעיר ירושלים"
                  width={96}
                  height={96}
                  className="h-14 w-14 rounded-full bg-white object-contain p-1 shadow-md ring-2 ring-amber-300"
                />
              </picture>
              <div className="min-w-0">
                <p className="text-xs font-black text-blue-800">מדריך Moodle למורים</p>
                <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-600">
                  הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין
                </p>
                <p className="mt-0.5 text-xs font-bold leading-relaxed text-slate-600">
                  האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים
                </p>
              </div>
            </div>
          )}

          <header>
            <div className="mb-3 inline-flex w-fit items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-800 shadow-sm">
              {slide.eyebrow}
            </div>
            <h1 className="font-display text-[clamp(2rem,4.3vw,4.4rem)] font-black leading-[1.02] tracking-tight text-slate-950">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base font-bold leading-relaxed text-slate-600 sm:text-lg lg:text-xl">
              {slide.summary}
            </p>
          </header>

          <div className="mt-5 grid gap-4">
            {slide.steps && slide.steps.length > 0 && (
              <section aria-label="שלבי הפעולה">
                <ol className="grid gap-2.5">
                  {slide.steps.map((step, index) => (
                    <li
                      key={`${slide.id}-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/88 px-3.5 py-3 shadow-sm backdrop-blur"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 text-sm font-black text-white shadow-md">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm font-black leading-relaxed text-slate-700 sm:text-base">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {slide.points && slide.points.length > 0 && (
              <section aria-label="נקודות חשובות">
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {slide.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white/88 px-3.5 py-3 shadow-sm backdrop-blur"
                    >
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-sm font-black leading-relaxed text-slate-700 sm:text-base">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {slide.tip && (
              <aside className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-black leading-relaxed text-amber-950 sm:text-base">
                <span className="ml-2">טיפ:</span>
                {slide.tip}
              </aside>
            )}

            {slide.warning && (
              <aside className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black leading-relaxed text-rose-950 sm:text-base">
                <span className="ml-2">חשוב:</span>
                {slide.warning}
              </aside>
            )}

            <div className="pt-1">
              <Button
                asChild
                size="lg"
                className="h-12 gap-2 rounded-2xl bg-slate-950 px-6 font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.20)] hover:bg-blue-900"
              >
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {hasScreenshots && (
          <div
            className={cn(
              'grid content-center gap-5 lg:py-2',
              (slide.screenshots?.length ?? 0) > 1 ? 'md:grid-cols-2' : 'grid-cols-1'
            )}
          >
            {slide.screenshots?.map((screenshot) => (
              <ScreenshotCard
                key={screenshot.src}
                screenshot={screenshot}
                slideTitle={slide.title}
                onOpen={onOpenScreenshot}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function Guide() {
  const reducedMotion = Boolean(useReducedMotion());
  const [currentIndex, setCurrentIndex] = useState(getSlideIndexFromUrl);
  const [mode, setMode] = useState<DeckMode>(getModeFromUrl);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [direction, setDirection] = useState(1);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const slideRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  const slide = PUBLISHED_GUIDE_SLIDES[currentIndex] ?? PUBLISHED_GUIDE_SLIDES[0];
  const allSequence = useMemo(() => PUBLISHED_GUIDE_SLIDES.map((item) => item.id), []);
  const activeSequence = mode === 'quick' ? QUICK_START_SLIDE_IDS : allSequence;
  const activePosition = activeSequence.indexOf(slide.id);
  const safeMode: DeckMode = activePosition >= 0 ? mode : 'all';
  const safeSequence = safeMode === 'quick' ? QUICK_START_SLIDE_IDS : allSequence;
  const safePosition = safeSequence.indexOf(slide.id);
  const canGoPrevious = safePosition > 0;
  const canGoNext = safePosition >= 0 && safePosition < safeSequence.length - 1;
  const currentSection = GUIDE_SECTIONS.find((section) => section.id === slide.section);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('he');
    if (!normalized) return PUBLISHED_GUIDE_SLIDES.slice(0, 18);

    return PUBLISHED_GUIDE_SLIDES.filter((item) => {
      const searchable = [
        item.title,
        item.summary,
        item.eyebrow,
        ...(item.steps ?? []),
        ...(item.points ?? []),
        ...(item.keywords ?? []),
      ]
        .join(' ')
        .toLocaleLowerCase('he');
      return searchable.includes(normalized);
    });
  }, [query]);

  function writeUrl(slideId: string, nextMode: DeckMode, replace = false) {
    const url = new URL(window.location.href);
    url.searchParams.set('slide', slideId);
    if (nextMode === 'quick') url.searchParams.set('mode', 'quick');
    else url.searchParams.delete('mode');
    window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  }

  function jumpToSlide(slideId: string, requestedMode: DeckMode = 'all', replace = false) {
    const index = PUBLISHED_GUIDE_SLIDES.findIndex((item) => item.id === slideId);
    if (index < 0) return;

    setDirection(index >= currentIndex ? 1 : -1);
    const nextMode = requestedMode === 'quick' && QUICK_START_SLIDE_IDS.includes(slideId) ? 'quick' : 'all';
    setMode(nextMode);
    setCurrentIndex(index);
    setPanel(null);
    setQuery('');
    writeUrl(slideId, nextMode, replace);
  }

  function goBy(delta: number) {
    if (safePosition < 0) return;
    const nextId = safeSequence[safePosition + delta];
    if (!nextId) return;
    setDirection(delta > 0 ? 1 : -1);
    jumpToSlide(nextId, safeMode);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  useEffect(() => {
    const onPopState = () => {
      const nextIndex = getSlideIndexFromUrl();
      setDirection(nextIndex >= currentIndex ? 1 : -1);
      setCurrentIndex(nextIndex);
      setMode(getModeFromUrl());
      setPanel(null);
      setLightbox(null);
    };
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));

    window.addEventListener('popstate', onPopState);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [currentIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (safeMode !== mode) setMode(safeMode);
    document.title = `${slide.title} | מדריך Moodle למורים`;
    slideRef.current?.scrollTo({ top: 0 });
    slideRef.current?.focus({ preventScroll: true });

    for (const nearbyIndex of [currentIndex - 1, currentIndex + 1]) {
      const nearbySlide = PUBLISHED_GUIDE_SLIDES[nearbyIndex];
      for (const screenshot of nearbySlide?.screenshots ?? []) {
        const image = new Image();
        image.decoding = 'async';
        image.src = imageUrl(screenshot.src);
      }
    }
  }, [currentIndex, mode, safeMode, slide.id, slide.title]);

  useEffect(() => {
    if (panel === 'search') window.setTimeout(() => searchInputRef.current?.focus(), 30);
  }, [panel]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === 'Escape') {
        if (lightbox) setLightbox(null);
        else if (panel) setPanel(null);
        else if (document.fullscreenElement) void document.exitFullscreen();
        return;
      }
      if (isTyping || panel || lightbox) return;

      if (event.key === 'ArrowLeft' || event.key === 'PageDown') {
        event.preventDefault();
        goBy(1);
      }
      if (event.key === 'ArrowRight' || event.key === 'PageUp') {
        event.preventDefault();
        goBy(-1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        jumpToSlide(FIRST_GUIDE_SLIDE_ID, 'all');
      }
      if (event.key === 'End') {
        event.preventDefault();
        jumpToSlide(safeSequence[safeSequence.length - 1], safeMode);
      }
      if (event.key.toLocaleLowerCase() === 'f') {
        event.preventDefault();
        setPanel('search');
      }
      if (event.key.toLocaleLowerCase() === 'm') {
        event.preventDefault();
        setPanel('menu');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, panel, safeMode, safePosition, safeSequence]);

  const progress = safePosition >= 0 ? ((safePosition + 1) / safeSequence.length) * 100 : 0;
  const transition = reducedMotion
    ? { duration: 0.01 }
    : { type: 'spring' as const, stiffness: 170, damping: 24, mass: 0.72 };

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        dir="rtl"
        data-guide-shell="premium-presentation"
        className="fixed inset-0 z-[100] grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_50%_-20%,#1d4ed8_0%,#0f172a_46%,#020617_100%)] text-slate-900"
      >
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/30 px-3 text-white backdrop-blur-xl sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPanel('menu')} className="gap-2 text-white hover:bg-white/10 hover:text-white">
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">תוכן</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPanel('search')} className="gap-2 text-white hover:bg-white/10 hover:text-white">
              <Search className="h-5 w-5" />
              <span className="hidden sm:inline">חיפוש</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => jumpToSlide(FIRST_GUIDE_SLIDE_ID, 'all')}
              className="hidden gap-2 text-white hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <Home className="h-4 w-4" />
              התחלה
            </Button>
          </div>

          <div className="min-w-0 text-center">
            <p className="truncate text-xs font-black text-amber-300 sm:text-sm">
              {safeMode === 'quick' ? 'מסלול מהיר' : currentSection?.title ?? 'Moodle'}
            </p>
            <p className="hidden max-w-[48vw] truncate text-xs font-bold text-white/70 sm:block">{slide.title}</p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {safeMode === 'quick' ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => jumpToSlide(slide.id, 'all', true)}
                className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                כל השקופיות
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => jumpToSlide(QUICK_START_SLIDE_IDS[0], 'quick')}
                className="hidden gap-2 text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
              >
                <PlayCircle className="h-4 w-4" />
                מסלול מהיר
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void toggleFullscreen()}
              disabled={!document.fullscreenEnabled}
              aria-label={isFullscreen ? 'יציאה ממסך מלא' : 'מעבר למסך מלא'}
              className="text-white hover:bg-white/10 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="relative flex min-h-0 items-center justify-center overflow-hidden p-0 sm:p-3 lg:p-4">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <m.article
              key={slide.id}
              ref={slideRef}
              tabIndex={-1}
              aria-live="polite"
              custom={direction}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * 110, rotateY: direction * -5, scale: 0.985, filter: 'blur(8px)' }
              }
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * -90, rotateY: direction * 4, scale: 0.99, filter: 'blur(7px)' }
              }
              transition={transition}
              onTouchStart={(event) => {
                touchStartX.current = event.changedTouches[0]?.clientX ?? null;
              }}
              onTouchEnd={(event) => {
                const start = touchStartX.current;
                const end = event.changedTouches[0]?.clientX;
                touchStartX.current = null;
                if (start == null || end == null) return;
                const distance = end - start;
                if (Math.abs(distance) < 70) return;
                if (distance < 0) goBy(1);
                else goBy(-1);
              }}
              className="h-full w-full overflow-y-auto bg-white shadow-[0_35px_110px_rgba(0,0,0,0.52)] outline-none sm:rounded-[30px] lg:h-auto lg:max-h-full lg:w-[min(96vw,calc((100dvh-148px)*16/9),1660px)] lg:aspect-video"
              style={{ transformPerspective: 1800 }}
            >
              <SlideContent slide={slide} onOpenScreenshot={setLightbox} />
            </m.article>
          </AnimatePresence>
        </main>

        <footer className="grid min-h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/10 bg-slate-950/30 px-3 text-white backdrop-blur-xl sm:px-5 lg:px-8">
          <div className="flex justify-start">
            <Button
              variant="ghost"
              onClick={() => goBy(-1)}
              disabled={!canGoPrevious}
              className="h-11 gap-2 rounded-2xl px-4 font-black text-white hover:bg-white/10 hover:text-white disabled:text-white/25"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="hidden sm:inline">הקודם</span>
            </Button>
          </div>

          <div className="flex min-w-[150px] items-center gap-3 sm:min-w-[320px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanel('menu')}
              className="hidden shrink-0 gap-2 rounded-xl font-black text-white hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <List className="h-4 w-4" />
              תוכן
            </Button>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div className="text-xs font-black text-white/90">{safePosition + 1} מתוך {safeSequence.length}</div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <m.div
                  className="h-full rounded-full bg-amber-400"
                  animate={{ width: `${progress}%` }}
                  transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 24 }}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => goBy(1)}
              disabled={!canGoNext}
              className="h-11 gap-2 rounded-2xl bg-amber-400 px-5 font-black text-slate-950 shadow-lg hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/25"
            >
              <span className="hidden sm:inline">הבא</span>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </footer>

        <AnimatePresence>
          {panel && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/78 p-3 backdrop-blur-xl sm:p-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setPanel(null);
              }}
            >
              <m.section
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }}
                transition={transition}
                className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl"
              >
                <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
                  <h2 className="text-2xl font-black text-slate-950">{panel === 'menu' ? 'תוכן העניינים' : 'חיפוש'}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setPanel(null)} aria-label="סגירה">
                    <X className="h-6 w-6" />
                  </Button>
                </header>

                {panel === 'menu' ? (
                  <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => jumpToSlide(QUICK_START_SLIDE_IDS[0], 'quick')}
                        className="flex items-center gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 text-right transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <PlayCircle className="h-9 w-9 shrink-0 text-amber-600" />
                        <span className="text-lg font-black text-slate-950">מסלול מהיר</span>
                      </button>
                      <button
                        onClick={() => jumpToSlide(FIRST_GUIDE_SLIDE_ID, 'all')}
                        className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-right transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                      >
                        <Home className="h-9 w-9 shrink-0 text-blue-700" />
                        <span className="text-lg font-black text-slate-950">השקף הראשון</span>
                      </button>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      {GUIDE_SECTIONS.map((section) => {
                        const sectionSlides = PUBLISHED_GUIDE_SLIDES.filter((item) => item.section === section.id);
                        if (sectionSlides.length === 0) return null;
                        return (
                          <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                            <h3 className="text-lg font-black text-slate-950">{section.title}</h3>
                            <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{section.description}</p>
                            <div className="mt-4 grid gap-2">
                              {sectionSlides.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => jumpToSlide(item.id, 'all')}
                                  aria-current={item.id === slide.id ? 'page' : undefined}
                                  className={cn(
                                    'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-bold transition',
                                    item.id === slide.id
                                      ? 'bg-blue-800 text-white shadow-md'
                                      : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-900'
                                  )}
                                >
                                  <span>{item.title}</span>
                                  <ArrowLeft className="h-4 w-4 shrink-0" />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div className="border-b border-slate-200 p-5 sm:px-7">
                      <div className="relative">
                        <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={searchInputRef}
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="חיפוש שאלה, פעולה או כפתור"
                          className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pr-12 pl-4 text-base font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                      <div className="grid gap-2">
                        {searchResults.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => jumpToSlide(item.id, 'all')}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-black text-blue-700">{item.eyebrow}</p>
                              <p className="mt-1 text-base font-black text-slate-950">{item.title}</p>
                            </div>
                            <ArrowLeft className="h-5 w-5 shrink-0 text-blue-700" />
                          </button>
                        ))}
                        {searchResults.length === 0 && (
                          <p className="rounded-2xl bg-slate-50 p-6 text-center font-bold text-slate-500">לא נמצאה שאלה מתאימה.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </m.section>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {lightbox && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-950/92 p-3 backdrop-blur-xl sm:p-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setLightbox(null);
              }}
            >
              <m.figure
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 14 }}
                transition={transition}
                className="relative flex max-h-[94dvh] w-full max-w-[1600px] flex-col overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_40px_140px_rgba(0,0,0,0.65)]"
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-blue-700">{lightbox.slideTitle}</p>
                    <figcaption className="mt-1 text-sm font-black text-slate-800 sm:text-base">{lightbox.screenshot.caption}</figcaption>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setLightbox(null)} aria-label="סגירת הצילום">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-2 sm:p-4">
                  <div className="relative inline-block max-w-full">
                    <img
                      src={imageUrl(lightbox.screenshot.src)}
                      alt={lightbox.screenshot.caption}
                      className="block max-h-[80dvh] max-w-full rounded-xl bg-white object-contain shadow-lg"
                    />
                    <HotspotLayer src={lightbox.screenshot.src} />
                  </div>
                </div>
              </m.figure>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}
