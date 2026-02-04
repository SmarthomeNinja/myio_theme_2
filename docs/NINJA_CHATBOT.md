# 🥷 Ninja AI Chatbot - MyIO Dashboard Integration

## Leírás

A **Ninja** egy mesterséges intelligencia alapú chatbot asszisztens, amely integrálva van a MyIO okosotthon dashboardba. Az Anthropic Claude AI-t használja valósidejű, intelligens segítségnyújtáshoz az okosotthon vezérlésével és optimalizálásával kapcsolatban.

## Főbb Jellemzők

✨ **Intelligens Asszisztens**
- Claude AI hajtja meg
- Okosotthon-specifikus tudásbázis
- Естественetes nyelvkezelés

🎨 **Modern UI/UX**
- Modal chat ablak
- Glassmorphism stílus
- Sötét téma a dashboardhoz illeszkedően
- Mobilbarát design
- Animációk és átmenetek

💬 **Felhasználó-barát**
- Üdvözlő üzenet javaslatokkal
- Tipográfiai indikátor
- Üzenet előzmények
- Shift+Enter új sor, Enter küldés

🔐 **Biztonság**
- API kulcs backend-en kezelve
- Nincs szenzitív adat tárolása a frontend-en

## Telepítés

### 1. Fájlok hozzáadása

A `js/3.5/` mappába szükséges:
- `ninja-ai-chat.js` - A chatbot modul (már feltöltve)
- `nav.js` - Módosítva a chatbot betöltésével (már frissítve)

### 2. Backend Setup

Az Anthropic API kulcs kezeléséhez szükséges egy backend endpoint:

```javascript
// Backend (Node.js / Express) - JAVASOLT
app.post('/api/chat', authenticateUser, async (req, res) => {
  const { message, history } = req.body;
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: history
      })
    });

    const data = await response.json();
    res.json({ response: data.content[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Anthropic API Kulcs

1. Regisztrálj az [Anthropic konzolon](https://console.anthropic.com)
2. Hozz létre egy API kulcsot
3. Tárold a `.env` fájlban: `ANTHROPIC_API_KEY=sk_ant_...`

## Használat

### Felhasználó Perspektíva

1. **Chatbot Megnyitása**: Kattints a "🥷 Ninja" gombra a fejléc menüjében
2. **Üzenet Küldése**:
   - Írj be egy kérdést/parancsot
   - Nyomj Enter-t vagy kattints a "Send" gombra
   - Shift+Enter új sor hozzáadásához
3. **Javaslatok**: Az első üzenet elött kattints az ajánlott témákra

### Tipikus Felhasználási Esetek

**Okosotthon-vezérlés:**
> "Hogyan tudom az energia felhasználásomat csökkenteni?"
> "Mit csinálhatsz velem a termosztáttal?"
> "Milyen eszközöm van egy szobában?"

**Tanácsadás:**
> "Best practices az okosotthon automatizáláshoz"
> "Hogyan működik az okosotthon biztonsági?"
> "Mely eszközöket érdemes hozzáadni?"

## Testreszabás

### Stílus Módosítása

A `ninja-ai-chat.js` fájl elején módosítható a szín séma:

```javascript
--ninja-primary: #00d4ff;        // Fő szín
--ninja-bg: rgba(15, 23, 42, 0.98);  // Háttér
--ninja-border: rgba(0, 212, 255, 0.2);  // Szegély
--ninja-text: #e2e8f0;           // Szöveg szín
```

### Rendszer Prompt Testreszabása

A `ninja-ai-chat.js`-ben a `systemPrompt` módosítható:

```javascript
systemPrompt: `You are Ninja, your smart home AI assistant...`
```

### Üzenet Javaslatok

Módosítsd a welcome szakaszt:

```javascript
<button class="myio-ninja-suggestion-btn" data-msg="Your custom suggestion">
  Button Text
</button>
```

## Fejlett Beállítások

### Konverzáció Előzménye

A chatbot megtartja az aktuális munkamenet teljes előzményét. Az oldal újratöltésekor az előzmény törlődik.

Kiterjesztéshez (opcionális):
```javascript
// localStorage-ben tárold az előzményeket
localStorage.setItem('ninjaHistory', JSON.stringify(this.conversationHistory));
```

### API Model Frissítés

Az Anthropic új modelljei támogatottá tehetők:

```javascript
model: 'claude-opus-4-1-20250805', // vagy más verzió
```

## Hibaelhárítás

### Chat Nem Jelenik Meg

1. ✅ Ellenőrizd, hogy `ninja-ai-chat.js` betöltött-e (DevTools → Network)
2. ✅ Böngésző konzolt ellenőrizd hibákra
3. ✅ Tiltott-e az ad-block kiterjesztés?

### API Hiba

```
Error: "API key not configured"
```
- Backend proxy nincs beállítva
- Fallback módban működik (dev csak)
- Kérd meg a szervergazdát

```
HTTP 401: Unauthorized
```
- Hibás API kulcs
- Token lejárt

```
HTTP 429: Rate Limited
```
- Túl sok kérés
- Várj egy percet

## Biztonság & Adatvédelem

⚠️ **FONTOS:**
- **Soha** ne tárold az API kulcsot a frontend-en!
- Mindig proxy-zd a backend-en
- User autentikáció követelménye a `/api/chat` endpoint-hoz
- Loggold a chatbot interakciókat az audit céljára
- Rate limit beállítása szükséges

## Technikai Részletek

### Fájlstruktúra

```
js/3.5/
├── nav.js                 (módosítva: chatbot loader hozzáadva)
└── ninja-ai-chat.js       (új: chatbot modul)
```

### API Hívások

**Javasolt** (backend proxy):
```
Frontend → Backend (/api/chat) → Anthropic API
```

**Demo** (közvetlen, nem biztonságos):
```
Frontend → Anthropic API (csak dev)
```

### Státusz Kódok

| Kód | Jelentés |
|-----|----------|
| 200 | Sikeres üzenet |
| 401 | Authentikáció szükséges |
| 429 | Rate limit |
| 500 | Server hiba |

## Roadmap

🔄 **Jövőbeli Fejlesztések**
- [ ] Históriapersistencia (localStorage/DB)
- [ ] Szöveg-ből-beszéd (TTS)
- [ ] Beszédből-szöveg (STT)
- [ ] Akciókra vonatkozó parancsok (pl. lámpa ki)
- [ ] Többnyelvi támogatás
- [ ] ChatGPT alternatíva
- [ ] Testreszabott tudásbázis

## Support & Hibajelentés

Issues: https://github.com/SmarthomeNinja/myio_theme_2/issues

## Verzió

| Verzió | Dátum | Leírás |
|--------|-------|--------|
| 1.0.0 | 2026-02-04 | Kezdeti release |

---

**Készítette:** SmarthomeNinja  
**Licence:** MIT  
**AI Motor:** Anthropic Claude 3.5 Sonnet
