let startedat = new Date();

let pcpdomain = [], wylddomain = [], etdomain = [], swdomain = [], flowdomain = [], rfcwcdomain = [], ifcwcdomain = [];
// let loadingSubdataCompleted = false, loadingRchdataCompleted = false, loadingCwcdataCompleted = false;

let listDates = [];
let monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let isPlay = false, loadingData = false, loadingLayer = false;
let selectedModel = 'gfs', selectedLayer = 'sub', selectedField = 'PRECIPmm', selectedDay = 0, selectedBasincode;
let loadedDataset = {}, loadedLayers = {};
let indiageojson, subgeojson, rchgeojson, cwcgeojson;
let wsopacity = 0.5, nodays = 8

let loadingContainer = document.getElementsByClassName('LoadingContainer')[0];

let subcolor = d3.scaleThreshold()
	.domain([.1, 10, 20, 40, 70, 130, 200])
	.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
let rchcolor = null;
let color = d3.scaleOrdinal().domain([1, 17]).range(colorbrewer.Paired[12]);

var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
let divmapwrap = document.getElementById("mapwrap");
let divleftwrap = document.getElementById("leftwrap");
let divmap = document.getElementsByClassName('map')[0];
//document.getElementById('').getBoundingClientRect()
//let leftwrapbox = document.getElementById('leftwrap').getBoundingClientRect();
let leftwrapbox = divleftwrap.getBoundingClientRect();
divleftwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';
divmapwrap.style.width = (w - leftwrapbox.width) - 15 + 'px';
divmapwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';
//console.log(leftwrapbox);

window.addEventListener("resize", (event) => {
	let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	divleftwrap.style.height = (h - (leftwrapbox.top + 55)) + 'px';
	if ((h - leftwrapbox.top) < 880) {
		divleftwrap.style.overflowY = 'scroll';
	} else {
		divleftwrap.style.overflowY = 'hidden';
	}

	divmapwrap.style.width = (w - (leftwrapbox.width + 15)) + 'px';
	divmapwrap.style.height = (h - (leftwrapbox.top + 55)) + 'px';
	if ((w - 200) > 750) {
		divmap.style.overflowX = 'hidden';
	} else {
		divmap.style.overflowX = 'scroll';
	}
	map.invalidateSize();
});

const OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = new L.Map('mapcon',
	{
		zoomControl: false,
		layers: [OpenStreetMap],
		center: new L.LatLng(20.5937, 78.9629),
		minZoom: 5,
		zoom: 4
	});

//setTimeout(function () { map.invalidateSize() }, 800);

// Loadig description datas
var dscrdata = [];
var descrpt1 = './json/description.txt';
d3.csv(descrpt1, function (error, data) {
	dscrdata = data
});

var FFdscrdata = [];
var descrpt2 = './json/IMD_FF_Description.csv';
d3.csv(descrpt2, function (error, data) {
	FFdscrdata = data;
});

$(".modelRadio").click(function () {
	if (loadingLayer == true) {
		showmessage('Wait layers are loading');

		$("[name=model]").removeAttr("checked");
		if (selectedModel == 'wrf')
			$("[name=model]").filter("[value='wrf']").prop("checked", true);
		else
			$("[name=model]").filter("[value='gfs']").prop("checked", true);

		return;
	}

	map.closePopup();

	if (isPlay == true) {
		isPlay = false;
		document.getElementById("imgplay").src = "./images/play.png";
	}

	var thisValue = $(this).attr("value");
	selectedModel = thisValue;

	if (selectedModel == 'wrf') {
		$("div.d4").hide();
		$("div.d5").hide();
		$("div.d6").hide();
		nodays = 5

		if (selectedDay > 4) {
			selectedDay = 0;
			$("[name=days]").removeAttr("checked");
			$("[name=days]").filter("[value='" + selectedDay + "']").prop("checked", true);
		}

	} else {
		$("div.d4").show();
		$("div.d5").show();
		$("div.d6").show();
		nodays = 8
	}

	loaddata();

	if (document.getElementById('infolegend'))
		document.getElementById('infolegend').style.display = 'none';
	if (document.getElementById('divalert'))
		document.getElementById('divalert').style.display = 'none';

});

$("input:radio[name=days]").click(function () {

	var value = $(this).val();
	selectedDay = Number(value);

	if (isPlay == true || selectedDay > nodays) return;
	if (loadingLayer == true) {
		showmessage('Wait basin is loading');
		return;
	}
	map.closePopup();
	if (selectedLayer != null && selectedField != null) {
		loaddata();
		//addingLayerandData(selectedLayer, selectedField)
	}
});


var highlightStyle = {
	'default': {
		'color': '#ccc'
	},
	'highlight': {
		'color': 'cyan'
	}
};

var highlight;

function setHighlight(layer) {

	if (layer == null) return;

	if (highlight) {
		unsetHighlight(highlight);
	}
	layer.setStyle(highlightStyle.highlight);
	highlight = layer;
}

function unsetHighlight(layer) {
	if (layer == null) return;
	highlight = null;
	layer.setStyle(highlightStyle.default);
}

