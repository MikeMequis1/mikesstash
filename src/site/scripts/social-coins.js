/* SocialCoin interaction.
 *
 * Pointer devices: the flip is pure CSS (:hover / :focus-visible) and the link
 * navigates natively.
 *
 * Touch devices (no hover): the first tap reveals the back face and suppresses
 * navigation; tapping the already-flipped coin follows the link. This keeps the
 * back face discoverable without hijacking the link permanently. Only one coin
 * stays flipped at a time.
 */
(function () {
  var LINK = ".social-coin__link";
  var FLIPPED = "true";

  var noHover = window.matchMedia("(hover: none)");

  function currentLang() {
    return document.body.classList.contains("lang-en") ? "en" : "pt";
  }

  function applyLabels() {
    var lang = currentLang();
    document.querySelectorAll(LINK).forEach(function (link) {
      var label = link.getAttribute("data-label-" + lang);
      if (label) link.setAttribute("aria-label", label);
      var tip = link.getAttribute("data-tooltip-" + lang);
      if (tip) link.setAttribute("data-tooltip", tip);
    });
  }

  function onActivate(event) {
    if (!noHover.matches) return; // pointer: let CSS + native navigation work

    var link = event.currentTarget;
    if (link.getAttribute("data-flipped") === FLIPPED) return; // second tap: navigate

    event.preventDefault();
    document.querySelectorAll(LINK + '[data-flipped="' + FLIPPED + '"]').forEach(function (other) {
      if (other !== link) other.removeAttribute("data-flipped");
    });
    link.setAttribute("data-flipped", FLIPPED);
  }

  function init() {
    applyLabels();
    document.querySelectorAll(LINK).forEach(function (link) {
      link.addEventListener("click", onActivate);
    });
    new MutationObserver(applyLabels).observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
