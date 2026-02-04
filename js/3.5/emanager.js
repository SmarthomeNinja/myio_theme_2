var SDM_Strings = ["L1 Power", "L2 Power", "L3 Power", 
	"L1 Voltage", "L2 Voltage", "L3 Voltage",
	"L1 Current", "L2 Current", "L3 Current"];

document.write('<div class="content">');
//SDM SMART METER
document.write('<table align = "center" id = "MasterTable" > ');
	document.write('<tr valign="top"><td><table align="center">');
document.write('<tr><th colspan="12" id="top">SDM Smart Meter</th></tr>');
document.write('<tr>');

for (i = 1; i < 4; i++) {
	document.write('<td><table id="t02" align="center">');
	document.write('<tr>');
	AddTdCheckBox("SDM_POWER_active",i,SDM_POWER_active[i]);
	document.write('<td align="center">L'+i+' Power</td>');
	document.write('<td align="right">');
	if (SDM_POWER_active[i]) {
		document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
		document.write('name="SDM_POWER*' + i + '" value="' + SDM_POWER[i] + '"  onchange="changed(this,this.name,1)">');
	}
	document.write(' W</td>');	
	document.write("</tr>");
	document.write('<tr>');
	AddTdCheckBox("SDM_VOLTAGE_active",i,SDM_VOLTAGE_active[i]);
	document.write('<td align="center">L'+i+' Voltage</td>');
	document.write('<td align="right">');
	if (SDM_VOLTAGE_active[i]) {
		document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
		document.write('name="SDM_VOLTAGE*' + i + '" value="' + parseFloat(SDM_VOLTAGE[i] / 10).toFixed(1) + '"  onchange="changed(this,this.name,10)">');
	}
	document.write('  V</td>');
	document.write("</tr>");
	document.write('<tr>');
	AddTdCheckBox("SDM_CURRENT_active",i,SDM_CURRENT_active[i]);
	document.write('<td align="center">L'+i+' Current</td>');
	document.write('<td align="right">');
	if (SDM_CURRENT_active[i]) {
		document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
		document.write('name="SDM_CURRENT*' + i + '" value="' + parseFloat(SDM_CURRENT[i] / 10).toFixed(1) + '"  onchange="changed(this,this.name,10)">');
	}
	document.write('  A</td>');
	document.write("</tr>");
	if (VersionCheck("3.7.3")) {
		document.write('<tr>');
		AddTdCheckBox("SDM_APPARENT_POWER_active", i, SDM_APPARENT_POWER_active[i]);
		document.write('<td align="center">L' + i + ' Apparent Power</td>');
		document.write('<td align="right">');
		if (SDM_APPARENT_POWER_active[i]) {
			document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
			document.write('name="SDM_APPARENT_POWER*' + i + '" value="' + parseFloat(SDM_APPARENT_POWER[i]/10).toFixed(1) + '"  onchange="changed(this,this.name,1)">');
		}
		document.write('  VA</td>');
		document.write("</tr>");
		document.write('<tr>');
		AddTdCheckBox("SDM_REACTIVE_POWER_active", i, SDM_REACTIVE_POWER_active[i]);
		document.write('<td align="center">L' + i + ' Reactive Power</td>');
		document.write('<td align="right">');
		if (SDM_REACTIVE_POWER_active[i]) {
			document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
			document.write('name="SDM_REACTIVE_POWER*' + i + '" value="' + parseFloat(SDM_REACTIVE_POWER[i]/10).toFixed(1) + '"  onchange="changed(this,this.name,1)">');
		}
		document.write('  VAr</td>');
		document.write("</tr>");
		document.write('<tr>');
		AddTdCheckBox("SDM_POWER_FACTOR_active", i, SDM_POWER_FACTOR_active[i]);
		document.write('<td align="center">L' + i + ' Power Factor</td>');
		document.write('<td align="right">');
		if (SDM_POWER_FACTOR_active[i]) {
			document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
			document.write('name="SDM_POWER_FACTOR*' + i + '" value="' + parseFloat(SDM_POWER_FACTOR[i] / 100).toFixed(2) + '"  onchange="changed(this,this.name,100)">');
		}
		document.write('</td>');
		document.write("</tr>");
		document.write('<tr>');
		AddTdCheckBox("SDM_ANGLE_active", i, SDM_ANGLE_active[i]);
		document.write('<td align="center">L' + i + ' Angle</td>');
		document.write('<td align="right">');
		if (SDM_ANGLE_active[i]) {
			document.write('<input type="number" style="width: 6ex" min="-32768" max="32767" maxlength="6" ');
			document.write('name="SDM_ANGLE*' + i + '" value="' + parseFloat(SDM_ANGLE[i] / 10).toFixed(1) + '"  onchange="changed(this,this.name,10)">');
		}
		document.write('  °</td>');
		document.write("</tr>");
	}
	document.write('</table></td>');
}


