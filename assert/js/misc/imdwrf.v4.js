var gridpath, gridproject, basincode = null, basinname = null, svg = null, cwcsvg = null, rchcolor = null;
var width = 448, height = 450;
var mname = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var monthlyname = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var margin = { top: 20, right: 60, bottom: 50, left: 60 },
    cwidth = 462 - margin.left - margin.right,
    cheight = 200 - margin.top - margin.bottom,

    cwcwidth = 470,
    cwcheight = 225;

var day = 0, pvday = 0, prvws, prvcwc, prvwssel, prvcwcsel, prvrchsel, prvrch, fldname, cwcfldname;
var wsflst = [], cwcflst = [], rchflst = [];

function dayselect(d) {
    day = d;

    if (prvws && prvwssel) {
        getdata(null, prvws, prvwssel);
    }
    if (prvcwc && prvcwcsel) {
        getdata(null, prvcwc, prvcwcsel);
    }
    if (prvrch && prvrchsel) {
        getdata(null, prvrch, prvrchsel);
    }
    var element = document.getElementById("day" + pvday);
    element.classList.remove("currentday");
    pvday = day;
    var element = document.getElementById("day" + day);
    element.classList.add("currentday");
}

var element = document.getElementById("day" + day);
element.classList.add("currentday");

function filterJSON(json, key, value) {
    var result = {};
    for (var explosionIndex in json) {
        if (json[explosionIndex][key] === value) {
            result[explosionIndex] = json[explosionIndex];
        }
    }
    return result;
}