var addinglayers = false;
function addingLayerandData(prmlayer, fldname) {

	document.getElementById('divalert').style.display = 'none';
	let msgheader = selectedLayer === 'sub' ? 'Subbasin' : 'Stream flow';
	if (loadingLayer == true) {
		loadingContainer.style.display = 'none';
		showmessage('Wait ' + msgheader + ' layer is loading ');
		//$(".LoadingContainer").hide();
		// console.log('display none 5');
		return;
	}
	if (loadingData == true) {
		loadingContainer.style.display = 'none';
		showmessage('Wait ' + msgheader + ' data is loading');
		//$(".LoadingContainer").hide();
		// console.log('display none 5');
		return;
	}
	if (prmlayer === undefined || fldname === undefined || prmlayer == null || fldname == null) {
		loadingContainer.style.display = 'none';
		showmessage('Select Variable')
		//$(".LoadingContainer").hide();
		// console.log('display none 6');
		return;
	}

	if (selectedBasincode === undefined || selectedBasincode === null) {
		loadingContainer.style.display = 'none';
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		// console.log('display none 7');
		return;
	}
	addinglayers = true;

	//$(".LoadingContainer").show();
	getminmax(selectedLayer);
	//console.log(selectedLayer);

	if (selectedLayer === 'sub') {
		if (map.hasLayer(rchgeojson))
			map.removeLayer(rchgeojson);
		if (map.hasLayer(cwcgeojson))
			map.removeLayer(cwcgeojson);
	} else if (selectedLayer === 'rch') {
		if (map.hasLayer(subgeojson))
			map.removeLayer(subgeojson);
		if (map.hasLayer(cwcgeojson))
			map.removeLayer(cwcgeojson);
	} else if (selectedLayer === 'cwc') {
		if (map.hasLayer(subgeojson))
			map.removeLayer(subgeojson);
		if (map.hasLayer(rchgeojson))
			map.removeLayer(rchgeojson);
	}

	var dated = selectedDay <= 1 ? 'Observed Dated : ' : 'Forecast Dated : ';
	if (selectedDay < listDates.length) {

		// console.log([selectedBasincode, selectedModel, selectedLayer, listDates[selectedDay]])
		// console.log(subdata4fndminmax);
		// console.log(cwcdata4fndminmax);

		document.getElementById('ffdate').innerHTML = dated + listDates[selectedDay];
		if (prmlayer === 'sub') {
			if (subgeojson === null || typeof subgeojson === 'undefined' || Object.keys(subgeojson).length == 0) loadSubBasinLayers();
			if (subgeojson === null || typeof subgeojson === 'undefined' || Object.keys(subgeojson).length == 0) return;

			subdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'];

			//console.log([subdata4fndminmax, subdata4fndminmax, Object.keys(subdata4fndminmax).length]);

			if (subdata4fndminmax !== 'error'
				&& subdata4fndminmax !== undefined
				&& Object.keys(subdata4fndminmax).length > 0) {

				// if (fldname == 'PRECIPmm') {
				// 	map.addLayer(rchgeojson);
				// 	rchgeojson.eachLayer(function (layer) {
				// 		layer.setStyle({
				// 			color: "blue",
				// 			fillColor: '#87CEEB',
				// 			weight: 2
				// 		});
				// 	});
				// }

				//console.info("substatus : " + loadingDetails[selectedBasincode]['data']['substatus']);

				if (fldname == 'PRECIPmm')
					subcolor.domain(pcpdomain);
				else if (fldname == 'WYLDmm')
					subcolor.domain(wylddomain);
				else if (fldname == 'ETmm')
					subcolor.domain(etdomain);
				else if (fldname == 'SWmm')
					subcolor.domain(swdomain);

				clrange = subcolor.domain();
				//console.log(clrange)
				if (!map.hasLayer(subgeojson)) {
					map.addLayer(subgeojson);
				}

				subgeojson.eachLayer(function (layer) {

					var datavalue = subdata4fndminmax.filter(function (dv) {
						return dv.Subbasin == layer.feature.properties.Subbasin;
					});

					layer.on('mouseover', function (e) {
						setHighlight(layer);
					});

					layer.on('mouseout', function (e) {
						unsetHighlight(layer);
					});

					var gv = NaN;
					if (datavalue.length > 0) {
						gv = Number(datavalue[0][fldname]);
						layer.feature.properties.name = 'sub';
						layer.feature.properties.value = gv;

						var fillcolor;
						if (gv < clrange[0]) { fillcolor = '#eee'; }
						else if (gv <= clrange[1]) { fillcolor = "#ffff00"; }
						else if (gv < clrange[2]) { fillcolor = "#267300"; }
						else if (gv < clrange[3]) { fillcolor = "#00c5ff"; }
						else if (gv < clrange[4]) { fillcolor = "#004da8"; }
						else if (gv < clrange[5]) { fillcolor = "#FFA500"; }
						else { fillcolor = "#f52525"; }

						layer.setStyle({
							color: "#ccc",
							fillColor: fillcolor, //subcolor(gv),
							fillOpacity: wsopacity,
							weight: 1
						});

						var code = layer.feature.properties.Subbasin;
						var msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Value : ' + Number(gv).toFixed(1) + ' mm</span>';

						layer.bindTooltip(msg, {
							className: 'basintooltip',
							closeButton: false,
							sticky: true,
							offset: L.point(0, -20)
						});
					} else {
						layer.setStyle({
							color: "#ccc",
							fillColor: 'eee', //subcolor(gv),
							fillOpacity: wsopacity,
							weight: 1
						});
					}
				});

				loadlegend('sub')
				//$(".LoadingContainer").hide();
				loadingContainer.style.display = 'none';
				// console.log('display none 8');
			} else {
				// // loaddata();
				// console.log([subdata4fndminmax !== 'error', subdata4fndminmax !== undefined, Object.keys(subdata4fndminmax).length > 0])
				// console.log([subdata4fndminmax, subdata4fndminmax, Object.keys(subdata4fndminmax).length])

				loadingContainer.style.display = 'none';
				// console.log('display none 9');
				// showmessage('No SWAT runs [' + selectedModel + ']');
				console.error("runerror : Subbasin data is not matching criteria")
			}
		}
		else if (prmlayer === 'sub') {
			loaddata();
			loadingContainer.style.display = 'none';
			// console.log('display none 9');
			// showmessage('No SWAT runs [' + selectedModel + ']');
			console.error("runerror : Subbasin data is not matching criteria")
		}

		if (prmlayer === 'rch') {

			if (rchgeojson === null || typeof rchgeojson === 'undefined' || Object.keys(rchgeojson).length == 0) loadSubBasinLayers();
			if (rchgeojson === null || typeof rchgeojson === 'undefined' || Object.keys(rchgeojson).length == 0) return;

			// console.log(loadedDataset[selectedBasincode][selectedModel][selectedLayer]);
			// console.log(loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]);

			rchdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'];
			if (rchdata4fndminmax !== 'error'
				&& rchdata4fndminmax !== undefined
				&& Object.keys(rchdata4fndminmax).length > 0) {

				if (jQuery.isEmptyObject(flowdomain)) {
					getminmax('rch');
				}

				if (jQuery.isEmptyObject(flowdomain)) {
					showmessage('Stream flow is Not downloaded properly please refresh page and run again');
					return;
				}

				// subgeojson.eachLayer(function (layer) {
				// 	layer.unbindTooltip();
				// 	layer.setStyle({
				// 		color: "#ccc",
				// 		fillColor: '#eee',
				// 		//fillOpacity: 0.12,
				// 		weight: 1
				// 	});
				// });

				// map.addLayer(subgeojson);
				if (!map.hasLayer(rchgeojson)) {
					map.addLayer(rchgeojson);
				}

				// var minmax = d3.extent(rchdata[day], function (data) {
				// 	return Number(data[fldname]);
				// });
				// //var min = minmax[0], max = minmax[1];

				rchcolor = d3.scaleThreshold()
					.domain(flowdomain)
					.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
				let clrange = rchcolor.domain();

				rchgeojson.eachLayer(function (layer) {
					let datavalue = rchdata4fndminmax.filter(function (dv) {
						return dv.Subbasin == layer.feature.properties.Subbasin;
					});

					let gv = NaN;
					if (datavalue.length != 0) {
						gv = Number(datavalue[0][fldname]);
						layer.feature.properties.name = 'rch';
						layer.feature.properties.value = gv;

						let weight, fillcolor;
						if (gv < clrange[0]) {
							weight = 0;
							fillcolor = "#ffffff00";
						}
						else if (gv <= clrange[1]) {
							weight = 0.75;
							fillcolor = "#ffff00";
						}
						else if (gv < clrange[2]) {
							weight = 1.5;
							fillcolor = "#267300";
						}
						else if (gv < clrange[3]) {
							weight = 2.25;
							fillcolor = "#00c5ff";
						}
						else if (gv < clrange[4]) {
							weight = 3.25;
							fillcolor = "#004da8";
						}
						else if (gv < clrange[5]) {
							weight = 4.5;
							fillcolor = "#FFA500";
						}
						else {
							weight = 5.5;
							fillcolor = "#f52525";
						}

						layer.setStyle({
							color: fillcolor,
							fillOpacity: wsopacity,
							weight: weight
						});

						var code = layer.feature.properties.Subbasin;
						//var value = feature.properties.value;
						var msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(gv).toFixed(1) + ' cumec</span>';;

						layer.bindTooltip(msg, {
							className: 'basintooltip',
							closeButton: false,
							sticky: true,
							offset: L.point(0, -20)
						});

					} else {//else console.log("Error : " + fm.properties.Subbasin);
						layer.setStyle({
							color: "blue",
							fillColor: '#87CEEB',
							weight: 2
						});
					}

				});
				//if (map.hasLayer(legend))
				//    map.removeLayer(legend);
				loadlegend('rch')
				//$(".LoadingContainer").hide();
				loadingContainer.style.display = 'none';
				// console.log('display none 11');
			} else {
				// loaddata();
				loadingContainer.style.display = 'none';
				// console.log('display none 12');
				// showmessage('No SWAT runs [' + selectedModel + ']');
				console.error("runerror : Reach data is not matching criteria")
			}
		}
		else if (prmlayer === 'rch') {
			loaddata();
			loadingContainer.style.display = 'none';
			// console.log('display none 12');
			// showmessage('No SWAT runs [' + selectedModel + ']');
			console.error("runerror : Reach data is not matching criteria")
		}

		if (prmlayer === 'cwc') {

			if (cwcgeojson === null || typeof cwcgeojson === 'undefined' || Object.keys(cwcgeojson).length == 0) loadSubBasinLayers();
			if (cwcgeojson === null || typeof cwcgeojson === 'undefined' || Object.keys(cwcgeojson).length == 0) return;

			cwcdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer]['data'];
			// console.log(cwcdata4fndminmax);
			if (cwcdata4fndminmax != 'error'
				&& cwcdata4fndminmax != undefined
				&& Object.keys(cwcdata4fndminmax).length > 0) {

				if (!map.hasLayer(cwcgeojson)) {
					map.addLayer(cwcgeojson);
				}

				if (jQuery.isEmptyObject(rfcwcdomain) || jQuery.isEmptyObject(ifcwcdomain)) {
					getminmax('cwc');
				}

				if (jQuery.isEmptyObject(rfcwcdomain) || jQuery.isEmptyObject(ifcwcdomain)) {
					showmessage('CWC flow/Stream are not downloaded properly please refresh page and run again');
					return;
				}

				//Inflow,Rainfall
				if (fldname === "Rainfall")
					subcolor.domain(rfcwcdomain);
				else
					subcolor.domain(ifcwcdomain);

				clrange = subcolor.domain();

				cwcgeojson.eachLayer(function (layer) {
					var datavalue = cwcdata4fndminmax.filter(function (dv) {
						return dv.Subbasin == layer.feature.properties.SUBBASIN;
					});

					var gv = NaN;
					if (datavalue.length != 0) {
						gv = Number(datavalue[selectedDay][fldname]);
						var fillcolor;
						if (gv <= clrange[1]) {
							fillcolor = "#ffff00"
						}
						else if (gv < clrange[2]) {
							fillcolor = "#267300"
						}
						else if (gv < clrange[3]) {
							fillcolor = "#00c5ff"
						}
						else if (gv < clrange[4]) {
							fillcolor = "#004da8"
						}
						else if (gv < clrange[5]) {
							fillcolor = "#FFA500"
						}
						else {
							fillcolor = "#f52525"
						}

						layer.setStyle({
							color: "black",
							weight: 1.2,
							fillColor: fillcolor, //subcolor(gv),
							fillOpacity: wsopacity
						});
					}
					else {
						layer.setStyle({
							color: "darkgray",
							weight: 1
						});
						//console.log(layer.feature.properties.SUBBASIN);
					}
				});
				loadlegend('sub')
				//$(".LoadingContainer").hide();
				loadingContainer.style.display = 'none';
				// console.log('display none 13');
			} else {
				// loaddata();
				loadingContainer.style.display = 'none';
				// console.log('display none 14');
				showmessage('No SWAT runs [' + selectedModel + ']');
				console.error("runerror : CWC data is not matching criteria")
			}
		}
		else if (prmlayer == 'cwc') {
			loaddata();
			loadingContainer.style.display = 'none';
			// showmessage('No SWAT runs [' + selectedModel + ']');
			console.error("runerror : CWC data is not matching criteria")
		}

		if (map.hasLayer(subgeojson)) {
			map.fitBounds(subgeojson.getBounds());
		}
		// curlayer = prmlayer;
		// curfield = fldname;
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		// console.log('display none 15');
	}
	else {
		document.getElementById('ffdate').innerHTML = 'No data available';
	}
	addinglayers = false;
}

