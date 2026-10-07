const {
  isImageViewerEnabled,
  buildViewerHtml,
} = require("./imageViewerUtils");
const {
  COMBO_MARKER,
  collectImageCombos,
  buildCombosMarkdown,
} = require("./imageComboUtils");

/**
 * markdown-it plugin for the `:::display-image-combo` marker.
 *
 * The marker is a self-closing single-line block (no ":::" closing fence, for
 * the same reason as `:::social-coins`: the lang fence scanner does not track
 * nesting). It expands to an image viewer populated from the "image + >desc"
 * combos found in the Drawings & Life Logs notes, ordered by navOrder.
 */
function imageComboPlugin(md) {
  function comboContainer(state, startLine, endLine, silent) {
    const pos = state.bMarks[startLine] + state.tShift[startLine];
    const max = state.eMarks[startLine];
    const lineText = state.src.slice(pos, max).trim();

    if (lineText !== COMBO_MARKER) return false;
    if (silent) return true;

    const token = state.push("display_image_combo", "", 0);
    token.block = true;
    token.map = [startLine, startLine + 1];
    token.meta = { enabled: isImageViewerEnabled(state.env || {}) };

    state.line = startLine + 1;
    return true;
  }

  md.block.ruler.before("fence", "display_image_combo", comboContainer, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules.display_image_combo = (tokens, idx) => {
    const figures = collectImageCombos();
    if (figures.length === 0) return "";

    if (!tokens[idx].meta.enabled) {
      return md.render(buildCombosMarkdown(figures));
    }
    return buildViewerHtml(figures, (src) => md.render(src));
  };
}

module.exports = { imageComboPlugin };
