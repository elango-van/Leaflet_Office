//const { type } = require("jquery");

////*********** NMCG Yamuna at Delhi ************
var zoom = 10.0;

var colorRange = ['#cf7834', '#7347cb', '#39ab3d', '#ce4ec6', '#75a03c', '#d23e73', '#42a181', '#d8412f', '#6378c2']
var testDiv = document.getElementById("map");
var rect = testDiv.getBoundingClientRect();
//console.log([testDiv.offsetTop, window.innerHeight, (window.innerHeight - rect.top)]);
document.getElementById("map").style.height = (window.innerHeight - rect.top) + "px";

var map = new L.Map('map',
	{
		//zoomControl: false,
		//        layers: [OpenStreetMap],
		//       center: new L.LatLng(0, 0),
		zoomSnap: 0.5,
		zoomDelta: 0.5,
		minZoom: 9.5,
		zoom: 4
	});

var satellite = L.tileLayer(viz.leaflet.tiles.OpenStreetMap.satellite, {
	attribution: viz.leaflet.tiles.OpenStreetMap.attribution
})

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {
	//minZoom: 5,
	//maxZoom: 50,
	attribution: osmAttrib
});
map.addLayer(osm);

var lat = 0, lng = 0;
var nctjson = "./jsons/NCT_Boundary.json";
if (fileExist(nctjson) === 200) {
	$.getJSON(nctjson, function (data) {

		var objname = Object.keys(data.objects)[0];
		var indiaTopoJson = topojson.feature(data, data.objects[objname])

		nctgeojson = L.geoJson(indiaTopoJson, {
			onEachFeature: onEachBoundyLayer,
			style: {
				weight: 2,
				color: '#000', fillOpacity: 0
			}
		}).addTo(map)

		L.geoJson(indiaTopoJson, {
			style: {
				weight: 2,
				color: '#fff',
				dashArray: '5, 7',
				fillOpacity: 0
			}
		}).addTo(map)
		var nctbounds = nctgeojson.getBounds();
		map.fitBounds(nctbounds)
		lat = (nctbounds.getNorth() + nctbounds.getSouth()) / 2;
		lng = (nctbounds.getEast() + nctbounds.getWest()) / 2;

		function onEachBoundyLayer(feature, layer) {
			layer.bindTooltip(feature.properties['stname'], {
				className: 'basintooltip',
				closeButton: false,
				sticky: true,
				offset: L.point(0, -20)
			});
		}
	});
}

var flclr = colorbrewer.Paired[12];
function polystyle(feature) {
	var index = Math.floor(Math.random() * 11);
	//console.log(index);
	return {
		fillColor: flclr[index],
		weight: 1,
		opacity: 1,
		color: 'white',  //Outline color
		fillOpacity: 0.7
	};
}

var minWTPloc = Infinity, maxWTPloc = -Infinity;
var minSTP = Infinity, maxSTP = -Infinity;
var minCET = Infinity, maxCET = -Infinity;

