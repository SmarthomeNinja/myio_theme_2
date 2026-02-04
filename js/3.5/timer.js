document.write('<div class="content">');
document.write('<table id="t02" align="center" ><tr><th id="top" colspan="11"><script>document.write(str_TimerSettings);</script></th></tr>');
document.write('<tr><th>ID</th>'); 
if (VersionCheck("3.7.5")) {
	document.write('<th>'+str_sun+'</th>'); 
}
document.write('<th>' + str_Month + '</th><th>' + str_Day + '</th><th>' + str_Hour + '</th><th>' + str_Min + '</th><th>' + str_Days + '</th><th colspan="2">' + str_Events + '</th><th>' + str_Set + '</th><th>' + str_Delete + '</th></tr > ');
if (timerCsv){
	for (i=0;i<timerId.length;i++){
		document.write('<tr><td align="center"><h5 id="timerId*' + timerId[i] + '">' + timerId[i] + '</h5></td>');
		if (VersionCheck("3.7.5")) {

			document.write('<td align="center">↑<input type="checkbox" id="timerSunrise*'+timerId[i]+'" value="'+(timerSunrise[i])+'" ');
			if ((timerSunrise[i]) == true) { document.write('checked '); }
			document.write('onchange="CheckSunCheckBox('+i+',1)">');
			document.write('<br>↓<input type="checkbox" id="timerSunset*'+timerId[i]+'" value="'+(timerSunset[i])+'" ');
			if ((timerSunset[i]) == true) { document.write('checked '); }
			document.write('onchange="CheckSunCheckBox('+i+',2)"></td>');
			
		}
		document.write('<td align="center">');
		document.write('<select id="timerMonth*'+timerId[i]+'" onchange="timerMonthOnChange(this);">');			
		for(j=0;j<13;j++){	
			if (j==0){
				document.write('<option value="80"');
				if (timerMonth[i] == 80){document.write(' selected');}
				document.write('>-</option>');
			}else{
				document.write('<option value="'+j+'"');
				if (timerMonth[i] == j){document.write(' selected');}
				document.write('>'+j+'</option>');
			}
		}	
		document.write('<option value="90"');
		if (timerMonth[i] == 90){document.write(' selected');}
		document.write('>all</option></select></td>');
		document.write('<td align="center"><select id="timerDay*'+timerId[i]+'">');
		for(j=0;j<=31;j++){	
			if (j==0){
				document.write('<option value="80"');
				if (timerDay[i] == 80){document.write(' selected');}
				document.write('>-</option>');
			}else{
				document.write('<option value="'+j+'"');
				if (timerDay[i] == j){document.write(' selected');}
				document.write('>'+j+'</option>');
			}
		}
		document.write('<option value="90"');
		if (timerDay[i] == 90){document.write(' selected');}
		document.write('>all</option></select></td>');
		document.write('<td align="center"><select id="timerHour*'+timerId[i]+'">');
		document.write('<option value="'+80+'"');
		if (timerHour[i] == 80){document.write(' selected');}
		document.write('>-</option>');
		for(j=0;j<24;j++){	
			document.write('<option value="'+j+'"');
			if (timerHour[i] == j){document.write(' selected');}
			document.write('>'+j+'</option>');
		}		
		document.write('<option value="'+90+'"');
		if (timerHour[i] == 90){document.write(' selected');}
		document.write('>all</option></select></td>');
		document.write('<td align="center"><select id="timerMinute*'+timerId[i]+'">');
		document.write('<option value="'+80+'"');
		if (timerMinute[i] == 80){document.write(' selected');}
		document.write('>-</option>');
		for(j=0;j<60;j++){	
			document.write('<option value="'+j+'"');
			if (timerMinute[i] == j){document.write(' selected');}
			document.write('>'+j+'</option>');
		}	
		document.write('</select></td>');
		document.write('<td><table style="width:100%; padding:10" id="t01" align="center" >');
			document.write('<tr><td align="center">'+str_Mon+'</td><td align="center">'+str_Tue+'</td><td align="center">'+str_Wed+'</td><td align="center">'+str_Thu+'</td><td align="center">'+str_Fri+'</td><td align="center">'+str_Sat+'</td><td align="center">'+str_Sun+'</td></tr>');
			document.write('<tr><td align="center"><input type="checkbox" id="timerMon*'+timerId[i]+'" value="'+(timerDays[i]&64)+'" ');
			if( (timerDays[i]&64) == 64){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" id="timerTue*'+timerId[i]+'" value="'+(timerDays[i]&32)+'" ');
			if( (timerDays[i]&32) == 32){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" id="timerWed*'+timerId[i]+'" value="'+(timerDays[i]&16)+'" ');
			if( (timerDays[i]&16) == 16){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" id="timerThu*'+timerId[i]+'" value="'+(timerDays[i]&8)+'" ');
			if( (timerDays[i]&8) == 8){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" id="timerFri*'+timerId[i]+'" value="'+(timerDays[i]&4)+'" ');
			if( (timerDays[i]&4) == 4){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" id="timerSat*'+timerId[i]+'" value="'+(timerDays[i]&2)+'" ');
			if( (timerDays[i]&2) == 2){document.write('checked ');}
			document.write('></td>');
			document.write('<td align="center"><input type="checkbox" ');
			document.write('id="timerSun*'+timerId[i]+'" value="'+(timerDays[i]&1)+'" ');
			if( (timerDays[i]&1) == 1){document.write('checked ');}
		document.write('></td></tr></table></td>');
		document.write('<td align="center"><select id="timerEvent*'+timerId[i]+'" onchange="TimerEventParamDropDown (this); " >');
			document.write('<option value="0"');
			if (timerEvent[i] == '0'){document.write(' selected');}
			document.write('>-</option>');
			document.write('<option value="1"');
			if (timerEvent[i] == '1'){document.write(' selected');}		
			document.write('>'+str_LoAll+'</option>');
			document.write('<option value="8"');
			if (timerEvent[i] == '8'){document.write(' selected');}
			document.write('>'+str_LoGe+'</option>');
			document.write('');
			document.write('<option value="9"');
			if (timerEvent[i] == '9'){document.write(' selected');}
			document.write('>'+str_LoPWM+'</option>');
			document.write('<option value="10"');
			if (timerEvent[i] == '10'){document.write(' selected');}
			document.write('>'+str_LoInp+'</option>');
			document.write('<option value="11"');
			if (timerEvent[i] == '11'){document.write(' selected');}
			document.write('>'+str_LoGr+'</option>');
			document.write('<option value="12"');
			if (timerEvent[i] == '12'){document.write(' selected');}
			document.write('>'+str_LoOut+'</option>');
			document.write('<option value="13"');
			if (timerEvent[i] == '13'){document.write(' selected');}
			document.write('>'+str_LoPr+'</option>');
			document.write('<option value="14"');
			if (timerEvent[i] == '14'){document.write(' selected');}
			document.write('>' + str_LoPCA + '</option>');
			if (VersionCheck("3.7.1")) {
				document.write('<option value="17"');
				if (timerEvent[i] == '17'){document.write(' selected');}
				document.write('>' + str_LoEman + '</option>');	
			}
			document.write('<option value="2"');
			if (timerEvent[i] == '2'){document.write(' selected');}
			document.write('>'+str_ROn+'</option>');
			document.write('<option value="3"');
			if (timerEvent[i] == '3'){document.write(' selected');}
		document.write('>' + str_ROff + '</option>');
		
		document.write('<option value="4"');
		if (timerEvent[i] == '4'){document.write(' selected');}
		document.write('>' + str_FOn + '</option>');
		
		document.write('<option value="5"');
		if (timerEvent[i] == '5'){document.write(' selected');}
		document.write('>' + str_FOff + '</option>');
		
		document.write('<option value="6"');
		if (timerEvent[i] == '6'){document.write(' selected');}
		document.write('>'+str_GOn+'</option>');
		
		document.write('<option value="7"');
		if (timerEvent[i] == '7'){document.write(' selected');}
		document.write('>' + str_GOff + '</option>');
		
		document.write('<option value="15"');
		if (timerEvent[i] == '15'){document.write(' selected');}
		document.write('>'+str_POn+'</option>');
		document.write('<option value="16"');
		if (timerEvent[i] == '16'){document.write(' selected');}
		document.write('>' + str_POff + '</option>');
			
		document.write('</select></td>');
		document.write('<td align="center"><select id="timerEventParam*'+timerId[i]+'" name="'+timerEventParam[i]+'" style="width:14em;"></select></td>');
		document.write('<td align="center"><button name="ok" value="' + timerId[i] + '" onclick="submitButton(this)">' + str_Set + '</button></td>');
		
		if (timerId.length > 0){
			document.write('<td align="center"><button name="del_timerSlot" value="'+timerId[i]+'" onclick="changed(this,this.name,1,1,1)">'+str_Delete+'</button></td></tr>');
		}
		if (VersionCheck("3.7.5")) {
			CheckSunCheckBox(i, 0);
		}

	}//for end
}
document.write('<tr><th colspan="10" align="center">');
if( timerId.length >= 100){	
	document.write(str_ReachMax);
}
document.write('</th></tr>');
document.write('<th colspan="10">');
if(timerId.length < 100){	
	document.write('<button name="new_timerSlot" onclick="changed(this,this.name,1,1)" value="1">'+str_NewEvent+'</button>');
}
document.write('</th></table></div></body>');
if (timerId[0] != 255) {
	for (k = 0; k < timerId.length; k++) {
		TimerEventParamDropDown(document.getElementById("timerEvent*" + timerId[k]));
	}
}
 
window.scrollTo(x,y);
document.write('</html>');


function CheckSunCheckBox(number,clicked) {
	const checkbox1 = document.getElementById('timerSunrise*'+timerId[number]);
	const checkbox2 = document.getElementById('timerSunset*' + timerId[number]);
	const hourBox = document.getElementById('timerHour*' + timerId[number]);
	const minuteBox = document.getElementById('timerMinute*'+timerId[number]);
	if (clicked == 1) {
		checkbox2.checked = false;	
	} else if(clicked == 2){
		checkbox1.checked = false;
	}
	if (checkbox1.checked == true || checkbox2.checked == true) {
		hourBox.style.visibility = "hidden";
		minuteBox.style.visibility = "hidden";
	} else {
		hourBox.style.visibility = "visible";
		minuteBox.style.visibility = "visible";
	}
}
