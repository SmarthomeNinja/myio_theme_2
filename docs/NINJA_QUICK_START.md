# 🥷 Ninja Chatbot - Gyors Telepítési Útmutató

## ✅ Telepítés Státusza

| Komponens | Státusz | Hely |
|-----------|--------|------|
| `ninja-ai-chat.js` | ✅ Feltöltve | `js/3.5/ninja-ai-chat.js` |
| `nav.js` módosítás | ✅ Frissítve | `js/3.5/nav.js` |
| Dokumentáció | ✅ Feltöltve | `docs/NINJA_CHATBOT.md` |
| Backend Example | ✅ Feltöltve | `docs/NINJA_BACKEND_PROXY.js` |

---

## 📋 1. lépés: GitHub Szinkronizálás

```bash
cd /path/to/myio_theme_2
git pull origin main
```

A következő fájloknak meg kell jelennie:
- ✅ `js/3.5/ninja-ai-chat.js` (új)
- ✅ `js/3.5/nav.js` (módosítva)

---

## ⚙️ 2. lépés: Backend Proxy Beállítása

### A. Node.js / Express (JAVASOLT)

1. **Függőségek telepítése:**
```bash
npm install express axios dotenv express-rate-limit helmet
```

2. **`server.js` létrehozása** (lásd `docs/NINJA_BACKEND_PROXY.js`)
```javascript
// Másold a NINJA_BACKEND_PROXY.js fájl Node.js részét
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/chat', async (req, res) => {
  // ... (lásd teljes kód)
});

app.listen(3000);
```

3. **`.env` fájl:**
```
ANTHROPIC_API_KEY=sk_ant_xxxxxxxxxxxxxxxxxxxxx
PORT=3000
NODE_ENV=production
```

4. **Indítás:**
```bash
npm start
# vagy
node server.js
```

### B. Python / Flask

1. **Függőségek:**
```bash
pip install flask flask-limiter requests python-dotenv pyjwt
```

2. **`app.py` létrehozása** (lásd `docs/NINJA_BACKEND_PROXY.js`)

3. **Indítás:**
```bash
python app.py
```

---

## 🔑 3. lépés: Anthropic API Kulcs

1. **Regisztráció:**
   - Látogass el: https://console.anthropic.com
   - Hozz létre API kulcsot

2. **Biztonsági tárhelyezés:**
   ```bash
   # .env fájl (SOHA ne commiteld!)
   echo "ANTHROPIC_API_KEY=sk_ant_..." >> .env
   echo ".env" >> .gitignore
   ```

3. **Validálás:**
   ```bash
   curl -X POST https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "content-type: application/json" \
     -d '{
       "model": "claude-3-5-sonnet-20241022",
       "max_tokens": 1024,
       "messages": [{"role": "user", "content": "Hi"}]
     }'
   ```

---

## 🚀 4. lépés: MyIO Szerver Tesztelése

1. **Nyiss meg egy böngészőt:**
   ```
   http://myio.local
   ```

2. **Keresd meg a "🥷 Ninja" gombot:**
   - A fejléc menüjében, a "Menu" gomb mellett
   - Kell, hogy világított, kiemelt megjelenésű legyen

3. **Nyisd meg a chatot:**
   - Kattints a gombon
   - Egy modal ablak jelenik meg

4. **Küldj egy üzenetet:**
   - "Hello Ninja!"
   - Várd meg a válaszról

---

## 🔍 5. lépés: Hibaelhárítás

### A. Ninja gomb nem jelenik meg

**OK:** `ninja-ai-chat.js` nem töltődött be

```javascript
// Böngészőben nyisd meg a Console-t (F12)
// Keresd a hibákat, pl:
console.log('Ninja loaded:', typeof NinjaChatBot);
```

**Megoldás:**
```bash
# Ellenőrizd, hogy a fájl létezik-e
ls -la js/3.5/ninja-ai-chat.js

# Frissítsd a böngészőt (Hard refresh: Ctrl+Shift+R)
```

