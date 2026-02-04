
var str_Listener = "Figyelő";
var str_End = "Vége";
var str_Delete = "Törlés";
var str_Verbs = "Igék";
var str_Conjunctions = "Kötőszavak";
var str_Places = "Helyiségek";
var str_Subjects = "Tárgyak";
var str_Saving="Mentés"

var speechDictionaryTXT = 
    '{\
      "listener":["computer"], \
	  "end":["vége"], \
      "verbs":{ \
        "TURN" : {\
          "name":"turn", \
          "words":["kapcsol","vált","olt"], \
          "conjunctions" :{\
            "DEFAULT":["át"], \
            "ON":["fel","be"], \
            "OFF":["le","ki"] \
          }\
        },\
        "OPEN" : { \
          "name":"open", \
          "words":["nyit","nyis","húz"], \
          "conjunctions" :{\
            "DEFAULT":["ki","fel"] \
          }\
        },\
        "CLOSE" : {\
          "name":"close", \
          "words":["csuk","zár","eresz"], \
          "conjunctions" :{\
            "DEFAULT":["be","le"] \
          }\
        },\
        "STOP" : {\
          "name":"stop", \
          "words":["áll","stop"], \
          "conjunctions" :{\
            "DEFAULT":["meg","le"] \
          }\
        },\
        "START" : {\
          "name":"start", \
          "words":["indul","indít","start"], \
          "conjunctions" :{\
            "DEFAULT":["el"] \
          }\
        },\
		"SET" : {\
          "name":"set", \
          "words":["állít","fényerő"], \
          "conjunctions" :{\
            "DEFAULT":["be","át"] \
          }\
        }\
      }\
    }';
var placeDictionaryTXT = 
	'{\
		"places": {\
			"1": [\
			  "nappali"\
			],\
			"2": [\
			  "konyh",\
			  "főzőfülk"\
			],\
			"3": [\
			  "háló",\
			  "hálószob"\
			],\
			"4": [\
			  "fürdőszob"\
			],\
			"5": [\
			  "wc"\
			],\
			"6": [\
			  "folyosó",\
			  "lépcsőház"\
			],\
			"7": [\
			  "irod",\
			  "dolgozó"\
			],\
			"8": [\
			  "háló terasz",\
			  "háló erkély"\
			],\
			"9": [\
			  "gardrób"\
			],\
			"10": [\
			  "vendég háló",\
			  "vendégszob"\
			],\
			"11": [\
			  "vendég fürdő"\
			],\
			"12": [\
			  "vendég terasz",\
			  "vendég erkély"\
			],\
			"13": [\
			  "kert",\
			  "kint"\
			],\
			"14": [\
			  "garázs"\
			],\
			"15": [\
			  "pinc"\
			]\
		}\
	}';

var subjectDictionaryTXT = 
    '{"PCF":{ \
        "verbs":{\
			"TURN" : {\
				"DEFAULT" : "r_INV=%n",\
				"ON" : "r_ON=%n",\
				"OFF" : "r_OFF=%n"\
			},\
			"OPEN" : {\
				"DEFAULT" : "r_ON=%n"\
			},\
			"CLOSE" : {\
				"DEFAULT" : "r_ON=%n"\
			},\
			"STOP" : {\
				"DEFAULT" : "r_OFF=%n"\
			},\
			"START" : {\
				"DEFAULT" : "r_ON=%n"\
			}\
        }\
      },\
      "PCA":{\
        "verbs":{ \
			"TURN" : {\
				"DEFAULT" : "PCA_INV=%n",\
				"ON" : "PCA_ON=%n",\
				"OFF" : "PCA_OFF=%n"\
			},\
			"OPEN" : {\
				"DEFAULT" : "PCA_ON=%n"\
			},\
			"CLOSE" : {\
				"DEFAULT" : "PCA_ON=%n"\
			},\
			"STOP" : {\
				"DEFAULT" : "PCA_OFF=%n"\
			},\
			"START" : {\
				"DEFAULT" : "PCA_ON=%n"\
			},\
			"SET" : {\
				"DEFAULT" : "PCA*%n=%v"\
			}\
        }\
	  },\
	  "PWM":{ \
		"verbs":{ \
			"TURN" : {\
				"DEFAULT" : "f_INV=%n",\
				"ON" : "f_ON=%n",\
				"OFF" : "f_OFF=%n"\
			},\
			"OPEN" : {\
				"DEFAULT" : "f_ON=%n"\
			},\
			"CLOSE" : {\
				"DEFAULT" : "f_ON=%n"\
			},\
			"STOP" : {\
				"DEFAULT" : "f_OFF=%n"\
			},\
			"START" : {\
				"DEFAULT" : "f_ON=%n"\
			},\
			"SET" : {\
				"DEFAULT" : "fet*%n=%v"\
			}\
	  	}\
	  }\
    }';

speechDictionary = JSON.parse(speechDictionaryTXT); 
subjectDictionary = JSON.parse(subjectDictionaryTXT); 
subjectDictionaryDefault = JSON.parse(subjectDictionaryTXT); 
placeDictionary = JSON.parse(placeDictionaryTXT);



try {
	subjectDictionary = loadJSON("/dict/subject.jsn");
	console.log("Loaded /dict/subject.jsn");
} catch { console.log("Can't Load /dict/subject.jsn") }

