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
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/out/", "/.claude/"],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/out/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.test.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/test-utils/**",
  ],
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
};

export default createJestConfig(config);
