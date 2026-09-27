/**
 * Runs in <head> before React hydrates, so the first paint already uses the
 * right palette (no dark-to-light flash). Keep it dependency-free and tiny:
 * it is inlined as a string. Storage key shared with ThemeContext.tsx.
 * localStorage can throw (private mode, blocked storage): the catch falls
 * back to the system preference, which is the documented default anyway.
 */
export const THEME_STORAGE_KEY = "corentinbunaux.theme";

export const THEME_INIT_SCRIPT = `(function () {
  var theme;
  try {
    var stored = window.localStorage.getItem("${THEME_STORAGE_KEY}");
    if (stored === "light" || stored === "dark") theme = stored;
  } catch (e) {}
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.dataset.theme = theme;
})();`;