document.write('</table></td></tr>');

		document.write('</table></td>');
document.write('</tr></table><br>');


//ENERGY MANAGER
document.write('<table align = "center" id = "MasterTable" > ');
document.write('<tr valign="top"><td><table align="center">');
document.write('<tr><th colspan="10" id="top">' + str_EnergyManagement + '</th></tr>');	
document.write('<tr><th id="second"></th>');
	for (j = 1; j < 4; j++) {
		document.write('<th align="center" id="second">');
		document.write('<input type="checkbox" name="energy_manager" value="'+j+'" ');
		if(energy_manager_enabled[j] == 1){document.write('checked ');}
		document.write('onchange="changed(this,this.name,1)">');
		document.write('L'+j+'</th>');
	}
document.write('</tr>');
	
document.write('<tr><th id="second">Activator</th>');
	for (j = 1; j < 4; j++) {
		document.write('<th align="center" id="second">');

		document.write('<select name="SDM_sensor_activator*'+j+'" onchange="changed(this)">');
		document.write('<option value="0"');
		if (SDM_sensor_activator[j] == 0){document.write(' selected');}
		document.write('>-</option>');
		for (k = 201; k < 204; k++){
			document.write('<option value="'+k+'"');
			if (SDM_sensor_activator[j] == k){document.write(' selected');}
			document.write('>' + SDM_Strings[k - 201]); 			
			document.write('</option>');			
		}
		document.write('</select>');
		document.write(' Delay:<input type="number" style="width: 5ex"  min="0" max="65534" maxlength="6" ');
		document.write('name="clevel_check_timer*'+j+'" value="'+parseFloat(clevel_check_timer[j]/10).toFixed(1)+'"  onchange="changed(this,this.name,10)">');		
		document.write('sec</th>');
		//document.write('</th>');
	}
document.write('</tr>');

document.write('<tr><th>Level</th>');
	for (j = 1; j < 4; j++) {
		document.write('<td align="center">');
		document.write('<input type="number" style="width: 5ex"  min="0" max="65534" maxlength="6" ');
		document.write('name="consumption_level*'+j+'" value="'+consumption_level[j]+'"  onchange="changed(this,this.name,1)">');		
		document.write('</td>');
	}
