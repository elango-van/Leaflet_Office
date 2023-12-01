//var arr1 = ['a', 'b', 'c', 'd', 'e', 'f'];
//var arr2 = arr1;  // Reference arr1 by another variable 
//arr1 = [];
//console.log(arr2); // Output ['a','b','c','d','e','f']
//console.log(arr1);

var day = 0, prvws, prvcwc, prvwssel, prvcwcsel, prvrchsel, prvrch;
var wsflst = [], cwcflst = [], rchflst = [];
//function handleClick(myRadio) {
//    optionRun = myRadio.value;

//    if (curParameter != null && curIndicatortype != null && curIndicatorname != null)
//        getdata(curParameter, curIndicatortype, curIndicatorname);
//}
function dayselect(d) {
    day = d;

    if (prvws && prvwssel) {
        getdata(prvws, prvwssel);
    }
    if (prvcwc && prvcwcsel) {
        getdata(prvcwc, prvcwcsel);
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

function plotchart(d) {

    //******************************* Vertical Chart ************************
    var div = d3.select("#divtool").attr("class", "tbtoolTip");

    //var xScaleRange = data.length * 30;
    //var xScale = d3.scale.ordinal()
    //    .rangeRoundBands([width / 2 - xScaleRange, width / 2 + xScaleRange], 0.2);

    //var tmpwidth = datavalue.length * 12;
    //if (tmpwidth > cwidth) {
    //    cwidth = tmpwidth;
    //    ////var xScaleRange = data.length * 30;
    //    //var x = d3.scale.ordinal()
    //    //    .rangeRoundBands([cwidth / 2 - tmpwidth, cwidth / 2 + tmpwidth], 0.2);
    //}

    //var x = d3.scale.ordinal()
    //    //.range([0, cwidth]);
    //    .rangeRoundBands([0, cwidth], 0.2);
    var code = d.properties.SUBBASIN
    var cwcfile = './data/gfs/' + cwcflst[0];
    //console.log(cwcfile);
    //console.log(code);

    //for (var c = 0; c < cwcflst.length; c++) {
    //    if (cwcflst[c].includes(code)) {
    //        cwcfile = './data/gfs/' + cwcflst[c];
    //        break;
    //    }
    //}

    d3.csv(cwcfile, function (error, datavalue) {

        //var parser = d3.timeParse("%m/%d/%Y");
        var dateParse = d3.timeParse("%m/%d/%Y");
        var dateFormat = d3.timeFormat("%d-%b-%Y");

        datavalue.forEach(function (d) {
            //console.log(dateFormat(dateParse(d.Date)));
            d.Date = dateFormat(dateParse((d.Date)));
            d.Rainfall = +d.Rainfall;
            d.Inflow = +d.Inflow;
        });

        //data = filterJSON(datavalue, 'Subbasin', code);
        var data = datavalue.filter(function (dv) {
            return dv.Subbasin == code;
        });

        //console.table(data);

        var norec = data.length;

        var tmpwidth = (norec + 0.5) * 10;
        if (tmpwidth < cwidth)
            tmpwidth = cwidth;

        var x = d3.scaleBand()
            //.domain(d3.range(norec))
            .rangeRound([0, tmpwidth], 0.5);
        //  .rangeRoundBands([0, tmpwidth]);
        //console.log(x.rangeBands());

        //var x = d3.scale.linear()
        //      .domain([0, d3.max(datavalue, function (d) { return d[fldname]; })])
        //      .range([margin.left, margin.right]);

        var y1 = d3.scaleLinear()
            .range([cheight, 0]);

        var y2 = d3.scaleLinear()
            .range([cheight, 0]);

        //var tf = d3.time.format("%m-%d-%Y").parse;
        var xAxis = d3.axisBottom(x)
        //.scale(x)
        //.orient("bottom");
        //.tickFormat(tf);

        var y1Axis = d3.axisLeft(y1)
        //.scale(y1)
        //.orient("left");

        var y2Axis = d3.axisRight(y2)
            //.scale(y2)
            //.orient("right")
            .ticks(6)
            .tickFormat(d3.format(".1f"));

        var valueline = d3.line()
            .x(function (d) { return x(d.Date); })
            .y(function (d) { return y1(Number(d.Inflow)); });

        //console.log([cwidth, cheight]);
        ////====================== chart ========================
        d3.select("#divchart").select("svg").remove();
        $('#divchart').html('');

        var chart = d3.select("#divchart").append('svg')
            .attr("width", tmpwidth + margin.left + margin.right)
            //.attr("height", cheight + margin.top)
            //.attr("width", cwidth + margin.left)
            .attr("height", cheight + margin.top + margin.bottom - 15)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //chart.selectAll("*").remove();
        //y.domain([0, d3.max(datavalue, function (d) { return d[fldname]; })]);
        //y.domain([d3.min(datavalue, function (d) { return d[fldname]; }) * 0.9, d3.max(datavalue, function (d) { return d[fldname]; })]);

        //var monthNameFormat = d3.time.format("%m/%d/%Y");
        //return monthNameFormat(new Date(d));

        x.domain(data.map(function (d) { return d.Date; }));
        y2.domain([d3.min(data, function (d) { return d.Rainfall; }) * 0.95, d3.max(data, function (d) { return d.Rainfall; })]);
        y1.domain([d3.min(data, function (d) { return d.Inflow; }) * 0.95, d3.max(data, function (d) { return d.Inflow; })]);

        //y2.domain([d3.max(data, function (d) { return d.Rainfall; }), d3.min(data, function (d) { return d.Rainfall; }) * 0.95])
        //y2.range([0, cheight])//note the range is inverted

        chart.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(-15,155)")
         .call(xAxis)
         .selectAll("text")
        .attr("x", "-25")
        .attr("y", "5")
        .attr("transform", "rotate(-30)")
        .style("font-family", "sans-serif")
 		.style("font-size", "9px")
        ;

        chart.append("g")
            .attr("class", "y1 axis")
            .attr("transform", "translate(-15 ,0)")
            .call(y1Axis);

        chart.append("g")
             .attr("class", "y2 axis")
            .attr("transform", "translate(367 ,0)")
             .call(y2Axis);

        //chart.selectAll(".bar")
        //    .data(data)
        //    .enter().append("rect")
        //      .attr("class", "bar")
        //      .attr("x", function (d) { return x(d.Date); })
        //      .attr("y", function (d) { return y(d.Rainfall); })
        //      .attr("width", x.bandwidth())
        //      .attr("height", function (d) { return height - y(d.Rainfall); });

        chart.selectAll(".bar")
            .data(data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return x(d.Date) - 15;
            })
            .attr("y", function (d) {
                return y2(d.Rainfall);
            })
            .attr("height", function (d) {
                return cheight - y2(d.Rainfall);
            })
            .attr("width", x.rangeRound())
        .on("mousemove", function (d) {
            var rect = document.getElementById('divchart').getBoundingClientRect();

            //div.style("left", d3.event.pageX - (rect.top * 1.95) + "px");
            //div.style("top", d3.event.pageY - (rect.left * 0.6) + "px");

            //div.style("left", rect.left + 80 + "px");
            //div.style("top", rect.top + 70 + "px");

            //div.style("left", (d3.event.clientX - rect.top) - 80 + "px");
            //div.style("top", (d3.event.clientY - rect.left) + 70 + "px");

            //var point = d3.mouse(this), p = { x: point[0], y: point[1] };
            //div.style("left", p.x + "px");
            //div.style("top", p.y + "px");

            div.style("left", d3.event.pageX + "px");
            div.style("top", d3.event.pageY - 50 + "px");

            div.style("display", "inline-block");
            div.html(d.Date + "<br>" + Number(d.Rainfall).toFixed(1));
        })
        .on("mouseout", function (d) {
            div.style("display", "none");
        });

        chart.append("path")        // Add the valueline path.
            //.data(data)
            .attr("d", valueline(data))
            //.attr("transform", "translate(" + 5 + ",0)")
            .attr("width", x.rangeRound())
            .attr("style", "stroke: red;stroke-width: 3;fill: none;")
        ;
        //.style("stroke-dasharray", "5,5");

        //// gridlines in y axis function
        //function make_y_gridlines() {
        //    return d3.axis.left(y2Axis)
        //        .ticks(5)
        //}

        //// gridlines in x axis function
        //function make_x_gridlines() {
        //    return d3.axis.bottom(xAxis)
        //        .ticks(5)
        //}

        //// add the X gridlines
        //svg.append("g")
        //    .attr("class", "grid")
        //    .attr("transform", "translate(0," + cheight + ")")
        //    .call(make_x_gridlines()
        //        .tickSize(-cheight)
        //        .tickFormat("")
        //    )

        //// add the Y gridlines
        //svg.append("g")
        //    .attr("class", "grid")
        //    .call(make_y_gridlines()
        //        .tickSize(-cwidth)
        //        .tickFormat("")
        //    )

        chart.selectAll(".text")
              .data(data)
              .enter()
              .append("text")
              .attr("class", "label")
              .attr("x", (function (d) { return (x(d.Date)) - 11; })) //+ x.rangeBand() / 2
              .attr("y", function (d) { return y2(d.Rainfall) + 4; })
              .attr("dy", ".75em")
              .style("font-family", "sans-serif")
			  .style("font-size", "10px")
              .text(function (d) {
                  if (Number(d.Rainfall) !== 0)
                      return d.Rainfall;
                  else
                      return null;
              });

        //chart.selectAll(".text")
        //	   .data(data)
        //	   .enter()
        //	   .append("text")
        //	   .text(function (d) {
        //	       return d.Rainfall;
        //	   })
        //	   .attr("x", function (d, i) {
        //	       return i * (cwidth / data.length);
        //	   })
        //	   .attr("y", function (d) {
        //	       return cheight - (d.Rainfall * 4) - 15;
        //	   })
        //	   .attr("font-family", "sans-serif")
        //	   .attr("font-size", "11px")
        //	   .attr("fill", "black");

        chart.selectAll("circle")
             .data(data)
            .enter()
            .append("circle")
            .attr("class", "circle")
            .style("stroke", "yellow")
            .style("stroke-width", "2px")
            .style("fill", "red")
            .attr("cx", function (d) { return x(d.Date); })
            .attr("cy", function (d) { return y1(d.Inflow); })
            .attr("r", function (d) { return 5; })
        .on("mousemove", function (d) {
            //console.log(d);
            var rect = document.getElementById('divchart').getBoundingClientRect();

            div.style("left", d3.event.pageX + "px");
            div.style("top", d3.event.pageY - 50 + "px");

            div.style("display", "inline-block");
            div.html(d.Date + "<br>" + Number(d.Inflow).toFixed(1));
        })
        .on("mouseout", function (d) {
            div.style("display", "none");
        });

        //chart.append("text")
        //    .data(data)
        //    .attr("class", "y2 axis")
        //    .attr("text-anchor", "middle")
        //    .attr("style", "font-size:8pt;fill:red;")
        //    .attr("x", cwidth * 0.02)
        //    .attr("y", cheight * 0.05)
        //    //.attr("x", cwidth / 2)
        //    //.attr("y", cheight + 30)
        //    .text(function (d) {
        //        return d.Rainfall;
        //    });

        //chart.append("text")
        //    .attr("class", "x axis")
        //    .attr("text-anchor", "middle")
        //    .attr("style", "font-size:8pt;")
        //    .attr("x", cwidth / 2)
        //    .attr("y", cheight + 30)
        //    .text("Date");

        chart.append("text")
            .attr("class", "y axis")
            .attr("text-anchor", "middle")
            .attr("x", -60)
            .attr("y", -45)
            .attr("style", "font-size:8pt;")
            //.attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text('Discharge (cumecs)');


        chart.append("text")
            .attr("class", "y axis")
            .attr("text-anchor", "middle")
            .attr("x", -65)
            .attr("y", 410)
            .attr("style", "font-size:8pt;")
            //.attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text('Rainfall (mm)');


        /////=== Lengedn
        var color = d3.scaleBand()
            .domain(["Rainfall", "Inflow"])
            .range(["skyblue", "red"]);

        var n = 1;
        var itemWidth = 80;
        var itemHeight = 18;

        var legendGroup = chart.append("g")
                .attr("transform", "translate(" + (cwidth - 150) + ",10)");

        var legend = legendGroup.selectAll(".legend")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")"; })
            .attr("class", "legend");

        var rects = legend.append('rect')
            .attr("width", 20)
            .attr("height", 10)
            .attr("fill", function (d, i) { return color(i); });

        var text = legend.append('text')
            .attr("x", 25)
            .attr("y", 10)
            .text(function (d) { return d; });
    });
}

