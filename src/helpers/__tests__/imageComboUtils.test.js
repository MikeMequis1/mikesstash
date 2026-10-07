import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  COMBO_MARKER,
  readNavOrder,
  extractComboFigures,
  collectImageCombos,
  clearImageComboCache,
  buildCombosMarkdown,
} from "../imageComboUtils.js";

describe("readNavOrder", () => {
  it("reads nested dg-note-properties.navOrder", () => {
    expect(readNavOrder({ "dg-note-properties": { navOrder: 5 } })).toBe(5);
  });

  it("falls back to top-level navOrder", () => {
    expect(readNavOrder({ navOrder: 2 })).toBe(2);
  });

  it("returns a large sentinel when missing", () => {
    expect(readNavOrder({})).toBe(Number.MAX_SAFE_INTEGER);
  });
});

describe("extractComboFigures", () => {
  it("keeps images with descriptions in both languages", () => {
    const body = `![1Desenho.jpg](/img/1.jpg)

:::lang pt
>[!tip] **Desenho 1**
:::
:::lang en
>[!tip] **Drawing 1**
:::
`;
    const figures = extractComboFigures(body);
    expect(figures).toHaveLength(1);
    expect(figures[0].src).toBe("/img/1.jpg");
    expect(figures[0].captions.pt).toContain("Desenho 1");
    expect(figures[0].captions.en).toContain("Drawing 1");
  });

  it("drops images missing a translation", () => {
    const body = `![a](/a.jpg)

:::lang pt
>[!tip] **Desenho**
:::
`;
    expect(extractComboFigures(body)).toHaveLength(0);
  });

  it("drops plain reference images without a description", () => {
    const body = `![ref](/ref.jpg)

Some prose.
`;
    expect(extractComboFigures(body)).toHaveLength(0);
  });
});

describe("collectImageCombos", () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "dg-combo-"));
    clearImageComboCache();
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
    clearImageComboCache();
  });

  function writeNote(folder, name, frontmatter, body) {
    const dir = path.join(root, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, name),
      `---\n${JSON.stringify(frontmatter)}\n---\n\n${body}`
    );
  }

  it("orders combos by navOrder and skips the viewer note", () => {
    const folder = "Drawings & Life Logs";
    const combo = (src, pt, en) => `![x](${src})

:::lang pt
>${pt}
:::
:::lang en
>${en}
:::
`;
    writeNote(
      folder,
      "later.md",
      { "dg-note-properties": { navOrder: 10 } },
      combo("/img/later.jpg", "Desenho 2", "Drawing 2")
    );
    writeNote(
      folder,
      "earlier.md",
      { "dg-note-properties": { navOrder: 1 } },
      combo("/img/earlier.jpg", "Desenho 1", "Drawing 1")
    );
    writeNote(
      folder,
      "viewer.md",
      { "dg-note-properties": { dgShowImageViewer: true, navOrder: 0 } },
      COMBO_MARKER
    );

    const figures = collectImageCombos({ root, folder });
    expect(figures.map((f) => f.src)).toEqual([
      "/img/earlier.jpg",
      "/img/later.jpg",
    ]);
  });

  it("returns an empty list for a missing folder", () => {
    expect(collectImageCombos({ root, folder: "Nope" })).toEqual([]);
  });

  it("caches until cleared", () => {
    const folder = "Drawings & Life Logs";
    writeNote(
      folder,
      "a.md",
      { navOrder: 1 },
      `![x](/a.jpg)

:::lang pt
>Desenho
:::
:::lang en
>Drawing
:::
`
    );
    expect(collectImageCombos({ root, folder })).toHaveLength(1);
    // Add another note; the cached result must not change until cleared.
    writeNote(
      folder,
      "b.md",
      { navOrder: 2 },
      `![y](/b.jpg)

:::lang pt
>Desenho 2
:::
:::lang en
>Drawing 2
:::
`
    );
    expect(collectImageCombos({ root, folder })).toHaveLength(1);
    clearImageComboCache();
    expect(collectImageCombos({ root, folder })).toHaveLength(2);
  });
});

describe("buildCombosMarkdown", () => {
  it("renders the shared image followed by pt/en captions", () => {
    const markdown = buildCombosMarkdown([
      { alt: "x", src: "/a.jpg", captions: { pt: "Desenho", en: "Drawing" } },
    ]);
    expect(markdown).toContain("![x](/a.jpg)");
    expect(markdown).toContain(":::lang pt\nDesenho\n:::");
    expect(markdown).toContain(":::lang en\nDrawing\n:::");
  });
});
