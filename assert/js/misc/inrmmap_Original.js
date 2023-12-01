
//ar = [1, 2, 3, 4];
////ar = ar.filter(item => !(item > 3));
//ar = ar.filter(item => (item > 2));
//console.log(ar)

//var data = ["ABCDEF", "GHIJKXYZ", "ACDGHIJKLYZ", "EFMXYZ", "LMNOP", "ABC"];
//var u = d3.select('#divtool')
//    .selectAll('.key_div')
//    .data(data, function (d) { return d })
//    .attr("class", "key_div");

//u.enter()
//    .append('div')
//    .attr("class", "key_div")
//    .merge(u)
//    .transition()
//    .style('left', function (d, i) {
//        return 254 + (i * 34) + 'px';
//    })
//    .text(function (d) {
//        return d;
//    });

//console.log(u);

//var xmlString = "<div id='foo'><a href='#'>Link</a><span></span></div>";
//doc = new DOMParser().parseFromString(xmlString, "text/xml");
//console.log(doc)
//console.log(doc.firstChild.innerHTML); // => <div id="foo">...
//console.log(doc.firstChild.firstChild.innerHTML); // => <a href="#">...


//if (document.getElementById("myElementId")) {
//    alert("Element exists");
//} else {
//    alert("Element does not exist");
//}

//var elementExists = document.getElementById("find-me");
//console.log(elementExists);

//// logs "foo string"
//(function () { var undefined = 'foo'; console.log(undefined, typeof undefined); })();

//// logs "foo string"
//(function (undefined) { console.log(undefined, typeof undefined); })('foo');

//(function () {
//    var ss = 'no';
//    if (getStatus(ss)) {
//        alert('Status return true');
//    } else {
//        alert('Status return false');
//    }

//    function getStatus(ask) {
//        if (ask == 'yes') {
//            return true;
//        }
//        else {
//            return false;
//        }
//    }
//})();

//var obj = {};
//obj.prop = ['element0', 'element1', 'elementN'];
//obj['test'] = ['elementN', 'element1', 'element0'];
//console.log(obj);
//console.log(obj['prop']);
//console.log(obj['test']);

//var arr = [];
//arr[0] = ['element0', 'element1', 'elementN'];
//arr[1] = ['elementN', 'element1', 'element0'];
//console.log(arr);
//console.log(arr[0]);
//console.log(arr[1]);

var modelname = 'gfs', isPlay = false, loadingLayers = false, day = 0, wsopacity = 0.5, nodays = 8;
var indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer, curfield, basincode;
//var centroid = [],  subflst = [], rchflst = [], cwcflst = [];
var daylst = [], subdata = [], rchdata = [], cwcdata = [], pcpchartdata = [];;
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var subcolor = d3.scaleThreshold()
    .domain([.1, 10, 20, 40, 70, 130, 200])
    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

var rchcolor = null;

//var rchcolor = d3.scaleThreshold()
//    .domain([0, 0.5, 10, 20, 50, 100, 500])
//    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

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

//$(".loader").show();
map.spin(true);

map.createPane('labels');
map.getPane('labels').style.zIndex = 650;
map.getPane('labels').style.pointerEvents = 'none';

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>, <a href="http://inrm.co.in">INRM</a>';
var positronLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution,
    pane: 'labels'
}).addTo(map);

var indiaurl = "./json/AllBasin_WGS84_01.json"

if (fileExist(indiaurl) !== 200) {
    document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India Json file does not exist';
    document.getElementById('divalert').style.display = 'inline';
    //return false;
}
var color = d3.scaleOrdinal().domain([1, 17]).range(colorbrewer.Paired[12]);
function style(feat, i) {
    //console.log(feat)
    //console.log(i);
    return {
        color: "white",
        fillColor: color(feat.ind),
        fillOpacity: 0.25,
        weight: 1.5
    }
}

//var highlight;

//function setHighlight(layer) {
//    if (layer === undefined || layer == null) return;
//    // Check if something's highlighted, if so unset highlight
//    if (highlight) {
//        unsetHighlight(highlight);
//    }
//    // Set highlight style on layer and store to variable
//    layer.setStyle({
//        weight: 3,
//        color: 'maroon',
//        dashArray: '',
//        fillOpacity: 0
//    });
//    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//        layer.bringToFront();
//    }

//    highlight = layer;
//}

//function unsetHighlight(layer) {

//    if (layer === undefined || layer == null) return;
//    //Set default style and clear variable
//    layer.setStyle(style(layer.feature));

//    // Set default style and clear variable
//    //layer.setStyle({
//    //    color: "white",
//    //    //fillColor: color(feat.ind),
//    //    //fillOpacity: 0.25,
//    //    weight: 1.5
//    //});

//    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
//        layer.bringToBack();
//    }

//    highlight = null;
//}

