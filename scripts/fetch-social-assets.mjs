/**
 * Maintenance tool: fetch the SocialCoin avatars and brand icons into local
 * assets under src/site/img/social/.
 *
 * This is NOT part of `npm run build`. The published site must never depend on
 * the social platforms being reachable; it only ever references the committed
 * local files. Run this explicitly when an avatar or icon needs refreshing:
 *
 *   npm run fetch-social-assets
 *
 * Profiles whose `source` is null (Last.fm, Stash Games, LinkedIn) are skipped:
 * their avatars are supplied manually and are never overwritten.
 *
 * Source-specific notes (kept here, not spread through the app):
 *   - Steam: the community XML endpoint exposes `avatarFull`; we resolve the
 *     CDN URL at fetch time.
 *   - GOG: the profile page embeds the avatar CDN URL; we scrape the 140x140
 *     rendition (the largest the CDN serves for this pattern).
 *   - Exophase: the profile page returns 403 unless a browser-like
 *     User-Agent/Accept header is sent, and the avatar lives in the og:image.
 *   - Bluesky: the public getProfile API returns the avatar CDN URL (no auth).
 *   - Simple Icons SVGs ship with a hard-coded `fill`; we normalize it to
 *     `currentColor` so the component can color them via CSS.
 */

import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { PROFILES } = require("../src/helpers/socialProfiles.js");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AVATAR_DIR = path.join(ROOT, "src", "site", "img", "social", "avatars");
const ICON_DIR = path.join(ROOT, "src", "site", "img", "social", "icons");

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const force = process.argv.includes("--force");
// Optional positional args restrict the run to specific profile ids, e.g.
//   npm run fetch-social-assets -- bluesky
// so refreshing one platform never clobbers manually improved avatars.
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

function log(msg) {
  process.stdout.write(`[social-assets] ${msg}\n`);
}

// Some platforms (Exophase, and Cloudflare-fronted pages generally) reject
// Node's TLS/HTTP fingerprint with 403 even with browser headers, while the
// system curl binary succeeds. Fall back to curl when fetch is blocked or
// fails; this is a maintenance tool, so a system curl dependency is fine.
function curlGet(url, binary) {
  const res = spawnSync(
    "curl",
    ["-sL", "--max-time", "60", "-A", BROWSER_UA, url],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(`curl exited with ${res.status}`);
  return binary ? res.stdout : res.stdout.toString("utf8");
}

async function get(url, { binary = false, accept = "text/html" } = {}) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: accept },
      redirect: "follow",
    });
    if (res.ok) {
      return binary
        ? Buffer.from(await res.arrayBuffer())
        : await res.text();
    }
    if (res.status !== 403 && res.status !== 999) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
  } catch (err) {
    if (err.message && err.message.startsWith("HTTP ")) throw err;
  }
  return curlGet(url, binary);
}

function fetchText(url, extraHeaders = {}) {
  return get(url, { accept: extraHeaders.Accept || "text/html" });
}

function fetchBinary(url) {
  return get(url, { binary: true });
}

async function resolveAvatarUrl(source) {
  switch (source.kind) {
    case "direct":
      return source.url;
    case "steam": {
      const xml = await fetchText(source.url);
      const match = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
      if (!match) throw new Error("avatarFull not found in Steam XML");
      return match[1];
    }
    case "gog": {
      const html = await fetchText(source.url);
      const match = html.match(
        /https:\/\/images\.gog\.com\/[a-f0-9]+_prof_avatar_140x140\.jpg/
      );
      if (!match) throw new Error("GOG avatar URL not found");
      return match[0];
    }
    case "exophase": {
      const html = await fetchText(source.url);
      const match =
        html.match(/<meta property="og:image" content="([^"]+)"/) ||
        html.match(/<meta name="twitter:image" content="([^"]+)"/);
      if (!match) throw new Error("Exophase og:image not found");
      return match[1];
    }
    case "bluesky": {
      const json = JSON.parse(
        await fetchText(source.url, { Accept: "application/json" })
      );
      if (!json.avatar) throw new Error("avatar not found in Bluesky profile");
      // The CDN defaults to WebP; @jpeg keeps the .jpg filename truthful.
      return `${json.avatar}@jpeg`;
    }
    default:
      throw new Error(`Unknown source kind: ${source.kind}`);
  }
}

async function fetchAvatar(profile) {
  const target = path.join(AVATAR_DIR, path.basename(profile.avatar));
  if (profile.source === null) {
    log(`skip  ${profile.id}: manual avatar (${path.basename(profile.avatar)})`);
    return;
  }
  try {
    const url = await resolveAvatarUrl(profile.source);
    const bytes = await fetchBinary(url);
    await writeFile(target, bytes);
    log(`avatar ${profile.id} -> ${path.basename(profile.avatar)} (${bytes.length} B)`);
  } catch (err) {
    log(`FAIL   ${profile.id}: ${err.message}`);
    if (!force) log(`       keeping any existing local file`);
  }
}

async function fetchIcon(slug) {
  const target = path.join(ICON_DIR, `${slug}.svg`);
  try {
    const svg = await fetchText(`https://cdn.simpleicons.org/${slug}`, {
      Accept: "image/svg+xml",
    });
    const normalized = svg.replace(
      /(<svg[^>]*?)\sfill="[^"]*"/,
      "$1 fill=\"currentColor\""
    );
    await writeFile(target, normalized, "utf8");
    log(`icon   ${slug}.svg`);
  } catch (err) {
    log(`FAIL   icon ${slug}: ${err.message}`);
  }
}

async function main() {
  await mkdir(AVATAR_DIR, { recursive: true });
  await mkdir(ICON_DIR, { recursive: true });

  const profiles = only.length
    ? PROFILES.filter((p) => only.includes(p.id))
    : PROFILES;

  if (only.length && profiles.length === 0) {
    log(`no profiles matched: ${only.join(", ")}`);
    return;
  }

  for (const profile of profiles) {
    await fetchAvatar(profile);
  }

  const slugs = [...new Set(profiles.map((p) => p.icon).filter(Boolean))];
  for (const slug of slugs) {
    await fetchIcon(slug);
  }

  log("done");
}

main().catch((err) => {
  console.error(`[social-assets] fatal: ${err.message}`);
  process.exitCode = 1;
});
