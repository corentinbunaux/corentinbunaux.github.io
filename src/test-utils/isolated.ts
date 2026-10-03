/**
 * Renders a component from a fresh module registry in which some modules are
 * replaced (jest.doMock), for code that reads data at module load time
 * (e.g. journeySection's sorted timeline). React, react-dom and the providers
 * are required from the same isolated registry so hooks see one React.
 * Testing Library cannot be required there (it registers Jest hooks), so this
 * mounts with react-dom/client directly; query the result with `screen`.
 * Excluded from coverage (jest.config.mjs).
 */
export function renderIsolated(
  load: () => { component: unknown; props?: Record<string, unknown> },
  mocks: Record<string, () => unknown>,
): () => void {
  let unmount: () => void = () => {};
  jest.isolateModules(() => {
    for (const [path, factory] of Object.entries(mocks)) jest.doMock(path, factory);
    const React = require("react");
    const { createRoot } = require("react-dom/client");
    const { LanguageProvider } = require("../i18n/LanguageContext");
    const { ThemeProvider } = require("../theme/ThemeContext");
    const { component, props } = load();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    React.act(() => {
      root.render(
        React.createElement(
          ThemeProvider,
          null,
          React.createElement(LanguageProvider, null, React.createElement(component, props ?? null)),
        ),
      );
    });
    unmount = () => {
      React.act(() => root.unmount());
      container.remove();
    };
  });
  return unmount;
}
