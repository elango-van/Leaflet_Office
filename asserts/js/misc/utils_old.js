function filterJSON(json, key, value) {
    var result = {};
    for (var explosionIndex in json) {
        if (json[explosionIndex][key] === value) {
            result[explosionIndex] = json[explosionIndex];
        }
    }
    return result;
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
            //console.log(fileSize);
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
function ContactAdmin() {
    document.getElementById('divalert').style.display = 'none';
    document.getElementById("ffform").reset();
    document.getElementById('contactadmin').style.display = 'inline';
}
function showmessage(msg) {
    document.getElementById('divmsg').innerHTML = '<strong>Alert!</strong> ' + msg + ' <a href="#" style="color:white;" onclick="ContactAdmin()"><strong>Contact Admin</strong></a>';
    document.getElementById('divalert').style.display = 'inline';

    setTimeout(function () { document.getElementById('divalert').style.display = 'none'; }, 30000);
}
// function will clear input elements on ever form on HTML page
function clearForms() {
    // variable declaration
    var x, y, z, type = null;
    // loop through forms on HTML page
    for (x = 0; x < document.forms.length; x++) {
        // loop through each element on form
        for (y = 0; y < document.forms[x].elements.length; y++) {
            // define element type
            type = document.forms[x].elements[y].type;
            // alert before erasing form element
            //alert('form='+x+' element='+y+' type='+type);
            // switch on element type
            switch (type) {
                case 'text':
                case 'textarea':
                case 'password':
                    //case "hidden":
                    document.forms[x].elements[y].value = '';
                    break;
                case 'radio':
                case 'checkbox':
                    document.forms[x].elements[y].checked = '';
                    break;
                case 'select-one':
                    document.forms[x].elements[y].options[0].selected = true;
                    break;
                case 'select-multiple':
                    for (z = 0; z < document.forms[x].elements[y].options.length; z++) {
                        document.forms[x].elements[y].options[z].selected = false;
                    }
                    break;
            } // end switch
        } // end for y
    } // end for x
}

function clearElements(el) {
    // variable declaration
    var x, y, z, type = null, object = [];
    // collect form elements
    object[0] = document.getElementById(el).getElementsByTagName('input');
    object[1] = document.getElementById(el).getElementsByTagName('textarea');
    object[2] = document.getElementById(el).getElementsByTagName('select');
    // loop through found form elements
    for (x = 0; x < object.length; x++) {
        for (y = 0; y < object[x].length; y++) {
            // define element type
            type = object[x][y].type;
            switch (type) {
                case 'text':
                case 'textarea':
                case 'password':
                    object[x][y].value = '';
                    break;
                case 'radio':
                case 'checkbox':
                    object[x][y].checked = '';
                    break;
                case 'select-one':
                    object[x][y].options[0].selected = true;
                    break;
                case 'select-multiple':
                    for (z = 0; z < object[x][y].options.length; z++) {
                        object[x][y].options[z].selected = false;
                    }
                    break;
            } // end switch
        } // end for y
    } // end for x
}

//Array.prototype.move = function (from, to) {
//    this.splice(to, 0, this.splice(from, 1)[0]);
//};
//var ar = [1, 2, 3, 4, 5];
//ar.move(0, 3);
//console.log(ar) // 2,3,4,1,5
function formatDate(frmtdate) {
    var date = new Date(frmtdate);
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + '-' + mname[monthIndex] + '-' + year;
}

function getDate() {
    var date = new Date();
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();

    return day + '-' + mname[monthIndex] + '-' + year;
}
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
function padToTwor(number) {
    if (number <= 9999) { number = ("0" + number).slice(-4); }
    return number;
}
function leftpad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}
function checkElementExists(elmId) {
    var elem = document.getElementById(elmId);
    if (typeof elem !== 'undefined' && elem !== null) {
        return true;
    }
    return false;
}

function removeDuplicates(data) {
    return data.filter((value, index) => data.indexOf(value) === index);
}

//var landAvg = d3.mean(data, function (d) { return d.land_area; });
//console.log(landAvg);
//var landMed = d3.median(data, function (d) { return d.land_area; });
//console.log(landMed);
//var landSD = d3.deviation(data, function (d) { return d.land_area; });
//console.log(landSD);
