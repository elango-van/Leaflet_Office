var modelname = 'gfs', isPlay = false, loadingLayers = false, day = 0, wsopacity = 0.5;
var indiageojson, subgeojson, rchgeojson, cwcgeojson, curlayer, curfield, basincode;
var daylst = [], subdata = [], rchdata = [], cwcdata = [];
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

var subcolor = d3.scaleThreshold()
    .domain([.1, 10, 20, 40, 70, 130, 200])
    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

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
}
var color = d3.scaleOrdinal().domain([1, 17]).range(colorbrewer.Paired[12]);
function style(feat, i) {
    return {
        color: "white",
        fillColor: color(feat.ind),
        fillOpacity: 0.25,
        weight: 1.5
    }
}

var highlight;

function setHighlight(layer) {
    if (layer === undefined || layer == null) return;
    if (highlight) {
        unsetHighlight(highlight);
    }
    layer.setStyle({
        weight: 3,
        color: 'maroon',
        dashArray: '',
        fillOpacity: 0
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    highlight = layer;
}

function unsetHighlight(layer) {

    if (layer === undefined || layer == null) return;
    layer.setStyle(style(layer.feature));

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToBack();
    }

    highlight = null;
}

var layerGroup = L.layerGroup().addTo(map);
var customOptions =
{
    'className': 'another-popup'
}
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

    map.fitBounds(indiageojson.getBounds())
    map.spin(false);
    function onEachCWCbasinLayer(feature, layer) {
        layer.bindTooltip('CWC : ' + feature.properties['Name'], {
            className: 'basintooltip',
            closeButton: false,
            sticky: true,
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

        basincode = e.target.feature.properties.Code;
        var Basin_Name = e.target.feature.properties.Basin_Name;
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

        console.log('Map Loading : ' + Date())
        loadingLayers = true;
        map.spin(true);

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

        var cwcload = false, subload = false, rchload = false;
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
                    fillColor: "red",
                    fillOpacity: 0.001,
                    weight: 1
                }
            })
                .bindPopup(subpopup, customOptions)
                .addTo(map);
            subload = true;
        });

        $.getJSON(rchurl, function (data) {
            var objname = Object.keys(data.objects)[0];
            rchTopoJson = topojson.feature(data, data.objects[objname])

            rchgeojson = L.geoJson(rchTopoJson, {
                style: {
                    color: "blue",
                    weight: 1
                }
            }).bindPopup(subpopup, customOptions)
                .addTo(map);
            rchload = true;
        });
        loaddata();

        var mapSpin = setInterval(
            function () {
                if (map.hasLayer(subgeojson) && map.hasLayer(rchgeojson) && map.hasLayer(cwcgeojson)) {
                    console.log('Map Loaded : ' + Date())
                    loadingLayers = false;
                    map.fitBounds(e.target.getBounds());
                    setHighlight(e.target);

                    map.spin(false);
                    clearInterval(mapSpin);
                }
            }, 1000);

    }

    function resetHighlight(e) {

    }

    function zoomToFeature(e) {
        document.getElementById('divalert').style.display = 'none';
        map.fitBounds(e.target.getBounds());
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
    div.innerHTML += '<h3 id="imdmodel">IMD NWP Rainfall</h3>';
    div.innerHTML += '<div title="Select forecast model" ><input type="radio" class="modelRadio" name="model" value="gfs" checked ><label class="lblmdl">GFS</label>&nbsp;<input type="radio" class="modelRadio" name="model" value="wrf"><label class="lblmdl">WRF</label></div>';
    return div;
};
models.addTo(map);


var dayselect = L.control({ position: 'topleft' });
dayselect.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info divday');
    div.innerHTML += '<div class="d-" title="Observed Day 1"><input type="radio" name="days" value="0" checked="checked" />Day 1</div>';
    div.innerHTML += '<div class="d0" title="Observed Day 2"><input type="radio" name="days" value="1" />Day 2</div>';
    div.innerHTML += '<div class="d1" title="Forecast Day 1"><input type="radio" name="days" value="2" />Day 3</div>';
    div.innerHTML += '<div class="d2" title="Forecast Day 2"><input type="radio" name="days" value="3" />Day 4</div>';
    div.innerHTML += '<div class="d3" title="Forecast Day 3"><input type="radio" name="days" value="4" />Day 5</div>';
    div.innerHTML += '<div class="d4" title="Forecast Day 4"><input type="radio" name="days" value="5" />Day 6</div>';
    div.innerHTML += '<div class="d5" title="Forecast Day 5"><input type="radio" name="days" value="6" />Day 7</div>';
    div.innerHTML += '<div class="d6" title="Forecast Day 6"><input type="radio" name="days" value="7" />Day 8</div>';
    return div;
};
dayselect.addTo(map);

var dayplaybutton = L.control({ position: 'topleft' });
dayplaybutton.onAdd = function (map) {
    var div = L.DomUtil.create('div');
    div.innerHTML = '<div class="info" ><a href="#" id="play" class="myButton" onclick="playwatershed()" title="Animate"><img src="./images/play.png" id="imgplay" height="30" width="30" alt="Animate" /></a></div>';
    return div;
};
dayplaybutton.addTo(map);

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
        return;
    }

    if (isPlay == true) {
        document.getElementById("imgplay").src = "./images/play.png";
        isPlay = false;
    } else {
        isPlay = true;
        document.getElementById("imgplay").src = "./images/pause.png";
    }
    var nodays = 8
    if (modelname == 'wrf')
        nodays = 5

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
    div.innerHTML = '<input type="checkbox" value="1" name="osmEnable" onclick="osmenable(this)" checked /> OSM <br />';
    return div;
};
osmVisible.addTo(map);

