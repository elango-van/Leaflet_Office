
var prmWeather = 'PCP', isPlay = false, day = 0, wsopacity = 0.5, gfseqday = '', wrfeqday = '';
var gfsIndiaBasinGeojson, wrfIndiaBasinGeojson;
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var gfsflst = [], wrfflst = [];

gfsflst['PCP'] = [];
var flname = "./data/PCP_gfscwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var gfsflname = "./data/gfs/forecast/" + lines[line] + '.tif';
					if (fileExist(gfsflname) === 200) {
						gfsflst['PCP'].push(lines[line] + '.tif');
					}
				}
			}
			if (gfsflst['PCP'].length > 0) {
				var tmpdate = gfsflst['PCP'][0].substring(0, 10)
				var curday = new Date().getDate();
				var ffday = new Date(tmpdate).getDate();

				if (curday >= ffday) {
					//gfseqday = ' * Forecast is not updated today'
					//gfseqday = " (Forecast updated on " + formatDate(ffday) + ")"
    				var dt = new Date(tmpdate);
                    dt.setDate(dt.getDate() - 1);
                    var tstdate = dt.getDate() + '-'  + mname[dt.getMonth()] + '-' + dt.getFullYear(); 
					gfseqday = " (Forecast issued on:" + tstdate + ")";
				}
				//console.log("========= GFS ========")
				//console.log([tmpdate]);
				//console.log([curday, ffday]);
			}
		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> PCP GFS file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

gfsflst['TMAX'] = [];
flname = "./data/TMAX_gfscwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		//console.log(lines);
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					var wrfflname = "./data/gfs/forecast/" + lines[line] + '.tif';
					if (fileExist(wrfflname) === 200) {
						gfsflst['TMAX'].push(lines[line] + '.tif');
					} else {
						console.log(wrfflname + ' does not exits ')
					}
				}
			}
			//console.log(gfsflst);
		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> TMAX GFS file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

gfsflst['TMIN'] = [];
flname = "./data/TMIN_gfscwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		//console.log(lines);
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					if (fileExist("./data/gfs/forecast/" + lines[line] + '.tif') === 200) {
						gfsflst['TMIN'].push(lines[line] + '.tif');
					}
				}
			}
			//console.log(gfsflst);
		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> TMIN GFS file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

///@@@@@@@@@@@@@ WRF files loading @@@@@@@@@@@@@@@@@@@@/////////
wrfflst['PCP'] = [];
var flname = "./data/PCP_wrfcwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		//console.log(lines);
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					if (fileExist("./data/wrf/forecast/" + lines[line] + '.tif') === 200) {
						wrfflst['PCP'].push(lines[line] + '.tif');
					}
				}
			}
			if (wrfflst['PCP'].length > 0) {
				var tmpdate = wrfflst['PCP'][0].substring(0, 10)
				var curday = new Date().getDate();
				var ffday = new Date(tmpdate).getDate();
				if (curday >= ffday) {
					//wrfeqday = ' * Forecast is not updated today'
					//wrfeqday = " (Forecast updated on " + formatDate(ffday) + ")"
        			var dt = new Date(tmpdate);
                    dt.setDate(dt.getDate() - 1);
                    var tstdate = dt.getDate() + '-'  + mname[dt.getMonth()] + '-' + dt.getFullYear(); 

					wrfeqday = " (Forecast issued on:" + tstdate + ")"
				}
				//console.log("========= WRF ========")
				//console.log([tmpdate]);
				//console.log([curday, ffday]);
			}

		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> PCP WRF file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

wrfflst['TMAX'] = [];
flname = "./data/TMAX_wrfcwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		//console.log(lines);
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					if (fileExist("./data/wrf/forecast/" + lines[line] + '.tif') === 200) {
						wrfflst['TMAX'].push(lines[line] + '.tif');
					}
				}
			}
			//console.log(wrfflst);
		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> TMAX WRF file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

