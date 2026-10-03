import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { TechBadge } from "./TechBadge";
import { OptimizedImage } from "./optimizedImage";
import Federer from "./federer";
import { bannerElmts } from "./Banner";
import type { TechLogoId } from "../data/projects";
import manifest from "../data/imageManifest.json";

describe("TechBadge", () => {
  it("renders the logo and the label as a list item", () => {
    render(
      <ul>
        <TechBadge id="react" label="React" />
      </ul>,
    );
    const item = screen.getByRole("listitem");
    expect(item).toHaveTextContent("React");
    const svg = item.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("viewBox", bannerElmts.find((b) => b.id === "react")!.viewBox);
  });

  it("throws on an id Banner.jsx does not know instead of rendering an empty pill", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TechBadge id={"cobol" as TechLogoId} label="COBOL" />)).toThrow(
      'TechBadge: no logo for "cobol" in Banner.jsx\'s bannerElmts.',
    );
  });

  it("has a logo for every TechLogoId used by the data", () => {
    const ids: TechLogoId[] = [
      "html", "css", "javascript", "react", "typescript", "kotlin", "sql", "python",
      "java", "cpp", "arduino", "windows", "linux", "office", "git", "copilot",
    ];
    const known = new Set(bannerElmts.map((b) => b.id));
    ids.forEach((id) => expect(known.has(id)).toBe(true));
  });
});

describe("OptimizedImage", () => {
  it("serves AVIF with a WebP fallback and intrinsic size, lazily by default", () => {
    const { container } = render(<OptimizedImage src="/img/avatar" alt="Avatar" sizes="50vw" className="c" style={{ opacity: 0.5 }} />);
    const source = container.querySelector("picture > source")!;
    expect(source).toHaveAttribute("srcset", "/img/avatar.avif");
    expect(source).toHaveAttribute("type", "image/avif");
    const img = screen.getByRole("img", { name: "Avatar" });
    expect(img).toHaveAttribute("src", "/img/avatar.webp");
    expect(img).toHaveAttribute("width", "1024");
    expect(img).toHaveAttribute("height", "1024");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).not.toHaveAttribute("fetchpriority");
    expect(img).toHaveClass("c");
    expect(img).toHaveStyle({ opacity: "0.5" });
  });

  it("loads eagerly at high priority when asked", () => {
    render(<OptimizedImage src="/img/avatar" alt="Avatar" priority />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders SVG entries as a plain <img>", () => {
    const entries = manifest as Record<string, { svg?: true }>;
    const svgKey = Object.keys(entries).find((k) => entries[k].svg);
    expect(svgKey).toBeDefined();
    const { container } = render(<OptimizedImage src={svgKey!} alt="logo" />);
    expect(container.querySelector("picture")).toBeNull();
    expect(screen.getByRole("img", { name: "logo" })).toHaveAttribute("src", `${svgKey}.svg`);
  });

  it("fails loudly for an image missing from the manifest", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<OptimizedImage src="/img/nope" alt="" />)).toThrow(
      'OptimizedImage: "/img/nope" is not in the image manifest. Run `npm run optimize:images`.',
    );
  });
});

describe("Federer", () => {
  it("draws the tennis player with theme colours and forwards its ref", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Federer ref={ref} />);
    expect(ref.current).toBe(container.querySelector("svg#game"));
    expect(container.querySelector("#federer-arm")).not.toBeNull();
    expect(container.querySelector("circle")).toHaveStyle({ fill: "var(--my-green)" });
  });
});
