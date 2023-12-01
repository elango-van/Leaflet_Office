var cwcload = false, subload = false, rchload = false;

$.getJSON(cwcurl, function (data, status) {
	if (status === 'success') {
		console.log('Success: ', data);
	} else {
		console.error('Error: ', status);
	}

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
	//subload = true;

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
	//rchload = true;
	let msec = (new Date() - startedat);
	console.log("Reach json completed loading : " + (msec / 1000) + ' Seconds');
});

if (map.hasLayer(subgeojson)) {
	subgeojson.eachLayer(function (layer) {
		layer.unbindTooltip();
		layer.setStyle({
			color: "#ccc",
			fillColor: '#eee',
			//fillOpacity: 0.12,
			weight: 1
		});
	});
} else {
	map.addLayer(subgeojson)
}

if (map.hasLayer(rchgeojson)) {
	rchgeojson.eachLayer(function (layer) {
		layer.setStyle({
			color: "blue",
			fillColor: '#87CEEB',
			weight: 2
		});
	});
} else {
	map.addLayer(rchgeojson);
}
if (map.hasLayer(cwcgeojson)) {

} else {
	map.addLayer(cwcgeojson);
}

//canceling fetch
const controller = new AbortController();
const signal = controller.signal;

fetch(url, { signal })
	.then(response => {
		// handle the response
	})
	.catch(error => {
		// handle the error
	});

// To cancel the request, call the abort method on the controller
controller.abort();

//################### New Example ###############
const controller1 = new AbortController();
const signal1 = controller1.signal;

const url = 'https://jsonplaceholder.typicode.com/posts/1';

const fetchData = () => {
	fetch(url, { signal1 })
		.then(response => response.json())
		.then(json => console.log(json))
		.catch(error => {
			if (error.name === 'AbortError') {
				console.log('Request has been canceled');
			} else {
				console.log('Error:', error);
				console.error('Error message:', error.message);
			}
		});
};

// Call the fetchData function
fetchData();

// Cancel the request after 2 seconds
setTimeout(() => {
	controller1.abort();
}, 2000);


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
	$(map).trigger("zoomend");
});
var element1 = document.querySelector('a.leaflet-control-zoom-out');
L.DomEvent.addListener(element1, 'click', function (e) {
	bZoomControlClick = true;
	$(map).trigger("zoomend");
});
// showmessage("Please try later data not available");
