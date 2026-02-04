document.write('<div class="content"><table id="t01" align="center">');
document.write('<tr><th align="center" colspan="3" >'+str_HeadTxt+' : '+ userName[permissionsUser] +'</th></tr>');
document.write('<tr><th align="right" colspan="4"><button name="clearPermission" value="' + permissionsUser + '" onclick="permissions(this)">' + str_Clear + '</button>');
document.write(' <button name="fillPermission" value="'+permissionsUser+'" onclick="permissions(this)">'+str_AddAll+'</button></th></tr>');                  
document.write('<tr><th id="top">' + str_Input + '</th><th id="top">' + str_Output + '<th id="top">' + str_PWMs + '</th></tr>');
document.write('<tr valign="top"><td><table id="t02" align="center"><tr><th>ID</th><th>' + str_Name + '</th><th>' + str_Perm + '</th></tr>');
for(i=1;i<=switchEnabled.length;i++){
	if(switch_description[i] != null || cb_SuperVisor==1){
		document.write('<tr>');
		document.write('<td align="center">'+i+'</td>');
		document.write('<td align="center">');
		if(switch_description[i]==null){switch_description[i]="";}
		document.write(switch_description[i]+'</td>');
		document.write('<td align="center">R<input type="checkbox" name="swHitPermission" value="'+i+'" ');
		if( switchHitPermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">');
		document.write('<input type="checkbox" name="swPressPermission" value="'+i+'" ');
		if( switchPressPermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">H</td></tr>');
	}
}    
document.write('</table></td><td><table id="t02" align="center">');
document.write('<tr><th>ID</th><th>' + str_Name + '</th><th>' + str_Perm + '</th></tr>');
for(i=1;i<=relays.length;i++){	
	if(relay_description[i] != null || cb_SuperVisor==1){  
		document.write('<tr>');
		document.write('<td align="center">'+i+'</td>')
		document.write('<td align="center">');
		if(relay_description[i]==null){relay_description[i]="";}
		document.write(relay_description[i]);
		document.write('</td>');
		document.write('<td align="center">O<input type="checkbox" name="rReadPermission" value="'+i+'" ');
		if( relayReadPermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">');
		document.write('<input type="checkbox" name="rWritePermission" value="'+i+'" ');
		if( relayWritePermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">I</td></tr>');	  
	}
}
document.write('</table></td><td><table id="t02" align="center">');
document.write('<tr><th>ID</th><th>' + str_Name + '</th><th>' + str_Perm + '</th></tr>');
for(i=1;i<=fet.length;i++){
	if(fet_description[i] != null || cb_SuperVisor==1){
		var j=i;
		document.write('<tr>');
		document.write('<td align="center">'+(i+100)+'</td>');
		document.write('<td align="center">');
		if(fet_description[i]==null){fet_description[i]="";}
		document.write(fet_description[i]);
		document.write('</td>');
		document.write('<td align="center">O<input type="checkbox" name="fReadPermission" value="'+i+'" ');
		if( fetReadPermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">');
		document.write('<input type="checkbox" name="fWritePermission" value="'+i+'" ');
		if( fetWritePermission[i-1] == 1){document.write('checked ');}
		document.write('onchange="changed(this)">I</td></tr>');		
	}
}
document.write('</table></td></table></td></tr></table></div></body>');
window.scrollTo(x, y);