function loadNMCGlayers(jsonfile, feaType, layergroup, fldname) {

	$.getJSON(jsonfile, function (data) {
		//topoob = JSON.parse(basinreq.responseText)
		var objname = Object.keys(data.objects)[0];
		var type = data.objects[objname].geometries[0].type;
		var jsonTopoJson = topojson.feature(data, data.objects[objname])

		//**********Points*****************************
		if (feaType == 'Point') {
			var pntColor = colorRange[randomInt(1, 9)];

			//*******NMCG*********************************
			if (objname == 'WS_WTP_Locations') {
				//********** Start Point Styles - STP*****************************
				jsonTopoJson.features.map(function (feat, i) {
					var propvalue = feat.properties.Cap_MGD;

					if (propvalue > maxSTP) maxSTP = propvalue;
					if (propvalue < minWTPloc) minWTPloc = propvalue;

					return propvalue
				});

				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {

						var rdvalues = iconByStations(feature.properties.Cap_MGD, minWTPloc, '');
						return L.circleMarker(latlng, {
							radius: rdvalues,
							fillColor: '#00008B',
							color: '#00008B',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.5
						}).bindPopup(wslocationChart); //.addTo(layergroup)
					}
				})
			}
			else if (objname == 'SW_SewagePumpingStation') {
				//********** Start Point Styles - STP*****************************
				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {
						//var rdvalues = iconByStations(feature.properties.Cap_MGD, minvalue, '');
						return L.circleMarker(latlng, {
							radius: 4,
							fillColor: '#ff1493',
							color: '#850b86',
							weight: 1.5,
							opacity: 1,
							fillOpacity: 0.5
						}); //.addTo(layergroup)
					}
				})
			}
			//***SW_Plant Poly to point****

			else if (objname == 'SW_SewerageTreatmentPlant_point') {
				//********** Start Point Styles - STP*****************************
				jsonTopoJson.features.map(function (feat, i) {
					var propvalue = feat.properties.Cap_MGD;

					if (propvalue > maxSTP) maxSTP = propvalue;
					if (propvalue < minSTP) minSTP = propvalue;
					return propvalue
				});

				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {

						var rdvalues = iconByStations(feature.properties.Cap_MGD, minSTP, '');
						return L.circleMarker(latlng, {
							radius: rdvalues * 0.25,
							fillColor: '#00bfff',
							color: 'blue',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.4
						}); //.addTo(layergroup)
					}
				})
			}
			//***SW_Plant Poly to point****
			//***Commoneffluent_Plant Poly to point****

			else if (objname == 'SW_CommonEffluentTreatmentPlant_pt') {
				//********** Start Point Styles - STP*****************************
				jsonTopoJson.features.map(function (feat, i) {
					var propvalue = feat.properties.Cap_MGD;

					if (propvalue > maxCET) maxCET = propvalue;
					if (propvalue < minCET) minCET = propvalue;
					//console.log(maxvalue);
					//console.log(minvalue);
					return propvalue
				});

				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {

						var rdvalues = iconByStations(feature.properties.Cap_MGD, minCET, '');
						return L.circleMarker(latlng, {
							radius: rdvalues * 0.2,
							fillColor: '#ff4500',
							color: 'brown',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.7
						}); //.addTo(layergroup)
					}
				})
			}
			//***Commoneffluent_Plant Poly to point****
			//***NCT Village as Point***
			else if (objname == 'NCT_Villages') {
				//********** Start Point Styles - STP*****************************
				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {
						//var rdvalues = iconByStations(feature.properties.Cap_MGD, minvalue, '');
						return L.circleMarker(latlng, {
							radius: 2,
							fillColor: '#e5aa70',  //'red',
							color: '#8b4513',//'black',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.8
						}); //.addTo(layergroup)
					}
				})
			}

			else if (objname == 'WQ_Locations_Approx') {
				//********** Start Point Styles - STP*****************************
				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {
						//var rdvalues = iconByStations(feature.properties.Cap_MGD, minvalue, '');
						return L.circleMarker(latlng, {
							radius: 8,
							fillColor: '#83f52c',  //'red',
							color: 'darkgreen',//'black',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.8
						}).bindPopup(showchart_zoom); //.addTo(layergroup)
					}
				})
			}
			else {
				//********** Start Point Styles - All Others*****************************
				L.geoJson(jsonTopoJson, {
					onEachFeature: onEachToolTipLayer,
					pointToLayer: function (feature, latlng) {
						return L.circleMarker(latlng, {
							radius: 3,
							fillColor: pntColor,  //'red',
							color: pntColor, //'black',
							weight: 1,
							opacity: 1,
							fillOpacity: 0.5
						})
					}
				}); //.addTo(layergroup)
			}
			//**********Lines*****************************
		}
		else if (feaType == 'Poly') {
			//////////////////////////// Sewer Network ////////////////////////
			if (objname == 'SW_Sewer_Zone_Digitized') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: '#a15116',
						dashArray: '2, 6',
						fillColor: '#a15116',
						fillOpacity: 0,
						opacity: 1,
						weight: 2
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)

			}
			else if (objname == 'SW_SewerageTreatmentPlant') {
				//console.log(jsonTopoJson);
				L.geoJson(jsonTopoJson, {
					style: {
						color: 'yellow',
						fillColor: '#cc0000',
						fillOpacity: 0.8,
						opacity: 1,
						weight: 2
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			///////////////////////// Storm Drain Network //////////////////
			else if (objname == 'SD_NCT_I_FC_Drains') { //LineString
				L.geoJson(jsonTopoJson, {
					style: lineStyle
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			else if (objname == 'SD_Yamuna_river') { //LineString
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: 'blue', //'#1e90ff',
						fillColor: 'blue',
						fillOpacity: 0,
						weight: 1.8
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)

			}

			else if (objname == 'SD_Catchment_Bnd') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: 'red', //'#0070ff',
						fillColor: '#1e20ff',
						lineCap: 'square',
						fillOpacity: 0,
						weight: 2
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)

				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: 'yellow',
						fillColor: '#6bb6ff',
						dashArray: '2,10',
						lineCap: 'square',
						fillOpacity: 0,
						weight: 1.8
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			///////////////////////////// Water distribution Network /////////////////////////////
			else if (objname == 'WS_WTP_Zone_Digitized') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: '#add8e6',
						fillColor: '#FFFFFF00',
						fillOpacity: 0,
						opacity: 1,
						weight: 1.5
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)

				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: '#0000ff', //'#1e90ff', //'#00008B',
						dashArray: '5, 10',
						fillColor: '#FFFFFF00',
						fillOpacity: 0,
						opacity: 1,
						weight: 1.5
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)

			}
			else if (objname == 'WS_Tanker_Sch_Zone_Digitized') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: '#ff1493', //'green',
						dashArray: '2,8',
						fillColor: '#FFFFFF00',
						fillOpacity: 0,
						opacity: 1,
						weight: 1.5
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			/////////////////////////////// Administration ///////////////////////////
			else if (objname == 'NCT_Wards') {

				////createWardTable(jsonTopoJson);
				//let arrvalue = [];
				//jsonTopoJson.features.map(function (feat, i) {
				//	var propvalue = feat.properties.POP;
				//	arrvalue.push(propvalue);
				//	//console.log([minvalue, maxvalue]);

				//	//console.log(prop.Cap_KL)
				//	return propvalue
				//});

				//var quantile = d3.scaleQuantile()
				//	.domain(arrvalue) // pass the whole dataset to a scaleQuantile’s domain
				//	.range(flclr)

				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: function (feat) {
						return {
							color: '#404040',
							//dashArray: '1,5', //'5, 2',
							fillColor: flclr[Math.floor(Math.random() * 12)], //'#202020',
							fillOpacity: 0.9,
							weight: 1.2
						}
					}
					//style: {
					//	color: '#404040',
					//	dashArray: '1,5', //'5, 2',
					//	fillColor: flclr[Math.floor(Math.random() * 12)], //'#202020',
					//	fillOpacity: 0.9,

					//	//fillColor: '#404040',
					//	////fillColor: quantile(feat.properties.POP),
					//	//fillOpacity: 0,

					//	weight: 1.2
					//}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			//else if (objname == 'wards delimited') {

			//	createWardTable(jsonTopoJson);

			//	L.geoJson(jsonTopoJson, {
			//		//style: polystyle
			//		style: {
			//			color: '#404040',
			//			dashArray: '1,5', //'5, 2',
			//			fillColor: '#404040',
			//			fillOpacity: 0,
			//			weight: 1.2
			//		}
			//		//, onEachFeature: onEachWardsLayer
			//		, onEachFeature: onEachToolTipLayer
			//	})

			//	//function onEachWardsLayer(feature, layer) {
			//	//	if (fldname == '' || fldname == '' || fldname == null) return;
			//	//	layer.addTo(layergroup);
			//	//	layer.bindTooltip('Ward Name : ' + feature.properties[fldname], {
			//	//		className: 'basintooltip',
			//	//		closeButton: false,
			//	//		sticky: true,
			//	//		//direction: 'top',
			//	//		//permanent: true,
			//	//		//noHide: true,
			//	//		offset: L.point(0, -20)
			//	//	});
			//	//}
			//}
			else if (objname == 'NCT_AC_Zones') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: function (feat) {
						return {
							color: '#404040',
							//dashArray: '1,5', //'5, 2',
							fillColor: flclr[Math.floor(Math.random() * 12)], //'#202020',
							fillOpacity: 0.9,
							weight: 1.2
						}
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			else if (objname == 'NCT_SubDistrict') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: function (feat) {
						return {
							color: '#404040',
							//dashArray: '1,5', //'5, 2',
							fillColor: flclr[Math.floor(Math.random() * 12)], //'#202020',
							fillOpacity: 0.9,
							weight: 1.2
						}
					}
					//style: {
					//	color: '#202020', //'darkgray',
					//	dashArray: '3,9', //'5, 2',
					//	fillColor: '#202020',
					//	fillOpacity: 0,
					//	weight: 1.8
					//}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			else if (objname == 'NCT_MCD_Zones') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: function (feat) {
						return {
							color: '#404040',
							//dashArray: '1,5', //'5, 2',
							fillColor: flclr[Math.floor(Math.random() * 12)], //'#202020',
							fillOpacity: 0.9,
							weight: 1.2
						}
					}
					//style: {
					//	color: 'brown',
					//	fillColor: '#FFFFFF00',
					//	fillOpacity: 0,
					//	weight: 1.5
					//}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			else if (objname == 'NCT_JJC_DUSB_Poly') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: '#ff4500',
						fillColor: 'brown',
						fillOpacity: 0.5,
						opacity: 1,
						weight: 1.3
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			//***Unauthosised***
			else if (objname == 'NCT_Unauthorised_Approx') {
				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: {
						color: 'darkgray',
						fillColor: 'yellow',
						fillOpacity: 0.7,
						opacity: 1,
						weight: 1.2
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
			//***Unauthosised***

			else if (objname == 'NCT_District') {

				let arrvalue = [];
				jsonTopoJson.features.map(function (feat, i) {
					let propvalue = feat.properties.POP;
					arrvalue.push(propvalue);
					//console.log([minvalue, maxvalue]);

					//console.log(prop.Cap_KL)
					return propvalue
				});

				var quantile = d3.scaleQuantile()
					.domain(arrvalue) // pass the whole dataset to a scaleQuantile’s domain
					.range(flclr)
				//.range(["red", "green", "yellow", "brown", "blue"])

				////console.log(arrvalue);
				////console.log(getQuantile(arrvalue));

				//console.log(jsonTopoJson.features[0].properties);

				//createDistrict(jsonTopoJson);
				//console.log(feature.properties.POP);

				//var colors = d3.scaleQuantize()
				//	.domain([0, 100])
				//	.range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
				//		"#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

				L.geoJson(jsonTopoJson, {
					//style: polystyle
					style: function (feat) {
						return {
							color: "#000",
							opacity: 0.9,
							fillColor: quantile(feat.properties.POP),
							fillOpacity: 0.7,
							weight: 1
						}
					}
					//style: {
					//	color: 'black',
					//	opacity: 1,
					//	fillColor: '#FFFFFF00',
					//	fillOpacity: 0,
					//	weight: 1.5
					//}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}

			else {
				//********** Start Polygon Styles - Parking Space*****************************
				var polColor = colorRange[randomInt(1, 9)];
				L.geoJson(jsonTopoJson, {
					style: {
						//color: colorRange[randomInt(1,9)],  //'red', //"rgba(0,0,0,0.3)",
						//dashArray: "20,25",
						color: polColor,
						fillColor: polColor,
						fillOpacity: 0.3,
						weight: 2
					}
					, onEachFeature: onEachToolTipLayer
				}); //.addTo(layergroup)
			}
		}

		function onEachToolTipLayer(feature, layer) {
			if (fldname == '' || fldname == '' || fldname == null) return;

			if (objname !== 'WQ_Locations_Approx' && objname !== 'WS_WTP_Locations')
				layer.on('click', layerClickHandler);

			if (objname == 'NCT_District') {
				//console.log(feature.properties["dtname"]);
				//console.log(layer.getBounds());

				L.marker(layer.getBounds().getCenter(), {
					icon: L.divIcon({
						className: 'label',
						html: feature.properties["dtname"],
						iconSize: [100, 25]
					})
				}).addTo(districtGroup);
			} else if (objname == 'NCT_AC_Zones') {
				L.marker(layer.getBounds().getCenter(), {
					icon: L.divIcon({
						className: 'label',
						html: feature.properties["AC_NAME"],
						iconSize: [100, 25]
					})
				}).addTo(nctacGroup);
			} else if (objname == 'NCT_MCD_Zones') {
				L.marker(layer.getBounds().getCenter(), {
					icon: L.divIcon({
						className: 'label',
						html: feature.properties["Name"],
						iconSize: [100, 25]
					})
				}).addTo(mcdGroup);
			} else if (objname == 'NCT_SubDistrict') {
				L.marker(layer.getBounds().getCenter(), {
					icon: L.divIcon({
						className: 'label',
						html: feature.properties["sdtname"],
						iconSize: [100, 25]
					})
				}).addTo(subdistrictGroup);
			}
			/*
				Add and remove markers you can use like this
				var markers = L.layerGroup()
				const marker = L.marker([], {})
				markers.addLayer(marker)
			 * */
			var msg = ''
			if (fldname == 'Diameter' || fldname == 'Dia_Inch' || fldname == 'Dia_mm')
				msg = 'Diameter' + '<br/>';
			else if (fldname == 'Number')
				msg = 'Tubewell No.' + '<br/>';
			else if (fldname == 'Invert_Lev' || fldname == 'Depth')
				msg = 'Invert Level' + '<br/>';
			else if (fldname == 'ward')
				msg = 'Ward Name : ';

			layer.addTo(layergroup);

			layer.bindTooltip(msg + feature.properties[fldname], {
				className: 'basintooltip',
				closeButton: false,
				sticky: true,
				//direction: 'top',
				//permanent: true,
				//noHide: true,
				offset: L.point(0, -20)
			});
		}
	});
}

//function generate_table() {
//	var body = document.getElementsByTagName("body")[0];

//	var tbl = document.createElement("table");
//	var tblBody = document.createElement("tbody");

//	for (var i = 0; i < 2; i++) {
//		var row = document.createElement("tr");

//		for (var j = 0; j < 2; j++) {
//			var cell = document.createElement("td");
//			var cellText = document.createTextNode("cell in row " + i + ", column " + j);
//			cell.appendChild(cellText);
//			row.appendChild(cell);
//		}

//		tblBody.appendChild(row);
//	}

//	tbl.appendChild(tblBody);
//	body.appendChild(tbl);
//	tbl.setAttribute("border", "2");
//}

//$("divwards a").on("click", function (e) {
//	var wardname = $(this).attr('title');
//})
function closechart() {
	document.getElementById('reportbox').style.display = 'none';
}
var popData = [];
function displayWardDetails(obj) {
	var wardname = $(this).attr('title');
	//console.log(wardname);

	//Delhi_Wards_delimit.json
	//{ "wardno": 1, "ward": "Narela", "zone": "Narela", "zoneno": 7, "longitude": 77.088649, "latitude": 28.874501 }
	//NCT_Wards.json
	//{ "Ward_Name": "DELHI CANTT CHARGE 1", "Ward_No": "CANT_1", "Ward_Nam_1": "", "zone": "", "zoneno": 0, "longitude": 0, "latitude": 0 }

	if (!map.hasLayer(wardsGroup)) {
		map.addLayer(wardsGroup);
	}

	//	//console.log($(this).attr('title'));

	//	var wardname = $(this).attr('title');
	//	document.getElementById('lblheader').innerText = wardname;

	//	//console.log(wardname)
	wardsGroup.eachLayer(function (layer) {
		//var feature = layer.feature;
		//if (layer.feature.properties.ward == wardname) {

		if (layer.feature.properties.Ward_No == wardname) {

			//console.log(layer.getBounds()._northEast);
			//console.log(layer.getBounds()._southWest);

			map.fitBounds(layer.getBounds());
			setHighlight(layer);

			//var wardno = layer.feature.properties.Ward_No;
			popData = [];
			popData = wardData.filter(function (dv) {
				//console.log([dv.Ward, wardname]);
				return dv.Ward == wardname
			});

			if (popData.length > 0) {

				//console.log(popData);

				////$('input[name="selqrp"]').attr('checked', false);
				////$('input[name="selqrp"]').prop('checked', false);
				////$('#TOT').attr('checked', 'checked');
				////$("#TOT").prop("checked", true);

				$('#optselect option').each(function () {
					if (this.defaultSelected) {
						this.selected = true;
						return false;
					}
				});

				$('#optselect option[value=TOT]').attr('selected', 'selected');
				////$("#optselect select").val("TOT");

				//document.getElementById('report-container').style.display = 'block';
				//document.getElementById('reportbox').style.display = 'block';
				removeElements()
				popData.map(function (dat, i) {
					//console.log(dat.M_TOT)
					//console.log(dat.F_TOT)
					var totmf = [{ name: 'Male', value: dat.M_TOT }, { name: 'Female', value: dat.F_TOT }];
					//console.log([i, totmf]);
					var eleid = 'ward' + i;
					createElements(eleid, dat.Name + ' (Total : ' + dat.P_TOT + ')');
					createPieChart(eleid, totmf);
					document.getElementById('reportbox').style.display = 'block';
				})
			}
		}
	});
}

function createWardTable(objjson) {
	var nowards = objjson.features.length;
	document.querySelector('#divwards .title').innerHTML = "Wards (" + nowards + ")"

	var tbl = document.createElement("table");
	tbl.id = "wardTable";
	tbl.className = 'disttable';
	var tblBody = document.createElement("tbody");
	var rowheader = document.createElement("tr");

	var th = document.createElement('th');
	var text = document.createTextNode("Ward Name ");
	th.appendChild(text);
	rowheader.appendChild(th);
	//console.log(objjson);
	tblBody.appendChild(rowheader);

	objjson.features.map(function (feat, i) {

		var wardname = feat.properties.Ward_Name;
		var wardno = feat.properties.Ward_No;
		var row = document.createElement("tr");
		row.id = wardname;

		var cell = document.createElement("td");
		var link = document.createElement("a");
		link.setAttribute("title", wardno);
		link.setAttribute("href", "#");
		link.appendChild(document.createTextNode(wardname));
		link.addEventListener("click", displayWardDetails);
		cell.appendChild(link);
		//var cellText = document.createTextNode(distname);
		//cell.appendChild(cellText);
		row.appendChild(cell);


		tblBody.appendChild(row);

	});
	tbl.appendChild(tblBody);
	var element = document.getElementById("divwards");
	element.appendChild(tbl);
}

//var districtdetails = { "dtname": "District Name", "stname": "State Name", "stcode11": "State Code", "dtcode11": "District Code", "year_stat": "Census", "POP": "Population", "Density": "Density", "Dgrowth_P": "Growth", "Sex_Ratio": "Sex Ratio", "Literacy": "Literacy", "dtcode11_1": "District Code" };
function displayDistrictDetails(obj) {
	var districtname = $(this).attr('title');
	var rownumber = $(this).attr('rownumber');
	removeRow('divdistdetails', 'districtTable');

	if (!map.hasLayer(districtGroup)) {
		map.addLayer(districtGroup);
	}

	//{"dtname":"North","stname":"DELHI","stcode11":"07","dtcode11":"091","year_stat":"2011_c","POP":887978,"Density":14557,"Dgrowth_P":13.6,"Sex_Ratio":869,"Literacy":86.9,"dtcode11_1":91}
	districtGroup.eachLayer(function (layer, index) {

		var feat = layer.feature;
		if (feat.properties.dtname === districtname) {

			map.fitBounds(layer.getBounds());
			setHighlight(layer);

			//console.log(feat.properties);
			/*
				Density: 27132
				Dgrowth_P: 16.8
				Literacy: 89.3
				POP: 1709346
				Sex_Ratio: 884
				dtcode11: "093"
				dtcode11_1: 93
				dtname: "East"
				stcode11: "07"
				stname: "DELHI"
				year_stat: "2011_c"
			 */
			var pop = feat.properties.POP;
			var den = feat.properties.Density;
			var sex = feat.properties.Sex_Ratio;
			var gro = feat.properties.Dgrowth_P;
			var stc = feat.properties.stcode11;
			var dtc = feat.properties.dtcode11;
			var dnm = feat.properties.dtname;
			var snm = feat.properties.stname;
			var lty = feat.properties.Literacy;
			//console.log([dnm, pop, den, sex, gro]);

			//<table ></table>

			var table = document.getElementById('districtTable');
			table.cellPadding = "0px";
			table.cellSpacing = "0px";

			var row = table.insertRow(Number(rownumber) + 1);
			row.setAttribute('style', 'pointer-events: none;');
			var cell1 = row.insertCell(0);
			cell1.colSpan = 5;
			cell1.cellPadding = 5;

			//var ele = "<div id='divdistdetails'> ";
			//ele += "<p>State Name     &emsp;: &emsp;" + snm + "</p>";
			//ele += "<p>Distrinct Name &emsp;: &emsp;" + dnm + "</p>";
			//ele += "<p>Population     &emsp;: &emsp;" + pop + "</p>";
			//ele += "<p>Density        &emsp;: &emsp;" + den + "</p>";
			//ele += "<p>Sex Ratio      &emsp;: &emsp;" + sex + "</p>";
			//ele += "<p>Growth         &emsp;: &emsp;" + gro + "</p>";
			//ele += "<p>State Code     &emsp;: &emsp;" + stc + "</p>";
			//ele += "<p>Distrinct Code &emsp;: &emsp;" + dtc + "</p>";

			var ele = "<table id='divdistdetails' class='divdistdetails' cellpadding='0', cellspacing='0'> ";
			ele += "<tr><td>State Name     </td><td>&emsp;: &emsp;</td><td>" + snm + "</td></tr>";
			ele += "<tr><td>Distrinct Name </td><td>&emsp;: &emsp;</td><td>" + dnm + "</td></tr>";
			ele += "<tr><td>Population     </td><td>&emsp;: &emsp;</td><td>" + numberCurrencyFormatter(pop) + "</td></tr>";
			ele += "<tr><td>Density        </td><td>&emsp;: &emsp;</td><td>" + numberCurrencyFormatter(den) + "</td></tr>";
			ele += "<tr><td>Growth         </td><td>&emsp;: &emsp;</td><td>" + gro + "</td></tr>";
			ele += "<tr><td>Literacy       </td><td>&emsp;: &emsp;</td><td>" + lty + "</td></tr>";
			ele += "<tr><td>Sex Ratio      </td><td>&emsp;: &emsp;</td><td>" + sex + "</td></tr>";
			ele += "<tr><td>State Code     </td><td>&emsp;: &emsp;</td><td>" + stc + "</td></tr>";
			ele += "<tr><td>Distrinct Code </td><td>&emsp;: &emsp;</td><td>" + dtc + "</td></tr>";
			ele += "<tr></table>";
			//<img src="" width="25" height="15 " />
			ele += "<div id='disttools'><div><img src='./images/tools/details.png' title='details'/></div>\
					     <div><img src='./images/tools/chart.png' title='chart'/></div>\
                         <div><img src='./images/tools/download.png' title='download'/></div>\
				         <div><img src='./images/tools/togglemenu.png' title='togglemenu' /></div ></div > ";
			/*<div><img src='./images/tools/printer.png' title='printer'/></div>\*/
			ele += "</div> ";
			cell1.innerHTML = ele;
		}
	});

	//var table = document.getElementById('districtTable');
	//var row = table.insertRow(Number(rownumber) + 1);

	//var rowCount = table.rows.length;
	////var colCount = table.rows[0].cells.length;
	////console.log([rowCount, colCount]);

	////Column 1  
	//var cell1 = row.insertCell(0);
	//var element1 = document.createElement("input");
	//element1.type = "button";
	//var btnName = "button" + (rowCount + 1);
	//element1.name = btnName;
	//element1.setAttribute('value', 'Delete'); // or element1.value = "button";  
	//element1.onclick = function () {
	//	removeRow(btnName);
	//}
	//cell1.appendChild(element1);

	////Column 2  
	//var cell2 = row.insertCell(1);
	//cell2.innerHTML = "<div><b>" + rowCount + 1 + "</b></div>";

	////Column 3  
	//var cell3 = row.insertCell(2);
	//cell3.colSpan = 2;
	//var element3 = document.createElement("input");
	//element3.type = "text";
	//cell3.appendChild(element3);

	////// create a div element
	////var div = document.createElement('tr');
	////// set class name
	////div.className = 'mydiv';
	////// set html contents
	////div.innerHTML = ' <td class="mydivinside" colspan=10>  Text  </td>';
	////// get .div2 element
	////var ele = document.querySelector('#districtname');
	////ele.insertBefore(div, ele);

}

$("#disttools img").on('click', function (e) {
	var selectedtool = $(this).attr('title');
	if (selectedtool === 'details') { }
	else if (selectedtool === 'chart') { }
	else if (selectedtool === 'download') { }
	else if (selectedtool === 'printer') { }
	else if (selectedtool === 'togglemenu') { }
	//else if (selectedtool == 'details, chart, download, printer, togglemenu') {}
	//else if (selectedtool == 'details, chart, download, printer, togglemenu') {}
});

function createDistrictTable(objjson) {
	//console.log(Object.keys(jsonTopoJson.features[0].properties));

	var nodist = objjson.features.length;
	document.querySelector('#divdistrict .title').innerHTML = "Districts (" + nodist + ")"

	var tbl = document.createElement("table");
	tbl.id = "districtTable";
	tbl.className = 'disttable';
	var tblBody = document.createElement("tbody");
	var rowheader = document.createElement("tr");
	var headerList = ["District Name ", "Population", "Density", "Growth", "Sex Ratio"]
	for (var j = 0; j < headerList.length - 1; j++) {

		var th = document.createElement('th'); //column
		var text = document.createTextNode(headerList[j]); //cell
		th.appendChild(text);
		rowheader.appendChild(th);
	}

	tblBody.appendChild(rowheader);

	objjson.features.map(function (feat, i) {

		var densityvalue = feat.properties.Density;
		var popvalue = feat.properties.POP;
		var distname = feat.properties.dtname;
		var growth = feat.properties.Dgrowth_P;
		//var sexratio = feat.properties.Sex_Ratio;
		//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
		//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));

		var row = document.createElement("tr");
		row.id = distname;

		var cell = document.createElement("td");
		var link = document.createElement("a");
		link.setAttribute("title", distname);
		link.setAttribute("href", "#");
		link.setAttribute("rownumber", i + 1);
		link.appendChild(document.createTextNode(distname));
		link.addEventListener("click", displayDistrictDetails);
		cell.appendChild(link);
		//var cellText = document.createTextNode(distname);
		//cell.appendChild(cellText);
		row.appendChild(cell);

		var cell1 = document.createElement("td");
		//var cellText1 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));
		var cellText1 = document.createTextNode(numberCurrencyFormatter(popvalue));
		cell1.setAttribute('style', 'text-align:right;');
		cell1.appendChild(cellText1);
		row.appendChild(cell1);

		var cell2 = document.createElement("td");
		//var cellText2 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
		var cellText2 = document.createTextNode(numberCurrencyFormatter(densityvalue));
		cell2.setAttribute('style', 'text-align:right;');
		cell2.appendChild(cellText2);
		row.appendChild(cell2);

		var cell3 = document.createElement("td");
		var cellText3 = document.createTextNode(growth);
		cell3.setAttribute('style', 'text-align:right;');
		cell3.appendChild(cellText3);
		row.appendChild(cell3);

		//var cell4 = document.createElement("td");
		//var cellText4 = document.createTextNode(sexratio);
		//cell4.appendChild(cellText4);
		//row.appendChild(cell4);

		//var link = document.createElement("a");
		//link.setAttribute("title", distname);
		//link.setAttribute("href", "#");
		//link.appendChild(document.createTextNode(distname));
		//maindiv.appendChild(link)

		tblBody.appendChild(row);

	});
	tbl.appendChild(tblBody);
	var element = document.getElementById("divdistrict");
	element.appendChild(tbl);

	//var div1 = document.querySelector('.div1');
	//div1.insertAdjacentHTML('afterend', '<div class="mydiv"><div class="mydivinside">Text</div></div>');

	//var headdiv = document.createElement("div");
	//headdiv.className = 'chart-header';
	//headdiv.appendChild(document.createTextNode(name));
	//maindiv.appendChild(headdiv)

	//var repdiv = document.createElement("div");
	//repdiv.id = prmid;
	//maindiv.appendChild(repdiv)

	////var node = document.createTextNode("This is new.");
	////ediv.appendChild(node);
	//var element = document.getElementById("report");
	//element.appendChild(maindiv);

	////var child = document.getElementById("p1");
	////element.insertBefore(para, child);
	////var parent = document.getElementById("div1");
	////parent.removeChild(child);
	////parent.replaceChild(para, child);

}
//L.geoJson(polyData, { style: polystyle }).addTo(map);

//*********************** Adminstrations ***********************
var districtGroup = L.layerGroup();
var districtfile = './jsons/NCT_District.json';
if (fileExist(districtfile) === 200) {
	loadNMCGlayers(districtfile, 'Poly', districtGroup, 'dtname');

	//console.log(colorbrewer.Paired[12])

	//console.log(districtGroup);

	//districtGroup.eachLayer(function (layer, index) {
	//	var clrindex = index > 11 ? 0 : index;
	//	console.log([clrindex, flclr[clrindex]])
	//	layer.setStyle({ fillColor: flclr[clrindex] });

	//	//var feature = layer.feature;
	//	//var population = feature.properties['POP'];

	//	//if (Number(catchmin) == Number(catchmax) || catchmin == Infinity || catchmax == -Infinity)
	//	//	layer.setStyle({ fillColor: '#0000FF' });
	//	//else
	//	//	layer.setStyle({ fillColor: flclr });

	//	//var msg = '';
	//	//if (subfieldname == 'Total_Peak_Runoff')
	//	//	msg = '<div style="text-align:center;"><span style="font-weight:bold;padding:3px;text-align:center;"> ' + catchlegendheader + '</span><br /><span style="font-weight:bold;padding:3px;text-align:center;">' + Number(feature.properties[subfieldname]).toFixed(2) + ' </span></div>';
	//	//else
	//	//	msg = '<div style="text-align:center;"><span style="font-weight:bold;padding:3px;text-align:center;"> ' + catchlegendheader + '</span><br /><span style="font-weight:bold;padding:3px;text-align:center;">' + Number(feature.properties[subfieldname]).toFixed(2) + ' </span></div>';

	//	//layer.bindTooltip(msg, {
	//	//	className: 'nodetooltip',
	//	//	closeButton: false,
	//	//	sticky: true,
	//	//	direction: 'top',
	//	//	offset: L.point(0, -20)
	//	//});
	//});
}

var subdistrictGroup = L.layerGroup();
var subdistrictfile = './jsons/NCT_SubDistrict.json';
if (fileExist(subdistrictfile) === 200) {
	loadNMCGlayers(subdistrictfile, 'Poly', subdistrictGroup, 'sdtname');
}

var wardsGroup = L.layerGroup();
var wardsfile = './jsons/NCT_Wards.json';
if (fileExist(wardsfile) === 200) {
	loadNMCGlayers(wardsfile, 'Poly', wardsGroup, 'Ward_Name');
	//console.log((wardsGroup._layers));
	//console.log(Object.keys(wardsGroup._layers));
}

//var wardsGroup = L.layerGroup();
//var wardsfile = './jsons/Delhi_Wards_delimit.json';
//if (fileExist(wardsfile) === 200) {
//	loadIITlayers(wardsfile, 'Poly', wardsGroup, 'ward');
//}

//wardsGroup.addTo(map);

var nctacGroup = L.layerGroup();
var acZonefile = './jsons/NCT_AC_Zones.json';
if (fileExist(acZonefile) === 200) {
	loadNMCGlayers(acZonefile, 'Poly', nctacGroup, 'AC_NAME');
}


var jjcdusbGroup = L.layerGroup();
var jjcfile = './jsons/NCT_JJC_DUSB_Poly.json';
if (fileExist(jjcfile) === 200) {
	loadNMCGlayers(jjcfile, 'Poly', jjcdusbGroup, 'ID');
}

var vilGroup = L.layerGroup();
var vilfile = './jsons/NCT_Villages.json';
if (fileExist(vilfile) === 200) {
	loadNMCGlayers(vilfile, 'Point', vilGroup, 'NAME');
}

var mcdGroup = L.layerGroup();
var mcdfile = './jsons/NCT_MCD_Zones.json';
if (fileExist(mcdfile) === 200) {
	loadNMCGlayers(mcdfile, 'Poly', mcdGroup, 'Zone_Name');
}

//  var nctucGroup = L.layerGroup();
//  var nctucfile = './jsons/NCT_UNauth_ColonyLR.tif';
//  if (fileExist(nctucfile) === 200) {
//  	loadGeoTiff(nctucfile, nctucGroup);
//  }

var nctucGroup = L.layerGroup();
var nctucfile = './jsons/NCT_Unauthorised_Approx.json';
if (fileExist(nctucfile) === 200) {
	loadNMCGlayers(nctucfile, 'Poly', nctucGroup, 'gridcode');
}

///////////// Water distribution Network //////////////////
var wtpzoneGroup = L.layerGroup();
var wtpzonefile = './jsons/WS_WTP_Zone_Digitized.json';
if (fileExist(wtpzonefile) === 200) {
	loadNMCGlayers(wtpzonefile, 'Poly', wtpzoneGroup, 'Name');
}

var wtplocationGroup = L.layerGroup();
var wtplocfile = './jsons/WS_WTP_Locations.json';
if (fileExist(wtplocfile) === 200) {
	loadNMCGlayers(wtplocfile, 'Point', wtplocationGroup, 'Name');
}

var ugrlocationGroup = L.layerGroup();
var ugrlocfile = './jsons/WS_WTP_UGR_Locations.json';
if (fileExist(ugrlocfile) === 200) {
	loadNMCGlayers(ugrlocfile, 'Point', ugrlocationGroup, 'Name');
}

var tankerGroup = L.layerGroup();
var tankerfile = './jsons/WS_Tanker_Sch_Zone_Digitized.json';
if (fileExist(tankerfile) === 200) {
	loadNMCGlayers(tankerfile, 'Poly', tankerGroup, 'Name');
}

var wschartdata = [];
var wschartfile = './data/WS_WTP_TS.csv'
if (fileExist(wschartfile) === 200) {
	d3.csv(wschartfile, function (data) { wschartdata = data; })
}

///////////////////// Sewer Network //////////////////////////////////
var cetpGroup = L.layerGroup();
var cetpfile = './jsons/SW_CommonEffluentTreatmentPlant_pt.json';
if (fileExist(cetpfile) === 200) {
	loadNMCGlayers(cetpfile, 'Point', cetpGroup, 'CETP_NM');
}

var spwGroup = L.layerGroup();
var spwfile = './jsons/SW_SewagePumpingStation.json';
if (fileExist(spwfile) === 200) {
	loadNMCGlayers(spwfile, 'Point', spwGroup, 'SPS_NM');
}
var sewerzoneGroup = L.layerGroup();
var sewerzonefile = './jsons/SW_Sewer_Zone_Digitized.json';
if (fileExist(sewerzonefile) === 200) {
	loadNMCGlayers(sewerzonefile, 'Poly', sewerzoneGroup, 'Name');
}

var stppGroup = L.layerGroup();
var stppfile = './jsons/SW_SewerageTreatmentPlant_point.json';
if (fileExist(stpfile) === 200) {
	loadNMCGlayers(stppfile, 'Point', stppGroup, 'STP_NM');
}

var stpGroup = L.layerGroup();
var stpfile = './jsons/SW_SewerageTreatmentPlant.json';
if (fileExist(stpfile) === 200) {
	loadNMCGlayers(stpfile, 'Poly', stpGroup, 'STP_NM');
}

/////////////////////// Storm Drain Network ///////////////////////////////////////////////
var sdcbGroup = L.layerGroup();
var catchfile = './jsons/SD_Catchment_Bnd.json';
if (fileExist(catchfile) === 200) {
	loadNMCGlayers(catchfile, 'Poly', sdcbGroup, 'Catch_NM');
}

var sdifcdGroup = L.layerGroup();
var fcdrainfile = './jsons/SD_NCT_I_FC_Drains.json';
if (fileExist(fcdrainfile) === 200) {
	loadNMCGlayers(fcdrainfile, 'Poly', sdifcdGroup, 'Name');
}

var sdyamunaGroup = L.layerGroup();
var sdyamunafile = './jsons/SD_Yamuna_river.json';
if (fileExist(fcdrainfile) === 200) {
	loadNMCGlayers(sdyamunafile, 'Poly', sdyamunaGroup, 'RVB_RV_NM');
}

/////////////////////////// Water Quality /////////////////////////////////
var wqdelhiGroup = L.layerGroup();
var wqdelhifile = './jsons/WQ_Locations_Approx.json';
if (fileExist(wqdelhifile) === 200) {
	loadNMCGlayers(wqdelhifile, 'Point', wqdelhiGroup, 'Sampling');
}

var wqchartdata = [];
//var wqchartfile = './data/WQ_TS_YR-1.csv'
var wqchartfile = './data/WQ_TS_Yamuna.csv'
if (fileExist(wqchartfile) === 200) {
	d3.csv(wqchartfile, function (data) { wqchartdata = data; })
}

var control = L.control.zoomBox({ modal: true });
map.addControl(control);

///********************** Adding Layer groups to Layer Tree **************
//var baseTree = [
//	{ label: 'OpenStreetMap', layer: osm },
//{ label: 'Satellite', layer: satellite }
//];
var baseTree = [
	{ label: 'OpenStreetMap', layer: osm },
	{ label: 'Satellite', layer: satellite }
];

var overlaysTree = {
	label: 'Layers',
	//selectAllCheckbox: 'Un/select all',
	children: [
		{
			label: 'Administration', children: [
				{ label: 'Villages', layer: vilGroup },//NCT_Villages point,
				{ label: 'JJC Bastis', layer: jjcdusbGroup },//NCT_JJC_DUSB_Poly,
				{ label: 'Unauthorised Colonies', layer: nctucGroup },
				{ label: 'Assembly Constituency', layer: nctacGroup },
				{ label: 'Wards', layer: wardsGroup },
				{ label: 'Subdistrict', layer: subdistrictGroup },
				{ label: 'District', layer: districtGroup },
				{ label: 'NCT MCD Zones', layer: mcdGroup },//NCT_MCD_Zones
			]
		},
		{
			label: 'Water distribution Network', children: [
				{ label: 'Water Treatment Plants', layer: wtplocationGroup },//WS_WTP_Locations_Approx
				{ label: 'Underground Reservoirs', layer: ugrlocationGroup },//WS_WTP_Locations_Approx
				{ label: 'Tanker Schedule Zone', layer: tankerGroup },//WS_Tanker_Sch_Zone_Digitized
				{ label: 'WTP Zone', layer: wtpzoneGroup },
			]
		},
		{
			label: 'Sewer Network', children: [
				{ label: 'Sewage Pumping Station', layer: spwGroup },
				{ label: 'Sewerage Treatment Plant', layer: stppGroup },
				{ label: 'Sewerage Treatment Plant Area', layer: stpGroup },
				{ label: 'Common Effluent Treatment Plant', layer: cetpGroup },
				{ label: 'Sewer Zone', layer: sewerzoneGroup },
			]
		},
		{
			label: 'Storm Drain Network', children: [
				{ label: 'I & FC Drains', layer: sdifcdGroup },//SD_NCT_I_FC_Drains
				{ label: 'Yamuna River', layer: sdyamunaGroup },//SD_NCT_I_FC_Drains
				{ label: 'Storm Drain Basins', layer: sdcbGroup },//SD_Catchment_Bnd

			]
		},
		{
			label: 'Water Quality', children: [
				{ label: 'Yamuna', layer: wqdelhiGroup },//WQ_Locations_Approx
				{ label: 'Delhi Drains', layer: wqdelhiGroup },//
			]
		},
	]
}
var lay = L.control.layers.tree(baseTree, overlaysTree,
	{
		namedToggle: true,
		selectorBack: false,
		closedSymbol: '&#8862; &#x1f5c0;',
		openedSymbol: '&#8863; &#x1f5c1;',
		collapseAll: 'Collapse all',
		expandAll: 'Expand all',
		//collapsed: false,
	});

lay.addTo(map).collapseTree(true).expandSelected(true);

//console.log($(".leaflet-control-layers-selector"))
//console.log($(".leaflet-control-layers-selector")[0].name)

var datapanel = document.getElementById('divdatapanel');
////leaflet-control-layers-selector
//$(".leaflet-control-layers-selector").change(function () {
//	//console.log('Layers selected: ' + $(this).parent().text());
//	//console.log('Layers selected: ' + $(this)[0].checked);
//	var lyrName = $(this).parent().text();
//	console.log(lyrName);

//	//if (lyrName == "Villages") { }
//	//else if (lyrName == "JJC Bastis") { }
//	//else if (lyrName == "Unauthorised Colonies") { }
//	//else if (lyrName == "Wards") {
//	//	console.log()
//	//	datapanel.innerHTML += '<div id="divwards"><div class="title">Wards</div></div >';
//	//	createWard(lyrName);
//	//}
//	//else if (lyrName == "Subdistrict") { }
//	//else if (lyrName == "District") {
//	//	datapanel.innerHTML += '<div id="divdistrict"><div class="title">Districts</div></div >';
//	//}
//	//else if (lyrName == "NCT MCD Zones") { }
//	//else if (lyrName == "Water Treatment Plants") { }
//	//else if (lyrName == "Tanker Schedule Zone") { }
//	//else if (lyrName == "WTP Zone") { }
//	//else if (lyrName == "Sewage Pumping Station") { }
//	//else if (lyrName == "Sewerage Treatment Plant") { }
//	//else if (lyrName == "Sewerage Treatment Plant Area") { }
//	//else if (lyrName == "Common Effluent Treatment Plant") { }
//	//else if (lyrName == "Sewer Zone") { }
//	//else if (lyrName == "I & FC Drains") { }
//	//else if (lyrName == "Yamuna River") { }
//	//else if (lyrName == "Storm Drain Basins") { }
//	//else if (lyrName == "Yamuna") { }
//	//else if (lyrName == "Delhi Drains") { }
//});

////****************Map Zoomed****************

var currentZoom = map.getZoom();
var previousZoom = map.getZoom();
map.on('zoomend', function () {

	currentZoom = map.getZoom();
	var myRadius = 5 * Math.round(Math.pow(1.25, (currentZoom - 12)));
	// console.log(currentZoom);
	// console.log(myRadius);

	if (map.hasLayer(vilGroup)) {//'./jsons/NCT_Villages.json';
		vilGroup.eachLayer(function (layer) {
			layer.setStyle({ radius: 2 });
		});
	}

	if (map.hasLayer(wtplocationGroup)) {//'./jsons/WS_WTP_Locations_Approx.json';
		wtplocationGroup.eachLayer(function (layer) {
			var rdvalues = iconByStations(layer.feature.properties.Cap_MGD, minWTPloc, '');
			layer.setStyle({ radius: rdvalues });
		});

	}
	if (map.hasLayer(cetpGroup)) {//'./jsons/SW_CommonEffluentTreatmentPlant_pt.json';
		cetpGroup.eachLayer(function (layer) {
			var rdvalues = iconByStations(layer.feature.properties.Cap_MGD, minCET, '');
			layer.setStyle({ radius: rdvalues * 0.2 });
		});
	}
	if (map.hasLayer(spwGroup)) {//'./jsons/SW_SewagePumpingStation.json';
		spwGroup.eachLayer(function (layer) {
			layer.setStyle({ radius: 4 });
		});
	}
	if (map.hasLayer(stppGroup)) {//'./jsons/SW_SewerageTreatmentPlant_point.json';
		stppGroup.eachLayer(function (layer) {
			var rdvalues = iconByStations(layer.feature.properties.Cap_MGD, minSTP, '');
			layer.setStyle({ radius: rdvalues * 0.25 });
		});
	}
	if (map.hasLayer(wqdelhiGroup)) {//'./jsons/WQ_Locations_Approx.json';
		wqdelhiGroup.eachLayer(function (layer) {
			layer.setStyle({ radius: 8 });
		});
	}

	previousZoom = currentZoom;
});

//****************Map Zoomed****************

(function () {
	var control = new L.Control({ position: 'topleft' });
	control.onAdd = function (map) {
		var azoom = L.DomUtil.create('a', 'resetzoom');
		azoom.href = "#";
		azoom.innerHTML = "[Reset Zoom]";
		//azoom.innerHTML = '<img src="images/reset.png" width="20" height="20" alt="Reset" />';
		//console.log(nctbounds.getEast());
		//console.log(nctbounds.getNorth());
		//console.log(nctbounds.getWest());
		//console.log(viewpoint);
		//console.log(nctbounds.getSouth());
		L.DomEvent
			.disableClickPropagation(azoom)
			.addListener(azoom, 'click', function () {
				//console.log(viewpoint[0]);
				map.setView(new L.LatLng(lat, lng), zoom);
				//map.setView(new L.LatLng(viewpoint[0]), 12);
				//map.setView(map.options.center, map.options.zoom);
			}, azoom);
		return azoom;
	};
	return control;
}()).addTo(map);

function iconByStations(value, minValue, iconpic) {
	// var calculatedSize = (value / 80) * 30;
	//return 1.0083 * Math.pow(val/minValue,.5716) * minRadius;
	//var calculatedSize = Math.round(1.0083 * Math.pow(value / 400, .5716) * 10, 0);
	//var calculatedSize = (value) * 2;
	//console.log([value, minValue, iconpic])
	var minRadius = iconpic == '' || iconpic == null ? 3 : 10;
	var calculatedSize = Math.round(1.0083 * Math.pow(value / minValue, .5716) * minRadius, 0);

	if (iconpic == '' || iconpic == null) return calculatedSize;

	return L.icon({
		iconUrl: iconpic,
		iconSize: [calculatedSize, calculatedSize]
	});
}

//function iconByStations(value, iconpic) {
//	//	var calculatedSize = (value / 80) * 30;
//	//return 1.0083 * Math.pow(val/minValue,.5716) * minRadius;

//	var calculatedSize = Math.round(1.0083 * Math.pow(value / 400, .5716) * 10, 0);
//	//        console.log(calculatedSize);


//	//var calculatedSize = (value) * 2;

//	// create metro icons
//	return L.icon({
//		iconUrl: iconpic,
//		iconSize: [calculatedSize, calculatedSize]
//	});
//}

// Set up styles for subway lines
function lineStyle(feat) {

	//	console.log(feat.properties.Diameter);

	var calculatedSize = 1.2
	var colr = '#1a1aff'
	var dashlst = '2,2'
	if (feat.properties.Control_Ag == 'I&FC') {
		colr = '#007fff',
			calculatedSize = 2.4,
			dashlst = '0,0'
	};

	return {
		"color": colr,
		"weight": calculatedSize,
		"dashArray": dashlst
	};
}

function layerClickHandler(e) {

	var marker = e.target,
		properties = e.target.feature.properties;

	if (marker.hasOwnProperty('_popup')) {
		marker.unbindPopup();
	}

	var template = '<form id="popup-form"><table class="popup-table">';

	Object.keys(properties).forEach((line) => {
		var value = ''; //isCustomNumber(properties[line]) === true ? Number(properties[line]).toFixed(2) : properties[line];
		if (isCustomNumber(properties[line]) === true) {
			value = (Number(properties[line]) - Math.floor(Number(properties[line]))) !== 0 ? Number(properties[line]).toFixed(2) : properties[line];
		} else {
			value = properties[line]
		}
		template = template + '<tr class="popup-table-row1">\
		 <th class="popup-table-header">'+ line + ':</th>\
		 <td id="value-arc" class="popup-table-data">'+ value + '</td></tr>'
	});

	template = template + '</table></form>';

	marker.bindPopup(template, {
		maxWidth: "auto",
		direction: 'bottom',
		//permanent: true,
		//noHide: true,
		//offset: L.point(0, -20)
	});
	marker.openPopup();

}
function wslocationChart_xxxx(d) {

	if (typeof (d.feature) == 'undefined') return;

	var feature = d.feature;
	var ID = feature.properties.ID;
	//var loc = feature.properties.Sampling;

	if (wschartdata == null) return '<h3>No data</h3>';
	//Date,Locations,Code,pH,COD-(mg/l),BOD-(mg/l),DO-(mg/l),Total Coliform-(MPN/100ml)
	//4-Jan-2010,River Yamuna at Palla,YR-1,8,24,2.8,7,-
	//console.log(wqchartdata);
	//console.log(code);
	//console.log(loc);
	var filteredData = wschartdata.filter(function (dv) {
		return dv.ID == ID;
	});

	//console.log(filteredData);

	if (filteredData.length == 0) return;

	var parseTime1 = d3.timeParse("%d-%b-%Y");

	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	var chartData = filteredData.map(function (d) {
		return {
			Date: parseTime1(d.Date),
			Peak_PC_MGD: Number(d.Peak_PC_MGD),
			Prod_Today: Number(d.Prod_Today),
		};
	})

	// ************ Ends file merge  ************

	var newobj = d3.create('div')
		.attr("class", "tabs")
	newobj.append('div')
		.attr("id", "tab-1")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-2")
		.attr("class", "tab")
	//newobj.append('div')
	//    .attr("id", "tab-3")
	//    .attr("class", "tab")
	newobj.selectAll(".tab")
		.append('div')
		.attr("class", "content")
		.style("width", "100%")
		.attr("id", function (d, i) {
			return "content" + i;
		})

	var divtooltip = d3.select("#maptool").attr("class", "tbtoolTip");

	var margin = { top: 60, right: 60, bottom: 100, left: 60 },
		marginZoom = { top: 350, right: 60, bottom: 20, left: 60 },
		width = 675 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom,
		heightZoom = 400 - marginZoom.top - marginZoom.bottom;


	var divchart = newobj.select("#content0")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)

	newobj.select("#content1")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom - 10)
		.style("padding", "10px");

	//@@@@@@@@@@@@@@ new chart chart from here @@@@@@@@@@@@@@@@@@@@


	////====================== chart ========================
	var svg = divchart.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("fill", "#ccc");

	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var xScale = d3.scaleBand()
		.rangeRound([0, width])
		.padding(0.1)
		.domain(chartData.map(function (d) {
			return d.Date;
		}));
	yScale = d3.scaleLinear()
		.rangeRound([height, 0])
		.domain([0, d3.max(chartData, (function (d) {
			return Math.max(d.Peak_PC_MGD, d.Prod_Today);
		}))]);

	// axis-x
	g.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(xScale));

	// axis-y
	g.append("g")
		.attr("class", "axis axis--y")
		.call(d3.axisLeft(yScale));

	var bar = g.selectAll("rect")
		.data(chartData)
		.enter().append("g");

	// bar chart
	bar.append("rect")
		.attr("x", function (d) { return xScale(d.Date); })
		.attr("y", function (d) { return yScale(d.Prod_Today); })
		.attr("width", xScale.bandwidth())
		.attr("height", function (d) { return height - yScale(d.Prod_Today); })
		.attr("class", function (d) {
			var s = "bar ";
			if (d.Peak_PC_MGD < 400) {
				return s + "bar1";
			} else if (d.Peak_PC_MGD < 800) {
				return s + "bar2";
			} else {
				return s + "bar3";
			}
		});

	// labels on the bar chart
	bar.append("text")
		.attr("dy", "1.3em")
		.attr("x", function (d) { return xScale(d.Date) + xScale.bandwidth() / 2; })
		.attr("y", function (d) { return yScale(d.Prod_Today); })
		.attr("text-anchor", "middle")
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black")
		.text(function (d) {
			return d.Prod_Today;
		});

	// line chart
	var line = d3.line()
		.x(function (d, i) { return xScale(d.Date) + xScale.bandwidth() / 2; })
		.y(function (d) { return yScale(d.Peak_PC_MGD); })
		.curve(d3.curveMonotoneX);

	bar.append("path")
		.attr("class", "line") // Assign a class for styling
		.attr("d", line(chartData)); // 11. Calls the line generator

	bar.append("circle") // Uses the enter().append() method
		.attr("class", "dot") // Assign a class for styling
		.attr("cx", function (d, i) { return xScale(d.Date) + xScale.bandwidth() / 2; })
		.attr("cy", function (d) { return yScale(d.Peak_PC_MGD); })
		.attr("r", 5);

	return newobj.node();

}
function wslocationChart(d) {

	if (typeof (d.feature) == 'undefined') return;

	var feature = d.feature;
	var ID = feature.properties.ID;

	if (wschartdata == null) return '<h3>No data</h3>';

	var filteredData = wschartdata.filter(function (dv) {
		return dv.ID == ID;
	});

	//console.log(filteredData);

	if (filteredData.length == 0) return '<h3>No data</h3>';

	var parseTime1 = d3.timeParse("%d-%b-%Y");

	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	var chartData = filteredData.map(function (d) {
		return {
			Date: parseTime1(d.Date),
			Peak_PC_MGD: Number(d.Peak_PC_MGD),
			Prod_Today: Number(d.Prod_Today),
		};
	})

	// ************ Ends file merge  ************

	var newobj = d3.create('div')
		.attr("class", "tabs")
	newobj.append('div')
		.attr("id", "tab-1")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-2")
		.attr("class", "tab")
	//newobj.append('div')
	//    .attr("id", "tab-3")
	//    .attr("class", "tab")
	newobj.selectAll(".tab")
		.append('div')
		.attr("class", "content")
		.style("width", "100%")
		.attr("id", function (d, i) {
			return "content" + i;
		})

	var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

	var margin = { top: 60, right: 60, bottom: 100, left: 60 },
		marginZoom = { top: 350, right: 60, bottom: 20, left: 60 },
		width = 675 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom,
		heightZoom = 400 - marginZoom.top - marginZoom.bottom;

	var x = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]),
		//x1 = d3.scaleTime().range([0, width]),
		y1 = d3.scaleLinear().range([height, 0]),
		xZoom = d3.scaleTime().range([0, width]),
		yZoom = d3.scaleLinear().range([heightZoom, 0]),
		y1Zoom = d3.scaleLinear().range([heightZoom, 0]);

	//var divchart = d3.create('div').attr("width", width + margin.left + margin.right)
	//    .attr("height", height + margin.top + margin.bottom);

	var divchart = newobj.select("#content0")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)

	newobj.select("#content1")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom - 10)
		.style("padding", "10px");

	////====================== chart ========================
	var svg = divchart.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("fill", "#ccc");

	//var parseTime = d3.timeParse("%Y-%m-%d");
	//var parseTime = d3.timeParse("%d-%b-%Y");

	var xAxis = d3.axisBottom(x),
		xAxisZoom = d3.axisBottom(xZoom),
		yAxis = d3.axisLeft(y),
		y1Axis = d3.axisRight(y1);

	var brush = d3.brushX()
		.extent([[0, 0], [width, heightZoom]])
		.on("brush end", brushed);

	var zoom = d3.zoom()
		.scaleExtent([1, Infinity])
		.translateExtent([[0, 0], [width, height]])
		.extent([[0, 0], [width, height]])
		.on("zoom", zoomed);

	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	var line1 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y(Number(d.Peak_PC_MGD)); });

	var line2 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y1(Number(d.Prod_Today)); });


	var line1Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return yZoom(Number(d.Peak_PC_MGD)); });
	var line2Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return y1Zoom(Number(d.Prod_Today)); });

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);
	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	x.domain(d3.extent(chartData, function (d) {
		return d.Date;
	}));
	y.domain([d3.min(chartData, function (d) {
		return Number(d.Peak_PC_MGD);
	}) * 0.95, d3.max(chartData, function (d) {
		return Number(d.Peak_PC_MGD);
	}) * 1.05]);

	//x1.domain(d3.extent(chartData, function (d) {
	//	return d.Date;
	//}));
	//var max = d3.max(data, function (d) {
	//	Math.max(d.male, d.female, d.both);
	//});
	//var max = d3.min(data, function (d) {
	//	Math.min(d.male, d.female, d.both);
	//});

	y1.domain([d3.min(chartData, function (d) {
		return (Number(d.Prod_Today));
	}) * 0.95, d3.max(chartData, function (d) {
		return (Number(d.Prod_Today));
	}) * 1.05]);

	xZoom.domain(x.domain());
	yZoom.domain(y.domain());
	y1Zoom.domain(y1.domain());

	//console.log([y.domain(), y1.domain()]);

	//********************* gridlines ******************
	function make_x_gridlines() {
		return d3.axisBottom(x)
	}

	function make_y_gridlines() {
		return d3.axisLeft(y)
	}

	var focus = svg.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + marginZoom.left + "," + marginZoom.top + ")");

	focus.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_gridlines()
			.tickSize(-height)
			.tickFormat("")
		)

	focus.append("g")
		.attr("class", "grid")
		.call(make_y_gridlines()
			.tickSize(-width)
			.tickFormat("")
		)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line2")
		.attr("d", line1)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line3")
		.attr("d", line2)

	//var barwidth = (width / chartData.length)-5;

	//var rect = svg.append("g")
	//	.attr("class", "bar2")
	//var barRect = rect.selectAll('rect').data(chartData);
	//barRect.enter()
	//	.append("rect")
	//	.attr('x', function (d) {
	//		return x(d.Date)+65;
	//	})
	//	.attr("y", function (d) { return y1(d.Prod_Today)+50; })
	//	.attr("width", barwidth)
	//	.attr("height", function (d) { return height - y1(d.Prod_Today); })

	//// labels on the bar chart
	//barRect.append("text")
	//	.datum(chartData)
	//	.attr("dy", "1.3em")
	//	.attr("x", function (d) { return x(d.Date) + (x(d3.timeDay.offset(d.Date, 10)) - x(d.Date)) / 2; })
	//	.attr("y", function (d) { return y1(d.Prod_Today); })
	//	.attr("text-anchor", "middle")
	//	.attr("font-family", "sans-serif")
	//	.attr("font-size", "11px")
	//	.attr("fill", "black")
	//	.text(function (d) {
	//		return d.Prod_Today;
	//	});

	// writting axix /////
	focus.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	focus.append("g")
		.attr("class", "axis axis--y")
		.call(yAxis);

	focus.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(" + width + ",0)")
		.call(y1Axis);
	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@
	// Left
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", - (height / 2))
		.attr("y", - (margin.left - 15))
		.attr("style", "font-size:10pt;fill:black;")
		.attr("transform", "rotate(-90)")
		.text('Peak_PC_MGD');

	// Right
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", - (height / 2))
		.attr("y", width + margin.right - 5)
		.attr("style", "font-size:10pt;fill:black;")
		.attr("transform", "rotate(-90)")
		.text('Prod_Today');

	// x Label
	var newtitle = d3.timeFormat('%d-%b-%Y')(new Date(x.domain()[0])) + ' - ' + d3.timeFormat('%d-%b-%Y')(new Date(x.domain()[1]));
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", (width / 2) - 10)
		.attr("y", marginZoom.top - margin.top - 10)
		.attr("style", "font-size:8pt;fill:steelblue;")
		.text(newtitle);

	// Main Title
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", (width / 2) - 10)
		.attr("y", -20)
		//		.attr("style", "font-size:10pt;fill:steelblue;weight:bold;")
		.attr("style", "font-size:12pt;fill:black;weight:bold;")
		.text('WS_WTP_Locations');

	/////// adding legend   ///////
	var legend = svg.append("g")
		.attr("class", "legend1")
		.attr("height", 100)
		.attr("width", 400)
		.attr('transform', 'translate(-100,60)');

	//Sl,Date,WTP_Name,ID,Raw_WSrc,Peak_PC_MGD,Prod_Today
	var legendcolors = [["Peak_PC_MGD", "#f614ff"], ["Prod_Today", "blue"]];

	var legendRect = legend.selectAll('rect').data(legendcolors);
	legendRect.enter()
		.append("rect")
		.attr("x", width - 65)
		.attr("width", 10)
		.attr("height", 3)
		.attr("y", function (d, i) {
			return (i * 20) + 3;
		})
		.style("fill", function (d) {
			return d[1];
		});

	//legendRect.enter()
	//	.append("circle")
	//	.attr("class", "point1")
	//	.attr("x", width - 60)
	//	.attr("cx", width - 60)
	//	.attr("cy", 4.5)
	//	.attr("r", 2.5)
	//	.style("fill", "red");

	var legendText = legend.selectAll('text').data(legendcolors);

	legendText.enter()
		.append("text")
		.attr("x", width - 52)
		.style("fill", "#000")
		.attr("y", function (d, i) {
			return i * 20 + 9;
		})
		.text(function (d) {
			return d[0];
		});

	context.append("path")
		.datum(chartData)
		.attr("class", "line2")
		.attr("d", line1Zoom);

	context.append("path")
		.datum(chartData)
		.attr("class", "line3")
		.attr("d", line2Zoom);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightZoom + ")")
		.call(xAxisZoom);

	context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, x.range());

	function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
		var selection = d3.event.selection;
		x.domain(selection.map(xZoom.invert, xZoom));
		focus.selectAll(".line2")
			.attr("d", function (d) {
				return line1(d);
			});
		focus.selectAll(".line3")
			.attr("d", function (d) {
				return line2(d);
			});

		//focus.selectAll(".bar")
		//	.attr("cx", function (d) {
		//		return x(d.Date);
		//	})
		//	.attr("cy", function (d) {
		//		return y1(Number(d.Prod_Today));
		//	});

		focus.select(".axis--x").call(xAxis);
		focus.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (selection[1] - selection[0]))
			.translate(-selection[0], 0));
	}

	function zoomed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
		var t = d3.event.transform;
		x.domain(t.rescaleX(xZoom).domain());
		focus.select(".line2").attr("d", line1);
		focus.select(".line3").attr("d", line2);
		focus.select(".axis--x").call(xAxis);
		context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
	}

	//var tbdatobj = newobj.select("#content1").append('table')
	//descripttable(chartmergeddata, ['timeseries', 'waterdepth', 'floodrate'], tbdatobj, true);

	return newobj.node();
}
//var chartunits = { "pH": "pH", "COD": "(mg/l)", "BOD": "(mg/l)", "DO": "(mg / l)", "TotalColiform": "(MPN/100ml)" };
function showchart_zoom(d) {

	if (typeof (d.feature) == 'undefined') return;

	var feature = d.feature;
	var code = feature.properties.Code;
	var loc = feature.properties.Sampling;

	if (wqchartdata == null) return '<h3>No data</h3>';
	//Date,Locations,Code,pH,COD-(mg/l),BOD-(mg/l),DO-(mg/l),Total Coliform-(MPN/100ml)
	//4-Jan-2010,River Yamuna at Palla,YR-1,8,24,2.8,7,-
	//console.log(wqchartdata);
	//console.log(code);
	//console.log(loc);
	var filteredData = wqchartdata.filter(function (dv) {
		return dv.Code == code;
	});

	//console.log(filteredData);

	if (filteredData.length == 0) return;

	var parseTime1 = d3.timeParse("%d-%b-%Y");

	//Date,Locations,Code,pH,COD,BOD,DO,TotalColiform
	var chartData = filteredData.map(function (d) {
		//console.log(parseTime1(d.Date));
		return {
			//Date: new Date(d.Date),
			Date: parseTime1(d.Date),
			pH: Number(d.pH),
			COD: Number(d.COD),
			BOD: Number(d.BOD),
			DO: Number(d.DO),
			TotalColiform: Number(d.TotalColiform),
		};
	})
	//console.log(chartData)
	//return "<b>No Data</b>";

	//var frfiltered = jfrdata.map(function (d) {
	//	return {
	//		timeseries: d.timeseries,
	//		floodrate: d[code],
	//	};
	//})
	////console.log(frfiltered)

	////// ************ File merge  ************
	//var hash = Object.create(null);
	//wdfiltered.concat(frfiltered).forEach(function (obj) {
	//	hash[obj.timeseries] = Object.assign(hash[obj.timeseries] || {}, obj);
	//});
	//var chartmergeddata = Object.keys(hash).map(function (key) {
	//	return hash[key];
	//});


	//console.log(a3)
	// ************ Ends file merge  ************

	var newobj = d3.create('div')
		.attr("class", "tabs")
	newobj.append('div')
		.attr("id", "tab-1")
		.attr("class", "tab")
	newobj.append('div')
		.attr("id", "tab-2")
		.attr("class", "tab")
	//newobj.append('div')
	//    .attr("id", "tab-3")
	//    .attr("class", "tab")
	newobj.selectAll(".tab")
		.append('div')
		.attr("class", "content")
		.style("width", "100%")
		.attr("id", function (d, i) {
			return "content" + i;
		})
	//.append('b')
	//.text(function (d, i) {
	//    return "Tab " + i + " content";
	//})
	//  	var ulobj = newobj.append('ul') //Sandhya
	//  		.attr("class", "tabs-link")
	//  	ulobj.append('li')
	//  		.attr("class", "tab-link")
	//  		.append('a').attr("href", "#tab-1")
	//  		.append('span')
	//  		.text("Chart")
	//  	ulobj.append('li')
	//  		.attr("class", "tab-link")
	//  		.append('a').attr("href", "#tab-2")
	//  		.append('span')
	//  		.text("Table") //Sandhya
	//ulobj.append('li')
	//    .attr("class", "tab-link")
	//    .append('a').attr("href", "#tab-3")
	//    .append('span')
	//    .text("Description")

	//newobj.append('div')
	//    .attr("id", "lableheader")
	//    .append('span').text(basename)

	var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

	var margin = { top: 60, right: 60, bottom: 100, left: 60 },
		marginZoom = { top: 350, right: 60, bottom: 20, left: 60 },
		width = 675 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom,
		heightZoom = 400 - marginZoom.top - marginZoom.bottom;

	var x = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]),
		//x1 = d3.scaleTime().range([0, width]),
		y1 = d3.scaleLinear().range([height, 0]),
		xZoom = d3.scaleTime().range([0, width]),
		yZoom = d3.scaleLinear().range([heightZoom, 0]),
		y1Zoom = d3.scaleLinear().range([heightZoom, 0]);

	//var divchart = d3.create('div').attr("width", width + margin.left + margin.right)
	//    .attr("height", height + margin.top + margin.bottom);

	var divchart = newobj.select("#content0")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom)

	newobj.select("#content1")
		.style("width", width + margin.left + margin.right)
		.style("height", height + margin.top + margin.bottom - 10)
		.style("padding", "10px");

	////====================== chart ========================
	var svg = divchart.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.style("fill", "#ccc");

	//var parseTime = d3.timeParse("%Y-%m-%d");
	//var parseTime = d3.timeParse("%d-%b-%Y");

	var xAxis = d3.axisBottom(x),
		xAxisZoom = d3.axisBottom(xZoom),
		yAxis = d3.axisLeft(y),
		y1Axis = d3.axisRight(y1);

	var brush = d3.brushX()
		.extent([[0, 0], [width, heightZoom]])
		.on("brush end", brushed);

	var zoom = d3.zoom()
		.scaleExtent([1, Infinity])
		.translateExtent([[0, 0], [width, height]])
		.extent([[0, 0], [width, height]])
		.on("zoom", zoomed);

	//Date,Locations,Code,pH,COD,BOD,DO,TotalColiform
	var line1 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y(Number(d.pH)); });
	var line2 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y(Number(d.COD)); });
	var line3 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y(Number(d.BOD)); });
	var line4 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y(Number(d.DO)); });

	var line5 = d3.line()
		.x(function (d) { return x(d.Date); })
		.y(function (d) { return y1(Number(d.TotalColiform)); });


	var line1Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return yZoom(Number(d.pH)); });
	var line2Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return yZoom(Number(d.COD)); });
	var line3Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return yZoom(Number(d.BOD)); });
	var line4Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return yZoom(Number(d.DO)); });

	var line5Zoom = d3.line()
		.x(function (d) { return xZoom(d.Date); })
		.y(function (d) { return y1Zoom(Number(d.TotalColiform)); });

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
		.attr("width", width)
		.attr("height", height);

	x.domain(d3.extent(chartData, function (d) {
		return d.Date;
	}));
	y.domain([0, d3.max(chartData, function (d) {
		return (Math.max(d.pH, d.COD, d.BOD, d.DO));
	}) * 1.2]);

	//x1.domain(d3.extent(chartData, function (d) {
	//	return d.Date;
	//}));
	//var max = d3.max(data, function (d) {
	//	Math.max(d.male, d.female, d.both);
	//});
	//var max = d3.min(data, function (d) {
	//	Math.min(d.male, d.female, d.both);
	//});
	//Date,Locations,Code,pH,COD,BOD,DO,TotalColiform
	y1.domain([0, d3.max(chartData, function (d) {
		return (Number(d.TotalColiform));
	}) * 1.2]);

	xZoom.domain(x.domain());
	yZoom.domain(y.domain());
	y1Zoom.domain(y1.domain());

	//********************* gridlines ******************
	function make_x_gridlines() {
		return d3.axisBottom(x)
	}

	function make_y_gridlines() {
		return d3.axisLeft(y)
	}

	var focus = svg.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + marginZoom.left + "," + marginZoom.top + ")");

	focus.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.call(make_x_gridlines()
			.tickSize(-height)
			.tickFormat("")
		)

	focus.append("g")
		.attr("class", "grid")
		.call(make_y_gridlines()
			.tickSize(-width)
			.tickFormat("")
		)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line1")
		.attr("d", line1)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line2")
		.attr("d", line2)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line3")
		.attr("d", line3)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line4")
		.attr("d", line4)

	focus.append("path")
		.datum(chartData)
		.attr("class", "line5")
		.attr("d", line5);

	// writting axix /////
	focus.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	focus.append("g")
		.attr("class", "axis axis--y")
		.call(yAxis);

	focus.append("g")
		.attr("class", "axis axis--y")
		.attr("transform", "translate(" + width + ",0)")
		.call(y1Axis);

	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ Titles @@@@@@@@@@@@@@@@@@@@@@@@@@@@
	// Left
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", - (height / 2))
		.attr("y", - (margin.left - 15))
		.attr("style", "font-size:10pt;fill:black;")
		.attr("transform", "rotate(-90)")
		.text('Value');

	// Right
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", - (height / 2))
		.attr("y", width + margin.right - 5)
		.attr("style", "font-size:10pt;fill:black;")
		.attr("transform", "rotate(-90)")
		.text('Total Coliform (MPN/100ml)');

	// x Label
	var newtitle = d3.timeFormat('%d-%b-%Y')(new Date(x.domain()[0])) + ' - ' + d3.timeFormat('%d-%b-%Y')(new Date(x.domain()[1]));
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", (width / 2) - 10)
		.attr("y", marginZoom.top - margin.top - 10)
		.attr("style", "font-size:8pt;fill:steelblue;")
		.text(newtitle);

	// Main Title
	focus.append("text")
		.attr("class", "y axis")
		.attr("text-anchor", "middle")
		.attr("x", (width / 2) - 10)
		.attr("y", -20)
		//		.attr("style", "font-size:10pt;fill:steelblue;weight:bold;")
		.attr("style", "font-size:12pt;fill:black;weight:bold;")
		.text('Water Quality Parameters at ' + loc);

	/////// adding legend   ///////
	var legend = svg.append("g")
		.attr("class", "legend1")
		//.attr("x", w - 65)
		//.attr("y", 50)
		.attr("height", 100)
		.attr("width", 400)
		.attr('transform', 'translate(-100,60)');
	//var chartunits = { "pH": "pH", "COD": "(mg/l)", "BOD": "(mg/l)", "DO": "(mg/l)", "TotalColiform": "(MPN/100ml)" };
	//green,red, yellow, brown, cyan
	//  	var legendcolors = [["Alkaline (pH)", "green"],
	//  	["Chemical Oxygen Demand (mg/l)", "red"],
	//  	["Biochemical Oxygen Demand (mg/l)", "yellow"],
	//  	["Dissolved Oxygen (mg/l)", "brown"],
	//  	["Total Coliform (MPN/100ml)", "cyan"]];
	var legendcolors = [["Alkaline (pH)", "#FF5733"],
	["Chemical Oxygen Demand (mg/l)", "#f614ff"],
	["Biochemical Oxygen Demand (mg/l)", "blue"],
	["Dissolved Oxygen (mg/l)", "green"],
	["Total Coliform (MPN/100ml)", "red"]];


	var legendRect = legend.selectAll('rect').data(legendcolors);
	legendRect.enter()
		.append("rect")
		.attr("x", width - 65)
		.attr("width", 10)
		.attr("height", 3)
		.attr("y", function (d, i) {
			return (i * 20) + 3;
		})
		.style("fill", function (d) {
			return d[1];
		});

	//legendRect.enter()
	//	.append("circle")
	//	.attr("class", "point1")
	//	.attr("x", width - 60)
	//	.attr("cx", width - 60)
	//	.attr("cy", 4.5)
	//	.attr("r", 2.5)
	//	.style("fill", "red");

	var legendText = legend.selectAll('text').data(legendcolors);

	legendText.enter()
		.append("text")
		.attr("x", width - 52)
		.style("fill", "#000")
		.attr("y", function (d, i) {
			return i * 20 + 9;
		})
		.text(function (d) {
			return d[0];
		});

	context.append("path")
		.datum(chartData)
		.attr("class", "line1")
		.attr("d", line1Zoom);

	context.append("path")
		.datum(chartData)
		.attr("class", "line2")
		.attr("d", line2Zoom);

	context.append("path")
		.datum(chartData)
		.attr("class", "line3")
		.attr("d", line3Zoom);

	context.append("path")
		.datum(chartData)
		.attr("class", "line4")
		.attr("d", line4Zoom);

	context.append("path")
		.datum(chartData)
		.attr("class", "line5")
		.attr("d", line5Zoom);

	context.append("g")
		.attr("class", "axis axis--x")
		.attr("transform", "translate(0," + heightZoom + ")")
		.call(xAxisZoom);

	context.append("g")
		.attr("class", "brush")
		.call(brush)
		.call(brush.move, x.range());

	function brushed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
		var selection = d3.event.selection;
		x.domain(selection.map(xZoom.invert, xZoom));
		focus.selectAll(".line1")
			.attr("d", function (d) {
				return line1(d);
			});
		focus.selectAll(".line2")
			.attr("d", function (d) {
				return line2(d);
			});
		focus.selectAll(".line3")
			.attr("d", function (d) {
				return line3(d);
			});
		focus.selectAll(".line4")
			.attr("d", function (d) {
				return line4(d);
			});
		focus.selectAll(".line5")
			.attr("d", function (d) {
				return line5(d);
			});
		//focus.selectAll(".point1")
		//	.attr("cx", function (d) {
		//		return x(d.Date);
		//	})
		//	.attr("cy", function (d) {
		//		return y(Number(d.pH));
		//	});

		focus.select(".axis--x").call(xAxis);
		focus.select(".zoom").call(zoom.transform, d3.zoomIdentity
			.scale(width / (selection[1] - selection[0]))
			.translate(-selection[0], 0));
	}

	function zoomed() {
		if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;
		var t = d3.event.transform;
		x.domain(t.rescaleX(xZoom).domain());
		focus.select(".line1").attr("d", line1);
		focus.select(".line2").attr("d", line2);
		focus.select(".line3").attr("d", line3);
		focus.select(".line4").attr("d", line4);
		focus.select(".line5").attr("d", line5);
		focus.select(".axis--x").call(xAxis);
		context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
	}

	//var tbdatobj = newobj.select("#content1").append('table')
	//descripttable(chartmergeddata, ['timeseries', 'waterdepth', 'floodrate'], tbdatobj, true);

	return newobj.node();
}
//function descripttable(data, columns, tableObj, tableheader) {
//	//var table = d3.create('div').append('table').attr("width", "100%")
//	//tableObj.append('table').attr("width", "100%")
//	var tbody = tableObj.append('tbody');

