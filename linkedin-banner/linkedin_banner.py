#!/usr/bin/env python3
"""LinkedIn profile-banner generator for mikesstash.com.br.

This renders a LinkedIn cover image that reuses the visual identity of the
site's *dark* theme, without modifying the site itself.

Identity translated from the theme (see src/site/styles/custom/_theme-dark.scss
and _palette.scss):

  * near-black background (#000) with green radial glows and a soft vertical
    gradient that fades to deep green at the edges;
  * Xbox-green accent (--xbox-green #9bcf00) and bright green (#b8e62e);
  * sharp, square "terminal" panels: 2px green strokes with radius 0;
  * JetBrains Mono typography;
  * code-syntax colours sampled from the theme's code palette.

The script is self-contained and depends only on Pillow.

Typography
----------
The site's text face is "JetBrains Mono". If that font is not installed the
script falls back to another monospace face (Cascadia Mono, Consolas,
DejaVu Sans Mono, Courier New). Install JetBrains Mono for a pixel-exact
match: https://www.jetbrains.com/lp/mono/ . A custom face can also be given
with --font (regular) and --font-bold (bold variant).

Render pipeline
---------------
Everything is drawn at `scale`x resolution and downsampled with LANCZOS,
which gives clean antialiasing for shapes and text.
"""

from __future__ import annotations

import argparse
import random
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, List, Sequence, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont

RGB = Tuple[int, int, int]
RGBA = Tuple[int, int, int, int]


# --------------------------------------------------------------------------- #
# Colours (sampled from the dark theme)
# --------------------------------------------------------------------------- #
COLORS = {
    "black": (0, 0, 0),
    "bg_top": (12, 22, 12),
    "bg_bottom": (8, 16, 8),
    "green": (155, 207, 0),          # --xbox-green
    "green_bright": (184, 230, 46),  # --xbox-green-bright
    "green_dim": (74, 122, 18),      # --xbox-green-dim
    "green_deep": (45, 74, 10),      # --xbox-green-deep
    "glow_tl": (74, 122, 18),
    "glow_br": (48, 96, 0),
    "text": (242, 242, 242),         # --text-normal / --theme-heading
    "text_em": (216, 216, 216),      # --theme-text-em
    "muted": (168, 168, 168),        # --text-muted
    "faint": (106, 106, 106),        # --text-faint
    "code_comment": (106, 122, 88),
    "code_string": (198, 232, 106),
    "code_number": (155, 207, 0),
    "code_func": (212, 245, 106),
    "code_punct": (138, 154, 120),
}

# Token colour keys used inside the terminal card.
TOKEN = {
    "comment": COLORS["code_comment"],
    "keyword": COLORS["green_bright"],
    "func": COLORS["code_func"],
    "string": COLORS["code_string"],
    "punct": COLORS["code_punct"],
    "num": COLORS["code_number"],
    "plain": COLORS["text_em"],
}


# --------------------------------------------------------------------------- #
# Content (edit freely)
# --------------------------------------------------------------------------- #
@dataclass
class Content:
    name: str = "Marcelo Mendonça Medeiros"
    role: str = "Engenheiro de Computação · Desenvolvedor .NET"
    prompt: str = "marcelo@mikesstash:~$"
    site: str = "mikesstash.com.br"

    # Short, balanced skill chips. Kept to two visual rows so the list never
    # reads like a wall of technologies.
    skill_rows: List[List[str]] = field(
        default_factory=lambda: [
            [".NET", "C#", "Software Engineering"],
            ["Tooling & Runtime", "Linux · Cross-platform"],
        ]
    )

    card_title: str = "marcelo.cs"
    # (text, token-key) segments, one list per line.
    card_lines: List[List[Tuple[str, str]]] = field(
        default_factory=lambda: [
            [("// software · systems · tooling", "comment")],
            [("class ", "keyword"), ("Engineer", "func"), (" {", "punct")],
            [
                ("  stack   = ", "plain"),
                ('[".NET", "C#"]', "string"),
                (";", "punct"),
            ],
            [
                ("  runtime = ", "plain"),
                ('"linux · windows"', "string"),
                (";", "punct"),
            ],
            [("}", "punct")],
        ]
    )