wrfflst['TMIN'] = [];
flname = "./data/TMIN_wrfcwcwebsite.txt"
if (fileExist(flname) === 200) {
	readTextFile(flname, function (txt) {
		var lines = txt.split('\r\n');
		//console.log(lines);
		if (lines.length === 0) {
			console.log(flname + ' this file is empty');
		} else {
			for (var line = 0; line < lines.length; line++) {
				if (lines[line] !== '') {
					if (fileExist("./data/wrf/forecast/" + lines[line] + '.tif') === 200) {
						wrfflst['TMIN'].push(lines[line] + '.tif');
					}
				}
			}
			//console.log(wrfflst);
		}
	});
} else {
	document.getElementById('loaderContainer').style.display = 'none';
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> TMIN WRF file does not exist';
	document.getElementById('divalert').style.display = 'inline';
}

function getDate(d) {
	var day, month, year;

	result = d.match("[0-9]{2}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{4}");
	if (null != result) {
		dateSplitted = result[0].split(result[1]);
		day = dateSplitted[0];
		month = dateSplitted[1];
		year = dateSplitted[2];
	}
	result = d.match("[0-9]{4}([\-/ \.])[0-9]{2}[\-/ \.][0-9]{2}");
	if (null != result) {
		dateSplitted = result[0].split(result[1]);
		day = dateSplitted[2];
		month = dateSplitted[1];
		year = dateSplitted[0];
	}

	if (month > 12) {
		aux = day;
		day = month;
		month = aux;
	}

	return day + "-" + mname[month - 1] + "-" + year;
}

//var gfsint = setInterval(function () {
//    if (Object.keys(gfsflst).length > 0) {
//        console.log(gfsflst);
//        gfsflst.PCP.forEach(function (entry) {
//            console.log(entry);
//        });
//        clearInterval(gfsint);
//    }
//}, 1000);

//var wrfint = setInterval(function () {
//    if (Object.keys(wrfflst).length > 0) {
//        console.log(wrfflst);
//        wrfflst.PCP.forEach(function (entry) {
//            console.log(entry);
//            console.log(getDate(entry));
//        });
//        clearInterval(wrfint);
//    }
//}, 1000);
var gfsOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	lang: 'en',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> '
});

var mapgfs = new L.Map('mapgfs',
	{
		zoomControl: false,
		layers: [gfsOSM],
		center: new L.LatLng(0, 0),
		minZoom: 4,
		zoom: 4
	});

//mapgfs.spin(true);

//mapgfs.createPane('labels');
//mapgfs.getPane('labels').style.zIndex = 650;
//mapgfs.getPane('labels').style.pointerEvents = 'none';

//var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>, <a href="http://inrm.co.in">INRM</a>';
//var gfsLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
//    attribution: cartodbAttribution,
//    lang: 'en',
//    pane: 'labels'
//}).addTo(mapgfs);

////////////////************ WRF Loading ******************////////////////////
var wrfOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18,
	lang: 'en',
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var mapwrf = new L.Map('mapwrf',
	{
		zoomControl: false,
		layers: [wrfOSM],
		center: new L.LatLng(0, 0),
		minZoom: 4,
		zoom: 4
	});

mapgfs.sync(mapwrf);
mapwrf.sync(mapgfs);

//mapwrf.spin(true);

//mapwrf.createPane('labels');
//mapwrf.getPane('labels').style.zIndex = 650;
//mapwrf.getPane('labels').style.pointerEvents = 'none';

////var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
//var wrfLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
//    attribution: cartodbAttribution,
//    pane: 'labels'
//}).addTo(mapwrf);

var gfsloading = true, wrfloading = true;

