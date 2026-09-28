const fs = require("fs");
const { parse } = require("node-html-parser");
const matter = require("gray-matter");
const { upgradeYouTubeEmbeds } = require("./youtubeUtils");
const { upgradePlaylistEmbeds } = require("./playlistEmbedUtils");
const { langPlugin } = require("./langPlugin");
const { imageViewerPlugin } = require("./imageViewerPlugin");
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

async function ytAudioApiMiddleware(req, res, next) {
  const pathname = (req.url || "").split("?")[0];

  const audioCheckMatch = pathname.match(/^\/api\/yt-audio-check\/([^/]+)/);
  if (audioCheckMatch) {
    try {
      const { isAudioStreamAvailable } = await import("./youtubeAudioApi.mjs");
      const available = await isAudioStreamAvailable(audioCheckMatch[1]);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.end(JSON.stringify({ available }));
    } catch (_err) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.end(JSON.stringify({ available: false }));
    }
  }

  const audioMatch = pathname.match(/^\/api\/yt-audio\/([^/]+)/);
  if (audioMatch) {
    try {
      const { fetchAudioBuffer } = await import("./youtubeAudioApi.mjs");
      const { buffer, mimeType } = await fetchAudioBuffer(audioMatch[1]);
      res.statusCode = 200;
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Length", buffer.length);
      return res.end(buffer);
    } catch (_err) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Audio stream unavailable" }));
    }
  }

  const mediaCheckMatch = pathname.match(/^\/api\/yt-media-check\/([^/]+)/);
  if (mediaCheckMatch) {
    try {
      const { isAudioStreamAvailable } = await import("./youtubeAudioApi.mjs");
      const available = await isAudioStreamAvailable(mediaCheckMatch[1]);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.end(JSON.stringify({ available }));
    } catch (_err) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.end(JSON.stringify({ available: false }));
    }
  }

  const mediaMatch = pathname.match(/^\/api\/yt-media\/([^/]+)/);
  if (mediaMatch) {
    try {
      const { fetchMediaBuffer } = await import("./youtubeAudioApi.mjs");
      const buffer = await fetchMediaBuffer(mediaMatch[1]);
      res.statusCode = 200;
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Length", buffer.length);
      return res.end(buffer);
    } catch (_err) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Media stream unavailable" }));
    }
  }

  return next();
}

function userMarkdownSetup(md) {
  md.use(langPlugin);
  md.use(imageViewerPlugin);
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
  });

  eleventyConfig.addTransform("youtube-visualizer", function (content) {
    if (!isMarkdownPage(this.page.inputPath)) {
      return content;
    }
    const parsed = parse(content);
    upgradeYouTubeEmbeds(parsed);
    return parsed.toString();
  });

  eleventyConfig.addTransform("playlist-embeds", function (content) {
    if (!isMarkdownPage(this.page.inputPath)) {
      return content;
    }
    const parsed = parse(content);
    upgradePlaylistEmbeds(parsed);
    return parsed.toString();
  });

  eleventyConfig.addTransform("strip-leading-card-image", function (content) {
    if (!isMarkdownPage(this.page && this.page.inputPath)) {
      return content;
    }
    const parsed = parse(content);
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

  eleventyConfig.setServerOptions({
    middleware: [ytAudioApiMiddleware],
  });
}
exports.userMarkdownSetup = userMarkdownSetup;
exports.userEleventySetup = userEleventySetup;
