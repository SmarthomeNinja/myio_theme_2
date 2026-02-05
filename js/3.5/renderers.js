/* renderers.js – Szekciók renderelése */

(function() {
  const { el, decodeRW, safe } = window.myioUtils;
  const { loadFavs } = window.myioStorage;
  const { card, cardWithInvTitle, addValue, addButtons, setCardHeaderWithInvAndToggle, registerCardFactory, getCardFactory, hasCardFactory } = window.myioCards;
  const { makeSection } = window.myioSections;
  const FAV_SECTION_KEY = window.myioStorage.FAV_SECTION_KEY;

  // --- Sunrise/Sunset SVG ikonok ---
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgIcon(pathsOrBuilder, viewBox = "0 0 24 24") {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    if (typeof pathsOrBuilder === "function") {
      pathsOrBuilder(svg);
    }
    return svg;
  }

  function sunriseSVG() {
    return svgIcon((svg) => {
      // ---- sun (filled half circle) ----
      const sun = document.createElementNS(SVG_NS, "path");
      sun.setAttribute("d", "M6 14a6 6 0 0 1 12 0Z");
      sun.setAttribute("fill", "currentColor");
      sun.setAttribute("stroke", "none");
      svg.appendChild(sun);
  
      // ---- horizon small segments (left/right) ----
      [
        ["2", "14", "5", "14"],
        ["19", "14", "22", "14"],
      ].forEach(([x1, y1, x2, y2]) => {
        const l = document.createElementNS(SVG_NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        svg.appendChild(l);
      });
  
      // ---- symmetric rays (5 pcs) ----
      const rays = [
        [12, 2.5, 12, 5.5],     // top
        [6.6, 5.8, 8.2, 7.4],   // upper-left
        [17.4, 5.8, 15.8, 7.4], // upper-right
        [3.0, 10.0, 5.4, 10.0], // left
        [21.0, 10.0, 18.6, 10.0], // right
      ];
      rays.forEach(([x1,y1,x2,y2]) => {
        const r = document.createElementNS(SVG_NS, "line");
        r.setAttribute("x1", x1); r.setAttribute("y1", y1);
        r.setAttribute("x2", x2); r.setAttribute("y2", y2);
        svg.appendChild(r);
      });
  
      // ---- base line + emphasized chevron (UP) ----
      const base = document.createElementNS(SVG_NS, "path");
      base.setAttribute("d", "M2 20H7L12 14L17 20H22");
      base.setAttribute("fill", "none");
      svg.appendChild(base);  
      
     
    });
  }
  
  function sunsetSVG() {
    return svgIcon((svg) => {
      // ---- sun (filled half circle) ----
      const sun = document.createElementNS(SVG_NS, "path");
      sun.setAttribute("d", "M6 14a6 6 0 0 1 12 0Z");
      sun.setAttribute("fill", "currentColor");
      sun.setAttribute("stroke", "none");
      svg.appendChild(sun);
  
      // ---- horizon small segments (left/right) ----
      [
        ["2", "14", "5", "14"],
        ["19", "14", "22", "14"],
      ].forEach(([x1, y1, x2, y2]) => {
        const l = document.createElementNS(SVG_NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        svg.appendChild(l);
      });
  
      // ---- symmetric rays (same as sunrise) ----
      const rays = [
        [12, 2.5, 12, 5.5],
        [6.6, 5.8, 8.2, 7.4],
        [17.4, 5.8, 15.8, 7.4],
        [3.0, 10.0, 5.4, 10.0],
        [21.0, 10.0, 18.6, 10.0],
      ];
      rays.forEach(([x1,y1,x2,y2]) => {
        const r = document.createElementNS(SVG_NS, "line");
        r.setAttribute("x1", x1); r.setAttribute("y1", y1);
        r.setAttribute("x2", x2); r.setAttribute("y2", y2);
        svg.appendChild(r);
      });
  
      // ---- base line + emphasized chevron (DOWN) ----
      const base = document.createElementNS(SVG_NS, "path");
      base.setAttribute("d", "M2 18H8.3L12 22L15.7 18H22");
      base.setAttribute("fill", "none");
      svg.appendChild(base);
  
  
    });
  }
  
  

  function buildSunIcons(onVal, offVal) {
    // onVal: min_temp_ON value - 1=sunrise ON, 2=sunset ON
    // offVal: max_temp_OFF value - 1=sunrise OFF, 2=sunset OFF
    if (!onVal && !offVal) return null;

    const container = el("div", { class: "myio-sunrise-sunset-icons" });

    // ON event - bright/light icon
    if (onVal === 1 || onVal === 2) {
      const wrapper = el("span", { class: "myio-sun-icon myio-sun-on" });
      wrapper.title = onVal === 1 ? "ON @ Sunrise" : "ON @ Sunset";
      wrapper.appendChild(onVal === 1 ? sunriseSVG() : sunsetSVG());
      container.append(wrapper);
    }

    // OFF event - dark icon
    if (offVal === 1 || offVal === 2) {
      const wrapper = el("span", { class: "myio-sun-icon myio-sun-off" });
      wrapper.title = offVal === 1 ? "OFF @ Sunrise" : "OFF @ Sunset";
      wrapper.appendChild(offVal === 1 ? sunriseSVG() : sunsetSVG());
      container.append(wrapper);
    }

    return container.children.length > 0 ? container : null;
  }

  // --- Sensors ---
  function renderSensors(root) {
    const { section, grid } = makeSection(typeof str_Sensors !== "undefined" ? str_Sensors : "Sensors", "", "myio.section.sensors");
    let count = 0;

    if (typeof consumption !== "undefined" && consumption != 0) {
      const id = "sensors:consumption";
      const makeFn = () => {
        const c = card(typeof str_Consump !== "undefined" ? str_Consump : "Consumption", "myio-sensor", id);
        addValue(c, (consumption / 1000) + " " + safe(typeof consumptionUnit !== "undefined" ? consumptionUnit : "", ""));
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

  // --- Switches ---
  function renderSwitches(root) {
    if (typeof switchEnabled === "undefined") return;

    let any = false;
    for (let i = 0; i < switchEnabled.length; i++) {
      if (switchEnabled[i] != 0 && switch_description[i + 1] != null) { any = true; break; }
    }
    if (!any) return;

    const { section, grid } = makeSection(typeof str_Input !== "undefined" ? str_Input : "Input", "", "myio.section.switches");
    for (let i = 0; i < switchEnabled.length; i++) {
      if (switchEnabled[i] != 0 && switch_description[i + 1] != null) {
        const id = `switch:${i + 1}`;
        const makeFn = () => {
          if (!switch_description[i + 1]) switch_description[i + 1] = "-";
          const c = card(switch_description[i + 1], "myio-off", id);
          const btns = [];
          if (switchEnabled[i] >= 10) btns.push({ label: (typeof str_Hit !== "undefined" ? str_Hit : "Hit"), name: "s_hit", value: (i + 1) });
          if (switchEnabled[i] - 10 == 1 || switchEnabled[i] == 1) btns.push({ label: (typeof str_Press !== "undefined" ? str_Press : "Press"), name: "s_press", value: (i + 1) });
          if (btns.length) addButtons(c, btns);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }
    root.append(section);
  }

  // --- PCA ---
  function renderPCA(root) {
    if (typeof PCA === "undefined") return;

    const PCARead = [], PCAWrite = [], PCAVal = [];
    let any = false;

    for (let i = 0; i < PCA.length; i++) {
      const d = decodeRW(PCA[i]);
      PCARead[i] = d.read; PCAWrite[i] = d.write; PCAVal[i] = d.val;
      const isSunriseSunset = (typeof PCA_thermoActivator !== "undefined" && PCA_thermoActivator[i] === 255);
      if ((PCARead[i] || PCAWrite[i]) && PCA_description[i + 1] != null && (PCA_thermoActivator[i] == 0 || isSunriseSunset)) {
        any = true;
      }
    }
    if (!any) return;

    const { section, grid } = makeSection(typeof str_PCA_Output !== "undefined" ? str_PCA_Output : "PCA Output", "", "myio.section.pca");

    for (let i = 0; i < PCA.length; i++) {
      const isSunriseSunset = (typeof PCA_thermoActivator !== "undefined" && PCA_thermoActivator[i] === 255);
      if (!((PCARead[i] || PCAWrite[i]) && PCA_description[i + 1] != null && (PCA_thermoActivator[i] == 0 || isSunriseSunset))) continue;

      const id = `pca:${i + 1}`;
      const makeFn = () => {
        if (!PCA_description[i + 1]) PCA_description[i + 1] = "-";
        const val255 = PCAVal[i];
        const isOn = (val255 > 0 && PCARead[i] == 1);
        const c = card(PCA_description[i + 1], isOn ? "myio-on" : "myio-off", id);

        if (PCAWrite[i]) {
          setCardHeaderWithInvAndToggle(c, PCA_description[i + 1], "PCA_INV", "PCA_ON", "PCA_OFF", i + 1, isOn, id);

          let showSlider = 1;
          if (typeof PCA_PWM !== "undefined") showSlider = !!PCA_PWM[i];

          if (showSlider) {
            const pct = Math.round(val255 / 2.55);
            const minPct = Math.round((typeof PCAMIN !== "undefined" ? PCAMIN[i] : 0) / 2.55);
            const maxPct = Math.round((typeof PCAMAX !== "undefined" ? PCAMAX[i] : 255) / 2.55);

            const row = el("div", { class: "myio-pcaRow" });
            const range = el("input", { type: "range", min: String(minPct), max: String(maxPct), value: String(pct), name: "PCA*" + (i + 1) });
            range.onchange = (e) => { try { changed(e.target); } catch { } };

            const num = el("input", { type: "number", min: String(minPct), max: String(maxPct), value: String(pct), name: "PCA*" + (i + 1) });
            num.onchange = (e) => { try { changed(e.target); } catch { } };

            range.oninput = () => { num.value = range.value; };
            num.oninput = () => { range.value = num.value; };

            row.append(range, el("div", { class: "myio-pcaValue" }, [num]));
            c.append(row);
          }
        } else {
          c.append(el("div", { class: "myio-sub", text: String(Math.round(val255 / 2.55)) }));
        }

        // Napkelte-napnyugta ikonok hozzáadása
        if (isSunriseSunset) {
          const onVal = (typeof PCA_min_temp_ON !== "undefined") ? PCA_min_temp_ON[i] : 0;
          const offVal = (typeof PCA_max_temp_OFF !== "undefined") ? PCA_max_temp_OFF[i] : 0;
          const icons = buildSunIcons(onVal, offVal);
          if (icons) c.append(icons);
        }

        return c;
      };
      registerCardFactory(id, makeFn);
      grid.append(makeFn());
    }
    root.append(section);
  }

  // --- FET ---
  function renderFET(root) {
    if (typeof fet === "undefined") return;

    const FETRead = [], FETWrite = [], FETVal = [];
    let any = false;

    for (let i = 0; i < fet.length; i++) {
      const d = decodeRW(fet[i]);
      FETRead[i] = d.read; FETWrite[i] = d.write; FETVal[i] = d.val;
      if ((FETRead[i] || FETWrite[i]) && fet_description && fet_description[i + 1] != null) any = true;
    }
    if (!any) return;

    const { section, grid } = makeSection(typeof str_PWM !== "undefined" ? str_PWM : "PWM", "", "myio.section.fet");

    for (let i = 0; i < fet.length; i++) {
      if (!((FETRead[i] || FETWrite[i]) && fet_description && fet_description[i + 1] != null)) continue;

      const id = `fet:${i + 1}`;
      const makeFn = () => {
        if (!fet_description[i + 1]) fet_description[i + 1] = "-";
        const val255 = FETVal[i];
        const isOn = (val255 > 0 && FETRead[i] == 1);
        const c = card(fet_description[i + 1], isOn ? "myio-on" : "myio-off", id);

        if (FETWrite[i]) {
          setCardHeaderWithInvAndToggle(c, fet_description[i + 1], "f_INV", "f_ON", "f_OFF", i + 1, isOn, id);

          const minPct = Math.round((typeof fetMIN !== "undefined" ? fetMIN[i] : 0) / 2.55);
          const maxPct = Math.round((typeof fetMAX !== "undefined" ? fetMAX[i] : 255) / 2.55);
          const pct = Math.round(val255 / 2.55);

          const row = el("div", { class: "myio-pcaRow" });
          const range = el("input", { type: "range", min: String(minPct), max: String(maxPct), value: String(pct), name: "fet*" + (i + 1) });
          range.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };

          const num = el("input", { type: "number", min: String(minPct), max: String(maxPct), value: String(pct), name: "fet*" + (i + 1) });
          num.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };

          range.oninput = () => { num.value = range.value; };
          num.oninput = () => { range.value = num.value; };

          row.append(range, el("div", { class: "myio-pcaValue" }, [num]));
          c.append(row);
        } else {
          c.append(el("div", { class: "myio-sub", text: String(Math.round(val255 / 2.55)) }));
        }
        return c;
      };
      registerCardFactory(id, makeFn);
      grid.append(makeFn());
    }
    root.append(section);
  }

  // --- Relays ---
  function renderRelays(root) {
    if (typeof relays === "undefined") return;

    let any = false;
    for (let i = 0; i < relays.length; i++) {
      const isSunriseSunset = (typeof thermoActivator !== "undefined" && thermoActivator[i] === 255);
      if (relays[i] != 0 && relay_description[i + 1] != null && (thermoActivator[i] == 0 || isSunriseSunset)) {
        any = true;
        break;
      }
    }
    if (!any) return;

    const { section, grid } = makeSection(typeof str_Output !== "undefined" ? str_Output : "Output", "", "myio.section.relays");
    for (let i = 0; i < relays.length; i++) {
      const isSunriseSunset = (typeof thermoActivator !== "undefined" && thermoActivator[i] === 255);
      if (relays[i] != 0 && (thermoActivator[i] == 0 || isSunriseSunset) && relay_description[i + 1] != null) {
        const id = `relay:${i + 1}`;
        const makeFn = () => {
          const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);
          if (!relay_description[i + 1]) relay_description[i + 1] = "-";
          const writable = (parseInt(relays[i] / 10) == 1 || parseInt(relays[i] / 10) == 11);
          const c = writable
            ? cardWithInvTitle(relay_description[i + 1], isOn ? "myio-on" : "myio-off", "r_INV", (i + 1), id)
            : card(relay_description[i + 1], isOn ? "myio-on" : "myio-off", id);

          if (writable) {
            setCardHeaderWithInvAndToggle(c, relay_description[i + 1], "r_INV", "r_ON", "r_OFF", i + 1, isOn, id);
          }

          // Napkelte-napnyugta ikonok hozzáadása
          if (isSunriseSunset) {
            const onVal = (typeof min_temp_ON !== "undefined") ? min_temp_ON[i] : 0;
            const offVal = (typeof max_temp_OFF !== "undefined") ? max_temp_OFF[i] : 0;
            const icons = buildSunIcons(onVal, offVal);
            if (icons) c.append(icons);
          }

          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }
    root.append(section);
  }

  // --- Favorites ---
  function renderFavorites(root) {
    const favs = loadFavs();
    if (!favs.length) return;

    const existing = favs.filter(id => hasCardFactory(id));
    if (!existing.length) return;

    const title = (typeof str_Favorites !== "undefined" && str_Favorites) ? str_Favorites : "Favorites";
    const { section, grid } = makeSection(title, "", FAV_SECTION_KEY, false);

    for (const id of existing) {
      try { grid.append(getCardFactory(id)()); } catch (e) { console.error(e); }
    }

    if (grid.childNodes.length > 0) root.append(section);
  }

  // Export
  window.myioRenderers = {
    renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites
  };
})();
