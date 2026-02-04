# 🥷 Ninja AI Chatbot Integration - MyIO Theme 2

## 🎯 Rövid Leírás

A **Ninja** egy mesterséges intelligencia alapú chatbot asszisztens, amely integrálva van a MyIO okosotthon dashboardba. Az Anthropic Claude 3.5 Sonnet AI-t használja valósidejű, intelligens segítségnyújtáshoz az okosotthon vezérlésével és optimalizálásával kapcsolatban.

### Fő Jellemzők

✨ **Intelligencia** - Claude AI powered  
🎨 **Modern Design** - Glassmorphism, sötét téma  
💬 **Felhasználóbarát** - Modal chat felület  
🔐 **Biztonságos** - Backend API proxy  
📱 **Mobilbarát** - Responsív design  
⚡ **Gyors** - Valósidejű válaszok  

---

## 📦 Mi Változott?

### Új Fájlok
- ✅ `js/3.5/ninja-ai-chat.js` - Chatbot modul (540+ sorok)

### Módosított Fájlok
- ✅ `js/3.5/nav.js` - Chatbot betöltő hozzáadva

### Dokumentáció
- 📖 `docs/NINJA_CHATBOT.md` - Teljes dokumentáció
- 🚀 `docs/NINJA_QUICK_START.md` - Telepítési útmutató
- 💻 `docs/NINJA_BACKEND_PROXY.js` - Backend implementáció

---

## 🚀 Gyors Indítás

### 1. Szükségletek