function ajaxaddlayers(layer, field) {
	//$(".LoadingContainer").show();
	//if (loadingContainer.style.display === 'none') { loadingContainer.style.display = 'block'; }

	// addinglayers = false;
	// var calladdlayers = 0;

	selectedLayer = layer;
	selectedField = field;

	// console.log(loadedLayers[selectedBasincode]);
	map.closePopup();
	// console.log([selectedLayer, selectedField]);

	loadSubBasinLayers();
	loaddata();

	// var loaderSpin = setInterval(
	// 	function () {
	// 		if (addinglayers == true) {
	// 			//$(".LoadingContainer").hide();
	// 			loadingContainer.style.display = 'none';
	// 			console.log('display none 17');
	// 			clearInterval(loaderSpin);
	// 		}
	// 		if (calladdlayers == 0) {
	// 			calladdlayers++;
	// 			addlayer(selectedLayer, selectedField);
	// 		}
	// 	}, 1000);
}

////**************************************************************** */
function csvJSON(csv) {
	var lines = csv.split("\r\n");
	var result = [];
	var headers = lines[0].split(",");

	for (var i = 1; i < lines.length; i++) {
		if (!lines[i]) continue
		var obj = {};
		var currentline = lines[i].split(",");

		for (var j = 0; j < headers.length; j++) {
			obj[headers[j]] = headers[j] === "Date" ? currentline[j] : Number(currentline[j]);
		}
		result.push(obj);
	}
	return result;
}

function style(feat, i) {
	return {
		color: "white",
		fillColor: color(feat.ind), //color(feat.properties['Basin_Name']), //
		fillOpacity: 0.25,
		weight: 1.5
	}
}
var labelLayerGroup = L.layerGroup().addTo(map);
//var customOptions ={	'className': 'another-popup'};