let gfslayerGeo = null, wrflayerGeo = null, gfsminmax = [], wrfminmax = [];
//var color = d3.scaleOrdinal().domain([1, 17]).range(colorbrewer.Paired[12]);
function loadGFSTiff(flname) {
	if (mapgfs.hasLayer(gfslayerGeo))
		mapgfs.removeLayer(gfslayerGeo);

	if (fileExist(flname) !== 200) return;
	gfsloading = true;
	gfsminmax = [];
	mapgfs.spin(true);
	d3.request(flname).responseType('arraybuffer').get(
		function (error, tiffData) {

			if (error) {
				mapwrf.spin(false);
				console.log(error);

				//alert('WRF Tiff file Loading error');
				//return;
			}

			// Geopotential height (BAND 0)
			let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);
			//console.log(geo.range)
			gfsminmax = geo.range;
			//let layer = L.canvasLayer.scalarField(ndvi, { color: chroma.scale('YlGn').domain(ndvi.range), inFilter: (v) => v !== 0 }).addTo(map);
			gfslayerGeo = L.canvasLayer.scalarField(geo, {
				//color: chroma.scale('Blues').domain(geo.range),
				//color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range),
				//color: d3.scaleLinear().domain(geo.range).range(colorbrewer.YlOrRd[9]),
				opacity: 0.75,
				inFilter: (v) => v !== 0
			}).addTo(mapgfs);

			//console.log(gfslayerGeo.range)

			gfslayerGeo.on('click', function (e) {
				if (e.value !== null) {
					let v = Number(e.value).toFixed(1);
					//if (prmWeather == 'PCP')
					//    document.getElementById('gfsinfoid').innerHTML = 'Rainfall ' + v + ' mm';
					//else
					//    document.getElementById('gfsinfoid').innerHTML = 'Temperature ' + v + ' degC';
					let html = '';
					if (prmWeather == 'PCP')
						html = (`<span class="popupText">Rainfall ${v} mm</span>`);
					else
						html = (`<span class="popupText">Temperature ${v} degC</span>`);

					let popup = L.popup()
						.setLatLng(e.latlng)
						.setContent(html)
						.openOn(mapgfs);
				}
			});
			gfslayerGeo.on('mousemove', function (e) {
				mapgfs.closePopup()
			});
			//gfslayerGeo.on('mouseout', function (e) {
			//    mapgfs.closePopup()
			//});

			if (mapgfs.hasLayer(gfsIndiaBasinGeojson))
				mapgfs.removeLayer(gfsIndiaBasinGeojson);

			mapgfs.addLayer(gfsIndiaBasinGeojson);
			//mapgfs.fitBounds(gfslayerGeo.getBounds());
			mapgfs.spin(false);
			gfsloading = false;
		});
}

function loadWRFTiff(flname) {
	if (mapwrf.hasLayer(wrflayerGeo))
		mapwrf.removeLayer(wrflayerGeo);

	if (fileExist(flname) !== 200) return;

	wrfminmax = [];
	wrfloading = true;
	mapwrf.spin(true);
	d3.request(flname).responseType('arraybuffer').get(
		function (error, tiffData) {
			if (error) {
				mapwrf.spin(false);

				console.log(error);

				//alert('WRF Tiff file Loading error');
				//return;
			}
			// Geopotential height (BAND 0)
			let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);
			//console.log('WRF')
			//console.log(geo.range)
			//console.log(geo.params.zs)
			//console.log(
			//    geo.params.zs.filter(function (n) {
			//        return n > 0;
			//    }));
			//console.log(geo.range);
			wrfminmax = geo.range;
			wrflayerGeo = L.canvasLayer.scalarField(geo, {
				//chroma(color).brighten(2)
				//color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range),
				//color: d3.scaleLinear().domain(geo.range).range(colorbrewer.YlOrRd[9]),
				opacity: 0.75,
				inFilter: (v) => v !== 0
			}).addTo(mapwrf);

			wrflayerGeo.on('click', function (e) {
				if (e.value !== null) {
					let v = Number(e.value).toFixed(1);
					//if (prmWeather == 'PCP')
					//    document.getElementById('wrfinfoid').innerHTML = 'Rainfall ' + v + ' mm';
					//else
					//    document.getElementById('wrfinfoid').innerHTML = 'Temperature ' + v + ' degC';

					//let html = (`<span class="popupText">Rainfall ${v} mm</span>`);

					let html = '';
					if (prmWeather == 'PCP')
						html = (`<span class="popupText">Rainfall ${v} mm</span>`);
					else
						html = (`<span class="popupText">Temperature ${v} degC</span>`);

					let popup = L.popup()
						.setLatLng(e.latlng)
						.setContent(html)
						.openOn(mapwrf);
				}
			});

			wrfIndiaBasinGeojson.on('mousemove', function (e) {
				mapwrf.closePopup()
			});

			if (mapwrf.hasLayer(wrfIndiaBasinGeojson))
				mapwrf.removeLayer(wrfIndiaBasinGeojson);

			mapwrf.addLayer(wrfIndiaBasinGeojson);
			//mapwrf.fitBounds(wrflayerGeo.getBounds());
			mapwrf.spin(false);
			wrfloading = false;
		});
}

