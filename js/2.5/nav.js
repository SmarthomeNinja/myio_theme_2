//document.write('<meta name="viewport" content="width=device-width, minimumscale=1.0, maximum-scale=1.0" />');
document.write('<meta http-equiv="content-type" content="text/html; charset=windows-1252">');
document.write('<body><div id="overlay"></div><div class="header">');
document.write('<form method="POST" id="form">');
document.write('<input type=hidden name=X id=X value=0>');
document.write('<input type=hidden name=Y id=Y value=0>');
document.write('<input type=hidden name=sending id=sending value=0></form>');
document.write('<form method="POST" id="form2">');
document.write('<input type=hidden name=X id=X value=0>');
document.write('<input type=hidden name=Y id=Y value=0>');
document.write('<input type=hidden name=username id=username value=0>');
document.write('<input type=hidden name=password id=password value=0></form>');

document.write('<table style="width:100%;" id="t_nav" align="center">');
document.write('<tr><td align="left" width="10%">');

document.write('<div id=AutoRefresh style=display:inline-block>');
document.write('<input type=checkbox name=cb_AutoRefresh id=cb_AutoRefresh checked="" onClick=toggleButton("AutoRefresh",0,0)>');
document.write('<label><script>document.write(str_Auto_Refresh);</script></label></div>');
document.write('<button name=Refresh onClick=sendForm() ><script>document.write(str_Update);</script></button></td>');

document.write('<td align=center style=width:10%;>');
document.write('<div id=Booster style=display:inline-block>');
document.write('<input type=checkbox name=cb_Booster id=cb_Booster checked="" onClick=toggleButton("Booster",0,1)>');
if (Host != "") {
	document.write('<button onClick=ShowBoosterText()>' + str_Booster + '</button>');
} else {
	document.write('<label>' + str_Booster + '</label>');
}
document.write('<div id=BoosterText >');
document.write('<input type = "text" size = "15" maxlength = "50" name = "Host" value = "' + Host + '" onchange = "setCookie(this.name,this.value)" > ');
if (langJSON.languages != undefined) {
	document.write('<select id="Language" name="Language" onchange=setCookie("Language",this.value);sendForm(); >');
	for (j in langJSON.languages) {
		document.write('<option value="' + j + '"');
		if (j == language) { document.write(' selected'); }
		document.write('>' + str_language[j]);
		document.write('</option>');
	}
	document.write('</select>');
}
document.write('</div></div></td>');
document.write('<td align="center" width="60%">');
var tempString="'/'";
document.write('<button onClick="window.location.href='+tempString+'" >'+str_Home+'</button>');
tempString="'/chart'";
document.write('<button onClick="window.location.href='+tempString+'" >'+str_Chart+'</button>');
tempString="'/setup'";
document.write('<button onClick="window.location.href='+tempString+'" >'+str_Settings+'</button><br>');		
document.write(year+'.'+month+'.'+day+' '+hour+':');
if(minute<10){document.write("0");}
document.writeln(minute);
document.write('</td><td align="right" width="20%">');
document.write('<button name="LogOut" value="1" onClick="changed(this)" >'+str_LogOut+'</button>');
document.write('</td></tr><tr>');
document.write('<td align="center" colspan="4"');
if (message.length>0){document.writeln('style="background: #000 ; color: #ffffff ; font-weight: bold;font-family: monospace;"');}
document.writeln('>');
document.writeln(message);
document.writeln('</td></tr></table>');
if(getCookie("Booster")=='1'){
    document.getElementById("cb_Booster").checked = true;
} else {
    document.getElementById("cb_Booster").checked = false;
}
if(getCookie("SuperVisor")=='1'){
    cb_SuperVisor=true;
}else{
    cb_SuperVisor=false;
}
document.writeln('</div>');
document.getElementById("BoosterText").style.display = "none";