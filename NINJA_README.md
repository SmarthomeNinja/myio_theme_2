# 🥷 Ninja AI Chatbot - MyIO Integration

## Áttekintés

A Ninja AI egy Anthropic Claude alapú chatbot, amely integrálva van a MyIO smart home rendszerbe. Segít az eszközök kezelésében, kérdések megválaszolásában és információk lekérdezésében.

## Funkciók

- 🤖 **Claude Sonnet 4.5** powered AI asszisztens
- 🏠 **Smart Home kontextus**: Automatikusan ismeri az eszközök állapotát
- 💬 **Magyar nyelvű** kommunikáció
- 📱 **Reszponzív design**: Mobil és desktop támogatás
- 🎨 **MyIO stílussal** integrált modern UI
- 💾 **Beszélgetés előzmények** (max 20 üzenet)
- ⚡ **Javasolt kérdések** a gyors induláshoz

## Telepítés

### 1. Fájlok

A következő fájl került hozzáadásra a repository-hoz:
- `js/3.5/ninja-ai-chat.js` - Teljes chatbot implementáció

### 2. Integráció

A `nav.js` fájl végén automatikusan betöltődik:

```javascript
// Ninja AI Chatbot betöltése
if (typeof host !== 'undefined') {
    document.write('<script src="'+host+'ninja-ai-chat.js"/><\\/script>');
}
```

### 3. API Kulcs Beállítása

Az Anthropic API kulcsot két módon lehet beállítani:

#### Opció A: Böngészőben (Recommended)

1. Nyisd meg a `ninja-test.html` fájlt böngészőben
2. Add meg az API kulcsot
3. Kattints a "Kulcs Mentése" gombra
4. Az API kulcs a `localStorage`-ban lesz tárolva

#### Opció B: Közvetlenül a Chatban

1. Nyisd meg a MyIO dashboard-ot
2. Kattints a Ninja ikonra
3. Add meg az API kulcsot a megjelenő mezőben
4. Kattints a "Mentés" gombra

## Használat

### Ninja Megnyitása

1. Keresd a **Ninja ikont** (🥷) a header jobb oldalán
2. Kattints rá a modal ablak megnyitásához

### Üzenet Küldése

- Írj a szövegmezőbe
- **Enter**: üzenet küldése
- **Shift+Enter**: új sor
- Vagy használd a javasolt kérdéseket

### Javasolt Kérdések

- 🏠 Milyen eszközeim vannak?
- 💡 Hogyan állíthatom be a világítást?
- 📊 Mutasd az energiafogyasztást
- 🌡️ Mi a jelenlegi hőmérséklet?

## Technikai Részletek

### API Konfiguráció

```javascript
const NINJA_CONFIG = {
    modelName: 'claude-sonnet-4-5-20250929',
    maxTokens: 4096,
    systemPrompt: 'Te a Ninja vagy, egy okos otthon asszisztens...'
};
```

### Smart Home Kontextus

A chatbot automatikusan lekéri a következő információkat:

- **Relays**: Kapcsolók állapota (be/ki)
- **PWM devices**: Fényerő értékek
- **Sensors**: Szenzor adatok (hőmérséklet, páratartalom)

### Példa Kontextus

```javascript
{
  relays: [
    { id: 1, name: "Nappali levegő", state: "be" },
    { id: 3, name: "P.Törölköző szárító", state: "ki" }
  ],
  pwm: [
    { id: 1, name: "nap fent", value: 11000 }
  ],
  sensors: [
    { id: 0, name: "Talaj szonda", value: 45 }
  ]
}
```

## Stílus

A Ninja UI a MyIO `styleBlue.css` designt követi:

- 🎨 **Színpaletta**: 
  - Elsődleges: `#0397d6`
  - Másodlagos: `#43E7F6`
  - Háttér: `#1e3a5f`
- 💎 **Glassmorphism** effektek
- 🌙 **Dark theme**
- ✨ **Smooth animációk**

## Biztonság

- 🔐 API kulcs `localStorage`-ban tárolva (csak a böngészőben)
- 🚫 Nem kerül szerverre
- 🔒 HTTPS kommunikáció az Anthropic API-val
- 🛡️ Client-side titkosítás

## Hibaelhárítás

### Ninja ikon nem jelenik meg

1. **Hard refresh**: `Ctrl+Shift+R` (Windows/Linux) vagy `Cmd+Shift+R` (Mac)
2. **Cache törlése**: Böngésző beállítások → Adatok törlése
3. **Konzol ellenőrzés**: `F12` → Console
   - Keresd: `🥷 Ninja AI Chat initialized`

### API Hiba

- ✅ Ellenőrizd az API kulcs formátumát: `sk-ant-api03-...`
- ✅ Győződj meg róla, hogy érvényes a kulcs
- ✅ Ellenőrizd a hálózati kapcsolatot
- ✅ Konzol ellenőrzése hibákért

### Üzenet nem küldődik

- ✅ API kulcs be van állítva?
- ✅ Hálózati kapcsolat működik?
- ✅ Nincs böngésző konzolban hiba?

## API Költségek

- **Claude Sonnet 4.5**
  - Input: ~$3 / 1M tokens
  - Output: ~$15 / 1M tokens
- Átlagos üzenet: ~200-500 tokens
- Beszélgetés előzmény: max 20 üzenet (4000-8000 tokens)

💡 **Tipp**: A költségek minimalizálásához töröld az előzményeket időnként.

## Jövőbeli Fejlesztések

- [ ] Eszköz vezérlés a chatből
- [ ] Hangvezérlés támogatás
- [ ] Előzmények exportálása
- [ ] Többnyelvű támogatás
- [ ] Custom system prompts
- [ ] Automata riasztások és értesítések

## Kapcsolat

- **Repository**: SmarthomeNinja/myio_theme_2
- **Path**: `/js/3.5/ninja-ai-chat.js`

---

Made with ❤️ for MyIO Smart Home
