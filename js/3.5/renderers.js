/* renderers.js – Szekciók renderelése (főmodul) */
(function() {
  // Synchronous load to ensure the rest of the file only runs after these are loaded
  const urls = [host + 'renderer-helper.js', host + 'renderer-chart.js'];

  for (const src of urls) {
    // Skip if already present as a script tag or a guard variable set by those scripts
    if (document.querySelector(`script[src="${src}"]`)) continue;

    try {
      for (const src of urls) {
        if (document.querySelector(`script[src="${src}"]`)) continue;
      
        const script = document.createElement('script');
        script.src = src;
        script.async = false; // Így megmarad a sorrendiség, mint a szinkron kérésnél
        script.onload = () => console.log('✓ Betöltve (script tag):', src);
        script.onerror = () => console.warn('✗ Hiba a betöltéskor:', src);
        document.head.appendChild(script);
      }
    } catch (e) {
      console.warn('✗ Nem sikerült betölteni (XHR):', src, e);
    }
  }
})();
(function () {
    const { el, decodeRW, safe } = window.myioUtils;
    const { loadFavs } = window.myioStorage;
    const { card, cardWithInvTitle, addValue, addButtons, setCardHeaderWithInvAndToggle, registerCardFactory, getCardFactory, hasCardFactory } = window.myioCards;
    const { makeSection } = window.myioSections;
    const FAV_SECTION_KEY = window.myioStorage.FAV_SECTION_KEY;
  
    const { g, str, to100, buildSunIcons, createPWMSliderRow } = window.myioRendererHelpers;
    const { createChartModal } = window.myioChart;
  
    // ============================================================
    // === Szenzor kártya → chart modal kattintás
    // ============================================================
  
    function attachChartClick(c, sensorId, sensorName) {
      const cardTitle = c.querySelector('.myio-cardTitle');
      if (!cardTitle) return;
      cardTitle.style.cursor = 'pointer';
      cardTitle.addEventListener('click', (e) => {
        if (e.target.closest('.myio-fav-wrapper')) return;
        createChartModal(sensorId, sensorName);
      });
    }
  
    // ============================================================
    // === Sensors
    // ============================================================
  
    function renderSensors(root) {
      const { section, grid } = makeSection(str('Sensors', 'Sensors'), '', 'myio.section.sensors');
      let count = 0;
  
      // Fogyasztás
      const consumption = g('consumption');
      if (consumption != null && consumption !== 0) {
        const id = "sensors:consumption";
        const label = str('Consump', 'Consumption');
        const makeFn = () => {
          const c = card(label, "myio-sensor", id);
          addValue(c, (consumption / 1000) + " " + safe(g('consumptionUnit', ''), ''));
          attachChartClick(c, 0, label);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn()); count++;
      }
  
      // Hőmérők
      const thermoIdx = g('thermo_eepromIndex');
      const thermoDesc = g('thermo_description', {});
      const thermoTemps = g('thermo_temps', []);
      if (thermoIdx && typeof fullZeroArray === "function" && !fullZeroArray(thermoIdx)) {
        for (let i = 0; i < thermoIdx.length; i++) {
          if (thermoIdx[i] === 0) continue;
          const idx = thermoIdx[i];
          const id = `sensors:thermo:${idx}`;
          const makeFn = () => {
            if (thermoDesc[idx] == null) thermoDesc[idx] = "-";
            const c = card(thermoDesc[idx], "myio-sensor", id);
            addValue(c, (thermoTemps[i] / 100) + " °C");
            attachChartClick(c, idx, thermoDesc[idx]);
            return c;
          };
          registerCardFactory(id, makeFn);
          grid.append(makeFn()); count++;
        }
      }
  
      // Páratartalom
      const humidity = g('humidity');
      const humDesc = g('hum_description', []);
      if (humidity) {
        for (let i = 0; i < humidity.length; i++) {
          if (humidity[i] === 0) continue;
          const id = `sensors:hum:${i}`;
          const makeFn = () => {
            if (humDesc[i] == null) humDesc[i] = "-";
            const c = card(humDesc[i], "myio-sensor", id);
            addValue(c, (humidity[i] / 10) + " %");
            attachChartClick(c, 101 + i, humDesc[i]);
            return c;
          };
          registerCardFactory(id, makeFn);
          grid.append(makeFn()); count++;
        }
      }
  
      if (count) root.append(section);
    }
  
    // ============================================================
    // === Switches
    // ============================================================
  
    function renderSwitches(root) {
      const switchEnabled = g('switchEnabled');
      const switchDesc = g('switch_description');
      if (!switchEnabled) return;
  
      const hasAny = switchEnabled.some((v, i) => v !== 0 && switchDesc?.[i + 1] != null);
      if (!hasAny) return;
  
      const { section, grid } = makeSection(str('Input', 'Input'), '', 'myio.section.switches');
      for (let i = 0; i < switchEnabled.length; i++) {
        if (switchEnabled[i] === 0 || switchDesc[i + 1] == null) continue;
        const id = `switch:${i + 1}`;
        const makeFn = () => {
          if (!switchDesc[i + 1]) switchDesc[i + 1] = "-";
          const c = card(switchDesc[i + 1], "myio-off", id);
          const btns = [];
          if (switchEnabled[i] >= 10) btns.push({ label: str('Hit', 'Hit'), name: "s_hit", value: (i + 1) });
          if (switchEnabled[i] - 10 === 1 || switchEnabled[i] === 1) btns.push({ label: str('Press', 'Press'), name: "s_press", value: (i + 1) });
          if (btns.length) addButtons(c, btns);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
      root.append(section);
    }
  
    // ============================================================
    // === PCA Output
    // ============================================================
  
    function renderPCA(root) {
      const PCA = g('PCA');
      if (!PCA) return;
  
      const pcaDesc = g('PCA_description', {});
      const pcaThermoAct = g('PCA_thermoActivator', []);
      const pcaPWM = g('PCA_PWM');
      const pcaMin = g('PCAMIN', []);
      const pcaMax = g('PCAMAX', []);
      const pcaMinTempOn = g('PCA_min_temp_ON', []);
      const pcaMaxTempOff = g('PCA_max_temp_OFF', []);
  
      const decoded = PCA.map(v => decodeRW(v));
      const hasAny = decoded.some((d, i) => {
        const isSunrise = pcaThermoAct[i] === 255;
        return (d.read || d.write) && pcaDesc[i + 1] != null && (pcaThermoAct[i] === 0 || isSunrise);
      });
      if (!hasAny) return;
  
      const { section, grid } = makeSection(str('PCA_Output', 'PCA Output'), '', 'myio.section.pca');
  
      decoded.forEach((d, i) => {
        const isSunrise = pcaThermoAct[i] === 255;
        if (!((d.read || d.write) && pcaDesc[i + 1] != null && (pcaThermoAct[i] === 0 || isSunrise))) return;
  
        const id = `pca:${i + 1}`;
        const makeFn = () => {
          if (!pcaDesc[i + 1]) pcaDesc[i + 1] = "-";
          const val255 = d.val;
          const isOn = val255 > 0 && d.read === 1;
          const c = card(pcaDesc[i + 1], isOn ? "myio-on" : "myio-off", id);
  
          if (d.write) {
            setCardHeaderWithInvAndToggle(c, pcaDesc[i + 1], "PCA_INV", "PCA_ON", "PCA_OFF", i + 1, isOn, id);
            const showSlider = pcaPWM ? !!pcaPWM[i] : true;
            if (showSlider) {
              const { row, range, num } = createPWMSliderRow(val255, pcaMin[i] || 0, pcaMax[i] || 255, "PCA*" + (i + 1));
              range.onchange = (e) => { try { changed(e.target); } catch { } };
              num.onchange = (e) => { try { changed(e.target); } catch { } };
              c.append(row);
            }
          } else {
            c.append(el("div", { class: "myio-sub", text: String(to100(val255)) }));
          }
  
          if (isSunrise) {
            const icons = buildSunIcons(pcaMinTempOn[i] || 0, pcaMaxTempOff[i] || 0);
            if (icons) c.append(icons);
          }
  
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      });
  
      root.append(section);
    }
  
    // ============================================================
    // === FET (PWM)
    // ============================================================
  
    function renderFET(root) {
      const fet = g('fet');
      if (!fet) return;
  
      const fetDesc = g('fet_description', {});
      const fetMin = g('fetMIN', []);
      const fetMax = g('fetMAX', []);
  
      const decoded = fet.map(v => decodeRW(v));
      const hasAny = decoded.some((d, i) => (d.read || d.write) && fetDesc[i + 1] != null);
      if (!hasAny) return;
  
      const { section, grid } = makeSection(str('PWM', 'PWM'), '', 'myio.section.fet');
  
      decoded.forEach((d, i) => {
        if (!((d.read || d.write) && fetDesc[i + 1] != null)) return;
  
        const id = `fet:${i + 1}`;
        const makeFn = () => {
          if (!fetDesc[i + 1]) fetDesc[i + 1] = "-";
          const val255 = d.val;
          const isOn = val255 > 0 && d.read === 1;
          const c = card(fetDesc[i + 1], isOn ? "myio-on" : "myio-off", id);
  
          if (d.write) {
            setCardHeaderWithInvAndToggle(c, fetDesc[i + 1], "f_INV", "f_ON", "f_OFF", i + 1, isOn, id);
            const { row, range, num } = createPWMSliderRow(val255, fetMin[i] || 0, fetMax[i] || 255, "fet*" + (i + 1));
            range.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };
            num.onchange = (e) => { try { changed(e.target, e.target.name, 1, true); } catch { } };
            c.append(row);
          } else {
            c.append(el("div", { class: "myio-sub", text: String(to100(val255)) }));
          }
  
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      });
  
      root.append(section);
    }
  
    // ============================================================
    // === Relays
    // ============================================================
  
    function renderRelays(root) {
      const relays = g('relays');
      if (!relays) return;
  
      const relayDesc = g('relay_description', {});
      const thermoAct = g('thermoActivator', []);
      const minTempOn = g('min_temp_ON', []);
      const maxTempOff = g('max_temp_OFF', []);
  
      const hasAny = relays.some((v, i) => {
        const isSunrise = thermoAct[i] === 255;
        return v !== 0 && relayDesc[i + 1] != null && (thermoAct[i] === 0 || isSunrise);
      });
      if (!hasAny) return;
  
      const { section, grid } = makeSection(str('Output', 'Output'), '', 'myio.section.relays');
  
      relays.forEach((val, i) => {
        const isSunrise = thermoAct[i] === 255;
        if (val === 0 || relayDesc[i + 1] == null || (thermoAct[i] !== 0 && !isSunrise)) return;
  
        const id = `relay:${i + 1}`;
        const makeFn = () => {
          const isOn = (val === 101 || val === 111 || val === 11);
          if (!relayDesc[i + 1]) relayDesc[i + 1] = "-";
          const writable = (parseInt(val / 10) === 1 || parseInt(val / 10) === 11);
          const c = writable
            ? cardWithInvTitle(relayDesc[i + 1], isOn ? "myio-on" : "myio-off", "r_INV", i + 1, id)
            : card(relayDesc[i + 1], isOn ? "myio-on" : "myio-off", id);
  
          if (writable) {
            setCardHeaderWithInvAndToggle(c, relayDesc[i + 1], "r_INV", "r_ON", "r_OFF", i + 1, isOn, id);
          }
  
          if (isSunrise) {
            const icons = buildSunIcons(minTempOn[i] || 0, maxTempOff[i] || 0);
            if (icons) c.append(icons);
          }
  
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      });
  
      root.append(section);
    }
  
    // ============================================================
    // === Favorites
    // ============================================================
  
    function renderFavorites(root) {
      const favs = loadFavs();
      if (!favs.length) return;
  
      const existing = favs.filter(id => hasCardFactory(id));
      if (!existing.length) return;
  
      const title = str('Favorites', 'Favorites') || 'Favorites';
      const { section, grid } = makeSection(title, '', FAV_SECTION_KEY, false);
  
      for (const id of existing) {
        try { grid.append(getCardFactory(id)()); } catch (e) { console.error(e); }
      }
  
      if (grid.childNodes.length > 0) root.append(section);
    }
  
    // ============================================================
    // === Export
    // ============================================================
  
    window.myioRenderers = {
      renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites
    };
  })();
