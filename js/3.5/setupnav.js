/* setupnav.js - Modern Setup Navigation */

// Ensure viewport meta
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

if (typeof MYIOname === "undefined") {
	var MYIOname = document.title || "";
}
MYIOname = MYIOname.replace(/\s*-\s*Setup\s*$/i, ""); // "- Setup" from the end

// Build header on DOM ready
(function () {
	function safeBuildHeader() {
		if (!document.body) {
			requestAnimationFrame(safeBuildHeader);
			return;
		}
		buildSetupHeader();
	}
	safeBuildHeader();
})();

function buildSetupHeader() {
	// Overlay
	if (!document.getElementById("overlay")) {
		const ov = document.createElement("div");
		ov.id = "overlay";
		document.body.prepend(ov);
	}

	// Header container
	let hdr = document.querySelector(".header");
	if (!hdr) {
		hdr = document.createElement("div");
		hdr.className = "header";
		document.body.prepend(hdr);
	}
	hdr.innerHTML = ""; // Clear

	// Forms (keep original logic)
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

	const form3 = document.createElement("form");
	form3.method = "POST";
	form3.id = "form3";
	form3.innerHTML = `
    <input type="hidden" name="X" id="X" value="0">
    <input type="hidden" name="Y" id="Y" value="0">
    <input type="hidden" name="t_id" id="id" value="0">
    <input type="hidden" name="t_sunset" id="sunset" value="0">
    <input type="hidden" name="t_sunrise" id="sunrise" value="0">
    <input type="hidden" name="t_month" id="month" value="-">
    <input type="hidden" name="t_day" id="day" value="-">
    <input type="hidden" name="t_hour" id="hour" value="0">
    <input type="hidden" name="t_minute" id="minute" value="0">
    <input type="hidden" name="t_days" id="days" value="0">
    <input type="hidden" name="t_event" id="timerEvent" value="-">
    <input type="hidden" name="t_eventParam" id="timerEventParam" value="-">
  `;

	hdr.append(form, form2, form3);

	// Nav shell
	const nav = document.createElement("div");
	nav.className = "myio-nav";
	hdr.append(nav);

	const left = document.createElement("div");
	left.className = "myio-left";
	const mid = document.createElement("div");
	mid.className = "myio-mid";
	const right = document.createElement("div");
	right.className = "myio-right";

	nav.append(left, mid, right);

	// Update button
	const btnUpdate = document.createElement("button");
	btnUpdate.type = "button";
	btnUpdate.className = "myio-iconBtn";
	btnUpdate.title = (typeof str_Update !== "undefined" ? str_Update : "Update");
	btnUpdate.setAttribute("aria-label", btnUpdate.title);
	btnUpdate.innerHTML = "↻";
	btnUpdate.style.transform = "rotate(90deg)";
	btnUpdate.onclick = () => {
		try {
			sendForm();
		} catch (e) { }
	};
	left.append(btnUpdate);

	// Home button removed - functionality moved to logo

	// Mid - Title & Logo (logo now clickable for home navigation)
	const logo = document.createElement("img");
	logo.className = "myio-logo";
	logo.src = host + "img/myIO_logo_white.svg";
	logo.alt = "myIO";
	logo.decoding = "async";
	logo.loading = "eager";
	logo.style.cursor = "pointer";
	logo.title = (typeof str_Home !== "undefined" ? str_Home : "Home");
	logo.onclick = () => {
		window.location.href = "/";
	};
	mid.prepend(logo);

	const title = document.createElement("div");
	title.className = "myio-title";
	title.textContent = (typeof str_Settings !== "undefined" ? str_Settings : "Settings");
	mid.append(title);

	// Right - Menu panel
	const menuWrap = document.createElement("div");
	menuWrap.style.position = "relative";

	const menuPanel = document.createElement("div");
	menuPanel.className = "myio-menuPanel";

	const btnMenu = document.createElement("button");
	btnMenu.type = "button";
	btnMenu.className = "myio-menuBtn";
	btnMenu.textContent = "";
	btnMenu.title = (typeof str_Menu !== "undefined" ? str_Menu : "Menu");

	// Menu title
	const menuTitle = document.createElement("div");
	menuTitle.className = "myio-menuTitle";
	menuTitle.textContent = (typeof str_Menu !== "undefined" ? str_Menu : "Menu");
	menuPanel.appendChild(menuTitle);

	// Navigation row
	const navRow = document.createElement("div");
	navRow.className = "myio-menuRow myio-menuRowNav";

	// Setup menu buttons
	const setupPages = [
		{ label: str_General || "General", href: "/setup" },
		{ label: str_Output || "Output", href: "/output" },
		{ label: str_PCA_Output || "PCA Output", href: "/pcaout" },
		{ label: str_Input || "Input", href: "/input" },
		{ label: str_Groups || "Groups", href: "/groups" },
		{ label: str_Users || "Users", href: "/users" },
		{ label: str_Timer || "Timer", href: "/timer" }
	];

	if (VersionCheck && VersionCheck("3.6")) {
		setupPages.push({ label: str_Dict || "Dict", href: "/dict" });
	}

	if (VersionCheck && VersionCheck("3.7.1")) {
		setupPages.push({ label: str_Emanager || "Energy Manager", href: "/emanager" });
	}

	setupPages.push({ label: str_Log || "Log", href: "/evlog" });

	// Create compact button grid
	const setupGrid = document.createElement("div");
	setupGrid.style.display = "grid";
	setupGrid.style.gridTemplateColumns = "repeat(2, 1fr)";
	setupGrid.style.gap = "8px";
	setupGrid.style.marginBottom = "12px";

	setupPages.forEach(page => {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "myio-btn small";
		btn.textContent = page.label;
		btn.onclick = () => {
			window.location.href = page.href;
		};
		setupGrid.appendChild(btn);
	});

	menuPanel.appendChild(setupGrid);

	// Save/Load buttons
	const saveLoadRow = document.createElement("div");
	saveLoadRow.className = "myio-menuRow";
	saveLoadRow.style.gap = "8px";
	saveLoadRow.style.display = "flex";

	const btnSave = document.createElement("button");
	btnSave.type = "button";
	btnSave.className = "myio-btn small";
	btnSave.textContent = (str_Save || "Save");
	btnSave.style.flex = "1";
	btnSave.onclick = () => {
		if (window.location.pathname !== "/dict") {
			window.location.href = "/save";
		} else {
			try {
				SaveJSNs();
			} catch (e) { }
		}
	};

	const btnLoad = document.createElement("button");
	btnLoad.type = "button";
	btnLoad.className = "myio-btn small";
	btnLoad.textContent = (str_Load || "Load");
	btnLoad.style.flex = "1";
	btnLoad.onclick = () => {
		window.location.href = "/load";
	};

	saveLoadRow.append(btnSave, btnLoad);
	menuPanel.appendChild(saveLoadRow);

	// Save Immediately section
	const saveImmediatelyRow = document.createElement("div");
	saveImmediatelyRow.className = "myio-menuRow myio-menuRowSaveImmediate";

	const btnSaveImmediateMenu = document.createElement("button");
	btnSaveImmediateMenu.type = "button";
	btnSaveImmediateMenu.className = "myio-btn small myio-menuSaveImmediateBtn";
	btnSaveImmediateMenu.innerHTML = "💾 Save Immediately";
	btnSaveImmediateMenu.title = "Save Immediately";

	const saveImmediateToggle = document.createElement("label");
	saveImmediateToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const siInput = document.createElement("input");
	siInput.type = "checkbox";

	const siTrack = document.createElement("span");
	siTrack.className = "myio-miniTrack";

	saveImmediateToggle.append(siInput, siTrack);

	const saveImmediatePanel = document.createElement("div");
	saveImmediatePanel.className = "myio-menuSub myio-saveImmediateSub";
	saveImmediatePanel.id = "saveImmediately";

	// Check if save immediately should be visible based on current page
	const pathname = window.location.pathname;
	if (pathname == "/output"
		|| pathname == "/input"
		|| pathname == "/setup"
		|| pathname == "/groups"
		|| pathname == "/emanager"
		|| pathname == "/pcaout") {
		// Hide save immediately for these pages
		saveImmediatelyRow.style.display = "none";
		try {
			if (typeof hideSave === "function") {
				hideSave();
			}
		} catch (e) { }
	} else if (pathname == "/computherm" || pathname == "/broadlink") {
		try {
			if (typeof broadlinkSave === "function") {
				broadlinkSave();
			}
		} catch (e) { }
	}

	function syncSaveImmediateUI() {
		const on = menuPanel.classList.contains("is-saveImmediateOpen");
		siInput.checked = on;
		btnSaveImmediateMenu.classList.toggle("is-on", on);
	}
	syncSaveImmediateUI();

	siInput.addEventListener("change", () => {
		const next = siInput.checked;
		btnSaveImmediateMenu.classList.toggle("is-on", next);
	});

	btnSaveImmediateMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menuPanel.classList.toggle("is-saveImmediateOpen");
		syncSaveImmediateUI();
	};

	saveImmediatelyRow.append(btnSaveImmediateMenu, saveImmediateToggle);
	menuPanel.append(saveImmediatelyRow, saveImmediatePanel);

	// Booster section
	const boosterRow = document.createElement("div");
	boosterRow.className = "myio-menuRow myio-menuRowBooster";

	const btnBoosterMenu = document.createElement("button");
	btnBoosterMenu.type = "button";
	btnBoosterMenu.className = "myio-btn small myio-menuBoosterBtn";
	btnBoosterMenu.textContent = (typeof str_Booster !== "undefined" ? str_Booster : "Booster");

	const boosterToggle = document.createElement("label");
	boosterToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const tInput = document.createElement("input");
	tInput.type = "checkbox";

	const tTrack = document.createElement("span");
	tTrack.className = "myio-miniTrack";

	boosterToggle.append(tInput, tTrack);

	const boosterPanel = document.createElement("div");
	boosterPanel.className = "myio-menuSub myio-boosterSub";

	const hostInput = document.createElement("input");
	hostInput.type = "text";
	hostInput.maxLength = 200;
	hostInput.name = "Host";
	hostInput.value = (typeof Host !== "undefined" ? Host : "");
	hostInput.placeholder = (typeof str_Host !== "undefined" ? str_Host : "Host");
	hostInput.onchange = () => {
		try {
			setCookie("Host", hostInput.value);
		} catch (e) { }
	};
	boosterPanel.append(hostInput);

	function syncBoosterUI() {
		const on = getCookie("Booster") == 1;
		tInput.checked = on;
		btnBoosterMenu.classList.toggle("is-on", on);
		menuPanel.classList.toggle("is-boosterOpen", on);
	}
	syncBoosterUI();

	tInput.addEventListener("change", () => {
		const next = tInput.checked;
		btnBoosterMenu.classList.toggle("is-on", next);
		try {
			setCookie("Booster", next ? "1" : "0");
		} catch (e) { }
	});

	btnBoosterMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menuPanel.classList.toggle("is-boosterOpen");
	};

	boosterRow.append(btnBoosterMenu, boosterToggle);
	menuPanel.append(boosterRow, boosterPanel);

	// Auto Refresh
	const ARKEY_ENABLED = "myio.autoRefresh.enabled";
	const ARKEY_INTERVAL = "myio.autoRefresh.interval";
	let autoRefreshTimer = null;

	const autoRefreshRow = document.createElement("div");
	autoRefreshRow.className = "myio-menuRow myio-menuRowAutoRefresh";

	const btnAutoRefreshMenu = document.createElement("button");
	btnAutoRefreshMenu.type = "button";
	btnAutoRefreshMenu.className = "myio-btn small myio-menuAutoRefreshBtn";
	btnAutoRefreshMenu.textContent = (typeof str_Auto_Refresh !== "undefined" ? str_Auto_Refresh : "Auto");

	const autoRefreshToggle = document.createElement("label");
	autoRefreshToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const arInput = document.createElement("input");
	arInput.type = "checkbox";

	const arTrack = document.createElement("span");
	arTrack.className = "myio-miniTrack";

	autoRefreshToggle.append(arInput, arTrack);

	const autoRefreshPanel = document.createElement("div");
	autoRefreshPanel.className = "myio-menuSub myio-autoRefreshSub";

	const ARUtils = {
		linearToSeconds: (linear) => {
			const lin = Math.max(0, Math.min(100, linear));
			if (lin <= 50) {
				return Math.round(5 + (lin / 50) * 55);
			}
			const logRange = (lin - 50) / 50;
			const logFactor = Math.pow(10, logRange * Math.log10(10));
			return Math.round(60 * logFactor);
		},
		secondsToLinear: (sec) => {
			sec = Math.max(5, Math.min(600, sec));
			if (sec <= 60) {
				return (sec - 5) / 55 * 50;
			}
			const logFactor = sec / 60;
			const logRange = Math.log10(logFactor) / Math.log10(10);
			return 50 + logRange * 50;
		},
		formatSeconds: (sec) => {
			sec = Math.round(sec);
			if (sec < 60) return sec + "s";
			return Math.round(sec / 60) + "m";
		}
	};

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

	const updateIntervalDisplay = (seconds) => {
		seconds = Math.max(5, Math.min(600, Math.round(seconds)));
		intervalValue.textContent = ARUtils.formatSeconds(seconds);
		intervalSlider.value = String(ARUtils.secondsToLinear(seconds));
		intervalInputBox.value = String(seconds);
		localStorage.setItem(ARKEY_INTERVAL, String(seconds));

		if (arInput.checked) {
			startAutoRefresh(seconds);
		}
	};

	intervalSlider.addEventListener("input", () => {
		const seconds = ARUtils.linearToSeconds(parseInt(intervalSlider.value, 10));
		updateIntervalDisplay(seconds);
	});

	intervalInputBox.addEventListener("input", () => {
		let val = parseInt(intervalInputBox.value, 10) || 30;
		updateIntervalDisplay(val);
	});

	intervalInputBox.addEventListener("change", () => {
		let val = parseInt(intervalInputBox.value, 10) || 30;
		updateIntervalDisplay(val);
	});

	const sliderRow = document.createElement("div");
	sliderRow.style.display = "flex";
	sliderRow.style.alignItems = "center";
	sliderRow.style.gap = "8px";
	sliderRow.style.marginBottom = "0px";

	sliderRow.append(intervalSlider, intervalInputBox);

	updateIntervalDisplay(Math.max(5, Math.min(600, savedVal)));

	autoRefreshPanel.append(intervalRow, sliderRow);

	function startAutoRefresh(sec) {
		stopAutoRefresh();
		const ms = Math.max(5, sec) * 1000;
		autoRefreshTimer = setInterval(() => {
			try {
				sendForm();
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

	btnAutoRefreshMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		menuPanel.classList.toggle("is-autoRefreshOpen");
	};

	autoRefreshRow.append(btnAutoRefreshMenu, autoRefreshToggle);
	menuPanel.append(autoRefreshRow, autoRefreshPanel);

	// SuperVisor checkbox (if needed)
	const svRow = document.createElement("div");
	svRow.className = "myio-menuRow";

	const svLabel = document.createElement("label");
	svLabel.textContent = (str_SuperVisor || "SuperVisor");
	svLabel.style.color = "rgba(255,255,255,.85)";

	const svToggle = document.createElement("label");
	svToggle.className = "myio-miniToggle myio-miniToggleMenu";

	const svInput = document.createElement("input");
	svInput.type = "checkbox";
	svInput.id = "cb_SuperVisor";

	const svTrack = document.createElement("span");
	svTrack.className = "myio-miniTrack";

	svToggle.append(svInput, svTrack);

	if (getCookie("SuperVisor") == '1') {
		svInput.checked = true;
	}

	svInput.addEventListener("change", () => {
		try {
			setCookie("SuperVisor", svInput.checked ? "1" : "0");
		} catch (e) { }
	});

	svRow.append(svLabel, svToggle);
	menuPanel.appendChild(svRow);

	// Language if available
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

		sel.onchange = () => {
			try {
				setCookie("Language", sel.value);
				sendForm();
			} catch (e) { }
		};
		langWrap.append(sel);

		menuPanel.appendChild(langWrap);
	}

	// Menu open/close
	btnMenu.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		nav.classList.toggle("is-menuOpen");
		setTimeout(() => applyHeaderHeightVar(), 0);
	};

	document.addEventListener("click", (e) => {
		if (!nav.classList.contains("is-menuOpen")) return;
		if (nav.contains(e.target)) return;
		nav.classList.remove("is-menuOpen");
	});

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") nav.classList.remove("is-menuOpen");
	});

	menuWrap.append(btnMenu, menuPanel);
	right.append(menuWrap);

	// Message row
	if (typeof message !== "undefined" && message && message.length > 0) {
		const msg = document.createElement("div");
		msg.className = "myio-msg is-alert";
		msg.textContent = message;
		hdr.append(msg);
	}

	nav.classList.remove("is-boosterOpen");

	function applyHeaderHeightVar() {
		try {
			const hdr = document.querySelector(".header");
			if (!hdr) return;
			const r = hdr.getBoundingClientRect();
			const bottom = Math.ceil(r.bottom);
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

// Initialize auto refresh from old cookies
const cb_AutoRefresh = getCookie("AutoRefresh") !== '0';

window.addEventListener("load", function () {
	window.scrollTo(x, y);
});