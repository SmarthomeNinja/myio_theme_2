// ===== NINJA AI CHAT MODULE =====
// Anthropic Claude chatbot integráció MyIO smart home rendszerhez

(function() {
  'use strict';

  // Konfiguráció
  const NINJA_CONFIG = {
    modelName: 'claude-sonnet-4-5-20250929',
    maxTokens: 4096,
    systemPrompt: `Te a Ninja vagy, egy okos otthon asszisztens a MyIO smart home rendszerben. 
Segítesz a felhasználónak az okos otthon eszközök kezelésében, magyarázol dolgokat és válaszolsz kérdésekre.
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
          <button class="ninja-suggestion">💡 Hogyan állíthatom be a világítást?</button>
          <button class="ninja-suggestion">📊 Mutasd az energiafogyasztást</button>
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
            id: i,
            name: relay_description[i],
            state: relays[i] === 11 ? 'be' : 'ki'
          });
        }
      }
    }
    
    // PWM devices
    if (typeof PCA_description !== 'undefined' && typeof PCA !== 'undefined') {
      for (let i = 0; i < PCA_description.length; i++) {
        if (PCA_description[i]) {
          context.pwm.push({
            id: i,
            name: PCA_description[i],
            value: PCA[i]
          });
        }
      }
    }
    
    // Sensors
    if (typeof hum_description !== 'undefined' && typeof humidity !== 'undefined') {
      for (let i = 0; i < hum_description.length; i++) {
        if (hum_description[i]) {
          context.sensors.push({
            id: i,
            name: hum_description[i],
            value: humidity[i]
          });
        }
      }
    }
    
    return context;
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
      
      // Build enhanced system prompt with context
      let enhancedSystemPrompt = NINJA_CONFIG.systemPrompt;
      if (deviceContext.relays.length > 0 || deviceContext.pwm.length > 0 || deviceContext.sensors.length > 0) {
        enhancedSystemPrompt += `\n\nJelenlegi eszközök:\n`;
        if (deviceContext.relays.length > 0) {
          enhancedSystemPrompt += `\nRelék: ${JSON.stringify(deviceContext.relays, null, 2)}`;
        }
        if (deviceContext.pwm.length > 0) {
          enhancedSystemPrompt += `\nPWM eszközök: ${JSON.stringify(deviceContext.pwm, null, 2)}`;
        }
        if (deviceContext.sensors.length > 0) {
          enhancedSystemPrompt += `\nSzenzorok: ${JSON.stringify(deviceContext.sensors, null, 2)}`;
        }
      }
      
      // Call Anthropic API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: NINJA_CONFIG.modelName,
          max_tokens: NINJA_CONFIG.maxTokens,
          system: enhancedSystemPrompt,
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
      
      // Add assistant response
      addMessage(assistantMessage, false);
      conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });
      
      // Limit history to last 10 messages
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
      createNinjaStyles();
    }
    const modal = document.getElementById('ninja-modal');
    modal.style.display = 'flex';
    isNinjaOpen = true;
    
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
    }
  }

  // Toggle Ninja
  function toggleNinja() {
    if (isNinjaOpen) {
      closeNinja();
    } else {
      openNinja();
    }
  }

  // Create Ninja styles
  function createNinjaStyles() {
    if (document.getElementById('ninja-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ninja-styles';
    style.textContent = `
      /* Ninja AI Chat Styles */
      .ninja-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: ninjaFadeIn 0.2s ease-out;
      }
      
      @keyframes ninjaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .ninja-modal-content {
        background: linear-gradient(135deg, #1e3a5f 0%, #0f1f38 100%);
        border-radius: 16px;
        max-width: 800px;
        width: 100%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: ninjaSlideUp 0.3s ease-out;
        border: 1px solid rgba(3, 151, 214, 0.3);
      }
      
      @keyframes ninjaSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      .ninja-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(3, 151, 214, 0.3);
        background: rgba(3, 151, 214, 0.1);
      }
      
      .ninja-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 20px;
        font-weight: 600;
        color: #43E7F6;
      }
      
      .ninja-title svg {
        filter: drop-shadow(0 2px 4px rgba(67, 231, 246, 0.3));
      }
      
      .ninja-close {
        background: transparent;
        border: none;
        color: #43E7F6;
        font-size: 32px;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
      }
      
      .ninja-close:hover {
        background: rgba(67, 231, 246, 0.1);
        transform: scale(1.1);
      }
      
      .ninja-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 300px;
        max-height: 500px;
      }
      
      .ninja-messages::-webkit-scrollbar {
        width: 8px;
      }
      
      .ninja-messages::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
      }
      
      .ninja-messages::-webkit-scrollbar-thumb {
        background: rgba(3, 151, 214, 0.5);
        border-radius: 4px;
      }
      
      .ninja-messages::-webkit-scrollbar-thumb:hover {
        background: rgba(3, 151, 214, 0.7);
      }
      
      .ninja-message {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        animation: ninjaMessageIn 0.3s ease-out;
      }
      
      @keyframes ninjaMessageIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .ninja-message.ninja-user {
        flex-direction: row-reverse;
      }
      
      .ninja-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: linear-gradient(135deg, #0397d6, #43E7F6);
        box-shadow: 0 4px 12px rgba(3, 151, 214, 0.3);
        font-size: 20px;
      }
      
      .ninja-message.ninja-user .ninja-avatar {
        background: linear-gradient(135deg, #555, #777);
      }
      
      .ninja-bubble {
        background: rgba(3, 151, 214, 0.15);
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 75%;
        color: #e0e0e0;
        line-height: 1.5;
        border: 1px solid rgba(3, 151, 214, 0.2);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .ninja-message.ninja-user .ninja-bubble {
        background: rgba(67, 231, 246, 0.2);
        border-color: rgba(67, 231, 246, 0.3);
      }
      
      .ninja-bubble p {
        margin: 0 0 8px 0;
      }
      
      .ninja-bubble p:last-child {
        margin-bottom: 0;
      }
      
      .ninja-typing {
        display: flex;
        gap: 4px;
        padding: 4px 0;
      }
      
      .ninja-typing span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #43E7F6;
        animation: ninjaTyping 1.4s infinite;
      }
      
      .ninja-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .ninja-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes ninjaTyping {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
        30% { transform: translateY(-10px); opacity: 1; }
      }
      
      .ninja-suggested-prompts {
        padding: 12px 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        border-top: 1px solid rgba(3, 151, 214, 0.2);
        background: rgba(0, 0, 0, 0.2);
      }
      
      .ninja-suggestion {
        padding: 8px 14px;
        background: rgba(3, 151, 214, 0.2);
        border: 1px solid rgba(3, 151, 214, 0.3);
        border-radius: 20px;
        color: #43E7F6;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }
      
      .ninja-suggestion:hover {
        background: rgba(3, 151, 214, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
      
      .ninja-input-area {
        padding: 20px;
        border-top: 1px solid rgba(3, 151, 214, 0.3);
        display: flex;
        gap: 12px;
        align-items: flex-end;
        background: rgba(0, 0, 0, 0.2);
      }
      
      .ninja-input {
        flex: 1;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(3, 151, 214, 0.3);
        border-radius: 12px;
        color: #fff;
        font-size: 14px;
        font-family: inherit;
        resize: none;
        min-height: 44px;
        max-height: 150px;
        transition: all 0.2s;
      }
      
      .ninja-input:focus {
        outline: none;
        border-color: #43E7F6;
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 0 0 0 3px rgba(67, 231, 246, 0.1);
      }
      
      .ninja-input::placeholder {
        color: rgba(255, 255, 255, 0.4);
      }
      
      .ninja-send {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(135deg, #0397d6, #43E7F6);
        border: none;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(3, 151, 214, 0.3);
      }
      
      .ninja-send:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(3, 151, 214, 0.4);
      }
      
      .ninja-send:active {
        transform: translateY(0);
      }
      
      .ninja-send svg {
        width: 20px;
        height: 20px;
      }
      
      .ninja-api-setup {
        padding: 20px;
        border-top: 1px solid rgba(3, 151, 214, 0.3);
        background: rgba(252, 176, 52, 0.1);
      }
      
      .ninja-api-notice {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .ninja-api-notice p {
        margin: 0;
        color: #fcb034;
        font-weight: 500;
      }
      
      .ninja-api-input {
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(3, 151, 214, 0.3);
        border-radius: 8px;
        color: #fff;
        font-size: 14px;
        font-family: 'Courier New', monospace;
      }
      
      .ninja-api-input:focus {
        outline: none;
        border-color: #43E7F6;
        box-shadow: 0 0 0 3px rgba(67, 231, 246, 0.1);
      }
      
      .ninja-btn-primary {
        padding: 12px 24px;
        background: linear-gradient(135deg, #0397d6, #43E7F6);
        border: none;
        border-radius: 8px;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(3, 151, 214, 0.3);
      }
      
      .ninja-btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(3, 151, 214, 0.4);
      }
      
      .ninja-toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(30, 58, 95, 0.95);
        color: #fff;
        padding: 14px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        z-index: 10001;
        opacity: 0;
        transition: all 0.3s ease;
        border: 1px solid rgba(3, 151, 214, 0.3);
        backdrop-filter: blur(10px);
      }
      
      .ninja-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      
      /* Mobile responsive */
      @media (max-width: 768px) {
        .ninja-modal {
          padding: 0;
        }
        
        .ninja-modal-content {
          max-width: 100%;
          max-height: 100vh;
          border-radius: 0;
        }
        
        .ninja-messages {
          max-height: calc(100vh - 300px);
        }
        
        .ninja-bubble {
          max-width: 85%;
        }
        
        .ninja-suggested-prompts {
          overflow-x: auto;
          flex-wrap: nowrap;
        }
      }
      
      /* Ninja Menu Button Styling */
      .ninja-menu-btn {
        background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffc837 100%) !important;
        color: #fff !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4) !important;
        border: 1px solid rgba(255, 200, 55, 0.3) !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
      }
      
      .ninja-menu-btn::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transform: rotate(45deg);
        animation: ninjaShine 3s infinite;
      }
      
      @keyframes ninjaShine {
        0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
      }
      
      .ninja-menu-btn:hover {
        background: linear-gradient(135deg, #ff8555 0%, #ffa73e 50%, #ffd857 100%) !important;
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.6) !important;
      }
      
      .ninja-menu-btn:active {
        transform: translateY(0) scale(0.98) !important;
      }
    `;
    
    document.head.appendChild(style);
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
        ninjaBtn.innerHTML = 'AI Ninja <span style="font-size: 1.3em;">🥷</span>';
        ninjaBtn.onclick = toggleNinja;
        
        // Append to end (right side)
        menuFooter.appendChild(ninjaBtn);
        
        console.log('🥷 Ninja AI Chat initialized');
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
