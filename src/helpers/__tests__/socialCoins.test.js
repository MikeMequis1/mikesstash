import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import markdownIt from "markdown-it";
import { langPlugin } from "../langPlugin.js";
import { socialCoinsPlugin, renderSocialCoins } from "../socialCoins.js";
import { PROFILES, GROUPS } from "../socialProfiles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MINI_BIO = path.join(
  __dirname,
  "..",
  "..",
  "site",
  "notes",
  "About",
  "👤 Mini-bio.md"
);

const EXPECTED_URLS = [
  "https://github.com/MikeMequis1",
  "https://discord.com/users/632674116612259873",
  "https://www.exophase.com/user/MikeMequis1/",
  "https://stash.games/users/MikeMequis1",
  "https://steamcommunity.com/id/MarseloII/",
  "https://www.gog.com/u/MikeMequis1",
  "https://retroachievements.org/user/MikeMequis1",
  "https://www.last.fm/pt/user/Hales600",
  "https://bsky.app/profile/mikemequis1.bsky.social",
  "https://www.linkedin.com/in/marcelo-m-medeiros/",
];

function renderCoins(options = {}) {
  return renderSocialCoins(PROFILES, { avatarExists: () => true, ...options });
}

describe("socialProfiles data", () => {
  it("contains exactly the ten locked profiles", () => {
    expect(PROFILES).toHaveLength(10);
    expect([...PROFILES].map((p) => p.url).sort()).toEqual(
      [...EXPECTED_URLS].sort()
    );
  });

  it("assigns every profile to a declared group", () => {
    const ids = GROUPS.map((g) => g.id);
    expect(ids).toEqual(["games", "socials"]);
    for (const profile of PROFILES) {
      expect(ids).toContain(profile.group);
    }
  });

  it("keeps the Stash Games back black", () => {
    const stash = PROFILES.find((p) => p.id === "stash-games");
    expect(stash.color).toBe("#000000");
  });
});

describe("renderSocialCoins", () => {
  it("renders two labeled groups", () => {
    const html = renderCoins();
    expect((html.match(/class="social-coins-group"/g) || []).length).toBe(2);
    expect(html).toContain('data-lang="pt">Jogos<');
    expect(html).toContain('data-lang="en">Games<');
    expect(html).toContain('data-lang="pt">Redes sociais<');
    expect(html).toContain('data-lang="en">Socials<');
  });

  it("renders all ten coins with external profile links", () => {
    const html = renderCoins();
    expect((html.match(/class="social-coin"/g) || []).length).toBe(10);
    for (const url of EXPECTED_URLS) {
      expect(html).toContain(`href="${url}"`);
    }
    expect((html.match(/rel="noopener noreferrer"/g) || []).length).toBe(10);
    expect((html.match(/target="_blank"/g) || []).length).toBe(10);
  });

  it("uses local avatar paths and never external image URLs", () => {
    const html = renderCoins();
    const imgSrcs = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(
      (m) => m[1]
    );
    expect(imgSrcs.length).toBeGreaterThan(0);
    for (const src of imgSrcs) {
      expect(src.startsWith("/img/social/")).toBe(true);
    }
  });

  it("assigns Simple Icons glyphs to the platforms that have them", () => {
    const html = renderCoins();
    for (const slug of [
      "github",
      "discord",
      "steam",
      "gogdotcom",
      "retroachievements",
      "lastdotfm",
      "bluesky",
    ]) {
      expect(html).toContain(`/img/social/icons/${slug}.svg`);
    }
  });

  it("uses the user-supplied Exophase and Stash logos as raster back faces", () => {
    const html = renderCoins();
    expect(html).toContain('src="/img/social/avatars/exophase-icon.jpg"');
    expect(html).toContain('src="/img/social/avatars/stash-icon.png"');
    expect((html.match(/social-coin__icon--logo/g) || []).length).toBe(2);
  });

  it("assigns a monogram to the platform without a brand icon", () => {
    const html = renderCoins();
    const monograms = [...html.matchAll(/social-coin__monogram[^>]*>([^<]+)</g)].map(
      (m) => m[1]
    );
    expect(monograms).toEqual(["in"]);
  });

  it("exposes a platform tooltip for hover/focus", () => {
    const html = renderCoins();
    expect(html).toContain('data-tooltip="GitHub"');
    expect(html).toContain('data-tooltip-en="Bluesky"');
    expect((html.match(/data-tooltip="/g) || []).length).toBe(10);
  });

  it("includes a coin edge element for 3D thickness", () => {
    const html = renderCoins();
    expect((html.match(/class="social-coin__edge"/g) || []).length).toBe(10);
  });

  it("falls back to a monogram front when an avatar file is missing", () => {
    const html = renderCoins({ avatarExists: () => false });
    expect(html).not.toContain("social-coin__img");
    expect((html.match(/social-coin__face--placeholder/g) || []).length).toBe(10);
  });
});

describe("socialCoinsPlugin inside lang blocks", () => {
  function render(src) {
    const md = markdownIt({ html: true })
      .use(langPlugin)
      .use(socialCoinsPlugin);
    return md.render(src);
  }

  it("renders both groups inside both language sections", () => {
    const html = render(`:::lang pt

:::social-coins

:::

:::lang en

:::social-coins

:::
`);
    expect(html).toContain('<div class="dg-lang" data-lang="pt">');
    expect(html).toContain('<div class="dg-lang" data-lang="en">');
    expect((html.match(/<ul class="social-coins">/g) || []).length).toBe(4);
  });
});

describe("socialCoinsPlugin portfolio variant", () => {
  function render(src) {
    const md = markdownIt({ html: true })
      .use(langPlugin)
      .use(socialCoinsPlugin);
    return md.render(src);
  }

  it("renders only LinkedIn and GitHub, without group headings", () => {
    const html = render(":::social-coins-portfolio\n");
    expect((html.match(/<ul class="social-coins">/g) || []).length).toBe(1);
    expect((html.match(/class="social-coin"/g) || []).length).toBe(2);
    expect(html).toContain(
      'href="https://www.linkedin.com/in/marcelo-m-medeiros/"'
    );
    expect(html).toContain('href="https://github.com/MikeMequis1"');
    expect(html).not.toContain("social-coins-group");
    expect(html).not.toContain("social-coins__title");
    expect(html).not.toContain("exophase");
  });

  it("orders LinkedIn before GitHub", () => {
    const html = render(":::social-coins-portfolio\n");
    expect(html.indexOf("linkedin.com")).toBeLessThan(
      html.indexOf("github.com")
    );
  });
});

describe("Mini-bio content", () => {
  const content = fs.readFileSync(MINI_BIO, "utf8");

  it("uses the social-coins block in both language sections", () => {
    expect((content.match(/:::social-coins/g) || []).length).toBe(2);
  });

  it("no longer contains the old profile links", () => {
    expect(content).not.toMatch(/gitlab\.com/i);
    expect(content).not.toContain("github.com/MikeMequis)");
    expect(content).not.toContain("stash.games/users/HailsGamer");
    expect(content).not.toContain("last.fm");
  });
});
