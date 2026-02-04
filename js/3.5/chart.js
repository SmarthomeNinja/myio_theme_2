
function generateString() {
	if (lastChart == 0){string="c";}
	else if (lastChart < 100) { string = "t"; }
	else if (lastChart <200){string="h";}
	  else {string="sdm";}
	  string+="_log";
	  if (lastChart>100 && lastChart<200){string+="_"+(lastChart-101);}
	  else if (lastChart < 100 && lastChart != 0) { string += "_" + lastChart; }
	
	  string+="/";
	  if (lastChart == 0){string+="c";}
	  else if (lastChart < 100) { string += "t"; }
	  else if (lastChart <200){string+="h";}
	  else {string+="s";}
	  string+="_"+(document.getElementById("date").value).toString()+".csv";		
} 
   

var string="empty";
var dateString = "empty";
var logScale = false;
var stacked = false;
var rangeSelector = false;
var csv3array = new Array();
var csv3 = "";
var multiChartArrayActive = new Array();
var multiChartArraySensor = new Array();
var multiChartArrayDate = new Array();
var multiChartArraySensorColumn = new Array();
var csvStringArray = new Array();
var bigCSV = "";
var minRange = 10000;
var maxRange = parseInt(-10000);
var yRangeEnabled = false;

var chartVisibility = new Array();

var refreshing = false;
var zoomRange = 600000;
var refreshInterval = 10000;


document.write('<div class="content"><table><tr><td align="center">');
document.write('<br>'+str_Sensor+':');
generateDateString();
document.write('<select id="sensor" name="lastChart" onchange="changed(this)" >');
document.write('<option value="0">' + str_ConsumptionMeter + '</option>');

document.write('<option value="'+200+'"');
if (lastChart==200){document.write(' selected');}
document.write('>SDM Smart Meter</option>');

if (thermo_eepromIndex != null ){
	for(j=0;j<thermo_eepromIndex.length;j++){
		document.write('<option value="'+thermo_eepromIndex[j]+'"');
		if (thermo_eepromIndex[j] == lastChart){document.write(' selected');}
		document.write('>'+thermo_eepromIndex[j]+'-'+thermo_description[thermo_eepromIndex[j]]);
		document.write('</option>');
	}
}
for(j=0;j<humidity.length;j++){
	if (humidity[j]!=0){
		document.write('<option value="'+(j+101)+'"');
		if (j == (lastChart-101)){document.write(' selected');}
		document.write('>H '+j+'-'+hum_description[j]);
		document.write('</option>');
	}
}
document.write('</select>');
document.write(' '+str_Date+':');
document.write('<input type="text" id="date" value="'+dateString+'" onchange="updateChart(this)">');
document.write('</td></tr>');

document.write('<tr>');
document.write('<td align = "center"><table><tr><td align = "center"><label id="CB0L"><input type = "checkbox" id = "CB0" onclick = "changeGraph(this)" > ' + str_LogScale + ' </label></td>');
document.write('<td align = "center"><label id="CB1L"><input type = "checkbox" id = "CB1" onclick = "changeGraph(this)" > ' + str_Stacked+' </label></td>');
document.write('<td align = "center"><label id="CB2L"><input type = "checkbox" id = "CB2" onclick = "changeGraph(this)" > ' + str_MultiChart + ' </label></td>');
document.write('<td align = "center"><label id="CB3L"><input type = "checkbox" id = "CB3" onclick = "changeGraph(this)" > ' + str_yRange + '</label></td>');
document.write('<td align = "center"><label id="CB4L"><input type = "checkbox" id = "CB4" onclick = "changeGraph(this)" > ');
document.write('<button onclick="RefreshChart()" >'	+ str_Update + '</button></label>');
document.write('<label id="INPUT4L"><input type = "number" style="width: 3em" value='+refreshInterval/1000 +' id = "INPUT4" onchange = "refreshInterval=this.value*1000;Refresh();" > sec </label></td>');
document.write('</tr></table>');
document.write('</tr>');