//	if (tableheader === true) {
//		var thead = tableObj.append('thead')
//		thead.append('tr')
//			.selectAll('th')
//			.data(columns).enter()
//			.append('th')//.style("background-color", "#804000")
//			.text(function (column) {
//				if (column == 'timeseries') return 'Date/Time'
//				else if (column == 'floodrate') return 'Flood rate (m3/h)'
//				else return 'Water depth (m)'
//				//return column;

//			});
//	}

//	var rows = tbody.selectAll('tr')
//		.data(data)
//		.enter()
//		.append('tr');

//	var cells = rows.selectAll('td')
//		.data(function (row) {
//			return columns.map(function (column) {
//				//console.log(column);
//				if (column !== 'floodrate') {
//					return { column: column, value: row[column] };
//				}
//				else {
//					return { column: column, value: row[column] * 3600 };
//					//return { column: column, value: parseFloat(row[column] * 3600).toFixed(3) };
//				}
//			});
//		})
//		.enter()
//		.append('td')
//		.style("border", function (d) {
//			if (tableheader === true)
//				return "1px groove #ccc";
//			else
//				return "none";
//		})
//		.style("text-align", function (d) {
//			if (d.column !== 'timeseries')
//				return 'right';
//			else
//				return 'left';
//		})
//		.text(function (d) {
//			//return d.value;
//			return d.column == 'timeseries' ? d.value : parseFloat(d.value).toFixed(3);
//		});