### B. Chat megnyílik, de nem működik

**Hiba:** `API key not configured`

```javascript
// A backend proxy nincs beállítva
// Dev módban fallback-et használ (nem biztonságos)
```

**Megoldás:**
1. Állítsd be a backend proxy-t (2. lépés)
2. Próbáld újra az oldalt

### C. "API Error: 401"

```
Error: 401 Unauthorized
```

**Oka:** 
- Hibás API kulcs
- Lejárt token

**Megoldás:**
1. Ellenőrizd a `.env` fájlt
2. Generálj új API kulcsot az Anthropic konzolon

### D. "Rate Limited"

```
Error: 429 Too Many Requests
```

**Oka:** 
- Túl sok kérés rövid idő alatt
- API limit elérve

**Megoldás:**
- Várj 1 percet
- Módosítsd az API rate limit-et az Anthropic konzolon

---

## 📊 6. lépés: Produkció Deployment

### Docker (Ajánlott)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build & Run
docker build -t ninja-proxy .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk_ant_... ninja-proxy
```

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name myio.local;

    location /api/chat {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # CORS
        add_header 'Access-Control-Allow-Origin' 'https://myio.local';
        add_header 'Access-Control-Allow-Methods' 'POST, OPTIONS';
    }
}
```

---

## 🎨 7. lépés: Testreszabás (Opcionális)

### A. Szín Séma

`js/3.5/ninja-ai-chat.js` - szöveg keresés: `--ninja-primary`

```css
--ninja-primary: #00ff00;  /* Zöld helyett */
--ninja-bg: rgba(10, 10, 10, 0.98);  /* Sötétebb */
```

### B. Üdvözlő Üzenet

`NinjaChatBot.setupUI()` - módosítsd a `welcome` szakaszt:

```html
<div>
    <strong>Halló! A Ninja vagyok</strong><br>
    Az okosotthonod AI asszisztense
</div>
```

### C. Rendszer Prompt

`ninja-ai-chat.js` - `systemPrompt`:

```javascript
systemPrompt: `You are your custom AI assistant...`
```

---

## ✅ Teljes Ellenőrzőlista

- [ ] Git pull (friss fájlok)
- [ ] Backend proxy telepítve (Node.js/Python/stb)
- [ ] `.env` fájl az API kulccsal
- [ ] Backend szerver fut (`localhost:3000` vagy `localhost:5000`)
- [ ] MyIO oldal megnyitva
- [ ] "🥷 Ninja" gomb látható a fejlécben
- [ ] Chat megnyílik modal ablakban
- [ ] Üzeneteket tudsz küldeni
- [ ] AI válaszokat tudsz fogadni
- [ ] Gyors ujra-betöltés után az üzmények eltűnnek (normális)

---

## 📞 Support

**Problémák?**
1. Ellenőrizd a DevTools (F12) konzolt
2. Lásd a `docs/NINJA_CHATBOT.md` hibaelhárítást
3. Nyiss GitHub issue: https://github.com/SmarthomeNinja/myio_theme_2/issues

**Javasolt Stack:**
- Frontend: MyIO Dashboard (Chrome/Firefox/Safari)
- Backend: Node.js 18+ + Express
- AI: Anthropic Claude 3.5 Sonnet
- API: HTTPS-en keresztül

---

## 🎓 Bemutató Parancsok

Az alábbi üzenetek jó kezdési pontok:

```
"Szia Ninja!"
"Hogyan tudom az energiafogyasztásomat csökkenteni?"
"Mi az okosotthon automatizálás?"
"Melyik eszközöket javasol hozzáadni?"
"Hogyan működik a termosztát vezérlés?"
```

---

**Gratulálunk! A Ninja chatbot telepítve van! 🎉**

Sokkal szórakoztatóbb a dashboarded a mesterséges intelligenciával! 🚀
