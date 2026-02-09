/* storage.js – LocalStorage kezelés: ikonok, nevek, kedvencek */

(function () {
  const { myioNS } = window.myioUtils;

  const ICON_KEY = myioNS + ".card.icons";
  const NAMES_KEY = myioNS + ".card.names";
  const NOTES_KEY = myioNS + ".card.notes";
  const FAV_KEY = myioNS + ".favorites";
  const FAV_SECTION_KEY = myioNS + ".section.favorites";

  // --- Ikon ---
  function loadCardIcon(cardId) {
    try {
      return JSON.parse(localStorage.getItem(ICON_KEY) || '{}')[cardId] || null;
    } catch { return null; }
  }

  function saveCardIcon(cardId, icon) {
    try {
      const icons = JSON.parse(localStorage.getItem(ICON_KEY) || '{}');
      icons[cardId] = icon;
      localStorage.setItem(ICON_KEY, JSON.stringify(icons));
    } catch (e) { console.error('Icon save error:', e); }
  }

  // --- Név ---
  function loadCardName(cardId) {
    try {
      return JSON.parse(localStorage.getItem(NAMES_KEY) || '{}')[cardId] || null;
    } catch { return null; }
  }

  function saveCardName(cardId, name) {
    try {
      const names = JSON.parse(localStorage.getItem(NAMES_KEY) || '{}');
      names[cardId] = name;
      localStorage.setItem(NAMES_KEY, JSON.stringify(names));
    } catch (e) { console.error('Name save error:', e); }
  }

  // --- Megjegyzés ---
  function loadCardNote(cardId) {
    try {
      return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}')[cardId] || '';
    } catch { return ''; }
  }

  function saveCardNote(cardId, note) {
    try {
      const notes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      if (note) notes[cardId] = note;
      else delete notes[cardId];
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (e) { console.error('Note save error:', e); }
  }

  // --- Kedvencek ---
  function loadFavs() {
    try {
      const arr = JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  function saveFavs(arr) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch { }
  }

  function isFav(id) { return loadFavs().includes(id); }

  function toggleFav(id) {
    const f = loadFavs();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1);
    else f.push(id);
    saveFavs(f);
  }

  function cleanupFavoritesSectionState() {
    try {
      localStorage.removeItem(FAV_SECTION_KEY);
      const scope = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "default";
      localStorage.removeItem(`myio.cards.order.${scope}.${FAV_SECTION_KEY}`);

      const sectionsOrderKey = `myio.sections.order.${scope}`;
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem(sectionsOrderKey) || "[]"); } catch { }
      saved = Array.isArray(saved) ? saved.filter(k => k !== FAV_SECTION_KEY) : [];
      localStorage.setItem(sectionsOrderKey, JSON.stringify(saved));
    } catch (e) { console.error("Favorites cleanup error:", e); }
  }

  // --- Zónák ---
  const ZONES_KEY = myioNS + ".zones"; // [ { id, name }, ... ]
  const ZONE_ASSIGN_KEY = myioNS + ".card.zones"; // { cardId: [zoneId1, zoneId2], ... }

  function loadZones() {
    try {
      const z = JSON.parse(localStorage.getItem(ZONES_KEY) || "[]");
      return Array.isArray(z) ? z : [];
    } catch { return []; }
  }

  function saveZones(zones) {
    try { localStorage.setItem(ZONES_KEY, JSON.stringify(zones)); } catch (e) { console.error("Zones save error:", e); }
  }

  function addZone(name) {
    const zones = loadZones();
    const id = "zone_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    zones.push({ id, name });
    saveZones(zones);
    return id;
  }

  // Törléskor a hozzárendeléseket is takarítani kellene, de nem kritikus
  function removeZone(id) {
    const zones = loadZones().filter(z => z.id !== id);
    saveZones(zones);

    // Cleanup assignments
    try {
      const assigns = JSON.parse(localStorage.getItem(ZONE_ASSIGN_KEY) || "{}");
      let changed = false;
      Object.keys(assigns).forEach(cardId => {
        if (assigns[cardId].includes(id)) {
          assigns[cardId] = assigns[cardId].filter(zId => zId !== id);
          if (assigns[cardId].length === 0) delete assigns[cardId];
          changed = true;
        }
      });
      if (changed) localStorage.setItem(ZONE_ASSIGN_KEY, JSON.stringify(assigns));
    } catch { }
  }

  // --- Zóna hozzárendelések ---
  function getCardZones(cardId) {
    try {
      const all = JSON.parse(localStorage.getItem(ZONE_ASSIGN_KEY) || "{}");
      return Array.isArray(all[cardId]) ? all[cardId] : [];
    } catch { return []; }
  }

  function setCardZones(cardId, zoneIds) {
    try {
      const all = JSON.parse(localStorage.getItem(ZONE_ASSIGN_KEY) || "{}");
      if (!zoneIds || zoneIds.length === 0) {
        delete all[cardId];
      } else {
        all[cardId] = zoneIds;
      }
      localStorage.setItem(ZONE_ASSIGN_KEY, JSON.stringify(all));
    } catch (e) { console.error("Zone assign save error:", e); }
  }

  // Export
  window.myioStorage = {
    ICON_KEY, NAMES_KEY, NOTES_KEY, FAV_KEY, FAV_SECTION_KEY, ZONES_KEY, ZONE_ASSIGN_KEY,
    loadCardIcon, saveCardIcon,
    loadCardName, saveCardName,
    loadCardNote, saveCardNote,
    loadFavs, saveFavs, isFav, toggleFav,
    cleanupFavoritesSectionState,
    loadZones, saveZones, addZone, removeZone,
    getCardZones, setCardZones
  };
})();
