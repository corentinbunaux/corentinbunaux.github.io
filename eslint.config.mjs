import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // eslint-config-next's own ignores are root-relative (`.next/**`), which
    // does not match nested build/report output directories elsewhere.
    // `.gitignore` keeps those out of git, but ESLint does not read
    // `.gitignore` by itself.
    ignores: ["coverage/**", "playwright-report/**", "test-results/**"],
  },
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
