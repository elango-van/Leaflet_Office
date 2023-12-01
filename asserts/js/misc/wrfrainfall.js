var day = 0, prvws, prvcwc, prvwssel, prvcwcsel, prvrchsel, prvrch, fldname, cwcfldname;
var wsflst = [], cwcflst = [], rchflst = [];

function dayselect(d) {
    day = d;

    if (prvws && prvwssel) {
        getdata(null, prvws, prvwssel);
    }
    if (prvcwc && prvcwcsel) {
        getdata(null, prvcwc, prvcwcsel);
    }
}

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
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> Chart file does not exists.';
            document.getElementById('divalert').style.display = 'inline';
            return;
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

        // parse the date / time
        var parseTime = d3.timeParse("%d-%b-%y");

        // set the ranges
        var xBar = d3.scaleBand().range([0, cwidth]).paddingInner(0.5).paddingOuter(0.25);
        var xLine = d3.scalePoint().range([0, cwidth]).padding(0.5);
        var yBar = d3.scaleLinear().range([0, cheight]);
        var yLine = d3.scaleLinear().range([cheight, 0]);

        // define the 1st line
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


        var svg = d3.select("#divchart").append("svg")
            .attr("width", cwidth + margin.left + margin.right)
            .attr("height", cheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data
        xBar.domain(data.map(function (d) { return d.Date; }));
        xLine.domain(data.map(function (d) { return d.Date; }));
        yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), d3.max(data, function (d) { return d.Rainfall; })]).nice();
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
            .attr("transform", "translate(0," + cheight + ")")
            .call(make_x_gridlines()
                .tickSize(-cheight)
                .tickFormat("")
            )

        // add the Y gridlines
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
            .style("fill", "steelblue")
            .attr("x", function (d) { return xBar(d.Date); })
            .attr("width", function (d) { return xBar.bandwidth(); })
            .attr("height", function (d) {
                return yBar(d.Rainfall);
            })

        .on("mouseover", function (d) {

            var clientRect = this.getBoundingClientRect();

            div.style("left", (clientRect.left - 638) + "px");
            div.style("top", clientRect.top - 375 + "px");

            div.style("display", "inline-block");
            div.html(d.Date + "<br>Rainfall : " + Number(d.Rainfall).toFixed(1));
        })
        .on("mouseout", function (d) {
            div.style("display", "none");
        })
        ;

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
                .on("mousemove", function (d) {
                    div.style("left", d3.event.pageX - 650 + "px");
                    div.style("top", d3.event.pageY - 410 + "px");

                    div.style("display", "inline-block");
                    div.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
                })
        .on("mouseout", function (d) {
            div.style("display", "none");
        })
        ;

        svg.append("g")
            .attr("transform", "translate(0,0)")
            .call(d3.axisTop(xLine))
            .selectAll("text")
            .remove()
        ;

        // Add the X Axis
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

        // Add the Y0 Axis
        svg.append("g")
            .attr("class", "axisSteelBlue")
            .call(d3.axisLeft(yBar));

        // Add the Y1 Axis
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

    });
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

