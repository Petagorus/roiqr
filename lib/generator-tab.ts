/**
 * Tiny pub/sub so hero CTAs and footer links can pre-select the generator's
 * tab. `requestGeneratorTab` also remembers the request, because from other
 * pages (e.g. /privacy) the home page — and the Generator — is not mounted
 * yet; the Generator consumes the pending request when it mounts.
 */

export type GeneratorTab = "single" | "batch";

const EVENT = "roiqr:generator-tab";

let pendingTab: GeneratorTab | null = null;

/** Request a tab: applies instantly when the Generator is mounted, and is
 *  remembered so it still applies after navigating home from another page. */
export function requestGeneratorTab(tab: GeneratorTab): void {
  pendingTab = tab;
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<GeneratorTab>(EVENT, { detail: tab }));
}

/** Take the remembered request (clearing it) — used on mount. */
export function consumePendingGeneratorTab(): GeneratorTab | null {
  const tab = pendingTab;
  pendingTab = null;
  return tab;
}

/** Subscribe to tab requests; returns an unsubscribe function. */
export function onGeneratorTab(callback: (tab: GeneratorTab) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => callback((event as CustomEvent<GeneratorTab>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
