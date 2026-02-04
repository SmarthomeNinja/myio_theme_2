document.write('<div class="content"><table align="center" id="MasterTable">');

for (h = 0; h < broadlink_MAC.length; h++){
	if (broadlink_MAC[h][0] != 0) {
		document.write('<tr valign="top"><table id="t02" align="center">');
		document.write('<tr><th colspan="2" id="top"><div align="center">' + "Broadlink device " + h + "</div>");
		document.write('<div><button style="margin-right: 20px" name="br_stat" value="' + h + '" onclick="changed(this)" >' + "Status" + '</button>');
		if(broadlink_Authenticated[h]==0)document.write('<button style="margin-right: 20px" name="br_auth" value="' + h + '" onclick="changed(this)" >' + "Authenticate" + '</button>');
		
		document.write('<button name="br_delete" value="'+h+'" onclick="changed(this)" >'+str_Delete+'</button></div></th></tr>');
		document.write('<tr valign="top"><td width=50%><table id="t02" align="center">');
		B_var(str_MAC);
		for (i = 0; i < 6; i++){
			if (broadlink_MAC[h][i] < 16) document.write('0');
			document.write(broadlink_MAC[h][i].toString(16));
			if(i<5){document.write(' : ');}
		}
		B_End();
		B_var("IP");
		for (i = 0; i < 4; i++){			
			document.write(broadlink_IP[h][i]);
			if(i<3){document.write('.');}
		}
		B_End();
		B_var("type");
		document.write("0x" + broadlink_Type[h].toString(16)+" - ");
		if (broadlink_Type[h] == 0x4EAD) document.write("Hysen Thermostat");
		else if (broadlink_Type[h] == 0x6113) document.write("SCB1E");
		else if (broadlink_Type[h] == 0x6494) document.write("SCB2");
		else document.write("unknown");
		B_End();
		if (broadlink_Type[h] == 0x4EAD) {
			B_var("RoomTemp");
			document.write(broadlink_RoomTemp[h]/10+" °C");
			B_End();
			B_var("ExtTemp");
			document.write(broadlink_ExtTemp[h]/10+" °C");
			B_End();
			B_var("ThermostatTemp");
			document.write(broadlink_ThermostatTemp[h]/10+" °C");
			B_End();
			B_var("AutoMode");
			document.write(broadlink_AutoMode[h]);
			B_End();
		}
		
		document.write('</table></td><td><table id="t02" align="center">');

		B_var("Disabled");
		document.write('<input type="checkbox" name="blDisabled*'+h+'"');
		if (broadlink_Disabled[h] == 1) {
			document.write('value="0" checked ');
		} else {
			document.write('value="1" ');
		}
		document.write('onchange="changed(this)"></td>');	
		B_End();

		if (broadlink_description[h] == null) { broadlink_description[h] = ""; }
		document.write('<td>Name</td>');
		AddTdDescription("bl_descr*", broadlink_description[h], h,1);
		
		if (broadlink_Type[h] == 0x4EAD) {
			B_var("Sensor EID int");
			document.write('<input type = "number" min = "0" max = "100" style = "width: 3em" maxlength = "3" ');
			document.write('name="bl_eid_int*' + h + '" value="' + broadlink_EEPROM_ID_int[h] + '" onchange="changed(this,this.name,1)"> ');
			B_End();

			B_var("Sensor EID ext");
			document.write('<input type = "number" min = "0" max = "100" style = "width: 3em" maxlength = "3" ');
			document.write('name="bl_eid_ext*' + h + '" value="' + broadlink_EEPROM_ID_ext[h] + '" onchange="changed(this,this.name,1)"> ');
			B_End();
		}
		B_var("Driver int");
		document.write('<input type = "number" min = "0" max = "100" style = "width: 3em" maxlength = "3" ');
		document.write('name="bl_drv_int*'+h+'" value="' + broadlink_Driver_int[h] + '" onchange="changed(this,this.name,1)"> ');
		B_End();
		if (broadlink_Type[h] == 0x6113) {
			B_var("Child Lock");
			document.write('<input type="checkbox" name="blChildLock*' + h + '"');
			if (broadlink_ChildLock[h] == 1) {
				document.write('value="0" checked ');
			} else {
				document.write('value="1" ');
			}
			document.write('onchange="changed(this)"></td>');
			B_End();
		}

		document.write('</table></td></tr>');		
		
		document.write('</table><br>');
	}
}


document.write('</table>');

if (typeof requestBufferSize == 'undefined') {
	var requestBufferSize = 150;
}

window.scrollTo(x,y);
document.write('</table></div></body>');