try {
	speechDictionary = loadJSON("/dict/speech.jsn");
	console.log("Loaded /dict/speech.jsn");
} catch (error) {console.log("Can't Load /dict/speech.jsn")}
try {	
	placeDictionary = loadJSON("/dict/places.jsn");
	console.log("Loaded /dict/places.jsn")
}catch{console.log("Can't Load /dict/places.jsn")}

//document.write('<form method="POST" id="put">');
//document.write('<input type=hidden name="$dict_sp.jsn" id="put_value" value=0></form>');



document.write('<div class="content">');
//listener name
document.write('<table style="width:auto! important; "><tr><td><div class="rawBox">');
document.write('<table id = "t02" align = "center" > ');
document.write('<tr><th id="top" colspan="100%">' + str_Listener + '</th></tr>');

document.write('<tr><td align="center">' + str_Listener + '</td>');
document.write('<td>');
document.write('<table id="listenersTable" align="center">');
document.write('<tr>');
document.write('<td align="center" >');
document.write('<input id="AddNewListener" type = "text" placeholder = "+" ');
document.write('name="listener" onchange="AddDictionary(this);"></td>');
document.write('</tr>');
for (listener in speechDictionary["listener"]) {
	var _tempObj = new Object();
	_tempObj.name = "listener*"+ listener; 
	_tempObj.value = speechDictionary["listener"][listener];
	AddDictionary(_tempObj,true);
}		
document.write('</table>');
document.write('</table>');
document.write('</div>');

//end word
document.write('<div class="rawBox">');
document.write('<table id = "t02" align = "center" > ');
document.write('<tr><th id="top" colspan="100%">' + str_End + '</th></tr>');

document.write('<tr><td align="center">' + str_End + '</td>');
document.write('<td>');
document.write('<table id="endWordTable" align="center">');
document.write('<tr>');
document.write('<td align="center" >');
document.write('<input id="AddNewEndWord" type = "text"  maxlength = "20" placeholder = "+" ');
document.write('name="end" onchange="AddDictionary(this);"></td>');
document.write('</tr>');
for (end in speechDictionary["end"]) {
	var _tempObj = new Object();
	_tempObj.name = "end*"+ listener; 
	_tempObj.value = speechDictionary["end"][end];
	AddDictionary(_tempObj,true);
}		
document.write('</table>');
document.write('</table>');
document.write('</div>');
document.write('</td></tr></table>');
//Verbs 

