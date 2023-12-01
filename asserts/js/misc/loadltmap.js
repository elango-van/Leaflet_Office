

        var neighbors;
        var geowatershed = {};
        var geojson;
        //var co = d3.scaleOrdinal(d3.schemeCategory20b);
        var co = d3.scaleThreshold()
            //.domain([1, 10, 20, 40, 70, 130, 200])
            //.range(["#cacaca", "#ffff00", "#70a800", "#267300", "#00c5ff", "#004da8", "#FFA500", "#f52525"]);
            .domain([1, 5, 10, 15, 30, 45, 60])
            .range(["#cacaca", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"]);

        var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        var map = new L.Map('mapcon',
            {
                layers: [OpenStreetMap],
                center: new L.LatLng(11.75, 77.43),
                zoom: 8
            });

        function style(feat, i) {

            ////console.log(feat);
            ////console.log(feat.indie);

            ////console.log(neighbors[i]);

            //var i = feat.indie;
            //var coco = co(feat.color = d3.max(neighbors[i], function (n) {
            //    //console.log(n);
            //    //console.log(geowatershed.features[n].color);
            //    return geowatershed.features[n].color;
            //}) + 1 | 0);

            //console.log(feat.properties.value)

            var coco = co(feat.color = feat.properties.value);
            //console.log(coco);
            return {
                color: "#ccc",
                fillColor: coco,
                fillOpacity: .5,
                weight: 1.2
            }
        }
        //map.addLayer(OpenStreetMap_BlackAndWhite)//new L.StamenTileLayer(layer));
//        window.onload = function () {
            var neighbors
            var wsLayer = new L.LayerGroup();
            var rchLayer = new L.LayerGroup();
            var bsnLayer = new L.LayerGroup();
            var geowatershed = {};
            /////////////////// Reach Layer to add /////////////////////
            var getStyle = function (feature) {
                var area = feature.properties.AreaC;
                var weight;
                if (area > 50000) { weight = 3; }
                else if (area > 40000) { weight = 2.5; }
                else if (area > 30000) { weight = 2; }
                else if (area > 20000) { weight = 1.5; }
                else if (area > 10000) { weight = 1; }
                else { weight = 0.5; }

                return {
                    color: 'steelblue',
                    weight: weight
                }
            };
            function loadrch() {
                var rchreq = new XMLHttpRequest();
                var rchurl = 'json/reach/CAV.json'

                rchreq.open('GET', rchurl, true);
                rchreq.onreadystatechange = rchhandler;
                rchreq.send();

                function rchhandler() {

                    if (rchreq.readyState === XMLHttpRequest.DONE) {

                        try {
                            topoob = JSON.parse(rchreq.responseText)
                            var objname = Object.keys(topoob.objects)[0];

                            //console.log(objname);

                            neighbors = topojson.neighbors(topoob.objects[objname].geometries);
                            rchlayer = topojson.feature(topoob, topoob.objects[objname])

                            geojson = L.geoJson(rchlayer, {
                                style: getStyle
                                //{
                                //    color: "blue",
                                //    //fillOpacity: 1,
                                //    weight: 1
                                //}
                            }).addTo(rchLayer);
                            //console.log('neigh', neighbors)
                        }
                        catch (e) {
                            geojson = {};
                            //console.log(e)
                        }
                    }
                }
            }

            /////////////////// Basin outer Layer to add /////////////////////
            var basinreq = new XMLHttpRequest();
            var basinurl = 'json/basin/CAV.json'

            basinreq.open('GET', basinurl, true);
            basinreq.onreadystatechange = basinhandler;
            basinreq.send();

            function basinhandler() {

                if (basinreq.readyState === XMLHttpRequest.DONE) {

                    try {
                        topoob = JSON.parse(basinreq.responseText)
                        var objname = Object.keys(topoob.objects)[0];

                        //console.log(objname);

                        neighbors = topojson.neighbors(topoob.objects[objname].geometries);
                        basinlayer = topojson.feature(topoob, topoob.objects[objname])

                        geojson = L.geoJson(basinlayer, {
                            style: {
                                color: "#000",
                                fillOpacity: 0,
                                weight: 1.5
                            }
                        }).addTo(bsnLayer);
                        //console.log('neigh', neighbors)
                    }
                    catch (e) {
                        geojson = {};
                        //console.log(e)
                    }
                }
            }

            ///////////////////////////////////////
            //function style(feat, i) {

            //    ////console.log(feat);
            //    ////console.log(feat.indie);

            //    ////console.log(neighbors[i]);

            //    //var i = feat.indie;
            //    //var coco = co(feat.color = d3.max(neighbors[i], function (n) {
            //    //    //console.log(n);
            //    //    //console.log(geowatershed.features[n].color);
            //    //    return geowatershed.features[n].color;
            //    //}) + 1 | 0);

            //    //console.log(feat.properties.value)

            //    var coco = co(feat.color = feat.properties.value);
            //    //console.log(coco);
            //    return {
            //        color: "#ccc",
            //        fillColor: coco,
            //        fillOpacity: .5,
            //        weight: 1.2
            //    }
            //}

            var req = new XMLHttpRequest();
            var url = 'json/watershed/CAV.json'

            req.open('GET', url, true);
            req.onreadystatechange = handler;
            req.send();
            var topoob = {};
            
            function handler() {

                if (req.readyState === XMLHttpRequest.DONE) {

                    //var OpenStreetMap_BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                    //    maxZoom: 18,
                    //    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    //});

                    //var OpenStreetMap_BlackAndWhite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    //    maxZoom: 18,
                    //    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    //});

                    //map.addLayer(OpenStreetMap_BlackAndWhite)//new L.StamenTileLayer(layer));
                    // try and catch my json parsing of the responseText
                    try {
                        topoob = JSON.parse(req.responseText)
                        var objname = Object.keys(topoob.objects)[0];

                        //console.log(objname);

                        neighbors = topojson.neighbors(topoob.objects[objname].geometries);
                        geowatershed = topojson.feature(topoob, topoob.objects[objname])

                        //queue()
                        //    .defer(d3.csv, "./data/gfs/CAV_IMD-GFS_SUB_03072018120000.csv")
                        //    .await(function (err, data) {
                        //        geowatershed.features = geowatershed.features.map(function (fm, i) {

                        //            //console.log(fm.properties.Subbasin);
                        //            var ret = fm;

                        //            var datavalue = data.filter(function (dv) {
                        //                return dv.Subbasin == fm.properties.Subbasin;
                        //            });

                        //            var fldname = 'PRECIPmm';
                        //            var gv = NaN;
                        //            if (datavalue.length != 0) {
                        //                gv = Number(datavalue[0][fldname]);
                        //            } else console.log("Error : " + fm.properties.Subbasin);

                        //            ret.properties.value = gv;
                        //            ret.indie = i;
                        //            return ret
                        //        });

                        //        geojson = L.geoJson(geowatershed, { style: style, onEachFeature: onEachFeature })
                        //            .addTo(wsLayer);
                        //    });

                        geojson = L.geoJson(geowatershed, { style: style, onEachFeature: onEachFeature })
                            .addTo(wsLayer);
                        //console.log('neigh', neighbors)

                        loadrch();
                        loadlegend();
                        L.control.scale().addTo(map);
                        //console.log(geowatershed);
                        //map
                        //    .fitBounds(geojson.getBounds())
                        //    .setMaxBounds(geojson.getBounds().pad(1.0))
                        //    .zoomIn();

                    }
                    catch (e) {
                        geojson = {};
                        //console.log(e)
                    }
                    //console.log(geowatershed)

                    function highlightFeature(e) {
                        var layer = e.target;
                        layer.setStyle({
                            weight: 3,
                            color: 'cyan',
                            dashArray: '',
                            fillOpacity: .8
                        })
                        //if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        //    layer.bringToFront();
                        //}
                        info.update(layer.feature.properties);
                    }

                    function resetHighlight(e) {

                        var layer = e.target;
                        layer.setStyle(style(e.target.feature));
                        //console.log(e.target.feature);
                        //geojson.resetStyle(e.target);
                        //if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                        //    layer.bringToBack();
                        //}

                        info.update();
                    }

                    function zoomToFeature(e) {
                        map.fitBounds(e.target.getBounds());
                    }

                    function onEachFeature(feature, layer) {
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        })
                    }
                    var info = L.control();
                    info.onAdd = function (map) {
                        this._div = L.DomUtil.create('div', 'info');
                        this.update();
                        return this._div;
                    }

                    info.update = function (props) {
                        //console.log(props);//undefined
                        this._div.innerHTML = "<h4>Subbasin No : " + (props ? props.Subbasin : "") + "</h4>" + (props ? props.value : "")
                    }

                    info.addTo(map);

                }
            }

            //var map = L.map('map', {
            //    layers: [OpenStreetMap] // only add one!
            //})
            //    .setView([11.75, 77.43], 7);

            //var baseLayers = {
            //    "OSM Mapnik": OpenStreetMap,
            //    //"Landscape": landMap
            //};

            var overlays = {
                "Watershed": wsLayer,
                "Basin": bsnLayer,
                "Stream": rchLayer,
            };
            //console.log(coolPlaces);
            //console.log(coolPlaces.layers.length);

            L.control.layers(null, overlays, { collapsed: true }).addTo(map);

