/**
 * liveUpdate.js - MyIO Live Update Module
 * AJAX alapú élő frissítés és parancsküldés oldal újratöltés nélkül
 * 
 * Funkciók:
 * - fetchSensOut(): JSON adatok lekérése a szerverről
 * - updateUI(data): UI elemek frissítése az adatok alapján
 * - sendCommand(cmd): Parancs küldése AJAX GET-tel
 */

const MyIOLive = (function() {
  'use strict';

  // ========== CONFIGURATION ==========
  const CONFIG = {
    sensOutUrl: '/sens_out.json',
    commandUrl: '/command:',
    commandDelay: 500,  // ms várakozás parancs után a frissítés előtt
    debug: false
  };

  // ========== STATE ==========
  let lastData = null;
  let isUpdating = false;

  // ========== UTILITY FUNCTIONS ==========
  
  function log(...args) {
    if (CONFIG.debug) console.log('[MyIOLive]', ...args);
  }

  function toast(msg) {
    const t = document.getElementById('myio-toast');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    clearTimeout(toast._tm);
    toast._tm = setTimeout(() => { t.style.display = 'none'; }, 2200);
  }

  // ========== DATA FETCHING ==========

  /**
   * Lekéri a sens_out.json-t AJAX-szal
   * @returns {Promise<Object|null>} A JSON adat vagy null hiba esetén
   */
  async function fetchSensOut() {
    try {
      const response = await fetch(CONFIG.sensOutUrl, {
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      lastData = data;
      log('Data fetched:', data);
      return data;
    } catch (err) {
      console.warn('[MyIOLive] Fetch error:', err);
      return null;
    }
  }

  // ========== COMMAND SENDING ==========

  /**
   * Parancs küldése a szervernek AJAX GET-tel
   * @param {string} cmd - A parancs (pl. "r_ON=1", "r_OFF=5", "PCA*3=128")
   * @param {boolean} refreshAfter - Frissítse-e a UI-t utána
   * @returns {Promise<string|null>} A szerver válasza vagy null
   */
  async function sendCommand(cmd, refreshAfter = true) {
    try {
      log('Sending command:', cmd);
      
      const url = CONFIG.commandUrl + cmd;
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const text = await response.text();
      log('Command response:', text);
      
      // Toast megjelenítése - ha HTML válasz jön, kinyerjük a parancsot
      if (text && text.trim()) {
        let toastMsg = text.trim();
        // Ha HTML válasz, keressük meg a "parancs :" részt
        const match = text.match(/parancs\s*:\s*([^\n<]+)/i);
        if (match) {
          toastMsg = '✓ ' + match[1].trim();
        } else if (text.includes('<html')) {
          // Ha HTML de nem találtuk a mintát, csak jelezzük a sikert
          toastMsg = '✓ ' + cmd;
        }
        toast(toastMsg);
      }
      
      // Frissítés késleltetett végrehajtása
      if (refreshAfter) {
        setTimeout(async () => {
          const data = await fetchSensOut();
          if (data) {
            updateUI(data);
          }
        }, CONFIG.commandDelay);
      }
      
      return text;
    } catch (err) {
      console.warn('[MyIOLive] Command error:', err);
      toast('Hiba: ' + err.message);
      return null;
    }
  }

  // ========== UI UPDATE FUNCTIONS ==========

  /**
   * Frissíti az összes UI elemet a JSON adatok alapján
   * @param {Object} data - A sens_out.json tartalma
   */
  function updateUI(data) {
    if (!data || isUpdating) return;
    
    isUpdating = true;
    log('Updating UI...');
    
    try {
      // Globális változók frissítése (kompatibilitás)
      updateGlobalVariables(data);
      
      // Hőmérséklet szenzorok frissítése (thermo kártyák előtt!)
      if (data.sensors) {
        updateThermoSensors(data.sensors);
      }
      
      // Relay kártyák frissítése
      if (data.relays) {
        updateRelays(data.relays);
      }
      
      // PCA kimenetek frissítése
      if (data.PCA) {
        updatePCA(data.PCA);
      }
      
      // PWM kimenetek frissítése
      if (data.PWM) {
        updatePWM(data.PWM);
      }
      
      // Szenzorok frissítése
      if (data.sensors) {
        updateSensors(data.sensors);
      }
      
      log('UI update complete');
    } catch (err) {
      console.error('[MyIOLive] UI update error:', err);
    } finally {
      isUpdating = false;
    }
  }

  /**
   * Frissíti a globális változókat (visszamenőleges kompatibilitás)
   */
  function updateGlobalVariables(data) {
    // Relays tömb frissítése
    if (data.relays && typeof relays !== 'undefined') {
      for (const key in data.relays) {
        const idx = parseInt(key);
        const relay = data.relays[key];        
        // A régi formátum: relays[i] értéke tartalmazza a read/write flag-eket is
        // state: 0 vagy 1, de a régi relays tömbben 110/111/101 stb. van
        // Megtartjuk a read/write flag-eket, csak a state-et frissítjük
        const oldVal = relays[idx];
        const baseVal = Math.floor(oldVal / 10) * 10; // read/write flags
        relays[idx] = baseVal + relay.state;

        if (typeof thermoActivator !== 'undefined') {
          thermoActivator[idx] = relay.sensor || 0;
        }
        if (typeof min_temp_ON !== 'undefined') {
          min_temp_ON[idx] = relay.sensorON || 0;
        }
        if (typeof max_temp_OFF !== 'undefined') {
          max_temp_OFF[idx] = relay.sensorOFF || 0;
        }
      }
    }
    
    // PCA tömb frissítése
    if (data.PCA && typeof PCA !== 'undefined') {
      for (const key in data.PCA) {
        const idx = parseInt(key);
        const pca = data.PCA[key];
        // Megtartjuk a read/write flag-eket (10000/1000)
        const oldVal = PCA[idx];
        let readFlag = 0, writeFlag = 0;
        let tempVal = oldVal;
        if (tempVal >= 10000) { readFlag = 10000; tempVal -= 10000; }
        if (tempVal >= 1000) { writeFlag = 1000; tempVal -= 1000; }
        PCA[idx] = readFlag + writeFlag + pca.state;
        
        // Szenzor adatok frissítése
        if (typeof PCA_thermoActivator !== 'undefined') {
          PCA_thermoActivator[idx] = pca.sensor || 0;
        }
        if (typeof PCA_min_temp_ON !== 'undefined') {
          PCA_min_temp_ON[idx] = pca.sensorON || 0;
        }
        if (typeof PCA_max_temp_OFF !== 'undefined') {
          PCA_max_temp_OFF[idx] = pca.sensorOFF || 0;
        }
      }
    }
    
    // PWM/FET tömb frissítése
    if (data.PWM && typeof fet !== 'undefined') {
      for (const key in data.PWM) {
        const idx = parseInt(key);
        const pwm = data.PWM[key];
        const oldVal = fet[idx];
        let readFlag = 0, writeFlag = 0;
        let tempVal = oldVal;
        if (tempVal >= 10000) { readFlag = 10000; tempVal -= 10000; }
        if (tempVal >= 1000) { writeFlag = 1000; tempVal -= 1000; }
        fet[idx] = readFlag + writeFlag + pwm.state;
      }
    }
    
    // Humidity frissítése
    if (data.sensors && typeof humidity !== 'undefined') {
      for (const key in data.sensors) {
        const id = parseInt(key);
        if (id >= 101 && id <= 108) {
          const idx = id - 101;
          humidity[idx] = data.sensors[key].hum || 0;
        }
      }
    }
    
    // Fogyasztás adatok
    if (data.sensors) {
      if (data.sensors['200'] && typeof consumption !== 'undefined') {
        window.consumption = data.sensors['200'].imp || 0;
      }
    }
  }

  /**
   * Hőmérséklet szenzorok frissítése (thermo_temps globális változó és UI)
   */
  function updateThermoSensors(sensorsData) {
    // Hőmérséklet szenzorok (1-99)
    if (typeof thermo_temps !== 'undefined' && typeof thermo_eepromIndex !== 'undefined') {
      for (const key in sensorsData) {

        const sensorId = key.id;
        if (sensorId >= 1 && sensorId <= 99 && sensorsData[key].temp !== undefined) {
          // Keressük meg a thermo_eepromIndex-ben ezt az ID-t
          for (let i = 0; i < thermo_eepromIndex.length; i++) {
            if (thermo_eepromIndex[i] === sensorId) {
              thermo_temps[i] = sensorsData[key].temp;
              console.log(`Thermo sensor ${sensorId} updated: ${sensorsData[key].temp / 100}°C`);
              
              // Frissítsük a szenzor kártyát is
              const cards = document.querySelectorAll(`[data-cardid="sensors:thermo:${sensorId}"]`);
              cards.forEach(card => {
                const valueEl = card.querySelector('.myio-value');
                if (valueEl) {
                  valueEl.textContent = (sensorsData[key].temp / 100) + ' °C';
                }
              });
              break;
            }
          }
        }

      }
    }
  }

  /**
   * Relay kártyák UI frissítése
   * JAVÍTÁS: querySelectorAll használata és thermo kártyák teljes frissítése
   */
  function updateRelays(relaysData) {
    for (const key in relaysData) {
      const idx = parseInt(key);
      const relay = relaysData[key];
      const relayId = idx + 1; // relay ID = tömb index + 1
      const isOn = relay.state === 1;
      const isThermo = relay.sensor > 0; // Ha van szenzor, akkor thermo kártya
      
      // Normál relay kártyák
      const cards = document.querySelectorAll(`[data-cardid="relay:${relayId}"]`);
      cards.forEach(card => {
        card.classList.remove('myio-on', 'myio-off');
        card.classList.add(isOn ? 'myio-on' : 'myio-off');
        
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
      });
      
      // Thermo relay kártyák
      const thermoCards = document.querySelectorAll(`[data-cardid="thermo:relay:${relayId}"]`);
      thermoCards.forEach(card => {
        // On/Off állapot frissítése
        card.classList.remove('myio-on', 'myio-off', 'myio-heat', 'myio-cool');
        if (isOn) {
          card.classList.add('myio-on');
          // Heat/cool meghatározása
          if (relay.sensorON < relay.sensorOFF) {
            card.classList.add('myio-heat');
          } else if (relay.sensorOFF < relay.sensorON) {
            card.classList.add('myio-cool');
          }
        } else {
          card.classList.add('myio-off');
        }
        
        // Toggle frissítése
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
        
        // Thermo circular UI frissítése
        updateThermoCircularUI(card, relay, isOn);
      });
      
      if (cards.length > 0) {
        log(`Relay ${relayId}: ${isOn ? 'ON' : 'OFF'} (${cards.length} cards updated)`);
      }
    }
  }
  
  /**
   * PCA kimenetek UI frissítése
   * JAVÍTÁS: querySelectorAll használata és thermo kártyák teljes frissítése
   */
  function updatePCA(pcaData) {
    for (const key in pcaData) {
      const idx = parseInt(key);
      const pca = pcaData[key];
      const pcaId = idx + 1; // PCA ID = tömb index + 1
      const val255 = pca.state;
      const isOn = val255 > 0;
      const pct = Math.round(val255 / 2.55);
      const isThermo = pca.sensor > 0;
      
      // Normál PCA kártyák
      const normalCards = document.querySelectorAll(`[data-cardid="pca:${pcaId}"]`);
      normalCards.forEach(card => {
        card.classList.remove('myio-on', 'myio-off');
        card.classList.add(isOn ? 'myio-on' : 'myio-off');
        
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
        
        const rangeInput = card.querySelector('input[type="range"]');
        const numInput = card.querySelector('input[type="number"]');
        
        if (rangeInput && parseInt(rangeInput.value) !== pct) {
          rangeInput.value = pct;
        }
        if (numInput && parseInt(numInput.value) !== pct) {
          numInput.value = pct;
        }
      });
      
      // Thermo PCA kártyák
      const thermoCards = document.querySelectorAll(`[data-cardid="thermo:pca:${pcaId}"]`);
      thermoCards.forEach(card => {
        // On/Off állapot frissítése
        card.classList.remove('myio-on', 'myio-off', 'myio-heat', 'myio-cool');
        if (isOn) {
          card.classList.add('myio-on');
          // Heat/cool meghatározása
          if (pca.sensorON < pca.sensorOFF) {
            card.classList.add('myio-heat');
          } else if (pca.sensorOFF < pca.sensorON) {
            card.classList.add('myio-cool');
          }
        } else {
          card.classList.add('myio-off');
        }
        
        // Toggle frissítése
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
        
        // Thermo circular UI frissítése
        updateThermoCircularUI(card, pca, isOn);
      });
      
      if (normalCards.length > 0) {
        log(`PCA ${pcaId}: ${pct}% (${normalCards.length} cards updated)`);
      }
    }
  }

  /**
   * Thermo circular UI frissítése (közös a relay és PCA thermo kártyákhoz)
   */
  function updateThermoCircularUI(card, deviceData, isActive) {
    const thermoContainer = card.querySelector('.myio-thermo-circular');
    if (!thermoContainer) return;
    
    // On/Off értékek frissítése
    const onVal = (deviceData.sensorON || 0) / 10;
    const offVal = (deviceData.sensorOFF || 0) / 10;
    const isHeating = onVal < offVal;
    
    // Szenzor érték lekérése
    let sensorValue = 0;
    const sensorId = deviceData.sensor || 0;
    if (sensorId > 0 && sensorId < 100) {
      // Hőmérséklet szenzor
      if (typeof thermo_temps !== 'undefined' && typeof thermo_eepromIndex !== 'undefined') {
        for (let i = 0; i < thermo_eepromIndex.length; i++) {
          if (thermo_eepromIndex[i] === sensorId) {
            sensorValue = thermo_temps[i] / 100;
            break;
          }
        }
      }
    } else if (sensorId >= 101 && sensorId <= 108) {
      // Páratartalom szenzor
      const humIdx = sensorId - 101;
      if (typeof humidity !== 'undefined' && humidity[humIdx] !== undefined) {
        sensorValue = humidity[humIdx] / 10;
      }
    }
    
    // Szenzor kijelző frissítése
    const sensorDisplay = thermoContainer.querySelector('.myio-thermo-sensor');
    if (sensorDisplay) {
      const unitText = (sensorId >= 101 && sensorId <= 108) ? '%' : '°C';
      const icon = isActive ? (isHeating ? '🔥' : '❄️') : '🌡️';
      sensorDisplay.innerHTML = `<span class="icon">${icon}</span> ${sensorValue.toFixed(1)} ${unitText}`;
    }
    
    // Mode kijelző frissítése
    const modeDisplay = thermoContainer.querySelector('.myio-thermo-mode');
    if (modeDisplay) {
      const modeText = isActive 
        ? (isHeating ? (typeof str_Heating !== 'undefined' ? str_Heating : 'Heating') : (typeof str_Cooling !== 'undefined' ? str_Cooling : 'Cooling'))
        : (typeof str_Off !== 'undefined' ? str_Off : 'Off');
      const modeColor = isActive ? (isHeating ? '#FF6B35' : '#35B8FF') : '#888';
      modeDisplay.textContent = modeText;
      modeDisplay.style.color = modeColor;
      modeDisplay.classList.toggle('active', isActive);
    }
    
    // Átlag hőmérséklet és hiszterézis frissítése
    const avgDisplay = thermoContainer.querySelector('.myio-thermo-avgtemp');
    const hystDisplay = thermoContainer.querySelector('.myio-thermo-hyst');
    if (avgDisplay) {
      const avgTemp = (onVal + offVal) / 2;
      avgDisplay.innerHTML = `${Math.floor(avgTemp)}<span class="decimal">,${Math.round((avgTemp - Math.floor(avgTemp)) * 10)}</span><span class="unit">°</span>`;
    }
    if (hystDisplay) {
      const hysteresis = Math.abs(offVal - onVal) / 2;
      const unitText = (sensorId >= 101 && sensorId <= 108) ? '%' : '°C';
      hystDisplay.textContent = `±${hysteresis.toFixed(1)} ${unitText}`;
    }
    
    // SVG arc-ok frissítése (handle-ök nélkül, mivel azok drag közben mozognak)
    const svg = thermoContainer.querySelector('.myio-thermo-svg');
    if (svg) {
      const activeArc = svg.querySelector('path:nth-of-type(2)');
      const currentArc = svg.querySelector('path:nth-of-type(3)');
      
      if (activeArc && currentArc) {
        const colorLight = isHeating ? 'rgba(255, 107, 53, 0.3)' : 'rgba(53, 184, 255, 0.3)';
        const color = isHeating ? '#FF6B35' : '#35B8FF';
        activeArc.setAttribute('stroke', colorLight);
        currentArc.setAttribute('stroke', color);
      }
      
      // Handle-ök színének frissítése
      const handles = svg.querySelectorAll('.myio-thermo-handle');
      if (handles.length >= 1) {
        const color = isHeating ? '#FF6B35' : '#35B8FF';
        handles[0].setAttribute('fill', color);
      }
    }
    
    log(`Thermo card updated: sensor=${sensorValue.toFixed(1)}, on=${onVal}, off=${offVal}, active=${isActive}`);
  }

  /**
   * PWM/FET kimenetek UI frissítése
   * JAVÍTÁS: querySelectorAll használata
   */
  function updatePWM(pwmData) {
    for (const key in pwmData) {
      const idx = parseInt(key);
      const pwm = pwmData[key];
      const fetId = idx + 1;
      const val255 = pwm.state;
      const isOn = val255 > 0;
      const pct = Math.round(val255 / 2.55);
      
      // JAVÍTÁS: querySelectorAll minden olyan kártyát megtalál
      const cards = document.querySelectorAll(`[data-cardid="fet:${fetId}"]`);
      
      cards.forEach(card => {
        // Osztály frissítése
        card.classList.remove('myio-on', 'myio-off');
        card.classList.add(isOn ? 'myio-on' : 'myio-off');
        
        // Toggle frissítése
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
        
        // Slider és number input frissítése
        const rangeInput = card.querySelector('input[type="range"]');
        const numInput = card.querySelector('input[type="number"]');
        
        if (rangeInput && parseInt(rangeInput.value) !== pct) {
          rangeInput.value = pct;
        }
        if (numInput && parseInt(numInput.value) !== pct) {
          numInput.value = pct;
        }
      });
      
      if (cards.length > 0) {
        log(`FET ${fetId}: ${pct}% (${cards.length} cards updated)`);
      }
    }
  }

  /**
   * Szenzorok UI frissítése
   * JAVÍTÁS: querySelectorAll használata
   */
  function updateSensors(sensorsData) {
    // Humidity szenzorok (101-108)
    for (let i = 101; i <= 108; i++) {
      if (sensorsData[String(i)]) {
        const humIdx = i - 101;
        const humVal = sensorsData[String(i)].hum;
        if (humVal !== undefined) {
          // JAVÍTÁS: querySelectorAll
          const cards = document.querySelectorAll(`[data-cardid="sensors:hum:${humIdx}"]`);
          cards.forEach(card => {
            const valueEl = card.querySelector('.myio-value');
            if (valueEl) {
              valueEl.textContent = (humVal / 10) + ' %';
            }
          });
        }
      }
    }
    
    // Fogyasztás (200)
    if (sensorsData['200']) {
      const cards = document.querySelectorAll('[data-cardid="sensors:consumption"]');
      cards.forEach(card => {
        const valueEl = card.querySelector('.myio-value');
        if (valueEl) {
          const val = sensorsData['200'].imp || 0;
          const unit = typeof consumptionUnit !== 'undefined' ? consumptionUnit : 'kW';
          valueEl.textContent = (val / 1000) + ' ' + unit;
        }
      });
    }
    
    // Fázis fogyasztás (201-203)
    for (let i = 201; i <= 203; i++) {
      if (sensorsData[String(i)]) {
        const phase = i - 200;
        const power = sensorsData[String(i)].P;
        // JAVÍTÁS: querySelectorAll
        const cards = document.querySelectorAll(`[data-cardid="sensors:power:${phase}"]`);
        cards.forEach(card => {
          const valueEl = card.querySelector('.myio-value');
          if (valueEl) {
            valueEl.textContent = power + ' W';
          }
        });
      }
    }
    
    // Feszültség (204-206)
    for (let i = 204; i <= 206; i++) {
      if (sensorsData[String(i)]) {
        const phase = i - 203;
        const voltage = sensorsData[String(i)].U;
        // JAVÍTÁS: querySelectorAll
        const cards = document.querySelectorAll(`[data-cardid="sensors:voltage:${phase}"]`);
        cards.forEach(card => {
          const valueEl = card.querySelector('.myio-value');
          if (valueEl) {
            valueEl.textContent = voltage + ' V';
          }
        });
      }
    }
  }

  // ========== INTEGRATION HELPERS ==========

  /**
   * Átalakítja a régi changed() hívást AJAX-ra
   * @param {HTMLElement} obj - Az input elem
   * @param {string} name - A parancs neve
   * @param {number} multiplier - Szorzó
   * @returns {boolean} true ha sikeresen kezeltük
   */
  function handleChanged(obj, name = obj.name, multiplier = 1) {
    let value = multiplier === 1 ? obj.value : Math.round(obj.value * multiplier);
    
    // PCA/FET százalék -> 0-255 konverzió
    if (name.startsWith('fet*') || name.startsWith('fetM') || 
        name.startsWith('PCA*') || name.startsWith('PCAMIN') || 
        name.startsWith('PCAMAX')) {
      value = Math.round(value * 255 / 100);
    }
    
    const cmd = `${name}=${value}`;
    sendCommand(cmd, true);
    return true;
  }

  /**
   * Relay ON/OFF parancs küldése
   * @param {string} action - 'r_ON' vagy 'r_OFF'
   * @param {number} id - Relay ID
   */
  function relayCommand(action, id) {
    sendCommand(`${action}=${id}`, true);
  }

  /**
   * PCA ON/OFF parancs küldése
   * @param {string} action - 'PCA_ON' vagy 'PCA_OFF'
   * @param {number} id - PCA ID
   */
  function pcaCommand(action, id) {
    sendCommand(`${action}=${id}`, true);
  }

  /**
   * FET ON/OFF parancs küldése
   * @param {string} action - 'fet_ON' vagy 'fet_OFF'
   * @param {number} id - FET ID
   */
  function fetCommand(action, id) {
    sendCommand(`${action}=${id}`, true);
  }

  // ========== AUTO REFRESH INTEGRATION ==========

  let autoRefreshTimer = null;

  /**
   * Elindítja az automatikus AJAX frissítést
   * @param {number} intervalSec - Frissítési időköz másodpercben
   */
  function startAutoRefresh(intervalSec) {
    stopAutoRefresh();
    const ms = Math.max(5, intervalSec) * 1000;
    
    autoRefreshTimer = setInterval(async () => {
      try {
        const data = await fetchSensOut();
        if (data) {
          updateUI(data);
        }
      } catch (e) {
        console.warn('[MyIOLive] Auto refresh failed:', e);
      }
    }, ms);
    
    log(`Auto refresh started: ${intervalSec}s`);
  }

  /**
   * Leállítja az automatikus frissítést
   */
  function stopAutoRefresh() {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer);
      autoRefreshTimer = null;
      log('Auto refresh stopped');
    }
  }

  /**
   * Ellenőrzi, hogy fut-e az auto refresh
   */
  function isAutoRefreshRunning() {
    return autoRefreshTimer !== null;
  }

  // ========== PUBLIC API ==========

  return {
    // Core functions
    fetchSensOut,
    updateUI,
    sendCommand,
    
    // Command helpers
    handleChanged,
    relayCommand,
    pcaCommand,
    fetCommand,
    
    // Auto refresh
    startAutoRefresh,
    stopAutoRefresh,
    isAutoRefreshRunning,
    
    // State access
    getLastData: () => lastData,
    
    // Config
    setDebug: (val) => { CONFIG.debug = !!val; },
    getConfig: () => ({ ...CONFIG })
  };

})();

// Global alias for compatibility
window.MyIOLive = MyIOLive;
