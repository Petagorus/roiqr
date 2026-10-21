import "@testing-library/jest-dom/vitest";

// jsdom does not implement localStorage, but the i18n provider reads it.
class LocalStorageMock {
  private store: Record<string, string>;

  constructor() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? (this.store[key] as string)
      : null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

if (typeof window !== "undefined" && !window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    value: new LocalStorageMock(),
  });
}

// jsdom does not implement matchMedia, which the i18n provider uses to
// resolve the "system" theme.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement canvas 2D context. Our custom QR renderer calls
// fillRect, arc, arcTo, moveTo, lineTo, closePath, drawImage, etc., so we
// install a lightweight stub that records calls and returns a context-like
// object. This lets renderQr produce a data URL in tests.
if (typeof window !== "undefined") {
  const noop = () => {};
  const canvasProto = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    fillRect: noop,
    clearRect: noop,
    getImageData: () => ({ data: [] }),
    putImageData: noop,
    createImageData: () => [],
    setLineDash: noop,
    getLineDash: () => [],
    save: noop,
    restore: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    bezierCurveTo: noop,
    closePath: noop,
    arc: noop,
    arcTo: noop,
    ellipse: noop,
    rect: noop,
    fill: noop,
    stroke: noop,
    clip: noop,
    translate: noop,
    scale: noop,
    rotate: noop,
    transform: noop,
    resetTransform: noop,
    drawImage: noop,
    measureText: () => ({ width: 0 }),
    textBaseline: "top",
    textAlign: "left",
  };
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    writable: true,
    value: function getContext(this: HTMLCanvasElement) {
      return canvasProto;
    },
  });
  Object.defineProperty(HTMLCanvasElement.prototype, "toDataURL", {
    configurable: true,
    writable: true,
    value: function toDataURL(this: HTMLCanvasElement) {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    },
  });
}
