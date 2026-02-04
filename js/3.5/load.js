document.write('<div class="content"><table id="t02" align="center">');
document.write('<tr><th id="top" colspan="5">' + str_Load + '</th></tr>');
document.write('<tr><th>' + str_Boot + '</th><th>' + str_Slot + '</th><th>' + str_Name + '</th><th>' + str_Part + '</th><th>' + str_LoadAll + '</th></tr>');
   	
for (j=0;j<256;j++){
	if(slotExist[j] == 1){
		document.write('<tr ');
		if(bootUpSlot == j){document.write(' class="on1"');}
		document.write('><td align="center"><input type="radio" name="bootUpSlot" value="'+j+'" onclick="changed(this)"');
		if(j == bootUpSlot){document.write(' checked');}
		document.write('></td>');
		document.write('<td align="center">'+j+'</td>');
		document.write('<td align="center"><input type="text" size="20"  maxlength="20" placeholder="-" ');
		if(slot_description[j]==null){slot_description[j]="";}
		document.write('name="slo_descr*'+j+'" value="'+slot_description[j]+'" onchange="changed(this)"></td>');
		document.write('<td align="center"><table style="width:100%; border : 1px solid black; padding:10;" id="t01" align="center" >');
		document.write('<tr><td align="center"><button name="lo_gl" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Gen+'</button></td>');
		document.write('<td align="center"><button name="lo_sw" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Input+'</button></td>');
		document.write('<td align="center"><button name="lo_r" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Output+'</button></td>');
		document.write('<td align="center"><button name="lo_p" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_PCA_Output+'</button></td></tr>');
		document.write('<tr><td align="center">');
		if(VersionCheck("3.7.1"))document.write('<button name = "lo_eman" value = "' + j + '" onclick = "changed(this,this.name,1,1)" > ' + str_EnergyManagement + '</button>');
		document.write('</td>');
		document.write('<td align="center"><button name="lo_gr" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Group+'</button></td>');
		document.write('<td align="center"><button name="lo_pr" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Prot+'</button></td>');
		document.write('<td align="center"><button name="lo_f" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_PWM+'</button></td></tr></table></td>');
		document.write('<td align="center">');
		document.write('<button name="lo_all" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_LoadAll+'</button></td></tr>');
		}
}
	document.write('<tr><th colspan="5" align="center">');
	if(slotQuantity >= slotExist.length){	
		document.write(str_MaxSlot);
	}
	document.write('</th></tr></table></div></body></html>');
window.scrollTo(x,y);
