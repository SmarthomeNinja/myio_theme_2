/* settings-modal.js – Kártya beállítások modal (long-press) */

(function() {
  const { el, toast, escapeHtml, myioNS } = window.myioUtils;
  const { loadCardIcon, saveCardIcon, loadCardName, saveCardName, loadCardNote, saveCardNote } = window.myioStorage;

  const LP_MS = 500, MOVE_PX = 10;
  let lpTimer = null, startX = 0, startY = 0, lpDetected = false, curCard = null;

  const ICONS = ['🏠','💡','🚪','🪟','🔥','❄️','🌙','🌞','🌡️','💧','🔼','🔽','▶','◀','↔','↕','🛏','🛋','🛁','🚽','🚿','🔌','⚡','🔋','📶','📡','🎛️','⚙️','🔧','🔒','📺','🚨','❗','📱','🖥️','🎯','🧯','🕒','🎨','🚗','🏡','🥷','📟','🔦','🗿','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

  function openSettingsModal(card) {
    const cardId = card.dataset.cardid || 'unknown';
    const titleEl = card.querySelector('.myio-headTitleBtn') || card.querySelector('.myio-cardTitle');
    let curName = '';
    if (titleEl) curName = Array.from(titleEl.childNodes).filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join('').trim();
    const curIcon = loadCardIcon(cardId) || '☆';
    const curNote = loadCardNote(cardId);

    const overlay = document.createElement('div');
    overlay.className = 'myio-settings-overlay';
    overlay.innerHTML = `
      <div class="myio-settings-modal">
        <div class="myio-settings-header">
          <div><h3 class="myio-settings-title">${typeof str_CardSettings !== "undefined" ? str_CardSettings : "Kártya beállítások"}</h3><p class="myio-settings-subtitle">ID: ${escapeHtml(cardId)}</p></div>
          <button class="myio-settings-close" type="button">×</button>
        </div>
        <div class="myio-settings-content">
          <div class="myio-setting-row">
            <label class="myio-setting-label">${typeof str_CardName !== "undefined" ? str_CardName : "Kártya neve"}</label>
            <input type="text" class="myio-setting-input myio-card-name-input" value="${escapeHtml(curName)}" placeholder="${typeof str_CardName !== "undefined" ? str_CardName : "Kártya neve"}">
          </div>
          <div class="myio-setting-row">
            <label class="myio-setting-label">${typeof str_ChosenIcon !== "undefined" ? str_ChosenIcon : "Választott ikon"}</label>
            <div class="myio-selected-icon-display" style="font-size:44px;text-align:center;padding:10px;background:rgba(255,255,255,0.05);border-radius:12px;margin:10px 0;cursor:pointer;">${escapeHtml(curIcon)}</div>
          </div>
          <div class="myio-setting-row myio-icon-picker-row" style="display:none;">
            <label class="myio-setting-label">${typeof str_ChooseIcon !== "undefined" ? str_ChooseIcon : "Válassz ikont"}</label>
            <div class="myio-icon-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:10px;margin-top:10px;">
              ${ICONS.map(i => `<button class="myio-icon-option${i===curIcon?' is-selected':''}" data-icon="${i}" style="padding:15px;font-size:28px;background:${i===curIcon?'rgba(3,151,214,0.3)':'rgba(255,255,255,0.08)'};border:2px solid ${i===curIcon?'var(--accent)':'rgba(255,255,255,0.12)'};border-radius:10px;cursor:pointer;">${i}</button>`).join('')}
            </div>
          </div>
          <div class="myio-setting-row">
            <label class="myio-setting-label">${typeof str_Note !== "undefined" ? str_Note : "Megjegyzés"}</label>
            <textarea class="myio-setting-textarea myio-setting-input" rows="3" placeholder="${typeof str_WriteNote !== "undefined" ? str_WriteNote : "Írj megjegyzést..."}">${escapeHtml(curNote)}</textarea>
          </div>
        </div>
        <div class="myio-settings-footer">
          <button class="myio-settings-btn myio-settings-btn-secondary myio-settings-cancel" type="button">${typeof str_Cancel !== "undefined" ? str_Cancel : "Mégse"}</button>
          <button class="myio-settings-btn myio-settings-btn-primary myio-settings-save" type="button">${typeof str_Save !== "undefined" ? str_Save : "💾 Mentés"}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const iconPickerRow = overlay.querySelector('.myio-icon-picker-row');
    const selectedIconBox = overlay.querySelector('.myio-selected-icon-display');
    selectedIconBox.addEventListener('click', () => iconPickerRow.style.display = iconPickerRow.style.display === 'none' ? '' : 'none');

    requestAnimationFrame(() => overlay.classList.add('is-open'));

    const closeModal = () => { overlay.classList.remove('is-open'); setTimeout(() => overlay.remove(), 300); };

    overlay.querySelector('.myio-settings-close').addEventListener('click', closeModal);
    overlay.querySelector('.myio-settings-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

    const handleEscape = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', handleEscape); } };
    document.addEventListener('keydown', handleEscape);

    overlay.querySelectorAll('.myio-icon-option').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedIconBox.textContent = btn.dataset.icon;
        overlay.querySelectorAll('.myio-icon-option').forEach(b => { b.style.background = 'rgba(255,255,255,0.08)'; b.style.borderColor = 'rgba(255,255,255,0.12)'; });
        btn.style.background = 'rgba(3,151,214,0.3)';
        btn.style.borderColor = 'var(--accent)';
      });
    });

    overlay.querySelector('.myio-settings-save').addEventListener('click', () => {
      const newName = overlay.querySelector('.myio-card-name-input').value.trim();
      const newIcon = selectedIconBox.textContent.trim();
      const newNote = overlay.querySelector('.myio-setting-textarea').value.trim();

      if (!newName) { toast(typeof str_DeviceNameRequired !== "undefined" ? str_DeviceNameRequired : "Az eszköz neve nem lehet üres!"); return; }

      saveCardName(cardId, newName);
      saveCardIcon(cardId, newIcon);
      saveCardNote(cardId, newNote);
      closeModal();
      if (typeof window.myioRenderAll === "function") window.myioRenderAll();
      toast('✅ Mentve!');
    });
  }

  function setupLongPressHandlers() {
    document.querySelectorAll('.myio-cardTitle').forEach(btn => {
      if (btn.dataset.longpressAttached) return;
      btn.dataset.longpressAttached = 'true';

      const start = (e) => {
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        lpDetected = false;
        curCard = btn.closest('.myio-card');
        if (curCard) curCard.classList.add('is-longpress-active');
        lpTimer = setTimeout(() => {
          lpDetected = true;
          if (navigator.vibrate) navigator.vibrate(50);
          if (curCard) openSettingsModal(curCard);
        }, LP_MS);
      };

      const move = (e) => {
        if (!lpTimer) return;
        const x = e.touches ? e.touches[0].clientX : e.clientX;
        const y = e.touches ? e.touches[0].clientY : e.clientY;
        if (Math.abs(x - startX) > MOVE_PX || Math.abs(y - startY) > MOVE_PX) {
          clearTimeout(lpTimer); lpTimer = null; lpDetected = false;
          if (curCard) curCard.classList.remove('is-longpress-active');
        }
      };

      const end = () => {
        if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; }
        if (curCard) curCard.classList.remove('is-longpress-active');
        curCard = null;
      };

      btn.addEventListener('touchstart', start, { passive: true });
      btn.addEventListener('touchmove', move, { passive: true });
      btn.addEventListener('touchend', end);
      btn.addEventListener('touchcancel', end);
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);

      btn.addEventListener('click', (e) => {
        if (lpDetected) { e.preventDefault(); e.stopPropagation(); lpDetected = false; }
      }, true);
    });
  }

  window.myioSettingsModal = { openSettingsModal, setupLongPressHandlers };
})();
