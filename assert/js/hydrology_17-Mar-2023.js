let startedat = new Date();
let modelname = 'gfs', isPlay = false, loadingLayers = false, day = 0, wsopacity = 0.5, nodays = 8;
let indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer = 'sub', curfield = 'PRECIPmm', basincode;
let daylst = [], pcpchartdata = [];
let mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let pcpdomain = [], wylddomain = [], etdomain = [], swdomain = [], flowdomain = [], rfcwcdomain = [], ifcwcdomain = [];
let loadingSubdataCompleted = false, loadingRchdataCompleted = false, loadingCwcdataCompleted = false;

let loadingDetails = {};
let loadedDataset = {};
let loadedLayers = {};

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

let loadingContainer = document.getElementsByClassName('LoadingContainer')[0];
//loadingContainer.style.display='block';

//console.log(loadingContainer);

// console.log([window.innerWidth, document.documentElement.clientWidth, document.body.clientWidth])
// console.log([window.innerHeight, document.documentElement.clientHeight, document.body.clientHeight])
// console.log(leftwrapbox)
// console.log([w, h, leftwrapbox.top])


// var obj = {};
// if (Object.keys(obj).length === 0) {
// 	console.log('The object is empty');
// } else {
// 	console.log('The object is not empty');
// }

// //var obj = {};
// if ($.isEmptyObject(obj)) {
// 	console.log('The object is empty');
// } else {
// 	console.log('The object is not empty');
// }

// loadingDetails['W34']= {};
// loadingDetails['BBS']= {};
// loadingDetails['W34'].basincode= 'W34 Elangovan';
// loadingDetails['BBS'].basincode= 'BBS Elangovan';
// console.log(loadingDetails);


// function stringToDate(_date, _format, _delimiter) {
// 	var formatLowerCase = _format.toLowerCase();
// 	var formatItems = formatLowerCase.split(_delimiter);
// 	var dateItems = _date.split(_delimiter);
// 	var monthIndex = formatItems.indexOf("mm");
// 	var dayIndex = formatItems.indexOf("dd");
// 	var yearIndex = formatItems.indexOf("yyyy");
// 	var month = parseInt(dateItems[monthIndex]);
// 	month -= 1;
// 	var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
// 	return formatedDate;
// }

// // console.log(stringToDate("17/9/2014","dd/MM/yyyy","/"));
// // console.log(stringToDate("9/17/2014","mm/dd/yyyy","/"));
// // console.log(stringToDate("9-17-2014","mm-dd-yyyy","-"));

// const urls = [
// 	'data/gfs/BBS_IMD-GFS_01012022033154d.csv',
// 	'data/gfs/BBS_IMD-GFS_01012023033356.csv',
// 	'data/gfs/BBS_IMD-GFS_01022022033109d.csv',
// 	'data/gfs/BBS_IMD-GFS_01032022053317.csv',
// 	'data/gfs/BBS_IMD-GFS_01042022064327d.csv',
// 	'data/gfs/BBS_IMD-GFS_01122021023216.csv'
// ];

// urls.map(url =>
// 	(function (url) {
// 		fetch(url).then(response => {
// 			if (!response.ok) {
// 				throw new Error(`Failed to fetch, status: ${response.status}`);
// 			}
// 			return response.text();
// 		})
// 			.then(data => {
// 				//const filePath = '/path/to/file.ext';
// 				const fileName = url.split('/').pop();
// 				console.log(fileName); // outputs: 'file.ext
// 				console.log(url);
// 				console.log(data);
// 			})
// 			.catch(error => {
// 				const fileName = url.split('/').pop();
// 				console.log(fileName); // outputs: 'file.ext
// 				console.error(error);
// 			})
// 	})(url)
// );

// //   let index = 0;

// //   function getData() {
// // 	fetch(urls[index])
// // 	  .then(response => {
// // 		if (!response.ok) {
// // 		  throw new Error(`HTTP error! status: ${response.status}`);
// // 		}
// // 		// console.log(response.text())
// // 		// return {'url': response['url'],'data':response.text()};
// // 		return response.text();
// // 		// return response.json();
// // 	  })
// // 	  .then(data => {
// // 		// Use the data here
// // 		//console.log();
// // 		console.log(data);
// // 		//console.log(data);
// // 		index++;
// // 		if (index < urls.length) {
// // 		  getData();
// // 		}
// // 	  })
// // 	  .catch(error => {
// // 		console.error(error);
// // 	  });
// //   }

// //   getData();

