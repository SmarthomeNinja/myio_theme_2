/* setup.js - Modern Setup Page Implementation */

// Load setup.css
(() => {
	try {
		const href = host + 'setup.css';
		if (!document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			link.onerror = () => console.error('Failed to load setup.css:', href);
			document.head.appendChild(link);
		}
	} catch (e) {
		console.error('Error loading setup.css:', e);
	}
})();

// Wait for DOM to be ready
function initSetupPage() {
	if (!document.body) {
		requestAnimationFrame(initSetupPage);
		return;
	}
	renderSetupPage();
}

// Helper functions
//const B_var = (label) => ({ label });
//const B_End = () => { };

// Create setup container
function renderSetupPage() {
	// Remove old content div if exists
	const oldContent = document.querySelector('.content');
	if (oldContent) oldContent.remove();

	// Create main container
	const container = document.createElement('div');
	container.className = 'setup-container';
	document.body.appendChild(container);

	// Create grid
	const grid = document.createElement('div');
	grid.className = 'setup-grid';
	container.appendChild(grid);

	// Render sections
	renderGeneralSetup(grid);
	renderAdvancedSettings(grid);
	renderSystemInfo(grid);
	renderAdminCommands(grid);

	// Scroll to saved position
	window.scrollTo(x, y);
}

// ======================
// GENERAL SETUP SECTION
// ======================
function renderGeneralSetup(container) {
	const section = createSection(str_GenSetup || 'General Setup');
	container.appendChild(section);

	// Server Name
	addInputRow(section, str_ServName || 'Server Name',
		createInput('text', 'MYIOname', MYIOname, { maxlength: 20, placeholder: '-' }));

	// mDNS Host Name (read-only display)
	if (VersionCheck("3.11.1")) {
		addRow(section, 'mDNS Host Name',
			createValue(`http://${mdns}.local`));
	}

	// IP Address
	addRow(section, str_IPAddress || 'IP Address',
		createIPGroup('ip', ip));

	// Time Server
	addRow(section, str_TimeServ || 'Time Server',
		createIPGroup('ts', timeServer));

	// Time Zone
	const tzRow = createRow(str_TimeZone || 'Time Zone');
	const tzGroup = document.createElement('div');
	tzGroup.className = 'setup-inline-group';

	const tzInput = createInput('number', 'tz', timeZone, {
		min: -24, max: 24, maxlength: 3, style: 'width: 4em'
	});
	tzGroup.appendChild(tzInput);

	const tzUnit = document.createElement('span');
	tzUnit.textContent = str_Hours || 'hours';
	tzUnit.style.color = 'rgba(255,255,255,0.6)';
	tzGroup.appendChild(tzUnit);

	const syncBtn = createButton(str_TimeSync || 'Sync Time', 'T_Sync', 1);
	tzGroup.appendChild(syncBtn);

	tzRow.appendChild(tzGroup);
	section.appendChild(tzRow);

	// Date
	const dateRow = createRow(str_Date || 'Date');
	const dateGroup = document.createElement('div');
	dateGroup.className = 'setup-ip-group';

	dateGroup.appendChild(createInput('number', 'year', year, {
		min: 2015, max: 9999, maxlength: 4, style: 'width: 5em'
	}));
	dateGroup.appendChild(createSeparator('-'));
	dateGroup.appendChild(createInput('number', 'month', month, {
		min: 1, max: 12, maxlength: 2, style: 'width: 3em'
	}));
	dateGroup.appendChild(createSeparator('-'));
	dateGroup.appendChild(createInput('number', 'day', day, {
		min: 1, max: 31, maxlength: 2, style: 'width: 3em'
	}));

	dateRow.appendChild(dateGroup);
	section.appendChild(dateRow);

	// Time
	const timeRow = createRow(str_Time || 'Time');
	const timeGroup = document.createElement('div');
	timeGroup.className = 'setup-ip-group';

	timeGroup.appendChild(createInput('number', 'hour', hour, {
		min: 0, max: 23, maxlength: 2, style: 'width: 3em'
	}));
	timeGroup.appendChild(createSeparator(':'));
	timeGroup.appendChild(createInput('number', 'minute', minute, {
		min: 0, max: 59, maxlength: 2, style: 'width: 3em'
	}));

	timeRow.appendChild(timeGroup);
	section.appendChild(timeRow);

	// Longitude & Latitude
	if (VersionCheck("3.7.4")) {
		addInputRow(section, 'Longitude',
			createInput('number', 'longitude', longitude, { min: 0, maxlength: 10, style: 'width: 8em' }));

		addInputRow(section, 'Latitude',
			createInput('number', 'latitude', latitude, { min: 0, maxlength: 10, style: 'width: 8em' }));
	}

	// Default Language
	const langSelect = createSelect('defaultLanguage', str_language, defaultLanguage);
	addRow(section, str_DefaultLanguage || 'Default Language', langSelect);

	// Boot Slot
	addInputRow(section, str_BootSlot || 'Boot Slot',
		createInput('number', 'bootUpSlot', bootUpSlot, { min: 0, maxlength: 3, style: 'width: 4em' }));

	// Event Logger
	addCheckboxRow(section, str_Log || 'Event Logger', 'evlog', eventLogger);

	// Sensor Logger  addCheckboxRow(section, str_sLog || 'Sensor Logger', 'slog', sensorLogger);

	// SDM Logger
	if (VersionCheck("3.7.1")) {
		addCheckboxRow(section, str_SDMLog || 'SDM Logger', 'SDMLogger', SDMLogger);
	}
}

