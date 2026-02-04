function broadlinkSave(){
	SaveImmediately.innerHTML = '<button name="br_discovery" value="1" onclick="changed(this)">' + "Discovery" + '</button>';
	SaveImmediately.innerHTML+='<button name="br_save" value="1" onclick="changed(this)">'+str_SaveImmediately+'</button>';
	SaveImmediately.style.border="none";
}
function hideSave() {
	SaveImmediately.innerHTML='<button name="saveOn" onclick="displaySave()">'+str_SaveImmediately+'</button>';
	SaveImmediately.style.border="none";
}
function displaySave(){
	var tempString="";	
	tempString='<table style="opacity: 0.97;background-color:transparent;"><tr><td>slot:</td><td><select id="saveSelect" name="saveSelect" onchange=changeSaveButton()>';
	tempString+='</select></td><td align="right"><button name="SaveClose" onclick="hideSave()">X</button></td></tr>';	
	tempString+='<tr><td>file:</td><td><select id="saveType" name="saveType" onchange=changeSaveButton();>';
	tempString+='<option value="sav_all">'+str_All+'</option>';
	tempString += '<option value="sav_r">' + str_Output + '</option>';
	tempString+='<option value="sav_p">'+str_PCA_Output+'</option>';
	tempString+='<option value="sav_f">'+str_PWM_simple+'</option>';
	tempString+='<option value="sav_sw">'+str_Input+'</option>';
	tempString+='<option value="sav_pr">'+str_Prot+'</option>';
	tempString+='<option value="sav_gr">'+str_Group+'</option>';
	tempString += '<option value="sav_gl">' + str_General + '</option>';
	tempString+='<option value="sav_eman">'+str_Emanager+'</option>';
	tempString+='</select></td></tr>';	
	tempString+='<tr><td colspan="3" align="center"><button style="color:white; background-color: orangered;" name="sav_all" id="saveButton" value='+actualSlot+' onclick="changed(this,this.name,1,1,1)" ></button></td></tr></table>';
	SaveImmediately.innerHTML=tempString;	
	SaveSelect=document.getElementById("saveSelect");			
	for (i=0; i<slot_description.length; i++){
		if (slot_description[i] !="" && slot_description[i] !="-" && slot_description[i] !=null ){				
			var option = document.createElement("option");
			option.value = i;	
			option.text = slot_description[i];
			if(i == actualSlot) {option.selected=1;}
			SaveSelect.add(option);
		}
	}
	changeSaveButton();
	SaveImmediately.style.border="solid 3px black";
}
function changeSaveButton(){
	SaveType = document.getElementById("saveType");	
	SaveButton=document.getElementById("saveButton");
	SaveButton.innerText=SaveType.options[SaveType.selectedIndex].text+' '+str_Save+' slot : '+SaveSelect.value;
	SaveButton.name=SaveType.value;
	SaveButton.value=SaveSelect.value;
}
function toggleButton(name,hide=0,refresh=1) {
	if (document.getElementById("cb_"+name).checked == true){
		setCookie(name,"1");	  
		if(cb_SuperVisor==0&&hide==1) document.getElementById("tr_"+name).style.visibility = "visible";
	} else {
		setCookie(name,"0");
		if(cb_SuperVisor==0&&hide==1) {
			document.getElementById("tr_"+name).style.visibility = "hidden";
			document.getElementById("cb_"+name).style.visibility = "visible";
		}
	}
	if (refresh==1)sendForm();
}
function sendForm(_form = "form") {
	document.getElementById("overlay").style.display = "block";
	document.getElementById("Y").value = window.scrollY;
	document.getElementById("X").value = window.scrollX;
	document.getElementById(_form).submit();
}
function changed(obj, name = obj.name, multiplier = 1, forceRefresh = getCookie("AutoRefresh"),areYouSure=false) {
	var _confirmed = true;
	if (areYouSure) {
		if (!confirm(str_AreYouSure)) {
			_confirmed = false;
		  }
	}
	if (_confirmed) {
		if (multiplier == 1) {
			value = obj.value;
		} else {
			value = Math.round(obj.value * multiplier);
		}
		if (name.startsWith("fet*")
			|| name.startsWith("fetM")
			|| name.startsWith("PCA*")
			|| name.startsWith("PCAMIN")
			|| name.startsWith("PCAMAX")
		) {
			console.log(value);
			value = Math.round(value * 255 / 100);
			console.log(value);
		}
		
		// Index oldalon AJAX parancsküldés használata (ha MyIOLive elérhető)
		const isIndexPage = window.location.pathname == "/" || window.location.pathname == "/index";
		
		if (isIndexPage && typeof MyIOLive !== 'undefined') {
			// AJAX GET parancsküldés - nem tölti újra az oldalt!
			MyIOLive.sendCommand(name + "=" + value, true);
		} else if (getCookie("AutoRefresh") == "1"
			|| forceRefresh == "1"
			|| forceRefresh == 1
			|| name == "ReInit"
			|| window.location.pathname == "/"
			|| window.location.pathname == "/index"
			|| window.location.pathname == "/chart"
			|| window.location.pathname == "/log"
			|| window.location.pathname == "/users"
			|| window.location.pathname == "/config"
			|| window.location.pathname == "/timer"
		) {
			document.getElementById("sending").name = name;
			document.getElementById("sending").value = value;
			sendForm();
		} else {
			sendXMLHttp(name + "=" + value);
		}
		if (obj.parentNode.parentNode.getAttribute("name1") != null) {
			visibleItem(obj.parentNode.parentNode.getAttribute("name1"), obj.parentNode.parentNode.getAttribute("name2"));
		} else if (obj.getAttribute("name1") != null) {
			visibleItem(obj.getAttribute("name1"), obj.getAttribute("name2"));
		}
	}
}
function changedSens(obj){
	if(obj.name=='thsens*'){
		document.getElementById("sending").name = obj.name+thsens;
	}else{
		document.getElementById("sending").name = obj.name+humsens;
	}
    document.getElementById("sending").value = obj.value;
    sendForm();
}
function sendXMLHttp(obj){
	var xhttp;
	xhttp = new XMLHttpRequest();
	xhttp.open("POST", "info.json", false);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send(obj);
}
function fullZeroArray(_array) {
	if (_array != undefined) {
		for (ai = 0; ai < _array.length; ai++) {
			if (_array[ai] != 0) return 0;
		}
	}
	return 1;
}
function B_var(str){
	document.write('<tr><td>'+str+'</td><td>');
}
function B_End(){
	document.write('</td></tr>');
}
function AddTdDescription(name, value, i, align = 0) {
	if (align == 0) {
		document.write('<td align="center">');
	} else if (align == 1) {
		document.write('<td align="left">');
	}else if (align == 2) {
		document.write('<td align="right">');
	}
	document.write('<input type="text" size="24"  maxlength="24" placeholder="-" ');	
	document.write('name="'+name+i+'" value="'+value+'"" onchange="changed(this,this.name,1)"></td>');
}
function AddTdCheckBox(name, value, checked){
	document.write('<td align="center"><input type="checkbox" name="'+name+'" value="'+i+'" ');
	if(checked == 1){document.write('checked ');}
	document.write('onchange="changed(this,this.name,1)"></td>');
}
function AddTdSensor(i, name, value, classOnOff) {	
	if(classOnOff=='mixMinMax') {
		tActivator= fet_thermoActivator[i-1];
	}else if(classOnOff=='PCAMinMax') {
		tActivator = PCA_thermoActivator[i - 1];				
	}else {
		tActivator= thermoActivator[i-1];
	}
	if (tActivator == 200) {
		value = parseFloat(value/10).toFixed(2);
	} else if (tActivator>200 && tActivator<=203) {
		value = value*10;
	} else if (tActivator>203 && tActivator<=209) {
		value = parseFloat(value).toFixed(1);
	} else if (tActivator == 255) {
		value = value*10;
	}
	document.write('<td class=' + classOnOff + i + ' ');
	
	if (tActivator == 0 ){
		document.write('style="display: none" ');
	} else if (tActivator <= 100 ) {
		document.write('style="display: table-cell" ');
	}	
	document.write('align="center">');
	if (tActivator == 255) {
		document.write('<select name="' + name + '" onchange="changed(this,this.name,1)" >');
		document.write('<option value="0" style="color:#999;">-</option>');		
		document.write('<option value="1"');
		if (value == 1){document.write(' selected');}
		document.write('>'+str_SunRise);
		document.write('</option>');
		document.write('<option value="2"');
		if (value == 2){document.write(' selected');}
		document.write('>'+str_SunSet);
		document.write('</option>');
		document.write('</select>');
	} else {
		document.write('<input type = "number" style = "width: 3em;text-align: right;" maxlength = "3" ');
		document.write('name="' + name + '" value="' + value + '" ');
		if (tActivator == 0) {
			document.write('onchange="changed(this,this.name,10)" >');
		} else if (tActivator <= 100) {
			document.write('onchange="changed(this,this.name,10)" > C°');
		} else if (tActivator == 200) {
			document.write('onchange="changed(this,this.name,100)" > ' + consumptionUnit);
		} else if (tActivator > 200 && tActivator <= 203) {
			document.write('onchange="changed(this,this.name,1)" > W');
		} else if (tActivator > 203 && tActivator <= 206) {
			document.write('onchange="changed(this,this.name,10)" > V');
		} else if (tActivator > 206 && tActivator <= 209) {
			document.write('onchange="changed(this,this.name,10)" > A');
		} else {
			document.write('onchange="changed(this,this.name,10)" > %');
		}
	}

	document.write('</td>');
}
function refresh(name){
	var {name,l,desc}=NameLengthDescByName(name);	
	for(i=1;i<=l;i++){		
		if(cb_SuperVisor==1){
			document.getElementById('tr_'+name+'_'+i).style.display = "table-row";
		}else{
			if(desc[i]=="" || desc[i]==null){
				document.getElementById('tr_'+name+'_'+i).style.display = "none";
			}else{
				if(getCookie('Hide'+name+'_1')==0){
					if(getCookie(name+'_'+i)==1){
						document.getElementById('tr_'+name+'_'+i).style.display = "table-row";
					}else{
						document.getElementById('tr_'+name+'_'+i).style.display = "none";
					}
				}else{
					document.getElementById('tr_'+name+'_'+i).style.display = "table-row";
					if(getCookie(name+'_'+i)==1){
						document.getElementById('tr_'+name+'_'+i).style.visibility = "visible";
					}else{
						document.getElementById('tr_'+name+'_'+i).style.visibility = "hidden";
		 				document.getElementById("cb_"+name+'_'+i).style.visibility = "visible";
					}
				}
			}
		}
	}	
}
function addOption(name,selected){
	var {name,l,desc}=NameLengthDescByName(name);
	switch(name){
		case "Fet":
			IdRef=100;
			break;
		case "Group":
			IdRef=500;
			break;
		case "Relay":
			IdRef=0;
			break;	
		case "PCA":
			IdRef=2000;
			break;
	}
	for(k=1;k<=l;k++){
		if(desc[k] != null && desc[k] != ""){ 
			document.write('<option value="'+(k+IdRef)+'"');
			if (selected == k+IdRef){document.write(' selected');}
			document.write('>'+desc[k]+'</option>');
		}
	}
}
function hideRowCheckBox(name,nr){
	if(cb_SuperVisor==0){
		document.write('><td align="center"><input type="checkbox" name="cb_Group_'+(nr)+'" id="cb_'+name+'_'+nr+'" ');
		CookieChecker(name,nr);		
		document.write(' onClick=toggleButton("'+name+'_'+nr+'",1,0)');
		document.write(' onmouseover=MouseOverCB("'+name+'_'+nr+'",1) onmouseout=MouseOverCB("'+name+'_'+nr+'",0)');
	}	
}
function HideCheckBox(name){	
	if(cb_SuperVisor==0){
		document.write('<th><input type="checkbox" name="cb_Hide'+name+'_1" id="cb_Hide'+name+'_1" ');
		CookieChecker("Hide"+name,1);		
		document.write(' onClick=toggleButton("Hide'+name+'_1",0,0);refresh("'+name+'")></th>');	
	}
}
function OpenCloseCheckBox(name){
	if(cb_SuperVisor==0){
		document.write('<th id="top" align="left" width="10px"><input type="checkbox" name="cb_Close'+name+'_1" id="cb_Close'+name+'_1" ');
		CookieChecker("Close"+name,1);		
		document.write(' onClick=toggleButton("Close'+name+'_1",0,0);OpenClose("'+name+'")></th>');	
	}
}
function OpenClose(name){	
	if(getCookie('Close'+name+'_1') == 1){
		temp ="table-row";}
	else {
		temp ="none";} 
	var Elements= document.getElementsByName(name);	
	for (var i = 0; i < Elements.length; i ++) {
		Elements[i].style.display = temp;
	}	
	if(getCookie('Close'+name+'_1') == 1){
		refresh(name);
	}
}
function NameLengthDescByName(name){
	var l;
	var desc;
	switch (name){
		case 'Fet':			
			l=fet.length;
			desc=fet_description;
			break;
		case 'Relay':
			l=relays.length;
			desc=relay_description;
			break;	
		case 'Group':
			l=pullUpGroup.length;
			desc=group_description;
			break;	
		case 'Input':
			l=switchEnabled.length;
			desc=switch_description;
			break;
		case 'PCA':
			l=PCA.length;
			desc=PCA_description;
			break;
	}
	return{name,l,desc};
}
function MouseOverCB(name,state){	
	if(state==1){
		 document.getElementById('tr_'+name).style.visibility = "visible";
	}else if (getCookie(name)==0){
		 document.getElementById('tr_'+name).style.visibility = "hidden";
		 document.getElementById("cb_"+name).style.visibility = "visible";
	}
}
function CookieChecker(name,nr){
	if(getCookie(name+"_"+nr)==""){
		setCookie(name+"_"+nr,"1"); //default
	}
	if(getCookie(name+"_"+nr)=='1'){
		document.write('checked');
	}
}
function isThisOn(element){
	if (element>0 && element<65 && relays[element-1]){ 
		return true;
	}else if (element>100 && element<114 && fet[element-101]!=0){ 
		return true;
	}else if (element>200 && element<214 && fet[element-201]!=0){ 
		return true;
	} else if (element > 2000 && element < 3025 && PCA[element - 2001] > PCAMIN[element - 2001]) {		
		return true;
	} else if (element > 4000 && element < 5025 && PCA[element - 4001] > PCAMIN[element - 4001]) {
		return true;
	}
	return false;
}
function EventParamDropDown(obj) {	
	var _selId;
	if ((obj.id).includes("_Group")) {
		_selId = obj.id.replace("_Group", "");
	} else {
		_selId = obj.id.replace("Group", "");
	}
	var _sel = document.getElementById(_selId);
	var _event = obj.value;
	_sel.innerHTML = "";
	addSelOption(_sel, "-",0);
	if (_event == 1){
		for (i=0; i<relay_description.length; i++){
			if (relay_description[i] !="" && relay_description[i] !="-" && relay_description[i] !=null ){
				addSelOption(_sel, relay_description[i], i, _event);
			}
		}
	} else if (_event == 2 || _event == 3) {
		for (i=0; i<PCA_description.length; i++){
			if (PCA_description[i] !="" && PCA_description[i] !="-" && PCA_description[i] !=null ){
				addSelOption(_sel, PCA_description[i], i, _event);
			}
		}
	}else if (_event ==4 || _event ==5 ){
		for (i=0; i<fet_description.length; i++){
			if (fet_description[i] !="" && fet_description[i] !="-" && fet_description[i] !=null ){
				addSelOption(_sel, fet_description[i], i, _event);
			}
		}
	}else if (_event ==6){
		for (i=0; i<group_description.length; i++){
			if (group_description[i] !="" && group_description[i] !="-" && group_description[i] !=null ){
				addSelOption(_sel, group_description[i], i, _event);
			}
		}
	}else if (_event >6 && _event <=15){
		for (i=0; i<slot_description.length; i++){
			if (slot_description[i] !="" && slot_description[i] !="-" && slot_description[i] !=null ){
				addSelOption(_sel, slot_description[i], i, _event);
			}
		}
	}
	
}
function addSelOption(__selObj, __text, __i, __event){
	var option = document.createElement("option");
	var value=0;
	if (__event =="1"){ value=__i;}
	else if (__event =="2"){ value=__i+2000;}
	else if (__event =="3"){ value=__i+4000;}
	else if (__event =="4"){ value=__i+100;}
	else if (__event =="5"){ value=__i+200;}
	else if (__event =="6"){ value=__i+500;}
	else if (__event =="7"){ value=__i+1000;}
	else if (__event =="8"){ value=__i+1100;}
	else if (__event =="9"){ value=__i+1200;}
	else if (__event =="10"){ value=__i+1300;}
	else if (__event =="11"){ value=__i+1400;}
	else if (__event =="12"){ value=__i+1500;}
	else if (__event =="13"){ value=__i+1600;}
	else if (__event == "14") { value = __i + 1700; }
	else if (__event =="15"){ value=__i+1800;}
	option.value = value;	
	option.text = __text;
	if(__selObj.name == value) {option.selected=1;}
	__selObj.add(option);
}
function visibleItem(A, B,name){
	switch(A){
	  case "relayProtectionTable":
	  case "relayJoinerTable":
	  case "relay_groupTable":
		document.getElementById(A+Math.round(Number(B)+Number(1))).style.display = "table-row";
	  break;
	  case "mixMinMax":
	  case "tempOnOff":
		var tmp=document.getElementsByClassName(A+B);
		for (var i=0; i<tmp.length; i++){		  
		  tmp[i].style.display = "table-cell";
		}
	  break;
	}
}
function HPRwrite(_k){
	switch (_k){
		case 0: return("hit");break;
		case 1: return("press");break;
		case 2: return("release");break;
	}
}
function HPRevent(_k,_l){
	switch (_k){
		case 0: return hitEvent[_l];break;
		case 1: return pressEvent[_l];break;
		case 2: return releaseEvent[_l];break;
	}
}
function HPRstring(_k){
	switch (_k){
		case 0: return str_Hit;break;
		case 1: return str_Press;break;
		case 2: return str_Release;break;
	}
}
function submitButton(obj) {
	document.getElementById("id").value = obj.value;	  
	if (VersionCheck("3.7.5")) {
		if (document.getElementById("timerSunset*" + obj.value).checked == 1) {
			document.getElementById("sunset").value = 1;
		} else {
			document.getElementById("sunset").value = 0;
		}		
		if (document.getElementById("timerSunrise*" + obj.value).checked == 1) {
			document.getElementById("sunrise").value = 1;
		}else {
			document.getElementById("sunrise").value = 0;
		}
	}
	document.getElementById("month").value = document.getElementById("timerMonth*"+obj.value).value;
	document.getElementById("day").value = document.getElementById("timerDay*"+obj.value).value;
	document.getElementById("hour").value = document.getElementById("timerHour*"+obj.value).value;
	document.getElementById("minute").value = document.getElementById("timerMinute*"+obj.value).value;	  
	var days = 0;
	if ( document.getElementById("timerMon*"+obj.value).checked == 1 ){days ^= 64 ;}
	if ( document.getElementById("timerTue*"+obj.value).checked == 1 ){days ^= 32 ;}
	if ( document.getElementById("timerWed*"+obj.value).checked == 1 ){days ^= 16 ;}
	if ( document.getElementById("timerThu*"+obj.value).checked == 1 ){days ^= 8 ;}
	if ( document.getElementById("timerFri*"+obj.value).checked == 1 ){days ^= 4 ;}
	if ( document.getElementById("timerSat*"+obj.value).checked == 1 ){days ^= 2 ;}
	if ( document.getElementById("timerSun*"+obj.value).checked == 1 ){days ^= 1 ;}
	document.getElementById("days").value = days;
	document.getElementById("timerEvent").value = document.getElementById("timerEvent*"+obj.value).value;
	document.getElementById("timerEventParam").value = document.getElementById("timerEventParam*"+obj.value).value;
	sendForm("form3");
}
function timerMonthOnChange(obj){
	//days id és select obj meghatározása
	var selDayId = obj.id.replace("timerMonth", "timerDay");
	var sel = document.getElementById(selDayId);
	//korábbi tartalom törlése
	sel.innerHTML = "";
	//ez mindig kell az első elemnek
	addSelOption(sel, "-",80,1);
	addSelOption(sel, "all",90,1);
	//hónapból napok száma
	var count = 0;
	switch (obj.value) {
			case "all": 
			case "80": 
			case "1":  
			case "3":  
			case "5":  
			case "7":
			case "8":
			case "10":
			case "12":count = 31;break;
			case "2":count = 29;break;
			case "4":  
			case "6":
			case "9":  
			case "11":count = 30;break;
				}
	//hozzáadjuk a napokat
	for(j=1;j<=count;j++){
		addSelOption(sel, j,j,1);
	}
}
function TimerEventParamDropDown (obj){
		var _selId = obj.id.replace("timerEvent", "timerEventParam");
		var _sel = document.getElementById(_selId);
		var _event = obj.value;
		_sel.innerHTML = "";
addSelOption(_sel, "-",80,1);
if (_event ==1 || (_event >= 8 && _event<=14)||_event==17){
	for (i=0; i<slot_description.length; i++){
		if (slot_description[i] !="" && slot_description[i] !="-" && slot_description[i] !=null ){
			addSelOption(_sel, slot_description[i], i,1);
		}
	}
}else if (_event =="2" || _event =="3"){
	for (i=0; i<relay_description.length; i++){
		if (relay_description[i] !="" && relay_description[i] !="-" && relay_description[i] !=null ){
			addSelOption(_sel, relay_description[i], i,1);
		}
	}
}else if (_event =="4" || _event =="5" ){
	for (i=0; i<fet_description.length; i++){
		if (fet_description[i] !="" && fet_description[i] !="-" && fet_description[i] !=null ){
			addSelOption(_sel, fet_description[i], i,1);
		}
	}
}else if (_event =="6" || _event =="7"){
	for (i=0; i<group_description.length; i++){
		if (group_description[i] !="" && group_description[i] !="-" && group_description[i] !=null ){
			addSelOption(_sel, group_description[i], i,1);
		}
	}
}else if (_event =="15" || _event =="16"){
	for (i=0; i<PCA_description.length; i++){
		if (PCA_description[i] !="" && PCA_description[i] !="-" && PCA_description[i] !=null ){
			addSelOption(_sel, PCA_description[i], i,1);
		}
	}
}
}
function permissions(obj){
	document.getElementById("sending").name = obj.name;
	document.getElementById("sending").value = obj.value;
	document.getElementById("form").action = "userpermissions";
	document.getElementById("form").submit();
}
function passChange(obj){
	if (document.getElementById("pwd1*"+obj.value).value == document.getElementById("pwd2*"+obj.value).value){
		document.getElementById("username").name = document.getElementById('userName*'+obj.value).name;
		document.getElementById("username").value = document.getElementById('userName*'+obj.value).value;	
		var toEncrypt  = document.getElementById('userName*'+obj.value).value +":"+ document.getElementById("pwd2*"+obj.value).value;
		var encrypted = window.btoa(toEncrypt);	
		document.getElementById("password").name	=  "pwd*"+obj.value ;
		document.getElementById("password").value =  encrypted;
		document.getElementById("Y").value = window.scrollY;
		document.getElementById("X").value = window.scrollX;
		document.getElementById("form2").submit();
	}else alert(str_NotMatch);
}
function generateDateString(){	
	dateString = year.toString().slice(2);
	if(month<10)dateString+='0';
	dateString+=month;
	if(day<10)dateString+='0';
	dateString+=day;	
}
function ShowBoosterText() {
	if (document.getElementById("BoosterText").style.display == "none") {
		document.getElementById("BoosterText").style.display = "inline-block";
		document.getElementById("Booster").style.border = "1px solid";

	} else {
		document.getElementById("BoosterText").style.display = "none";
		document.getElementById("Booster").style.border = "none";
	}
}
function VersionCheck(minimumVersion) {
	if (minimumVersion.startsWith("3.") && version.startsWith("3.")) {
		minimumVersion = minimumVersion.substring(2);	
		var tempVersion = version.substring(2);
		if (parseFloat(tempVersion) >= parseFloat(minimumVersion)) {
			return 1;
		}
		return 0;
	}
}
function AddSDMOptions(selectedSensor) {
	document.write('<optgroup label="SDM Smart Meter">');
	document.write('<option value="201"');
	if (selectedSensor== 201){document.write(' selected');}
	document.write('>POWER 1');
	document.write('</option>');
	document.write('<option value="202"');
	if (selectedSensor== 202){document.write(' selected');}
	document.write('>POWER 2');
	document.write('</option>');
	document.write('<option value="203"');
	if (selectedSensor== 203){document.write(' selected');}
	document.write('>POWER 3');
	document.write('</option>');
	document.write('<option value="204"');
	if (selectedSensor== 204){document.write(' selected');}
	document.write('>VOLTAGE 1');
	document.write('</option>');
	document.write('<option value="205"');
	if (selectedSensor== 205){document.write(' selected');}
	document.write('>VOLTAGE 2');
	document.write('</option>');
	document.write('<option value="206"');
	if (selectedSensor== 206){document.write(' selected');}
	document.write('>VOLTAGE 3');
	document.write('</option>');
	document.write('<option value="207"');
	if (selectedSensor== 207){document.write(' selected');}
	document.write('>CURRENT 1');
	document.write('</option>');
	document.write('<option value="208"');
	if (selectedSensor== 208){document.write(' selected');}
	document.write('>CURRENT 2');
	document.write('</option>');
	document.write('<option value="209"');
	if (selectedSensor== 209){document.write(' selected');}
	document.write('>CURRENT 3');
	document.write('</option>');
}
function ThermoTempByEEpromID(_EepromID) {
	if (!fullZeroArray(thermo_eepromIndex)) {	
		for (s = 0; s < thermo_eepromIndex.length; s++){	
			console.log(s);
			if (thermo_eepromIndex[s] == _EepromID) {
				console.log("s: "+s+" ThermoTemps[s]:"+thermo_temps[s]);
				return thermo_temps[s]/100;	
			}	
		}  
	}   
}
function ValueBySensor(_sensor) {
	if (_sensor >= 201 &&_sensor<=203) {
		return SDM_POWER[_sensor - 200];
	}
}