// const downloadCsv = async () => {
// 	try {
// 		const target = 'data/gfs/BBS_IMD-GFS_01012022033154.csv';
// 		const res = await fetch(target, {
// 			method: 'get',
// 			headers: {
// 				'content-type': 'text/csv;charset=UTF-8',
// 			}
// 		});

// 		if (res.status === 200) {
// 			const data = await res.text();
// 			console.log(csvJSON(data));
// 		} else {
// 			console.log(`Error code ${res.status}`);
// 		}
// 	} catch (err) {
// 		console.log(err)
// 	}
// }
// // downloadCsv();
// const parseCSV = (data) => {
// 	const csvData = [];
// 	const lines = data.split("\n");

// 	for (let i = 0; i < lines.length; i++) {
// 		csvData[i] = lines[i].split(",");
// 	}

// 	// return an array of arrays 2D array
// 	// e.g [ [1,2,3], [3,4,5], [6,7,8] ]
// 	return csvData;
// };

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
	//return JSON.stringify(result);
}
// function tsvJSON(tsv) {

// 	var lines = tsv.split("\n");

// 	var result = [];

// 	var headers = lines[0].split("\t");

// 	for (var i = 1; i < lines.length; i++) {

// 		var obj = {};
// 		var currentline = lines[i].split("\t");

// 		for (var j = 0; j < headers.length; j++) {
// 			obj[headers[j]] = currentline[j];
// 		}

// 		result.push(obj);

// 	}

// 	//return result; //JavaScript object
// 	return JSON.stringify(result); //JSON
// }

