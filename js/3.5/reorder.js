/* reorder.js – Section és Card drag & drop rendezés */

(function() {
  const { $ } = window.myioUtils;
  const { FAV_SECTION_KEY } = window.myioStorage;

  let isDraggingCard = false;
  window.myioIsDraggingCard = () => isDraggingCard;

  // ========== SECTION REORDER ==========
  function setupSectionReorder() {
    if (window.__myioReorderInited) return;
    window.__myioReorderInited = true;

    const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
    const ORDER_KEY = `myio.sections.order.${scope}`;
    const container = $("#myio-root");
    if (!container) return;

    const getSections = () => Array.from(container.querySelectorAll(":scope > .myio-section")).filter(s => !!s.dataset.key);

    const save = () => {
      localStorage.setItem(ORDER_KEY, JSON.stringify(getSections().map(s => s.dataset.key)));
    };

    const applySavedOrder = () => {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch { }
      const sections = getSections();
      const map = new Map(sections.map(s => [s.dataset.key, s]));
      const cleaned = saved.filter(k => map.has(k));
      const used = new Set(cleaned);
      for (const k of cleaned) container.appendChild(map.get(k));
      for (const s of sections) if (!used.has(s.dataset.key)) container.appendChild(s);
    };

    applySavedOrder();
    window.myioApplySavedSectionOrder = applySavedOrder;

    let draggingElement = null, isAnimating = false, ghostImage = null;
    let lastSwapTime = 0, originalGhostLeft = 0, dragHandleOffsetY = 0;

    function createGhostImage(element, clientX, clientY) {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      ghostImage = element.cloneNode(true);
      originalGhostLeft = rect.left - containerRect.left;

      const dragHandle = element.querySelector('.myio-dragHandle');
      dragHandleOffsetY = dragHandle ? clientY - dragHandle.getBoundingClientRect().top : clientY - rect.top;

      ghostImage.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;opacity:0.7;pointer-events:none;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);transform:scale(1.02);`;
      ghostImage.classList.add('myio-ghost');
      ghostImage.querySelectorAll('.myio-dragHandle').forEach(h => h.style.display = 'none');
      document.body.appendChild(ghostImage);
    }

    function updateGhostPosition(e) {
      if (!ghostImage || !draggingElement) return;
      const containerRect = container.getBoundingClientRect();
      ghostImage.style.left = (containerRect.left + originalGhostLeft) + 'px';
      ghostImage.style.top = (e.clientY - dragHandleOffsetY) + 'px';
      checkForSwap(e.clientY);
    }

    function removeGhostImage() {
      if (ghostImage) ghostImage.remove();
      ghostImage = null;
    }

    function checkForSwap(ghostY) {
      if (!draggingElement || isAnimating || Date.now() - lastSwapTime < 200 || !ghostImage) return;
      const sections = Array.from(container.querySelectorAll(".myio-section:not(.is-dragging)"));
      const ghostRect = ghostImage.getBoundingClientRect();

      for (const section of sections) {
        if (section === draggingElement) continue;
        const sectionRect = section.getBoundingClientRect();
        const isOverlapping = !(ghostRect.bottom < sectionRect.top || ghostRect.top > sectionRect.bottom);
        if (!isOverlapping) continue;

        const overlapHeight = Math.max(0, Math.min(ghostRect.bottom, sectionRect.bottom) - Math.max(ghostRect.top, sectionRect.top));
        if (overlapHeight >= 45) {
          const before = (ghostRect.bottom - sectionRect.top) >= (sectionRect.bottom - ghostRect.top);
          performSwap(draggingElement, section, before);
          lastSwapTime = Date.now();
          break;
        }
      }
    }

    function performSwap(draggingEl, targetEl, before) {
      if (isAnimating) return;
      isAnimating = true;

      const allSections = Array.from(container.querySelectorAll(".myio-section"));
      const sectionsWithoutDragging = allSections.filter(s => s !== draggingEl);
      const targetIndex = sectionsWithoutDragging.indexOf(targetEl);
      const newOrder = [...sectionsWithoutDragging];
      newOrder.splice(before ? targetIndex : targetIndex + 1, 0, draggingEl);

      const startPositions = new Map();
      allSections.forEach(s => startPositions.set(s, { y: s.getBoundingClientRect().top }));

      container.innerHTML = '';
      newOrder.forEach(s => container.appendChild(s));
      container.style.minHeight = container.offsetHeight + 'px';

      allSections.forEach(s => {
        const start = startPositions.get(s);
        if (!start) return;
        const deltaY = start.y - s.getBoundingClientRect().top;
        if (deltaY !== 0) {
          s.style.transform = `translateY(${deltaY}px)`;
          s.style.transition = 'transform 0s';
          s.offsetHeight;
          requestAnimationFrame(() => {
            s.style.transition = 'transform 150ms ease-out';
            s.style.transform = 'translateY(0)';
            setTimeout(() => { s.style.transition = ''; if (s === draggingEl) { isAnimating = false; container.style.minHeight = ''; } }, 150);
          });
        } else if (s === draggingEl) { isAnimating = false; container.style.minHeight = ''; }
      });
    }

    container.addEventListener("dragstart", (e) => {
      const section = e.target.closest(".myio-section");
      if (!section || section.dataset.dragok !== "1") { e.preventDefault(); return; }
      draggingElement = section;
      section.classList.add("is-dragging");
      createGhostImage(section, e.clientX, e.clientY);
      e.dataTransfer.setData("text/plain", section.dataset.key || "");
      e.dataTransfer.effectAllowed = "move";
      const img = new Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    });

    document.addEventListener("dragover", (e) => { if (draggingElement) { e.preventDefault(); updateGhostPosition(e); } });
    container.addEventListener("dragover", (e) => { if (draggingElement) e.preventDefault(); });

    container.addEventListener("dragend", (e) => {
      if (draggingElement) {
        draggingElement.classList.remove("is-dragging");
        removeGhostImage();
        container.querySelectorAll(".myio-section").forEach(s => { s.style.transform = ""; s.style.transition = ""; s.style.zIndex = ""; });
        draggingElement = null;
        save();
      }
      e.preventDefault();
    });

    container.addEventListener("drop", (e) => e.preventDefault());
  }

  // ========== CARD REORDER ==========
  function setupCardReorder() {
    if (window.__myioCardReorderInited) return;
    window.__myioCardReorderInited = true;

    const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
    const root = $("#myio-root");
    if (!root) return;

    let scrollYBeforeDrag = 0;
    const lockScroll = () => {
      scrollYBeforeDrag = window.scrollY || 0;
      document.body.style.cssText = `position:fixed;top:-${scrollYBeforeDrag}px;left:0;right:0;width:100%;`;
    };
    const unlockScroll = () => {
      document.body.style.cssText = '';
      window.scrollTo(0, scrollYBeforeDrag);
    };
    const preventTouchMove = (e) => e.preventDefault();

    const orderKeyForSection = (sectionKey) => `myio.cards.order.${scope}.${sectionKey}`;
    const getCards = (grid) => Array.from(grid.querySelectorAll(":scope > .myio-card")).filter(c => !!c.dataset.cardid);

    const saveGridOrder = (sectionKey, grid) => {
      try { localStorage.setItem(orderKeyForSection(sectionKey), JSON.stringify(getCards(grid).map(c => c.dataset.cardid))); } catch { }
    };

    const applySavedOrderForGrid = (sectionKey, grid) => {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(orderKeyForSection(sectionKey)) || "[]"); } catch { }
      const cards = getCards(grid);
      const map = new Map(cards.map(c => [c.dataset.cardid, c]));
      const cleaned = saved.filter(id => map.has(id));
      const used = new Set(cleaned);
      for (const id of cleaned) grid.appendChild(map.get(id));
      for (const c of cards) if (!used.has(c.dataset.cardid)) grid.appendChild(c);
    };

    const applyAll = () => {
      Array.from(root.querySelectorAll(".myio-section")).forEach(sec => {
        const grid = sec.querySelector(".myio-grid");
        if (grid && sec.dataset.key) applySavedOrderForGrid(sec.dataset.key, grid);
      });
    };
    applyAll();
    window.myioApplySavedCardOrder = applyAll;

    const LP_MS = 500, MOVE_PX = 10;
    let lpTimer = null, lpStartX = 0, lpStartY = 0, lpMoved = false;
    let draggingCard = null, draggingGrid = null, draggingSectionKey = null;
    let ghost = null, dragOffsetX = 0, dragOffsetY = 0, originalLeft = 0;
    let isAnimating = false, lastSwapTime = 0;

    const isInteractiveTarget = (t) => t && !!t.closest(
      ".myio-cardTitle,.myio-headRow,.myio-headTitleBtn,.myio-titleBtn,button,a,input,textarea,select,label,.myio-btnRow,.myio-miniToggle,.myio-pcaRow,.myio-thermo-circular,.myio-thermo-handle,.myio-thermo-svg,.myio-thermo-btn,.myio-thermo-buttons"
    );

    const pickCardEmptyAreaTarget = (e) => {
      const card = e.target.closest(".myio-card");
      if (!card || isInteractiveTarget(e.target)) return null;
      return card.dataset.cardid ? card : null;
    };

    function createGhost(card, clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const gridRect = draggingGrid.getBoundingClientRect();
      ghost = card.cloneNode(true);
      ghost.classList.add("myio-ghost");
      ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;opacity:0.72;pointer-events:none;z-index:10000;box-shadow:0 10px 26px rgba(0,0,0,0.35);transform:scale(1.02);visibility:visible;`;
      originalLeft = rect.left - gridRect.left;
      dragOffsetX = clientX - rect.left;
      dragOffsetY = clientY - rect.top;
      ghost.querySelectorAll(".myio-dragHandle").forEach(h => h.style.display = "none");
      document.body.appendChild(ghost);
    }

    function removeGhost() { if (ghost) ghost.remove(); ghost = null; }

    function updateGhostPosition(clientX, clientY) {
      if (!ghost || !draggingCard || !draggingGrid) return;
      const gridRect = draggingGrid.getBoundingClientRect();
      const minX = gridRect.left - 10, maxX = gridRect.right - ghost.offsetWidth + 10;
      ghost.style.left = Math.min(maxX, Math.max(minX, clientX - dragOffsetX)) + "px";
      ghost.style.top = (clientY - dragOffsetY) + "px";
      checkSwap();
    }

    function checkSwap() {
      if (!draggingCard || !ghost || isAnimating || Date.now() - lastSwapTime < 120) return;
      const cards = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card:not(.is-dragging)")).filter(c => !!c.dataset.cardid);
      if (!cards.length) return;

      const g = ghost.getBoundingClientRect();
      const gx = g.left + g.width / 2, gy = g.top + g.height / 2;
      const current = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card")).filter(c => !!c.dataset.cardid);
      const oldIndex = current.indexOf(draggingCard);

      const indexed = cards.map(c => { const r = c.getBoundingClientRect(); return { c, cx: r.left + r.width / 2, cy: r.top + r.height / 2, top: r.top, left: r.left }; });
      const rowTol = Math.max(12, g.height * 0.35);
      indexed.sort((a, b) => (Math.abs(a.top - b.top) <= rowTol) ? (a.left - b.left) : (a.top - b.top));

      let insertBeforeEl = null;
      for (const it of indexed) {
        const sameRow = Math.abs(it.cy - gy) <= rowTol;
        if (gy < it.cy - rowTol || (sameRow && gx < it.cx)) { insertBeforeEl = it.c; break; }
      }

      let newIndex = insertBeforeEl ? current.indexOf(insertBeforeEl) : current.length - 1;
      if (oldIndex !== -1 && newIndex > oldIndex) newIndex--;
      if (newIndex === oldIndex || newIndex < 0) return;

      performReorderToIndex(newIndex);
      lastSwapTime = Date.now();
    }

    function performReorderToIndex(newIndex) {
      if (isAnimating) return;
      isAnimating = true;

      const all = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card")).filter(c => !!c.dataset.cardid);
      const oldIndex = all.indexOf(draggingCard);
      if (oldIndex < 0) { isAnimating = false; return; }

      const startPos = new Map();
      all.forEach(c => startPos.set(c, { x: c.getBoundingClientRect().left, y: c.getBoundingClientRect().top }));

      const reordered = all.slice();
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, draggingCard);
      reordered.forEach(c => draggingGrid.appendChild(c));

      reordered.forEach(c => {
        const s = startPos.get(c);
        if (!s) return;
        const e = c.getBoundingClientRect();
        const dx = s.x - e.left, dy = s.y - e.top;
        if (dx || dy) {
          c.style.transform = `translate(${dx}px, ${dy}px)`;
          c.style.transition = "transform 0s";
          c.offsetHeight;
          requestAnimationFrame(() => { c.style.transition = "transform 150ms ease-out"; c.style.transform = "translate(0,0)"; });
        }
      });

      setTimeout(() => { reordered.forEach(c => { c.style.transition = ""; c.style.transform = ""; }); isAnimating = false; }, 170);
    }

    function startDrag(card, clientX, clientY) {
      isDraggingCard = true;
      draggingCard = card;
      draggingGrid = card.closest(".myio-grid");
      const sec = card.closest(".myio-section");
      draggingSectionKey = sec ? sec.dataset.key : null;

      if (!draggingGrid || !draggingSectionKey) { draggingCard = null; draggingGrid = null; draggingSectionKey = null; return; }

      card.classList.add("is-dragging");
      card.style.visibility = "hidden";
      createGhost(card, clientX, clientY);
      lockScroll();
      document.addEventListener("touchmove", preventTouchMove, { passive: false });
      try { draggingGrid.style.touchAction = "none"; } catch {}
      try { if (navigator.vibrate) navigator.vibrate(20); } catch { }
    }

    function endDrag() {
      isDraggingCard = false;
      document.removeEventListener("touchmove", preventTouchMove);
      unlockScroll();
      if (draggingGrid) draggingGrid.style.touchAction = "";
      if (draggingCard) {
        draggingCard.classList.remove("is-dragging");
        draggingCard.style.visibility = "";
        draggingCard.style.touchAction = "";
      }
      removeGhost();
      if (draggingSectionKey && draggingGrid) saveGridOrder(draggingSectionKey, draggingGrid);
      draggingCard = null; draggingGrid = null; draggingSectionKey = null;
    }

    const clearLP = () => { if (lpTimer) clearTimeout(lpTimer); lpTimer = null; lpMoved = false; };

    document.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const card = pickCardEmptyAreaTarget(e);
      if (!card) return;
      card.__myioPointerId = e.pointerId;
      card.style.touchAction = "none";
      clearLP();
      lpStartX = e.clientX; lpStartY = e.clientY; lpMoved = false;
      lpTimer = setTimeout(() => { if (!lpMoved) startDrag(card, e.clientX, e.clientY); }, LP_MS);
    }, { passive: true });

    document.addEventListener("pointermove", (e) => {
      if (draggingCard) { e.preventDefault(); updateGhostPosition(e.clientX, e.clientY); return; }
      if (!lpTimer || isDraggingCard) return;
      if (Math.abs(e.clientX - lpStartX) > MOVE_PX || Math.abs(e.clientY - lpStartY) > MOVE_PX) { lpMoved = true; clearLP(); }
    }, { passive: false });

    document.addEventListener("pointerup", () => { clearLP(); if (draggingCard) endDrag(); }, { passive: true });
    document.addEventListener("pointercancel", () => { clearLP(); if (draggingCard) endDrag(); }, { passive: true });
    window.addEventListener("blur", () => { clearLP(); if (draggingCard) endDrag(); });
  }

  window.myioReorder = { setupSectionReorder, setupCardReorder };
})();