- Git repository szinkronizálás
- Anthropic API kulcs (ingyenes: https://console.anthropic.com)
- Node.js 18+ (backend proxy-hoz)

### 2. Telepítés (3 perc)

```bash
# 1. Repository frissítés
git pull origin main

# 2. Backend proxy létrehozása
npm install express axios dotenv express-rate-limit

# 3. .env fájl
echo "ANTHROPIC_API_KEY=sk_ant_YOUR_KEY_HERE" >> .env

# 4. Szerver indítása
node server.js

# 5. Böngészőben megnyitás
open http://myio.local
```

Lásd: **`docs/NINJA_QUICK_START.md`** részletekhez

### 3. Az Interfész

```
Header (Fejléc)
├── Update (Frissítés gomb)
├── Logo
├── Title (Cím)
└── Menu (MENÜ) ← Ninja gomb itt!
    ├── Chart
    ├── Settings
    ├── Booster
    └── 🥷 Ninja ← ÚJ!
```

Kattints a **"🥷 Ninja"** gombra a chat megnyitásához!

---

## 💬 Használati Példák

### Okosotthon Vezérlés
```
"Hogyan tudom az energiafogyasztásomat csökkenteni?"
"Mit csinálhatsz a termosztáttal?"
"Mely eszközöm van a nappaliban?"
```

### Tanácsadás
```
"Best practices az okosotthon automatizáláshoz"
"Hogyan működik az okosotthon biztonsági?"
"Melyik új eszközöket ajánlasz hozzáadni?"
```

### Általános Segítség
```
"Szia Ninja!"
"Miben segíthetsz?"
"Mi az a ChatGPT?"
```

---

## 🛠️ Testreszabás

### Szín Módosítása

`js/3.5/ninja-ai-chat.js` - ~17. sor:

```javascript
--ninja-primary: #00d4ff;           // ← Fő szín
--ninja-bg: rgba(15, 23, 42, 0.98); // ← Háttér
--ninja-text: #e2e8f0;              // ← Szöveg
```

### Rendszer Prompt Módosítása

`ninja-ai-chat.js` - `systemPrompt` tulajdonság:

```javascript
systemPrompt: `You are Ninja, a custom AI assistant...`
```

### Üdvözlő Üzenet

`setupUI()` metódus - `welcome` div:

```html
<strong>Halló! A Ninja vagyok</strong><br>
Az okosotthonod AI asszisztense
```

Lásd: **`docs/NINJA_CHATBOT.md`** teljes testreszabási útmutatóhoz

---

## 🔐 Biztonsági Megjegyzések

### ⚠️ FONTOS

**Az API kulcs SOHA nem mehet a frontend-be!**

```javascript
// ❌ ROSSZ
const API_KEY = "sk_ant_..."; // SOHA ne csináld ezt!

// ✅ HELYES
// Backend proxy-n keresztül kezelj minden API hívást
fetch('/api/chat', { method: 'POST', ... })
```

### Javasolt Backend Stack

```
Client (Browser)
    ↓
Backend Proxy (/api/chat) ← Itt van az API kulcs
    ↓
Anthropic API
```

Lásd: **`docs/NINJA_BACKEND_PROXY.js`** backend implementációhoz

---

## 📊 Technikai Details

### Architektúra

```
┌─────────────────────────────────────┐
│       MyIO Dashboard (Frontend)      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Ninja Chatbot Module       │  │
│  │   ninja-ai-chat.js           │  │
│  │                              │  │
│  │  - Modal UI                  │  │
│  │  - Message History           │  │
│  │  - Event Handlers            │  │
│  └──────────┬───────────────────┘  │
└─────────────┼──────────────────────┘
              │
              │ fetch('/api/chat')
              │
        ┌─────▼────────────────┐
        │  Backend Proxy       │
        │  /api/chat endpoint  │
        │                      │
        │ - Auth validation    │
        │ - Rate limiting      │
        │ - API key handling   │
        └─────┬────────────────┘
              │
              │ HTTPS
              │
        ┌─────▼────────────────┐
        │   Anthropic API      │
        │   Claude 3.5 Sonnet  │
        │                      │
        │ - Message handling   │
        │ - AI processing      │
        └──────────────────────┘
```

### Komponensek

| Fájl | Méret | Funkció |
|------|-------|---------|
| `ninja-ai-chat.js` | 16 KB | Chatbot UI & logika |
| `nav.js` | 24 KB | Navigáció + chatbot loader |
| Backend proxy | ~5 KB | API proxy (szervezettől függően) |

### API Limitek

| Métrika | Limit |
|---------|-------|
| Üzenet hossz | 5000 karakter |
| Előzmények | 50 üzenet |
| Rate limit | 30 req/15 min (default) |
| Válasz hossz | 1024 token |

---

## 🐛 Hibaelhárítás

### "Ninja gomb nem jelenik meg"

```bash
# 1. Ellenőrizd a fájlt
ls -la js/3.5/ninja-ai-chat.js

# 2. Hard refresh
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)

# 3. Console log
# F12 → Console
console.log(typeof NinjaChatBot); // 'object' kell legyen
```

### "Chat nem működik - API hiba"

```javascript
// Backend proxy hiányzik
// Lásd: docs/NINJA_QUICK_START.md #2. lépés
```

### "Rate Limited - 429 Error"

```
Túl sok kérés rövid idő alatt
- Várj 1 percet
- Módosítsd a rate limit-et a backend-ben
```

Teljes hibaelhárítás: **`docs/NINJA_CHATBOT.md`**

---

## 📈 Fejlesztési Roadmap

- [x] Basic chat interface
- [x] Claude AI integration
- [x] Modal UI
- [x] Message history
- [x] Loading states
- [ ] Persistent history (localStorage/DB)
- [ ] Voice input (STT)
- [ ] Voice output (TTS)
- [ ] Smart home actions (kontrollált parancsok)
- [ ] Multi-language support
- [ ] Custom knowledge base
- [ ] Integration with smart home devices

---

## 📚 Dokumentáció

| Dokumentum | Leírás |
|------------|--------|
| `docs/NINJA_CHATBOT.md` | Teljes dokumentáció |
| `docs/NINJA_QUICK_START.md` | Telepítési útmutató |
| `docs/NINJA_BACKEND_PROXY.js` | Backend kódpéldák |

---

## 🤝 Contributing

Javaslatok, bug-ek, pull requestek? Nyiss egy GitHub issue-t!

https://github.com/SmarthomeNinja/myio_theme_2/issues

---

## 📄 Licence

MIT License - Lásd LICENSE fájl

---

## 🙏 Köszönetnyilvánítás

- **Anthropic** - Claude AI platform
- **MyIO Community** - Okosotthon project support
- **Contributors** - Javaslatokért és tesztelésért

---

## 📞 Support

**Gyors Kérdések:**
1. Ellenőrizd a `docs/NINJA_CHATBOT.md` leírásit
2. Látogass el a hibaelhárítási szekcióra
3. GitHub issue

**Fejlett Beállítások:**
Lásd `docs/NINJA_BACKEND_PROXY.js` backend implementációhoz

---

## 🎉 Ready to Chat!

```
┌─────────────────────────────┐
│   🥷 Ninja is Ready! 🥷     │
│                             │
│  Your AI Smart Home         │
│  Assistant is Online        │
│                             │
│  Click the Ninja button      │
│  in the header to start!    │
└─────────────────────────────┘
```

Sok sikert az okosotthon kontrolláshoz! 🚀

---

**Verzió:** 1.0.0  
**Utolsó Frissítés:** 2026-02-04  
**Készítette:** SmarthomeNinja Team