//var layerGroup = L.layerGroup().addTo(mapgfs);
var indiaurl = "./json/AllBasin_WGS84_01.json"
if (fileExist(indiaurl) !== 200) {
	document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India Json file does not exist';
	document.getElementById('divalert').style.display = 'inline';
	//return false;
}

// loading GeoJSON file - Here my html and usa_adm.geojson file resides in same folder
$.getJSON(indiaurl, function (data) {

	//topoob = JSON.parse(basinreq.responseText)
	var objname = Object.keys(data.objects)[0];
	//neighbors = topojson.neighbors(data.objects[objname].geometries);
	var gfsTopoJson = topojson.feature(data, data.objects[objname])
	var wrfTopoJson = topojson.feature(data, data.objects[objname])
	//indiaTopoJson.features = indiaTopoJson.features.map(function (fm, i) {
	//    var ret = fm;
	//    ret.ind = i;
	//    return ret
	//});
	gfsIndiaBasinGeojson = L.geoJson(gfsTopoJson, {
		style: {
			color: "#ccc",
			//dashArray: "20,25",
			fillColor: "transparent",
			fillOpacity: 0,
			weight: 0.8
		}, onEachFeature: onEachBasinLayer
	}).addTo(mapgfs)
	mapgfs.fitBounds(gfsIndiaBasinGeojson.getBounds())

	wrfIndiaBasinGeojson = L.geoJson(wrfTopoJson, {
		style: {
			color: "#ccc",
			//dashArray: "20,25",
			fillColor: "transparent",
			fillOpacity: 0,
			weight: 0.8
		}, onEachFeature: onEachBasinLayer
	}).addTo(mapwrf)
	mapwrf.fitBounds(wrfIndiaBasinGeojson.getBounds())

	//mapgfs.spin(false);
});

function onEachBasinLayer(feature, layer) {
	layer.bindTooltip(feature.properties['Basin_Name'], {
		className: 'basintooltip',
		closeButton: false,
		offset: L.point(0, -20)
	});
}

var weather = L.control({ position: 'topleft' });
weather.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info');
	div.innerHTML += '<h3 id="imdmodel">IMD NWP Weather</h3>';
	div.innerHTML += '<div title="Select Weather" ><input type="radio" class="weatherRadio" name="model" value="PCP" checked ><label class="lblmdl">Rainfall</label>&nbsp;<input type="radio" class="weatherRadio" name="model" value="TMAX"><label class="lblmdl">Temperature Max</label>&nbsp;<input type="radio" class="weatherRadio" name="model" value="TMIN"><label class="lblmdl">Temperature Min</label></div > ';
	return div;
};
weather.addTo(mapgfs);

// Day selection
var dayselect = L.control({ position: 'topleft' });
dayselect.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info divday');
	div.innerHTML = '<div class="d-" title="Forecast Day 1"><input type="radio" name="days" value="0" checked="checked" />Day 1</div>';
	div.innerHTML += '<div class="d0" title="Forecast Day 2"><input type="radio" name="days" value="1" />Day 2</div>';
	div.innerHTML += '<div class="d1" title="Forecast Day 3"><input type="radio" name="days" value="2" />Day 3</div>';
	div.innerHTML += '<div class="d2" title="Forecast Day 4"><input type="radio" name="days" value="3" />Day 4</div>';
	div.innerHTML += '<div class="d3" title="Forecast Day 5"><input type="radio" name="days" value="4" />Day 5</div>';
	div.innerHTML += '<div class="d4" title="Forecast Day 6"><input type="radio" name="days" value="5" />Day 6</div>';
	return div;
};
dayselect.addTo(mapgfs);