var layerGroup = L.layerGroup().addTo(map);
var customOptions =
{
    //'maxWidth': '30',
    'className': 'another-popup'
}
// loading GeoJSON file - Here my html and usa_adm.geojson file resides in same folder
$.getJSON(indiaurl, function (data) {

    //topoob = JSON.parse(basinreq.responseText)
    var objname = Object.keys(data.objects)[0];
    //neighbors = topojson.neighbors(data.objects[objname].geometries);
    var indiaTopoJson = topojson.feature(data, data.objects[objname])
    indiaTopoJson.features = indiaTopoJson.features.map(function (fm, i) {
        var ret = fm;
        ret.ind = i;
        return ret
    });
    indiageojson = L.geoJson(indiaTopoJson, {
        style: style
        //{
        //    color: "rgba(0,0,0,0.3)",
        //    //dashArray: "20,25",
        //    fillColor: "maroon",
        //    fillOpacity: 0.2,
        //    weight: 1
        //}
        , onEachFeature: onEachBasinLayer
    }).addTo(map)

    //console.log(indiageojson.getBounds());

    map.fitBounds(indiageojson.getBounds())

    //$(".loader").hide();

    map.spin(false);

    //var cntfile = "./json/Basin_centroid.csv";
    //d3.csv(cntfile, function (err, data) {
    //    if (err) {
    //        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India Json file does not exist';
    //        document.getElementById('divalert').style.display = 'inline';
    //    } else {
    //        centroid = data;
    //    }
    //});
    // Variable for storing highlighted layer

    function onEachCWCbasinLayer(feature, layer) {
        layer.bindTooltip('CWC : ' + feature.properties['Name'], {
            className: 'basintooltip',
            closeButton: false,
            sticky: true,
            //direction: 'bottom',
            //permanent: true,
            //noHide: true,
            offset: L.point(0, -20)
        });
    }

    function loadBasin(e) {

        document.getElementById('divalert').style.display = 'none';

        if (basincode == e.target.feature.properties.Code) return;

        if (loadingLayers == true) {
            showmessage('Wait basin is loading');
            return;
        }
        //document.getElementById('loader').style.display = 'block';
        $("#loader").show();

        basincode = e.target.feature.properties.Code;
        var Basin_Name = e.target.feature.properties.Basin_Name;
        //***************** loading layers ******************************
        var rchurl = 'json/reach/' + basincode + '.json';
        var suburl = 'json/watershed/' + basincode + '.json';
        var cwcurl = 'json/CWC_basin/' + basincode + '.json';

        if (fileExist(rchurl) !== 200) {
            showmessage(Basin_Name + ' Reach Json file missing')
            return;
        }
        if (fileExist(suburl) !== 200) {
            showmessage(Basin_Name + ' Watershed Json file missing')
            return;
        }
        if (fileExist(cwcurl) !== 200) {
            showmessage(Basin_Name + ' CWC Basin Json file missing')
            return;
        }

        //console.log('Map Loading : ' + Date())
        loadingLayers = true;
        map.spin(true);

        if (isPlay == true) {
            playwatershed();
        }

        removelayer();

        //showLabel(e);
        /*
         M {lat: 21.41869998144353, lng: 83.58814295351496}
         */

        //console.log(e.target.getBounds().getCenter());

        // remove all the markers in one go
        layerGroup.clearLayers();

        L.marker(e.target.getBounds().getCenter(), {
            icon: L.divIcon({
                className: 'label',
                html: e.target.feature.properties.Basin_Name,
                iconSize: [100, 25]
            })
        }).addTo(layerGroup);

        //var layer = e.target;
        //layer.setStyle({
        //    weight: 3,
        //    color: 'cyan',
        //    dashArray: '',
        //    fillOpacity: .8
        //})
        var cwcload = false, subload = false, rchload = false;
        cwcgeojson = null; subgeojson = null; rchgeojson = null;
        $.getJSON(cwcurl, function (data) {
            var objname = Object.keys(data.objects)[0];
            cwcTopoJson = topojson.feature(data, data.objects[objname])
            cwcgeojson = L.geoJson(cwcTopoJson, {
                style: {
                    color: "darkgray",
                    //dashArray: "20,25",
                    //fillOpacity: 0,
                    weight: 1
                }
                , onEachFeature: onEachCWCbasinLayer
            }).bindPopup(chart_new).addTo(map);
            //.addTo(map)
            //cwcgeojson.on('mousemove', function (e) {
            //    if (e.value !== null && e.layer.feature.properties.value !== undefined) {
            //        let v = e.target.feature.properties.value.toFixed(1);
            //        let html = (`<span class="popupText">Rainfall ${v} mm</span>`);
            //        let popup = L.popup()
            //            .setLatLng(e.latlng)
            //            .setContent(html)
            //            .openOn(map);
            //    }
            //});
            cwcload = true;
        });

        function subpopup(d) {
            var feature = d.feature;
            var code = feature.properties.Subbasin;
            var value = feature.properties.value;
            if (curlayer == 'sub') {
                return '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Value : ' + Number(value).toFixed(1) + ' mm</span>';
            } else if (curlayer == 'rch') {
                return '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(value).toFixed(1) + ' cumec</span>';
            } else if (curlayer == 'cwc') {
            }
        }

        $.getJSON(suburl, function (data) {
            var objname = Object.keys(data.objects)[0];
            subTopoJson = topojson.feature(data, data.objects[objname])
            subgeojson = L.geoJson(subTopoJson, {
                style: {
                    color: "darkgray",
                    //dashArray: "20,25",
                    fillColor: "red",
                    fillOpacity: 0.001,
                    weight: 1
                }
                //, onEachFeature: onEachSubbasinLayer
            }).bindPopup(chart_subbasin)
                //.bindPopup(subpopup, customOptions)
                .addTo(map);
            //.bindPopup(chart);

            /*
            {
                closeButton: false,
                autoClose: true,
                className: "info" // classname for the popup acting like a splash screen
            }
            */

            //subgeojson.on('mousemove', function (e) {
            //    if (e.value !== null && e.layer.feature.properties.value !== undefined) {
            //        let v = e.layer.feature.properties.value.toFixed(1);
            //        let html = (`<span class="popupText">Subbasin : ${e.layer.feature.properties.Subbasin} Rainfall ${v} mm</span>`);
            //        let popup = L.popup({
            //            closeButton: false,
            //            autoClose: true,
            //            className: "another-popup"
            //        })
            //            .setLatLng(e.latlng)
            //            .setContent(html)
            //            .openOn(map);
            //    }
            //});
            subload = true;
        });

        $.getJSON(rchurl, function (data) {
            var objname = Object.keys(data.objects)[0];
            rchTopoJson = topojson.feature(data, data.objects[objname])

            rchgeojson = L.geoJson(rchTopoJson, {
                style: {
                    color: "blue",
                    //dashArray: "20,25",
                    //fillOpacity: 0,
                    weight: 1
                }
                //, onEachFeature: onEachSubbasinLayer
            }).bindPopup(chart_subbasin)
                //.bindPopup(subpopup, customOptions)
                .addTo(map);
            //.addTo(map);
            //.bindPopup(chartKRI);
            //rchgeojson.on('mousemove', function (e) {
            //    if (e.value !== null && e.layer.feature.properties.value !== undefined) {
            //        let v = e.target.feature.properties.value.toFixed(1);
            //        let html = (`<span class="popupText">Rainfall ${v} mm</span>`);
            //        let popup = L.popup()
            //            .setLatLng(e.latlng)
            //            .setContent(html)
            //            .openOn(map);
            //    }
            //});
            rchload = true;
        });
        //***************** End loading layers ******************************

        loaddata();

        var mapSpin = setInterval(
            function () {
                if (map.hasLayer(subgeojson) && map.hasLayer(rchgeojson) && map.hasLayer(cwcgeojson)) {
                    //console.log('Map Loaded : ' + Date())
                    loadingLayers = false;
                    map.fitBounds(e.target.getBounds());
                    setHighlight(e.target);

                    //document.getElementById('loader').style.display = 'block';
                    $("#loader").hide();

                    map.spin(false);
                    clearInterval(mapSpin);
                }
                ////if (cwcgeojson != null && subgeojson != null && rchgeojson != null) {
                //if (cwcload === true && subload === true && rchload === true) {
                //    map.spin(false);
                //    clearInterval(mapSpin);
                //}
                //}
            }, 1000);

        //if (loaddata() == false)
        //    removelayer();

        //basingeojson = L.geoJson(basinlayer).addTo(coolPlaces);
        //        function highlightFeature(e) {
        //var layer = e.target;
        //layer.setStyle({
        //    weight: 3,
        //    color: 'cyan',
        //    dashArray: '',
        //    fillOpacity: .8
        //})
        ////if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        ////    layer.bringToFront();
        ////}
        //info.update(layer.feature.properties);
    }

    //function resetHighlight(e) {

    //    var layer = e.target;
    //    layer.setStyle(style(e.target.feature));
    //                ////geojson.resetStyle(e.target);
    //    //if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    //    //    layer.bringToBack();
    //    //}

    //    info.update();
    //}

    //function zoomToFeature(e) {
    //    document.getElementById('divalert').style.display = 'none';
    //    map.fitBounds(e.target.getBounds());
    //    //var layer = e.target;

    //    //let v = layer.feature.properties.value;

    //    //let html = `<span class="popupText">Rainfall ${v} mm</span>`;

    //    //let popup = L.popup()
    //    //    .setLatLng(e.latlng)
    //    //    .setContent(html)
    //    //    .openOn(map);

    //}

    //function onEachSubbasinLayer(feature, layer) {
    //    layer.on({
    //        mouseover: highlightFeature,
    //        mouseout: resetHighlight,
    //        click: zoomToFeature
    //    })
    //}

    //// Monday recycling information
    //d3.csv("../datasets/time-series-data/RecyclingMonday.csv", function (d) {
    //    var dataLength = d.length;
    //    var latList = [];
    //    var lonList = [];
    //    var day = d[0].day;
    //    // iterate over all data points
    //    for (var i = 0; i < d.length; i++) {
    //        latList.push(Number(d[i].lat));
    //        lonList.push(Number(d[i].lon));
    //    }
    //    // add all arrays to a single array to be passed through getter
    //    mondayRecyclingArray.push(dataLength);
    //    mondayRecyclingArray.push(latList);
    //    mondayRecyclingArray.push(lonList);
    //    mondayRecyclingArray.push(day);
    //});
    //***************** end loading datas ******************************
    //map.fitBounds(e.target.getBounds());

    //function displayName(e) {
    //    var layer = e.target;
    //    layer.bindTooltip(layer.feature.properties['name']);

    //    //var popup = L.popup()
    //    //    .setLatLng(e.latlng)
    //    //    .setContent('Popup')
    //    //    .openOn(map);
    //}
    //function showLabel(e) {
    //    var layer = e.target;
    //    layer.showLabel();

    //    //z = map.getZoom();
    //    //if (z > 6) {
    //    //    layer.bindLabel("HIYA", { noHide: true, className: 'my-css-styled-labels' });
    //    //}
    //}

    function onEachBasinLayer(feature, layer) {

        //layer.bindTooltip(feature.properties['Basin_Name'],
        //    { permanent: true, direction: "center" }
        //).openTooltip()

        layer.bindTooltip(feature.properties['Basin_Name'], {
            className: 'basintooltip',
            closeButton: false,
            sticky: true,
            //direction: 'bottom',
            //permanent: true,
            //noHide: true,
            offset: L.point(0, -20)
        });

        //layer.bindLabel(feature.properties.Basin_Name);

        //var label = new L.Label();
        //label.setContent(feature.properties['Basin_Name']);
        //label.setLatLng(center);
        //map.showLabel(label);
        //layer.bindTooltip(
        //    feature.properties['Basin_Name'],
        //    {
        //        permanent: true,
        //        direction: 'center',
        //        className: 'countryLabel'
        //    }
        //);

        //************************************************
        //var popup = L.popup();
        //popup.setContent('text');
        //layer.bindPopup(popup);

        //layer.on('mouseover', function (e) {
        //    var popup = e.target.getPopup();
        //    popup.setLatLng(e.latlng).openOn(map);
        //});

        //layer.on('mouseout', function (e) {
        //    e.target.closePopup();
        //});

        //layer.on('mousemove', function (e) {
        //    e.target.closePopup();
        //    var popup = e.target.getPopup();
        //    popup.setLatLng(e.latlng).openOn(map);
        //});
        //************************************************

        layer.on({
            //mouseover: displayName,
            click: loadBasin
        })
    }
});

