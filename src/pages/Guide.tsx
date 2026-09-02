import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
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
  GUIDE_SECTIONS,
  PUBLISHED_GUIDE_SLIDES,
  QUICK_START_SLIDE_IDS,
  type GuideSlide,
} from '@/data/guideDeck';

type Panel = 'menu' | 'search' | null;
type DeckMode = 'all' | 'quick';

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

function GuideScreenshot({ src, caption }: { src: string; caption: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = `/guide/screenshots/${src}`;

  return (
    <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.14)]">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="mr-auto text-[11px] font-bold text-slate-500">Moodle משרד החינוך</span>
      </div>

      {failed ? (
        <div className="flex aspect-video items-center justify-center bg-slate-100 px-6 text-center text-sm font-bold text-slate-500">
          צילום המסך לא נטען.
        </div>
      ) : (
        <a href={imageUrl} target="_blank" rel="noopener noreferrer" title="פתיחת הצילום בגודל מלא">
          <img
            src={imageUrl}
            alt={caption}
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            className="block max-h-[54vh] w-full bg-slate-50 object-contain"
          />
        </a>
      )}

      <figcaption className="border-t border-slate-200 px-4 py-3 text-sm font-bold leading-relaxed text-slate-700">
        {caption}
      </figcaption>
    </figure>
  );
}

