# MyIO Dashboard - Felhasználói Kézikönyv

## Tartalomjegyzék
1. [Bevezetés](#bevezetés)
2. [Navigáció & Header (nav.js)](#navigáció--header-navjs)
3. [Dashboard & Kártyák (index.js)](#dashboard--kártyák-indexjs)
4. [Gyakorlati Útmutatók](#gyakorlati-útmutatók)
5. [Hibaelhárítás](#hibaelhárítás)

---

## Bevezetés

A **MyIO Dashboard** egy okos otthon vezérlőrendszer böngészőalkalmazása. Két fő modul kezeli a felhasználói felületet:

- **`nav.js`** – Header és menüfunkciók
- **`index.js`** – Dashboard tartalma (kártyák, szekciók, eszközök)

---

## Navigáció & Header (nav.js)

A header felső sáv tartalmazza az összes főbb vezérlést és beállítást.

### 1. Frissítés Gomb (Update Button)
**Ikon:** ↻
**Helye:** Header bal oldal
**Funkció:** Az oldal azonnali frissítésére kattints a gombra.

```
📍 Használat:
  • Kattints a ↻ gombra
  • Az oldal újra betölti az adatokat a szerverről
  • Beállítások és a felhasználó-szerializációs státusza megmarad
```

### 2. Home Gomb
**Ikon:** 🏠
**Helye:** Header bal oldal (csak más oldalakon jelenik meg)
**Funkció:** Vissza a főoldalra navigál.

```
📍 Használat:
  • Kattints a 🏠 gombra
  • Rögtön a dashboard főoldalára kerülsz
```

### 3. Menu Gomb
**Ikon:** ≡ (hamburger menü)
**Helye:** Header jobb oldal
**Funkció:** Megnyitja az összes beállítást tartalmazó panelt.

```
📍 Használat:
  • Kattints a ≡ gombra a menü megnyitásához
  • Kattints ismét a bezáráshoz
  • ESC billentyűvel is bezárhatod
  • A menü automatikusan bezáródik, ha kívülre kattintasz
```

---

### Menu Lehetőségek

#### **a) Booster**
**Cél:** Szerver elérhetőség konfigurálása (fejlesztői / haladó felhasználók)

```
🔧 Beállítás:
  1. Kattints a "Booster" gombra a menüben
  2. Engedélyezd a "Booster" toggle-t (ki/be)
  3. Add meg a Host URL-t az input mezőben
     Pl: http://192.168.1.100/
  4. A beállítás automatikusan cookie-ban mentődik

💡 Tipp:
  • Alapvetően a `host` globális változó használódik
  • Booster: alternatív szerverrészről lehet betölteni az adatokat
  • Tipikusan csak fejlesztéshez kell
```

#### **b) Auto Refresh**
**Cél:** Automatikus adatfrissítés időközönkénti AJAX-hívásokkal

```
✨ Funkciók:
  • Bekapcsolás/Kikapcsolás toggle
  • Intervallum beállítása (5-600 másodperc)

🎛️ Intervallum beállítása:
  → Csúszka (Slider): 0-100 skála
    • 0-50: Lineáris 5-60 másodperc
    • 50-100: Logaritmikus 60-600 másodperc
  → Közvetlen bevitel: Szövegmezőbe másodpercat írasz (pl: 30)

📊 Megjelenítés:
  • Rövidítve: "30s" (másodperc) vagy "5m" (perc)

🔄 Működés:
  • AJAX-alapú → NEM tölti újra az oldalt
  • Letölti a `/sens_out.json` fájlt
  • Frissíti az UI-t az új adatokkal
  • Fallback: Ha MyIOLive nem elérhető, az `sendForm()` használódik

💾 Tárolás:
  • localStorage-ban mentődik: `myio.autoRefresh.enabled` és `myio.autoRefresh.interval`
  • Az oldal újratöltése után megmarad a beállítás
```

#### **c) Language (Nyelv)**
**Cél:** Az alkalmazás nyelvének váltása

```
🗣️ Használat:
  1. Válassz egy nyelvet a legördülő menüből
  2. Az oldal automatikusan újra betöltödik az új nyelvvel
  3. A választás cookie-ban mentődik

📝 Támogatott nyelvek:
  • Magyar
  • Angol
  • Egyéb (szerver konfigurációtól függően)
```

#### **d) Zoom**
**Cél:** Az egész felület méretezése (50-150%)

```
🔍 Használat:
  • Húzd a csúszkát balra (kicsinyít) vagy jobbra (nagyít)
  • Valós idejű megjelenítés: 50%, 100%, 150%
  • CSS változó: `--myio-zoom` alkalmazott az egész dokumentumon

💾 Tárolás:
  • localStorage: `myio.zoom`
  • Az oldal újratöltése után megmarad

📱 Reszponzív:
  • Header magasság automatikusan frissül (`--header-h` CSS var)
  • Összes elem arányosan méretezésre kerül
```

#### **e) Export / Import (Backup)**
**Cél:** Beállítások mentése és visszaállítása

```
💾 Export (Biztonsági Mentés):
  1. Kattints az "Export" gombra
  2. A beállítások JSON fájlban letöltődnek
     Pl: `MyIO_backup_2025-02-11.json`
  3. Biztonságosan tárolható egy másik helyen

📥 Import (Visszaállítás):
  1. Kattints az "Import" gombra
  2. Válassz ki egy korábban exportált JSON fájlt
  3. Erősítsd meg a felkérés
  4. Az oldal újra töltödik az importált beállításokkal

⚙️ Mentett beállítások:
  • Zoom szint
  • Auto Refresh beállítások
  • Kártyák/Szekciók sorrendje
  • Booster konfigurálása
  • Nyelv választása
  • Egyéb localStorage értékek (myio.* ključevi)
```

#### **f) Logout (Kilépés)**
**Cél:** Felhasználó kijelentkeztetése

```
🚪 Használat:
  1. Kattints a "Log out" gombra a menü alján
  2. A szerver feldolgozza a kijelentkezést
  3. Visszakerülsz a bejelentkezési oldalra

🔐 Biztonsági megjegyzés:
  • Az oldal újra betöltődik
  • Az összes session-adat szerverről törlődik
```

---

## Dashboard & Kártyák (index.js)

Az index.js modul felépíti és kezeli a kártyákat tartalmazó dashboard-ot.

### 1. Dashboard Felépítése

```
┌─────────────────────────────────────────────┐
│              Header (nav.js)                │
├─────────────────────────────────────────────┤
│                                             │
│  [Szekció 1: Világítás]                    │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ Nappali      │ │ Hálószoba    │         │
│  │ Dolgozó      │ │ Konyha       │         │
│  └──────────────┘ └──────────────┘         │
│                                             │
│  [Szekció 2: Fűtés]                        │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ Termosztát  │ │ Radiátor     │         │
│  └──────────────┘ └──────────────┘         │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Szekciók & Kártyák

**Szekció:** Eszközök logikai csoportja (pl. "Világítás", "Fűtés")
**Kártya:** Egyedi eszköz vezérlőeleme

#### Kártya Típusok:

| Típus | Ikon | Funkció | Szerkeszthető |
|-------|------|---------|---------------|
| **Relé** (Kapcsoló) | 🔌 | Be/Ki kapcsolás | ✅ |
| **PWM** (Fényerő) | 💡 | Fényerő csúszka (0-100%) | ✅ |
| **Szenzor** | 📊 | Hőmérséklet, páratartalom stb. | ❌ |
| **Termosztát** | 🌡️ | Hőmérséklet vezérlés | ✅ |
| **PCA** | 🎨 | RGB LED szín vezérlés | ✅ |
| **FET** | ⚡ | MOSFET vezérlés | ✅ |
| **Zóna** | 🗺️ | Terület vezérlés | ✅ |
| **Favorit** | ⭐ | Gyors hozzáférési kártyák | ✅ |

### 3. Kártyák Kezelése

#### **Kattintás**
```
🖱️ Egyszerű kattintás:
  • Kapcsoló (Relé): Be/Ki váltás
  • Termosztát/Szenzor: Részletes nézet megnyitása
  • Szenzor + hosszú kattintás → Grafikon (Chart) megnyitása
```

#### **Hosszú Kattintás (Long Press)**
```
🖱️ Hosszú nyomás (2-3 másodperc):
  • Megnyitja a kártya "Beállítások" modalt
  • Módosítható: Név, típus, CSS osztály stb.
  • A módosítások localStorage-ban mentődnek
```

#### **Drag & Drop (Áthelyezés)**
```
🔄 Szekciók sorrendje:
  • Szekciókat el lehet mozgatni egymáshoz képest
  • Hosszú nyomás → húzás → elengedés

🔄 Kártyák sorrendje szekción belül:
  • Kártyákat el lehet mozgatni a szekción belül
  • Vagy más szekciókba áthelyezhető
  • Az új sorrend localStorage-ban mentődik

💾 Perzisztencia:
  • `myio.sectionOrder` – Szekciók sorrendje
  • `myio.cardOrder.*` – Kártyák sorrendje szekciónként
```

---

## Gyakorlati Útmutatók

### Szenárió 1: Világítás Bekapcsolása

```
1. Megnyítod a MyIO oldalát
2. Keresed a "Nappali" kártya (világítás)
3. Kattintasz a kártyára
   → A fény BEKAPCSOL (LED bejelölt)
4. Újra kattintasz
   → A fény KIKAPCSOL
```

### Szenárió 2: Fényerő Beállítása

```
1. Megtalálod a "Nappali Fényerő" kártyát (PWM típus)
2. A kártyában van egy csúszka (0-100%)
3. Húzod a csúszkát jobbra → fényesebb
4. Húzod balra → halványabb
5. Automatikusan mentődik az érték
```

### Szenárió 3: Beállítások Mentése

```
1. Menü → Export
2. A "MyIO_backup_2025-02-11.json" fájl letöltödik
3. Mentsd el egy biztonságos helyre (pl. felhőben)
4. Ha később visszaállítanod kell:
   → Menü → Import → A fájl kiválasztása
   → Megerősítés → Az oldal újra töltödik
```

### Szenárió 4: Zoom a Mobilon

```
1. Menü → Zoom csúszka
2. 50% → kis képernyőhöz, sok tartalom
3. 100% → normál nézet (alapértelmezett)
4. 150% → nagy gombok, könnyebb érintés
5. A választás memóriában marad
```

### Szenárió 5: Auto Refresh Bekapcsolása

```
1. Menü → Auto Refresh gomb
2. Bekapcsold a togglet (kék lesz)
3. Állítsd be az intervallumot:
   • Csúszka vagy szövegmező
   • Pl: 30 másodperc = "30s" jelenítés
4. Az oldal AJAX-szel frissül automatikusan
   → NEM tölti újra az oldalt
   → Szekciók és kártyák maradnak
5. Kikapcsolás: Toggle OFF → szűnik a frissítés
```

---

## Hibaelhárítás

### Problem: A kártyák nem frissülnek
```
❓ Megoldás:
  1. Kattints a ↻ (Update) gombra
  2. Ha nem működik:
     → Menü → Auto Refresh
     → Kapcsold ki, majd be
  3. Hardlemez gyorsítótár törlés:
     → F12 (DevTools) → Network
     → "Disable cache" pipálva
     → Ctrl+Shift+R (teljes újratöltés)
```

### Problem: Auto Refresh nem működik
```
❓ Megoldás:
  1. Ellenőrizd a hálózati kapcsolatot
  2. Konzol nyitás (F12 → Console)
  3. Keresd: "Auto refresh failed" üzeneteket
  4. Ha a `/sens_out.json` nem elérhető:
     → MyIOLive fallback `sendForm()` futtat
  5. Szerveroldali hiba esetén: Rendszergazdához fordulj
```

### Problem: Beállítások nem mentődnek
```
❓ Megoldás:
  1. localStorage engedélyezve van?
     → F12 → Application → Local Storage
  2. Böngésző korlátja (5-10MB)?
     → Túl sok export/import → törlés szükséges
  3. Privát/Incognito mód?
     → localStorage nem működik
     → Normál böngészési módot használj
```

### Problem: Header és menu nem jelenik meg
```
❓ Megoldás:
  1. F12 → Console
  2. Keresd a hibaüzeneteket
  3. JavaScript betöltési hiba?
     → Hardlemez gyorsítótár törlés (Ctrl+Shift+R)
  4. CSS betöltési hiba?
     → DevTools → Network → CSS fájlok
     → 404 hiba? → Szerver konfigurálása
```

### Problem: Zoom nem működik
```
❓ Megoldás:
  1. localStorage-ben `myio.zoom` ellenőrzése
  2. CSS változó (`--myio-zoom`) alkalmaz-e?
     → F12 → Elements → <html> → Computed Styles
  3. Böngésző natív zoom?
     → (Ctrl++ / Ctrl+-) tiltva van
     → MyIO zoom helyette
```

### Problem: Export/Import nem működik
```
❓ Megoldás:
  1. JSON fájl formátuma helyes?
     → Szövegszerkesztőben megnyitva
     → Hiba esetén: `str_ImportError` jelenik meg
  2. localStorage hely elég?
     → F12 → Application → Storage
     → Tárolt méretek ellenőrzése
  3. Böngésző korlátja túllépi?
     → Régebbi backup fájlt próbálj
```

---

## Technikai Megjegyzések

### CSS Változók (Custom Properties)
```css
--myio-zoom: 1;          /* 0.5 (50%) - 1.5 (150%) */
--header-h: 80px;        /* Header magassága (dinamikus) */
```

### localStorage Kulcsok
```javascript
// Zoom
localStorage.getItem('myio.zoom')

// Auto Refresh
localStorage.getItem('myio.autoRefresh.enabled')   // "1" vagy "0"
localStorage.getItem('myio.autoRefresh.interval')  // másodpercben

// Szekciók/Kártyák sorrendje
localStorage.getItem('myio.sectionOrder')     // JSON array
localStorage.getItem('myio.cardOrder.*')      // szekció ID alapján
```

### Cookie Kulcsok
```javascript
// Booster
getCookie('Booster')   // "0" vagy "1"
setCookie('Host', '...')

// Nyelv
getCookie('Language')  // "hu", "en", stb.
```

---

## Támogatás & Feedback

- **Hiba jelentés:** GitHub Issues
- **Dokumentáció:** Projekt README
- **Fejlesztői:** MyIO Team

---

**Utolsó frissítés:** 2025. február 11.
**Verzió:** MyIO 3.5 (index.js & nav.js)