//	return tableObj;
//}

let demlayerGeo = null;//, wrflayerGeo = null, gfsminmax = [], wrfminmax = [];
function loadGeoTiff(flname, demGroup) {
	//if (map.hasLayer(demlayerGeo))
	//	map.removeLayer(demlayerGeo);

	d3.request(flname).responseType('arraybuffer').get(
		function (error, tiffData) {
			// Geopotential height (BAND 0)
			let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);
			//gfsminmax = geo.range;

			//var scale = prmWeather === 'PCP' ? chroma.scale('Blues').domain([minZ, maxZ]) : chroma.scale('YlOrRd').domain([minZ, maxZ]);

			demlayerGeo = L.canvasLayer.scalarField(geo,
				{
					//color: chroma.scale('Blues').domain(geo.range),
					//color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range),
					color: chroma.scale('Blues').domain([0, 8]),
					//color: d3.scaleLinear().domain(geo.range).range(colorbrewer.YlOrRd[9]),
					opacity: 0.75
				}).addTo(demGroup);

			var tooltipOptions = { closeButton: false, direction: 'top', permanent: false };
			var tooltip = L.tooltip(tooltipOptions);

			demlayerGeo.on('click', function (e) {
				if (e.value !== null) {
					let v = Number(e.value).toFixed(1);
					//if (prmWeather == 'PCP')
					//    document.getElementById('gfsinfoid').innerHTML = 'Rainfall ' + v + ' mm';
					//else
					//    document.getElementById('gfsinfoid').innerHTML = 'Temperature ' + v + ' degC';
					let html = (`<span class="popupText">Unauthorised Colonies ${v} m</span>`);;
					//if (prmWeather == 'PCP')
					//    html = (`<span class="popupText">Rainfall ${v} mm</span>`);
					//else
					//    html = (`<span class="popupText">Temperature ${v} degC</span>`);

					//{
					//    className: 'nodetooltip',
					//    closeButton: false,
					//    sticky: true,
					//    direction: 'top',
					//    //permanent: true,
					//    //noHide: true,
					//    offset: L.point(0, -20)
					//}

					tooltip.setContent(html);
					map.openTooltip(tooltip, L.latLng(e.latlng), tooltipOptions);

					//let popup = L.popup()
					//    .setLatLng(e.latlng)
					//    .setContent(html)
					//    .openOn(map);
				}
			});
			demlayerGeo.on('mousemove', function (e) {
				map.closeTooltip(tooltip)
			});
			demlayerGeo.on('mouseout', function (e) {
				map.closeTooltip(tooltip)
			});

			//mapgfs.fitBounds(demlayerGeo.getBounds());
			//mapgfs.spin(false);

			//console.log(new Date());

		});
}

