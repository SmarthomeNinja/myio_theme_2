
(() => {
	try {

		const href = host + 'styleGreenNew.css';

		if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.onerror = () => console.error('Nem sikerült betölteni a styles.css fájlt:', href);
			document.head.appendChild(link);
		}
	} catch (e) {
		console.error('Stíluslap betöltése közben hiba történt:', e);
	}
})();
(function ensureViewportMeta() {
	let m = document.querySelector('meta[name="viewport"]');
	if (!m) {
		m = document.createElement("meta");
		m.name = "viewport";
		document.head.appendChild(m);
	}
	m.content = "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, viewport-fit=cover";
	document.documentElement.style.webkitTextSizeAdjust = "100%";
})();

let MYIOname = document.title || "";
MYIOname = MYIOname.replace(/\s*-\s*index\s*$/i, ""); // "- index" a végéről

document.addEventListener("touchstart", (e) => {
	const r = e.target.closest('input[type="range"]');
	if (!r) return;

	r._tm = setTimeout(() => {
		r.style.touchAction = "none";
	}, 120); // 120 ms = szándékos
}, { passive: true });

document.addEventListener("touchend", (e) => {
	const r = e.target.closest('input[type="range"]');
	if (!r) return;

	clearTimeout(r._tm);
	r.style.touchAction = "pan-y";
});

(function () {
	function safeBuildHeader() {
		if (!document.body) {
			requestAnimationFrame(safeBuildHeader);
			return;
		}
		buildHeader();
	}

	safeBuildHeader();
})();

