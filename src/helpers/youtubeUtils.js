const { buildYouTubeVideoEmbedHtml } = require("./playlistEmbedUtils");

const YOUTUBE_ID_PATTERNS = [
  /youtu\.be\/([^?&#/]+)/i,
  /youtube\.com\/watch\?(?:[^#]*&)?v=([^?&#/]+)/i,
  /youtube\.com\/embed\/([^?&#/]+)/i,
  /youtube\.com\/shorts\/([^?&#/]+)/i,
  /youtube\.com\/v\/([^?&#/]+)/i,
];

function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;
  if (/\/embed\/videoseries(?:\?|$)/i.test(url)) return null;
  if (/(?:music\.)?youtube\.com\/playlist\?/i.test(url)) return null;
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].toLowerCase() !== "videoseries") {
      return match[1];
    }
  }
  return null;
}

function parseSnippet(html) {
  const { parse } = require("node-html-parser");
  return parse(html).firstChild;
}

function shouldReplaceParentParagraph(anchor) {
  const parent = anchor.parentNode;
  if (!parent || parent.tagName !== "P") return false;
  return parent.childNodes.every((node) => {
    if (node === anchor) return true;
    return node.nodeType === 3 && !String(node.text || "").trim();
  });
}

function upgradeYouTubeEmbeds(root) {
  const content = root.querySelector(".content");
  if (!content) return;

  for (const embed of content.querySelectorAll(".youtube-embed")) {
    if (embed.closest(".playlist-embed")) continue;
    const iframe = embed.querySelector("iframe");
    if (!iframe) continue;
    const videoId = extractYouTubeId(iframe.getAttribute("src") || "");
    if (!videoId) continue;
    embed.replaceWith(parseSnippet(buildYouTubeVideoEmbedHtml(videoId)));
  }

  for (const anchor of content.querySelectorAll("a[href]")) {
    if (anchor.closest(".playlist-embed")) continue;
    const videoId = extractYouTubeId(anchor.getAttribute("href") || "");
    if (!videoId) continue;

    const replacement = parseSnippet(buildYouTubeVideoEmbedHtml(videoId));
    if (shouldReplaceParentParagraph(anchor)) {
      anchor.parentNode.replaceWith(replacement);
    } else {
      anchor.replaceWith(replacement);
    }
  }
}

module.exports = {
  extractYouTubeId,
  upgradeYouTubeEmbeds,
};