/// Play Button
var dayplaybutton = L.control({ position: 'topleft' });
dayplaybutton.onAdd = function (map) {
	var div = L.DomUtil.create('div');
	div.innerHTML = '<div class="info" ><a href="#" id="play" class="myButton" onclick="playwatershed()" title="Animate"><img src="./images/play.png" id="imgplay" height="30" width="30" alt="Animate" /></a></div>';
	return div;
};
dayplaybutton.addTo(mapgfs);

// Displayaing date
var date = new Date();
var gfsDate = L.control({ position: 'bottomleft' });
gfsDate.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="gfsdateid" style="padding:5px;"> ' + date.getDate() + '-' + mname[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
	return div;
};
gfsDate.addTo(mapgfs);

//add zoom control with your options
L.control.zoom({
	position: 'topright'
}).addTo(mapgfs);

L.control.zoom({
	position: 'topright'
}).addTo(mapwrf);

var gfsInfo = L.control({ position: 'topright' });
gfsInfo.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="gfsinfoid" style="padding:5px; color:maroon;">GFS</span>';
	return div;
};
gfsInfo.addTo(mapgfs);

var wrfDate = L.control({ position: 'bottomleft' });
wrfDate.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="wrfdateid" style="padding:5px;"> ' + date.getDate() + '-' + mname[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
	return div;
};
wrfDate.addTo(mapwrf);

var wrfInfo = L.control({ position: 'topright' });
wrfInfo.onAdd = function (map) {
	var div = L.DomUtil.create('div', 'info ffdate');
	div.innerHTML = '<span id="wrfinfoid" style="padding:5px; color:maroon;">WRF</span>';
	return div;
};
wrfInfo.addTo(mapwrf);

//// Register event to enable/disable dragging on mouse out.
//map.on('mouseout', function () {
//    map.dragging.disable();
//});
//map.on('mouseover', function () {
//    map.dragging.enable();
//});

//// Disable dragging when user's cursor enters the element
//info.getContainer().addEventListener('mouseover', function () {
//    map.dragging.disable();
//});

//// Re-enable dragging when user's cursor leaves the element
//info.getContainer().addEventListener('mouseout', function () {
//    map.dragging.enable();
//});

//document.addEventListener('DOMContentLoaded', function () {
//    document.getElementById('play').addEventListener('click', function () {
//        alert('hiii');
//        playwatershed();
//    }, false);
//}, false);

//var info = L.control({ position: 'topright' });
//info.onAdd = function (map) {
//    this._div = L.DomUtil.create('div', 'info ffdate');
//    this.update();
//    return this._div;
//}

//info.update = function (props) {
//    //console.log(props)
//    if (typeof (props) !== 'undefined') {
//        //console.log(props ? Object.keys(props) : props);//undefined
//        this._div.innerHTML = "<h4>Subbasin No : " + (props.Subbasin ? props.Subbasin : "") + "</h4> <div style='text-align:center;'> " + (props.value ? props.value : "") + "</div>"
//    } else
//        this._div.innerHTML = "<h4>Subbasin No : </h4>";
//}
//info.addTo(mapgfs);

