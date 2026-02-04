
document.write('<div class="content"><table id="t02" align="center">');
document.write('<tr><th>ID</th><th>' + str_UserName + '</th><th>' + str_Pwd + '</th><th>' + str_Rank + '</th><th>' + str_Perm + '</th><th>' + str_Delete + '</th></tr>');

for (j=0;j<32;j++){
	if(slotExist[j] == 1){	  
		document.write('<tr><td align="center">'+j+'</td>');
		document.write('<td align="center"><input type="text" size="20"  maxlength="20" placeholder="" ');
		if(userName[j]==null){userName[j]="";}
		document.write('id="userName*'+j+'" name="userName*'+j+'" value="'+userName[j]+'" ></td>');
		document.write('<td align="center">');
		document.write('<table style="background-color: rgba(0, 0, 0, 0);"  align="center" >');
		document.write('<tr style="background-color: rgba(0, 0, 0, 0);">');
		document.write('<td align="center">');
		document.write(str_Pwd+'<br>'+str_PwdAgain+'</td>');
		document.write('<td align="right">:<br>:</td>');
		document.write('<td align="center"><input type="password" size="20"  maxlength="20" placeholder="" id="pwd1*'+j+'" value="" ><br>');
		document.write('<input type="password" size="20" maxlength="20" placeholder="" id="pwd2*'+j+'" value="" ><br>');
		document.write('<button name="ok" value="'+j+'" onclick="passChange(this)">'+str_Apply+'</button></td></tr></table></td>');
		document.write('<td align="center">');
		document.write('<table style="background-color: rgba(0, 0, 0, 0);"  align="center" >');
		document.write('<tr style="background-color: rgba(0, 0, 0, 0);">');
		document.write('<td align="center"><input type="radio" name="rights*'+j+'" value="admin" onclick="changed(this)"');
		if(admin[j] == 1){document.write(' checked');}
		document.write('><br>');
		document.write('<input type="radio" name="rights*'+j+'" value="editor" onclick="changed(this)"');
		if(editor[j] == 1){document.write(' checked');}
		document.write('><br>');
		document.write('<input type="radio" name="rights*'+j+'" value="user" onclick="changed(this)"');
		if(user[j] == 1){document.write(' checked');}
		document.write('></td>');
		document.write('<td align="center">');
		document.write(str_Admin+'<br>'+str_Editor+'<br>'+str_User);
		document.write('</td></tr></table></td></td>');	
		document.write('<td align="center"><button name="permissionsUser" value="'+j+'" onclick="permissions(this)">'+str_Perm+'</button></td>');
		document.write('<td align="center"><button name="del_userSlot" value="'+j+'" onclick="changed(this,this.name,1,1)" >'+str_Delete+'</button></td></tr>');
		}
}
	document.write('<tr><th colspan="7" align="center">');
	if(slotQuantity >= slotExist.length){	
		document.write(str_MaxSlot);
	}
	document.write('</th></tr>');	
	document.write('<th colspan="7">');
	if(slotQuantity < slotExist.length){	
		document.write('<button name="new_userSlot" onclick="changed(this,this.name,1,1)" >'+str_NewUser+'</button>');
	}
	document.write('</th></table></div></body>');