function getminmax(prm) {
	//console.error( 'Parameter : ' + prm);
	// console.log(Object.keys(subdata).length);
	if (prm === 'sub' || prm === 'all') {
		let subdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer];
		if (subdata4fndminmax !== 'error' && typeof subdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(subdata4fndminmax)) {
			let pcpdatalst = [], wylddatalst = [], etdatalst = [], swdatalst = [];
			for (let s = 0; s < listDates.length; s++) {
				if (typeof subdata4fndminmax[listDates[s]] === 'undefined') continue;
				let tmpdata = subdata4fndminmax[listDates[s]]['data'];
				//console.log(tmpdata)
				if (tmpdata === 'error' || Object.keys(tmpdata).length === 0) continue;

				// console.log(tmpdata);
				// for (const [key, value] of Object.entries(tmpdata)) {
				// 	console.log(`${key}: ${value}`);
				//   }

				// Object.keys(tmpdata).forEach(d => {
				// 	let pcp = Number(tmpdata[d].PRECIPmm);
				// 	let wy = Number(tmpdata[d].WYLDmm);
				// 	let et = Number(d.ETmm);
				// 	let sw = Number(d.SWmm);
				// 	//console.log(wylddatalst.indexOf(wy));
				// 	if (pcp > 0.1 && pcpdatalst.indexOf(pcp) === -1)
				// 		pcpdatalst.push(pcp);
				// 	if (wy > 0.1 && wylddatalst.indexOf(wy) === -1)
				// 		wylddatalst.push(wy);
				// 	if (et > 0.1 && etdatalst.indexOf(wy) === -1)
				// 		etdatalst.push(et);
				// 	if (sw > 0.1 && swdatalst.indexOf(wy) === -1)
				// 		swdatalst.push(sw);
				// });

				tmpdata.map(function (d) {
					let pcp = Number(d.PRECIPmm);
					let wy = Number(d.WYLDmm);
					let et = Number(d.ETmm);
					let sw = Number(d.SWmm);
					//console.log(wylddatalst.indexOf(wy));
					if (pcp > 0.1 && !pcpdatalst.includes(pcp))
						pcpdatalst.push(pcp);
					if (wy > 0.1 && !wylddatalst.includes(wy))
						wylddatalst.push(wy);
					if (et > 0.1 && !etdatalst.includes(wy))
						etdatalst.push(et);
					if (sw > 0.1 && !swdatalst.includes(wy))
						swdatalst.push(sw);
				});
			}
			// console.log(listDates);
			if (pcpdatalst.length == 0) {
				showmessage("[" + selectedBasincode + "] Rainfall Not matching the criteria (0.01>) on " + listDates[selectedDay]);
			} else {

				pcpdatalst = pcpdatalst.map(Number);
				pcpdatalst.sort(function (a, b) {
					return d3.ascending(a, b)
				});

				let min = d3.min(pcpdatalst, function (d) { return Number(d); }).toFixed(2);
				let max = d3.max(pcpdatalst, function (d) { return Number(d); }).toFixed(2);
				let lowestbreak = d3.quantile(pcpdatalst, .1).toFixed(2);
				let lowbreak = d3.quantile(pcpdatalst, .25).toFixed(2);
				let medval = d3.quantile(pcpdatalst, .5).toFixed(2);
				let higbreak = d3.quantile(pcpdatalst, .75).toFixed(2);
				let higestbreak = d3.quantile(pcpdatalst, .9).toFixed(2);

				pcpdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				//console.log(pcpdomain);
			}

			if (wylddatalst.length == 0) {
				showmessage("[" + selectedBasincode + "] Water Yield Not matching the criteria (0.01>) " + listDates[selectedDay]);
			} else {
				//wylddatalst = removeDuplicates(wylddatalst);
				wylddatalst = wylddatalst.map(Number);
				wylddatalst.sort(function (a, b) {
					return d3.ascending(a, b)
				});

				let min = d3.min(wylddatalst, function (d) { return Number(d); }).toFixed(2);
				let max = d3.max(wylddatalst, function (d) { return Number(d); }).toFixed(2);
				let lowestbreak = d3.quantile(wylddatalst, .1).toFixed(2);
				let lowbreak = d3.quantile(wylddatalst, .25).toFixed(2);
				let medval = d3.quantile(wylddatalst, .5).toFixed(2);
				let higbreak = d3.quantile(wylddatalst, .75).toFixed(2);
				let higestbreak = d3.quantile(wylddatalst, .9).toFixed(2);

				wylddomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				//console.log(wylddomain);
			}
			if (etdatalst.length == 0) {
				showmessage("[" + selectedBasincode + "] Evapo-transpiration Not matching the criteria (0.01>) " + listDates[selectedDay]);
			} else {
				//etdatalst = removeDuplicates(etdatalst);
				etdatalst = etdatalst.map(Number);
				etdatalst.sort(function (a, b) {
					return d3.ascending(a, b)
				});

				let min = d3.min(etdatalst, function (d) { return Number(d); }).toFixed(2);
				let max = d3.max(etdatalst, function (d) { return Number(d); }).toFixed(2);
				let lowestbreak = d3.quantile(etdatalst, .1).toFixed(2);
				let lowbreak = d3.quantile(etdatalst, .25).toFixed(2);
				let medval = d3.quantile(etdatalst, .5).toFixed(2);
				let higbreak = d3.quantile(etdatalst, .75).toFixed(2);
				let higestbreak = d3.quantile(etdatalst, .9).toFixed(2);

				etdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				//console.log(etdomain);
			}
			if (swdatalst.length == 0) {
				showmessage("[" + selectedBasincode + "] Soil Moisture status Not matching the criteria (0.01>) " + listDates[selectedDay]);
			} else {
				//swdatalst = removeDuplicates(swdatalst);
				swdatalst = swdatalst.map(Number);
				swdatalst.sort(function (a, b) {
					return d3.ascending(a, b)
				});

				let min = d3.min(swdatalst, function (d) { return Number(d); }).toFixed(2);
				let max = d3.max(swdatalst, function (d) { return Number(d); }).toFixed(2);
				let lowestbreak = d3.quantile(swdatalst, .1).toFixed(2);
				let lowbreak = d3.quantile(swdatalst, .25).toFixed(2);
				let medval = d3.quantile(swdatalst, .5).toFixed(2);
				let higbreak = d3.quantile(swdatalst, .75).toFixed(2);
				let higestbreak = d3.quantile(swdatalst, .9).toFixed(2);

				swdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				//subcolor.domain([Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)]);
				//console.log(swdomain);
			}
			delete subdata4fndminmax;
		} else {
			delete subdata4fndminmax;
		}
	}

	if (prm === 'rch' || prm === 'all') {
		let rchdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer];
		if (rchdata4fndminmax !== 'error' && typeof rchdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(rchdata4fndminmax)) {
			var flowdatalst = [];
			for (var s = 0; s < Object.keys(rchdata4fndminmax).length; s++) {
				if (typeof rchdata4fndminmax[listDates[s]] === 'undefined') continue;
				let tmpdata = rchdata4fndminmax[listDates[s]]['data'];
				//console.log(tmpdata)
				if (tmpdata === 'error') continue;

				//var tmpdata = rchdata4fndminmax[daylst[s]]['data'];
				// console.log(d3.extent(tmpdata, function (d) { 
				// return Number(d.FLOW_OUTcms) > 0.01 ? Number(d.FLOW_OUTcms): null; }));
				tmpdata.map(function (d) {
					if (Number(d.FLOW_OUTcms) > 0.01 && !flowdatalst.includes(Number(d.FLOW_OUTcms))) {
						flowdatalst.push(Number(d.FLOW_OUTcms));
					}
				});
			}

			if (flowdatalst.length > 0) {
				flowdatalst = removeDuplicates(flowdatalst);
				flowdatalst = flowdatalst.map(Number);
				flowdatalst.sort(function (a, b) {
					return d3.ascending(a, b)
				});

				let min = d3.min(flowdatalst, function (d) { return Number(d); }).toFixed(2);
				let max = d3.max(flowdatalst, function (d) { return Number(d); }).toFixed(2);
				let lowestbreak = d3.quantile(flowdatalst, .1).toFixed(2);
				let lowbreak = d3.quantile(flowdatalst, .25).toFixed(2);
				let medval = d3.quantile(flowdatalst, .5).toFixed(2);
				let higbreak = d3.quantile(flowdatalst, .75).toFixed(2);
				let higestbreak = d3.quantile(flowdatalst, .9).toFixed(2);

				// console.log(flowdatalst);
				flowdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				// console.log('rch : ' + flowdomain);
			} else {
				showmessage("[" + selectedBasincode + "] Stream flow status Not matching the criteria (0.01>) " + listDates[selectedDay]);
			}
			delete rchdata4fndminmax
		} else {
			delete rchdata4fndminmax
		}
	}

	if (prm === 'cwc' || prm === 'all') {
		if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer] !== 'undefined') {
			let cwcdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer]['data'];
			//console.log(cwcdata);

			if (cwcdata4fndminmax !== 'error' && typeof cwcdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(cwcdata4fndminmax)) {
				// var dateParse = d3.timeParse("%m/%d/%Y");
				var dateFormat = d3.timeFormat("%d-%b-%Y");
				// var parseTime = d3.timeParse("%d-%b-%y");
				var rfdatalst = [], ifdatalst = [];
				cwcdata4fndminmax.forEach(function (d) {
					d.Date = dateFormat(new Date(d.Date));
					d.Rainfall = +d.Rainfall;
					d.Inflow = +d.Inflow;

					if (!rfdatalst.includes(Number(d.Rainfall))) {
						rfdatalst.push(Number(d.Rainfall));
					}

					if (!ifdatalst.includes(Number(d.Inflow))) {
						ifdatalst.push(Number(d.Inflow));
					}
				});

				if (rfdatalst.length > 0) {
					rfdatalst = removeDuplicates(rfdatalst);
					rfdatalst = rfdatalst.map(Number);
					rfdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});
					//console.log(cwcdata);
					let min = d3.min(rfdatalst, function (d) { return Number(d); }).toFixed(2);
					let max = d3.max(rfdatalst, function (d) { return Number(d); }).toFixed(2);
					let lowestbreak = d3.quantile(rfdatalst, .1).toFixed(2);
					let lowbreak = d3.quantile(rfdatalst, .25).toFixed(2);
					let medval = d3.quantile(rfdatalst, .5).toFixed(2);
					let higbreak = d3.quantile(rfdatalst, .75).toFixed(2);
					let higestbreak = d3.quantile(rfdatalst, .9).toFixed(2);

					rfcwcdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				}
				//******************************************
				if (ifdatalst.length > 0) {
					ifdatalst = removeDuplicates(ifdatalst);
					ifdatalst = ifdatalst.map(Number);
					ifdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					let ifmin = d3.min(ifdatalst, function (d) { return Number(d); }).toFixed(2);
					let ifmax = d3.max(ifdatalst, function (d) { return Number(d); }).toFixed(2);
					let iflowestbreak = d3.quantile(ifdatalst, .1).toFixed(2);
					let iflowbreak = d3.quantile(ifdatalst, .25).toFixed(2);
					let ifmedval = d3.quantile(ifdatalst, .5).toFixed(2);
					let ifhigbreak = d3.quantile(ifdatalst, .75).toFixed(2);
					let ifhigestbreak = d3.quantile(ifdatalst, .9).toFixed(2);

					ifcwcdomain = [Number(ifmin), Number(iflowestbreak), Number(iflowbreak), Number(ifmedval), Number(ifhigbreak), Number(ifhigestbreak), Number(ifmax)];
				}
			};
			delete cwcdata4fndminmax;
		}
	}
	// 	loadingCwcdataCompleted = true;
	// 	let msec = (new Date() - startedat);
	// 	console.log("CWC data completed loading : " + (msec / 1000) + ' Seconds');
	// });
}
function loaddata() {
	//$(".LoadingContainer").show();
	//loadingContainer.style.display = 'block';
	//console.log(loadedDataset)
	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		// console.log('display none 7');
		return;
	}

	//	console.log(loadingContainer.style.display);

	if (loadingContainer.style.display === 'none') { loadingContainer.style.display = 'block'; }

	if (typeof loadedDataset[selectedBasincode][selectedModel] === 'undefined') {
		loadedDataset[selectedBasincode][selectedModel] = { 'sub': {}, 'rch': {}, 'cwc': {}, 'chart': {} };
	}

	//***************** loading datas ******************************
	if (selectedLayer === 'sub' && Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {
		listDates = [];
		readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt?t=' + new Date().getTime(), function (txt) {
			if (txt === "Error404") {
				console.log(txt + ' File not found : ' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt');
				showmessage("Please try later data not available");
			} else if (txt === "Error") {
				console.log(txt + ' Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt');
				showmessage("Please try later data not available");
			} else {
				//if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {}
				let lines = txt.split('\r\n');
				for (let line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {
						let dtstr = lines[line].split("_")[3].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						listDates.push(filedate);

						let url = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': [] };
					}
				}


				if (listDates.length > 2)
					$('#rundate').text("Simulated using " + selectedModel.toUpperCase() + ' on ' + listDates[1]);
				else
					$('#rundate').text('No forecast today');
			}
		});
	}

	if (selectedLayer === 'rch' && (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0)) {
		readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt?t=' + new Date().getTime(), function (txt) {
			if (txt === "Error404") {
				console.log('File not found : ' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt');
				showmessage("Please try later data not available");
			} else if (txt === "Error") {
				console.log('Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt');
				showmessage("Please try later data not available");
			} else {

				//if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) { }
				var lines = txt.split('\r\n');
				for (var line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {
						let dtstr = lines[line].split("_")[3].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						if (!listDates.includes(filedate)) {
							listDates.push(filedate);
						}
						var url = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': [] };
					}
				}

			}
		});
	}

	if (selectedLayer === 'rch' || selectedLayer === 'sub') {
		// let timesRun = 0;
		let dataloadinterval = setInterval(function () {
			// loadedDataset[selectedBasincode][selectedModel][selectedLayer]
			// loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]

			if (listDates.length === 0) return;
			if (typeof listDates[selectedDay] === 'undefined') return;
			if (typeof loadedDataset[selectedBasincode] === 'undefined') return;
			if (typeof loadedDataset[selectedBasincode][selectedModel] === 'undefined') return;
			if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer] === 'undefined') return;
			if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]] === 'undefined') return;

			// timesRun += 1;
			// if(timesRun === 60){
			// 	clearInterval(dataloadinterval);
			// }

			// console.log([loadingData, loadedDataset[selectedBasincode][selectedModel][selectedLayer]])
			// console.log(listDates.length);
			// console.log(selectedDay);
			// console.log(listDates[selectedDay]);
			// console.log([loadingData, loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]])
			// console.log([loadingData, loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'].length])
			clearInterval(dataloadinterval)
			if (loadingData === false && loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'].length === 0) {
				let url = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]].filename;
				// console.log(url);
				// clearInterval(dataloadinterval)
				loadingData = true;
				fetch(url).then(response => {
					if (!response.ok) {
						//clearInterval(dataloadinterval)
						//console.log(response.status);
						loadingContainer.style.display = 'none';
						if (response.status == '404') {
							showmessage('Data is not available for this basin, please try later');
							loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'] = 'File not found';
						}else{
							showmessage('Downloding error, please try later');
						}

						loadingData = false;
						
						throw new Error(`Failed to fetch, status: ${response.status}`);
					}
					return response.text();
				})
					.then(data => {
						// clearInterval(dataloadinterval)
						loadingData = false;
						// console.log(data);
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'] = csvJSON(data);
						// addingLayerandData(selectedLayer, selectedField);

						if (loadingLayer === false && loadingData === false) {
							//console.log('I am calling from here 4')
							addingLayerandData(selectedLayer, selectedField);
						} else {
							let waitforlayersloading = setInterval(function () {
								//console.log([loadingLayer, loadingData])
								//console.log('I am calling from here 5')
								if (loadingLayer === false && loadingData === false) {
									addingLayerandData(selectedLayer, selectedField);
									clearInterval(waitforlayersloading);
								}
							}, 500)
						}
					})
					.catch(error => {
						// clearInterval(dataloadinterval)
						// console.log(url);
						loadingContainer.style.display = 'none';
						console.error('Error message: ', error.message);
						loadingData = false;
						//console.log(loadedDataset[selectedBasincode][selectedModel][selectedLayer]);
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedDay]]['data'] = 'error';

						// if (error instanceof TypeError && error.message.includes('API key')) {
						// 	console.error('Invalid API key:', error);
						// } else {
						// 	console.error('There was a problem with the Fetch operation:', error);
						// }

					});
			} else {
				// clearInterval(dataloadinterval)
				if (listDates.length === 0) {
					Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).forEach((date) => listDates[date]);
				}
				//console.log('I am calling from here')
				addingLayerandData(selectedLayer, selectedField);
			}
		}, 1000)
	}

	if (selectedLayer === 'cwc' && (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0)) {
		readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt?t=' + new Date().getTime(), function (txt) {
			if (txt === "Error404") {
				showmessage("Please try later data not available");
				console.log('File not found : ' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt');
			} else if (txt === "Error") {
				showmessage("Please try later data not available");
				console.log('Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt');
			} else {
				//if (typeof (loadedDataset[basincode][modelname][selectedLayer]) === 'undefined') {
				// if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {
				var lines = txt.split('\r\n');
				listDates = [];
				for (var line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {

						let dtstr = lines[line].split("_")[2].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						// if (!listDates.includes(filedate)) {
						// 	listDates.push(filedate);
						// }

						var flname = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();

						let url = flname;
						(function (url, dtstr, filedate) {
							fetch(url).then(response => {
								if (!response.ok) {
									throw new Error(`Failed to fetch, status: ${response.status}`);
								}
								return response.text();
							})
								.then(data => {
									loadedDataset[selectedBasincode][selectedModel][selectedLayer] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': csvJSON(data) };
									if (listDates.length === 0) {
										loadedDataset[selectedBasincode][selectedModel][selectedLayer]['data'].forEach(function (dat) {
											// if (!listDates.includes(dat.Date)) {
											// 	listDates.push(dat.Date);
											// }
											let dtstr = dat.Date.split("/");
											let filedate = dtstr[1] + '-' + monthName[Number(dtstr[0]) - 1] + '-' + dtstr[2];
											if (!listDates.includes(filedate)) {
												listDates.push(filedate);
											}
										})
									}
									// console.log(listDates);
									console.log('I am calling from here 1 ')
									addingLayerandData(selectedLayer, selectedField);
								})
								.catch(error => {
									console.error('Error message:', error.message);
									loadedDataset[selectedBasincode][selectedModel][selectedLayer] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': 'error' };

								})
						})(url, dtstr, filedate)
					}
				}
				// }
			}
		});
	} else if (selectedLayer === 'cwc') {
		//console.log('I am calling from here 2')
		addingLayerandData(selectedLayer, selectedField);
	}

	if (Object.keys(loadedDataset[selectedBasincode][selectedModel]['chart']).length === 0) {
		loadedDataset[selectedBasincode][selectedModel]['chart'] = {};
		d3.csv('./data/' + selectedModel + '/' + selectedBasincode + '_IMD-' + selectedModel + '_PCP_chart.csv?t=' + new Date().getTime(), function (error, data) {
			if (error) {
				if (error.currentTarget.status === 404) {
					console.error("Chart data : " + error.currentTarget.statusText + "" + selectedModel + '/' + selectedBasincode + '_IMD-' + selectedModel + '_PCP_chart.csv');
				} else {
					// console.error("Chart data : " + error);
					console.error('Error message:', error.message);
				}
				// loadingDetails[selectedBasincode]['data']['chartstatus'] = 'error';
			} else if (typeof (data) !== "undefined") {
				// loadingDetails[selectedBasincode]['data']['chartstatus'] = 'downloaded';

				let chartdata = data.slice(0);
				// var dateParse = d3.timeParse("%m/%d/%Y");
				var dateFormat = d3.timeFormat("%d-%b-%Y");
				// var parseTime = d3.timeParse("%d-%b-%y");
				chartdata.forEach(function (d) {
					d.Date = dateFormat(new Date(d.Date));
					d.Rainfall = +d.Rainfall;
					d.Inflow = +d.Inflow;
				});

				loadedDataset[selectedBasincode][selectedModel]['chart'] = chartdata;

				let msec = (new Date() - startedat);
				console.log("Chart data completed loading : " + (msec / 1000) + ' Seconds');
			}
			//console.log(data);
		});
	}
}