// ======================
// ADVANCED SETTINGS
// ======================
function renderAdvancedSettings(container) {
	const section = createSection(str_AdvSet || 'Advanced Settings');
	container.appendChild(section);

	// Broadcast
	addCheckboxRow(section, 'Broadcast', 'BroadCast', _broadcast);

	// BroadLink
	if (VersionCheck("3.11")) {
		const blRow = createRow('BroadLink');
		const blGroup = document.createElement('div');
		blGroup.className = 'setup-inline-group';

		const blCheck = createCheckbox('BroadLink', _broadLink);
		blGroup.appendChild(blCheck);

		const blBtn = createButton('Setup BroadLink', null, null, () => {
			window.location.href = '/broadlink';
		});
		blBtn.className = 'setup-button secondary';
		blGroup.appendChild(blBtn);

		blRow.appendChild(blGroup);
		section.appendChild(blRow);
	}

	// MAC Address
	const macRow = createRow(str_MAC || 'MAC Address');
	const macGroup = document.createElement('div');
	macGroup.className = 'setup-mac-group';

	for (let i = 0; i < 6; i++) {
		const input = createInput('text', `mac*${i}`, mac[i].toString(16), {
			maxlength: 2,
			pattern: '[A-Fa-f0-9]{2}',
			className: 'setup-mac-input'
		});
		macGroup.appendChild(input);
		if (i < 5) {
			const sep = document.createElement('span');
			sep.className = 'setup-mac-separator';
			sep.textContent = ':';
			macGroup.appendChild(sep);
		}
	}

	macRow.appendChild(macGroup);
	section.appendChild(macRow);

	// Gateway Address
	addRow(section, str_GatewayAddress || 'Gateway Address',
		createIPGroup('gateway', gateway));

	// Subnet Mask
	if (VersionCheck("3.11.1")) {
		addRow(section, str_SubnetMask || 'Subnet Mask',
			createIPGroup('subnet', subnet));
	}

	// Hit Time Limit
	const hitRow = createRow(str_HitTL || 'Hit Time Limit');
	const hitGroup = document.createElement('div');
	hitGroup.className = 'setup-inline-group';
	hitGroup.appendChild(createInput('number', 'hitTimeLimit', hitTimeLimit, {
		min: 0, maxlength: 6, style: 'width: 5em'
	}));
	const hitUnit = document.createElement('span');
	hitUnit.textContent = 'msec';
	hitUnit.style.color = 'rgba(255,255,255,0.6)';
	hitGroup.appendChild(hitUnit);
	hitRow.appendChild(hitGroup);
	section.appendChild(hitRow);

	// Press Time Limit
	const pressRow = createRow(str_PushTL || 'Press Time Limit');
	const pressGroup = document.createElement('div');
	pressGroup.className = 'setup-inline-group';
	pressGroup.appendChild(createInput('number', 'pressTimeLimit', pressTimeLimit, {
		min: 0, maxlength: 6, style: 'width: 5em'
	}));
	const pressUnit = document.createElement('span');
	pressUnit.textContent = 'msec';
	pressUnit.style.color = 'rgba(255,255,255,0.6)';
	pressGroup.appendChild(pressUnit);
	pressRow.appendChild(pressGroup);
	section.appendChild(pressRow);

	// Sensor Sampling
	addInputRow(section, str_SensorSampling || 'Sensor Sampling',
		createInput('number', 'sensorSampling', sensorSampling, { min: 0, max: 255, maxlength: 6, style: 'width: 4em' }));

	// SDM Timer
	if (VersionCheck("3.7.1")) {
		const sdmRow = createRow(str_SDMTimer || 'SDM Timer');
		const sdmGroup = document.createElement('div');
		sdmGroup.className = 'setup-inline-group';
		sdmGroup.appendChild(createInput('number', 'SDMTimer', SDMTimer, {
			min: 0, max: 32000, maxlength: 6, style: 'width: 6em'
		}));
		const sdmUnit = document.createElement('span');
		sdmUnit.textContent = 'sec';
		sdmUnit.style.color = 'rgba(255,255,255,0.6)';
		sdmGroup.appendChild(sdmUnit);
		sdmRow.appendChild(sdmGroup);
		section.appendChild(sdmRow);
	}

	// Temp Timer
	addTimerRow(section, str_TempTimer || 'Temp Timer', 'tempTimer', tempTimer);

	// Humidity Timer
	addTimerRow(section, str_HumTimer || 'Humidity Timer', 'humTimer', humTimer);

	// Mixer Timer
	addTimerRow(section, str_MixerTimer || 'Mixer Timer', 'mixerTimer', mixerTimer);

	// Ethernet Init
	addTimerRow(section, str_EthInit || 'Ethernet Init', 'ethernetTimer', ethernetInitTimer);

	// HTTP Overrun
	addTimerRow(section, str_HTTPoverrun || 'HTTP Overrun', 'HO', httpTimeOverrun);

	// Consumption
	const consRow = createRow(str_Consump || 'Consumption');
	const consGroup = document.createElement('div');
	consGroup.className = 'setup-inline-group';
	consGroup.appendChild(createInput('number', 'impulsePerUnit', impulsePerUnit, {
		min: 0, maxlength: 4, style: 'width: 5em'
	}));
	const impLabel = document.createElement('span');
	impLabel.textContent = (str_Impulse || 'impulse') + ' :';
	impLabel.style.color = 'rgba(255,255,255,0.6)';
	consGroup.appendChild(impLabel);
	consGroup.appendChild(createInput('text', 'consumptionUnit', consumptionUnit || '', {
		maxlength: 5, style: 'width: 5em', placeholder: '-'
	}));
	consRow.appendChild(consGroup);
	section.appendChild(consRow);

	// Consumption Average
	const avgRow = createRow(str_ConsumpAvg || 'Consumption Average');
	const avgGroup = document.createElement('div');
	avgGroup.className = 'setup-inline-group';
	avgGroup.appendChild(createInput('number', 'CCLC', CCLC, {
		min: 0, maxlength: 6, style: 'width: 5em'
	}));
	const avgUnit = document.createElement('span');
	avgUnit.textContent = 'imp';
	avgUnit.style.color = 'rgba(255,255,255,0.6)';
	avgGroup.appendChild(avgUnit);
	avgRow.appendChild(avgGroup);
	section.appendChild(avgRow);
}