function fileExists(fileLocation) {
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

function loadlayer(d) {

    basincode = d.properties.Code;
    if (basincode == '' || basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Basin Code does not exists in the JSON';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    var wsgrid = './json/wrf/' + basincode + '.json';
    var outlayer = './json/basin/' + basincode + '.json';

    if (fileExists(wsgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> CWC Grid file does not exists';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    if (fileExists(outlayer) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> CWC Grid file does not exists';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    document.getElementById('divalert').style.display = 'none';
    document.getElementById('imgclock').style.display = 'block';

    queue()
     .defer(d3.json, wsgrid)
     .defer(d3.json, outlayer)
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

// apply zoom to watershedGroup
function zoomed() {
    t = d3
       .event
       .transform
    ;
    watershedGroup.attr(
       "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
    );
}

// Define map zoom behaviour
var zoom = d3
   .zoom()
   .on("zoom", zoomed)
;

// zoom to show a bounding box, with optional additional padding as percentage of box size
function boxZoom(box, centroid, paddingPerc) {
    minXY = box[0];
    maxXY = box[1];
    // find size of map area defined
    zoomWidth = Math.abs(minXY[0] - maxXY[0]);
    zoomHeight = Math.abs(minXY[1] - maxXY[1]);
    // find midpoint of map area defined
    zoomMidX = centroid[0];
    zoomMidY = centroid[1];
    // increase map area to include padding
    zoomWidth = zoomWidth * (1 + paddingPerc / 100);
    zoomHeight = zoomHeight * (1 + paddingPerc / 100);
    // find scale required for area to fill svg
    maxXscale = $("svg").width() / zoomWidth;
    maxYscale = $("svg").height() / zoomHeight;
    zoomScale = Math.min(maxXscale, maxYscale);
    // handle some edge cases
    // limit to max zoom (handles tiny countries)
    zoomScale = Math.min(zoomScale, maxZoom);
    // limit to min zoom (handles large countries and countries that span the date line)
    zoomScale = Math.max(zoomScale, minZoom);
    // Find screen pixel equivalent once scaled
    offsetX = zoomScale * zoomMidX;
    offsetY = zoomScale * zoomMidY;
    // Find offset to centre, making sure no gap at left or top of holder
    dleft = Math.min(0, $("svg").width() / 2 - offsetX);
    dtop = Math.min(0, $("svg").height() / 2 - offsetY);
    // Make sure no gap at bottom or right of holder
    dleft = Math.max($("svg").width() - width * zoomScale, dleft);
    dtop = Math.max($("svg").height() - height * zoomScale, dtop);
    // set zoom
    svg
      .transition()
      .duration(500)
      .call(
        zoom.transform,
        d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
      );
}

function initiateZoom() {
    // Define a "min zoom"
    minZoom = Math.max($("#divbasinmap").width() / width, $("#divbasinmap").height() / height);
    // Define a "max zoom" 
    maxZoom = 10 * minZoom;
    //apply these limits of 
    zoom
       .scaleExtent([minZoom, maxZoom]) // set min/max extent of zoom
       .translateExtent([[0, 0], [width, height]]) // set extent of panning
    ;
    // define X and Y offset for centre of map
    midX = ($("#divbasinmap").width() - (minZoom * width)) / 2;
    midY = ($("#divbasinmap").height() - (minZoom * height)) / 2;
    // change zoom transform to min zoom and centre offsets
    svg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(minZoom));
}

// on window resize
$(window).resize(function () {
    // Resize SVG
    svg
       .attr("width", $("#divbasinmap").width())
       .attr("height", $("#divbasinmap").height())
    ;
    initiateZoom();
});

//*******************************************************

var color = d3.scaleThreshold()
    .domain([1, 10, 20, 40, 70, 130, 200])
    .range(["#e1e1e1", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

function loadBasin(error, wsgrid, outlayer) {
    if (error) throw error;
    var dwidth = 220, dheight = 220;
    d3.select("#divbasinmap").select("svg").remove();
    $('#divbasinmap').html('');

    d3.select("#divday1").select("svg").remove();
    $('#divday1').html('');

    d3.select("#divday2").select("svg").remove();
    $('#divday2').html('');

    d3.select("#divday3").select("svg").remove();
    $('#divday3').html('');

    d3.select("#divday4").select("svg").remove();
    $('#divday4').html('');

    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');

    svg = d3.select("#divbasinmap").append("svg")
        .attr("width", width)
        .attr("height", height)
        //.attr("style", "margin:3px;")
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
    // Define a "max zoom" 
    maxZoom = 10 * minZoom;

    var outname = Object.keys(outlayer.objects)[0];
    // draw a path for each feature/country
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
    //.style("stroke-width", 1)
    .style("fill", "none")
    .style("stroke", "#800000");

    // draw a path for each feature/country
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
       // add a mouseover action to show name label for feature/country
        .on("mouseover", function (d) {
            $("#wstooltip").show();
            wsWarning(d);
            d3.select("#label" + d.properties.Subbasin).style("display", "block");
        })
        .on("mouseout", function (d) {
            $("#wstooltip").hide();
            d3.select("#label" + d.properties.Subbasin).style("display", "none");
        })
       // add an onclick action to zoom into clicked country
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

    // add the text to the label group showing country name
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

    watershedGroup.exit().remove();

    d3.selectAll('.wsbasin')
        .style('fill', function (d) {
            return null; //'#ccc';
        });

    initiateZoom();

    createLegend(color);

    loaddayBasin(wsgrid, outlayer);

    getdata();

    document.getElementById('imgclock').style.display = 'none';

}
Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};
function loaddayBasin(wsgrid, outlayer) {
    
    var dwidth = 220, dheight = 220;
    d3.select("#divday1").select("svg").remove();
    $('#divday1').html('');

    d3.select("#divday2").select("svg").remove();
    $('#divday2').html('');

    d3.select("#divday3").select("svg").remove();
    $('#divday3').html('');

    d3.select("#divday4").select("svg").remove();
    $('#divday4').html('');

    var day1 = new Date().toISOString().split('T')[0];
    var day2 = new Date().addDays(1).toISOString().split('T')[0];;
    var day3 = new Date().addDays(2).toISOString().split('T')[0];;
    var day4 = new Date().addDays(3).toISOString().split('T')[0];;

    
    //********************** Sate Grid start here **************************

    var dayproject = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

    var daypath = d3.geoPath().projection(dayproject);
    var dayobjname = Object.keys(wsgrid.objects)[0];

    var dayfeature = topojson.feature(wsgrid, wsgrid.objects[dayobjname]);

    var b = daypath.bounds(dayfeature),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / dwidth, (b[1][1] - b[0][1]) / dheight),
        t = [(dwidth - s * (b[1][0] + b[0][0])) / 2, (dheight - s * (b[1][1] + b[0][1])) / 2];

    dayproject
        .scale(s)
        .translate(t);

    var outname = Object.keys(outlayer.objects)[0];

    var daylst = ["day1", "day2", "day3", "day4"]
    for (var m = 0; m < daylst.length; m++) {
        // draw a path for each feature/country
        var dsvg = d3.select("#div" + daylst[m]).append("svg")
                .attr("width", dwidth)
                .attr("height", dheight)

        dsvg.selectAll(".boundry" + daylst[m])
            .data(topojson.feature(outlayer, outlayer.objects[outname]).features)
            .enter()
            .append("path")
            .attr("d", daypath)
            .attr("id", function (d, i) {
                return "boundry" + i + daylst[m];
            })
            .attr("class", "boundry")
             //.style("stroke-width", 1)
             .style("fill", "none")
             .style("stroke", "#800000");


        dsvg.selectAll("." + daylst[m])
        .data(topojson.feature(wsgrid, wsgrid.objects[dayobjname]).features)
        .enter()
        .append("path")
        .attr("d", daypath)
        .attr("id", function (d, i) {
            return "ws" + i + daylst[m];
        })
        .attr("class", +daylst[m])
            .style('fill', function (d) {
                return '#ccc';
            })
        // add a mouseover action to show name label for feature/country
         .on("mouseover", function (d) {
             $("#wstooltip").show();
             wsWarning(d);
             //d3.select("#label" + d.properties.Subbasin).style("display", "block");
         })
         .on("mouseout", function (d) {
             $("#wstooltip").hide();
             //d3.select("#label" + d.properties.Subbasin).style("display", "none");
         });

    }

}
function convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

function getdata() {
    if (basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Select Basin';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    process = document.getElementsByClassName("prscentered");
    process[0].style.display = 'block';

    var wsfile = './data/wrf/MND_2018-06-30_PCP_WRF.txt';

    fldname = 'rainfall';
    queue()
   .defer(d3.csv, wsfile)
   .await(loadwsdata);

    function loadwsdata(error, data) {
        if (error) {
            process[0].style.display = 'none';
            document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> Watershed file does not exists.';
            document.getElementById('divalert').style.display = 'inline';
            return console.warn(error);
        }

        d3.selectAll('.wsbasin')
            .style('fill', function (d) {
                var datavalue = data.filter(function (dv) {
                    return dv.lon == d.properties.lon && dv.lat == d.properties.lat;
                });

                if (datavalue.length != 0) {
                    gv = Number(datavalue[0]['rainfall']);
                    d.properties['rainfall'] = gv;
                    return color(gv);
                } else {
                    //console.log([d.properties.lon, d.properties.lat])
                    return null;
                }
            });

        process[0].style.display = 'none';
    }
}
function createLegend(colorScale) {

    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');
    svgleg = d3.select("#wslegend").append("svg")
        .attr('id', 'svglegend')
        .attr('style', 'text-anchor:end;width:95px;');

    var colorLegend = d3.legendColor()
        .labelFormat(d3.format(".1f"))
        .scale(colorScale)
        .orient('vertical')
        .cells(colorScale.domain())
        .cells(9)
        .labelAlign('start')
        .labelOffset(45)
        .labelDelimiter('-')
        .shapeWidth(25)
        .labels(d3.legendHelpers.thresholdLabels);

    svgleg.append("g")
      .call(colorLegend);
}
function wsWarning(d) {

    var tooltip = d3.select("#wstooltip");
    var html = "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td class='noBorder'> Long/Lat : [" + d.properties.lon + ", " + d.properties.lat + "]</td></tr>";
    html = html + "<tr><td class='noBorder'>Rainfall : " + Number(d.properties[fldname]).toFixed(1) + "</td></tr></table>";

    tooltip.html(html);
}

function cwcWarning(d) {

    var tooltip = d3.select("#cwctooltip");
    var html = "<table><tr><td class='noBorder'>" + cwcfldname + " : " + Number(d.properties[cwcfldname]).toFixed(1) + "</td></tr></table>"
    tooltip.html(html);
}

d3.rebind = function (target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
};

function d3_rebind(target, source, method) {
    return function () {
        var value = method.apply(source, arguments);
        return value === source ? target : value;
    };
}
