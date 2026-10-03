import { act, fireEvent, render } from "@testing-library/react";
import Banner, { bannerElmts } from "./Banner";

function setWidth(px: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: px });
}

afterEach(() => setWidth(1024));

describe("Banner (tech logo carousel)", () => {
  it("renders two carousel sections, each with every logo", () => {
    setWidth(1440);
    const { container } = render(<Banner />);
    const sections = container.querySelectorAll(".banner-section");
    // The third (lg) section compares innerWidth to the string "1024px",
    // which is never true: see the report of PORT-068.
    expect(sections).toHaveLength(2);
    sections.forEach((section) => {
      expect(section.querySelectorAll("svg")).toHaveLength(bannerElmts.length);
    });
    expect(container.querySelector("[data-content='HTML 5'] svg#html")).not.toBeNull();
  });

  it.each([
    [600, "300vw", "0%", "20000ms"],
    [900, "450vw", "0%", "15000ms"],
    [1440, "470vw", "10%", "20000ms"],
  ])("at %ipx uses width %s, offset %s and speed %s, following resizes", (px, width, right, speed) => {
    setWidth(1440);
    const { container } = render(<Banner />);
    setWidth(px);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe(width);
    expect((root.firstElementChild as HTMLElement).style.right).toBe(right);
    expect((container.querySelector(".banner-section") as HTMLElement).style.getPropertyValue("--speed")).toBe(speed);
  });

  it("pauses every section while a logo is hovered", () => {
    const { container } = render(<Banner />);
    const sections = [...container.querySelectorAll(".banner-section")];
    fireEvent.mouseEnter(container.querySelector("svg#react")!);
    sections.forEach((s) => expect(s).toHaveClass("paused"));
    fireEvent.mouseLeave(container.querySelector("svg#react")!);
    sections.forEach((s) => expect(s).not.toHaveClass("paused"));
  });

  it("stops listening to resizes on unmount", () => {
    const { unmount } = render(<Banner />);
    const removed = jest.spyOn(window, "removeEventListener");
    unmount();
    expect(removed).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
