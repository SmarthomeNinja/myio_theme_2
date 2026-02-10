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
   - "relay_on(relay_id)" - relé bekapcsolása
   - "relay_off(relay_id)" - relé kikapcsolása
   Relay ID-k: 1-32

2. PWM értékek beállítása (0-255):
   - "pwm_set(pwm_id, value)" - PWM érték beállítása
   Például: "pwm_set(2, 150)" - 2-es PWM eszköz 150-es értékre
   PWM ID-k: 1-16

PARANCSOK FORMÁTUMA:
Ha a felhasználó eszközöket szeretne beállítani, adj ki parancsokat a válaszodban [COMMAND] tagek között:
[COMMAND]relay_on(1)[/COMMAND]
[COMMAND]pwm_set(2, 200)[/COMMAND]

MÁSNYELVI TÁMOGATÁS:
- "kapcsold be a lámpát" = relay_on()
- "dimeld a LED-et" = pwm_set()
- Értelmezd a felhasználó szándékát és hajtsd végre a megfelelő parancsokat!

PROTOKOLL:
1. Válaszd meg a felhasználót baráti, segítőkész hangnemben
2. Ha parancs szükséges, add ki azt [COMMAND] tagek között
3. Mutasd meg, hogy mi történik (pl. "LED-et 200-ra dimmelek")
4. Kerüld a többszörös parancsokat - egyszerre max 3 parancs

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

  // Get device context for AI
  function getDeviceContext() {
    const context = {
      relays: [],
      sensors: [],
      pwm: []
    };
    
    // Relays
    if (typeof relay_description !== 'undefined' && typeof relays !== 'undefined') {
      for (let i = 0; i < relay_description.length; i++) {
        if (relay_description[i]) {
          context.relays.push({
            id: i + 1, // ID-k 1-től kezdődnek
            name: relay_description[i],
            state: relays[i] == 11 ? 'be' : 'ki'
          });
        }
      }
    }
    
    // PWM devices (PCA)
    if (typeof PCA_description !== 'undefined' && typeof PCA !== 'undefined') {
      for (let i = 0; i < PCA_description.length; i++) {
        if (PCA_description[i]) {
          context.pwm.push({
            id: i + 1, // ID-k 1-től kezdődnek
            name: PCA_description[i],
            value: PCA[i]
          });
        }
      }
    }
    
    // Sensors - hőmérséklet
    if (typeof thermo_description !== 'undefined' && typeof temperature !== 'undefined') {
      for (let i = 0; i < thermo_description.length; i++) {
        if (thermo_description[i] && temperature[i] !== undefined) {
          context.sensors.push({
            id: i + 1,
            name: thermo_description[i],
            type: 'hőmérséklet',
            value: temperature[i] + ' °C'
          });
        }
      }
    }
    
    // Sensors - páratartalom
    if (typeof hum_description !== 'undefined' && typeof humidity !== 'undefined') {
      for (let i = 0; i < hum_description.length; i++) {
        if (hum_description[i] && humidity[i] !== undefined) {
          context.sensors.push({
            id: i + 1,
            name: hum_description[i],
            type: 'páratartalom',
            value: humidity[i] + ' %'
          });
        }
      }
    }
    
    return context;
  }

  // Execute relay command - JAVÍTOTT VERZIÓ
  function executeRelayCommand(command, relayId) {
    relayId--;
    try {
      const id = parseInt(relayId);
      if (isNaN(id) || id < 1 || id > 64) {
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

  // Execute PWM command - JAVÍTOTT VERZIÓ
  function executePWMCommand(pwmId, value) {
    try {
      const id = parseInt(pwmId);
      const val = parseInt(value);

      if (isNaN(id) || id < 1 || id > 16) {
        showToast(`❌ Érvénytelen PWM ID: ${id}`);
        return false;
      }
      if (isNaN(val) || val < 0 || val > 255) {
        showToast(`❌ Érvénytelen PWM érték: ${val} (0-255 között kell lennie)`);
        return false;
      }

      // Használjuk a MyIOLive.sendCommand-ot ha elérhető
      if (typeof MyIOLive !== 'undefined' && MyIOLive.sendCommand) {
        MyIOLive.sendCommand(`PCA*${id}=${val}`, true);
        console.log(`✅ Ninja: PWM ${id} = ${val} parancs elküldve`);
        return true;
      } else {
        // Fallback: changed() funkció használata
        console.log('MyIOLive nem elérhető, changed() használata');
        
        if (typeof changed === 'function') {
          const fakeInput = {
            name: `PCA*${id}`,
            value: val
          };
          changed(fakeInput, fakeInput.name, 1, true);
          return true;
        } else {
          // Utolsó fallback: közvetlen HTTP kérés
          const xhr = new XMLHttpRequest();
          xhr.open('GET', `/data?PCA*${id}=${val}`, true);
          xhr.onload = function() {
            if (xhr.status === 200) {
              console.log(`✅ Ninja: PWM ${id} = ${val} sikeres`);
              if (typeof PCA !== 'undefined') {
                PCA[id - 1] = val;
              }
            }
          };
          xhr.send();
          return true;
        }
      }
    } catch (error) {
      console.error('PWM command error:', error);
      showToast(`❌ PWM parancs hiba: ${error.message}`);
      return false;
    }
    return false;
  }

  // Parse and execute commands from AI response
  function executeCommandsFromResponse(text) {
    const commandRegex = /\[COMMAND\]([^\[]*?)\[\/COMMAND\]/g;
    let match;
    let executed = 0;
    const results = [];

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
      // pwm_set(id, value)
      else if (command.startsWith('pwm_set(')) {
        const match2 = command.match(/pwm_set\((\d+),\s*(\d+)\)/);
        if (match2) {
          const success = executePWMCommand(match2[1], match2[2]);
          if (success) {
            executed++;
            results.push(`PWM ${match2[1]} → ${match2[2]}`);
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
      
      // Build context message for first user message
      let contextMessage = message;
      if (conversationHistory.length === 1 && (deviceContext.relays.length > 0 || deviceContext.pwm.length > 0 || deviceContext.sensors.length > 0)) {
        contextMessage = `Rendszer kontextus:\n`;
        if (deviceContext.relays.length > 0) {
          contextMessage += `Relék: ${JSON.stringify(deviceContext.relays)}\n`;
        }
        if (deviceContext.pwm.length > 0) {
          contextMessage += `PWM eszközök: ${JSON.stringify(deviceContext.pwm)}\n`;
        }
        if (deviceContext.sensors.length > 0) {
          contextMessage += `Szenzorok: ${JSON.stringify(deviceContext.sensors)}\n`;
        }
        contextMessage += `\nFelhasználó kérdése: ${message}`;
        
        // Update last message with context
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
      
      // Clean message for display (remove command tags)
      const displayMessage = assistantMessage.replace(/\[COMMAND\][^\[]*?\[\/COMMAND\]/g, '').trim();
      
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