function plotchart_new(d) {

    //******************************* Vertical Chart ************************
    var div = d3.select("#divtool").attr("class", "tbtoolTip");
    var code = d.properties.SUBBASIN
    var cwcfile = './data/wrf/' + cwcflst[0];

    d3.csv(cwcfile, function (error, datavalue) {
        if (error) {
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> Chart file does not exist.';
            document.getElementById('divalert').style.display = 'inline';
            return false;
        }

        var dateParse = d3.timeParse("%m/%d/%Y");
        var dateFormat = d3.timeFormat("%d-%b-%Y");

        datavalue.forEach(function (d) {
            d.Date = dateFormat(dateParse((d.Date)));
            d.Rainfall = +d.Rainfall;
            d.Inflow = +d.Inflow;
        });

        var data = datavalue.filter(function (dv) {
            return dv.Subbasin == code;
        });

        var parseTime = d3.timeParse("%d-%b-%y");

        var xBar = d3.scaleBand().range([0, cwidth]).paddingInner(0.5).paddingOuter(0.25);
        var xLine = d3.scalePoint().range([0, cwidth]).padding(0.5);
        var yBar = d3.scaleLinear().range([0, cheight]);
        var yLine = d3.scaleLinear().range([cheight, 0]);

        var valueline = d3.line()
            .x(function (d) {
                return xLine(d.Date);
            })
            .y(function (d) {
                return yLine(d.Inflow);
            });

        ////====================== chart ========================
        d3.select("#divchart").select("svg").remove();
        $('#divchart').html('');

        $('#divtable').html('');

        var svg = d3.select("#divchart").append("svg")
            .attr("width", cwidth + margin.left + margin.right)
            .attr("height", cheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        xBar.domain(data.map(function (d) { return d.Date; }));
        xLine.domain(data.map(function (d) { return d.Date; }));
        yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), d3.max(data, function (d) { return d.Rainfall; })]).nice();
        yLine.domain([d3.min(data, function (d) { return d.Inflow; }), d3.max(data, function (d) { return d.Inflow; })]).nice();

        //********************* gridlines ******************
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
            .attr("transform", "translate(0," + cheight + ")")
            .call(make_x_gridlines()
                .tickSize(-cheight)
                .tickFormat("")
            )

        svg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-cwidth)
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
            })

            .on("mouseover", function (d, i) {

                //var clientRect = this.getBoundingClientRect();
                //div.style("left", (clientRect.left - 638) + "px");
                //div.style("top", clientRect.top - 375 + "px");

                div.style("left", d3.event.offsetX + 20 + "px");
                div.style("top", d3.event.offsetY - 5 + "px");

                div.style("display", "block");
                if (i <= 1) {
                    div.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
                } else {
                    div.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
                }
            })
            .on("mousemove", function (d, i) {

                div.style("left", d3.event.offsetX + 20 + "px");
                div.style("top", d3.event.offsetY - 5 + "px");

                div.style("display", "block");
                if (i <= 1) {
                    div.html(d.Date + "<br>Observed Rainfall : " + Number(d.Rainfall).toFixed(1));
                } else {
                    div.html(d.Date + "<br>Forecast Rainfall : " + Number(d.Rainfall).toFixed(1));
                }
            })
            .on("mouseout", function (d) {
                div.style("display", "none");
            })
            ;

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

                div.style("left", d3.event.offsetX + 20 + "px");
                div.style("top", d3.event.offsetY - 5 + "px");

                div.style("display", "inline-block");
                div.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
            })
            .on("mousemove", function (d) {
                //div.style("left", d3.event.pageX - 650 + "px");
                //div.style("top", d3.event.pageY - 410 + "px");

                div.style("left", d3.event.offsetX + 20 + "px");
                div.style("top", d3.event.offsetY - 5 + "px");

                div.style("display", "inline-block");
                div.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
            })
            .on("mouseout", function (d) {
                div.style("display", "none");
            });

        svg.append("g")
            .attr("transform", "translate(0,0)")
            .call(d3.axisTop(xLine))
            .selectAll("text")
            .remove()
            ;

        svg.append("g")
            .attr("transform", "translate(0," + cheight + ")")
            .call(d3.axisBottom(xLine)) //.tickSize(-cheight)
            .selectAll("text")
            .attr("x", "-25")
            .attr("y", "5")
            .attr("transform", "rotate(-30)")
            .style("font-family", "sans-serif")
            .style("font-size", "9px")
            ;

        svg.append("g")
            .attr("class", "axisSteelBlue")
            .call(d3.axisLeft(yBar));

        svg.append("g")
            .attr("class", "axisRed")
            .attr("transform", "translate( " + cwidth + ", 0 )")
            .call(d3.axisRight(yLine));//.tickSize(-cwidth)

        svg.append("text")
            .attr("class", "y axis")
            .attr("text-anchor", "middle")
            .attr("x", -60)
            .attr("y", -45)
            .attr("style", "font-size:8pt;fill:steelblue;")
            //.attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text('Rainfall (mm)');

        svg.append("text")
            .attr("class", "y axis")
            .attr("text-anchor", "middle")
            .attr("x", -65)
            .attr("y", 400)
            .attr("style", "font-size:8pt;fill:red;")
            //.attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text('Discharge (cumec)');

        //tabulate(data, ['Date', 'Inflow', 'Rainfall']);

        var charttable = d3.select('#divtable').append('table').attr("width", "100%")
        descripttable(data, ['Date', 'Inflow', 'Rainfall'], charttable, true);
    });
}

function tabulate(data, columns, table) {
    var table = d3.select('#divtable').append('table').attr("width", "100%")
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

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                callback(rawFile.responseText);
            }
        }
    }
    rawFile.send(null);
}

function fileExist(fileLocation) {
    var response = $.ajax({
        url: fileLocation,
        type: 'HEAD',
        async: false
    }).status;
    return response;
}

function getfileSize(filepath) {
    var fileSize = null;
    $.ajax(filepath, {
        type: 'HEAD',
        async: false,
        success: function (d, r, xhr) {
            fileSize = xhr.getResponseHeader('Content-Length');
        }
    });
    return fileSize;
}
function median(values) {
    values.sort(function (a, b) {
        return a - b;
    });

    if (values.length === 0) return 0

    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
}