function buildHeader() {

	// overlay
	if (!document.getElementById("overlay")) {
		const ov = document.createElement("div");
		ov.id = "overlay";
		document.body.prepend(ov);
	}

	// header container (meglévő .header div)
	let hdr = document.querySelector(".header");
	if (!hdr) {
		hdr = document.createElement("div");
		hdr.className = "header";
		document.body.prepend(hdr);
	}
	hdr.innerHTML = ""; // újrarender (page reload úgyis van)

	// ----- forms (marad a logika) -----
	const form = document.createElement("form");
	form.method = "POST";
	form.id = "form";
	form.innerHTML = `
	<input type="hidden" name="X" id="X" value="0">
	<input type="hidden" name="Y" id="Y" value="0">
	<input type="hidden" name="sending" id="sending" value="0">
	`;
	const form2 = document.createElement("form");
	form2.method = "POST";
	form2.id = "form2";
	form2.innerHTML = `
	<input type="hidden" name="X" id="X" value="0">
	<input type="hidden" name="Y" id="Y" value="0">
	<input type="hidden" name="username" id="username" value="0">
	<input type="hidden" name="password" id="password" value="0">
	`;
	hdr.append(form, form2);

	// ----- NAV shell -----
	const nav = document.createElement("div");
	nav.className = "myio-nav";
	hdr.append(nav);

	const isHome =
		location.pathname === "/" ||
		location.pathname === "/index.html";

	const left = document.createElement("div"); left.className = "myio-left";
	const mid = document.createElement("div"); mid.className = "myio-mid";
	const right = document.createElement("div"); right.className = "myio-right";

	nav.append(left, mid, right);

	// Update
	// Update (ikon)
	const btnUpdate = document.createElement("button");
	btnUpdate.type = "button";
	btnUpdate.className = "myio-iconBtn";
	btnUpdate.title = (typeof str_Update !== "undefined" ? str_Update : "Update");
	btnUpdate.setAttribute("aria-label", btnUpdate.title);
	btnUpdate.innerHTML = "↻"; // vagy: "⟳"
	btnUpdate.style.transform = "rotate(90deg)"; // elforgatva
	btnUpdate.onclick = () => { try { sendForm(); } catch (e) { } };
	left.append(btnUpdate);

	// Mid nav buttons
	const title = document.createElement("div");
	title.className = "myio-title";
	title.textContent = MYIOname.slice(5);
	mid.append(title);

	// LOGO
	const logo = document.createElement("img");
	logo.className = "myio-logo";
	logo.src = host + "img/myIO_logo_white.svg";     // vagy .png
	logo.alt = "myIO";
	logo.decoding = "async";
	logo.loading = "eager";
	logo.onclick = () => { window.location.href = "/"; };
	mid.prepend(logo);

	// Logout
	// ===== MENU gomb + panel (Logout + Zoom) =====
	const menuPanel = document.createElement("div");
	menuPanel.className = "myio-menuPanel";
	
	// ===== Menu: Chart + Settings gombok =====
	const navRow = document.createElement("div");
	navRow.className = "myio-menuRow myio-menuRowNav";
	const menuWrap = document.createElement("div");
	menuWrap.style.position = "relative";

	const btnMenu = document.createElement("button");
	btnMenu.type = "button";
	btnMenu.className = "myio-menuBtn";
	btnMenu.textContent = "";
	btnMenu.title = (typeof str_Menu !== "undefined" ? str_Menu : "Menu");
	// cím
	const t = document.createElement("div");
	t.className = "myio-menuTitle";
	t.textContent = (typeof str_Menu !== "undefined" ? str_Menu : "Menu");
	menuPanel.appendChild(t);

	const btnChartMenu = document.createElement("button");
	btnChartMenu.type = "button";
	btnChartMenu.className = "myio-btn small";
	btnChartMenu.textContent = (str_Chart || "Chart");
	btnChartMenu.onclick = (e) => { e.preventDefault(); window.location.href = "/chart"; };

	const btnSettingsMenu = document.createElement("button");
	btnSettingsMenu.type = "button";
	btnSettingsMenu.className = "myio-btn small";
	btnSettingsMenu.textContent = (str_Settings || "Settings");
	btnSettingsMenu.onclick = (e) => { e.preventDefault(); window.location.href = "/setup"; };

	navRow.append(btnChartMenu, btnSettingsMenu);
	menuPanel.appendChild(navRow);


	// ===== Booster sor a menüben =====
	const boosterRow = document.createElement("div");
	boosterRow.className = "myio-menuRow myio-menuRowBooster";

	const btnBoosterMenu = document.createElement("button");
	btnBoosterMenu.type = "button";
	btnBoosterMenu.className = "myio-btn small myio-menuBoosterBtn";
	btnBoosterMenu.textContent =
		(typeof str_Booster !== "undefined" ? str_Booster : "Booster");

	// ---- TOGGLE ELŐBB ----
	const boosterToggle = document.createElement("label");
	boosterToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const tInput = document.createElement("input");
	tInput.type = "checkbox";

	const tTrack = document.createElement("span");
	tTrack.className = "myio-miniTrack";

	boosterToggle.append(tInput, tTrack);

	// ===== BOOSTER HOST LISTA - localStorage kezelés =====
	const BOOSTER_HOSTS_KEY = "myio.booster.hosts";
	const DEFAULT_HOST = "https://okoslak.hu/ext";

	function getBoosterHosts() {
		try {
			const stored = localStorage.getItem(BOOSTER_HOSTS_KEY);
			if (stored) {
				const hosts = JSON.parse(stored);
				if (Array.isArray(hosts)) return hosts;
			}
		} catch (e) { }
		return [DEFAULT_HOST];
	}

	function saveBoosterHosts(hosts) {
		try {
			localStorage.setItem(BOOSTER_HOSTS_KEY, JSON.stringify(hosts));
		} catch (e) { }
	}

	function addBoosterHost(host) {
		const hosts = getBoosterHosts();
		if (!hosts.includes(host) && host.trim()) {
			hosts.push(host);
			saveBoosterHosts(hosts);
		}
	}

	function removeBoosterHost(host) {
		if (host === DEFAULT_HOST) return; // alapbeállított nem törölhető
		const hosts = getBoosterHosts();
		const idx = hosts.indexOf(host);
		if (idx > -1) {
			hosts.splice(idx, 1);
			saveBoosterHosts(hosts);
		}
	}

	// ===== BOOSTER HOST MODAL =====
	function createBoosterModal() {
		const modal = document.createElement("div");
		modal.className = "myio-settings-overlay";
		
		const content = document.createElement("div");
		content.className = "myio-settings-modal";

		// Header
		const header = document.createElement("div");
		header.className = "myio-settings-header";
		
		const titleWrap = document.createElement("div");
		const title = document.createElement("h3");
		title.className = "myio-settings-title";
		title.textContent = typeof str_Host !== "undefined" ? str_Host : "Host";
		titleWrap.appendChild(title);
		
		const closeBtn = document.createElement("button");
		closeBtn.className = "myio-settings-close";
		closeBtn.type = "button";
		closeBtn.textContent = "×";
		
		header.append(titleWrap, closeBtn);
		content.appendChild(header);
		
		// Content konténer
		const contentBody = document.createElement("div");
		contentBody.className = "myio-settings-content";

		// Bezárás funkciók
		const closeModal = () => {
			modal.classList.remove('is-open');
			setTimeout(() => {
				if (modal.parentNode) document.body.removeChild(modal);
			}, 200);
		};
		
		closeBtn.onclick = closeModal;

		// Host lista
		const listContainer = document.createElement("div");

		const currentHost = typeof Host !== "undefined" ? Host : "";
		const hosts = getBoosterHosts();
		hosts.forEach((host) => {
			const item = document.createElement("div");
			const isActive = host === currentHost;
			item.style.cssText = `
				display: flex;
				align-items: center;
				justify-content: space-between;
				background: ${isActive ? 'rgba(0, 102, 204, 0.2)' : 'rgba(255,255,255,0.08)'};
				border: 1px solid ${isActive ? 'rgba(0, 102, 204, 0.5)' : 'rgba(255,255,255,0.1)'};
				border-radius: 8px;
				padding: 10px 12px;
				margin-bottom: 8px;
				gap: 8px;
			`;

			const hostLabelContainer = document.createElement("div");
			hostLabelContainer.style.cssText = `
				flex: 1;
				display: flex;
				align-items: center;
				gap: 8px;
			`;

			const hostLabel = document.createElement("div");
			hostLabel.style.cssText = `
				flex: 1;
				color: #fff;
				font-size: 0.95em;
				word-break: break-all;
				user-select: text;
			`;
			hostLabel.textContent = host;

			// Aktív jelölés
			if (isActive) {
				const activeBadge = document.createElement("span");
				activeBadge.style.cssText = `
					background: #0066cc;
					color: #fff;
					padding: 2px 8px;
					border-radius: 4px;
					font-size: 0.75em;
					font-weight: 700;
					white-space: nowrap;
					flex-shrink: 0;
				`;
				activeBadge.textContent = "✓ " + (typeof str_Active !== "undefined" ? str_Active : "Aktív");
				hostLabelContainer.appendChild(activeBadge);
			}

			hostLabelContainer.appendChild(hostLabel);
			item.appendChild(hostLabelContainer);

			const selectBtn = document.createElement("button");
			selectBtn.type = "button";
			selectBtn.style.cssText = `
				background: ${isActive ? '#00aa00' : '#0066cc'};
				color: #fff;
				border: none;
				border-radius: 6px;
				padding: 6px 12px;
				cursor: pointer;
				font-size: 0.85em;
				font-weight: 700;
				white-space: nowrap;
				flex-shrink: 0;
				transition: background 0.2s;
			`;
			selectBtn.textContent = isActive ? (typeof str_Selected !== "undefined" ? str_Selected : "Kiválasztva") : (typeof str_Select !== "undefined" ? str_Select : "Kiválaszt");
			const hoverColorSelect = isActive ? "#008800" : "#0052a3";
			const baseColorSelect = isActive ? "#00aa00" : "#0066cc";
			selectBtn.onmouseover = () => selectBtn.style.background = hoverColorSelect;
			selectBtn.onmouseout = () => selectBtn.style.background = baseColorSelect;
			selectBtn.onclick = () => {
				if (!isActive) {
					try { setCookie("Host", host); } catch (e) { }
					closeModal();
				}
			};

			item.appendChild(selectBtn);

			// Törlés gomb (csak nem alapbeállított host esetén)
			if (host !== DEFAULT_HOST) {
				const delBtn = document.createElement("button");
				delBtn.type = "button";
				delBtn.style.cssText = `
					background: #cc3333;
					color: #fff;
					border: none;
					border-radius: 6px;
					padding: 6px 10px;
					cursor: pointer;
					font-size: 0.85em;
					font-weight: 700;
					white-space: nowrap;
					flex-shrink: 0;
					transition: background 0.2s;
				`;
				delBtn.textContent = "✕";
				delBtn.title = typeof str_Delete !== "undefined" ? str_Delete : "Törlés";
				delBtn.onmouseover = () => delBtn.style.background = "#aa1111";
				delBtn.onmouseout = () => delBtn.style.background = "#cc3333";
				delBtn.onclick = () => {
					removeBoosterHost(host);
					closeModal();
					openBoosterModal();
				};
				item.appendChild(delBtn);
			}

			listContainer.appendChild(item);
		});

		contentBody.appendChild(listContainer);

		// Új host hozzáadása
		const addContainer = document.createElement("div");
		addContainer.style.cssText = `
			display: flex;
			gap: 8px;
			margin-bottom: 16px;
		`;

		const newHostInput = document.createElement("input");
		newHostInput.type = "text";
		newHostInput.placeholder = "http://...";
		newHostInput.style.cssText = `
			flex: 1;
			background: rgba(255,255,255,0.1);
			border: 1px solid rgba(255,255,255,0.2);
			border-radius: 6px;
			padding: 8px 12px;
			color: #fff;
			font-size: 0.9em;
			outline: none;
			transition: border 0.2s;
		`;
		newHostInput.onfocus = () => newHostInput.style.borderColor = "rgba(0,102,204,0.5)";
		newHostInput.onblur = () => newHostInput.style.borderColor = "rgba(255,255,255,0.2)";

		const addBtn = document.createElement("button");
		addBtn.type = "button";
		addBtn.style.cssText = `
			background: #00aa00;
			color: #fff;
			border: none;
			border-radius: 6px;
			padding: 8px 16px;
			cursor: pointer;
			font-size: 0.85em;
			font-weight: 700;
			white-space: nowrap;
			transition: background 0.2s;
		`;
		addBtn.textContent = typeof str_Add !== "undefined" ? str_Add : "Hozzáad";
		addBtn.onmouseover = () => addBtn.style.background = "#008800";
		addBtn.onmouseout = () => addBtn.style.background = "#00aa00";
		addBtn.onclick = () => {
			const newHost = newHostInput.value.trim();
			if (newHost) {
				addBoosterHost(newHost);
				newHostInput.value = "";
				closeModal();
				openBoosterModal();
			}
		};

		// Enter-re is reagáljon
		newHostInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") addBtn.onclick();
		});

		addContainer.appendChild(newHostInput);
		addContainer.appendChild(addBtn);
		contentBody.appendChild(addContainer);


		// Escape-re bezárás
		const onKeyDown = (e) => {
			if (e.key === "Escape") {
				closeModal();
				document.removeEventListener("keydown", onKeyDown);
			}
		};
		document.addEventListener("keydown", onKeyDown);
		
		// Overlay klikre bezárás
		modal.addEventListener('click', (e) => {
			if (e.target === modal) closeModal();
		});

		content.appendChild(contentBody);
		modal.appendChild(content);
		
		// is-open osztály hozzáadása az animációhoz
		requestAnimationFrame(() => modal.classList.add('is-open'));
		
		return modal;
	}

	function openBoosterModal() {
		// Ha az aktuális Host nem szerepel a listában, add hozzá
		const currentHost = typeof Host !== "undefined" ? Host : "";
		if (currentHost && !getBoosterHosts().includes(currentHost)) {
			addBoosterHost(currentHost);
		}
		const modal = createBoosterModal();
		document.body.appendChild(modal);
	}

	// ---- SZINKRON (MOST MÁR OKÉ) ----
	function syncBoosterUI() {
		const on = (getCookie("Booster") == 1);
		tInput.checked = on;                       // Checkbox beállítása
		btnBoosterMenu.classList.toggle("is-on", on); // Gomb állapotának változtatása
		menuPanel.classList.toggle("is-boosterOpen", on); // Booster panel nyitása/zárása
		btnBoosterMenu.classList.toggle("is-on", on);
		console.log("on in sync:", on);
		console.log("BOOSTER in sync:", getCookie("Booster"));
	}
	syncBoosterUI();

	// ---- TOGGLE MŰKÖDÉS ----
	tInput.addEventListener("change", () => {
		const next = tInput.checked;
		btnBoosterMenu.classList.toggle("is-on", next);
		try { setCookie("Booster", next ? "1" : "0"); } catch (e) { }
		// try { toggleButton("Booster", 0, next ? 1 : 0); } catch(e){}
		console.log("BOOSTER set to:", getCookie("Booster"));
	});

	// ---- GOMB: HOST MODAL MEGNYITÁSA ----
	btnBoosterMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		openBoosterModal();
	};

	// ---- ÖSSZERAKÁS ----
	boosterRow.append(btnBoosterMenu, boosterToggle);
	menuPanel.append(boosterRow);


	// ===== Auto Refresh sor a menüben =====
	const ARKEY_ENABLED = "myio.autoRefresh.enabled";
	const ARKEY_INTERVAL = "myio.autoRefresh.interval";
	let autoRefreshTimer = null;

	const autoRefreshRow = document.createElement("div");
	autoRefreshRow.className = "myio-menuRow myio-menuRowAutoRefresh";

	const btnAutoRefreshMenu = document.createElement("button");
	btnAutoRefreshMenu.type = "button";
	btnAutoRefreshMenu.className = "myio-btn small myio-menuAutoRefreshBtn";
	btnAutoRefreshMenu.textContent =
		(typeof str_Auto_Refresh !== "undefined" ? str_Auto_Refresh : "Auto");

	// ---- TOGGLE ----
	const autoRefreshToggle = document.createElement("label");
	autoRefreshToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const arInput = document.createElement("input");
	arInput.type = "checkbox";

	const arTrack = document.createElement("span");
	arTrack.className = "myio-miniTrack";

	autoRefreshToggle.append(arInput, arTrack);

	// ---- LENYÍLÓ INTERVAL PANEL ----
	const autoRefreshPanel = document.createElement("div");
	autoRefreshPanel.className = "myio-menuSub myio-autoRefreshSub";

	// ---- LOGARITMIKUS SKÁLA UTILITY ----
	const ARUtils = {
		// Linear (0-100) → Actual seconds
		// 0-50: 5-60 sec (másodpercenként)
		// 50-100: 60-600 sec (log skála, percenként)
		linearToSeconds: (linear) => {
			const lin = Math.max(0, Math.min(100, linear));
			if (lin <= 50) {
				// Lineáris: 5-60 másodperc
				return Math.round(5 + (lin / 50) * 55);
			}
			// Log: 60-600 másodperc
			const logRange = (lin - 50) / 50; // 0-1
			const logFactor = Math.pow(10, logRange * Math.log10(10)); // 10x range
			return Math.round(60 * logFactor);
		},

		// Actual seconds → Linear (0-100)
		secondsToLinear: (sec) => {
			sec = Math.max(5, Math.min(600, sec));
			if (sec <= 60) {
				return (sec - 5) / 55 * 50;
			}
			const logFactor = sec / 60;
			const logRange = Math.log10(logFactor) / Math.log10(10);
			return 50 + logRange * 50;
		},

		// Formázás
		formatSeconds: (sec) => {
			sec = Math.round(sec);
			if (sec < 60) return sec + "s";
			return Math.round(sec / 60) + "m";
		}
	};

	// ---- UI ELEMEK ----
	const intervalRow = document.createElement("div");
	intervalRow.style.display = "flex";
	intervalRow.style.alignItems = "center";
	intervalRow.style.gap = "10px";
	intervalRow.style.marginBottom = "8px";

	const intervalLabel = document.createElement("label");
	intervalLabel.textContent = (typeof str_Auto_Refresh !== "undefined" ? str_Auto_Refresh : "Auto") + ":";
	intervalLabel.style.color = "rgba(255,255,255,.85)";
	intervalLabel.style.fontWeight = "800";
	intervalLabel.style.whiteSpace = "nowrap";
	intervalLabel.style.fontSize = "0.95em";

	const intervalValue = document.createElement("div");
	intervalValue.style.color = "rgba(255,255,255,.9)";
	intervalValue.style.fontWeight = "700";
	intervalValue.style.minWidth = "3.2em";
	intervalValue.style.textAlign = "center";
	intervalValue.style.fontSize = "1.05em";

	intervalRow.append(intervalLabel, intervalValue);

	// Slider: 0-100 lineáris (logaritmikus konverzió)
	const intervalSlider = document.createElement("input");
	intervalSlider.type = "range";
	intervalSlider.min = "0";
	intervalSlider.max = "100";
	intervalSlider.step = "1";
	const savedVal = parseInt(localStorage.getItem(ARKEY_INTERVAL) || "30", 10);
	intervalSlider.value = String(ARUtils.secondsToLinear(Math.max(5, Math.min(600, savedVal))));
	intervalSlider.className = "myio-intervalSlider";
	intervalSlider.style.width = "100%";
	intervalSlider.style.boxSizing = "border-box";
	intervalSlider.style.cursor = "pointer";
	intervalSlider.style.flex = "1";

	// Input box: közvetlen másodperc bevitel
	const intervalInputBox = document.createElement("input");
	intervalInputBox.type = "number";
	intervalInputBox.min = "5";
	intervalInputBox.max = "600";
	intervalInputBox.step = "1";
	intervalInputBox.value = String(Math.max(5, Math.min(600, savedVal)));
	intervalInputBox.style.width = "60px";
	intervalInputBox.style.boxSizing = "border-box";
	intervalInputBox.style.borderRadius = "8px";
	intervalInputBox.style.border = "1px solid rgba(255,255,255,.2)";
	intervalInputBox.style.background = "rgba(255,255,255,.1)";
	intervalInputBox.style.color = "#fff";
	intervalInputBox.style.padding = "6px 8px";
	intervalInputBox.style.fontWeight = "700";
	intervalInputBox.style.fontSize = "0.9em";
	intervalInputBox.style.textAlign = "center";
	intervalInputBox.style.outline = "none";

	// Szinkronizációs függvény
	const updateIntervalDisplay = (seconds) => {
		seconds = Math.max(5, Math.min(600, Math.round(seconds)));

		// UI frissítés
		intervalValue.textContent = ARUtils.formatSeconds(seconds);
		intervalSlider.value = String(ARUtils.secondsToLinear(seconds));
		intervalInputBox.value = String(seconds);

		// Tárolis
		localStorage.setItem(ARKEY_INTERVAL, String(seconds));

		// Ha be van kapcsolva, újraindítjuk az időzítőt
		if (arInput.checked) {
			startAutoRefresh(seconds);
		}
	};

	// Slider: logaritmikus érték
	intervalSlider.addEventListener("input", () => {
		const seconds = ARUtils.linearToSeconds(parseInt(intervalSlider.value, 10));
		updateIntervalDisplay(seconds);
	});

	// Input box: közvetlen másodperc érték
	intervalInputBox.addEventListener("input", () => {
		let val = parseInt(intervalInputBox.value, 10) || 30;
		updateIntervalDisplay(val);
	});

	// Enter-re is reagáljon az input
	intervalInputBox.addEventListener("change", () => {
		let val = parseInt(intervalInputBox.value, 10) || 30;
		updateIntervalDisplay(val);
	});

	// Slider row: slider + input box
	const sliderRow = document.createElement("div");
	sliderRow.style.display = "flex";
	sliderRow.style.alignItems = "center";
	sliderRow.style.gap = "8px";
	sliderRow.style.marginBottom = "0px";

	sliderRow.append(intervalSlider, intervalInputBox);

	// Kezdeti érték megjelenítése
	updateIntervalDisplay(Math.max(5, Math.min(600, savedVal)));

	autoRefreshPanel.append(intervalRow, sliderRow);

	// ---- AUTO REFRESH FUNKCIÓK ----
	// AJAX alapú frissítés - nem tölti újra az oldalt!
	function startAutoRefresh(sec) {
		stopAutoRefresh();
		const ms = Math.max(5, sec) * 1000;
		autoRefreshTimer = setInterval(async () => {
			try {
				// Ha MyIOLive elérhető, AJAX frissítés
				if (typeof MyIOLive !== 'undefined') {
					const data = await MyIOLive.fetchSensOut();
					if (data) {
						MyIOLive.updateUI(data);
					}
				} else {
					// Fallback: régi működés
					sendForm();
				}
			} catch (e) {
				console.warn("Auto refresh failed:", e);
			}
		}, ms);
	}

	function stopAutoRefresh() {
		if (autoRefreshTimer) {
			clearInterval(autoRefreshTimer);
			autoRefreshTimer = null;
		}
	}

	// ---- SZINKRON ----
	function syncAutoRefreshUI() {
		const on = localStorage.getItem(ARKEY_ENABLED) === "1";
		arInput.checked = on;
		btnAutoRefreshMenu.classList.toggle("is-on", on);
		if (on) {
			const sec = parseInt(localStorage.getItem(ARKEY_INTERVAL) || "30", 10);
			startAutoRefresh(sec);
		} else {
			stopAutoRefresh();
		}
	}
	syncAutoRefreshUI();

	// ---- TOGGLE MŰKÖDÉS ----
	arInput.addEventListener("change", () => {
		const next = arInput.checked;
		btnAutoRefreshMenu.classList.toggle("is-on", next);
		localStorage.setItem(ARKEY_ENABLED, next ? "1" : "0");
		if (next) {
			const sec = parseInt(localStorage.getItem(ARKEY_INTERVAL) || "30", 10);
			startAutoRefresh(sec);
		} else {
			stopAutoRefresh();
		}
	});

	// ---- GOMB: INTERVAL PANEL LENYIT ----
	btnAutoRefreshMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menuPanel.classList.toggle("is-autoRefreshOpen");
	};

	// ---- ÖSSZERAKÁS ----
	autoRefreshRow.append(btnAutoRefreshMenu, autoRefreshToggle);
	menuPanel.append(autoRefreshRow, autoRefreshPanel);


	// ===== Language sor (külön, a menüben) =====
	if (typeof langJSON !== "undefined" && langJSON.languages != undefined) {
		const langWrap = document.createElement("div");
		langWrap.className = "myio-menuSub myio-langSub";

		const sel = document.createElement("select");
		sel.id = "Language";
		sel.name = "Language";

		for (const j in langJSON.languages) {
			const opt = document.createElement("option");
			opt.value = j;
			opt.textContent = (typeof str_language !== "undefined" && str_language[j]) ? str_language[j] : j;
			if (String(j) === String(language)) opt.selected = true;
			sel.append(opt);
		}

		sel.onchange = () => { try { setCookie("Language", sel.value); sendForm(); } catch (e) { } };
		langWrap.append(sel);

		menuPanel.appendChild(langWrap);
	}



	// zoom sor
	const zoomRow = document.createElement("div");
	zoomRow.className = "myio-menuRow";

	const zoomLabel = document.createElement("label");
	zoomLabel.textContent = (typeof str_Zoom !== "undefined" ? str_Zoom : "Zoom");

	const zoomVal = document.createElement("div");
	zoomVal.style.color = "rgba(255,255,255,.85)";
	zoomVal.style.fontWeight = "900";
	zoomVal.style.minWidth = "3.5em";
	zoomVal.style.textAlign = "right";

	zoomRow.append(zoomLabel, zoomVal);
	menuPanel.appendChild(zoomRow);

	const zoomRange = document.createElement("input");
	zoomRange.type = "range";
	zoomRange.min = "50";
	zoomRange.max = "150";
	zoomRange.step = "1";
	zoomRange.className = "myio-zoomRange";

	// init zoom localStorage-ből
	const ZKEY = "myio.zoom";
	const savedZoom = parseInt(localStorage.getItem(ZKEY) || "100", 10);
	const clamped = Math.max(50, Math.min(150, isFinite(savedZoom) ? savedZoom : 100));
	zoomRange.value = String(clamped);
	zoomVal.textContent = clamped + "%";

	// alkalmazás
	const applyZoom = (pct) => {
		const z = pct / 100;
		document.documentElement.style.setProperty("--myio-zoom", String(z));
	};
	applyZoom(clamped);

	zoomRange.addEventListener("input", () => {
		const pct = parseInt(zoomRange.value, 10) || 100;
		zoomVal.textContent = pct + "%";
		applyZoom(pct);
		requestAnimationFrame(() => {
			applyHeaderHeightVar();
			enableThumbOnlyRanges(document);
		});

	});
	zoomRange.addEventListener("change", () => {
		const pct = parseInt(zoomRange.value, 10) || 100;
		localStorage.setItem(ZKEY, String(pct));
	});

	menuPanel.appendChild(zoomRange);

	// logout gomb legalul
	const footer = document.createElement("div");
	footer.className = "myio-menuFooter";

	const btnLogout = document.createElement("button");
	btnLogout.type = "button";
	btnLogout.className = "myio-btn small";
	btnLogout.textContent = (str_LogOut || "Log out");
	btnLogout.onclick = () => {
		try {
			const b = document.createElement("button");
			b.name = "LogOut"; b.value = "1";
			changed(b);
		} catch (e) { }
	};
	
	footer.appendChild(btnLogout);

	
	// Export / Import
	const dataRow = document.createElement("div");
	dataRow.className = "myio-menuRow";
	dataRow.style.justifyContent = "center";
	dataRow.style.gap = "8px";
	dataRow.style.marginTop = "8px";
	dataRow.style.paddingTop = "8px";
	dataRow.style.borderTop = "1px solid rgba(255,255,255,0.1)";

	const btnExport = document.createElement("button");
	btnExport.type = "button";
	btnExport.className = "myio-btn small";
	btnExport.textContent = (typeof str_Export !== "undefined" ? str_Export : "Export");
	btnExport.style.flex = "1";
	btnExport.onclick = () => {
		const data = {};
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key.startsWith("myio.") || ["Language", "Booster", "Host", "AutoRefresh"].includes(key)) {
				data[key] = localStorage.getItem(key);
			}
		}
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const name = (typeof MYIOname === "string" && MYIOname.trim()) ? MYIOname.trim() : "myio";
		a.href = url;
		a.download = `${name}_backup_${new Date().toISOString().split('T')[0]}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const btnImport = document.createElement("button");
	btnImport.type = "button";
	btnImport.className = "myio-btn small";
	btnImport.textContent = (typeof str_Import !== "undefined" ? str_Import : "Import");
	btnImport.style.flex = "1";
	btnImport.onclick = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = (e) => {
			const file = e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (re) => {
				try {
					const data = JSON.parse(re.target.result);
					const conf = (typeof str_ConfirmImport !== "undefined" ? str_ConfirmImport : "Valóban visszaállítja a beállításokat? Az oldal újra fog töltődni.");
					if (confirm(conf)) {
						Object.keys(data).forEach(key => {
							localStorage.setItem(key, data[key]);
						});
						window.location.reload();
					}
				} catch (err) {
					alert((typeof str_ImportError !== "undefined" ? str_ImportError : "Hiba a fájl beolvasása közben!"));
				}
			};
			reader.readAsText(file);
		};
		input.click();
	};

	dataRow.append(btnExport, btnImport);
	menuPanel.appendChild(dataRow);
	menuPanel.appendChild(footer);

	// nyit/zár
	btnMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		nav.classList.toggle("is-menuOpen");
		nav.classList.remove("is-boosterOpen"); // ne legyen egyszerre nyitva
		setTimeout(applyHeaderHeightVar, 0);
	};

	// outside click zárás
	document.addEventListener("click", (e) => {
		if (!nav.classList.contains("is-menuOpen")) return;
		if (nav.contains(e.target)) return;
		nav.classList.remove("is-menuOpen");
	});

	// ESC zárás
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") nav.classList.remove("is-menuOpen");
	});

	menuWrap.append(btnMenu, menuPanel);

	// Settings ikon gomb (fogaskerék)
	const btnSettings = document.createElement("button");
	btnSettings.type = "button";
	btnSettings.className = "myio-iconBtn myio-settingsBtn";
	btnSettings.title = (str_Settings || "Settings");
	btnSettings.setAttribute("aria-label", btnSettings.title);
	btnSettings.innerHTML = "⚙️";   // fogaskerék ikon
	btnSettings.onclick = () => {
		window.location.href = "/setup";
	};

	// 👉 menü gomb BAL oldalára
	//right.append(btnSettings);

	const btnInfo = document.createElement("button");
	btnInfo.type = "button";
	btnInfo.className = "myio-iconBtn myio-settingsBtn";
	btnSettings.setAttribute("aria-label", btnSettings.title);
	btnInfo.textContent = ("i" /* info ikon */);
	btnInfo.fontSize = "0.3em";
	btnInfo.onclick = (e) => { e.preventDefault(); window.location.href = "https://smarthomeninja.hu/dashboard/"; };

	right.appendChild(btnInfo);

	right.append(menuWrap);


	// Message row – csak ha van üzenet
	if (typeof message !== "undefined" && message && message.length > 0) {
		const msg = document.createElement("div");
		msg.className = "myio-msg is-alert";
		msg.textContent = message;
		hdr.append(msg);
	}

	// Booster panel alapból zárva
	nav.classList.remove("is-boosterOpen");
	function applyHeaderHeightVar() {
		try {
			const hdr = document.querySelector(".header");
			if (!hdr) return;
			const r = hdr.getBoundingClientRect();
			const bottom = Math.ceil(r.bottom); // ✅ top + height, tartalmazza a top:5px-et is
			document.documentElement.style.setProperty("--header-h", bottom + "px");
		} catch (e) { }
	}

	applyHeaderHeightVar();
	window.addEventListener("resize", applyHeaderHeightVar);
	window.addEventListener("orientationchange", applyHeaderHeightVar);

	try {
		const hdr = document.querySelector(".header");
		if (hdr && window.ResizeObserver) {
			new ResizeObserver(applyHeaderHeightVar).observe(hdr);
		}
	} catch (e) { }
}

function enableThumbOnlyRanges(root = document) {
	const ranges = root.querySelectorAll('.myio-pcaRow input[type="range"]');

	ranges.forEach(r => {
		let wrap = r.closest('.myio-rangeWrap');
		let hit;

		if (!wrap) {
			wrap = document.createElement('div');
			wrap.className = 'myio-rangeWrap';
			r.parentNode.insertBefore(wrap, r);
			wrap.appendChild(r);

			hit = document.createElement('div');
			hit.className = 'myio-rangeThumbHit';
			wrap.appendChild(hit);
		} else {
			hit = wrap.querySelector('.myio-rangeThumbHit');
			if (!hit) {
				hit = document.createElement('div');
				hit.className = 'myio-rangeThumbHit';
				wrap.appendChild(hit);
			}
		}

		const min = parseFloat(r.min || "0");
		const max = parseFloat(r.max || "100");
		const step = parseFloat(r.step || "1");

		const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
		const snap = (v) => {
			if (!isFinite(step) || step <= 0) return v;
			const n = Math.round((v - min) / step);
			return min + n * step;
		};
		const valueToT = (v) => (v - min) / (max - min || 1);

		const placeHit = () => {
			const v = parseFloat(r.value || String(min));
			const t = clamp(valueToT(v), 0, 1);

			const wrapRect = wrap.getBoundingClientRect();
			const trackRect = r.getBoundingClientRect();

			const hw = hit.offsetWidth || 44; // fallback
			const trackLeftInWrap = trackRect.left - wrapRect.left;
			const usableW = Math.max(0, trackRect.width - hw);

			hit.style.left = Math.round(trackLeftInWrap + t * usableW) + "px";
		};

		const pointerToValue = (clientX) => {
			const trackRect = r.getBoundingClientRect();
			const x = clamp(clientX - trackRect.left, 0, trackRect.width);
			const t = trackRect.width ? (x / trackRect.width) : 0;
			return snap(min + t * (max - min));
		};

		// ✅ mindig frissíts, akkor is ha már wrap-elve volt
		requestAnimationFrame(placeHit);
		r.addEventListener('input', placeHit);

		// ✅ grid/oszlopszám váltás → wrap méret változik → újraszámol
		if (window.ResizeObserver && !wrap.__myioRO) {
			wrap.__myioRO = new ResizeObserver(() => placeHit());
			wrap.__myioRO.observe(wrap);
		}

		// drag csak a hit-ről
		let dragging = false;
		const setVal = (v) => {
			const nv = String(clamp(v, min, max));
			if (r.value !== nv) {
				r.value = nv;
				r.dispatchEvent(new Event('input', { bubbles: true }));
			}
		};

		const onMove = (e) => {
			if (!dragging) return;
			setVal(pointerToValue(e.clientX));
			placeHit();
			e.preventDefault();
		};
		const onUp = () => {
			if (!dragging) return;
			dragging = false;
			r.dispatchEvent(new Event('change', { bubbles: true }));
			document.removeEventListener('pointermove', onMove, true);
			document.removeEventListener('pointerup', onUp, true);
		};

		hit.onpointerdown = (e) => {
			dragging = true;
			setVal(pointerToValue(e.clientX));
			placeHit();
			document.addEventListener('pointermove', onMove, true);
			document.addEventListener('pointerup', onUp, true);
			e.preventDefault();
			e.stopPropagation();
		};
	});
}


/* egy közös, olcsó újraszámolás (ha változik a layout) */
const myioRO = window.ResizeObserver ? new ResizeObserver(() => enableThumbOnlyRanges(document)) : null;
window.addEventListener('resize', () => enableThumbOnlyRanges(document));


// Ninja AI Chatbot betöltése
if (typeof host !== 'undefined') {
	document.write('<script src="' + host + 'ninja-ai-chat.js?v=' + Date.now() + '"/><\/script>');
}

// LiveUpdate modul betöltése AJAX alapú frissítéshez
if (typeof host !== 'undefined') {
	document.write('<script src="' + host + 'liveUpdate.js"/><\/script>');
}
