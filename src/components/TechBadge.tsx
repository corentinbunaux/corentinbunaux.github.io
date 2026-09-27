import { bannerElmts } from "./Banner";
import type { TechLogoId } from "../data/projects";

type BannerLogo = { id: string; viewBox: string; svgContent: React.ReactNode };

/** Pill with a technology's logo and name, reusing Banner.jsx's icons (same
 * source as the project cards' TechPill). Throws on an unknown id instead of
 * rendering an empty pill: TechLogoId and bannerElmts must stay in sync. */
export function TechBadge({ id, label }: { id: TechLogoId; label: string }) {
  const logo = (bannerElmts as BannerLogo[]).find((item) => item.id === id);
  if (!logo) {
    throw new Error(`TechBadge: no logo for "${id}" in Banner.jsx's bannerElmts.`);
  }
  return (
    <li className="flex items-center gap-2 rounded-full border border-second bg-surface px-3 py-1 text-sm text-main-text">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={logo.viewBox}
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        {logo.svgContent}
      </svg>
      {label}
    </li>
  );
}
