/* renderer-chart.js – Chart modal, CSV kezelés, összehasonlítás, kimenetek */

(function () {
    const { el } = window.myioUtils;
    const { g, str, hexToRgba, getCSSVar } = window.myioRendererHelpers;
  
    const BASE_PATH = document.currentScript?.src?.replace(/[^/]*$/, '') || '/js/3.5/';
    const PRIMARY_COLOR = '#4a9eff';
  
    // ============================================================
    // === Chart.js dinamikus betöltés
    // ============================================================
  
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
  
    if (!window.Chart) {
      loadScript('https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js')
        .then(() => Promise.all([
          loadScript('https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js'),
          loadScript('https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js')
        ]))
        .then(() => {
          if (window.Chart?.register) {
            if (window.ChartZoom) Chart.register(window.ChartZoom);
            if (window.ChartAnnotation) Chart.register(window.ChartAnnotation);
          }
        })
        .catch(err => console.error('Chart.js betöltési hiba:', err));
    }
  
    // CSS
    function loadCSS(href) {
      if (!document.querySelector(`link[href*="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = BASE_PATH + href;
        document.head.appendChild(link);
      }
    }
    loadCSS('chart-modal.css');
  
    // ============================================================
    // === Szín kezelés
    // ============================================================
  
    const CHART_COLORS = [
      '#ff6384', '#36a2eb', '#4bc0c0', '#ffce56',
      '#9966ff', '#ff9f40', '#e7e9ed', '#66ff66',
      '#ff66b2', '#66b2ff', '#b2ff66', '#ffb266'
    ];
  
    function getChartColor(index) {
      return CHART_COLORS[index % CHART_COLORS.length];
    }
  
    const sensorColorMap = new Map();
  
    function getSensorColor(sensorId, isOriginal) {
      if (isOriginal) return PRIMARY_COLOR;
      if (!sensorColorMap.has(sensorId)) {
        sensorColorMap.set(sensorId, getChartColor(sensorColorMap.size));
      }
      return sensorColorMap.get(sensorId);
    }
  
    // ============================================================
    // === CSV / Dátum segéd
    // ============================================================
  
    function generateCSVPath(sensorId, date) {
      let prefix, folder;
      if (sensorId === 0)       { prefix = 'c'; folder = 'c'; }
      else if (sensorId < 100)  { prefix = 't'; folder = 't'; }
      else if (sensorId < 200)  { prefix = 'h'; folder = 'h'; }
      else                      { prefix = 'sdm'; folder = 's'; }
  
      let dirSuffix = '';
      if (sensorId >= 101 && sensorId < 200) dirSuffix = '_' + (sensorId - 101);
      else if (sensorId > 0 && sensorId < 100) dirSuffix = '_' + sensorId;
  
      return `/${prefix}_log${dirSuffix}/${folder}_${date}.csv`;
    }
  
    function formatDateToYYMMDD(date) {
      const yy = String(date.getFullYear()).slice(2);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return yy + mm + dd;
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
  
    function parseCSVToArray(csvText) {
      if (!csvText) return [];
      return csvText.trim().split('\n').reduce((data, line) => {
        const parts = line.split(',');
        if (parts.length < 2) return data;
        const d = new Date(parts[0].trim());
        const v = parseFloat(parts[1].trim());
        if (!isNaN(d.getTime()) && !isNaN(v)) data.push([d, v]);
        return data;
      }, []);
    }
  
    function daysDifference(d1, d2) {
      return Math.abs(Math.round((d1 - d2) / (1000 * 60 * 60 * 24)));
    }
  
    // ============================================================
    // === Szenzor segéd
    // ============================================================
  
    function getSensorLabel(sensorId) {
      if (sensorId === 0) return str('Consump', 'Consumption');
      if (sensorId < 100) {
        const desc = g('thermo_description');
        return desc?.[sensorId] || ('Sensor ' + sensorId);
      }
      if (sensorId >= 101 && sensorId < 200) {
        const desc = g('hum_description');
        return desc?.[sensorId - 101] || ('Humidity ' + (sensorId - 101));
      }
      return 'Sensor ' + sensorId;
    }
  
    function getAvailableSensorOptions() {
      const options = [];
      const consumption = g('consumption');
      if (consumption != null && consumption !== 0) {
        options.push({ id: 0, label: str('Consump', 'Consumption') });
      }
      const thermoIdx = g('thermo_eepromIndex');
      const thermoDesc = g('thermo_description');
      if (thermoIdx) {
        for (let i = 0; i < thermoIdx.length; i++) {
          if (thermoIdx[i] !== 0) {
            const idx = thermoIdx[i];
            options.push({ id: idx, label: thermoDesc?.[idx] || ('Thermo ' + idx) });
          }
        }
      }
      const hum = g('humidity');
      const humDesc = g('hum_description');
      if (hum) {
        for (let i = 0; i < hum.length; i++) {
          if (hum[i] !== 0) {
            options.push({ id: 101 + i, label: humDesc?.[i] || ('Humidity ' + i) });
          }
        }
      }
      return options;
    }
  
    // ============================================================
    // === Output drag-to-adjust
    // ============================================================
  
    function makeOutputDraggable(valueSpan, output, state, sensorId) {
      let isDragging = false;
      let startY = 0;
      let startValue = 0;
  
      Object.assign(valueSpan.style, {
        cursor: 'ns-resize', userSelect: 'none',
        padding: '4px 8px', background: 'rgba(74, 158, 255, 0.1)',
        borderRadius: '4px', display: 'inline-block'
      });
      valueSpan.title = '↕️ Húzd fel/le az érték módosításához';
  
      valueSpan.onmouseenter = () => {
        valueSpan.style.background = 'rgba(74, 158, 255, 0.2)';
      };
      valueSpan.onmouseleave = () => {
        if (!isDragging) valueSpan.style.background = 'rgba(74, 158, 255, 0.1)';
      };
  
      valueSpan.onmousedown = (e) => {
        isDragging = true;
        startY = e.clientY;
        startValue = output.yVal;
        e.preventDefault();
      };
  
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaY = startY - e.clientY;
        output.yVal = Math.round((startValue + deltaY * 0.1) * 10) / 10;
        valueSpan.textContent = output.yVal.toFixed(1) + '°C';
        const graphDiv = document.getElementById('myio-chart-div');
        if (graphDiv) rebuildChart(graphDiv, state);
      });
  
      document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        sendOutputValueToServer(sensorId, output);
      });
    }
  
    async function sendOutputValueToServer(sensorId, output) {
      try {
        const serverValue = Math.round(output.yVal * 10);
        const url = `/api/sensor/${sensorId}/output/${output.id}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: output.type, mode: output.mode, value: serverValue })
        });
        if (!response.ok) console.error('Output küldési hiba:', response.status);
      } catch (err) {
        console.error('Output küldési hiba:', err);
      }
    }
  
    // ============================================================
    // === Output toggle perzisztencia
    // ============================================================
  
    const OUTPUT_TOGGLE_STORAGE_KEY = 'myio-output-toggles';
  
    function saveOutputToggles(sensorId, outputLines) {
      const toggles = {};
      for (const ol of outputLines) toggles[ol.id] = ol.visible;
      localStorage.setItem(`${OUTPUT_TOGGLE_STORAGE_KEY}-${sensorId}`, JSON.stringify(toggles));
    }
  
    function loadOutputToggles(sensorId, outputLines) {
      try {
        const stored = localStorage.getItem(`${OUTPUT_TOGGLE_STORAGE_KEY}-${sensorId}`);
        if (!stored) return;
        const toggles = JSON.parse(stored);
        for (const ol of outputLines) {
          if (toggles[ol.id] !== undefined) ol.visible = toggles[ol.id];
        }
      } catch { /* silent */ }
    }
  
    // ============================================================
    // === Chart Modal létrehozás
    // ============================================================
  
    function createChartModal(sensorId, sensorName) {
      if (!window.Chart) return;
  
      const modal = el("div", { class: "myio-chart-modal" });
      const modalContent = el("div", { class: "myio-chart-modal-content" });
  
      // Fejléc
      const header = el("div", { class: "myio-chart-modal-header" });
      const title = el("h2", { text: sensorName });
      title.style.cssText = 'text-align:center;background:none;color:#4a9eff;flex:1;';
      const closeBtn = el("button", { class: "myio-chart-close", text: "×" });
      header.append(title, closeBtn);
  
      // Chart konténer
      const chartContainer = el("div", { class: "myio-chart-container" });
      Object.assign(chartContainer.style, { height: '400px', width: '100%', position: 'relative' });
      const graphDiv = el("div", { id: "myio-chart-div" });
      Object.assign(graphDiv.style, { width: '100%', height: '100%' });
      chartContainer.appendChild(graphDiv);
  
      // Historikus összehasonlítás
      const historicalSection = el("div", { class: "myio-chart-historical" });
      const historicalTable = el("table", { class: "myio-chart-table" });
      const histTbody = el("tbody");
      historicalTable.appendChild(histTbody);
      historicalSection.append(el("h3", { text: "Betöltés" }), historicalTable);
  
      // Kimenetek
      const outputSection = el("div", { class: "myio-chart-outputs" });
      const outputTable = el("table", { class: "myio-chart-table" });
      const outTbody = el("tbody");
      outputTable.appendChild(outTbody);
      outputSection.append(el("h3", { text: "Kimenetek" }), outputTable);
  
      modalContent.append(header, chartContainer, historicalSection, outputSection);
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
  
      const state = {
        chart: null, sensorId, mainData: [], overlays: [],
        outputLines: [], refreshInterval: null, userZoomed: false
      };
  
      initChart(graphDiv, state, sensorId);
      addEmptyComparisonRow(histTbody, state);
      loadRelatedOutputs(outTbody, sensorId, state);
  
      // Bezárás
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
  
    // ============================================================
    // === Chart inicializálás és újraépítés
    // ============================================================
  
    async function initChart(graphDiv, state, sensorId) {
      const today = formatDateToYYMMDD(new Date());
      const csvText = await fetchCSVText(generateCSVPath(sensorId, today));
      state.mainData = parseCSVToArray(csvText);
  
      if (state.mainData.length === 0) {
        graphDiv.innerHTML = '<p style="color:var(--myio-text-secondary,#aaa);text-align:center;padding:40px;">Nincs adat a mai napra.</p>';
        return;
      }
  
      rebuildChart(graphDiv, state);
      state.refreshInterval = setInterval(() => refreshMainData(graphDiv, state, sensorId), 5000);
    }
  
    function rebuildChart(graphDiv, state) {
      const sensorLabel = getSensorLabel(state.sensorId);
      const datasets = [];
  
      // Fő adatsor
      if (state.mainData.length > 0) {
        datasets.push({
          label: sensorLabel,
          data: state.mainData.map(([d, v]) => ({ x: d, y: v })),
          borderColor: PRIMARY_COLOR, backgroundColor: 'rgba(74, 158, 255, 0.1)',
          borderWidth: 2, pointRadius: 1.5, pointHoverRadius: 4,
          fill: false, tension: 0.1
        });
      }
  
      // Overlay adatsorok
      for (const ov of state.overlays.filter(o => o.visible !== false)) {
        datasets.push({
          label: ov.label,
          data: ov.data.map(([d, v]) => ({ x: d, y: v })),
          borderColor: ov.color, backgroundColor: 'transparent',
          borderWidth: 1.5, borderDash: [], pointRadius: 1, pointHoverRadius: 3,
          fill: false, tension: 0.1
        });
      }
  
      // Annotation vonalak
      const annotations = {};
      (state.outputLines || []).filter(o => o.visible).forEach((output, i) => {
        annotations[`output_${i}`] = {
          type: 'line', yMin: output.yVal, yMax: output.yVal,
          borderColor: output.color, borderWidth: 2,
          borderDash: output.mode === 'on' ? [10, 4] : [3, 3],
          label: {
            display: true, content: output.label, position: 'end',
            backgroundColor: output.color, color: '#1f2937', font: { size: 10 }
          }
        };
      });
  
      // Canvas
      Object.assign(graphDiv.style, { height: '400px', width: '100%' });
      let canvas = graphDiv.querySelector('canvas');
      if (!canvas) {
        canvas = document.createElement('canvas');
        graphDiv.innerHTML = '';
        graphDiv.appendChild(canvas);
      }
      if (state.chart) state.chart.destroy();
  
      const textSecondary = getCSSVar('--myio-text-secondary', '#9ca3af');
      const borderColor = getCSSVar('--myio-border', 'rgba(75, 85, 99, 0.2)');
  
      state.chart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { datasets },
        options: {
          animation: false, responsive: true, maintainAspectRatio: false,
          interaction: { mode: 'nearest', intersect: false },
          scales: {
            x: {
              type: 'time',
              time: { unit: 'hour', displayFormats: { hour: 'HH:mm', minute: 'HH:mm' } },
              ticks: { color: textSecondary, maxRotation: 0, autoSkipPadding: 10 },
              grid: { color: borderColor }
            },
            y: {
              ticks: { color: textSecondary },
              grid: { color: borderColor }
            }
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true, mode: 'nearest', intersect: false, axis: 'x',
              backgroundColor: 'rgba(0,0,0,0.8)', titleColor: '#fff', bodyColor: '#fff',
              borderColor: PRIMARY_COLOR, borderWidth: 1, displayColors: true,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label || ''}: ${ctx.parsed.y.toFixed(2)}`
              }
            },
            zoom: {
              zoom: {
                wheel: { enabled: true, speed: 0.1 },
                pinch: { enabled: true },
                mode: 'x',
                onZoomComplete: () => { state.userZoomed = true; }
              },
              pan: { enabled: true, mode: 'x' },
              limits: { x: { min: 'original', max: 'original' } }
            },
            annotation: { annotations }
          }
        }
      });
    }
  
    async function refreshMainData(graphDiv, state, sensorId) {
      const csvText = await fetchCSVText(generateCSVPath(sensorId, formatDateToYYMMDD(new Date())));
      const newData = parseCSVToArray(csvText);
      if (!newData?.length) return;
  
      state.mainData = newData;
  
      if (!state.chart) {
        rebuildChart(graphDiv, state);
        return;
      }
  
      if (state.userZoomed) {
        const mainDataset = state.chart.data.datasets[0];
        if (mainDataset) {
          mainDataset.data = newData.map(([d, v]) => ({ x: d, y: v }));
          state.chart.update('none');
        }
      } else {
        rebuildChart(graphDiv, state);
      }
    }
  
    // ============================================================
    // === Összehasonlítás táblázat
    // ============================================================
  
    function addEmptyComparisonRow(tbody, state) {
      const row = el("tr", { class: "myio-chart-empty-row" });
  
      // Szín preview
      const colorCell = el("td");
      colorCell.style.cssText = 'text-align:center;vertical-align:middle;';
      const colorPreview = el("div");
      colorPreview.style.cssText = 'width:24px;height:24px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);margin:auto;';
      colorCell.appendChild(colorPreview);
  
      // Szenzor választó
      const sensorCell = el("td");
      const sensorSelect = document.createElement("select");
      sensorSelect.className = "myio-chart-select";
      for (const s of getAvailableSensorOptions()) {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.label;
        if (s.id === state.sensorId) opt.selected = true;
        sensorSelect.appendChild(opt);
      }
      sensorCell.appendChild(sensorSelect);
  
      const updateColor = () => {
        const selectedId = parseInt(sensorSelect.value);
        colorPreview.style.background = getSensorColor(selectedId, selectedId === state.sensorId);
      };
      sensorSelect.onchange = updateColor;
      setTimeout(updateColor, 0);
  
      // Dátum választó
      const dateCell = el("td");
      dateCell.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
      const dateInput = el("input", { type: "date" });
      dateInput.style.width = '100%';
      const pointsLabel = el("span", { text: '' });
      pointsLabel.style.cssText = 'font-size:11px;opacity:0.6;text-align:center;';
      dateCell.append(dateInput, pointsLabel);
  
      const updateSuggestedDate = () => {
        const selectedSid = parseInt(sensorSelect.value);
        const usedDates = state.overlays.filter(ov => ov.sensorId === selectedSid).map(ov => ov.dateStr);
        const candidate = new Date();
        candidate.setDate(candidate.getDate() - 1);
        while (usedDates.includes(candidate.toISOString().split('T')[0])) {
          candidate.setDate(candidate.getDate() - 1);
        }
        dateInput.value = candidate.toISOString().split('T')[0];
      };
      updateSuggestedDate();
      sensorSelect.addEventListener('change', updateSuggestedDate);
  
      // Betöltés gomb
      const actionCell = el("td");
      actionCell.style.cssText = 'text-align:center;vertical-align:middle;';
      const addBtn = el("button", { text: "+", title: "Betöltés" });
      addBtn.style.minWidth = "36px";
      addBtn.onclick = async () => {
        const sid = parseInt(sensorSelect.value);
        const dateStr = dateInput.value;
        if (isNaN(sid) || !dateStr) return;
  
        updateColor();
        const color = getSensorColor(sid, sid === state.sensorId);
        const csvDate = formatDateToYYMMDD(new Date(dateStr));
  
        addBtn.textContent = '⏳';
        const csvText = await fetchCSVText(generateCSVPath(sid, csvDate));
        addBtn.textContent = '+';
  
        if (!csvText) {
          addBtn.textContent = '✗';
          setTimeout(() => { addBtn.textContent = '+'; }, 1500);
          return;
        }
  
        const data = parseCSVToArray(csvText);
        if (!data.length) return;
  
        const overlay = {
          id: Date.now(), sensorId: sid, label: getSensorLabel(sid),
          dateStr, color: hexToRgba(color, 0.3), data,
          borderDash: [10, 4], daysDiff: daysDifference(new Date(dateStr), new Date()),
          visible: true
        };
  
        state.overlays.push(overlay);
        const graphDiv = document.getElementById('myio-chart-div');
        if (graphDiv) rebuildChart(graphDiv, state);
  
        tbody.insertBefore(createComparisonDataRow(tbody, state, overlay), row);
        updateColor();
        updateSuggestedDate();
      };
      actionCell.appendChild(addBtn);
  
      row.append(colorCell, sensorCell, dateCell, actionCell);
      tbody.appendChild(row);
    }
  
    function createComparisonDataRow(tbody, state, overlay) {
      const row = el("tr");
  
      // Toggle + delete
      const toggleCell = el("td");
      toggleCell.style.cssText = 'text-align:center;vertical-align:middle;';
      const toggleLabel = el("label", { class: "myio-chart-toggle" });
      const toggleInput = el("input", { type: "checkbox" });
      toggleInput.checked = overlay.visible !== false;
      const toggleTrack = el("span", { class: "myio-chart-toggle-track" });
      toggleLabel.append(toggleInput, toggleTrack);
  
      const deleteIcon = el("span", { text: "🗑" });
      deleteIcon.style.cssText = 'margin-left:8px;cursor:pointer;opacity:0.6;';
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
  
      toggleCell.append(toggleLabel, deleteIcon);
      toggleInput.onchange = () => {
        overlay.visible = toggleInput.checked;
        const graphDiv = document.getElementById('myio-chart-div');
        if (graphDiv) rebuildChart(graphDiv, state);
      };
  
      // Szín
      const colorCell = el("td");
      colorCell.style.cssText = 'text-align:center;vertical-align:middle;';
      const colorBox = el("div");
      colorBox.style.cssText = `width:24px;height:24px;border-radius:4px;background:${overlay.color};border:1px solid rgba(255,255,255,0.2);`;
      colorCell.appendChild(colorBox);
  
      // Label
      const labelCell = el("td", { text: overlay.label });
      labelCell.style.fontSize = '13px';
  
      // Dátum + pontok
      const dateCell = el("td");
      dateCell.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
      const dateSpan = el("span", { text: overlay.dateStr || '' });
      dateSpan.style.fontSize = '12px';
      const pointsSpan = el("span", { text: overlay.data.length + ' pont' });
      pointsSpan.style.cssText = 'font-size:11px;opacity:0.6;';
      dateCell.append(dateSpan, pointsSpan);
  
      row.append(colorCell, labelCell, dateCell, toggleCell);
      return row;
    }
  
    // ============================================================
    // === Kimenetek (relay, PCA, FET) – közös gyűjtő
    // ============================================================
  
    const DASH_ON  = [10, 4];
    const DASH_OFF = [3, 3];
  
    function collectOutputLines(sensorId, opts, colorIdx) {
      const results = [];
      const { activators, descriptions, onValues, offValues, prefix, namePrefix } = opts;
      if (!activators) return { results, colorIdx };
  
      for (let i = 0; i < activators.length; i++) {
        if (activators[i] !== sensorId) continue;
        const name = descriptions?.[i + 1] || (`${namePrefix} ${i + 1}`);
        const onY = onValues?.[i] != null ? onValues[i] / 10 : null;
        const offY = offValues?.[i] != null ? offValues[i] / 10 : null;
  
        if (onY !== null) {
          results.push({
            id: `${prefix}_on_${i}`, label: name + ' ON',
            color: getChartColor(colorIdx++), yVal: onY, visible: false,
            borderDash: DASH_ON, type: prefix, index: i, mode: 'on'
          });
        }
        if (offY !== null) {
          results.push({
            id: `${prefix}_off_${i}`, label: name + ' OFF',
            color: getChartColor(colorIdx++), yVal: offY, visible: false,
            borderDash: DASH_OFF, type: prefix, index: i, mode: 'off'
          });
        }
      }
      return { results, colorIdx };
    }
  
    function loadRelatedOutputs(outTbody, sensorId, state) {
      let colorIdx = 0;
      const allOutputs = [];
  
      for (const cfg of [
        { activators: g('thermoActivator'), descriptions: g('relay_description'), onValues: g('min_temp_ON'), offValues: g('max_temp_OFF'), prefix: 'relay', namePrefix: 'Relay' },
        { activators: g('PCA_thermoActivator'), descriptions: g('PCA_description'), onValues: g('PCA_min_temp_ON'), offValues: g('PCA_max_temp_OFF'), prefix: 'pca', namePrefix: 'PCA' },
        { activators: g('fet_thermoActivator'), descriptions: g('fet_description'), onValues: g('fet_min_temp_ON'), offValues: g('fet_max_temp_OFF'), prefix: 'fet', namePrefix: 'FET' }
      ]) {
        const result = collectOutputLines(sensorId, cfg, colorIdx);
        allOutputs.push(...result.results);
        colorIdx = result.colorIdx;
      }
  
      state.outputLines = allOutputs;
      loadOutputToggles(sensorId, state.outputLines);
  
      if (allOutputs.length === 0) {
        const emptyRow = el("tr");
        const td = el("td", { text: "Nincs ehhez a szenzorhoz rendelt kimenet." });
        td.colSpan = 4;
        td.style.cssText = 'opacity:0.5;text-align:center;';
        emptyRow.appendChild(td);
        outTbody.appendChild(emptyRow);
        return;
      }
  
      for (const output of allOutputs) {
        const row = el("tr");
  
        // Szín + dash
        const colorCell = el("td");
        const colorBox = el("div");
        colorBox.style.cssText = 'display:flex;align-items:center;gap:6px;';
        const colorDot = el("div");
        colorDot.style.cssText = `width:20px;height:20px;border-radius:4px;background:${output.color};border:1px solid rgba(255,255,255,0.2);`;
        const dashInfo = output.mode === 'on' ? '━ ━' : '┄ ┄';
        const dashLabel = el("span", { text: dashInfo });
        dashLabel.style.cssText = `color:${output.color};font-size:16px;font-weight:bold;`;
        colorBox.append(colorDot, dashLabel);
        colorCell.appendChild(colorBox);
  
        const nameCell = el("td", { text: output.label });
        nameCell.style.fontSize = '13px';
        const valCell = el("td", { text: output.yVal + (output.mode === 'on' ? ' ▲' : ' ▼') });
        valCell.style.cssText = 'font-size:13px;opacity:0.7;';
  
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
  
    // ============================================================
    // === Export
    // ============================================================
  
    window.myioChart = { createChartModal };
  })();