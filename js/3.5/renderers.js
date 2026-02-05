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

  function createSunIcon(sunrise = true) {
    return svgIcon((svg) => {
      // Színek - meleg napsütéses hangulat
      const sunColor = "#FF6B35"; // narancssárga nap
      const skyColor = "#4A90E2"; // égszínkék
      const horizonColor = "#FFA726"; // aranyos horizont
      const rayColor = "#FFD54F"; // aranyszínű sugarak
      
      // Gradiens háttér
      const defs = document.createElementNS(SVG_NS, "defs");
      
      // Égbolt gradienst
      const gradient = document.createElementNS(SVG_NS, "linearGradient");
      gradient.setAttribute("id", "skyGradient");
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", sunrise ? "100%" : "0%");
      gradient.setAttribute("x2", "0%");
      gradient.setAttribute("y2", sunrise ? "0%" : "100%");
      
      const stop1 = document.createElementNS(SVG_NS, "stop");
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", sunrise ? "#FFB74D" : "#1A237E");
      
      const stop2 = document.createElementNS(SVG_NS, "stop");
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", sunrise ? "#4FC3F7" : "#283593");
      
      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
      
      // Nap gradienst
      const sunGradient = document.createElementNS(SVG_NS, "radialGradient");
      sunGradient.setAttribute("id", "sunGradient");
      
      const sunStop1 = document.createElementNS(SVG_NS, "stop");
      sunStop1.setAttribute("offset", "0%");
      sunStop1.setAttribute("stop-color", "#FFEB3B");
      
      const sunStop2 = document.createElementNS(SVG_NS, "stop");
      sunStop2.setAttribute("offset", "100%");
      sunStop2.setAttribute("stop-color", sunrise ? "#FF9800" : "#FF5722");
      
      sunGradient.appendChild(sunStop1);
      sunGradient.appendChild(sunStop2);
      defs.appendChild(sunGradient);
      
      svg.appendChild(defs);
      
      // Háttér téglalap gradiensekkel
      const background = document.createElementNS(SVG_NS, "rect");
      background.setAttribute("width", "24");
      background.setAttribute("height", "24");
      background.setAttribute("fill", "url(#skyGradient)");
      background.setAttribute("rx", "3"); // enyhén lekerekített sarkok
      svg.appendChild(background);
      
      // Horizont vonal kifinomultabb verzióban
      const horizon = document.createElementNS(SVG_NS, "line");
      horizon.setAttribute("x1", "2");
      horizon.setAttribute("y1", sunrise ? "16" : "8");
      horizon.setAttribute("x2", "22");
      horizon.setAttribute("y2", sunrise ? "16" : "8");
      horizon.setAttribute("stroke", horizonColor);
      horizon.setAttribute("stroke-width", "1.5");
      horizon.setAttribute("stroke-opacity", "0.8");
      svg.appendChild(horizon);
      
      // Nap (kör) - pozíció változik napkelte/naplemente szerint
      const sunY = sunrise ? 12 : 20; // magasabban/lejjebb
      const sun = document.createElementNS(SVG_NS, "circle");
      sun.setAttribute("cx", "12");
      sun.setAttribute("cy", sunY.toString());
      sun.setAttribute("r", "4");
      sun.setAttribute("fill", "url(#sunGradient)");
      sun.setAttribute("stroke", "#FFA000");
      sun.setAttribute("stroke-width", "0.5");
      svg.appendChild(sun);
      
      // Sugárzó nap sugarak animációval
      const rays = sunrise ? 
        [[12, 8, 12, 6], [8, 10, 9, 8], [16, 10, 15, 8]] : 
        [[12, 16, 12, 18], [8, 14, 9, 16], [16, 14, 15, 16]];
      
      rays.forEach(([x1, y1, x2, y2], index) => {
        const ray = document.createElementNS(SVG_NS, "line");
        ray.setAttribute("x1", x1.toString());
        ray.setAttribute("y1", y1.toString());
        ray.setAttribute("x2", x2.toString());
        ray.setAttribute("y2", y2.toString());
        ray.setAttribute("stroke", rayColor);
        ray.setAttribute("stroke-width", "1");
        ray.setAttribute("stroke-linecap", "round");
        
        // Animáció a sugarakra
        const animate = document.createElementNS(SVG_NS, "animate");
        animate.setAttribute("attributeName", "opacity");
        animate.setAttribute("values", "0.3;1;0.3");
        animate.setAttribute("dur", "2s");
        animate.setAttribute("begin", `${index * 0.3}s`);
        animate.setAttribute("repeatCount", "indefinite");
        ray.appendChild(animate);
        
        svg.appendChild(ray);
      });
      
      // Felhők vagy horizont effekt
      const clouds = document.createElementNS(SVG_NS, "path");
      if (sunrise) {
        clouds.setAttribute("d", "M5,14 Q7,12 9,14 Q11,12 13,14 Q15,12 17,14 Q19,12 21,14");
      } else {
        clouds.setAttribute("d", "M4,10 Q6,8 8,10 Q10,8 12,10 Q14,8 16,10 Q18,8 20,10");
      }
      clouds.setAttribute("fill", "none");
      clouds.setAttribute("stroke", "rgba(255,255,255,0.6)");
      clouds.setAttribute("stroke-width", "1");
      svg.appendChild(clouds);
      
      // Irányjelző nyíl kifinomultabb formában
      const arrow = document.createElementNS(SVG_NS, "path");
      if (sunrise) {
        arrow.setAttribute("d", "M12,19 L12,22 M12,22 L9,19 M12,22 L15,19");
      } else {
        arrow.setAttribute("d", "M12,5 L12,2 M12,2 L9,5 M12,2 L15,5");
      }
      arrow.setAttribute("stroke", "#FFFFFF");
      arrow.setAttribute("stroke-width", "1.5");
      arrow.setAttribute("stroke-linecap", "round");
      arrow.setAttribute("stroke-linejoin", "round");
      svg.appendChild(arrow);
      
      // Fényhatás a nap körül
      const glow = document.createElementNS(SVG_NS, "circle");
      glow.setAttribute("cx", "12");
      glow.setAttribute("cy", sunY.toString());
      glow.setAttribute("r", "6");
      glow.setAttribute("fill", "none");
      glow.setAttribute("stroke", "#FFEB3B");
      glow.setAttribute("stroke-width", "1");
      glow.setAttribute("stroke-opacity", "0.3");
      svg.appendChild(glow);
    });
  }
  
  // Kompatibilitás a régi függvényekkel
  function sunriseSVG() {
    return createSunIcon(true);
  }
  
  function sunsetSVG() {
    return createSunIcon(false);
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
