# MyIO Dashboard - Felhasználói Kézikönyv

## Tartalomjegyzék
1. [Bevezetés](#bevezetés)
2. [Navigáció & Header (nav.js)](#navigáció--header-navjs)
3. [Dashboard & Kártyák (index.js)](#dashboard--kártyák-indexjs)
4. [Gyakorlati Útmutatók](#gyakorlati-útmutatók)
5. [Hibaelhárítás](#hibaelhárítás)

---

## Bevezetés

A **myIO Dashboard** egy okos otthon vezérlőrendszer böngészőalkalmazása. Két fő modul kezeli a felhasználói felületet:

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
  • Az oldal visszapozicionál
```

### 2. myIO logo
**Ikon:** myIO
**Helye:** Header közepe
**Funkció:** Vissza navigál a főoldalra.

```
📍 Használat:
  • Kattints a myIO logóra
  • Rögtön a dashboard főoldalára kerülsz
```

### 3. Sárga felirat 
**Helye:** Header közepe a logó jobb oldalán
**Funkció:** A szerver nevét jelzi. 

```
📍 Használat:
  • Az általános beállítások között módosítható.
```

### 4. Menu Gomb
**Ikon:** ≡ (hamburger menü)
**Helye:** Header jobb oldal
**Funkció:** Megnyitja az összes beállítást tartalmazó panelt.

```
📍 Használat:
  • Kattints a ≡ gombra a menü megnyitásához
  • Kattints ismét a bezáráshoz (az ikon 'X'-re vált)
  • ESC billentyűvel is bezárhatod
  • A menü automatikusan bezáródik, ha kívülre kattintasz
```

---

### Menu Lehetőségek

#### **a) Témák**
**Cél:** a myIO Server az SD kártya helyett innen tölti be a webes megjelenítéshez szükséges file-okat

```
🔧 Beállítás:
  1. Engedélyezd a "Témék" toggle-t (ki/be)
  2. Kattints a "Témák" gombra a menüben
  3. Megnyílik egy modal ablak, ahol egy listából kiválasztható, vagy törölhető egy korábban hozzáadot URL
  3. Add meg az Host URL-t az input mezőben, ahol az új téma elérhető
  4. A beállítás automatikusan cookie-ban mentődik

💡 Tipp:
  • Fejlesztéshez könnyedén hozzáadható egy másolat, vagy helyi tárhely (pl.:http://localhost:8000)
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
**Cél:** Beállítások mentése és visszaállítása. Segítségével egyik böngészőből egy másikba átvihetőek a beállítások.

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
  • Egyéb localStorage értékek
```

#### **f) AI Ninja 🥷 **
**Cél:** Mesterséges inteligencia integrálása

```
🚪 Használat:
  1. Kattints az "AI Ninja 🥷" gombra a menü jobb alján
  2. Megnyílik az Ninja AI modal ablak
  3. Az AI működéséhez meg kell adni az előfizetésed API kulcsát.
  4. Az AI Ninja saját AI előfizetésed használja.
  4. 3 szolgáltató modelljeit támogatja az AI Ninja : Anthropic(Claude), OpenAI(ChatGPT), Google(Gemini)
  5. Az API kulcs a szolgáltató felületén generálható
  6. Az API kulcs és a modell váltása később a fogaskerék ikon (⚙) segítségével módosítható
  7. Az AI Ninja hozzáfér a szerver álltal kezelt kártyákhoz, lekérdezheti, módosíthatja állapotukat.

🔐 Biztonsági megjegyzés:
  • Az API kulcs a böngészőben kerül letárolásra a localStorage-ben.
  • Amennyiben nem szeretnéd, hogy a böngésződ tárolja az API kulcsot, saját szerveren kell futtatnod a témát és oda feltöltheted a .env nevü file-ba az API kulcsot a következő formában a szolgáltatótól függően:
    • ANTHROPIC_API_KEY= API-KEY
    • OPENAI_API_KEY= API-KEY
    • GOOGLE_API_KEY= API-KEY
```

---

#### **g) Logout (Kilépés)**
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
│  [Szekció 1: Világítás]                     │
│  ┌──────────────┐ ┌──────────────┐          │
│  │ Nappali      │ │ Hálószoba    │          │
│  │ Dolgozó      │ │ Konyha       │          │
│  └──────────────┘ └──────────────┘          │
│                                             │
│  [Szekció 2: Fűtés]                         │
│  ┌──────────────┐ ┌──────────────┐          │
│  │ Termosztát   │ │ Radiátor     │          │
│  └──────────────┘ └──────────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### 2. Szekciók & Kártyák

**Szekció:** Eszközök logikai csoportja (pl. "Világítás", "Fűtés","kedvencek")
**Kártya:** Egyedi eszköz vezérlőeleme

#### Kártya és Szekció Típusok:

 **Kimenet**    - Be/Ki kapcsolás 
 **PCA**        - Univerzális kimenet 0-100%, Be/Ki kapcsolás 
 **PWM**        - 0-100%-ig vezérelhető kimenet típus  
 **Szenzor**    - Hőmérséklet, páratartalom stb. 
 **Termosztát** - Hőmérséklet vezérlés
 **Bemenet**    - A bemenetekhez tartozó rövid és hosszú nyomás funkciók.

#### Szekció Típusok:
 **Zóna**       - Terület alapú csoport. A zónák a kártyák beállításai alatt kezelhetők.        
 **Kedvencek**  - Gyors hozzáférési kártyák. A kedvenc ikonnal "☆" adhatóak, ehez a csoporthoz a kártyák.

### 3. Kártyák Kezelése

#### **Kattintás az elnevezésre**
```
🖱️ Egyszerű kattintás:
  • Kimenetek: Be/Ki kapcsolás
  • Szenzor: → Grafikon (Chart) megnyitása
```

#### **Hosszú Kattintás (Long Press)**
```
🖱️ Hosszú nyomás (0.5 másodperc):
  • Megnyitja a kártya "Beállítások" modal ablakot
  • Módosítható: Név (csak a böngészőben), zóna, ikon, megjegyzés
  • A módosítások localStorage-ban mentődnek
```

#### **Szenzor kártya -> Grafikon Modal Ablak**
```
🖱️ Egyszerű kattintás a Szenzor kártya elnevezésén:
  • Megnyitja a kártyához tartozó grafikon modal ablakot
  • Alapból az aktuális naphoz tartozó grafikon nyílik meg
  • A grafikon Zoomolható
  • A Betöltés szekcióban hozzáadhatóak további adatok a grafikonhoz
    • Ugyan azon szenzorhoz tartozó korábbi napok
    • Másik Szenzor adatai összehasonlítás végett
    • Azonos szenzorokhoz azonos színeket rendel
  • Kimenetek szekció:
    • Ha talál olyan kimenetet, amit az adott szenzor vezérel, azok ki és bekapcsolási értékeit kilistázza
    • Az egyes kimenetek megjelenítése a grafikonon ki-be kapcslolható.
    • A grafikonon megjelenített ki-bekapcsolási érték, vízszintes szaggatott vonallal jelenik meg, jobb oldalán az elnevezéssel.
    • Erre az elnevezésre nyomva értéke vizuálisan módosítható. 
```

#### **Drag & Drop (Áthelyezés)**
```
🔄 Szekciók sorrendje:
  • Szekciókat el lehet mozgatni egymáshoz képest
  • jobb oldalt burger ikon, hosszú nyomás → húzás → elengedés

🔄 Kártyák sorrendje szekción belül:
  • Kártyákat el lehet mozgatni a szekción belül
  • Más szekciókba nem helyezhető át
  • A kártya egy üres helyén hosszú nyomás → húzás → elengedés
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
