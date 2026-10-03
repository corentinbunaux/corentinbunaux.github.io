/**
 * Manual Jest mock for `three` (picked up automatically for every test: a
 * root-level `__mocks__` folder next to node_modules mocks that node module).
 *
 * jsdom has no WebGL, so only `WebGLRenderer` is replaced. Everything else
 * (Scene, Mesh, geometries, materials, Vector3, Raycaster, TextureLoader...)
 * is the REAL three.js: those classes are plain JavaScript maths and scene
 * graph code that run fine without a GPU. Keeping them real means each demo's
 * `setup()` builds its actual scene graph and the tests can assert on it
 * (positions, visibility, raycast hits) instead of on a hollow mock.
 */
const actual = jest.requireActual<typeof import("three")>("three");

export class FakeWebGLRenderer {
  static instances: FakeWebGLRenderer[] = [];

  readonly domElement: HTMLCanvasElement = document.createElement("canvas");
  readonly options: unknown;
  pixelRatio = 1;
  size = { width: 0, height: 0 };
  /** Every render() call, latest last. */
  readonly renders: { scene: import("three").Scene; camera: import("three").Camera }[] = [];
  disposed = false;
  contextLost = false;

  constructor(options?: unknown) {
    this.options = options;
    FakeWebGLRenderer.instances.push(this);
  }

  setPixelRatio(ratio: number) {
    this.pixelRatio = ratio;
  }

  setSize(width: number, height: number) {
    this.size = { width, height };
  }

  render(scene: import("three").Scene, camera: import("three").Camera) {
    this.renders.push({ scene, camera });
  }

  dispose() {
    this.disposed = true;
  }

  forceContextLoss() {
    this.contextLost = true;
  }
}

module.exports = { ...actual, WebGLRenderer: FakeWebGLRenderer, FakeWebGLRenderer };
