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
document.write('<div class="content"><table align="center" id="MasterTable">');
document.write('<tr valign="top"><td width=50%><table id="t02" align="center"><tr>');
OpenCloseCheckBox("Fet");
document.write('<th colspan="10" id="top">' + str_PWMs + '</th></tr><tr name="Fet">');
HideCheckBox('Fet');
document.write('<th>ID</th><th>' + str_Name + '</th><th>' + str_State + '</th><th>OFF (0-100%)</th><th>ON (0-100%)</th><th>' + str_Speed + ' (0-255)</th><th>' + str_Sensor + '</th><th>MIN</th><th>MAX</th></tr>');
for (i = 1; i <= fet.length; i++) {
	var j = i;
	if (fet_description[i] == null) { fet_description[i] = ""; }
	document.write('<tr name="Fet" id="tr_Fet_' + i + '"');
	if (fet[i - 1] != 0 && i % 2 == 0) { document.write(' class="on1"'); }
	if (fet[i - 1] != 0 && i % 2 != 0) { document.write(' class="on2"'); }
	hideRowCheckBox("Fet", i);
	document.write('></td><td align="center">' + (i + 100) + '</td>');
	AddTdDescription("f_descr*", fet_description[i], i);
	document.write('<td align="center"><input type="range" min="0" max="100" name="fet*' + i + '" value="' + Math.round(fet[i - 1] / 2.55) + '" onchange="changed(this,this.name,1,true)">');
	document.write('<input type="number" min="0" max="100" style="width: 3em" maxlength="3" name="fet*' + i + '" value="' + Math.round(fet[i - 1] / 2.55) + '" onchange="changed(this,this.name,1,true)" ></td>');
	document.write('<td align="center"><button name="f_OFF" value="' + i + '" onclick="changed(this,this.name,1,true)" >' + str_Off + '</button>-');
	document.write('<input type="number" style="width: 3em"  min="0" max="100" maxlength="3" name="fetMIN*' + i + '" value="' + Math.round(fetMIN[i - 1] / 2.55) + '" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center"><button name="f_ON" value="' + i + '" onclick="changed(this,this.name,1,true)" >' + str_On + '</button>-');
	document.write('<input type="number" style="width: 3em"  min="0" max="100" maxlength="3" name="fetMAX*' + i + '" value="' + Math.round(fetMAX[i - 1] / 2.55) + '" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center"><input type="number" min="0" max="32767" style="width: 3em" maxlength="5" name="fetFadeSpeed*' + i + '" value="' + fetFadeSpeed[i - 1] + '" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center">');
	if (fet_thermoActivator[i - 1] < 100 && fet_thermoActivator[i - 1] > 0) {
		document.write(ThermoTempByEEpromID(fet_thermoActivator[i - 1]) + ' C° ');
	}
	document.write('<input type = "number" min = "0" max = "100" style = "width: 3em" maxlength = "3" ');
	document.write('name="fet_thermoActivator*' + i + '" value="' + fet_thermoActivator[i - 1] + '" onchange="changed(this,this.name,1)"> ');
	document.write('<select name="fet_thermoActivator*' + i + '" name1="mixMinMax" name2="' + i + '" onchange="changed(this,this.name,1)" >');
	document.write('<option value="0" style="color:#999;">-</option>');
	if (VersionCheck("3.7")) {
		document.write('<option value="200"');
		if (fet_thermoActivator[i - 1] == 200) { document.write(' selected'); }
		document.write('>' + str_Consump);
		document.write('</option>');
	}
	if (VersionCheck("3.7.1")) {
		AddSDMOptions(fet_thermoActivator[i - 1]);
	}
	if (thermo_eepromIndex != null) {
		for (j = 0; j < thermo_eepromIndex.length; j++) {
			if (thermo_eepromIndex[j] != 0) {
				document.write('<option value="' + thermo_eepromIndex[j] + '"');
				if (thermo_eepromIndex[j] == fet_thermoActivator[i - 1]) { document.write(' selected'); }
				document.write('>' + thermo_eepromIndex[j] + '-' + thermo_description[thermo_eepromIndex[j]]);
				document.write('</option>');
			}
		}
	}
	document.write('</select></td>');
	AddTdSensor(i, "mix_temp_MIN*" + i, mix_temp_MIN[i - 1] / 10, "mixMinMax");
	AddTdSensor(i, "mix_temp_MAX*" + i, mix_temp_MAX[i - 1] / 10, "mixMinMax");
	document.write('</tr>');
}
document.write('</table><br>');
document.write('<table id="t02" align="center" ><tr>');
OpenCloseCheckBox("Relay");
document.write('<th colspan="14" id="top">' + str_Rsettings + '</th></tr><tr name="Relay">');
HideCheckBox('Relay');
document.write('<th>ID</th><th>' + str_Inv + '</th><th>' + str_Alarm + '</th><th>' + str_JustOn + '</th><th>' + str_Buttons + '</th><th>' + str_Name + '</th><th>' + str_Timer + '</th><th>' + str_Delay + '</th><th>' + str_Sensor + '</th><th>' + str_On + '</th><th>' + str_Off + '</th></tr>');
for (i = 1; i <= relays.length; i++) {
	if (relay_description[i] == null) { relay_description[i] = ""; }
	document.write('<tr name="Relay" id="tr_Relay_' + i + '"');
	if (relays[i - 1] && i % 2 == 0) { document.write(' class="on1"'); }
	if (relays[i - 1] && i % 2 != 0) { document.write(' class="on2"'); }
	hideRowCheckBox("Relay", i);
	document.write('></td><td align="center">' + i + '</td>');
	AddTdCheckBox("relaysInvert", i, relaysInvert[i - 1]);
	AddTdCheckBox("relaysAlarm", i, relaysAlarm[i - 1]);
	AddTdCheckBox("relaysJustOn", i, relaysJustOn[i - 1]);
	document.write('<td align="center">');
	document.write('<button name="r_ON" value="' + i + '" onclick="changed(this,this.name,1,true)" >' + str_On + '</button>');
	document.write('<button name="r_OFF" value="' + i + '" onclick="changed(this,this.name,1,true)" >' + str_Off + '</button>');
	document.write('</td>');
	AddTdDescription("r_descr*", relay_description[i], i);
	document.write('<td align="center"><input type="number" style="width: 3em"  min="0" max="32767" maxlength="5" ');
	document.write('name="r_timer*' + i + '" value="' + relay_timerDefault[i - 1] + '" onchange="changed(this,this.name,1)"> sec');
	document.write('</td><td align="center"><input type="number" min="-32766" max="32767" style="width: 3em" maxlength="5" ');
	document.write('name="r_delay*' + i + '" value="' + relay_delayDefault[i - 1] + '" onchange="changed(this,this.name,1)" > sec');
	document.write('</td><td align="center">');
	if (thermoActivator[i - 1] < 100 && thermoActivator[i - 1] > 0) {
		document.write(ThermoTempByEEpromID(thermoActivator[i - 1]) + ' C° ');
	}
	document.write('<input type="number" min="0" max="100" style="width: 3em" maxlength="3" ');
	document.write('name="thermoActivator*' + i + '" value="' + thermoActivator[i - 1] + '" onchange="changed(this,this.name,1)"> ');
	document.write('<select name="thermoActivator*' + i + '" name1="tempOnOff" name2="' + i + '" onchange="changed(this,this.name,1)">');
	document.write('<option value="0" style="color:#999;">-</option>');
	if (thermo_eepromIndex != null) {
		for (j = 0; j < thermo_eepromIndex.length; j++) {
			document.write('<option value="' + thermo_eepromIndex[j] + '"');
			if (thermo_eepromIndex[j] == thermoActivator[i - 1]) { document.write(' selected'); }
			document.write('>' + thermo_eepromIndex[j] + '-' + thermo_description[thermo_eepromIndex[j]]);
			document.write('</option>');
		}
	}
	for (j = 0; j < humidity.length; j++) {
		if (humidity[j] != 0) {
			document.write('<option value="' + (j + 101) + '"');
			if (j == (thermoActivator[i - 1] - 101)) { document.write(' selected'); }
			document.write('>H ' + (j + 1) + '-' + hum_description[j]);
			document.write('</option>');
		}
	}
	if (VersionCheck("3.7.2")) {
		document.write('<option value="255"');
		if (thermoActivator[i - 1] == 255) { document.write(' selected'); }
		document.write('>' + str_sun);
		document.write('</option>');
	}
	if (VersionCheck("3.7")) {
		document.write('<option value="200"');
		if (thermoActivator[i - 1] == 200) { document.write(' selected'); }
		document.write('>' + str_Consump);
		document.write('</option>');
	}
	if (VersionCheck("3.7.1")) {
		AddSDMOptions(thermoActivator[i - 1]);
	}

	document.write('</select></td>');
	AddTdSensor(i, "min_temp_ON*" + i, min_temp_ON[i - 1] / 10, "tempOnOff");
	AddTdSensor(i, "max_temp_OFF*" + i, max_temp_OFF[i - 1] / 10, "tempOnOff");

	document.write('</tr>');
}
document.write('</table>');

if (typeof requestBufferSize == 'undefined') {
	var requestBufferSize = 150;
}
if (cb_SuperVisor == 0) {
	OpenClose("Fet");
	OpenClose("Relay");
}
window.scrollTo(x, y);
document.write('</table></div></body>');