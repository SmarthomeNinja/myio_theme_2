// ===== NINJA AI CHAT MODULE =====
// Anthropic Claude chatbot integráció MyIO smart home rendszerhez

(function() {
  'use strict';

  // Konfiguráció
  const NINJA_CONFIG = {
    // modelName: 'claude-sonnet-4-5-20250929',
    modelName: 'claude-haiku-4-5-20251001',
    maxTokens: 4096,
    systemPrompt: `Te a Ninja vagy, egy okos otthon asszisztens a MyIO smart home rendszerben.

FONTOS: Képes vagy kezelni az okos otthon eszközöket parancsok futtatásával!

ELÉRHETŐ PARANCSOK:

1. Relék kapcsolgatása:
   - "relay_on(id)" - relé bekapcsolása
   - "relay_off(id)" - relé kikapcsolása

2. PCA kimenetek (servo, fűtés, stb.):
   - "pca_on(id)" - PCA kimenet bekapcsolása (minden PCA eszközön elérhető)
   - "pca_off(id)" - PCA kimenet kikapcsolása (minden PCA eszközön elérhető)
   - "pca_set(id, value)" - PCA érték beállítása 0-100 között (CSAK "PWM" képes eszközökön!)
   Például: "pca_set(5, 75)" - 5-ös PCA eszköz 75%-ra

3. PWM/FET kimenetek (LED dimmer, motor, stb.):
   - "pwm_on(id)" - PWM kimenet bekapcsolása
   - "pwm_off(id)" - PWM kimenet kikapcsolása
   - "pwm_set(id, value)" - PWM érték beállítása 0-100 között
   Például: "pwm_set(10, 50)" - 10-es PWM eszköz 50%-ra

4. Termosztát beállítások (CSAK thermoActivator-ral rendelkező kimeneteken!):
   A kontextusban "thermostats" listában megtalálod az összes termosztátos kimenetet.
   Minden termosztátnak van: type (relay/pca), id, onValue (bekapcsolási hőfok), offValue (kikapcsolási hőfok), hysteresis, mode (futes/hutes), target (célhőmérséklet).

   - "thermo_target(type, id, target)" - Célhőmérséklet beállítása, a jelenlegi hiszterézis MEGTARTÁSÁVAL
     A rendszer automatikusan kiszámolja az ON és OFF értékeket a meglévő hiszterézisből.
     Például: "thermo_target(pca, 1, 25.0)" - PCA 1 célhőmérséklet 25.0°C

   - "thermo_on(type, id, value)" - CSAK a bekapcsolási (ON) hőfok módosítása
     Például: "thermo_on(relay, 3, 24.0)" - Relay 3 ON érték 24.0°C-ra

   - "thermo_off(type, id, value)" - CSAK a kikapcsolási (OFF) hőfok módosítása
     Például: "thermo_off(pca, 2, 26.0)" - PCA 2 OFF érték 26.0°C-ra

   TERMOSZTÁT LOGIKA:
   - Fűtés mód (mode=futes): ON < OFF. A fűtés bekapcsol ha a hőmérséklet az ON alá csökken, kikapcsol ha az OFF fölé emelkedik.
   - Hűtés mód (mode=hutes): ON > OFF. A hűtés bekapcsol ha a hőmérséklet az ON fölé emelkedik, kikapcsol ha az OFF alá csökken.

   PÉLDÁK:
   - "Legyen a nappali hőmérséklete 25 fok" → Keresd meg a nappali zónában lévő termosztáto(ka)t, használd thermo_target()-et
   - "Ne legyen melegebb 26 foknál" → Fűtés módban ez az OFF érték, használd thermo_off()-ot
   - "Ne legyen hidegebb 20 foknál" → Fűtés módban ez az ON érték, használd thermo_on()-ot
   - "Állítsd a bekapcsolási hőfokot 23-ra" → thermo_on()
   - "Állítsd a kikapcsolási hőfokot 26-ra" → thermo_off()

PARANCSOK FORMÁTUMA:
Ha a felhasználó eszközöket szeretne beállítani, adj ki parancsokat a válaszodban [COMMAND] tagek között:
[COMMAND]relay_on(1)[/COMMAND]
[COMMAND]pca_on(3)[/COMMAND]
[COMMAND]pca_set(5, 75)[/COMMAND]
[COMMAND]pwm_on(10)[/COMMAND]
[COMMAND]pwm_set(10, 50)[/COMMAND]
[COMMAND]thermo_target(pca, 1, 25.0)[/COMMAND]
[COMMAND]thermo_on(relay, 3, 24.0)[/COMMAND]
[COMMAND]thermo_off(pca, 2, 26.5)[/COMMAND]

NAGYON FONTOS - FORMÁTUM SZABÁLY:
- KIZÁRÓLAG a [COMMAND]...[/COMMAND] formátumot használd!
- TILOS XML formátumot használni! NE írj <function_calls>, <invoke>, <parameter> vagy bármilyen XML taget!
- NE használj tool_use, function_call vagy hasonló formátumot!
- A parancs MINDIG így nézzen ki: [COMMAND]parancs_neve(parameterek)[/COMMAND]

FONTOS SZABÁLYOK:
- A pca_set() parancsot CSAK azoknál a PCA eszközöknél használd, amelyeknél a kontextusban "PWM: true" szerepel!
- Ha egy PCA eszköznek nincs pwm képessége, csak pca_on()/pca_off() parancsokat használj!
- Az értékek 0-100 közöttiek (százalék)!

MÁSNYELVI TÁMOGATÁS:
- "kapcsold be a fűtést" = pca_on() / relay_on()
- "dimeld a LED-et" = pwm_set() / pca_set()
- "kapcsold ki a motort" = pwm_off()
- Értelmezd a felhasználó szándékát és hajtsd végre a megfelelő parancsokat!

ZÓNÁK ÉS MEGJEGYZÉSEK:
A kontextusban az eszközökhöz "zones" (zóna nevek listája) és "note" (megjegyzés) mező tartozhat.

- Ha a felhasználó egy HELYISÉGET vagy ZÓNÁT említ (pl. "nappali", "hálószoba", "konyha", "garázs"), keresd meg azokat az eszközöket, amelyek "zones" mezőjében szerepel az adott zóna neve! Csak azokat az eszközöket kezeld, amelyek a megnevezett zónához tartoznak.
- Ha a felhasználó nem nevez meg zónát, de egy eszköztípust említ (pl. "redőny", "lámpa"), az összes megfelelő típusú eszközre vonatkozik.
- A "note" mező fontos utasításokat, tiltásokat vagy kiegészítő információkat tartalmazhat. MINDIG vedd figyelembe!
  - Ha a megjegyzésben TILTÁS van (pl. "ne kapcsold be", "tilos", "nem szabad", "kézi vezérlés", "ne nyúlj hozzá", "karbantartás alatt"), NE hajtsd végre a parancsot az adott eszközre, és JELEZD a felhasználónak, hogy miért nem!
  - Ha a megjegyzésben kiegészítő info van (pl. "max 80%", "csak este", "óvatosan"), tartsd be!
- A kontextusban van egy "zones" lista is, ami az összes elérhető zóna nevét tartalmazza.

PROTOKOLL:
1. Válaszd meg a felhasználót baráti, segítőkész hangnemben
2. Ha parancs szükséges, add ki azt [COMMAND] tagek között
3. Mutasd meg, hogy mi történik (pl. "LED-et 50%-ra dimmelek")
4. Kerüld a többszörös parancsokat - egyszerre max 3 parancs
5. Ha PCA_set-et akarsz használni, ellenőrizd a PWM flag-et!
6. Ha egy zónát kérnek, sorold fel milyen eszközöket találtál a zónában!
7. Ha megjegyzésben tiltás van, MINDIG jelezd és NE hajtsd végre a parancsot!

Kedves, barátságos és segítőkész vagy. Magyar nyelven kommunikálsz.`
  };

  // Conversation history
  let conversationHistory = [];
  let isNinjaOpen = false;

  // API kulcs beolvasása (environment változó vagy localStorage)
  async function getAPIKey() {
    // 1. Először localStorage
    const stored = localStorage.getItem('ANTHROPIC_API_KEY');
    if (stored) return stored;
    
    // 2. Globális változó (ha a szerver betöltötte)
    if (typeof ANTHROPIC_API_KEY !== 'undefined' && ANTHROPIC_API_KEY) {
      return ANTHROPIC_API_KEY;
    }
    
    // 3. Próbáljuk betölteni a /.env fájlból
    try {
      const response = await fetch(host+'.env');
      if (response.ok) {
        const text = await response.text();
        const match = text.match(/ANTHROPIC_API_KEY\s*=\s*(.+)/);
        if (match && match[1]) {
          const key = match[1].trim().replace(/['"]/g, '');
          if (key && key.startsWith('sk-ant-')) {
            // Cache it in localStorage
            localStorage.setItem('ANTHROPIC_API_KEY', key);
            return key;
          }
        }
      }
    } catch (err) {
      console.log('Could not load .env file:', err);
    }
    
    return null;
  }

  // Ninja emoji icon
  const NINJA_ICON = '🥷';

  // Ninja modal HTML létrehozása
  function createNinjaModal() {
    const modal = document.createElement('div');
    modal.id = 'ninja-modal';
    modal.className = 'ninja-modal';
    modal.innerHTML = `
      <div class="ninja-modal-content">
        <div class="ninja-header">
          <div class="ninja-title">
            <span style="font-size: 24px;">${NINJA_ICON}</span>
            <span>Ninja AI Asszisztens</span>
          </div>
          <button class="ninja-close" aria-label="Bezárás">&times;</button>
        </div>
        
        <div class="ninja-messages" id="ninja-messages">
          <!-- Welcome message -->
          <div class="ninja-message ninja-assistant">
            <div class="ninja-avatar">${NINJA_ICON}</div>
            <div class="ninja-bubble">
              <p>👋 Szia! Ninja vagyok, az okos otthon asszisztensed!</p>
              <p>Miben segíthetek?</p>
            </div>
          </div>
        </div>
        
        <div class="ninja-suggested-prompts" id="ninja-suggestions">
          <button class="ninja-suggestion">🏠 Milyen eszközeim vannak?</button>
          <button class="ninja-suggestion">💡 Kapcsold be a hálószoba lámpát</button>
          <button class="ninja-suggestion">🌈 Állítsd a nappali LED-et 150-re</button>
          <button class="ninja-suggestion">🌡️ Mi a jelenlegi hőmérséklet?</button>
        </div>
        
        <div class="ninja-input-area">
          <textarea 
            id="ninja-input" 
            class="ninja-input" 
            placeholder="Írj egy üzenetet Ninjának..."
            rows="1"
          ></textarea>
          <button id="ninja-send" class="ninja-send" aria-label="Küldés">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        
        <div class="ninja-api-setup" id="ninja-api-setup" style="display: none;">
          <div class="ninja-api-notice">
            <p>⚠️ Anthropic API kulcs szükséges a használathoz</p>
            <input 
              type="password" 
              id="ninja-api-key-input" 
              placeholder="sk-ant-api..."
              class="ninja-api-input"
            />
            <button id="ninja-save-key" class="ninja-btn-primary">Mentés</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.ninja-close').onclick = closeNinja;
    modal.onclick = (e) => {
      if (e.target === modal) closeNinja();
    };
    
    // Send button
    document.getElementById('ninja-send').onclick = sendMessage;
    
    // Input textarea - Enter to send, Shift+Enter for new line
    const input = document.getElementById('ninja-input');
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
    
    // Suggested prompts
    document.querySelectorAll('.ninja-suggestion').forEach(btn => {
      btn.onclick = function() {
        input.value = this.textContent.trim();
        sendMessage();
      };
    });
    
    // API key setup
    const saveKeyBtn = document.getElementById('ninja-save-key');
    if (saveKeyBtn) {
      saveKeyBtn.onclick = saveAPIKey;
    }
    
    // Check for API key
    checkAPIKey();
  }

  // Check if API key exists
  async function checkAPIKey() {
    const key = await getAPIKey();
    const setupDiv = document.getElementById('ninja-api-setup');
    const inputArea = document.querySelector('.ninja-input-area');
    
    if (!key) {
      setupDiv.style.display = 'block';
      inputArea.style.opacity = '0.5';
      inputArea.style.pointerEvents = 'none';
    } else {
      setupDiv.style.display = 'none';
      inputArea.style.opacity = '1';
      inputArea.style.pointerEvents = 'auto';
    }
  }

  // Save API key
  function saveAPIKey() {
    const input = document.getElementById('ninja-api-key-input');
    const key = input.value.trim();
    
    if (key && key.startsWith('sk-ant-')) {
      localStorage.setItem('ANTHROPIC_API_KEY', key);
      input.value = '';
      checkAPIKey();
      showToast('✅ API kulcs mentve!');
    } else {
      showToast('❌ Érvénytelen API kulcs formátum');
    }
  }

  // Toast notification
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ninja-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Add message to chat
  function addMessage(text, isUser = false) {
    const messagesDiv = document.getElementById('ninja-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ninja-message ${isUser ? 'ninja-user' : 'ninja-assistant'}`;
    
    if (isUser) {
      messageDiv.innerHTML = `
        <div class="ninja-bubble">${escapeHtml(text)}</div>
        <div class="ninja-avatar">👤</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="ninja-avatar">${NINJA_ICON}</div>
        <div class="ninja-bubble">${escapeHtml(text)}</div>
      `;
    }
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageDiv;
  }

  // Add loading indicator
  function addLoadingIndicator() {
    const messagesDiv = document.getElementById('ninja-messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'ninja-message ninja-assistant ninja-loading';
    loadingDiv.id = 'ninja-loading';
    loadingDiv.innerHTML = `
      <div class="ninja-avatar">${NINJA_ICON}</div>
      <div class="ninja-bubble">
        <div class="ninja-typing">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    messagesDiv.appendChild(loadingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  // Remove loading indicator
  function removeLoadingIndicator() {
    const loading = document.getElementById('ninja-loading');
    if (loading) loading.remove();
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // Zóna- és megjegyzés adatok kiolvasása egy cardId-hoz
  function getCardMeta(cardId) {
    const meta = {};
    if (!window.myioStorage) return meta;

    // Egyéni név
    const customName = window.myioStorage.loadCardName(cardId);
    if (customName) meta.customName = customName;

    // Zónák (nevek)
    const zoneIds = window.myioStorage.getCardZones(cardId);
    if (zoneIds && zoneIds.length > 0) {
      const allZones = window.myioStorage.loadZones();
      meta.zones = zoneIds.map(zId => {
        const z = allZones.find(x => x.id === zId);
        return z ? z.name : null;
      }).filter(Boolean);
    }

    // Megjegyzés
    const note = window.myioStorage.loadCardNote(cardId);
    if (note) meta.note = note;

    return meta;
  }

  // RW ertek dekodolasa (ha myioUtils elerheto, hasznaljuk, kulonben fallback)
  function decodeRWValue(rawVal) {
    if (window.myioUtils && window.myioUtils.decodeRW) {
      return window.myioUtils.decodeRW(rawVal);
    }
    // Fallback dekodolas: RW ertek = read*10000 + write*1000 + val (0-255)
    const val = rawVal % 1000;
    const write = Math.floor(rawVal / 1000) % 10;
    const read = Math.floor(rawVal / 10000) % 10;
    return { read, write, val };
  }

  // Szenzor nev es ertek kiolvasasa thermoActivator ertekbol
  // activator < 100: homerseklet szenzor, >= 101: paratartalom szenzor
  function getThermoSensorInfo(activator) {
    if (activator < 100) {
      let value = 0;
      if (typeof thermo_eepromIndex !== 'undefined' && typeof thermo_temps !== 'undefined') {
        for (let j = 0; j < thermo_eepromIndex.length; j++) {
          if (activator == thermo_eepromIndex[j]) value = thermo_temps[j] / 100;
        }
      }
      let name = '-';
      if (typeof thermo_description !== 'undefined' && thermo_description && thermo_description[activator] != null) {
        name = thermo_description[activator];
      }
      return { name, value, unit: '°C', isTemp: true };
    } else {
      const hi = activator - 101;
      const value = (typeof humidity !== 'undefined' && humidity && humidity[hi] != null) ? (humidity[hi] / 10) : 0;
      let name = '-';
      if (typeof hum_description !== 'undefined' && hum_description && hum_description[hi] != null) {
        name = hum_description[hi];
      }
      return { name, value, unit: '%', isTemp: false };
    }
  }

  // Get device context for AI
  // FONTOS: A description tombok 1-bazisuak, az ertek tombok 0-bazisuak!
  // PCA_description[d] <-> PCA[d-1], cardId = pca:${d}, server parancs = d
  function getDeviceContext() {
    const context = {
      relays: [],
      sensors: [],
      pca: [],
      pwm: [],
      thermostats: [],
      zones: []
    };

    // Elerheto zonak listaja
    if (window.myioStorage) {
      const allZones = window.myioStorage.loadZones();
      if (allZones.length > 0) {
        context.zones = allZones.map(z => z.name);
      }
    }

    // Relays - relay_description[d] <-> relays[d-1], cardId relay:${d}
    if (typeof relay_description !== 'undefined' && typeof relays !== 'undefined') {
      for (let d = 1; d < relay_description.length; d++) {
        if (!relay_description[d]) continue;
        const rawVal = relays[d - 1];
        if (rawVal === 0 || rawVal === undefined) continue;
        const cardId = `relay:${d}`;
        const meta = getCardMeta(cardId);
        const isOn = (rawVal === 11 || rawVal === 101 || rawVal === 111);
        const entry = {
          id: d,
          name: meta.customName || relay_description[d],
          state: isOn ? 'be' : 'ki'
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.relays.push(entry);
      }
    }

    // PCA kimenetek - PCA_description[d] <-> PCA[d-1], cardId pca:${d}
    if (typeof PCA_description !== 'undefined' && typeof PCA !== 'undefined') {
      const hasPWM = typeof PCA_PWM !== 'undefined';
      const hasThermoAct = typeof PCA_thermoActivator !== 'undefined';
      for (let d = 1; d < PCA_description.length; d++) {
        if (!PCA_description[d]) continue;
        const rawVal = PCA[d - 1];
        if (rawVal === undefined) continue;
        // Thermo-aktivalt PCA-kat kihagyjuk (kiveve sunrise=255)
        if (hasThermoAct && PCA_thermoActivator[d - 1] !== 0 && PCA_thermoActivator[d - 1] !== 255) continue;
        const decoded = decodeRWValue(rawVal);
        if (!decoded.read && !decoded.write) continue;
        const cardId = `pca:${d}`;
        const meta = getCardMeta(cardId);
        const isOn = decoded.val > 0 && decoded.read === 1;
        const entry = {
          id: d,
          name: meta.customName || PCA_description[d],
          state: isOn ? 'be' : 'ki',
          value: Math.round(decoded.val / 2.55),
          PWM: hasPWM && PCA_PWM[d - 1] == 1
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.pca.push(entry);
      }
    }

    // PWM/FET kimenetek - fet_description[d] <-> fet[d-1], cardId fet:${d}
    if (typeof fet_description !== 'undefined' && typeof fet !== 'undefined') {
      for (let d = 1; d < fet_description.length; d++) {
        if (!fet_description[d]) continue;
        const rawVal = fet[d - 1];
        if (rawVal === undefined) continue;
        const decoded = decodeRWValue(rawVal);
        if (!decoded.read && !decoded.write) continue;
        const cardId = `fet:${d}`;
        const meta = getCardMeta(cardId);
        const isOn = decoded.val > 0 && decoded.read === 1;
        const entry = {
          id: d,
          name: meta.customName || fet_description[d],
          state: isOn ? 'be' : 'ki',
          value: Math.round(decoded.val / 2.55)
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.pwm.push(entry);
      }
    }

    // Sensors - homerseklet (thermo_eepromIndex alapu indexeles)
    if (typeof thermo_eepromIndex !== 'undefined' && typeof thermo_temps !== 'undefined' && typeof thermo_description !== 'undefined') {
      for (let i = 0; i < thermo_eepromIndex.length; i++) {
        const idx = thermo_eepromIndex[i];
        if (idx === 0 || !thermo_description[idx]) continue;
        const cardId = `sensors:thermo:${idx}`;
        const meta = getCardMeta(cardId);
        const entry = {
          name: meta.customName || thermo_description[idx],
          type: 'homerseklet',
          value: (thermo_temps[i] / 100) + ' °C'
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.sensors.push(entry);
      }
    }

    // Sensors - paratartalom (0-bazisu)
    if (typeof hum_description !== 'undefined' && typeof humidity !== 'undefined') {
      for (let i = 0; i < humidity.length; i++) {
        if (humidity[i] === 0 || !hum_description[i]) continue;
        const cardId = `sensors:hum:${i}`;
        const meta = getCardMeta(cardId);
        const entry = {
          name: meta.customName || hum_description[i],
          type: 'paratartalom',
          value: (humidity[i] / 10) + ' %'
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.sensors.push(entry);
      }
    }

    // Termosztatok - PCA kimenetek thermo aktivatorral
    if (typeof PCA !== 'undefined' && typeof PCA_thermoActivator !== 'undefined') {
      console.log('Processing PCA thermo activators for thermostats...');
      for (let i = 0; i < PCA_thermoActivator.length; i++) {
        if (PCA_thermoActivator[i] === 0 || PCA_thermoActivator[i] === 255) continue;
        const d = i + 1; // 1-bazisu ID
        if (!PCA_description || !PCA_description[d]) continue;

        const cardId = `thermo:pca:${d}`;
        const meta = getCardMeta(cardId);
        const sensor = getThermoSensorInfo(PCA_thermoActivator[i]);
        const onVal = (typeof PCA_min_temp_ON !== 'undefined' ? (PCA_min_temp_ON[i] / 10) : 0);
        const offVal = (typeof PCA_max_temp_OFF !== 'undefined' ? (PCA_max_temp_OFF[i] / 10) : 0);
        const isHeating = onVal < offVal;
        const hysteresis = Math.round(Math.abs(offVal - onVal) / 2 * 10) / 10;
        const target = Math.round((onVal + offVal) / 2 * 10) / 10;

        const rawVal = PCA[i];
        const decoded = decodeRWValue(rawVal);
        const isActive = decoded.val > 0 && decoded.read === 1;

        const entry = {
          type: 'pca',
          id: d,
          name: meta.customName || PCA_description[d],
          sensor: sensor.name,
          sensorValue: sensor.value + ' ' + sensor.unit,
          onValue: onVal,
          offValue: offVal,
          target: target,
          hysteresis: hysteresis,
          mode: isHeating ? 'futes' : 'hutes',
          isActive: isActive
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        console.log('Adding thermostat entry from PCA:', entry);
        context.thermostats.push(entry);
      }
    }

    // Termosztatok - Relay kimenetek thermo aktivatorral
    if (typeof relays !== 'undefined' && typeof thermoActivator !== 'undefined') {
      for (let i = 0; i < thermoActivator.length; i++) {
        if (thermoActivator[i] === 0 || thermoActivator[i] === 255) continue;
        const d = i + 1;
        if (!relay_description || !relay_description[d]) continue;

        const cardId = `thermo:relay:${d}`;
        const meta = getCardMeta(cardId);
        const sensor = getThermoSensorInfo(thermoActivator[i]);
        const onVal = (typeof min_temp_ON !== 'undefined' ? (min_temp_ON[i] / 10) : 0);
        const offVal = (typeof max_temp_OFF !== 'undefined' ? (max_temp_OFF[i] / 10) : 0);
        const isHeating = onVal < offVal;
        const hysteresis = Math.round(Math.abs(offVal - onVal) / 2 * 10) / 10;
        const target = Math.round((onVal + offVal) / 2 * 10) / 10;

        const isOn = (relays[i] == 101 || relays[i] == 111 || relays[i] == 11);

        const entry = {
          type: 'relay',
          id: d,
          name: meta.customName || relay_description[d],
          sensor: sensor.name,
          sensorValue: sensor.value + ' ' + sensor.unit,
          onValue: onVal,
          offValue: offVal,
          target: target,
          hysteresis: hysteresis,
          mode: isHeating ? 'futes' : 'hutes',
          isActive: isOn
        };
        if (meta.zones && meta.zones.length) entry.zones = meta.zones;
        if (meta.note) entry.note = meta.note;
        context.thermostats.push(entry);
      }
    }

    return context;
  }

  // Execute relay command
  // relayId: 1-bazisu (megegyezik a szerver altal vart ertekkel)
  function executeRelayCommand(command, relayId) {
    try {
      const id = parseInt(relayId);
      if (isNaN(id) || id < 1) {
        showToast(`❌ Érvénytelen relé ID: ${id}`);
        return false;
      }

      // Használjuk a MyIOLive.sendCommand-ot ha elérhető
      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        if (command === 'on') {
          MyIOLive.sendCommand(`r_ON=${id}`, true);
          console.log(`✅ Ninja: Relay ${id} ON parancs elküldve`);
          return true;
        } else if (command === 'off') {
          MyIOLive.sendCommand(`r_OFF=${id}`, true);
          console.log(`✅ Ninja: Relay ${id} OFF parancs elküldve`);
          return true;
        }
      } else {
        // Fallback: changed() funkció használata
        console.log('MyIOLive nem elérhető, changed() használata');
        
        if (typeof changed === 'function') {
          const fakeButton = {
            name: command === 'on' ? 'r_ON' : 'r_OFF',
            value: id
          };
          changed(fakeButton, fakeButton.name, 1, true);
          return true;
        } else {
          // Utolsó fallback: közvetlen HTTP kérés
          const action = command === 'on' ? 'r_ON' : 'r_OFF';
          const xhr = new XMLHttpRequest();
          xhr.open('GET', `/data?${action}=${id}`, true);
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log(`✅ Ninja: Relay ${id} ${command} sikeres`);
            }
          };
          xhr.send();
          return true;
        }
      }
    } catch (error) {
      console.error('Relay command error:', error);
      showToast(`❌ Relé parancs hiba: ${error.message}`);
      return false;
    }
    return false;
  }

  // PCA kimenet be/ki kapcsolasa
  // pcaId: 1-bazisu (megegyezik a szerver altal vart ertekkel)
  function executePCAToggleCommand(command, pcaId) {
    pcaId = parseInt(pcaId);
    try {
      if (isNaN(pcaId) || pcaId < 1) {
        showToast(`Ervenytelen PCA ID: ${pcaId}`);
        return false;
      }

      const action = command === 'on' ? 'PCA_ON' : 'PCA_OFF';

      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        MyIOLive.sendCommand(`${action}=${pcaId}`, true);
        console.log(`Ninja: PCA ${pcaId} ${action} parancs elkulve`);
        return true;
      } else if (typeof changed === 'function') {
        const fakeButton = { name: action, value: pcaId };
        changed(fakeButton, fakeButton.name, 1, true);
        return true;
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${host}data?${action}=${pcaId}`, true);
        xhr.send();
        return true;
      }
    } catch (error) {
      console.error('PCA toggle command error:', error);
      showToast(`PCA parancs hiba: ${error.message}`);
      return false;
    }
  }

  // PCA kimenet ertek beallitasa (csak PWM-es eszkozokon)
  // pcaId: 1-bazisu (megegyezik a szerver altal vart ertekkel)
  function executePCASetCommand(pcaId, value) {
    try {
      const id = parseInt(pcaId);
      const valPercent = parseInt(value);

      if (isNaN(id) || id < 1) {
        showToast(`Ervenytelen PCA ID: ${id}`);
        return false;
      }
      if (isNaN(valPercent) || valPercent < 0 || valPercent > 100) {
        showToast(`Ervenytelen PCA ertek: ${valPercent} (0-100 kozott kell lennie)`);
        return false;
      }

      // PWM flag ellenorzese (PCA_PWM 0-bazisu, id 1-bazisu)
      if (typeof PCA_PWM != 'undefined' && PCA_PWM[id - 1] != 1) {
        showToast(`PCA ${id} nem rendelkezik PWM kepesseggel`);
        return false;
      }

      // Szazalekbol 0-255 konverzio
      const val255 = Math.round(valPercent * 2.55);

      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        MyIOLive.sendCommand(`PCA*${id}=${val255}`, true);
        console.log(`Ninja: PCA ${id} = ${val255} (${valPercent}%) parancs elkulve`);
        return true;
      } else if (typeof changed === 'function') {
        const fakeInput = { name: `PCA*${id}`, value: val255 };
        changed(fakeInput, fakeInput.name, 1, true);
        return true;
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${host}data?PCA*${id}=${val255}`, true);
        xhr.onload = function() {
          if (xhr.status === 200 && typeof PCA !== 'undefined') {
            PCA[id - 1] = val255;
          }
        };
        xhr.send();
        return true;
      }
    } catch (error) {
      console.error('PCA set command error:', error);
      showToast(`PCA set parancs hiba: ${error.message}`);
      return false;
    }
  }

  // PWM/FET kimenet be/ki kapcsolasa
  // pwmId: 1-bazisu (megegyezik a szerver altal vart ertekkel)
  function executePWMToggleCommand(command, pwmId) {
    pwmId = parseInt(pwmId);
    try {
      if (isNaN(pwmId) || pwmId < 1) {
        showToast(`Ervenytelen PWM ID: ${pwmId}`);
        return false;
      }

      const action = command === 'on' ? 'f_ON' : 'f_OFF';

      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        MyIOLive.sendCommand(`${action}=${pwmId}`, true);
        console.log(`Ninja: PWM ${pwmId} ${action} parancs elkulve`);
        return true;
      } else if (typeof changed === 'function') {
        const fakeButton = { name: action, value: pwmId };
        changed(fakeButton, fakeButton.name, 1, true);
        return true;
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${host}data?${action}=${pwmId}`, true);
        xhr.send();
        return true;
      }
    } catch (error) {
      console.error('PWM toggle command error:', error);
      showToast(`PWM parancs hiba: ${error.message}`);
      return false;
    }
  }

  // PWM/FET kimenet ertek beallitasa
  // pwmId: 1-bazisu (megegyezik a szerver altal vart ertekkel)
  function executePWMSetCommand(pwmId, value) {
    try {
      const id = parseInt(pwmId);
      const valPercent = parseInt(value);

      if (isNaN(id) || id < 1) {
        showToast(`Ervenytelen PWM ID: ${id}`);
        return false;
      }
      if (isNaN(valPercent) || valPercent < 0 || valPercent > 100) {
        showToast(`Ervenytelen PWM ertek: ${valPercent} (0-100 kozott kell lennie)`);
        return false;
      }

      // Szazalekbol 0-255 konverzio
      const val255 = Math.round(valPercent * 2.55);

      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        MyIOLive.sendCommand(`fet*${id}=${val255}`, true);
        console.log(`Ninja: PWM/FET ${id} = ${val255} (${valPercent}%) parancs elkulve`);
        return true;
      } else if (typeof changed === 'function') {
        const fakeInput = { name: `fet*${id}`, value: val255 };
        changed(fakeInput, fakeInput.name, 1, true);
        return true;
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${host}data?fet*${id}=${val255}`, true);
        xhr.onload = function() {
          if (xhr.status === 200 && typeof fet !== 'undefined') {
            fet[id - 1] = val255;
          }
        };
        xhr.send();
        return true;
      }
    } catch (error) {
      console.error('PWM set command error:', error);
      showToast(`PWM set parancs hiba: ${error.message}`);
      return false;
    }
  }

  // Termosztat parancs segédfüggvény - elküldi az ON és/vagy OFF értékeket a szervernek
  // type: 'relay' vagy 'pca', id: 1-bazisu, onVal/offVal: °C-ban (pl. 25.1)
  function sendThermoValues(type, id, onVal, offVal) {
    // Ertekek 1/10 fokra konvertalasa (szerver formatum)
    const onServer = Math.round(onVal * 10);
    const offServer = Math.round(offVal * 10);

    let onName, offName;
    if (type === 'pca') {
      onName = `PCA_temp_MIN*${id}`;
      offName = `PCA_temp_MAX*${id}`;
    } else {
      onName = `min_temp_ON*${id}`;
      offName = `max_temp_OFF*${id}`;
    }

    const commandStr = `${onName}=${onServer}&${offName}=${offServer}`;

    if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
      MyIOLive.sendCommand(commandStr, true);
      console.log(`Ninja: Thermo ${type} ${id} ON=${onVal}° OFF=${offVal}° parancs elkulve`);
      return true;
    } else if (typeof changedPair === 'function') {
      const onInput = document.createElement('input');
      onInput.name = onName;
      onInput.value = String(onServer);
      const offInput = document.createElement('input');
      offInput.name = offName;
      offInput.value = String(offServer);
      changedPair(onInput, onInput.name, offInput, offInput.name);
      return true;
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `${host}data?${commandStr}`, true);
      xhr.send();
      return true;
    }
  }

  // Termosztat celhofo beallitasa - megtartja a jelenlegi hiszterezist
  // type: 'relay' vagy 'pca', id: 1-bazisu, target: celhofo °C-ban
  function executeThermoTargetCommand(type, id, target) {
    try {
      id = parseInt(id);
      target = parseFloat(target);
      if (isNaN(id) || id < 1) {
        showToast(`Ervenytelen thermo ID: ${id}`);
        return false;
      }
      if (isNaN(target)) {
        showToast(`Ervenytelen homerseklet: ${target}`);
        return false;
      }

      const idx = id - 1; // 0-bazisu index a tombokhoz
      let currentOn, currentOff;

      if (type === 'pca') {
        if (typeof PCA_min_temp_ON === 'undefined' || typeof PCA_max_temp_OFF === 'undefined') {
          showToast('PCA termosztat adatok nem elerhetoek');
          return false;
        }
        currentOn = PCA_min_temp_ON[idx] / 10;
        currentOff = PCA_max_temp_OFF[idx] / 10;
      } else {
        if (typeof min_temp_ON === 'undefined' || typeof max_temp_OFF === 'undefined') {
          showToast('Relay termosztat adatok nem elerhetoek');
          return false;
        }
        currentOn = min_temp_ON[idx] / 10;
        currentOff = max_temp_OFF[idx] / 10;
      }

      // Hiszterezis szamitasa az aktualis ertekekbol
      let hysteresis = Math.abs(currentOff - currentOn) / 2;
      // Ha nincs hiszterezis (mindketto 0 vagy egyenlo), alapertelmezett 0.5°C
      if (hysteresis < 0.1) hysteresis = 0.5;

      const isHeating = currentOn < currentOff;
      let newOn, newOff;

      if (isHeating) {
        // Futes: ON (alacsonyabb) < OFF (magasabb)
        newOn = Math.round((target - hysteresis) * 10) / 10;
        newOff = Math.round((target + hysteresis) * 10) / 10;
      } else {
        // Hutes: ON (magasabb) > OFF (alacsonyabb)
        newOn = Math.round((target + hysteresis) * 10) / 10;
        newOff = Math.round((target - hysteresis) * 10) / 10;
      }

      // Lokalis tombok frissitese
      if (type === 'pca') {
        PCA_min_temp_ON[idx] = Math.round(newOn * 10);
        PCA_max_temp_OFF[idx] = Math.round(newOff * 10);
      } else {
        min_temp_ON[idx] = Math.round(newOn * 10);
        max_temp_OFF[idx] = Math.round(newOff * 10);
      }

      return sendThermoValues(type, id, newOn, newOff);
    } catch (error) {
      console.error('Thermo target command error:', error);
      showToast(`Termosztat parancs hiba: ${error.message}`);
      return false;
    }
  }

  // Termosztat ON ertek beallitasa (csak a bekapcsolasi hofok)
  function executeThermoOnCommand(type, id, value) {
    try {
      id = parseInt(id);
      value = parseFloat(value);
      if (isNaN(id) || id < 1) {
        showToast(`Ervenytelen thermo ID: ${id}`);
        return false;
      }
      if (isNaN(value)) {
        showToast(`Ervenytelen hofo: ${value}`);
        return false;
      }

      const idx = id - 1;
      let currentOff;

      if (type === 'pca') {
        if (typeof PCA_max_temp_OFF === 'undefined') {
          showToast('PCA termosztat adatok nem elerhetoek');
          return false;
        }
        currentOff = PCA_max_temp_OFF[idx] / 10;
        PCA_min_temp_ON[idx] = Math.round(value * 10);
      } else {
        if (typeof max_temp_OFF === 'undefined') {
          showToast('Relay termosztat adatok nem elerhetoek');
          return false;
        }
        currentOff = max_temp_OFF[idx] / 10;
        min_temp_ON[idx] = Math.round(value * 10);
      }

      return sendThermoValues(type, id, value, currentOff);
    } catch (error) {
      console.error('Thermo ON command error:', error);
      showToast(`Termosztat ON parancs hiba: ${error.message}`);
      return false;
    }
  }

  // Termosztat OFF ertek beallitasa (csak a kikapcsolasi hofok)
  function executeThermoOffCommand(type, id, value) {
    try {
      id = parseInt(id);
      value = parseFloat(value);
      if (isNaN(id) || id < 1) {
        showToast(`Ervenytelen thermo ID: ${id}`);
        return false;
      }
      if (isNaN(value)) {
        showToast(`Ervenytelen hofo: ${value}`);
        return false;
      }

      const idx = id - 1;
      let currentOn;

      if (type === 'pca') {
        if (typeof PCA_min_temp_ON === 'undefined') {
          showToast('PCA termosztat adatok nem elerhetoek');
          return false;
        }
        currentOn = PCA_min_temp_ON[idx] / 10;
        PCA_max_temp_OFF[idx] = Math.round(value * 10);
      } else {
        if (typeof min_temp_ON === 'undefined') {
          showToast('Relay termosztat adatok nem elerhetoek');
          return false;
        }
        currentOn = min_temp_ON[idx] / 10;
        max_temp_OFF[idx] = Math.round(value * 10);
      }

      return sendThermoValues(type, id, currentOn, value);
    } catch (error) {
      console.error('Thermo OFF command error:', error);
      showToast(`Termosztat OFF parancs hiba: ${error.message}`);
      return false;
    }
  }

  // XML fallback: kinyeri a parancsokat ha a modell XML formatumot hasznal
  function extractCommandsFromXML(text) {
    const commands = [];
    // <parameter name="command">relay_off(3)</parameter> formatum
    const paramRegex = /<parameter\s+name="command">([^<]+)<\/parameter>/g;
    let m;
    while ((m = paramRegex.exec(text)) !== null) {
      commands.push(m[1].trim());
    }
    // <invoke name="execute_command">...<parameter ...>relay_on(1)</parameter> formatum (command nev nelkul)
    if (commands.length === 0) {
      const invokeRegex = /<invoke[^>]*>[\s\S]*?<parameter[^>]*>([^<]+)<\/parameter>[\s\S]*?<\/invoke>/g;
      while ((m = invokeRegex.exec(text)) !== null) {
        const cmd = m[1].trim();
        // Csak ismert parancsokat fogadjunk el
        if (/^(relay_on|relay_off|pca_on|pca_off|pca_set|pwm_on|pwm_off|pwm_set|thermo_target|thermo_on|thermo_off)\(/.test(cmd)) {
          commands.push(cmd);
        }
      }
    }
    return commands;
  }

  // Parse and execute commands from AI response
  function executeCommandsFromResponse(text) {
    const commandRegex = /\[COMMAND\]([^\[]*?)\[\/COMMAND\]/g;
    let match;
    let executed = 0;
    const results = [];

    // Ellenorizzuk, hogy van-e [COMMAND] tag - ha nincs, XML fallback
    const hasCommandTags = /\[COMMAND\]/.test(text);
    if (!hasCommandTags && /<(?:function_calls|invoke|parameter)/.test(text)) {
      const xmlCommands = extractCommandsFromXML(text);
      if (xmlCommands.length > 0) {
        console.log('Ninja: XML formatum eszlelve, konvertalas [COMMAND] formatumra');
        // Atkonvertalas [COMMAND] formatumra es ujra feldolgozas
        const converted = xmlCommands.map(cmd => `[COMMAND]${cmd}[/COMMAND]`).join('\n');
        return executeCommandsFromResponse(converted);
      }
    }

    while ((match = commandRegex.exec(text)) !== null) {
      const command = match[1].trim();
      console.log(`🥷 Ninja parancs: ${command}`);

      // relay_on(id)
      if (command.startsWith('relay_on(')) {
        const id = command.match(/relay_on\((\d+)\)/);
        if (id) {
          const success = executeRelayCommand('on', id[1]);
          if (success) {
            executed++;
            results.push(`Relay ${id[1]} bekapcsolva`);
          }
        }
      }
      // relay_off(id)
      else if (command.startsWith('relay_off(')) {
        const id = command.match(/relay_off\((\d+)\)/);
        if (id) {
          const success = executeRelayCommand('off', id[1]);
          if (success) {
            executed++;
            results.push(`Relay ${id[1]} kikapcsolva`);
          }
        }
      }
      // pca_on(id)
      else if (command.startsWith('pca_on(')) {
        const id = command.match(/pca_on\((\d+)\)/);
        if (id) {
          const success = executePCAToggleCommand('on', id[1]);
          if (success) {
            executed++;
            results.push(`PCA ${id[1]} bekapcsolva`);
          }
        }
      }
      // pca_off(id)
      else if (command.startsWith('pca_off(')) {
        const id = command.match(/pca_off\((\d+)\)/);
        if (id) {
          const success = executePCAToggleCommand('off', id[1]);
          if (success) {
            executed++;
            results.push(`PCA ${id[1]} kikapcsolva`);
          }
        }
      }
      // pca_set(id, value)
      else if (command.startsWith('pca_set(')) {
        const match2 = command.match(/pca_set\((\d+),\s*(\d+)\)/);
        if (match2) {
          const success = executePCASetCommand(match2[1], match2[2]);
          if (success) {
            executed++;
            results.push(`PCA ${match2[1]} -> ${match2[2]}%`);
          }
        }
      }
      // pwm_on(id)
      else if (command.startsWith('pwm_on(')) {
        const id = command.match(/pwm_on\((\d+)\)/);
        if (id) {
          const success = executePWMToggleCommand('on', id[1]);
          if (success) {
            executed++;
            results.push(`PWM ${id[1]} bekapcsolva`);
          }
        }
      }
      // pwm_off(id)
      else if (command.startsWith('pwm_off(')) {
        const id = command.match(/pwm_off\((\d+)\)/);
        if (id) {
          const success = executePWMToggleCommand('off', id[1]);
          if (success) {
            executed++;
            results.push(`PWM ${id[1]} kikapcsolva`);
          }
        }
      }
      // pwm_set(id, value)
      else if (command.startsWith('pwm_set(')) {
        const match2 = command.match(/pwm_set\((\d+),\s*(\d+)\)/);
        if (match2) {
          const success = executePWMSetCommand(match2[1], match2[2]);
          if (success) {
            executed++;
            results.push(`PWM ${match2[1]} -> ${match2[2]}%`);
          }
        }
      }
      // thermo_target(type, id, target)
      else if (command.startsWith('thermo_target(')) {
        const match2 = command.match(/thermo_target\(\s*(pca|relay)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (match2) {
          const success = executeThermoTargetCommand(match2[1], match2[2], match2[3]);
          if (success) {
            executed++;
            results.push(`Termosztat ${match2[1].toUpperCase()} ${match2[2]} cel: ${match2[3]}°`);
          }
        }
      }
      // thermo_on(type, id, value)
      else if (command.startsWith('thermo_on(')) {
        const match2 = command.match(/thermo_on\(\s*(pca|relay)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (match2) {
          const success = executeThermoOnCommand(match2[1], match2[2], match2[3]);
          if (success) {
            executed++;
            results.push(`Termosztat ${match2[1].toUpperCase()} ${match2[2]} ON: ${match2[3]}°`);
          }
        }
      }
      // thermo_off(type, id, value)
      else if (command.startsWith('thermo_off(')) {
        const match2 = command.match(/thermo_off\(\s*(pca|relay)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
        if (match2) {
          const success = executeThermoOffCommand(match2[1], match2[2], match2[3]);
          if (success) {
            executed++;
            results.push(`Termosztat ${match2[1].toUpperCase()} ${match2[2]} OFF: ${match2[3]}°`);
          }
        }
      }
    }

    return { count: executed, results };
  }

  // Send message to Claude API
  async function sendMessage() {
    const input = document.getElementById('ninja-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Check API key
    const apiKey = await getAPIKey();
    if (!apiKey) {
      showToast('⚠️ Kérlek add meg az API kulcsot!');
      return;
    }
    
    // Clear input and hide suggestions
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('ninja-suggestions').style.display = 'none';
    
    // Add user message
    addMessage(message, true);
    conversationHistory.push({
      role: 'user',
      content: message
    });
    
    // Show loading
    addLoadingIndicator();
    
    try {
      // Get device context
      const deviceContext = getDeviceContext();
      
      // Kontextus mindig csatolva az uzenethez (friss eszkoz allapotok, zonak, megjegyzesek)
      let contextMessage = message;
      const hasDevices = deviceContext.relays.length > 0 || deviceContext.pca.length > 0 || deviceContext.pwm.length > 0 || deviceContext.sensors.length > 0 || deviceContext.thermostats.length > 0;
      if (hasDevices) {
        contextMessage = `[Rendszer kontextus - aktualis eszkoz allapotok]\n`;
        if (deviceContext.zones && deviceContext.zones.length > 0) {
          contextMessage += `Elerheto zonak: ${JSON.stringify(deviceContext.zones)}\n`;
        }
        if (deviceContext.relays.length > 0) {
          contextMessage += `Relek: ${JSON.stringify(deviceContext.relays)}\n`;
        }
        if (deviceContext.pca.length > 0) {
          contextMessage += `PCA kimenetek: ${JSON.stringify(deviceContext.pca)}\n`;
        }
        if (deviceContext.pwm.length > 0) {
          contextMessage += `PWM/FET kimenetek: ${JSON.stringify(deviceContext.pwm)}\n`;
        }
        if (deviceContext.sensors.length > 0) {
          contextMessage += `Szenzorok: ${JSON.stringify(deviceContext.sensors)}\n`;
        }
        if (deviceContext.thermostats.length > 0) {
          contextMessage += `Termosztatok: ${JSON.stringify(deviceContext.thermostats)}\n`;
        }
        contextMessage += `\nFelhasznalo kerdese: ${message}`;

        // Az utolso user uzenetet frissitjuk kontextussal
        conversationHistory[conversationHistory.length - 1].content = contextMessage;
      }
      
      // Call Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: NINJA_CONFIG.modelName,
          max_tokens: NINJA_CONFIG.maxTokens,
          system: NINJA_CONFIG.systemPrompt,
          messages: conversationHistory
        })
      });
      
      removeLoadingIndicator();
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API hiba: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = data.content[0].text;
      
      // Execute commands from response FIRST
      const execution = executeCommandsFromResponse(assistantMessage);
      
      // Clean message for display (remove command tags + XML fallback tags)
      let displayMessage = assistantMessage.replace(/\[COMMAND\][^\[]*?\[\/COMMAND\]/g, '').trim();
      // XML formatum takaritasa is
      displayMessage = displayMessage.replace(/<function_calls>[\s\S]*?<\/function_calls>/g, '').trim();
      displayMessage = displayMessage.replace(/<\/?(?:invoke|parameter|function_calls)[^>]*>/g, '').trim();
      
      // Add assistant response (without command tags)
      addMessage(displayMessage, false);
      conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });
      
      // Show command execution feedback
      if (execution.count > 0) {
        const feedback = `✅ ${execution.count} parancs végrehajtva:\n${execution.results.join('\n')}`;
        showToast(feedback);
        console.log('🥷 Ninja parancsok végrehajtva:', execution.results);
      }
      
      // Limit history to last 20 messages
      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }
      
    } catch (error) {
      removeLoadingIndicator();
      console.error('Ninja API error:', error);
      addMessage(`❌ Hiba történt: ${error.message}`, false);
      showToast('❌ Hiba történt a válasz feldolgozása során');
    }
  }

  // Open Ninja modal
  function openNinja() {
    if (!document.getElementById('ninja-modal')) {
      createNinjaModal();
    }
    const modal = document.getElementById('ninja-modal');
    const ninjaBtn = document.getElementById('ninja-menu-btn');
    modal.style.display = 'flex';
    isNinjaOpen = true;
    // Keep active class
    if (ninjaBtn) ninjaBtn.classList.add('ninja-active');
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('ninja-input');
      if (input) input.focus();
    }, 100);
  }

  // Close Ninja modal
  function closeNinja() {
    const modal = document.getElementById('ninja-modal');
    if (modal) {
      modal.style.display = 'none';
      isNinjaOpen = false;
      // Keep the active class so button stays orange
      const ninjaBtn = document.getElementById('ninja-menu-btn');
      if (ninjaBtn) ninjaBtn.classList.add('ninja-active');
    }
  }

  // Toggle Ninja
  function toggleNinja() {
    const ninjaBtn = document.getElementById('ninja-menu-btn');
    if (isNinjaOpen) {
      closeNinja();
    } else {
      openNinja();
      // Add active class when opened (stays orange)
      if (ninjaBtn) ninjaBtn.classList.add('ninja-active');
    }
  }


  // Add Ninja button to menu
  function addNinjaButton() {
    // Wait for menu footer to be ready
    const checkMenu = setInterval(() => {
      const menuFooter = document.querySelector('.myio-menuFooter');
      if (menuFooter && !document.getElementById('ninja-menu-btn')) {
        clearInterval(checkMenu);
        
        // Make footer flex with space-between
        menuFooter.style.display = 'flex';
        menuFooter.style.justifyContent = 'space-between';
        menuFooter.style.alignItems = 'center';
        menuFooter.style.gap = '10px';
        
        const ninjaBtn = document.createElement('button');
        ninjaBtn.type = 'button';
        ninjaBtn.id = 'ninja-menu-btn';
        ninjaBtn.className = 'myio-btn small ninja-menu-btn';
        ninjaBtn.innerHTML = 'AI Ninja <span style="font-size: 2em;">🥷</span>';
        ninjaBtn.onclick = toggleNinja;
        
        // Append to end (right side)
        menuFooter.appendChild(ninjaBtn);
        
        console.log('🥷 Ninja AI Chat initialized (FIXED VERSION)');
      }
    }, 100);
    
    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkMenu), 5000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addNinjaButton);
  } else {
    addNinjaButton();
  }

  // Export for testing
  window.NinjaAI = {
    open: openNinja,
    close: closeNinja,
    toggle: toggleNinja
  };

})();