//@@@@@@@@@@@@@@@ Delhi Population @@@@@@@@@@@@@@@@@

//style: {
//	color: '#404040',
//	dashArray: '1,5', //'5, 2',
//	fillColor: '#404040',
//	fillOpacity: 0,
//	weight: 1.2
//}

var distward = document.getElementById('distward')
$("#divtools img").on('click', function (e) {
	var selectedtool = $(this).attr('title');
	if (selectedtool === 'Togglemenu') {
		//if (map.hasLayer(osm)) {
		//	map.removeLayer(osm);
		//	map.addLayer(satellite);
		//}
		//else if (map.hasLayer(satellite)) {
		//	map.removeLayer(satellite);
		//	map.addLayer(osm);
		//}
		//distward
		if (typeof distward !== 'undefined' && distward !== null) {
			var isHidden = distward.style.display == "none";
			if (isHidden) {
				distward.style.display = "block";
			} else {
				distward.style.display = "none";
			}
		}
	}
	else if (selectedtool === 'Layers') { }
	else if (selectedtool === 'Chart') { }
	else if (selectedtool === 'Population') { }
	else if (selectedtool === 'Density') { }
	else if (selectedtool === 'Print') {
		printDiv();
	}
	else if (selectedtool === 'Download') {
		DownloadAsImage('reportbox');
	}
});

