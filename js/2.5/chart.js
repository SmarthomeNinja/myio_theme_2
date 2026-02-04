function generateString() {
	if (lastChart == 0){string="c";}
	  else if (lastChart <100){string="t";}
	  else {string="h";}
	  string+="_log";
	  if (lastChart>100){string+="_"+(lastChart-101);}
	  else if (lastChart<100 && lastChart!=0){ string+="_"+lastChart;}
	  string+="/";
	  if (lastChart == 0){string+="c";}
	  else if (lastChart <100){string+="t";}
	  else {string+="h";}
	  string+="_"+(document.getElementById("date").value).toString()+".csv";		
} 
document.write('<div class="content"><table><tbody><tr><td align="center">');
document.write('<br>'+str_Sensor+':');
var string="empty";
var dateString = "empty";
generateDateString();
document.write('<select id="sensor" name="lastChart" onchange="changed(this)" >');
document.write('<option value="0">'+str_ConsumptionMeter+'</option>');
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
document.write('</td></tr><tr><td align="center"><div id="graphdiv2" style="width:80%;"></div>');
document.write('</td></tr></tbody></table></div>');
//generate labels  
	var labelsArray = new Array(0);
	labelsArray[0]='idő';
	if(lastChart==0){labelsArray[1]=str_Consumption;}
	 else if (lastChart<100){labelsArray[1]=str_Temperature;}
		else {labelsArray[1]=str_Humidity;}
		
	var nextDimension=2;
	if(lastChart<100){
		for (i=0;i<thermoActivator.length;i++){
			if(thermoActivator[i] == lastChart){
				labelsArray[nextDimension] = relay_description[i+1] + ' '+str_On;nextDimension++;
				labelsArray[nextDimension] = relay_description[i+1] + ' '+str_Off;nextDimension++;
			}
		}
	}
generateString();

  g = new Dygraph(
    document.getElementById("graphdiv2"),string,
			{
			//	drawPoints: true,
				color: 'darkgreen',
				showRoller: true,
				rollPeriod: 2,
		//  	labels: labelsArray,
		labels:["X", "Y1", "Y2","Y3","Y4", "Y5","Y6", "Y7", "Y8","Y9","Y10", "Y11","Y12","Y13"],
		//		Xlabels: ['x', 'y'],
				strokeWidth: 1,
			//	fillGraph: true,
				animatedZooms: true,
	 		    showRangeSelector: true,
	//			rangeSelectorHeight: 30,
	//			rangeSelectorPlotStrokeColor: 'darkgreen',
	//			rangeSelectorPlotFillColor: 'green'
				series : {
				  'Y1': {
							strokeWidth: 2,
							fillGraph: true
                 	 }	,
                  'hőmérséklet': {
							strokeWidth: 2,
							fillGraph: true
                 	 }	,
				  'fogyasztás': {
							strokeWidth: 2,
							fillGraph: true
                 	 }			
									}
									
			}
  );	

function updateChart(obj){
  generateString();
	g.updateOptions( { 'file':string } );
}
function generateDateString(){	
	dateString = year.toString().slice(2);
	if(month<10)dateString+='0';
	dateString+=month;
	if(day<10)dateString+='0';
	dateString+=day;	
}

document.write('</body>');