/* renderers.js – Szekciók renderelése */

(function() {
  const { el, decodeRW, safe } = window.myioUtils;
  const { loadFavs } = window.myioStorage;
  const { card, cardWithInvTitle, addValue, addButtons, setCardHeaderWithInvAndToggle, registerCardFactory, getCardFactory, hasCardFactory } = window.myioCards;
  const { makeSection } = window.myioSections;
  const FAV_SECTION_KEY = window.myioStorage.FAV_SECTION_KEY;

  // --- Chart.js betöltése dinamikusan ---
  if (!window.Chart) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
    document.head.appendChild(script);
  }

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

  // === CHART MODAL FUNKCIÓK ===
  
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

  async function loadCSVData(csvPath) {
    try {
      const response = await fetch(csvPath);
      if (!response.ok) return null;
      const text = await response.text();
      const lines = text.trim().split('\n');
      const data = lines.map(line => {
        const [time, value] = line.split(',');
        return { time: time.trim(), value: parseFloat(value) };
      });
      return data;
    } catch (error) {
      console.error('CSV betöltési hiba:', error);
      return null;
    }
  }

  function getColorForDataset(index, opacity = 1) {
    const colors = [
      `rgba(255, 99, 132, ${opacity})`,   // piros
      `rgba(54, 162, 235, ${opacity})`,   // kék
      `rgba(75, 192, 192, ${opacity})`,   // zöld
      `rgba(255, 206, 86, ${opacity})`,   // sárga
      `rgba(153, 102, 255, ${opacity})`,  // lila
      `rgba(255, 159, 64, ${opacity})`,   // narancs
    ];
    return colors[index % colors.length];
  }

  function createChartModal(sensorId, sensorName) {
    const modal = el("div", { class: "myio-chart-modal" });
    const modalContent = el("div", { class: "myio-chart-modal-content" });
    
    const header = el("div", { class: "myio-chart-modal-header" });
    const title = el("h2", { text: sensorName });
    const closeBtn = el("button", { class: "myio-chart-close", text: "×" });
    closeBtn.onclick = () => modal.remove();
    header.append(title, closeBtn);
    
    const canvasContainer = el("div", { class: "myio-chart-container" });
    const canvas = el("canvas", { id: "sensorChart" });
    canvasContainer.appendChild(canvas);
    
    const historicalSection = el("div", { class: "myio-chart-historical" });
    const historicalTitle = el("h3", { text: "Történeti adatok" });
    const historicalTable = el("table", { class: "myio-chart-table" });
    const tbody = el("tbody");
    historicalTable.appendChild(tbody);
    historicalSection.append(historicalTitle, historicalTable);
    
    const outputSection = el("div", { class: "myio-chart-outputs" });
    const outputTitle = el("h3", { text: "Kimenetek" });
    const outputTable = el("table", { class: "myio-chart-table" });
    const outputTbody = el("tbody");
    outputTable.appendChild(outputTbody);
    outputSection.append(outputTitle, outputTable);
    
    modalContent.append(header, canvasContainer, historicalSection, outputSection);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    const chartState = {
      chart: null,
      datasets: [],
      refreshInterval: null,
      currentZoom: null
    };
    
    initializeChart(canvas, chartState, sensorId);
    loadCurrentDayData(chartState, sensorId);
    addEmptyHistoricalRow(tbody, chartState, sensorId);
    loadOutputs(outputTbody, sensorId, chartState);
    
    if (isToday(new Date())) {
      chartState.refreshInterval = setInterval(() => {
        refreshCurrentData(chartState, sensorId);
      }, 5000);
    }
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    window.addEventListener('beforeunload', () => {
      if (chartState.refreshInterval) clearInterval(chartState.refreshInterval);
    });
  }

  function initializeChart(canvas, chartState, sensorId) {
    const ctx = canvas.getContext('2d');
    chartState.chart = new Chart(ctx, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          zoom: {
            pan: { enabled: true, mode: 'x' },
            zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
          },
          legend: { display: true }
        },
        scales: {
          x: { type: 'time', time: { unit: 'hour' } },
          y: { beginAtZero: false }
        }
      }
    });
  }

  async function loadCurrentDayData(chartState, sensorId) {
    const today = formatDateToYYMMDD(new Date());
    const csvPath = generateCSVPath(sensorId, today);
    const data = await loadCSVData(csvPath);
    
    if (data) {
      const dataset = {
        label: 'Aktuális',
        data: data.map(d => ({ x: new Date(d.time), y: d.value })),
        borderColor: getColorForDataset(0),
        backgroundColor: getColorForDataset(0, 0.1),
        borderWidth: 2
      };
      chartState.datasets.push(dataset);
      chartState.chart.data.datasets = chartState.datasets;
      chartState.chart.update();
    }
  }

  async function refreshCurrentData(chartState, sensorId) {
    const today = formatDateToYYMMDD(new Date());
    const csvPath = generateCSVPath(sensorId, today);
    const data = await loadCSVData(csvPath);
    
    if (data && chartState.datasets.length > 0) {
      const currentDataset = chartState.datasets[0];
      const oldLength = currentDataset.data.length;
      currentDataset.data = data.map(d => ({ x: new Date(d.time), y: d.value }));
      
      const chart = chartState.chart;
      if (oldLength > 0 && data.length > oldLength) {
        const xScale = chart.scales.x;
        const isAtEnd = xScale.max >= currentDataset.data[oldLength - 1].x;
        if (isAtEnd) {
          chart.update('none');
          xScale.options.max = currentDataset.data[data.length - 1].x;
        }
      }
      
      chart.update('none');
    }
  }

  function addEmptyHistoricalRow(tbody, chartState, defaultSensorId) {
    const row = el("tr");
    
    const colorCell = el("td");
    const colorInput = el("input", { type: "color", value: getColorForDataset(chartState.datasets.length) });
    colorCell.appendChild(colorInput);
    
    const sensorCell = el("td");
    const sensorInput = el("input", { type: "number", value: String(defaultSensorId), placeholder: "Sensor ID" });
    sensorCell.appendChild(sensorInput);
    
    const dateCell = el("td");
    const dateInput = el("input", { type: "date", value: new Date().toISOString().split('T')[0] });
    dateCell.appendChild(dateInput);
    
    const actionCell = el("td");
    const addBtn = el("button", { text: "+" });
    addBtn.onclick = async () => {
      const sid = parseInt(sensorInput.value);
      const dateStr = dateInput.value;
      const color = colorInput.value;
      
      if (!sid || !dateStr) return;
      
      const date = new Date(dateStr);
      const csvDate = formatDateToYYMMDD(date);
      const csvPath = generateCSVPath(sid, csvDate);
      const data = await loadCSVData(csvPath);
      
      if (data) {
        const opacity = isRecent(date) ? 1 : 0.5;
        const dataset = {
          label: `Sensor ${sid} (${dateStr})`,
          data: data.map(d => ({ x: new Date(d.time), y: d.value })),
          borderColor: color,
          backgroundColor: hexToRgba(color, 0.1),
          borderWidth: 2,
          borderDash: [5, 5]
        };
        
        chartState.datasets.push(dataset);
        chartState.chart.data.datasets = chartState.datasets;
        chartState.chart.update();
        
        const newRow = createHistoricalDataRow(chartState, dataset, color, sid, dateStr);
        tbody.insertBefore(newRow, row);
        
        sensorInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];
      }
    };
    actionCell.appendChild(addBtn);
    
    row.append(colorCell, sensorCell, dateCell, actionCell);
    tbody.appendChild(row);
  }

  function createHistoricalDataRow(chartState, dataset, color, sensorId, dateStr) {
    const row = el("tr");
    
    const colorCell = el("td");
    const colorBox = el("div", { style: `width:20px; height:20px; background:${color}; border:1px solid #ccc;` });
    colorCell.appendChild(colorBox);
    
    const sensorCell = el("td", { text: `Sensor ${sensorId}` });
    const dateCell = el("td", { text: dateStr });
    
    const actionCell = el("td");
    const deleteBtn = el("button", { text: "🗑" });
    deleteBtn.onclick = () => {
      const idx = chartState.datasets.indexOf(dataset);
      if (idx > -1) {
        chartState.datasets.splice(idx, 1);
        chartState.chart.data.datasets = chartState.datasets;
        chartState.chart.update();
        row.remove();
      }
    };
    actionCell.appendChild(deleteBtn);
    
    row.append(colorCell, sensorCell, dateCell, actionCell);
    return row;
  }

  function loadOutputs(outputTbody, sensorId, chartState) {
    // TODO: Itt kell betölteni azokat a kimeneteket (relay, PCA), 
    // amelyeket az adott szenzor vezérel
    // Egyelőre placeholder
    const note = el("tr");
    const td = el("td", { colspan: "4", text: "Kimenetek betöltése fejlesztés alatt..." });
    note.appendChild(td);
    outputTbody.appendChild(note);
  }

  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  function isRecent(date) {
    const now = new Date();
    const diff = Math.abs(now - date);
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 7;
  }

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // === SENSORS RENDERER (MÓDOSÍTOTT) ===
  
  function renderSensors(root) {
    const { section, grid } = makeSection(typeof str_Sensors !== "undefined" ? str_Sensors : "Sensors", "", "myio.section.sensors");
    let count = 0;

    if (typeof consumption !== "undefined" && consumption != 0) {
      const id = "sensors:consumption";
      const makeFn = () => {
        const c = card(typeof str_Consump !== "undefined" ? str_Consump : "Consumption", "myio-sensor", id);
        addValue(c, (consumption / 1000) + " " + safe(typeof consumptionUnit !== "undefined" ? consumptionUnit : "", ""));
        
        // Névre kattintás -> modal megnyitása
        const cardHeader = c.querySelector('.myio-card-name');
        if (cardHeader) {
          cardHeader.style.cursor = 'pointer';
          cardHeader.onclick = () => createChartModal(0, typeof str_Consump !== "undefined" ? str_Consump : "Consumption");
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
            
            // Névré kattintás -> modal megnyitása
            const cardHeader = c.querySelector('.myio-card-name');
            if (cardHeader) {
              cardHeader.style.cursor = 'pointer';
              cardHeader.onclick = () => createChartModal(idx, thermo_description[idx]);
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
            
            // Névré kattintás -> modal megnyitása
            const cardHeader = c.querySelector('.myio-card-name');
            if (cardHeader) {
              cardHeader.style.cursor = 'pointer';
              cardHeader.onclick = () => createChartModal(101 + i, hum_description[i]);
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

  // Export
  window.myioRenderers = {
    renderSensors, renderSwitches, renderPCA, renderFET, renderRelays, renderFavorites
  };
})();
