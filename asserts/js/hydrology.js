'use strict';
let startedat = new Date();

let pcpdomain = [], wylddomain = [], etdomain = [], swdomain = [], flowdomain = [], rfcwcdomain = [], ifcwcdomain = [];
let listDates = {}, loadedDataset = {}, loadedLayers = {};
let monthName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let isPlay = false, loadingData = false, loadingLayer = false;
let selectedModel = 'gfs', selectedLayer = 'sub', selectedField = 'PRECIPmm', selectedDay = 0, selectedBasincode;
let basinGeojson, subgeojson, rchgeojson, cwcgeojson, selectedBasin;
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
// document.getElementById('').getBoundingClientRect()
// let leftwrapbox = document.getElementById('leftwrap').getBoundingClientRect();
let leftwrapbox = divleftwrap.getBoundingClientRect();
divleftwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';
divmapwrap.style.width = (w - leftwrapbox.width) - 27 + 'px';
divmapwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';
// console.log([(w - leftwrapbox.width) - 15 + 'px', (h - leftwrapbox.top) - 55 + 'px']);

const OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = new L.Map('mapcon',
	{
		zoomControl: false,
		layers: [OpenStreetMap],
		center: new L.LatLng(20.5937, 78.9629),
		// minZoom: 5,
		// zoom: 4
	});

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
	if (loadingLayer === true || loadingData === true) {
		showmessage('Wait layer/data are loading');

		// $("[name=model]").removeAttr("checked");
		$("[name=model]").prop("checked", false);
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
	// console.log([selectedModel, listDates, listDates[selectedModel]]);
	if (typeof listDates[selectedModel] !== 'undefined') {
		if (listDates[selectedModel].length > 0) {
			$('#rundate').text("Simulated using " + selectedModel.toUpperCase() + ' on ' + listDates[selectedModel][selectedDay]);
		}
	}
	// loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]
	// if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length > 0) {
	// 	listDates[selectedModel] = [];
	// 	Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).forEach(function (dat) {
	// 		listDates[selectedModel].push(dat);
	// 	})
	// }
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
function intializeLayers() {
	if (subgeojson !== null) {
		subgeojson.eachLayer(function (layer) {
			var code = layer.feature.properties.Subbasin;
			var msg = '<span class="TextMsg">Subbasin  : ' + code + '</span>';

			layer.bindTooltip(msg, {
				className: 'basintooltip',
				closeButton: false,
				sticky: true,
				offset: L.point(0, -20)
			});

			layer.setStyle({
				color: "#ccc",
				fillColor: '#eee', //subcolor(gv),
				fillOpacity: wsopacity,
				weight: 1
			});
		})
	}

	if (rchgeojson !== null) {
		rchgeojson.eachLayer(function (layer) {
			var code = layer.feature.properties.Subbasin;
			var msg = '<span class="TextMsg">Subbasin  : ' + code + '</span>';

			layer.bindTooltip(msg, {
				className: 'basintooltip',
				closeButton: false,
				sticky: true,
				offset: L.point(0, -20)
			});

			layer.setStyle({
				color: "blue",
				fillColor: '#87CEEB',
				weight: 2
			});
		})
	}

	if (cwcgeojson !== null) {
		cwcgeojson.eachLayer(function (layer) {
			var code = layer.feature.properties.Subbasin;
			var msg = '<span class="TextMsg">Subbasin  : ' + code + '</span>';

			layer.bindTooltip(msg, {
				className: 'basintooltip',
				closeButton: false,
				sticky: true,
				offset: L.point(0, -20)
			});

			layer.setStyle({
				color: "darkgray",
				weight: 1
			});
		})
	}
}
var addinglayers = false;
function addingLayerandData(prmlayer, fldname) {

	document.getElementById('divalert').style.display = 'none';
	let msgheader = selectedLayer === 'sub' ? 'Subbasin' : 'Stream flow';
	if (loadingLayer == true) {
		// loadingContainer.style.display = 'none';
		showmessage('Wait ' + msgheader + ' layer is loading ');
		return;
	}
	if (loadingData == true) {
		// loadingContainer.style.display = 'none';
		showmessage('Wait ' + msgheader + ' data is loading');
		return;
	}
	if (prmlayer === undefined || fldname === undefined || prmlayer == null || fldname == null) {
		loadingContainer.style.display = 'none';
		showmessage('Select Variable')
		return;
	}

	if (selectedBasincode === undefined || selectedBasincode === null) {
		loadingContainer.style.display = 'none';
		showmessage('Select basin')
		return;
	}
	addinglayers = true;

	getminmax(selectedLayer);
	intializeLayers();
	//console.log([subgeojson,rchgeojson,cwcgeojson])

	if (map.hasLayer(subgeojson) && subgeojson !== null) {
		map.removeLayer(subgeojson);
	}
	if (map.hasLayer(rchgeojson) && rchgeojson !== null) {
		map.removeLayer(rchgeojson);
	}
	if (map.hasLayer(cwcgeojson) && cwcgeojson !== null) {
		map.removeLayer(cwcgeojson);
	}

	if (selectedLayer === 'sub') {
		if (subgeojson === null) {
			showmessage("Please select basin");
			return;
		}
		if (map.hasLayer(rchgeojson) && rchgeojson !== null) {
			map.removeLayer(rchgeojson);
		}
		if (map.hasLayer(cwcgeojson) && cwcgeojson !== null) {
			map.removeLayer(cwcgeojson);
		}
	} else if (selectedLayer === 'rch') {
		if (rchgeojson === null) {
			showmessage("Please select basin");
			return;
		}
		if (!map.hasLayer(subgeojson) && subgeojson !== null) {
			map.addLayer(subgeojson);
		}
		if (map.hasLayer(cwcgeojson) && cwcgeojson !== null) {
			map.removeLayer(cwcgeojson);
		}
	} else if (selectedLayer === 'cwc') {
		if (cwcgeojson === null) {
			showmessage("Please select basin");
			return;
		}
		if (map.hasLayer(subgeojson) && subgeojson !== null) {
			map.removeLayer(subgeojson);
		}
		if (map.hasLayer(rchgeojson) && rchgeojson !== null) {
			map.removeLayer(rchgeojson);
		}
	}
	let layercount = 0;
	var dated = selectedDay <= 1 ? 'Observed Dated : ' : 'Forecast Dated : ';
	if (selectedDay < listDates[selectedModel].length) {

		document.getElementById('ffdate').innerHTML = dated + listDates[selectedModel][selectedDay];
		if (prmlayer === 'sub') {
			if (subgeojson === null || typeof subgeojson === 'undefined' || Object.keys(subgeojson).length == 0) loadSubBasinLayers();
			if (subgeojson === null || typeof subgeojson === 'undefined' || Object.keys(subgeojson).length == 0) return;

			let subdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'];

			// if(subdata4fndminmax.length ===0 ){
			// 	loaddata();
			// }
			console.log([subdata4fndminmax !== 'error', subdata4fndminmax !== undefined, Object.keys(subdata4fndminmax).length > 0])
			if (subdata4fndminmax !== 'error'
				&& subdata4fndminmax !== undefined
				&& Object.keys(subdata4fndminmax).length > 0) {
				// console.log(subgeojson.getLayers().length);
				let nolayers = subgeojson.getLayers().length;

				if (fldname == 'PRECIPmm')
					subcolor.domain(pcpdomain);
				else if (fldname == 'WYLDmm')
					subcolor.domain(wylddomain);
				else if (fldname == 'ETmm')
					subcolor.domain(etdomain);
				else if (fldname == 'SWmm')
					subcolor.domain(swdomain);

				let clrange = subcolor.domain();
				if (clrange.length === 0) {
					intializeLayers();
					showmessage('No data on ' + listDates[selectedModel][selectedDay]);
					layercount = nolayers;
				} else {
					let criteriaCounter = 0;
					// subgeojson.map(item=>{
					// 	console.log(item);
					// })
					// await Promise.all();

					subgeojson.eachLayer(function (layer) {
						layercount++;
						// if (clrange.length === 0) {
						// 	criteriaCounter++;
						// 	layer.setStyle({
						// 		color: "#ccc",
						// 		fillColor: '#eee', //subcolor(gv),
						// 		fillOpacity: wsopacity,
						// 		weight: 1
						// 	});
						// 	if (nolayers === criteriaCounter) {
						// 		showmessage('No data on ' + listDates[selectedModel][selectedDay]);
						// 	}
						// } else {
						var datavalue = subdata4fndminmax.filter(function (dv) {
							return dv.Subbasin == layer.feature.properties.Subbasin;
						});

						layer.on('mouseover', function (e) {
							setHighlight(layer);
						});

						layer.on('mouseout', function (e) {
							unsetHighlight(layer);
						});
						// console.log('Not completed ... ' + datavalue.length);
						var gv = NaN;
						if (datavalue.length > 0) {
							gv = Number(datavalue[0][fldname]);
							layer.feature.properties.name = 'sub';
							layer.feature.properties.value = gv;

							var fillcolor;
							if (gv < clrange[0]) { criteriaCounter++; fillcolor = '#eee'; }
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
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						} else {
							criteriaCounter++;
							layer.setStyle({
								color: "#ccc",
								fillColor: '#eee', //subcolor(gv),
								fillOpacity: wsopacity,
								weight: 1
							});
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						}
						// }
						map.invalidateSize(true);
					});
				}
				if (!map.hasLayer(subgeojson)) {
					map.addLayer(subgeojson);
				}

				let disableloader = setInterval(() => {
					if (nolayers === layercount) {
						loadlegend('sub')
						loadingContainer.style.display = 'none';
						clearInterval(disableloader);
					}
					// else {
					// 	console.log([nolayers === layercount, nolayers, layercount])
					// }
				}, 1000);
			} else {
				loadingContainer.style.display = 'none';
				console.log("Loading stops here : if (subdata4fndminmax !== 'error'");
				console.error("runerror : Subbasin data is not matching criteria")
				showmessage('No data on ' + listDates[selectedModel][selectedDay]);
				intializeLayers();
			}

		}
		else if (prmlayer === 'sub') {
			loaddata();
			loadingContainer.style.display = 'none';
			console.log("Loading stops here : if (prmlayer === 'sub') {");
			// console.error("runerror : Subbasin data is not matching criteria")
		}

		if (prmlayer === 'rch') {

			if (rchgeojson === null || typeof rchgeojson === 'undefined' || Object.keys(rchgeojson).length == 0) loadSubBasinLayers();
			if (rchgeojson === null || typeof rchgeojson === 'undefined' || Object.keys(rchgeojson).length == 0) return;

			let rchdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'];
			console.log([rchdata4fndminmax !== 'error', rchdata4fndminmax !== undefined, Object.keys(rchdata4fndminmax).length > 0])
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

				// console.log(rchgeojson.getLayers().length);
				let nolayers = rchgeojson.getLayers().length;

				rchcolor = d3.scaleThreshold()
					.domain(flowdomain)
					.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
				let clrange = rchcolor.domain();
				if (clrange.length === 0) {
					intializeLayers();
					showmessage('No data on ' + listDates[selectedModel][selectedDay]);
					layercount = nolayers;
				} else {
					let criteriaCounter = 0;
					rchgeojson.eachLayer(function (layer) {
						layercount++;
						// if (clrange.length === 0) {
						// 	criteriaCounter++;
						// 	layer.setStyle({
						// 		color: "blue",
						// 		fillColor: '#87CEEB',
						// 		weight: 2
						// 	});
						// 	if (nolayers === criteriaCounter) {
						// 		showmessage('No data on ' + listDates[selectedModel][selectedDay]);
						// 	}
						// } else {
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
								criteriaCounter++;
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
							var msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(gv).toFixed(1) + ' cumec</span>';;

							layer.bindTooltip(msg, {
								className: 'basintooltip',
								closeButton: false,
								sticky: true,
								offset: L.point(0, -20)
							});
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						} else {
							criteriaCounter++;
							layer.setStyle({
								color: "blue",
								fillColor: '#87CEEB',
								weight: 2
							});
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						}
						// }
						map.invalidateSize(true);
					});
				}

				if (!map.hasLayer(subgeojson) && subgeojson !== null) {
					map.addLayer(subgeojson);
				}
				if (!map.hasLayer(rchgeojson)) {
					map.addLayer(rchgeojson);
				}

				// loadlegend('rch')
				// loadingContainer.style.display = 'none';
				let disableloader = setInterval(() => {
					if (nolayers === layercount) {
						clearInterval(disableloader);
						loadlegend('rch')
						loadingContainer.style.display = 'none';

					}
				}, 1000);
			}
			else {
				loadingContainer.style.display = 'none';
				console.log("Loading stops here : if (rchdata4fndminmax !== 'error'");
				console.error("runerror : Reach data is not matching criteria")
				showmessage('No data on ' + listDates[selectedModel][selectedDay]);
				intializeLayers();
			}
		}
		else if (prmlayer === 'rch') {
			loaddata();
			loadingContainer.style.display = 'none';
			console.log("Loading stops here : if (prmlayer === 'rch') {");
			// console.error("runerror : Reach data is not matching criteria")
		}

		if (prmlayer === 'cwc') {

			if (cwcgeojson === null || typeof cwcgeojson === 'undefined' || Object.keys(cwcgeojson).length == 0) loadSubBasinLayers();
			if (cwcgeojson === null || typeof cwcgeojson === 'undefined' || Object.keys(cwcgeojson).length == 0) return;

			let cwcdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer]['data'];
			console.log([cwcdata4fndminmax !== 'error', cwcdata4fndminmax !== undefined, Object.keys(cwcdata4fndminmax).length > 0])
			if (cwcdata4fndminmax != 'error'
				&& cwcdata4fndminmax != undefined
				&& Object.keys(cwcdata4fndminmax).length > 0) {

				if (jQuery.isEmptyObject(rfcwcdomain) || jQuery.isEmptyObject(ifcwcdomain)) {
					getminmax('cwc');
				}

				if (jQuery.isEmptyObject(rfcwcdomain) || jQuery.isEmptyObject(ifcwcdomain)) {
					showmessage('CWC flow/Stream are not downloaded properly please refresh page and run again');
					return;
				}

				// console.log(cwcgeojson.getLayers().length);
				let nolayers = cwcgeojson.getLayers().length;

				//Inflow,Rainfall
				if (fldname === "Rainfall")
					subcolor.domain(rfcwcdomain);
				else
					subcolor.domain(ifcwcdomain);

				let clrange = subcolor.domain();
				if (clrange.length === 0) {
					intializeLayers();
					showmessage('No data on ' + listDates[selectedModel][selectedDay]);
					layercount = nolayers;
				} else {
					let criteriaCounter = 0;
					cwcgeojson.eachLayer(function (layer) {
						layercount++;
						// if (clrange.length === 0) {
						// 	criteriaCounter++;
						// 	layer.setStyle({
						// 		color: "darkgray",
						// 		weight: 1
						// 	});
						// 	if (nolayers === criteriaCounter) {
						// 		showmessage('No data on ' + listDates[selectedModel][selectedDay]);
						// 	}
						// } else {
						var datavalue = cwcdata4fndminmax.filter(function (dv) {
							return dv.Subbasin == layer.feature.properties.SUBBASIN;
						});

						var gv = NaN;
						if (datavalue.length > 0) {
							gv = Number(datavalue[selectedDay][fldname]);
							var fillcolor;
							if (gv <= clrange[1]) {
								criteriaCounter++;
							} else if (gv <= clrange[1]) {
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
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						}
						else {
							criteriaCounter++;
							layer.setStyle({
								color: "darkgray",
								weight: 1
							});
							if (nolayers === criteriaCounter) {
								showmessage('No data on ' + listDates[selectedModel][selectedDay]);
							}
						}
						// }
						map.invalidateSize(true);
					});
				}
				if (!map.hasLayer(cwcgeojson)) {
					map.addLayer(cwcgeojson);
				}

				// loadlegend('sub')
				// loadingContainer.style.display = 'none';
				let disableloader = setInterval(() => {
					if (nolayers === layercount) {
						clearInterval(disableloader);
						loadlegend('sub')
						loadingContainer.style.display = 'none';

					}
				}, 1000);
			}
			else {
				loadingContainer.style.display = 'none';
				console.log("Loading stops here : if (cwcdata4fndminmax != 'error'");
				showmessage('No data on ' + listDates[selectedModel][selectedDay]);
				console.error("runerror : CWC data is not matching criteria")
				intializeLayers();
			}
		}
		else if (prmlayer == 'cwc') {
			loaddata();
			loadingContainer.style.display = 'none';
			console.log("Loading stops here : if (prmlayer === 'cwc') {");
			// console.error("runerror : CWC data is not matching criteria")
		}

		if (map.hasLayer(subgeojson)) {
			map.fitBounds(subgeojson.getBounds());
		}
		// loadingContainer.style.display = 'none';
	} else {
		document.getElementById('ffdate').innerHTML = 'No data available';
	}
	addinglayers = false;
}