document.write('<tr id="SDM">');
document.write('<td align = "center" >');
document.write('<input type = "checkbox" id = "0" onclick = "ChangeChartVisibility(this)" checked> P1 ');
document.write('<input type = "checkbox" id = "1" onclick = "ChangeChartVisibility(this)" checked> P2 ');
document.write('<input type = "checkbox" id = "2" onclick = "ChangeChartVisibility(this)" checked> P3 ');
document.write('<input type = "checkbox" id = "3" onclick = "ChangeChartVisibility(this)"> V1 ');
document.write('<input type = "checkbox" id = "4" onclick = "ChangeChartVisibility(this)"> V2 ');
document.write('<input type = "checkbox" id = "5" onclick = "ChangeChartVisibility(this)"> V3 ');
document.write('<input type = "checkbox" id = "6" onclick = "ChangeChartVisibility(this)"> C1 ');
document.write('<input type = "checkbox" id = "7" onclick = "ChangeChartVisibility(this)"> C2 ');
document.write('<input type = "checkbox" id = "8" onclick = "ChangeChartVisibility(this)"> C3 ');
document.write('<input type = "checkbox" id = "9" onclick = "ChangeChartVisibility(this)"> A1 ');
document.write('<input type = "checkbox" id = "10" onclick = "ChangeChartVisibility(this)"> A2 ');
document.write('<input type = "checkbox" id = "11" onclick = "ChangeChartVisibility(this)"> A3 ');
document.write('<input type = "checkbox" id = "12" onclick = "ChangeChartVisibility(this)"> R1 ');
document.write('<input type = "checkbox" id = "13" onclick = "ChangeChartVisibility(this)"> R2 ');
document.write('<input type = "checkbox" id = "14" onclick = "ChangeChartVisibility(this)"> R3 ');
document.write('<input type = "checkbox" id = "15" onclick = "ChangeChartVisibility(this)"> pF1 ');
document.write('<input type = "checkbox" id = "16" onclick = "ChangeChartVisibility(this)"> pF2 ');
document.write('<input type = "checkbox" id = "17" onclick = "ChangeChartVisibility(this)"> pF3 ');
document.write('<input type = "checkbox" id = "18" onclick = "ChangeChartVisibility(this)"> pA1 ');
document.write('<input type = "checkbox" id = "19" onclick = "ChangeChartVisibility(this)"> pA2 ');
document.write('<input type = "checkbox" id = "20" onclick = "ChangeChartVisibility(this)"> pA3</td>');
document.write('</tr>');
chartVisibility = [1, 1, 1, 0, 0, 0, 0, 0, 0,0,0,0,0,0,0,0,0,0,0,0,0];
	
if (lastChart == 200) {
	document.getElementById("CB1L").style.display = "inline-block";	
} else {
	document.getElementById("SDM").style.display = "none";
	document.getElementById("CB1L").style.display = "none";		
}
document.getElementById("CB3L").style.display = "none";

document.write('<tr><td align="center" style="width:80%;"> <div id="graphdiv2" style="width:100%;"></div>');

document.write('</td><td valign=top><div id="status" style="font-size:1em; padding-top:5px;"></div></td></tr > ');
document.write('<tr ><table id="multiChartTable"></table></tr>');

document.write('</table ></div >');


//generate labels  
var labelsArray = new Array(0);
if(lastChart==0){labelsArray[1]=str_Consumption;}
else if (lastChart<100){labelsArray[1]=str_Temperature;}
else if (lastChart<110){ labelsArray[1] = str_Humidity; }
else if (lastChart == 200) {
	 labelsArray = ['date', 'P1', 'P2', 'P3', 'V1', 'V2', 'V3', 'C1', 'C2', 'C3', 'A1', 'A2', 'A3', 'R1', 'R2', 'R3', 'pF1', 'pF2', 'pF3', 'pA1', 'pA2', 'pA3']; }	
labelsArray[0]=str_Time;
var nextDimension = 2;

