import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { LanguageProvider, useLanguage } from "../../../src/i18n/LanguageContext";
import { dictionary, useTranslation } from "../../../src/i18n/dictionary";

const STORAGE_KEY = "corentinbunaux.language";

/** Every leaf path of a nested object, e.g. "common.months.0". */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    leafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): unknown[] {
  if (value === null || typeof value !== "object") return [value];
  return Object.values(value as Record<string, unknown>).flatMap(leafValues);
}

describe("dictionary", () => {
  it("has exactly the same keys in French and English", () => {
    expect(leafPaths(dictionary.en).sort()).toEqual(leafPaths(dictionary.fr).sort());
  });

  it("has no empty string in either language", () => {
    for (const language of ["fr", "en"] as const) {
      for (const leaf of leafValues(dictionary[language])) {
        expect(typeof leaf).toBe("string");
        expect((leaf as string).trim()).not.toBe("");
      }
    }
  });

  it("lists twelve months per language", () => {
    expect(dictionary.fr.common.months).toHaveLength(12);
    expect(dictionary.en.common.months[0]).toBe("January");
  });

  it("uses the same {placeholders} in both languages", () => {
    const fr = leafPaths(dictionary.fr);
    const get = (obj: unknown, path: string) =>
      path.split(".").reduce<unknown>((acc, key) => (acc as Record<string, unknown>)[key], obj);
    for (const path of fr) {
      const placeholders = (s: unknown) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect([path, placeholders(get(dictionary.en, path))]).toEqual([path, placeholders(get(dictionary.fr, path))]);
    }
  });
});

const wrapper = ({ children }: { children: ReactNode }) => <LanguageProvider>{children}</LanguageProvider>;

describe("LanguageProvider / useLanguage / useTranslation", () => {
  it("defaults to French", () => {
    const { result } = renderHook(() => ({ ...useLanguage(), t: useTranslation() }), { wrapper });
    expect(result.current.language).toBe("fr");
    expect(result.current.t).toBe(dictionary.fr);
  });

  it("restores a persisted language after mount and ignores an invalid one", () => {
    window.localStorage.setItem(STORAGE_KEY, "en");
    const { result, unmount } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current).toBe(dictionary.en);
    unmount();

    window.localStorage.setItem(STORAGE_KEY, "de");
    const { result: second } = renderHook(() => useLanguage(), { wrapper });
    expect(second.current.language).toBe("fr");
  });

  it("switches language and persists the choice", async () => {
    function Toggle() {
      const { language, setLanguage } = useLanguage();
      const t = useTranslation();
      return (
        <button onClick={() => setLanguage(language === "fr" ? "en" : "fr")}>{t.common.about}</button>
      );
    }
    render(<Toggle />, { wrapper });
    await userEvent.click(screen.getByRole("button", { name: "À propos" }));
    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("en");
  });

  it("keeps working when localStorage throws (private browsing)", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe("fr");
    act(() => result.current.setLanguage("en"));
    expect(result.current.language).toBe("en");
  });

  it("throws outside a provider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow("useLanguage must be used within a LanguageProvider");
  });
});
