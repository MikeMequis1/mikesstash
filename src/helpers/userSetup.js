const fs = require("fs");
const { parse } = require("node-html-parser");
const matter = require("gray-matter");
const { upgradeYouTubeEmbeds } = require("./youtubeUtils");
const { upgradePlaylistEmbeds } = require("./playlistEmbedUtils");
const { langPlugin } = require("./langPlugin");
const { imageViewerPlugin } = require("./imageViewerPlugin");
const { imageComboPlugin } = require("./imageComboPlugin");
const { clearImageComboCache } = require("./imageComboUtils");
const { socialCoinsPlugin } = require("./socialCoins");
const { resolveLocalizedTitle, getLocalizedTitlesFromNoteData } = require("./langUtils");
const {
  isLinkCardsEnabled,
  upgradeLinkCards,
  clearNoteCardIndex,
  renderPortfolioCards,
  stripLeadingCardImage,
} = require("./linkCardsUtils");
const {
  isPortfolioNote,
} = require("./portfolioUtils");
const { isGardenVisible } = require("./visibilityUtils");

const jsYamlForMatter = require(
  require.resolve("js-yaml", { paths: [require.resolve("gray-matter")] })
);
const matterOptions = {
  engines: {
    yaml: {
      parse: (str) => jsYamlForMatter.load(str.replace(/\\\|/g, "|")),
      stringify: (obj) => jsYamlForMatter.dump(obj),
    },
  },
};

const markdownFileTypeRegex = /\.(md|markdown)$/i;
const isMarkdownPage = (inputPath) =>
  inputPath && inputPath.match(markdownFileTypeRegex);

function userMarkdownSetup(md) {
  md.use(langPlugin);
  md.use(imageViewerPlugin);
  md.use(imageComboPlugin);
  md.use(socialCoinsPlugin);
}
function userEleventySetup(eleventyConfig) {
  eleventyConfig.addFilter("localizedTitle", function (title, fallback, lang) {
    return resolveLocalizedTitle(title, fallback, lang || "pt");
  });

  eleventyConfig.addFilter("noteLocalizedTitle", function (data, fallback, lang) {
    const titles = getLocalizedTitlesFromNoteData(data || {}, fallback);
    if (lang && titles[lang]) return titles[lang];
    return titles.default;
  });


  eleventyConfig.on("eleventy.before", () => {
    clearNoteCardIndex();
    clearImageComboCache();
  });

  // These three steps used to be separate transforms, each doing its own full
  // HTML parse and re-serialize of every markdown page. They run in the same
  // order on a single parsed tree here so each page is parsed once instead of
  // three times. Folding them together is safe because none of the steps depend
  // on the serialized output of the others, only on the shared DOM.
  eleventyConfig.addTransform("content-embeds", function (content) {
    if (!isMarkdownPage(this.page && this.page.inputPath)) {
      return content;
    }
    const parsed = parse(content);
    upgradeYouTubeEmbeds(parsed);
    upgradePlaylistEmbeds(parsed);
    stripLeadingCardImage(parsed);
    return parsed.toString();
  });

  eleventyConfig.addTransform("link-cards", function (content) {
    const inputPath = this.page && this.page.inputPath;
    if (!isMarkdownPage(inputPath)) {
      return content;
    }

    let frontMatter = {};
    const aliasNote = this.page && this.page.note;
    if (aliasNote && aliasNote.data) {
      frontMatter = aliasNote.data;
    } else {
      try {
        frontMatter = matter(fs.readFileSync(inputPath, "utf8"), matterOptions).data || {};
      } catch {
        frontMatter = {};
      }
    }

    if (!isLinkCardsEnabled(frontMatter)) {
      return content;
    }

    const parsed = parse(content);
    upgradeLinkCards(parsed);
    return parsed.toString();
  });

  eleventyConfig.addFilter("portfolioCards", function (notes) {
    return renderPortfolioCards(notes || []);
  });

  eleventyConfig.addFilter("gardenVisible", function (notes) {
    return (notes || []).filter((note) => isGardenVisible(note.data));
  });

  eleventyConfig.addCollection("portfolio", function (collectionApi) {
    return collectionApi.getFilteredByTag("note").filter((item) => isPortfolioNote(item));
  });
}
exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
