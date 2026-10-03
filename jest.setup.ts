import "@testing-library/jest-dom";
import { installBrowserFakes } from "./src/test-utils/browser";

beforeEach(() => {
  installBrowserFakes();
});

afterEach(() => {
  jest.restoreAllMocks();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  document.documentElement.removeAttribute("style");
});
