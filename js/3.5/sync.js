/* sync.js – JSONBin.io alapú beállítás szinkronizáció */

(function () {
  const SYNC_BIN_KEY = 'myio.sync.binId';
  const SYNC_KEY_KEY = 'myio.sync.apiKey';
  const JSONBIN_URL = 'https://api.jsonbin.io/v3/b/';

  function getSettingsSnapshot() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('myio.sync.')) continue;
      if (key.startsWith('myio.') || ['Language', 'Booster', 'Host', 'AutoRefresh'].includes(key)) {
        data[key] = localStorage.getItem(key);
      }
    }
    return data;
  }

  function applySettingsSnapshot(data) {
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, data[key]);
    });
  }

  function loadSyncConfig() {
    return {
      binId: localStorage.getItem(SYNC_BIN_KEY) || '',
      apiKey: localStorage.getItem(SYNC_KEY_KEY) || ''
    };
  }

  function saveSyncConfig(binId, apiKey) {
    localStorage.setItem(SYNC_BIN_KEY, binId.trim());
    localStorage.setItem(SYNC_KEY_KEY, apiKey.trim());
  }

  async function syncPull(binId, apiKey) {
    const resp = await fetch(JSONBIN_URL + binId + '/latest', {
      headers: { 'X-Master-Key': apiKey }
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    const json = await resp.json();
    if (!json.record || typeof json.record.settings !== 'object') throw new Error('Érvénytelen tartalom');
    return json.record.settings;
  }

  async function syncPush(binId, apiKey, data) {
    const resp = await fetch(JSONBIN_URL + binId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': apiKey
      },
      body: JSON.stringify({ settings: data })
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
  }

  window.myioSync = {
    SYNC_BIN_KEY, SYNC_KEY_KEY,
    getSettingsSnapshot, applySettingsSnapshot,
    loadSyncConfig, saveSyncConfig,
    syncPull, syncPush
  };
})();