// // readTextFile('./data/subwebsite.txt?t=' + new Date().getTime(), function (txt) {
// // 	if(txt === "Error404"){
// // 		console.log('File not found');
// // 	}else 	if(txt === "Error"){
// // 		console.log('Error in File loading');
// // 	}
// // });
// // d3.csv('./data/PCP_chart.csv', function (error, data) {
// // 	console.error(error);
// // 	console.error(error.currentTarget.statusText);
// // });

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
		minZoom: 5,
		zoom: 4
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
	//console.log(feat.properties['Basin_Name']);
	//console.log(feat.properties['Code']);
	loadingDetails[feat.properties['Code']] = { 'layer': { 'substatus': 'downloading', 'rchstatus': 'downloading', 'cwcstatus': 'downloading' }, 'data': { 'substatus': 'downloading', 'rchstatus': 'downloading', 'cwcstatus': 'downloading', 'chartstatus': 'downloading' } };
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
		let subdata4fndminmax = loadedDataset[basincode][modelname]['sub'];
		if (subdata4fndminmax !== 'error' && typeof subdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(subdata4fndminmax)) {
			let pcpdatalst = [], wylddatalst = [], etdatalst = [], swdatalst = [];

			for (let s = 0; s < daylst.length; s++) {
				if (typeof subdata4fndminmax[daylst[s]] === 'undefined') continue;
				let tmpdata = subdata4fndminmax[daylst[s]]['data'];
				//console.log(tmpdata)
				if (tmpdata === 'error') continue;

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
				showmessage("[" + basincode + "] Rainfall Not matching the criteria (0.01>)");
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
				//console.log(pcpdomain);
			}

			if (wylddatalst.length == 0) {
				showmessage("[" + basincode + "] Water Yield Not matching the criteria (0.01>)");
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
				//console.log(wylddomain);
			}
			if (etdatalst.length == 0) {
				showmessage("[" + basincode + "] Evapo-transpiration Not matching the criteria (0.01>)");
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
				//console.log(etdomain);
			}
			if (swdatalst.length == 0) {
				showmessage("[" + basincode + "] Soil Moisture status Not matching the criteria (0.01>)");
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
				//console.log(swdomain);
			}
			delete subdata4fndminmax;
		} else {
			delete subdata4fndminmax;
		}
	}

	if (prm === 'rch' || prm === 'all') {
		let rchdata4fndminmax = loadedDataset[basincode][modelname]['rch'];
		if (rchdata4fndminmax !== 'error' && typeof rchdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(rchdata4fndminmax)) {
			var flowdatalst = [];
			for (var s = 0; s < Object.keys(rchdata4fndminmax).length; s++) {
				if (typeof rchdata4fndminmax[daylst[s]] === 'undefined') continue;
				let tmpdata = rchdata4fndminmax[daylst[s]]['data'];
				//console.log(tmpdata)
				if (tmpdata === 'error') continue;

				//var tmpdata = rchdata4fndminmax[daylst[s]]['data'];
				// console.log(d3.extent(tmpdata, function (d) { 
				// return Number(d.FLOW_OUTcms) > 0.01 ? Number(d.FLOW_OUTcms): null; }));
				tmpdata.map(function (d) {
					if (Number(d.FLOW_OUTcms) > 0.01)
						flowdatalst.push(Number(d.FLOW_OUTcms));
				});
			}

			if (flowdatalst.length > 0) {
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
				//console.log('rch : ' + flowdomain);
			} else {
				showmessage("[" + basincode + "] Stream flow status Not matching the criteria (0.01>)");
			}
			delete rchdata4fndminmax
		} else {
			delete rchdata4fndminmax
		}
	}

	if (prm === 'cwc' || prm === 'all') {
		if (typeof loadedDataset[basincode][modelname]['cwc'] !== 'undefined') {
			let cwcdata4fndminmax = loadedDataset[basincode][modelname]['cwc']['data'];
			//console.log(cwcdata);

			if (cwcdata4fndminmax !== 'error' && typeof cwcdata4fndminmax !== 'undefined' && !jQuery.isEmptyObject(cwcdata4fndminmax)) {
				var dateParse = d3.timeParse("%m/%d/%Y");
				var dateFormat = d3.timeFormat("%d-%b-%Y");
				var parseTime = d3.timeParse("%d-%b-%y");
				var rfdatalst = [], ifdatalst = [];
				cwcdata4fndminmax.forEach(function (d) {
					d.Date = dateFormat(dateParse(d.Date));
					d.Rainfall = +d.Rainfall;
					d.Inflow = +d.Inflow;

					rfdatalst.push(d.Rainfall);
					ifdatalst.push(d.Inflow);
				});
				if (rfdatalst.length > 0) {
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
				}
				//******************************************
				if (ifdatalst.length > 0) {
					ifdatalst = removeDuplicates(ifdatalst);
					ifdatalst = ifdatalst.map(Number);
					ifdatalst.sort(function (a, b) {
						return d3.ascending(a, b)
					});

					let ifmin = d3.min(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					let ifmax = d3.max(ifdatalst, function (d) { return Number(d); }).toFixed(1);
					let iflowestbreak = d3.quantile(ifdatalst, .1).toFixed(1);
					let iflowbreak = d3.quantile(ifdatalst, .25).toFixed(1);
					let ifmedval = d3.quantile(ifdatalst, .5).toFixed(1);
					let ifhigbreak = d3.quantile(ifdatalst, .75).toFixed(1);
					let ifhigestbreak = d3.quantile(ifdatalst, .9).toFixed(1);

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
	loadingContainer.style.display = 'block';
	//console.log(loadedDataset)

	if (typeof loadedDataset[basincode] === 'undefined') {
		loadedDataset[basincode] = {};
		if (typeof loadedDataset[basincode][modelname] === 'undefined') {
			loadedDataset[basincode][modelname] = { 'sub': {}, 'rch': {}, 'cwc': {}, 'chart': {} };
		}
	}

	daylst = [];
	//***************** loading datas ******************************
	readTextFile('./data/' + basincode + '_' + modelname + 'subwebsite.txt?t=' + new Date().getTime(), function (txt) {
		//		console.log(txt);
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log(txt + ' File not found : ' + basincode + '_' + modelname + 'subwebsite.txt');
			showmessage("Please check the internet speed and wait to load " + txt);
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			loadingDetails[basincode]['data']['substatus'] = 'error';
			console.log(txt + ' Error in File loading : ' + basincode + '_' + modelname + 'subwebsite.txt');
			showmessage("Please check the internet speed and wait to load " + txt);
		} else {
			// console.error(modelname);
			// console.error(loadedDataset[basincode][modelname]['sub']);

			//if (typeof (loadedDataset[basincode][modelname]['sub']) === 'undefined') {
			if (Object.keys(loadedDataset[basincode][modelname]['sub']).length === 0) {
				let lines = txt.split('\r\n');
				for (let line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {
						let dtstr = lines[line].split("_")[3].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						daylst.push(filedate);

						let flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
						let url = flname;
						if (typeof loadedDataset[basincode][modelname]['sub'][filedate] === 'undefined') {
							(function (url, dtstr, filedate) {
								fetch(url).then(response => {
									if (!response.ok) {
										throw new Error(`Failed to fetch, status: ${response.status}`);
									}
									return response.text();
								})
									.then(data => {
										// //const filePath = '/path/to/file.ext';
										// const fileName = url.split('/').pop();
										// console.log(fileName); // outputs: 'file.ext
										// console.log(url);
										// console.log(data);
										// console.log(csvJSON(data));
										loadedDataset[basincode][modelname]['sub'][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': csvJSON(data) };
									})
									.catch(error => {
										// const fileName = url.split('/').pop();
										// console.log(fileName); // outputs: 'file.ext
										// console.error(error);
										console.error('Error message:', error.message);
										loadedDataset[basincode][modelname]['sub'][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': 'error' };
									})
								loadingDetails[basincode]['data']['substatus'] = 'downloaded';
							})(url, dtstr, filedate)
						}
					}
				}
			}

			if (daylst.length > 2)
				$('#rundate').text("Simulated using " + modelname.toUpperCase() + ' on ' + daylst[1]);
			else
				$('#rundate').text('No forecast today');
		}
		//console.log(daylst);
	});

	readTextFile('./data/' + basincode + '_' + modelname + 'rchwebsite.txt?t=' + new Date().getTime(), function (txt) {
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log('File not found : ' + basincode + '_' + modelname + 'rchwebsite.txt');
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			loadingDetails[basincode]['data']['rchstatus'] = 'error';
			console.log('Error in File loading : ' + basincode + '_' + modelname + 'rchwebsite.txt');
		} else {
			//if (typeof (loadedDataset[basincode][modelname]['rch']) === 'undefined') {
			if (Object.keys(loadedDataset[basincode][modelname]['rch']).length === 0) {
				var lines = txt.split('\r\n');
				for (var line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {
						let dtstr = lines[line].split("_")[3].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						if (!daylst.includes(filedate)) {
							daylst.push(filedate);
						}
						var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
						//rchqueue.defer(d3.csv, flname);

						let url = flname;
						(function (url, dtstr, filedate) {
							fetch(url).then(response => {
								if (!response.ok) {
									throw new Error(`Failed to fetch, status: ${response.status}`);
								}
								return response.text();
							})
								.then(data => {
									// //const filePath = '/path/to/file.ext';
									// const fileName = url.split('/').pop();
									// console.log(fileName); // outputs: 'file.ext
									// console.log(url);
									// console.log(data);
									// console.log(csvJSON(data));
									loadedDataset[basincode][modelname]['rch'][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': csvJSON(data) };
								})
								.catch(error => {
									// const fileName = url.split('/').pop();
									// console.log(fileName); // outputs: 'file.ext
									// console.error(error);
									console.error('Error message:', error.message);
									loadedDataset[basincode][modelname]['rch'][filedate] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': 'error' };
								})
							loadingDetails[basincode]['data']['rchstatus'] = 'downloaded';
						})(url, dtstr, filedate)
					}
				}
			}
		}
		//console.log(daylst);
	});

	readTextFile('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt?t=' + new Date().getTime(), function (txt) {
		if (txt === "Error404") {
			loadingSubdataCompleted = true;
			console.log('File not found : ' + basincode + '_' + modelname + 'cwcwebsite.txt');
		} else if (txt === "Error") {
			loadingSubdataCompleted = true;
			loadingDetails[basincode]['data']['cwcstatus'] = 'error';
			console.log('Error in File loading : ' + basincode + '_' + modelname + 'cwcwebsite.txt');
		} else {
			//if (typeof (loadedDataset[basincode][modelname]['cwc']) === 'undefined') {
			if (Object.keys(loadedDataset[basincode][modelname]['cwc']).length === 0) {
				var lines = txt.split('\r\n');
				for (var line = 0; line < lines.length; line++) {
					if (lines[line] !== '') {

						let dtstr = lines[line].split("_")[2].substring(0, 8);
						let filedate = dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8);
						daylst.push(filedate);

						var flname = "./data/" + modelname + "/" + lines[line] + '?t=' + new Date().getTime();
						//cwcqueue.defer(d3.csv, flname);

						let url = flname;
						(function (url, dtstr, filedate) {
							fetch(url).then(response => {
								if (!response.ok) {
									throw new Error(`Failed to fetch, status: ${response.status}`);
								}
								return response.text();
							})
								.then(data => {
									// //const filePath = '/path/to/file.ext';
									// const fileName = url.split('/').pop();
									// console.log(fileName); // outputs: 'file.ext
									// console.log(url);
									// console.log(data);
									// console.log(csvJSON(data));
									loadedDataset[basincode][modelname]['cwc'] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': csvJSON(data) };
								})
								.catch(error => {
									// const fileName = url.split('/').pop();
									// console.log(fileName); // outputs: 'file.ext
									// console.error(error);
									console.error('Error message:', error.message);
									loadedDataset[basincode][modelname]['cwc'] = { 'filename': url, 'filecode': dtstr, 'date': filedate, 'data': 'error' };
								})
							loadingDetails[basincode]['data']['cwcstatus'] = 'downloaded';
						})(url, dtstr, filedate)
					}
				}
			}
		}
		//		console.log(daylst);
	});

	d3.csv('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv?t=' + new Date().getTime(), function (error, data) {
		if (error) {
			if (error.currentTarget.status === 404) {
				console.error("Chart data : " + error.currentTarget.statusText + "" + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv');
			} else {
				// console.error("Chart data : " + error);
				console.error('Error message:', error.message);
			}
			loadingDetails[basincode]['data']['chartstatus'] = 'error';
		} else if (typeof (data) !== "undefined") {
			loadingDetails[basincode]['data']['chartstatus'] = 'downloaded';

			if (typeof (loadedDataset[basincode][modelname]['chart']) === 'undefined') {
				loadedDataset[basincode][modelname]['chart'] = {};
			}

			pcpchartdata = data.slice(0);
			var dateParse = d3.timeParse("%m/%d/%Y");
			var dateFormat = d3.timeFormat("%d-%b-%Y");
			var parseTime = d3.timeParse("%d-%b-%y");
			pcpchartdata.forEach(function (d) {
				d.Date = dateFormat(dateParse(d.Date));
				d.Rainfall = +d.Rainfall;
				d.Inflow = +d.Inflow;
			});

			loadedDataset[basincode][modelname]['chart'] = pcpchartdata;

			let msec = (new Date() - startedat);
			console.log("Chart data completed loading : " + (msec / 1000) + ' Seconds');
		}
		//console.log(data);
	});

	// if (fileExist('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv') === 200) {
	// } else {
	// 	console.log(modelname + ' Chart data not available [' + modelname + ']');
	// }
	// loadingContainer.style.display='none';
	// console.log('display none 4');
	//$(".LoadingContainer").hide();
}

function onEachCWCbasinLayer(feature, layer) {
	layer.bindTooltip('CWC : ' + feature.properties['Name'], {
		className: 'basintooltip',
		closeButton: false,
		sticky: true,
		offset: L.point(0, -20)
	});
}
async function loadBasinLayers(basincode) {
	var rchurl = 'json/reach/' + basincode + '.json?t=' + new Date().getTime();
	var suburl = 'json/watershed/' + basincode + '.json?t=' + new Date().getTime();
	var cwcurl = 'json/CWC_basin/' + basincode + '.json?t=' + new Date().getTime();

	loadingLayers = true;
	if (isPlay == true) {
		playwatershed();
	}

	cwcgeojson = []; subgeojson = []; rchgeojson = [];
	if (typeof loadedLayers[basincode] === 'undefined') {
		loadedLayers[basincode] = {};
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
				loadingDetails[basincode]['layer']['cwcstatus'] = 'downloaded';
				loadedLayers[basincode]['cwclayer'] = cwcgeojson;

				delete cwcgeojson;
				delete cwcTopoJson;

				let msec = (new Date() - startedat);
				console.log("CWC json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				loadingDetails[basincode]['layer']['cwcstatus'] = 'error';
				loadedLayers[basincode]['cwclayer'] =  'error'; //'Error: ' +  textStatus + ' ' + errorThrown;
				showmessage("Please check your internet speed, layers are not loaded")
			});

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
				loadingDetails[basincode]['layer']['substatus'] = 'downloaded';
				loadedLayers[basincode]['sublayer'] = subgeojson;

				delete subgeojson;
				delete subTopoJson;

				let msec = (new Date() - startedat);
				console.log("Subbasin json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				loadingDetails[basincode]['layer']['substatus'] = 'error';
				loadedLayers[basincode]['sublayer'] = 'error';
				showmessage("Please check your internet speed, layers are not loaded")
			});
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
				}).bindPopup(chart_subbasin)
					.addTo(map);
				//rchload = true;
				loadingDetails[basincode]['layer']['rchstatus'] = 'downloaded';
				loadedLayers[basincode]['rchlayer'] = rchgeojson;

				delete rchgeojson;
				delete rchTopoJson;

				let msec = (new Date() - startedat);
				console.log("Reach json completed loading : " + (msec / 1000) + ' Seconds');
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				//console.error('Error: ', textStatus, errorThrown);
				loadingDetails[basincode]['layer']['rchstatus'] = 'error';
				loadedLayers[basincode]['rchlayer'] = 'error';
				showmessage("Please check your internet speed, layers are not loaded")
			});
	} else {
		cwcgeojson = loadedLayers[basincode]['cwclayer'];
		subgeojson = loadedLayers[basincode]['sublayer'];
		rchgeojson = loadedLayers[basincode]['rchlayer'];

		if (!map.hasLayer(subgeojson)) {
			map.addLayer(subgeojson)
		}
		if (!map.hasLayer(rchgeojson)) {
			map.addLayer(rchgeojson)
		}
	}
}

