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
		document.write('class="Prot" style="display: table-row;"');							
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
		document.write('</optgroup>');		
		document.write('<optgroup label="'+str_PCAs+'">');
		addOption("PCA", relayProtection[i][j]);
		if (VersionCheck("3.7.6")) {
			document.write('</optgroup>');
			document.write('<optgroup label="'+str_Rgroup+'">');
			addOption("Group", relayProtection[i][j]);			
		}
		document.write('</optgroup></select></td>');		
	}
	document.write("</tr>");	
}            
document.write('</table></td>');
document.write('<td><table id="t02" align="center"><tr>');
if (VersionCheck("3.8")) { OpenCloseCheckBox("Joiner"); }
document.write('<th id="top" colspan="3">'+str_Rjoin+'</th></tr>');
var empty = 0;
for(i=0;i<relayJoiner.length;i++){	
	document.write('<tr name2="'+i+'" name1="relayJoinerTable" id="relayJoinerTable'+i+'" ');
	if (relayJoiner[i][0] == 0 && relayJoiner[i][1] == 0 && empty ==1){
		document.write('style="display: none"');
	} else {
		document.write('class="Joiner" style="display: table-row"');						
	}
	if(relayJoiner[i][0] == 0 && relayJoiner[i][1] == 0 ){empty=1;}
	document.write(">");
	if (cb_SuperVisor == 0) document.write("<td></td>");
	if (VersionCheck("3.8"))AddTdCheckBox("joinerJustON",i,joinerJustON[i]);	
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
		document.write('</optgroup>');
		document.write('<optgroup label="'+str_PCAs+'">');
		addOption("PCA",relayJoiner[i][j]);
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
document.write('<tr class="Group">');
HideCheckBox('Group');
document.write('<th>ID</th><th>'+str_Name+'</th><th></th><th>'+str_PullUp+'</th></tr>');
var empty = 0;
for(i=0;i<relay_group.length;i++){	
	if(group_description[i+1]==null){group_description[i+1]="";}
	document.write('<tr class="Group" id="tr_Group_'+(i+1)+'" name2="'+i+'" name1="relay_groupTable" id="relay_groupTable'+i+'" ');		
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

			document.write('<option value="2"');
			if (relay_group[i][j] <3025 && relay_group[i][j]>2000){document.write(' selected');}
			document.write('>'+str_PCA+'</option>');
			document.write('<option value="3"');				
			if (relay_group[i][j] <5025 && relay_group[i][j]>4000){document.write(' selected');}
			document.write('>'+str_PCAF+'</option>');

			document.write('<option value="4"');
			if (relay_group[i][j] <114 && relay_group[i][j]>100){document.write(' selected');}
			document.write('>'+str_PWM+'</option>');
			
			document.write('<option value="5"');
			if (relay_group[i][j] <214 && relay_group[i][j]>200){document.write(' selected');}	
			document.write('>' + str_PWMF + '</option>');
		
			if (VersionCheck("3.7")) {
				document.write('<option value="6"');
				if (relay_group[i][j] < 500 + relay_group.length && relay_group[i][j] > 500) { document.write(' selected'); }
				document.write('>' + str_Rgroup + '</option>');
			}
			
			/*
			document.write('<option value="6"');
			if (relay_group[i][j] <600 && relay_group[i][j]>500){document.write(' selected');}
			document.write('>'+str_Group+'</option>');
			document.write('</optgroup>');
			document.write('<optgroup label="'+str_Load+'">');
			document.write('<option value="7"');
			if (relay_group[i][j] <1100 && relay_group[i][j]>999){document.write(' selected');}
			document.write('>'+str_LoAll+'</option>');
			document.write('<option value="8"');
			if (relay_group[i][j] <1200 && relay_group[i][j]>1099){document.write(' selected');}
			document.write('>'+str_LoOut+'</option>');
			document.write('<option value="9"');
			if (relay_group[i][j] <1300 && relay_group[i][j]>1199){document.write(' selected');}
			document.write('>'+str_LoPWM+'</option>');
			document.write('<option value="10"');
			if (relay_group[i][j] <1400 && relay_group[i][j]>1299){document.write(' selected');}
			document.write('>'+str_LoPr+'</option>');
			document.write('<option value="11"');
			if (relay_group[i][j] <1500 && relay_group[i][j]>1399){document.write(' selected');}
			document.write('>'+str_LoGr+'</option>');
			document.write('<option value="12"');
			if (relay_group[i][j] <1600 && relay_group[i][j]>1499){document.write(' selected');}
			document.write('>'+str_LoInp+'</option>');
			document.write('<option value="13"');
			if (relay_group[i][j] <1700 && relay_group[i][j]>1599){document.write(' selected');}
			document.write('>'+str_LoGe+'</option>');
			document.write('<option value="14"');
			if (relay_group[i][j] <1800 && relay_group[i][j]>1699){document.write(' selected');}
			document.write('>'+str_LoPCA+'</option>');
			*/
			document.write('</optgroup>');
			document.write('</select>');
			document.write('<select id="relay_group*'+i+'*'+j+'" name='+relay_group[i][j]+' style="width:25ex;" onchange="changed(this,this.id,1)"></select></td>');
		}
		document.write('</td></tr>');
		if(j%2!=0){document.write('</table></td>');}					
	}
	document.write("</tr>");		
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
	OpenClose("Group");
	OpenClose("Prot");
	OpenClose("Joiner");
}
console.log("scrollTo:"+y)
//window.onpageshow = window.scrollTo(x, y);
/*
window.addEventListener("load", function(){
    window.scrollTo(x, y);
});
*/