function onEachCWCbasinLayer(feature, layer) {
	layer.bindTooltip('CWC : ' + feature.properties['Name'], {
		className: 'basintooltip',
		closeButton: false,
		sticky: true,
		offset: L.point(0, -20)
	});
}
function loadSubBasinLayers() {
	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 7');
		return;
	}
	var rchurl = 'json/reach/' + selectedBasincode + '.json?t=' + new Date().getTime();
	var suburl = 'json/watershed/' + selectedBasincode + '.json?t=' + new Date().getTime();
	var cwcurl = 'json/CWC_basin/' + selectedBasincode + '.json?t=' + new Date().getTime();

	loadingLayer = false;
	if (isPlay == true) {
		playwatershed();
	}


	if ((typeof loadedLayers[selectedBasincode][selectedLayer] === 'undefined' || loadedLayers[selectedBasincode][selectedLayer] === 'error') && selectedLayer === 'cwc') {
		loadingLayer = true;
		// loadedLayers[selectedBasincode] = {};
		cwcgeojson = [];
		$.getJSON(cwcurl)
			.done(function (data) {
				//console.log('Success: ', data);
				var objname = Object.keys(data.objects)[0];
				cwcTopoJson = topojson.feature(data, data.objects[objname])
				cwcgeojson = L.geoJson(cwcTopoJson, {
					style: {
						color: "darkgray",
						weight: 1
					}
					, onEachFeature: onEachCWCbasinLayer
				}).bindPopup(chart_new).addTo(map);
				//cwcload = true;
				// loadingDetails[selectedBasincode]['layer']['cwcstatus'] = 'downloaded';
				loadedLayers[selectedBasincode][selectedLayer] = cwcgeojson;

				// delete cwcgeojson;
				delete cwcTopoJson;
				loadingLayer = false;

				let msec = (new Date() - startedat);
				console.log("CWC json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				// loadingDetails[selectedBasincode]['layer']['cwcstatus'] = 'error';
				loadingLayer = false;
				loadedLayers[selectedBasincode][selectedLayer] = 'error'; //'Error: ' +  textStatus + ' ' + errorThrown;
				showmessage("Please check your internet speed, layers are not loaded")
			});
	} else if (selectedLayer === 'cwc') {
		if (!map.hasLayer(cwcgeojson)) {
			cwcgeojson = loadedLayers[selectedBasincode][selectedLayer];
			map.addLayer(cwcgeojson)
		}

		// subgeojson = loadedLayers[basincode][selectedLayer];
		// rchgeojson = loadedLayers[basincode][selectedLayer];

		// if (!map.hasLayer(subgeojson)) {
		// 	map.addLayer(subgeojson)
		// }
		// if (!map.hasLayer(rchgeojson)) {
		// 	map.addLayer(rchgeojson)
		// }
	}
	if ((typeof loadedLayers[selectedBasincode][selectedLayer] === 'undefined' || loadedLayers[selectedBasincode][selectedLayer] === 'error') && selectedLayer === 'sub') {
		loadingLayer = true;
		subgeojson = [];
		$.getJSON(suburl)
			.done(function (data) {
				//console.log('Success: ', data);
				var objname = Object.keys(data.objects)[0];
				subTopoJson = topojson.feature(data, data.objects[objname])
				subgeojson = L.geoJson(subTopoJson, {
					style: {
						color: "darkgray",
						fillColor: "red",
						fillOpacity: 0.001,
						weight: 1
					}
				}).bindPopup(chart_subbasin).addTo(map);
				//subload = true;
				// loadingDetails[selectedBasincode]['layer']['substatus'] = 'downloaded';
				loadedLayers[selectedBasincode][selectedLayer] = subgeojson;

				// delete subgeojson;
				delete subTopoJson;
				loadingLayer = false;
				let msec = (new Date() - startedat);
				console.log("Subbasin json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				// loadingDetails[selectedBasincode]['layer']['substatus'] = 'error';
				loadingLayer = false;
				loadedLayers[selectedBasincode][selectedLayer] = 'error';
				showmessage("Layers are not loaded, please try later")
			});
	} else if (selectedLayer === 'sub') {

		if (!map.hasLayer(subgeojson)) {
			subgeojson = loadedLayers[selectedBasincode][selectedLayer];
			map.addLayer(subgeojson)
		}

		// cwcgeojson = loadedLayers[basincode][selectedLayer];
		// rchgeojson = loadedLayers[basincode][selectedLayer];
		// if (!map.hasLayer(rchgeojson)) {
		// 	map.addLayer(rchgeojson)
		// }
	}
	if ((typeof loadedLayers[selectedBasincode][selectedLayer] === 'undefined' || loadedLayers[selectedBasincode][selectedLayer] === 'error') && selectedLayer === 'rch') {
		loadingLayer = true;
		rchgeojson = [];
		$.getJSON(rchurl)
			.done(function (data) {
				//console.log('Success: ', data);
				var objname = Object.keys(data.objects)[0];
				rchTopoJson = topojson.feature(data, data.objects[objname])
				rchgeojson = L.geoJson(rchTopoJson, {
					style: {
						color: "blue",
						weight: 1
					}
				}).bindPopup(chart_subbasin).addTo(map);
				//rchload = true;
				// loadingDetails[selectedBasincode]['layer']['rchstatus'] = 'downloaded';
				loadedLayers[selectedBasincode][selectedLayer] = rchgeojson;

				// delete rchgeojson;
				delete rchTopoJson;
				loadingLayer = false;
				let msec = (new Date() - startedat);
				console.log("Reach json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				// loadingDetails[selectedBasincode]['layer']['rchstatus'] = 'error';
				loadingLayer = false;
				loadedLayers[selectedBasincode][selectedLayer] = 'error';
				showmessage("Layers are not loaded, please try later");
			});
	} else if (selectedLayer === 'rch') {
		if (!map.hasLayer(rchgeojson)) {
			rchgeojson = loadedLayers[selectedBasincode][selectedLayer];
			map.addLayer(rchgeojson)
		}

		// cwcgeojson = loadedLayers[basincode][selectedLayer];
		// subgeojson = loadedLayers[basincode][selectedLayer];
		// if (!map.hasLayer(subgeojson)) {
		// 	map.addLayer(subgeojson)
		// }
	}
}

function loadBasin(e) {

	console.clear();

	startedat = new Date();
	document.getElementById('divalert').style.display = 'none';
	if (selectedBasincode === e.target.feature.properties.Code) return;

	if (loadingLayer == true) {
		showmessage('Wait basin is loading');
		return;
	}

	map.fitBounds(e.target.getBounds());
	// $(".LoadingContainer").show();
	if (loadingContainer.style.display === 'none' || loadingContainer.style.display === '') { loadingContainer.style.display = 'block'; }
	//loadingContainer.style.display = 'block';
	//console.log(loadingContainer);

	selectedBasincode = e.target.feature.properties.Code;
	var Basin_Name = e.target.feature.properties.Basin_Name;
	//***************** loading layers ******************************

	removelayer();
	labelLayerGroup.clearLayers();

	L.marker(e.target.getBounds().getCenter(), {
		icon: L.divIcon({
			className: 'label',
			html: e.target.feature.properties.Basin_Name,
			iconSize: [100, 25]
		})
	}).addTo(labelLayerGroup);

	if (typeof loadedLayers[selectedBasincode] === 'undefined') {
		loadedLayers[selectedBasincode] = {};
	}
	loadSubBasinLayers();
	//console.log(loadingDetails)
	//***************** End loading layers ******************************

	if (typeof loadedDataset[selectedBasincode] === 'undefined') {
		loadedDataset[selectedBasincode] = {};
	}
	loaddata();

	let boolshowmessage = true, totalminutes = 1;
	var loaderinterval = setInterval(
		function () {
			if (typeof loadedLayers[selectedBasincode][selectedLayer] !== 'undefined' && Object.keys(loadedLayers[selectedBasincode][selectedLayer]).length > 0) {
				console.log('Loading layers are completed');
				//$(".LoadingContainer").hide();
				// loadingContainer.style.display = 'none';
				// clearInterval(loaderinterval);
				loadingLayer = false;
			} else {
				let msec = (new Date() - startedat);
				console.log("Loading approx minutes : " + (msec / 60000));
				if ((msec / 60000) > totalminutes && boolshowmessage === true) {
					showmessage("www.inrm.co.in took too long to respond.")
					totalminutes++;
					// boolshowmessage = false;
				}
			}

			if (loadingLayer === false && loadingData === false) {
				loadingContainer.style.display = 'none';
				clearInterval(loaderinterval);
			}

		}, 1000);
}

function onEachBasinLayer(feature, layer) {
	//basincode = feature.properties.Code;
	layer.bindTooltip(feature.properties['Basin_Name'], {
		className: 'basintooltip',
		closeButton: false,
		sticky: true,
		offset: L.point(0, -20)
	});

	layer.on({
		click: loadBasin
	})
}

var indiaurl = "./json/AllBasin_WGS84_01.json"
$.getJSON(indiaurl, function (data) {

	var objname = Object.keys(data.objects)[0];
	var indiaTopoJson = topojson.feature(data, data.objects[objname])
	indiaTopoJson.features = indiaTopoJson.features.map(function (fm, i) {
		var ret = fm;
		ret.ind = i;
		return ret
	});
	indiageojson = L.geoJson(indiaTopoJson, {
		style: style
		, onEachFeature: onEachBasinLayer
	}).addTo(map)
	if (map.hasLayer(indiageojson)) {
		map.fitBounds(indiageojson.getBounds())
	}
});

function descripttable(data, columns, tableObj, tableheader) {
	var tbody = tableObj.append('tbody');

	if (tableheader === true) {
		var thead = tableObj.append('thead')
		thead.append('tr')
			.selectAll('th')
			.data(columns).enter()
			.append('th')
			.text(function (column) {
				if (column == 'Inflow')
					return 'Discharge'
				return column;
			});
	}

	var rows = tbody.selectAll('tr')
		.data(data)
		.enter()
		.append('tr');

	var cells = rows.selectAll('td')
		.data(function (row) {
			return columns.map(function (column) {
				return { column: column, value: row[column] };
			});
		})
		.enter()
		.append('td')
		.style("border-left", function (d) {
			if (tableheader === true)
				return "1px solid #ccc";
			else
				return "none";
		})
		.style("text-align", function (d) {
			if (d.column === '%Wshed Area' || d.column === 'Area [ha]')
				return 'right';
			else
				return 'left';
		})
		.text(function (d) { return d.value; });

	return tableObj;
}


// var models = L.control({ position: 'topleft' });
// models.onAdd = function (map) {
// 	var div = L.DomUtil.create('div', 'info');
// 	div.innerHTML += '<h3 id="imdmodel">IMD NWP Rainfall</h3>';
// 	div.innerHTML += '<div title="Select forecast model" ><input type="radio" class="modelRadio" name="model" value="gfs" checked ><label class="lblmdl">IMD-GFS</label>&nbsp;<input type="radio" class="modelRadio" name="model" value="wrf"><label class="lblmdl">IMD-WRF</label></div>';
// 	return div;
// };
// models.addTo(map);

// // Day selection
// var dayselect = L.control({ position: 'topleft' });
// dayselect.onAdd = function (map) {
// 	var div = L.DomUtil.create('div', 'info divday');
// 	div.innerHTML += '<div class="d-" title="Observed Day 1"><input type="radio" name="days" value="0" checked="checked" />Obs 1</div>';
// 	div.innerHTML += '<div class="d0" title="Observed Day 2"><input type="radio" name="days" value="1" />Obs 2</div>';
// 	div.innerHTML += '<div class="d1" title="Forecast Day 1"><input type="radio" name="days" value="2" />For 1</div>';
// 	div.innerHTML += '<div class="d2" title="Forecast Day 2"><input type="radio" name="days" value="3" />For 2</div>';
// 	div.innerHTML += '<div class="d3" title="Forecast Day 3"><input type="radio" name="days" value="4" />For 3</div>';
// 	div.innerHTML += '<div class="d4" title="Forecast Day 4"><input type="radio" name="days" value="5" />For 4</div>';
// 	div.innerHTML += '<div class="d5" title="Forecast Day 5"><input type="radio" name="days" value="6" />For 5</div>';
// 	div.innerHTML += '<div class="d6" title="Forecast Day 6"><input type="radio" name="days" value="7" />For 6</div>';
// 	return div;
// };
// dayselect.addTo(map);

// // Play Button
// var dayplaybutton = L.control({ position: 'topleft' });
// dayplaybutton.onAdd = function (map) {
// 	var div = L.DomUtil.create('div');
// 	div.innerHTML = '<div class="info" ><a href="#" id="play" class="myButton" onclick="playwatershed()" title="Animate"><img src="./images/play.png" id="imgplay" height="30" width="30" alt="Animate" /></a></div>';
// 	return div;
// };
// dayplaybutton.addTo(map);

// Displayaing date
var date = new Date();
var ctrlDate = L.control({ position: 'bottomleft' });
ctrlDate.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="ffdate" style="padding:5px;"> ' + date.getDate() + '-' + monthName[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
	return div;
};
ctrlDate.addTo(map);

function playwatershed() {

	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 2');
		return;
	}

	//console.log([curfield, curfield]);

	document.getElementById('divalert').style.display = 'none';
	if (selectedField === undefined || selectedField == null) {
		showmessage('Select variable');
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 3');
		return;
	}

	if (isPlay == true) {
		document.getElementById("imgplay").src = "./images/play.png";
		isPlay = false;
	} else {
		isPlay = true;
		document.getElementById("imgplay").src = "./images/pause.png";
	}
	if (selectedModel == 'wrf')
		nodays = 5;
	else
		nodays = 8;

	var myVar = setInterval(
		function () {
			if (isPlay == false) {
				clearInterval(myVar);
			} else {

				selectedDay++;
				if (selectedDay >= nodays) selectedDay = 0;

				$("[name=days]").removeAttr("checked");
				var presetValue = selectedDay;
				$("[name=days]").filter("[value='" + presetValue + "']").prop("checked", true);

				//ajaxaddlayers(curlayer, curfield);
				console.log('I am calling from here 3')
				addingLayerandData(selectedLayer, selectedField);
			}
		}, 3000);
}