function plotchart_new(d) {

    //******************************* Vertical Chart ************************
    var div = d3.select("#divtool").attr("class", "tbtoolTip");

    //var xScaleRange = data.length * 30;
    //var xScale = d3.scale.ordinal()
    //    .rangeRoundBands([width / 2 - xScaleRange, width / 2 + xScaleRange], 0.2);

    //var tmpwidth = datavalue.length * 12;
    //if (tmpwidth > cwidth) {
    //    cwidth = tmpwidth;
    //    ////var xScaleRange = data.length * 30;
    //    //var x = d3.scale.ordinal()
    //    //    .rangeRoundBands([cwidth / 2 - tmpwidth, cwidth / 2 + tmpwidth], 0.2);
    //}

    //var x = d3.scale.ordinal()
    //    //.range([0, cwidth]);
    //    .rangeRoundBands([0, cwidth], 0.2);
    var code = d.properties.SUBBASIN
    var cwcfile = './data/gfs/' + cwcflst[0];
    //console.log(cwcfile);
    //console.log(code);

    //for (var c = 0; c < cwcflst.length; c++) {
    //    if (cwcflst[c].includes(code)) {
    //        cwcfile = './data/gfs/' + cwcflst[c];
    //        break;
    //    }
    //}

    d3.csv(cwcfile, function (error, datavalue) {

        //var parser = d3.timeParse("%m/%d/%Y");
        var dateParse = d3.timeParse("%m/%d/%Y");
        var dateFormat = d3.timeFormat("%d-%b-%Y");

        datavalue.forEach(function (d) {
            //console.log(dateFormat(dateParse(d.Date)));
            d.Date = dateFormat(dateParse((d.Date)));
            d.Rainfall = +d.Rainfall;
            d.Inflow = +d.Inflow;
        });

        //data = filterJSON(datavalue, 'Subbasin', code);
        var data = datavalue.filter(function (dv) {
            return dv.Subbasin == code;
        });

        //console.table(data);

        //var norec = data.length;

        //var tmpwidth = (norec + 0.5) * 10;
        //if (tmpwidth < cwidth)
        //    tmpwidth = cwidth;

        //// set the dimensions and margins of the graph
        //var margin = { top: 20, right: 40, bottom: 30, left: 50 },
        //    cwidth = cwidth - margin.left - margin.right,
        //    cheight = cheight - margin.top - margin.bottom;

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

        //// define the 2nd line
        //var valueline2 = d3.line()
        //    .x(function (d) { return xLine(d.year); })
        //    .y(function (d) { return yLine(d.line2); });

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin

        ////====================== chart ========================
        d3.select("#divchart").select("svg").remove();
        $('#divchart').html('');


        var svg = d3.select("#divchart").append("svg")
            .attr("width", cwidth + margin.left + margin.right)
            .attr("height", cheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

        //console.table(datavalue);

        // Scale the range of the data
        xBar.domain(data.map(function (d) { return d.Date; }));
        xLine.domain(data.map(function (d) { return d.Date; }));
        yBar.domain([d3.min(data, function (d) { return d.Rainfall; }), d3.max(data, function (d) { return d.Rainfall; })]).nice();
        yLine.domain([d3.min(data, function (d) { return d.Inflow; }), d3.max(data, function (d) { return d.Inflow; })]).nice();

        //console.log(yBar.domain());
        //console.log(yLine.domain());

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
            //.attr("y", function (d) {
            //    return yBar(d.Rainfall);
            //})
            .attr("height", function (d) {
                return yBar(d.Rainfall);
            })
            //.attr("height", function (d) {
            //    return cheight - yBar(d.Rainfall);
            //})
        .on("mousemove", function (d) {

            div.style("left", d3.event.pageX + "px");
            div.style("top", d3.event.pageY - 50 + "px");

            div.style("display", "inline-block");
            div.html(d.Date + "<br>Rainfall : " + Number(d.Rainfall).toFixed(1));
        })
        .on("mouseout", function (d) {
            div.style("display", "none");
        })
        ;

        // Add the valueline path.
        svg.append("path")
            //.data(data)
            .attr("class", "line")
            .style("stroke", "red")
            .attr("d", valueline(data))

        ;

        //console.log(data);

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
                    div.style("left", d3.event.pageX + "px");
                    div.style("top", d3.event.pageY - 50 + "px");

                    div.style("display", "inline-block");
                    div.html(d.Date + "<br> Discharge : " + Number(d.Inflow).toFixed(1));
                })
        .on("mouseout", function (d) {
            div.style("display", "none");
        })
        ;

        //var points2 = svg.selectAll("circle.point2").data(data)

        //points2.enter().append("circle")
        //  .merge(points2)
        //    .attr("class", "point2")
        //    .style("stroke", "red")
        //    .style("stroke-width", 4)
        //      .style("fill", "none")
        //    .attr("cx", function (d) { return xLine(d.Date); })
        //    .attr("cy", function (d) { return yLine(d.Inflow); })
        //    .attr("r", function (d) { return 5; });

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

        ////Draw a grid
        //var numberOfTicks = 6;

        //var yAxisGrid = d3.axisLeft(yBar).ticks(numberOfTicks)
        //    .tickSize(0, cwidth)
        //    //.tickFormat("")
        //    //.orient("right");

        //var xAxisGrid = xAxis.ticks(numberOfTicks)
        //    .tickSize(-cheight, 0)
        //    .tickFormat("")
        //    .orient("top");

        //svg.append("g")
        //    //.classed('y', true)
        //    //.classed('grid', true)
        //    .call(yAxisGrid);

        //svg.append("g")
        //    //.classed('x', true)
        //    //.classed('grid', true)
        //    .call(xAxisGrid);
    });
}
//function readFile(fileName) {
//    var reader = new FileReader();
//    reader.onload = function (progressEvent) {
//        // Entire file
//        console.log(this.result);

