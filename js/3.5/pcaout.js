document.write('<div class="content">');
document.write('<table id="t02" align="center" >');
document.write('<tr>');
OpenCloseCheckBox("PCA");
document.write('<th colspan="17" id="top">'+str_Psettings+'</th></tr><tr name="PCA">');
HideCheckBox('PCA');	
document.write('<th>ID</th><th>'+str_Inv+'</th><th>PWM</th><th>'+str_Alarm+'</th><th>'+str_JustOn+'</th><th>'+str_Name+'</th><th>'+str_State+'</th><th>OFF (0-100%)</th><th>ON (0-100%)</th><th>'+str_Speed+' (0-255)</th><th>'+str_Timer+'</th><th>'+str_Delay+'</th><th>'+str_Mixer+'</th><th>'+str_Sensor+'</th><th>'+str_On+'</th><th>'+str_Off+'</th></tr>');
for(i=1;i<=PCA.length;i++){
	if(PCA_description[i]==null){PCA_description[i]="";}
	document.write('<tr name="PCA" id="tr_PCA_'+i+'"');
	if(PCA[i-1] && i%2 == 0){document.write(' class="on1"');}
	if(PCA[i-1] && i%2 != 0){document.write(' class="on2"');}
	hideRowCheckBox("PCA",i);
	document.write('></td><td align="center">'+(i+2000)+'</td>');	
	document.write('<td align="center">');
	document.write('<input type="checkbox" ');
	document.write('name="PCAInvert" value="'+i+'" ');
	if( PCA_invert[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)">');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="checkbox" ');
	document.write('name="PCA_PWM" value="'+i+'" ');
	if( PCA_PWM[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)">');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="checkbox" ');
	document.write('name="PCAAlarm" value="'+i+'" ');
	if( PCA_Alarm[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)">');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="checkbox" ');
	document.write('name="PCAJustOn" value="'+i+'" ');
	if( PCA_JustOn[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)">');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="text" size="26ex"  maxlength="25" placeholder="-" ');
	
	document.write('name="p_descr*'+i+'" value="'+PCA_description[i]+'" ');
	document.write('onchange="changed(this)">');
	document.write('</td>');
	
	document.write('<td align="center">');	
	document.write('<input type="range" min="0" max="100" name="PCA*'+i+'" value="'+Math.round(PCA[i - 1]/2.55)+'" onchange="changed(this,this.name,1,true)">');
	document.write('<input type="number" min="0" max="100" style="width: 4ex" maxlength="3" name="PCA*'+i+'" value="'+Math.round(PCA[i - 1]/2.55)+'" onchange="changed(this,this.name,1,true)" >');
	document.write('</td>');
	
	document.write('<td align="center">');
	document.write('<button name="PCA_OFF" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_Off+'</button>-');
	document.write('<input type="number" style="width: 4ex"  min="0" max="255" maxlength="3" name="PCAMIN*'+i+'" value="'+Math.round(PCAMIN[i-1]/2.55)+'" onchange="changed(this,this.name,1)">');
	document.write('</td>');
	
	document.write('<td align="center">');
	document.write('<button name="PCA_ON" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_On+'</button>-');	
	document.write('<input type="number" style="width: 4ex"  min="0" max="255" maxlength="3" name="PCAMAX*'+i+'" value="'+Math.round(PCAMAX[i-1]/2.55)+'" onchange="changed(this,this.name,1)">');
	document.write('</td>');
	
	document.write('<td align="center">');
	document.write('<input type="number" min="0" max="32767" style="width: 4ex" maxlength="5" name="PCAFadeSpeed*'+i+'" value="'+PCAFadeSpeed[i-1]+'" onchange="changed(this)">');
	document.write('</td>');
	
	document.write('<td align="center">');
	document.write('<input type="number" style="width: 6ex"  min="0" max="32767" maxlength="5" ');
	document.write('name="PCA_timer*'+i+'" value="'+PCA_timerDefault[i-1]+'" ');
	document.write('onchange="changed(this)"> sec');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="number" min="-32766" max="32767" style="width: 6ex" maxlength="5" ');
	document.write('name="PCA_delay*'+i+'" value="'+PCA_delayDefault[i-1]+'" ');
	document.write('onchange="changed(this)" > sec');
	document.write('</td>');
	document.write('<td align="center">');
	document.write('<input type="checkbox" ');
	document.write('name="PCAMixer" value="'+i+'" ');
	if( PCA_Mixer[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)">');
	document.write('</td>');
	document.write('<td align="center">');

	if (PCA_thermoActivator[i - 1] < 100 && PCA_thermoActivator[i - 1] > 0) {	
		document.write(ThermoTempByEEpromID(PCA_thermoActivator[i - 1])+' C° ');			
	} else if (PCA_thermoActivator[i - 1] > 200&&PCA_thermoActivator[i - 1]<255) {			
		document.write( ValueBySensor(PCA_thermoActivator[i - 1])+ " ");
	}

	document.write('<input type="number" style="width: 2em"  min="0" max="255" maxlength="3" name="PCA_thermoActivator*'+i+'" value="'+PCA_thermoActivator[i-1]+'" onchange="changed(this)">');
	
	document.write('<select name="PCA_thermoActivator*' + i + '" name1="tempOnOff" name2="' + i + '" onchange="changed(this)" >');
	document.write('<option value="0" style="color:#999;">-</option>');
	if (VersionCheck("3.7.2")) {
		document.write('<option value="255"');
			if (PCA_thermoActivator[i-1]== 255){document.write(' selected');}
			document.write('>'+str_sun);
			document.write('</option>');
	}
	if (VersionCheck("3.7")) {
		document.write('<option value="200"');
		if (PCA_thermoActivator[i-1] == 200){document.write(' selected');}
		document.write('>'+str_Consump);
		document.write('</option>');
	}
	if (VersionCheck("3.7.1")) {
		AddSDMOptions(PCA_thermoActivator[i-1]);
	}
	if (thermo_eepromIndex != null ){
		for(j=0;j<thermo_eepromIndex.length;j++){
			document.write('<option value="'+thermo_eepromIndex[j]+'"');
			if (thermo_eepromIndex[j] == PCA_thermoActivator[i-1]){document.write(' selected');}
			document.write('>'+thermo_eepromIndex[j]+'-'+thermo_description[thermo_eepromIndex[j]]);
			document.write('</option>');
		}
	}
	for(j=0;j<humidity.length;j++){
		if (humidity[j]!=0){
			document.write('<option value="'+(j+101)+'"');
			if (j == (PCA_thermoActivator[i-1]-101)){document.write(' selected');}
			document.write('>H '+(j+1)+'-'+hum_description[j]);
			document.write('</option>');
		}
	}
	document.write('</select>');
	document.write('</td>');
/*	
    document.write('<td class="tempOnOff'+i+'" ');
	if (PCA_thermoActivator[i-1] != 0 ){      
		document.write('style="display: table-cell" ');
		document.write('align="center">');
		document.write('<input type="number" min="-200" max="1000" style="width: 5ex" maxlength="4" ');
		document.write('name="PCA_temp_MIN*'+i+'" value="'+PCA_min_temp_ON[i-1]/10+'" ');
		if (PCA_thermoActivator[i-1] == 0) {
		  document.write('onchange="changed(this,this.name,10)" > C°/%');
		}else if (PCA_thermoActivator[i-1] <= 100){
		  document.write('onchange="changed(this,this.name,10)" > C°');
		} else {
		  document.write('onchange="changed(this,this.name,10)" > %');
		}
		document.write('</td>');

		document.write('<td class="tempOnOff'+i+'" ');
		if (PCA_thermoActivator[i-1] == 0 ){
		  document.write('style="display: none" ');
		} else if (PCA_thermoActivator[i-1] <= 100 ) {
		  document.write('style="display: table-cell" ');
		}
		document.write('align="center">');
		document.write('<input type="number" min="-200" max="1000" style="width: 5ex" maxlength="4" ');
		document.write('name="PCA_temp_MAX*'+i+'" value="'+PCA_max_temp_OFF[i-1]/10+'" ');
		if (PCA_thermoActivator[i-1] == 0) {
		  document.write('onchange="changed(this,this.name,10)" > C°/%');
		}
		else if (PCA_thermoActivator[i-1] <= 100){
		  document.write('onchange="changed(this,this.name,10)" > C°');
		} else {
		  document.write('onchange="changed(this,this.name,10)" > %');
		}
		document.write('</td>');
*/
AddTdSensor(i,"PCA_temp_MIN*"+i,PCA_min_temp_ON[i-1]/10,"PCAMinMax");
AddTdSensor(i,"PCA_temp_MAX*"+i,PCA_max_temp_OFF[i-1]/10,"PCAMinMax");
	//}else document.write('<td></td><td></td>');
	document.write("</tr>");	  
  }
  document.write('</table>');
  
if (typeof requestBufferSize == 'undefined') {
  var requestBufferSize = 150;
}
if(cb_SuperVisor==0){
	OpenClose("PCA");
}
window.scrollTo(x,y);
document.write('</table></div></body>');

