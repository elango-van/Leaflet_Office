
window.addEventListener("resize", (event) => {
    divleftwrap = document.getElementById("leftwrap");
    leftwrapbox = divleftwrap.getBoundingClientRect();

    let w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    let heightoftheelement = w >= 500 ? (h - (leftwrapbox.top + 55)) + 'px' : (h - (leftwrapbox.top + 110)) + 'px';
    divleftwrap.style.height = heightoftheelement;

    let barelement = document.getElementById('barContainer');
    let bardiplay = barelement.currentStyle ? barelement.currentStyle.display : getComputedStyle(barelement, null).display;

    // console.log(document.getElementById('barContainer').style.display === "");
    // console.log(barelement.currentStyle ? barelement.currentStyle.display : getComputedStyle(barelement, null).display);

    if (bardiplay === 'none' || (barelement.classList.contains("change"))) {
        divleftwrap.style.display = 'block';
    } else {
        divleftwrap.style.display = 'none';
    }

    // if ((h - leftwrapbox.top) < 750) {
    // 	divleftwrap.style.overflowY = 'scroll';
    // } else {
    // 	divleftwrap.style.overflowY = 'hidden';
    // }

    // let footerelement = document.getElementsByTagName('footer')[0].getBoundingClientRect();
    // const box = document.querySelector('#leftwrap');
    // const scrollbarWidth = box.offsetWidth - box.clientWidth;

    // const scrollbarWidth = document.body.offsetWidth - document.body.clientWidth;
    // divmapwrap.style.width = (w - (leftwrapbox.width + 15)) + 'px';

    divmapwrap.style.height = (h - (leftwrapbox.top + 55)) + 'px';
    if (w >= 500) {
        divmapwrap.style.width = (w - (leftwrapbox.width) - 10) + 'px';
        // divleftwrap.style.display='inline-block';
    } else {
        divmapwrap.style.width = w - 10 + 'px';
    }

    // if ((w - 200) > 650) {
    // 	divmap.style.overflowX = 'hidden';
    // } else {
    // 	divmap.style.overflowX = 'scroll';
    // }
    map.invalidateSize();
    map.fitBounds(basinGeojson.getBounds())
});

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
    var request = new XMLHttpRequest();
    request.open("GET", file, true);
    request.onreadystatechange = function () {
        if (request.readyState === 4 && request.status === 200) {
            callback(request.responseText);
        } else if (request.status == 404) {
            callback('Error404');
        } else {
            callback('Error');
            // console.error({"Status" : request.status,"data":request.responseText})
            // console.log("Status : " + request.status);
        }
        // if (request.status === 200) {
        //     callback(request.responseText);
        // } else if (request.status == 404) {
        //     callback('Error404');
        // } else {
        //     callback('Error');
        //     console.log("Status : " + request.status);
        // }
    }
    request.send(null);
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
    divalertobject.style.display = 'none';
    document.getElementById("ffform").reset();
    document.getElementById('contactadmin').style.display = 'inline';
}
let divalertobject = document.getElementById('divalert');
let divmsgobject = document.getElementById('divmsg')
let msglist = [];
function showmessage(msg, contactadmin) {
    if (typeof divalertobject === 'undefined') return;
    // console.error(divalertobject.style.display)
    if (contactadmin === 'yes') {
        divmsgobject.innerHTML = '<strong>Alert!</strong> ' + msg + ' <a href="#" style="color:white;" onclick="ContactAdmin()"><strong>Contact Admin</strong></a>';
    } else {
        // if (typeof divalertobject !== 'undefined') {
        //     if (divalertobject.style.display === 'none' || divalertobject.style.display === '') {
        //         divmsgobject.innerHTML = '<strong>Alert!</strong> ' + msg;
        //     }
        // }

        if (typeof divmsgobject !== 'undefined' && divmsgobject !== null) {
            //divmsgobject.innerHTML += '<br>' + msg;
            divmsgobject.innerHTML = "";
            divmsgobject.innerHTML = msg;
        }

        // if (!msglist.includes(msg)) {
        //     divmsgobject.innerHTML += '<br>' + msg;
        // }

        // console.log([typeof basincode, msglist.length]);
        // if(typeof basincode === 'undefined'){
        //     msg = {"basin":'basincode', message:msg};
        // } else{
        //     // console.log(typeof basincode)
        //     msg = {"basin":basincode, message:msg};
        // }
    }

    // console.log(msglist);
    // console.log([typeof divalertobject !== 'undefined', !msglist.includes(msg)]);

    if (typeof divalertobject !== 'undefined' && divalertobject !== null) { // && !msglist.includes(msg)
        // console.log(divalertobject);
        if (divalertobject.style.display === 'none' || divalertobject.style.display === '') {
            // console.log(msg)
            divalertobject.style.display = 'block';
        }
    }

    // let lcbox = loadingContainer.getBoundingClientRect();
    // divleftwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';
    // divmapwrap.style.width = (w - leftwrapbox.width) - 15 + 'px';
    // divmapwrap.style.height = (h - leftwrapbox.top) - 55 + 'px';

    // if(loadingContainer.style.display !== 'none'){
    //     divalertobject.style.bottom = (lcbox.top) + 50 + 'px';
    //     // loadingContainer.style.display = 'none';
    // } else{
    //     divalertobject.style.bottom = '10px';
    // }
    if (!msglist.includes(msg)) {
        msglist.push(msg);
    }

    setTimeout(function () {
        if (typeof divalertobject !== 'undefined' && divalertobject !== null) {
            divalertobject.style.display = 'none';
        }
        if (loadingLayer === true || loadingData === true) {
            if (loadingContainer.style.display === 'none') { loadingContainer.style.display = 'block'; }
        }
    }, 10000);
}

