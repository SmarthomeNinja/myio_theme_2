/* thermo.js – Termosztát renderelés és körkörös UI */

(function() {
  const { el, decodeRW } = window.myioUtils;
  const { card, setCardHeaderWithInvAndToggle, registerCardFactory } = window.myioCards;
  const { makeSection } = window.myioSections;

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

  function createCircularThermoCard(cardEl, onVal, offVal, onName, offName, unitText, sensorValue, isActive, isHeating, writable) {
    const size = 180, cx = size / 2, cy = size / 2, radius = 70, strokeWidth = 8, handleRadius = 12;
    const isPercent = unitText === "%" || unitText === " %";
    const defaultMinTemp = isPercent ? 0 : 5;
    const defaultMaxTemp = isPercent ? 100 : 40;

    let currentOnVal = onVal, currentOffVal = offVal;
    let currentIsHeating = currentOnVal < currentOffVal;

    const calculateScale = () => {
      const fullHysteresis = Math.abs(currentOffVal - currentOnVal);
      const avgTemp = (currentOnVal + currentOffVal) / 2;
      const displayHysteresis = fullHysteresis / 2;
      let multiplier = isPercent
        ? Math.max(2, Math.min(8, 8 - fullHysteresis * 0.12))
        : Math.max(2, Math.min(5, 5 - fullHysteresis * 0.8));
      const range = fullHysteresis * multiplier;
      return { minT: avgTemp - range / 2, maxT: avgTemp + range / 2, hysteresis: displayHysteresis, avgTemp };
    };

    let scale = calculateScale();
    let scaleMinTemp = scale.minT, scaleMaxTemp = scale.maxT;

    const arcStartDeg = 240, arcSpan = 240, arcEndDeg = arcStartDeg + arcSpan;

    const tempToAngle = (temp) => {
      const ratio = Math.max(0, Math.min(1, (temp - scaleMinTemp) / (scaleMaxTemp - scaleMinTemp)));
      return arcStartDeg + ratio * arcSpan;
    };

    const angleToTemp = (angle) => {
      let normAngle = angle;
      while (normAngle < 0) normAngle += 360;
      while (normAngle >= 360) normAngle -= 360;
      let arcAngle;
      if (normAngle >= arcStartDeg) arcAngle = normAngle;
      else if (normAngle <= (arcEndDeg % 360)) arcAngle = normAngle + 360;
      else {
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
      const start = polarToCartesian(startAngle), end = polarToCartesian(endAngle);
      const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
      return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    const getModeColor = (heating) => heating ? "#FF6B35" : "#35B8FF";
    const getModeColorLight = (heating) => heating ? "rgba(255, 107, 53, 0.3)" : "rgba(53, 184, 255, 0.3)";
    const getModeIcon = (heating, active) => !active ? "🌡️" : (heating ? "🔥" : "❄️");
    const getModeText = (heating) => heating
      ? (typeof str_Heating !== "undefined" ? str_Heating : "Heating")
      : (typeof str_Cooling !== "undefined" ? str_Cooling : "Cooling");

    const thermoContainer = el("div", { class: "myio-thermo-circular" });
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("class", "myio-thermo-svg");
    svg.style.cssText = "width:100%;max-width:250px;height:auto;touch-action:none;";

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
      if (onHandle) onHandle.setAttribute("fill", color);

      const onAng = tempToAngle(currentOnVal);
      const offAng = tempToAngle(currentOffVal);
      const minAng = Math.min(onAng, offAng);
      const maxAng = Math.max(onAng, offAng);

      activeArc.setAttribute("d", maxAng - minAng > 0.5 ? describeArc(minAng, maxAng) : "");

      if (onHandle && offHandle) {
        const onPos = polarToCartesian(onAng), offPos = polarToCartesian(offAng);
        onHandle.setAttribute("cx", onPos.x); onHandle.setAttribute("cy", onPos.y);
        offHandle.setAttribute("cx", offPos.x); offHandle.setAttribute("cy", offPos.y);
      }

      if (isActive) {
        const sensorAng = tempToAngle(Math.max(scaleMinTemp, Math.min(scaleMaxTemp, sensorValue)));
        const targetAng = currentIsHeating ? onAng : offAng;
        currentArc.setAttribute("d", Math.abs(sensorAng - targetAng) > 0.5
          ? describeArc(Math.min(sensorAng, targetAng), Math.max(sensorAng, targetAng)) : "");
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
        sensorDisplay.innerHTML = `<span class="icon"${!isActive ? ' style="transform:rotate(90deg)"' : ''}>${getModeIcon(currentIsHeating, isActive)}</span> ${sensorValue.toFixed(1)} ${unitText}`;
      }

      cardEl.classList.remove("myio-heat", "myio-cool");
      if (isActive) cardEl.classList.add(currentIsHeating ? "myio-heat" : "myio-cool");
    };

    updateAll();

    if (writable) {
      const createHandle = (fill) => {
        const h = document.createElementNS(svgNS, "circle");
        h.setAttribute("r", handleRadius);
        h.setAttribute("fill", fill);
        h.setAttribute("stroke", "#fff");
        h.setAttribute("stroke-width", "3");
        h.setAttribute("class", "myio-thermo-handle");
        h.style.cssText = "cursor:grab;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));";
        return h;
      };

      onHandle = createHandle(getModeColor(currentIsHeating));
      offHandle = createHandle("#666");
      svg.appendChild(onHandle);
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
        e.preventDefault(); e.stopPropagation();
        dragging = { handle, isOn: isOnHandle };
        handle.style.cursor = "grabbing";
        handle.setAttribute("r", handleRadius + 3);
      };

      const doDrag = (e) => {
        if (!dragging) return;
        e.preventDefault();
        let temp = Math.round(angleToTemp(getAngleFromEvent(e)) * 10) / 10;
        if (dragging.isOn) currentOnVal = temp; else currentOffVal = temp;

        const onAng = tempToAngle(currentOnVal), offAng = tempToAngle(currentOffVal);
        const onPos = polarToCartesian(onAng), offPos = polarToCartesian(offAng);
        onHandle.setAttribute("cx", onPos.x); onHandle.setAttribute("cy", onPos.y);
        offHandle.setAttribute("cx", offPos.x); offHandle.setAttribute("cy", offPos.y);

        const minAng = Math.min(onAng, offAng), maxAng = Math.max(onAng, offAng);
        if (maxAng - minAng > 0.5) activeArc.setAttribute("d", describeArc(minAng, maxAng));

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
          onInput.name = onName; onInput.value = String(Math.round(currentOnVal * 10));
          const offInput = document.createElement("input");
          offInput.name = offName; offInput.value = String(Math.round(currentOffVal * 10));
          changedPair(onInput, onInput.name, offInput, offInput.name);
        } catch (err) { console.error("Thermostat update error:", err); }
      };

      onHandle.addEventListener("mousedown", startDrag(onHandle, true));
      onHandle.addEventListener("touchstart", startDrag(onHandle, true), { passive: false });
      offHandle.addEventListener("mousedown", startDrag(offHandle, false));
      offHandle.addEventListener("touchstart", startDrag(offHandle, false), { passive: false });

      [svg, document].forEach(t => {
        t.addEventListener("mousemove", doDrag);
        t.addEventListener("touchmove", doDrag, { passive: false });
        t.addEventListener("mouseup", endDrag);
        t.addEventListener("touchend", endDrag);
      });
    }

    thermoContainer.appendChild(svg);

    const centerDisplay = el("div", { class: "myio-thermo-center" });

    modeDisplay = el("div", { class: "myio-thermo-mode" + (isActive ? " active" : ""), style: `color:${isActive ? getModeColor(currentIsHeating) : "#888"}` });
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
      const adjustTemp = (delta) => {
        currentOnVal = Math.round((currentOnVal + delta) * 10) / 10;
        currentOffVal = Math.round((currentOffVal + delta) * 10) / 10;
        const minVal = Math.min(currentOnVal, currentOffVal);
        const maxVal = Math.max(currentOnVal, currentOffVal);
        if (minVal < defaultMinTemp) { const shift = defaultMinTemp - minVal; currentOnVal += shift; currentOffVal += shift; }
        if (maxVal > defaultMaxTemp) { const shift = maxVal - defaultMaxTemp; currentOnVal -= shift; currentOffVal -= shift; }
        updateAll();
        try {
          const onInput = document.createElement("input");
          onInput.name = onName; onInput.value = String(Math.round(currentOnVal * 10));
          const offInput = document.createElement("input");
          offInput.name = offName; offInput.value = String(Math.round(currentOffVal * 10));
          changedPair(onInput, onInput.name, offInput, offInput.name);
        } catch (err) { console.error("Thermostat adjust error:", err); }
      };

      const minusBtn = el("button", { class: "myio-thermo-btn minus", text: "−" });
      const plusBtn = el("button", { class: "myio-thermo-btn plus", text: "+" });
      minusBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); adjustTemp(-0.1); });
      plusBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); adjustTemp(0.1); });
      btnContainer.append(minusBtn, plusBtn);
      thermoContainer.appendChild(btnContainer);
    }

    cardEl.appendChild(thermoContainer);
  }

  function renderThermo(root) {
    const hasRelays = (typeof relays !== "undefined" && typeof thermoActivator !== "undefined");
    const hasPCA = (typeof PCA !== "undefined" && typeof PCA_thermoActivator !== "undefined");
    if (!hasRelays && !hasPCA) return;

    const PCARead = [], PCAWrite = [], PCAVal = [];
    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
        const d = decodeRW(PCA[i]);
        PCARead[i] = d.read; PCAWrite[i] = d.write; PCAVal[i] = d.val;
      }
    }

    let any = false;
    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
        if (PCA_thermoActivator[i] != 0 && (PCARead[i] || PCAWrite[i]) && PCA_description && PCA_description[i + 1] != null) { any = true; break; }
      }
    }
    if (!any && hasRelays) {
      for (let i = 0; i < relays.length; i++) {
        if (thermoActivator[i] != 0 && relay_description && relay_description[i + 1] != null) { any = true; break; }
      }
    }
    if (!any) return;

    const { section, grid } = makeSection(typeof str_SensOut !== "undefined" ? str_SensOut : "SensOut", "", "myio.section.thermo");

    // PCA thermo
    if (hasPCA) {
      for (let i = 0; i < PCA.length; i++) {
        if (PCA_thermoActivator[i] == 0 || !(PCARead[i] || PCAWrite[i]) || !PCA_description || PCA_description[i + 1] == null) continue;

        const id = `thermo:pca:${i + 1}`;
        const makeFn = () => {
          if (!PCA_description[i + 1]) PCA_description[i + 1] = "-";
          const isActive = (PCAVal[i] > (typeof PCAMIN !== "undefined" ? PCAMIN[i] : 0));
          let status = "myio-off", isHeating = true;
          if (isActive) {
            if (typeof PCA_min_temp_ON !== "undefined" && typeof PCA_max_temp_OFF !== "undefined") {
              if (PCA_min_temp_ON[i] < PCA_max_temp_OFF[i]) { status = "myio-on myio-heat"; isHeating = true; }
              else if (PCA_max_temp_OFF[i] < PCA_min_temp_ON[i]) { status = "myio-on myio-cool"; isHeating = false; }
              else status = "myio-on";
            } else status = "myio-on";
          } else if (typeof PCA_min_temp_ON !== "undefined" && typeof PCA_max_temp_OFF !== "undefined") {
            isHeating = PCA_min_temp_ON[i] < PCA_max_temp_OFF[i];
          }

          const c = card(PCA_description[i + 1], status, id);
          if (PCAWrite[i]) setCardHeaderWithInvAndToggle(c, PCA_description[i + 1], "PCA_INV", "PCA_ON", "PCA_OFF", i + 1, isActive, id);

          const sensor = getSensorNameAndValue(PCA_thermoActivator[i]);
          const unitText = sensor.isTemp ? "°C" : "%";
          const onTh = (typeof PCA_min_temp_ON !== "undefined" ? (PCA_min_temp_ON[i] / 10) : 0);
          const offTh = (typeof PCA_max_temp_OFF !== "undefined" ? (PCA_max_temp_OFF[i] / 10) : 0);
          createCircularThermoCard(c, onTh, offTh, "PCA_temp_MIN*" + (i + 1), "PCA_temp_MAX*" + (i + 1), unitText, sensor.value, isActive, isHeating, PCAWrite[i]);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }

    // Relay thermo
    if (hasRelays) {
      for (let i = 0; i < relays.length; i++) {
        if (thermoActivator[i] == 0 || !relay_description || relay_description[i + 1] == null) continue;

        const id = `thermo:relay:${i + 1}`;
        const makeFn = () => {
          if (!relay_description[i + 1]) relay_description[i + 1] = "-";
          const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);
          let status = "myio-off", isHeating = true;
          if (isOn) {
            if (typeof min_temp_ON !== "undefined" && typeof max_temp_OFF !== "undefined") {
              if (min_temp_ON[i] < max_temp_OFF[i]) { status = "myio-on myio-heat"; isHeating = true; }
              else if (max_temp_OFF[i] < min_temp_ON[i]) { status = "myio-on myio-cool"; isHeating = false; }
              else status = "myio-on";
            } else status = "myio-on";
          } else if (typeof min_temp_ON !== "undefined" && typeof max_temp_OFF !== "undefined") {
            isHeating = min_temp_ON[i] < max_temp_OFF[i];
          }

          const c = card(relay_description[i + 1], status, id);
          const writable = (parseInt(relays[i] / 10) == 1 || parseInt(relays[i] / 10) == 11);
          if (writable) setCardHeaderWithInvAndToggle(c, relay_description[i + 1], "r_INV", "r_ON", "r_OFF", i + 1, isOn, id);

          const sensor = getSensorNameAndValue(thermoActivator[i]);
          const unitText = sensor.isTemp ? "°C" : "%";
          const onTh = (typeof min_temp_ON !== "undefined" ? (min_temp_ON[i] / 10) : 0);
          const offTh = (typeof max_temp_OFF !== "undefined" ? (max_temp_OFF[i] / 10) : 0);
          createCircularThermoCard(c, onTh, offTh, "min_temp_ON*" + (i + 1), "max_temp_OFF*" + (i + 1), unitText, sensor.value, isOn, isHeating, writable);
          return c;
        };
        registerCardFactory(id, makeFn);
        grid.append(makeFn());
      }
    }

    if (grid.childNodes.length > 0) root.append(section);
  }

  window.myioThermo = { renderThermo, createCircularThermoCard };
  window.myioRenderThermo = renderThermo;
})();