//        // By lines
//        var lines = this.result.split('\n');
//        for (var line = 0; line < lines.length; line++) {
//            console.log(lines[line]);
//        }
//    };
//    reader.readAsText(fileName/*, "UTF-8"*/);
//}

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
function loadlayer(d) {

    basincode = d.properties.Code;
    //document.getElementById('thisLocation').innerText = d.properties.cwc_Name;
    if (basincode == '' || basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Basin Code does not exists in the JSON';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }

    document.getElementById('divalert').style.display = 'none';
    document.getElementById('imgclock').style.display = 'block';
    
    wsflst = [];
    if (fileExists('./data/' + basincode + '_gfssubwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_gfssubwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    wsflst.push(lines[line])
                }
            }
        });
    }
    
    //console.log('wsflst');
    //console.log(wsflst)
    
    cwcflst = [];
    if (fileExists('./data/' + basincode + '_gfscwcwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_gfscwcwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    cwcflst.push(lines[line]);
                }
            }
        });
    }

    //console.log('cwcflst');
    //console.log(cwcflst)
    
    rchflst = [];
    if (fileExists('./data/' + basincode + '_gfsrchwebsite.txt') === 200) {
        readTextFile('./data/' + basincode + '_gfsrchwebsite.txt', function (txt) {
            var lines = txt.split('\r\n');
            for (var line = 0; line < lines.length; line++) {
                if (lines[line] !== '') {
                    rchflst.push(lines[line]);
                }
            }
        });
    }

    //console.log('rchflst')
    //console.log(rchflst)

    var cwcgrid = './json/CWC_basin/' + basincode + '.json';
    var wsgrid = './json/watershed/' + basincode + '.json';
    var outlayer = './json/basin/' + basincode + '.json';

    d3.select("#divchart").select("svg").remove();
    $('#divchart').html('');

    d3.select('#divcwcbasin').selectAll("*").remove();
    $('#divcwcbasin').html('');

    queue()
     .defer(d3.json, wsgrid)
     .defer(d3.json, cwcgrid)
        .defer(d3.json, outlayer)
     .await(loadBasin);

}