document.write('<div><div class="rawBox">');
document.write('<table id = "t02" align = "center" > ');
document.write('<tr><th id="top" colspan="100%">' + str_Verbs + '</th></tr>');
var _newListenerID = 0;
var _newVerbID = 0;
var _newConjunctionID = 0;
for (verb in speechDictionary["verbs"]) {
	document.write('<tr><td align="center">' + verb + '</td>');
	document.write('<td valign="top"><table id="verbTable*' + verb + '" align="center">');
	document.write('<tr><th >' + str_Verbs + '</th></tr>');
	document.write('<tr><td align="center">');
	document.write('<input name="Verb*'+verb+'" type = "text"  maxlength = "20" placeholder = "+" ');
	document.write('onchange="AddDictionary(this);">');
	document.write('</td></tr>');
	for (word in speechDictionary["verbs"][verb]["words"]) {
		var _tempObj = new Object();
		_tempObj.id = word;
		_tempObj.name = "Verb*"+ verb;
		_tempObj.value = speechDictionary["verbs"][verb]["words"][word];
		AddDictionary(_tempObj,true);
	}
	document.write('</table></td>');

	// Conjunctions
	document.write('<td valign="top" ><table align="center">');
	document.write('<tr><th colspan="100%">' + str_Conjunctions + '</th></tr>');
	document.write('<tr>');
	
	for (conjunction in speechDictionary["verbs"][verb]["conjunctions"]) {
		document.write('<td valign="top">');
		document.write('<table align="center" id="'+verb+'*'+conjunction+'">');
		document.write('<tr><td align="center">');	
		document.write(conjunction);		
		document.write('</td></tr>');
		document.write('<tr>');
		document.write('<td align="center" >');
		document.write('<input name="Conjunction*'+verb+'" size = "10" type = "text"  maxlength = "20" placeholder = "+" ');
		document.write('id="'+conjunction+'" onchange="AddDictionary(this);"></td>');
		document.write('</tr>');
		
		for (word in speechDictionary["verbs"][verb]["conjunctions"][conjunction]) {
			var_tempObj = new Object();
			_tempObj.id = conjunction;
			_tempObj.name = "Conjunction*"+ verb;
			_tempObj.value = speechDictionary["verbs"][verb]["conjunctions"][conjunction][word];
			AddDictionary(_tempObj,true);
		}
		document.write('</table>');
		document.write('</td>');
	}
	document.write('</tr>');	
	document.write('</table></td>');
	document.write('</tr>');
}
document.write('</table>');
//document.write('<button onclick="ShowVerbsJSON()" >show JSON</button>');
//document.write('<button onclick=Put("speech") >Put JSON</button>');
document.write('</div>');
document.write('</div>');
//Places
document.write('<div class="rawBox">');
document.write('<table id = "t02" name = "placesTable" align = "center" > ');
document.write('<tr><th id="top" colspan="100%">' + str_Places + '</th></tr>');
var _newPlaceID = 0;
for (place in placeDictionary["places"]) {
	document.write('<tr><td align="center">' + place + '</td>');
	document.write('<td valign="top"><table id="place*' + place + '" align="center">');
	document.write('<tr><th >' + str_Places + '</th></tr>');
	document.write('<tr><td align="center">');
	document.write('<input name="PlaceWord*'+place+'" alt="'+place+'"type = "text"  maxlength = "20" placeholder = "+" ');
	document.write('onchange="AddDictionary(this);">');
	document.write('</td></tr>');
	for (placeWord in placeDictionary["places"][place]) {
		var _tempObj = new Object();
		_tempObj.id = placeWord;
		_tempObj.name = "PlaceWord*" + place;
		_tempObj.alt = place;
		_tempObj.value = placeDictionary["places"][place][placeWord];
		AddDictionary(_tempObj,true);
	}
	document.write('</table></td>');
	document.write('</tr>');
}
document.write('</table>');
document.write('<button name="Place" onclick="AddDictionary(this);" > + '+str_Places+'</button>');
document.write('</div>');
//document.write('<button onclick="ShowPlacesJSON()" >show JSON</button>');
//document.write('<button onclick=Put("places") >Put JSON</button>');
//Subjects
//document.write('<div class="rawBox">');
////Check relay_descriptions
for (i = 0; i < relay_description.length; i++) {
	try {
		if (relay_description[i] != undefined) {
			if (subjectDictionary["PCF"][i] == undefined) {
				subjectDictionary["PCF"][i] = {};
				subjectDictionary["PCF"][i]["words"] = [];
				subjectDictionary["PCF"][i]["place"] = [];
				subjectDictionary["PCF"][i]["verbs"] = [];
			}
		}
	} catch {
		subjectDictionary["PCF"] = subjectDictionaryDefault["PCF"];
		if (subjectDictionary["PCF"][i] == undefined) {
			subjectDictionary["PCF"][i] = {};
			subjectDictionary["PCF"][i]["words"] = [];
			subjectDictionary["PCF"][i]["place"] = [];
			subjectDictionary["PCF"][i]["verbs"] = [];
		}
	};	
}
////Check PCA_descriptions
for (i = 0; i < PCA_description.length; i++) {
	try {
		if (PCA_description[i] != undefined) {
			if (subjectDictionary["PCA"][i] == undefined) {
				subjectDictionary["PCA"][i] = {};
				subjectDictionary["PCA"][i]["words"] = [];
				subjectDictionary["PCA"][i]["place"] = [];
				subjectDictionary["PCA"][i]["verbs"] = [];
			}
		}
	} catch {
		subjectDictionary["PCA"] = subjectDictionaryDefault["PCA"];
		if (subjectDictionary["PCA"][i] == undefined) {
			subjectDictionary["PCA"][i] = {};
			subjectDictionary["PCA"][i]["words"] = [];
			subjectDictionary["PCA"][i]["place"] = [];
			subjectDictionary["PCA"][i]["verbs"] = [];
		}
	};
}
////Check fet_descriptions
for (i = 0; i < fet_description.length; i++) {
	try {
		if (fet_description[i] != undefined) {
			if (subjectDictionary["PWM"][i] == undefined) {
				subjectDictionary["PWM"][i] = {};
				subjectDictionary["PWM"][i]["words"] = [];
				subjectDictionary["PWM"][i]["place"] = [];
				subjectDictionary["PWM"][i]["verbs"] = [];
			}
		}
	} catch {
		subjectDictionary["PWM"] = subjectDictionaryDefault["PWM"];
		if (subjectDictionary["PWM"][i] == undefined) {
			subjectDictionary["PWM"][i] = {};
			subjectDictionary["PWM"][i]["words"] = [];
			subjectDictionary["PWM"][i]["place"] = [];
			subjectDictionary["PWM"][i]["verbs"] = [];
		}
	};
}
//show subject type tables
var _newSubjectWordID = 0;
var _newSubjectVerbsID = 0;
for (subjectType in subjectDictionary) {	
	document.write('<div class="rawBox">');
	if (Object.keys(subjectDictionary[subjectType]).length > 1) {
		document.write('<table id = "t02" name = "subjectTypeTable*' + subjectType + '" align = "center" > ');
		document.write('<tr><th id="top" colspan="100%">' + subjectType + ' - ' + str_Subjects + '</th></tr>');
		//Subject Verbs
		document.write('<tr><th >' + str_Verbs + '</th>');
		document.write('<td valign="top"><table id="subjectVerbTable*' + subjectType + '" align="center">');
		for (verb in subjectDictionary[subjectType]["verbs"]) {
			document.write('<tr>');
			document.write('<td align="center">' + verb + '</td>');
			for (word in subjectDictionary[subjectType]["verbs"][verb]) {
				document.write('<td>' + word + '</td>');
				document.write('<td>');
				document.write('<input name="SubjectType*' + subjectType + '" id="SubjectTypeWord*' + word + '" alt="' + verb + '" type = "text"  maxlength = "20" placeholder = "+" ');
				document.write('value=' + subjectDictionary[subjectType]["verbs"][verb][word] + ' onchange="ChangeDictionary(this);">')
				document.write('</td>');
			}
			document.write('</tr>');
		}
		document.write('</table></td>');
		document.write('</tr></table>');

		//Subject Elements
		document.write('<table id = "t02" name = "subjectElementsTable*' + subjectType + '" align = "center" > ');
		for (element in subjectDictionary[subjectType]) {
			if (element != "verbs") {
				document.write('<tr><th id="top" colspan="100%">' + element + ' - ' + FindDescription(subjectType, element) + '</th></tr>');
				document.write('<tr>');
				//Subject Words
				document.write('<td valign="top"><table id="subjectWordTable*' + subjectType + '*' + element + '" align="center">');
				document.write('<tr><td align="center">');
				document.write('<input name="SubjectWord" alt="' + subjectType + '" id="SubjectElement*' + element + '" type="text" maxlength="20" placeholder= "+"');
				document.write('onchange="AddDictionary(this);">');
				document.write('</td></tr>');
				for (eachWord in subjectDictionary[subjectType][element]["words"]) {
					var _tempObj = new Object();
					_tempObj.id = "SubjectElement*" + element;
					_tempObj.name = "SubjectWord*" + eachWord;
					_tempObj.alt = subjectType;
					_tempObj.value = subjectDictionary[subjectType][element]["words"][eachWord];
					AddDictionary(_tempObj, true)
				}
				document.write('</table></td>');
				//Subject Place
				document.write('<td valign="top"><table id="subjectPlaceTable*' + subjectType + '*' + element + '" align="center">');
				document.write('<tr><td align="center">');
				document.write('<select name="SubjectPlace" id="SubjectPlaceElement*' + element + '*' + subjectType + '" onchange="AddDictionary(this);">');
				document.write('<option value="0" selected>+</option>');

				for (each in placeDictionary["places"]) {
					document.write('<option value="' + each + '">' + each + ' - ' + placeDictionary["places"][each][0] + '</option>')
				}
				document.write("</select>");
				document.write('</td></tr>');
				for (eachPlace in subjectDictionary[subjectType][element]["place"]) {
					var _tempObj = new Object();
					_tempObj.id = "SubjectPlaceElement*" + element + '*' + subjectType;
					_tempObj.name = "SubjectPlace*" + eachPlace;
					_tempObj.value = subjectDictionary[subjectType][element]["place"][eachPlace];
					AddDictionary(_tempObj, true)
				}
				document.write('</table></td>');
				//Subject Verbs
				document.write('<td valign="top"><table id="subjectVerbsTable*' + subjectType + '*' + element + '" align="center">');
				document.write('<tr><td align="center">');
				document.write('<select name="SubjectVerbs" id="SubjectVerbsElement*' + element + '*' + subjectType + '" onchange="AddDictionary(this);">');
				document.write('<option value="0" selected>+</option>');

				for (each in subjectDictionary[subjectType]["verbs"]) {
					document.write('<option value="' + each + '">' + each + ' - ' + speechDictionary["verbs"][each]["words"][0] + '</option>');
				}
				document.write("</select>");
				document.write('</td></tr>');
				for (eachVerb in subjectDictionary[subjectType][element]["verbs"]) {
					var _tempObj = new Object();
					_tempObj.id = "SubjectVerbsElement*" + element + '*' + subjectType;
					_tempObj.name = "SubjectVerbs*" + eachVerb;
					_tempObj.value = subjectDictionary[subjectType][element]["verbs"][eachVerb];
					AddDictionary(_tempObj, true)
				}
				document.write('</table></td>');

				document.write('</tr>')
			}
		
		}
		document.write('</table>');
	}
	document.write('</div>');
}
document.write('</table>');
//document.write('</div>');
//document.write('<button onclick="ShowJSON()" >show JSON </button>');
//document.write('<button onclick=Put("subject") >Put JSON</button>');
document.write('</div></body></html>');
window.scrollTo(x, y);

