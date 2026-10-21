/**
 * Remembers the user's style choices (shape, colors, logo, caption) in
 * localStorage so returning visitors don't reconfigure everything. Logo data
 * URLs can be large, so they are only persisted when they fit comfortably in
 * the storage quota — every failure is swallowed, style memory is a nicety.
 */

export interface RememberedStyle {
  shape?: string;
  palette?: string;
  customColor?: { moduleColor: string; bgColor: string } | null;
  logo?: string | null;
  logoSize?: number;
  caption?: string;
}

const KEY = "roiqr-style-v1";
/** Logos above this size are skipped to stay well inside the 5MB quota. */
const MAX_LOGO_CHARS = 300_000;

export function saveStyle(style: RememberedStyle): void {
  try {
    const payload: RememberedStyle = {
      ...style,
      logo: style.logo && style.logo.length <= MAX_LOGO_CHARS ? style.logo : null,
    };
    window.localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded or storage disabled — style memory is optional */
  }
}

export function loadStyle(): RememberedStyle {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as RememberedStyle;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

export function clearStyle(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
