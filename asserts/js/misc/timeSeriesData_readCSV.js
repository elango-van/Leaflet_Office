/* Read in CSV files using D3 and provide getter functions for important information */
var mondayRecyclingArray = [];
var tuesdayRecyclingArray = [];
var wednesdayRecyclingArray = [];
var thursdayRecyclingArray = [];
var fridayRecyclingArray = [];

// Monday recycling information
d3.csv("../datasets/time-series-data/RecyclingMonday.csv", function (d) {
  var dataLength = d.length;
  var latList = [];
  var lonList = [];
  var day = d[0].day;
  // iterate over all data points
  for (var i = 0; i < d.length; i++) {
    latList.push(Number(d[i].lat));
    lonList.push(Number(d[i].lon));
  }
  // add all arrays to a single array to be passed through getter
  mondayRecyclingArray.push(dataLength);
  mondayRecyclingArray.push(latList);
  mondayRecyclingArray.push(lonList);
  mondayRecyclingArray.push(day);
});

// Tuesday recycling information
d3.csv("../datasets/time-series-data/RecyclingTuesday.csv", function (d) {
  var dataLength = d.length;
  var latList = [];
  var lonList = [];
  var day = d[0].day;
  // iterate over all data points
  for (var i = 0; i < d.length; i++) {
    latList.push(Number(d[i].lat));
    lonList.push(Number(d[i].lon));
  }
  // add all arrays to a single array to be passed through getter
  tuesdayRecyclingArray.push(dataLength);
  tuesdayRecyclingArray.push(latList);
  tuesdayRecyclingArray.push(lonList);
  tuesdayRecyclingArray.push(day);
});

// Wednesday recycling information
d3.csv("../datasets/time-series-data/RecyclingWednesday.csv", function (d) {
  var dataLength = d.length;
  var latList = [];
  var lonList = [];
  var day = d[0].day;
  // iterate over all data points
  for (var i = 0; i < d.length; i++) {
    latList.push(Number(d[i].lat));
    lonList.push(Number(d[i].lon));
  }
  // add all arrays to a single array to be passed through getter
  wednesdayRecyclingArray.push(dataLength);
  wednesdayRecyclingArray.push(latList);
  wednesdayRecyclingArray.push(lonList);
  wednesdayRecyclingArray.push(day);
});

// Thursday recycling information
d3.csv("../datasets/time-series-data/RecyclingThursday.csv", function (d) {
  var dataLength = d.length;
  var latList = [];
  var lonList = [];
  var day = d[0].day;
  // iterate over all data points
  for (var i = 0; i < d.length; i++) {
    latList.push(Number(d[i].lat));
    lonList.push(Number(d[i].lon));
  }
  // add all arrays to a single array to be passed through getter
  thursdayRecyclingArray.push(dataLength);
  thursdayRecyclingArray.push(latList);
  thursdayRecyclingArray.push(lonList);
  thursdayRecyclingArray.push(day);
});

// Friday recycling information
d3.csv("../datasets/time-series-data/RecyclingFriday.csv", function (d) {
  var dataLength = d.length;
  var latList = [];
  var lonList = [];
  var day = d[0].day;
  // iterate over all data points
  for (var i = 0; i < d.length; i++) {
    latList.push(Number(d[i].lat));
    lonList.push(Number(d[i].lon));
  }
  // add all arrays to a single array to be passed through getter
  fridayRecyclingArray.push(dataLength);
  fridayRecyclingArray.push(latList);
  fridayRecyclingArray.push(lonList);
  fridayRecyclingArray.push(day);
});

//** Return recycling by day**//
function getMondayRecycling(){
  return mondayRecyclingArray;
};

function getTuesdayRecycling(){
  return tuesdayRecyclingArray;
};

function getWednesdayRecycling(){
  return wednesdayRecyclingArray;
};

function getThursdayRecycling(){
  return thursdayRecyclingArray;
};

function getFridayRecycling(){
  return fridayRecyclingArray;
};
