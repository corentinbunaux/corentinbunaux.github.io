import { act, fireEvent, renderHook, screen, waitFor } from "@testing-library/react";
import { useDesktopMotionGate } from "./useDesktopMotionGate";
import { TrackIcon } from "./journey/TrackIcon";
import { HeroVisual } from "./hero/HeroVisual";
import { DESKTOP_QUERY, REDUCED_MOTION_QUERY, media, setDesktop } from "../test-utils/browser";
import { LIGHT_TOKENS, installThemeTokens, renderWithProviders } from "../test-utils/render";
import { useTheme } from "../theme/ThemeContext";
import { fakeLayout, renderers, resetRenderers } from "../test-utils/three";
import { dictionary } from "../i18n/dictionary";

describe("useDesktopMotionGate", () => {
  it("opens on a desktop without reduced motion", () => {
    setDesktop(true, false);
    const { result } = renderHook(() => useDesktopMotionGate());
    expect(result.current).toBe("render");
  });

  it("falls back below 1024px", () => {
    setDesktop(false, false);
    const { result } = renderHook(() => useDesktopMotionGate());
    expect(result.current).toBe("fallback");
  });

  it("lets reduced motion win over a wide screen", () => {
    setDesktop(true, true);
    const { result } = renderHook(() => useDesktopMotionGate());
    expect(result.current).toBe("fallback");
  });

  it("re-evaluates live and unsubscribes on unmount", () => {
    setDesktop(false, false);
    const { result, unmount } = renderHook(() => useDesktopMotionGate());
    act(() => media.set(DESKTOP_QUERY, true));
    expect(result.current).toBe("render");
    act(() => media.set(REDUCED_MOTION_QUERY, true));
    expect(result.current).toBe("fallback");
    unmount();
    expect(media.listenerCount(DESKTOP_QUERY)).toBe(0);
    expect(media.listenerCount(REDUCED_MOTION_QUERY)).toBe(0);
  });
});

describe("TrackIcon", () => {
  beforeEach(() => {
    resetRenderers();
    fakeLayout();
  });

  it.each([
    ["experience", "lucide-briefcase-business"],
    ["education", "lucide-graduation-cap"],
  ] as const)("shows the flat %s icon outside desktop", (kind, iconClass) => {
    setDesktop(false);
    const { container } = renderWithProviders(<TrackIcon kind={kind} />);
    expect(container.querySelector(`svg.${iconClass}`)).not.toBeNull();
    expect(renderers()).toHaveLength(0);
  });

  it("loads the 3D emblem on desktop and remounts it when the theme changes", async () => {
    setDesktop(true);
    function ThemeSwitch() {
      const { toggleTheme } = useTheme();
      return <button onClick={toggleTheme}>theme</button>;
    }
    const { container } = renderWithProviders(
      <>
        <ThemeSwitch />
        <TrackIcon kind="education" />
      </>,
    );
    await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
    expect(container.querySelector("svg")).toBeNull();
    expect(renderers()).toHaveLength(1);

    installThemeTokens(LIGHT_TOKENS); // what [data-theme="light"] does in CSS
    fireEvent.click(screen.getByRole("button", { name: "theme" }));
    await waitFor(() => expect(renderers()).toHaveLength(2));
    expect(renderers()[0].disposed).toBe(true); // old scene torn down
    expect(container.querySelectorAll("canvas")).toHaveLength(1);
  });
});

describe("HeroVisual", () => {
  beforeEach(() => {
    resetRenderers();
    fakeLayout();
  });

  it("always shows the avatar, eagerly loaded", () => {
    setDesktop(false);
    renderWithProviders(<HeroVisual />);
    const avatar = screen.getByRole("img", { name: dictionary.fr.hero.avatarAlt });
    expect(avatar).toHaveAttribute("loading", "eager");
    expect(avatar).toHaveAttribute("src", "/img/avatar.webp");
    expect(renderers()).toHaveLength(0);
  });

  it("adds the orbiting icons behind the avatar on desktop only", async () => {
    setDesktop(true);
    const { container } = renderWithProviders(<HeroVisual />, { language: "en" });
    expect(screen.getByRole("img", { name: dictionary.en.hero.avatarAlt })).toBeInTheDocument();
    await waitFor(() => expect(container.querySelector("canvas")).not.toBeNull());
    expect(renderers()).toHaveLength(1);
  });
});
