document.write('<div class="content"><table id="t01" align="center"><tr><td><table align="center">');
document.write('<tr valign="top"><td><table id="t02" align="center">');
document.write('<tr><th id="top" colspan="2">'+str_GenSetup+'</th></tr><tr><th>'+str_Name+'</th><th>'+str_Value+'</th></tr>');
B_var(str_ServName);
document.write('<input type="text" size="20" maxlength="20" placeholder="-" name="MYIOname" value="'+MYIOname+'" onchange="changed(this)"></td></tr>');
B_var(str_IPAddress);	
for(i=0;i<4;i++){
	document.write('<input type="number" style="width: 3em" min="0" max="255" maxlength="3" name="ip*'+i+'" value="'+ip[i]+'" onchange="changed(this)">');
	if(i<3){document.write(' . ');}
}
B_var(str_TimeServ);
for(i=0;i<4;i++){
	document.write('<input type="number" style="width: 3em" min="0" max="255" maxlength="3" name="ts*'+i+'" value="'+timeServer[i]+'" onchange="changed(this)">');
	if(i<3){document.write(' . ');}
}
B_End();
B_var(str_TimeZone);
document.write('<input type="number" style="width: 3em" maxlength="3" min="-24" max="24" name="tz" value="'+timeZone+'" onchange="changed(this)"> '+str_Hours);
document.write('<button name="T_Sync" value="1" onclick="changed(this)" >'+str_TimeSync+'</button></td></tr>');
B_var(str_Date);
document.write('<input type="number" style="width: 3em" min="2015" max="9999" maxlength="4" name="year" value="'+year+'" onchange="changed(this)"> - ');
document.write('<input type="number" style="width: 2em" min="1" max="12" maxlength="2" name="month" value="'+month+'" onchange="changed(this)"> - ');
document.write('<input type="number" style="width: 2em" min="1" max="31" maxlength="2" name="day" value="'+day+'" onchange="changed(this)"></td></tr>');
B_var(str_Time);
document.write('<input type="number" style="width: 2em" min="0" max="23" maxlength="2" name="hour" value="'+hour+'" onchange="changed(this)"> : ');
document.write('<input type="number" style="width: 2em" min="0" max="59" maxlength="2" name="minute" value="'+minute+'" onchange="changed(this)"></td></tr>');
B_var(str_DefaultLanguage);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="3" name="defaultLanguage" value="' + defaultLanguage + '" onchange="changed(this)">');

document.write('<select id="defaultLanguage" name="defaultLanguage" onchange="changed(this)" >');

for(j in str_language){
	document.write('<option value="'+j+'"');
	if (j == defaultLanguage){document.write(' selected');}
	document.write('>'+str_language[j]);
	document.write('</option>');
}
document.write('</select>');

document.write('</td ></tr > ');
B_var(str_BootSlot);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="3" name="bootUpSlot" value="'+bootUpSlot+'" onchange="changed(this)"></td></tr>');
B_var(str_Log);
document.write('<input type="checkbox" name="evlog" value="'+eventLogger+'" ');
if( eventLogger == 1){document.write('checked ');}
document.write('onchange="changed(this)"></td>');B_End();
B_var(str_sLog);
document.write('<input type="checkbox" name="slog" value="'+sensorLogger+'" ');
if( sensorLogger == 1){document.write('checked ');}
document.write('onchange="changed(this)"></td>');B_End();
document.write('<tr><th id="top" colspan="2">'+str_AdvSet+'</th></tr>');
document.write('<tr><td>Broadcast</td><td><input type="checkbox" name="BroadCast" value="'+_broadcast+'" ');
if( _broadcast == 1){document.write('checked ');}document.write('onchange="changed(this)"></td></tr>');
B_var(str_MAC);
for(i=0;i<6;i++){
	document.write('<input type="text" style="width: 2em" min="0" max="255" maxlength="2" name="mac*'+i+'" value="'+mac[i].toString(16)+'" pattern="[A-Fa-f0-9]{2}" onchange="changed(this)">');
	if(i<5){document.write(' : ');}
}B_End();
B_var(str_GatewayAddress);	
for(i=0;i<4;i++){
	document.write('<input type="number" style="width: 3em" min="0" max="255" maxlength="3" name="gateway*'+i+'" value="'+gateway[i]+'" onchange="changed(this)">');
	if(i<3){document.write(' . ');}
}
B_var(str_HitTL);
	document.write('<input type="number" style="width: 4em"  min="0" maxlength="6" name="hitTimeLimit" value="'+hitTimeLimit+'" onchange="changed(this)"> msec');