function drawOuterBoundary(wpath, boundary) {
    svg.append("path")
        .datum(boundary)
        .attr("d", wpath)
        .attr("class", "subunit-boundary");
}

function loadBasin(error, wsgrid, cwcgrid, outlayer) {
    if (error) throw error;

    //cwcsvg.selectAll(".cwcbasin").remove;
    //svg.selectAll(".wsbasin").remove;
    //svg.selectAll(".label").remove;
    //var scale0 = 1;
    grupopadre = d3.select("#divbasinmap");

    d3.select("#divbasinmap").select("svg").remove();
    $('#divbasinmap').html('');

    function getTextBox(selection) {
        selection.each(function (d) {
            d.bbox = this.getBBox();
        });
    }

    // apply zoom to countriesGroup
    function zoomed() {
        t = d3
           .event
           .transform
        ;
        countriesGroup.attr(
           "transform", "translate(" + [t.x, t.y] + ")scale(" + t.k + ")"
        );
    }

    // Define map zoom behaviour
    var zoom = d3
       .zoom()
       .on("zoom", zoomed)
    ;

    svg = d3.select("#divbasinmap").append("svg")
        .attr("width", width)
        .attr("height", height)
        //.attr("style", "margin:3px;")
        .call(zoom);

    countriesGroup = svg
           .append("g")
           .attr("id", "map")
    ;
    //// add a background rectangle
    //countriesGroup
    //   .append("rect")
    //   .attr("x", 0)
    //   .attr("y", 0)
    //   .attr("width", width)
    //   .attr("height", height)
    //;

    //********************** Sate Grid start here **************************
    gridproject = d3.geoEquirectangular()
      .scale(1)
      .translate([0, 0]);

    gridpath = d3.geoPath().projection(gridproject);
    var objname = Object.keys(wsgrid.objects)[0];
    //gridobj = wsgrid.objects[objname];

    //gridlst = [];
    //var mpmap = wsgrid.objects[objname].geometries;
    //for (var i in mpmap) {
    //    //console.log(mpmap[i].properties.Grid_ID);
    //    gridlst.push(mpmap[i].properties.Grid_ID);
    //}

    var gridmap = topojson.feature(wsgrid, wsgrid.objects[objname]);

    var b = gridpath.bounds(gridmap),
        s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    gridproject
        .scale(s)
        .translate(t);

    //var boundary = topojson.mesh(wsgrid, wsgrid.objects[objname], function (a, b) { return a === b; });
    //drawOuterBoundary(gridpath, boundary);

    minZoom = Math.max($("#divbasinmap").width() / width, $("#divbasinmap").height() / height);
    // Define a "max zoom" 
    maxZoom = 5 * minZoom;

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

    var outname = Object.keys(outlayer.objects)[0];
    // draw a path for each feature/country
    outerlayer = countriesGroup
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
    .style("stroke", "#800000")
    //// add an onclick action to zoom into clicked country
    //.on("click", function (d, i) {
    //    d3.selectAll(".wsbasin").classed("country-on", false);
    //    d3.select("#wsbasin" + d.properties.Subbasin).classed("country-on", true);
    //    boxZoom(gridpath.bounds(d), gridpath.centroid(d), 5);
    //})
    ;

    // draw a path for each feature/country
    countries = countriesGroup
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
           boxZoom(gridpath.bounds(d), gridpath.centroid(d), 5);
       })
    ;

    countryLabels = countriesGroup
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
       //// add mouseover functionality to the label
       //.on("mouseover", function (d, i) {
       //    d3.select("#label" + d.properties.Subbasin).style("display", "block");
       //})
       //.on("mouseout", function (d, i) {
       //    d3.select(this).style("display", "none");
       //})
       // add an onlcick action to zoom into clicked country
       .on("click", function (d, i) {
           d3.selectAll(".wsbasin").classed("country-on", false);
           d3.select("#wsbasin" + d.properties.Subbasin).classed("country-on", true);
           boxZoom(gridpath.bounds(d), gridpath.centroid(d), 5);
       })
    ;


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
       })
    //.call(getTextBox)
    ;

    //// add a background rectangle the same size as the text
    //countryLabels
    //   .insert("rect", "text")
    //   .attr("class", "countryBg")
    //   .attr("transform", function (d) {
    //       return "translate(" + (d.bbox.x - 2) + "," + d.bbox.y + ")";
    //   })
    //   .attr("width", function (d) {
    //       return d.bbox.width + 4;
    //   })
    //   .attr("height", function (d) {
    //       return d.bbox.height;
    //   })
    //;

    function initiateZoom() {
        // Define a "min zoom"
        minZoom = Math.max($("#divbasinmap").width() / width, $("#divbasinmap").height() / height);
        // Define a "max zoom" 
        maxZoom = 5 * minZoom;
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


    //// ***************** Adding district Map *********************
    //svg.selectAll(".wsbasin")
    // .data(topojson.feature(wsgrid, wsgrid.objects[objname]).features)
    //    .enter().append("path")
    //    .attr("class", "wsbasin")
    //    .attr("id", function (d) { return d.properties.Subbasin; }, true)
    //    .attr("d", gridpath)
    //    .call(zoom)
    //    .on("mouseover", function (d) {
    //        $("#wstooltip").show();
    //        wsWarning(d);
    //    })
    //    .on("mouseout", function () {
    //        $("#wstooltip").hide();
    //    });

    d3.selectAll('.wsbasin')
        .attr('fill', function (d) {
            return 'gray';
        });

    initiateZoom();

    //********************** Sate Grid start here **************************

    d3.select("#divcwcbasin").select("svg").remove();
    $('#divcwcbasin').html('');

    var cwcsvg = d3.select("#divcwcbasin").append("svg")
        .attr("width", cwcwidth)
        .attr("height", cwcheight);
        //.attr("style", 'margin-top:5px;margin-left:12px;');

    var cwcproject = d3.geoEquirectangular()
      .scale(1)
      .translate([0, 0]);

    var cwcpath = d3.geoPath().projection(cwcproject);
    var cwcname = Object.keys(cwcgrid.objects)[0];

    var cwcmap = topojson.feature(cwcgrid, cwcgrid.objects[cwcname]);

    var b = cwcpath.bounds(cwcmap),
        s = .9 / Math.max((b[1][0] - b[0][0]) / cwcwidth, (b[1][1] - b[0][1]) / cwcheight),
        t = [(cwcwidth - s * (b[1][0] + b[0][0])) / 2, (cwcheight - s * (b[1][1] + b[0][1])) / 2];

    cwcproject
        .scale(s)
        .translate(t);

    //// ***************** Adding cwc Map *********************
    cwcsvg.selectAll(".cwcbasin")
      .data(topojson.feature(cwcgrid, cwcgrid.objects[cwcname]).features)
      .enter().append("path")
      .attr("class", "cwcbasin")
      .attr("id", function (d) { return d.properties.UNID; }, true)
      .attr("d", cwcpath)
      .style("stroke", "black")
      .style("stroke-width", 0.2)
      .on("mouseover", function (d) {
          $("#cwctooltip").show();
          cwcWarning(d);
      })
      .on("mouseout", function () {
          $("#cwctooltip").hide();
      })
      .on("click", plotchart_new);

    //var nogrid = cwcgrid.objects[cwcname].geometries.length;
    //var color = d3.scale.quantize().domain([0, nogrid]).range(colorbrewer.RdYlBu[11]);
    d3.selectAll('.cwcbasin')
        .style('fill', function (d, i) {
            return 'lightgray'
            //return '#FFFF99';
        });
    //.attr('fill-opacity', function (d) {
    //    return 0.7;
    //});

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



    document.getElementById('imgclock').style.display = 'none';
    //console.log(wsflst.length)
    //console.log(cwcflst.length)
    //console.log(rchflst.length)

}

