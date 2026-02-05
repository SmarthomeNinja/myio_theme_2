
/* index.js – Modern reszponzív dashboard
   MÓDOSÍTVA: scroll-safe long-press + ikon tárolás localStorage-ban
*/

const myioNS = "myio." + String((typeof MYIOname !== "undefined" && MYIOname) ? MYIOname : "default")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

let isDraggingCard = false;


(function () {

  // ---------- util ---------

  const $ = (sel, el = document) => el.querySelector(sel);
  const el = (tag, attrs = {}, children = []) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const c of children) n.appendChild(c);
    return n;
  };
  const safe = (v, fallback = "-") => (v === null || v === undefined || v === "") ? fallback : v;
  function decodeRW(v) {
    let read = 0, write = 0, val = v;
    if (val >= 10000) { read = 1; val -= 10000; }
    if (val >= 1000) { write = 1; val -= 1000; }
    return { read, write, val };
  }
  function toast(msg) {
    const t = $("#myio-toast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(toast._tm);
    toast._tm = setTimeout(() => { t.style.display = "none"; }, 2200);
  }

  // ---------- IKON TÁROLÁS LocalStorage ----------
  
  const ICON_STORAGE_KEY = myioNS + ".card.icons";
  const CARD_NAMES_KEY = myioNS + ".card.names";
  
  function loadCardIcon(cardId) {
    try {
      const stored = localStorage.getItem(ICON_STORAGE_KEY) || '{}';
      const icons = JSON.parse(stored);
      return icons[cardId] || null;
    } catch { return null; }
  }
  
  function saveCardIcon(cardId, icon) {
    try {
      const stored = localStorage.getItem(ICON_STORAGE_KEY) || '{}';
      const icons = JSON.parse(stored);
      icons[cardId] = icon;
      localStorage.setItem(ICON_STORAGE_KEY, JSON.stringify(icons));
    } catch(e) { console.error('Icon save error:', e); }
  }
  
  function loadCardName(cardId) {
    try {
      const stored = localStorage.getItem(CARD_NAMES_KEY) || '{}';
      const names = JSON.parse(stored);
      return names[cardId] || null;
    } catch { return null; }
  }
  
  function saveCardName(cardId, name) {
    try {
      const stored = localStorage.getItem(CARD_NAMES_KEY) || '{}';
      const names = JSON.parse(stored);
      names[cardId] = name;
      localStorage.setItem(CARD_NAMES_KEY, JSON.stringify(names));
    } catch(e) { console.error('Name save error:', e); }
  }

  // ---------- FAVORITES ----------

  const FAV_KEY = myioNS + ".favorites";
  const FAV_SECTION_KEY = myioNS + ".section.favorites";

  function loadFavs() {
    try {
      const arr = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }
  function saveFavs(arr) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch { }
  }
  function isFav(id) {
    const f = loadFavs();
    return f.includes(id);
  }
  function toggleFav(id) {
    const f = loadFavs();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1);
    else f.push(id);
    saveFavs(f);
  }
  const cardFactories = new Map();
  function registerCardFactory(id, factoryFn) {
    if (!id || typeof factoryFn !== "function") return;
    cardFactories.set(id, factoryFn);
  }
  function cleanupFavoritesSectionState() {
    try {
      // 1) Favorites section collapse/open state
      localStorage.removeItem(FAV_SECTION_KEY);
  
      // 2) Favorites cards order (card reorder per section)
      const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
      const cardsOrderKey = `myio.cards.order.${scope}.${FAV_SECTION_KEY}`;
      localStorage.removeItem(cardsOrderKey);
  
      // 3) Remove Favorites from saved section order
      const sectionsOrderKey = `myio.sections.order.${scope}`;
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(sectionsOrderKey) || "[]"); } catch {}
      saved = Array.isArray(saved) ? saved.filter(k => k !== FAV_SECTION_KEY) : [];
      localStorage.setItem(sectionsOrderKey, JSON.stringify(saved));
    } catch (e) {
      console.error("Favorites cleanup error:", e);
    }
  }
  
  // Ikon wrapper - csillag (kedvenc) + választott ikon alatta
  function makeFavIcon(cardId) {
    const savedIcon = loadCardIcon(cardId);
    const on = isFav(cardId);
    
    // Wrapper a két ikonnak
    const wrapper = el("span", { class: "myio-fav-wrapper" });
    
    // Csillag gomb (kedvenc toggle)
    const starBtn = el("button", {
      class: "myio-favInTitle" + (on ? " is-fav" : ""),
      type: "button",
      title: "Kedvenc",
      "aria-label": "Kedvenc"
    }, [document.createTextNode(on ? "★" : "☆")]);

    starBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    
      // első kedvenc lesz-e? (toggle előtt)
      const wasFav = isFav(cardId);
      const before = loadFavs();
      const firstFavWillBeCreated = (!wasFav && before.length === 0);
    
      // kedvenc toggle
      toggleFav(cardId);
    // ha MOST lett 0 kedvenc -> töröljük a Favorites-hoz tartozó mentéseket
      if (loadFavs().length === 0) {
        cleanupFavoritesSectionState();
      }
      // ha most jött létre az első kedvenc: Favorites szekció menjen a sorrend elejére
      if (firstFavWillBeCreated) {
        try {
          const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
          const ORDER_KEY = `myio.sections.order.${scope}`;
    
          let saved = [];
          try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch {}
    
          // vedd ki, ha már benne van, majd tedd az elejére
          saved = saved.filter(k => k !== FAV_SECTION_KEY);
          saved.unshift(FAV_SECTION_KEY);
    
          localStorage.setItem(ORDER_KEY, JSON.stringify(saved));
        } catch (err) {
          console.error("Favorites order update error:", err);
        }
      }
    
      // UI frissítés
      const now = isFav(cardId);
      starBtn.textContent = now ? "★" : "☆";
      starBtn.classList.toggle("is-fav", now);
    
      renderAll();
    });
    
    
    
    wrapper.appendChild(starBtn);
    
    // Ha van választott ikon, megjelenítjük alatta
    if (savedIcon && savedIcon !== '☆' && savedIcon !== '★') {
      const customIcon = el("span", {
        class: "myio-card-icon",
        title: "Választott ikon"
      }, [document.createTextNode(savedIcon)]);
      wrapper.appendChild(customIcon);
    }

    return wrapper;
  }

  // ---------- shell ----------

  function ensureShell() {
    if ($("#myio-root")) return;

    const wrap = el("div", { class: "myio-wrap" });
    const root = el("div", { id: "myio-root" });
    const toastEl = el("div", { id: "myio-toast", class: "myio-toast" });

    wrap.append(root);
    document.body.append(wrap, toastEl);
  }
  
  function makeSection(title, meta, keyOverride, defaultOpen = false) {
    const key = keyOverride || (
      myioNS + ".section." +
      String(title || "section")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^\w\-]/g, "")
    );

    const saved = localStorage.getItem(key);
    const collapsed = (saved === null) ? !defaultOpen : (saved !== "open");

    const section = el("section", { class: "myio-section" + (collapsed ? " is-collapsed" : "") });
    section.dataset.key = key;

    const head = el("div", { class: "myio-sectionHead", role: "button", tabindex: "0" }, [
      el("h2", { class: "myio-sectionTitle", text: title }),
      el("div", { class: "myio-sectionMeta", text: meta || "" }),
      el("div", { class: "myio-dragHandle", title: "Rendezés", text: "☰" })
    ]);

    section.draggable = false;

    const handle = head.querySelector(".myio-dragHandle");
    handle.addEventListener("pointerdown", (e) => {
      section.dataset.dragok = "1";
      section.draggable = true;
      e.stopPropagation();
    });
    handle.addEventListener("pointerup", (e) => {
      section.dataset.dragok = "0";
      section.draggable = false;
      e.stopPropagation();
    });
    handle.addEventListener("click", (e) => e.stopPropagation());

    const body = el("div", { class: "myio-sectionBody" }, [
      el("div", { class: "myio-grid" })
    ]);

    const saveState = () => {
      const isOpen = !section.classList.contains("is-collapsed");
      localStorage.setItem(key, isOpen ? "open" : "closed");
    };

    const toggle = () => { section.classList.toggle("is-collapsed"); saveState(); };

    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });

    section.append(head, body);

    if (saved === null) saveState();
    return { section, grid: body.firstChild, head };
  }
  window.myioMakeSection = makeSection;

  // ---------- cards ----------

  function card(title, statusClass, cardId = null) {
    const c = el("div", { class: `myio-card ${statusClass || ""}` });
    
    // Betöltjük a mentett nevet (ha van)
    const displayName = cardId ? (loadCardName(cardId) || title) : title;

    const t = el("div", { class: "myio-cardTitle" }, []);
    if (cardId) t.appendChild(makeFavIcon(cardId));
    t.appendChild(document.createTextNode(safe(displayName)));

    c.appendChild(t);

    if (cardId) c.dataset.cardid = cardId;
    return c;
  }
  
  function cardWithInvTitle(title, statusClass, invCommandName, index1based, cardId = null) {
    const c = el("div", { class: `myio-card ${statusClass || ""}` });
    
    // Betöltjük a mentett nevet (ha van)
    const displayName = cardId ? (loadCardName(cardId) || title) : title;

    const titleInner = el("span", { class: "myio-titleBtn" }, []);
    if (cardId) titleInner.appendChild(makeFavIcon(cardId));
    titleInner.appendChild(document.createTextNode(safe(displayName)));

    titleInner.addEventListener("click", () => {
      try {
        const btn = document.createElement("button");
        btn.name = invCommandName;
        btn.value = String(index1based);
        changed(btn);
      } catch {
        toast("changed() hiba");
      }
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
      const btn = el("button", {
        class: "myio-btn",
        text: b.label,
        name: b.name,
        value: String(b.value),
        onclick: (e) => {
          try { changed(e.currentTarget); }
          catch { toast("changed() nincs definiálva / hiba"); }
        }
      });
      row.append(btn);
    }
    c.append(row);
  }
  
  function setCardHeaderWithInvAndToggle(cardEl, title, invCmd, onCmd, offCmd, index1, checked, cardId = null) {
    cardEl.classList.add("is-switchable");
    const oldTitle = cardEl.querySelector(".myio-cardTitle");
    if (oldTitle) oldTitle.remove();

    const headRow = el("div", { class: "myio-headRow" });
    
    // Betöltjük a mentett nevet (ha van)
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
    }, []);

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

  // ---------- render sections ----------

  function renderSensors(root) {
    const { section, grid } = makeSection(str_Sensors ?? "Sensors", "", "myio.section.sensors");
    let count = 0;

    if (typeof consumption !== "undefined" && consumption != 0) {
      const id = "sensors:consumption";
      const makeFn = () => {
        const c = card(typeof str_Consump !== "undefined" ? str_Consump : "Consumption", "myio-sensor", id);
        addValue(c, (consumption / 1000) + " " + safe(consumptionUnit, ""));
        return c;
      };
      registerCardFactory(id, makeFn);
      grid.append(makeFn()); count++;
    }

    if (typeof thermo_eepromIndex !== "undefined" && typeof fullZeroArray === "function" && !fullZeroArray(thermo_eepromIndex)) {
      for (let i = 0; i < thermo_eepromIndex.length; i++) {
        if (thermo_eepromIndex[i] != 0) {
          const idx = thermo_eepromIndex[i];
          const id = `sensors:thermo:${idx}`;
          const makeFn = () => {
            if (thermo_description[idx] == null) thermo_description[idx] = "-";
            const c = card(thermo_description[idx], "myio-sensor", id);
            addValue(c, (thermo_temps[i] / 100) + " °C");
            return c;
          };
          registerCardFactory(id, makeFn);
          grid.append(makeFn()); count++;
        }
      }
    }

    if (typeof humidity !== "undefined") {
      for (let i = 0; i < humidity.length; i++) {
        if (humidity[i] != 0) {
          const id = `sensors:hum:${i}`;
          const makeFn = () => {
            if (hum_description[i] == null) hum_description[i] = "-";
            const c = card(hum_description[i], "myio-sensor", id);
            addValue(c, (humidity[i] / 10) + " %");
            return c;
          };
          registerCardFactory(id, makeFn);
          grid.append(makeFn()); count++;
        }
      }
    }

    if (count) root.append(section);
  }
  
  function renderSwitches(root) {
    if (typeof switchEnabled === "undefined") return;

    let any = false;
    for (let i = 0; i < switchEnabled.length; i++) {
      if (switchEnabled[i] != 0 && switch_description[i + 1] != null) { any = true; break; }
    }
    if (!any) return;

    const { section, grid } = makeSection(str_Input ?? "Input", "", "myio.section.switches");
    for (let i = 0; i < switchEnabled.length; i++) {
      if (switchEnabled[i] != 0 && switch_description[i + 1] != null) {
        const id = `switch:${i + 1}`;
        const makeFn = () => {
          if (!switch_description[i + 1]) switch_description[i + 1] = "-";
          const c = card(switch_description[i + 1], "myio-off", id);

          const btns = [];
          if (switchEnabled[i] >= 10) btns.push({ label: (str_Hit || "Hit"), name: "s_hit", value: (i + 1) });
          if (switchEnabled[i] - 10 == 1 || switchEnabled[i] == 1) btns.push({ label: (str_Press || "Press"), name: "s_press", value: (i + 1) });

          if (btns.length) addButtons(c, btns);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }
    root.append(section);
  }
  
  function renderPCA(root) {
    if (typeof PCA === "undefined") return;

    const PCARead = new Array(PCA.length).fill(0);
    const PCAWrite = new Array(PCA.length).fill(0);
    const PCAVal = new Array(PCA.length).fill(0);

    let any = false;

    for (let i = 0; i < PCA.length; i++) {
      const d = decodeRW(PCA[i]);
      PCARead[i] = d.read;
      PCAWrite[i] = d.write;
      PCAVal[i] = d.val;

      if ((PCARead[i] || PCAWrite[i]) && PCA_description[i + 1] != null && PCA_thermoActivator[i] == 0) {
        any = true;
      }
    }
    if (!any) return;

    const { section, grid } = makeSection(str_PCA_Output ?? "PCA Output", "", "myio.section.pca");

    for (let i = 0; i < PCA.length; i++) {
      if (!((PCARead[i] || PCAWrite[i]) && PCA_description[i + 1] != null && PCA_thermoActivator[i] == 0)) continue;

      const id = `pca:${i + 1}`;
      const makeFn = () => {
        if (!PCA_description[i + 1]) PCA_description[i + 1] = "-";

        const val255 = PCAVal[i];
        const isOn = (val255 > 0 && PCARead[i] == 1);
        const status = isOn ? "myio-on" : "myio-off";

        const c = card(PCA_description[i + 1], status, id);

        if (PCAWrite[i]) {
          setCardHeaderWithInvAndToggle(
            c,
            PCA_description[i + 1],
            "PCA_INV",
            "PCA_ON",
            "PCA_OFF",
            i + 1,
            isOn,
            id
          );

          let showSlider = 1;
          if (typeof PCA_PWM !== "undefined") showSlider = !!PCA_PWM[i];

          if (showSlider) {
            const pct = Math.round(val255 / 2.55);
            const minPct = Math.round((typeof PCAMIN !== "undefined" ? PCAMIN[i] : 0) / 2.55);
            const maxPct = Math.round((typeof PCAMAX !== "undefined" ? PCAMAX[i] : 255) / 2.55);

            const row = el("div", { class: "myio-pcaRow" });

            const range = el("input", {
              type: "range",
              min: String(minPct),
              max: String(maxPct),
              value: String(pct),
              name: "PCA*" + (i + 1)
            });
            range.onchange = (e) => { try { changed(e.target); } catch { } };

            const num = el("input", {
              type: "number",
              min: String(minPct),
              max: String(maxPct),
              value: String(pct),
              name: "PCA*" + (i + 1)
            });
            num.onchange = (e) => { try { changed(e.target); } catch { } };

            range.oninput = () => { num.value = range.value; };
            num.oninput = () => { range.value = num.value; };

            const valBox = el("div", { class: "myio-pcaValue" }, [num]);

            row.append(range, valBox);
            c.append(row);
          }
        } else {
          c.append(el("div", {
            class: "myio-sub",
            text: String(Math.round(val255 / 2.55))
          }));
        }

        return c;
      };

      registerCardFactory(id, makeFn);
      grid.append(makeFn());
    }

    root.append(section);
  }
  
  function renderFET(root) {
    if (typeof fet === "undefined") return;

    const FETRead = new Array(fet.length).fill(0);
    const FETWrite = new Array(fet.length).fill(0);
    const FETVal = new Array(fet.length).fill(0);

    let any = false;

    for (let i = 0; i < fet.length; i++) {
      const d = decodeRW(fet[i]);
      FETRead[i] = d.read;
      FETWrite[i] = d.write;
      FETVal[i] = d.val;

      if ((FETRead[i] || FETWrite[i]) && fet_description && fet_description[i + 1] != null) {
        any = true;
      }
    }
    if (!any) return;

    const { section, grid } = makeSection(str_PWM ?? "PWM", "", "myio.section.fet");

    for (let i = 0; i < fet.length; i++) {
      if (!((FETRead[i] || FETWrite[i]) && fet_description && fet_description[i + 1] != null)) continue;

      const id = `fet:${i + 1}`;
      const makeFn = () => {
        if (!fet_description[i + 1]) fet_description[i + 1] = "-";

        const val255 = FETVal[i];
        const isOn = (val255 > 0 && FETRead[i] == 1);
        const status = isOn ? "myio-on" : "myio-off";

        const c = card(fet_description[i + 1], status, id);

        if (FETWrite[i]) {
          setCardHeaderWithInvAndToggle(
            c,
            fet_description[i + 1],
            "f_INV",
            "f_ON",
            "f_OFF",
            i + 1,
            isOn,
            id
          );

          const minPct = Math.round((typeof fetMIN !== "undefined" ? fetMIN[i] : 0) / 2.55);
          const maxPct = Math.round((typeof fetMAX !== "undefined" ? fetMAX[i] : 255) / 2.55);
          const pct = Math.round(val255 / 2.55);

          const row = el("div", { class: "myio-pcaRow" });

          const range = el("input", {
            type: "range",
            min: String(minPct),
            max: String(maxPct),
            value: String(pct),
            name: "fet*" + (i + 1)
          });
          range.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };

          const num = el("input", {
            type: "number",
            min: String(minPct),
            max: String(maxPct),
            value: String(pct),
            name: "fet*" + (i + 1)
          });
          num.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };

          range.oninput = () => { num.value = range.value; };
          num.oninput = () => { range.value = num.value; };

          const valBox = el("div", { class: "myio-pcaValue" }, [num]);

          row.append(range, valBox);
          c.append(row);
        } else {
          c.append(el("div", {
            class: "myio-sub",
            text: String(Math.round(val255 / 2.55))
          }));
        }

        return c;
      };

      registerCardFactory(id, makeFn);
      grid.append(makeFn());
    }

    root.append(section);
  }
  
  function renderRelays(root) {
    if (typeof relays === "undefined") return;

    let any = false;
    for (let i = 0; i < relays.length; i++) {
      if (relays[i] != 0 && relay_description[i + 1] != null && thermoActivator[i] == 0) { any = true; break; }
    }
    if (!any) return;

    const { section, grid } = makeSection(str_Output ?? "Output", "", "myio.section.relays");
    for (let i = 0; i < relays.length; i++) {
      if (relays[i] != 0 && thermoActivator[i] == 0 && relay_description[i + 1] != null) {
        const id = `relay:${i + 1}`;

        const makeFn = () => {
          const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);
          const status = isOn ? "myio-on" : "myio-off";
          if (!relay_description[i + 1]) relay_description[i + 1] = "-";

          const writable = (parseInt(relays[i] / 10) == 1 || parseInt(relays[i] / 10) == 11);

          const c = writable
            ? cardWithInvTitle(relay_description[i + 1], status, "r_INV", (i + 1), id)
            : card(relay_description[i + 1], status, id);

          if (writable) {
            setCardHeaderWithInvAndToggle(
              c,
              relay_description[i + 1],
              "r_INV",
              "r_ON",
              "r_OFF",
              i + 1,
              isOn,
              id
            );
          }

          return c;
        };

        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }
    root.append(section);
  }
  
  function renderThermo(root) {
    const hasRelays = (typeof relays !== "undefined" && typeof thermoActivator !== "undefined");
    const hasPCA = (typeof PCA !== "undefined" && typeof PCA_thermoActivator !== "undefined");
    if (!hasRelays && !hasPCA) return;

    const PCARead = hasPCA ? new Array(PCA.length).fill(0) : [];
    const PCAWrite = hasPCA ? new Array(PCA.length).fill(0) : [];
    const PCAVal = hasPCA ? new Array(PCA.length).fill(0) : [];

    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
      const d = decodeRW(PCA[i]);
      PCARead[i] = d.read;
      PCAWrite[i] = d.write;
      PCAVal[i] = d.val;
      }
    }

    let any = false;

    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
      if (
        PCA_thermoActivator[i] != 0 &&
        (PCARead[i] || PCAWrite[i]) &&
        PCA_description &&
        PCA_description[i + 1] != null
      ) {
        any = true; break;
      }
      }
    }

    if (!any && hasRelays) {
      for (let i = 0; i < relays.length; i++) {
      if (thermoActivator[i] != 0 && relay_description && relay_description[i + 1] != null) {
        any = true; break;
      }
      }
    }

    if (!any) return;

    const { section, grid } = makeSection(str_SensOut ?? "SensOut", "", "myio.section.thermo");

    function getSensorNameAndValue(activator) {
      if (activator < 100) {
      let v = 0;
      if (typeof thermo_eepromIndex !== "undefined" && typeof thermo_temps !== "undefined" && thermo_eepromIndex) {
        for (let j = 0; j < thermo_eepromIndex.length; j++) {
        if (activator == thermo_eepromIndex[j]) v = thermo_temps[j] / 100;
        }
      }
      let name = "-";
      if (typeof thermo_description !== "undefined" && thermo_description && thermo_description[activator] != null) {
        name = thermo_description[activator];
      }
      return { name, value: v, unit: "°C", isTemp: true };
      } else {
      const hi = activator - 101;
      const v = (typeof humidity !== "undefined" && humidity && humidity[hi] != null) ? (humidity[hi] / 10) : 0;
      let name = "-";
      if (typeof hum_description !== "undefined" && hum_description && hum_description[hi] != null) {
        name = hum_description[hi];
      }
      return { name, value: v, unit: "%", isTemp: false };
      }
    }

    // ========== HA-style Circular Thermostat Card ==========
    
    function createCircularThermoCard(cardEl, onVal, offVal, onName, offName, unitText, sensorValue, isActive, isHeating, writable) {
      const size = 180;
      const cx = size / 2;
      const cy = size / 2;
      const radius = 70;
      const strokeWidth = 8;
      const handleRadius = 12;
      
      const isPercent = unitText === "%" || unitText === " %";
      const defaultMinTemp = isPercent ? 0 : 5;
      const defaultMaxTemp = isPercent ? 100 : 40;
      
      let currentOnVal = onVal;
      let currentOffVal = offVal;
      
      let currentIsHeating = currentOnVal < currentOffVal;
      
      const calculateScale = () => {
      const fullHysteresis = Math.abs(currentOffVal - currentOnVal);
      const avgTemp = (currentOnVal + currentOffVal) / 2;
      const displayHysteresis = fullHysteresis / 2;
      let multiplier;
      if (isPercent) {
        multiplier = Math.max(2, Math.min(8, 8 - fullHysteresis * 0.12));
      } else {
        multiplier = Math.max(2, Math.min(5, 5 - fullHysteresis * 0.8));
      }
      const range = fullHysteresis * multiplier;
      let minT = avgTemp - range / 2;
      let maxT = avgTemp + range / 2;
      return { minT, maxT, hysteresis: displayHysteresis, avgTemp };
      };
      
      let scale = calculateScale();
      let scaleMinTemp = scale.minT;
      let scaleMaxTemp = scale.maxT;
      
      const arcStartDeg = 240;
      const arcSpan = 240;
      const arcEndDeg = arcStartDeg + arcSpan;
      
      const tempToAngle = (temp) => {
      const ratio = Math.max(0, Math.min(1, (temp - scaleMinTemp) / (scaleMaxTemp - scaleMinTemp)));
      return arcStartDeg + ratio * arcSpan;
      };
      
      const angleToTemp = (angle) => {
      let normAngle = angle;
      while (normAngle < 0) normAngle += 360;
      while (normAngle >= 360) normAngle -= 360;
      
      let arcAngle;
      if (normAngle >= arcStartDeg) {
        arcAngle = normAngle;
      } else if (normAngle <= (arcEndDeg % 360)) {
        arcAngle = normAngle + 360;
      } else {
        const distToEnd = normAngle - (arcEndDeg % 360);
        const distToStart = arcStartDeg - normAngle;
        arcAngle = distToEnd < distToStart ? arcEndDeg : arcStartDeg;
      }
      
      const ratio = (arcAngle - arcStartDeg) / arcSpan;
      return scaleMinTemp + Math.max(0, Math.min(1, ratio)) * (scaleMaxTemp - scaleMinTemp);
      };
      
      const polarToCartesian = (angleDeg) => {
      const rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
      };
      
      const describeArc = (startAngle, endAngle) => {
      if (Math.abs(endAngle - startAngle) < 0.1) return "";
      const start = polarToCartesian(startAngle);
      const end = polarToCartesian(endAngle);
      const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
      };
      
      const getModeColor = (heating) => heating ? "#FF6B35" : "#35B8FF";
      const getModeColorLight = (heating) => heating ? "rgba(255, 107, 53, 0.3)" : "rgba(53, 184, 255, 0.3)";
      const getModeIcon = (heating, active) => {
      if (!active) return "🌡️";
      return heating ? "🔥" : "❄️";
      };
      const getModeText = (heating) => heating 
      ? (typeof str_Heating !== "undefined" ? str_Heating : "Heating") 
      : (typeof str_Cooling !== "undefined" ? str_Cooling : "Cooling");
      
      const thermoContainer = el("div", { class: "myio-thermo-circular" });
      
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
      svg.setAttribute("class", "myio-thermo-svg");
      svg.style.width = "100%";
      svg.style.maxWidth = "250px";
      svg.style.height = "auto";
      svg.style.touchAction = "none";
      
      const bgArc = document.createElementNS(svgNS, "path");
      bgArc.setAttribute("d", describeArc(arcStartDeg, arcEndDeg));
      bgArc.setAttribute("fill", "none");
      bgArc.setAttribute("stroke", "rgba(255,255,255,0.15)");
      bgArc.setAttribute("stroke-width", strokeWidth);
      bgArc.setAttribute("stroke-linecap", "round");
      svg.appendChild(bgArc);
      
      const activeArc = document.createElementNS(svgNS, "path");
      activeArc.setAttribute("fill", "none");
      activeArc.setAttribute("stroke", getModeColorLight(currentIsHeating));
      activeArc.setAttribute("stroke-width", strokeWidth + 2);
      activeArc.setAttribute("stroke-linecap", "round");
      svg.appendChild(activeArc);
      
      const currentArc = document.createElementNS(svgNS, "path");
      currentArc.setAttribute("fill", "none");
      currentArc.setAttribute("stroke", getModeColor(currentIsHeating));
      currentArc.setAttribute("stroke-width", strokeWidth);
      currentArc.setAttribute("stroke-linecap", "round");
      svg.appendChild(currentArc);
      
      let modeDisplay, avgDisplay, hystDisplay, sensorDisplay;
      let onHandle = null, offHandle = null;
      
      const updateAll = () => {
      currentIsHeating = currentOnVal < currentOffVal;
      scale = calculateScale();
      scaleMinTemp = scale.minT;
      scaleMaxTemp = scale.maxT;
      
      const color = getModeColor(currentIsHeating);
      const colorLight = getModeColorLight(currentIsHeating);
      activeArc.setAttribute("stroke", colorLight);
      currentArc.setAttribute("stroke", color);
      
      if (onHandle) {
        onHandle.setAttribute("fill", color);
      }
      
      const onAng = tempToAngle(currentOnVal);
      const offAng = tempToAngle(currentOffVal);
      const minAng = Math.min(onAng, offAng);
      const maxAng = Math.max(onAng, offAng);
      
      if (maxAng - minAng > 0.5) {
        activeArc.setAttribute("d", describeArc(minAng, maxAng));
      } else {
        activeArc.setAttribute("d", "");
      }
      
      if (onHandle && offHandle) {
        const onPos = polarToCartesian(onAng);
        const offPos = polarToCartesian(offAng);
        onHandle.setAttribute("cx", onPos.x);
        onHandle.setAttribute("cy", onPos.y);
        offHandle.setAttribute("cx", offPos.x);
        offHandle.setAttribute("cy", offPos.y);
      }
      
      if (isActive ) {
        const sensorAng = tempToAngle(Math.max(scaleMinTemp, Math.min(scaleMaxTemp, sensorValue)));
        const targetAng = currentIsHeating ? onAng : offAng;
        if (Math.abs(sensorAng - targetAng) > 0.5) {
        currentArc.setAttribute("d", describeArc(Math.min(sensorAng, targetAng), Math.max(sensorAng, targetAng)));
        } else {
        currentArc.setAttribute("d", "");
        }
      } else {
        currentArc.setAttribute("d", "");
      }
      
      if (modeDisplay && avgDisplay && hystDisplay && sensorDisplay) {
        const newAvg = (currentOnVal + currentOffVal) / 2;
        const newHyst = Math.abs(currentOffVal - currentOnVal) / 2;
        
        modeDisplay.textContent = isActive ? getModeText(currentIsHeating) : (typeof str_Off !== "undefined" ? str_Off : "Off");
        modeDisplay.style.color = isActive ? getModeColor(currentIsHeating) : "#888";
        
        avgDisplay.innerHTML = `${Math.floor(newAvg)}<span class="decimal">,${Math.round((newAvg - Math.floor(newAvg)) * 10)}</span><span class="unit">°</span>`;
        hystDisplay.textContent = `±${newHyst.toFixed(1)} ${unitText}`;
        sensorDisplay.innerHTML = `<span class="icon" `;
        if(!isActive)sensorDisplay.innerHTML +='style="transform: rotate(90deg)"';        
        sensorDisplay.innerHTML += `>${getModeIcon(currentIsHeating, isActive)}</span> ${sensorValue.toFixed(1)} ${unitText}`;
      }
      
      cardEl.classList.remove("myio-heat", "myio-cool");
      if (isActive) {
        cardEl.classList.add(currentIsHeating ? "myio-heat" : "myio-cool");
      }
      };
      
      updateAll();
      
      if (writable) {
      onHandle = document.createElementNS(svgNS, "circle");
      onHandle.setAttribute("r", handleRadius);
      onHandle.setAttribute("fill", getModeColor(currentIsHeating));
      onHandle.setAttribute("stroke", "#fff");
      onHandle.setAttribute("stroke-width", "3");
      onHandle.setAttribute("class", "myio-thermo-handle");
      onHandle.style.cursor = "grab";
      onHandle.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";
      svg.appendChild(onHandle);
      
      offHandle = document.createElementNS(svgNS, "circle");
      offHandle.setAttribute("r", handleRadius);
      offHandle.setAttribute("fill", "#666");
      offHandle.setAttribute("stroke", "#fff");
      offHandle.setAttribute("stroke-width", "3");
      offHandle.setAttribute("class", "myio-thermo-handle");
      offHandle.style.cursor = "grab";
      offHandle.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";
      svg.appendChild(offHandle);
      
      updateAll();
      
      let dragging = null;
      
      const getAngleFromEvent = (e) => {
        const rect = svg.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const svgX = (clientX - rect.left) * (size / rect.width);
        const svgY = (clientY - rect.top) * (size / rect.height);
        return Math.atan2(svgX - cx, -(svgY - cy)) * 180 / Math.PI;
      };
      
      const startDrag = (handle, isOnHandle) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragging = { handle, isOn: isOnHandle };
        handle.style.cursor = "grabbing";
        handle.setAttribute("r", handleRadius + 3);
      };
      
      const doDrag = (e) => {
        if (!dragging) return;
        e.preventDefault();
        
        const angle = getAngleFromEvent(e);
        let temp = angleToTemp(angle);
        temp = Math.round(temp * 10) / 10;
        
        if (dragging.isOn) {
        currentOnVal = temp;
        } else {
        currentOffVal = temp;
        }
        
        const onAng = tempToAngle(currentOnVal);
        const offAng = tempToAngle(currentOffVal);
        const onPos = polarToCartesian(onAng);
        const offPos = polarToCartesian(offAng);
        onHandle.setAttribute("cx", onPos.x);
        onHandle.setAttribute("cy", onPos.y);
        offHandle.setAttribute("cx", offPos.x);
        offHandle.setAttribute("cy", offPos.y);
        
        const minAng = Math.min(onAng, offAng);
        const maxAng = Math.max(onAng, offAng);
        if (maxAng - minAng > 0.5) {
        activeArc.setAttribute("d", describeArc(minAng, maxAng));
        }
        
        const newAvg = (currentOnVal + currentOffVal) / 2;
        const newHyst = Math.abs(currentOffVal - currentOnVal) / 2;
        avgDisplay.innerHTML = `${Math.floor(newAvg)}<span class="decimal">,${Math.round((newAvg - Math.floor(newAvg)) * 10)}</span><span class="unit">°</span>`;
        hystDisplay.textContent = `±${newHyst.toFixed(1)} ${unitText}`;
      };
      
      const endDrag = () => {
        if (!dragging) return;
        
        dragging.handle.style.cursor = "grab";
        dragging.handle.setAttribute("r", handleRadius);
        dragging = null;
        
        updateAll();
        
        try {
        const onInput = document.createElement("input");
        onInput.name = onName;
        onInput.value = String(Math.round(currentOnVal*10 ));
        
        const offInput = document.createElement("input");
        offInput.name = offName;
        offInput.value = String(Math.round(currentOffVal * 10));
        
        changedPair(onInput, onInput.name,offInput, offInput.name);
        } catch (err) {
        console.error("Thermostat update error:", err);
        }
      };
      
      onHandle.addEventListener("mousedown", startDrag(onHandle, true));
      onHandle.addEventListener("touchstart", startDrag(onHandle, true), { passive: false });
      offHandle.addEventListener("mousedown", startDrag(offHandle, false));
      offHandle.addEventListener("touchstart", startDrag(offHandle, false), { passive: false });
      
      svg.addEventListener("mousemove", doDrag);
      svg.addEventListener("touchmove", doDrag, { passive: false });
      document.addEventListener("mousemove", doDrag);
      document.addEventListener("touchmove", doDrag, { passive: false });
      
      svg.addEventListener("mouseup", endDrag);
      svg.addEventListener("touchend", endDrag);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);
      }
      
      thermoContainer.appendChild(svg);
      
      const centerDisplay = el("div", { class: "myio-thermo-center" });
      
      modeDisplay = el("div", { 
      class: "myio-thermo-mode" + (isActive ? " active" : ""),
      style: `color: ${isActive ? getModeColor(currentIsHeating) : "#888"}`
      });
      modeDisplay.textContent = isActive ? getModeText(currentIsHeating) : (typeof str_Off !== "undefined" ? str_Off : "Off");
      centerDisplay.appendChild(modeDisplay);
      
      avgDisplay = el("div", { class: "myio-thermo-avgtemp" });
      const avgTemp = (currentOnVal + currentOffVal) / 2;
      avgDisplay.innerHTML = `${Math.floor(avgTemp)}<span class="decimal">,${Math.round((avgTemp - Math.floor(avgTemp)) * 10)}</span><span class="unit">°</span>`;
      centerDisplay.appendChild(avgDisplay);
      
      hystDisplay = el("div", { class: "myio-thermo-hyst" });
      hystDisplay.textContent = `±${scale.hysteresis.toFixed(1)} ${unitText}`;
      centerDisplay.appendChild(hystDisplay);
      
      sensorDisplay = el("div", { class: "myio-thermo-sensor" });
      sensorDisplay.innerHTML = `<span class="icon">${getModeIcon(currentIsHeating, isActive)}</span> ${sensorValue.toFixed(1)} ${unitText}`;
      centerDisplay.appendChild(sensorDisplay);
      
      thermoContainer.appendChild(centerDisplay);
      
      if (writable) {
      const btnContainer = el("div", { class: "myio-thermo-buttons" });
      
      const minusBtn = el("button", { class: "myio-thermo-btn minus", text: "−" });
      const plusBtn = el("button", { class: "myio-thermo-btn plus", text: "+" });
      
      const adjustTemp = (delta) => {
        currentOnVal = Math.round((currentOnVal + delta) * 10) / 10;
        currentOffVal = Math.round((currentOffVal + delta) * 10) / 10;
        
        const minVal = Math.min(currentOnVal, currentOffVal);
        const maxVal = Math.max(currentOnVal, currentOffVal);
        if (minVal < defaultMinTemp) {
        const shift = defaultMinTemp - minVal;
        currentOnVal += shift;
        currentOffVal += shift;
        }
        if (maxVal > defaultMaxTemp) {
        const shift = maxVal - defaultMaxTemp;
        currentOnVal -= shift;
        currentOffVal -= shift;
        }
        
        updateAll();
        
        try {
        const onInput = document.createElement("input");
        onInput.name = onName;
        onInput.value = String(Math.round(currentOnVal*10));
        
        const offInput = document.createElement("input");
        offInput.name = offName;
        offInput.value = String(Math.round(currentOffVal * 10));
        
        changedPair(onInput, onInput.name, offInput, offInput.name);
        } catch (err) {
        console.error("Thermostat adjust error:", err);
        }
      };
      
      minusBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); adjustTemp(-0.1); });
      plusBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); adjustTemp(0.1); });
      
      btnContainer.appendChild(minusBtn);
      btnContainer.appendChild(plusBtn);
      thermoContainer.appendChild(btnContainer);
      }
      
      cardEl.appendChild(thermoContainer);
    }

    if (!document.getElementById("myio-thermo-circular-css")) {
      const style = document.createElement("style");
      style.id = "myio-thermo-circular-css";
      style.textContent = `
      .myio-thermo-circular {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 0;
      }
      .myio-thermo-svg {
        display: block;
      }
      .myio-thermo-handle {
        transition: r 0.15s ease;
      }
      .myio-thermo-handle:hover {
        filter: brightness(1.1);
      }
      .myio-thermo-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -60%);
        text-align: center;
        pointer-events: none;
      }
      .myio-thermo-mode {
        font-size: clamp(10px, calc(20px * var(--myio-zoom)), 24px);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
        opacity: 0.7;
      }
      .myio-thermo-mode.active {
        opacity: 1;
      }
      .myio-thermo-avgtemp {
        font-size: calc(40px * var(--myio-zoom));
        font-weight: 300;
        line-height: 1;
        color: #333;
      }
      .myio-thermo-avgtemp .decimal {
        font-size: calc(24px * var(--myio-zoom));
        vertical-align: top;
      }
      .myio-thermo-avgtemp .unit {
        font-size: calc(18px * var(--myio-zoom));
        vertical-align: top;
        margin-left: 2px;
        font-weight: 400;
      }
      .myio-thermo-avgtemp .unit .c {
        font-size: 14px;
      }
      .myio-thermo-hyst {
        font-size: clamp(12px, 11px * var(--myio-zoom), 20px);
        color: #888;
        margin-top: 2px;
      }
      .myio-thermo-sensor {
        font-size: clamp(16px, 16px * var(--myio-zoom), 24px);
        color: #666;
        margin-top: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .myio-thermo-sensor .icon {
        display: inline-block;
        font-size: 16px;        
      }
      .myio-thermo-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 15px;
      }
      .myio-thermo-btn {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid #ddd;
        background: #fff;
        font-size: 24px;
        font-weight: 300;
        color: #666;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .myio-thermo-btn:hover {
        border-color: #aaa;
        color: #333;
      }
      .myio-thermo-btn:active {
        transform: scale(0.95);
        background: #f5f5f5;
      }
      
      @media (prefers-color-scheme: dark) {
        .myio-thermo-avgtemp {
        color: #fff;
        }
        .myio-thermo-hyst {
        color: #aaa;
        }
        .myio-thermo-sensor {
        color: #ccc;
        }
        .myio-thermo-btn {
        background: #333;
        border-color: #555;
        color: #ccc;
        }
        .myio-thermo-btn:hover {
        border-color: #777;
        color: #fff;
        }
      }
      
      .myio-card.myio-heat .myio-thermo-mode.active {
        color: #FF6B35;
      }
      .myio-card.myio-cool .myio-thermo-mode.active {
        color: #35B8FF;
      }
      `;
      document.head.appendChild(style);
    }

    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
      if (PCA_thermoActivator[i] == 0) continue;
      if (!(PCARead[i] || PCAWrite[i])) continue;
      if (!PCA_description || PCA_description[i + 1] == null) continue;

      const id = `thermo:pca:${i + 1}`;
      const makeFn = () => {
        if (!PCA_description[i + 1]) PCA_description[i + 1] = "-";

        const isActive = (PCAVal[i] > (typeof PCAMIN !== "undefined" ? PCAMIN[i] : 0));
        let status = "myio-off";
        let isHeating = true;
        if (isActive) {
        if (typeof PCA_min_temp_ON !== "undefined" && typeof PCA_max_temp_OFF !== "undefined") {
          if (PCA_min_temp_ON[i] < PCA_max_temp_OFF[i]) { status = "myio-on myio-heat"; isHeating = true; }
          else if (PCA_max_temp_OFF[i] < PCA_min_temp_ON[i]) { status = "myio-on myio-cool"; isHeating = false; }
          else status = "myio-on";
        } else {
          status = "myio-on";
        }
        } else {
        if (typeof PCA_min_temp_ON !== "undefined" && typeof PCA_max_temp_OFF !== "undefined") {
          isHeating = PCA_min_temp_ON[i] < PCA_max_temp_OFF[i];
        }
        }

        const c = card(PCA_description[i + 1], status, id);

        if (PCAWrite[i]) {
        setCardHeaderWithInvAndToggle(
          c,
          PCA_description[i + 1],
          "PCA_INV",
          "PCA_ON",
          "PCA_OFF",
          i + 1,
          isActive,
          id
        );
        }

        const sensor = getSensorNameAndValue(PCA_thermoActivator[i]);
        const unitText = sensor.isTemp ? "°C" : "%";

        const onTh = (typeof PCA_min_temp_ON !== "undefined" ? (PCA_min_temp_ON[i] / 10) : 0);
        const offTh = (typeof PCA_max_temp_OFF !== "undefined" ? (PCA_max_temp_OFF[i] / 10) : 0);

        createCircularThermoCard(
        c,
        onTh,
        offTh,
        "PCA_temp_MIN*" + (i + 1),
        "PCA_temp_MAX*" + (i + 1),
        unitText,
        sensor.value,
        isActive,
        isHeating,
        PCAWrite[i]
        );

        return c;
      };

      registerCardFactory(id, makeFn);
      grid.append(makeFn());
      }
    }

    if (hasRelays) {
      for (let i = 0; i < relays.length; i++) {
      if (thermoActivator[i] == 0) continue;
      if (!relay_description || relay_description[i + 1] == null) continue;

      const id = `thermo:relay:${i + 1}`;
      const makeFn = () => {
        if (!relay_description[i + 1]) relay_description[i + 1] = "-";

        const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);

        let status = "myio-off";
        let isHeating = true;
        if (isOn) {
        if (typeof min_temp_ON !== "undefined" && typeof max_temp_OFF !== "undefined") {
          if (min_temp_ON[i] < max_temp_OFF[i]) { status = "myio-on myio-heat"; isHeating = true; }
          else if (max_temp_OFF[i] < min_temp_ON[i]) { status = "myio-on myio-cool"; isHeating = false; }
          else status = "myio-on";
        } else {
          status = "myio-on";
        }
        } else {
        if (typeof min_temp_ON !== "undefined" && typeof max_temp_OFF !== "undefined") {
          isHeating = min_temp_ON[i] < max_temp_OFF[i];
        }
        }

        const c = card(relay_description[i + 1], status, id);

        const writable = (parseInt(relays[i] / 10) == 1 || parseInt(relays[i] / 10) == 11);

        if (writable) {
        setCardHeaderWithInvAndToggle(
          c,
          relay_description[i + 1],
          "r_INV",
          "r_ON",
          "r_OFF",
          i + 1,
          isOn,
          id
        );
        }

        const sensor = getSensorNameAndValue(thermoActivator[i]);
        const unitText = sensor.isTemp ? "°C" : "%";

        const onTh = (typeof min_temp_ON !== "undefined" ? (min_temp_ON[i] / 10) : 0);
        const offTh = (typeof max_temp_OFF !== "undefined" ? (max_temp_OFF[i] / 10) : 0);

        createCircularThermoCard(
        c,
        onTh,
        offTh,
        "min_temp_ON*" + (i + 1),
        "max_temp_OFF*" + (i + 1),
        unitText,
        sensor.value,
        isOn,
        isHeating,
        writable
        );

        return c;
      };

      registerCardFactory(id, makeFn);
      grid.append(makeFn());
      }
    }

    if (grid.childNodes.length > 0) root.append(section);
  }
  // Expose for external usage
  window.myioRenderThermo = renderThermo;
  
  function renderFavorites(root) {
    const favs = loadFavs();
    if (!favs.length) return;

    const existing = favs.filter(id => cardFactories.has(id));
    if (!existing.length) return;

    const title = (typeof str_Favorites !== "undefined" && str_Favorites) ? str_Favorites : "Favorites";
    const { section, grid } = makeSection(title, "", FAV_SECTION_KEY, false);

    for (const id of existing) {
      try {
        const c = cardFactories.get(id)();
        grid.append(c);
      } catch (e) { console.error(e); }
    }

    if (grid.childNodes.length > 0) root.append(section);
  }

  // ---------- renderAll ----------

  function renderAll() {
    ensureHeaderMask();
    document.documentElement.classList.add("myio-noanim");
    ensureShell();

    cardFactories.clear();

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

    if (typeof window.myioApplySavedSectionOrder === "function") {
      window.myioApplySavedSectionOrder();
    }
    if (typeof window.myioApplySavedCardOrder === "function") {
      window.myioApplySavedCardOrder();
    }
    if (typeof window.myioApplySavedSectionOrder === "function") {
      window.myioApplySavedSectionOrder();
    }

    if (!root.children.length) {
      const { section, grid } = makeSection("Nincs megjeleníthető adat", "Ellenőrizd a szerver változókat / konzolt");
      const c = card("Tippek", "myio-off", "tips:0");
      addValue(c, "—");
      c.append(el("div", { class: "myio-sub", text: "Ha a body nem látszik: style.css-ben body{display:block!important}" }));
      grid.append(c);
      root.append(section);
    }

    requestAnimationFrame(() => {
      document.documentElement.classList.remove("myio-noanim");
    });

    try { window.onpageshow = () => window.scrollTo(x, y); } catch { }
    try { enableThumbOnlyRanges(document); } catch { }
    try { if (myioRO) myioRO.observe(document.body); } catch { }
    
    // ÚJDONSÁG: Long-press handlers telepítése minden rendernél
    setupLongPressHandlers();
  }

  // ---------- Section drag & drop ----------

  function setupSectionReorder() {
    if (window.__myioReorderInited) return;
    window.__myioReorderInited = true;

    const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
    const ORDER_KEY = `myio.sections.order.${scope}`;

    const container = document.querySelector("#myio-root");
    if (!container) return;

    const getSections = () => Array.from(container.querySelectorAll(":scope > .myio-section"))
      .filter(s => !!s.dataset.key);

    const save = () => {
      const keys = getSections().map(s => s.dataset.key);
      localStorage.setItem(ORDER_KEY, JSON.stringify(keys));
    };

    const applySavedOrder = () => {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch { }

      const sections = getSections();
      const map = new Map(sections.map(s => [s.dataset.key, s]));

      const favKey = FAV_SECTION_KEY;
      
      const cleaned = saved.filter(k => map.has(k));
      const used = new Set(cleaned);

      for (const k of cleaned) container.appendChild(map.get(k));
      for (const s of sections) {
        if (!used.has(s.dataset.key)) container.appendChild(s);
      }
    };

    applySavedOrder();
    window.myioApplySavedSectionOrder = applySavedOrder;

    let draggingElement = null;
    let isAnimating = false;
    let ghostImage = null;
    let lastSwapTime = 0;
    let originalGhostLeft = 0;
    let dragHandleOffsetY = 0;

    function createGhostImage(element, clientX, clientY) {
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      document.addEventListener('dragstart', function (e) {
        if (e.target.closest('.myio-section')) {
          e.dataTransfer.setDragImage(img, 0, 0);
        }
      }, { once: true });

      const rect = element.getBoundingClientRect();
      ghostImage = element.cloneNode(true);

      const containerRect = container.getBoundingClientRect();
      originalGhostLeft = rect.left - containerRect.left;

      const dragHandle = element.querySelector('.myio-dragHandle');
      if (dragHandle) {
        const handleRect = dragHandle.getBoundingClientRect();
        dragHandleOffsetY = clientY - handleRect.top;
      } else {
        dragHandleOffsetY = clientY - rect.top;
      }

      ghostImage.style.position = 'fixed';
      ghostImage.style.left = rect.left + 'px';
      ghostImage.style.top = rect.top + 'px';
      ghostImage.style.width = rect.width + 'px';
      ghostImage.style.opacity = '0.7';
      ghostImage.style.pointerEvents = 'none';
      ghostImage.style.zIndex = '10000';
      ghostImage.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
      ghostImage.style.transform = 'scale(1.02)';
      ghostImage.classList.add('myio-ghost');


      const handle = ghostImage.querySelector('.myio-dragHandle');
      if (handle) handle.style.display = 'none';

      const allHandles = ghostImage.querySelectorAll('.myio-dragHandle');
      allHandles.forEach(h => h.style.display = 'none');

      document.body.appendChild(ghostImage);
    }

    function updateGhostPosition(e) {
      if (!ghostImage || !draggingElement) return;

      const containerRect = container.getBoundingClientRect();
      const fixedLeft = containerRect.left + originalGhostLeft;
      const ghostTop = e.clientY - dragHandleOffsetY;

      ghostImage.style.left = fixedLeft + 'px';
      ghostImage.style.top = ghostTop + 'px';

      checkForSwap(e.clientY);
    }

    function removeGhostImage() {
      if (ghostImage) {
        ghostImage.remove();
        ghostImage = null;
        originalGhostLeft = 0;
        dragHandleOffsetY = 0;
      }
    }

    function checkForSwap(ghostY) {
      if (!draggingElement || isAnimating || Date.now() - lastSwapTime < 200) return;

      const sections = Array.from(container.querySelectorAll(".myio-section:not(.is-dragging)"));
      if (!ghostImage) return;

      const ghostRect = ghostImage.getBoundingClientRect();

      for (const section of sections) {
        if (section === draggingElement) continue;

        const sectionRect = section.getBoundingClientRect();

        const isOverlapping = !(
          ghostRect.bottom < sectionRect.top ||
          ghostRect.top > sectionRect.bottom
        );

        if (!isOverlapping) continue;

        const overlapTop = Math.max(ghostRect.top, sectionRect.top);
        const overlapBottom = Math.min(ghostRect.bottom, sectionRect.bottom);
        const overlapHeight = Math.max(0, overlapBottom - overlapTop);

        if (overlapHeight >= 45) {
          const overlapWithTop = Math.max(0, ghostRect.bottom - sectionRect.top);
          const overlapWithBottom = Math.max(0, sectionRect.bottom - ghostRect.top);

          let before;
          if (overlapWithTop >= overlapWithBottom) before = true;
          else before = false;

          performSwap(draggingElement, section, before);
          lastSwapTime = Date.now();
          break;
        }
      }
    }

    function performSwap(draggingElement, targetElement, before) {
      if (isAnimating) return;
      isAnimating = true;

      const allSections = Array.from(container.querySelectorAll(".myio-section"));
      const sectionsWithoutDragging = allSections.filter(s => s !== draggingElement);

      const targetIndex = sectionsWithoutDragging.indexOf(targetElement);
      const newOrder = [...sectionsWithoutDragging];

      if (before) newOrder.splice(targetIndex, 0, draggingElement);
      else newOrder.splice(targetIndex + 1, 0, draggingElement);

      const startPositions = new Map();
      allSections.forEach(section => {
        const rect = section.getBoundingClientRect();
        startPositions.set(section, { y: rect.top, height: rect.height });
      });

      container.innerHTML = '';
      newOrder.forEach(section => container.appendChild(section));

      container.style.minHeight = container.offsetHeight + 'px';

      allSections.forEach(section => {
        if (!startPositions.has(section)) return;

        const start = startPositions.get(section);
        const end = section.getBoundingClientRect();
        const deltaY = start.y - end.y;

        if (deltaY !== 0) {
          section.style.transform = `translateY(${deltaY}px)`;
          section.style.transition = 'transform 0s';
          section.style.zIndex = section === draggingElement ? '1000' : '1';

          section.offsetHeight;

          requestAnimationFrame(() => {
            section.style.transition = 'transform 150ms ease-out';
            section.style.transform = 'translateY(0)';

            setTimeout(() => {
              section.style.transition = '';
              section.style.zIndex = '';
              if (section === draggingElement) {
                isAnimating = false;
                container.style.minHeight = '';
              }
            }, 150);
          });
        } else {
          if (section === draggingElement) {
            isAnimating = false;
            container.style.minHeight = '';
          }
        }
      });
    }

    container.addEventListener("dragstart", (e) => {
      const section = e.target.closest(".myio-section");
      if (!section) return;

      if (section.dataset.dragok !== "1") {
        e.preventDefault();
        return;
      }

      draggingElement = section;
      section.classList.add("is-dragging");

      createGhostImage(section, e.clientX, e.clientY);

      e.dataTransfer.setData("text/plain", section.dataset.key || "");
      e.dataTransfer.effectAllowed = "move";

      const img = new Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    });

    document.addEventListener("dragover", (e) => {
      if (!draggingElement) return;
      e.preventDefault();
      updateGhostPosition(e);
    });

    container.addEventListener("dragover", (e) => {
      if (!draggingElement) return;
      e.preventDefault();
    });

    container.addEventListener("dragend", (e) => {
      if (draggingElement) {
        draggingElement.classList.remove("is-dragging");
        removeGhostImage();

        container.querySelectorAll(".myio-section").forEach(s => {
          s.style.transform = "";
          s.style.transition = "";
          s.style.zIndex = "";
        });

        draggingElement = null;
        save();
      }
      e.preventDefault();
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
    });
  }
