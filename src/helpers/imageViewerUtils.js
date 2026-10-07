const VIEWER_MARKER = ":::dg-viewer";
const LANG_BLOCK_RE = /^:::lang\s+(pt|en)\s*$/i;
const LANG_CLOSE_RE = /^:::\s*$/;
const MD_IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/;

function isImageViewerEnabled(frontMatter) {
  if (!frontMatter || typeof frontMatter !== "object") return false;
  const noteProps = frontMatter["dg-note-properties"] || {};
  if (Object.prototype.hasOwnProperty.call(noteProps, "dgShowImageViewer")) {
    return !!noteProps.dgShowImageViewer;
  }
  if (Object.prototype.hasOwnProperty.call(frontMatter, "dgShowImageViewer")) {
    return !!frontMatter.dgShowImageViewer;
  }
  return false;
}

/**
 * Remove all complete `:::dg-viewer ... :::dg-viewer` regions from a note body.
 * Reuses the same open/close marker semantics as findViewerRegion, so card
 * metadata extraction can ignore viewer presentation content. Unmatched
 * markers are left in place rather than dropped.
 */
function stripViewerRegions(source) {
  const lines = String(source || "").split(/\r?\n/);
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === VIEWER_MARKER) {
      let close = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === VIEWER_MARKER) {
          close = j;
          break;
        }
      }
      if (close === -1) {
        out.push(lines[i]);
        i++;
      } else {
        i = close + 1;
      }
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join("\n");
}

function findViewerRegion(source) {
  const lines = source.split(/\r?\n/);
  let startLine = -1;
  let endLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === VIEWER_MARKER) {
      if (startLine === -1) {
        startLine = i;
      } else {
        endLine = i;
        break;
      }
    }
  }
  if (startLine === -1 || endLine === -1 || endLine <= startLine) {
    return null;
  }
  return {
    startLine,
    endLine,
    regionLines: lines.slice(startLine + 1, endLine),
  };
}

function parseViewerRegion(regionLines) {
  const figures = [];
  let currentFigure = null;
  let currentLang = null;
  let currentLangLines = [];

  function flushLang() {
    if (currentFigure && currentLang) {
      currentFigure.captions[currentLang] = currentLangLines.join("\n").trim();
    }
    currentLang = null;
    currentLangLines = [];
  }

  for (const line of regionLines) {
    const trimmed = line.trim();

    const langMatch = LANG_BLOCK_RE.exec(trimmed);
    if (langMatch) {
      flushLang();
      currentLang = langMatch[1].toLowerCase();
      currentLangLines = [];
      continue;
    }

    if (LANG_CLOSE_RE.test(trimmed) && currentLang) {
      flushLang();
      continue;
    }

    const imgMatch = MD_IMAGE_RE.exec(trimmed);
    if (imgMatch) {
      flushLang();
      currentFigure = {
        src: imgMatch[2],
        alt: imgMatch[1],
        captions: { pt: "", en: "" },
      };
      figures.push(currentFigure);
      continue;
    }

    if (currentLang) {
      currentLangLines.push(line);
    }
  }

  flushLang();
  return figures;
}

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildViewerHtml(figures, renderMarkdown) {
  if (!figures || figures.length === 0) return "";

  const total = figures.length;
  let slidesHtml = "";
  let captionsHtml = "";

  for (let i = 0; i < total; i++) {
    const fig = figures[i];
    const loading = i === 0 ? "eager" : "lazy";
    const fetchpriority = i === 0 ? ' fetchpriority="high"' : "";
    slidesHtml +=
      `<div class="dg-image-viewer__slide" data-slide-index="${i}"${i > 0 ? " hidden" : ""}>` +
      `<img src="${escapeHtmlAttr(fig.src)}" alt="${escapeHtmlAttr(fig.alt)}" loading="${loading}"${fetchpriority} />` +
      `</div>\n`;

    let captionBlockHtml = "";
    for (const lang of ["pt", "en"]) {
      const raw = fig.captions[lang] || "";
      const html = raw ? renderMarkdown(raw) : "";
      if (html) {
        captionBlockHtml += `<div class="dg-lang" data-lang="${lang}">${html}</div>\n`;
      }
    }
    if (!captionBlockHtml && fig.alt) {
      captionBlockHtml =
        `<div class="dg-lang" data-lang="pt">${escapeHtmlText(fig.alt)}</div>` +
        `<div class="dg-lang" data-lang="en">${escapeHtmlText(fig.alt)}</div>`;
    }

    captionsHtml +=
      `<div class="dg-image-viewer__caption-block" data-caption-index="${i}"${i > 0 ? " hidden" : ""}>` +
      captionBlockHtml +
      `</div>\n`;
  }

  return (
    `<section class="dg-image-viewer" data-dg-viewer tabindex="0" role="group" aria-roledescription="image viewer" aria-label="Image viewer" aria-keyshortcuts="ArrowLeft ArrowRight Home End">` +
    `<button class="dg-image-viewer__back" type="button">` +
    `<span class="dg-image-viewer__btn-label" data-title-pt="Voltar" data-title-en="Back">Voltar</span>` +
    `</button>` +
    `<div class="dg-image-viewer__stage">${slidesHtml}` +
    `<button class="dg-image-viewer__prev" type="button" disabled aria-disabled="true">` +
    `<span class="dg-image-viewer__btn-label" data-title-pt="Anterior" data-title-en="Previous">Previous</span>` +
    `</button>` +
    `<button class="dg-image-viewer__next" type="button"${total <= 1 ? ' disabled aria-disabled="true"' : ""}>` +
    `<span class="dg-image-viewer__btn-label" data-title-pt="Próxima" data-title-en="Next">Next</span>` +
    `</button>` +
    `</div>` +
    `<div class="dg-image-viewer__caption" aria-live="polite">${captionsHtml}</div>` +
    `<div class="dg-image-viewer__counter" aria-live="polite">` +
    `<span data-counter-pt=" de " data-counter-en=" of ">1 / ${total}</span>` +
    `</div>` +
    `</section>`
  );
}

function renderStaticHtml(regionLines, renderMarkdown) {
  return renderMarkdown(regionLines.join("\n"));
}

module.exports = {
  VIEWER_MARKER,
  isImageViewerEnabled,
  findViewerRegion,
  stripViewerRegions,
  parseViewerRegion,
  buildViewerHtml,
  renderStaticHtml,
  escapeHtmlAttr,
  escapeHtmlText,
};
