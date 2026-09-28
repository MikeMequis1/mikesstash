/**
 * SocialCoin: data-driven renderer + markdown-it block plugin.
 *
 * Usage in a note (works inside :::lang blocks):
 *
 *   :::social-coins
 *
 * The marker is a self-closing single-line block (it carries no body). It
 * intentionally does not use a ":::" closing fence: langPlugin's fence scanner
 * does not track nesting, so a nested ":::" would prematurely close the
 * surrounding :::lang block.
 *
 * Renders a responsive grid of circular, two-sided coins. The front is the
 * platform's local Nyxa avatar; the back is the platform brand icon (or a
 * monogram when no brand SVG exists). The whole coin links to the profile.
 *
 * Profile data lives in ./socialProfiles.js and is kept separate from markup.
 */

const fs = require("fs");
const path = require("path");
const { PROFILES, GROUPS } = require("./socialProfiles");

const MARKER = ":::social-coins";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Avatar paths are site-absolute ("/img/..."), which map to src/site/img/...
// at build time. Used to fall back to a monogram when a manually-supplied
// avatar (Last.fm, Stash Games, LinkedIn) is not present yet.
function defaultAvatarExists(avatarPath) {
  return fs.existsSync(path.join(__dirname, "..", "site", avatarPath));
}

function iconPath(profile) {
  if (profile.iconSrc) return profile.iconSrc;
  if (profile.icon) return `/img/social/icons/${profile.icon}.svg`;
  return null;
}

function renderFaceContent(profile, avatarExists) {
  const hasAvatar = avatarExists(profile.avatar);
  const front = hasAvatar
    ? `<img class="social-coin__img" src="${escapeHtml(profile.avatar)}" alt="" width="160" height="160" loading="lazy" decoding="async">`
    : `<span class="social-coin__monogram" aria-hidden="true">${escapeHtml(
        profile.monogram || profile.name.en.slice(0, 2).toUpperCase()
      )}</span>`;

  const backIcon = iconPath(profile);
  const iconClass = profile.iconSrc
    ? "social-coin__icon social-coin__icon--logo"
    : "social-coin__icon";
  const back = backIcon
    ? `<img class="${iconClass}" src="${escapeHtml(backIcon)}" alt="" loading="lazy" decoding="async">`
    : `<span class="social-coin__monogram">${escapeHtml(profile.monogram || "")}</span>`;

  return { front, back, hasAvatar };
}

function renderCoin(profile, avatarExists) {
  const { front, back, hasAvatar } = renderFaceContent(profile, avatarExists);
  const frontModifier = hasAvatar ? "" : " social-coin__face--placeholder";
  return `  <li class="social-coin" style="--coin-brand:${escapeHtml(
    profile.color
  )}">
    <a class="social-coin__link" href="${escapeHtml(
      profile.url
    )}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(
    profile.label.pt
  )}" data-label-pt="${escapeHtml(profile.label.pt)}" data-label-en="${escapeHtml(
    profile.label.en
  )}" data-tooltip="${escapeHtml(profile.name.pt)}" data-tooltip-pt="${escapeHtml(
    profile.name.pt
  )}" data-tooltip-en="${escapeHtml(profile.name.en)}">
      <span class="social-coin__inner">
        <span class="social-coin__face social-coin__face--front${frontModifier}" aria-hidden="true">${front}</span>
        <span class="social-coin__edge" aria-hidden="true"></span>
        <span class="social-coin__face social-coin__face--back" aria-hidden="true">${back}</span>
      </span>
    </a>
  </li>`;
}

function renderGroupTitle(title) {
  return `<p class="social-coins__title"><span class="dg-lang" data-lang="pt">${escapeHtml(
    title.pt
  )}</span><span class="dg-lang" data-lang="en">${escapeHtml(title.en)}</span></p>`;
}

function renderSocialCoins(profiles = PROFILES, options = {}) {
  const avatarExists = options.avatarExists || defaultAvatarExists;
  const groups = options.groups || GROUPS;

  const sections = groups
    .map((group) => {
      const members = profiles.filter((profile) => profile.group === group.id);
      if (members.length === 0) return null;
      const items = members.map((profile) => renderCoin(profile, avatarExists)).join("\n");
      return `<div class="social-coins-group">\n  ${renderGroupTitle(
        group.title
      )}\n  <ul class="social-coins">\n${items}\n  </ul>\n</div>`;
    })
    .filter(Boolean)
    .join("\n");

  return `${sections}\n`;
}

function socialCoinsPlugin(md) {
  function coinContainer(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const lineText = state.src.slice(pos, max).trim();

    if (lineText !== MARKER) return false;
    if (silent) return true;

    const token = state.push("social_coins", "", 0);
    token.block = true;
    token.map = [startLine, startLine + 1];

    state.line = startLine + 1;
    return true;
  }

  md.block.ruler.before("fence", "social_coins", coinContainer, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules.social_coins = () => renderSocialCoins(PROFILES);
}

module.exports = { socialCoinsPlugin, renderSocialCoins, MARKER };