var style = {
	'default': {
		'fillColor': '#FFFFFF00',
		//'color': 'white'
	},
	'highlight': {
		'fillColor': 'cyan',
		//'color': 'cyan',
		'fillOpacity': 0.3
	}
};

var highlight;
function setHighlight(layer) {
	if (highlight) {
		unsetHighlight(highlight);
	}
	style.default.fillColor = layer.options.fillColor;
	//console.log(layer.options.fillColor);
	//console.log(style);
	layer.setStyle(style.highlight);
	highlight = layer;
}

function unsetHighlight(layer) {
	highlight = null;
	layer.setStyle(style.default);
}

var divtooltip = d3.select("#charttool").attr("class", "tbtoolTip");
function createPieChart(elid, data) {
	//var data = [
	//    { name: "USA", value: 60 },
	//    { name: "UK", value: 20 },
	//    { name: "Canada", value: 30 },
	//    { name: "Maxico", value: 15 },
	//    { name: "Japan", value: 10 },
	//];
	//var text = "";
	//var thickness = 40;
	//var duration = 750;

	//var elementExists = document.getElementById(elid);
	//console.log(elementExists);
	//console.log([elid, data]);

	var width = 200;
	var height = 200;
	var padding = 10;
	var opacity = .8;
	//var opacityHover = 1;
	//var otherOpacityOnHover = .8;
	//var tooltipMargin = 20;

	var radius = Math.min(width - padding, height - padding) / 2;
	//var color = d3.scaleOrdinal(d3.schemeCategory10);
	var color = d3.scaleOrdinal(['orangered', 'blue']);

	//console.log(d3.schemeCategory10);

	var svg = d3.select('#' + elid)
		.append('svg')
		.attr('class', 'pie')
		.attr('width', width)
		.attr('height', height);


	var g = svg.append('g')
		.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

	var arc = d3.arc()
		.innerRadius(0)
		.outerRadius(radius);

	var pie = d3.pie()
		.value(function (d) { return d.value; })
		.sort(null);

	var path = g.selectAll('path')
		.data(pie(data))
		.enter()
		.append("g")
		.append('path')
		.attr('d', arc)
		.attr('fill', (d, i) => color(i))
		.style('opacity', opacity)
		.style('stroke', 'white')
		.on("mouseover", function (d) {

			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 20 + "px");
			divtooltip.style("display", "inline-block");

			//divtooltip.html("<br> Water depth(cm) : " + Number(maxlevel * 100).toFixed(2));
			divtooltip.html(`${d.data.name} (${d.data.value})`);
		})
		.on("mousemove", function (d) {
			divtooltip.style("left", d3.event.pageX + "px");
			divtooltip.style("top", d3.event.pageY - 20 + "px");
			divtooltip.style("display", "inline-block");

			//divtooltip.html("<br> Water depth(cm) : " + Number(maxlevel * 100).toFixed(2));
			divtooltip.html(`${d.data.name} (${d.data.value})`);
		})
		.on("mouseout", function (d) {
			divtooltip.style("display", "none");
		});

	let legend = d3.select('#' + elid).append('div')
		.attr('class', 'legend')
		//.attr('transform', 'translate(-425,60)')
		.attr('style', 'position: absolute;display: inline;right: 0px;top: 1px;width: auto;');
	//.style('margin-top', '30px');

	let keys = legend.selectAll('.key')
		.data(data)
		.enter().append('div')
		.attr('class', 'key')
		.style('display', 'flex')
		.style('align-items', 'center')
		.style('margin-right', '2px');

	keys.append('div')
		.attr('class', 'symbol')
		.style('height', '10px')
		.style('width', '10px')
		.style('margin', '5px 5px')
		.style('background-color', (d, i) => color(i));

	keys.append('div')
		.attr('class', 'name')
		.text(d => `${d.name} (${numberCurrencyFormatter(d.value)})`);

	keys.exit().remove();

}

function createElements(prmid, name) {
	var maindiv = document.createElement("div");
	var headdiv = document.createElement("div");
	headdiv.className = 'chart-header';
	headdiv.appendChild(document.createTextNode(name));
	maindiv.appendChild(headdiv)

	var repdiv = document.createElement("div");
	repdiv.id = prmid;
	repdiv.setAttribute('style', 'position: relative;')

	maindiv.appendChild(repdiv)

	//var node = document.createTextNode("This is new.");
	//ediv.appendChild(node);
	var element = document.getElementById("report");
	element.appendChild(maindiv);

	//var child = document.getElementById("p1");
	//element.insertBefore(para, child);
	//var parent = document.getElementById("div1");
	//parent.removeChild(child);
	//parent.replaceChild(para, child);
}

function removeElements() {
	//var myNode = document.getElementById("report");
	//myNode.innerHTML = '';

	var myNode = document.getElementById("report");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
}

function downloadURI(uri, name) {
	var link = document.createElement("a");

	link.download = name;
	link.href = uri;
	document.body.appendChild(link);
	link.click();
	//clearDynamicLink(link);
	document.getElementById('divwatermark').style.display = 'none';
}

function DownloadAsImage(elementName) {
	document.getElementById('divwatermark').style.display = 'inline-block';
	var imgflname = 'IndiaMap.png';

	var element = $("#" + elementName)[0];
	html2canvas(element).then(function (canvas) {
		var myImage = canvas.toDataURL();
		downloadURI(myImage, imgflname);
	});
}

function printDiv() {
	window.frames["print_frame"].document.body.innerHTML = document.getElementById("divmap").innerHTML;
	window.frames["print_frame"].window.focus();
	window.frames["print_frame"].window.print();
}

$(document).ready(function () {
	//$('.input-group').on('click', '.button-trash', function () {
	//	alert('it is working');
	//	alert("test");
	//});
	//alert("test");
	$(".leaflet-control-layers-selector").on('click', function (event) {
		//event.stopPropagation();
		//event.stopImmediatePropagation();
		////(... rest of your JS code)

		var lyrName = $(this).parent().text();
		//console.log(lyrName);
		//var lyrName1 = $(this).text();
		//console.log($(this).parent());

		if (lyrName == "Villages") { }
		else if (lyrName == "JJC Bastis") {
			let addedtable = document.getElementById('divJJCBastis');
			if (typeof addedtable == 'undefined' || addedtable == null) {
				datapanel.innerHTML += '<div id="divJJCBastis"><div class="title">JJC Bastis</div></div >';
				createJJCBastis();
			}
			else {
				addedtable.remove();
			}
		}
		else if (lyrName == "Unauthorised Colonies") {
			let addedtable = document.getElementById('divunauthorised');
			if (typeof addedtable == 'undefined' || addedtable == null) {
				datapanel.innerHTML += '<div id="divunauthorised"><div class="title">Unauthorised Colonies</div></div >';
				createUnauthorised();
			}
			else {
				addedtable.remove();
			}
		}
		else if (lyrName == "Wards") {
			let addedtable = document.getElementById('divwards');
			if (typeof addedtable == 'undefined' || addedtable == null) {
				datapanel.innerHTML += '<div id="divwards"><div class="title">Wards</div></div >';
				createWard();
			}
			else {
				addedtable.remove();
			}
		}
		else if (lyrName == "Subdistrict") { }
		else if (lyrName == "District") {
			let addedtable = document.getElementById('divdistrict');
			if (typeof addedtable == 'undefined' || addedtable == null) {
				datapanel.innerHTML += '<div id="divdistrict"><div class="title">Districts</div></div >';
				createDistrict();
			}
			else {
				addedtable.remove();
			}
		}
		else if (lyrName == "NCT MCD Zones") { }
		else if (lyrName == "Water Treatment Plants") { }
		else if (lyrName == "Tanker Schedule Zone") { }
		else if (lyrName == "WTP Zone") { }
		else if (lyrName == "Sewage Pumping Station") { }
		else if (lyrName == "Sewerage Treatment Plant") { }
		else if (lyrName == "Sewerage Treatment Plant Area") { }
		else if (lyrName == "Common Effluent Treatment Plant") { }
		else if (lyrName == "Sewer Zone") { }
		else if (lyrName == "I & FC Drains") { }
		else if (lyrName == "Yamuna River") { }
		else if (lyrName == "Storm Drain Basins") { }
		else if (lyrName == "Yamuna") { }
		else if (lyrName == "Delhi Drains") { }

	});
});
function showhidetable(tableid) {
	let showhide = document.getElementById(tableid);
	let isHidden = showhide.style.display == "none";
	//console.log(isHidden)
	if (isHidden) {
		showhide.style.display = "inline";
	} else {
		showhide.style.display = "none";
	}
}
function removeRow(whichrow2remove, whichtable) {
	//('divdistdetails', 'districtTable')
	try {
		var table = document.getElementById(whichtable);
		var rowCount = table.rows.length;
		for (var i = 0; i < rowCount; i++) {
			var row = table.rows[i];
			var rowObj = row.cells[0].childNodes[0];
			if (rowObj.id == whichrow2remove) {
				table.deleteRow(i);
				rowCount--;
			}
		}
	} catch (e) {
		alert(e);
	}
}

