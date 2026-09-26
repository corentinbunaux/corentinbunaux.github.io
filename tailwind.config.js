/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design tokens from src/app/app.css, so utilities and CSS agree on
        // one source of truth. `second` in particular makes the existing
        // `border-second` class in projectsSection.jsx resolve — until now it
        // was an undefined class and the cards fell back to Tailwind's
        // default light grey border.
        main: "var(--main)",
        secondary: "var(--secondary)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        second: "var(--border)",
        "main-text": "var(--main-text)",
        "second-text": "var(--second-text)",
        "my-green": "var(--my-green)",
        "my-blue": "var(--my-blue)",
      },
      outlineColor: {
        focus: "var(--focus)",
      },
    },
  },
  plugins: [],
};
