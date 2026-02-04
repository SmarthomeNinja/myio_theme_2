document.write('<div class="content"><table align="center" id="MasterTable">');
document.write('<tr valign="top"><td width=50%><table id="t02" align="center"><tr>');
OpenCloseCheckBox("Prot");
document.write('<th colspan="3" id="top">'+str_Rprot+'</th></tr>');
var empty = 0;
for(i=0;i<relayProtection.length;i++){	
	document.write('<tr name2="'+i+'" name1="relayProtectionTable" id="relayProtectionTable'+i+'" ');
	if (relayProtection[i][0] == 0 && relayProtection[i][1] == 0 && empty ==1 ){
		document.write('style="display: none"');
	}else {
		document.write('name="Prot" style="display: table-row;"');							
	}
	if(relayProtection[i][0] == 0 && relayProtection[i][1] == 0 ){empty=1;}
	document.write('>');
	AddTdCheckBox("protectionPriority",i,protectionPriority[i]);	
	for(j=0;j<2;j++){
		document.write('<td align="left">');
		document.write('<input type="number" style="width: 5ex" min="0" max="1000" maxlength="3" name="relayProtection*'+i+'*'+j+'" value="'+relayProtection[i][j]+'" onchange="changed(this,this.name,1)"> ');				
		document.write('<select name="relayProtection*'+i+'*'+j+'" onchange="changed(this,this.name,1)">');
		document.write('<option value="0">-</option>');
		document.write('<optgroup label="'+str_PWMs+'">');
		addOption("Fet",relayProtection[i][j]);
		document.write('</optgroup>');
		document.write('<optgroup label="'+str_PCF+'">');
		addOption("Relay",relayProtection[i][j]);
		document.write('</optgroup></select></td>');
	}
	document.write("</tr>");	
}            
document.write('</table></td>');
document.write('<td><table id="t02" align="center"><tr>');
OpenCloseCheckBox("Joiner");
document.write('<th id="top" colspan="3">'+str_Rjoin+'</th></tr>');
var empty = 0;
for(i=0;i<relayJoiner.length;i++){	
	document.write('<tr name2="'+i+'" name1="relayJoinerTable" id="relayJoinerTable'+i+'" ');
	if (relayJoiner[i][0] == 0 && relayJoiner[i][1] == 0 && empty ==1){
		document.write('style="display: none"');
	} else {
		document.write('name="Joiner" style="display: table-row"');						
	}
	if(relayJoiner[i][0] == 0 && relayJoiner[i][1] == 0 ){empty=1;}
	document.write(">");
	if(cb_SuperVisor==0)document.write("<td></td>");
	for(j=0;j<2;j++){
		document.write('<td align="left">');		
		document.write('<input type="number" style="width: 5ex"  min="0" max="1000" maxlength="4" name="relayJoiner*'+i+'*'+j+'" value="'+relayJoiner[i][j]+'" onchange="changed(this,this.name,1)"> ');
		document.write('<select name="relayJoiner*'+i+'*'+j+'" onchange="changed(this,this.name,1)">');
		document.write('<option value="0" style="color:#999;">-</option>');
		document.write('<optgroup label="'+str_Rgroup+'">');
		addOption("Group",relayJoiner[i][j]);		
		document.write('</optgroup>');
		document.write('<optgroup label="'+str_PCF+'">');
		addOption("Relay",relayJoiner[i][j]);	
		document.write('</optgroup>');
		document.write('<optgroup label="'+str_PWMs+'">');
		addOption("Fet",relayJoiner[i][j]);
		document.write('</optgroup></select></td>');
	}
	document.write('</tr>');	
}      
document.write('</table></td></tr></table><br>');
var isThisEmpty = [];
for(i=0;i<relay_group.length;i++){
	isThisEmpty[i]=0;
	for (e=0;e<relay_group[0].length;e++){
		isThisEmpty[i]+=relay_group[i][e];
	}	
	if (group_description[i+1]!=null){isThisEmpty[i]++;}			
}
document.write('<table id="t02" align="center"><tr>');
OpenCloseCheckBox("Group");
document.write('<th colspan="12" id="top">'+str_Rgroup+'</th></tr>');
document.write('<tr name="Group">');
HideCheckBox('Group');
document.write('<th>ID</th><th>'+str_Name+'</th><th></th><th>'+str_PullUp+'</th></tr>');
var empty = 0;
for(i=0;i<relay_group.length;i++){	
	if(group_description[i+1]==null){group_description[i+1]="";}
	document.write('<tr name="Group" id="tr_Group_'+(i+1)+'" name2="'+i+'" name1="relay_groupTable" id="relay_groupTable'+i+'" ');		
	if (isThisEmpty[i] == 0 && empty == 1){
		document.write('style="display: none"');
	} else {
		document.write('style="display: table-row"');
		if(isThisEmpty[i] == 0) empty=1;
	}
	hideRowCheckBox("Group",(i+1));
	document.write(">");	
	document.write('<td align="center">'+(501+i)+'</td>');
	AddTdDescription("g_descr*",group_description[i+1],i+1);
	document.write('<td align="center">');
	document.write('<button name="g_ON" value="'+(i+1)+'" onclick="changed(this,this.name,1,true)" >'+str_On+'</button><br>');
	document.write('<button name="g_OFF" value="'+(i+1)+'" onclick="changed(this,this.name,1,true)" >'+str_Off+'</button>');
	document.write('</td>');
	AddTdCheckBox("pullUpGroup",i,pullUpGroup[i]);
	var isAnyZero=0;
	for(j=0;j<relay_group[0].length;j++){			
		if(j%2==0){
			document.write('<td align="left"><table id="t03" align="center" >');
			document.write('<tr ');	
			if(isThisOn(relay_group[i][j])){document.write('class="on1"');}
			document.write('>');		
		}else{
			document.write('<tr ');
			if(isThisOn(relay_group[i][j])){document.write('class="on2"');}
			document.write('>');
		}
		document.write('<td align="left"><input type="number" style="width: 5ex"  min="0" max="5025" maxlength="4" ');
		document.write('name="relay_group*'+i+'*'+j+'" value="'+relay_group[i][j]+'"  onchange="changed(this,this.name,1)">');
		if (relay_group[i][j] !=0 || isAnyZero==0 ){
			if (relay_group[i][j] == 0 && isAnyZero == 0) isAnyZero = 0;
			document.write('<select id="relay_group_Group*'+i+'*'+j+'" name="'+relay_group[i][j]+'" onchange="EventParamDropDown(this)">');
			document.write('<option value="0"');
			if (relay_group[i][j] == 0){document.write(' selected');}
			document.write('>-</option>');	
			document.write('<optgroup label="'+str_Switch+'">');			
			document.write('<option value="1"');
			if (relay_group[i][j] <65 && relay_group[i][j]>0){document.write(' selected');}			
			document.write('>'+str_PCF+'</option>');
			document.write('<option value="4"');
			if (relay_group[i][j] <114 && relay_group[i][j]>100){document.write(' selected');}
			document.write('>'+str_PWM+'</option>');
			document.write('</select>');
			document.write('<select id="relay_group*'+i+'*'+j+'" name='+relay_group[i][j]+' style="width:25ex;" onchange="changed(this,this.id,1)"></select></td>');
		}
		document.write('</td></tr>');
		if(j%2!=0){document.write('</table></td>');}					
	}
	document.write("</tr>");		
}    
document.write('</table><br>');
document.write('<table id="t02" align="center" >');
document.write('<tr>');	
OpenCloseCheckBox("Fet");
document.write('<th colspan="10" id="top">'+str_PWMs+'</th></tr><tr name="Fet">');
HideCheckBox('Fet');
document.write('<th>ID</th><th>'+str_Name+'</th><th>'+str_State+'</th><th>OFF (0-100%)</th><th>ON (0-100%)</th><th>'+str_Speed+' (0-255)</th><th>'+str_Sensor+'</th><th>MIN</th><th>MAX</th></tr>');  
for(i=1;i<=fet.length;i++){
	var j=i;
	if(fet_description[i]==null){fet_description[i]="";}
	document.write('<tr name="Fet" id="tr_Fet_'+i+'"');
	if(fet[i-1] !=0 && i%2 == 0){document.write(' class="on1"');}
	if(fet[i-1] !=0 && i%2 != 0){document.write(' class="on2"');}
	hideRowCheckBox("Fet",i);
	document.write('></td><td align="center">'+(i+100)+'</td>');
	AddTdDescription("f_descr*",fet_description[i],i);
	document.write('<td align="center"><input type="range" min="0" max="100" name="fet*'+i+'" value="'+Math.round(fet[i - 1]/2.55)+'" onchange="changed(this,this.name,1,true)">');
	document.write('<input type="number" min="0" max="100" style="width: 3em" maxlength="3" name="fet*'+i+'" value="'+Math.round(fet[i - 1]/2.55)+'" onchange="changed(this,this.name,1,true)" ></td>');
	document.write('<td align="center"><button name="f_OFF" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_Off+'</button>-');
	document.write('<input type="number" style="width: 3em"  min="0" max="100" maxlength="3" name="fetMIN*'+i+'" value="'+Math.round(fetMIN[i-1]/2.55)+'" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center"><button name="f_ON" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_On+'</button>-');	
	document.write('<input type="number" style="width: 3em"  min="0" max="100" maxlength="3" name="fetMAX*'+i+'" value="'+Math.round(fetMAX[i-1]/2.55)+'" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center"><input type="number" min="0" max="32767" style="width: 3em" maxlength="5" name="fetFadeSpeed*'+i+'" value="'+fetFadeSpeed[i-1]+'" onchange="changed(this,this.name,1)"></td>');
	document.write('<td align="center"><input type="number" min="0" max="100" style="width: 3em" maxlength="3" ');
	document.write('name="fet_thermoActivator*'+i+'" value="'+fet_thermoActivator[i-1]+'" onchange="changed(this,this.name,1)"> ');
	document.write('<select name="fet_thermoActivator*'+i+'" name1="mixMinMax" name2="'+i+'" onchange="changed(this,this.name,1)" >');
	document.write('<option value="0" style="color:#999;">-</option>');
	if (VersionCheck("2.7")) {
		document.write('<option value="200"');
		if (fet_thermoActivator[i-1] == 200){document.write(' selected');}
		document.write('>'+str_Consump);
		document.write('</option>');
	}
	if (thermo_eepromIndex != null ){
		for(j=0;j<thermo_eepromIndex.length;j++){
			if(thermo_eepromIndex[j]!=0){	
				document.write('<option value="'+thermo_eepromIndex[j]+'"');
				if (thermo_eepromIndex[j] == fet_thermoActivator[i-1]){document.write(' selected');}
				document.write('>'+thermo_eepromIndex[j]+'-'+thermo_description[thermo_eepromIndex[j]]);
				document.write('</option>');
			}
		}
	}
	document.write('</select></td>');
	AddTdSensor(i,"mix_temp_MIN*"+i,mix_temp_MIN[i-1]/10,"mixMinMax");
	AddTdSensor(i,"mix_temp_MAX*"+i,mix_temp_MAX[i-1]/10,"mixMinMax");
	document.write('</tr>');
}
document.write('</table><br>');
document.write('<table id="t02" align="center" ><tr>');
OpenCloseCheckBox("Relay");
document.write('<th colspan="14" id="top">'+str_Rsettings+'</th></tr><tr name="Relay">');
HideCheckBox('Relay');
document.write('<th>ID</th><th>'+str_Inv+'</th><th>'+str_Alarm+'</th><th>'+str_JustOn+'</th><th>'+str_Buttons+'</th><th>'+str_Name+'</th><th>'+str_Timer+'</th><th>'+str_Delay+'</th><th>'+str_Sensor+'</th><th>'+str_On+'</th><th>'+str_Off+'</th></tr>');
for(i=1;i<=relays.length;i++){
	if(relay_description[i]==null){relay_description[i]="";}
	document.write('<tr name="Relay" id="tr_Relay_'+i+'"');
	if(relays[i-1] && i%2 == 0){document.write(' class="on1"');}
	if(relays[i-1] && i%2 != 0){document.write(' class="on2"');}
	hideRowCheckBox("Relay",i);
	document.write('></td><td align="center">'+i+'</td>');
	AddTdCheckBox("relaysInvert",i,relaysInvert[i-1]);
	AddTdCheckBox("relaysAlarm",i,relaysAlarm[i-1]);
	AddTdCheckBox("relaysJustOn",i,relaysJustOn[i-1]);	
	document.write('<td align="center">');
	document.write('<button name="r_ON" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_On+'</button>');
	document.write('<button name="r_OFF" value="'+i+'" onclick="changed(this,this.name,1,true)" >'+str_Off+'</button>');
	document.write('</td>');	
	AddTdDescription("r_descr*",relay_description[i],i);
	document.write('<td align="center"><input type="number" style="width: 3em"  min="0" max="32767" maxlength="5" ');
	document.write('name="r_timer*'+i+'" value="'+relay_timerDefault[i-1]+'" onchange="changed(this,this.name,1)"> sec');
	document.write('</td><td align="center"><input type="number" min="0" max="32767" style="width: 3em" maxlength="5" ');
	document.write('name="r_delay*'+i+'" value="'+relay_delayDefault[i-1]+'" onchange="changed(this,this.name,1)" > sec');
	document.write('</td><td align="center"><input type="number" min="0" max="100" style="width: 3em" maxlength="3" ');
	document.write('name="thermoActivator*'+i+'" value="'+thermoActivator[i-1]+'" onchange="changed(this,this.name,1)"> ');
	document.write('<select name="thermoActivator*'+i+'" name1="tempOnOff" name2="'+i+'" onchange="changed(this,this.name,1)">');
	document.write('<option value="0" style="color:#999;">-</option>');
	if (VersionCheck("2.7.1")) {
		document.write('<option value="255"');
			if (thermoActivator[i-1]== 255){document.write(' selected');}
			document.write('>'+str_sun);
			document.write('</option>');
	}if (VersionCheck("2.7")) {
		document.write('<option value="200"');
			if (thermoActivator[i-1]== 200){document.write(' selected');}
			document.write('>'+str_Consump);
			document.write('</option>');
	}
	if(thermo_eepromIndex != null){
		for(j=0;j<thermo_eepromIndex.length;j++){
			if(thermo_eepromIndex[j]!=0){	
				document.write('<option value="'+thermo_eepromIndex[j]+'"');
				if (thermo_eepromIndex[j] == thermoActivator[i-1]){document.write(' selected');}
				document.write('>'+thermo_eepromIndex[j]+'-'+thermo_description[thermo_eepromIndex[j]]);
				document.write('</option>');
			}
		}
	}
	for(j=0;j<humidity.length;j++){
		if (humidity[j]!=0){
			document.write('<option value="'+(j+101)+'"');
			if (j == (thermoActivator[i-1]-101)){document.write(' selected');}
			document.write('>H '+(j+1)+'-'+hum_description[j]);
			document.write('</option>');
		}
	}
	document.write('</select></td>');
	AddTdSensor(i,"min_temp_ON*"+i,min_temp_ON[i-1]/10,"tempOnOff");
	AddTdSensor(i,"max_temp_OFF*"+i,max_temp_OFF[i-1]/10,"tempOnOff");
	document.write('</tr>');
}
document.write('</table>');
for (m=0;m<relay_group.length;m++){
	for (n=0;n<relay_group[0].length;n++){
		EventParamDropDown (document.getElementById("relay_group_Group*"+m+"*"+n));
	}
}
if (typeof requestBufferSize == 'undefined') {
  var requestBufferSize = 150;
}
if(cb_SuperVisor==0){
	OpenClose("Fet");
	OpenClose("Relay");
	OpenClose("Group");
	OpenClose("Prot");
	OpenClose("Joiner");
}
window.scrollTo(x,y);
document.write('</table></div></body>');