function descripttable(data, columns, tableObj, tableheader) {
    //var table = d3.create('div').append('table').attr("width", "100%")
    //tableObj.append('table').attr("width", "100%")
    var tbody = tableObj.append('tbody');

    if (tableheader === true) {
        var thead = tableObj.append('thead')
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')//.style("background-color", "#804000")
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
            if (d.column === '%Wshed Area' || d.column === 'Area [ha]') // || d.column === 'Inflow' || d.column === 'Rainfall')
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
    div.innerHTML += '<h3 id="imdmodel">IMD NWP Rainfall</h3>';
    div.innerHTML += '<div title="Select forecast model" ><input type="radio" class="modelRadio" name="model" value="gfs" checked ><label class="lblmdl">IMD-GFS</label>&nbsp;<input type="radio" class="modelRadio" name="model" value="wrf"><label class="lblmdl">IMD-WRF</label></div>';
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

//document.addEventListener('DOMContentLoaded', function () {
//    document.getElementById('play').addEventListener('click', function () {
//        alert('hiii');
//        playwatershed();
//    }, false);
//}, false);

function playwatershed() {

    document.getElementById('divalert').style.display = 'none';

    if (curfield === undefined || curfield == null) {
        showmessage('Select variable');
        return;
    }

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
    //alert('test message');
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

                addlayer(curlayer, curfield);

            }
        }, 3000);
}
//var playbutton = L.control({ position: 'topleft' });
//playbutton.onAdd = function (map) {
//    this._div = L.DomUtil.create('div');
//    //this._div.innerHTML = '<input id="play" type="button" value="Play" />';
//    this._div.innerHTML = '<a href="#" id="play" class="myButton">Play</a>';
//    L.DomEvent.addListener(this._div, 'click', function (event) {
//        //        if (curlayer !== 'sub') return;

//        if (isPlay == true) {
//            //document.getElementById('play').value = 'Play';
//            document.getElementById('play').innerHTML = 'Play';
//            isPlay = false;
//        } else {
//            isPlay = true;
//            //document.getElementById('play').value = 'Stop';
//            document.getElementById('play').innerHTML = 'Stop';
//        }
//        //alert('test message');
//        var nodays = 8
//        if (modelname == 'wrf')
//            nodays = 5

//        var myVar = setInterval(
//            function () {
//                if (isPlay == false) {
//                    clearInterval(myVar);
//                } else {

//                    day++;
//                    if (day >= nodays) day = 0;

//
//                    $("[name=days]").removeAttr("checked");
//                    var presetValue = day;
//                    $("[name=days]").filter("[value='" + presetValue + "']").prop("checked", true);

//                    addlayer(curlayer, curfield);

//                }
//            }, 3000);

//        //for (var d = 0; d < nodays; d++) {
//        //    if (isPlay == false) break;
//        //    addlayer(curlayer, curfield);
//        //}
//    }, this);
//    return this._div;
//};
//playbutton.addTo(map);

//add zoom control with your options
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
//

var osmVisible = L.control({ position: 'topright' });
osmVisible.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info');
    div.innerHTML = '<input type="checkbox" value="1" name="osmEnable" onclick="osmenable(this)" checked /> OSM <br />';
    return div;
};
osmVisible.addTo(map);

//var info = L.control({ position: 'topright' });
//info.onAdd = function (map) {
//    this._div = L.DomUtil.create('div', 'info ffdate');
//    this.update();
//    return this._div;
//}

//info.update = function (props) {
//    if (typeof (props) !== 'undefined') {
//        //        //        //        this._div.innerHTML = "<h4>Subbasin No : " + (props.Subbasin ? props.Subbasin : "") + "</h4> <div style='text-align:center;'> " + (props.value ? Number(props.value).toFixed(1) : "") + "</div>"
//    } else
//        this._div.innerHTML = "<h4>Subbasin No : </h4>";
//}
//info.addTo(map);