// ======================
// SYSTEM INFORMATION
// ======================
function renderSystemInfo(container) {
	const section = createSection(str_System_Information || 'System Information');
	container.appendChild(section);

	addValueRow(section, str_FreeRam || 'Free RAM', freeRam);
	addValueRow(section, str_BootTime || 'Boot Time', bootUpTime + ' millisec');
	addValueRow(section, str_ActCons || 'Actual Consumption', (consumption / 1000) + ' ' + consumptionUnit);
	addValueRow(section, str_SlotQ || 'Slot Quantity', slotQuantity);
	addValueRow(section, str_ActSlot || 'Actual Slot', actualSlot);
}

// ======================
// ADMIN COMMANDS
// ======================
function renderAdminCommands(container) {
	const section = createSection(str_AdminCommands || 'Admin Commands');
	container.appendChild(section);

	const adminBtns = document.createElement('div');
	adminBtns.className = 'setup-admin-buttons';

	// Sensor Backup
	const backupRow = document.createElement('div');
	backupRow.className = 'setup-admin-row';
	const backupBtn = createButton(str_SensorBackup || 'Sensor Backup', 'SensorBackup', 1);
	backupBtn.className = 'setup-button';
	backupRow.appendChild(backupBtn);
	const backupHelp = document.createElement('div');
	backupHelp.className = 'setup-admin-help';
	backupHelp.textContent = str_SensorBackupHelp || 'Backup sensor values to EEPROM';
	backupRow.appendChild(backupHelp);
	adminBtns.appendChild(backupRow);

	// Sensor Restore
	const restoreRow = document.createElement('div');
	restoreRow.className = 'setup-admin-row';
	const restoreBtn = createButton(str_SensorRestore || 'Sensor Restore', 'SensorRestore', 1);
	restoreBtn.className = 'setup-button';
	restoreRow.appendChild(restoreBtn);
	const restoreHelp = document.createElement('div');
	restoreHelp.className = 'setup-admin-help';
	restoreHelp.textContent = str_SensorRestoreHelp || 'Restore sensor values from EEPROM';
	restoreRow.appendChild(restoreHelp);
	adminBtns.appendChild(restoreRow);

	// Reinit
	const reinitRow = document.createElement('div');
	reinitRow.className = 'setup-admin-row';
	const reinitBtn = createButton(str_ReInit || 'Reinitialize', 'ReInit', 1);
	reinitBtn.className = 'setup-button danger';
	reinitRow.appendChild(reinitBtn);
	const reinitHelp = document.createElement('div');
	reinitHelp.className = 'setup-admin-help';
	reinitHelp.textContent = str_ReInitHelp || 'Reinitialize the system';
	reinitRow.appendChild(reinitHelp);
	adminBtns.appendChild(reinitRow);

	section.appendChild(adminBtns);
}

