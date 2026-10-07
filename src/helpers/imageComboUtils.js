/**
 * :::display-image-combo
 *
 * Collects "image + >description" combos from the notes in a folder and turns
 * them into the figures consumed by the image viewer (see imageViewerUtils).
 *
 * A combo qualifies only when the same image is immediately followed by a
 * blockquote description in BOTH supported languages (pt and en). This is the
 * shape produced by the Drawings & Life Logs notes:
 *
 *   ![Drawing.jpg](/img/user/img/Drawings/1.jpg)
 *
 *   :::lang pt
 *   >[!tip] **Desenho 1: ...**
 *   :::
 *   :::lang en
 *   >[!tip] **Drawing 1: ...**
 *   :::
 *
 * Notes are ordered by the navOrder frontmatter property, then by file name.
 * The note that owns the viewer itself (dgShowImageViewer) is never a source.
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const matterOptions = require("./matterOptions");
const { isImageViewerEnabled } = require("./imageViewerUtils");

const COMBO_MARKER = ":::display-image-combo";
const DEFAULT_COMBO_FOLDER = "Drawings & Life Logs";
const NOTES_ROOT = path.join(__dirname, "..", "site", "notes");
const MARKDOWN_EXT = /\.md$/i;

function readNavOrder(data) {
  const props = (data && data["dg-note-properties"]) || {};
  const value =
    props.navOrder != null
      ? props.navOrder
      : data && data.navOrder != null
        ? data.navOrder
        : null;
  if (value === null) return Number.MAX_SAFE_INTEGER;
  const num = Number(value);
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
}

const MD_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/;
const LANG_BLOCK_RE = /^:::lang\s+(pt|en)\s*$/i;
const LANG_CLOSE_RE = /^:::\s*$/;

/**
 * Parse a note body into figures and keep only the "combos": an image
 * immediately followed (after blank lines) by a blockquote (`>...`)
 * description in BOTH languages. Trailing prose lang-blocks are ignored, so a
 * reference image followed by ordinary prose is not mistaken for a combo.
 */
function extractComboFigures(body) {
  const lines = String(body || "").split(/\r?\n/);
  const figures = [];

  for (let i = 0; i < lines.length; i++) {
    const img = MD_IMAGE_RE.exec(lines[i].trim());
    if (!img) continue;

    const captions = { pt: "", en: "" };
    const seen = new Set();
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;

    while (j < lines.length) {
      const langMatch = LANG_BLOCK_RE.exec(lines[j].trim());
      if (!langMatch) break;
      const lang = langMatch[1].toLowerCase();
      if (seen.has(lang)) break;

      let k = j + 1;
      const captionLines = [];
      while (k < lines.length && !LANG_CLOSE_RE.test(lines[k].trim())) {
        captionLines.push(lines[k]);
        k++;
      }
      if (k >= lines.length) break;

      const caption = captionLines.join("\n").trim();
      // Only blockquote descriptions qualify; a prose lang-block ends the scan.
      if (!caption.startsWith(">")) break;

      seen.add(lang);
      captions[lang] = caption;
      j = k + 1;
      while (j < lines.length && lines[j].trim() === "") j++;
    }

    if (captions.pt !== "" && captions.en !== "") {
      figures.push({ src: img[2], alt: img[1], captions });
    }
    i = j - 1;
  }

  return figures;
}

let cache = null;

function clearImageComboCache() {
  cache = null;
}

/**
 * Read every note in the folder, extract its combos and flatten them in
 * navOrder sequence. Results are cached per build; call clearImageComboCache()
 * on eleventy.before so watch-mode rebuilds pick up note edits.
 */
function collectImageCombos(options = {}) {
  if (cache) return cache;

  const folder = options.folder || DEFAULT_COMBO_FOLDER;
  const root = options.root || NOTES_ROOT;
  const dir = path.join(root, folder);

  let files = [];
  try {
    files = fs.readdirSync(dir).filter((file) => MARKDOWN_EXT.test(file));
  } catch {
    cache = [];
    return cache;
  }

  const notes = [];
  for (const file of files) {
    let parsed;
    try {
      parsed = matter(fs.readFileSync(path.join(dir, file), "utf8"), matterOptions);
    } catch {
      continue;
    }
    const data = parsed.data || {};
    // The viewer note itself is a consumer, never a source.
    if (isImageViewerEnabled(data)) continue;

    const figures = extractComboFigures(parsed.content);
    if (figures.length === 0) continue;

    notes.push({ file, navOrder: readNavOrder(data), figures });
  }

  notes.sort(
    (a, b) => a.navOrder - b.navOrder || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0)
  );

  const figures = [];
  for (const note of notes) {
    for (const fig of note.figures) {
      figures.push({
        src: fig.src,
        alt: fig.alt,
        captions: { pt: fig.captions.pt, en: fig.captions.en },
      });
    }
  }

  cache = figures;
  return cache;
}

/**
 * Static, non-interactive fallback: the combos as plain markdown (shared image
 * followed by the pt/en descriptions), used when the viewer is disabled.
 */
function buildCombosMarkdown(figures) {
  const parts = [];
  for (const fig of figures || []) {
    parts.push(`![${fig.alt}](${fig.src})`, "");
    for (const lang of ["pt", "en"]) {
      const caption = ((fig.captions && fig.captions[lang]) || "").trim();
      if (caption) parts.push(`:::lang ${lang}`, caption, ":::", "");
    }
  }
  return parts.join("\n").trim();
}

module.exports = {
  COMBO_MARKER,
  DEFAULT_COMBO_FOLDER,
  readNavOrder,
  extractComboFigures,
  collectImageCombos,
  clearImageComboCache,
  buildCombosMarkdown,
};
