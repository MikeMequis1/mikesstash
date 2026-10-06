const YT_PLAYLIST_PATTERNS = [
  /(?:music\.)?youtube\.com\/playlist\?(?:[^#]*&)?list=([^&#]+)/i,
  /youtube\.com\/embed\/videoseries\?(?:[^#]*&)?list=([^&#]+)/i,
  /youtube\.com\/embed\/?\?(?:[^#]*&)?list=([^&#]+)/i,
];

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function extractYouTubePlaylistId(url) {
  if (!url || typeof url !== "string") return null;
  for (const pattern of YT_PLAYLIST_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

function isSpotifyEmbedSrc(src) {
  if (!src || typeof src !== "string") return false;
  return /open\.spotify\.com\/embed\//i.test(src);
}

function withSpotifyTheme(src, theme = "0") {
  if (!src) return src;
  try {
    const url = new URL(src);
    url.searchParams.set("theme", theme);
    return url.toString();
  } catch {
    if (/[?&]theme=/.test(src)) {
      return src.replace(/([?&]theme=)[^&]*/i, `$1${theme}`);
    }
    return `${src}${src.includes("?") ? "&" : "?"}theme=${theme}`;
  }
}

function spotifyOpenUrl(src) {
  if (!src) return "https://open.spotify.com/";
  return src
    .replace("open.spotify.com/embed/", "open.spotify.com/")
    .replace(/[?&]utm_source=[^&]*/g, "")
    .replace(/[?&]theme=[^&]*/g, "")
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");
}

function youtubeMusicOpenUrl(playlistId) {
  return `https://music.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`;
}

function openLinkHtml(href) {
  return `<a class="playlist-embed__open external-link" href="${escapeAttr(
    href
  )}" target="_blank" rel="noopener noreferrer"><span class="dg-lang" data-lang="pt">Abrir</span><span class="dg-lang" data-lang="en">Open</span></a>`;
}

function buildYouTubePlaylistEmbedHtml(playlistId) {
  const src = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
    playlistId
  )}&rel=0&modestbranding=1&color=white&playsinline=1`;
  const openHref = youtubeMusicOpenUrl(playlistId);
  return `<div class="playlist-embed playlist-embed--youtube" data-yt-playlist="${escapeAttr(
    playlistId
  )}">
  <div class="playlist-embed__chrome">
    <span class="playlist-embed__label">YouTube Music</span>
    ${openLinkHtml(openHref)}
  </div>
  <iframe class="playlist-embed__frame" src="${escapeAttr(
    src
  )}" title="YouTube Music playlist" width="100%" height="352" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
</div>`;
}

function buildYouTubeVideoEmbedHtml(videoId) {
  const src = `https://www.youtube.com/embed/${encodeURIComponent(
    videoId
  )}?rel=0&modestbranding=1&playsinline=1`;
  const openHref = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  return `<div class="playlist-embed playlist-embed--youtube" data-yt-video="${escapeAttr(
    videoId
  )}">
  <div class="playlist-embed__chrome">
    <span class="playlist-embed__label">YouTube</span>
    ${openLinkHtml(openHref)}
  </div>
  <iframe class="playlist-embed__frame" src="${escapeAttr(
    src
  )}" title="YouTube video" width="100%" height="352" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
</div>`;
}

function buildSpotifyEmbedHtml(src, height = "352") {
  const themedSrc = withSpotifyTheme(src);
  const openHref = spotifyOpenUrl(src);
  return `<div class="playlist-embed playlist-embed--spotify">
  <div class="playlist-embed__chrome">
    <span class="playlist-embed__label">Spotify</span>
    ${openLinkHtml(openHref)}
  </div>
  <iframe class="playlist-embed__frame" data-testid="embed-iframe" src="${escapeAttr(
    themedSrc
  )}" title="Spotify playlist" width="100%" height="${escapeAttr(
    String(height || "352")
  )}" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
</div>`;
}

function parseSnippet(html) {
  const { parse } = require("node-html-parser");
  return parse(html).firstChild;
}

function isWhitespaceOrBreak(node) {
  if (!node) return false;
  if (node.nodeType === 3) return !String(node.text || "").trim();
  if (node.nodeType !== 1) return false;
  const tag = String(node.tagName || "").toUpperCase();
  return tag === "BR" || tag === "WBR";
}

function standalonePlaylistAnchors(container) {
  if (!container) return [];
  const anchors = [...container.childNodes].filter((node) => {
    if (node.nodeType !== 1) return false;
    return (
      String(node.tagName || "").toUpperCase() === "A" &&
      extractYouTubePlaylistId(node.getAttribute("href") || "")
    );
  });
  if (!anchors.length) return [];
  if (anchors.some((anchor) => anchor.closest(".playlist-embed"))) return [];

  const onlyPlaylists = container.childNodes.every((node) => {
    if (anchors.includes(node)) return true;
    return isWhitespaceOrBreak(node);
  });
  return onlyPlaylists ? anchors : [];
}

function replaceNode(node, html) {
  node.replaceWith(parseSnippet(html));
}

function upgradeYouTubeMusicPlaylists(content) {
  for (const paragraph of [...content.querySelectorAll("p")]) {
    if (paragraph.closest(".playlist-embed")) continue;
    const anchors = standalonePlaylistAnchors(paragraph);
    if (!anchors.length) continue;

    if (anchors.length === 1) {
      const playlistId = extractYouTubePlaylistId(anchors[0].getAttribute("href"));
      replaceNode(paragraph, buildYouTubePlaylistEmbedHtml(playlistId));
      continue;
    }

    const html = `<div class="playlist-embeds">${anchors
      .map((anchor) =>
        buildYouTubePlaylistEmbedHtml(extractYouTubePlaylistId(anchor.getAttribute("href")))
      )
      .join("")}</div>`;
    replaceNode(paragraph, html);
  }

  for (const embed of content.querySelectorAll(".youtube-embed")) {
    if (embed.closest(".playlist-embed")) continue;
    const iframe = embed.querySelector("iframe");
    if (!iframe) continue;
    const playlistId = extractYouTubePlaylistId(iframe.getAttribute("src") || "");
    if (!playlistId) continue;
    replaceNode(embed, buildYouTubePlaylistEmbedHtml(playlistId));
  }
}

function upgradeSpotifyEmbeds(content) {
  for (const iframe of [...content.querySelectorAll("iframe[src]")]) {
    if (iframe.closest(".playlist-embed")) continue;
    const src = iframe.getAttribute("src") || "";
    if (!isSpotifyEmbedSrc(src)) continue;
    const height = iframe.getAttribute("height") || "352";
    const html = buildSpotifyEmbedHtml(src, height);
    const parent = iframe.parentNode;
    if (
      parent &&
      parent.tagName === "P" &&
      parent.childNodes.every((node) => node === iframe || isWhitespaceOrBreak(node))
    ) {
      replaceNode(parent, html);
    } else {
      replaceNode(iframe, html);
    }
  }
}

function upgradePlaylistEmbeds(root) {
  const content = root.querySelector(".content") || root;
  if (!content) return;
  upgradeYouTubeMusicPlaylists(content);
  upgradeSpotifyEmbeds(content);
}

module.exports = {
  extractYouTubePlaylistId,
  isSpotifyEmbedSrc,
  withSpotifyTheme,
  spotifyOpenUrl,
  buildYouTubePlaylistEmbedHtml,
  buildYouTubeVideoEmbedHtml,
  buildSpotifyEmbedHtml,
  upgradePlaylistEmbeds,
};
