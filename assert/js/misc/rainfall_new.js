var basincode = null, basinname = null, gfssvg = null, wrfsvg = null, gfsfldname = null, wrffldname = null;
var playing = true, wrfplay = true, gfsplay = true, loadinggfs = false, loadingwrf = false;
var gfswidth = 448, gfsheight = 450, wrfwidth = 448, wrfheight = 450, gfsAttribute = 0, wrfAttribute = 0, comAttribute = 10;
var gfsArray = [], wrfArray = [];

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
            //console.log(fileSize);
        }
    });
    return fileSize;
}

function loadlayer() {

    if (basincode == '' || basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Basin Code does not exist in the JSON';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    var gfsgrid = './json/gfs/' + basincode + '.json';
    var wrfgrid = './json/wrf/' + basincode + '.json';
    var outlayer = './json/basin/' + basincode + '.json';

    var gfsdata = './data/gfs/forecast/' + basincode + '_data.txt?' + Math.random();
    var wrfdata = './data/wrf/forecast/' + basincode + '_data.txt?' + Math.random();

    if (fileExist(gfsgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> GFS Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        window.location.href = "index.html";
        return;
    }

    if (fileExist(wrfgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> WRF Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    if (fileExist(outlayer) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Outlayer (basin) Grid file does not exist';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    document.getElementById('divalert').style.display = 'none';

    animatesmap();

    if (fileExist(wrfdata) !== 200) {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> WRF Data file does not exist.';
        document.getElementById('divalert').style.display = 'inline';
        wrfplay = false;
    } else {
        document.getElementById('loaderContainer').style.display = 'block';
        queue()
         .defer(d3.csv, wrfdata)
         .defer(d3.json, wrfgrid)
         .defer(d3.json, outlayer)
         .await(loadwrfbasin);
    }

    if (fileExist(gfsdata) !== 200) {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> GFS Data file does not exist.';
        document.getElementById('divalert').style.display = 'inline';
        gfsplay = false;
    } else {
        document.getElementById('loaderContainer').style.display = 'block';
        queue()
         .defer(d3.csv, gfsdata)
         .defer(d3.json, gfsgrid)
         .defer(d3.json, outlayer)
         .await(loadgfsbasin);
    }

    wait(2000);

    if (gfsplay == true) {
        animategfsmap();
    }

    if (wrfplay == true) {
        animatewrfmap();
    }

    //if (gfsplay == true) {
    //    clearInterval(gfstimer);
    //}
    //if (wrfplay == true) {
    //    clearInterval(wrftimer);
    //}

    //if (wrfplay == true) {
    //    animatewrfmap();
    //}

    //if (gfsplay == true) {
    //    animategfsmap();
    //}
}
function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}
var color = d3.scaleThreshold()
    .domain([1, 10, 20, 40, 70, 130, 200])
    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

function loadgfsbasin(error, gfsdata, gfsgrid, outlayer) {
    if (error) {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> GFS Data file does not exist.';
        document.getElementById('divalert').style.display = 'inline';
        //throw error;
        return console.warn(error);
        //return;
    }

    var gfsGroup, gfsminZoom, gfsmaxZoom;

    //cwcsvg.selectAll(".cwcbasin").remove;
    //svg.selectAll(".gfsbasin").remove;
    //svg.selectAll(".label").remove;
    //var scale0 = 1;
    //grupopadre = d3.select("#divgfsmap");

    // Define map zoom behaviour
    var zoom = d3
       .zoom()
       .on("zoom", zoomed)
    ;

    d3.select("#divgfsmap").select("svg").remove();
    $('#divgfsmap').html('');

    gfswidth = $("#divgfsmap").width();
    gfsheight = $("#divgfsmap").height();

    gfssvg = d3.select("#divgfsmap").append("svg")
        .attr("width", gfswidth)
        .attr("height", gfsheight)
        //.attr("style", "margin:3px;")
        .call(zoom);

    gfsGroup = gfssvg
           .append("g")
           .attr("id", "map");

    //********************** Sate Grid start here **************************
    var gfsprojection = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

    var gfspath = d3.geoPath().projection(gfsprojection);
    var objname = Object.keys(gfsgrid.objects)[0];
    //gridobj = gfsgrid.objects[objname];

    //gfsgridlst = [];
    //var wsgeo = gfsgrid.objects[objname].geometries;
    //for (var i in wsgeo) {
    //    //console.log(gfsgeometries[i].properties.Grid_ID);
    //    gfsgridlst.push(wsgeo[i].properties.Subbasin);
    //}

    var gfsgeometries = gfsgrid.objects[objname].geometries;
    for (var i in gfsgeometries) {
        for (var j in gfsdata) {
            if (gfsgeometries[i].properties.lon == gfsdata[j].lon && gfsgeometries[i].properties.lat == gfsdata[j].lat) {
                for (var k in gfsdata[i]) {
                    if (k != 'lon' && k != 'lat') {
                        if (gfsArray.indexOf(k) == -1) {
                            gfsArray.push(k);
                        }
                        gfsgeometries[i].properties[k] = Number(gfsdata[j][k])
                    }
                }
                break;
            }
        }
    }

    var gfsfeature = topojson.feature(gfsgrid, gfsgrid.objects[objname]);

    var b = gfspath.bounds(gfsfeature),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / gfswidth, (b[1][1] - b[0][1]) / gfsheight),
        t = [(gfswidth - s * (b[1][0] + b[0][0])) / 2, (gfsheight - s * (b[1][1] + b[0][1])) / 2];

    gfsprojection
        .scale(s)
        .translate(t);

    //var boundary = topojson.mesh(gfsgrid, gfsgrid.objects[objname], function (a, b) { return a === b; });
    //drawOuterBoundary(gfspath, boundary);

    gfsminZoom = Math.max($("#divgfsmap").width() / gfswidth, $("#divgfsmap").height() / gfsheight);
    // Define a "max zoom" 
    gfsmaxZoom = 10 * gfsminZoom;

    var outname = Object.keys(outlayer.objects)[0];
    // draw a path for each feature/country
    outerlayer = gfsGroup
       .selectAll(".gfsboundry")
       .data(topojson.feature(outlayer, outlayer.objects[outname]).features)
       .enter()
       .append("path")
       .attr("d", gfspath)
       .attr("id", function (d, i) {
           return "gfsboundry" + d.properties.disID;
       })
       .attr("class", "gfsboundry")
       //.style("stroke-width", 1)
       .style("fill", "none")
       .style("stroke", "#800000");

    //console.log(objname);

    // draw a path for each feature/country
    countries = gfsGroup
       .selectAll(".gfsbasin")
       .data(topojson.feature(gfsgrid, gfsgrid.objects[objname]).features)
       .enter()
       .append("path")
       .attr("d", gfspath)
       .attr("id", function (d, i) {
           return "gfsbasin" + d.properties.Subbasin;
       })
       .attr("class", "gfsbasin")
       // add a mouseover action to show name label for feature/country
        .on("mouseover", function (d) {
            $("#gfstooltip").show();
            gfsWarning(d);
        })
        .on("mouseout", function (d) {
            $("#gfstooltip").hide();
        })
       // add an onclick action to zoom into clicked country
       .on("click", function (d, i) {
           d3.selectAll(".gfsbasin").classed("country-on", false);
           d3.select(this).classed("country-on", true);
           boxZoom(gfspath.bounds(d), gfspath.centroid(d), 10);
       })
    ;

    countryLabels = gfsGroup
       .selectAll("g")
       .data(topojson.feature(gfsgrid, gfsgrid.objects[objname]).features)
       .enter()
       .append("g")
       .attr("class", "wslabel")
       .attr("id", function (d) {
           return "label" + d.properties.Subbasin;
       })
       .attr("transform", function (d) {
           return (
              "translate(" + gfspath.centroid(d)[0] + "," + gfspath.centroid(d)[1] + ")"
           );
       })
        .style("display", "none")
       .on("click", function (d, i) {
           d3.selectAll(".gfsbasin").classed("country-on", false);
           d3.select("#gfsbasin" + d.properties.Subbasin).classed("country-on", true);
           boxZoom(gfspath.bounds(d), gfspath.centroid(d), 10);
       });


    d3.selectAll('.gfsbasin')
        .style('fill', function (d) {
            return '#ccc'; //;
        });

    gfsGroup.append("text")
        .attr("x", (gfswidth / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .attr("class", "shadow")
        .text(basinname + ' - GFS');

    gfsGroup.append("text")
        .attr("x", (gfswidth / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(basinname + ' - GFS');

    //**************** Zooming map ***************************************
    function getTextBox(selection) {
        selection.each(function (d) {
            d.bbox = this.getBBox();
        });
    }

    // apply zoom to gfsGroup
    function zoomed() {
        t = d3
           .event
           .transform
        ;
        gfsGroup.attr(
           "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
        );
    }

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
        zoomScale = Math.min(zoomScale, gfsmaxZoom);
        // limit to min zoom (handles large countries and countries that span the date line)
        zoomScale = Math.max(zoomScale, gfsminZoom);
        // Find screen pixel equivalent once scaled
        offsetX = zoomScale * zoomMidX;
        offsetY = zoomScale * zoomMidY;
        // Find offset to centre, making sure no gap at left or top of holder
        dleft = Math.min(0, $("svg").width() / 2 - offsetX);
        dtop = Math.min(0, $("svg").height() / 2 - offsetY);
        // Make sure no gap at bottom or right of holder
        dleft = Math.max($("svg").width() - gfswidth * zoomScale, dleft);
        dtop = Math.max($("svg").height() - gfsheight * zoomScale, dtop);
        // set zoom
        gfssvg
          .transition()
          .duration(500)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
          );
    }

    function initiateZoom() {
        // Define a "min zoom"
        gfsminZoom = Math.max($("#divgfsmap").width() / gfswidth, $("#divgfsmap").height() / gfsheight);
        // Define a "max zoom" 
        gfsmaxZoom = 10 * gfsminZoom;
        //apply these limits of 
        zoom
           .scaleExtent([gfsminZoom, gfsmaxZoom]) // set min/max extent of zoom
           .translateExtent([[0, 0], [gfswidth, gfsheight]]) // set extent of panning
        ;
        // define X and Y offset for centre of map
        midX = ($("#divgfsmap").width() - (gfsminZoom * gfswidth)) / 2;
        midY = ($("#divgfsmap").height() - (gfsminZoom * gfsheight)) / 2;
        // change zoom transform to min zoom and centre offsets
        gfssvg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(gfsminZoom));
    }

    // on window resize
    $(window).resize(function () {
        // Resize SVG
        gfssvg
           .attr("width", $("#divgfsmap").width())
           .attr("height", $("#divgfsmap").height())
        ;
        initiateZoom();
    });

    //*******************************************************

    gfsGroup.exit().remove();
    initiateZoom();

    createLegend(color);
    document.getElementById('loaderContainer').style.display = 'none';
}
var gfstimer, wrftimer;
function animatesmap() {
    d3.select('#play')
         .on('click', function () {
             if (playing == false) {
                 if (gfsplay == true) {
                     animategfsmap();
                 }
                 if (wrfplay == true) {
                     animatewrfmap();
                 }
                 playing = true
                 d3.select(this).style("background-image", "url('images/pause.png')");
             } else {
                 if (gfsplay == true) {
                     clearInterval(gfstimer);
                 }
                 if (wrfplay == true) {
                     clearInterval(wrftimer);
                 }
                 d3.select(this).style("background-image", "url('images/play.png')");
                 playing = false;
             }
         });
}
function animategfsmap() {

    gfstimer = setInterval(function () {
        if (comAttribute < 5) {
            comAttribute += 1;
        } else {
            comAttribute = 0;
        }

        d3.selectAll('.gfsbasin').transition()
          .duration(1000)
          .style('fill', function (d) {
              return color(d.properties[gfsArray[comAttribute]]);
          });
        gfsfldname = gfsArray[comAttribute];
        d3.select('#gfslabel').html(gfsArray[comAttribute]);
    }, 2000);
}

function loadwrfbasin(error, wrfdata, wrfgrid, outlayer) {
    if (error) {
        document.getElementById('loaderContainer').style.display = 'none';
        document.getElementById('divmsg').innerHTML = '<strong>Alert! </strong> WRF Data file does not exist.';
        document.getElementById('divalert').style.display = 'inline';
        //throw error;
        return console.warn(error);
        //return;
    }

    var wrfGroup, wrfminZoom, wrfmaxZoom;

    //cwcsvg.selectAll(".cwcbasin").remove;
    //svg.selectAll(".wrfbasin").remove;
    //svg.selectAll(".label").remove;
    //var scale0 = 1;
    //grupopadre = d3.select("#divwrfmap");

    // Define map zoom behaviour
    var zoom = d3
       .zoom()
       .on("zoom", zoomed)
    ;

    d3.select("#divwrfmap").select("svg").remove();
    $('#divwrfmap').html('');

    wrfwidth = $("#divwrfmap").width();
    wrfheight = $("#divwrfmap").height();

    wrfsvg = d3.select("#divwrfmap").append("svg")
        .attr("width", wrfwidth)
        .attr("height", wrfheight)
        //.attr("style", "margin:3px;")
        .call(zoom);

    wrfGroup = wrfsvg
           .append("g")
           .attr("id", "map");

    //********************** Sate Grid start here **************************
    var wrfprojection = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

    var wrfpath = d3.geoPath().projection(wrfprojection);
    var objname = Object.keys(wrfgrid.objects)[0];
    //gridobj = wrfgrid.objects[objname];

    //wrfgridlst = [];
    //var wsgeo = wrfgrid.objects[objname].geometries;
    //for (var i in wsgeo) {
    //    //console.log(gfsgeometries[i].properties.Grid_ID);
    //    wrfgridlst.push(wsgeo[i].properties.Subbasin);
    //}

    var wrfgeometries = wrfgrid.objects[objname].geometries;
    for (var i in wrfgeometries) {
        for (var j in wrfdata) {
            if (wrfgeometries[i].properties.lon == wrfdata[j].lon && wrfgeometries[i].properties.lat == wrfdata[j].lat) {
                for (var k in wrfdata[i]) {
                    if (k != 'lon' && k != 'lat') {
                        if (wrfArray.indexOf(k) == -1) {
                            wrfArray.push(k);
                        }
                        wrfgeometries[i].properties[k] = Number(wrfdata[j][k])
                    }
                }
                break;
            }
        }
    }

    var wrffeature = topojson.feature(wrfgrid, wrfgrid.objects[objname]);

    var b = wrfpath.bounds(wrffeature),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / wrfwidth, (b[1][1] - b[0][1]) / wrfheight),
        t = [(wrfwidth - s * (b[1][0] + b[0][0])) / 2, (wrfheight - s * (b[1][1] + b[0][1])) / 2];

    wrfprojection
        .scale(s)
        .translate(t);

    //var boundary = topojson.mesh(wrfgrid, wrfgrid.objects[objname], function (a, b) { return a === b; });
    //drawOuterBoundary(wrfpath, boundary);

    wrfminZoom = Math.max($("#divwrfmap").width() / wrfwidth, $("#divwrfmap").height() / wrfheight);
    // Define a "max zoom" 
    wrfmaxZoom = 10 * wrfminZoom;

    var outname = Object.keys(outlayer.objects)[0];
    // draw a path for each feature/country
    outerlayer = wrfGroup
       .selectAll(".wrfboundry")
       .data(topojson.feature(outlayer, outlayer.objects[outname]).features)
       .enter()
       .append("path")
       .attr("d", wrfpath)
       .attr("id", function (d, i) {
           return "wrfboundry" + d.properties.disID;
       })
       .attr("class", "wrfboundry")
       //.style("stroke-width", 1)
       .style("fill", "none")
       .style("stroke", "#800000");

    //console.log(objname);

    // draw a path for each feature/country
    countries = wrfGroup
       .selectAll(".wrfbasin")
       .data(topojson.feature(wrfgrid, wrfgrid.objects[objname]).features)
       .enter()
       .append("path")
       .attr("d", wrfpath)
       .attr("id", function (d, i) {
           return "wrfbasin" + d.properties.Subbasin;
       })
       .attr("class", "wrfbasin")
       // add a mouseover action to show name label for feature/country
        .on("mouseover", function (d) {
            $("#wrftooltip").show();
            wrfWarning(d);
        })
        .on("mouseout", function (d) {
            $("#wrftooltip").hide();
        })
       // add an onclick action to zoom into clicked country
       .on("click", function (d, i) {
           d3.selectAll(".wrfbasin").classed("country-on", false);
           d3.select(this).classed("country-on", true);
           boxZoom(wrfpath.bounds(d), wrfpath.centroid(d), 10);
       })
    ;

    countryLabels = wrfGroup
       .selectAll("g")
       .data(topojson.feature(wrfgrid, wrfgrid.objects[objname]).features)
       .enter()
       .append("g")
       .attr("class", "wslabel")
       .attr("id", function (d) {
           return "label" + d.properties.Subbasin;
       })
       .attr("transform", function (d) {
           return (
              "translate(" + wrfpath.centroid(d)[0] + "," + wrfpath.centroid(d)[1] + ")"
           );
       })
        .style("display", "none")
       .on("click", function (d, i) {
           d3.selectAll(".wrfbasin").classed("country-on", false);
           d3.select("#wrfbasin" + d.properties.Subbasin).classed("country-on", true);
           boxZoom(wrfpath.bounds(d), wrfpath.centroid(d), 10);
       });


    d3.selectAll('.wrfbasin')
        .style('fill', function (d) {
            return '#ccc'; //;
        });

    wrfGroup.append("text")
        .attr("x", (wrfwidth / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .attr("class", "shadow")
        .text(basinname + ' - WRF');

    wrfGroup.append("text")
        .attr("x", (wrfwidth / 2))
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(basinname + ' - WRF');

    //**************** Zooming map ***************************************
    function getTextBox(selection) {
        selection.each(function (d) {
            d.bbox = this.getBBox();
        });
    }

    // apply zoom to wrfGroup
    function zoomed() {
        t = d3
           .event
           .transform
        ;
        wrfGroup.attr(
           "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
        );
    }

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
        zoomScale = Math.min(zoomScale, wrfmaxZoom);
        // limit to min zoom (handles large countries and countries that span the date line)
        zoomScale = Math.max(zoomScale, wrfminZoom);
        // Find screen pixel equivalent once scaled
        offsetX = zoomScale * zoomMidX;
        offsetY = zoomScale * zoomMidY;
        // Find offset to centre, making sure no gap at left or top of holder
        dleft = Math.min(0, $("svg").width() / 2 - offsetX);
        dtop = Math.min(0, $("svg").height() / 2 - offsetY);
        // Make sure no gap at bottom or right of holder
        dleft = Math.max($("svg").width() - wrfwidth * zoomScale, dleft);
        dtop = Math.max($("svg").height() - wrfheight * zoomScale, dtop);
        // set zoom
        wrfsvg
          .transition()
          .duration(500)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(dleft, dtop).scale(zoomScale)
          );
    }

    function initiateZoom() {
        // Define a "min zoom"
        wrfminZoom = Math.max($("#divwrfmap").width() / wrfwidth, $("#divwrfmap").height() / wrfheight);
        // Define a "max zoom" 
        wrfmaxZoom = 10 * wrfminZoom;
        //apply these limits of 
        zoom
           .scaleExtent([wrfminZoom, wrfmaxZoom]) // set min/max extent of zoom
           .translateExtent([[0, 0], [wrfwidth, wrfheight]]) // set extent of panning
        ;
        // define X and Y offset for centre of map
        midX = ($("#divwrfmap").width() - (wrfminZoom * wrfwidth)) / 2;
        midY = ($("#divwrfmap").height() - (wrfminZoom * wrfheight)) / 2;
        // change zoom transform to min zoom and centre offsets
        wrfsvg.call(zoom.transform, d3.zoomIdentity.translate(midX, midY).scale(wrfminZoom));
    }

    // on window resize
    $(window).resize(function () {
        // Resize SVG
        wrfsvg
           .attr("width", $("#divwrfmap").width())
           .attr("height", $("#divwrfmap").height())
        ;
        initiateZoom();
    });

    //*******************************************************

    wrfGroup.exit().remove();
    initiateZoom();

    createLegend(color);
    document.getElementById('loaderContainer').style.display = 'none';
}

function animatewrfmap() {

    wrftimer = setInterval(function () {
        if (comAttribute < 3) {
            //wrfAttribute += 1;
            d3.selectAll('.wrfbasin').transition()
              .duration(1000)
              .style('fill', function (d) {
                  return color(d.properties[wrfArray[comAttribute]]);
              });
            wrffldname = wrfArray[comAttribute];
            d3.select('#wrflabel').html(wrfArray[comAttribute]);
        }
        //else {
        //    wrfAttribute = 0;
        //}

    }, 2000);
}

//function convertRange(value, r1, r2) {
//    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
//}

function createLegend(colorScale) {

    d3.select("#divlegend").select("svg").remove();
    $('#divlegend').html('');
    var svgleg = d3.select("#divlegend").append("svg")
        .attr('id', 'svglegend')
        .attr('style', 'width:95px;');
    //.attr('height', 35);
    //.style("font-size", "8px");

    //var thresholdScale = d3.scaleThreshold()
    //      .domain([0, 1000, 2500, 5000, 10000])
    //      .range(d3.range(6)
    //      .map(function (i) { return "q" + i + "-9" }));

    //var colorLegend = d3.legendColor()
    //    .labelFormat(d3.format(".1f"))
    //    .scale(colorScale)
    //    .orient('vertical')
    //    .cells(colorScale.domain())
    //    .cells(9)
    //    //.shapeHeight(34)
    //    //.labelAlign('end')
    //    .labelOffset(60)
    //    .labelDelimiter('-')
    //    .shapeWidth(25)
    //    .labels(d3.legendHelpers.thresholdLabels)
    //;
    var colorLegend = d3.legendColor()
        .labelFormat(d3.format(".1f"))
        .labels(d3.legendHelpers.thresholdLabels)
        //.useClass(true)
        //.labelOffset(60)
        //.labelAlign('left')
        .scale(colorScale)

    svgleg.append("g")
      .call(colorLegend);


    /*
----legendHelpers.thresholdLabels----
function({
  i,
  genLength,
  generatedLabels,
  labelDelimiter
}) {
  if (i === 0) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `)
    return `Less than ${values[1]}`
  } else if (i === genLength - 1) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `)
    return `${values[0]} or more`
  }
  return generatedLabels[i]
}

*/

}
function gfsWarning(d) {

    var tooltip = d3.select("#gfstooltip");
    var html = "<table><tr><td class='noBorder'>Rainfall(mm) : " + Number(d.properties[gfsfldname]).toFixed(1) + "</td></tr></table>";
    tooltip.html(html);
    //$("#tooltip-container").hide();
}

function wrfWarning(d) {

    var tooltip = d3.select("#wrftooltip");
    var html = "<table><tr><td class='noBorder'>Rainfall(mm) : " + Number(d.properties[wrffldname]).toFixed(1) + "</td></tr></table>"
    tooltip.html(html);
    //$("#tooltip-container").hide();
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
