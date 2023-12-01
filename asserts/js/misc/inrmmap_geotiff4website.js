
var prmWeather = 'PCP', isPlay = false, day = 0, wsopacity = 0.5;
var gfsgeojson, wrfgeojson;
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var gfsflst = [], wrfflst = [];

gfsflst['PCP'] = [];
var flname = "./data/PCP_gfscwcwebsite.txt"
if (fileExist(flname) === 200) {
    readTextFile(flname, function (txt) {
        var lines = txt.split('\r\n');
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/gfs/forecast/" + lines[line]) === 200) { 
                    gfsflst['PCP'].push(lines[line]);
                }
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
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/gfs/forecast/" + lines[line]) === 200) {
                    gfsflst['TMAX'].push(lines[line]);
                }
            }
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
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/gfs/forecast/" + lines[line]) === 200) {
                    gfsflst['TMIN'].push(lines[line]);
                }
            }
        }
    });
} else {
    document.getElementById('loaderContainer').style.display = 'none';
    document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> TMIN GFS file does not exist';
    document.getElementById('divalert').style.display = 'inline';
}

wrfflst['PCP'] = [];
var flname = "./data/PCP_wrfcwcwebsite.txt"
if (fileExist(flname) === 200) {
    readTextFile(flname, function (txt) {
        var lines = txt.split('\r\n');
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/wrf/forecast/" + lines[line]) === 200) {
                    wrfflst['PCP'].push(lines[line]);
                }
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
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/wrf/forecast/" + lines[line]) === 200) {
                    wrfflst['TMAX'].push(lines[line]);
                }
            }
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
        for (var line = 0; line < lines.length; line++) {
            if (lines[line] !== '') {
                if (fileExist("./data/wrf/forecast/" + lines[line]) === 200) {
                    wrfflst['TMIN'].push(lines[line]);
                }
            }
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

mapgfs.createPane('labels');
mapgfs.getPane('labels').style.zIndex = 650;
mapgfs.getPane('labels').style.pointerEvents = 'none';

var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>, <a href="http://inrm.co.in">INRM</a>';
var gfsLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution,
    lang: 'en',
    pane: 'labels'
}).addTo(mapgfs);

var wrfOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
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

mapwrf.createPane('labels');
mapwrf.getPane('labels').style.zIndex = 650;
mapwrf.getPane('labels').style.pointerEvents = 'none';

var wrfLabels = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
    attribution: cartodbAttribution,
    pane: 'labels'
}).addTo(mapwrf);

