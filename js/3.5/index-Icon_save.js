
/* index.js – Modern reszponzív dashboard
   MÓDOSÍTVA: scroll-safe long-press + ikon tárolás localStorage-ban
*/

const myioNS = "myio." + String((typeof MYIOname !== "undefined" && MYIOname) ? MYIOname : "default")
  .toLowerCase()
  .trim()
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

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

      toggleFav(cardId);

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

    function appendThermoChipsEditable(cardEl, onVal, offVal, onName, offName, unitText) {
      const chips = el("div", { class: "myio-thermoChips" }, [
        el("div", { class: "myio-chip" }, [
          el("div", { class: "k", text: (str_On || "On") }),
          el("div", { class: "v" }, [
            el("input", {
              type: "number",
              min: "0",
              max: "1000",
              value: String(onVal),
              name: onName,
              onchange: (e) => changed(e.target, e.target.name, 10)
            }),
            document.createTextNode(" " + unitText)
          ])
        ]),
        el("div", { class: "myio-chip" }, [
          el("div", { class: "k", text: (str_Off || "Off") }),
          el("div", { class: "v" }, [
            el("input", {
              type: "number",
              min: "0",
              max: "1000",
              value: String(offVal),
              name: offName,
              onchange: (e) => changed(e.target, e.target.name, 10)
            }),
            document.createTextNode(" " + unitText)
          ])
        ])
      ]);

      cardEl.append(chips);
    }

    function appendThermoChipsRO(cardEl, onVal, offVal, unitText) {
      const chips = el("div", { class: "myio-thermoChips" }, [
        el("div", { class: "myio-chip" }, [
          el("div", { class: "k", text: (str_On || "On") }),
          el("div", { class: "v", text: String(onVal) + " " + unitText })
        ]),
        el("div", { class: "myio-chip" }, [
          el("div", { class: "k", text: (str_Off || "Off") }),
          el("div", { class: "v", text: String(offVal) + " " + unitText })
        ])
      ]);
      cardEl.append(chips);
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
          if (isActive) {
            if (typeof PCA_min_temp_ON !== "undefined" && typeof PCA_max_temp_OFF !== "undefined") {
              if (PCA_min_temp_ON[i] < PCA_max_temp_OFF[i]) status = "myio-on myio-heat";
              else if (PCA_max_temp_OFF[i] < PCA_min_temp_ON[i]) status = "myio-on myio-cool";
              else status = "myio-on";
            } else {
              status = "myio-on";
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

          if (PCAWrite[i]) {
            appendThermoChipsEditable(
              c,
              onTh,
              offTh,
              "PCA_temp_MIN*" + (i + 1),
              "PCA_temp_MAX*" + (i + 1),
              unitText
            );
          } else {
            appendThermoChipsRO(c, onTh, offTh, unitText);
          }

          c.append(el("div", { class: "myio-sensorLine" }, [
            el("div", { class: "name", text: sensor.name }),
            el("div", { class: "val", text: String(sensor.value) + " " + sensor.unit })
          ]));

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
          if (isOn) {
            if (typeof min_temp_ON !== "undefined" && typeof max_temp_OFF !== "undefined") {
              if (min_temp_ON[i] < max_temp_OFF[i]) status = "myio-on myio-heat";
              else if (max_temp_OFF[i] < min_temp_ON[i]) status = "myio-on myio-cool";
              else status = "myio-on";
            } else {
              status = "myio-on";
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

          if (writable) {
            appendThermoChipsEditable(
              c,
              onTh,
              offTh,
              "min_temp_ON*" + (i + 1),
              "max_temp_OFF*" + (i + 1),
              unitText
            );
          } else {
            appendThermoChipsRO(c, onTh, offTh, unitText);
          }

          c.append(el("div", { class: "myio-sensorLine" }, [
            el("div", { class: "name", text: sensor.name }),
            el("div", { class: "val", text: String(sensor.value) + " " + sensor.unit })
          ]));

          return c;
        };

        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }

    if (grid.childNodes.length > 0) root.append(section);
  }
  
  function renderFavorites(root) {
    const favs = loadFavs();
    if (!favs.length) return;

    const existing = favs.filter(id => cardFactories.has(id));
    if (!existing.length) return;

    const title = (typeof str_Favorites !== "undefined" && str_Favorites) ? str_Favorites : "Favorites";
    const { section, grid } = makeSection(title, "", FAV_SECTION_KEY, true);

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
            <div class="myio-selected-icon-display" style="font-size: 48px; text-align: center; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; margin: 10px 0;">
              ${escapeHtml(currentIcon)}
            </div>
          </div>
          
          <div class="myio-setting-row myio-icon-picker-row">
            <label class="myio-setting-label">Válassz ikont</label>
            <div class="myio-setting-description">Kattints egy ikonra a kiválasztáshoz</div>
            <div class="myio-icon-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; margin-top: 10px;">
              ${['🏠','🚪','🪟','🔥','❄️','🌡️','💧','🚿','💡','🔌','⚡','🔋','📶','📡','🎛️','⚙️','🔧','🔒','📷','🚨','📱','🖥️','🎯','🕒','🌙','🌞','🎨','🪟','⬆️','⬇️','🚪','🚗','🏡']
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