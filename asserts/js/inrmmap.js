let startedat = new Date();
var modelname = 'gfs', isPlay = false, loadingLayers = false, day = 0, wsopacity = 0.5, nodays = 8;
var indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer, curfield, basincode;
var daylst = [], subdata = [], rchdata = [], cwcdata = [], pcpchartdata = [];
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var pcpdomain = [], wylddomain = [], etdomain = [], swdomain = [], flowdomain = [], rfcwcdomain = [], ifcwcdomain = [];
let loadingSubdataCompleted = false, loadingRchdataCompleted = false, loadingCwcdataCompleted = false;

// readTextFile('./data/subwebsite.txt?t=' + new Date().getTime(), function (txt) {
// 	if(txt === "Error404"){
// 		console.log('File not found');
// 	}else 	if(txt === "Error"){
// 		console.log('Error in File loading');
// 	}
// });
// d3.csv('./data/PCP_chart.csv', function (error, data) {
// 	console.error(error);
// 	console.error(error.currentTarget.statusText);
// });

var subcolor = d3.scaleThreshold()
	.domain([.1, 10, 20, 40, 70, 130, 200])
	.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
//.range(["#ffffff00", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);//"#cacaca"

var rchcolor = null;

var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = new L.Map('mapcon',
	{
		zoomControl: false,
		layers: [OpenStreetMap],
		center: new L.LatLng(0, 0),
		minZoom: 4.49999,
		zoom: 4
		// zoomDelta: 5,
		// wheelPxPerZoomLevel: 12 		
	});

//setTimeout(function () { map.invalidateSize() }, 800);

//$(".loader").show();
//map.spin(true);

map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>, <a href="http://inrm.co.in">INRM</a>';
var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
	attribution: cartodbAttribution,
	pane: 'labels'
})//.addTo(map);

// if (fileExist(indiaurl) !== 200) {
// 	showmessage("India Json file does not exist");
// 	//document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India Json file does not exist <a href="#" onclick="ContactAdmin()">Contact Admin</a>';
// 	//document.getElementById('divalert').style.display = 'inline';
// }
var color = d3.scaleOrdinal().domain([1, 17]).range(colorbrewer.Paired[12]);
function style(feat, i) {
	return {
		color: "white",
		fillColor: color(feat.ind),
		fillOpacity: 0.25,
		weight: 1.5
	}
}
var layerGroup = L.layerGroup().addTo(map);
//var customOptions ={	'className': 'another-popup'};

function onEachCWCbasinLayer(feature, layer) {
	layer.bindTooltip('CWC : ' + feature.properties['Name'], {
		className: 'basintooltip',
		closeButton: false,
		sticky: true,
		offset: L.point(0, -20)
	});
}