document.write('</tr>');
for (i = 0; i < clevel_ON_event[0].length; i++) {	//CONSUMPTION_LEVELS
	document.write('<tr>');
	document.write('<th>' + i + '</th>');	
	for (j = 1; j < 4; j++) {
		document.write('<td><table id="t02"><tr');
		if(consumption_level[j]==i){document.write(' class="on1"');}
		document.write('><td><table>');
		document.write('<tr>');
		//OFF
		document.write('<td align="center">OFF:<input type="number" style="width: 5ex"  min="0" max="5025" maxlength="4" ');
		document.write('name="clevel_OFF_event*'+j+'*'+i+'" value="'+clevel_OFF_event[j][i]+'"  onchange="changed(this,this.name,1)">');		
		document.write('<select id="clevel_OFF_event_Group*'+j+'*'+i+'" name="'+clevel_OFF_event[j][i]+'" onchange="EventParamDropDown(this)">');
			document.write('<option value="0"');
			if (clevel_OFF_event[j][i] == 0){document.write(' selected');}
			document.write('>-</option>');	
			document.write('<optgroup label="'+str_Switch+'">');			
			document.write('<option value="1"');
			if (clevel_OFF_event[j][i] <65 && clevel_OFF_event[j][i]>0){document.write(' selected');}			
			document.write('>'+str_PCF+'</option>');

			document.write('<option value="2"');
			if (clevel_OFF_event[j][i] <3025 && clevel_OFF_event[j][i]>2000){document.write(' selected');}
			document.write('>'+str_PCA+'</option>');

			document.write('<option value="4"');
			if (clevel_OFF_event[j][i] <114 && clevel_OFF_event[j][i]>100){document.write(' selected');}
			document.write('>'+str_PWM+'</option>');
		
			if (VersionCheck("3.7")) {
				document.write('<option value="6"');
				if (clevel_OFF_event[j][i] < 500 + relay_group[0].length && clevel_OFF_event[j][i] > 500) { document.write(' selected'); }
				document.write('>' + str_Rgroup + '</option>');
			}
			
			document.write('</optgroup>');
			document.write('</select>');
			document.write('<select id="clevel_OFF_event*'+j+'*'+i+'" name='+clevel_OFF_event[j][i]+' style="width:25ex;" onchange="changed(this,this.id,1)"></select></td>');	
			document.write('</td>');
		


		document.write('<td>');
		document.write('▲<input type="number" style="width: 5ex" min="-32768" max="32767" maxlength="6" ');
		document.write('name="clevel_DOWN*'+j+'*'+i+'" value="'+clevel_DOWN[j][i]+'"  onchange="changed(this,this.name,1)">');		
		document.write(' W</td>');
		//Shift Down ↑
		
		//ON
		document.write('</tr><tr>');
		document.write('<td align="center">ON:<input type="number" style="width: 5ex"  min="0" max="5025" maxlength="4" ');
		document.write('name="clevel_ON_event*'+j+'*'+i+'" value="'+clevel_ON_event[j][i]+'"  onchange="changed(this,this.name,1)">');		
		document.write('<select id="clevel_ON_event_Group*'+j+'*'+i+'" name="'+clevel_ON_event[j][i]+'" onchange="EventParamDropDown(this)">');
			document.write('<option value="0"');
			if (clevel_ON_event[j][i] == 0){document.write(' selected');}
			document.write('>-</option>');	
			document.write('<optgroup label="'+str_Switch+'">');			
			document.write('<option value="1"');
			if (clevel_ON_event[j][i] <65 && clevel_ON_event[j][i]>0){document.write(' selected');}			
			document.write('>'+str_PCF+'</option>');

			document.write('<option value="2"');
			if (clevel_ON_event[j][i] <3025 && clevel_ON_event[j][i]>2000){document.write(' selected');}
			document.write('>'+str_PCA+'</option>');

			document.write('<option value="4"');
			if (clevel_ON_event[j][i] <114 && clevel_ON_event[j][i]>100){document.write(' selected');}
			document.write('>'+str_PWM+'</option>');
		
			if (VersionCheck("3.7")) {
				document.write('<option value="6"');
				if (clevel_ON_event[j][i] < 500 + relay_group[0].length && clevel_ON_event[j][i] > 500) { document.write(' selected'); }
				document.write('>' + str_Rgroup + '</option>');
			}
			
			document.write('</optgroup>');
			document.write('</select>');
			document.write('<select id="clevel_ON_event*'+j+'*'+i+'" name='+clevel_ON_event[j][i]+' style="width:25ex;" onchange="changed(this,this.id,1)"></select></td>');	
			document.write('</td>');
			
			
		document.write('<td>');
		document.write('▼<input type="number" style="width: 5ex"  min="-32768" max="32767" maxlength="6" ');
		document.write('name="clevel_UP*'+j+'*'+i+'" value="'+clevel_UP[j][i]+'"  onchange="changed(this,this.name,1)">');		
		document.write(' W</td>');

		document.write('</tr>');
		
		document.write('</table></tr></td></table></td>');
	}
	document.write('</tr>');
}

document.write('</tr>');


document.write('</table></td>');
document.write('</tr></table>');

for (m=1;m<4;m++){
	for (n=0;n<clevel_ON_event[0].length;n++){
		EventParamDropDown(document.getElementById("clevel_OFF_event_Group*" + m + "*" + n));
		EventParamDropDown (document.getElementById("clevel_ON_event_Group*"+m+"*"+n));
	}
}