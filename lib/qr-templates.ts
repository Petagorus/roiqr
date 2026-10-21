import type { ModuleShape } from "./qr-render";

/**
 * One-click style templates: a curated palette + module shape combo. Selecting
 * one sets both and clears any custom colors, so the result is always exactly
 * what the thumbnail shows.
 */

export interface QrTemplate {
  id: string;
  /** One of COLOR_PALETTES.name */
  palette: string;
  shape: ModuleShape;
}

export const QR_TEMPLATES: QrTemplate[] = [
  { id: "classic", palette: "Mono", shape: "square" },
  { id: "minimal", palette: "Charcoal", shape: "rounded" },
  { id: "ocean", palette: "Ocean", shape: "dots" },
  { id: "forest", palette: "Forest", shape: "rounded" },
  { id: "wine", palette: "Wine", shape: "diamond" },
  { id: "slate", palette: "Slate", shape: "dots" },
];