function clearForms() {

    var x, y, z, type = null;

    for (x = 0; x < document.forms.length; x++) {
        for (y = 0; y < document.forms[x].elements.length; y++) {
            type = document.forms[x].elements[y].type;
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
            }
        }
    }
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

function getcsv(url, cb) {
    d3.csv(url).then(res => cb(null, res)).catch(cb);
}

function cancelprocess() {
    alert('Are you sure, do you want to cancel process')
}

function isDateValid(dateStr) {
    return !isNaN(new Date(dateStr));
}
function isDateObject(date) {
    return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date);
    // return (date instanceof Date) && !isNaN(date);
}
//var landAvg = d3.mean(data, function (d) { return d.land_area; });
//console.log(landAvg);
//var landMed = d3.median(data, function (d) { return d.land_area; });
//console.log(landMed);
//var landSD = d3.deviation(data, function (d) { return d.land_area; });
//console.log(landSD);

////***************** how to get error message while using d3.queue()
////d3.csv('/b/asdfds.csv', function (error, file1) {
////	if (error) {
////		console.error('Oh dear, something went wrong: ' + error);
////		console.error('Oh dear, something went wrong: ' + error.target.status);
////	}
////})

//let q = d3.queue()
//// Calling defer three times
//q.defer(d3.csv,'./data/BBS_gfscwcwebsite.txt')
//q.defer(d3.csv,'./data/BBS_gfsrchwebsite123.txt')
//q.defer(d3.csv,'./data/BBS_gfssubwebsite.txt')
//q.awaitAll(function (error, data) {
//	if (error) {
//		//console.error('Oh dear, something went wrong: ' + error);
//		console.log('Oh dear, this url does not exist: ' + error.target.responseURL);
//		console.log('Oh dear, something went wrong: ' + error.target.status);
//		console.error('Oh dear, something went wrong: ' + error.target.statusText);

//		console.log(data);
//	} else {
//		console.log(data);
//	}
//});
//console.log(q)
//console.log("Size of q is: ", q._size)
//console.log("Size of q is: ", q._ended)
//console.log("Size of q is: ", q._tasks.length)
////***************** how to get error message while using d3.queue()

// var q = d3.queue()
//     .defer(d3.csv, 'fnames[7]')
//     .defer(d3.csv, 'fnames[1]')
//     .defer(d3.csv, 'fnames[2]')
//     .awaitAll(updateViz);

// function updateViz(error, data2) {
//     if (error) {
//         console.log(error);
//     }

//     console.log("data2 : " + data2);

// }