L.control.zoom({
	position: 'topright'
}).addTo(map);

function osmenable(obj) {
	if (obj.checked == false) {
		if (map.hasLayer(OpenStreetMap))
			map.removeLayer(OpenStreetMap)
	}
	else {
		if (!map.hasLayer(OpenStreetMap))
			map.addLayer(OpenStreetMap)
	}
}

var osmVisible = L.control({ position: 'topright' });
osmVisible.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info');
	div.innerHTML = '<input type="checkbox" value="1" checked="checked" name="osmEnable" onclick="osmenable(this)" /> OSM <br />';
	return div;
};
osmVisible.addTo(map);

function checkopacity(obj) {
	var value = obj.value;
	if (obj.checked == true)
		wsopacity = Number(value);
	else
		wsopacity = 0.5;

	ajaxaddlayers(selectedLayer, selectedField);
}

var ctrlOpacity = L.control({ position: 'bottomright' });
ctrlOpacity.onAdd = function (map) {
	var div = L.DomUtil.create('div', '');
	div.innerHTML = '<input type="checkbox" value="1" name="opacity" onclick="checkopacity(this)" /> Solid fill <br />';
	return div;
};
ctrlOpacity.addTo(map);

var legend = L.control({ position: 'bottomright' });
function loadlegend(prm) {
	if (isPlay == true) return;

	if (map.hasLayer(legend))
		map.removeLayer(legend);

	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		if (prm == 'sub') {
			var subclr = subcolor.range(),
				grades = subcolor.domain();

			// console.log(subclr);
			// console.log(grades);

			labels = ['<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Subbasin Value (mm/day) </strong><br /><br />'];
			div.innerHTML = labels;

			for (var i = 0; i < grades.length - 1; i++) {
				div.innerHTML +=
					'<i style="background:' + subclr[i] + '"></i> ' +
					grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
			}
		} else {
			div.innerHTML = '<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Stream Flow (cms) </strong><br /><br />';
			var dmn = rchcolor.domain();
			var clr = rchcolor.range();

			// console.log(dmn);
			// console.log(clr);

			for (var i = 0; i < dmn.length - 1; i++) {
				div.innerHTML +=
					'<i style="background:' + clr[i] + '"></i> ' +
					dmn[i] + (dmn[i + 1] ? '&ndash;' + dmn[i + 1] + '<br>' : '+');
			}
		}
		div.id = "infolegend"
		return div;
	};
	legend.addTo(map);
	//document.getElementById("info legend").style.display = "none";
}
function showhideLegend() {
	if (document.getElementById("infolegend")) {
		if ($("div#infolegend:hidden").length) {
			document.getElementById("infolegend").style.display = "block";
		} else {
			document.getElementById("infolegend").style.display = "none";
		}
	}
}
function showDisclaimer() {
	if (document.getElementById("infolegend")) {
		document.getElementById("infolegend").style.display = "block";
	}
}

