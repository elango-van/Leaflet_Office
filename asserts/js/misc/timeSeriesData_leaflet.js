//** Base Maps **\\
var streetView = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3Vydi1tcXAiLCJhIjoiY2o5eDNxZHRtN3hlMzJxbGcycm1kdjNkbCJ9.KbJcO99y-sr0o_x4zZMF0g',{
  id: 'mapbox.streets',
  attribution: 'Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var darkView = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3Vydi1tcXAiLCJhIjoiY2o5eDNxZHRtN3hlMzJxbGcycm1kdjNkbCJ9.KbJcO99y-sr0o_x4zZMF0g',{
  id: 'mapbox.dark',
  attribution: 'Imagery © <a href="http://mapbox.com">Mapbox</a>'
});
var lightView = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoic3Vydi1tcXAiLCJhIjoiY2o5eDNxZHRtN3hlMzJxbGcycm1kdjNkbCJ9.KbJcO99y-sr0o_x4zZMF0g',{
  id: 'mapbox.light',
  attribution: 'Imagery © <a href="http://mapbox.com">Mapbox</a>'
});

var baseMaps = {
  "Streets": streetView,
  "Dark": darkView,
  "Light": lightView
};

//** Construct the map **\\
var map = L.map('mapid', {
  renderer: L.canvas(),
  center: [42.3601, -71.0589],
  zoom: 12,
  layers: [lightView]
});

//** Canvas Layers**\\
//NOTE: Day of week is available by playing .bindPopup(day) directly after .addTo(map)
//      However this causes MASSIVE slowdown on map and is not recommended
//Monday Recycling
var mondayRecyclingCanvas = L.canvas({ padding: 0.5 });
function addMondayRecycling(){
  // Get dataLength, lat, lon
  var mondayRecyclingArray = getMondayRecycling();
  var dataLength = mondayRecyclingArray[0];
  var latList = mondayRecyclingArray[1];
  var lonList = mondayRecyclingArray[2];
  var day = mondayRecyclingArray[3];

  // Add points to canvas layer
  for (var i = 0; i < dataLength; i++) {
    L.circleMarker(getLatLon(i), {
      renderer: mondayRecyclingCanvas,
      radius: 2,
      color: '#E74C3C'
    }).addTo(map);
  }

  // HELPER: Get (lat,lon) for specific point
  function getLatLon(i) {
    return [
      latList[i],
      lonList[i]
    ];
  };

  mondayRecyclingCanvas.addTo(map);
};

//Tuesday Recycling
var tuesdayRecyclingCanvas = L.canvas({ padding: 0.5 });
function addTuesdayRecycling(){
  // Get dataLength, lat, lon
  var tuesdayRecyclingArray = getTuesdayRecycling();
  var dataLength = tuesdayRecyclingArray[0];
  var latList = tuesdayRecyclingArray[1];
  var lonList = tuesdayRecyclingArray[2];

  // Add points to canvas layer
  for (var i = 0; i < dataLength; i++) {
    L.circleMarker(getLatLon(i), {
      renderer: tuesdayRecyclingCanvas,
      radius: 2,
      color: '#E67E22'
    }).addTo(map);
  }

  // HELPER: Get (lat,lon) for specific point
  function getLatLon(i) {
    return [
      latList[i],
      lonList[i]
    ];
  };

  tuesdayRecyclingCanvas.addTo(map);
};

//Wednesday Recycling
var wednesdayRecyclingCanvas = L.canvas({ padding: 0.5 });
function addWednesdayRecycling(){
  // Get dataLength, lat, lon
  var wednesdayRecyclingArray = getWednesdayRecycling();
  var dataLength = wednesdayRecyclingArray[0];
  var latList = wednesdayRecyclingArray[1];
  var lonList = wednesdayRecyclingArray[2];

  // Add points to canvas layer
  for (var i = 0; i < dataLength; i++) {
    L.circleMarker(getLatLon(i), {
      renderer: wednesdayRecyclingCanvas,
      radius: 2,
      color: '#2ECC71'
    }).addTo(map);
  }

  // HELPER: Get (lat,lon) for specific point
  function getLatLon(i) {
    return [
      latList[i],
      lonList[i]
    ];
  };

  wednesdayRecyclingCanvas.addTo(map);
};

//Thursday Recycling
var thursdayRecyclingCanvas = L.canvas({ padding: 0.5 });
function addThursdayRecycling(){
  // Get dataLength, lat, lon
  var thursdayRecyclingArray = getThursdayRecycling();
  var dataLength = thursdayRecyclingArray[0];
  var latList = thursdayRecyclingArray[1];
  var lonList = thursdayRecyclingArray[2];

  // Add points to canvas layer
  for (var i = 0; i < dataLength; i++) {
    L.circleMarker(getLatLon(i), {
      renderer: thursdayRecyclingCanvas,
      radius: 2,
      color: '#3498DB'
    }).addTo(map);
  }

  // HELPER: Get (lat,lon) for specific point
  function getLatLon(i) {
    return [
      latList[i],
      lonList[i]
    ];
  };

  thursdayRecyclingCanvas.addTo(map);
};

//Friday Recycling
var fridayRecyclingCanvas = L.canvas({ padding: 0.5 });
function addFridayRecycling(){
  // Get dataLength, lat, lon
  var fridayRecyclingArray = getFridayRecycling();
  var dataLength = fridayRecyclingArray[0];
  var latList = fridayRecyclingArray[1];
  var lonList = fridayRecyclingArray[2];

  // Add points to canvas layer
  for (var i = 0; i < dataLength; i++) {
    L.circleMarker(getLatLon(i), {
      renderer: fridayRecyclingCanvas,
      radius: 2,
      color: '#9B59B6'
    }).addTo(map);
  }

  // HELPER: Get (lat,lon) for specific point
  function getLatLon(i) {
    return [
      latList[i],
      lonList[i]
    ];
  };

  fridayRecyclingCanvas.addTo(map);
};

