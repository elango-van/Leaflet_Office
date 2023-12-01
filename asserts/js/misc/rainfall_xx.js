
var basincode = null, basinname = null;
var gfswidth = 448, gfsheight = 450, wrfwidth = 448, wrfheight = 450;

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

function loadlayer() {
    
    if (basincode == '' || basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Basin Code does not exists in the JSON';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    var gfsgrid = './json/gfs/' + basincode + '.json';
    var wrfgrid = './json/wrf/' + basincode + '.json';
    var outlayer = './json/basin/' + basincode + '.json';

    if (fileExists(gfsgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> GFS Grid file does not exists';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    if (fileExists(wrfgrid) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> WRF Grid file does not exists';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    if (fileExists(outlayer) !== 200) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> outlayer (basin) Grid file does not exists';
        document.getElementById('divalert').style.display = 'inline';
        return false;
    }

    document.getElementById('divalert').style.display = 'none';
    document.getElementById('imgclock').style.display = 'block';

    queue()
     .defer(d3.json, gfsgrid)
     .defer(d3.json, wrfgrid)
     .defer(d3.json, outlayer)
     .await(loadgfsbasin);

}

//*******************************************************
var color = d3.scaleThreshold()
    .domain([1, 10, 20, 40, 70, 130, 200])
    .range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + parseInt(days));
    return this;
};

function loadgfsbasin(error, gfsgrid, wrfgrid, outlayer) {
    if (error) throw error;

    d3.select("#divgfsmap").select("svg").remove();
    $('#divgfsmap').html('');

    d3.select("#divwrfmap").select("svg").remove();
    $('#divwrfmap').html('');

    //var day1 = new Date().toISOString().split('T')[0];
    //var day2 = new Date().addDays(1).toISOString().split('T')[0];;
    //var day3 = new Date().addDays(2).toISOString().split('T')[0];;
    //var day4 = new Date().addDays(3).toISOString().split('T')[0];;

    //********************** Sate Grid start here **************************

    var gfsprojection = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

    var gfspath = d3.geoPath().projection(gfsprojection);
    var gfsobjname = Object.keys(gfsgrid.objects)[0];

    var gfsfeature = topojson.feature(gfsgrid, gfsgrid.objects[gfsobjname]);

    var b = gfspath.bounds(gfsfeature),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / gfswidth, (b[1][1] - b[0][1]) / gfsheight),
        t = [(gfswidth - s * (b[1][0] + b[0][0])) / 2, (gfsheight - s * (b[1][1] + b[0][1])) / 2];

    gfsprojection
        .scale(s)
        .translate(t);

    var outname = Object.keys(outlayer.objects)[0];

    var dsvg = d3.select("#divgfsmap").append("svg")
                .attr("width", gfswidth)
                .attr("height", gfsheight)

        dsvg.selectAll(".gfsboundry")
            .data(topojson.feature(outlayer, outlayer.objects[outname]).features)
            .enter()
            .append("path")
            .attr("d", gfspath)
            .attr("id", "gfsboundry")
            .attr("class", "gfsboundry")
             .style("fill", "none")
             .style("stroke", "#800000");


        dsvg.selectAll(".gfsbasin")
        .data(topojson.feature(gfsgrid, gfsgrid.objects[gfsobjname]).features)
        .enter()
        .append("path")
        .attr("d", gfspath)
        .attr("id", function (d, i) {
            return "gfs" + d.properties.lon + "_" + d.properties.lat;
        })
        .attr("class", "gfsbasin")
            .style('fill', function (d) {
                return '#eee';
            })
         .on("mouseover", function (d) {
             $("#gfstooltip").show();
             wsWarning(d);
         })
         .on("mouseout", function (d) {
             $("#gfstooltip").hide();
         });
    

    createLegend(color);
    document.getElementById('imgclock').style.display = 'none';
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

    var tooltip = d3.select("#gfstooltip");
    var html = "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td class='noBorder'> Long/Lat : [" + d.properties.lon + ", " + d.properties.lat + "]</td></tr>";
    html = html + "<tr><td class='noBorder'>Rainfall : " + Number(d.properties[fldname]).toFixed(1) + "</td></tr></table>";

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