function dateUpdation(model, ffdate) {

	if (ffdate == null) return;

	var tmpdate = ffdate.substring(0, 10).split('-')

	//console.log(model + ' ffdate : ' + ffdate)
	//console.log(model + ' tmpdate : '+tmpdate)

	//var curday = new Date().getDate();
	//var ffday = new Date(tmpdate).getDate();
	//if (curday === ffday)
	//    eqday = ' * Forecast is not updated today'
	//console.log([curday, ffday]);

	// forecast is not updated today
	//
	if (model == "gfs") {
		document.getElementById('gfsdateid').innerText = tmpdate[2] + '-' + mname[Number(tmpdate[1]) - 1] + '-' + tmpdate[0] + gfseqday
	} else if (model == "wrf") {
		document.getElementById('wrfdateid').innerText = tmpdate[2] + '-' + mname[Number(tmpdate[1]) - 1] + '-' + tmpdate[0] + wrfeqday
	}
}
function playwatershed() {

	document.getElementById('divalert').style.display = 'none';

	//if (curfield === undefined || curfield == null) {
	//    showmessage('Select variable');
	//    return;
	//}

	if (isPlay == true) {
		//document.getElementById('play').value = 'Play';
		//document.getElementById('play').innerHTML = 'Play';
		document.getElementById("imgplay").src = "./images/play.png";
		isPlay = false;
	} else {
		isPlay = true;
		//document.getElementById('play').value = 'Stop';
		//document.getElementById('play').innerHTML = 'Stop';
		document.getElementById("imgplay").src = "./images/pause.png";
	}

	var playInterval = setInterval(
		function () {
			if (isPlay == false) {
				clearInterval(playInterval);
			} else {

				if (wrfloading === true || gfsloading === true) return;

				day++;
				if (day >= 6) {
					clearInterval(playInterval);
					day = 0;
					playwatershed();
				}

				$("[name=days]").removeAttr("checked");
				var presetValue = day;
				$("[name=days]").filter("[value='" + presetValue + "']").prop("checked", true);

				if (prmWeather == 'PCP') {
					if (gfsflst.PCP.length > 0) {
						loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[day]);
						dateUpdation("gfs", gfsflst.PCP[day])
					}
					if (day < 3 && wrfflst.PCP.length > 0) {
						loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[day]);
						dateUpdation("wrf", wrfflst.PCP[day])
					} else if (mapwrf.hasLayer(wrflayerGeo)) {
						mapwrf.removeLayer(wrflayerGeo);
					}
				} else if (prmWeather == 'TMAX') {
					if (gfsflst.TMAX.length > 0) {
						loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[day]);
						dateUpdation("gfs", gfsflst.TMAX[day])
					}
					if (day < 3 && wrfflst.TMAX.length > 0) {
						loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[day]);
						dateUpdation("wrf", wrfflst.TMAX[day])
					} else if (mapwrf.hasLayer(wrflayerGeo)) {
						mapwrf.removeLayer(wrflayerGeo);
					}
				} else if (prmWeather == 'TMIN') {
					if (gfsflst.TMIN.length > 0) {
						loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[day]);
						dateUpdation("gfs", gfsflst.TMIN[day])
					}
					if (day < 3 && wrfflst.TMIN.length > 0) {
						loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[day]);
						dateUpdation("wrf", wrfflst.TMIN[day])
					} else if (mapwrf.hasLayer(wrflayerGeo)) {
						mapwrf.removeLayer(wrflayerGeo);
					}
				}
				loadlegend();
			}
		}, 5000);
}

$(".weatherRadio").click(function () {
	//if (isPlay == true) return;
	document.getElementById('divalert').style.display = 'none';
	isPlay = false;
	day = 0;
	$("[name=days]").removeAttr("checked");
	$("[name=days]").filter("[value='" + day + "']").prop("checked", true);

	//console.log(gfsflst);
	//console.log(wrfflst);

	var thisValue = $(this).attr("value");
	prmWeather = thisValue;
	//resetlayers();
	if (prmWeather == 'PCP') {
		if (gfsflst.PCP.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[0]);
			dateUpdation("gfs", gfsflst.PCP[0])
		}
		if (wrfflst.PCP.length > 0) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[0]);
			dateUpdation("wrf", wrfflst.PCP[0])
		}
	} else if (prmWeather == 'TMAX') {
		if (gfsflst.TMAX.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[0]);
			dateUpdation("gfs", gfsflst.TMAX[0])
		}
		if (wrfflst.TMAX.length > 0) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[0]);
			dateUpdation("wrf", wrfflst.TMAX[0])
		}
	} else if (prmWeather == 'TMIN') {
		if (gfsflst.TMIN.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[0]);
			dateUpdation("gfs", gfsflst.TMIN[0])
		}
		if (wrfflst.TMIN.length > 0) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[0]);
			dateUpdation("wrf", wrfflst.TMIN[0])
		}
	}

	//if (prmWeather == 'wrf') {
	//    $("div.d4").hide();
	//    $("div.d5").hide();
	//    $("div.d6").hide();
	//} else {
	//    $("div.d4").show();
	//    $("div.d5").show();
	//    $("div.d6").show();
	//}
	loadlegend();
});

