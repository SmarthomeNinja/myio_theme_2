/**
 * Ninja AI Chatbot Module
 * Integrates Anthropic Claude AI into MyIO Dashboard
 * 
 * Features:
 * - Modal chat interface
 * - Message history
 * - Loading states
 * - Theme-aware styling
 */

(function initNinjaAIChat() {
    // CSS beinjektálása
    const chatStyles = `
        .myio-ninja-chat-wrapper {
            --ninja-primary: #00d4ff;
            --ninja-bg: rgba(15, 23, 42, 0.98);
            --ninja-border: rgba(0, 212, 255, 0.2);
            --ninja-text: #e2e8f0;
            --ninja-text-secondary: rgba(226, 232, 240, 0.6);
        }

        .myio-ninja-chat-btn {
            position: relative;
            padding: 8px 12px;
            margin-left: auto;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05));
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 8px;
            color: var(--ninja-primary);
            font-weight: 600;
            font-size: 0.9em;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.3s ease;
            white-space: nowrap;
        }

        .myio-ninja-chat-btn:hover {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(0, 212, 255, 0.1));
            border-color: rgba(0, 212, 255, 0.5);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.15);
        }

        .myio-ninja-chat-btn:active {
            transform: translateY(0);
        }

        .myio-ninja-icon {
            font-size: 1.1em;
            display: inline-block;
            animation: ninjaBounce 0.6s ease-in-out infinite;
        }

        @keyframes ninjaBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }

        .myio-ninja-chat-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9998;
            animation: fadeIn 0.3s ease;
        }

        .myio-ninja-chat-overlay.is-open {
            display: flex;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .myio-ninja-chat-modal {
            position: relative;
            width: 90%;
            max-width: 500px;
            height: 70vh;
            max-height: 600px;
            background: var(--ninja-bg);
            border: 1px solid var(--ninja-border);
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            box-shadow: 
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(0, 212, 255, 0.1);
            animation: slideUp 0.3s ease;
            overflow: hidden;
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .myio-ninja-chat-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--ninja-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .myio-ninja-chat-header-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 700;
            font-size: 1.1em;
            color: var(--ninja-text);
        }

        .myio-ninja-chat-header-icon {
            font-size: 1.3em;
        }

        .myio-ninja-chat-close {
            background: none;
            border: none;
            color: var(--ninja-text-secondary);
            font-size: 1.5em;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .myio-ninja-chat-close:hover {
            background: rgba(0, 212, 255, 0.1);
            color: var(--ninja-primary);
        }

        .myio-ninja-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .myio-ninja-chat-messages::-webkit-scrollbar {
            width: 6px;
        }

        .myio-ninja-chat-messages::-webkit-scrollbar-track {
            background: rgba(0, 212, 255, 0.05);
            border-radius: 3px;
        }

        .myio-ninja-chat-messages::-webkit-scrollbar-thumb {
            background: rgba(0, 212, 255, 0.2);
            border-radius: 3px;
        }

        .myio-ninja-chat-messages::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 212, 255, 0.4);
        }

        .myio-ninja-message {
            display: flex;
            gap: 8px;
            animation: messageSlideIn 0.3s ease;
        }

        @keyframes messageSlideIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .myio-ninja-message.is-user {
            justify-content: flex-end;
        }

        .myio-ninja-message-content {
            max-width: 85%;
            padding: 10px 14px;
            border-radius: 12px;
            font-size: 0.95em;
            line-height: 1.4;
            word-wrap: break-word;
        }

        .myio-ninja-message-user .myio-ninja-message-content {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(0, 212, 255, 0.15));
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: var(--ninja-text);
        }

        .myio-ninja-message-ninja .myio-ninja-message-content {
            background: rgba(0, 212, 255, 0.08);
            border: 1px solid rgba(0, 212, 255, 0.15);
            color: var(--ninja-text);
        }

        .myio-ninja-message-ninja .myio-ninja-message-content a {
            color: var(--ninja-primary);
            text-decoration: none;
            border-bottom: 1px solid rgba(0, 212, 255, 0.3);
            transition: border-color 0.2s;
        }

        .myio-ninja-message-ninja .myio-ninja-message-content a:hover {
            border-bottom-color: var(--ninja-primary);
        }

        .myio-ninja-message-typing {
            display: flex;
            gap: 4px;
            align-items: center;
        }

        .myio-ninja-message-typing span {
            width: 6px;
            height: 6px;
            background: var(--ninja-primary);
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }

        .myio-ninja-message-typing span:nth-child(2) {
            animation-delay: 0.2s;
        }

        .myio-ninja-message-typing span:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes typing {
            0%, 60%, 100% {
                opacity: 0.3;
                transform: translateY(0);
            }
            30% {
                opacity: 1;
                transform: translateY(-8px);
            }
        }

        .myio-ninja-chat-input-area {
            padding: 12px 16px;
            border-top: 1px solid var(--ninja-border);
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .myio-ninja-chat-input {
            flex: 1;
            background: rgba(0, 212, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 8px;
            color: var(--ninja-text);
            padding: 10px 12px;
            font-size: 0.95em;
            font-family: inherit;
            resize: none;
            max-height: 100px;
            transition: border-color 0.2s;
        }

        .myio-ninja-chat-input::placeholder {
            color: var(--ninja-text-secondary);
        }

        .myio-ninja-chat-input:focus {
            outline: none;
            border-color: rgba(0, 212, 255, 0.4);
            background: rgba(0, 212, 255, 0.08);
        }

        .myio-ninja-chat-send-btn {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.15));
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: var(--ninja-primary);
            font-weight: 600;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9em;
            white-space: nowrap;
        }

        .myio-ninja-chat-send-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.4), rgba(0, 212, 255, 0.25));
            border-color: rgba(0, 212, 255, 0.5);
            transform: translateY(-1px);
        }

        .myio-ninja-chat-send-btn:active:not(:disabled) {
            transform: translateY(0);
        }

        .myio-ninja-chat-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .myio-ninja-chat-welcome {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 20px;
            text-align: center;
            color: var(--ninja-text-secondary);
        }

        .myio-ninja-chat-welcome-icon {
            font-size: 3em;
            opacity: 0.6;
        }

        .myio-ninja-chat-suggestions {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 12px;
            width: 100%;
        }

        .myio-ninja-suggestion-btn {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.2);
            color: var(--ninja-text-secondary);
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85em;
            transition: all 0.2s ease;
        }

        .myio-ninja-suggestion-btn:hover {
            background: rgba(0, 212, 255, 0.15);
            border-color: rgba(0, 212, 255, 0.3);
            color: var(--ninja-text);
        }

        .myio-ninja-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.9em;
        }

        @media (max-width: 600px) {
            .myio-ninja-chat-modal {
                width: 95%;
                max-height: 80vh;
                border-radius: 12px;
            }

            .myio-ninja-message-content {
                max-width: 90%;
            }

            .myio-ninja-chat-btn {
                padding: 6px 10px;
                font-size: 0.8em;
            }

            .myio-ninja-chat-header {
                padding: 12px 16px;
            }

            .myio-ninja-chat-messages {
                padding: 12px;
            }

            .myio-ninja-chat-input-area {
                padding: 10px 12px;
            }
        }
    `;

    // CSS injektálása
    const styleEl = document.createElement('style');
    styleEl.textContent = chatStyles;
    document.head.appendChild(styleEl);

    // AI Chatbot kezelő
    const NinjaChatBot = {
        apiKey: null,
        conversationHistory: [],
        isOpen: false,
        isLoading: false,
        systemPrompt: `You are Ninja, a helpful AI assistant integrated into a smart home dashboard (MyIO). 
You have expertise in:
- Smart home automation and control
- Energy monitoring and optimization
- Device management
- Home automation best practices

Keep responses concise and friendly. You can provide guidance, troubleshooting help, and suggestions for optimizing the smart home setup.
Always be respectful and try to understand the user's smart home context.
When uncertain, ask clarifying questions.`,

        // Inicializáció
        init() {
            this.loadApiKey();
            this.setupUI();
            this.attachEventListeners();
        },

        // API key betöltése
        loadApiKey() {
            // Az API kulcsot a backend adja meg - a frontend nem tároljunk szenzitív adatot
            // Az API hívást proxy-zni kell a backendon keresztül!
            // Ez egy demo, valós használatban a backend kezelje az API-t
            const apiKeyElement = document.getElementById('anthropic-api-key');
            if (apiKeyElement) {
                this.apiKey = apiKeyElement.getAttribute('data-key');
            }
        },

        // UI felépítése
        setupUI() {
            // Gomb hozzáadása a menübe
            const menuRow = document.querySelector('.myio-menuRow.myio-menuRowNav');
            if (!menuRow) return;

            const chatBtnWrapper = document.createElement('div');
            chatBtnWrapper.className = 'myio-ninja-chat-wrapper';

            const chatBtn = document.createElement('button');
            chatBtn.className = 'myio-ninja-chat-btn';
            chatBtn.innerHTML = '<span class="myio-ninja-icon">🥷</span> Ninja';
            chatBtn.title = 'Open Ninja AI Chat';
            chatBtn.id = 'ninja-chat-open-btn';

            chatBtnWrapper.appendChild(chatBtn);
            menuRow.appendChild(chatBtnWrapper);

            // Modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'myio-ninja-chat-overlay';
            overlay.id = 'ninja-chat-overlay';

            // Modal
            const modal = document.createElement('div');
            modal.className = 'myio-ninja-chat-modal';
            modal.id = 'ninja-chat-modal';

            // Header
            const header = document.createElement('div');
            header.className = 'myio-ninja-chat-header';
            header.innerHTML = `
                <div class="myio-ninja-chat-header-title">
                    <span class="myio-ninja-chat-header-icon">🥷</span>
                    Ninja Assistant
                </div>
                <button class="myio-ninja-chat-close" id="ninja-chat-close-btn">✕</button>
            `;

            // Messages area
            const messagesArea = document.createElement('div');
            messagesArea.className = 'myio-ninja-chat-messages';
            messagesArea.id = 'ninja-chat-messages';

            // Welcome message
            const welcome = document.createElement('div');
            welcome.className = 'myio-ninja-chat-welcome';
            welcome.id = 'ninja-chat-welcome';
            welcome.innerHTML = `
                <div class="myio-ninja-chat-welcome-icon">🥷</div>
                <div>
                    <strong>Hi! I'm Ninja</strong><br>
                    Your smart home AI assistant
                </div>
                <div class="myio-ninja-chat-suggestions">
                    <button class="myio-ninja-suggestion-btn" data-msg="What can you help me with?">What can you help me with?</button>
                    <button class="myio-ninja-suggestion-btn" data-msg="How do I optimize energy use?">How do I optimize energy use?</button>
                    <button class="myio-ninja-suggestion-btn" data-msg="Tell me about smart home automation">Tell me about automation</button>
                </div>
            `;
            messagesArea.appendChild(welcome);

            // Input area
            const inputArea = document.createElement('div');
            inputArea.className = 'myio-ninja-chat-input-area';

            const input = document.createElement('textarea');
            input.className = 'myio-ninja-chat-input';
            input.id = 'ninja-chat-input';
            input.placeholder = 'Ask Ninja anything...';
            input.rows = 1;

            const sendBtn = document.createElement('button');
            sendBtn.className = 'myio-ninja-chat-send-btn';
            sendBtn.id = 'ninja-chat-send-btn';
            sendBtn.textContent = 'Send';

            inputArea.appendChild(input);
            inputArea.appendChild(sendBtn);

            // Assembly
            modal.appendChild(header);
            modal.appendChild(messagesArea);
            modal.appendChild(inputArea);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
        },

        // Event listenerek
        attachEventListeners() {
            const openBtn = document.getElementById('ninja-chat-open-btn');
            const closeBtn = document.getElementById('ninja-chat-close-btn');
            const overlay = document.getElementById('ninja-chat-overlay');
            const sendBtn = document.getElementById('ninja-chat-send-btn');
            const input = document.getElementById('ninja-chat-input');

            if (openBtn) openBtn.addEventListener('click', () => this.open());
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (overlay) overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
            if (sendBtn) sendBtn.addEventListener('click', () => this.sendMessage());

            // Enter to send (Shift+Enter for newline)
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        this.sendMessage();
                    }
                });

                // Auto-resize textarea
                input.addEventListener('input', () => {
                    input.style.height = 'auto';
                    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
                });
            }

            // Suggestion buttons
            const suggestions = document.querySelectorAll('.myio-ninja-suggestion-btn');
            suggestions.forEach(btn => {
                btn.addEventListener('click', () => {
                    const msg = btn.getAttribute('data-msg');
                    const inputField = document.getElementById('ninja-chat-input');
                    if (inputField) {
                        inputField.value = msg;
                        inputField.focus();
                    }
                });
            });
        },

        // Chat megnyitása
        open() {
            const overlay = document.getElementById('ninja-chat-overlay');
            if (overlay) {
                overlay.classList.add('is-open');
                this.isOpen = true;
                const input = document.getElementById('ninja-chat-input');
                if (input) setTimeout(() => input.focus(), 100);
            }
        },

        // Chat bezárása
        close() {
            const overlay = document.getElementById('ninja-chat-overlay');
            if (overlay) {
                overlay.classList.remove('is-open');
                this.isOpen = false;
            }
        },

        // Üzenet küldése
        async sendMessage() {
            const input = document.getElementById('ninja-chat-input');
            const message = input.value.trim();

            if (!message || this.isLoading) return;

            // User üzenet megjelenítése
            this.addMessage(message, 'user');
            input.value = '';
            input.style.height = 'auto';
            this.isLoading = true;

            // Typing indicator
            this.addTypingIndicator();

            try {
                const response = await this.callAPI(message);
                this.removeTypingIndicator();
                this.addMessage(response, 'ninja');
                this.conversationHistory.push({ role: 'assistant', content: response });
            } catch (error) {
                this.removeTypingIndicator();
                console.error('API Error:', error);
                this.addMessage(
                    'Sajnálom, hiba történt. Kérlek próbáld meg később. ❌',
                    'ninja'
                );
            }

            this.isLoading = false;
        },

        // API hívás (Anthropic)
        async callAPI(message) {
            this.conversationHistory.push({ role: 'user', content: message });

            // FONTOS: Ez a kód a frontend-en fut, de az API kulcs biztonsága érdekében
            // a VALÓS implementáció során ezt a backend-en keresztül kell végezni!
            // Ez csak demó - szervezz meg egy proxy endpoint-ot!

            try {
                // Backend proxy hívása (javasolt)
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: message,
                        history: this.conversationHistory
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.response;
            } catch (err) {
                console.warn('Backend proxy nem elérhető, alternatív módszert próbálok...');
                // Fallback: ha a backend nem támogatja, ismerje fel az API kulcsot az index.html-ből
                return await this.callClaudeAPI(message);
            }
        },

        // Közvetlen Claude API hívás (DEMO CSAK!)
        async callClaudeAPI(message) {
            // Ez szenzitív! Valós alkalmazásban a backend-en kell csinálni
            if (!this.apiKey) {
                throw new Error('API key not configured');
            }

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    system: this.systemPrompt,
                    messages: this.conversationHistory
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'API request failed');
            }

            const data = await response.json();
            return data.content[0].text;
        },

        // Üzenet hozzáadása az UI-hez
        addMessage(content, sender) {
            const messagesArea = document.getElementById('ninja-chat-messages');
            const welcome = document.getElementById('ninja-chat-welcome');

            // Üdvözlés eltávolítása első üzenetkor
            if (welcome && (this.conversationHistory.length > 0 || sender === 'user')) {
                welcome.remove();
            }

            const msgEl = document.createElement('div');
            msgEl.className = `myio-ninja-message myio-ninja-message-${sender}`;

            const contentEl = document.createElement('div');
            contentEl.className = 'myio-ninja-message-content';

            // Markdown-szerű formázás
            const formattedContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');

            contentEl.innerHTML = formattedContent;
            msgEl.appendChild(contentEl);
            messagesArea.appendChild(msgEl);

            // Auto-scroll
            messagesArea.scrollTop = messagesArea.scrollHeight;
        },

        // Typing indikátor
        addTypingIndicator() {
            const messagesArea = document.getElementById('ninja-chat-messages');
            const typingEl = document.createElement('div');
            typingEl.className = 'myio-ninja-message myio-ninja-message-ninja';
            typingEl.id = 'ninja-typing-indicator';
            typingEl.innerHTML = `
                <div class="myio-ninja-message-content">
                    <div class="myio-ninja-message-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
            messagesArea.appendChild(typingEl);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        },

        // Typing indikátor eltávolítása
        removeTypingIndicator() {
            const typing = document.getElementById('ninja-typing-indicator');
            if (typing) typing.remove();
        }
    };

    // Inicializáció
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => NinjaChatBot.init());
    } else {
        NinjaChatBot.init();
    }

    // Global export (opcionális)
    window.NinjaChatBot = NinjaChatBot;
})();