B_End();
B_var(str_PushTL);
document.write('<input type="number" style="width: 4em"  min="0" maxlength="6" name="pressTimeLimit" value="'+pressTimeLimit+'" onchange="changed(this)"> msec');B_End();
B_var(str_SensorSampling);
document.write('<input type="number" style="width: 2em"  min="0" max="255" maxlength="6" name="sensorSampling" value="'+sensorSampling+'" onchange="changed(this)">.');B_End();
B_var(str_TempTimer);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="tempTimer" value="'+tempTimer+'" onchange="changed(this)">sec');B_End();
B_var(str_HumTimer);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="humTimer" value="'+humTimer+'" onchange="changed(this)">sec');B_End();
B_var(str_MixerTimer);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="mixerTimer" value="'+mixerTimer+'" onchange="changed(this)">sec');B_End();
B_var(str_EthInit);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="ethernetInitTimer" value="'+ethernetInitTimer+'" onchange="changed(this)">sec');B_End();
B_var(str_HTTPoverrun);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="HO" value="'+httpTimeOverrun+'" onchange="changed(this)">sec');B_End();
B_var(str_Consump);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="4" name="impulsePerUnit" value="'+impulsePerUnit+'" onchange="changed(this)">'+str_Impulse+' :');
document.write('<input type="text" size="5"  maxlength="5" placeholder="-" ');
if(consumptionUnit==null){consumptionUnit="";}
document.write('name="consumptionUnit" value="'+consumptionUnit+'" onchange="changed(this)">)');B_End();
B_var(str_ConsumpAvg);
document.write('<input type="number" style="width: 3em"  min="0" maxlength="6" name="CCLC" value="'+CCLC+'" onchange="changed(this)">imp');B_End();
document.write('</table></td><td><table id="t02" align="center"><tr><th id="top" colspan="2">'+str_System_Information+'</th></tr>');	
document.write('<tr><th>'+str_Name+'</th><th>'+str_Value+'</th></tr>');
document.write('<tr><td>'+str_FreeRam+'</td><td>'+freeRam+'</td></tr>');            
document.write('<tr><td>'+str_BootTime+'</td><td>'+bootUpTime+' millisec</td></tr>');
document.write('<tr><td>'+str_ActCons+'</td><td>'+(consumption/1000)+" "+consumptionUnit);
B_End();
document.write('<tr><td>'+str_SlotQ+'</td><td>'+slotQuantity+'</td></tr>');
document.write('<tr><td>'+str_ActSlot+'</td><td>'+actualSlot);B_End();

document.write('<tr><th id="top" colspan="2">'+str_AdminCommands+'</th></tr>');
document.write('<tr><td><button name="SensorBackup" value="1" onclick="changed(this)" >'+str_SensorBackup+'</button></td><td>'+str_SensorBackupHelp+'</td><tr>');
document.write('<tr><td><button name="SensorRestore" value="1" onclick="changed(this)" >'+str_SensorRestore+'</button></td><td>'+str_SensorRestoreHelp+'</td></tr>');
document.write('<tr><td><button name="ReInit" value="1" onclick="changed(this)" >'+str_ReInit+'</button></td><td>'+str_ReInitHelp+'</td></tr>');
   
document.write('</table></td></tr></table></div></body>');

window.scrollTo(x,y);
document.write('</script></html>');