let gfslayerGeo, wrflayerGeo;
function loadGFSTiff(flname) {
    if (mapgfs.hasLayer(gfslayerGeo))
        mapgfs.removeLayer(gfslayerGeo);

    mapgfs.spin(true);
    d3.request(flname).responseType('arraybuffer').get(
        function (error, tiffData) {
            let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);
            gfslayerGeo = L.canvasLayer.scalarField(geo, {
                color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range),
                opacity: 0.75
            }).addTo(mapgfs);

            gfslayerGeo.on('click', function (e) {
                if (e.value !== null) {
                    let v = Number(e.value).toFixed(1);
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

            if (mapgfs.hasLayer(gfsgeojson))
                mapgfs.removeLayer(gfsgeojson);

            mapgfs.addLayer(gfsgeojson);
            mapgfs.spin(false);
        });
}

function loadWRFTiff(flname) {
    if (mapwrf.hasLayer(wrflayerGeo))
        mapwrf.removeLayer(wrflayerGeo);

    mapwrf.spin(true);
    d3.request(flname).responseType('arraybuffer').get(
        function (error, tiffData) {
            let geo = L.ScalarField.fromGeoTIFF(tiffData.response, bandIndex = 0);
            wrflayerGeo = L.canvasLayer.scalarField(geo, {
                color: prmWeather === 'PCP' ? chroma.scale('Blues').domain(geo.range) : chroma.scale('YlOrRd').domain(geo.range),
                opacity: 0.75
            }).addTo(mapwrf);

            wrflayerGeo.on('click', function (e) {
                if (e.value !== null) {
                    let v = Number(e.value).toFixed(1);
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

            if (mapwrf.hasLayer(wrfgeojson))
                mapwrf.removeLayer(wrfgeojson);

            mapwrf.addLayer(wrfgeojson);
            mapwrf.spin(false);
        });
}

var indiaurl = "./json/AllBasin_WGS84_01.json"
if (fileExist(indiaurl) !== 200) {
    document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India Json file does not exist';
    document.getElementById('divalert').style.display = 'inline';
}

$.getJSON(indiaurl, function (data) {

    var objname = Object.keys(data.objects)[0];
    var gfsTopoJson = topojson.feature(data, data.objects[objname])
    var wrfTopoJson = topojson.feature(data, data.objects[objname])
    gfsgeojson = L.geoJson(gfsTopoJson, {
        style: {
            color: "#ccc",
            fillColor: "transparent",
            fillOpacity: 0,
            weight: 0.8
        }, onEachFeature: onEachBasinLayer
    }).addTo(mapgfs)
    mapgfs.fitBounds(gfsgeojson.getBounds())

    wrfgeojson = L.geoJson(wrfTopoJson, {
        style: {
            color: "#ccc",
            fillColor: "transparent",
            fillOpacity: 0,
            weight: 0.8
        }, onEachFeature: onEachBasinLayer
    }).addTo(mapwrf)
    mapwrf.fitBounds(wrfgeojson.getBounds())

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

var dayselect = L.control({ position: 'topleft' });
dayselect.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info divday');
    div.innerHTML = '<div class="d-" title="Observed Day 1"><input type="radio" name="days" value="0" checked="checked" />Day 1</div>';
    div.innerHTML += '<div class="d0" title="Observed Day 2"><input type="radio" name="days" value="1" />Day 2</div>';
    div.innerHTML += '<div class="d1" title="Forecast Day 1"><input type="radio" name="days" value="2" />Day 3</div>';
    div.innerHTML += '<div class="d2" title="Forecast Day 2"><input type="radio" name="days" value="3" />Day 4</div>';
    div.innerHTML += '<div class="d3" title="Forecast Day 3"><input type="radio" name="days" value="4" />Day 5</div>';
    div.innerHTML += '<div class="d4" title="Forecast Day 4"><input type="radio" name="days" value="5" />Day 6</div>';
    return div;
};
dayselect.addTo(mapgfs);

var dayplaybutton = L.control({ position: 'topleft' });
dayplaybutton.onAdd = function (map) {
    var div = L.DomUtil.create('div');
    div.innerHTML = '<div class="info" ><a href="#" id="play" class="myButton" onclick="playwatershed()" title="Animate"><img src="./images/play.png" id="imgplay" height="30" width="30" alt="Animate" /></a></div>';
    return div;
};
dayplaybutton.addTo(mapgfs);

var date = new Date();
var gfsDate = L.control({ position: 'bottomleft' });
gfsDate.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info ffdate');
    div.innerHTML = '<span id="gfsdateid" style="padding:5px;"> ' + date.getDate() + '-' + mname[date.getMonth()] + '-' + date.getFullYear() + ' </span>';
    return div;
};
gfsDate.addTo(mapgfs);

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

function dateUpdation(model, ffdate) {
    var tmpdate = ffdate.substring(0, 10).split('-')

    if (model == "gfs") {
        document.getElementById('gfsdateid').innerHTML = tmpdate[2] + '-' + mname[Number(tmpdate[1]) - 1] + '-' + tmpdate[0]
    } else if (model == "wrf") {
        document.getElementById('wrfdateid').innerHTML = tmpdate[2] + '-' + mname[Number(tmpdate[1]) - 1] + '-' + tmpdate[0]
    }
}
function playwatershed() {

    document.getElementById('divalert').style.display = 'none';

    if (isPlay == true) {
        document.getElementById("imgplay").src = "./images/play.png";
        isPlay = false;
    } else {
        isPlay = true;
        document.getElementById("imgplay").src = "./images/pause.png";
    }

    var playInterval = setInterval(
        function () {
            if (isPlay == false) {
                clearInterval(playInterval);
            } else {
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
                        loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[day]);
                        dateUpdation("gfs", gfsflst.PCP[day])
                    if (day < 3) {
                        loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[day]);
                        dateUpdation("wrf", wrfflst.PCP[day])
                    }
                } else if (prmWeather == 'TMAX') {
                    loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[day]);
                    dateUpdation("gfs", gfsflst.TMAX[day])
                    if (day < 3) {
                        loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[day]);
                        dateUpdation("wrf", wrfflst.TMAX[day])
                    }
                } else if (prmWeather == 'TMIN') {
                    loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[day]);
                    dateUpdation("gfs", gfsflst.TMIN[day])

                    if (day < 3) {
                        loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[day]);
                        dateUpdation("wrf", wrfflst.TMIN[day])
                    }
                }


            }
        }, 5000);
}