function ajaxaddlayers(layer, field) {
	selectedLayer = layer;
	selectedField = field;

	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
	} else {
		map.closePopup();
		loadSubBasinLayers();
		loaddata();
	}

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

function getminmax(prm) {
	if (prm === 'sub' || prm === 'all') {
		let subdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer];
		if (subdata4fndminmax !== 'error' && typeof subdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(subdata4fndminmax)) {
			let pcpdatalst = [], wylddatalst = [], etdatalst = [], swdatalst = [];
			for (let s = 0; s < listDates[selectedModel].length; s++) {
				if (typeof subdata4fndminmax[listDates[selectedModel][s]] === 'undefined') continue;
				let tmpdata = subdata4fndminmax[listDates[selectedModel][s]]['data'];
				if (tmpdata === 'error' || Object.keys(tmpdata).length === 0) continue;
				// console.log(tmpdata);
				tmpdata.map(function (d) {
					let pcp = Number(d.PRECIPmm);
					let wy = Number(d.WYLDmm);
					let et = Number(d.ETmm);
					let sw = Number(d.SWmm);
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
			// if (pcpdatalst.length == 0) {
			// 	showmessage("[" + selectedBasincode + "] Rainfall Not matching the criteria (0.01>) on " + listDates[selectedModel][selectedDay]);
			// } else {
			if (pcpdatalst.length > 0) {

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
			}

			// if (wylddatalst.length == 0) {
			// 	showmessage("[" + selectedBasincode + "] Water Yield Not matching the criteria (0.01>) " + listDates[selectedModel][selectedDay]);
			// } else {
			if (wylddatalst.length > 0) {
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
			// if (etdatalst.length == 0) {
			// 	showmessage("[" + selectedBasincode + "] Evapo-transpiration Not matching the criteria (0.01>) " + listDates[selectedModel][selectedDay]);
			// } else {
			if (etdatalst.length > 0) {

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
			// if (swdatalst.length == 0) {
			// 	showmessage("[" + selectedBasincode + "] Soil Moisture status Not matching the criteria (0.01>) " + listDates[selectedModel][selectedDay]);
			// } else {
			if (swdatalst.length > 0) {

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
			subdata4fndminmax = [];
		} else {
			subdata4fndminmax = [];
		}
	}

	if (prm === 'rch' || prm === 'all') {
		let rchdata4fndminmax = loadedDataset[selectedBasincode][selectedModel][selectedLayer];
		if (rchdata4fndminmax !== 'error' && typeof rchdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(rchdata4fndminmax)) {
			var flowdatalst = [];
			for (var s = 0; s < Object.keys(rchdata4fndminmax).length; s++) {
				if (typeof rchdata4fndminmax[listDates[selectedModel][s]] === 'undefined') continue;
				let tmpdata = rchdata4fndminmax[listDates[selectedModel][s]]['data'];
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
				showmessage("No Stream flow ");
				// showmessage("[" + selectedBasincode + "] Stream flow status Not matching the criteria (0.01>) " + listDates[selectedModel][selectedDay]);
			}
			rchdata4fndminmax = [];
		} else {
			rchdata4fndminmax = [];
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
			cwcdata4fndminmax = [];
		}
	}
	// 	loadingCwcdataCompleted = true;
	// 	let msec = (new Date() - startedat);
	// 	console.log("CWC data completed loading : " + (msec / 1000) + ' Seconds');
	// });
}
function loaddata() {
	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
		loadingContainer.style.display = 'none';
		return;
	}

	if (loadingContainer.style.display === 'none') { loadingContainer.style.display = 'block'; }

	if (typeof loadedDataset[selectedBasincode][selectedModel] === 'undefined') {
		loadedDataset[selectedBasincode][selectedModel] = { 'sub': {}, 'rch': {}, 'cwc': {}, 'chart': {} };
	}

	//***************** loading datas ******************************
	if (selectedLayer === 'sub') {
		if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {
			if (typeof listDates[selectedModel] === 'undefined') {
				listDates[selectedModel] = [];
			}
			readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt?t=' + new Date().getTime(), function (txt) {
				if (txt === "Error404") {
					console.error('File not found : ' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt');
					// showmessage("Please try later data not available");
				} else if (txt === "Error") {
					console.error(' Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'subwebsite.txt');
					// showmessage("Please try later data not available");
				} else {
					//if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {}
					let lines = txt.split('\r\n');
					for (let line = 0; line < lines.length; line++) {
						if (lines[line] !== '') {
							let dtstr = lines[line].split("_")[3].substring(0, 8);
							let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
							listDates[selectedModel].push(filedate);

							let url = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();
							loadedDataset[selectedBasincode][selectedModel][selectedLayer][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': [] };
						}
					}
					if (listDates[selectedModel].length > 2) {
						$('#rundate').text("Simulated using " + selectedModel.toUpperCase() + ' on ' + listDates[selectedModel][1]);
					} else {
						$('#rundate').text('No forecast today');
					}
				}
			});
		}
		// else {
		// 	console.log([selectedBasincode,selectedModel,selectedLayer]);
		// 	console.log(loadedDataset[selectedBasincode][selectedModel][selectedLayer]);
		// 	console.log('sub already loaded ... ')
		// }
	}

	if (selectedLayer === 'rch') {
		if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) {
			if (typeof listDates[selectedModel] === 'undefined') {
				listDates[selectedModel] = [];
			}
			readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt?t=' + new Date().getTime(), function (txt) {
				loadingData = true;
				if (txt === "Error404") {
					console.log('File not found : ' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt');
					// showmessage("Please try later data not available");
				} else if (txt === "Error") {
					console.log('Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'rchwebsite.txt');
					// showmessage("Please try later data not available");
				} else {
					//if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0) { }
					var lines = txt.split('\r\n');
					for (var line = 0; line < lines.length; line++) {
						if (lines[line] !== '') {
							let dtstr = lines[line].split("_")[3].substring(0, 8);
							let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
							if (!listDates[selectedModel].includes(filedate)) {
								listDates[selectedModel].push(filedate);
							}
							var url = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();
							loadedDataset[selectedBasincode][selectedModel][selectedLayer][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': [] };
						}
					}
					loadingData = false;
				}
			});
		}
		// else {
		// 	console.log('rch already loaded ... ')
		// }
	}

	if (selectedLayer === 'rch' || selectedLayer === 'sub') {
		let dataloadinterval = setInterval(function () {
			// console.clear();
			// console.log("=======================================");

			// console.log(listDates[selectedModel].length === 0);
			if (listDates[selectedModel].length === 0) {
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				return;
			}

			// console.log (typeof listDates[selectedModel][selectedDay] === 'undefined');
			if (typeof listDates[selectedModel][selectedDay] === 'undefined') {
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				return;
			}

			// console.log (typeof loadedDataset[selectedBasincode] === 'undefined');
			if (typeof loadedDataset[selectedBasincode] === 'undefined') {
				// loadedDataset[selectedBasincode]={};
				loadingContainer.style.display = 'none';
				console.log("Loading stops here : typeof loadedDataset[selectedBasincode]");
				clearInterval(dataloadinterval)
				return;
			}
			// console.log (typeof loadedDataset[selectedBasincode][selectedModel] === 'undefined');
			if (typeof loadedDataset[selectedBasincode][selectedModel] === 'undefined') {
				loadedDataset[selectedBasincode][selectedModel] = {};
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				// return;
			}
			// console.log (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer] === 'undefined');
			if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer] === 'undefined') {
				loadedDataset[selectedBasincode][selectedModel][selectedLayer] = {};
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				// return;
			}
			// console.log (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]] === 'undefined');
			if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]] === 'undefined') {
				loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]] = {};
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				// return;
			}
			// console.log (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] === 'undefined');
			if (typeof loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] === 'undefined') {
				loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] = {};
				// loadingContainer.style.display = 'none';
				// clearInterval(dataloadinterval)
				// return;
			}
			// console.log("=======================================");

			clearInterval(dataloadinterval)
			if (loadingData === false && loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'].length === 0) {
				let url = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]].filename;
				loadingData = true;
				fetch(url).then(response => {
					// console.log("Loading stops here : fetch(url).then(response => {");
					if (!response.ok) {
						if (response.status === 404) {
							loadingContainer.style.display = 'none';
							showmessage('Data is not available for this basin, please try later');
							loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] = 'error';
						} else {
							showmessage('Downloding error, please try later');
						}
						loadingData = false;
						// throw new Error(`Failed to fetch, status: ${response.status}`);
					}
					return response.text();
				}).then(data => {
					// console.log(data);
					if (data.includes('404 Not Found') || data.includes('Not Found')) {
						showmessage('Data is not available for this basin, please try later');
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] = 'error';
					} else {
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] = csvJSON(data);
						// console.log(loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data']);
						// console.log([selectedLayer, selectedField])
						if (loadingLayer === false && loadingData === false) {
							addingLayerandData(selectedLayer, selectedField);
							clearInterval(waitforlayersloading);
						} else {
							var waitforlayersloading = setInterval(function () {
								if (loadingLayer === false && loadingData === false) {
									addingLayerandData(selectedLayer, selectedField);
									clearInterval(waitforlayersloading);
									// if (typeof loadedLayers[selectedBasincode][selectedLayer] !== 'undefined' 
									// 		&& Object.keys(loadedLayers[selectedBasincode][selectedLayer]).length > 0) {
									// 	console.log('waitforlayersloading : Loading layers are completed');
									// 	loadingLayer = false;
									// }
								}
							}, 500)
						}
					}
					loadingData = false;
					// loadingContainer.style.display = 'none';
				})
					.catch(error => {
						// clearInterval(waitforlayersloading);
						loadingContainer.style.display = 'none';
						console.log("Loading stops here : .catch(error => {");
						console.error('Error message: ', error.message);
						loadingData = false;
						loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'] = 'error';
					});
			} else {
				// if (listDates[selectedModel].length === 0) {
				// 	Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).forEach((date) => listDates[selectedModel][date]);
				// }
				if (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length > 0) {
					listDates[selectedModel] = [];
					Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).forEach(function (dat) {
						listDates[selectedModel].push(dat);
					})
				}
				addingLayerandData(selectedLayer, selectedField);
			}
		}, 1000)
	}

	if (selectedLayer === 'cwc' && (Object.keys(loadedDataset[selectedBasincode][selectedModel][selectedLayer]).length === 0)) {
		if (typeof listDates[selectedModel] === 'undefined') {
			listDates[selectedModel] = [];
		}
		readTextFile('./data/' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt?t=' + new Date().getTime(), function (txt) {
			if (txt === "Error404") {
				showmessage("Please try later data not available");
				console.log('File not found : ' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt');
			} else if (txt === "Error") {
				showmessage("Please try later data not available");
				console.log('Error in File loading : ' + selectedBasincode + '_' + selectedModel + 'cwcwebsite.txt');
			} else {
				var lines = txt.split('\r\n');
				listDates[selectedModel] = [];
				for (var line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {

						let dtstr = lines[line].split("_")[2].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + monthName[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);

						var flname = "./data/" + selectedModel + "/" + lines[line] + '?t=' + new Date().getTime();
						let url = flname;
						(function (url, dtstr, filedate) {
							fetch(url).then(response => {
								if (!response.ok) {
									showmessage("Please try later data not available");
									// throw new Error(`Failed to fetch, status: ${response.status}`);
								}
								return response.text();
							})
								.then(data => {
									loadedDataset[selectedBasincode][selectedModel][selectedLayer] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': csvJSON(data) };
									if (listDates[selectedModel].length === 0) {
										loadedDataset[selectedBasincode][selectedModel][selectedLayer]['data'].forEach(function (dat) {
											let dtstr = dat.Date.split("/");
											let filedate = dtstr[1] + '-' + monthName[Number(dtstr[0]) - 1] + '-' + dtstr[2];
											if (!listDates[selectedModel].includes(filedate)) {
												listDates[selectedModel].push(filedate);
											}
										})
									}
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
		console.log('cwc already loaded ... ')
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
		//console.log('display none 7');
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
				let cwcTopoJson = topojson.feature(data, data.objects[objname])
				cwcgeojson = L.geoJson(cwcTopoJson, {
					style: {
						color: "darkgray",
						weight: 1
					}
					, onEachFeature: onEachCWCbasinLayer
				}).bindPopup(chart_new).addTo(map);
				loadedLayers[selectedBasincode][selectedLayer] = cwcgeojson;

				cwcTopoJson = [];
				loadingLayer = false;

				let msec = (new Date() - startedat);
				console.log("CWC json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				loadingLayer = false;
				loadedLayers[selectedBasincode][selectedLayer] = 'error'; //'Error: ' +  textStatus + ' ' + errorThrown;
				showmessage("Please check your internet speed, layers are not loaded")
			});
	} else if (selectedLayer === 'cwc') {
		if (!map.hasLayer(cwcgeojson)) {
			cwcgeojson = loadedLayers[selectedBasincode][selectedLayer];
			map.addLayer(cwcgeojson)
		}
	}
	if ((typeof loadedLayers[selectedBasincode][selectedLayer] === 'undefined' || loadedLayers[selectedBasincode][selectedLayer] === 'error') && selectedLayer === 'sub') {
		loadingLayer = true;
		subgeojson = [];
		$.getJSON(suburl)
			.done(function (data) {
				//console.log('Success: ', data);
				var objname = Object.keys(data.objects)[0];
				let subTopoJson = topojson.feature(data, data.objects[objname])
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
				subTopoJson = [];
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
	}
	if ((typeof loadedLayers[selectedBasincode][selectedLayer] === 'undefined' || loadedLayers[selectedBasincode][selectedLayer] === 'error') && selectedLayer === 'rch') {
		loadingLayer = true;
		rchgeojson = [];
		$.getJSON(rchurl)
			.done(function (data) {
				//console.log('Success: ', data);
				var objname = Object.keys(data.objects)[0];
				let rchTopoJson = topojson.feature(data, data.objects[objname])
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
				rchTopoJson = [];
				loadingLayer = false;
				let msec = (new Date() - startedat);
				console.log("Reach json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				loadingLayer = false;
				loadedLayers[selectedBasincode][selectedLayer] = 'error';
				showmessage("Layers are not loaded, please try later");
			});
	} else if (selectedLayer === 'rch') {
		if (!map.hasLayer(rchgeojson)) {
			rchgeojson = loadedLayers[selectedBasincode][selectedLayer];
			map.addLayer(rchgeojson)
		}
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
	if (loadingContainer.style.display === 'none' || loadingContainer.style.display === '') { loadingContainer.style.display = 'block'; }

	selectedBasincode = e.target.feature.properties.Code;
	// var Basin_Name = e.target.feature.properties.Basin_Name;
	//***************** loading layers ******************************

	removelayer();

	if (typeof loadedLayers[selectedBasincode] === 'undefined') {
		loadedLayers[selectedBasincode] = {};
	}
	loadSubBasinLayers();
	//***************** End loading layers ******************************
	if (typeof loadedDataset[selectedBasincode] === 'undefined' || loadedDataset[selectedBasincode] === undefined) {
		loadedDataset[selectedBasincode] = {};
	}
	loaddata();

	if (map.hasLayer(basinGeojson)) {
		map.removeLayer(basinGeojson)
	}
	// selectedBasin = JSON.parse(JSON.stringify(e.target));
	// selectedBasin = e.target;
	e.target.setStyle({
		color: "black",
		fillColor: '#ffffff00',
		fillOpacity: 0.25,
		weight: 1.5
	})
	map.addLayer(e.target);

	let boolshowmessage = true, totalminutes = 1;
	var loaderinterval = setInterval(
		function () {
			if (typeof loadedLayers[selectedBasincode][selectedLayer] !== 'undefined' && Object.keys(loadedLayers[selectedBasincode][selectedLayer]).length > 0) {
				console.log('Loading layers are completed');
				loadingLayer = false;
			} else {
				let msec = (new Date() - startedat);
				// console.log("Loading approx minutes : " + (msec / 60000));
				if ((msec / 60000) > totalminutes && boolshowmessage === true) {
					showmessage("please wait, still processing ...")
					totalminutes++;
				}
			}

			if (loadingLayer === false && loadingData === false) {
				loadingContainer.style.display = 'none';
				console.log("Loading stops here : var loaderinterval = setInterval(");
				clearInterval(loaderinterval);
			}
		}, 500);
		
	// if (map.hasLayer(labelLayerGroup)) {
	// 	labelLayerGroup.clearLayers();
	// }
	// L.marker(e.target.getBounds().getCenter(), {
	// 	icon: L.divIcon({
	// 		className: 'label',
	// 		html: e.target.feature.properties.Basin_Name,
	// 		iconSize: [100, 25]
	// 	})
	// }).addTo(labelLayerGroup);
	// map.addLayer(labelLayerGroup);
	// console.log(labelLayerGroup);
}

function onEachBasinLayer(feature, layer) {
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
	basinGeojson = L.geoJson(indiaTopoJson, {
		style: style
		, onEachFeature: onEachBasinLayer
	}).addTo(map)
	if (map.hasLayer(basinGeojson)) {
		map.fitBounds(basinGeojson.getBounds())
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

// var date = new Date();
var ctrlDate = L.control({ position: 'bottomleft' });
ctrlDate.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="ffdate" style="padding:5px;"> ' + startedat.getDate() + '-' + monthName[startedat.getMonth()] + '-' + startedat.getFullYear() + ' </span>';
	return div;
};
ctrlDate.addTo(map);

function playwatershed() {

	if (selectedBasincode === undefined || selectedBasincode === null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		// console.log('display none 2');
		return;
	}

	document.getElementById('divalert').style.display = 'none';
	if (selectedField === undefined || selectedField == null) {
		showmessage('Select variable');
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		// console.log('display none 3');
		return;
	}

	if (isPlay == true) {
		isPlay = false;
		document.getElementById("imgplay").src = "./images/play.png";
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

				// ajaxaddlayers(curlayer, curfield);
				let anydata = loadedDataset[selectedBasincode][selectedModel][selectedLayer][listDates[selectedModel][selectedDay]]['data'];
				if (anydata.length === 0 && loadingData === false) {
					loaddata();
				} else { // if (anydata !== 'Error' && anydata !== "Error404")
					addingLayerandData(selectedLayer, selectedField);
				}
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
function showbasin() {
	if (!map.hasLayer(basinGeojson)) {
		basinGeojson.eachLayer((layer) => {
			let feat = layer.feature;
			if (layer !== selectedBasin) {
				layer.setStyle({
					color: "white",
					fillColor: color(feat.ind), //color(feat.properties['Basin_Name']), //
					fillOpacity: 0.25,
					weight: 1.5
				})
			}
		})
		map.addLayer(basinGeojson)
		// map.addLayer(selectedBasin)
	}
	if (map.hasLayer(subgeojson)) {
		map.removeLayer(subgeojson);
	}
	if (map.hasLayer(rchgeojson)) {
		map.removeLayer(rchgeojson);
	}
	if (map.hasLayer(cwcgeojson)) {
		map.removeLayer(cwcgeojson);
	}
	if (selectedLayer == 'rch') {
		if (subgeojson !== undefined && subgeojson !== null) map.addLayer(subgeojson)
		if (rchgeojson !== undefined && rchgeojson !== null) map.addLayer(rchgeojson)
	} else if (selectedLayer == 'sub') {
		if (subgeojson !== undefined && subgeojson !== null) map.addLayer(subgeojson)
	} else if (selectedLayer == 'cwc') {
		if (cwcgeojson !== undefined && cwcgeojson !== null) map.addLayer(cwcgeojson)
	}
	// subgeojson
	// rchgeojson
	// cwcgeojson
	map.fitBounds(basinGeojson.getBounds());
}
function resetzoom() {
	map.fitBounds(basinGeojson.getBounds());
}
var osmVisible = L.control({ position: 'topright' });
osmVisible.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info');
	div.innerHTML = '<input type="checkbox" value="1" checked="checked" name="osmEnable" onclick="osmenable(this)" /> OSM <br />';
	// div.innerHTML += '<input type="button" value="Show basins" id="showbasin" onclick="showbasin()" /> <br />';
	div.innerHTML += '<a href="#" class="resetzoom" onclick="showbasin()" >Show basins</a> <br />';
	div.innerHTML += '<a href="#" class="resetzoom" onclick="resetzoom()" >Reset Zoom</a> <br />';
	return div;
};
osmVisible.addTo(map);

function checkopacity(obj) {
	var value = obj.value;
	if (obj.checked == true)
		wsopacity = Number(value);
	else
		wsopacity = 0.5;
	// subgeojson
	// rchgeojson
	// cwcgeojson
	addingLayerandData(selectedLayer, selectedField);
	// ajaxaddlayers(selectedLayer, selectedField);
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

			let labels = ['<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Subbasin Value (mm/day) </strong><br /><br />'];
			div.innerHTML = labels;

			for (var i = 0; i < grades.length - 1; i++) {
				// div.innerHTML +=
				// 	'<i style="background:' + subclr[i] + '"></i> ' +
				// 	grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
				div.innerHTML += '<div><i style="background:' + subclr[i] + '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '</div>' : '+');

			}
		} else {
			div.innerHTML = '<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Stream Flow (cms) </strong><br /><br />';
			var dmn = rchcolor.domain();
			var clr = rchcolor.range();

			for (var i = 0; i < dmn.length - 1; i++) {
				// div.innerHTML +=
				// 	'<i style="background:' + clr[i] + '"></i> ' +
				// 	dmn[i] + (dmn[i + 1] ? '&ndash;' + dmn[i + 1] + '<br>' : '+');
				div.innerHTML += '<div><i style="background:' + clr[i] + '"></i> ' + dmn[i] + (dmn[i + 1] ? '&ndash;' + dmn[i + 1] + '</div>' : '+');
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

	listDates[selectedModel] = [];

	$("[name=days]").removeAttr("checked");
	selectedDay = 0;
	$("[name=days]").filter("[value='" + selectedDay + "']").prop("checked", true);
	unsetHighlight(highlight);
}


const visitor = document.getElementById('visitor');
if (sessionStorage.getItem('counter') != null) {
	// console.log('page was counter');
	let txt = sessionStorage.getItem('counter');
	// console.log(txt);
	let eleBullet = "<ul><li>Visitor Counter : </li>"
	for (var i = 0; i < txt.length; i++) {
		if (txt[i] != "" && txt[i] != " ") {
			eleBullet += "<li>" + txt[i] + "</li>";
		}
	}
	eleBullet += "<ul>";
	visitor.innerHTML = eleBullet;

} else {
	// console.log('page was not counter');
	readTextFile('./counter.php', function (txt) {
		console.log("counter.php : " + txt);
		if (txt !== "Error" && txt !== "Error404") {
			sessionStorage.setItem('counter', txt);
			let eleBullet = "<ul><li>Visitor Counter : </li>"
			for (var i = 0; i < txt.length; i++) {
				if (txt[i] != "" && txt[i] != " ") {
					eleBullet += "<li>" + txt[i] + "</li>";
				}
			}
			eleBullet += "<ul>";
			visitor.innerHTML = eleBullet;
		}
	})
}

// (function () {
// 	var control = new L.Control({ position: 'topright' });
// 	control.onAdd = function (map) {
// 		var azoom = L.DomUtil.create('a', 'resetzoom info');
// 		azoom.innerHTML = "[Reset Zoom]";
// 		L.DomEvent
// 			.disableClickPropagation(azoom)
// 			.addListener(azoom, 'click', function () {
// 				// map.setView(map.options.center, map.options.zoom);
// 				map.fitBounds(basinGeojson.getBounds());
// 			}, azoom);
// 		return azoom;
// 	};
// 	return control;
// }()).addTo(map);