//L.DomEvent.addListener(container, 'mouseover', this._expand, this);
//L.DomEvent.addListener(container, 'mouseout', this._collapse, this);
//L.DomEvent.addListener(container, 'click', this._expand, this);
//L.DomEvent.addListener(xclose, 'click', this._collapse, this); //doesn't work
//L.DomEvent.addListener(xclose, 'dblclick', this._collapse, this); //works
//L.DomEvent.addListener(xclose, 'mouseout', this._collapse, this); //works
//L.DomEvent.addListener(xclose, 'mouseover', this._collapse, this); //works

function checkopacity(obj) {
    //var value = $(this).val();
    var value = obj.value;
    if (obj.checked == true)
        wsopacity = Number(value);
    else
        wsopacity = 0.5;


    addlayer(curlayer, curfield);
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
                grades = subcolor.domain(); //[1, 5, 10, 15, 30, 45, 60],

            labels = ['<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Subbasin Value (mm/day) </strong><br /><br />'];
            div.innerHTML = labels;

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + subclr[i + 1] + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                //labels.push(
                //    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                //    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br />' : '+'));
            }
        } else {
            div.innerHTML = '<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Stream Flow (cms) </strong><br /><br />';
            var dmn = rchcolor.domain();
            var clr = rchcolor.range();

            for (var i = 0; i < dmn.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + clr[i + 1] + '"></i> ' +
                    dmn[i] + (dmn[i + 1] ? '&ndash;' + dmn[i + 1] + '<br>' : '+');
            }
        }
        div.id = "info legend"
        return div;
    };
    legend.addTo(map);
    document.getElementById("info legend").style.display = "none";
}

function showDisclaimer() {
    //try {
    if (document.getElementById("info legend")) {
        document.getElementById("info legend").style.display = "block";
    }

    //} catch{ }

    //var div = document.getElementById("info legend").style.height = "auto";
    //div.innerHTML = "<h6>DISCLAIMER:<br>text</h3><table></table>";
}

function hideDisclaimer() {
    //try {
    if (document.getElementById("info legend")) {
        document.getElementById("info legend").style.display = "none";
    }
    //} catch{ }

    //var div = document.getElementById("info legend").style.height = "15px";
    //div.innerHTML = "<h2>DISCLAIMER</h2>";
}
var showlegend = L.control({ position: 'bottomright' });
showlegend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info');
    div.innerHTML = "<span style='font-weight:bold;'>+/- Legend</span>";
    div.setAttribute("onmouseenter", "showDisclaimer()");
    div.setAttribute("onmouseleave", "hideDisclaimer()");


    return div;
};
showlegend.addTo(map)

function loaddata() {
    subdata = []; cwcdata = []; rchdata = []; daylst = [];
    //***************** loading datas ******************************
    var errdata = false;
    if (fileExist('./data/' + basincode + '_' + modelname + 'subwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_' + modelname + 'subwebsite.txt', function (txt) {

            var subqueue = d3.queue();
            //subqueue.defer(d3.csv, "./data/" + modelname + "/" + lines[line]);
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    //subflst.push(lines[line])

                    var dtstr = lines[line].split("_")[3].substring(0, 8);
                    daylst.push(dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8));

                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        subqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
                        console.log('File missing : ' + flname);
                        break;
                    }
                }
            }
            if (errdata === false) {
                subqueue.awaitAll(function (error, results) {
                    if (error) throw error;
                    subdata = results;
                });
            } else {
                //showmessage(modelname + ' Watershed data file does not exist');
                showmessage(modelname + ' No SWAT runs');
                return;
            }

            if (daylst.length > 2)
                document.getElementById('rundate').innerHTML = "Stimulation used " + modelname.toUpperCase() + ' on ' + formatDate(daylst[1]);
            else
                document.getElementById('rundate').innerHTML = 'No forecast today';

        });


    } else {
        //showmessage(modelname + 'subwebsite.txt file does not exist');
        showmessage(modelname + ' No SWAT runs');
        return;
    }


    errdata = false;
    if (fileExist('./data/' + basincode + '_' + modelname + 'rchwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_' + modelname + 'rchwebsite.txt', function (txt) {
            var rchqueue = d3.queue();
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    //rchflst.push(lines[line]);
                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        rchqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
                        //console.log('File missing : ' + flname);
                        break;
                    }
                }
            }
            if (errdata === false) {
                rchqueue.awaitAll(function (error, results) {
                    if (error) throw error;
                    rchdata = results;
                });
            } else {
                //showmessage(modelname + ' Stream flow data file does not exist');
                showmessage(modelname + ' No SWAT runs');
                return;
            }
        });
    } else {
        //showmessage(modelname + 'rchwebsite.txt file does not exist');
        showmessage(modelname + ' No SWAT runs');
        return;
    }

    errdata = false;
    if (fileExist('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_' + modelname + 'cwcwebsite.txt', function (txt) {
            var cwcqueue = d3.queue();
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    //cwcflst.push(lines[line]);
                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        cwcqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
                        //console.log('File missing : ' + flname);
                        break;
                        //cwcqueue.defer(d3.csv, "./data/" + modelname + "/" + lines[line]);
                    }
                }
            }
            if (errdata === false) {
                cwcqueue.awaitAll(function (error, results) {
                    if (error) throw error;
                    cwcdata = results;
                    var dateParse = d3.timeParse("%m/%d/%Y");
                    var dateFormat = d3.timeFormat("%d-%b-%Y");
                    var parseTime = d3.timeParse("%d-%b-%y");
                    cwcdata[0].forEach(function (d) {
                        d.Date = dateFormat(dateParse(d.Date));
                        d.Rainfall = +d.Rainfall;
                        d.Inflow = +d.Inflow;
                    });
                });
            } else {
                //showmessage(modelname + ' CWC data file does not exist');
                showmessage(modelname + ' No SWAT runs');
                return;
            }
        });
    } else {
        //showmessage(modelname + 'cwcwebsite.txt file does not exist');
        showmessage(modelname + ' No SWAT runs');
        return;
    }

    //MND_IMD-GFS_PCP_chart.csv
    if (fileExist('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv') === 200) {
        d3.csv('./data/' + modelname + '/' + basincode + '_IMD-' + modelname + '_PCP_chart.csv', function (error, data) {
            //console.log(data)
            pcpchartdata = data.slice(0);
            //console.log(pcpchartdata)
            var dateParse = d3.timeParse("%m/%d/%Y");
            var dateFormat = d3.timeFormat("%d-%b-%Y");
            var parseTime = d3.timeParse("%d-%b-%y");
            pcpchartdata.forEach(function (d) {
                d.Date = dateFormat(dateParse(d.Date));
                d.Rainfall = +d.Rainfall;
                d.Inflow = +d.Inflow;
            });
            //console.log(pcpchartdata)
        });
    }
}

//function chart(d) {
//    if (isPlay == true) return;
//    var feature = d.feature;
//    var code = feature.properties.SUBBASIN;

//    var data = cwcdata[0].filter(function (dv) {
//        return dv.Subbasin == code;
//    });

//    if (data.length < 1 || data == null || data == undefined) return '<h3>No data</h3>';

//    //var dateFormat = d3.timeFormat("%d-%b-%y");

//    //data.forEach(function (d) {
//    //    console.log(d.Date);
//    //    d.Date = dateFormat(dateParse(d.Date));
//    //    d.Rainfall = +d.Rainfall;
//    //    d.Inflow = +d.Inflow;
//    //});