function ChangeDictionary(_obj) {
	if (_obj.name.startsWith("listener")) {
		_index = _obj.name.substring(_obj.name.indexOf("*") + 1);
		_number = parseInt(_index);
		speechDictionary["listener"][_number] = _obj.value;
	} else if (_obj.name.startsWith("Verb")) {
		_verb = _obj.name.substring(_obj.name.indexOf("*") + 1);
		speechDictionary["verbs"][_verb]["words"][_obj.id] = _obj.value;
	} else if (_obj.name.startsWith("Conjunction")) {
		_verb = _obj.name.substring(_obj.name.indexOf("*") + 1);
		speechDictionary["verbs"][_verb]["conjunctions"][_obj.alt][_obj.id] = _obj.value;
	} else if (_obj.name.startsWith("PlaceWord")) {		
		placeDictionary["places"][_obj.alt][_obj.id] = _obj.value;
		if (_obj.id == 0) {
			ChangePlaceNameInDropdown(_obj.alt,_obj.value);		
		}
	} else if (_obj.name.startsWith("SubjectType")) {
		var _type = _obj.name.substring(_obj.name.indexOf("*") + 1);
		var _word = _obj.id.substring(_obj.id.indexOf("*") + 1);
		subjectDictionary[_type]["verbs"][_obj.alt][_word] = _obj.value;
	} else if (_obj.name.startsWith("SubjectWord")) {
		var _type = _obj.alt;
		var _element = _obj.id.substring(_obj.id.indexOf("*") + 1);
		var _word = _obj.name.substring(_obj.name.indexOf("*") + 1);
		subjectDictionary[_type][_element]["words"][_word] = _obj.value;
	} else if (_obj.name.startsWith("SubjectPlace")) {
		var _firstIndexOfStar = _obj.id.indexOf("*") ;
		var _lastIndexOfStar = _obj.id.lastIndexOf("*");
		var _type = _obj.id.substring(_lastIndexOfStar+1);
		var _element = _obj.id.substring(_firstIndexOfStar+1, _lastIndexOfStar);
		var _place = _obj.name.substring(_obj.name.indexOf("*")+1);
		var _exist = false;
		for (each in subjectDictionary[_type][_element]["places"]) {
			if (subjectDictionary[_type][_element]["places"][each] == _obj.value) {
				_exist = true;
			}
		}
		if (!_exist) {
			subjectDictionary[_type][_element]["place"][_place] = _obj.value;
		}
	} else if (_obj.name.startsWith("SubjectVerbs")) {
		var _firstIndexOfStar = _obj.id.indexOf("*") ;
		var _lastIndexOfStar = _obj.id.lastIndexOf("*");
		var _type = _obj.id.substring(_lastIndexOfStar+1);
		var _element = _obj.id.substring(_firstIndexOfStar+1, _lastIndexOfStar);
		var _place = _obj.name.substring(_obj.name.indexOf("*")+1);
		var _exist = false;
		for (each in subjectDictionary[_type][_element]["verbs"]) {
			if (subjectDictionary[_type][_element]["verbs"][each] == _obj.value) {
				_exist = true;
			}
		}
		if (!_exist) {
			subjectDictionary[_type][_element]["verbs"][_place] = _obj.value;
		}
	} 
}
function AddDictionary(_obj, _force) {
	if (_obj.name.startsWith("listener")) {
		var _exist = false;
		for (each in speechDictionary["listener"]) {
			if (speechDictionary["listener"][each] == _obj.value) {
				_exist = true;
				_newListenerID = each;
			}
		}
		if (!_force) {
			FindNewListenerID();
		}
		speechDictionary["listener"][_newListenerID] = _obj.value;
		var table = document.getElementById("listenersTable");
		var row = table.insertRow(-1);
		row.id = 'listener*' + _newListenerID;
		var cell0 = row.insertCell(0);
		cell0.style.textAlign = "center";
		cell0.innerHTML = '<input type = "text" placeholder = "+" name="listener*' + _newListenerID + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
		cell0.innerHTML += '<button name="listener*' + _newListenerID + '" value="' + _newListenerID + '" onclick="Delete(this)" >' + str_Delete + '</button>';
		_obj.value = "";
	} else if (_obj.name.startsWith("end")) {
		var _exist = false;
		for (each in speechDictionary["end"]) {
			if (speechDictionary["end"][each] == _obj.value) {
				_exist = true;
				_newEndWordID = each;
			}
		}
		if (!_force) {
			FindNewEndWordID();
		}
		speechDictionary["end"][_newEndWordID] = _obj.value;
		var table = document.getElementById("endWordTable");
		var row = table.insertRow(-1);
		row.id = 'endWord*' + _newEndWordID;
		var cell0 = row.insertCell(0);
		cell0.style.textAlign = "center";
		cell0.innerHTML = '<input type = "text"  maxlength = "20" placeholder = "+" name="listener*' + _newEndWordID + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
		cell0.innerHTML += '<button name="listener*' + _newEndWordID + '" value="' + _newEndWordID + '" onclick="Delete(this)" >' + str_Delete + '</button>';
		_obj.value = "";
	} else if (_obj.name.startsWith("Conjunction")) {
		__verb = _obj.name.substring(_obj.name.indexOf("*") + 1);
		__conjunction = _obj.id;
		var _exist = false;
		for (each in speechDictionary["verbs"][__verb]["conjunctions"][__conjunction]) {
			if (speechDictionary["verbs"][__verb]["conjunctions"][__conjunction][each] == _obj.value) {
				_exist = true;
				_newConjunctionID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewConjunctionID(__verb, __conjunction, _force);
			}
			speechDictionary["verbs"][__verb]["conjunctions"][__conjunction][_newConjunctionID] = _obj.value;
			var table = document.getElementById(__verb + '*' + __conjunction);
			var row = table.insertRow(-1);
			row.id = __verb + '*' + __conjunction + '*' + _newConjunctionID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
			cell0.innerHTML = '<input type = "text" size = "10" maxlength = "20" placeholder = "+" name="Conjunction*' + __verb + '" alt="' + __conjunction + '" id="' + _newConjunctionID + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
			cell0.innerHTML += '<button name="Conjunction*' + __verb + '" id="' + __conjunction + '" value="' + _newConjunctionID + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";
		}
	} else if (_obj.name.startsWith("Verb")) {
		var __verb = _obj.name.substring(_obj.name.indexOf("*") + 1);
		var _exist = false;
		for (each in speechDictionary["verbs"][__verb]["words"]) {
			if (speechDictionary["verbs"][__verb]["words"][each] == _obj.value) {
				_exist = true;
				_newVerbID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewVerbID(__verb);
			}
			speechDictionary["verbs"][__verb]["words"][_newVerbID] = _obj.value;
			var table = document.getElementById("verbTable*" + __verb);
			var row = table.insertRow(-1);
			row.id = __verb + '*' + _newVerbID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
			cell0.innerHTML = '<input type = "text"  maxlength = "20" placeholder = "+" name="Verb*' + __verb + '" id="' + _newVerbID + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
			cell0.innerHTML += '<button name="Verb" id="' + __verb + '" value="' + _newVerbID + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";
		}
	} else if (_obj.name.startsWith("PlaceWord")) {
		var __place = _obj.alt;
		var _exist = false;
		for (each in placeDictionary["places"][__place]) {
			if (placeDictionary["places"][__place][each] == _obj.value) {
				_exist = true;
				_newPlaceID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewPlaceID(__place);
			}
			placeDictionary["places"][__place][_newPlaceID] = _obj.value;
			var table = document.getElementById("place*" + __place);
			var row = table.insertRow(-1);
			row.id = __place + '*' + _newPlaceID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
			cell0.innerHTML = '<input type = "text"  maxlength = "20" placeholder = "+" name="PlaceWord" alt="' + __place + '" id="' + _newPlaceID + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
			cell0.innerHTML += '<button name="PlaceWord" id="' + __place + '" value="' + _newPlaceID + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";			
		}
		if (_newPlaceID == 0 && !_force) {
			ChangePlaceNameInDropdown(__place, placeDictionary["places"][__place][_newPlaceID]);
		}
	} else if (_obj.name == "Place") {
		var table = document.getElementsByName("placesTable")[0];
		var rowQuantity = table.rows.length;
		placeDictionary["places"][rowQuantity] = new Array();
		var row = table.insertRow(rowQuantity);
		var cell0 = row.insertCell(0);
		cell0.style.textAlign = "center";
		cell0.innerHTML = rowQuantity;
		
		var cell1 = row.insertCell(1);
		cell1.style.textAlign = "center";
		var newPlaceTable = document.createElement('table');
		newPlaceTable.id = "place*" + rowQuantity;
		newPlaceTable.textAlign = "center;"
		var newPlaceRow0 = newPlaceTable.insertRow(0);
		var newPlaceCell0 = document.createElement("th");
		newPlaceCell0.innerHTML = str_Places;
		newPlaceRow0.appendChild(newPlaceCell0);
		var newPlaceRow1 = newPlaceTable.insertRow(1);
		var newPlaceCell1 = newPlaceRow1.insertCell(0);
		newPlaceCell1.textAlign = "center";
		newPlaceCell1.innerHTML = '<input name="PlaceWord*' + rowQuantity + '" alt="' + rowQuantity + '"type = "text"  maxlength = "20" placeholder = "+" onchange="AddDictionary(this);">';
		cell1.appendChild(newPlaceTable);
		
		for (type in subjectDictionary){
			for (element in subjectDictionary[type]) {
				if (element != "verbs") {
					var option = document.createElement("option");
					option.value = rowQuantity;
					option.text = option.value + " - ";
					var selectList = document.getElementById('SubjectPlaceElement*' + element + '*' + type);
					selectList.appendChild(option);
				}
			}
		}

	} else if (_obj.name.startsWith("SubjectWord")) {
		var __type = _obj.alt;
		var __element = _obj.id.substring(_obj.id.indexOf("*") + 1);
		var __word = _obj.name.substring(_obj.name.indexOf("*") + 1);
		var _exist = false;
		for (each in subjectDictionary[__type][__element]["words"]) {
			if (subjectDictionary[__type][__element]["words"][each] == _obj.value) {
				_exist = true;
				_newSubjectWordID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewSubjectWordID(__type,__element);
			}
			subjectDictionary[__type][__element]["words"][_newSubjectWordID] = _obj.value;
			var table = document.getElementById("subjectWordTable*" + __type + "*" + __element);
			var row = table.insertRow(-1);
			row.id = 'SubjectWord*'+__type + '*' + __element+'*'+_newSubjectWordID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
			cell0.innerHTML = '<input type = "text"  maxlength = "20" placeholder = "+" name="SubjectWord*'+_newSubjectWordID+'" alt="' + __type + '" id="SubjectElement*' + __element + '" value="' + _obj.value + '" onchange="ChangeDictionary(this);">';
			cell0.innerHTML += '<button name="SubjectWord*'+_newSubjectWordID+'" id="' + __element + '" value="' + __type + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";
		}		
	} else if (_obj.name.startsWith("SubjectPlace")) {
		var _firstIndexOfStar = _obj.id.indexOf("*") ;
		var _lastIndexOfStar = _obj.id.lastIndexOf("*");
		var __type = _obj.id.substring(_lastIndexOfStar+1);
		var __element = _obj.id.substring(_firstIndexOfStar+1, _lastIndexOfStar);
		var _exist = false;
		for (each in subjectDictionary[__type][__element]["place"]) {
			if (subjectDictionary[__type][__element]["place"][each] == _obj.value) {
				_exist = true;
				_newSubjectPlaceID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewSubjectPlaceID(__type,__element);
			}
			subjectDictionary[__type][__element]["place"][_newSubjectPlaceID] = _obj.value;
			var table = document.getElementById("subjectPlaceTable*" + __type + "*" + __element);
			var row = table.insertRow(-1);
			row.id = 'SubjectPlace*'+__type + '*' + __element+'*'+_newSubjectPlaceID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
						
			var selectList = document.createElement("select");
			selectList.name = 'SubjectPlace*' + _newSubjectPlaceID;
			selectList.id = 'SubjectPlaceElement*' + __element+'*'+__type;		
			selectList.setAttribute("onchange", "ChangeDictionary(this);");
			var option = document.createElement("option");
			option.value = "0";
			option.text = "-";
			if (_obj.value == "0") { option.setAttribute('selected', 'selected'); }
			selectList.appendChild(option);			
			for (each in placeDictionary["places"]) {
				var option = document.createElement("option");
				option.value = each;
				if (_obj.value == each) { option.setAttribute('selected', 'selected'); }
				option.text = option.value+ " - "+placeDictionary["places"][each][0];
				selectList.appendChild(option);
			}			
			cell0.appendChild(selectList);
			cell0.innerHTML += '<button name="SubjectPlace*'+_newSubjectPlaceID+'" id="' + __element + '" value="' + __type + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";
		}
		_obj.value = "0";
		
	} else if (_obj.name.startsWith("SubjectVerbs")) {
		var _firstIndexOfStar = _obj.id.indexOf("*") ;
		var _lastIndexOfStar = _obj.id.lastIndexOf("*");
		var __type = _obj.id.substring(_lastIndexOfStar+1);
		var __element = _obj.id.substring(_firstIndexOfStar+1, _lastIndexOfStar);
		var _exist = false;
		for (each in subjectDictionary[__type][__element]["verbs"]) {
			if (subjectDictionary[__type][__element]["verbs"][each] == _obj.value) {
				_exist = true;
				_newSubjectVerbsID = each;
			}
		}
		if (!_exist || _force) {
			if (!_force) {
				FindNewSubjectVerbsID(__type,__element);
			}
			subjectDictionary[__type][__element]["verbs"][_newSubjectVerbsID] = _obj.value;
			var table = document.getElementById("subjectVerbsTable*" + __type + "*" + __element);
			var row = table.insertRow(-1);
			row.id = 'SubjectVerbs*'+__type + '*' + __element+'*'+_newSubjectVerbsID;
			var cell0 = row.insertCell(0);
			cell0.style.textAlign = "center";
						
			var selectList = document.createElement("select");
			selectList.name = 'SubjectVerbs*' + _newSubjectVerbsID;
			selectList.id = 'SubjectVerbsElement*' + __element+'*'+__type;		
			selectList.setAttribute("onchange", "ChangeDictionary(this);");
			var option = document.createElement("option");
			option.value = "0";
			option.text = "-";
			if (_obj.value == "0") { option.setAttribute('selected', 'selected'); }
			selectList.appendChild(option);			
			for (each in subjectDictionary[__type]["verbs"]) {
				var option = document.createElement("option");
				option.value = each;
				if (_obj.value == each) { option.setAttribute('selected', 'selected'); }
				option.text = option.value+ " - "+speechDictionary["verbs"][each]["words"][0];
				selectList.appendChild(option);
			}			
			cell0.appendChild(selectList);
			cell0.innerHTML += '<button name="SubjectVerbs*'+_newSubjectVerbsID+'" id="' + __element + '" value="' + __type + '" onclick="Delete(this)" >' + str_Delete + '</button>';
			_obj.value = "";
		}
		_obj.value = "0";
		
	}
}
function Delete(_obj) {
	if (_obj.name.startsWith("listener")) {
		delete speechDictionary["listener"][_obj.value];
		document.getElementById(_obj.name).remove();
	} else if (_obj.name.startsWith("Verb")) {
		delete speechDictionary["verbs"][_obj.id]["words"][_obj.value];
		document.getElementById(_obj.id + "*" + _obj.value).remove();
	} else if (_obj.name.startsWith("Conjunction")) {
		var __verb=_obj.name.substring(_obj.name.indexOf("*") + 1);
		delete speechDictionary["verbs"][__verb]["conjunctions"][_obj.id][_obj.value];
		document.getElementById(__verb + "*" + _obj.id + "*" + _obj.value).remove();
	} else if (_obj.name.startsWith("PlaceWord")) {
		delete placeDictionary["places"][_obj.id][_obj.value];
		document.getElementById(_obj.id + "*" + _obj.value).remove();
	} else if (_obj.name.startsWith("SubjectWord")) {
		var __word = _obj.name.substring(_obj.name.indexOf("*") + 1);
		delete subjectDictionary[_obj.value][_obj.id]["words"][__word];
		document.getElementById('SubjectWord*'+_obj.value + "*" + _obj.id+"*"+__word).remove();
	} else if (_obj.name.startsWith("SubjectPlace")) {
		var __place = _obj.name.substring(_obj.name.indexOf("*") + 1);
		delete subjectDictionary[_obj.value][_obj.id]["place"][__place];
		document.getElementById('SubjectPlace*'+_obj.value + "*" + _obj.id+"*"+__place).remove();
	} else if (_obj.name.startsWith("SubjectVerbs")) {
		var __verbs = _obj.name.substring(_obj.name.indexOf("*") + 1);
		delete subjectDictionary[_obj.value][_obj.id]["verbs"][__verbs];
		document.getElementById('SubjectVerbs*'+_obj.value + "*" + _obj.id+"*"+__verbs).remove();
	}
}
function FindNewListenerID() {
	_newListenerID = 0;
	_gotIt = false;
	for (listener in speechDictionary["listener"]) {	
		if (listener != _newListenerID) {		
			_gotIt = true;
		}
		if(!_gotIt)_newListenerID++;
	}
}
function FindNewEndWordID() {
	_newEndWordID = 0;
	_gotIt = false;
	for (endWord in speechDictionary["end"]) {	
		if (endWord != _newEndWordID) {		
			_gotIt = true;
		}
		if(!_gotIt)_newEndWordID++;
	}
}
function FindNewVerbID(__verbWord) {
	_newVerbID = 0;
	_gotIt = false;
	for (each in speechDictionary["verbs"][__verbWord]["words"]) {
		if (each != _newVerbID) {
			_gotIt = true;
		}
		if(!_gotIt)_newVerbID++;
	}
}
function FindNewConjunctionID(__verbWord,__conjunctionWord) {
	_newConjunctionID = 0;
	_gotIt = false;
	for (each in speechDictionary["verbs"][__verbWord]["conjunctions"][__conjunctionWord]) {
		if (each != _newConjunctionID) {
			_gotIt = true;
		}
		if(!_gotIt)_newConjunctionID++;
	}
}
function FindNewPlaceID(__placeWord) {
	_newPlaceID = 0;
	_gotIt = false;
	for (each in placeDictionary["places"][__placeWord]) {
		if (each != _newPlaceID) {
			_gotIt = true;
		}
		if(!_gotIt)_newPlaceID++;
	}
}
function FindNewSubjectWordID(___type,___element) {
	_newSubjectWordID = 0;
	_gotIt = false;
	for (each in subjectDictionary[___type][___element]["words"]) {
		if (each != _newSubjectWordID) {
			_gotIt = true;
		}
		if(!_gotIt)_newSubjectWordID++;
	}
}
function FindNewSubjectPlaceID(___type,___element) {
	_newSubjectPlaceID = 0;
	_gotIt = false;
	for (each in subjectDictionary[___type][___element]["place"]) {
		if (each != _newSubjectPlaceID) {
			_gotIt = true;
		}
		if(!_gotIt)_newSubjectPlaceID++;
	}
}
function FindNewSubjectVerbsID(___type,___element) {
	_newSubjectVerbsID = 0;
	_gotIt = false;
	for (each in subjectDictionary[___type][___element]["verbs"]) {
		if (each != _newSubjectVerbsID) {
			_gotIt = true;
		}
		if(!_gotIt)_newSubjectVerbsID++;
	}
}
function FindDescription(_type, _number) {
	if (_type == "PCA") {
		return PCA_description[_number];
	} else if (_type == "PCF") {
		return relay_description[_number];
	} else if (_type = "PWM") {
		return fet_description[_number];
	}
}
function ChangePlaceNameInDropdown(_element,_name) {	
	for (type in subjectDictionary){
		for (element in subjectDictionary[type]) {
			if (element != "verbs") {					
				var selectList = document.getElementById('SubjectPlaceElement*' + element + '*' + type);
				for (var i = 0; i < selectList.length;i++) {
					if (selectList.options[i].value == _element) {
						selectList.options[i].text=_element + " - " + _name;
					}
				}
			}
		}
	}
}
function ShowListenerJSON() {
	alert(JSON.stringify(speechDictionary["listener"]));
}
function ShowVerbsJSON() {
	alert(JSON.stringify(speechDictionary["verbs"]["TURN"]));
}
function ShowPlacesJSON() {
	alert(JSON.stringify(placeDictionary["places"]));
}
function ShowJSON() {
	alert(JSON.stringify(subjectDictionary["PCF"]["verbs"]));
}
function Put(_file) {
	if (_file == "speech") {		
		sendXMLHttp("%dict/speech.jsn" + "=" + JSON.stringify(speechDictionary)); 
	} else if (_file == "places") {
		sendXMLHttp("%dict/places.jsn" + "=" + JSON.stringify(placeDictionary));		
	} else if (_file == "subject") {
		sendXMLHttp("%dict/subject.jsn" + "=" + JSON.stringify(subjectDictionary));	
	}	
}
function SaveJSNs() {
	document.getElementById("overlay").style.display = "block";
	subjectDictionaryTXT = JSON.stringify(subjectDictionary);
	subjectDictionaryTXT = subjectDictionaryTXT.replace(',null', "");
	subjectDictionaryTXT = subjectDictionaryTXT.replace('null,', "");
	subjectDictionaryTXT = subjectDictionaryTXT.replace('null', "");
	obj = "%dict/subject.jsn" + "=" + subjectDictionaryTXT;
	sendXMLHttp(obj);	
	
	speechDictionaryTXT = JSON.stringify(speechDictionary);
	speechDictionaryTXT=speechDictionaryTXT.replace(',null', "");
	speechDictionaryTXT=speechDictionaryTXT.replace('null,', "");
	speechDictionaryTXT = speechDictionaryTXT.replace('null', "");
	obj = "%dict/speech.jsn" + "=" + speechDictionaryTXT;
	sendXMLHttp(obj); 
	
	placeDictionaryTXT = JSON.stringify(placeDictionary);
	placeDictionaryTXT = placeDictionaryTXT.replace(',null', "");
	placeDictionaryTXT = placeDictionaryTXT.replace('null,', "");
	placeDictionaryTXT = placeDictionaryTXT.replace('null', "");
	obj = "%dict/places.jsn" + "=" + placeDictionaryTXT;
	sendXMLHttp(obj);	
	document.getElementById("overlay").style.display = "none";
}
// Load JSON text from server hosted file and return JSON parsed object
function loadJSON(filePath) {
	// Load json file;
	var json = loadTextFileAjaxSync(filePath, "application/json");
	// Parse json	
	return JSON.parse(json);
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
