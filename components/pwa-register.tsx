"use client";

import * as React from "react";

/**
 * Registers the offline service worker in production builds. The generator is
 * fully client-side, so a cached shell keeps the page usable without network.
 */
export function PwaRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is best-effort */
    });
  }, []);
  return null;
}