$("input:radio[name=days]").click(function () {
	if (isPlay == true) return;
	var value = $(this).val();
	day = Number(value);

	//console.log(gfsflst);
	//console.log(wrfflst);

	if (prmWeather == 'PCP') {
		if (gfsflst.PCP.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[day]);
			dateUpdation("gfs", gfsflst.PCP[day])
		}
		if (day < 3 && wrfflst.PCP.length > 0) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[day]);
			dateUpdation("wrf", wrfflst.PCP[day])
		} else if (mapwrf.hasLayer(wrflayerGeo)) {
			mapwrf.removeLayer(wrflayerGeo);
		}
	} else if (prmWeather == 'TMAX') {
		if (gfsflst.TMAX.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[day]);
			dateUpdation("gfs", gfsflst.TMAX[day])
		}
		if (day < 3 && wrfflst.TMAX.length) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[day]);
			dateUpdation("wrf", wrfflst.TMAX[day])
		} else if (mapwrf.hasLayer(wrflayerGeo)) {
			mapwrf.removeLayer(wrflayerGeo);
		}
	} else if (prmWeather == 'TMIN') {
		if (gfsflst.TMIN.length > 0) {
			loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[day]);
			dateUpdation("gfs", gfsflst.TMIN[day])
		}
		if (day < 3 && wrfflst.TMIN.length > 0) {
			loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[day]);
			dateUpdation("wrf", wrfflst.TMIN[day])
		} else if (mapwrf.hasLayer(wrflayerGeo)) {
			mapwrf.removeLayer(wrflayerGeo);
		}
	}

	loadlegend();

});

var gfsint = setInterval(function () {
	if (typeof (gfsflst) !== 'undefined') {

		//console.log(gfsflst['PCP']);
		//console.log(Object.keys(gfsflst['PCP']).length);
		//console.log(Object.keys(gfsflst).length);

		if (gfsflst['PCP'].length !== 0) {
			//console.log('GFS : ' + gfsflst['PCP'][0]);
			loadGFSTiff("./data/gfs/forecast/" + gfsflst['PCP'][0]);
			dateUpdation("gfs", gfsflst.PCP[0])

			//gfsflst.PCP.forEach(function (entry) {
			//    console.log(entry);
			//});

			clearInterval(gfsint);
		}
	}
}, 1000);
var wrfint = setInterval(function () {
	if (typeof (wrfflst) !== 'undefined') {

		//console.log(wrfflst['PCP']);
		//console.log(Object.keys(wrfflst['PCP']).length);
		//console.log(Object.keys(wrfflst).length);

		if (wrfflst['PCP'].length !== 0) {
			//console.log('WRF : ' + wrfflst['PCP'][0]);
			loadWRFTiff("./data/wrf/forecast/" + wrfflst['PCP'][0]);
			dateUpdation("wrf", wrfflst.PCP[0])

			//wrfflst.PCP.forEach(function (entry) {
			//    console.log(entry);
			//    console.log(getDate(entry));
			//});

			clearInterval(wrfint);
		}
	}
}, 1000);