function checkopacity(obj) {
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
                grades = subcolor.domain();       
            labels = ['<strong style="font: 12px Arial, Helvetica, sans-serif; font-weight:bold; ">Subbasin Value (mm) </strong><br /><br />'];
            div.innerHTML = labels;

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + subclr[i + 1] + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
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
    try {
        if (document.getElementById("info legend")) {
            document.getElementById("info legend").style.display = "block";
        }

    } catch{ }

}

function hideDisclaimer() {
    try {
        if (document.getElementById("info legend")) {
            document.getElementById("info legend").style.display = "none";
        }
    } catch{ }

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
    subdata = []; cwcdata = []; rchdata = [];
    var errdata = false;
    if (fileExist('./data/' + basincode + '_' + modelname + 'subwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_' + modelname + 'subwebsite.txt', function (txt) {

            var subqueue = d3.queue();
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    var dtstr = lines[line].split("_")[3].substring(0, 8);
                    daylst.push(dtstr.substring(0, 2) + '-' + mname[Number(dtstr.substring(2, 4)) - 1] + '-' + dtstr.substring(4, 8));

                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        subqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
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
                showmessage(modelname + ' No SWAT runs');
                return;
            }
        });
    } else {
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
                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        rchqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
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
                showmessage(modelname + ' No SWAT runs');
                return;
            }
        });
    } else {
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
                    var flname = "./data/" + modelname + "/" + lines[line];
                    if (fileExist(flname) === 200)
                        cwcqueue.defer(d3.csv, flname);
                    else {
                        errdata = true;
                        showmessage('No ouput generated');
                        break;
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
                showmessage(modelname + ' No SWAT runs');
                return;
            }
        });
    } else {
        showmessage(modelname + ' No SWAT runs');
        return;
    }
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

    newobj.append('div')
        .attr("id", "lableheader")
        .append('span').text(basename)

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


    function make_x_gridlines() {
        return d3.axisBottom(xBar)
            .ticks(7)
    }

    function make_y_gridlines() {
        return d3.axisLeft(yBar)
            .ticks(5)
    }

    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    svg.append("g")
        .attr("class", "grid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

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

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xLine)) 
        .selectAll("text")
        .attr("x", "-25")
        .attr("y", "5")
        .attr("transform", "rotate(-30)")
        .style("font-family", "sans-serif")
        .style("font-size", "9px");

    svg.append("g")
        .attr("class", "axisSteelBlue")
        .call(d3.axisLeft(yBar));

    svg.append("g")
        .attr("class", "axisRed")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(yLine));
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
    if (map.hasLayer(subgeojson))
        map.removeLayer(subgeojson);
    if (map.hasLayer(rchgeojson))
        map.removeLayer(rchgeojson);
    if (map.hasLayer(cwcgeojson))
        map.removeLayer(cwcgeojson);

    document.getElementById('ffdate').innerHTML = daylst[day];

    if (prmlayer == 'sub') {
        map.addLayer(subgeojson);
        if (subdata != undefined && subdata.length > 0) {
            subgeojson.eachLayer(function (layer) {

                var datavalue = subdata[day].filter(function (dv) {
                    return dv.Subbasin == layer.feature.properties.Subbasin;
                });

                var gv = NaN;
                if (datavalue.length != 0) {
                    gv = Number(datavalue[0][fldname]);
                    layer.feature.properties.name = 'sub';
                    layer.feature.properties.value = gv;
                    layer.setStyle({
                        fillColor: subcolor(gv),
                        fillOpacity: wsopacity
                    });
                }      
            });
            loadlegend('sub')

        } else {
            showmessage('Water Balance data not exists');
        }
    } else if (prmlayer == 'rch') {
        map.addLayer(rchgeojson);


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
                .range(["#ccc", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

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

                    layer.setStyle({
                        color: rchcolor(gv),
                        weight: weight
                    });
                }      
            });
            loadlegend('rch')
        } else {
            showmessage('River Discharge data not exists');
        }
    } else if (prmlayer == 'cwc') {
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
                    layer.setStyle({
                        color: "black",
                        weight: 1.2,
                        fillColor: subcolor(gv)
                    });
                }      
            });
            loadlegend('sub')
        } else {
            showmessage('Forecast-CWC Basins data not exists');
        }
    }

    curlayer = prmlayer;
    curfield = fldname;
}

$(".modelRadio").click(function () {

    if (loadingLayers == true) {
        showmessage('Wait basin is loading');

        $("[name=model]").removeAttr("checked");
        if (modelname == 'wrf')
            $("[name=model]").filter("[value='wrf']").prop("checked", true);
        else
            $("[name=model]").filter("[value='gfs']").prop("checked", true);

        return;
    }

    document.getElementById('divalert').style.display = 'none';
    isPlay = false;
    day = 0;
    $("[name=days]").removeAttr("checked");
    $("[name=days]").filter("[value='" + day + "']").prop("checked", true);

    var thisValue = $(this).attr("value");
    modelname = thisValue;
    resetlayers();

    if (modelname == 'wrf') {
        $("div.d4").hide();
        $("div.d5").hide();
        $("div.d6").hide();
    } else {
        $("div.d4").show();
        $("div.d5").show();
        $("div.d6").show();
    }
});

$("input:radio[name=days]").click(function () {
    
    var value = $(this).val();
    day = Number(value);

    if (isPlay == true) return;
    if (loadingLayers == true) {
        showmessage('Wait basin is loading');
        return;
    }

    addlayer(curlayer, curfield);

});

map.on('click', function (e) {
    map.spin(false);
});