function boundingExtent(features, myPath) {
    var bounds = [];
    for (var x in features) {
        var boundObj = {};
        thisBounds = myPath.bounds(features[x]);
        boundObj.id = features[x].id;
        boundObj.x = thisBounds[0][0];
        boundObj.y = thisBounds[0][1];
        boundObj.width = thisBounds[1][0] - thisBounds[0][0];
        boundObj.height = thisBounds[1][1] - thisBounds[0][1];
        boundObj.path = thisBounds;
        bounds.push(boundObj)
    }
    return bounds;
}
function loadlayer() {
    if (basincode == '' || basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Basin Code does not exist in the JSON';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    var cwcgrid = './json/CWC_basin/' + basincode + '.json';
    var wsgrid = './json/watershed/' + basincode + '.json';
    var outlayer = './json/basin/' + basincode + '.json';
    var descrpt = './json/description.txt';
    var descrpt2 = './json/IMD_FF_Description.csv';

    if (fileExist(wsgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Watershed Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        window.location.href = "index.html";
        return;
    }

    if (fileExist(cwcgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> CWC Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    if (fileExist(outlayer) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> outlayer (basin) Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    if (fileExist(descrpt) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Description file does not exist';
        document.getElementById('divalert').style.display = 'inline';
    }

    if (fileExist(descrpt2) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Description 2nd file does not exist';
        document.getElementById('divalert').style.display = 'inline';
    }

    document.getElementById('divalert').style.display = 'none';
    document.getElementById('loaderContainer').style.display = 'block';

    wsflst = [];
    if (fileExist('./data/' + basincode + '_wrfsubwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_wrfsubwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    wsflst.push(lines[line])
                }
            }
        });
    } else {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> wrfsubwebsite.txt file does not exist';
        document.getElementById('divalert').style.display = 'inline';
    }

    cwcflst = [];
    if (fileExist('./data/' + basincode + '_wrfcwcwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_wrfcwcwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    cwcflst.push(lines[line]);
                }
            }
        });
    } else {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> wrfcwcwebsite.txt file does not exist';
        document.getElementById('divalert').style.display = 'inline';
    }

    rchflst = [];
    if (fileExist('./data/' + basincode + '_wrfrchwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_wrfrchwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    rchflst.push(lines[line]);
                }
            }
        });
    } else {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> wrfrchwebsite.txt file does not exist';
        document.getElementById('divalert').style.display = 'inline';
    }

    d3.select("#divchart").select("svg").remove();
    $('#divchart').html('');

    d3.select('#divcwcbasin').selectAll("*").remove();
    $('#divcwcbasin').html('');

    queue()
        .defer(d3.json, wsgrid)
        .defer(d3.json, cwcgrid)
        .defer(d3.json, outlayer)
        .defer(d3.csv, descrpt)
        .defer(d3.csv, descrpt2)
        .await(loadBasin);

}

function drawOuterBoundary(wpath, boundary) {
    cwcsvg.append("path")
        .datum(boundary)
        .attr("d", wpath)
        .attr("class", "boundary")
        .style("fill", "none")
        .style("stroke-width", 0.3)
        .style("stroke", "#800000")
        ;
}

//**************** Zooming map ***************************************
function getTextBox(selection) {
    selection.each(function (d) {
        d.bbox = this.getBBox();
    });
}

var watershedGroup, minZoom, maxZoom;

function zoomed() {
    t = d3
        .event
        .transform
        ;
    watershedGroup.attr(
        "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
    );
}

var zoom = d3
    .zoom()
    .on("zoom", zoomed)
    ;