function loadlegend() {
	var legint = setInterval(function () {
		//console.log([gfsminmax.length, wrfminmax.length])
		if (gfsminmax.length > 0 && wrfminmax.length > 0) {
			var maxZ = gfsminmax[1] > wrfminmax[1] ? gfsminmax[1] : wrfminmax[1], minZ = gfsminmax[0] < wrfminmax[0] ? gfsminmax[0] : wrfminmax[0];
			var scale = prmWeather === 'PCP' ? chroma.scale('Viridis').domain([minZ, maxZ]) : chroma.scale('YlOrRd').domain([minZ, maxZ]);

			if (typeof (wrflayerGeo) != 'undefined')
				wrflayerGeo.setColor(scale);
			if (typeof (gfslayerGeo) != 'undefined')
				gfslayerGeo.setColor(scale);

			var legend = document.getElementById("legend");
			var celvalues = [];
			var cells = legend.rows[0].cells;
			for (var idx = 0; idx < cells.length; idx++) {
				var td = cells[idx];

				//console.log(maxZ - ((idx + 0.5) / cells.length) * (maxZ - minZ));
				//var valscale = maxZ - ((idx + 0.5) / cells.length) * (maxZ - minZ);
				var valscale = minZ + ((idx + 0.5) / cells.length) * (maxZ - minZ);
				td.style.backgroundColor = scale(valscale);
				celvalues.push(valscale)
				//td.style.backgroundColor = scale(maxZ -
				//    ((idx + 0.5) / cells.length) * (maxZ - minZ));
			};
			//console.log(celvalues);
			var valcells = legend.rows[1].cells;
			for (var idx = 0; idx < celvalues.length; idx++) {
				var td = valcells[idx];

				//console.log(maxZ - ((idx + 0.5) / cells.length) * (maxZ - minZ));
				td.innerHTML = Number(celvalues[idx]).toFixed(1);
				//td.innerHTML = Number(maxZ -
				//    ((idx + 0.5) / valcells.length) * (maxZ - minZ)).toFixed(1);
			};

			clearInterval(legint);
		}
		//else if (gfsminmax.length > 0) {
		//    var maxZ = gfsminmax[1], minZ = gfsminmax[0];
		//    var scale = prmWeather === 'PCP' ? chroma.scale('Viridis').domain([minZ, maxZ]) : chroma.scale('YlOrRd').domain([minZ, maxZ]);

		//    if (typeof (gfslayerGeo) != 'undefined')
		//        gfslayerGeo.setColor(scale);

		//    var legend = document.getElementById("legend");
		//    var celvalues = [];
		//    var cells = legend.rows[0].cells;
		//    for (var idx = 0; idx < cells.length; idx++) {
		//        var td = cells[idx];
		//        var valscale = minZ + ((idx + 0.5) / cells.length) * (maxZ - minZ);
		//        td.style.backgroundColor = scale(valscale);
		//        celvalues.push(valscale)
		//    };
		//    var valcells = legend.rows[1].cells;
		//    for (var idx = 0; idx < celvalues.length; idx++) {
		//        var td = valcells[idx];
		//        td.innerHTML = Number(celvalues[idx]).toFixed(1);
		//    };
		//    clearInterval(legint);
		//} else if (wrfminmax.length > 0) {
		//    var maxZ = wrfminmax[1], minZ = wrfminmax[0];
		//    var scale = prmWeather === 'PCP' ? chroma.scale('Viridis').domain([minZ, maxZ]) : chroma.scale('YlOrRd').domain([minZ, maxZ]);

		//    if (typeof (wrflayerGeo) != 'undefined')
		//        wrflayerGeo.setColor(scale);

		//    var legend = document.getElementById("legend");
		//    var celvalues = [];
		//    var cells = legend.rows[0].cells;
		//    for (var idx = 0; idx < cells.length; idx++) {
		//        var td = cells[idx];
		//        var valscale = minZ + ((idx + 0.5) / cells.length) * (maxZ - minZ);
		//        td.style.backgroundColor = scale(valscale);
		//        celvalues.push(valscale)
		//    };
		//    var valcells = legend.rows[1].cells;
		//    for (var idx = 0; idx < celvalues.length; idx++) {
		//        var td = valcells[idx];
		//        td.innerHTML = Number(celvalues[idx]).toFixed(1);
		//    };
		//    clearInterval(legint);
		//}
	}, 1000);
}

loadlegend();

//let gfslayerGeo, wrflayerGeo;
//color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range)
//layer.options.color =

//let isClicked = false

//mapgfs.on({
//    mouseout: function () {
//         this.closePopup()
//    }
//})

//mapwrf.on({
//    mouseout: function () {
//        this.closePopup()
//    }
//})

