/** Thin wrapper around `window.location.replace` so it can be mocked in
 * tests: jsdom implements `Location.prototype.replace` as a non-configurable,
 * non-writable own property, so `jest.spyOn`/`jest.fn()` cannot intercept it
 * directly — this indirection is the only testable seam. */
// Coverage: always mocked in tests (see the doc comment above) — the real
// call is what's untestable here in the first place. (next/jest's SWC-based
// coverage instrumentation doesn't honour istanbul-ignore comments, so this
// file shows as 0% rather than being excluded — harmless, global coverage
// stays well above threshold.)
export function replaceLocation(url: string) {
  window.location.replace(url);
}