//    //******************************* Vertical Chart ************************
//    var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

//    var margin = { left: 50, right: 50, top: 30, bottom: 50 },
//        width = 380 - margin.left - margin.right,
//        height = 250 - margin.top - margin.bottom;

//    var divchart = d3.create("div")
//        .style("width", width + margin.left + margin.right)
//        .style("height", height + margin.top + margin.bottom)

//    var xBar = d3.scaleBand().range([0, width]).paddingInner(0.5).paddingOuter(0.25);
//    var xLine = d3.scalePoint().range([0, width]).padding(0.5);
//    var yBar = d3.scaleLinear().range([0, height]);
//    var yLine = d3.scaleLinear().range([height, 0]);

//    var valueline = d3.line()
//        .x(function (d) {
//            return xLine(d.Date);
//        })
//        .y(function (d) {
//            return yLine(d.Inflow);
//        });

//    ////====================== chart ========================

//    var svg = divchart.append("svg")
//        .attr("width", width + margin.left + margin.right)
//        .attr("height", height + margin.top + margin.bottom)
//        .append("g")
//        .attr("transform",
//            "translate(" + margin.left + "," + margin.top + ")");


//    // Scale the range of the data
//    xBar.domain(data.map(function (d) { return d.Date; }));
//    xLine.domain(data.map(function (d) { return d.Date; }));
//    yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), d3.max(data, function (d) { return d.Rainfall; })]).nice();
//    yLine.domain([d3.min(data, function (d) { return d.Inflow; }), d3.max(data, function (d) { return d.Inflow; })]).nice();


//    //********************* gridlines ******************
//    // gridlines in x axis function
//    function make_x_gridlines() {
//        return d3.axisBottom(xBar)
//            .ticks(7)
//    }

//    // gridlines in y axis function
//    function make_y_gridlines() {
//        return d3.axisLeft(yBar)
//            .ticks(5)
//    }

//    // add the X gridlines
//    svg.append("g")
//        .attr("class", "grid")
//        .attr("transform", "translate(0," + height + ")")
//        .call(make_x_gridlines()
//            .tickSize(-height)
//            .tickFormat("")
//        )

//    // add the Y gridlines
//    svg.append("g")
//        .attr("class", "grid")
//        .call(make_y_gridlines()
//            .tickSize(-width)
//            .tickFormat("")
//        )

//    //***************************************
//    var rect = svg.selectAll("rect")
//        .data(data)

//    rect.enter().append("rect")
//        .merge(rect)
//        .attr("class", "bar")
//        .style("stroke", "none")
//        .style("fill", function (d, i) {
//            if (i <= 1)
//                return "orange";
//            return "steelblue";
//        })
//        .attr("x", function (d) { return xBar(d.Date); })
//        .attr("width", function (d) { return xBar.bandwidth(); })
//        .attr("height", function (d) {


//            return yBar(d.Rainfall);
//        })

//        .on("mouseover", function (d, i) {
//            divtooltip.style("left", d3.event.pageX + "px");
//            divtooltip.style("top", d3.event.pageY - 40 + "px");
//            divtooltip.style("display", "inline-block");

//            if (i <= 1) {
//                divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
//            } else {
//                divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
//            }
//        })
//        .on("mousemove", function (d, i) {

//            divtooltip.style("left", d3.event.pageX + "px");
//            divtooltip.style("top", d3.event.pageY - 40 + "px");

//            divtooltip.style("display", "inline-block");
//            if (i <= 1) {
//                divtooltip.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
//            } else {
//                divtooltip.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
//            }
//        })
//        .on("mouseout", function (d) {
//            divtooltip.style("display", "none");
//        });

//    // Add the valueline path.
//    svg.append("path")
//        //.data(data)
//        .attr("class", "line")
//        .style("stroke", "red")
//        .attr("d", valueline(data));

//    var points1 = svg.selectAll("circle.point1").data(data)
//    points1.enter().append("circle")
//        .merge(points1)
//        .attr("class", "point1")
//        .style("stroke", "red")
//        .style("fill", "white")
//        .style("stroke-width", 2)
//        .attr("cx", function (d) {
//            return xLine(d.Date);
//        })
//        .attr("cy", function (d) {
//            return yLine(d.Inflow);
//        })
//        .attr("r", function (d) { return 3; })
//        .on("mouseover", function (d) {
//            //divtooltip.style("left", d3.event.offsetX + 20 + "px");
//            //divtooltip.style("top", d3.event.offsetY - 5 + "px");

//            divtooltip.style("left", d3.event.pageX + "px");
//            divtooltip.style("top", d3.event.pageY - 40 + "px");

//            divtooltip.style("display", "inline-block");
//            divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
//        })
//        .on("mousemove", function (d) {
//            divtooltip.style("left", d3.event.pageX + "px");
//            divtooltip.style("top", d3.event.pageY - 40 + "px");

//            divtooltip.style("display", "inline-block");
//            divtooltip.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
//        })
//        .on("mouseout", function (d) {
//            divtooltip.style("display", "none");
//        });

//    svg.append("g")
//        .attr("transform", "translate(0,0)")
//        .call(d3.axisTop(xLine))
//        .selectAll("text")
//        .remove()
//        ;

//    // Add the X Axis
//    svg.append("g")
//        .attr("transform", "translate(0," + height + ")")
//        .call(d3.axisBottom(xLine)) //.tickSize(-height)
//        .selectAll("text")
//        .attr("x", "-25")
//        .attr("y", "5")
//        .attr("transform", "rotate(-30)")
//        .style("font-family", "sans-serif")
//        .style("font-size", "9px");

//    // Add the Y0 Axis
//    svg.append("g")
//        .attr("class", "axisSteelBlue")
//        .call(d3.axisLeft(yBar));

//    // Add the Y1 Axis
//    svg.append("g")
//        .attr("class", "axisRed")
//        .attr("transform", "translate( " + width + ", 0 )")
//        .call(d3.axisRight(yLine));//.tickSize(-width)

//    svg.append("text")
//        .attr("class", "y axis")
//        .attr("text-anchor", "middle")
//        .attr("x", -80)
//        .attr("y", -35)
//        .attr("style", "font-size:8pt;fill:steelblue;")
//        //.attr("dy", ".75em")
//        .attr("transform", "rotate(-90)")
//        .text('Rainfall (mm)');

//    svg.append("text")
//        .attr("class", "y axis")
//        .attr("text-anchor", "middle")
//        .attr("x", -65)
//        .attr("y", width + margin.left)
//        .attr("style", "font-size:8pt;fill:red;")
//        .attr("transform", "rotate(-90)")
//        .text('Discharge (cumec)');

//    //var charttable = d3.select('#divtable').append('table').attr("width", "100%")
//    //descripttable(data, ['Date', 'Inflow', 'Rainfall'], charttable, true);
//    //});

//    return divchart.node();