if (lastChart == 200) {
	labelsArray[1] = 'P1';
	labelsArray[2] = 'P2';
	labelsArray[3] = 'P3';
	labelsArray[4] = 'V1';
	labelsArray[5] = 'V2';
	labelsArray[6] = 'V3';
	labelsArray[7] = 'C1';
	labelsArray[8] = 'C2';
	labelsArray[9] = 'C3';
	labelsArray[10] = 'A1';
	labelsArray[11] = 'A2';
	labelsArray[12] = 'A3';
	labelsArray[13] = 'R1';
	labelsArray[14] = 'R2';
	labelsArray[15] = 'R3';
	labelsArray[16] = 'pF1';
	labelsArray[17] = 'pF2';
	labelsArray[18] = 'pF3';
	labelsArray[19] = 'pA1';
	labelsArray[20] = 'pA2';
	labelsArray[21] = 'pA3';
}
	generateString();
dygraphParams = {
		
	drawPoints: true,
	labelsDiv: document.getElementById('status'),
	labelsKMB: true,
	legend: 'always',
	color: 'darkblue',
	showRoller: true,
	rollPeriod: 2,
	labels: labelsArray,	
	strokeWidth: stacked ? 1 : 1,
	fillGraph: true,
	animatedZooms: true,
	labelsSeparateLines: true,
	stackedGraph: stacked,
	strokeBorderWidth: stacked ? 1 : 1,
	highlightCircleSize: 2,
	highlightSeriesOpts: {
		strokeWidth: 1.5,
		strokeBorderWidth: 1,
		highlightCircleSize: 3,
	},
	zoomCallback: function(minX, maxX, yRanges) {
			zoomRange = maxX - minX;
	},
			  
}	

g = new Dygraph(document.getElementById("graphdiv2"), string, dygraphParams);


if (refreshing) {
	window.intervalId = setInterval(function () {
		g.updateOptions({ 'file': string });
		const d = new Date();
		let time = d.getTime();
		console.log("Zoom")
		ZoomGraphX(time-zoomRange,time );
	}, refreshInterval);
} 

document.write('</body>');

g.updateOptions({
	visibility: chartVisibility,
	showRangeSelector: true
});	

//kijelöli a közelebbi chartot
var onclick = function (ev) {
	
    if (g.isSeriesLocked()) {
      g.clearSelection();
    } else {
      g.setSelection(g.getSelection(), g.getHighlightSeries(), true);
	}

};


function updateChart(obj){
  generateString();
	g.updateOptions( { 'file':string } );
}
function generateDateString(){	
	dateString = year.toString().slice(2);
	if(month<10)dateString+='0';
	dateString+=month;
	if(day<10)dateString+='0';
	dateString += day;		
}
function loadCSV(filePath) {
	// Load json file;
	var response = loadTextFileAjaxSync(filePath);
	// Parse json	
	return response;
}     
// Load text with Ajax synchronously: takes path to file and optional MIME type
function loadTextFileAjaxSync(filePath, mimeType)
{
	var xmlhttp=new XMLHttpRequest();
	xmlhttp.open("GET",filePath,false);
	if (mimeType != null) {
	  if (xmlhttp.overrideMimeType) {
		xmlhttp.overrideMimeType(mimeType);
	  }
	}
	xmlhttp.send();
	if (xmlhttp.status==200 && xmlhttp.readyState == 4 )
	{
	  return xmlhttp.responseText;
	}
	else {
	  // TODO Throw exception
	  return null;
	}
}
function CSVToArray( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			strMatchedDelimiter !== strDelimiter
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}

		var strMatchedValue;

		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}
