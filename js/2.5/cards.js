/* cards.js – Kártya építő függvények */

(function() {
  const { el, safe } = window.myioUtils;
  const { loadCardName, loadCardIcon, isFav, toggleFav, loadFavs, cleanupFavoritesSectionState, FAV_SECTION_KEY } = window.myioStorage;

  const cardFactories = new Map();

  function registerCardFactory(id, fn) {
    if (id && typeof fn === "function") cardFactories.set(id, fn);
  }

  function getCardFactory(id) { return cardFactories.get(id); }
  function clearCardFactories() { cardFactories.clear(); }
  function hasCardFactory(id) { return cardFactories.has(id); }

  // Kedvenc ikon wrapper
  function makeFavIcon(cardId) {
    const savedIcon = loadCardIcon(cardId);
    const on = isFav(cardId);
    
    const wrapper = el("span", { class: "myio-fav-wrapper" });
    
    const starBtn = el("button", {
      class: "myio-favInTitle" + (on ? " is-fav" : ""),
      type: "button",
      title: "Kedvenc",
      "aria-label": "Kedvenc"
    }, [document.createTextNode(on ? "★" : "☆")]);

    starBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    
      const wasFav = isFav(cardId);
      const before = loadFavs();
      const firstFavWillBeCreated = (!wasFav && before.length === 0);
    
      toggleFav(cardId);

      if (loadFavs().length === 0) {
        cleanupFavoritesSectionState();
      }
      
      if (firstFavWillBeCreated) {
        try {
          const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
          const ORDER_KEY = `myio.sections.order.${scope}`;
          let saved = [];
          try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch {}
          saved = saved.filter(k => k !== FAV_SECTION_KEY);
          saved.unshift(FAV_SECTION_KEY);
          localStorage.setItem(ORDER_KEY, JSON.stringify(saved));
        } catch (err) { console.error("Favorites order update error:", err); }
      }
    
      const now = isFav(cardId);
      starBtn.textContent = now ? "★" : "☆";
      starBtn.classList.toggle("is-fav", now);
    
      if (typeof window.myioRenderAll === "function") window.myioRenderAll();
    });
    
    wrapper.appendChild(starBtn);
    
    if (savedIcon && savedIcon !== '☆' && savedIcon !== '★') {
      wrapper.appendChild(el("span", { class: "myio-card-icon", title: "Választott ikon" }, [document.createTextNode(savedIcon)]));
    }

    return wrapper;
  }

  // Alap kártya
  function card(title, statusClass, cardId = null) {
    const c = el("div", { class: `myio-card ${statusClass || ""}` });
    const displayName = cardId ? (loadCardName(cardId) || title) : title;
    const t = el("div", { class: "myio-cardTitle" });
    if (cardId) t.appendChild(makeFavIcon(cardId));
    t.appendChild(document.createTextNode(safe(displayName)));
    c.appendChild(t);
    if (cardId) c.dataset.cardid = cardId;
    return c;
  }

  // Kártya kattintható címmel
  function cardWithInvTitle(title, statusClass, invCommandName, index1based, cardId = null) {
    const c = el("div", { class: `myio-card ${statusClass || ""}` });
    const displayName = cardId ? (loadCardName(cardId) || title) : title;
    const titleInner = el("span", { class: "myio-titleBtn" });
    if (cardId) titleInner.appendChild(makeFavIcon(cardId));
    titleInner.appendChild(document.createTextNode(safe(displayName)));

    titleInner.addEventListener("click", () => {
      try {
        const btn = document.createElement("button");
        btn.name = invCommandName;
        btn.value = String(index1based);
        changed(btn);
      } catch { window.myioUtils.toast("changed() hiba"); }
    });

    c.append(el("div", { class: "myio-cardTitle" }, [titleInner]));
    if (cardId) c.dataset.cardid = cardId;
    return c;
  }

  function addValue(c, txt) {
    c.append(el("div", { class: "myio-value", text: String(txt) }));
  }

  function addButtons(c, buttons) {
    const row = el("div", { class: "myio-btnRow" });
    for (const b of buttons) {
      row.append(el("button", {
        class: "myio-btn",
        text: b.label,
        name: b.name,
        value: String(b.value),
        onclick: (e) => { try { changed(e.currentTarget); } catch { window.myioUtils.toast("changed() nincs definiálva"); } }
      }));
    }
    c.append(row);
  }

  // Toggle-s fejléc
  function setCardHeaderWithInvAndToggle(cardEl, title, invCmd, onCmd, offCmd, index1, checked, cardId = null) {
    cardEl.classList.add("is-switchable");
    const oldTitle = cardEl.querySelector(".myio-cardTitle");
    if (oldTitle) oldTitle.remove();

    const headRow = el("div", { class: "myio-headRow" });
    const displayName = cardId ? (loadCardName(cardId) || title) : title;
    const titleWrap = el("div", { class: "myio-cardTitle" });
    
    const titleBtn = el("button", {
      class: "myio-headTitleBtn",
      onclick: () => {
        try {
          const b = document.createElement("button");
          b.name = invCmd; b.value = String(index1);
          changed(b);
        } catch { }
      }
    });

    const id = cardId || cardEl.dataset.cardid || null;
    if (id) titleBtn.appendChild(makeFavIcon(id));
    titleBtn.appendChild(document.createTextNode(" " + safe(displayName)));
    titleWrap.append(titleBtn);

    const tog = el("label", { class: "myio-miniToggle" });
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!checked;

    cardEl.classList.toggle("myio-on", !!checked);
    cardEl.classList.toggle("myio-off", !checked);

    input.addEventListener("change", () => {
      const next = !!input.checked;
      cardEl.classList.toggle("myio-on", next);
      cardEl.classList.toggle("myio-off", !next);
      try {
        const b = document.createElement("button");
        b.name = next ? onCmd : offCmd;
        b.value = String(index1);
        changed(b);
      } catch { }
    });

    tog.append(input, el("span", { class: "myio-miniTrack" }));
    headRow.append(titleWrap, tog);
    cardEl.prepend(headRow);
  }

  // Export
  window.myioCards = {
    cardFactories,
    registerCardFactory, getCardFactory, clearCardFactories, hasCardFactory,
    makeFavIcon, card, cardWithInvTitle, addValue, addButtons, setCardHeaderWithInvAndToggle
  };
})();
