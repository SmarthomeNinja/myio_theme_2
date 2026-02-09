# MyIO - Okos Otthon Vezérlő

## Projekt célja
- **MyIO server** - okos otthon vezérlő böngésző felületen keresztül
- A szerver kiszolgálja a HTML file-t, a szükséges változókat kitölti frissítéskor
- Minta HTML: [/html_sample.html](html_sample.html)
- A HTML verziótól függően eldönti: `/js/2.5` vagy `/js/3.5` könyvtárból töltődnek a file-ok

## Fejlesztési fókusz
⚠️ **FONTOS: Csak a `/js/3.5` könyvtárban dolgozz!**
- Jelenleg a **főoldalt** fejlesztjük
- A `/setup` és `/chart` oldalakat **hagyd figyelmen kívül**

## Fő komponensek

### [nav.js](js/3.5/nav.js) - Header & Navigáció
- Fejléc (header) kezelése
- **Menü funkciók:**
  - Booster (toggle + host input)
  - Auto Refresh (toggle + interval beállítás, AJAX frissítés)
  - Language (select)
  - Zoom (50-150%, CSS változó: `--myio-zoom`)
  - Logout
- **Navigációs gombok:** (ezeket HAGYD FIGYELMEN KÍVÜL)
  - Chart gomb → `/chart`
  - Settings gomb → `/setup`

### [index.js](js/3.5/index.js) - Főmodul (Dashboard)
- Az okos otthonban beállított eszközök megjelenítése kártyákban
- Kártyák szekciókba rendezve
- **Drag & Drop:** szekciók és kártyák áthelyezhetők
- **Modal-ok:**
  - Kártyák elnevezésére push-event → beállítások modal (módosítások localStorage-ba)
  - Szenzor kártyák → chart modal
- **Dinamikus modul betöltő:** automatikusan betölti a szükséges modulokat

### Dinamikusan betöltött modulok
```javascript
[
  'utils.js',          // Utility függvények
  'storage.js',        // LocalStorage kezelés
  'sections.js',       // Szekciók létrehozása
  'cards.js',          // Kártyák létrehozása
  'renderers.js',      // Eszközök renderelése
  'thermo.js',         // Thermostat kezelés
  'reorder.js',        // Drag & Drop funkció
  'settings-modal.js', // Beállítások modal
  'renderer-chart.js', // Chart renderelés
  'renderer-helper.js' // Helper funkciók
]
```

## Auto Refresh funkció
- Bekapcsolt állapotban megadott időközönként frissíti a változók adatait
- **AJAX alapú:** NEM tölti újra az oldalt!
- Letölti a `/sens_out.json` file-t → minta: [/sens_out.json](sens_out.json)
- `MyIOLive.fetchSensOut()` → `MyIOLive.updateUI(data)`
- Fallback: `sendForm()` (régi működés)

## Használt technológiák
- **Vanilla JavaScript (ES6+)**
- **Moduláris rendszer:** dinamikus script betöltés
- **LocalStorage:** beállítások tárolása (zoom, auto refresh, kártyák/szekciók sorrendje)
- **Cookie:** Language, Booster
- **AJAX:** Fetch API (`/sens_out.json` lekérdezés)
- **CSS változók:** `--myio-zoom`, `--header-h`

## Kódolási konvenciók
- ✅ Magyar kommentek használata
- ✅ `camelCase` változónevek
- ✅ Namespace használat: `myioUtils`, `myioSections`, `myioCards`, `myioRenderers`, stb.
- ✅ Global változók: `host`, `str_*`, `language`, `langJSON`, stb.
- ❌ NE használj emoji-kat a kódban (csak a UI-ban, ahol szükséges)

## Fejlesztési környezet
- **URL:** `myio.local` (lokális szerver)
- **Developer Tools:** `Disable cache` pipálva!
- **Tesztelés:** Nyisd meg a böngészőt developer tools-szal

## Fontos szabályok
1. **MINDIG** a `/js/3.5` könyvtárban dolgozz
2. **NE módosítsd** a `/setup` és `/chart` oldalakat
3. **Tesztelj** minden változtatást a böngészőben (disable cache!) mindeig innen nyisd meg az oldalt: `http://myio.local/`
4. **Használj** magyar kommenteket a kódban