// ======================
// HELPER FUNCTIONS
// ======================
function createSection(title) {
	const section = document.createElement('div');
	section.className = 'setup-section';

	const header = document.createElement('div');
	header.className = 'setup-section-header';

	const titleEl = document.createElement('h2');
	titleEl.className = 'setup-section-title';
	titleEl.textContent = title;

	header.appendChild(titleEl);
	section.appendChild(header);

	return section;
}

function createRow(label) {
	const row = document.createElement('div');
	row.className = 'setup-row';

	if (label) {
		const labelEl = document.createElement('label');
		labelEl.className = 'setup-label';
		labelEl.textContent = label;
		row.appendChild(labelEl);
	}

	return row;
}

function addRow(section, label, element) {
	const row = createRow(label);
	row.appendChild(element);
	section.appendChild(row);
}

function createInput(type, name, value, options = {}) {
	const input = document.createElement('input');
	input.type = type;
	input.name = name;
	input.value = value;
	input.className = options.className || 'setup-input';

	if (options.min !== undefined) input.min = options.min;
	if (options.max !== undefined) input.max = options.max;
	if (options.maxlength) input.maxLength = options.maxlength;
	if (options.placeholder) input.placeholder = options.placeholder;
	if (options.pattern) input.pattern = options.pattern;
	if (options.style) input.style.cssText = options.style;

	input.onchange = function () { changed(this); };

	return input;
}

function addInputRow(section, label, input) {
	addRow(section, label, input);
}

function createIPGroup(namePrefix, ipArray) {
	const group = document.createElement('div');
	group.className = 'setup-ip-group';

	for (let i = 0; i < 4; i++) {
		const input = createInput('number', `${namePrefix}*${i}`, ipArray[i], {
			min: 0,
			max: 255,
			maxlength: 3,
			className: 'setup-input setup-ip-input'
		});
		group.appendChild(input);

		if (i < 3) {
			group.appendChild(createSeparator('.'));
		}
	}

	return group;
}

function createSeparator(text) {
	const sep = document.createElement('span');
	sep.className = 'setup-ip-separator';
	sep.textContent = text;
	return sep;
}

function createCheckbox(name, value) {
	const wrapper = document.createElement('div');
	wrapper.className = 'setup-checkbox-wrapper';

	const checkbox = document.createElement('input');
	checkbox.type = 'checkbox';
	checkbox.name = name;
	checkbox.value = value;
	checkbox.className = 'setup-checkbox';
	checkbox.checked = (value == 1);
	checkbox.onchange = function () { changed(this); };

	wrapper.appendChild(checkbox);

	return wrapper;
}

function addCheckboxRow(section, label, name, value) {
	const row = createRow(label);
	row.appendChild(createCheckbox(name, value));
	section.appendChild(row);
}

function createSelect(name, options, selected) {
	const select = document.createElement('select');
	select.name = name;
	select.className = 'setup-select';
	select.onchange = function () { changed(this); };

	for (const key in options) {
		const option = document.createElement('option');
		option.value = key;
		option.textContent = options[key];
		if (String(key) === String(selected)) {
			option.selected = true;
		}
		select.appendChild(option);
	}

	return select;
}

function createButton(text, name, value, onclick) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'setup-button';
	button.textContent = text;
	if (name) button.name = name;
	if (value !== null && value !== undefined) button.value = value;

	button.onclick = onclick || function () { changed(this, this.name, 1, 0, 1); };

	return button;
}

function createValue(text) {
	const value = document.createElement('div');
	value.className = 'setup-value';
	value.textContent = text;
	return value;
}

function addValueRow(section, label, value) {
	addRow(section, label, createValue(value));
}

function addTimerRow(section, label, name, value) {
	const row = createRow(label);
	const group = document.createElement('div');
	group.className = 'setup-inline-group';

	group.appendChild(createInput('number', name, value, {
		min: 0, maxlength: 6, style: 'width: 5em'
	}));

	const unit = document.createElement('span');
	unit.textContent = 'sec';
	unit.style.color = 'rgba(255,255,255,0.6)';
	group.appendChild(unit);

	row.appendChild(group);
	section.appendChild(row);
}

// Fallback for VersionCheck if not defined
if (typeof VersionCheck === 'undefined') {
	window.VersionCheck = function (v) {
		try {
			return version >= v;
		} catch (e) {
			return true;
		}
	};
}

// Initialize when ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSetupPage);
} else {
	initSetupPage();
}
