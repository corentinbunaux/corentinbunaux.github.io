---
paths:
  - "**/*.tsx"
  - "**/*.css"
  - "**/*.scss"
  - "**/components/**"
---

# Frontend

- Accessibility is not optional: semantic elements, labelled controls, visible
  focus, keyboard paths for everything clickable, and colour contrast that
  passes WCAG AA.
- Design tokens over literals. Colours, spacing and type scale come from CSS
  custom properties defined once, and are redefined for dark mode.
- Mobile first. Every layout works at 360px wide with no horizontal scroll.
- Server state and UI state are different things; do not store fetched data in
  component state as if it were local.
- No layout shift: reserve space for images and async content.
- Before saying a UI change works, look at it — screenshot it or open it in the
  browser. A diff is not evidence that a page renders.
