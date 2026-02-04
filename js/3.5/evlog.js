var client = false;  
if (window.XMLHttpRequest) {
	client = new XMLHttpRequest();
} else if (window.ActiveXObject) {
	client = new ActiveXObject("Microsoft.XMLHTTP");
}				
var string="empty";
var dateString="empty";
generateDateString();			
document.write('<div class="content"><table><tr><td align="center">');
document.write(str_Date+' :');
document.write('<input type="text"');
document.write('id="date" value="'+dateString+'" ');
document.write(' onchange="generateTable()">');
document.write('</td></tr><tr><td align="center"><div id="tablediv"></div></td></tr></table></div>');

function generateString(){  
	string="/ev_log/e_";	
	string+=(document.getElementById("date").value).toString()+".csv";	
}
generateTable();

function generateTable(){		
generateString();	
	client.open('GET', string);
	client.onreadystatechange = function() {
		var obj = document.getElementById("tablediv");
		obj.innerHTML="Napló betöltése folyamatban.";				
		if (client.readyState == 4 && client.status == 200) { 
			obj.innerHTML="";
			var txt = client.responseText.toString();
			var rows = txt.split('\n');
			var table = document.createElement('table');
			table.id='t02';
			var tr = null;
			var td = null;
			var tds = null;	
			var _INPUTevent=0;
			var _saveLoad=0;	
			var _event=0;
			for ( var i = 0; i<rows.length; i++ ) {
				tr = document.createElement('tr');
				tds = rows[i].split(',');
				for ( var j = 0; j < tds.length; j++ ) {
					 td = document.createElement('td');
					 td.innerHTML = tds[j];
					 if(j==1 && isNumber(tds[j])){
						 td.innerHTML+='-'+userName[tds[j]];
					 }else if (j==1 && tds[j]=='INPUTevent'){
						 _INPUTevent=1;
					 }else if (_INPUTevent==1 && j==2 && isNumber(tds[j])){
						 td.innerHTML+='-'+switch_description[tds[j]];
					 }else if (j==2 && (tds[j]=='Save' || tds[j]=='Load')){
						 _saveLoad=1;
					 }else if (_saveLoad==1 && j==3 && isNumber(tds[j])){
						 td.innerHTML+='-'+slot_description[tds[j]];
					 }else if (j==2 && (tds[j].includes("Event") || tds[j].includes("Relay"))){
						 _event=1;
					 }else if (_event==1 && j==3 && isNumber(tds[j])){													 
						 if(tds[j]<65){td.innerHTML+='-'+relay_description[tds[j]];}
						 else if(tds[j]>500){td.innerHTML+='-'+group_description[tds[j]-500];}													 
					 }
					 tr.appendChild(td);
				}
				table.appendChild(tr);
				_INPUTevent=0;
				_saveLoad=0;
				_event=0;
			}				
			obj.appendChild(table);
		}
	}
	client.send();	
}
function isNumber(obj) { return !isNaN(parseFloat(obj)) }
document.write('</body>');