$(".weatherRadio").click(function () {
    document.getElementById('divalert').style.display = 'none';
    isPlay = false;
    day = 0;
    $("[name=days]").removeAttr("checked");
    $("[name=days]").filter("[value='" + day + "']").prop("checked", true);

    var thisValue = $(this).attr("value");
    prmWeather = thisValue;
    if (prmWeather == 'PCP') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[0]);
        loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[0]);
        dateUpdation("gfs", gfsflst.PCP[0])
        dateUpdation("wrf", wrfflst.PCP[0])
    } else if (prmWeather == 'TMAX') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[0]);
        loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[0]);
        dateUpdation("gfs", gfsflst.TMAX[0])
        dateUpdation("wrf", wrfflst.TMAX[0])
    } else if (prmWeather == 'TMIN') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[0]);
        loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[0]);
        dateUpdation("gfs", gfsflst.TMIN[0])
        dateUpdation("wrf", wrfflst.TMIN[0])
    }

});

$("input:radio[name=days]").click(function () {
    if (isPlay == true) return;
    var value = $(this).val();
    day = Number(value);

    if (prmWeather == 'PCP') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.PCP[day]);
        dateUpdation("gfs", gfsflst.PCP[day])
        if (day < 3) {
            loadWRFTiff("./data/wrf/forecast/" + wrfflst.PCP[day]);
            dateUpdation("wrf", wrfflst.PCP[day])
        }
    } else if (prmWeather == 'TMAX') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMAX[day]);
        dateUpdation("gfs", gfsflst.TMAX[day])
        if (day < 3) {
            loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMAX[day]);
            dateUpdation("wrf", wrfflst.TMAX[day])
        }
    } else if (prmWeather == 'TMIN') {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst.TMIN[day]);
        dateUpdation("gfs", gfsflst.TMIN[day])

        if (day < 3) {
            loadWRFTiff("./data/wrf/forecast/" + wrfflst.TMIN[day]);
            dateUpdation("wrf", wrfflst.TMIN[day])
        }
    }
});

var gfsint = setInterval(function () {
    if (Object.keys(gfsflst).length > 0) {
        loadGFSTiff("./data/gfs/forecast/" + gfsflst['PCP'][0]);
        dateUpdation("gfs", gfsflst.PCP[0])

        clearInterval(gfsint);
    }
}, 1000);
var wrfint = setInterval(function () {
    if (Object.keys(wrfflst).length > 0) {
        loadWRFTiff("./data/wrf/forecast/" + wrfflst['PCP'][0]);
        dateUpdation("wrf", wrfflst.PCP[0])

        clearInterval(wrfint);
    }
}, 1000);

