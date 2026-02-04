# 🥷 Ninja AI - Gyors Telepítési Útmutató

## ⚡ 3 lépésben működik!

### 1️⃣ API Kulcs Megszerzése

1. **Látogass el**: [https://console.anthropic.com/](https://console.anthropic.com/)
2. **Jelentkezz be** vagy regisztrálj
3. **API Keys** menüpont → **Create Key**
4. **Másold ki** a kulcsot (kezdődik: `sk-ant-api03-...`)

### 2️⃣ API Kulcs Beállítása

#### Egyszerű módszer (ajánlott):

1. Nyisd meg: **`ninja-test.html`** a böngésződben
2. Illeszd be az API kulcsot
3. Kattints: **"Kulcs Mentése"**
4. ✅ Kész!

#### Alternatív módszer (konzol):

```javascript
// Nyisd meg a böngésző konzolt (F12)
localStorage.setItem('ANTHROPIC_API_KEY', 'sk-ant-api03-...');
```

### 3️⃣ Használat

1. **Navigálj**: `http://192.168.1.179`
2. **Hard refresh**: `Ctrl+Shift+R` (vagy `Cmd+Shift+R` Mac-en)
3. **Keress**: 🥷 Ninja ikon a header jobb oldalán
4. **Kattints** és kezdj chattelni!

---

## 🎯 Első Használat

### Nyisd meg a Ninjat:
- Kattints a 🥷 **Ninja ikonra** a jobb felső sarokban

### Próbáld ki ezeket:
- "Milyen eszközeim vannak?"
- "Mi a hőmérséklet?"
- "Kapcsold be a nappalí lámpát" (hamarosan!)

---

## ⚠️ Hibaelhárítás

### Ninja ikon nem látható?
```
✅ Hard refresh: Ctrl+Shift+R
✅ Cache törlése
✅ Ellenőrizd: F12 → Console → "🥷 Ninja AI Chat initialized"
```

### API hiba?
```
✅ Ellenőrizd az API kulcs formátumát: sk-ant-api03-...
✅ Győződj meg hogy érvényes a kulcs
✅ Teszteld: ninja-test.html
```

### Üzenet nem küldődik?
```
✅ API kulcs be van állítva?
✅ Internet kapcsolat működik?
✅ F12 → Console → keress hibákat
```

---

## 📱 Mobil Használat

1. Nyisd meg a MyIO-t mobilon
2. Ninja ikon megjelenik
3. Modal full-screen módban nyílik
4. Minden funkció elérhető!

---

## 💡 Tippek

### Költség Spórolás:
- Töröld az előzményeket időnként
- Használj rövid kérdéseket
- ~$0.01-0.10 / beszélgetés

### Legjobb Gyakorlatok:
- Legyél konkrét a kérdésekkel
- Magyar nyelven írj
- Használd a javasolt kérdéseket

### Biztonság:
- **SOHA** ne oszd meg az API kulcsot
- A kulcs csak a böngésződben van
- Nincs szerver-side tárolás

---

## 🎉 Kész!

Most már használhatod a Ninja AI-t az okos otthon vezérléséhez!

**Kérdések?** Nézd meg a `NINJA_README.md` fájlt részletes infókért.

---

**Verzió**: 1.0.0  
**Frissítve**: 2026-02-04  
**Status**: ✅ Production Ready
