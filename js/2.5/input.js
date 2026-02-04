document.write('<div class="content"><table align="center">');
document.write('<tr valign="top"><td><table id="t02" align="center" >');
document.write('<tr><th id="top">');
var thsens=0;
document.write('<input type="number" style="width: 3em" min="0" max="99" maxlength="2" onchange="thsens=this.value">');
document.write('<input type="number" style="width: 4em" maxlength="5" name="thsens*" onchange="changedSens(this)">');	
document.write('</th><th id="top">');
document.write(str_Tsens+'</th><th id="top"><button name="ReInit" value="1" onclick="changed(this,this.name,1,1)" align="left">'+str_ReInit+'</button></th></tr>');
document.write('<tr><th>EEprom ID</th><th>'+str_Name+'</th><th>Celsius</th></tr>');  
if(!fullZeroArray(thermo_eepromIndex)){
	for(i=0;i<thermo_eepromIndex.length;i++){	
		if(thermo_eepromIndex[i]!=0){	
			document.write('<tr><td align="center">'+thermo_eepromIndex[i]+'</td>');
			document.write('<td align="center">');
			document.write('<input type="text" size="25"  maxlength="25" placeholder="-" ');
			if(thermo_description[thermo_eepromIndex[i]]==null){thermo_description[thermo_eepromIndex[i]]="";}
			document.write('name="t_descr*'+thermo_eepromIndex[i]+'" value="'+thermo_description[thermo_eepromIndex[i]]+'" onchange="changed(this)"></td>');
			document.write('<td align="center">'+(thermo_temps[i]/100));
			document.write('</td></tr>');
		}
	}   
}
document.write('</table></td><td><table id="t02" align="center" ><tr><th id="top">');
var humsens=0;
document.write('<input type="number" style="width: 3em" min="0" max="99" maxlength="2" onchange="humsens=this.value">');
document.write('<input type="number" style="width: 4em" maxlength="5" name="humsens*" onchange="changedSens(this)">');	
document.write('</th><th id="top" colspan="2">'+str_Hsens+'</th></tr>');
document.write('<tr><th>ID</th><th>'+str_Name+'</th><th>%</th></tr>'); 
for(i=0;i<humidity.length;i++){		
	if(humidity[i]!=0){
		document.write('<tr><td align="center">'+(i+1)+'</td>');
		document.write('<td align="center"><input type="text" size="25"  maxlength="25" placeholder="-" ');
		if(hum_description[i]==null){hum_description[i]="";}
		document.write('name="h_descr*'+i+'" value="'+hum_description[i]+'" onchange="changed(this)"></td>');
		document.write('<td align="center">'+(humidity[i]/10));
		document.write('</td></tr>');
	}
}           
document.write('</table></td></tr></table><br><table align="center">');
document.write('<tr valign="top"><td><table id="t02" align="center"><tr>');
OpenCloseCheckBox('Input');
document.write('<th id="top" colspan="9">'+str_InputSettings+'</th></tr>');
document.write('<tr name="Input">');
HideCheckBox('Input');	
document.write('<th>ID</th><th>'+str_Enabled+'</th><th>NC</th><th>'+str_Name+'</th><th>'+str_Hit+'</th><th>'+str_Press+'</th><th>'+str_Release+'</th><th>'+str_Block+'</th></tr>');
for(i=1;i<=switchEnabled.length;i++){
	document.write('<tr name="Input" id="tr_Input_'+i+'"');
	if( i== lastSwitch && i%2 == 0){document.write(' class="on1"');}
	if( i== lastSwitch && i%2 != 0){document.write(' class="on2"');}	
	hideRowCheckBox("Input",i);
	document.write('><td align="center">'+i+'</td>')
	document.write('<td align="center"><input type="checkbox" name="switchEnabled" value="'+i+'" ');
	if( switchEnabled[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)"></td>');
	document.write('<td align="center"><input type="checkbox" name="switchNC" value="'+i+'" ');
	if( switchNC[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)"></td>');
	
	document.write('<td align="center"><input type="text" size="25"  maxlength="25" placeholder="-" ');
	if(switch_description[i]==null){switch_description[i]="";}
	document.write('name="s_descr*'+i+'" value="'+switch_description[i]+'" onchange="changed(this)"></td>');
	
	for(k=0;k<3;k++){
		if(i%2==0)document.write('<td><table id="t03"><tr>');
		if(i%2!=0)document.write('<td><table id="t04"><tr>');		
		document.write('<td align="right">');
		document.write('<button class="green_button" name="s_'+HPRwrite(k)+'" value="'+i+'" onclick="changed(this)" >'+HPRstring(k)+'</button>');
		document.write('<input type="number" style="width: 4em"  min="0" max="1000" maxlength="3" name="'+HPRwrite(k)+'Event*'+i+'" value="'+HPRevent(k,i-1)+'" onchange="changed(this)">');	
		document.write('</td><td>');
		document.write('<select id="'+HPRwrite(k)+'EventGroup*'+i+'" name="'+HPRwrite(k)+'EventGroup*'+i+'" onchange="EventParamDropDown(this)">');
		document.write('<option value="0"');
		if (HPRevent(k,i-1) == 0){document.write(' selected');}
		document.write('>-</option>');	
		document.write('<optgroup label="'+str_Switch+'">');
		document.write('<option value="1"');
		if (HPRevent(k,i-1) <65 && HPRevent(k,i-1)>0){document.write(' selected');}
		document.write('>'+str_PCF+'</option>');
		document.write('<option value="4"');
		if (HPRevent(k,i-1) <114 && HPRevent(k,i-1)>100){document.write(' selected');}
		document.write('>'+str_PWM+'</option>');
		document.write('<option value="5"');
		if (HPRevent(k,i-1) <214 && HPRevent(k,i-1)>200){document.write(' selected');}
		document.write('>'+str_PWMF+'</option>');
		document.write('<option value="6"');
		if (HPRevent(k,i-1) <600 && HPRevent(k,i-1)>500){document.write(' selected');}
		document.write('>'+str_Group+'</option>');
		document.write('</optgroup>');
		document.write('<optgroup label="'+str_Load+'">');
		document.write('<option value="7"');
		if (HPRevent(k,i-1) <1100 && HPRevent(k,i-1)>999){document.write(' selected');}
		document.write('>'+str_LoAll+'</option>');
		document.write('<option value="8"');
		if (HPRevent(k,i-1) <1200 && HPRevent(k,i-1)>1099){document.write(' selected');}
		document.write('>'+str_LoOut+'</option>');
		document.write('<option value="9"');
		if (HPRevent(k,i-1) <1300 && HPRevent(k,i-1)>1199){document.write(' selected');}
		document.write('>'+str_LoPWM+'</option>');
		document.write('<option value="10"');
		if (HPRevent(k,i-1) <1400 && HPRevent(k,i-1)>1299){document.write(' selected');}
		document.write('>'+str_LoPr+'</option>');
		document.write('<option value="11"');
		if (HPRevent(k,i-1) <1500 && HPRevent(k,i-1)>1399){document.write(' selected');}
		document.write('>'+str_LoGr+'</option>');
		document.write('<option value="12"');
		if (HPRevent(k,i-1) <1600 && HPRevent(k,i-1)>1499){document.write(' selected');}
		document.write('>'+str_LoInp+'</option>');
		document.write('<option value="13"');
		if (HPRevent(k,i-1) <1700 && HPRevent(k,i-1)>1599){document.write(' selected');}
		document.write('>'+str_LoGe+'</option>');
		document.write('</optgroup>');
		document.write('</select>');	
		document.write('<select id="'+HPRwrite(k)+'Event*'+i+'" name="'+HPRevent(k,i-1)+'" style="width:14em;" onchange="changed(this,this.id)"></select></td>');
		document.write('</tr></table></td>');
	}
	document.write('<td align="center"><input type="checkbox" name="hitBlockEnabled" value="'+i+'" ');
	if( hitBlockEnabled[i-1] == 1){document.write('checked ');}
	document.write('onchange="changed(this)"></td></tr>');
}
if (typeof requestBufferSize == 'undefined') {
  var requestBufferSize = 150;
}
for (m=1;m<=switchEnabled.length;m++){
	EventParamDropDown (document.getElementById("hitEventGroup*"+m));
	EventParamDropDown (document.getElementById("pressEventGroup*"+m));	
	EventParamDropDown (document.getElementById("releaseEventGroup*"+m));
}
if(cb_SuperVisor==0){
	OpenClose("Input");
}

window.scrollTo(x,y);
document.write('</script></table></div></body>');