# --------------------------------------------------------------------------- #
# Layout / style configuration
# --------------------------------------------------------------------------- #
@dataclass
class Style:
    width: int = 1584           # LinkedIn cover, desktop
    height: int = 396
    scale: int = 2              # supersampling factor

    margin_x: int = 430         # left text margin: clears the LinkedIn photo
    margin_top: int = 0

    # Terminal card on the right.
    card_w: int = 360
    card_h: int = 200
    card_margin_right: int = 96
    card_pad: int = 20
    card_radius: int = 0        # the theme uses square corners everywhere

    # Typography sizes (design pixels).
    name_size: int = 46
    name_min_size: int = 32
    role_size: int = 22
    prompt_size: int = 19
    site_size: int = 20
    chip_size: int = 17
    chip_h: int = 32
    chip_pad_x: int = 15
    chip_gap: int = 12
    card_title_size: int = 15
    code_size: int = 15
    code_line_h: int = 24

    # Vertical rhythm (design pixels).
    gap_prompt_name: int = 8
    gap_name_role: int = 8
    gap_role_chips: int = 20
    gap_chips_rows: int = 10
    gap_chips_site: int = 16

    # Decorations.
    accent_bar_w: int = 3
    accent_bar_gap: int = 18
    graph_nodes: int = 13
    graph_seed: int = 7
    graph_zone: Tuple[float, float] = (0.72, 0.99)  # x-range fraction
    glow_tl_alpha: int = 150
    glow_br_alpha: int = 120

    @property
    def card_x(self) -> int:
        return self.width - self.card_margin_right - self.card_w

    @property
    def card_y(self) -> int:
        return (self.height - self.card_h) // 2

    @property
    def max_name_w(self) -> int:
        return self.card_x - self.margin_x - 40


# --------------------------------------------------------------------------- #
# Font resolution
# --------------------------------------------------------------------------- #
def _font_dirs() -> List[Path]:
    dirs: List[Path] = [
        Path(__file__).resolve().parent / "fonts",
        Path.cwd() / "fonts",
    ]
    import os

    env = os.environ.get("BANNER_FONT_DIR")
    if env:
        dirs.insert(0, Path(env))
    # Common system locations (Windows / Linux / macOS).
    dirs += [
        Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts",
        Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/Windows/Fonts",
        Path("/usr/share/fonts"),
        Path("/usr/local/share/fonts"),
        Path.home() / ".fonts",
        Path("/Library/Fonts"),
        Path("/System/Library/Fonts"),
        Path.home() / "Library/Fonts",
    ]
    return [d for d in dirs if d and d.is_dir()]


# (regular, bold) filename pairs, in priority order.
_FONT_PAIRS: Sequence[Tuple[str, str | None]] = (
    ("JetBrainsMono-Regular.ttf", "JetBrainsMono-Bold.ttf"),
    ("JetBrainsMono-Regular.ttf", None),
    ("CascadiaMono.ttf", None),
    ("CascadiaCode.ttf", None),
    ("consola.ttf", "consolab.ttf"),
    ("DejaVuSansMono.ttf", "DejaVuSansMono-Bold.ttf"),
    ("cour.ttf", "courbd.ttf"),
)


def _find_first(name: str) -> Path | None:
    for d in _font_dirs():
        candidate = d / name
        if candidate.is_file():
            return candidate
        # Some Linux/macOS installs nest fonts in subdirectories.
        for nested in d.rglob(name):
            if nested.is_file():
                return nested
    return None


