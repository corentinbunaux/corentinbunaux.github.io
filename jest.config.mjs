import nextJest from "next/jest.js";

// next/jest wires SWC (TS/JSX transform), CSS/image module stubs and loads
// next.config.mjs, so no ts-jest / babel-jest is needed.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // Test files live under tests/jest/ (mirroring src/), not colocated with
  // the code they cover; tests/e2e/ is Playwright's (picked up by its own
  // config, not Jest's default *.spec.ts matcher).
  testMatch: ["<rootDir>/tests/jest/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/", "/tests/e2e/"],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/out/"],
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!src/**/*.d.ts"],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};

// three ships as ESM only: since r17x `build/three.cjs` is a deprecated shim
// that require()s `three.module.js`, and the examples (OrbitControls,
// RoundedBoxGeometry) are ESM too. next/jest skips all of node_modules by
// default, so three is let through the SWC transform (cached after the first run).
export default async function jestConfig() {
  const resolved = await createJestConfig(config)();
  resolved.transformIgnorePatterns = resolved.transformIgnorePatterns.map((pattern) =>
    pattern.replace("(?!(geist|", "(?!(three|geist|"),
  );
  return resolved;
}
