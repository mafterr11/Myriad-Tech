import IntroCleanup from "./IntroCleanup";

// The intro is server-rendered and animated with plain CSS on purpose. Anything
// driven by framer-motion could only start once React had hydrated, which on a
// cold load is long after the first paint -- the hero would flash, then get
// covered. Rendering the panel in the HTML and running the keyframes straight
// away means the visitor never sees the page underneath before the reveal.
//
// The hero itself is untouched, so it still paints behind the panel and stays
// the LCP candidate; the panel is a separate fixed layer on top of it.
//
// The boot script must not add or remove a single node: everything below the
// <body> tag belongs to React, and deleting the panel from the DOM before
// hydration broke it outright -- React then failed to reconcile, threw
// `insertBefore`/`removeChild` NotFoundErrors on the next route change and made
// Next fall back to a full page load. So the script only ever sets one class on
// <html>, and CSS decides whether the panel is displayed at all.
const BOOT_SCRIPT = `(function(){
  try {
    if (location.pathname.indexOf('/admin') !== -1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('mt-intro-seen') === '1') return;
    sessionStorage.setItem('mt-intro-seen', '1');
  } catch (e) {
    return;
  }
  document.documentElement.classList.add('intro-active');
})();`;

const IntroOverlay = () => {
  return (
    <>
      <div id="intro-overlay" className="intro-overlay" aria-hidden="true">
        <div className="intro-inner">
          <div className="intro-mark">
            <span className="intro-petal intro-petal-corner" />
            <span className="intro-petal intro-petal-centre" />
            <span className="intro-petal intro-petal-centre" />
            <span className="intro-petal intro-petal-corner" />
            <span className="intro-dot" />
          </div>
          <div className="intro-word">
            <span className="intro-word-line">Myriad Tech</span>
            <span className="intro-rule" />
            <span className="intro-tagline">
              Web Development &middot; Design &middot; SEO
            </span>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <IntroCleanup />
    </>
  );
};

export default IntroOverlay;
