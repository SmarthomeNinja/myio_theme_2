/* index.js – MyIO Dashboard - Fő modul
   Modulok: utils, storage, cards, sections, renderers, thermo, reorder, settings-modal
   CSS: styles.css (külön betöltendő, vagy ide injektálva)
*/
// Stíluslap betöltése: host + "styles.css"
(() => {
  try {

    const href = host + 'styles.css';

    if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onerror = () => console.error('Nem sikerült betölteni a styles.css fájlt:', href);
      document.head.appendChild(link);
    }
  } catch (e) {
    console.error('Stíluslap betöltése közben hiba történt:', e);
  }
})();
let isDraggingCard = false;

// Dinamikus modul betöltő
(function () {
  const BASE_PATH = document.currentScript?.src?.replace(/index\.js.*$/, '') || '/js/3.5/';

  const modules = [
    'utils.js',
    'storage.js',
    'sections.js',
    'cards.js',
    'renderers.js',
    'thermo.js',
    'reorder.js',
    'settings-modal.js',
    'renderer-chart.js',
    'renderer-helper.js'
  ];

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Ellenőrizzük, hogy már betöltve van-e
      const existing = document.querySelector(`script[src*="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = BASE_PATH + src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Nem sikerült betölteni: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadModules() {
    for (const mod of modules) {
      try {
        await loadScript(mod);
      } catch (e) {
        console.error(e);
      }
    }
  }

  function initDashboard() {
    // Ellenőrizzük, hogy minden szükséges modul betöltve van-e
    if (!window.myioUtils) {
      console.error('myioUtils nem elérhető!');
      return;
    }

    const { $, myioNS } = window.myioUtils;
    const { ensureShell, ensureHeaderMask } = window.myioSections || {};
    const { clearCardFactories } = window.myioCards || {};
    const { renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites, renderZones } = window.myioRenderers || {};
    const { renderThermo } = window.myioThermo || {};
    const { setupSectionReorder, setupCardReorder } = window.myioReorder || {};
    const { setupLongPressHandlers } = window.myioSettingsModal || {};

    function renderAll() {
      if (ensureHeaderMask) ensureHeaderMask();
      document.documentElement.classList.add("myio-noanim");
      if (ensureShell) ensureShell();
      if (clearCardFactories) clearCardFactories();

      const root = $("#myio-root");
      if (!root) {
        console.error('myio-root nem található!');
        return;
      }
      root.innerHTML = "";

      if (renderSensors) try { renderSensors(root); } catch (e) { console.error(e); }
      if (renderThermo) try { renderThermo(root); } catch (e) { console.error(e); }
      if (renderPCA) try { renderPCA(root); } catch (e) { console.error(e); }
      if (renderRelays) try { renderRelays(root); } catch (e) { console.error(e); }
      if (renderFET) try { renderFET(root); } catch (e) { console.error(e); }
      if (renderSwitches) try { renderSwitches(root); } catch (e) { console.error(e); }
      if (renderFavorites) try { renderFavorites(root); } catch (e) { console.error(e); }
      if (renderZones) try { renderZones(root); } catch (e) { console.error(e); }

      if (setupSectionReorder) setupSectionReorder();
      if (setupCardReorder) setupCardReorder();

      if (typeof window.myioApplySavedSectionOrder === "function") window.myioApplySavedSectionOrder();
      if (typeof window.myioApplySavedCardOrder === "function") window.myioApplySavedCardOrder();

      if (!root.children.length && window.myioSections && window.myioCards) {
        const { section, grid } = window.myioSections.makeSection((typeof str_NoDataToDisplay !== "undefined" ? str_NoDataToDisplay : "Nincs megjeleníthető adat"), (typeof str_CheckServerVars !== "undefined" ? str_CheckServerVars : "Ellenőrizd a szerver változókat"));
        const c = window.myioCards.card((typeof str_Tips !== "undefined" ? str_Tips : "Tippek"), "myio-off", "tips:0");
        window.myioCards.addValue(c, "—");
        grid.append(c);
        root.append(section);
      }

      requestAnimationFrame(() => document.documentElement.classList.remove("myio-noanim"));

      try { window.onpageshow = () => window.scrollTo(window.scrollX, window.scrollY); } catch { }
      try { if (typeof enableThumbOnlyRanges === "function") enableThumbOnlyRanges(document); } catch { }
      try { if (typeof myioRO !== "undefined" && myioRO) myioRO.observe(document.body); } catch { }

      if (setupLongPressHandlers) setupLongPressHandlers();


    }

    // Fullscreen logika – csak mobil eszközökön (érintőképernyő + kis kijelző)
    // A requestFullscreen() user gesture-t igényel, ezért egy gombot mutatunk
    function isMobileDevice() {
      return navigator.maxTouchPoints > 0 && window.screen.width <= 1024;
    }

    let fsBtn = null;
    function getFsBtn() {
      if (fsBtn) return fsBtn;
      fsBtn = document.createElement("button");
      fsBtn.textContent = "⛶";
      Object.assign(fsBtn.style, {
        position: "fixed", bottom: "12px", right: "12px", zIndex: "99999",
        width: "44px", height: "44px", borderRadius: "50%",
        border: "none", background: "rgba(0,0,0,0.6)", color: "#fff",
        fontSize: "22px", cursor: "pointer", display: "none",
        alignItems: "center", justifyContent: "center"
      });
      fsBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        fsBtn.style.display = "none";
      });
      document.body.appendChild(fsBtn);
      return fsBtn;
    }

    function checkOrientationAndFullscreen() {
      if (!isMobileDevice()) return;

      if (window.innerWidth > window.innerHeight) {
        // Landscape → fullscreen gomb megjelenítése
        if (!document.fullscreenElement) {
          getFsBtn().style.display = "flex";
        }
      } else {
        // Portrait → gomb elrejtése, kilépés fullscreen-ből
        if (fsBtn) fsBtn.style.display = "none";
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    }

    // Fullscreen változás figyelése (pl. user kilép swipe-pal)
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement && window.innerWidth > window.innerHeight && isMobileDevice()) {
        getFsBtn().style.display = "flex";
      }
    });

    try {
      window.addEventListener("resize", checkOrientationAndFullscreen);
      window.addEventListener("orientationchange", checkOrientationAndFullscreen);
    } catch (e) { console.error(e); }

    window.myioRenderAll = renderAll;
    renderAll();
  }

  async function start() {
    await loadModules();

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initDashboard);
    } else {
      initDashboard();
    }
  }

  start();
})();