function convertRange(value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

function getdata(dat, sel) {
    if (basincode == null) {
        document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> Select Basin';
        document.getElementById('divalert').style.display = 'inline';
        return;
    }
    if (dat == 'ws') {
        prvwssel = sel; prvws = dat;
    } else if (dat == 'cwc') {
        prvcwcsel = sel; prvcwc = dat;
    } else if (dat == 'rch') {
        prvrchsel = sel; prvrch = dat;
    }

    //console.log(day);

    /* Contains in javascript
        var str = "Hello world, welcome to the universe.";
        var n = str.includes("asff");
        document.getElementById("demo").innerHTML = n;
    */
    //$.ajax({
    //    type: 'HEAD',
    //    url: './data/gfssubwebsite.txt',
    //    success: function () {
    //        alert('Page found.');
    //    },
    //    error: function () {
    //        alert('Page not found.');
    //    }
    //});

    process = document.getElementsByClassName("centered");
    process[0].style.display = 'block';

    if (dat == 'ws')
        d3.selectAll('.wsbasin').style('fill', '#ccc');
    else if (dat == 'cwc')
        d3.selectAll('.cwcbasin').style('fill', '#ccc');
    else if (dat == 'rch')
        d3.selectAll('.rchbasin').style('fill', '#ccc');

    //document.getElementsByClassName('mTop')[0].style.display = 'block';
    //document.getElementById('thisVariable').innerText = message;


    if (dat == 'ws') {
        var wsfile = './data/gfs/' + wsflst[day];

        console.log(wsfile);

        wsfldname = sel;
        queue()
       .defer(d3.csv, wsfile)
       .await(loadwsdata);
    } else if (dat == 'cwc') {
        var cwcfile = './data/gfs/' + cwcflst[0];
        cwcfldname = sel;

        console.log(cwcfile);

        queue()
           .defer(d3.csv, cwcfile)
           .await(loadcwcdata);
    } else if (dat == 'rch') {

        var rchjson = './json/reach/' + basincode + '.json';
        var rchfile = './data/gfs/' + rchflst[0];
        rchfldname = sel;

        console.log(rchjson);
        console.log(rchfile);

        queue()
            .defer(d3.json, rchjson)
           .defer(d3.csv, rchfile)
           .await(loadrchdata);
    }

    function loadrchdata(error, reachmap, data) {
        if (error) {
            document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> File does not exists.';
            document.getElementById('divalert').style.display = 'inline';
            throw error;
        }

        //d3.select("#divbasinmap").select("svg").remove();
        //$('#divbasinmap').html('');
        //svg = d3.select("#divbasinmap").append("svg")
        //        .attr("width", width)
        //        .attr("height", height)
        //        .attr("style", 'margin-top:5px;margin-left:12px;');

        //d3.select("svg").remove();
        svg.selectAll(".rchbasin").remove;

        //document.getElementById("myDIV").style.display = "none";
        //console.log(Date())

        //svg.selectAll("*").remove();

        var objname = Object.keys(reachmap.objects)[0];

        //var rmin = Infinity, rmax = -Infinity;
        //var reachgeomet = reachmap.objects[objname].geometries;
        //for (var r in reachgeomet) {
        //    if (rmin > Number(reachgeomet[r].properties.AreaC))
        //        rmin = Number(reachgeomet[r].properties.AreaC);
        //    if (rmax < Number(reachgeomet[r].properties.AreaC))
        //        rmax = Number(reachgeomet[r].properties.AreaC);
        //}

        //console.log(rmin + ' : ' + rmax);
        //return;

        ////var min = Infinity, max = -Infinity;
        //var geomet = watermap.objects.Watershed.geometries;
        //for (var i in geomet) {    // for each geometry object
        //    ////console.log(i);
        //    ////console.log(geomap[i].properties);
        //    ////console.log(geomap[i].properties['Area']);

        //    for (var j in data) {  // for each row in the CSV
        //        if (geomet[i].properties.Subbasin == data[j].Subbasin) {   // if they match
        //            //var sum = 0, avg = 0;
        //            for (var k in data[i]) {   // for each column in the a row within the CSV
        //                if (k != 'Subbasin') {  // let's not add the name or id as props since we already have them
        //                    if (attributeArray.indexOf(k) == -1) {
        //                        attributeArray.push(k);  // add new column headings to our array for later
        //                    }
        //                    geomet[i].properties[k] = Number(data[j][k])  // add each CSV column key/value to geometry object
        //                }
        //            }
        //            break;  // stop looking through the CSV since we made our match
        //        }
        //    }
        //}
        //d3.select('#clock').html(attributeArray[currentAttribute]);
        ////console.log([min, max]);
        ////return;


        /// =============================== Reach Map =============================

        var reachproject = d3.geoEquirectangular()
          .scale(1)
          .translate([0, 0]);

        var reachpath = d3.geoPath().projection(reachproject);

        var gridmap = topojson.feature(reachmap, reachmap.objects[objname]);
        var b = reachpath.bounds(gridmap),
            s = 1 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
            t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        // Projection update
        reachproject
            .scale(s)
            .translate(t);

        //var rdiff = (rmax - rmin) / 5;
        svg.selectAll(".rchbasin")
          .data(topojson.feature(reachmap, reachmap.objects[objname]).features)
          .enter().append("path")
          //.attr("class", "reach")
            .attr("class", function (d) {
                var areac = Number(d.properties.AreaC);

                if (areac < (8300))
                    return "rchbasin stroke1";
                else if (areac < (15000))
                    return "rchbasin stroke2";
                else if (areac < (36000))
                    return "rchbasin stroke3";
                else if (areac < (150000))
                    return "rchbasin stroke4";
                else
                    return "rchbasin stroke5";
            })
          .attr("id", function (d) { return d.properties.Subbasin; }, true)
          .attr("d", reachpath);

        /////// =============================== Location Map =============================
        //var locproject = d3.geoEquirectangular()
        //  .scale(1)
        //  .translate([0, 0]);

        //var locpath = d3.geoPath().projection(locproject);

        //// Projection update
        //locproject
        //    .scale(s)
        //    .translate(t);

        //svg.selectAll(".circle")
        //    .data(topojson.feature(locmap, locmap.objects.LocationFinal).features)
        //    .enter().append("circle")
        //    .attr("d", locpath)
        //    .attr("id", function (d) { return d.properties.Name; }, true)
        //.attr("transform", function (d) {
        //    return "translate(" + locpath.centroid(d) + ")";
        //})
        ////.attr("id", function (d) { return d.id; })
        ////.attr("class", "node")
        ////.attr('fill', 'red')
        ////.attr('opacity', 0.5)
        //.attr('r', function (d) {
        //    var sub = Number(d.properties.Subbasin);
        //    if (sub == 465 || sub == 722 || sub == 902)
        //        return 8;
        //        //   else return 5;
        //    else return 4;
        //})
        //.attr("fill", function (d) {

        //    var sub = Number(d.properties.Subbasin);
        //    if (sub == 465 || sub == 722 || sub == 902)
        //        return "red";
        //    else
        //        return "#00ffff";
        //})
        //.on("click", function (d) {
        //    var sub = Number(d.properties.Subbasin);
        //    if (sub == 465 || sub == 722 || sub == 902) {
        //        document.getElementById("divright").style.display = "inline";
        //        d3.select("#lbldisname").html(d.properties.Name);
        //        var flname = "./data/" + d.properties.Subbasin + ".csv";
        //        drawChartnTable(flname);
        //    } else document.getElementById("divright").style.display = "none";
        //})
        //.on("mouseover", function (d) {
        //    $("#tooltip-container").show();
        //    showlocationtooltip(d);
        //})
        //.on("mouseout", function () {
        //    $("#tooltip-container").hide();
        //});

        //// ***************** Adding Lable on Map *********************
        //svg.selectAll(".label").remove;

        //svg.selectAll('.label').data(topojson.feature(locmap, locmap.objects.LocationFinal).features).enter().append('text')
        //    .attr("class", "halo")
        //    .attr('transform', function (d) {
        //        var centloc = locpath.centroid(d);
        //        //console.log(centloc[0] + " : " + centloc[1]);
        //        return "translate(" + centloc[0] + ", " + (centloc[1] - 10.0) + ")";
        //        //return "translate(" + locpath.centroid(d) + ")";
        //    })
        //    .style('text-anchor', 'start')
        //    .attr("startOffset", "75%")
        //    .style('font-variant', 'small-caps')
        //    .text(function (d) {
        //        var sub = Number(d.properties.Subbasin);
        //        if (sub == 465 || sub == 722 || sub == 902)
        //            return d.properties.Name;
        //    });
        //svg.selectAll('.label').data(topojson.feature(locmap, locmap.objects.LocationFinal).features).enter().append('text')
        //    .attr("class", "label")
        //    .attr('transform', function (d) {
        //        var centloc = locpath.centroid(d);
        //        //console.log(centloc[0] + " : " + centloc[1]);
        //        return "translate(" + centloc[0] + ", " + (centloc[1] - 10.0) + ")";
        //        //return "translate(" + locpath.centroid(d) + ")";
        //    })
        //    .style('text-anchor', 'start')
        //    .attr("startOffset", "75%")
        //    .style('font-variant', 'small-caps')
        //    .style("stroke", "#000fff")
        //    .text(function (d) {
        //        var sub = Number(d.properties.Subbasin);
        //        if (sub == 465 || sub == 722 || sub == 902)
        //            return d.properties.Name;
        //    });

        //console.log(Date())


        function reset() {
            document.getElementById("divright").style.display = "none";
            svg.transition()
                //.duration(750)
                //.style("stroke-width", "1.5px")
                .attr("transform", "");
        }

        function createLegend(colorScale) {

            d3.select("#divlegend").select("svg").remove();
            svgleg = d3.select("#divlegend").append("svg")
                .attr('height', 820)
                .attr('id', 'svglegend')
                .style("padding-left", "10px");


            var colorLegend = d3.legendColor()
              .labelFormat(d3.format(".0f"))
              .scale(colorScale)
              .shapeWidth(10)
              .shapeHeight(64)
              .labelOffset(5)
              .labelDelimiter('-');

            svgleg.append("g")
              .call(colorLegend);

        }

        function loadWarning(d) {
            //var curr = $("#clock")[0].innerText;
            //var day = curr.charAt(0);
            var curr = 1;
            var html = "";
            var tooltip = d3.select("#tooltip-container");
            if (playing == false) {
                //html += "<table><tr><strong>" + d.properties.State_Name + "</strong></tr><br/>" +
                //    "<tr>Lat:  " + d.properties.lat + " - Long:" + d.properties.lon + "</tr><br/><br/>" +
                //    "<tr> Year " + curr + " : " + d.properties[curr] + " mm</tr></table>";

                html += "<table><tr><strong>Subbasin : " + d.properties.Subbasin + "</strong></tr><br/>" +
                    "<br/>" +
                    "<tr> PRECIPmm : " + d.properties['PRECIPmm'] + " mm</tr></table>";

                //html += "<table><tr><strong>Area : " + d.properties.Area + "</strong></tr></table>" ;

                tooltip.html(html);
            } else {
                $("#tooltip-container").hide();
            }
        }

        process[0].style.display = 'none';
    }

    function loadcwcdata(error, data) {
        if (error) {
            document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> File does not exists.';
            document.getElementById('divalert').style.display = 'inline';
            throw error;
        }

        //console.log(data);

        var commin = d3.min(data, function (d) { return d.Inflow; })
        var commax = d3.max(data, function (d) { return d.Inflow; });

        d3.select("#cwclegend").select("svg").remove();
        $('#cwclegend').html('');

        var unique = {};
        var distinct = [];
        var datalst = [];

        var min = Infinity, max = -Infinity;
        var datalist = d3.selectAll(".cwcbasin").select(function (d) {
            var datavalue = data.filter(function (dv) {
                return dv.Subbasin == d.properties.SUBBASIN;
            });
            var gv = 0;
            if (datavalue.length != 0) {
                gv = Number(datavalue[day][cwcfldname]);
                d.properties[cwcfldname] = gv;
            }

            datalst.push(gv);
            if (typeof (unique[gv]) == "undefined") {
                distinct.push(gv);
            }
            unique[gv] = 0;

            if (max < gv)
                max = gv;
            if (min > gv)
                min = gv;

            return datavalue;

        });

        var color = d3.scaleThreshold()
            .domain([1, 10, 20, 40, 70, 130, 200])
            .range(["#e1e1e1", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

        d3.selectAll('.cwcbasin')
            .style('fill', function (d) {
                if (min == max)
                    return '#FFFFCC';
                else
                    return color(Number(d.properties[cwcfldname]));
            });

        if (min != max)
            createLegend(color, 'cwc');

        process[0].style.display = 'none';
    }

    function loadwsdata(error, data) {
        if (error) {
            document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> File does not exists.';
            document.getElementById('divalert').style.display = 'inline';
            throw error;
        }

        d3.select("#wslegend").select("svg").remove();
        $('#wslegend').html('');

        var unique = {};
        var distinct = [];
        var datalst = [];

        var min = Infinity, max = -Infinity;
        var datalist = d3.selectAll(".wsbasin").select(function (d) {
            var datavalue = data.filter(function (dv) {
                return dv.Subbasin == d.properties.Subbasin;
            });
            var gv = 0;
            if (datavalue.length != 0) {
                gv = Number(datavalue[0][wsfldname]);
                d.properties[wsfldname] = gv;

                //for (var k in datavalue[0]) {
                //    if (k != 'Subbasin') {
                //        d.properties[k] = Number(datavalue[0][k]);
                //    }
                //}
            }

            datalst.push(gv);
            if (typeof (unique[gv]) == "undefined") {
                distinct.push(gv);
            }
            unique[gv] = 0;

            if (max < gv)
                max = gv;
            if (min > gv)
                min = gv;

            return datavalue;
        });

        var color = d3.scaleThreshold()
        .domain([1, 10, 20, 40, 70, 130, 200])
        .range(["#e1e1e1", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);

        d3.selectAll('.wsbasin')
            .style('fill', function (d) {
                if (min == max)
                    return '#FFFFCC';
                    //return '#ffff00';
                else {
                    return color(Number(d.properties[wsfldname]));
                }
            });

        if (min != max)
            createLegend(color, 'ws');

        process[0].style.display = 'none';
    }
}
function createLegend(colorScale, prm) {
    //if (prm === 'ws') {
    d3.select("#wslegend").select("svg").remove();
    $('#wslegend').html('');
    svgleg = d3.select("#wslegend").append("svg")
        .attr('id', 'svglegend')
        .attr('style', 'text-anchor:end;width:75px;');
    //.attr('height', 35);
    //.style("font-size", "8px");

    //} else if (prm === 'cwc') {
    //    d3.select("#cwclegend").select("svg").remove();
    //    svgleg = d3.select("#cwclegend").append("svg").attr('id', 'svglegend').attr('style', 'text-anchor:end;').attr('height', 35)
    //}

    var colorLegend = d3.legendColor()
        .labelFormat(d3.format(".1f"))
        .scale(colorScale)
        .orient('vertical')
        .cells(colorScale.domain())
        .cells(9)
        //.shapeHeight(34)
        .labelAlign('start')
        .labelOffset(45)
        .labelDelimiter('-')
        .shapeWidth(25);

    svgleg.append("g")
      .call(colorLegend);

}
function wsWarning(d) {

    var tooltip = d3.select("#wstooltip");
    var html = "<table cellpadding=\"0\" cellspacing=\"0\"><tr><td class='noBorder'> Subbasin : " + d.properties.Subbasin + "</td></tr>";
    html = html + "<tr><td class='noBorder'>" + wsfldname + " : " + Number(d.properties[wsfldname]).toFixed(1) + "</td></tr></table>";

    tooltip.html(html);
    //$("#tooltip-container").hide();
}

function cwcWarning(d) {

    var tooltip = d3.select("#cwctooltip");
    var html = "<table><tr><td class='noBorder'>" + cwcfldname + " : " + Number(d.properties[cwcfldname]).toFixed(1) + "</td></tr></table>"
    tooltip.html(html);
    //$("#tooltip-container").hide();
}

// Copies a variable number of methods from source to target.
d3.rebind = function (target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
};

// Method is assumed to be a standard D3 getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
    return function () {
        var value = method.apply(source, arguments);
        return value === source ? target : value;
    };
}
/*
function nFormatter(num, digits) {
    var si = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "k" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}
*/
/*
 * Tests
 */
 /*
var tests = [
  { num: 1234, digits: 1 },
  { num: 100000000, digits: 1 },
  { num: 299792458, digits: 1 },
  { num: 759878, digits: 1 },
  { num: 759878, digits: 0 },
  { num: 123, digits: 1 },
  { num: 123.456, digits: 1 },
  { num: 123.456, digits: 2 },
  { num: 123.456, digits: 4 }
];
var i;
for (i = 0; i < tests.length; i++) {
    console.log("nFormatter(" + tests[i].num + ", " + tests[i].digits + ") = " + nFormatter(tests[i].num, tests[i].digits));
}
*/