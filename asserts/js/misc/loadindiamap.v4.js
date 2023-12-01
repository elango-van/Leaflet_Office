var gridpath, gridproject, basincode = null, basinname = null, svg = null, cwcsvg = null, comprm;
var width = 448, height = 450;

var margin = { top: 20, right: 60, bottom: 50, left: 60 },
    cwidth = 462 - margin.left - margin.right,
    cheight = 200 - margin.top - margin.bottom,

    cwcwidth = 470,
    cwcheight = 225;

function loadindiamap() {

    document.getElementById('loaderContainer').style.display = 'block';

    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');

    d3.select("#divchart").select("svg").remove();
    $('#divchart').html('');

    d3.select('#wstooltip').selectAll("*").remove();
    $('#wstooltip').html('');

    d3.select('#cwctooltip').selectAll("*").remove();
    $('#cwctooltip').html('');

    d3.select("#divtool").selectAll("*").remove();
    $('#divtool').html('');

    basincode = null;
    d3.json("./json/AllBasin_WGS84_01.json", function (error, indiamap) {
        if (error) {
            document.getElementById('loaderContainer').style.display = 'none';
            document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> India map does not exists';
            document.getElementById('divalert').style.display = 'inline';
            return;
            throw error;
        }
        d3.select("#divcwcbasin").select("svg").remove();
        $('#divcwcbasin').html('');

        d3.select("#divbasinmap").select("svg").remove();
        $('#divbasinmap').html('');
        svg = d3.select("#divbasinmap").append("svg")
            .attr("width", width)
            .attr("height", height);
        //.attr("style", 'margin-top:5px;margin-left:12px;');

        //********************** Sate Grid start here **************************
        gridproject = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

        gridpath = d3.geoPath().projection(gridproject);
        var objname = Object.keys(indiamap.objects)[0];
        //gridobj = indiamap.objects[objname];


        var gridmap = topojson.feature(indiamap, indiamap.objects[objname]);

        var b = gridpath.bounds(gridmap),
            s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        //vx = b.x;
        //vy = b.y;
        //vh = b.height;
        //vw = b.width;

        gridproject
            .scale(s)
            .translate(t);

        // ***************** Adding State Map *********************
        svg.selectAll(".allbasin").remove;
        svg.selectAll(".allbasin")
              .data(topojson.feature(indiamap, indiamap.objects[objname]).features)
              .enter().append("path")
              .attr("class", "allbasin")
              .attr("id", function (d) { return d.properties.Code; }, true)
              .attr("d", gridpath)
            .on("mouseover", function (d) {
                $("#bsntooltip").show();
                var tooltip = d3.select("#bsntooltip");
                
                var clientRect = this.getBoundingClientRect();

                //console.log(clientRect);
                //var x = event.clientX;
                //var y = event.clientY;

                //console.log(d3.event);

                //tooltip.style("left", (clientRect.left + clientRect.width/2) + "px");
                //tooltip.style("top", (clientRect.top - clientRect.height/2) + "px");

                tooltip.style("left", d3.event.offsetX+10 + "px");
                tooltip.style("top", d3.event.offsetY - 20 + "px");

                var html = "<table><tr><td class='noBorder'>" + d.properties.Basin_Name + "</td></tr></table>"
                tooltip.html(html);
            })
           .on("mousemove", function (d) {
               $("#bsntooltip").show();
               var tooltip = d3.select("#bsntooltip");

               var clientRect = this.getBoundingClientRect();

               //console.log(clientRect);
               //var x = event.clientX;
               //var y = event.clientY;

               //console.log(d3.event);

               //tooltip.style("left", (clientRect.left + clientRect.width/2) + "px");
               //tooltip.style("top", (clientRect.top - clientRect.height/2) + "px");

               tooltip.style("left", d3.event.offsetX+10 + "px");
               tooltip.style("top", d3.event.offsetY-20 + "px");

               var html = "<table><tr><td class='noBorder'>" + d.properties.Basin_Name + "</td></tr></table>"
               tooltip.html(html);
           })
            .on("mouseout", function (d) {
                $("#bsntooltip").hide();
            })
            .on("click", function (d) {
                basincode = d.properties.Code;
                basinname = d.properties.Basin_Name;
                window.location.href = './imdgfs.html?code=' + basincode + '&name=' + basinname;
            });
        bboxes = boundingExtent(topojson.feature(indiamap, indiamap.objects[objname]).features, gridpath);

        svg.selectAll(".label").remove;
        svg.selectAll(".label")
            .data(topojson.feature(indiamap, indiamap.objects[objname]).features)
            .enter().append("text")
            .attr("transform", function (d) { return "translate(" + gridpath.centroid(d) + ")"; })
            .attr('text-anchor', 'middle')
            .style("font-size", function (d, i) {
                var xy = Math.min(bboxes[i].height, bboxes[i].width);
                xy = xy * .2;
                if (xy > 8)
                    xy = 8;
                return xy + "px";
            })
            .text(function (d) {
                return d.properties.Basin_Name;
            });

        //createLegend(color);
        document.getElementById('loaderContainer').style.display = 'none';

    });

    //$('input[type="radio":checked]').each(function () {
    //    $(this).prop('checked', false);
    //});

    $("input:radio[name='Models']").each(function (i) {
        this.checked = false;
    });
    $("input:radio[name='cwcModels']").each(function (i) {
        this.checked = false;
    });

}
loadindiamap();

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

//function readTextFile(file, callback) {
//    console.log(file);
//    var rawFile = new XMLHttpRequest();
//    rawFile.overrideMimeType("text/html");
//    rawFile.open("GET", file, true);
//    rawFile.onreadystatechange = function () {
//        console.log(rawFile.readyState);
//        console.log(rawFile.status);
//        if (rawFile.readyState === 4 && rawFile.status == "200") {
//            callback(rawFile.responseText);
//        }
//    }
//    rawFile.send();
//}

////usage:
//readTextFile("./data/MND_gfssubwebsite.txt", function (text) {
//    //var data = JSON.parse(text);
//    console.log(text);
//});
