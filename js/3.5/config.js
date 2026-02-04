document.write('<div class="content"><table style="max-width: 500px;" id="t01" align="center">');
	document.write('<tr>');
	document.write('<th colspan="3" align="center">'+str_ChPwd+'');
	document.write('</th>');
	document.write('</tr>');
	document.write('<tr>');	
		//userName field
		document.write('<td align="center">');
		document.write(''+str_UserName+' :<br>');
		document.write('<input type="text" size="20"  maxlength="20" placeholder="" ');
		if(userName==null){userName="";}
		document.write('id="userName*'+_id+'" name="userName*'+_id+'" value="'+userName+'" ');
		document.write('>');
		document.write('</td>');
		document.write('<td align="center">');
			document.write('<table style="width:100%; padding:10;background-color: rgba(0, 0, 0, 0); "  align="center" >');
				document.write('<tr style="background-color: rgba(0, 0, 0, 0);">');
					document.write('<td align="center">');
					document.write(str_Pw+'<br>'+str_Again+'');
					document.write('</td>');
					document.write('<td align="right">');
					document.write(':<br>:');
					document.write('</td>');
					document.write('<td align="center">');
					document.write('<input type="password" size="20"  maxlength="20" placeholder="" ');
					document.write('id="pwd1*'+_id+'" ');
					document.write('value="" ');
					document.write('><br>');
					document.write('<input type="password" size="20"  maxlength="20" placeholder="" ');
					document.write('id="pwd2*'+_id+'" ');
					document.write('value="" ');
					document.write('><br>');
					document.write('<button name="ok" value="'+_id+'" onclick="passChange(this)">'+str_Agree+'</button>');
					document.write('</td>');
				document.write('</tr>');
			document.write('</table>');
		document.write('</td>');
	document.write('<td align="center">');
			document.write('<table style="width:100%; padding:10;background-color: rgba(0, 0, 0, 0);"  align="center" >');
				document.write('<tr style="background-color: rgba(0, 0, 0, 0);">');
					document.write('<td align="center">');
					if(_right == 0){document.write(str_Admin);}
					else if(_right == 1){document.write(str_Editor);}
					else if(_right == 2){document.write(str_User);}
					document.write('</td>');
				document.write('</tr>');
			document.write('</table>');
	document.write('</td>');
	document.write('</tr></table></div></body></html>');