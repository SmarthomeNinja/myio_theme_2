// myIO SD file
// save.js	3.5.1
// support myIO 3.5 or above
// + zipper 

document.write('<div class="content"><table id="t02" align="center">');
document.write('<tr><th id="top" colspan="6">' + str_Save + '</th></tr>');
document.write('<tr><th>' + str_Boot + '</th><th>' + str_Slot + '</th><th>' + str_Name + '</th><th>' + str_Part + '</th><th>' + str_SaveAll + '</th><th>' + str_Delete + '</th></tr>');

for (j=0;j<256;j++){
	if(slotExist[j] == 1){
		document.write("<tr ");
		if(bootUpSlot == j){document.write(' class="on1"');}
		document.write('><td align="center"><input type="radio" name="bootUpSlot" value="'+j+'" onclick="changed(this)"');
		if(j == bootUpSlot){document.write(' checked');}
		document.write('></td>');
		document.write('<td align="center">'+j+'</td>');
		document.write('<td align="center"><input type="text" size="20"  maxlength="20" placeholder="-" ');
		if(slot_description[j]==null){slot_description[j]="";}
		document.write('name="slo_descr*'+j+'" value="'+slot_description[j]+'" onchange="changed(this)"></td>');
		document.write('<td align="center">');
		document.write('<table style="width:100%; border : 1px solid black; padding:10;" id="t01" align="center" >');
		document.write('<tr><td align="center"><button name="sav_gl" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Gen+'</button></td>');
		document.write('<td align="center"><button name="sav_sw" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Input+'</button></td>');
		document.write('<td align="center"><button name="sav_r" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Output+'</button></td>');
		document.write('<td align="center"><button name="sav_p" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_PCA_Output+'</button></td></tr>');
		document.write('<tr><td align="center">');
		if (VersionCheck("3.7.1")) document.write('<button name = "sav_eman" value = "' + j + '" onclick = "changed(this,this.name,1,1,1)" > ' + str_EnergyManagement + '</button>');
		document.write('</td>');
		document.write('<td align="center"><button name="sav_pr" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Prot+'</button></td>');
		document.write('<td align="center"><button name="sav_gr" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Group+'</button></td>');
		document.write('<td align="center"><button name="sav_f" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_PWM+'</button></td></tr></table></td>');
		document.write('<td align="center"><button name="sav_all" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_SaveAll+'</button></td>');
		document.write('<td align="center"><button name="del_slot" value="'+j+'" onclick="changed(this,this.name,1,1,1)" >'+str_Delete+'</button></td></tr>');
		}
}
document.write('<tr><th colspan="4">');
if(slotQuantity < slotExist.length){	
	document.write('<button name="new_slot" onclick="changed(this,this.name,1,1)" >' + str_NewSlot + '</button>');	
}
document.write('</th><th colspan="2">');
document.write('<button name="backup" onclick="backup()"> '+str_Backup+'</button>');
document.write('</th></tr></table></div></body>');
window.scrollTo(x, y);

async function backup() {
	generateFileUrls();	
	LoadJSZip().then(() => {
		zipper();
	  }).catch((error) => {
		console.error(error);
	  });
}
async function zipper() {
	const modal = document.createElement("div");
	modal.style = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 9999;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24px;
		color: white;
		`;
	const statusDiv = document.createElement("div");
	statusDiv.innerText = "Downloading file 1 of 10...";
	modal.appendChild(statusDiv);
	document.body.appendChild(modal);

	const now = new Date();
	const formattedDateTime = `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}`;

	const zip = new JSZip();
	for (i = 0; i < fileUrls.length; i++){	
		//statusDiv.innerText = `Downloading file ${i + 1} of ${fileUrls.length}: ${fileUrls[i].folder + "/" + fileUrls[i].fileName}`;
		statusDiv.innerText = parseInt(((i + 1) / fileUrls.length*100)) +'%';
		try {
			const content = await downloadFile(fileUrls[i].folder + "/" + fileUrls[i].fileName);
			zip.folder(document.title+"_Backup_"+formattedDateTime+"/" + fileUrls[i].folder).file(fileUrls[i].fileName, content);
		} catch (error) {
			console.log(error);
		  }
	}
	statusDiv.innerText = "Creating zip file...";
	const zipBlob = await zip.generateAsync({ type: "blob" });
	const url = URL.createObjectURL(zipBlob);
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	a.href = url;
	
	a.download = document.title+"_Backup_"+formattedDateTime+".zip";
	a.click();
	window.URL.revokeObjectURL(url);
	statusDiv.innerText = "Download complete!";
	setTimeout(() => {
		modal.style.display = "none";
	  }, 2000);
}
function downloadFile(url) {	
	console.log(url);
	return new Promise((resolve, reject) => {
	  const xhr = new XMLHttpRequest();
	  xhr.open("GET", url, true);
	  xhr.responseType = "blob";
  
	  xhr.onload = function () {
		  if (this.status === 200) {
			console.log("ok");
		  resolve(this.response);
		  } else {
			console.log('Could not download file: '+url);
		  reject(new Error(`Could not download file: ${url}`));
		}
	  };
	  xhr.onerror = function () {		
		reject(new Error(`Could not download file: ${url}`));
	  };
  
	  xhr.send();
	});
}
function generateFileUrls() {
	fileUrls = new Array();
	//SLOT x parameters	
	for (j = 0; j < 256; j++) {
		if (slotExist[j] == 1) {
			fileUrls.push({ folder: 'slot_' + j, fileName: 'relays.xml' });	
			fileUrls.push({ folder: 'slot_' + j, fileName: 'fet.xml' });
			fileUrls.push({ folder: 'slot_' + j, fileName: 'globals.xml' });
			fileUrls.push({ folder: 'slot_' + j, fileName: 'r_group.xml' });
			fileUrls.push({ folder: 'slot_' + j, fileName: 'r_prot.xml' });
			fileUrls.push({ folder: 'slot_' + j, fileName: 'PCA_OUT.xml' });
			fileUrls.push({ folder: 'slot_' + j, fileName: 'switches.xml' });
		}		
	}
	//files
	fileUrls.push({ folder: 'dict', fileName: 'places.jsn' });
	fileUrls.push({ folder: 'dict', fileName: 'speech.jsn' });
	fileUrls.push({ folder: 'dict', fileName: 'subject.jsn' });

	fileUrls.push({ folder: '', fileName: 'timer.csv' });
	fileUrls.push({ folder: '', fileName: 'sensors.bak' });
	fileUrls.push({ folder: '', fileName: 'f_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'g_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'h_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'p_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'r_desc.xml' });
	fileUrls.push({ folder: '', fileName: 's_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'slo_desc.xml' });
	fileUrls.push({ folder: '', fileName: 't_desc.xml' });
	fileUrls.push({ folder: '', fileName: 'username.xml' });
	
}
async function LoadJSZip() {
	return new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = host+'jszip.min.js';
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	  });
}