//        }

        /// Legend ///////////////////////
        function getColor(d) {
            return d > 60 ? '#7a0177' :
                d > 45 ? '#ae017e' :
                    d > 30 ? '#dd3497' :
                        d > 15 ? '#f768a1' :
                            d > 10 ? '#fa9fb5' :
                                d > 5 ? '#fcc5c0' :
                                    d > 1 ? '#fde0dd' :
                                        '#cacaca';
        }

        function loadlegend() {
            var legend = L.control({ position: 'bottomright' });

            legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [1, 5, 10, 15, 30, 45, 60],
                    labels = ['<strong>Water yield (mm) </strong><br /><br />'];
                div.innerHTML = labels;
                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br />' : '+');

                    //labels.push(
                    //    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    //    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br />' : '+'));
                }

                return div;
            };

            legend.addTo(map);
        }

        function multipleLayers() {
            // parse the geojson (very simplified example here)
            var zip = L.geoJson(zipjson, {});
            var counties = L.geoJson(countiesjson, {});

            // from there, similar to the example:
            var usmap = L.tileLayer(url, {});

            // initialize the map
            var map = L.map('map', {
                center: [39.73, -104.99],
                zoom: 10,
                layers: [usmap]
            });

            // specify the basemap and overlays to put in the layers control
            var baseMaps = {
                "US": usmap,
            };

            var overlayMaps = {
                "Counties": counties,
                "Zips": zip
            };

            // initialize up the L.control.layers
            L.control.layers(baseMaps, overlayMaps).addTo(map);
        }


        queue()
            .defer(d3.csv, "./data/gfs/CAV_IMD-GFS_SUB_03072018120000.csv")
            .await(function (err, data) {
                //geowatershed.features.map(function (fm, i) {

                //    //console.log(fm.properties.Subbasin);
                //    var ret = fm;

                //    var datavalue = data.filter(function (dv) {
                //        return dv.Subbasin == fm.properties.Subbasin;
                //    });

                //    var fldname = 'PRECIPmm';
                //    var gv = NaN;
                //    if (datavalue.length != 0) {
                //        gv = Number(datavalue[0][fldname]);
                //    } else console.log("Error : " + fm.properties.Subbasin);

                //    ret.properties.value = gv;
                //    ret.indie = i;
                //    return ret
                //});

                L.geoJson(geowatershed, {
                    style: function (feat) {
                        console.log(feat.properties);
                        return { color: "red" };
                    }
                });
                    //.addTo(wsLayer);
            });
    