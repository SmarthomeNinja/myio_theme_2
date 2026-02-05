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
    
    // Thermo szenzorok - ezek a sens_out.json-ban nincsenek, de ha lennének
    // Fogyasztás adatok
    if (data.sensors) {
      if (data.sensors['200'] && typeof consumption !== 'undefined') {
        window.consumption = data.sensors['200'].imp || 0;
      }
    }
  }

  /**
   * Relay kártyák UI frissítése
   * JAVÍTÁS: querySelectorAll használata, hogy mindegyik kártya frissüljön
   */
  function updateRelays(relaysData) {
    var isThermoCard = false;
    for (const key in relaysData) {
      const idx = parseInt(key);
      const relay = relaysData[key];
      const relayId = idx + 1; // relay ID = tömb index + 1
      const isOn = relay.state === 1;
      const isThermo = relay.sensor > 0; // Ha van szenzor, akkor thermo kártya
      const cardType = isThermo ? 'thermo' : 'relay';
      isThermoCard = isThermo ? true : isThermoCard;
      
      // JAVÍTÁS: querySelectorAll minden olyan kártyát megtalál
      // amelyik ezzel a data-cardid értékkel rendelkezik (favorit + eredeti hely)
      const cards = document.querySelectorAll(`[data-cardid="relay:${relayId}"]`);
      const thermoCards = document.querySelectorAll(`[data-cardid="thermo:relay:${relayId}"]`);

      cards.forEach(card => {
        // Osztály frissítése
        card.classList.remove('myio-on', 'myio-off');
        card.classList.add(isOn ? 'myio-on' : 'myio-off');
        
        // Toggle input frissítése
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
      });
      thermoCards.forEach(card => {
        // Osztály frissítése
        card.classList.remove('myio-on', 'myio-off');
        card.classList.add(isOn ? 'myio-on' : 'myio-off');
        
        // Toggle input frissítése
        const toggle = card.querySelector('.myio-miniToggle input[type="checkbox"]');
        if (toggle && toggle.checked !== isOn) {
          toggle.checked = isOn;
        }
      });
      
      if (cards.length > 0) {
        log(`Relay ${relayId}: ${isOn ? 'ON' : 'OFF'} (${cards.length} cards updated)`);
      }
    }
    if(isThermoCard) {
      console.log('Thermo card detected in relays, ensure thermo-specific UI elements are updated');
      console.log(PCA_min_temp_ON[9]);
      if (typeof window.renderThermo === 'function') {
        requestAnimationFrame(() => {
          try {
            window.renderThermo();
          } catch (e) {
            console.warn('[MyIOLive] renderThermo error:', e);
          }
        });
      } else {
        log('renderThermo() not available');
      }
    }
  }
  
  /**
   * PCA kimenetek UI frissítése
   * JAVÍTÁS: querySelectorAll használata
   */
  function updatePCA(pcaData) {
    for (const key in pcaData) {
      const idx = parseInt(key);
      const pca = pcaData[key];
      const pcaId = idx + 1; // PCA ID = tömb index + 1
      const val255 = pca.state;
      const isOn = val255 > 0;
      const pct = Math.round(val255 / 2.55);
      
      // Normál PCA kártyák
      let cards = document.querySelectorAll(`[data-cardid="pca:${pcaId}"]`);
      
      // Ha nincs normál, keress thermo PCA kártyákat
      if (cards.length === 0) {
        cards = document.querySelectorAll(`[data-cardid="thermo:pca:${pcaId}"]`);
      }
      
      cards.forEach(card => {
        // Osztály frissítése
        card.classList.remove('myio-on', 'myio-off', 'myio-heat', 'myio-cool');
        if (isOn) {
          card.classList.add('myio-on');
          // Heat/cool meghatározása a szenzor küszöbök alapján
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
        
        // Slider és number input frissítése
        const rangeInput = card.querySelector('input[type="range"]');
        const numInput = card.querySelector('input[type="number"]');
        
        if (rangeInput && parseInt(rangeInput.value) !== pct) {
          rangeInput.value = pct;
        }
        if (numInput && parseInt(numInput.value) !== pct) {
          numInput.value = pct;
        }
        
        // Thermo chip-ek frissítése (On/Off értékek)
        if (pca.sensor > 0) {
          const onInput = card.querySelector('input[name^="PCA_min_temp_ON"]');
          const offInput = card.querySelector('input[name^="PCA_max_temp_OFF"]');
          if (onInput) {
            const onVal = (pca.sensorON / 10).toFixed(1);
            if (onInput.value !== onVal) onInput.value = onVal;
          }
          if (offInput) {
            const offVal = (pca.sensorOFF / 10).toFixed(1);
            if (offInput.value !== offVal) offInput.value = offVal;
          }
        }
      });
      
      if (cards.length > 0) {
        log(`PCA ${pcaId}: ${pct}% (${cards.length} cards updated)`);
      }
    }
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
