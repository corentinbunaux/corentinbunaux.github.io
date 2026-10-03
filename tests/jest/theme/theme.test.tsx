import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "../../../src/theme/ThemeContext";
import { THEME_INIT_SCRIPT, THEME_STORAGE_KEY } from "../../../src/theme/themeScript";
import { readThemeColors, useThemeColors } from "../../../src/theme/useThemeColors";
import { LIGHT_QUERY, media } from "../test-utils/browser";
import { DARK_TOKENS, LIGHT_TOKENS, installThemeTokens } from "../test-utils/render";

const html = document.documentElement;
const wrapper = ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider>;

function runInitScript() {
  // The script is inlined in <head> as a string; run it the same way.
  new Function(THEME_INIT_SCRIPT)();
}

describe("THEME_INIT_SCRIPT", () => {
  it("applies a stored explicit choice", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");
    runInitScript();
    expect(html.dataset.theme).toBe("light");
  });

  it("falls back to the system preference when nothing valid is stored", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    media.set(LIGHT_QUERY, true);
    runInitScript();
    expect(html.dataset.theme).toBe("light");

    media.set(LIGHT_QUERY, false);
    window.localStorage.clear();
    runInitScript();
    expect(html.dataset.theme).toBe("dark");
  });

  it("survives a localStorage that throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    runInitScript();
    expect(html.dataset.theme).toBe("dark");
  });
});

describe("ThemeProvider / useTheme", () => {
  it("mirrors <html data-theme> after mount", () => {
    html.dataset.theme = "light";
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");
  });

  it("defaults to dark when <html> carries no theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("dark");
  });

  it("toggles, applies and persists an explicit choice", () => {
    html.dataset.theme = "dark";
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
    expect(html.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    act(() => result.current.toggleTheme());
    expect(html.dataset.theme).toBe("dark");
  });

  it("still toggles when the choice cannot be persisted", () => {
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
  });

  it("follows live system changes until the visitor chooses explicitly", () => {
    const { result, unmount } = renderHook(() => useTheme(), { wrapper });
    act(() => media.set(LIGHT_QUERY, true));
    expect(result.current.theme).toBe("light");
    expect(html.dataset.theme).toBe("light");
    act(() => media.set(LIGHT_QUERY, false));
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggleTheme()); // explicit: light
    act(() => media.set(LIGHT_QUERY, false));
    expect(result.current.theme).toBe("light");

    expect(media.listenerCount(LIGHT_QUERY)).toBe(1);
    unmount();
    expect(media.listenerCount(LIGHT_QUERY)).toBe(0);
  });

  it("treats unreadable storage as no explicit choice", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    act(() => media.set(LIGHT_QUERY, true));
    expect(result.current.theme).toBe("light");
  });

  it("throws outside a provider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow("useTheme() must be used inside <ThemeProvider>.");
  });
});

describe("readThemeColors / useThemeColors", () => {
  it("reads every token from <html>", () => {
    installThemeTokens(LIGHT_TOKENS);
    expect(readThemeColors()).toEqual({
      main: "#f7f7f5",
      surface: "#ffffff",
      surfaceRaised: "#eef2f4",
      border: "#d6d6d0",
      mainText: "#1a1a1a",
      secondText: "#5c5c5c",
      green: "#4a6f74",
      blue: "#3f5f70",
    });
  });

  it("throws when a token is missing rather than returning a silent default", () => {
    installThemeTokens(DARK_TOKENS);
    html.style.removeProperty("--border");
    expect(() => readThemeColors()).toThrow("Design token --border is not defined.");
  });

  it("re-reads the tokens whenever the theme changes", () => {
    installThemeTokens(DARK_TOKENS);
    html.dataset.theme = "dark";
    const { result } = renderHook(() => ({ colors: useThemeColors(), theme: useTheme() }), { wrapper });
    expect(result.current.colors?.mainText).toBe("#f5f5f5");

    installThemeTokens(LIGHT_TOKENS); // what the [data-theme="light"] CSS does in a browser
    act(() => result.current.theme.toggleTheme());
    expect(result.current.colors?.mainText).toBe("#1a1a1a");
  });
});
