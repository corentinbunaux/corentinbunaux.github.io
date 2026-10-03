/**
 * Controllable stand-ins for browser APIs jsdom does not implement (or
 * implements on real timers): matchMedia, ResizeObserver, IntersectionObserver,
 * requestAnimationFrame, pointer capture. Installed before every test by
 * jest.setup.ts; tests drive them explicitly so nothing depends on wall time.
 * Excluded from coverage (jest.config.mjs).
 */

type MediaListener = (event: { matches: boolean }) => void;

const mediaState = new Map<string, boolean>();
const mediaListeners = new Map<string, Set<MediaListener>>();

function mediaQueryList(query: string) {
  if (!mediaListeners.has(query)) mediaListeners.set(query, new Set());
  const set = mediaListeners.get(query)!;
  return {
    get matches() {
      return mediaState.get(query) ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, cb: MediaListener) => set.add(cb),
    removeEventListener: (_type: string, cb: MediaListener) => set.delete(cb),
    addListener: (cb: MediaListener) => set.add(cb),
    removeListener: (cb: MediaListener) => set.delete(cb),
    dispatchEvent: () => true,
  };
}

export const media = {
  /** Sets a query's result and notifies its "change" listeners. */
  set(query: string, matches: boolean) {
    mediaState.set(query, matches);
    mediaListeners.get(query)?.forEach((cb) => cb({ matches }));
  },
  listenerCount(query: string) {
    return mediaListeners.get(query)?.size ?? 0;
  },
  reset() {
    mediaState.clear();
    mediaListeners.clear();
  },
};

let navTimingType: string = "navigate";
let navTimingPathname = "/";

/** Controls what `performance.getEntriesByType("navigation")` reports —
 * HomeShell's reload detection (PORT-069) reads this instead of the
 * deprecated `performance.navigation.type`, which jsdom doesn't implement
 * either. */
export const navTiming = {
  set(type: "navigate" | "reload" | "back_forward" | "prerender", pathname = "/") {
    navTimingType = type;
    navTimingPathname = pathname;
  },
};

export const DESKTOP_QUERY = "(min-width: 1024px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
export const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** Puts the page in the state where the 3D motion gate opens. */
export function setDesktop(desktop = true, reducedMotion = false) {
  media.set(DESKTOP_QUERY, desktop);
  media.set(REDUCED_MOTION_QUERY, reducedMotion);
}

export class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(public callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

export class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(public callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {
    this.disconnected = true;
  }
  takeRecords() {
    return [];
  }
  /** Reports every observed element as (not) intersecting. */
  trigger(isIntersecting: boolean) {
    const entries = this.observed.map((target) => ({ isIntersecting, target }) as IntersectionObserverEntry);
    this.callback(entries, this as unknown as IntersectionObserver);
  }
  /** Reports explicit entries, e.g. one section entering and another leaving. */
  report(entries: { target: Element; isIntersecting: boolean }[]) {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}

/** Manual requestAnimationFrame: callbacks queue up until `frames.step()`. */
let rafQueue = new Map<number, FrameRequestCallback>();
let rafId = 0;
let rafNow = 0;

export const frames = {
  /** Advances the clock by `ms` and runs every callback queued before the call. */
  step(ms = 16) {
    rafNow += ms;
    const queued = rafQueue;
    rafQueue = new Map();
    queued.forEach((cb) => cb(rafNow));
  },
  /** Runs `count` frames of `ms` each. */
  run(count: number, ms = 16) {
    for (let i = 0; i < count; i++) this.step(ms);
  },
  pending() {
    return rafQueue.size;
  },
  now() {
    return rafNow;
  },
};

export function installBrowserFakes() {
  media.reset();

  navTimingType = "navigate";
  navTimingPathname = "/";
  performance.getEntriesByType = ((type: string) => {
    if (type !== "navigation") return [];
    return [{ type: navTimingType, name: `http://localhost${navTimingPathname}` }];
  }) as unknown as typeof performance.getEntriesByType;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => mediaQueryList(query),
  });

  FakeResizeObserver.instances = [];
  FakeIntersectionObserver.instances = [];
  Object.defineProperty(window, "ResizeObserver", { configurable: true, writable: true, value: FakeResizeObserver });
  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: FakeIntersectionObserver,
  });

  rafQueue = new Map();
  rafId = 0;
  rafNow = 0;
  window.requestAnimationFrame = (cb: FrameRequestCallback) => {
    rafId += 1;
    rafQueue.set(rafId, cb);
    return rafId;
  };
  window.cancelAnimationFrame = (id: number) => {
    rafQueue.delete(id);
  };
  jest.spyOn(performance, "now").mockImplementation(() => rafNow);

  const captured = new WeakMap<Element, Set<number>>();
  Element.prototype.setPointerCapture = function (id: number) {
    if (!captured.has(this)) captured.set(this, new Set());
    captured.get(this)!.add(id);
  };
  Element.prototype.releasePointerCapture = function (id: number) {
    captured.get(this)?.delete(id);
  };
  Element.prototype.hasPointerCapture = function (id: number) {
    return captured.get(this)?.has(id) ?? false;
  };
}