//}
function tabulate(data, columns) {
    //tabulate(data, ['Date', 'Inflow', 'Rainfall']);

    var table = d3.create('div').append('table').attr("width", "100%")
    var thead = table.append('thead')
    var tbody = table.append('tbody');

    // append the header row
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

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    // create a cell in each row for each column
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

    var data = cwcdata[0].filter(function (dv) {
        return dv.Subbasin == code;
    });

    if (data.length < 1 || data == null || data == undefined) return '<h3>No data</h3>';

    //var dateFormat = d3.timeFormat("%d-%b-%y");

    //data.forEach(function (d) {
    //    console.log(d.Date);
    //    d.Date = dateFormat(dateParse(d.Date));
    //    d.Rainfall = +d.Rainfall;
    //    d.Inflow = +d.Inflow;
    //});

    //d3.select("#breadcrumb").data([1, 2]).enter().append('span')

    //    d3.select('#parent')
    //        .selectAll('div')
    //        .data(data)
    //        .enter()
    //        .append('div')
    //        .html(function (d) { return "<p>" + from data[0] + "<p>" etc..... ;
    //});

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
        //.style("style", "overflow-y:scroll;")
        .attr("id", function (d, i) {
            return "content" + i;
        })
    //.append('b')
    //.text(function (d, i) {
    //    return "Tab " + i + " content";
    //})

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



    //'<ul class="tabs-link">' +
    //    '<li class="tab-link"> <a href="#tab-1"><span>Chart</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-2"><span>Table</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-3"><span>Description</span></a></li>' +
    //    //'<li class="tab-link" style="float:right;"> <a href="#"><span>' + basename +'</span></a></li>' +
    //    '</ul>' +

    //console.log(newobj);
    //return newobj.node();

    //******************************* Vertical Chart ************************
    var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

    var margin = { left: 50, right: 50, top: 30, bottom: 50 },
        width = 375 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    //var divchart = d3.create("div")
    //    .style("width", width + margin.left + margin.right)
    //    .style("height", height + margin.top + margin.bottom)

    var divchart = newobj.select("#content0")
        .style("width", width + margin.left + margin.right)
        .style("height", height + margin.top + margin.bottom)
    ////console.log(divchart);

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
        //.data(data)
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
            //divtooltip.style("left", d3.event.offsetX + 20 + "px");
            //divtooltip.style("top", d3.event.offsetY - 5 + "px");

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

    //var charttable = d3.select('#divtable').append('table').attr("width", "100%")
    //descripttable(data, ['Date', 'Inflow', 'Rainfall'], charttable, true);
    //});

    //var tablecontent = tabulate(data, ['Date', 'Inflow', 'Rainfall']);
    var tbdatobj = newobj.select("#content1").append('table').attr("width", "100%")
    var tablecontent = descripttable(data, ['Date', 'Inflow', 'Rainfall'], tbdatobj, true);

    var tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
    var desctable = descripttable(dscrdata, ['Code', basincode], tbdescobj, false);

    var dscrdatavalue = FFdscrdata.filter(function (dv) {
        return dv.Basin == basincode;
    });
    tbdescobj = newobj.select("#content2").append('table').attr("width", "100%")
    var FFdesctable = descripttable(dscrdatavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], tbdescobj, true);

    //var content = '<div class="tabs">' +
    //    '<div class="tab" id="tab-1">' +
    //    '<div class="content">' +
    //    divchart.node().outerHTML +
    //    //'<b>Tab 1 content</b>' +
    //    '</div>' +
    //    '</div>' +

    //    '<div class="tab" id="tab-2">' +
    //    '<div class="content">' +
    //    tablecontent.node().outerHTML +
    //    //'<b>Tab 2 content</b>' +
    //    '</div>' +
    //    '</div>' +

    //    '<div class="tab" id="tab-3">' +
    //    '<div class="content" style="overflow-y:scroll;">' +
    //    desctable.node().outerHTML +
    //    //'<b>Tab 3 content</b>' +
    //    FFdesctable.node().outerHTML +
    //    '</div>' +
    //    '</div>' +

    //    '<ul class="tabs-link">' +
    //    '<li class="tab-link"> <a href="#tab-1"><span>Chart</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-2"><span>Table</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-3"><span>Description</span></a></li>' +
    //    //'<li class="tab-link" style="float:right;"> <a href="#"><span>' + basename +'</span></a></li>' +
    //    '</ul>' +
    //    '<div id="lableheader"><span>' + basename + '</span></div>' +
    //    '</div>';

    //var template = document.createElement('template');
    //template.innerHTML = content;
    //console.log(template);
    //console.log(template.content);

    //return template.content;
    ////return template.content.childNodes;

    ////console.log(newobj.node())
    ////console.log(newobj.node().outerHTML);
    ////console.log(divchart.node());
    return newobj.node();
    ////return content;
    ////return divchart.node();

}