function selectcategory(obj) {
	//console.log(obj);
	let selectedText = obj.options[obj.selectedIndex].text;
	let selValue = obj.value;
	if (selValue == '-1') return;
	removeElements()
	if (selValue == 'TOT') {
		chartData.map(function (dat, i) {
			if (+dat.M_TOT > 0 || +dat.F_TOT > 0) {
				var totmf = [{ name: 'Male', value: dat.M_TOT }, { name: 'Female', value: dat.F_TOT }];
				var eleid = 'ward' + i;
				createElements(eleid, dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_TOT) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == '06') {
		chartData.map(function (dat, i) {
			if (+dat.M_06 > 0 || +dat.F_06 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_06 }, { name: 'Female', value: dat.F_06 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_06) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'SC') {
		chartData.map(function (dat, i) {
			if (+dat.M_SC > 0 || +dat.F_SC > 0) {
				var totmf = [{ name: 'Male', value: dat.M_SC }, { name: 'Female', value: dat.F_SC }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_SC) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'ST') {
		chartData.map(function (dat, i) {
			if (+dat.M_ST > 0 || +dat.F_ST > 0) {
				var totmf = [{ name: 'Male', value: dat.M_ST }, { name: 'Female', value: dat.F_ST }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_ST) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'LIT') {
		chartData.map(function (dat, i) {
			if (+dat.M_LIT > 0 || +dat.F_LIT > 0) {
				var totmf = [{ name: 'Male', value: dat.M_LIT }, { name: 'Female', value: dat.F_LIT }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_LIT) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'ILL') {
		chartData.map(function (dat, i) {
			if (+dat.M_ILL > 0 || +dat.F_ILL > 0) {
				var totmf = [{ name: 'Male', value: dat.M_ILL }, { name: 'Female', value: dat.F_ILL }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_ILL) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'TOT_WORK') {
		chartData.map(function (dat, i) {
			if (+dat.M_TOT_WORK > 0 || +dat.F_TOT_WORK > 0) {
				var totmf = [{ name: 'Male', value: dat.M_TOT_WORK }, { name: 'Female', value: dat.F_TOT_WORK }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_TOT_WORK) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MAINWORK') {
		chartData.map(function (dat, i) {
			if (+dat.M_MAINWORK > 0 || +dat.F_MAINWORK > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MAINWORK }, { name: 'Female', value: dat.F_MAINWORK }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MAINWORK) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MAIN_CL') {
		chartData.map(function (dat, i) {
			if (+dat.M_MAIN_CL > 0 || +dat.F_MAIN_CL > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MAIN_CL }, { name: 'Female', value: dat.F_MAIN_CL }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MAIN_CL) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MAIN_AL') {
		chartData.map(function (dat, i) {
			if (+dat.M_MAIN_AL > 0 || +dat.F_MAIN_AL > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MAIN_AL }, { name: 'Female', value: dat.F_MAIN_AL }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MAIN_AL) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MAIN_HH') {
		chartData.map(function (dat, i) {
			if (+dat.M_MAIN_HH > 0 || +dat.F_MAIN_HH > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MAIN_HH }, { name: 'Female', value: dat.F_MAIN_HH }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MAIN_HH) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MAIN_OT') {
		chartData.map(function (dat, i) {
			if (+dat.M_MAIN_OT > 0 || +dat.F_MAIN_OT > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MAIN_OT }, { name: 'Female', value: dat.F_MAIN_OT }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MAIN_OT) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARGWORK') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARGWORK > 0 || +dat.F_MARGWORK > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARGWORK }, { name: 'Female', value: dat.F_MARGWORK }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARGWORK) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_CL') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_CL > 0 || +dat.F_MARG_CL > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_CL }, { name: 'Female', value: dat.F_MARG_CL }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_CL) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_AL') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_AL > 0 || +dat.F_MARG_AL > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_AL }, { name: 'Female', value: dat.F_MARG_AL }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_AL) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_HH') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_HH > 0 || +dat.F_MARG_HH > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_HH }, { name: 'Female', value: dat.F_MARG_HH }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_HH) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_OT') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_OT > 0 || +dat.F_MARG_OT > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_OT }, { name: 'Female', value: dat.F_MARG_OT }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_OT) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARGWORK_3_6') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARGWORK_3_6 > 0 || +dat.F_MARGWORK_3_6 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARGWORK_3_6 }, { name: 'Female', value: dat.F_MARGWORK_3_6 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARGWORK_3_6) + ')');
				createPieChart(eleid, totmf);
			}
		})
	} else if (selValue == 'MARG_CL_3_6') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_CL_3_6 > 0 || +dat.F_MARG_CL_3_6 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_CL_3_6 }, { name: 'Female', value: dat.F_MARG_CL_3_6 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_CL_3_6) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_AL_3_6') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_AL_3_6 > 0 || +dat.F_MARG_AL_3_6 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_AL_3_6 }, { name: 'Female', value: dat.F_MARG_AL_3_6 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_AL_3_6) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_HH_3_6') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_HH_3_6 > 0 || +dat.F_MARG_HH_3_6 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_HH_3_6 }, { name: 'Female', value: dat.F_MARG_HH_3_6 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_HH_3_6) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_OT_3_6') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_OT_3_6 > 0 || +dat.F_MARG_OT_3_6 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_OT_3_6 }, { name: 'Female', value: dat.F_MARG_OT_3_6 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_OT_3_6) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARGWORK_0_3') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARGWORK_0_3 > 0 || +dat.F_MARGWORK_0_3 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARGWORK_0_3 }, { name: 'Female', value: dat.F_MARGWORK_0_3 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARGWORK_0_3) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_CL_0_3') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_CL_0_3 > 0 || +dat.F_MARG_CL_0_3 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_CL_0_3 }, { name: 'Female', value: dat.F_MARG_CL_0_3 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_CL_0_3) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_AL_0_3') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_AL_0_3 > 0 || +dat.F_MARG_AL_0_3 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_AL_0_3 }, { name: 'Female', value: dat.F_MARG_AL_0_3 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_AL_0_3) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_HH_0_3') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_HH_0_3 > 0 || +dat.F_MARG_HH_0_3 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_HH_0_3 }, { name: 'Female', value: dat.F_MARG_HH_0_3 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_HH_0_3) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'MARG_OT_0_3') {
		chartData.map(function (dat, i) {
			if (+dat.M_MARG_OT_0_3 > 0 || +dat.F_MARG_OT_0_3 > 0) {
				var totmf = [{ name: 'Male', value: dat.M_MARG_OT_0_3 }, { name: 'Female', value: dat.F_MARG_OT_0_3 }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_MARG_OT_0_3) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	} else if (selValue == 'NON_WORK') {
		chartData.map(function (dat, i) {
			if (+dat.M_NON_WORK > 0 || +dat.F_NON_WORK > 0) {
				var totmf = [{ name: 'Male', value: dat.M_NON_WORK }, { name: 'Female', value: dat.F_NON_WORK }];
				var eleid = 'ward' + i;
				createElements(eleid, selectedText + ", " + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_NON_WORK) + ')');
				createPieChart(eleid, totmf);
			} else {
				showmessage('No ' + selectedText);
			}
		})
	}
}

var chartData = [], wardData = [], districtData = [], unauthorData = [], jjcbastisData = [];
function createChart(obj) {
	let filtername = $(this).attr('title');

	if(arguments.length == 0 ) {
		showmessage('Please contact Admin');
	    return;
	}

	let chartLayerGroup;
	let chartDataSet = [];
	let jsonfld;
	let datafld;

	if(typeof arguments[0] == 'object'){
		//chartLayerGroup = obj.currentTarget.layergroup
		jsonfld = obj.currentTarget.jsonfld
		datafld = obj.currentTarget.datafld
	}
	else{
		jsonfld = arguments[0];
		datafld = arguments[1];
		filtername = arguments[2];
	}
	
	//console.log([jsonfld, datafld]);

	if (datafld == 'District') {
		chartDataSet = districtData
		chartLayerGroup = districtGroup;
	} else if (datafld == 'Ward') {
		chartDataSet = wardData;
		chartLayerGroup = wardsGroup;
	}
	if (typeof chartDataSet == 'undefined' || chartDataSet == null) {
		showmessage('No data')
		return;
	}

	//	//console.log(wardname)
	chartLayerGroup.eachLayer(function (layer) {
		let feat = layer.feature;
		//if (layer.feature.properties.Ward_No == filtername) 
		if (typeof feat == 'undefined' || feat == null) return;
		
		//console.log([layer.feature.properties[jsonfld], filtername]);

		if (layer.feature.properties[jsonfld] == filtername) {

			//console.log([layer.feature.properties[jsonfld], filtername]);

			//console.log(layer.getBounds()._northEast);
			//console.log(layer.getBounds()._southWest);

			map.fitBounds(layer.getBounds());
			setHighlight(layer);

			//let wardno = layer.feature.properties.Ward_No;
			chartData = [];
			chartData = chartDataSet.filter(function (dv) {
				return dv[datafld] == filtername
			});

			if (chartData.length > 0) {

				//console.log(chartData);

				////$('input[name="selqrp"]').attr('checked', false);
				////$('input[name="selqrp"]').prop('checked', false);
				////$('#TOT').attr('checked', 'checked');
				////$("#TOT").prop("checked", true);

				$('#optselect option').each(function () {
					if (this.defaultSelected) {
						this.selected = true;
						return false;
					}
				});

				$('#optselect option[value=TOT]').attr('selected', 'selected');
				////$("#optselect select").val("TOT");

				//document.getElementById('report-container').style.display = 'block';
				//document.getElementById('reportbox').style.display = 'block';
				removeElements()
				chartData.map(function (dat, i) {
					//console.log(dat.M_TOT)
					//console.log(dat.F_TOT)
					if (+dat.M_TOT > 0 || +dat.F_TOT > 0) {
						let totmf = [{ name: 'Male', value: dat.M_TOT }, { name: 'Female', value: dat.F_TOT }];
						//console.log([i, totmf]);

						let eleid = 'ward' + i;
						createElements(eleid, 'Total Population, ' + dat.Name + ' (Total : ' + numberCurrencyFormatter(+dat.P_TOT) + ')');
						createPieChart(eleid, totmf);
						document.getElementById('reportbox').style.display = 'block';
					} else {
						showmessage('No Total population ');
					}
				})
			} else{
				showmessage('No data');
			}
		}
	});
}

function displayData(obj) {
	var selectfiled = $(this).attr('title');
	var rownumber = $(this).attr('rownumber');
	//var rownumber = $(this).attr('title');
	//link.layername = 'JJCBastis';
	//link.tablename = 'JJCBastisTable';
	//alert("row" + $(this).parentNode.parentNode.rowIndex +
	//	" - column" + $(this).parentNode.cellIndex);

	//var column_num = parseInt($(this).index()) + 1;
	//var row_num = parseInt($(this).parent().index()) + 1;

	////$("#result").html("Row_num =" + row_num + "  ,  Rolumn_num =" + column_num);
	//alert("Row_num =" + row_num + "  ,  Column_num =" + column_num);

	//let chartLayerGroup = obj.currentTarget.layergroup
	let layername = obj.currentTarget.layername
	let tablename = obj.currentTarget.tablename
	let datafld = obj.currentTarget.datafld

	removeRow('divDetails', tablename);

	let csvDataSet = []
	if (layername == 'unauthorised') {
		csvDataSet = unauthorData
	} else if (layername == 'JJCBastis') {
		csvDataSet = jjcbastisData;
	}
	//else {
	//	showmessage('No data')
	//	return;
	//}

	//if (!map.hasLayer(districtGroup)) {
	//	map.addLayer(districtGroup);
	//}

	let csvData = csvDataSet.filter(function (dv) {
		return dv[datafld] == selectfiled
	});

	if (csvData.length > 0 && csvData != null) {

		//console.log(csvData);
		//console.log(Object.keys(csvData[0]));
		//		return;

		var table = document.getElementById(tablename);
		table.cellPadding = "0px";
		table.cellSpacing = "0px";

		var row = table.insertRow(Number(rownumber) + 1);
		row.setAttribute('style', 'pointer-events: none;');
		var cell1 = row.insertCell(0);
		cell1.colSpan = 5;
		cell1.cellPadding = 2;

		//======creating table ========

		let tbl = document.createElement("table");
		tbl.id = "divDetails";
		tbl.className = 'divdistdetails';
		//tbl.style.cssText = 'display:none;';

		let tblBody = document.createElement("tbody");
		let rowheader = document.createElement("tr");
		let headerList = ["Name", "Value"]
		for (let j = 0; j < headerList.length; j++) {

			let th = document.createElement('th'); //column
			let text = document.createTextNode(headerList[j]); //cell
			th.appendChild(text);
			rowheader.appendChild(th);
		}
		tblBody.appendChild(rowheader);

		Object.keys(csvData[0]).forEach(function (d) {

			//console.log([d, csvData[0][d]]);

			let rowdata = document.createElement("tr");
			let celldata = document.createElement("td");
			celldata.innerHTML = d;
			rowdata.appendChild(celldata);

			let cell1data = document.createElement("td");
			cell1data.innerHTML = csvData[0][d];
			rowdata.appendChild(cell1data);

			tblBody.appendChild(rowdata);

			//cell.appendChild(document.createTextNode(village));
			//row.id = village;

		})
		tbl.appendChild(tblBody);
		//let element = document.getElementById("divunauthorised");
		cell1.appendChild(tbl);

		//var ele = "<table id='divDetails' class='divdistdetails' cellpadding='0', cellspacing='0'> ";
		//ele += "<tr><td>State Name     </td><td>&emsp;: &emsp;</td><td>" + snm + "</td></tr>";
		//ele += "<tr><td>Distrinct Name </td><td>&emsp;: &emsp;</td><td>" + dnm + "</td></tr>";
		//ele += "<tr><td>Population     </td><td>&emsp;: &emsp;</td><td>" + numberCurrencyFormatter(pop) + "</td></tr>";
		//ele += "<tr><td>Density        </td><td>&emsp;: &emsp;</td><td>" + numberCurrencyFormatter(den) + "</td></tr>";
		//ele += "<tr><td>Growth         </td><td>&emsp;: &emsp;</td><td>" + gro + "</td></tr>";
		//ele += "<tr><td>Literacy       </td><td>&emsp;: &emsp;</td><td>" + lty + "</td></tr>";
		//ele += "<tr><td>Sex Ratio      </td><td>&emsp;: &emsp;</td><td>" + sex + "</td></tr>";
		//ele += "<tr><td>State Code     </td><td>&emsp;: &emsp;</td><td>" + stc + "</td></tr>";
		//ele += "<tr><td>Distrinct Code </td><td>&emsp;: &emsp;</td><td>" + dtc + "</td></tr>";
		//ele += "<tr></table>";
		////<img src="" width="25" height="15 " />
		//ele += "<div id='disttools'><div><img src='./images/tools/details.png' title='details'/></div>\
		//			     <div><img src='./images/tools/chart.png' title='chart'/></div>\
		//                       <div><img src='./images/tools/download.png' title='download'/></div>\
		//		         <div><img src='./images/tools/togglemenu.png' title='togglemenu' /></div ></div > ";
		///*<div><img src='./images/tools/printer.png' title='printer'/></div>\*/
		//ele += "</div> ";
		//cell1.innerHTML = ele;
	} else {
		console.log('no data')
		console.log(selectfiled);
		console.log(csvDataSet);
		console.log(csvData);
	}

	//var table = document.getElementById('districtTable');
	//var row = table.insertRow(Number(rownumber) + 1);

	//var rowCount = table.rows.length;
	////var colCount = table.rows[0].cells.length;
	////console.log([rowCount, colCount]);

	////Column 1  
	//var cell1 = row.insertCell(0);
	//var element1 = document.createElement("input");
	//element1.type = "button";
	//var btnName = "button" + (rowCount + 1);
	//element1.name = btnName;
	//element1.setAttribute('value', 'Delete'); // or element1.value = "button";  
	//element1.onclick = function () {
	//	removeRow(btnName);
	//}
	//cell1.appendChild(element1);

	////Column 2  
	//var cell2 = row.insertCell(1);
	//cell2.innerHTML = "<div><b>" + rowCount + 1 + "</b></div>";

	////Column 3  
	//var cell3 = row.insertCell(2);
	//cell3.colSpan = 2;
	//var element3 = document.createElement("input");
	//element3.type = "text";
	//cell3.appendChild(element3);

	////// create a div element
	////var div = document.createElement('tr');
	////// set class name
	////div.className = 'mydiv';
	////// set html contents
	////div.innerHTML = ' <td class="mydivinside" colspan=10>  Text  </td>';
	////// get .div2 element
	////var ele = document.querySelector('#districtname');
	////ele.insertBefore(div, ele);

}

function createWard() {
	//{"Ward_Name":"DELHI CANTT CHARGE 1","Ward_No":"CANT_1","Ward_Nam_1":"","zone":"","zoneno":0,"longitude":0,"latitude":0}
	d3.csv('./data/NCT_Wards.csv', function (error, data) {
		wardData = data;
		//console.log(wardData)

		let objward = document.querySelector('#divwards .title');
		let nowards = wardsGroup.getLayers().length;
		//objward.innerHTML = "<a href='#' onclick='showhidetable('wardTable');'>Wards (" + nowards + ")</a>"
		//objward.innerHTML = "<a href='#' >Wards (" + nowards + ")</a>"
		objward.innerHTML = "<a href='#' onclick=\"showhidetable('wardTable');\" >Wards (" + nowards + ")</a>"
		//objward.addEventListener("click", function (e) {
		//	//console.log(e)
		//	let showhide = document.getElementById('wardTable');
		//	let isHidden = showhide.style.display == "none";
		//	//console.log(isHidden)
		//	if (isHidden) {
		//		showhide.style.display = "inline";
		//	} else {
		//		showhide.style.display = "none";
		//	}
		//	e.stopPropagation();
		//});

		let tbl = document.createElement("table");
		tbl.id = "wardTable";
		tbl.className = 'disttable';
		//tbl.attr('style', 'display:none;')
		tbl.style.cssText = 'display:none;';

		let tblBody = document.createElement("tbody");
		let rowheader = document.createElement("tr");

		let th = document.createElement('th');
		let text = document.createTextNode("Ward Name ");
		th.appendChild(text);
		rowheader.appendChild(th);
		//console.log(objjson);
		tblBody.appendChild(rowheader);

		/*objjson.features.map(function (feat, i) {*/
		wardsGroup.eachLayer(function (layer) {
			let feat = layer.feature;
			//if (layer.feature.properties.ward == wardname) {
			//if (layer.feature.properties.Ward_No == wardname) {

			//console.log(typeof layer);
			//console.log(layer instanceof L.Layer);
			//console.log(layer.constructor.name);

			//console.log(layer);

			let wardname = feat.properties.Ward_Name;
			let wardno = feat.properties.Ward_No;
			let row = document.createElement("tr");
			row.id = wardname;

			let cell = document.createElement("td");
			let link = document.createElement("a");
			link.setAttribute("title", wardno);
			link.setAttribute("href", "#");
			link.appendChild(document.createTextNode(wardname));
			link.addEventListener("click", createChart);
			link.layergroup = wardsGroup;
			//link.dataset = wardData;
			link.jsonfld = 'Ward_No';
			link.datafld = 'Ward';

			//link.addEventListener("click", myFunc);
			//link.myParam = 'This is my parameter';
			//function myFunc(evt) {
			//	window.alert(evt.currentTarget.myParam);
			//}

			cell.appendChild(link);
			//let cellText = document.createTextNode(distname);
			//cell.appendChild(cellText);
			row.appendChild(cell);
			tblBody.appendChild(row);
		});
		tbl.appendChild(tblBody);
		let element = document.getElementById("divwards");
		element.appendChild(tbl);
	});
}

//////////////////////////////////////
var TableLastSortedColumn = -1;
function SortTable(obj) {
	var sortColumn = parseInt(arguments[0]);
	var type = arguments.length > 1 ? arguments[1] : 'T';
	var dateformat = arguments.length > 2 ? arguments[2] : '';
	var table = document.getElementById('districtTable');

	//console.log(arguments.length);
	//var sortColumn = obj.currentTarget.sortColumn
	//var type = obj.currentTarget.type
	//var table = obj.currentTarget.table
	//console.log([sortColumn, type, dateformat]);

	var tbody = table.getElementsByTagName("tbody")[0];
	var rows = tbody.getElementsByTagName("tr");
	var arrayOfRows = new Array();
	type = type.toUpperCase();
	dateformat = dateformat.toLowerCase();
	for (var i = 1, len = rows.length; i < len; i++) {
		arrayOfRows[i] = new Object;
		arrayOfRows[i].oldIndex = i;
		var celltext = rows[i].getElementsByTagName("td")[sortColumn].innerHTML.replace(/<[^>]*>/g, "");
		if (type == 'D') { arrayOfRows[i].value = GetDateSortingKey(dateformat, celltext); }
		else {
			var re = type == "N" ? /[^\.\-\+\d]/g : /[^a-zA-Z0-9]/g;
			arrayOfRows[i].value = celltext.replace(re, "").substr(0, 25).toLowerCase();
		}
	}

	arrayOfRows = arrayOfRows.filter(function (e) { return e });

	//console.log(arrayOfRows)
	//console.log([arrayOfRows.length, rows.length]);

	if (sortColumn == TableLastSortedColumn) { arrayOfRows.reverse(); }
	else {
		TableLastSortedColumn = sortColumn;
		switch (type) {
			case "N": arrayOfRows.sort(CompareRowOfNumbers); break;
			case "D": arrayOfRows.sort(CompareRowOfNumbers); break;
			default: arrayOfRows.sort(CompareRowOfText);
		}
	}
	var newTableBody = document.createElement("tbody");
	newTableBody.appendChild(rows[0].cloneNode(true));
	for (var i = 0, len = arrayOfRows.length; i < len; i++) {
		//console.log([i, arrayOfRows[i].oldIndex]);
		newTableBody.appendChild(rows[arrayOfRows[i].oldIndex].cloneNode(true));
	}
	table.replaceChild(newTableBody, tbody);

} // function SortTable()
function CompareRowOfText(a, b) {
	var aval = a.value;
	var bval = b.value;
	return (aval == bval ? 0 : (aval > bval ? 1 : -1));
} // function CompareRowOfText()
function CompareRowOfNumbers(a, b) {
	var aval = /\d/.test(a.value) ? parseFloat(a.value) : 0;
	var bval = /\d/.test(b.value) ? parseFloat(b.value) : 0;
	return (aval == bval ? 0 : (aval > bval ? 1 : -1));
} // function CompareRowOfNumbers()
function GetDateSortingKey(format, text) {
	if (format.length < 1) { return ""; }
	format = format.toLowerCase();
	text = text.toLowerCase();
	text = text.replace(/^[^a-z0-9]*/, "");
	text = text.replace(/[^a-z0-9]*$/, "");
	if (text.length < 1) { return ""; }
	text = text.replace(/[^a-z0-9]+/g, ",");
	var date = text.split(",");
	if (date.length < 3) { return ""; }
	var d = 0, m = 0, y = 0;
	for (var i = 0; i < 3; i++) {
		var ts = format.substr(i, 1);
		if (ts == "d") { d = date[i]; }
		else if (ts == "m") { m = date[i]; }
		else if (ts == "y") { y = date[i]; }
	}
	d = d.replace(/^0/, "");
	if (d < 10) { d = "0" + d; }
	if (/[a-z]/.test(m)) {
		m = m.substr(0, 3);
		switch (m) {
			case "jan": m = String(1); break;
			case "feb": m = String(2); break;
			case "mar": m = String(3); break;
			case "apr": m = String(4); break;
			case "may": m = String(5); break;
			case "jun": m = String(6); break;
			case "jul": m = String(7); break;
			case "aug": m = String(8); break;
			case "sep": m = String(9); break;
			case "oct": m = String(10); break;
			case "nov": m = String(11); break;
			case "dec": m = String(12); break;
			default: m = String(0);
		}
	}
	m = m.replace(/^0/, "");
	if (m < 10) { m = "0" + m; }
	y = parseInt(y);
	if (y < 100) { y = parseInt(y) + 2000; }
	return "" + String(y) + "" + String(m) + "" + String(d) + "";
} // function GetDateSortingKey()

function createDistrict() {

	d3.csv('./data/NCT_District.csv', function (error, data) {
		districtData = data;
		//data.forEach(function (d) {
		//	districtData.push(d);
		//});

		let nodist = districtGroup.getLayers().length;
		//objward.innerHTML = "<a href='#' onclick='showhidetable('wardTable');'>Wards (" + nowards + ")</a>"
		let objdistrict = document.querySelector('#divdistrict .title');
		objdistrict.innerHTML = "<a href='#' onclick=\"showhidetable('districtTable');\" >Districts(" + nodist + ")</a>"

		let strTable = "<div><table id='districtTable' class='disttable'><tbody>";
		strTable += "<tr><th><a title='Click to sort' href='#' onclick=\"SortTable(0,\'T\',\'districtTable\');\" >District Name </a></th><th><a title='Click to sort' href='#' onclick=\"SortTable(1,\'N\',\'districtTable\');\">Population</a></th><th><a title='Click to sort' href='#' onclick=\"SortTable(2,\'N\',\'districtTable\');\">Density</a></th><th><a title='Click to sort' href='#' onclick=\"SortTable(3,\'N\',\'districtTable\');\">Growth</a></th></tr>";

		// strTable += "<tbody>";
		// strTable += "<tbody>";
		// strTable += "<tbody>";
		districtGroup.eachLayer(function (layer) {

			let feat = layer.feature;
			if (typeof feat == 'undefined') return;

			let densityvalue = feat.properties.Density;
			let popvalue = feat.properties.POP;
			let distname = feat.properties.dtname;
			let growth = feat.properties.Dgrowth_P;
			let distcode = feat.properties.dtcode11;

			//let sexratio = feat.properties.Sex_Ratio;
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));

			strTable += "<tr id='"+ distname +"'>";
			strTable += "<td style='width:25%;'><a href='#' onclick=\"createChart('dtcode11','District','"+distcode+"')\" title='"+distcode+"'>"+ distname +"</a></td>";
			strTable += "<td style='text-align:right;width:25%;'>"+popvalue+"</td>";
			strTable += "<td style='text-align:right;width:25%;'>"+densityvalue+"</td>";
			strTable += "<td style='text-align:right;width:25%;'>"+growth+"</td>";
			strTable +="</tr>"

		});

		strTable += "</tbody></table></div>";
		objdistrict.insertAdjacentHTML('afterend', strTable);
		//objdistrict.insertAdjacentHTML('beforeend', strTable);
		//objdistrict.innerHTML += strTable;

	});
}

function createDistrict_Old() {
	d3.csv('./data/NCT_District.csv', function (error, data) {
		districtData = data;
		//data.forEach(function (d) {
		//	districtData.push(d);
		//});

		let nodist = districtGroup.getLayers().length;
		//objward.innerHTML = "<a href='#' onclick='showhidetable('wardTable');'>Wards (" + nowards + ")</a>"
		let objdistrict = document.querySelector('#divdistrict .title');
		objdistrict.innerHTML = "<a href='#' onclick=\"showhidetable('districtTable');\" >Districts(" + nodist + ")</a>"

		let tbl = document.createElement("table");
		tbl.id = "districtTable";
		tbl.className = 'disttable';
		tbl.style.cssText = 'display:none;';

		let tblBody = document.createElement("tbody");
		//let rowheader = document.createElement("thead");
		let rowheader = document.createElement("tr");
		let headerList = ["District Name ", "Population", "Density", "Growth", "Sex Ratio"]
		for (let j = 0; j < headerList.length - 1; j++) {

			let tblHeader = document.createElement('th'); //column

			let linkHeader = document.createElement("a");
			linkHeader.setAttribute("title", 'Click to sort');
			linkHeader.setAttribute("href", "#");

			linkHeader.addEventListener("click", SortTable);
			linkHeader.sortColumn = j;
			linkHeader.table = tbl;
			if (j === 0) {
				linkHeader.type = 'T';
			} else {
				linkHeader.type = 'N';
			}

			linkHeader.appendChild(document.createTextNode(headerList[j]));

			tblHeader.appendChild(linkHeader);
			rowheader.appendChild(tblHeader);
		}
		tblBody.appendChild(rowheader);

		//console.log(districtGroup.getLayers().length);

		//objjson.features.map(function (feat, i) {
		districtGroup.eachLayer(function (layer) {

			//console.log(layer);

			let feat = layer.feature;
			if (typeof feat == 'undefined') return;

			let densityvalue = feat.properties.Density;
			let popvalue = feat.properties.POP;
			let distname = feat.properties.dtname;
			let growth = feat.properties.Dgrowth_P;
			let distcode = feat.properties.dtcode11;

			//let sexratio = feat.properties.Sex_Ratio;
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));

			let row = document.createElement("tr");
			row.id = distname;

			let cell = document.createElement("td");
			let link = document.createElement("a");
			link.setAttribute("title", distcode);
			link.setAttribute("href", "#");
			//link.setAttribute("rownumber", i + 1);
			link.appendChild(document.createTextNode(distname));
			//link.addEventListener("click", displayDistrictDetails);
			link.addEventListener("click", createChart);
			link.layergroup = districtGroup;
			link.dataset = districtData;
			link.jsonfld = 'dtcode11';
			link.datafld = 'District';

			cell.appendChild(link);
			//let cellText = document.createTextNode(distname);
			//cell.appendChild(cellText);
			row.appendChild(cell);

			let cell1 = document.createElement("td");
			//let cellText1 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));
			let cellText1 = document.createTextNode(numberCurrencyFormatter(popvalue));
			cell1.setAttribute('style', 'text-align:right;');
			cell1.appendChild(cellText1);
			row.appendChild(cell1);

			let cell2 = document.createElement("td");
			//let cellText2 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			let cellText2 = document.createTextNode(numberCurrencyFormatter(densityvalue));
			cell2.setAttribute('style', 'text-align:right;');
			cell2.appendChild(cellText2);
			row.appendChild(cell2);

			let cell3 = document.createElement("td");
			let cellText3 = document.createTextNode(growth);
			cell3.setAttribute('style', 'text-align:right;');
			cell3.appendChild(cellText3);
			row.appendChild(cell3);

			//let cell4 = document.createElement("td");
			//let cellText4 = document.createTextNode(sexratio);
			//cell4.appendChild(cellText4);
			//row.appendChild(cell4);

			//let link = document.createElement("a");
			//link.setAttribute("title", distname);
			//link.setAttribute("href", "#");
			//link.appendChild(document.createTextNode(distname));
			//maindiv.appendChild(link)

			tblBody.appendChild(row);

		});
		tbl.appendChild(tblBody);
		let element = document.getElementById("divdistrict");
		element.appendChild(tbl);

		//let div1 = document.querySelector('.div1');
		//div1.insertAdjacentHTML('afterend', '<div class="mydiv"><div class="mydivinside">Text</div></div>');

		//let headdiv = document.createElement("div");
		//headdiv.className = 'chart-header';
		//headdiv.appendChild(document.createTextNode(name));
		//maindiv.appendChild(headdiv)

		//let repdiv = document.createElement("div");
		//repdiv.id = prmid;
		//maindiv.appendChild(repdiv)

		////let node = document.createTextNode("This is new.");
		////ediv.appendChild(node);
		//let element = document.getElementById("report");
		//element.appendChild(maindiv);

		////let child = document.getElementById("p1");
		////element.insertBefore(para, child);
		////let parent = document.getElementById("div1");
		////parent.removeChild(child);
		////parent.replaceChild(para, child);
	});
}

function createUnauthorised() {
	d3.csv('./data/NCT_Unauthorised_Approx.csv', function (error, data) {
		unauthorData = data;

		//datapanel.innerHTML += '<div id="divunauthorised"><div class="title">Unauthorised Colonies</div></div >';
		//{"OBJECTID":145,"Id":145,"gridcode":254,"Shape_Leng":0.0549977370786,"Shape_Area":0.0000752425828385}
		let nodist = nctucGroup.getLayers().length;
		let objdistrict = document.querySelector('#divunauthorised .title');
		objdistrict.innerHTML = "<a href='#' onclick=\"showhidetable('unauthorisedTable');\" >Unauthorised Colonies(" + nodist + ")</a>"

		let tbl = document.createElement("table");
		tbl.id = "unauthorisedTable";
		tbl.className = 'disttable';
		tbl.style.cssText = 'display:none;';

		let tblBody = document.createElement("tbody");
		let rowheader = document.createElement("tr");
		let headerList = ["Name & Address of UC/ Rural Village", "Ward Name", "Ward No"]
		for (let j = 0; j < headerList.length; j++) {

			let th = document.createElement('th'); //column
			let text = document.createTextNode(headerList[j]); //cell
			th.appendChild(text);
			rowheader.appendChild(th);
		}
		tblBody.appendChild(rowheader);

		////objjson.features.map(function (feat, i) {
		//nctucGroup.eachLayer(function (layer, i) {
		//	let feat = layer.feature;

		//	let densityvalue = feat.properties.Density;
		//	let popvalue = feat.properties.POP;
		//	let distname = feat.properties.dtname;
		//	let growth = feat.properties.Dgrowth_P;		
		//objjson.features.map(function (feat, i) {
		//data.forEach(function (d) {
		//	districtData.push(d);
		//});

		let rn = 0;
		unauthorData.forEach(function (d) {

			//SL,Regd_No,Part,Reg_Full,Name_Address_Village,AC,AC_Name,Ward_No,Ward_Name,STS_WSPL_DJB,STS_WSPL_DJB_%P,TL_WSPL_Completion,Remarks_WS,STS_WS_DJB,STS_WS_DJB_%P,TL_WS_Completion,STS_SWN_DJB,STS_SWN_DJB_%P,TL_SWN_Completion,Remarks_SWN,STS_Fun_SWN_DJB,STS_Fun_SWN_DJB_%P,TL_Fun_SWN_Completion,Remarks_Fun_SWN,STS_Road,STS_Road_Dept,STS_Road_%P,TL_Road_Completion,Remarks_Road,STS_SDN,STS_SDN_Dept,STS_SDN_%P,TL_SDN_Completion,Remarks_SDN,STS_STLGT,STS_STLGT_Dept,STS_STLGT_%P,TL_STLGT_Completion,Remarks_STLGT,STS_OBJ_ASI_FRST,Reas_OBJ_ASI_FRST,ATR,Remarks_ASI_FRST
			let village = d.Name_Address_Village;
			let wardname = d.Ward_Name;
			let wardno = d.Ward_No;
			let slno = d.SL;

			//console.log([village, wardname, wardno, slno])

			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));

			let row = document.createElement("tr");
			row.id = village;
			rn++;
			let cell = document.createElement("td");
			let link = document.createElement("a");
			link.setAttribute("title", slno);
			link.setAttribute("href", "#");
			link.setAttribute("rownumber", rn);
			link.appendChild(document.createTextNode(village));
			link.addEventListener("click", displayData);
			link.layergroup = nctucGroup;
			link.layername = 'unauthorised';
			link.tablename = 'unauthorisedTable';
			link.datafld = 'SL';

			cell.appendChild(link);
			//let cellText = document.createTextNode(distname);
			//cell.appendChild(cellText);
			row.appendChild(cell);

			let cell1 = document.createElement("td");
			//let cellText1 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));
			//let cellText1 = document.createTextNode(numberCurrencyFormatter(popvalue));
			let cellText1 = document.createTextNode(wardname);
			//cell1.setAttribute('style', 'text-align:right;');
			cell1.appendChild(cellText1);
			row.appendChild(cell1);

			let cell2 = document.createElement("td");
			//let cellText2 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			let cellText2 = document.createTextNode(wardno);
			cell2.setAttribute('style', 'text-align:right;');
			cell2.appendChild(cellText2);
			row.appendChild(cell2);

			//let cell3 = document.createElement("td");
			//let cellText3 = document.createTextNode(growth);
			//cell3.setAttribute('style', 'text-align:right;');
			//cell3.appendChild(cellText3);
			//row.appendChild(cell3);

			//let link = document.createElement("a");
			//link.setAttribute("title", distname);
			//link.setAttribute("href", "#");
			//link.appendChild(document.createTextNode(distname));
			//maindiv.appendChild(link)

			tblBody.appendChild(row);

		});
		tbl.appendChild(tblBody);
		let element = document.getElementById("divunauthorised");
		element.appendChild(tbl);
	});
}

function createJJCBastis() {
	d3.csv('./data/NCT_JJC_DUSB_Poly.csv', function (error, data) {
		jjcbastisData = data;

		//console.log(jjcbastisData);

		//datapanel.innerHTML += '<div id="divJJCBastis"><div class="title">JJC Bastis</div></div >';
		//{"FID_1":0,"ID":"JJC_1","begin":1,"end":9,"Count_":1}

		let norecords = jjcdusbGroup.getLayers().length;
		let objdistrict = document.querySelector('#divJJCBastis .title');
		objdistrict.innerHTML = "<a href='#' onclick=\"showhidetable('JJCBastisTable');\" >JJC Bastis(" + norecords + ")</a>"

		let tbl = document.createElement("table");
		tbl.id = "JJCBastisTable";
		tbl.className = 'disttable';
		tbl.style.cssText = 'display:none;';

		let tblBody = document.createElement("tbody");
		let rowheader = document.createElement("tr");
		let headerList = ["Assembly Constituency", "Land_Owning Agency", "Location"]
		for (let j = 0; j < headerList.length; j++) {

			let th = document.createElement('th'); //column
			let text = document.createTextNode(headerList[j]); //cell
			th.appendChild(text);
			rowheader.appendChild(th);
		}
		tblBody.appendChild(rowheader);

		////objjson.features.map(function (feat, i) {
		//nctucGroup.eachLayer(function (layer, i) {
		//	let feat = layer.feature;

		//	let densityvalue = feat.properties.Density;
		//	let popvalue = feat.properties.POP;
		//	let distname = feat.properties.dtname;
		//	let growth = feat.properties.Dgrowth_P;		
		//objjson.features.map(function (feat, i) {
		//data.forEach(function (d) {
		//	districtData.push(d);
		//});
		let rn = 0;
		jjcbastisData.forEach(function (d) {

			//Sl,JJC_Code,Division,Assembly_Constituency,Land_Owning_Agency,Location,Jhuggies_Number,Latitude,Longitude
			let constituency = d.Assembly_Constituency;
			let agency = d.Land_Owning_Agency;
			let location = d.Location;
			let slno = d.Sl;

			//console.log([village, wardname, wardno, slno])
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			//console.log(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));

			let row = document.createElement("tr");
			row.id = constituency;
			rn++
			let cell = document.createElement("td");
			let link = document.createElement("a");
			link.setAttribute("title", slno);
			link.setAttribute("href", "#");
			link.setAttribute("rownumber", rn);
			link.appendChild(document.createTextNode(constituency));
			link.addEventListener("click", displayData);
			link.layergroup = jjcdusbGroup;
			link.layername = 'JJCBastis';
			link.tablename = 'JJCBastisTable';
			link.datafld = 'Sl';

			cell.appendChild(link);
			//let cellText = document.createTextNode(distname);
			//cell.appendChild(cellText);
			row.appendChild(cell);

			let cell1 = document.createElement("td");
			//let cellText1 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(popvalue));
			//let cellText1 = document.createTextNode(numberCurrencyFormatter(popvalue));
			let cellText1 = document.createTextNode(agency);
			//cell1.setAttribute('style', 'text-align:right;');
			cell1.appendChild(cellText1);
			row.appendChild(cell1);

			let cell2 = document.createElement("td");
			//let cellText2 = document.createTextNode(new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(densityvalue));
			let cellText2 = document.createTextNode(location);
			//cell2.setAttribute('style', 'text-align:right;');
			cell2.appendChild(cellText2);
			row.appendChild(cell2);

			//let cell3 = document.createElement("td");
			//let cellText3 = document.createTextNode(growth);
			//cell3.setAttribute('style', 'text-align:right;');
			//cell3.appendChild(cellText3);
			//row.appendChild(cell3);

			//let link = document.createElement("a");
			//link.setAttribute("title", distname);
			//link.setAttribute("href", "#");
			//link.appendChild(document.createTextNode(distname));
			//maindiv.appendChild(link)

			tblBody.appendChild(row);

		});
		tbl.appendChild(tblBody);
		let element = document.getElementById("divJJCBastis");
		element.appendChild(tbl);
	});
}