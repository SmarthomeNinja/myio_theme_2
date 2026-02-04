document.write('<div class="content">');
var tempString='<div class="container"><h2 align="center">'+str_Sensors+'</h2><div class="container">';
if (consumption!=0){
	document.write(tempString);tempString="";
	document.write('<div class="respWidth rawBox"><h4 align="center">'+str_Consump+'</h4><h3 align="center">'+consumption/1000);
	document.write(' '+consumptionUnit+'</h3></div>');
}
if(!fullZeroArray(thermo_eepromIndex)){
	for(i=0;i<thermo_eepromIndex.length;i++){
		if(thermo_eepromIndex[i]!=0){
			document.write(tempString);tempString="";	
			document.write('<div class="respWidth rawBox"><h4 align="center">');
			if(thermo_description[thermo_eepromIndex[i]]==null){thermo_description[thermo_eepromIndex[i]]="-";}
			document.write(thermo_description[thermo_eepromIndex[i]]+'</h4><h3 align="center">'+(thermo_temps[i]/100)+' C°');
			document.write('</h3></div>');
		}
	}
}
for(i=0;i<humidity.length;i++){	
	if(humidity[i]!=0){
		document.write(tempString);tempString="";
		document.write('<div class="respWidth rawBox"><h4 align="center">');
		if(hum_description[i]==null){hum_description[i]="-";}
		document.write(hum_description[i]+'</h4><h3 align="center">'+(humidity[i]/10)+' %');
		document.write('</h3></div>');
	}
}
if(tempString==""){
	document.write('</div></div>');
} 
//switches
var _swE=0;
for(i=0;i<switchEnabled.length;i++){
	if (switchEnabled[i] != 0 &&  switch_description[i+1]!=null){
		_swE=1;break;
	}
}
if (_swE){
	document.write('<div class="container"><h2 align="center">'+str_Input+'</h2><div class="container">');
	for(i=0;i<switchEnabled.length;i++){
		if (switchEnabled[i] != 0 &&  switch_description[i+1]!=null){
			document.write('<div class="respWidth rawBox"><h4 align="center">');
			if(switch_description[i+1]==null || switch_description[i+1]=="" ){switch_description[i+1]="-";}
			document.write(switch_description[i+1]+'</h4>');
			document.write('<table style="width:100%; padding:10;" align="center"><tr>');		
			document.write('<td align="center" id="lb"');
			if (switchEnabled[i] == 11){
			 document.write(' width="50%"');
			}
			if(switchEnabled[i] >= 10){	
			 document.write('><button class="button" name="s_hit" value="'+(i+1)+'" onclick="changed(this)" >'+str_Hit+'</button');	
			}
			document.write('></td>');	
			if(switchEnabled[i]-10==1 || switchEnabled[i]==1){
				document.write('<td align="center" id="rb"><button class="button" name="s_press" value="'+(i+1)+'" onclick="changed(this)" >'+str_Press+'</button>');
			}
			document.write('</td></tr></table></div>');     
		}
	}
	document.write('</div></div>');
}
var _fE=0; 								 	//FET-ek
for(i=0;i<fet.length;i++){
	if (fet[i] != 0 && fet_description[i+1]!=null){
		_fE=1;break;
	}
}
if (_fE){
	document.write('<div class="container"><h2 align="center">'+str_PWM+'</h2><div class="container">');
	for(i=0;i<fet.length;i++){
		if(fet[i]!=0 && fet_description[i+1]!=null){
			var fetRead = 0;
			var fetWrite = 0;
			if(fet[i]>= 10000) {fetRead = 1;fet[i] = fet[i] - 10000;}
			if(fet[i]>= 1000){fetWrite = 1;fet[i] = fet[i] - 1000;}
			if (fetRead||fetWrite){
				document.write('<div class="respWidth rawBox fet">');	
				if(fet[i]>0 && fetRead == 1){									
					document.write('<h4 align="center" id="l">');
				}else{
					document.write('<h4 align="center" id="d">');
				}			
				if(fet_description[i+1]==null || fet_description[i+1]==""){fet_description[i+1]="-";}
				document.write(fet_description[i+1]+'</h4>');
				document.write('<table style="width:100%; padding:10;" align="center"><tr>');
				if(fetWrite == 1){
					document.write('<td align="center" width="50%" id="lb"><button class="button" name="f_ON" value="'+(i+1)+'" onclick="changed(this)" >'+str_On+'</button></td>');
					document.write('<td align="center" width="50%" id="rb"><button class="button" name="f_OFF" value="'+(i+1)+'" onclick="changed(this)" >'+str_Off+'</button></td>');
					document.write('<tr><td align="center" colspan="2"><input type="number" min="0" max="100" style="width: 3em" maxlength="3" ');
					document.write('name="fet*'+(i+1)+'" value="'+Math.round(fet[i]/2.55)+'" onchange="changed(this,this.name,1,true)" ></td></tr>');
					document.write('<tr><td align="center" colspan="2"><input type="range" min="'+Math.round(fetMIN[i]/2.55)+'" max="'+Math.round(fetMAX[i]/2.55)+'" style="width: 90%; height: 20px; -webkit-appearance: slider-horizontal; writing-mode: bt-lr;"');
					document.write('name="fet*'+(i+1)+'" value="'+Math.round(fet[i]/2.55)+'" onchange="changed(this,this.name,1,true)"></tr>');
				}else{
				 	document.write('<td align="center" width="50%"></td><td align="center" width="50%"></td>');
				}
				document.write('</tr></table></div>');
			}
		}	
	}  
	document.write('</div></div>');
}
var _rE=0;
for(i=0;i<relays.length;i++){
	if (relays[i] != 0 && relay_description[i+1]!=null && thermoActivator[i]==0 ){
		_rE=1;break;
	}
}   
if(_rE){
	document.write('<div class="container"><h2 align="center">'+str_Output+'</h2><div class="container">');
	for(i=0;i<relays.length;i++){	
		if (relays[i] != 0 && thermoActivator[i]==0 && relay_description[i+1]!=null ){				//ha sima ON-OFF relay
			document.write('<div class="respWidth rawBox relay">');												
			if (relays[i] == 101 || relays[i] == 111 || relays[i] == 11){ 
				document.write('<h4 align="center" id="l">');
			}else{
				document.write('<h4 align="center" id="d">');
			}
			if(relay_description[i+1]==null || relay_description[i+1]==""){relay_description[i+1]="-";}
			document.write(relay_description[i+1]+'</h4>');
			document.write('<table style="width:100%; padding:10;" align="center" >');
			document.write('<tr>');
			if(parseInt(relays[i]/10) == 1 || parseInt(relays[i]/10) == 11){
			 document.write('<td align="center" width="50%" id="lb"><button class="button" name="r_ON" value="'+(i+1)+'" onclick="changed(this)">'+str_On+'</button></td>');
			 document.write('<td align="center" width="50%" id="rb"><button class="button" name="r_OFF" value="'+(i+1)+'" onclick="changed(this)">'+str_Off+'</button></td>');
			}
			document.write('</tr></table></div>');
		}
	}  	
	document.write('</div></div>');	
}
// Thermo relays
var _trE=0;
for(i=0;i<relays.length;i++){
	if (thermoActivator[i] != 0 ){
		document.write('<div class="container"><h2 align="center">'+str_SensOut+'</h2><div class="container">');
		_trE=1;
	break;
	}
}  
for(i=0;i<relays.length;i++){
	if (thermoActivator[i] != 0 ){	//ha Thermo relay
			document.write('<div class="respWidth rawBox relay"');
	if (relays[i] == 101 || relays[i] == 111 || relays[i] == 11){ 
		if (min_temp_ON < max_temp_OFF){
			document.write(' style="background-color:#c2240e;" >');		// ha megy a fűtés
		}else{
			document.write(' style="background-color:#05bed9;" >');		// ha megy a hűtés
		}
	}else{
		document.write(' style="background-color:#3b2c0f;" >');
	}		
	document.write('<h4 align="center">');
	if(relay_description[i+1]==null || relay_description[i+1]==""){relay_description[i+1]="-";}
	document.write(relay_description[i+1]+'</h4>');
	document.write('<table style="width:100%; padding:10;"  align="center" >');
	var tempChar;
	if(thermoActivator[i]<100){
		tempChar=" C°";
	}else{
		tempChar=" %";
	}
	document.write('<tr>');
	if(parseInt(relays[i]/10) == 1 || parseInt(relays[i]/10) == 11){
	 document.write('<td align="center" width="50%" id="lb">');
	 document.write('Be<br>');
	 document.write('<input type="number" min="0" max="'+max_temp_OFF[i]/10+'" style="width: 3em" maxlength="5" ');
	 document.write('name="min_temp_ON*'+(i+1)+'" value="'+min_temp_ON[i]/10+'" ');
	 document.write('onchange="changed_temp(this)" > '+tempChar);
	 document.write('</td>');
	 document.write('<td align="center" width="50%" id="rb">');
	 document.write('Ki<br>');										
	 document.write('<input type="number" min="'+min_temp_ON[i]/10+'" max="1000" style="width: 3em" maxlength="5" ');
	 document.write('name="max_temp_OFF*'+(i+1)+'" value="'+max_temp_OFF[i]/10+'" ');
	 document.write('onchange="changed_temp(this)" > '+tempChar);
	 document.write('</td>');
	}else{
	 document.write('<td align="center" width="50%" bgcolor="#dddd00">');
	 document.write('Be<br>'+min_temp_ON[i]/10+tempChar);											 
	 document.write('</td>');
	 document.write('<td align="center" width="50%" bgcolor="#b9b900">');	
	 document.write('Ki<br>'+max_temp_OFF[i]/10+tempChar);
	 document.write('</td>');
	}
	document.write('</tr></table>');
	var tempVar=0;
	if(thermoActivator[i]<100){
		for (j=0;j<thermo_eepromIndex.length;j++){
			if(thermoActivator[i] == thermo_eepromIndex[j]){
				tempVar=thermo_temps[j]/100;
			}
		}
	}else{
		tempVar=humidity[thermoActivator[i]-101]/10;
	}
	document.write('<div align="center" style="color:#ffffff">');   
	document.write(tempVar+tempChar+'</div></div>');
	}	
}
if (_trE){
	document.write('</div></div>');
}
window.scrollTo(x,y);

document.write('</div></body>');