function chart_subbasin(d) {
    if (isPlay == true) return;
    if (curfield !== 'PRECIPmm' && curfield !== 'FLOW_OUTcms') return;

    var feature = d.feature;
    var code = feature.properties.Subbasin;
    var basename = feature.properties.name;

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
        //.style("style", "overflow-y:scroll;")
        .attr("id", function (d, i) {
            return "content" + i;
        })
    //.append('b')
    //.text(function (d, i) {
    //    return "Tab " + i + " content";
    //})
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



    //'<ul class="tabs-link">' +
    //    '<li class="tab-link"> <a href="#tab-1"><span>Chart</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-2"><span>Table</span></a></li>' +
    //    '<li class="tab-link"> <a href="#tab-3"><span>Description</span></a></li>' +
    //    //'<li class="tab-link" style="float:right;"> <a href="#"><span>' + basename +'</span></a></li>' +
    //    '</ul>' +

    //console.log(newobj);
    //return newobj.node();

    //******************************* Vertical Chart ************************
    var divtooltip = d3.select("#divtool").attr("class", "tbtoolTip");

    var margin = { left: 50, right: 50, top: 30, bottom: 50 },
        width = 375 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    //var divchart = d3.create("div")
    //    .style("width", width + margin.left + margin.right)
    //    .style("height", height + margin.top + margin.bottom)

    var divchart = newobj.select("#content0")
        .style("width", width + margin.left + margin.right)
        .style("height", height + margin.top + margin.bottom)
    ////console.log(divchart);

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
        //.data(data)
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

function resetlayers() {

    if (basincode == undefined || basincode == null) return;
    if (loadingLayers == true) {
        showmessage('Wait basin is loading');
        return;
    }

    if (subgeojson != undefined) {
        subgeojson.eachLayer(function (layer) {
            layer.setStyle({
                //color: "darkgray",
                //dashArray: "20,25",
                fillColor: "#ccc",
                //fillOpacity: 0,
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
    //#p1 {background-color: rgba(255, 0, 0, 0.3);}  /* red with opacity */
    if (cwcgeojson != undefined) {
        cwcgeojson.eachLayer(function (layer) {
            layer.setStyle({
                color: "darkgray",
                weight: 1
            });
        });
    }

    if (map.hasLayer(legend))
        map.removeLayer(legend);

    loaddata();

    $("[name=days]").removeAttr("checked");
    day = 0;
    $("[name=days]").filter("[value='" + day + "']").prop("checked", true);

}

function removelayer() {
    if (basincode == undefined || basincode == null) return;

    if (map.hasLayer(subgeojson))
        map.removeLayer(subgeojson);
    if (map.hasLayer(rchgeojson))
        map.removeLayer(rchgeojson);
    if (map.hasLayer(cwcgeojson))
        map.removeLayer(cwcgeojson);

    if (map.hasLayer(legend))
        map.removeLayer(legend);

    subgeojson = null;
    rchgeojson = null;
    cwcgeojson = null;

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
        'color': 'red'
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

    //console.log(layer);

    highlight = null;
    layer.setStyle(highlightStyle.default);
}

//function unsetlayer(layer) {
//    if (layer == null) return;
//    layer.setStyle({
//        color: "#ccc",
//        fillColor: '#eee',
//        //fillOpacity: 0.12,
//        weight: 1
//    });
//}

function addlayer(prmlayer, fldname) {

    document.getElementById('divalert').style.display = 'none';
    if (loadingLayers == true) {
        showmessage('Wait basin is loading');
        return;
    }
    if (prmlayer === undefined || fldname === undefined || prmlayer == null || fldname == null) {
        showmessage('Select Variable')
        return;
    }

    if (basincode == undefined || basincode == null) {
        showmessage('Select basin')
        return;
    }

    //document.getElementById('loader').style.display = 'block';
    $("#loader").show();

    if (map.hasLayer(subgeojson))
        map.removeLayer(subgeojson);
    if (map.hasLayer(rchgeojson))
        map.removeLayer(rchgeojson);
    if (map.hasLayer(cwcgeojson))
        map.removeLayer(cwcgeojson);

    var dated = day <= 1 ? 'Observed Dated : ' : 'Forecast Dated : ';
    if (day < daylst.length) {
        document.getElementById('ffdate').innerHTML = dated + daylst[day];

        if (prmlayer == 'sub') {
            if (fldname == 'PRECIPmm') {
                map.addLayer(rchgeojson);
                rchgeojson.eachLayer(function (layer) {
                    layer.setStyle({
                        color: "blue",
                        fillColor: '#87CEEB',
                        //fillOpacity: 0.12,
                        weight: 2
                    });
                });
            }

            var datalst = subdata[day].map(function (d) { return d[fldname]; });
            //ar = [1, 2, 3, 4];
            //ar = ar.filter(item => !(item > 3));
            //console.log(ar)

            datalst = datalst.filter(item => (item > 0));
            console.log(datalst);

            //console.log(datalst);
            datalst.sort(function (a, b) {
                return d3.ascending(a, b)
            });
            //console.log(datalst);

            var min = d3.min(datalst, function (d) { return d; }).toFixed(1);
            var max = d3.max(datalst, function (d) { return d; }).toFixed(1);
            var lowestbreak = d3.quantile(datalst, .1).toFixed(1);
            var lowbreak = d3.quantile(datalst, .25).toFixed(1);
            var medval = d3.quantile(datalst, .5).toFixed(1);
            var higbreak = d3.quantile(datalst, .75).toFixed(1);
            var higestbreak = d3.quantile(datalst, .9).toFixed(1);

            //console.log(subcolor.domain());
            //subcolor.domain([Number(min).toFixed(1), lowestbreak.toFixed(1), lowbreak.toFixed(1), medval.toFixed(1), higbreak.toFixed(1), higestbreak.toFixed(1), Number(max).toFixed(1)]);
            subcolor.domain([Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)]);
            //console.log(subcolor.domain());

            map.addLayer(subgeojson);
            if (subdata != undefined && subdata.length > 0) {
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
                    if (datavalue.length != 0) {
                        gv = Number(datavalue[0][fldname]);
                        layer.feature.properties.name = 'sub';
                        layer.feature.properties.value = gv;
                        layer.setStyle({
                            color: "#ccc",
                            fillColor: subcolor(gv),
                            fillOpacity: wsopacity,
                            weight: 1
                        });

                        var code = layer.feature.properties.Subbasin;
                        //var value = feature.properties.value;
                        var msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Value : ' + Number(gv).toFixed(1) + ' mm</span>';

                        //if (curlayer == 'rch') {
                        //    msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(gv).toFixed(1) + ' cumec</span>';
                        //} else {
                        //    msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Value : ' + Number(gv).toFixed(1) + ' mm</span>';
                        //}


                        layer.bindTooltip(msg, {
                            className: 'basintooltip',
                            closeButton: false,
                            sticky: true,
                            //direction: 'bottom',
                            //permanent: true,
                            //noHide: true,
                            offset: L.point(0, -20)
                        });

                    } //else console.log("Error : " + fm.properties.Subbasin);



                    //check if a feature.properties exist
                    //if (feature.hasOwnProperty('rotation')) {
                    //    var rotate = feature.properties.rotation;
                    //} else {
                    //    var rotate = 0;
                    //}

                    //style = {
                    //    rotation: rotate
                    //};

                });
                //if (map.hasLayer(legend))
                //    map.removeLayer(legend);
                loadlegend('sub')

            } else {
                showmessage('Water Balance data not exists');
            }
        }
        else if (prmlayer == 'rch') {

            map.addLayer(subgeojson);
            subgeojson.eachLayer(function (layer) {

                layer.unbindTooltip();
                layer.setStyle({
                    color: "#ccc",
                    fillColor: '#eee',
                    //fillOpacity: 0.12,
                    weight: 1
                });
            });
            map.addLayer(rchgeojson);
            //var clrange = rchcolor.domain();
            //var datavalue = data.filter(function (dv) {
            //    return dv.Subbasin == d.properties.Subbasin;
            //});

            //if (datavalue.length != 0) {
            //    gv = Number(datavalue[0][fldname]);
            //    if (gv <= clrange[0])
            //        return 0.15;
            //    else if (gv <= clrange[1])
            //        return 0.35;
            //    else if (gv <= clrange[3])
            //        return 0.5;
            //    else if (gv <= clrange[5])
            //        return 0.75;
            //    else if (gv <= clrange[6])
            //        return 1;
            //    else
            //        return 1.25;

            //} else return null;


            if (rchdata != undefined && rchdata.length > 0) {
                var minmax = d3.extent(rchdata[day], function (data) {
                    return Number(data[fldname]);
                });
                var min = minmax[0], max = minmax[1];

                var brk = (max - min) / 9;
                rchcolor = d3.scaleThreshold()
                    .domain([Math.ceil((100 * (min + brk)) / 100),
                    Math.ceil((100 * (min + (brk * 2))) / 100),
                    Math.ceil((100 * (min + (brk * 3))) / 100),
                    Math.ceil((100 * (min + (brk * 4))) / 100),
                    Math.ceil((100 * (min + (brk * 5))) / 100),
                    Math.ceil((100 * (min + (brk * 6))) / 100),
                    Math.ceil((100 * (min + (brk * 7))) / 100)])
                    .range(["#8E8E8E", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

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

                        var weight;
                        if (gv <= clrange[0])
                            weight = 1;
                        else if (gv <= clrange[1])
                            weight = 1.5;
                        else if (gv <= clrange[3])
                            weight = 2.25;
                        else if (gv <= clrange[5])
                            weight = 3.5;
                        else if (gv <= clrange[6])
                            weight = 4;
                        else
                            weight = 5;

                        //if (gv > 500) { weight = 3; }
                        //else if (gv > 100) { weight = 2.5; }
                        //else if (gv > 50) { weight = 2; }
                        //else if (gv > 20) { weight = 1.5; }
                        //else if (gv > 10) { weight = 1; }
                        //else { weight = 0.5; }


                        layer.setStyle({
                            color: rchcolor(gv),
                            //fillColor: rchcolor(area),
                            weight: weight
                        });


                        var code = layer.feature.properties.Subbasin;
                        //var value = feature.properties.value;
                        var msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(gv).toFixed(1) + ' cumec</span>';;

                        //if (curlayer == 'rch') {
                        //    msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Discharge : ' + Number(gv).toFixed(1) + ' cumec</span>';
                        //} else {
                        //    msg = '<span class="TextMsg">Subbasin  : ' + code + ' <br /> Value : ' + Number(gv).toFixed(1) + ' mm</span>';
                        //}

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
            } else {
                showmessage('River Discharge data not exists');
            }
        }
        else if (prmlayer == 'cwc') {

            var datalst = [];
            map.addLayer(cwcgeojson);
            if (cwcdata != undefined && cwcdata.length > 0) {
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

                        //layer.setStyle({
                        //    color: "black",
                        //    weight: 1.2,
                        //    fillColor: subcolor(gv)
                        //});
                    } //else console.log("Error : " + layer.feature.properties.SUBBASIN);

                });
                //if (map.hasLayer(legend))
                //    map.removeLayer(legend);

                console.log(datalst);
                datalst.sort(function (a, b) {
                    return d3.ascending(a, b)
                });

                var min = d3.min(datalst, function (d) { return d; }).toFixed(1);
                var max = d3.max(datalst, function (d) { return d; }).toFixed(1);

                var lowestbreak = d3.quantile(datalst, .1).toFixed(1)
                var lowbreak = d3.quantile(datalst, .25).toFixed(1)
                var medval = d3.quantile(datalst, .5).toFixed(1)
                var higbreak = d3.quantile(datalst, .75).toFixed(1)
                var higestbreak = d3.quantile(datalst, .9).toFixed(1)

                //console.log(subcolor.domain());
                subcolor.domain([Number(min), Number(lowestbreak), Number(lowbreak), Number(medval), Number(higbreak), Number(higestbreak), Number(max)]);
                //console.log(subcolor.domain());

                cwcgeojson.eachLayer(function (layer) {

                    var datavalue = cwcdata[0].filter(function (dv) {
                        return dv.Subbasin == layer.feature.properties.SUBBASIN;
                    });

                    var gv = NaN;
                    if (datavalue.length != 0) {
                        gv = Number(datavalue[day][fldname]);
                        //layer.feature.properties.name = 'cwc';
                        //layer.feature.properties.value = gv;

                        layer.setStyle({
                            color: "black",
                            weight: 1.2,
                            fillColor: subcolor(gv),
                            fillOpacity: wsopacity
                        });
                    } //else console.log("Error : " + layer.feature.properties.SUBBASIN);

                });

                loadlegend('sub')
            } else {
                showmessage('Forecast-CWC Basins data not exists');
            }
        }

        curlayer = prmlayer;
        curfield = fldname;
    }
    else {
        document.getElementById('ffdate').innerHTML = 'No data available';
        //$(".loader").hide();
        //return;
    }
    $("#loader").hide();
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

    //if (isPlay == true) return;
    document.getElementById('divalert').style.display = 'none';

    if (isPlay == true) {
        isPlay = false;
        document.getElementById("imgplay").src = "./images/play.png";
    }

    day = 0;
    $("[name=days]").removeAttr("checked");
    $("[name=days]").filter("[value='" + day + "']").prop("checked", true);

    var thisValue = $(this).attr("value");
    modelname = thisValue;
    resetlayers();


    //if (modelname != thisValue) {
    //    modelname = thisValue;
    //    resetlayers();
    //}
    //else modelname = thisValue;

    //if (modelname == 'wrf')

    if (modelname == 'wrf') {
        $("div.d4").hide();
        $("div.d5").hide();
        $("div.d6").hide();
        nodays = 5
    } else {
        $("div.d4").show();
        $("div.d5").show();
        $("div.d6").show();
        nodays = 8
    }
});

$("input:radio[name=days]").click(function () {

    var value = $(this).val();
    day = Number(value);

    if (isPlay == true || day > nodays) return;
    if (loadingLayers == true) {
        showmessage('Wait basin is loading');
        return;
    }

    addlayer(curlayer, curfield);

});

//var lat, lng;
//map.addEventListener('mousemove', function (ev) {
//    lat = ev.latlng.lat;
//    lng = ev.latlng.lng;
//});

map.on('click', function (e) {

    map.spin(false);

    //var popLocation = e.latlng;
    //var popup = L.popup()
    //    .setLatLng(popLocation)
    //    .setContent('<p>Hello world!<br />This is a nice popup.</p>')
    //    .openOn(map);
});

//map.setView([-33, 147], 6);
//$("input:checkbox[name=opacity]").click(function () {
//    //var atLeastOneIsChecked = $('#checkArray:checkbox:checked').length > 0;
//    var opacityChecked = $('input[name="opacity"]:checked').length > 0;

//    var value = $(this).val();
//    if (opacityChecked == true)
//        wsopacity = Number(value);
//    else
//        wsopacity = 0.5;

//    addlayer(curlayer, curfield);

//});
//$(document).ready(function () {
//    $('input[type="checkbox"]').click(function () {
//        if ($(this).prop("checked") == true) {
//            alert("Checkbox is checked.");
//        }
//        else if ($(this).prop("checked") == false) {
//            alert("Checkbox is unchecked.");
//        }
//    });
//});

//var myVar = setInterval(
//    function () {
//        if (centroid.length > 0) {
//            clearInterval(myVar);
//        }
//    }, 1000);



//label = new L.Label()
//label.setContent("static label")
//label.setLatLng(polygon.getBounds().getCenter())
//map.showLabel(label);

////disable zoomControl when initializing map (which is topleft by default)
//var map = L.map("map", {
//    zoomControl: false
//    //... other options
//});

////add zoom control with your options
//L.control.zoom({
//    position: 'topright'
//}).addTo(map);

//document.getElementById("transitmap").addEventListener("contextmenu", function (event) {
//    // Prevent the browser's context menu from appearing
//    event.preventDefault();

//    // Add marker
//    // L.marker([lat, lng], ....).addTo(map);
//    alert(lat + ' - ' + lng);

//    return false; // To disable default popup.
//});

//L.Control.Custom = L.Control.extend({
//    options: {
//        position: 'bottomleft'
//    },
//    onAdd: function (map) {
//        // Add reference to map
//        map.customControl = this;
//        return L.DomUtil.create('div', 'my-custom-control');
//    },
//    onRemove: function (map) {
//        // Remove reference from map
//        delete map.customControl;
//    }
//});

//L.Map.include({
//    hasCustomControl: function () {
//        return (this.customControl) ? true : false;
//    }
//});

//var customControl = new L.Control.Custom();
//map.addControl(customControl);
//map.removeControl(customControl);
//console.log(map.hasCustomControl()); // returns false
