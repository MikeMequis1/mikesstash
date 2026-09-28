/**
 * Social profile data for the SocialCoin component.
 *
 * This module is intentionally markup-free: it describes the profiles that the
 * renderer (src/helpers/socialCoins.js) and the maintenance fetch script
 * (scripts/fetch-social-assets.mjs) consume. Adding a platform is a data-only
 * change here.
 *
 * `group` selects which labeled row the profile appears in (see GROUPS).
 *
 * `source` describes where the maintenance script can fetch the avatar:
 *   - { kind: "direct", url }   plain image URL
 *   - { kind: "steam", url }    Steam community XML profile (avatarFull)
 *   - { kind: "gog", url }      GOG profile page (scrape the avatar CDN URL)
 *   - { kind: "exophase", url } Exophase profile page (og:image)
 *   - { kind: "bluesky", url }  Bluesky public getProfile API (avatar)
 *   - null                      not fetchable; the avatar is supplied manually
 *
 * `icon` is a Simple Icons slug (rendered from /img/social/icons/<slug>.svg).
 * `iconSrc` is an explicit icon path (e.g. a user-supplied PNG/JPEG) that takes
 * precedence over `icon`. When neither is set the back face falls back to
 * `monogram` in the platform color.
 */

const GROUPS = [
  { id: "games", title: { pt: "Jogos", en: "Games" } },
  { id: "socials", title: { pt: "Redes sociais", en: "Socials" } },
];

const PROFILES = [
  {
    id: "exophase",
    group: "games",
    name: { pt: "Exophase", en: "Exophase" },
    url: "https://www.exophase.com/user/MikeMequis1/",
    avatar: "/img/social/avatars/exophase.jpg",
    icon: null,
    iconSrc: "/img/social/avatars/exophase-icon.jpg",
    monogram: "EX",
    color: "#2884af",
    label: {
      pt: "Perfil de MikeMequis1 no Exophase",
      en: "MikeMequis1 on Exophase",
    },
    source: {
      kind: "exophase",
      url: "https://www.exophase.com/user/MikeMequis1/",
    },
  },
  {
    id: "retroachievements",
    group: "games",
    name: { pt: "RetroAchievements", en: "RetroAchievements" },
    url: "https://retroachievements.org/user/MikeMequis1",
    avatar: "/img/social/avatars/retroachievements.png",
    icon: "retroachievements",
    monogram: null,
    color: "#1065DF",
    label: {
      pt: "Perfil de MikeMequis1 no RetroAchievements",
      en: "MikeMequis1 on RetroAchievements",
    },
    source: {
      kind: "direct",
      url: "https://media.retroachievements.org/UserPic/MikeMequis1.png",
    },
  },
  {
    id: "gog",
    group: "games",
    name: { pt: "GOG", en: "GOG" },
    url: "https://www.gog.com/u/MikeMequis1",
    avatar: "/img/social/avatars/gog.jpg",
    icon: "gogdotcom",
    monogram: null,
    color: "#86328A",
    label: {
      pt: "Perfil de MikeMequis1 na GOG",
      en: "MikeMequis1 on GOG",
    },
    source: { kind: "gog", url: "https://www.gog.com/u/MikeMequis1" },
  },
  {
    id: "stash-games",
    group: "games",
    name: { pt: "Stash Games", en: "Stash Games" },
    url: "https://stash.games/users/MikeMequis1",
    avatar: "/img/social/avatars/stash.jpg",
    icon: null,
    iconSrc: "/img/social/avatars/stash-icon.png",
    monogram: "S",
    color: "#000000",
    label: {
      pt: "Perfil de MikeMequis1 no Stash Games",
      en: "MikeMequis1 on Stash Games",
    },
    source: null,
  },
  {
    id: "steam",
    group: "games",
    name: { pt: "Steam", en: "Steam" },
    url: "https://steamcommunity.com/id/MarseloII/",
    avatar: "/img/social/avatars/steam.jpg",
    icon: "steam",
    monogram: null,
    color: "#1B2838",
    label: {
      pt: "Perfil de MarseloII no Steam",
      en: "MarseloII on Steam",
    },
    source: {
      kind: "steam",
      url: "https://steamcommunity.com/id/MarseloII/?xml=1",
    },
  },
  {
    id: "linkedin",
    group: "socials",
    name: { pt: "LinkedIn", en: "LinkedIn" },
    url: "https://www.linkedin.com/in/marcelo-m-medeiros/",
    avatar: "/img/social/avatars/linkedin.jpg",
    icon: null,
    monogram: "in",
    color: "#0A66C2",
    label: {
      pt: "Perfil de Marcelo Medeiros no LinkedIn",
      en: "Marcelo Medeiros on LinkedIn",
    },
    source: null,
  },
  {
    id: "github",
    group: "socials",
    name: { pt: "GitHub", en: "GitHub" },
    url: "https://github.com/MikeMequis1",
    avatar: "/img/social/avatars/github.jpg",
    icon: "github",
    monogram: null,
    color: "#181717",
    label: {
      pt: "Perfil de MikeMequis1 no GitHub",
      en: "MikeMequis1 on GitHub",
    },
    source: { kind: "direct", url: "https://github.com/MikeMequis1.png" },
  },
  {
    id: "bluesky",
    group: "socials",
    name: { pt: "Bluesky", en: "Bluesky" },
    url: "https://bsky.app/profile/mikemequis1.bsky.social",
    avatar: "/img/social/avatars/bluesky.jpg",
    icon: "bluesky",
    monogram: null,
    color: "#0285FF",
    label: {
      pt: "Perfil de MikeMequis1 no Bluesky",
      en: "MikeMequis1 on Bluesky",
    },
    source: {
      kind: "bluesky",
      url: "https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=mikemequis1.bsky.social",
    },
  },
  {
    id: "lastfm",
    group: "socials",
    name: { pt: "Last.fm", en: "Last.fm" },
    url: "https://www.last.fm/pt/user/Hales600",
    avatar: "/img/social/avatars/lastfm.jpg",
    icon: "lastdotfm",
    monogram: null,
    color: "#D51007",
    label: {
      pt: "Perfil de Hales600 no Last.fm",
      en: "Hales600 on Last.fm",
    },
    source: null,
  },
  {
    id: "discord",
    group: "socials",
    name: { pt: "Discord", en: "Discord" },
    url: "https://discord.com/users/632674116612259873",
    avatar: "/img/social/avatars/discord.jpg",
    icon: "discord",
    monogram: "D",
    color: "#5865F2",
    label: {
      pt: "Perfil de MikeMequis1 no Discord",
      en: "MikeMequis1 on Discord",
    },
    source: null,
  },
];

module.exports = { PROFILES, GROUPS };