class Fonts:
    """Loads a regular face and (when available) a true bold variant."""

    def __init__(self, regular: Path, bold: Path | None, scale: int):
        self.regular_path = regular
        self.bold_path = bold
        self.scale = scale
        self.faux_bold = bold is None
        self._cache: dict[Tuple[int, bool], ImageFont.FreeTypeFont] = {}

    @classmethod
    def resolve(cls, regular: Path | None, bold: Path | None, scale: int) -> "Fonts":
        if regular is None:
            for reg_name, bold_name in _FONT_PAIRS:
                reg = _find_first(reg_name)
                if reg:
                    bld = _find_first(bold_name) if bold_name else None
                    regular, bold = reg, bld
                    break
        if regular is None:
            raise SystemExit(
                "No usable monospace font found. Install JetBrains Mono "
                "(https://www.jetbrains.com/lp/mono/) or pass --font."
            )
        if bold is None and regular is not None:
            # Try a sibling bold file next to an explicitly supplied regular.
            sibling = regular.with_name(regular.stem + "-Bold" + regular.suffix)
            if sibling.is_file():
                bold = sibling
        return cls(regular, bold, scale)

    def get(self, size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
        key = (size, bold)
        cached = self._cache.get(key)
        if cached is not None:
            return cached
        path = self.bold_path if (bold and self.bold_path) else self.regular_path
        font = ImageFont.truetype(str(path), max(1, int(round(size * self.scale))))
        if bold and self.bold_path is None:
            # Variable fonts (Cascadia) expose a wght axis; try it, ignore if
            # unsupported (we then fake weight with a stroke).
            try:
                font.set_variation_by_name("Bold")
                self.faux_bold = False
            except Exception:
                pass
        self._cache[key] = font
        return font


# --------------------------------------------------------------------------- #
# Drawing helpers
# --------------------------------------------------------------------------- #
def lerp(a: int, b: int, t: float) -> int:
    return int(round(a + (b - a) * t))


def mix(c1: RGB, c2: RGB, t: float) -> RGB:
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def vertical_gradient(size: Tuple[int, int], stops: Sequence[Tuple[float, RGB]]) -> Image.Image:
    """Build a vertical gradient image from (position, colour) stops."""
    w, h = size
    column = Image.new("RGB", (1, h))
    px = column.load()
    for y in range(h):
        t = y / max(1, h - 1)
        lo = stops[0]
        hi = stops[-1]
        for i in range(len(stops) - 1):
            if stops[i][0] <= t <= stops[i + 1][0]:
                lo, hi = stops[i], stops[i + 1]
                break
        span = (hi[0] - lo[0]) or 1.0
        local = (t - lo[0]) / span
        px[0, y] = mix(lo[1], hi[1], local)
    return column.resize(size)


def add_glow(base: Image.Image, center, radii, color: RGB, alpha: int, blur: float) -> Image.Image:
    """Composite a soft elliptical glow onto an RGBA image."""
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    rx, ry = radii
    d.ellipse(
        [center[0] - rx, center[1] - ry, center[0] + rx, center[1] + ry],
        fill=(*color, alpha),
    )
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(base, layer)


def build_background(style: Style) -> Image.Image:
    s = style.scale
    size = (style.width * s, style.height * s)

    base = vertical_gradient(
        size,
        [
            (0.0, COLORS["bg_top"]),
            (0.38, COLORS["black"]),
            (0.62, COLORS["black"]),
            (1.0, COLORS["bg_bottom"]),
        ],
    ).convert("RGBA")

    base = add_glow(
        base,
        (size[0] * 0.06, -size[1] * 0.10),
        (size[0] * 0.42, size[1] * 0.95),
        COLORS["glow_tl"],
        style.glow_tl_alpha,
        blur=90 * s,
    )
    base = add_glow(
        base,
        (size[0] * 1.02, size[1] * 1.05),
        (size[0] * 0.38, size[1] * 0.85),
        COLORS["glow_br"],
        style.glow_br_alpha,
        blur=90 * s,
    )
    return base


def draw_node_graph(base: Image.Image, style: Style) -> Image.Image:
    """Faint node graph on the right, echoing the site's local graph."""
    s = style.scale
    w, h = base.size
    rng = random.Random(style.graph_seed)
    x0, x1 = style.graph_zone
    pts = [
        (rng.uniform(w * x0, w * x1), rng.uniform(h * 0.04, h * 0.96))
        for _ in range(style.graph_nodes)
    ]

    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def dist(a, b):
        return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

    for i, a in enumerate(pts):
        neighbours = sorted(
            (j for j in range(len(pts)) if j != i),
            key=lambda j: dist(a, pts[j]),
        )[:2]
        for j in neighbours:
            d.line([a, pts[j]], fill=(*COLORS["green_dim"], 40), width=max(1, s))
    for a in pts:
        r = 3 * s
        d.rectangle([a[0] - r, a[1] - r, a[0] + r, a[1] + r],
                    fill=(*COLORS["green"], 75))

    return Image.alpha_composite(base, layer)


def apply_text_glow(target: Image.Image, xy, text, font, glow_color: RGB, alpha: int, blur: float) -> None:
    """Composite a blurred copy of `text` under the crisp text on `target`."""
    layer = Image.new("RGBA", target.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).text(xy, text, font=font, fill=(*glow_color, alpha), anchor="lt")
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    target.alpha_composite(layer)


def draw_line_of_segments(draw, x, y, segments, font, s):
    for text, key in segments:
        color = TOKEN.get(key, COLORS["text_em"])
        draw.text((x, y), text, font=font, fill=(*color, 255), anchor="lt")
        x += draw.textlength(text, font=font)
    return x


# --------------------------------------------------------------------------- #
# Components
# --------------------------------------------------------------------------- #
def draw_terminal_card(fg: Image.Image, style: Style, fonts: Fonts, content: Content):
    s = style.scale
    pad = style.card_pad * s
    x = style.card_x * s
    y = style.card_y * s
    w = style.card_w * s
    h = style.card_h * s

    d = ImageDraw.Draw(fg)
    d.rectangle(
        [x, y, x + w, y + h],
        fill=(0, 0, 0, 190),
        outline=(*COLORS["green"], 150),
        width=2 * s,
    )

    # Title bar: square "dot" (the theme has no rounded corners) + filename.
    dot = 9 * s
    d.rectangle([x + pad, y + pad + 2 * s, x + pad + dot, y + pad + dot + 2 * s],
                fill=(*COLORS["green_bright"], 255))
    d.text(
        (x + pad + dot + 12 * s, y + pad - 2 * s),
        content.card_title,
        font=fonts.get(style.card_title_size, bold=True),
        fill=(*COLORS["muted"], 255),
        anchor="lt",
    )

    header_y = y + pad + dot + 14 * s
    d.line([x + pad, header_y, x + w - pad, header_y],
           fill=(*COLORS["green"], 70), width=max(1, s))

    # Code block.
    code_font = fonts.get(style.code_size, bold=False)
    cy = header_y + 14 * s
    for segments in content.card_lines:
        draw_line_of_segments(d, x + pad, cy, segments, code_font, s)
        cy += style.code_line_h * s


def draw_chip(draw, x, y, text, font, style, s) -> int:
    h = style.chip_h * s
    pad = style.chip_pad_x * s
    tw = draw.textlength(text, font=font)
    w = tw + 2 * pad
    draw.rectangle(
        [x, y, x + w, y + h],
        fill=(0, 0, 0, 150),
        outline=(*COLORS["green_dim"], 220),
        width=max(1, s),
    )
    draw.text((x + pad, y + h / 2), text, font=font, fill=(*COLORS["green_bright"], 255), anchor="lm")
    return w


def draw_left_block(fg: Image.Image, style: Style, fonts: Fonts, content: Content) -> None:
    s = style.scale
    d = ImageDraw.Draw(fg)
    x = style.margin_x * s

    prompt_font = fonts.get(style.prompt_size, bold=False)

    # ---- Name (auto-fit to the available width, bold + green glow) ----
    name_size = style.name_size
    name_font = fonts.get(name_size, bold=True)
    while name_size > style.name_min_size and d.textlength(content.name, font=name_font) > style.max_name_w * s:
        name_size -= 2
        name_font = fonts.get(name_size, bold=True)
    name_w = d.textlength(content.name, font=name_font)

    role_font = fonts.get(style.role_size, bold=True)
    site_font = fonts.get(style.site_size, bold=False)

    # ---- Compute total stack height, then centre it vertically ----
    prompt_h = style.prompt_size * 1.5
    name_h = name_size * 1.28
    role_h = style.role_size * 1.4
    chip_rows_h = len(content.skill_rows) * style.chip_h + (len(content.skill_rows) - 1) * style.gap_chips_rows
    site_h = style.site_size * 1.5

    total = (
        prompt_h + style.gap_prompt_name
        + name_h + style.gap_name_role
        + role_h + style.gap_role_chips
        + chip_rows_h + style.gap_chips_site
        + site_h
    )
    top = (style.height * s - total * s) / 2

    # ---- Accent bar (theme's `border-left: 2px` motif) ----
    bar_x = (style.margin_x - style.accent_bar_gap) * s
    bar_top = top
    bar_bottom = top + total * s
    d.rectangle([bar_x, bar_top, bar_x + style.accent_bar_w * s, bar_bottom],
                fill=(*COLORS["green"], 235))
    # Bright cap so the bar reads as a live "selection" edge.
    d.rectangle([bar_x, bar_top, bar_x + style.accent_bar_w * s, bar_top + name_h * s],
                fill=(*COLORS["green_bright"], 255))

    y = top

    # ---- Prompt line: user in bright green, ~$ in muted ----
    at = content.prompt.rfind(":~$")
    head, tail = (content.prompt[:at], content.prompt[at:]) if at != -1 else (content.prompt, "")
    cx = x
    d.text((cx, y), head, font=prompt_font, fill=(*COLORS["green"], 255), anchor="lt")
    cx += d.textlength(head, font=prompt_font)
    if tail:
        d.text((cx, y), tail, font=prompt_font, fill=(*COLORS["faint"], 255), anchor="lt")
        cx += d.textlength(tail, font=prompt_font)
    # block cursor
    cur_w = style.prompt_size * 0.55 * s
    d.rectangle([cx + 6 * s, y + 1 * s, cx + 6 * s + cur_w, y + prompt_h * s - 2 * s],
                fill=(*COLORS["green_bright"], 255))
    y += (prompt_h + style.gap_prompt_name) * s

    # ---- Name ----
    apply_text_glow(fg, (x, y), content.name, name_font, COLORS["green"], alpha=130, blur=12 * s)
    d.text((x, y), content.name, font=name_font,
           fill=(*COLORS["text"], 255), anchor="lt")
    y += (name_h + style.gap_name_role) * s

    # ---- Role ----
    d.text((x, y), content.role, font=role_font,
           fill=(*COLORS["green_bright"], 255), anchor="lt")
    y += (role_h + style.gap_role_chips) * s

    # ---- Skill chips (two balanced rows) ----
    chip_font = fonts.get(style.chip_size, bold=False)
    for row in content.skill_rows:
        cx = x
        for skill in row:
            cw = draw_chip(d, cx, y, skill, chip_font, style, s)
            cx += cw + style.chip_gap * s
        y += (style.chip_h + style.gap_chips_rows) * s
    y -= style.gap_chips_rows * s  # last row has no trailing gap
    y += style.gap_chips_site * s

    # ---- Site signature ----
    chevron = "> "
    d.text((x, y), chevron, font=site_font, fill=(*COLORS["faint"], 255), anchor="lt")
    sx = x + d.textlength(chevron, font=site_font)
    d.text((sx, y), content.site, font=site_font, fill=(*COLORS["green_bright"], 255), anchor="lt")
    ul_y = y + style.site_size * 1.35 * s
    d.line([sx, ul_y, sx + d.textlength(content.site, font=site_font), ul_y],
           fill=(*COLORS["green_dim"], 235), width=max(1, s))


# --------------------------------------------------------------------------- #
# Composition
# --------------------------------------------------------------------------- #
def render(style: Style, content: Content, fonts: Fonts) -> Image.Image:
    s = style.scale
    base = build_background(style)
    base = draw_node_graph(base, style)

    fg = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw_left_block(fg, style, fonts, content)
    draw_terminal_card(fg, style, fonts, content)

    composed = Image.alpha_composite(base, fg)
    out = composed.convert("RGB").resize((style.width, style.height), Image.Resampling.LANCZOS)
    return out


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Generate a LinkedIn banner from the mikesstash dark theme.")
    p.add_argument("--out", default=str(Path(__file__).resolve().parent / "output" / "linkedin_banner.png"),
                   help="output PNG path")
    p.add_argument("--width", type=int, default=Style.width)
    p.add_argument("--height", type=int, default=Style.height)
    p.add_argument("--scale", type=int, default=Style.scale, help="supersampling factor (default 2)")
    p.add_argument("--font", default=None, help="path to a regular TTF/OTF")
    p.add_argument("--font-bold", default=None, help="path to a bold TTF/OTF")
    return p.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    style = Style(width=args.width, height=args.height, scale=args.scale)
    content = Content()

    regular = Path(args.font) if args.font else None
    bold = Path(args.font_bold) if args.font_bold else None
    fonts = Fonts.resolve(regular, bold, style.scale)

    img = render(style, content, fonts)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG")

    print(f"Banner:  {out}  ({img.width}x{img.height})")
    print(f"Font:    {fonts.regular_path.name}"
          + (f" + {fonts.bold_path.name}" if fonts.bold_path else " (weight simulated)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