let selectedbasinbounds = [];
async function loadBasin(e) {

	console.clear();

	startedat = new Date();
	document.getElementById('divalert').style.display = 'none';
	if (basincode == e.target.feature.properties.Code) return;

	if (loadingLayers == true) {
		showmessage('Wait basin is loading');
		return;
	}
	selectedbasinbounds = e.target.getBounds();
	map.fitBounds(selectedbasinbounds);
	// $(".LoadingContainer").show();
	loadingContainer.style.display = 'block';
	//console.log(loadingContainer);

	basincode = e.target.feature.properties.Code;
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

	await loadBasinLayers(basincode);
	//console.log(loadingDetails)
	//***************** End loading layers ******************************

	loaddata();

	let subdatastatus = rchdatastatus = cwcdatastatus = chartdatastatus = sublayerstatus = rchlayerstatus = cwclayerstatus = false;
	// console.log([sublayerstatus, rchlayerstatus, cwclayerstatus]);
	// console.log([subdatastatus, rchdatastatus, cwcdatastatus, chartdatastatus]);
	let boolshowmessage = true, totalminutes = 60;
	var loaderinterval = setInterval(
		function () {
			let layerloader = dataloader = true;
			if (typeof loadingDetails[basincode]['layer']['substatus'] !== 'undefined') {
				if (loadingDetails[basincode]['layer']['substatus'] === 'downloaded') {
					sublayerstatus = true;
				}
			}
			if (typeof loadingDetails[basincode]['layer']['rchstatus'] !== 'undefined') {
				if (loadingDetails[basincode]['layer']['rchstatus'] === 'downloaded') {
					rchlayerstatus = true;
				}
			}
			if (typeof loadingDetails[basincode]['layer']['cwcstatus'] != 'undfined') {
				if (loadingDetails[basincode]['layer']['cwcstatus'] === 'downloaded') {
					cwclayerstatus = true;
				}
			}


			if (loadingDetails[basincode]['layer']['substatus'] === 'error' || loadingDetails[basincode]['layer']['rchstatus'] === 'error' || loadingDetails[basincode]['layer']['cwcstatus'] === 'error') {
				console.error('Error in loading layers');
				layerloader = false;
			}

			if (sublayerstatus === true && rchlayerstatus === true && cwclayerstatus === true) {
				console.log('Loading layers are completed');
				layerloader = false;
			} else {
				let msec = (new Date() - startedat);
				// console.log((msec / 1000));
				if ((msec / 1000) > totalminutes && boolshowmessage === true) {
					// console.info("data loading completed : " + (msec / 1000) + ' Seconds');
					showmessage("The download is not yet complete and has been running for over a minute.")
					totalminutes = Math.trunc(msec / 1000) + 1;
					boolshowmessage = false;
				}
			}

			//			console.log([sublayerstatus, rchlayerstatus, cwclayerstatus]);

			if (typeof loadingDetails[basincode]['data']['substatus'] !== 'undefined') {
				if (loadingDetails[basincode]['data']['substatus'] === 'downloaded' || loadingDetails[basincode]['data']['substatus'] === 'error') {
					subdatastatus = true;
					if (loadingDetails[basincode]['data']['substatus'] === 'downloaded') {
						getminmax('sub');
					}
				}
			}
			if (typeof loadingDetails[basincode]['data']['rchstatus'] !== 'undefined') {
				if (loadingDetails[basincode]['data']['rchstatus'] === 'downloaded' || loadingDetails[basincode]['data']['rchstatus'] === 'error') {
					rchdatastatus = true;
					if (loadingDetails[basincode]['data']['rchstatus'] === 'downloaded') {
						getminmax('rch');
					}
				}
			}
			if (typeof loadingDetails[basincode]['data']['cwcstatus'] != 'undfined') {
				if (loadingDetails[basincode]['data']['cwcstatus'] === 'downloaded' || loadingDetails[basincode]['data']['cwcstatus'] === 'error') {
					cwcdatastatus = true;
					if (loadingDetails[basincode]['data']['cwcstatus'] === 'downloaded') {
						getminmax('cwc');
					}
				}
			}

			if (typeof loadingDetails[basincode]['data']['chartstatus'] != 'undfined') {
				if (loadingDetails[basincode]['data']['chartstatus'] === 'downloaded' || loadingDetails[basincode]['data']['chartstatus'] === 'error') {
					chartdatastatus = true;
				}
			}

			if (subdatastatus === true && rchdatastatus === true && cwcdatastatus === true && chartdatastatus === true) {
				dataloader = false;
			}

			if (dataloader === false && layerloader === false) {
				setHighlight(e.target);
				//$(".LoadingContainer").hide();
				loadingContainer.style.display = 'none';
				console.log('display none 1');
				clearInterval(loaderinterval);
				loadingLayers = false;

				//getminmax();

				let msec = (new Date() - startedat);
				console.info("data loading completed : " + (msec / 1000) + ' Seconds');
			} else if (layerloader === false && Object.keys(loadedDataset[basincode][modelname]['sub']).length > 0) {
				Object.keys(loadedDataset[basincode][modelname]['sub']).every(function (key) {
					let dataavailable = loadedDataset[basincode][modelname]['sub'][key]['data'];
					if (dataavailable !== 'error') {
						setHighlight(e.target);
						//$(".LoadingContainer").hide();
						loadingContainer.style.display = 'none';
						console.log('display none 2-1');
						loadingLayers = false;
						return false;
					}
				});
			} else {
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

	// let msec = (new Date() - startedat);
	// //console.log(msec);
	// console.log((msec / 1000) + ' Seconds');
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
	div.innerHTML = '<span id="ffdate" style="padding:5px;"> ' + date.getDate() + '-' + mname[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
	return div;
};
ctrlDate.addTo(map);

function playwatershed() {

	if (basincode == undefined || basincode == null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 2');
		return;
	}

	//console.log([curfield, curfield]);

	document.getElementById('divalert').style.display = 'none';
	if (curfield === undefined || curfield == null) {
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

				//ajaxaddlayers(curlayer, curfield);
				addlayer(curlayer, curfield);
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
	//cwcdata = loadedDataset[basincode][modelname]['cwc']['data'];
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

	pcpchartdata = loadedDataset[basincode][modelname]['chart']

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
	if (map.hasLayer(labelLayerGroup))
		map.removeLayer(labelLayerGroup);

	if (map.hasLayer(legend))
		map.removeLayer(legend);

	subgeojson = null;
	rchgeojson = null;
	cwcgeojson = null;

	//indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer, curfield, basincode;
	daylst = [], subdata4fndminmax = [], rchdata4fndminmax = [], cwcdata4fndminmax = [], pcpchartdata = [];

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
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 5');
		return;
	}
	if (prmlayer === undefined || fldname === undefined || prmlayer == null || fldname == null) {
		showmessage('Select Variable')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 6');
		return;
	}

	if (basincode == undefined || basincode == null) {
		showmessage('Select basin')
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 7');
		return;
	}
	addinglayers = true;

	//console.log(new Date());
	//document.getElementById('loader').style.display = 'block';
	//$(".LoadingContainer").show();

	getminmax('all');

	if (map.hasLayer(subgeojson))
		map.removeLayer(subgeojson);
	if (map.hasLayer(rchgeojson))
		map.removeLayer(rchgeojson);
	if (map.hasLayer(cwcgeojson))
		map.removeLayer(cwcgeojson);

	var dated = day <= 1 ? 'Observed Dated : ' : 'Forecast Dated : ';
	if (day < daylst.length) {

		subdata4fndminmax = loadedDataset[basincode][modelname]['sub'][daylst[day]]['data'];
		cwcdata4fndminmax = loadedDataset[basincode][modelname]['cwc']['data'];
		// console.log(subdata);
		// console.log(cwcdata);

		document.getElementById('ffdate').innerHTML = dated + daylst[day];
		if (prmlayer == 'sub' && subdata4fndminmax != 'error' && subdata4fndminmax != undefined && subdata4fndminmax.length > 0) {
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

			console.info("substatus : " + loadingDetails[basincode]['data']['substatus']);

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
			map.addLayer(subgeojson);
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
			console.log('display none 8');
		} else if (prmlayer == 'sub') {
			//$(".LoadingContainer").hide();
			loadingContainer.style.display = 'none';
			console.log('display none 9');
			showmessage('No SWAT runs [' + modelname + ']');
			console.error("runerror : Subbasin data is not matching criteria")
		}

		console.log(daylst[day]);
		rchdata4fndminmax = loadedDataset[basincode][modelname]['rch'][daylst[day]]['data'];
		console.log(rchdata4fndminmax);
		if (prmlayer == 'rch' && rchdata4fndminmax != 'error' && rchdata4fndminmax != undefined && rchdata4fndminmax.length > 0) {

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

			console.info("rchstatus : " + loadingDetails[basincode]['data']['rchstatus']);

			if (jQuery.isEmptyObject(flowdomain)) {
				getminmax('rch');
			}

			if (jQuery.isEmptyObject(flowdomain)) {
				showmessage('Stream flow is Not downloaded properly please refresh page and run again');
				return;
			}

			rchcolor = d3.scaleThreshold()
				.domain(flowdomain)
				.range(["#ffff00", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
			let clrange = rchcolor.domain();


			console.log(rchdata4fndminmax);
			//

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
			console.log('display none 11');
		} else if (prmlayer == 'rch') {
			//$(".LoadingContainer").hide();
			loadingContainer.style.display = 'none';
			console.log('display none 12');
			showmessage('No SWAT runs [' + modelname + ']');
			console.error("runerror : Reach data is not matching criteria")
		}

		if (prmlayer == 'cwc' && cwcdata4fndminmax != 'error' && cwcdata4fndminmax != undefined && cwcdata4fndminmax.length > 0) {

			map.addLayer(cwcgeojson);

			// var datalst = [];
			// cwcgeojson.eachLayer(function (layer) {
			// 	var datavalue = cwcdata[0].filter(function (dv) {
			// 		return dv.Subbasin == layer.feature.properties.SUBBASIN;
			// 	});
			// 	var gv = NaN;
			// 	if (datavalue.length != 0) {
			// 		gv = Number(datavalue[day][fldname]);
			// 		layer.feature.properties.name = 'cwc';
			// 		layer.feature.properties.value = gv;
			// 		datalst.push(gv);
			// 	}
			// });

			console.info("cwcstatus : " + loadingDetails[basincode]['data']['cwcstatus']);

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
					gv = Number(datavalue[day][fldname]);
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
			console.log('display none 13');
		} else if (prmlayer == 'cwc') {
			//$(".LoadingContainer").hide();
			loadingContainer.style.display = 'none';
			console.log('display none 14');
			showmessage('No SWAT runs [' + modelname + ']');
			console.error("runerror : CWC data is not matching criteria")
		}

		if (map.hasLayer(subgeojson)) {
			map.fitBounds(subgeojson.getBounds());
		}
		// curlayer = prmlayer;
		// curfield = fldname;
		//$(".LoadingContainer").hide();
		loadingContainer.style.display = 'none';
		console.log('display none 15');
	}
	else {
		document.getElementById('ffdate').innerHTML = 'No data available';
	}
	addinglayers = false;
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

	// //resetlayers();
	// loadingSubdataCompleted = false;
	// loadingRchdataCompleted = false;
	// loadingCwcdataCompleted = false;
	startedat = new Date();
	if (typeof loadedDataset[basincode][modelname] === 'undefined') {
		loaddata();
	} else if (Object.keys(loadedDataset[basincode][modelname]).length === 0) {
		loaddata();
	}

	if (curlayer != null && curfield != null) {
		if ($(".LoadingContainer").is(':hidden')) { $(".LoadingContainer").show(); }
		var dataSpin = setInterval(
			function () {
				//if (loadingSubdataCompleted == true && loadingRchdataCompleted == true && loadingCwcdataCompleted == true) {
				//if (subdata.length > 0 && cwcdata.length > 0 && rchdata.length > 0 && daylst.length > 0) {
				if (Object.keys(loadedDataset[basincode][modelname]).length > 0) {
					//$(".LoadingContainer").hide();
					loadingContainer.style.display = 'none';
					console.log('display none 16');
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

	if (isPlay == true || day > nodays) return;
	if (loadingLayers == true) {
		showmessage('Wait basin is loading');
		return;
	}

	if (curlayer != null && curfield != null) {
		//ajaxaddlayers(curlayer, curfield);
		addlayer(curlayer, curfield)
	}
});

// map.on('click', function (e) {
// 	//map.spin(false);
// });

function ajaxaddlayers(layer, field) {
	//$(".LoadingContainer").show();
	loadingContainer.style.display = 'block';
	addinglayers = false;
	var calladdlayers = 0;

	curlayer = layer;
	curfield = field;

	var loaderSpin = setInterval(
		function () {
			if (addinglayers == true) {
				//$(".LoadingContainer").hide();
				loadingContainer.style.display = 'none';
				console.log('display none 17');
				clearInterval(loaderSpin);
			}
			if (calladdlayers == 0) {
				calladdlayers++;
				addlayer(curlayer, curfield);
			}
		}, 1000);
}

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