function drawMultiChartTable() {
	var rowNr = 0;
	var table = document.getElementById("multiChartTable");
	var row = table.insertRow(-1);	
	var cell0 = row.insertCell(0);
	cell0.style.textAlign = "center";
	cell0.outerHTML = '<th id="top">Active</th>';
	var cell1 = row.insertCell(1);
	cell1.style.textAlign = "center";
	cell1.outerHTML = '<th id="top">Sensor</th>';
	var cell2 = row.insertCell(2);
	cell2.style.textAlign = "center";
	cell2.outerHTML = '<th id="top">Date</th>';
	var cell3 = row.insertCell(3);
	cell3.style.textAlign = "center";
	cell3.outerHTML = '<th id="top">LOAD</th>';
	
	for (i = 0; i < multiChartArrayActive.length; i++){
		//Active
		row = table.insertRow(-1);
		row.id = 'multiChartRow*' + rowNr;
		cell0 = row.insertCell(0);
		cell0.style.textAlign = "center";
		var tempString = '<input type="checkbox" id="multiChartActive*' + i + '" onClick="GenerateChartVisibility()"';
		if (chartVisibility[i]) { tempString += " checked"; }
		tempString += '>';
		cell0.innerHTML = tempString;
		
		//Sensor
		cell1 = row.insertCell(1);
		cell1.style.textAlign = "center";	
		cell1.innerHTML = SensorListString(rowNr);
		multiChartArraySensorColumn[rowNr] = rowNr;
		for (j = 0; j < i; j++){
			if (multiChartArraySensor[rowNr] == multiChartArraySensor[j]) {
				multiChartArraySensorColumn[rowNr] = multiChartArraySensorColumn[j];
			}
		}
		//Date
		var cell2 = row.insertCell(2);
		cell2.style.textAlign = "center";
		if (multiChartArrayDate[rowNr] == 0 || multiChartArrayDate[rowNr] == undefined) {
			generateDateString();
			multiChartArrayDate[rowNr] = dateString;
		}
		cell2.innerHTML = '<input type="text" name='+rowNr+' value="'+multiChartArrayDate[rowNr]+'" onchange="MultiChartChangeDate(this)">';
		//Load
		var cell3 = row.insertCell(3);
		cell3.style.textAlign = "center";
		cell3.innerHTML = '<button value=' + rowNr + ' onclick="LoadCSV(this)" >' + str_Load + '</button>';
		rowNr++;
	}

	//Active
	
	row = table.insertRow(-1);
	row.style.backgroundColor = "#FF0000";
	row.style.height = "10px";
	
	row = table.insertRow(-1);
	row.id = 'multiChartRow*' + rowNr;
	row.style.backgroundColor = "AliceBlue";
	cell0 = row.insertCell(0);
	cell0.style.textAlign = "center";
	cell0.innerHTML = '<input type="checkbox" id="multiChartActive*' + multiChartArrayActive.length + '" onClick="">';
	//Sensor
	cell1 = row.insertCell(1);
	cell1.style.textAlign = "center";	
	cell1.innerHTML = SensorListString(rowNr);
	//Date
	var cell2 = row.insertCell(2);
	cell2.style.textAlign = "center";
	if (multiChartArrayDate[rowNr] == 0 || multiChartArrayDate[rowNr] == undefined) {
		generateDateString();
		multiChartArrayDate[rowNr] = dateString;
	}
	cell2.innerHTML = '<input type="text" name='+rowNr+' value="'+multiChartArrayDate[rowNr]+'" onchange="MultiChartChangeDate(this)">';
	//Load
	var cell3 = row.insertCell(3);
	cell3.style.textAlign = "center";
	cell3.innerHTML = '<button value=' + rowNr + ' onclick="LoadCSV(this)" >' + str_Load + '</button>';

	for (i = 0; i < multiChartArrayActive.length; i++) {
		console.log("column:"+multiChartArraySensorColumn[i]);
	}
}
function SensorListString(_rowNr) {
	var _string = '<select id="sensor" name='+_rowNr+' onchange="SensorChanged(this)" >';
	_string += '<option value="0">' + str_ConsumptionMeter + '</option>';
	
	if (thermo_eepromIndex != null ){
		for(j=0;j<thermo_eepromIndex.length;j++){
			_string+='<option value="'+thermo_eepromIndex[j]+'"';
			if (thermo_eepromIndex[j] == multiChartArraySensor[_rowNr]){_string+=' selected';}
			_string+='>'+thermo_eepromIndex[j]+'-'+thermo_description[thermo_eepromIndex[j]];
			_string+='</option>';
		}
	}
	for(j=0;j<humidity.length;j++){
		if (humidity[j]!=0){
			_string += '<option value="' + (j + 101) + '"';
			
			if (j == (multiChartArraySensor[_rowNr]-101)){_string+=' selected';}
			_string+='>H '+j+'-'+hum_description[j];
			_string+='</option>';
		}
	}
	_string += '</select>';
	return _string;
}
function SensorChanged(obj) {
	multiChartArraySensor[obj.name] = obj.value;
	console.log("Sensor Changed:"+obj.name + " " + obj.value + "=" + multiChartArraySensor[obj.name]);
}
function MultiChartChangeDate(obj){
	multiChartArrayDate[obj.name] = obj.value;
}
function LoadCSV(obj) {
	var filePath = "/";
	if (multiChartArraySensor[obj.value] == undefined) {
		multiChartArraySensor[obj.value] = 0;
		console.log("multiChartArraySensor[obj.value] undefined ->:" + multiChartArraySensor[obj.value]);
	}
	if (multiChartArraySensor[obj.value] > 100) {
		filePath += "h";
	} else if (multiChartArraySensor[obj.value] == 0) {
		filePath += "c";
	} else {
		filePath += "t";
	}
	filePath += "_log";
	console.log("multiChartArraySensor[obj.value]:"+multiChartArraySensor[obj.value])
	if (multiChartArraySensor[obj.value] > 100) {
		filePath += '_' + (multiChartArraySensor[obj.value] - 101);
	} else if (multiChartArraySensor[obj.value] == 0) {
	} else {
		filePath += '_' + multiChartArraySensor[obj.value];
	}
	filePath += "/";
	if (multiChartArraySensor[obj.value] > 100) {
		filePath += "h";
	} else if (multiChartArraySensor[obj.value] == 0) {
		filePath += "c";
	} else {
		filePath += "t";
	}
	
	filePath+="_"+multiChartArrayDate[obj.value]+".csv";	
	console.log(filePath);
	csvStringArray[obj.value] = loadCSV(filePath);
	multiChartArrayActive[obj.value] = 1;
	
	document.getElementById("multiChartActive*" + obj.value).checked = true;


	GenerateBigCSV();
	GenerateLabelsArray();
	GenerateChartVisibility();

	dygraphParams.rollPeriod = multiChartArrayActive.length;		
	
	g = new Dygraph(document.getElementById("graphdiv2"),bigCSV,dygraphParams);	
	document.getElementById("multiChartTable").innerHTML = "";	
	drawMultiChartTable();

	var margin = parseFloat((maxRange - minRange) / 10).toFixed(2);
	var temp_minRange = minRange - margin;
	var temp_maxRange = parseFloat( parseFloat(maxRange) + parseFloat(margin)).toFixed(2);
	
	if(yRangeEnabled) g.updateOptions({ 'valueRange': [temp_minRange, temp_maxRange] });
	
}
function GenerateBigCSV() {
	bigCSV = "";
	tempCSVarray = new Array();
	for (i = 0; i < multiChartArrayActive.length; i++){		
		tempCSVarray[i] = CSVToArray(csvStringArray[i]);
	}
	for (i = 0; i < multiChartArrayActive.length; i++){
		for (j = 0; j + 1 < tempCSVarray[i].length; j++){
			bigCSV += tempCSVarray[i][j][0];
			for (k = 0; k < i+1; k++){
				bigCSV += ',';
			}
			bigCSV += tempCSVarray[i][j][1];
			if (parseFloat(tempCSVarray[i][j][1]) < parseFloat(minRange)) {				
				minRange = tempCSVarray[i][j][1];
			}
			if (parseFloat(tempCSVarray[i][j][1]) > parseFloat(maxRange)) {				
				maxRange = tempCSVarray[i][j][1];
			}
			for (k = 0; k < multiChartArrayActive.length-i-1; k++){
				bigCSV += ',';
			}
			bigCSV += "\n";
		}
	}
}
function changeGraph(i) {	
	if (i.id == "CB0") {
		logScale = !logScale;
		g.updateOptions({ 'logscale': logScale });
	} else if (i.id == "CB1") {
		stacked = !stacked;
		g.updateOptions({ 'stackedGraph': stacked });
	} else if (i.id == "CB2") {		
		drawMultiChartTable();
		document.getElementById("CB2L").style.display = "none";
		document.getElementById("CB1L").style.display = "none";
		document.getElementById("SDM").style.display = "none";
		document.getElementById("CB4").style.display = "none";
		document.getElementById("CB3L").style.display = "inline-block";
		stacked = false;
		g.updateOptions({ 'stackedGraph': stacked });
		clearInterval(window.intervalId);
	}else if (i.id == "CB3") {
		yRangeEnabled = !yRangeEnabled;
		
		if (yRangeEnabled) {
			var margin = parseFloat((maxRange - minRange) / 10).toFixed(2);
			var temp_minRange = minRange - margin;
			var temp_maxRange = parseFloat( parseFloat(maxRange) + parseFloat(margin)).toFixed(2);
			g.updateOptions({ 'valueRange': [temp_minRange, temp_maxRange] });
		} else {
			g.updateOptions({ 'valueRange': [null, null] });
		}
	}else if (i.id == "CB4") {
		refreshing = !refreshing;		
		if (refreshing) {
			Refresh();
		} else {
			clearInterval(window.intervalId);
		}
	}
}
function Refresh() {
	if (refreshing) {
		clearInterval(window.intervalId);
		window.intervalId = setInterval(function () {
			g.updateOptions({ 'file': string });
			const d = new Date();
			let time = d.getTime();
			ZoomGraphX(time - zoomRange, time);
		}, refreshInterval);
	}
}
function ChangeChartVisibility(obj) {
	chartVisibility[obj.id] = !chartVisibility[obj.id];
	g.setVisibility(parseInt(obj.id), obj.checked);
}
function GenerateLabelsArray() {
	labelsArray.length=0;
	labelsArray[0] = str_Time;	
	for (i = 1; i <= multiChartArrayActive.length; i++){
		if (multiChartArraySensor[i - 1] == 0) {
			labelsArray[i] = str_ConsumptionMeter;
		}else if (multiChartArraySensor[i - 1] < 100) {
			if (typeof (thermo_description[multiChartArraySensor[i - 1]]) != "undefined") {
				labelsArray[i] = thermo_description[multiChartArraySensor[i - 1]];
			} else labelsArray[i] = str_Undefined;
		}else if (multiChartArraySensor[i - 1] < 120) {
			if (typeof (hum_description[multiChartArraySensor[i - 1]]) != "undefined") {
				labelsArray[i] = hum_description[multiChartArraySensor[i - 102]];
			} else labelsArray[i] = str_Undefined;			
		}else {
			labelsArray[i] = multiChartArraySensor[i - 1];
		}
	}	
	g.updateOptions({ 'labels': labelsArray });

}
function GenerateChartVisibility() {
	chartVisibility.length = 0;
	for (i = 0; i < multiChartArrayActive.length; i++) {
		chartVisibility[i] = document.getElementById('multiChartActive*' + i).checked;
		g.setVisibility(parseInt(i), document.getElementById('multiChartActive*' + i).checked);		
	}	
	g.updateOptions({
		visibility: chartVisibility		
	});	
}
function ZoomGraphX(minDate, maxDate) {
	g.updateOptions({
	  dateWindow: [minDate, maxDate]
	});
}
function RefreshChart() {
	g.updateOptions({ 'file': string });
	const d = new Date();
	let time = d.getTime();
	ZoomGraphX(time - zoomRange, time);
}