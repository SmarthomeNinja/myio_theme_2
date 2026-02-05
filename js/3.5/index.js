/* index.js – MyIO Dashboard - Fő modul
   Modulok: utils, storage, cards, sections, renderers, thermo, reorder, settings-modal
   CSS: styles.css (külön betöltendő, vagy ide injektálva)
*/

let isDraggingCard = false;

(function () {
  const { $, myioNS } = window.myioUtils;
  const { ensureShell, ensureHeaderMask } = window.myioSections;
  const { clearCardFactories } = window.myioCards;
  const { renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites } = window.myioRenderers;
  const { renderThermo } = window.myioThermo;
  const { setupSectionReorder, setupCardReorder } = window.myioReorder;
  const { setupLongPressHandlers } = window.myioSettingsModal;

  function renderAll() {
    ensureHeaderMask();
    document.documentElement.classList.add("myio-noanim");
    ensureShell();
    clearCardFactories();

    const root = $("#myio-root");
    root.innerHTML = "";

    try { renderSensors(root); } catch (e) { console.error(e); }
    try { renderThermo(root); } catch (e) { console.error(e); }
    try { renderPCA(root); } catch (e) { console.error(e); }
    try { renderRelays(root); } catch (e) { console.error(e); }
    try { renderFET(root); } catch (e) { console.error(e); }
    try { renderSwitches(root); } catch (e) { console.error(e); }
    try { renderFavorites(root); } catch (e) { console.error(e); }

    setupSectionReorder();
    setupCardReorder();

    if (typeof window.myioApplySavedSectionOrder === "function") window.myioApplySavedSectionOrder();
    if (typeof window.myioApplySavedCardOrder === "function") window.myioApplySavedCardOrder();
    if (typeof window.myioApplySavedSectionOrder === "function") window.myioApplySavedSectionOrder();

    if (!root.children.length) {
      const { section, grid } = window.myioSections.makeSection("Nincs megjeleníthető adat", "Ellenőrizd a szerver változókat");
      const c = window.myioCards.card("Tippek", "myio-off", "tips:0");
      window.myioCards.addValue(c, "—");
      grid.append(c);
      root.append(section);
    }

    requestAnimationFrame(() => document.documentElement.classList.remove("myio-noanim"));

    try { window.onpageshow = () => window.scrollTo(window.scrollX, window.scrollY); } catch { }
    try { enableThumbOnlyRanges(document); } catch { }
    try { if (typeof myioRO !== "undefined" && myioRO) myioRO.observe(document.body); } catch { }

    setupLongPressHandlers();
  }

  window.myioRenderAll = renderAll;

  const start = () => renderAll();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();