function hideDisclaimer() {
	if (document.getElementById("infolegend")) {
		document.getElementById("infolegend").style.display = "none";
	}
}

var showlegend = L.control({ position: 'bottomright' });
showlegend.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info');
	div.innerHTML = "<span style='font-weight:bold;cursor:pointer;' title='Click to show/hide legend'>+/- Legend</span>";
	//div.setAttribute("onmouseenter", "showDisclaimer()");
	//div.setAttribute("onmouseleave", "hideDisclaimer()");
	//div.setAttribute("onmouseover", "legendMouseOver()");
	div.setAttribute("onclick", "showhideLegend()");
	return div;
};
showlegend.addTo(map)

function tabulate(data, columns) {
	var table = d3.create('div').append('table').attr("width", "100%")
	var thead = table.append('thead')
	var tbody = table.append('tbody');

	thead.append('tr')
		.selectAll('th')
		.data(columns).enter()
		.append('th')
		.text(function (column) {
			if (column == "Inflow")
				return column + "(cumec)";
			else if (column == "Rainfall")
				return column + "(mm)";
			else
				return column;
		});

	var rows = tbody.selectAll('tr')
		.data(data)
		.enter()
		.append('tr');

	var cells = rows.selectAll('td')
		.data(function (row) {
			return columns.map(function (column) {
				return { column: column, value: row[column] };
			});
		})
		.enter()
		.append('td')
		.text(function (d) { return d.value; });

	return table;
}
function chart_new(d) {
	if (isPlay == true) return;
	var feature = d.feature;
	var code = feature.properties.SUBBASIN;
	var basename = feature.properties.Name;

	//console.log([code, basename]);
	//console.log(cwcdata)
	//cwcdata = loadedDataset[basincode][modelname][selectedLayer]['data'];
	if (cwcdata4fndminmax == null || cwcdata4fndminmax == undefined) return '<h3>No data</h3>';
	else if (cwcdata4fndminmax.length < 1) return '<h3>No data</h3>';

	var data = cwcdata4fndminmax.filter(function (dv) {
		return dv.Subbasin == code;
	});

	if (data.length < 1 || data == null || data == undefined) return '<h3>No data</h3>';

	var newobj = d3.create('div')
		.attr("class", "tabs")
	newobj.append('div')
		.attr("id", "tab-1")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-2")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-3")
		.attr("class", "tab")
	newobj.selectAll(".tab")
		.append('div')
		.attr("class", "content")
		.attr("id", function (d, i) {
			return "content" + i;
		})

	newobj.append('div')
		.attr("id", "lableheader")
		.append('span').text(basename)

	newobj.append('div')
		.attr("id", "imdheader")
		.append('span').text('NWP Rainfall Forecast by India Meteorological Department')

	var ulobj = newobj.append('ul')
		.attr("class", "tabs-link")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-1")
		.append('span')
		.text("Chart")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-2")
		.append('span')
		.text("Table")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-3")
		.append('span')
		.text("Description")

	//******************************* Vertical Chart ************************
	var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

	var margin = { left: 50, right: 50, top: 30, bottom: 50 },
		width = 375 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	var divchart = newobj.select("#content0")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)

	var xBar = d3.scaleBand().range([0, width]).paddingInner(0.5).paddingOuter(0.25);
	var xLine = d3.scalePoint().range([0, width]).padding(0.5);
	var yBar = d3.scaleLinear().range([0, height]);
	var yLine = d3.scaleLinear().range([height, 0]);

	var valueline = d3.line()
		.x(function (d) {
			return xLine(d.Date);
		})
		.y(function (d) {
			return yLine(d.Inflow);
		});

	////====================== chart ========================
	var svg = divchart.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	xBar.domain(data.map(function (d) { return d.Date; }));
	xLine.domain(data.map(function (d) { return d.Date; }));
	yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), Number(d3.max(data, function (d) { return d.Rainfall; })) * 1.25]).nice();
	yLine.domain([d3.min(data, function (d) { return d.Inflow; }), d3.max(data, function (d) { return d.Inflow; })]).nice();


	//********************* gridlines ******************
	// gridlines in x axis function
	function make_x_gridlines() {
		return d3.axisBottom(xBar)
			.ticks(7)
	}

	// gridlines in y axis function
	function make_y_gridlines() {
		return d3.axisLeft(yBar)
			.ticks(5)
	}

	// add the X gridlines
	svg.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_gridlines()
			.tickSize(-height)
			.tickFormat("")
		)

	// add the Y gridlines
	svg.append("g")
		.attr("class", "grid")
		.call(make_y_gridlines()
			.tickSize(-width)
			.tickFormat("")
		)

	//***************************************
	var rect = svg.selectAll("rect")
		.data(data)

	rect.enter().append("rect")
		.merge(rect)
		.attr("class", "bar")
		.style("stroke", "none")
		.style("fill", function (d, i) {
			if (i <= 1)
				return "orange";
			return "steelblue";
		})
		.attr("x", function (d) { return xBar(d.Date); })
		.attr("width", function (d) { return xBar.bandwidth(); })
		.attr("height", function (d) {
			return yBar(d.Rainfall);
		}).on("mouseover", function (d, i) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");
			divtooltip.style("display", "inline-block");

			if (i <= 1) {
				divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
			} else {
				divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
			}
		}).on("mousemove", function (d, i) {

			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			if (i <= 1) {
				divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
			} else {
				divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
			}
		}).on("mouseout", function (d) {
			divtooltip.style("display", "none");
		});

	// Add the valueline path.
	svg.append("path")
		.attr("class", "line")
		.style("stroke", "red")
		.attr("d", valueline(data));

	var points1 = svg.selectAll("circle.point1").data(data)
	points1.enter().append("circle")
		.merge(points1)
		.attr("class", "point1")
		.style("stroke", "red")
		.style("fill", "white")
		.style("stroke-width", 2)
		.attr("cx", function (d) {
			return xLine(d.Date);
		})
		.attr("cy", function (d) {
			return yLine(d.Inflow);
		})
		.attr("r", function (d) { return 3; })
		.on("mouseover", function (d) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
		})
		.on("mousemove", function (d) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
		})
		.on("mouseout", function (d) {
			divtooltip.style("display", "none");
		});

	svg.append("g")
		.attr("transform", "translate(0,0)")
		.call(d3.axisTop(xLine))
		.selectAll("text")
		.remove()
		;

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xLine)) //.tickSize(-height)
		.selectAll("text")
		.attr("x", "-25")
		.attr("y", "5")
		.attr("transform", "rotate(-30)")
		.style("font-family", "sans-serif")
		.style("font-size", "9px");

	// Add the Y0 Axis
	svg.append("g")
		.attr("class", "axisSteelBlue")
		.call(d3.axisLeft(yBar));

	// Add the Y1 Axis
	svg.append("g")
		.attr("class", "axisRed")
		.attr("transform", "translate( " + width + ", 0 )")
		.call(d3.axisRight(yLine));//.tickSize(-width)

	svg.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", -80)
		.attr("y", -35)
		.attr("style", "font-size:8pt;fill:steelblue;")
		//.attr("dy", ".75em")
		.attr("transform", "rotate(-90)")
		.text('Rainfall (mm)');

	svg.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", -65)
		.attr("y", width + margin.left)
		.attr("style", "font-size:8pt;fill:red;")
		.attr("transform", "rotate(-90)")
		.text('Discharge (cumec)');

	var tbdatobj = newobj.select("#content1").append('table').attr("width", "100%")
	var tablecontent = descripttable(data, ['Date', 'Inflow', 'Rainfall'], tbdatobj, true);

	var tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var desctable = descripttable(dscrdata, ['Code', selectedBasincode], tbdescobj, false);

	var dscrdatavalue = FFdscrdata.filter(function (dv) {
		return dv.Basin == selectedBasincode;
	});
	tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var FFdesctable = descripttable(dscrdatavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], tbdescobj, true);

	return newobj.node();
}

