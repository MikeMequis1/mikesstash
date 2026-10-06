const SUPPORTED_LANGS = ["pt", "en"];
const DEFAULT_LANG = "pt";

// Read lazily (not at module load) so it reflects .env loaded by the
// .11tydata files; langUtils is required by .eleventy.js before dotenv runs.
function getMainLang() {
  return process.env.SITE_MAIN_LANGUAGE === "en" ? "en" : DEFAULT_LANG;
}

/**
 * Resolve a note title that may be a string or a bilingual map
 * ({ pt: "...", en: "..." }) into a plain string for the given language.
 */
function resolveLocalizedTitle(title, fallback = "", lang = DEFAULT_LANG) {
  const safeFallback =
    fallback == null || fallback === "" ? "" : String(fallback);
  const preferred = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;

  if (title == null || title === "") {
    return safeFallback;
  }

  if (typeof title === "string" || typeof title === "number") {
    return String(title);
  }

  if (typeof title === "object" && !Array.isArray(title)) {
    const fromPreferred = title[preferred];
    if (fromPreferred != null && fromPreferred !== "") {
      return String(fromPreferred);
    }
    for (const code of SUPPORTED_LANGS) {
      if (title[code] != null && title[code] !== "") {
        return String(title[code]);
      }
    }
    return safeFallback;
  }

  return safeFallback;
}

/**
 * Build pt/en title strings for runtime language switching in the UI.
 */
function getLocalizedTitles(title, fallback = "") {
  const safeFallback =
    fallback == null || fallback === "" ? "" : String(fallback);

  if (title != null && typeof title === "object" && !Array.isArray(title)) {
    const pt = resolveLocalizedTitle(title, safeFallback, "pt");
    const en = resolveLocalizedTitle(title, safeFallback, "en");
    const main = getMainLang();
    return { pt, en, default: main === "en" ? en : pt };
  }

  const single = resolveLocalizedTitle(title, safeFallback, DEFAULT_LANG);
  return { pt: single, en: single, default: single };
}

function readFlatLangValue(source, lang) {
  if (!source || typeof source !== "object") return undefined;
  const candidates = [
    source[`title-${lang}`],
    source[`title_${lang}`],
    source[`title.${lang}`],
  ];
  for (const value of candidates) {
    if (value != null && value !== "") return value;
  }
  return undefined;
}

function mergeTitleMaps(...maps) {
  const merged = {};
  for (const map of maps) {
    if (!map || typeof map !== "object" || Array.isArray(map)) continue;
    for (const code of SUPPORTED_LANGS) {
      if (map[code] != null && map[code] !== "") {
        merged[code] = map[code];
      }
    }
  }
  return merged;
}

/**
 * Resolve bilingual titles from Obsidian/Digital Garden note data.
 *
 * Supported shapes (vault YAML or published JSON):
 * - title: "Plain string"
 * - title: { pt: "...", en: "..." }   (DG passes this through at top level)
 * - title-pt / title-en               (flat Obsidian Properties; usually in dg-note-properties)
 * - title_pt / title_en
 * - nested copies under dg-note-properties
 */
function getLocalizedTitlesFromNoteData(data = {}, fallback = "") {
  const props =
    data && typeof data === "object" ? data["dg-note-properties"] || {} : {};

  const nestedMaps = [];
  if (data && typeof data.title === "object" && !Array.isArray(data.title)) {
    nestedMaps.push(data.title);
  }
  if (props && typeof props.title === "object" && !Array.isArray(props.title)) {
    nestedMaps.push(props.title);
  }

  const flatMap = {};
  for (const code of SUPPORTED_LANGS) {
    const value =
      readFlatLangValue(data, code) ?? readFlatLangValue(props, code);
    if (value != null && value !== "") {
      flatMap[code] = value;
    }
  }

  const merged = mergeTitleMaps(flatMap, ...nestedMaps);
  if (Object.keys(merged).length > 0) {
    return getLocalizedTitles(merged, fallback);
  }

  if (typeof data.title === "string" || typeof data.title === "number") {
    return getLocalizedTitles(data.title, fallback);
  }
  if (typeof props.title === "string" || typeof props.title === "number") {
    return getLocalizedTitles(props.title, fallback);
  }

  return getLocalizedTitles(null, fallback);
}

module.exports = {
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  resolveLocalizedTitle,
  getLocalizedTitles,
  getLocalizedTitlesFromNoteData,
};