function loadBasin(e) {

	console.clear();

	startedat = new Date();
	document.getElementById('divalert').style.display = 'none';
	if (basincode == e.target.feature.properties.Code) return;

	if (loadingLayers == true) {
		showmessage('Wait basin is loading');
		return;
	}

	// map.setMinZoom(6.25);
	map.fitBounds(e.target.getBounds());
	$("#loader").show();

	// var rect = L.rectangle(e.target.getBounds(), {color: 'blue', weight: 1}).on('click', function (e) {
	// 	// There event is event object
	// 	// there e.type === 'click'
	// 	// there e.lanlng === L.LatLng on map
	// 	// there e.target.getLatLngs() - your rectangle coordinates
	// 	// but e.target !== rect
	// 	console.info(e);
	// }).addTo(map);

	basincode = e.target.feature.properties.Code;
	var Basin_Name = e.target.feature.properties.Basin_Name;
	//***************** loading layers ******************************
	var rchurl = 'json/reach/' + basincode + '.json?t=' + new Date().getTime();
	var suburl = 'json/watershed/' + basincode + '.json?t=' + new Date().getTime();
	var cwcurl = 'json/CWC_basin/' + basincode + '.json?t=' + new Date().getTime();

	loadingLayers = true;
	if (isPlay == true) {
		playwatershed();
	}

	removelayer();
	layerGroup.clearLayers();

	L.marker(e.target.getBounds().getCenter(), {
		icon: L.divIcon({
			className: 'label',
			html: e.target.feature.properties.Basin_Name,
			iconSize: [100, 25]
		})
	}).addTo(layerGroup);

	// var cwcload = false, subload = false, rchload = false;
	cwcgeojson = null; subgeojson = null; rchgeojson = null;
	$.getJSON(cwcurl, function (data) {
		var objname = Object.keys(data.objects)[0];
		cwcTopoJson = topojson.feature(data, data.objects[objname])
		cwcgeojson = L.geoJson(cwcTopoJson, {
			style: {
				color: "darkgray",
				weight: 1
			}
			, onEachFeature: onEachCWCbasinLayer
		}).bindPopup(chart_new).addTo(map);
		cwcload = true;

		let msec = (new Date() - startedat);
		console.log("CWC json completed loading : " + (msec / 1000) + ' Seconds');
	});

	$.getJSON(suburl, function (data) {
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
		subload = true;

		let msec = (new Date() - startedat);
		console.log("Subbasin json completed loading : " + (msec / 1000) + ' Seconds');
	});

	$.getJSON(rchurl, function (data) {
		var objname = Object.keys(data.objects)[0];
		rchTopoJson = topojson.feature(data, data.objects[objname])

		rchgeojson = L.geoJson(rchTopoJson, {
			style: {
				color: "blue",
				weight: 1
			}
		}).bindPopup(chart_subbasin)
			.addTo(map);
		rchload = true;

		let msec = (new Date() - startedat);
		console.log("Reach json completed loading : " + (msec / 1000) + ' Seconds');
	});

	//***************** End loading layers ******************************
	loadingSubdataCompleted = false;
	loadingRchdataCompleted = false;
	loadingCwcdataCompleted = false;
	loaddata();

	var mapSpin = setInterval(
		function () {

			//console.log([subgeojson,rchgeojson,cwcgeojson])

			if (map.hasLayer(subgeojson) && map.hasLayer(rchgeojson) && map.hasLayer(cwcgeojson)) {
				loadingLayers = false;
				// map.fitBounds(e.target.getBounds());

				if (loadingSubdataCompleted == true && subdata.length < 1 && map.hasLayer(subgeojson)) {
					console.log("subdata not loaded properly");
					// console.log(subdata);
					map.removeLayer(subgeojson)
					subgeojson = null;
				}
				if (loadingRchdataCompleted == true && rchdata.length < 1 && map.hasLayer(rchgeojson)) {
					console.log("rchdata not loaded properly");
					// console.log(rchdata);
					map.removeLayer(rchgeojson)
					rchgeojson = null;
				}
				if (loadingCwcdataCompleted == true && cwcdata.length < 1 && map.hasLayer(cwcgeojson)) {
					console.log("cwcdata not loaded properly");
					// console.log(cwcdata);
					map.removeLayer(cwcgeojson)
					cwcgeojson = null;
				}
			}

			let current_style = document.getElementById('loader').style.display;
			//console.log(current_style);
			if (current_style == "none") {
				$("#loader").show();
			}
			if (loadingLayers === false && loadingSubdataCompleted == true && loadingRchdataCompleted == true && loadingCwcdataCompleted == true) {
				setHighlight(e.target);
				$("#loader").hide();
				//map.spin(false);
				clearInterval(mapSpin);

				let msec = (new Date() - startedat);
				console.info("data loading completed : " + (msec / 1000) + ' Seconds');
			} else {

				//console.log([loadingLayers, loadingSubdataCompleted, loadingRchdataCompleted, loadingCwcdataCompleted])
				//console.log([loadingLayers === false , loadingSubdataCompleted == true , loadingRchdataCompleted == true , loadingCwcdataCompleted == true])
				let errmessage = loadingSubdataCompleted == false ? "Subbasin data Loading ..." : loadingRchdataCompleted == false ? "RCH data Loading ..." : loadingCwcdataCompleted == false ? "CWC data Loading ..." : "Layers Loading ...";
				let msec = (new Date() - startedat);
				console.log(errmessage + " : " + (msec / 1000) + ' Seconds');
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
	//map.spin(false);

	let msec = (new Date() - startedat);
	// console.log(msec);
	console.log((msec / 1000) + ' Seconds');
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

var models = L.control({ position: 'topleft' });
models.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info');
	div.innerHTML += '<h3 id="imdmodel">IMD/NOAA NWP Rainfall</h3>';
	div.innerHTML += '<div title="Select forecast model" >&nbsp;<input type="radio" class="modelRadio" name="model" value="gfs" checked><label class="lblmdl">IMD-GFS</label>&nbsp;<input type="radio" class="modelRadio" name="model" value="wrf"><label class="lblmdl">IMD-WRF</label>&nbsp;<input type="radio" class="modelRadio" name="model" value="noaa" ><label class="lblmdl">NOAA-GFS</label></div>';
	return div;
};
models.addTo(map);

// Day selection
var dayselect = L.control({ position: 'topleft' });
dayselect.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info divday');
	div.innerHTML += '<div class="d-" title="Observed Day 1"><input type="radio" name="days" value="0" checked="checked" />Obs 1</div>';
	div.innerHTML += '<div class="d0" title="Observed Day 2"><input type="radio" name="days" value="1" />Obs 2</div>';
	div.innerHTML += '<div class="d1" title="Forecast Day 1"><input type="radio" name="days" value="2" />For 1</div>';
	div.innerHTML += '<div class="d2" title="Forecast Day 2"><input type="radio" name="days" value="3" />For 2</div>';
	div.innerHTML += '<div class="d3" title="Forecast Day 3"><input type="radio" name="days" value="4" />For 3</div>';
	div.innerHTML += '<div class="d4" title="Forecast Day 4"><input type="radio" name="days" value="5" />For 4</div>';
	div.innerHTML += '<div class="d5" title="Forecast Day 5"><input type="radio" name="days" value="6" />For 5</div>';
	div.innerHTML += '<div class="d6" title="Forecast Day 6"><input type="radio" name="days" value="7" />For 6</div>';
	return div;
};
dayselect.addTo(map);

/// Play Button
var dayplaybutton = L.control({ position: 'topleft' });
dayplaybutton.onAdd = function (map) {
	var div = L.DomUtil.create('div');
	div.innerHTML = '<div class="info" ><a href="#" id="play" class="myButton" onclick="playwatershed()" title="Animate"><img src="./images/play.png" id="imgplay" height="30" width="30" alt="Animate" /></a></div>';
	return div;
};
dayplaybutton.addTo(map);

// Displayaing date
var date = new Date();
var ctrlDate = L.control({ position: 'bottomleft' });
ctrlDate.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="ffdate" style="padding:5px;"> ' + date.getDate() + '-' + mname[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
	return div;
};
ctrlDate.addTo(map);

function playwatershed() {

	document.getElementById('divalert').style.display = 'none';
	if (curfield === undefined || curfield == null) {
		showmessage('Select variable');
		$("#loader").hide();
		return;
	}

	if (isPlay == true) {
		document.getElementById("imgplay").src = "./images/play.png";
		isPlay = false;
	} else {
		isPlay = true;
		document.getElementById("imgplay").src = "./images/pause.png";
	}
	if (modelname == 'wrf')
		nodays = 5;
	else
		nodays = 8;

	var myVar = setInterval(
		function () {
			if (isPlay == false) {
				clearInterval(myVar);
			} else {

				day++;
				if (day >= nodays) day = 0;

				$("[name=days]").removeAttr("checked");
				var presetValue = day;
				$("[name=days]").filter("[value='" + presetValue + "']").prop("checked", true);

				ajaxaddlayers(curlayer, curfield);

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

	ajaxaddlayers(curlayer, curfield);
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

function loaddata_old() {
	$("#loader").show();
	subdata = []; cwcdata = []; rchdata = []; daylst = [];
	//***************** loading datas ******************************
	let errdata = false;
	if (fileExist('./data/' + basincode + '_' + modelname + 'subwebsite.txt?t=' + new Date().getTime()) === 200) {
		readTextFile('./data/' + basincode + '_' + modelname + 'subwebsite.txt?t=' + new Date().getTime(), function (txt) {
			let subqueue = d3.queue();
			let lines = txt.split('\r\n');
			for (let line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					let dtstr = lines[line].split("_")[3].substring(0, 8);
					daylst.push(dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8));

					let flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					if (fileExist(flname) === 200)
						subqueue.defer(d3.csv, flname);
					else {
						errdata = true;
						loadingSubdataCompleted = true;
						//showmessage('No ouput generated [' + modelname + ']');
						console.log('File missing : ' + flname);
						break;
					}
				}
			}

			if (errdata === false) {
				subqueue.awaitAll(function (error, results) {
					if (error) {
						console.error("Subdata loading : " + error);
						$("#loader").hide();
						//return;
					}
					//Subbasin,PRECIPmm,WYLDmm,ETmm,SWmm
					subdata = results;
					let pcpdatalst = [], wylddatalst = [], etdatalst = [], swdatalst = [];
					for (let s = 0; s < subdata.length; s++) {
						let tmpdata = subdata[s];
						tmpdata.map(function (d) {
							let pcp = Number(d.PRECIPmm);
							let wy = Number(d.WYLDmm);
							let et = Number(d.ETmm);
							let sw = Number(d.SWmm);
							//console.log(wylddatalst.indexOf(wy));
							if (pcp > 0.1 && pcpdatalst.indexOf(pcp) === -1)
								pcpdatalst.push(pcp);
							if (wy > 0.1 && wylddatalst.indexOf(wy) === -1)
								wylddatalst.push(wy);
							if (et > 0.1 && etdatalst.indexOf(wy) === -1)
								etdatalst.push(et);
							if (sw > 0.1 && swdatalst.indexOf(wy) === -1)
								swdatalst.push(sw);
						});
					}

					//var pcpdomain = [], wylddomain = [], etdomain = [], swdomain = [];

					//var datalst = subdata[day].map(function (d) { return d[fldname]; });
					//datalst = datalst.filter(item => Number((Number(item).toFixed(1) > 0)));
					//console.log(datalst);
					//datalst = datalst.match(/\d+(?:\.\d+)?/g).map(Number)
					//var result = a.map(function (x) { 
					//    return parseInt(x, 10); 
					//});
					if (pcpdatalst.length == 0) {
						showmessage("Rainfall Not matching the criteria (>0.01)");
					} else {
						//pcpdatalst = removeDuplicates(pcpdatalst);
						pcpdatalst = pcpdatalst.map(Number);
						pcpdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});
						//console.log(pcpdatalst);
						let min = d3.min(pcpdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(pcpdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(pcpdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(pcpdatalst, .25).toFixed(1);
						let medval = d3.quantile(pcpdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(pcpdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(pcpdatalst, .9).toFixed(1);

						pcpdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}

					if (wylddatalst.length == 0) {
						showmessage("Water Yield Not matching the criteria (>0.01)");
					} else {
						//wylddatalst = removeDuplicates(wylddatalst);
						wylddatalst = wylddatalst.map(Number);
						wylddatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(wylddatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(wylddatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(wylddatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(wylddatalst, .25).toFixed(1);
						let medval = d3.quantile(wylddatalst, .5).toFixed(1);
						let higbreak = d3.quantile(wylddatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(wylddatalst, .9).toFixed(1);

						wylddomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}
					if (etdatalst.length == 0) {
						showmessage("Evapo-transpiration Not matching the criteria (>0.01)");
					} else {
						//etdatalst = removeDuplicates(etdatalst);
						etdatalst = etdatalst.map(Number);
						etdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(etdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(etdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(etdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(etdatalst, .25).toFixed(1);
						let medval = d3.quantile(etdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(etdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(etdatalst, .9).toFixed(1);

						etdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}
					if (swdatalst.length == 0) {
						showmessage("Soil Moisture status Not matching the criteria (>0.01)");
					} else {
						//swdatalst = removeDuplicates(swdatalst);
						swdatalst = swdatalst.map(Number);
						swdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(swdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(swdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(swdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(swdatalst, .25).toFixed(1);
						let medval = d3.quantile(swdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(swdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(swdatalst, .9).toFixed(1);

						swdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
						//subcolor.domain([Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)]);
					}
					loadingSubdataCompleted = true;
				});
			}
			else {
				// 	loadingSubdataCompleted = true;
				// 	showmessage(modelname + ' No SWAT runs [' + modelname + ']');
				// 	console.log(modelname + ' No SWAT runs [' + modelname + ']');
				$("#loader").hide();
				// 	//return;
			}

			if (daylst.length > 2)
				$('#rundate').text("Simulated using " + modelname.toUpperCase() + ' on ' + daylst[1]);
			else
				$('#rundate').text('No forecast today');
		});
	} else {
		loadingSubdataCompleted = true;
		//showmessage(modelname + ' No SWAT runs Rainfall [' + modelname + ']');
		console.log(modelname + ' No SWAT runs Rainfall [' + modelname + ']');
		$("#loader").hide();
		//return;
	}

	errdata = false;
	if (fileExist('./data/' + basincode + '_' + modelname + 'rchwebsite.txt?t=' + new Date().getTime()) === 200) {
		readTextFile('./data/' + basincode + '_' + modelname + 'rchwebsite.txt?t=' + new Date().getTime(), function (txt) {
			var rchqueue = d3.queue();
			var lines = txt.split('\r\n');
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					if (fileExist(flname) === 200)
						rchqueue.defer(d3.csv, flname);
					else {
						errdata = true;
						loadingRchdataCompleted = true;
						//showmessage('No ouput generated [' + modelname + ']');
						console.log('File missing : ' + flname);
						break;
					}
				}
			}
			if (errdata === false) {
				rchqueue.awaitAll(function (error, results) {
					if (error) {
						$("#loader").hide();
						// return;
					}
					rchdata = results;

					var flowdatalst = [];
					for (var s = 0; s < rchdata.length; s++) {
						var tmpdata = rchdata[s];

						// console.log(d3.extent(tmpdata, function (d) { 
						// 	return Number(d.FLOW_OUTcms) > 0.01 ? Number(d.FLOW_OUTcms): null; }));

						tmpdata.map(function (d) {
							if (Number(d.FLOW_OUTcms) > 0.01)
								flowdatalst.push(Number(d.FLOW_OUTcms));
						});
					}

					flowdatalst = removeDuplicates(flowdatalst);
					flowdatalst = flowdatalst.map(Number);
					flowdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					var min = d3.min(flowdatalst, function (d) { return Number(d); }).toFixed(1);
					var max = d3.max(flowdatalst, function (d) { return Number(d); }).toFixed(1);
					var lowestbreak = d3.quantile(flowdatalst, .1).toFixed(1);
					var lowbreak = d3.quantile(flowdatalst, .25).toFixed(1);
					var medval = d3.quantile(flowdatalst, .5).toFixed(1);
					var higbreak = d3.quantile(flowdatalst, .75).toFixed(1);
					var higestbreak = d3.quantile(flowdatalst, .9).toFixed(1);

					//console.log([min,max]);

					flowdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					loadingRchdataCompleted = true;
				});
			} else {
				loadingRchdataCompleted = true;
				console.log(modelname + ' RCH file loading error [' + modelname + ']');
				$("#loader").hide();
				//return;
			}
		});
	} else {
		loadingRchdataCompleted = true;
		//showmessage(modelname + ' No SWAT runs Stream flow [' + modelname + ']');
		console.log(modelname + ' Stream flow (rch) file does not exists [' + modelname + ']');
		$("#loader").hide();
		//return;
	}

	errdata = false;
	if (fileExist('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt?t=' + new Date().getTime()) === 200) {
		readTextFile('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt?t=' + new Date().getTime(), function (txt) {
			var cwcqueue = d3.queue();
			var lines = txt.split('\r\n');
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					if (fileExist(flname) === 200)
						cwcqueue.defer(d3.csv, flname);
					else {
						errdata = true;
						loadingCwcdataCompleted = true;
						//showmessage('No ouput generated');
						console.log('File missing : ' + flname);
						break;
					}
				}
			}
			if (errdata === false) {
				cwcqueue.awaitAll(function (error, results) {
					cwcdata = results;
					// var dateParse = d3.timeParse("%m/%d/%Y");
					var dateFormat = d3.timeFormat("%d-%b-%Y");
					// var parseTime = d3.timeParse("%d-%b-%y");
					var rfdatalst = [], ifdatalst = [];
					cwcdata[0].forEach(function (d) {
						d.Date = dateFormat(new Date(d.Date));
						d.Rainfall = +d.Rainfall;
						d.Inflow = +d.Inflow;

						rfdatalst.push(d.Rainfall);
						ifdatalst.push(d.Inflow);
					});

					// var dateParse = d3.timeParse("%m/%d/%Y");
					// var dateFormat = d3.timeFormat("%d-%b-%Y");
					// var parseTime = d3.timeParse("%d-%b-%y");
					// var rfdatalst = [], ifdatalst = [];
					// cwcdata[0].forEach(function (d) {
					// 	let dtconvert = dateFormat(dateParse(d.Date));
					// 	//console.log([new Date(dtconvert).getTime(), new Date().getTime()]);
					// 	if (new Date(dtconvert).getTime() < new Date().getTime()) {
					// 		dateParse = d3.timeParse("%d-%m-%Y");
					// 		dtconvert = dateFormat(dateParse(d.Date));
					// 		//console.log([d.Date ,dtconvert]);
					// 	}
					// 	//console.log([d.Date,dtconvert]);	

					// 	d.Date = dtconvert;// dateFormat(dateParse(d.Date));
					// 	d.Rainfall = +d.Rainfall;
					// 	d.Inflow = +d.Inflow;

					// 	rfdatalst.push(d.Rainfall);
					// 	ifdatalst.push(d.Inflow);
					// });

					rfdatalst = removeDuplicates(rfdatalst);
					rfdatalst = rfdatalst.map(Number);
					rfdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});
					//console.log(cwcdata);
					var min = d3.min(rfdatalst, function (d) { return Number(d); }).toFixed(1);
					var max = d3.max(rfdatalst, function (d) { return Number(d); }).toFixed(1);
					var lowestbreak = d3.quantile(rfdatalst, .1).toFixed(1);
					var lowbreak = d3.quantile(rfdatalst, .25).toFixed(1);
					var medval = d3.quantile(rfdatalst, .5).toFixed(1);
					var higbreak = d3.quantile(rfdatalst, .75).toFixed(1);
					var higestbreak = d3.quantile(rfdatalst, .9).toFixed(1);

					rfcwcdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];

					//******************************************
					ifdatalst = removeDuplicates(ifdatalst);
					ifdatalst = ifdatalst.map(Number);
					ifdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					//console.log(ifdatalst);

					var min = d3.min(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					var max = d3.max(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					var lowestbreak = d3.quantile(ifdatalst, .1).toFixed(1);
					var lowbreak = d3.quantile(ifdatalst, .25).toFixed(1);
					var medval = d3.quantile(ifdatalst, .5).toFixed(1);
					var higbreak = d3.quantile(ifdatalst, .75).toFixed(1);
					var higestbreak = d3.quantile(ifdatalst, .9).toFixed(1);

					ifcwcdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					loadingCwcdataCompleted = true;
					//console.log(rfcwcdomain);
					//console.log(ifcwcdomain);
				});
			} else {
				loadingCwcdataCompleted = true;
				//showmessage(modelname + ' No SWAT runs [' + modelname + ']');
				console.log(modelname + ' No SWAT runs [' + modelname + ']');
				$("#loader").hide();
				//return;
			}
		});
	} else {
		loadingCwcdataCompleted = true;
		console.log(modelname + ' CWC data file does not exist [' + modelname + ']');
		$("#loader").hide();
		//return;
	}

	if (fileExist('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv') === 200) {
		d3.csv('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv', function (error, data) {
			pcpchartdata = data.slice(0);
			// var dateParse = d3.timeParse("%m/%d/%Y");
			var dateFormat = d3.timeFormat("%d-%b-%Y");
			// var parseTime = d3.timeParse("%d-%b-%y");
			pcpchartdata.forEach(function (d) {
				d.Date = dateFormat(new Date(d.Date));
				d.Rainfall = +d.Rainfall;
				d.Inflow = +d.Inflow;
			});
		});
	} else {
		console.log(modelname + ' Chart data not available [' + modelname + ']');
	}

	$("#loader").hide();
}
function loaddata() {
	$("#loader").show();
	subdata = []; cwcdata = []; rchdata = []; daylst = [];
	//***************** loading datas ******************************
	readTextFile('./data/' + basincode + '_' + modelname + 'subwebsite.txt?t=' + new Date().getTime(), function (txt) {
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log(txt + ' File not found : ' + basincode + '_' + modelname + 'subwebsite.txt');
			$("#loader").hide();
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			console.log(txt + ' Error in File loading : ' + basincode + '_' + modelname + 'subwebsite.txt');
			$("#loader").hide();
		} else {
			let subqueue = d3.queue();
			let lines = txt.split('\r\n');
			for (let line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					let dtstr = lines[line].split("_")[3].substring(0, 8);
					daylst.push(dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8));
					let flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					subqueue.defer(d3.csv, flname);
				}
			}

			subqueue.awaitAll(function (error, results) {
				if (error) {
					$("#loader").hide();
					console.error("Subdata loading error : " + error);
				} else if (typeof (results) !== "undefined") {
					//Subbasin,PRECIPmm,WYLDmm,ETmm,SWmm
					subdata = results;
					let pcpdatalst = [], wylddatalst = [], etdatalst = [], swdatalst = [];
					for (let s = 0; s < subdata.length; s++) {
						let tmpdata = subdata[s];
						tmpdata.map(function (d) {
							let pcp = Number(d.PRECIPmm);
							let wy = Number(d.WYLDmm);
							let et = Number(d.ETmm);
							let sw = Number(d.SWmm);
							//console.log(wylddatalst.indexOf(wy));
							if (pcp > 0.1 && pcpdatalst.indexOf(pcp) === -1)
								pcpdatalst.push(pcp);
							if (wy > 0.1 && wylddatalst.indexOf(wy) === -1)
								wylddatalst.push(wy);
							if (et > 0.1 && etdatalst.indexOf(wy) === -1)
								etdatalst.push(et);
							if (sw > 0.1 && swdatalst.indexOf(wy) === -1)
								swdatalst.push(sw);
						});
					}

					if (pcpdatalst.length == 0) {
						showmessage("Rainfall Not matching the criteria (0.01>)");
					} else {

						pcpdatalst = pcpdatalst.map(Number);
						pcpdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(pcpdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(pcpdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(pcpdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(pcpdatalst, .25).toFixed(1);
						let medval = d3.quantile(pcpdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(pcpdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(pcpdatalst, .9).toFixed(1);

						pcpdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}

					if (wylddatalst.length == 0) {
						showmessage("Water Yield Not matching the criteria (0.01>)");
					} else {
						//wylddatalst = removeDuplicates(wylddatalst);
						wylddatalst = wylddatalst.map(Number);
						wylddatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(wylddatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(wylddatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(wylddatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(wylddatalst, .25).toFixed(1);
						let medval = d3.quantile(wylddatalst, .5).toFixed(1);
						let higbreak = d3.quantile(wylddatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(wylddatalst, .9).toFixed(1);

						wylddomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}
					if (etdatalst.length == 0) {
						showmessage("Evapo-transpiration Not matching the criteria (0.01>)");
					} else {
						//etdatalst = removeDuplicates(etdatalst);
						etdatalst = etdatalst.map(Number);
						etdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(etdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(etdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(etdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(etdatalst, .25).toFixed(1);
						let medval = d3.quantile(etdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(etdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(etdatalst, .9).toFixed(1);

						etdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
					}
					if (swdatalst.length == 0) {
						showmessage("Soil Moisture status Not matching the criteria (0.01>)");
					} else {
						//swdatalst = removeDuplicates(swdatalst);
						swdatalst = swdatalst.map(Number);
						swdatalst.sort(function (a, b) {
							return d3.ascending(a, b)
						});

						let min = d3.min(swdatalst, function (d) { return Number(d); }).toFixed(1);
						let max = d3.max(swdatalst, function (d) { return Number(d); }).toFixed(1);
						let lowestbreak = d3.quantile(swdatalst, .1).toFixed(1);
						let lowbreak = d3.quantile(swdatalst, .25).toFixed(1);
						let medval = d3.quantile(swdatalst, .5).toFixed(1);
						let higbreak = d3.quantile(swdatalst, .75).toFixed(1);
						let higestbreak = d3.quantile(swdatalst, .9).toFixed(1);

						swdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
						//subcolor.domain([Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)]);
					}
				}
				loadingSubdataCompleted = true;

				let msec = (new Date() - startedat);
				console.log("Subbasin data completed loading : " + (msec / 1000) + ' Seconds');

			});

			if (daylst.length > 2)
				$('#rundate').text("Simulated using " + modelname.toUpperCase() + ' on ' + daylst[1]);
			else
				$('#rundate').text('No forecast today');
		}
	});

	readTextFile('./data/' + basincode + '_' + modelname + 'rchwebsite.txt?t=' + new Date().getTime(), function (txt) {
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log('File not found : ' + basincode + '_' + modelname + 'rchwebsite.txt');
			$("#loader").hide();
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			console.log('Error in File loading : ' + basincode + '_' + modelname + 'rchwebsite.txt');
			$("#loader").hide();
		} else {
			var rchqueue = d3.queue();
			var lines = txt.split('\r\n');
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					rchqueue.defer(d3.csv, flname);
					// if (fileExist(flname) === 200)
					// else {
					// 	errrchdata = true;
					// 	loadingRchdataCompleted = true;
					// 	console.log('File missing : ' + flname);
					// 	break;
					// }
				}
			}

			rchqueue.awaitAll(function (error, results) {
				if (error) {
					$("#loader").hide();
					console.error("Rchdata loading error : " + error);
				} else if (typeof (results) !== "undefined") {
					rchdata = results;
					var flowdatalst = [];
					for (var s = 0; s < rchdata.length; s++) {
						var tmpdata = rchdata[s];

						// console.log(d3.extent(tmpdata, function (d) { 
						// 	return Number(d.FLOW_OUTcms) > 0.01 ? Number(d.FLOW_OUTcms): null; }));

						tmpdata.map(function (d) {
							if (Number(d.FLOW_OUTcms) > 0.01)
								flowdatalst.push(Number(d.FLOW_OUTcms));
						});
					}

					flowdatalst = removeDuplicates(flowdatalst);
					flowdatalst = flowdatalst.map(Number);
					flowdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					let min = d3.min(flowdatalst, function (d) { return Number(d); }).toFixed(1);
					let max = d3.max(flowdatalst, function (d) { return Number(d); }).toFixed(1);
					let lowestbreak = d3.quantile(flowdatalst, .1).toFixed(1);
					let lowbreak = d3.quantile(flowdatalst, .25).toFixed(1);
					let medval = d3.quantile(flowdatalst, .5).toFixed(1);
					let higbreak = d3.quantile(flowdatalst, .75).toFixed(1);
					let higestbreak = d3.quantile(flowdatalst, .9).toFixed(1);

					flowdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];
				}
				loadingRchdataCompleted = true;
				let msec = (new Date() - startedat);
				console.log("Reach data completed loading : " + (msec / 1000) + ' Seconds');
			});
		}
	});

	readTextFile('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt?t=' + new Date().getTime(), function (txt) {
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log('File not found : ' + basincode + '_' + modelname + 'cwcwebsite.txt');
			$("#loader").hide();
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			console.log('Error in File loading : ' + basincode + '_' + modelname + 'cwcwebsite.txt');
			$("#loader").hide();
		} else {
			var cwcqueue = d3.queue();
			var lines = txt.split('\r\n');
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
					cwcqueue.defer(d3.csv, flname);
					// if (fileExist(flname) === 200)
					// else {
					// 	errcwcdata = true;
					// 	loadingCwcdataCompleted = true;
					// 	//showmessage('No ouput generated');
					// 	console.log('File missing : ' + flname);
					// 	break;
					// }
				}
			}

			cwcqueue.awaitAll(function (error, results) {
				if (error) {
					$("#loader").hide();
					console.error("CWCdata loading error : " + error);
					// skip 0 it's error variable
					// console.log(results)
					// console.log([results.length, lines.length]);

					// for (i = 1; i < results.length; i++) {
					// 	console.log(results[i]);
					// }
				} else if (typeof (results) !== "undefined") {
					cwcdata = results;

					// var dateParse = d3.timeParse("%m/%d/%Y");
					var dateFormat = d3.timeFormat("%d-%b-%Y");
					// var parseTime = d3.timeParse("%d-%b-%y");
					var rfdatalst = [], ifdatalst = [];
					cwcdata[0].forEach(function (d) {
						d.Date = dateFormat(new Date(d.Date));
						d.Rainfall = +d.Rainfall;
						d.Inflow = +d.Inflow;

						rfdatalst.push(d.Rainfall);
						ifdatalst.push(d.Inflow);
					});

					// var dateParse = d3.timeParse("%m/%d/%Y");
					// var dateFormat = d3.timeFormat("%d-%b-%Y");
					// var parseTime = d3.timeParse("%d-%b-%y");
					// var rfdatalst = [], ifdatalst = [];
					// cwcdata[0].forEach(function (d) {
					// 	let dtconvert = dateFormat(dateParse(d.Date));
					// 	//console.log([new Date(dtconvert).getTime(), new Date().getTime()]);
					// 	if (new Date(dtconvert).getTime() < new Date().getTime()) {
					// 		dateParse = d3.timeParse("%d-%m-%Y");
					// 		dtconvert = dateFormat(dateParse(d.Date));
					// 		//console.log([d.Date ,dtconvert]);
					// 	}
					// 	//console.log([d.Date,dtconvert]);	

					// 	d.Date = dtconvert;// dateFormat(dateParse(d.Date));
					// 	d.Rainfall = +d.Rainfall;
					// 	d.Inflow = +d.Inflow;

					// 	rfdatalst.push(d.Rainfall);
					// 	ifdatalst.push(d.Inflow);
					// });

					rfdatalst = removeDuplicates(rfdatalst);
					rfdatalst = rfdatalst.map(Number);
					rfdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});
					//console.log(cwcdata);
					let min = d3.min(rfdatalst, function (d) { return Number(d); }).toFixed(1);
					let max = d3.max(rfdatalst, function (d) { return Number(d); }).toFixed(1);
					let lowestbreak = d3.quantile(rfdatalst, .1).toFixed(1);
					let lowbreak = d3.quantile(rfdatalst, .25).toFixed(1);
					let medval = d3.quantile(rfdatalst, .5).toFixed(1);
					let higbreak = d3.quantile(rfdatalst, .75).toFixed(1);
					let higestbreak = d3.quantile(rfdatalst, .9).toFixed(1);

					rfcwcdomain = [Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)];

					//******************************************
					ifdatalst = removeDuplicates(ifdatalst);
					ifdatalst = ifdatalst.map(Number);
					ifdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					//console.log(ifdatalst);

					let ifmin = d3.min(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					let ifmax = d3.max(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					let iflowestbreak = d3.quantile(ifdatalst, .1).toFixed(1);
					let iflowbreak = d3.quantile(ifdatalst, .25).toFixed(1);
					let ifmedval = d3.quantile(ifdatalst, .5).toFixed(1);
					let ifhigbreak = d3.quantile(ifdatalst, .75).toFixed(1);
					let ifhigestbreak = d3.quantile(ifdatalst, .9).toFixed(1);

					ifcwcdomain = [Number(ifmin), Number(iflowestbreak), Number(iflowbreak), Number(ifmedval), Number(ifhigbreak), Number(ifhigestbreak), Number(ifmax)];
				}
				loadingCwcdataCompleted = true;
				let msec = (new Date() - startedat);
				console.log("CWC data completed loading : " + (msec / 1000) + ' Seconds');
			});
		}
	});

	let chartmodelname = modelname == "noaa" ? '_NOAA-GFS' : '_IMD-' + modelname.toUpperCase();
	d3.csv('./data/' + modelname + '/' + basincode + chartmodelname + '_PCP_chart.csv?t=' + new Date().getTime(), function (error, data) {
		if (error) {
			if (error.currentTarget.status === 404) {
				console.error("Chart data : " + error.currentTarget.statusText + "" + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv');
			} else {
				console.error("Chart data : " + error);
			}
			$("#loader").hide();
		} else if (typeof (data) !== "undefined") {
			pcpchartdata = data.slice(0);
			// var dateParse = d3.timeParse("%m/%d/%Y");
			var dateFormat = d3.timeFormat("%d-%b-%Y");
			// var parseTime = d3.timeParse("%d-%b-%y");
			pcpchartdata.forEach(function (d) {
				d.Date = dateFormat(new Date(d.Date));
				d.Rainfall = +d.Rainfall;
				d.Inflow = +d.Inflow;
			});
			let msec = (new Date() - startedat);
			console.log("Chart data completed loading : " + (msec / 1000) + ' Seconds');
		}
		//console.log(data);
	});

	// if (fileExist('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv') === 200) {
	// } else {
	// 	console.log(modelname + ' Chart data not available [' + modelname + ']');
	// }

	$("#loader").hide();
}
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

	if (cwcdata == null || cwcdata == undefined) return '<h3>No data</h3>';
	else if (cwcdata.length < 1) return '<h3>No data</h3>';

	var data = cwcdata[0].filter(function (dv) {
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

	let imdheader = modelname == "noaa" ? 'National Oceanic and Atmospheric Administration' : 'NWP Rainfall Forecast by India Meteorological Department'

	newobj.append('div')
		.attr("id", "imdheader")
		.append('span').text(imdheader)

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
	var desctable = descripttable(dscrdata, ['Code', basincode], tbdescobj, false);

	var dscrdatavalue = FFdscrdata.filter(function (dv) {
		return dv.Basin == basincode;
	});
	tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var FFdesctable = descripttable(dscrdatavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], tbdescobj, true);

	return newobj.node();
}

function chart_subbasin(d) {
	if (isPlay == true) return;
	if (curfield !== 'PRECIPmm' && curfield !== 'FLOW_OUTcms') return;

	var feature = d.feature;
	var code = feature.properties.Subbasin;
	//var basename = feature.properties.name;

	var data = pcpchartdata.filter(function (dv) {
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

	let imdheader = modelname == "noaa" ? 'National Oceanic and Atmospheric Administration' : 'NWP Rainfall Forecast by India Meteorological Department'

	newobj.append('div')
		.attr("id", "imdheader")
		.append('span').text(imdheader)

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
	var desctable = descripttable(dscrdata, ['Code', basincode], tbdescobj, false);

	var dscrdatavalue = FFdscrdata.filter(function (dv) {
		return dv.Basin == basincode;
	});
	tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
	var FFdesctable = descripttable(dscrdatavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], tbdescobj, true);

	return newobj.node();
}

function resetlayers() {

	if (basincode == undefined || basincode == null) return;
	if (loadingLayers == true) {
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
	if (basincode == undefined || basincode == null) return;

	if (map.hasLayer(subgeojson))
		map.removeLayer(subgeojson);
	if (map.hasLayer(rchgeojson))
		map.removeLayer(rchgeojson);
	if (map.hasLayer(cwcgeojson))
		map.removeLayer(cwcgeojson);
	if (map.hasLayer(layerGroup))
		map.removeLayer(layerGroup);

	if (map.hasLayer(legend))
		map.removeLayer(legend);

	subgeojson = null;
	rchgeojson = null;
	cwcgeojson = null;

	//indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer, curfield, basincode;
	daylst = [], subdata = [], rchdata = [], cwcdata = [], pcpchartdata = [];

	$("[name=days]").removeAttr("checked");
	day = 0;
	$("[name=days]").filter("[value='" + day + "']").prop("checked", true);
	unsetHighlight(highlight);
}

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
function addlayer(prmlayer, fldname) {

	document.getElementById('divalert').style.display = 'none';
	if (loadingLayers == true) {
		showmessage('Wait basin is loading');
		$("#loader").hide();
		return;
	}
	if (prmlayer === undefined || fldname === undefined || prmlayer == null || fldname == null) {
		showmessage('Select Variable')
		$("#loader").hide();
		return;
	}

	if (basincode == undefined || basincode == null) {
		showmessage('Select basin')
		$("#loader").hide();
		return;
	}


	addinglayers = true;
	//console.log(new Date());
	//document.getElementById('loader').style.display = 'block';
	//$("#loader").show();

	if (map.hasLayer(subgeojson))
		map.removeLayer(subgeojson);
	if (map.hasLayer(rchgeojson))
		map.removeLayer(rchgeojson);
	if (map.hasLayer(cwcgeojson))
		map.removeLayer(cwcgeojson);

	// if (map.hasLayer(legend))
	// 	map.removeLayer(legend);

	var dated = day <= 1 ? 'Observed Dated : ' : 'Forecast Dated : ';
	if (day < daylst.length) {
		document.getElementById('ffdate').innerHTML = dated + daylst[day];
		if (prmlayer == 'sub' && subdata != undefined && subdata.length > 0) {

			if (fldname == 'PRECIPmm') {
				map.addLayer(rchgeojson);
				rchgeojson.eachLayer(function (layer) {
					layer.setStyle({
						color: "blue",
						fillColor: '#87CEEB',
						weight: 2
					});
				});
			}

			if (fldname == 'PRECIPmm')
				subcolor.domain(pcpdomain);
			else if (fldname == 'WYLDmm')
				subcolor.domain(wylddomain);
			else if (fldname == 'ETmm')
				subcolor.domain(etdomain);
			else if (fldname == 'SWmm')
				subcolor.domain(swdomain);

			clrange = subcolor.domain();
			console.log(clrange)
			map.addLayer(subgeojson);
			subgeojson.eachLayer(function (layer) {

				var datavalue = subdata[day].filter(function (dv) {
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

				}
			});

			loadlegend('sub')
			$("#loader").hide();
			addinglayers = false;
		} else if (prmlayer == 'rch' && rchdata != undefined && rchdata.length > 0) {

			subgeojson.eachLayer(function (layer) {
				layer.unbindTooltip();
				layer.setStyle({
					color: "#ccc",
					fillColor: '#eee',
					//fillOpacity: 0.12,
					weight: 1
				});
			});

			map.addLayer(subgeojson);
			map.addLayer(rchgeojson);

			// var minmax = d3.extent(rchdata[day], function (data) {
			// 	return Number(data[fldname]);
			// });
			// //var min = minmax[0], max = minmax[1];

			rchcolor = d3.scaleThreshold()
				.domain(flowdomain)
				.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

			var clrange = rchcolor.domain();

			rchgeojson.eachLayer(function (layer) {

				var datavalue = rchdata[day].filter(function (dv) {
					return dv.Subbasin == layer.feature.properties.Subbasin;
				});

				var gv = NaN;
				if (datavalue.length != 0) {
					gv = Number(datavalue[0][fldname]);
					layer.feature.properties.name = 'rch';
					layer.feature.properties.value = gv;

					var weight, fillcolor;
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

				} //else console.log("Error : " + fm.properties.Subbasin);

			});
			//if (map.hasLayer(legend))
			//    map.removeLayer(legend);
			loadlegend('rch')
			$("#loader").hide();
			addinglayers = false;
		}
		else if (prmlayer == 'cwc' && cwcdata != undefined && cwcdata.length > 0) {

			var datalst = [];
			map.addLayer(cwcgeojson);
			cwcgeojson.eachLayer(function (layer) {

				var datavalue = cwcdata[0].filter(function (dv) {
					return dv.Subbasin == layer.feature.properties.SUBBASIN;
				});

				var gv = NaN;
				if (datavalue.length != 0) {
					gv = Number(datavalue[day][fldname]);
					layer.feature.properties.name = 'cwc';
					layer.feature.properties.value = gv;

					datalst.push(gv);
				}

			});

			//Inflow,Rainfall
			if (fldname === "Rainfall")
				subcolor.domain(rfcwcdomain);
			else
				subcolor.domain(ifcwcdomain);

			clrange = subcolor.domain();

			cwcgeojson.eachLayer(function (layer) {
				var datavalue = cwcdata[0].filter(function (dv) {
					return dv.Subbasin == layer.feature.properties.SUBBASIN;
				});

				var gv = NaN;
				if (datavalue.length != 0) {
					gv = Number(datavalue[day][fldname]);

					//console.log([layer.feature.properties.SUBBASIN, gv]);

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
					console.log(layer.feature.properties.SUBBASIN);
				}
			});
			//map.fitBounds(indiageojson.getBounds())
			//map.fitBounds(cwcgeojson.getBounds());

			loadlegend('sub')
			$("#loader").hide();
			addinglayers = false;
		} else {
			$("#loader").hide();
			showmessage('No SWAT runs [' + modelname + ']');
			addinglayers = false;
		}

		if (map.hasLayer(subgeojson)) {
			map.fitBounds(subgeojson.getBounds());
		}
		curlayer = prmlayer;
		curfield = fldname;

	} else {
		addinglayers = false;
		$("#loader").hide();
		document.getElementById('ffdate').innerHTML = 'No data available';
	}
	//document.getElementById('loader').style.display = 'none';
	//console.log(new Date());
}

$(".modelRadio").click(function () {

	if (loadingLayers == true) {
		showmessage('Wait layers are loading');

		$("[name=model]").removeAttr("checked");
		if (modelname == 'wrf')
			$("[name=model]").filter("[value='wrf']").prop("checked", true);
		else
			$("[name=model]").filter("[value='gfs']").prop("checked", true);

		return;
	}

	if (isPlay == true) {
		isPlay = false;
		document.getElementById("imgplay").src = "./images/play.png";
	}

	var thisValue = $(this).attr("value");
	modelname = thisValue;

	if (modelname == 'wrf') {
		$("div.d4").hide();
		$("div.d5").hide();
		$("div.d6").hide();
		nodays = 5

		if (day > 4) {
			day = 0;
			$("[name=days]").removeAttr("checked");
			$("[name=days]").filter("[value='" + day + "']").prop("checked", true);
		}

	} else {
		$("div.d4").show();
		$("div.d5").show();
		$("div.d6").show();
		nodays = 8
	}

	//resetlayers();
	loadingSubdataCompleted = false;
	loadingRchdataCompleted = false;
	loadingCwcdataCompleted = false;
	startedat = new Date();
	loaddata();

	if (curlayer != null && curfield != null) {
		if ($("#loader").is(':hidden')) { $("#loader").show(); }
		var dataSpin = setInterval(
			function () {
				if (loadingSubdataCompleted == true && loadingRchdataCompleted == true && loadingCwcdataCompleted == true) {
					//if (subdata.length > 0 && cwcdata.length > 0 && rchdata.length > 0 && daylst.length > 0) {
					$("#loader").hide();
					clearInterval(dataSpin);
					addlayer(curlayer, curfield)
				}
			}, 1000);
	}

	if (document.getElementById('infolegend'))
		document.getElementById('infolegend').style.display = 'none';
	if (document.getElementById('divalert'))
		document.getElementById('divalert').style.display = 'none';

});

$("input:radio[name=days]").click(function () {
	var value = $(this).val();
	day = Number(value);

	if (isPlay == true || day > nodays) {
		$("#loader").hide();
		return;
	}
	if (loadingLayers == true) {
		showmessage('Wait basin is loading');
		return;
	}

	if (curlayer != null && curfield != null) {
		ajaxaddlayers(curlayer, curfield);
	}
});

// map.on('click', function (e) {
// 	//map.spin(false);
// });

function ajaxaddlayers(curlayer, curfield) {
	if (basincode == undefined || basincode == null || basincode == '') {
		showmessage('Select basin');
	} else {
		if (addinglayers == true) {
			showmessage('Please wait layer is loading')
		} else {
			$("#loader").show();
			addlayer(curlayer, curfield);
		}

		// addinglayers = false;
		// var calladdlayers = 0;
		// var loaderSpin = setInterval(
		// 	function () {
		// 		if (addinglayers == true) {
		// 			$("#loader").hide();
		// 			clearInterval(loaderSpin);
		// 		} if (calladdlayers == 0) {
		// 			$("#loader").show();
		// 			calladdlayers++;
		// 			addlayer(curlayer, curfield);
		// 		}
		// 	}, 1000);
	}
}

const visitor = document.getElementById('visitor');
if (sessionStorage.getItem('counter') != null) {
	// console.log('page was counter');
	txt = sessionStorage.getItem('counter');
	console.log(txt);
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
	readTextFile('counter.php', function (txt) {
		console.log(txt);
		sessionStorage.setItem('counter', txt);
		let eleBullet = "<ul><li>Visitor Counter : </li>"
		for (var i = 0; i < txt.length; i++) {
			if (txt[i] != "" && txt[i] != " ") {
				eleBullet += "<li>" + txt[i] + "</li>";
			}
		}
		eleBullet += "<ul>";
		visitor.innerHTML = eleBullet;
	})
}

 // could be anything

// readTextFile('counter.php', function(txt){
// 	console.log(txt);
// 	console.log(txt.length);
// 	const visitor = document.getElementById('visitor');
// 	let eleBullet = "<ul><li>Visitors : </li>"
// 	for(var i =0; i< txt.length; i++){
// 		console.log(txt[i]);
// 		if(txt[i] != "" && txt[i] != " "){
// 			eleBullet += "<li>" + txt[i] + "</li>";
// 		}
// 	}
// 	eleBullet += "<ul>";
// 	visitor.innerHTML = eleBullet;
// })

