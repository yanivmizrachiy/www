from pathlib import Path
import re

root = Path(__file__).resolve().parents[2]

# 1) Author the cover correctly in React instead of hiding/relabeling buttons with CSS.
guide_path = root / 'src/pages/Guide.tsx'
guide = guide_path.read_text(encoding='utf-8')
start = guide.index('function SlideContent({')
end_marker = '\n  const hasScreenshots = Boolean(slide.screenshots?.length);'
end = guide.index(end_marker, start)
new_prefix = '''function SlideContent({
  slide,
  onOpenScreenshot,
  onQuickStart,
}: {
  slide: GuideSlide;
  onOpenScreenshot: (state: LightboxState) => void;
  onQuickStart: () => void;
}) {
  if (slide.cover) {
    return (
      <div className="relative flex min-h-full flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-36 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-800/25 to-transparent" />

        <div className="relative z-10 w-full border-b border-amber-300/50 bg-slate-950/88 px-4 py-4 text-center shadow-[0_12px_36px_rgba(0,0,0,0.24)] sm:px-8 sm:py-5">
          <p className="text-[clamp(1.05rem,2vw,1.65rem)] font-black leading-tight text-amber-200">
            הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין
          </p>
          <p className="mt-1.5 text-[clamp(.95rem,1.5vw,1.25rem)] font-bold leading-relaxed text-white">
            האתר מנוהל ע״י יניב רז · מדריך מחוזי חט״ב בעיר ירושלים
          </p>
        </div>

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

          <div className="mt-5 flex justify-center">
            <Button
              size="lg"
              onClick={onQuickStart}
              className="h-16 min-w-44 rounded-2xl bg-amber-400 px-10 text-xl font-black text-slate-950 shadow-[0_16px_38px_rgba(251,191,36,0.22),0_8px_22px_rgba(0,0,0,0.28)] hover:bg-amber-300"
            >
              התחל
            </Button>
          </div>
        </div>
      </div>
    );
  }
'''
guide = guide[:start] + new_prefix + guide[end:]
guide = guide.replace("                onOpenMenu={() => setPanel('menu')}\n", '')
guide_path.write_text(guide, encoding='utf-8')

# 2) Remove brittle cover DOM-position CSS overrides. Cover layout now lives in JSX.
css_path = root / 'public/guide-visual-isolation.css'
css = css_path.read_text(encoding='utf-8')
css = re.sub(
    r'\n/\* Cover slide hierarchy: branding belongs at the top and is intentionally\n \* prominent\. The cover exposes one single primary action: התחל\. \*/\n',
    '\n',
    css,
)
cover_selector_rule = re.compile(
    r'\n\s*\[data-guide-shell="premium-presentation"\] \.from-slate-950\.via-blue-950\.to-slate-900\.text-white[^\{]*\{[^\{\}]*\}\n',
    re.MULTILINE,
)
css = cover_selector_rule.sub('\n', css)
css_path.write_text(css, encoding='utf-8')

# 3) Align canonical memory and public mirror with the final cover contract.
old_a = '- השער נושא את הלוגו, את המיתוג הקבוע ואת כניסות הניווט (התחלה מהירה ותוכן העניינים). הוא אינו מחליף את שקף ההדרכה הראשון ואינו נספר כשלב ברצף פתיחת המרחב.'
new_a = '- השער נושא את הלוגו, את המיתוג הקבוע וכפתור פעולה יחיד `התחל`. אין בשער כפתורי `התחלה מהירה` או `תוכן העניינים`. השער אינו מחליף את שקף ההדרכה הראשון ואינו נספר כשלב ברצף פתיחת המרחב.'
old_b = '- „התחלה מהירה” מתחילה תמיד בשקף ההדרכה `איך פותחים מרחב למידה במודל?` ולא בשער.'
new_b = '- כפתור `התחל` בשער פותח תמיד את שקף ההדרכה `איך פותחים מרחב למידה במודל?`; ניווט נוסף נשאר בכרום הקבוע של המצגת ולא על גבי השער.'
for rel in ['PROJECT_MEMORY.md', 'public/PROJECT_MEMORY.md']:
    path = root / rel
    text = path.read_text(encoding='utf-8')
    if old_a not in text or old_b not in text:
        raise SystemExit(f'Canonical cover contract not found in {rel}; refusing unsafe rewrite')
    path.write_text(text.replace(old_a, new_a).replace(old_b, new_b), encoding='utf-8')

# 4) Keep CURRENT.md explicit so future agents do not reintroduce the old cover buttons.
current_path = root / 'STATE/CURRENT.md'
current = current_path.read_text(encoding='utf-8')
anchor = '- Current missing-capture queue is documented in `docs/GUIDE_MISSING_CAPTURES.md`.\n'
addition = '- Cover contract: branding is at the top and the cover has exactly one CTA, `התחל`; contents/search navigation remains in the persistent presentation chrome.\n'
if addition not in current:
    if anchor not in current:
        raise SystemExit('STATE/CURRENT.md Guide anchor missing')
    current_path.write_text(current.replace(anchor, anchor + addition), encoding='utf-8')

# 5) Strengthen the Guide audit against regression to CSS-hidden duplicate buttons.
audit_path = root / 'scripts/checks/guide-presentation-quality-audit.cjs'
audit = audit_path.read_text(encoding='utf-8')
marker = "if (errors.length) {\n"
contract = '''// 7) Cover CTA contract: the cover is source-authored, has one visible action only,
// and must never rely on DOM-position CSS to hide or relabel duplicate buttons.
const coverStart = guide.indexOf('if (slide.cover) {');
const coverEnd = guide.indexOf('const hasScreenshots = Boolean(slide.screenshots?.length);', coverStart);
const coverSource = coverStart >= 0 && coverEnd > coverStart ? guide.slice(coverStart, coverEnd) : '';
const coverButtonCount = (coverSource.match(/<Button\\b/g) ?? []).length;
if (!coverSource) fail('Guide cover source block could not be located.');
if (coverButtonCount !== 1) fail(`Guide cover must contain exactly one Button; found ${coverButtonCount}.`);
if (!coverSource.includes('              התחל\\n')) fail('Guide cover CTA must be labeled exactly התחל.');
for (const forbidden of ['התחלה מהירה', 'תוכן העניינים']) {
  if (coverSource.includes(forbidden)) fail(`Guide cover contains forbidden legacy action: ${forbidden}`);
}
if (css.includes('.from-slate-950.via-blue-950.to-slate-900.text-white')) {
  fail('Guide cover must not rely on brittle DOM-position CSS overrides.');
}
const coverBrandingIndex = coverSource.indexOf('הדרכה במחוז ירושלים והעיר ירושלים - מנח״י, בהובלת איילת קריספין');
const coverEyebrowIndex = coverSource.indexOf('{slide.eyebrow}');
if (coverBrandingIndex < 0 || coverEyebrowIndex < 0 || coverBrandingIndex > coverEyebrowIndex) {
  fail('Guide cover branding must be source-authored above the main cover content.');
}

'''
if contract not in audit:
    if marker not in audit:
        raise SystemExit('Guide audit insertion marker missing')
    audit_path.write_text(audit.replace(marker, contract + marker), encoding='utf-8')

print('GUIDE_SOURCE_CLOSEOUT_PATCHED')