function boxZoom(box, centroid, paddingPerc) {
    minXY = box[0];
    maxXY = box[1];

    zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    zoomHeight = Math.abs(minXY[1] - maxXY[1]);

    zoomMidX = centroid[0];
    zoomMidY = centroid[1];

    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);

    maxXscale = $("svg").width() / zoomWidth;
    maxYscale = $("svg").height() / zoomHeight;

    zoomScale = Math.min(maxXscale, maxYscale);
    zoomScale = Math.min(zoomScale, maxZoom);
    zoomScale = Math.max(zoomScale, minZoom);

    offsetX = zoomScale * zoomMidX;
    offsetY = zoomScale * zoomMidY;

    dleft = Math.min(0, $("svg").width() / 2 - offsetX);
    dtop = Math.min(0, $("svg").height() / 2 - offsetY);

    dleft = Math.max($("svg").width() - width * zoomScale, dleft);
    dtop = Math.max($("svg").height() - height * zoomScale, dtop);

    svg
        .transition()
        .duration(500)
        .call(
            zoom.transform,
            d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
        );
}

function initiateZoom() {

    minZoom = Math.max($("#divbasinmap").width() / width, $("#divbasinmap").height() / height);
    maxZoom = 10 * minZoom;

    zoom
        .scaleExtent([minZoom, maxZoom]) // set min/max extent of zoom
        .translateExtent([[0, 0], [width, height]]) // set extent of panning
        ;

    midX = ($("#divbasinmap").width() - (minZoom * width)) / 2;
    midY = ($("#divbasinmap").height() - (minZoom * height)) / 2;

    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

$(window).resize(function () {

    svg
        .attr("width", $("#divbasinmap").width())
        .attr("height", $("#divbasinmap").height())
        ;
    initiateZoom();
});

//*******************************************************
var color = d3.scaleThreshold()
    .domain([1, 10, 20, 40, 70, 130, 200])
    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

function descripttable(data, columns, table, tableheader) {
    //var table = d3.select('#divdescrp').append('table').attr("width", "100%")
    var tbody = table.append('tbody');

    if (tableheader === true) {
        var thead = table.append('thead')
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th').style("background-color", "#804000")
            .text(function (column) {
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

    return table;
}
function loadBasin(error, wsgrid, cwcgrid, outlayer, descdata, descdata2) {
    if (error) {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Grid loading error';
        document.getElementById('divalert').style.display = 'inline';
        return;
        throw error;
    }

    d3.select("#divbasinmap").select("svg").remove();
    $('#divbasinmap').html('');

    d3.select("#divcwcbasin").select("svg").remove();
    $('#divcwcbasin').html('');

    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');

    svg = d3.select("#divbasinmap").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

    watershedGroup = svg
        .append("g")
        .attr("id", "map")
        ;

    //********************** Sate Grid start here **************************
    gridproject = d3.geoEquirectangular()
        .scale(1)
        .translate([0, 0]);

    gridpath = d3.geoPath().projection(gridproject);
    var objname = Object.keys(wsgrid.objects)[0];

    var gridmap = topojson.feature(wsgrid, wsgrid.objects[objname]);

    var b = gridpath.bounds(gridmap),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    gridproject
        .scale(s)
        .translate(t);

    minZoom = Math.max($("#divbasinmap").width() / width, $("#divbasinmap").height() / height);
    maxZoom = 10 * minZoom;

    var outname = Object.keys(outlayer.objects)[0];

    outerlayer = watershedGroup
        .selectAll(".boundry")
        .data(topojson.feature(outlayer, outlayer.objects[outname]).features)
        .enter()
        .append("path")
        .attr("d", gridpath)
        .attr("id", function (d, i) {
            return "boundry" + d.properties.disID;
        })
        .attr("class", "boundry")
        .style("fill", "none")
        .style("stroke", "#800000");

    countries = watershedGroup
        .selectAll(".wsbasin")
        .data(topojson.feature(wsgrid, wsgrid.objects[objname]).features)
        .enter()
        .append("path")
        .attr("d", gridpath)
        .attr("id", function (d, i) {
            return "wsbasin" + d.properties.Subbasin;
        })
        .attr("class", "wsbasin")
        .on("mouseover", function (d) {
            $("#wstooltip").show();
            wsWarning(d);
            d3.select("#label" + d.properties.Subbasin).style("display", "block");
        })
        .on("mouseout", function (d) {
            $("#wstooltip").hide();
            d3.select("#label" + d.properties.Subbasin).style("display", "none");
        })
        .on("click", function (d, i) {
            d3.selectAll(".wsbasin").classed("country-on", false);
            d3.select(this).classed("country-on", true);
            boxZoom(gridpath.bounds(d), gridpath.centroid(d), 10);
        })
        ;

    countryLabels = watershedGroup
        .selectAll("g")
        .data(topojson.feature(wsgrid, wsgrid.objects[objname]).features)
        .enter()
        .append("g")
        .attr("class", "wslabel")
        .attr("id", function (d) {
            return "label" + d.properties.Subbasin;
        })
        .attr("transform", function (d) {
            return (
                "translate(" + gridpath.centroid(d)[0] + "," + gridpath.centroid(d)[1] + ")"
            );
        })
        .style("display", "none")
        .on("click", function (d, i) {
            d3.selectAll(".wsbasin").classed("country-on", false);
            d3.select("#wsbasin" + d.properties.Subbasin).classed("country-on", true);
            boxZoom(gridpath.bounds(d), gridpath.centroid(d), 10);
        });

    countryLabels
        .append("text")
        .attr("class", "label")
        .style("text-anchor", "middle")
        .style("font-size", "2px")
        .attr("dx", 0)
        .attr("dy", 0)
        .text(function (d) {
            return d.properties.Subbasin;
        });

    watershedGroup.append("text")
        .attr("x", (width / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .attr("class", "shadow")
        .text(basinname);

    watershedGroup.append("text")
        .attr("x", (width / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(basinname);

    watershedGroup.exit().remove();

    d3.selectAll('.wsbasin')
        .style('fill', function (d) {
            return null; //'#ccc';
        });

    initiateZoom();

    //********************** Sate Grid start here **************************
    cwcsvg = d3.select("#divcwcbasin").append("svg")
        .attr("width", cwcwidth)
        .attr("height", cwcheight);

    var cwcname = Object.keys(cwcgrid.objects)[0];
    var cwcproject = d3.geoEquirectangular()
        .scale(1)
        .translate([0, 0]);

    var cwcpath = d3.geoPath().projection(cwcproject);
    var cwcmap = topojson.feature(cwcgrid, cwcgrid.objects[cwcname]);
    var b = cwcpath.bounds(cwcmap),
        s = .9 / Math.max((b[1][0] - b[0][0]) / cwcwidth, (b[1][1] - b[0][1]) / cwcheight),
        t = [(cwcwidth - s * (b[1][0] + b[0][0])) / 2, (cwcheight - s * (b[1][1] + b[0][1])) / 2];
    cwcproject
        .scale(s)
        .translate(t);

    cwcsvg.append("svg:title").text("Click to view chart");

    //// ***************** Adding cwc Map *********************
    cwcsvg.selectAll(".cwcbasin")
        .data(topojson.feature(cwcgrid, cwcgrid.objects[cwcname]).features)
        .enter().append("path")
        .attr("class", "cwcbasin")
        .attr("id", function (d) { return d.properties.UNID; }, true)
        .attr("d", cwcpath)
        .on("mouseover", function (d) {
            $("#cwctooltip").show();
            cwcWarning(d);
        })
        .on("mouseout", function () {
            $("#cwctooltip").hide();
        })
        .on("click", plotchart_new);

    d3.selectAll('.cwcbasin')
        .style('fill', function (d, i) {
            return '#eee'; //'lightgray'
        });

    var boundary = topojson.mesh(cwcgrid, cwcgrid.objects[cwcname], function (a, b) { return a === b; });
    drawOuterBoundary(cwcpath, boundary);

    //// ***************** Adding Lable on Map *********************
    bboxes = boundingExtent(topojson.feature(cwcgrid, cwcgrid.objects[cwcname]).features, cwcpath);

    cwcsvg.selectAll(".label")
        .data(topojson.feature(cwcgrid, cwcgrid.objects[cwcname]).features)
        .enter().append("text")
        .attr("transform", function (d) { return "translate(" + cwcpath.centroid(d) + ")"; })
        .attr('text-anchor', 'middle')
        .style("font-size", function (d, i) {
            var xy = Math.min(bboxes[i].height, bboxes[i].width);
            xy = xy * .2;
            if (xy > 6)
                xy = 6;
            return xy + "pt";
        })
        .text(function (d) {
            return d.properties.Name;
        });

    //createLegend(color);
    var table = d3.select('#divdescrp').append('table').attr("width", "100%")
    descripttable(descdata, ['Code', basincode], table, false);

    var datavalue = descdata2.filter(function (dv) {
        return dv.Basin == basincode;
    });

    var table2 = d3.select('#divdescrp2').append('table').attr("width", "100%")
    descripttable(datavalue, ['Type', 'Description', 'Area [ha]', '%Wshed Area'], table2, true);

    document.getElementById('loaderContainer').style.display = 'none';

}

function getdata(obj, dat, sel) {
    if (basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Select Basin';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    if (dat == 'ws') {
        prvrchsel = null; prvrch = null;
        prvwssel = sel; prvws = dat;

    } else if (dat == 'cwc') {
        prvcwcsel = sel; prvcwc = dat;
    } else if (dat == 'rch') {
        prvwssel = null; prvws = null;
        prvrchsel = sel; prvrch = dat;
    }

    if ((dat == 'ws' || dat == 'rch') && obj !== null)
        document.getElementById('wslabel').innerText = obj.value;
    else if (obj !== null)
        document.getElementById('cwclabel').innerText = obj.value;

    process = document.getElementsByClassName("prscentered");
    process[0].style.display = 'block';

    if (dat == 'ws')
        d3.selectAll('.wsbasin').style('fill', null);
    else if (dat == 'cwc')
        d3.selectAll('.cwcbasin').style('fill', null);
    else if (dat == 'rch') {
        //d3.selectAll('.wsbasin').style('fill', null);
        //d3.selectAll('.rchbasin').style('fill', null);

        d3.selectAll('.wbodybasin').style('fill', null);
        d3.selectAll('.wsbasin').style('fill', null);
        d3.selectAll('.wsbasin').style('stroke-opacity', 0.2);
        d3.selectAll('.rchbasin').style('fill', null);
    }
    if (dat == 'ws') {
        var wsfile = './data/wrf/' + wsflst[day] + '?' + Math.random();
        d3.selectAll(".rchbasin").remove();

        var dtstr = wsflst[day].split("_")[3].substring(0, 8);
        if (day <= 1) {
            document.getElementById('divdate').innerHTML = dtstr.substring(0, 2) + '/' + mname[Number(dtstr.substring(2, 4)) - 1] + '/' + dtstr.substring(4, 8) + ' (Based on observed Rainfall)'
        } else {
            document.getElementById('divdate').innerHTML = dtstr.substring(0, 2) + '/' + mname[Number(dtstr.substring(2, 4)) - 1] + '/' + dtstr.substring(4, 8) + ' (Based on Rainfall forecast)'
        }

        fldname = sel;
        queue()
            .defer(d3.csv, wsfile)
            .await(loadwsdata);
    } else if (dat == 'cwc') {
        var cwcfile = './data/wrf/' + cwcflst[0] + '?' + Math.random();
        cwcfldname = sel;

        queue()
            .defer(d3.csv, cwcfile)
            .await(loadcwcdata);
    } else if (dat == 'rch') {
        var wbjson = './json/wbody/' + basincode + '.json';
        var rchjson = './json/reach/' + basincode + '.json';
        var rchfile = './data/wrf/' + rchflst[day] + '?' + Math.random();

        var dtstr = rchflst[day].split("_")[3].substring(0, 8);
        if (day == 0) {
            document.getElementById('divdate').innerHTML = dtstr.substring(0, 2) + '/' + mname[Number(dtstr.substring(2, 4)) - 1] + '/' + dtstr.substring(4, 8) + ' (Based on observed Rainfall)'
        } else {
            document.getElementById('divdate').innerHTML = dtstr.substring(0, 2) + '/' + mname[Number(dtstr.substring(2, 4)) - 1] + '/' + dtstr.substring(4, 8) + ' (Based on Rainfall forecast)'
        }


        fldname = sel;
        queue()
            .defer(d3.json, rchjson)
            .defer(d3.csv, rchfile + "?" + Math.random())
            .defer(d3.json, wbjson)
            .await(loadrchdata);
    }

    function loadrchdata(error, reachmap, data, wbmap) {
        if (error) {
            $("input:radio[name='Models']").each(function (i) {
                this.checked = false;
            });
            process[0].style.display = 'none';
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> Discharge file does not exist.';
            document.getElementById('divalert').style.display = 'inline';
            return false;
            //console.warn(error);
        }

        watershedGroup.selectAll(".rchbasin").remove();
        watershedGroup.selectAll(".wbodybasin").remove();

        var min = Infinity, max = -Infinity;
        data.forEach(function (d) {
            var gv = +d[fldname];
            if (max < gv)
                max = gv;

            if (min > gv)
                min = gv;
            //d["land area"] = +d["land area"];
        });

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

        var objname = Object.keys(reachmap.objects)[0];
        rchlayer = watershedGroup.selectAll(".rchbasin")
            .data(topojson.feature(reachmap, reachmap.objects[objname]).features)
            .enter().append("path")
            .attr("class", "rchbasin")
            .attr("id", function (d) { return 'reach' + d.properties.Subbasin; }, true)
            .attr("d", gridpath)//reachpath
            .style('fill', 'none')
            .attr("stroke", function (d) {
                var datavalue = data.filter(function (dv) {
                    return dv.Subbasin == d.properties.Subbasin;
                });

                if (datavalue.length != 0) {
                    gv = Number(datavalue[0][fldname]);
                    d.properties[fldname] = gv;
                    return rchcolor(gv);
                } else return null;

            })
            .attr("stroke-width", function (d) {

                var clrange = rchcolor.domain();


                var datavalue = data.filter(function (dv) {
                    return dv.Subbasin == d.properties.Subbasin;
                });

                if (datavalue.length != 0) {
                    gv = Number(datavalue[0][fldname]);
                    if (gv <= clrange[1])
                        return 0.15;
                    else if (gv <= clrange[3])
                        return 0.5;
                    else if (gv <= clrange[4])
                        return 0.75;
                    else if (gv <= clrange[6])
                        return 1;

                } else return null;
            })
            .on("mouseover", function (d) {
                $("#wstooltip").show();
                wsWarning(d);
                d3.select("#label" + d.properties.Subbasin).style("display", "block");
            })
            .on("mouseout", function (d) {
                $("#wstooltip").hide();
                d3.select("#label" + d.properties.Subbasin).style("display", "none");
            })
            .on("click", function (d, i) {
                d3.selectAll(".wsbasin").classed("country-on", false);
                d3.select(this).classed("country-on", true);
                boxZoom(gridpath.bounds(d), gridpath.centroid(d), 10);
            });

        var wbname = Object.keys(wbmap.objects)[0];
        wblayer = watershedGroup.selectAll(".wbodybasin")
            .data(topojson.feature(wbmap, wbmap.objects[wbname]).features)
            .enter().append("path")
            .attr("class", "wbodybasin")

            .attr("id", function (d) { return 'wb' + d.properties.FACC_CODE; }, true)
            .attr("d", gridpath)
            .style('fill', 'blue');

        createLegend(rchcolor);
        process[0].style.display = 'none';
    }

    function loadcwcdata(error, data) {
        if (error) {
            $("input:radio[name='cwcModels']").each(function (i) {
                this.checked = false;
            });
            process[0].style.display = 'none';
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> CWC file does not exist.';
            document.getElementById('divalert').style.display = 'inline';
            return false;
            //console.warn(error);
        }

        var commin = d3.min(data, function (d) { return d.Inflow; })
        var commax = d3.max(data, function (d) { return d.Inflow; });

        d3.select("#cwclegend").select("svg").remove();
        $('#cwclegend').html('');

        var color = d3.scaleThreshold()
            .domain([1, 10, 20, 40, 70, 130, 200])
            .range(["#e1e1e1", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

        d3.selectAll('.cwcbasin')
            .style('fill', function (d) {
                var datavalue = data.filter(function (dl) {
                    return dl.Subbasin == d.properties.SUBBASIN;
                });

                var gv = 0;
                if (datavalue.length != 0) {
                    gv = Number(datavalue[day][cwcfldname]);
                    d.properties[cwcfldname] = gv;
                    if (cwcfldname === 'Inflow' && rchcolor !== null) {
                        return rchcolor(gv);
                    }
                    else {
                        return color(gv);
                    }

                } else return null;
            });

        if (cwcfldname === 'Inflow' && rchcolor !== null) {
            createLegend(rchcolor);
        } else {
            createLegend(color);
        }

        process[0].style.display = 'none';
    }

    function loadwsdata(error, data) {
        if (error) {
            $("input:radio[name='Models']").each(function (i) {
                this.checked = false;
            });
            process[0].style.display = 'none';
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> Watershed file does not exist.';
            document.getElementById('divalert').style.display = 'inline';
            return false;
            //console.warn(error)
        }

        d3.selectAll('.wsbasin')
            .style('fill', function (d) {
                var datavalue = data.filter(function (dv) {
                    return dv.Subbasin == d.properties.Subbasin;
                });

                if (datavalue.length != 0) {
                    gv = Number(datavalue[0][fldname]);
                    d.properties[fldname] = gv;
                    return color(gv);
                } else return null;
            });

        createLegend(color);

        process[0].style.display = 'none';
    }
}
function createLegend(colorScale) {

    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');
    svgleg = d3.select("#wslegend").append("svg")
        .attr('id', 'svglegend')
        .attr('style', 'width:95px;');

    var colorLegend = d3.legendColor()
        .labelFormat(d3.format(".0f"))
        .labels(d3.legendHelpers.thresholdLabels)
        //.useClass(true)
        //.labelOffset(60)
        //.labelAlign('left')
        .scale(colorScale)

    svgleg.append("g")
        .call(colorLegend);
}
function wsWarning(d) {

    var tooltip = d3.select("#wstooltip");
    var html = "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td class='noBorder'> Subbasin : " + d.properties.Subbasin + "</td></tr>";
    html = html + "<tr><td class='noBorder'>" + fldname + " : " + Number(d.properties[fldname]).toFixed(1) + "</td></tr></table>";

    tooltip.html(html);
}

function cwcWarning(d) {

    var tooltip = d3.select("#cwctooltip");
    var html = "<table><tr><td class='noBorder'>" + cwcfldname + " : " + Number(d.properties[cwcfldname]).toFixed(1) + "</td></tr></table>"
    tooltip.html(html);
}

var strqry = location.search.substring(1);
if (strqry === '' || strqry === null || typeof (strqry) === 'undefined')
    window.location.href = "index.html";

var splt = strqry.split('&');
basincode = splt[0].split('=')[1];

if (basincode === '' || basincode === null || typeof (basincode) === 'undefined')
    window.location.href = "index.html";

if (splt.length > 1)
    basinname = splt[1].split('=')[1];

loadlayer();
