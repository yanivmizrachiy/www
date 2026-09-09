export type GuideHotspot = {
  /** Stable id for audits and future editing. */
  id: string;
  /** Short Hebrew description of the real Moodle control. */
  label: string;
  /** Percentage coordinates relative to the original screenshot. */
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Verified screenshot hotspots only.
 *
 * IMPORTANT:
 * - Keep this map empty for a screenshot until the control location has been
 *   checked against the real source image.
 * - Coordinates are percentages (0..100), never pixels, so overlays remain
 *   aligned on desktop, mobile and in the lightbox.
 * - Never infer or invent a hotspot from a caption alone.
 */
export const GUIDE_SCREENSHOT_HOTSPOTS: Readonly<Record<string, readonly GuideHotspot[]>> = Object.freeze({});

export function getGuideScreenshotHotspots(src: string): readonly GuideHotspot[] {
  return GUIDE_SCREENSHOT_HOTSPOTS[src.replace(/\.[^.]+$/, '')] ?? [];
}
