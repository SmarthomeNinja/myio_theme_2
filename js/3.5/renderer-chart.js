/* renderers.js – Szekciók renderelése */

(function() {
  const { el, decodeRW, safe } = window.myioUtils;
  const { loadFavs } = window.myioStorage;
  const { card, cardWithInvTitle, addValue, addButtons, setCardHeaderWithInvAndToggle, registerCardFactory, getCardFactory, hasCardFactory } = window.myioCards;
  const { makeSection } = window.myioSections;
  const FAV_SECTION_KEY = window.myioStorage.FAV_SECTION_KEY;

  // --- Dygraph betöltése dinamikusan ---
  if (!window.Chart) {
    
    // Chart.js core ELŐSZÖR
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    
    // Plugineket csak a core betöltése UTÁN
    chartScript.onload = () => {
        
      // Date adapter
      const adapterScript = document.createElement('script');
      adapterScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js';
      adapterScript.onload = () => console.log('✓ Date adapter betöltve');
      document.head.appendChild(adapterScript);
      
      // Hammer.js (KÖTELEZŐ a touch pan/pinch-hez mobiltelefonon!)
      const hammerScript = document.createElement('script');
      hammerScript.src = 'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js';
      hammerScript.onload = () => {
        console.log('✓ Hammer.js betöltve');
        // Zoom plugin CSAK a Hammer.js UTÁN töltődik be
        const zoomScript = document.createElement('script');
        zoomScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js';
        zoomScript.onload = () => console.log('✓ Zoom plugin betöltve');
        document.head.appendChild(zoomScript);
      };
      document.head.appendChild(hammerScript);
      
      // Annotation plugin
      const annotationScript = document.createElement('script');
      annotationScript.src = 'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js';
      annotationScript.onload = () => {
        // Pluginek regisztrálása Chart.js-ben (KÖTELEZŐ Chart.js 4.x-ben!)
        if (window.Chart && window.Chart.register) {
          if (window.ChartZoom) Chart.register(window.ChartZoom);
          if (window.ChartAnnotation) Chart.register(window.ChartAnnotation);
        }
      };
      document.head.appendChild(annotationScript);
    };
    
    document.head.appendChild(chartScript);
  }

  // --- CSS betöltés ---
  function loadCSS(href) {
    if (!document.querySelector(`link[href*="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = host + href;
      document.head.appendChild(link);
    }
  }
  loadCSS('chart-modal.css');
  // Chart.js nem igényel külön CSS;

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
      const sun = document.createElementNS(SVG_NS, "path");
      sun.setAttribute("d", "M6 14a6 6 0 0 1 12 0Z");
      sun.setAttribute("fill", "currentColor");
      sun.setAttribute("stroke", "none");
      svg.appendChild(sun);
  
      [
        ["2", "14", "5", "14"],
        ["19", "14", "22", "14"],
      ].forEach(([x1, y1, x2, y2]) => {
        const l = document.createElementNS(SVG_NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        svg.appendChild(l);
      });
  
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
  
      const base = document.createElementNS(SVG_NS, "path");
      base.setAttribute("d", "M2 20H7L12 14L17 20H22");
      base.setAttribute("fill", "none");
      svg.appendChild(base);  
    });
  }
  
  function sunsetSVG() {
    return svgIcon((svg) => {
      const sun = document.createElementNS(SVG_NS, "path");
      sun.setAttribute("d", "M6 14a6 6 0 0 1 12 0Z");
      sun.setAttribute("fill", "currentColor");
      sun.setAttribute("stroke", "none");
      svg.appendChild(sun);
  
      [
        ["2", "14", "5", "14"],
        ["19", "14", "22", "14"],
      ].forEach(([x1, y1, x2, y2]) => {
        const l = document.createElementNS(SVG_NS, "line");
        l.setAttribute("x1", x1); l.setAttribute("y1", y1);
        l.setAttribute("x2", x2); l.setAttribute("y2", y2);
        svg.appendChild(l);
      });
  
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
  
      const base = document.createElementNS(SVG_NS, "path");
      base.setAttribute("d", "M2 18H7L12 23L17 18H22");
      base.setAttribute("fill", "none");
      svg.appendChild(base);  
    });
  }

  function buildSunIcons(onVal, offVal) {
    if (!onVal && !offVal) return null;

    const container = el("div", { class: "myio-sunrise-sunset-icons" });

    if (onVal === 1 || onVal === 2) {
      const wrapper = el("span", { class: "myio-sun-icon myio-sun-on" });
      wrapper.title = onVal === 1 ? "ON @ Sunrise" : "ON @ Sunset";
      wrapper.appendChild(onVal === 1 ? sunriseSVG() : sunsetSVG());
      container.append(wrapper);
    }

    if (offVal === 1 || offVal === 2) {
      const wrapper = el("span", { class: "myio-sun-icon myio-sun-off" });
      wrapper.title = offVal === 1 ? "OFF @ Sunrise" : "OFF @ Sunset";
      wrapper.appendChild(offVal === 1 ? sunriseSVG() : sunsetSVG());
      container.append(wrapper);
    }

    return container.children.length > 0 ? container : null;
  }


  /** Hex színkód átváltása RGBA-ra alpha csatornával */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /** Output érték drag-to-adjust és szerver küldés */
  function makeOutputDraggable(valueSpan, output, state, sensorId) {
    let isDragging = false;
    let startY = 0;
    let startValue = 0;
    
    valueSpan.style.cursor = 'ns-resize';
    valueSpan.style.userSelect = 'none';
    valueSpan.style.padding = '4px 8px';
    valueSpan.style.background = 'rgba(74, 158, 255, 0.1)';
    valueSpan.style.borderRadius = '4px';
    valueSpan.style.display = 'inline-block';
    valueSpan.title = '↕️ Húzd fel/le az érték módosításához';
    
    
    valueSpan.onmouseenter = () => {
      valueSpan.style.background = 'rgba(74, 158, 255, 0.2)';
    };
    
    valueSpan.onmouseleave = () => {
      if (!isDragging) {
        valueSpan.style.background = 'rgba(74, 158, 255, 0.1)';
      }
    };
    
    valueSpan.onmousedown = (e) => {
      isDragging = true;
      startY = e.clientY;
      startValue = output.yVal;
      e.preventDefault();
    };
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaY = startY - e.clientY;  // Fordított (fel = növel)
      const step = 0.1;  // 0.1°C lépésköz
      const newValue = startValue + (deltaY * step);
      
      // Frissítés
      output.yVal = Math.round(newValue * 10) / 10;
      valueSpan.textContent = output.yVal.toFixed(1) + '°C';
      
      // Chart frissítés
      const graphDiv = document.getElementById('myio-chart-div');
      if (graphDiv) rebuildChart(graphDiv, state);
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Szerver küldés
        sendOutputValueToServer(sensorId, output);
      }
    });
  }
  
  /** Kimenet érték küldése a szervernek */
  async function sendOutputValueToServer(sensorId, output) {
    try {
      // Érték konvertálása vissza 10x-re (szerver 10x-os értéket vár)
      const serverValue = Math.round(output.yVal * 10);
      
      // API endpoint - példa, módosítsd a valódi API-hoz
      const url = `/api/sensor/${sensorId}/output/${output.id}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: output.type,  // 'relay', 'pca', 'fet'
          mode: output.mode,  // 'on' vagy 'off'
          value: serverValue
        })
      });
      
      if (response.ok) {
        console.log(`✓ Output érték elküldve: ${output.label} = ${output.yVal}°C`);
      } else {
        console.error('Hiba az output érték küldésekor:', response.status);
      }
    } catch (err) {
      console.error('Output érték küldési hiba:', err);
    }
  }



  // localStorage kulcsok és függvények
  const OUTPUT_TOGGLE_STORAGE_KEY = 'myio-output-toggles';

  function saveOutputToggles(sensorId, outputLines) {
    const toggles = {};
    for (const ol of outputLines) {
      toggles[ol.id] = ol.visible;
    }
    localStorage.setItem(`${OUTPUT_TOGGLE_STORAGE_KEY}-${sensorId}`, JSON.stringify(toggles));
  }

  function loadOutputToggles(sensorId, outputLines) {
    const stored = localStorage.getItem(`${OUTPUT_TOGGLE_STORAGE_KEY}-${sensorId}`);
    if (stored) {
      try {
        const toggles = JSON.parse(stored);
        for (const ol of outputLines) {
          if (toggles[ol.id] !== undefined) {
            ol.visible = toggles[ol.id];
          }
        }
      } catch (e) {}
    }
  }



  // Szín memória szenzor ID alapján
  const sensorColorMap = new Map();
  
  function getSensorColor(sensorId, isOriginal) {
    // Eredeti szenzor mindig kék
    if (isOriginal) {
      return '#4a9eff';
    }
    
    if (!sensorColorMap.has(sensorId)) {
      const colorIndex = sensorColorMap.size;
      sensorColorMap.set(sensorId, getChartColor(colorIndex));
    }
    return sensorColorMap.get(sensorId);
  }
  // ============================================================
  // === CHART MODAL – Dygraph-alapú interaktív szenzor chart ===
  // ============================================================
  
  function generateCSVPath(sensorId, date) {
    let string = "";
    if (sensorId == 0) { string = "c"; }
    else if (sensorId < 100) { string = "t"; }
    else if (sensorId < 200) { string = "h"; }
    else { string = "sdm"; }
    
    string += "_log";
    if (sensorId > 100 && sensorId < 200) { string += "_" + (sensorId - 101); }
    else if (sensorId < 100 && sensorId != 0) { string += "_" + sensorId; }
    
    string += "/";
    if (sensorId == 0) { string += "c"; }
    else if (sensorId < 100) { string += "t"; }
    else if (sensorId < 200) { string += "h"; }
    else { string += "s"; }
    string += "_" + date + ".csv";
    
    return "/" + string;
  }

  function formatDateToYYMMDD(date) {
    const yy = String(date.getFullYear()).slice(2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return yy + mm + dd;
  }

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  async function fetchCSVText(csvPath) {
    try {
      const response = await fetch(csvPath);
      if (!response.ok) return null;
      return await response.text();
    } catch (error) {
      console.error('CSV betöltési hiba:', error);
      return null;
    }
  }

  /** CSV szövegből Dygraph-kompatibilis 2D tömböt készít: [[Date, value], ...] */
  function parseCSVToArray(csvText) {
    if (!csvText) return [];
    const lines = csvText.trim().split('\n');
    const data = [];
    for (const line of lines) {
      const parts = line.split(',');
      if (parts.length < 2) continue;
      const d = new Date(parts[0].trim());
      const v = parseFloat(parts[1].trim());
      if (!isNaN(d.getTime()) && !isNaN(v)) {
        data.push([d, v]);
      }
    }
    return data;
  }

  /** Szín paletta historikus és kimenet vonalakhoz */
  const CHART_COLORS = [
    '#ff6384', '#36a2eb', '#4bc0c0', '#ffce56',
    '#9966ff', '#ff9f40', '#e7e9ed', '#66ff66',
    '#ff66b2', '#66b2ff', '#b2ff66', '#ffb266'
  ];

  function getChartColor(index) {
    return CHART_COLORS[index % CHART_COLORS.length];
  }

  /** Szín halványítása dátum távolság alapján */
  function fadeColor(hexColor, daysDiff) {
    const fade = Math.max(0.25, 1 - (daysDiff / 60));
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${fade})`;
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /** Dátum távolsága napokban */
  function daysDifference(d1, d2) {
    return Math.abs(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));
  }

  /**
   * Szenzor-neveket feloldó segéd (sensorId → leírás)
   */
  function getSensorLabel(sensorId) {
    if (sensorId == 0) return typeof str_Consump !== "undefined" ? str_Consump : "Consumption";
    if (sensorId < 100 && typeof thermo_description !== "undefined" && thermo_description[sensorId]) {
      return thermo_description[sensorId];
    }
    if (sensorId >= 101 && sensorId < 200 && typeof hum_description !== "undefined") {
      return hum_description[sensorId - 101] || ("Humidity " + (sensorId - 101));
    }
    return "Sensor " + sensorId;
  }

  /** Szenzor ID-k listája a szelekthez */
  function getAvailableSensorOptions() {
    const options = [];
    if (typeof consumption !== "undefined" && consumption != 0) {
      options.push({ id: 0, label: typeof str_Consump !== "undefined" ? str_Consump : "Consumption" });
    }
    if (typeof thermo_eepromIndex !== "undefined") {
      for (let i = 0; i < thermo_eepromIndex.length; i++) {
        if (thermo_eepromIndex[i] != 0) {
          const idx = thermo_eepromIndex[i];
          const desc = (typeof thermo_description !== "undefined" && thermo_description[idx]) ? thermo_description[idx] : ("Thermo " + idx);
          options.push({ id: idx, label: desc });
        }
      }
    }
    if (typeof humidity !== "undefined") {
      for (let i = 0; i < humidity.length; i++) {
        if (humidity[i] != 0) {
          const desc = (typeof hum_description !== "undefined" && hum_description[i]) ? hum_description[i] : ("Humidity " + i);
          options.push({ id: 101 + i, label: desc });
        }
      }
    }
    return options;
  }

  // ========================
  // Chart Modal létrehozás
  // ========================

  function createChartModal(sensorId, sensorName) {
    console.log('🔵 createChartModal hívva:', sensorId, sensorName);
    
    // Chart.js már betöltődött az oldal indulásakor
    if (!window.Chart) {
      return;
    }
    

    const modal = el("div", { class: "myio-chart-modal" });
    const modalContent = el("div", { class: "myio-chart-modal-content" });
    
    // --- Fejléc ---
    const header = el("div", { class: "myio-chart-modal-header" });
    const title = el("h2", { text: sensorName });
    // Fejléc styling: középre, háttér nélkül, világos kék
    title.style.cssText = 'text-align: center; background: none; color: #4a9eff; flex: 1;';
    const closeBtn = el("button", { class: "myio-chart-close", text: "×" });
    const resetZoomBtn = el("button", { class: "myio-chart-close", text: "⟲" });
    resetZoomBtn.title = "Reset zoom";
    resetZoomBtn.style.cssText = 'margin-right:8px;';
    header.append(title, resetZoomBtn, closeBtn);
    
    // --- Chart konténer ---
    const chartContainer = el("div", { class: "myio-chart-container" });
    chartContainer.style.height = '400px';
    chartContainer.style.width = '100%';
    chartContainer.style.position = 'relative';
    chartContainer.style.touchAction = 'none';
    const graphDiv = el("div", { id: "myio-chart-div" });
    graphDiv.style.width = '100%';
    graphDiv.style.height = '100%';
    chartContainer.appendChild(graphDiv);

    // --- Historikus adatok szekció ---
    const historicalSection = el("div", { class: "myio-chart-historical" });
    const historicalTitle = el("h3", { text: "Betöltés" });
    const historicalTable = el("table", { class: "myio-chart-table" });
    const histTbody = el("tbody");
    historicalTable.appendChild(histTbody);
    historicalSection.append(historicalTitle, historicalTable);

    // --- Kimenetek szekció ---
    const outputSection = el("div", { class: "myio-chart-outputs" });
    const outputTitle = el("h3", { text: "Kimenetek" });
    const outputTable = el("table", { class: "myio-chart-table" });
    const outTbody = el("tbody");
    outputTable.appendChild(outTbody);
    outputSection.append(outputTitle, outputTable);

    modalContent.append(header, chartContainer, historicalSection, outputSection);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // --- Állapot ---
    const state = {
      graph: null,
      sensorId: sensorId,
      mainData: [],        // [[Date, val], ...]
      overlays: [],        // [{ id, label, color, data:[[Date,val]], dashStyle }]
      outputLines: [],     // [{ id, label, color, yVal, visible, dashStyle }]
      refreshInterval: null,
      userZoomed: false,
      lastDateWindow: null
    };

    // --- Chart inicializálás ---
    initChart(graphDiv, state, sensorId);

    // --- Reset zoom gomb ---
    resetZoomBtn.onclick = () => {
      if (state.chart) {
        state.chart.resetZoom();
        state.userZoomed = false;
      }
    };

    // --- Historikus üres sor ---
    addEmptyComparisonRow(histTbody, state);

    // --- Kimenetek betöltése ---
    loadRelatedOutputs(outTbody, sensorId, state);

    // --- Bezárás ---
    const cleanup = () => {
      if (state.refreshInterval) clearInterval(state.refreshInterval);
      modal.remove();
    };
    closeBtn.onclick = cleanup;
    modal.addEventListener('click', (e) => { if (e.target === modal) cleanup(); });
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { cleanup(); document.removeEventListener('keydown', escHandler); }
    });
  }

  // ======================
  // Dygraph inicializálás
  // ======================

  async function initChart(graphDiv, state, sensorId) {
    console.log('🔵 initChart hívva:', sensorId);
    const today = formatDateToYYMMDD(new Date());
    const csvPath = generateCSVPath(sensorId, today);
    const csvText = await fetchCSVText(csvPath);
    state.mainData = parseCSVToArray(csvText);

    if (state.mainData.length === 0) {
      graphDiv.innerHTML = '<p style="color:var(--myio-text-secondary,#aaa);text-align:center;padding:40px;">Nincs adat a mai napra.</p>';
      return;
    }

    rebuildChart(graphDiv, state);

    // Auto-refresh 5 mp-enként
    state.refreshInterval = setInterval(() => refreshMainData(graphDiv, state, sensorId), 5000);
  }

  /** Dygraph-ot (újra)építi az összes adatból */
    /** Chart.js-sel újraépíti a grafikont */
  function rebuildChart(graphDiv, state) {
    console.log('🔵 rebuildChart hívva, datasets:', state.mainData?.length || 0);
    const sensorLabel = getSensorLabel(state.sensorId);
    
    // Datasets összeállítása
    const datasets = [];
    
    // 1. Main dataset
    if (state.mainData.length > 0) {
      datasets.push({
        cubicInterpolationMode: 'monotone',
        label: sensorLabel,
        data: state.mainData.map(([d, v]) => ({ x: d, y: v })),
        borderColor: '#4a9eff',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 0.5,
        pointHoverRadius: 4,
        fill: false,
        tension: 10
      });
    }
    
    // 2. Overlay datasets (csak láthatóak)
    const visibleOverlays = state.overlays.filter(ov => ov.visible !== false);
    for (const ov of visibleOverlays) {
      datasets.push({
        cubicInterpolationMode: 'monotone',
        label: ov.label,
        data: ov.data.map(([d, v]) => ({ x: d, y: v })),
        borderColor: ov.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0.5,
        pointHoverRadius: 4,
        fill: false,
        tension: 10
      });
    }
    
    // 3. Annotation objektum (vízszintes vonalak output értékekhez)
    const annotations = {};
    const visibleOutputs = state.outputLines ? state.outputLines.filter(o => o.visible) : [];
    
    for (let i = 0; i < visibleOutputs.length; i++) {
      const output = visibleOutputs[i];
      annotations[`output_${i}`] = {
        type: 'line',
        yMin: output.yVal,
        yMax: output.yVal,
        borderColor: output.color,
        borderWidth: 2,
        borderDash: output.mode === 'on' ? [10, 4] : [3, 3],
        label: {
          display: true,
          content: output.label,
          position: 'end',
          backgroundColor: output.color,
          color: '#1f2937',
          font: { size: 10 }
        }
      };
    }
    
    // Canvas létrehozása vagy újrafelhasználása
    // Canvas méret beállítása
    graphDiv.style.height = '400px';
    graphDiv.style.width = '100%';
    
    let canvas = graphDiv.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.touchAction = 'none';
      graphDiv.innerHTML = '';
      graphDiv.appendChild(canvas);
    }
    
    // Régi chart törlése
    if (state.chart) {
      state.chart.destroy();
    }
    
    // Új Chart.js példány
    const ctx = canvas.getContext('2d');
    state.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: datasets },
      options: {
      //  animation: true,  // Animáció kikapcsolva
        animations: {
          tension: {
            duration: 1000,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: true
          }
        },
        elements:
        {
          point:
          {
            radius: 0,  // Pontok alapból nem látszanak
            hoverRadius: 6,
            hitRadius: 10
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 2,
        interaction: {
          mode: 'nearest',  // Csak legközelebbi pont
          intersect: false
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'HH:mm',
                minute: 'HH:mm'
              }
            },
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--myio-text-secondary') || '#9ca3af',
              maxRotation: 0,
              autoSkipPadding: 10
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--myio-border') || 'rgba(75, 85, 99, 0.2)'
            }
          },
          y: {
            ticks: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--myio-text-secondary') || '#9ca3af'
            },
            grid: {
              color: getComputedStyle(document.documentElement).getPropertyValue('--myio-border') || 'rgba(75, 85, 99, 0.2)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,  // Tooltip bekapcsolva
            mode: 'point',  // Csak legközelebbi pont
            intersect: false,
            axis: 'x',  // X tengely mentén
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#4a9eff',
            borderWidth: 1,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += context.parsed.y.toFixed(2);
                return label;
              }
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
                speed: 0.1
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
              onZoomComplete: () => {
                state.userZoomed = true;
              }
            },
            pan: {
              enabled: true,
              mode: 'x',
              threshold: 5
            },
            limits: {
              x: { min: 'original', max: 'original' }
            }
          },
          annotation: {
            annotations: annotations
          }
        }
      }
    });
  }



  /** Frissíti a fő adatokat (5 mp-enként) */
  async function refreshMainData(graphDiv, state, sensorId) {
    const today = formatDateToYYMMDD(new Date());
    const csvPath = generateCSVPath(sensorId, today);
    const csvText = await fetchCSVText(csvPath);
    const newData = parseCSVToArray(csvText);
    if (!newData || newData.length === 0) return;

    const oldLen = state.mainData.length;
    state.mainData = newData;

    if (!state.chart) {
      rebuildChart(graphDiv, state);
      return;
    }

    // Ha zoom-olva van és a végén vagyunk, követjük az új adatokat
    if (state.userZoomed && state.chart) {
      // Zoom megőrzése - csak az adatok frissítése
      const mainDataset = state.chart.data.datasets[0];
      if (mainDataset) {
        mainDataset.data = newData.map(([d, v]) => ({ x: d, y: v }));
        state.chart.update('none');  // Nincs animáció
      }
    } else {
      // Teljes újraépítés ha nincs zoom
      rebuildChart(graphDiv, state);
    }
  }

  // =============================
  // Összehasonlítás táblázat
  // =============================

  function addEmptyComparisonRow(tbody, state) {
    const row = el("tr", { class: "myio-chart-empty-row" });
    
    // Szín (automatikus, szenzor alapján)
    const colorCell = el("td");
    colorCell.style.textAlign = 'center';
    colorCell.style.verticalAlign = 'middle';
    
    const colorPreview = el("div");
    colorPreview.style.cssText = 'width:24px;height:24px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);margin:auto;';
    colorCell.appendChild(colorPreview);
    
    // Szín frissítése amikor szenzor változik
    const updateColor = () => {
      const selectedId = parseInt(sensorSelect.value);
      const isOrig = (selectedId === state.sensorId);
      const previewColor = getSensorColor(selectedId, isOrig);
      colorPreview.style.background = previewColor;
    };
    
    // Szenzor választó
    const sensorCell = el("td");
    const sensorSelect = document.createElement("select");
    sensorSelect.className = "myio-chart-select";
    const sensors = getAvailableSensorOptions();
    // Alapértelmezetten az aktuális szenzor
    for (const s of sensors) {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.label;
      if (s.id === state.sensorId) opt.selected = true;
      sensorSelect.appendChild(opt);
    }
    sensorCell.appendChild(sensorSelect);
    
    // Szenzor változáskor frissítsük a színt
    sensorSelect.onchange = updateColor;
    
    // Kezdeti szín beállítása
    setTimeout(updateColor, 0);
    
    // Dátum választó + adatpontok szám
    const dateCell = el("td");
    dateCell.style.display = 'flex';
    dateCell.style.flexDirection = 'column';
    dateCell.style.gap = '4px';
    
    const dateInput = el("input", { type: "date" });
    dateInput.style.width = '100%';
    
    // Szenzor-specifikus legnagyobb szabad dátum kiszámítása
    const updateSuggestedDate = () => {
      const selectedSid = parseInt(sensorSelect.value);
      const usedDates = state.overlays
        .filter(ov => ov.sensorId === selectedSid)
        .map(ov => ov.dateStr);
      
      let candidateDate = new Date();
      const todayStr = candidateDate.toISOString().split('T')[0];
      
      // Ha az aktuális szenzort választottuk, akkor a main dataset mai napja is foglalt
      if (selectedSid === state.sensorId) {
        // Aktuális szenzornál tegnappal kezdjük (mai már betöltve van a main dataset-ben)
        candidateDate.setDate(candidateDate.getDate() - 1);
      } else {
        // Más szenzornál: ha már van mai napi adat az overlays-ben, akkor tegnappal kezdjük
        if (usedDates.includes(todayStr)) {
          candidateDate.setDate(candidateDate.getDate() - 1);
        }
      }
      
      // Keressünk szabad napot
      while (usedDates.includes(candidateDate.toISOString().split('T')[0])) {
        candidateDate.setDate(candidateDate.getDate() - 1);
      }
      
      dateInput.value = candidateDate.toISOString().split('T')[0];
    };
    
    // Kezdeti dátum beállítása
    updateSuggestedDate();
    
    const pointsLabel = el("span", { text: '' });
    pointsLabel.style.fontSize = '11px';
    pointsLabel.style.opacity = '0.6';
    pointsLabel.style.textAlign = 'center';
    
    dateCell.append(dateInput, pointsLabel);
    
    // Szenzor változáskor frissítsük az ajánlott dátumot is
    sensorSelect.addEventListener('change', updateSuggestedDate);
    
    // Betöltés gomb
    const actionCell = el("td");
    actionCell.style.textAlign = 'center';
    actionCell.style.verticalAlign = 'middle';
    const addBtn = el("button", { text: "+", title: "Betöltés" });
    addBtn.style.minWidth = "36px";
    addBtn.onclick = async () => {
      const sid = parseInt(sensorSelect.value);
      updateColor();  // Szín frissítés a gombnyomáskor
      const dateStr = dateInput.value;
      const isOriginal = (sid === state.sensorId);
      const color = getSensorColor(sid, isOriginal);  // Eredeti = #4a9eff
      if (isNaN(sid) || !dateStr) return;

      const date = new Date(dateStr);
      const csvDate = formatDateToYYMMDD(date);
      const csvPath = generateCSVPath(sid, csvDate);
      
      addBtn.textContent = '⏳';
      const csvText = await fetchCSVText(csvPath);
      addBtn.textContent = '+';
      
      if (!csvText) {
        addBtn.textContent = '✗';
        setTimeout(() => { addBtn.textContent = '+'; }, 1500);
        return;
      }

      const data = parseCSVToArray(csvText);
      if (data.length === 0) return;

      const daysDiff = daysDifference(date, new Date());
      const overlayLabel = getSensorLabel(sid);
      const overlayDate = dateStr;
      
      const overlay = {
        id: Date.now(),
        sensorId: sid,
        label: overlayLabel,
      dateStr: overlayDate,
        color: hexToRgba(color, 0.3),  // Halványított háttérszín
        data: data,
        borderDash: [10, 4],
        daysDiff: daysDiff,
        visible: true  // Alapértelmezett láthatóság
      };

      state.overlays.push(overlay);

      // Chart újraépítés
      const graphDiv = document.getElementById('myio-chart-div');
      if (graphDiv) rebuildChart(graphDiv, state);

      // Betöltött sor hozzáadása a táblázatba
      const dataRow = createComparisonDataRow(tbody, state, overlay);
      tbody.insertBefore(dataRow, row);

      // Szín frissítés - updateColor() hívása
      updateColor();
      
      // Ajánlott dátum frissítése betöltés után
      updateSuggestedDate();
    };
    actionCell.appendChild(addBtn);
    
    row.append(colorCell, sensorCell, dateCell, actionCell);
    tbody.appendChild(row);
  }

  function createComparisonDataRow(tbody, state, overlay) {
    const row = el("tr");
    
    // Toggle gomb törlés funkcióval
    const toggleCell = el("td");
    toggleCell.style.textAlign = 'center';
    toggleCell.style.verticalAlign = 'middle';
    const toggleLabel = el("label", { class: "myio-chart-toggle" });
    const toggleInput = el("input", { type: "checkbox" });
    toggleInput.checked = overlay.visible !== false;
    const toggleTrack = el("span", { class: "myio-chart-toggle-track" });
    
    // Kuka ikon hozzáadása a toggle után
    const deleteIcon = el("span", { text: "🗑", style: "margin-left: 8px; cursor: pointer; opacity: 0.6;" });
    deleteIcon.title = "Törlés";
    deleteIcon.onclick = () => {
      const idx = state.overlays.indexOf(overlay);
      if (idx > -1) {
        state.overlays.splice(idx, 1);
        const graphDiv = document.getElementById('myio-chart-div');
        if (graphDiv) rebuildChart(graphDiv, state);
        row.remove();
      }
    };
    
    toggleLabel.append(toggleInput, toggleTrack);
    toggleCell.style.textAlign = 'center';
    toggleCell.style.verticalAlign = 'middle';
    toggleCell.append(toggleLabel, deleteIcon);
    
    toggleInput.onchange = () => {
      overlay.visible = toggleInput.checked;
      const graphDiv = document.getElementById('myio-chart-div');
      if (graphDiv) rebuildChart(graphDiv, state);
    };

    
    // Szín jelző
    const colorCell = el("td");
    const colorBox = el("div");
    colorBox.style.cssText = `width:24px;height:24px;border-radius:4px;background:${overlay.color};border:1px solid rgba(255,255,255,0.2);`;
    colorCell.style.textAlign = 'center';
    colorCell.style.verticalAlign = 'middle';
    colorCell.appendChild(colorBox);
    
    // Label (név)
    const labelCell = el("td", { text: overlay.label });
    labelCell.style.fontSize = '13px';
    
    // Dátum + pontok egy cellában
    const dateCell = el("td");
    dateCell.style.display = 'flex';
    dateCell.style.flexDirection = 'column';
    dateCell.style.gap = '2px';
    
    const dateSpan = el("span", { text: overlay.dateStr || '' });
    dateSpan.style.fontSize = '12px';
    
    const pointsSpan = el("span", { text: overlay.data.length + ' pont' });
    pointsSpan.style.fontSize = '11px';
    pointsSpan.style.opacity = '0.6';
    
    dateCell.append(dateSpan, pointsSpan);
    
    
    
    
    
    row.append(colorCell, labelCell, dateCell, toggleCell);  // Toggle a kuka helyén
    return row;
  }

  // ===========================
  // Kimenetek (relay, PCA)
  // ===========================

  /**
   * Megkeresi a szenzorhoz kapcsolt reléket és PCA kimeneteket
   * thermoActivator[i] === sensorId  → relay i+1
   * PCA_thermoActivator[i] === sensorId  → PCA i+1
   */
  function loadRelatedOutputs(outTbody, sensorId, state) {
    const outputs = [];
    let colorIdx = 0;

    // ON/OFF dash stílusok
    const DASH_ON  = [10, 4];     // hosszú szaggatott
    const DASH_OFF = [3, 3];      // rövid szaggatott

    // Relék
    if (typeof relays !== "undefined" && typeof thermoActivator !== "undefined") {
      for (let i = 0; i < thermoActivator.length; i++) {
        if (thermoActivator[i] === sensorId) {
          const relayName = (typeof relay_description !== "undefined" && relay_description[i + 1])
            ? relay_description[i + 1] : ("Relay " + (i + 1));
          const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);
          
          // ON vonal
          const onY = (typeof min_temp_ON !== "undefined" && min_temp_ON[i] !== undefined) ? (min_temp_ON[i] / 10) : null;
          // OFF vonal
          const offY = (typeof max_temp_OFF !== "undefined" && max_temp_OFF[i] !== undefined) ? (max_temp_OFF[i] / 10) : null;

          if (onY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `relay_on_${i}`,
              label: relayName + ' ON',
              color: color,
              yVal: onY,
              visible: false,
              borderDash: DASH_ON,
              type: 'relay',
              index: i,
              mode: 'on'
            });
          }
          if (offY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `relay_off_${i}`,
              label: relayName + ' OFF',
              color: color,
              yVal: offY,
              visible: false,
              borderDash: DASH_OFF,
              type: 'relay',
              index: i,
              mode: 'off'
            });
          }
        }
      }
    }

    // PCA kimenetek
    if (typeof PCA !== "undefined" && typeof PCA_thermoActivator !== "undefined") {
      for (let i = 0; i < PCA_thermoActivator.length; i++) {
        if (PCA_thermoActivator[i] === sensorId) {
          const pcaName = (typeof PCA_description !== "undefined" && PCA_description[i + 1])
            ? PCA_description[i + 1] : ("PCA " + (i + 1));

          const onY = (typeof PCA_min_temp_ON !== "undefined" && PCA_min_temp_ON[i] !== undefined) ? (PCA_min_temp_ON[i] / 10) : null;
          const offY = (typeof PCA_max_temp_OFF !== "undefined" && PCA_max_temp_OFF[i] !== undefined) ? (PCA_max_temp_OFF[i] / 10) : null;

          if (onY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `pca_on_${i}`,
              label: pcaName + ' ON',
              color: color,
              yVal: onY,
              visible: false,
              borderDash: DASH_ON,
              type: 'pca',
              index: i,
              mode: 'on'
            });
          }
          if (offY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `pca_off_${i}`,
              label: pcaName + ' OFF',
              color: color,
              yVal: offY,
              visible: false,
              borderDash: DASH_OFF,
              type: 'pca',
              index: i,
              mode: 'off'
            });
          }
        }
      }
    }

    // FET kimenetek
    if (typeof fet !== "undefined" && typeof fet_thermoActivator !== "undefined") {
      for (let i = 0; i < fet_thermoActivator.length; i++) {
        if (fet_thermoActivator[i] === sensorId) {
          const fetName = (typeof fet_description !== "undefined" && fet_description[i + 1])
            ? fet_description[i + 1] : ("FET " + (i + 1));

          const onY = (typeof fet_min_temp_ON !== "undefined" && fet_min_temp_ON[i] !== undefined) ? (fet_min_temp_ON[i] / 10) : null;
          const offY = (typeof fet_max_temp_OFF !== "undefined" && fet_max_temp_OFF[i] !== undefined) ? (fet_max_temp_OFF[i] / 10) : null;

          if (onY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `fet_on_${i}`,
              label: fetName + ' ON',
              color: color,
              yVal: onY,
              visible: false,
              borderDash: DASH_ON,
              type: 'fet',
              index: i,
              mode: 'on'
            });
          }
          if (offY !== null) {
            const color = getChartColor(colorIdx++);
            outputs.push({
              id: `fet_off_${i}`,
              label: fetName + ' OFF',
              color: color,
              yVal: offY,
              visible: false,
              borderDash: DASH_OFF,
              type: 'fet',
              index: i,
              mode: 'off'
            });
          }
        }
      }
    }

    state.outputLines = outputs;
    
    // Betöltjük a mentett toggle állapotokat
    loadOutputToggles(sensorId, state.outputLines);

    if (outputs.length === 0) {
      const emptyRow = el("tr");
      const td = el("td", { text: "Nincs ehhez a szenzorhoz rendelt kimenet." });
      td.colSpan = 4;
      td.style.opacity = '0.5';
      td.style.textAlign = 'center';
      emptyRow.appendChild(td);
      outTbody.appendChild(emptyRow);
      return;
    }

    // Sorok generálása: szín | név | érték | ON/OFF toggle
    for (const output of outputs) {
      const row = el("tr");

      // Szín
      const colorCell = el("td");
      const colorBox = el("div");
      const dashInfo = output.dashStyle === DASH_ON ? '━ ━' : '┄ ┄';
      colorBox.style.cssText = `display:flex;align-items:center;gap:6px;`;
      const colorDot = el("div");
      colorDot.style.cssText = `width:20px;height:20px;border-radius:4px;background:${output.color};border:1px solid rgba(255,255,255,0.2);`;
      const dashLabel = el("span", { text: dashInfo });
      dashLabel.style.cssText = `color:${output.color};font-size:16px;font-weight:bold;`;
      colorBox.append(colorDot, dashLabel);
      colorCell.appendChild(colorBox);

      // Név + érték
      const nameCell = el("td", { text: output.label });
      nameCell.style.fontSize = '13px';
      
      const valCell = el("td", { text: String(output.yVal) + (output.mode === 'on' ? ' ▲' : ' ▼') });
      valCell.style.fontSize = '13px';
      valCell.style.opacity = '0.7';

      // Toggle
      const toggleCell = el("td");
      const toggleLabel = el("label", { class: "myio-chart-toggle" });
      const toggleInput = el("input", { type: "checkbox" });
      toggleInput.checked = output.visible;
      const toggleTrack = el("span", { class: "myio-chart-toggle-track" });
      toggleLabel.append(toggleInput, toggleTrack);
      toggleCell.appendChild(toggleLabel);

      toggleInput.onchange = () => {
        output.visible = toggleInput.checked;
        saveOutputToggles(sensorId, state.outputLines);
        const graphDiv = document.getElementById('myio-chart-div');
        if (graphDiv) rebuildChart(graphDiv, state);
      };

      row.append(colorCell, nameCell, valCell, toggleCell);
      outTbody.appendChild(row);
    }
  }

  // === SENSORS RENDERER ===
  
  function renderSensors(root) {
    const { section, grid } = makeSection(typeof str_Sensors !== "undefined" ? str_Sensors : "Sensors", "", "myio.section.sensors");
    let count = 0;

    if (typeof consumption !== "undefined" && consumption != 0) {
      const id = "sensors:consumption";
      const makeFn = () => {
        const c = card(typeof str_Consump !== "undefined" ? str_Consump : "Consumption", "myio-sensor", id);
        addValue(c, (consumption / 1000) + " " + safe(typeof consumptionUnit !== "undefined" ? consumptionUnit : "", ""));
        
        const cardTitle = c.querySelector('.myio-cardTitle');
        if (cardTitle) {
          cardTitle.style.cursor = 'pointer';
          cardTitle.addEventListener('click', (e) => {
            // Nem nyitunk modált, ha a fav ikonra kattintottak
            if (e.target.closest('.myio-fav-wrapper')) return;
            createChartModal(0, typeof str_Consump !== "undefined" ? str_Consump : "Consumption");
          });
        }
        
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
            
            const cardTitle = c.querySelector('.myio-cardTitle');
            if (cardTitle) {
              cardTitle.style.cursor = 'pointer';
              cardTitle.addEventListener('click', (e) => {
                if (e.target.closest('.myio-fav-wrapper')) return;
                createChartModal(idx, thermo_description[idx]);
              });
            }
            
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
            
            const cardTitle = c.querySelector('.myio-cardTitle');
            if (cardTitle) {
              cardTitle.style.cursor = 'pointer';
              cardTitle.addEventListener('click', (e) => {
                if (e.target.closest('.myio-fav-wrapper')) return;
                createChartModal(101 + i, hum_description[i]);
              });
            }
            
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
          if (typeof PCA_PWM != "undefined") showSlider = !!PCA_PWM[i];

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

  // Export chart modal – renderer-chart.js használja
  window.myioChart = { createChartModal };

  // Export
  window.myioRenderers = {
    renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites
  };
})();