// Create content for layer select panel
var overlayMaps = {
  "<i class='fa fa-recycle'></i> <span style='color: #E74C3C'>Monday Recycling</span>": mondayRecyclingCanvas,
  "<i class='fa fa-recycle'></i> <span style='color: #E67E22'>Tuesday Recycling</span>": tuesdayRecyclingCanvas,
  "<i class='fa fa-recycle'></i> <span style='color: #2ECC71'>Wednesday Recycling</span>": wednesdayRecyclingCanvas,
  "<i class='fa fa-recycle'></i> <span style='color: #3498DB'>Thursday Recycling</span>": thursdayRecyclingCanvas,
  "<i class='fa fa-recycle'></i> <span style='color: #9B59B6'>Friday Recycling</span>": fridayRecyclingCanvas
};

//** Controls **\\
// Layers control
L.control.layers(baseMaps, overlayMaps, {position: 'topleft', collapsed:false}).addTo(map);

// Information button
var informationContent = `<p>This interaction is comprised of five datasets: recycling schedule over each weekday.</br>
Use the play button to cycle through each day to view how the recycling schedule changes over time.</p>`;
var informationPopup = L.popup().setContent(informationContent);
L.easyButton('fa-info-circle fa-lg', function(btn, map){
  informationPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(map);

//** Automatic Carousel **\\
// Create the play button to be added to the map to activate carousel
playCarouselButton = L.easyButton({
  id: 'stop-carousel',
  position: 'topleft',
  type: 'replace',
  leafletClasses: true,
  states:[{
    stateName: 'get-center',
    onClick: function(button, map){
      resetCount(); // start from the begining
      doTimer(); // start the cycle
      playCarouselButton.removeFrom(map);
      stopCarouselButton.addTo(map);
    },
    title: 'Start the carousel',
    icon: 'fa fa-play'
  }]
}).addTo(map);

// Create the stop button to be added to the map to deactivate carousel
stopCarouselButton = L.easyButton({
  id: 'stop-carousel',
  position: 'topleft',
  type: 'replace',
  leafletClasses: true,
  states:[{
    stateName: 'get-center',
    onClick: function(button, map){
      stopCount(); // end the cycle
      display_panel.remove();
      stopCarouselButton.removeFrom(map);
      playCarouselButton.addTo(map);
    },
    title: 'Stop the carousel',
    icon: 'fa fa-stop'
  }]
});

var c=0; // counter
var t; // timer
var timer_is_on=0; // timer status flag
var MAX_COUNT = 4; // days in the week

// Iterate over the days of the week, display the appropriate layer
function timedCount(){
  switch(c){
    case 0: // Monday Recycling
    DoW = 'Moday';
    mondayRecyclingCanvas.addTo(map);
    fridayRecyclingCanvas.removeFrom(map);
    break;
    case 1: // Tuesday Recycling
    DoW = 'Tuesday';
    tuesdayRecyclingCanvas.addTo(map);
    mondayRecyclingCanvas.removeFrom(map);
    break;
    case 2: // Wednesday Recycling
    DoW = 'Wednesday';
    wednesdayRecyclingCanvas.addTo(map);
    tuesdayRecyclingCanvas.removeFrom(map);
    break;
    case 3: // Thursday Recycling
    DoW = 'Thursday';
    thursdayRecyclingCanvas.addTo(map);
    wednesdayRecyclingCanvas.removeFrom(map);
    break;
    case 4: // Friday Recycling
    DoW = 'Friday';
    fridayRecyclingCanvas.addTo(map);
    thursdayRecyclingCanvas.removeFrom(map);
    break;
  }
  t=setTimeout("timedCount()",1000);
  // go to next count. If max, start again
  if(c == MAX_COUNT){
    c = 0
  } else{
    c += 1;
  }
  // update day of week display
  document.getElementById("DoW").innerHTML = DoW;
}

// Start the carousel
function doTimer(){
  //Start clean
  display_panel.addTo(map);
  mondayRecyclingCanvas.removeFrom(map);
  tuesdayRecyclingCanvas.removeFrom(map);
  wednesdayRecyclingCanvas.removeFrom(map);
  thursdayRecyclingCanvas.removeFrom(map);
  fridayRecyclingCanvas.removeFrom(map);
  if (!timer_is_on){
    timer_is_on=1;
    timedCount();
  }
}

// End the carousel
function stopCount(){
  clearTimeout(t);
  timer_is_on=0;
}

// Reset the counter
function resetCount(){
  c=0;
}

//** Day of Week Text**\\
L.Control.textbox = L.Control.extend({
  onAdd: function(map) {
    var div = L.DomUtil.create('div', 'display-panel');
    div.innerHTML = "Day of Week";
    div.id = 'DoW';
    return div;
  },
  onRemove: function(map) {}
});

// Add day of week display
L.control.textbox = function(opts) {
  return new L.Control.textbox(opts);
}
var display_panel = L.control.textbox({ position: 'topright' });

//** Pre-load canvas layers **\\
setTimeout(function(){
  addMondayRecycling();
  addTuesdayRecycling();
  addWednesdayRecycling();
  addThursdayRecycling();
  addFridayRecycling();
}, 1000); // Delay to allow page to load