function chart_subbasin(d) {
	if (isPlay == true) return;
	if (selectedField !== 'PRECIPmm' && selectedField !== 'FLOW_OUTcms') return;

	var feature = d.feature;
	var code = feature.properties.Subbasin;

	let chartdata = loadedDataset[selectedBasincode][selectedModel]['chart']
	var data = chartdata.filter(function (dv) {
		return dv.Subbasin == code;
	});

	if (data.length < 1 || data == null || data == undefined) return '<h3>No data</h3>';

	var newobj = d3.create('div')
		.attr("class", "tabs")
	newobj.append('div')
		.attr("id", "tab-1")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-2")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-3")
		.attr("class", "tab")
	newobj.selectAll(".tab")
		.append('div')
		.attr("class", "content")
		.attr("id", function (d, i) {
			return "content" + i;
		})
	newobj.append('div')
		.attr("id", "lableheader")
		.append('span')
		.text('Subbasin : ' + code)

	newobj.append('div')
		.attr("id", "imdheader")
		.append('span').text('NWP Rainfall Forecast by India Meteorological Department')

	var ulobj = newobj.append('ul')
		.attr("class", "tabs-link")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-1")
		.append('span')
		.text("Chart")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-2")
		.append('span')
		.text("Table")
	ulobj.append('li')
		.attr("class", "tab-link")
		.append('a').attr("href", "#tab-3")
		.append('span')
		.text("Description")

	//******************************* Vertical Chart ************************
	var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

	var margin = { left: 50, right: 50, top: 30, bottom: 50 },
		width = 375 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;

	var divchart = newobj.select("#content0")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)

	var xBar = d3.scaleBand().range([0, width]).paddingInner(0.5).paddingOuter(0.25);
	var xLine = d3.scalePoint().range([0, width]).padding(0.5);
	var yBar = d3.scaleLinear().range([0, height]);
	var yLine = d3.scaleLinear().range([height, 0]);

	var valueline = d3.line()
		.x(function (d) {
			return xLine(d.Date);
		})
		.y(function (d) {
			return yLine(d.Inflow);
		});

	////====================== chart ========================
	var svg = divchart.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	// Scale the range of the data
	xBar.domain(data.map(function (d) { return d.Date; }));
	xLine.domain(data.map(function (d) { return d.Date; }));
	yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), Number(d3.max(data, function (d) { return d.Rainfall; })) * 1.25]).nice();
	yLine.domain([d3.min(data, function (d) { return d.Inflow; }), d3.max(data, function (d) { return d.Inflow; })]).nice();


	//********************* gridlines ******************
	// gridlines in x axis function
	function make_x_gridlines() {
		return d3.axisBottom(xBar)
			.ticks(7)
	}

	// gridlines in y axis function
	function make_y_gridlines() {
		return d3.axisLeft(yBar)
			.ticks(5)
	}

	// add the X gridlines
	svg.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_gridlines()
			.tickSize(-height)
			.tickFormat("")
		)

	// add the Y gridlines
	svg.append("g")
		.attr("class", "grid")
		.call(make_y_gridlines()
			.tickSize(-width)
			.tickFormat("")
		)

	//***************************************
	var rect = svg.selectAll("rect")
		.data(data)

	rect.enter().append("rect")
		.merge(rect)
		.attr("class", "bar")
		.style("stroke", "none")
		.style("fill", function (d, i) {
			if (i <= 1)
				return "orange";
			return "steelblue";
		})
		.attr("x", function (d) { return xBar(d.Date); })
		.attr("width", function (d) { return xBar.bandwidth(); })
		.attr("height", function (d) {
			return yBar(d.Rainfall);
		}).on("mouseover", function (d, i) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");
			divtooltip.style("display", "inline-block");

			if (i <= 1) {
				divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
			} else {
				divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
			}
		}).on("mousemove", function (d, i) {

			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			if (i <= 1) {
				divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
			} else {
				divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
			}
		}).on("mouseout", function (d) {
			divtooltip.style("display", "none");
		});

	// Add the valueline path.
	svg.append("path")
		.attr("class", "line")
		.style("stroke", "red")
		.attr("d", valueline(data));

	var points1 = svg.selectAll("circle.point1").data(data)
	points1.enter().append("circle")
		.merge(points1)
		.attr("class", "point1")
		.style("stroke", "red")
		.style("fill", "white")
		.style("stroke-width", 2)
		.attr("cx", function (d) {
			return xLine(d.Date);
		})
		.attr("cy", function (d) {
			return yLine(d.Inflow);
		})
		.attr("r", function (d) { return 3; })
		.on("mouseover", function (d) {

			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
		})
		.on("mousemove", function (d) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 40 + "px");

			divtooltip.style("display", "inline-block");
			divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
		})
		.on("mouseout", function (d) {
			divtooltip.style("display", "none");
		});

	svg.append("g")
		.attr("transform", "translate(0,0)")
		.call(d3.axisTop(xLine))
		.selectAll("text")
		.remove()
		;

	// Add the X Axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xLine)) //.tickSize(-height)
		.selectAll("text")
		.attr("x", "-25")
		.attr("y", "5")
		.attr("transform", "rotate(-30)")
		.style("font-family", "sans-serif")
		.style("font-size", "9px");

	// Add the Y0 Axis
	svg.append("g")
		.attr("class", "axisSteelBlue")
		.call(d3.axisLeft(yBar));

	// Add the Y1 Axis
	svg.append("g")
		.attr("class", "axisRed")
		.attr("transform", "translate( " + width + ", 0 )")
		.call(d3.axisRight(yLine));//.tickSize(-width)

	svg.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", -80)
		.attr("y", -35)
		.attr("style", "font-size:8pt;fill:steelblue;")
		.attr("transform", "rotate(-90)")
		.text('Rainfall (mm)');

	svg.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", -65)
		.attr("y", width + margin.left)
		.attr("style", "font-size:8pt;fill:red;")
		.attr("transform", "rotate(-90)")
		.text('Discharge (cumec)');

	var tbdatobj = newobj.select("#content1").append('table').attr("width", "100%")
	var tablecontent = descripttable(data, ['Date', 'Inflow', 'Rainfall'], tbdatobj, true);

	var tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var desctable = descripttable(dscrdata, ['Code', selectedBasincode], tbdescobj, false);

	var dscrdatavalue = FFdscrdata.filter(function (dv) {
		return dv.Basin == selectedBasincode;
	});
	tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var FFdesctable = descripttable(dscrdatavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], tbdescobj, true);

	return newobj.node();
}

function resetlayers() {

	if (selectedBasincode === undefined || selectedBasincode === null) return;
	if (loadingLayer == true) {
		showmessage('Wait basin is loading');
		return;
	}

	if (subgeojson != undefined) {
		subgeojson.eachLayer(function (layer) {
			layer.setStyle({
				fillColor: "#ccc",
				weight: 1
			});
		});
	}
	if (rchgeojson != undefined) {
		rchgeojson.eachLayer(function (layer) {
			layer.setStyle({
				color: "blue",
				weight: 1
			});
		});
	}

	if (cwcgeojson != undefined) {
		cwcgeojson.eachLayer(function (layer) {
			layer.setStyle({
				color: "darkgray",
				weight: 1
			});
		});
	}

	//if (map.hasLayer(legend))
	//	map.removeLayer(legend);

	//loaddata();

	//if (curlayer != null && curfield != null) {
	//	ajaxaddlayers(curlayer, curfield)
	//}
	//else {
	//	$("[name=days]").removeAttr("checked");
	//	day = 0;
	//	$("[name=days]").filter("[value='" + day + "']").prop("checked", true);
	//}
	//curlayer = prmlayer;
	//curfield = fldname;
}

function removelayer() {
	if (selectedBasincode === undefined || selectedBasincode === null) return;

	if (map.hasLayer(subgeojson))
		map.removeLayer(subgeojson);
	if (map.hasLayer(rchgeojson))
		map.removeLayer(rchgeojson);
	if (map.hasLayer(cwcgeojson))
		map.removeLayer(cwcgeojson);
	if (map.hasLayer(labelLayerGroup))
		map.removeLayer(labelLayerGroup);

	if (map.hasLayer(legend))
		map.removeLayer(legend);

	subgeojson = null;
	rchgeojson = null;
	cwcgeojson = null;

	listDates = [], subdata4fndminmax = [], rchdata4fndminmax = [], cwcdata4fndminmax = [];

	$("[name=days]").removeAttr("checked");
	selectedDay = 0;
	$("[name=days]").filter("[value='" + selectedDay + "']").prop("checked", true);
	unsetHighlight(highlight);
}

// map.on('click', function (e) {
// 	//map.spin(false);
// });

// map.on("zoomstart", function (e) { console.log("ZOOMSTART", e); });
// map.on("zoomend", function (e) { console.log("ZOOMEND", e); });

/*Zoom Control Click Managed*/
var bZoomControlClick = false;
map.on('zoomend', function (e) {
	var currZoom = map.getZoom();
	if (bZoomControlClick) {
		console.log("Clicked " + currZoom);
	}
	bZoomControlClick = false;
});
var element = document.querySelector('a.leaflet-control-zoom-in');
L.DomEvent.addListener(element, 'click', function (e) {
	bZoomControlClick = true;
	$(mymap).trigger("zoomend");
});
var element1 = document.querySelector('a.leaflet-control-zoom-out');
L.DomEvent.addListener(element1, 'click', function (e) {
	bZoomControlClick = true;
	$(mymap).trigger("zoomend");
});
// showmessage("Please try later data not available");