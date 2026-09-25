import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      // Pre-existing pattern in Banner.jsx and project.tsx (setState called
      // synchronously in an effect). Real fix belongs to the components that
      // touch those files (project.tsx is rewritten in PORT-012), not to a
      // stack-upgrade ticket. Downgraded so the new, stricter rule from
      // eslint-plugin-react-hooks v7 doesn't block this upgrade.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