function SlideContent({
  slide,
  onQuickStart,
  onOpenMenu,
}: {
  slide: GuideSlide;
  onQuickStart: () => void;
  onOpenMenu: () => void;
}) {
  if (slide.cover) {
    return (
      <div className="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-800/25 to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-5 text-center sm:px-10 sm:py-7 lg:px-16">
          <div className="mb-3 flex justify-center sm:mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-2xl" />
              <picture className="relative block">
                <source type="image/webp" srcSet="/guide/jerusalem-math-logo.webp" />
                <img
                  src="/guide/jerusalem-math-logo.png"
                  alt="יחידת מתמטיקה — מחוז ירושלים והעיר ירושלים"
                  width={512}
                  height={512}
                  className="h-24 w-24 animate-[spin_14s_linear_infinite] rounded-full bg-white object-contain p-2 shadow-[0_14px_45px_rgba(0,0,0,0.48)] ring-4 ring-amber-300/80 sm:h-32 sm:w-32 lg:h-36 lg:w-36"
                />
              </picture>
            </div>
          </div>

          <p className="text-sm font-black text-amber-300 sm:text-base">{slide.eyebrow}</p>

          <div className="mt-3 w-full max-w-5xl rounded-[28px] border border-white/20 bg-slate-950/55 px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:px-9 sm:py-6">
            <h1 className="font-display text-4xl font-black leading-tight text-white drop-shadow-[0_3px_14px_rgba(0,0,0,0.72)] sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>
            <p className="mx-auto mt-3 max-w-3xl text-base font-semibold leading-relaxed text-slate-50 sm:text-lg lg:text-xl">
              {slide.summary}
            </p>
          </div>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={onQuickStart}
              className="h-14 gap-2 rounded-2xl bg-amber-400 px-8 text-lg font-black text-slate-950 shadow-lg hover:bg-amber-300"
            >
              <PlayCircle className="h-5 w-5" />
              התחלה מהירה
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenMenu}
              className="h-14 gap-2 rounded-2xl border-white/35 bg-white/10 px-8 text-lg font-black text-white shadow-lg backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <List className="h-5 w-5" />
              תוכן העניינים
            </Button>
          </div>
        </div>

        <div className="relative z-10 border-t border-amber-300/40 bg-slate-950/85 px-4 py-3 text-center shadow-[0_-8px_30px_rgba(0,0,0,0.18)] sm:px-8">
          <p className="text-xs font-black leading-relaxed text-amber-200 sm:text-sm">
            הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין
          </p>
          <p className="mt-1 text-xs font-bold leading-relaxed text-white sm:text-sm">
            האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים
          </p>
        </div>
      </div>
    );
  }

  const hasScreenshots = Boolean(slide.screenshots?.length);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.10),transparent_28%),linear-gradient(180deg,#ffffff,#f8fafc)] p-4 sm:p-7 lg:p-8">
      <div
        className={cn(
          'mx-auto grid min-h-full max-w-[1500px] gap-6',
          hasScreenshots ? 'lg:grid-cols-[0.76fr_1.24fr]' : 'max-w-5xl'
        )}
      >
        <div className="flex min-w-0 flex-col">
          <header className="border-b border-slate-200 pb-4">
            <p className="text-sm font-black text-blue-700">{slide.eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]">
              {slide.title}
            </h1>
            <p className="mt-3 max-w-4xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
              {slide.summary}
            </p>
          </header>

          <div className="mt-5 grid gap-4">
            {slide.steps && slide.steps.length > 0 && (
              <section aria-labelledby={`${slide.id}-steps`}>
                <h2 id={`${slide.id}-steps`} className="mb-2 text-sm font-black text-slate-500">
                  כפתור אחרי כפתור
                </h2>
                <ol className="grid gap-2">
                  {slide.steps.map((step, index) => (
                    <li key={`${slide.id}-${index}`} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-800 text-sm font-black text-white">
                        {index + 1}
                      </span>
                      <span className="pt-0.5 text-sm font-bold leading-relaxed text-slate-700 sm:text-base">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {slide.points && slide.points.length > 0 && (
              <section aria-labelledby={`${slide.id}-points`}>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {slide.points.map((point) => (
                    <li key={point} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-sm font-bold leading-relaxed text-slate-700 sm:text-base">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {slide.tip && (
              <aside className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold leading-relaxed text-amber-950 sm:text-base">
                <span className="ml-2 font-black">טיפ:</span>{slide.tip}
              </aside>
            )}

            {slide.warning && (
              <aside className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold leading-relaxed text-rose-950 sm:text-base">
                <span className="ml-2 font-black">חשוב:</span>{slide.warning}
              </aside>
            )}

            {slide.link && (
              <div>
                <Button asChild size="lg" className="h-12 gap-2 rounded-xl px-6 font-black shadow-sm">
                  <a href={slide.link.href} target="_blank" rel="noopener noreferrer">
                    {slide.link.label}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>

        {hasScreenshots && (
          <div className="grid content-start gap-4 lg:pt-1">
            {slide.screenshots?.map((screenshot) => <GuideScreenshot key={screenshot.src} {...screenshot} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Guide() {
  const [currentIndex, setCurrentIndex] = useState(getSlideIndexFromUrl);
  const [mode, setMode] = useState<DeckMode>(getModeFromUrl);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    if (!normalized) return PUBLISHED_GUIDE_SLIDES.filter((item) => !item.cover).slice(0, 14);

    return PUBLISHED_GUIDE_SLIDES.filter((item) => {
      const searchable = [item.title, item.summary, item.eyebrow, ...(item.steps ?? []), ...(item.points ?? []), ...(item.keywords ?? [])]
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
    if (nextId) jumpToSlide(nextId, safeMode);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  }

  useEffect(() => {
    const onPopState = () => {
      setCurrentIndex(getSlideIndexFromUrl());
      setMode(getModeFromUrl());
      setPanel(null);
    };
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));

    window.addEventListener('popstate', onPopState);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

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
    slideRef.current?.focus({ preventScroll: true });
  }, [mode, safeMode, slide.id, slide.title]);

  useEffect(() => {
    if (panel === 'search') window.setTimeout(() => searchInputRef.current?.focus(), 30);
  }, [panel]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (event.key === 'Escape') {
        if (panel) setPanel(null);
        else if (document.fullscreenElement) void document.exitFullscreen();
        return;
      }
      if (isTyping || panel) return;

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
        jumpToSlide('cover', 'all');
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
  }, [panel, safeMode, safePosition, safeSequence]);

  const progress = safePosition >= 0 ? ((safePosition + 1) / safeSequence.length) * 100 : 0;

  return (
    <div dir="rtl" className="fixed inset-0 z-[100] grid h-dvh grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#1e3a8a_0%,#0f172a_48%,#020617_100%)] text-slate-900">
      <header className="flex min-h-16 items-center justify-between gap-3 border-b border-white/10 px-3 text-white sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPanel('menu')} className="gap-2 text-white hover:bg-white/10 hover:text-white">
            <Menu className="h-5 w-5" />
            <span className="hidden sm:inline">תוכן</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPanel('search')} className="gap-2 text-white hover:bg-white/10 hover:text-white">
            <Search className="h-5 w-5" />
            <span className="hidden sm:inline">חיפוש</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => jumpToSlide('cover', 'all')} className="hidden gap-2 text-white hover:bg-white/10 hover:text-white md:inline-flex">
            <Home className="h-4 w-4" />
            פתיחה
          </Button>
        </div>

        <div className="min-w-0 text-center">
          <p className="truncate text-xs font-black text-amber-300 sm:text-sm">{safeMode === 'quick' ? 'התחלה מהירה' : currentSection?.title ?? 'Moodle'}</p>
          <p className="hidden max-w-[48vw] truncate text-xs font-bold text-white/70 sm:block">{slide.title}</p>
        </div>

        <div className="flex items-center gap-2">
          {safeMode === 'quick' && (
            <Button variant="ghost" size="sm" onClick={() => jumpToSlide(slide.id, 'all', true)} className="hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex">
              כל השקופיות
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

      <main className="flex min-h-0 items-center justify-center overflow-hidden p-0 sm:p-3 lg:p-4">
        <article
          ref={slideRef}
          tabIndex={-1}
          aria-live="polite"
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
          className="h-full w-full overflow-y-auto bg-white shadow-[0_35px_100px_rgba(0,0,0,0.48)] outline-none sm:rounded-[26px] lg:h-auto lg:max-h-full lg:w-[min(96vw,calc((100dvh-148px)*16/9),1600px)] lg:aspect-video"
        >
          <SlideContent
            key={slide.id}
            slide={slide}
            onQuickStart={() => jumpToSlide(QUICK_START_SLIDE_IDS[0], 'quick')}
            onOpenMenu={() => setPanel('menu')}
          />
        </article>
      </main>

      <footer className="grid min-h-[72px] grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/10 px-3 text-white sm:px-5 lg:px-8">
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => goBy(-1)}
            disabled={!canGoPrevious}
            className="h-11 gap-2 px-4 font-black text-white hover:bg-white/10 hover:text-white disabled:text-white/25"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="hidden sm:inline">הקודם</span>
          </Button>
        </div>

        <div className="flex min-w-[150px] items-center gap-3 sm:min-w-[300px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanel('menu')}
            className="hidden shrink-0 gap-2 font-black text-white hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            <List className="h-4 w-4" />
            תוכן
          </Button>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div className="text-xs font-black text-white/90">{safePosition + 1} מתוך {safeSequence.length}</div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-amber-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => goBy(1)}
            disabled={!canGoNext}
            className="h-11 gap-2 bg-amber-400 px-5 font-black text-slate-950 hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/25"
          >
            <span className="hidden sm:inline">הבא</span>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      {panel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 backdrop-blur-md sm:p-6">
          <section className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl">
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
                    <span className="text-lg font-black text-slate-950">התחלה מהירה</span>
                  </button>
                  <button
                    onClick={() => jumpToSlide('cover', 'all')}
                    className="flex items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-5 text-right transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                  >
                    <Home className="h-9 w-9 shrink-0 text-blue-700" />
                    <span className="text-lg font-black text-slate-950">עמוד הפתיחה</span>
                  </button>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {GUIDE_SECTIONS.map((section) => {
                    const sectionSlides = PUBLISHED_GUIDE_SLIDES.filter((item) => item.section === section.id && !item.cover);
                    if (sectionSlides.length === 0) return null;
                    return (
                      <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                        <h3 className="text-lg font-black text-slate-950">{section.title}</h3>
                        <div className="mt-4 grid gap-2">
                          {sectionSlides.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => jumpToSlide(item.id, 'all')}
                              aria-current={item.id === slide.id ? 'page' : undefined}
                              className={cn(
                                'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-right text-sm font-bold transition',
                                item.id === slide.id ? 'bg-blue-800 text-white' : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-900'
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
                  {searchResults.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => jumpToSlide(item.id, 'all')}
                          className="rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
                        >
                          <span className="text-xs font-black text-blue-700">{item.eyebrow}</span>
                          <span className="mt-1 block text-lg font-black text-slate-950">{item.title}</span>
                          <span className="mt-2 block text-sm font-medium leading-relaxed text-slate-500">{item.summary}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-16 text-center">
                      <Search className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-4 text-lg font-black text-slate-700">לא נמצאו תוצאות</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}