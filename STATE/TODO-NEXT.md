# HISTORICAL SNAPSHOT — TODO NEXT

> הרשימה המקורית למטה מתארת שלב מוקדם לפני שה־runtime הקנוני עבר ל-Render ולפני שהריפו צבר ראיות ויכולות נוספות. היא אינה backlog נוכחי ואין לבצע אותה אוטומטית.  
> למצב נוכחי: `PROJECT_MEMORY.md` → `PROJECT_RULES.md` → `STATE/CURRENT.md`. לחוסרי Guide: `docs/GUIDE_MISSING_CAPTURES.md`.

## Original historical checklist

1. Run `scripts/status-all.ps1`
2. Run `scripts/run-all.ps1`
3. Open `/lti11/config`
4. Configure Moodle External Tool manually
5. Execute one real LTI 1.1 launch
6. Verify `moodleCaptures > 0`
7. Add Moodle Web Services integration
8. Populate students/tasks/grades/activity from real data
9. Move to stable HTTPS deployment

## Current interpretation

- Stable HTTPS deployment is no longer a future step: Teacher Hub runtime is `https://www-tijc.onrender.com`.
- Guide runtime is separately `https://yanivmizrachiy.github.io/www/guide/`.
- Historical setup/checklist items must not be repeated unless current truth/evidence identifies them as an actual blocker.
- Teacher Release remains **NO** until its current gates pass.