// ---------- Card reorder inside sections (long-press on empty area) ----------

  function setupCardReorder() {
    let scrollYBeforeDrag = 0;

    function lockScroll() {
      scrollYBeforeDrag = window.scrollY || document.documentElement.scrollTop || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYBeforeDrag}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    
    function unlockScroll() {
      const y = scrollYBeforeDrag || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, y);
    }
    
    // iOS miatt: csak drag közben, nem-passzív touchmove prevent
    function preventTouchMove(e) { e.preventDefault(); }
    if (window.__myioCardReorderInited) return;
    window.__myioCardReorderInited = true;

    const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";

    const root = document.querySelector("#myio-root");
    if (!root) return;

    const getSectionGrids = () => Array.from(root.querySelectorAll(".myio-section")).map(sec => {
      const grid = sec.querySelector(".myio-grid");
      return { sec, grid };
    }).filter(x => x.sec && x.grid && x.sec.dataset.key);

    const orderKeyForSection = (sectionKey) => `myio.cards.order.${scope}.${sectionKey}`;

    const getCards = (grid) =>
      Array.from(grid.querySelectorAll(":scope > .myio-card"))
        .filter(c => !!c.dataset.cardid); // csak azonosítható kártyákat mentünk/rendezünk

    const saveGridOrder = (sectionKey, grid) => {
      const ids = getCards(grid).map(c => c.dataset.cardid);
      try { localStorage.setItem(orderKeyForSection(sectionKey), JSON.stringify(ids)); } catch { }
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
      for (const { sec, grid } of getSectionGrids()) {
        applySavedOrderForGrid(sec.dataset.key, grid);
      }
    };
    applyAll();
    window.myioApplySavedCardOrder = applyAll;

    // kívülről hívható: Favorites szekciót első helyre teszi a mentett orderben
    window.myioMoveSectionToTop = (sectionKey) => {
      if (!sectionKey) return;
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]"); } catch {}
      // vedd ki, ha benne van
      saved = saved.filter(k => k !== sectionKey);
      // tedd az elejére
      saved.unshift(sectionKey);
      try { localStorage.setItem(ORDER_KEY, JSON.stringify(saved)); } catch {}
    };


    // ---- drag state (one active at a time) ----
    const LP_MS = 500;
    const MOVE_PX = 10;

    let lpTimer = null;
    let lpStartX = 0, lpStartY = 0;
    let lpMoved = false;

    let draggingCard = null;
    let draggingGrid = null;
    let draggingSectionKey = null;

    let ghost = null;
    let dragOffsetX = 0, dragOffsetY = 0;
    let originalLeft = 0;
    let isAnimating = false;
    let lastSwapTime = 0;

    function isInteractiveTarget(t) {
      if (!t) return false;
      return !!t.closest(
        ".myio-cardTitle, .myio-headRow, .myio-headTitleBtn, .myio-titleBtn," +
        "button, a, input, textarea, select, label, .myio-btnRow, .myio-miniToggle, .myio-pcaRow," +
        ".myio-thermo-circular, .myio-thermo-handle, .myio-thermo-svg, .myio-thermo-btn, .myio-thermo-buttons"
      );
    }

    function pickCardEmptyAreaTarget(e) {
      const card = e.target.closest(".myio-card");
      if (!card) return null;
      // csak ha üres rész: ne title, ne gombok/slider stb.
      if (isInteractiveTarget(e.target)) return null;
      // ha van szöveg kijelölés stb. -> ne
      return card.dataset.cardid ? card : null;
    }

    function createGhost(card, clientX, clientY) {
      const rect = card.getBoundingClientRect();
      const gridRect = draggingGrid.getBoundingClientRect();

      ghost = card.cloneNode(true);
      ghost.classList.add("myio-ghost");
      ghost.style.position = "fixed";
      ghost.style.left = rect.left + "px";
      ghost.style.top = rect.top + "px";
      ghost.style.width = rect.width + "px";
      ghost.style.height = rect.height + "px";
      ghost.style.opacity = "0.72";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "10000";
      ghost.style.boxShadow = "0 10px 26px rgba(0,0,0,0.35)";
      ghost.style.transform = "scale(1.02)";

      ghost.style.visibility = "visible";

      originalLeft = rect.left - gridRect.left;
      dragOffsetX = clientX - rect.left;
      dragOffsetY = clientY - rect.top;

      // a ghost-on ne látszódjanak a drag handlek (ha valahol lennének)
      ghost.querySelectorAll(".myio-dragHandle").forEach(h => (h.style.display = "none"));

      document.body.appendChild(ghost);
    }

    function removeGhost() {
      if (ghost) ghost.remove();
      ghost = null;
      originalLeft = 0;
      dragOffsetX = 0;
      dragOffsetY = 0;
    }

    function updateGhostPosition(clientX, clientY) {
      if (!ghost || !draggingCard || !draggingGrid) return;

      const gridRect = draggingGrid.getBoundingClientRect();
      const fixedLeft = gridRect.left + originalLeft;

      const minX = gridRect.left - 10;
      const maxX = gridRect.right - ghost.offsetWidth + 10;
      
      const x = Math.min(maxX, Math.max(minX, clientX - dragOffsetX));
      ghost.style.left = x + "px";

      ghost.style.top = (clientY - dragOffsetY) + "px";

      checkSwap();
    }

    function checkSwap() {
      if (!draggingCard || !ghost || isAnimating || Date.now() - lastSwapTime < 120) return;

      const cards = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card:not(.is-dragging)"))
        .filter(c => !!c.dataset.cardid);

      if (!cards.length) return;

      const g = ghost.getBoundingClientRect();
      const gx = g.left + g.width / 2;
      const gy = g.top + g.height / 2;

      // aktuális sorrend (row-major) a DOM alapján
      const current = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card"))
        .filter(c => !!c.dataset.cardid);

      const oldIndex = current.indexOf(draggingCard);

      // cél index meghatározása: ghost közepe hol lenne a többiekhez képest
      const indexed = cards.map(c => {
        const r = c.getBoundingClientRect();
        return { c, cx: r.left + r.width / 2, cy: r.top + r.height / 2, top: r.top, left: r.left };
      });

      // row-major rendezés (vizuális sorrend)
      // kis tolerancia, hogy ugyanabban a sorban maradjon
      const rowTol = Math.max(12, g.height * 0.35);
      indexed.sort((a, b) => (Math.abs(a.top - b.top) <= rowTol) ? (a.left - b.left) : (a.top - b.top));

      // beszúrási pont: első olyan elem, ami "után" vagyunk (gy, gx alapján)
      let insertBeforeEl = null;
      for (const it of indexed) {
        const sameRow = Math.abs(it.cy - gy) <= rowTol;
        if (gy < it.cy - rowTol || (sameRow && gx < it.cx)) {
          insertBeforeEl = it.c;
          break;
        }
      }

      // newIndex kiszámolása a *teljes* current listában
      let newIndex;
      if (!insertBeforeEl) {
        newIndex = current.length - 1; // legvégére
      } else {
        newIndex = current.indexOf(insertBeforeEl);
      }

      // ha a drag elem kivétele miatt "átcsúszik" az index
      if (oldIndex !== -1 && newIndex > oldIndex) newIndex--;

      if (newIndex === oldIndex || newIndex < 0) return;

      performReorderToIndex(newIndex);
      lastSwapTime = Date.now();
    }


    function performReorderToIndex(newIndex) {
      if (isAnimating) return;
      isAnimating = true;
    
      const all = Array.from(draggingGrid.querySelectorAll(":scope > .myio-card"))
        .filter(c => !!c.dataset.cardid);
    
      const oldIndex = all.indexOf(draggingCard);
      if (oldIndex < 0) { isAnimating = false; return; }
    
      const startPos = new Map();
      all.forEach(c => {
        const r = c.getBoundingClientRect();
        startPos.set(c, { x: r.left, y: r.top });
      });
    
      // új sorrend
      const reordered = all.slice();
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, draggingCard);
    
      // DOM frissítés
      reordered.forEach(c => draggingGrid.appendChild(c));
    
      // FLIP anim
      reordered.forEach(c => {
        const s = startPos.get(c);
        if (!s) return;
        const e = c.getBoundingClientRect();
        const dx = s.x - e.left;
        const dy = s.y - e.top;
    
        if (dx || dy) {
          c.style.transform = `translate(${dx}px, ${dy}px)`;
          c.style.transition = "transform 0s";
          c.style.zIndex = (c === draggingCard) ? "1000" : "1";
          c.offsetHeight;
    
          requestAnimationFrame(() => {
            c.style.transition = "transform 150ms ease-out";
            c.style.transform = "translate(0,0)";
          });
        }
      });
    
      setTimeout(() => {
        reordered.forEach(c => {
          c.style.transition = "";
          c.style.transform = "";
          c.style.zIndex = "";
        });
        isAnimating = false;
      }, 170);
    }
    

    function startDrag(card, clientX, clientY) {
      isDraggingCard = true;
      draggingCard = card;
      draggingGrid = card.closest(".myio-grid");
      const sec = card.closest(".myio-section");
      draggingSectionKey = sec ? sec.dataset.key : null;

      if (!draggingGrid || !draggingSectionKey) {
        draggingCard = null; draggingGrid = null; draggingSectionKey = null;
        return;
      }

      card.classList.add("is-dragging");
      card.style.visibility = "hidden"; // helyét tartja, de ne duplázódjon
      createGhost(card, clientX, clientY);
      // scroll tiltás drag közben
      lockScroll();
      document.addEventListener("touchmove", preventTouchMove, { passive: false });

      // csak a gridre tedd a touch-action none-t (nem html/body)
      try { draggingGrid.style.touchAction = "none"; } catch {}
      try { draggingCard.style.touchAction = "none"; } catch {}

      // pointer capture (a pointerId-t lent tároljuk)
      try { draggingCard.setPointerCapture(draggingCard.__myioPointerId); } catch {}

      // pointer capture (mobilon kulcs)
      try { card.setPointerCapture(card.__myioPointerId); } catch {}

      // kis haptika
      try { if (navigator.vibrate) navigator.vibrate(20); } catch { }
    }

    function endDrag() {
      isDraggingCard = false;
      document.removeEventListener("touchmove", preventTouchMove, { passive: false });
      unlockScroll();

      if (draggingGrid) draggingGrid.style.touchAction = "";
      if (draggingCard) {
        try { draggingCard.releasePointerCapture(draggingCard.__myioPointerId); } catch {}
        draggingCard.style.touchAction = "";
        draggingCard.__myioPointerId = null;
      }
      if (draggingCard) {
        draggingCard.classList.remove("is-dragging");
        draggingCard.style.visibility = "";
      }
      removeGhost();

      if (draggingSectionKey && draggingGrid) {
        saveGridOrder(draggingSectionKey, draggingGrid);
      }
      // scroll vissza
      document.documentElement.classList.remove("myio-noscroll");
      try { document.body.style.overscrollBehavior = ""; } catch {}

      if (draggingCard) {
        try { draggingCard.releasePointerCapture(draggingCard.__myioPointerId); } catch {}
        draggingCard.style.touchAction = ""; // vissza
        draggingCard.__myioPointerId = null;
      }

      draggingCard = null;
      draggingGrid = null;
      draggingSectionKey = null;
    }

    // ---- global pointer handlers (capture) ----
    function clearLP() {
      if (lpTimer) clearTimeout(lpTimer);
      lpTimer = null;
      lpMoved = false;
    }

    document.addEventListener("pointerdown", (e) => {
      // csak bal gomb / touch
      if (e.pointerType === "mouse" && e.button !== 0) return;

      const card = pickCardEmptyAreaTarget(e);
      if (!card) return;
      card.__myioPointerId = e.pointerId;
      card.style.touchAction = "none";          // drag alatt ne scrollozzon

      card.__myioPointerId = e.pointerId;

      // long-press indítás
      clearLP();
      lpStartX = e.clientX;
      lpStartY = e.clientY;
      lpMoved = false;

      lpTimer = setTimeout(() => {
        // ha közben scroll / mozgás volt, ne induljon
        if (lpMoved) return;
        startDrag(card, e.clientX, e.clientY);
      }, LP_MS);
    }, { passive: true });

    document.addEventListener("pointermove", (e) => {
      // ha épp drag megy: mozgatjuk a ghostot
      if (draggingCard) {
        e.preventDefault();
        updateGhostPosition(e.clientX, e.clientY);
        return;
      }

      // long-press előtti cancel mozgásra (scroll-safe)
      if (!lpTimer || isDraggingCard) return;
      const dx = Math.abs(e.clientX - lpStartX);
      const dy = Math.abs(e.clientY - lpStartY);
      if (dx > MOVE_PX || dy > MOVE_PX) {
        lpMoved = true;
        clearLP();
      }
    }, { passive: false });

    document.addEventListener("pointerup", () => {
      clearLP();
      if (draggingCard) endDrag();
    }, { passive: true });

    document.addEventListener("pointercancel", () => {
      clearLP();
      if (draggingCard) endDrag();
    }, { passive: true });

    // biztonság: ha valami miatt elmaradna
    window.addEventListener("blur", () => {
      clearLP();
      if (draggingCard) endDrag();
    });
  }

  // ---------- Header mask ----------

  function ensureHeaderMask() {
    if (document.querySelector(".myio-headerMask")) return;

    const m = document.createElement("div");
    m.className = "myio-headerMask";
    document.body.appendChild(m);

    const update = () => {
      const h = document.querySelector(".header");
      if (!h) return;
      const px = Math.max(60, Math.ceil(h.getBoundingClientRect().height));
      document.documentElement.style.setProperty("--myio-header-h", px + "px");
    };

    update();
    requestAnimationFrame(update);
    setTimeout(update, 0);
    setTimeout(update, 50);
    setTimeout(update, 150);
    setTimeout(update, 350);
    setTimeout(update, 800);

    if (typeof myioRO !== "undefined" && myioRO) {
      const t = document.querySelector(".myio-wrap") || document.body;
      if (t) myioRO.observe(t);
    }

    window.addEventListener("load", update);
    window.addEventListener("resize", update);
  }

  // ========================================================================
  // SCROLL-SAFE LONG PRESS + SETTINGS MODAL
  // ========================================================================
  
  const LONG_PRESS_DURATION = 500; // ms
  const MOVE_THRESHOLD = 10; // px
  
  let longPressTimer = null;
  let pressStartX = 0;
  let pressStartY = 0;
  let longPressDetected = false;
  let currentCard = null;
  
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function openSettingsModal(card) {
    const cardId = card.dataset.cardid || 'unknown';
    const titleEl = card.querySelector('.myio-headTitleBtn') || card.querySelector('.myio-cardTitle');
    
    // Kinyerjük a tiszta nevet (ikon nélkül)
    let currentName = '';
    if (titleEl) {
      // Csak a text node-okat vesszük
      const textNodes = Array.from(titleEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
      currentName = textNodes.map(n => n.textContent).join('').trim();
    }
    
    const currentIcon = loadCardIcon(cardId) || '☆';
    
    // Megjegyzés betöltése (ha van)
    const NOTES_KEY = myioNS + ".card.notes";
    let currentNote = '';
    try {
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      currentNote = notes[cardId] || '';
    } catch {}
    
    // Modal HTML
    const overlay = document.createElement('div');
    overlay.className = 'myio-settings-overlay';
    overlay.innerHTML = `
      <div class="myio-settings-modal">
        <div class="myio-settings-header">
          <div>
            <h3 class="myio-settings-title">Kártya beállítások</h3>
            <p class="myio-settings-subtitle">ID: ${escapeHtml(cardId)}</p>
          </div>
          <button class="myio-settings-close" type="button">×</button>
        </div>
        
        <div class="myio-settings-content">
          <div class="myio-setting-row">
            <label class="myio-setting-label">Kártya neve</label>
            <input type="text" class="myio-setting-input myio-card-name-input" 
                   value="${escapeHtml(currentName)}" 
                   placeholder="Kártya neve">
          </div>
          
          <div class="myio-setting-row">
            <label class="myio-setting-label">Választott ikon</label>
            <div class="myio-setting-description">Ez az ikon a kedvenc csillag alatt fog megjelenni</div>
            <div class="myio-selected-icon-display" style="font-size: 44px; text-align: center; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 12px; margin: 10px 0;">
              ${escapeHtml(currentIcon)}
            </div>
          </div>
          
          <div class="myio-setting-row myio-icon-picker-row">
            <label class="myio-setting-label">Válassz ikont</label>
            <div class="myio-setting-description">Kattints egy ikonra a kiválasztáshoz</div>
            <div class="myio-icon-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; margin-top: 10px;">
              ${['🏠', '💡', '🚪', '🪟', '🔥', '❄️', '🌙', '🌞', '🌡️', '💧','🔼','🔽','▶','◀','↔','↕', '🛏', '🛋', '🛁', '🚽', '🚿', '🔌', '⚡', '🔋', '📶', '📡', '🎛️', '⚙️', '🔧',
                 '🔒', '📺', '🚨', '❗', '📱', '🖥️', '🎯', '🧯', '🕒', '🎨', '🪟', '🚪', '🚗', '🏡', '🥷', '📟', '🔦','🗿','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']
                .map(icon => `<button class="myio-icon-option ${icon === currentIcon ? 'is-selected' : ''}" data-icon="${icon}" style="padding: 15px; font-size: 28px; background: ${icon === currentIcon ? 'rgba(3,151,214,0.3)' : 'rgba(255,255,255,0.08)'}; border: 2px solid ${icon === currentIcon ? 'var(--accent)' : 'rgba(255,255,255,0.12)'}; border-radius: 10px; cursor: pointer; transition: all 0.2s;">${icon}</button>`)
                .join('')}
            </div>
          </div>
          
          <div class="myio-setting-row">
            <label class="myio-setting-label">Megjegyzés</label>
            <div class="myio-setting-description">Személyes jegyzet az eszközhöz</div>
            <textarea class="myio-setting-textarea myio-setting-input" 
                      rows="3" 
                      placeholder="Írj megjegyzést...">${escapeHtml(currentNote)}</textarea>
          </div>
        </div>
        
        <div class="myio-settings-footer">
          <button class="myio-settings-btn myio-settings-btn-secondary myio-settings-cancel" type="button">Mégse</button>
          <button class="myio-settings-btn myio-settings-btn-primary myio-settings-save" type="button">💾 Mentés</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    // Ikon picker alapból rejtve
    const iconPickerRow = overlay.querySelector('.myio-icon-picker-row');
    if (iconPickerRow) iconPickerRow.style.display = 'none';

    // Kattintás a kiválasztott ikonra -> picker toggle
    const selectedIconBox = overlay.querySelector('.myio-selected-icon-display');
    if (selectedIconBox && iconPickerRow) {
      selectedIconBox.style.cursor = 'pointer';
      selectedIconBox.title = 'Kattints az ikon választáshoz';
      selectedIconBox.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = iconPickerRow.style.display === 'none';
        iconPickerRow.style.display = isHidden ? '' : 'none';
      });
    }
    
    // Animáció
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
    });
    
    // Bezárás
    const closeModal = () => {
      overlay.classList.remove('is-open');
      setTimeout(() => overlay.remove(), 300);
    };
    
    // Eseménykezelők
    const closeBtn = overlay.querySelector('.myio-settings-close');
    const cancelBtn = overlay.querySelector('.myio-settings-cancel');
    const saveBtn = overlay.querySelector('.myio-settings-save');
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Kattintás a háttérre
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    // ESC billentyű
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Ikon választás
    overlay.querySelectorAll('.myio-icon-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.dataset.icon;
        overlay.querySelector('.myio-selected-icon-display').textContent = icon;
        
        // Highlight
        overlay.querySelectorAll('.myio-icon-option').forEach(b => {
          b.style.background = 'rgba(255,255,255,0.08)';
          b.style.borderColor = 'rgba(255,255,255,0.12)';
          b.classList.remove('is-selected');
        });
        btn.style.background = 'rgba(3,151,214,0.3)';
        btn.style.borderColor = 'var(--accent)';
        btn.classList.add('is-selected');
      });
    });
    
    // Mentés
    saveBtn.addEventListener('click', () => {
      const newName = overlay.querySelector('.myio-card-name-input').value.trim();
      const newIcon = overlay.querySelector('.myio-selected-icon-display').textContent.trim();
      const newNote = overlay.querySelector('.myio-setting-textarea').value.trim();
      
      if (!newName) {
        toast('Az eszköz neve nem lehet üres!');
        return;
      }
      
      // Név mentése
      saveCardName(cardId, newName);
      
      // Ikon mentése
      saveCardIcon(cardId, newIcon);
      
      // Megjegyzés mentése
      try {
        const NOTES_KEY = myioNS + ".card.notes";
        const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
        if (newNote) {
          notes[cardId] = newNote;
        } else {
          delete notes[cardId];
        }
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      } catch(e) {
        console.error('Note save error:', e);
      }
      
      closeModal();
      
      // Teljes újrarajzolás, hogy az ikon wrapper frissüljön
      renderAll();
      
      toast('✅ Mentve!');
    });
  }
  
  function setupLongPressHandlers() {
    const titleButtons = document.querySelectorAll('.myio-cardTitle');
    
    titleButtons.forEach(btn => {
      // Ha már van handler, ne duplikáljuk
      if (btn.dataset.longpressAttached) return;
      btn.dataset.longpressAttached = 'true';
      
      // ===== TOUCH események (mobil) =====
      
      const startPressTouch = (e) => {
        pressStartX = e.touches[0].clientX;
        pressStartY = e.touches[0].clientY;
        longPressDetected = false;
        currentCard = btn.closest('.myio-card');
        
        if (currentCard) {
          currentCard.classList.add('is-longpress-active');
        }
        
        longPressTimer = setTimeout(() => {
          longPressDetected = true;
          
          // Vibráció (ha támogatott)
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
          
          // Modal megnyitása
          if (currentCard) {
            openSettingsModal(currentCard);
          }
        }, LONG_PRESS_DURATION);
      };
      
      const movePressTouch = (e) => {
        if (!longPressTimer) return;
        
        const moveX = Math.abs(e.touches[0].clientX - pressStartX);
        const moveY = Math.abs(e.touches[0].clientY - pressStartY);
        
        // Ha túl sokat mozgott → scroll, töröljük a timert
        if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          longPressDetected = false;
          if (currentCard) {
            currentCard.classList.remove('is-longpress-active');
          }
        }
      };
      
      const endPressTouch = (e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        
        if (currentCard) {
          currentCard.classList.remove('is-longpress-active');
        }
        
        currentCard = null;
      };
      
      const cancelPressTouch = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        if (currentCard) {
          currentCard.classList.remove('is-longpress-active');
        }
        longPressDetected = false;
        currentCard = null;
      };
      
      // ===== MOUSE események (desktop) =====
      
      const startPressMouse = (e) => {
        pressStartX = e.clientX;
        pressStartY = e.clientY;
        longPressDetected = false;
        currentCard = btn.closest('.myio-card');
        
        if (currentCard) {
          currentCard.classList.add('is-longpress-active');
        }
        
        longPressTimer = setTimeout(() => {
          longPressDetected = true;
          
          // Modal megnyitása
          if (currentCard) {
            openSettingsModal(currentCard);
          }
        }, LONG_PRESS_DURATION);
      };
      
      const movePressMouse = (e) => {
        if (!longPressTimer) return;
        
        const moveX = Math.abs(e.clientX - pressStartX);
        const moveY = Math.abs(e.clientY - pressStartY);
        
        // Ha túl sokat mozgott → töröljük a timert
        if (moveX > MOVE_THRESHOLD || moveY > MOVE_THRESHOLD) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
          longPressDetected = false;
          if (currentCard) {
            currentCard.classList.remove('is-longpress-active');
          }
        }
      };
      
      const endPressMouse = (e) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        
        if (currentCard) {
          currentCard.classList.remove('is-longpress-active');
        }
        
        currentCard = null;
      };
      
      // Touch események
      btn.addEventListener('touchstart', startPressTouch, { passive: true });
      btn.addEventListener('touchmove', movePressTouch, { passive: true });
      btn.addEventListener('touchend', endPressTouch);
      btn.addEventListener('touchcancel', cancelPressTouch);
      
      // Mouse események (desktop)
      btn.addEventListener('mousedown', startPressMouse);
      btn.addEventListener('mousemove', movePressMouse);
      btn.addEventListener('mouseup', endPressMouse);
      btn.addEventListener('mouseleave', endPressMouse);
      
      // Kattintás elnyomása long press esetén
      btn.addEventListener('click', (e) => {
        if (longPressDetected) {
          e.preventDefault();
          e.stopPropagation();
          longPressDetected = false; // reset
        }
      }, true);
    });
  }

  // ---------- start ----------

  const start = () => { renderAll(); };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

})();

// idáig jó
