// JavaScript Document

function isEmailAddr(email) {
	var result = false
	var theStr = new String(email)
	var index = theStr.indexOf("@");
	if (index > 0) {
		var pindex = theStr.indexOf(".", index);
		if ((pindex > index + 1) && (theStr.length > pindex + 1))
			result = true;
	}
	return result;
}

function validatecontactus() {
	if (document.getElementById("name").value == "") {
		inlineMsgheader('header_msg', 'Name field cannot be blank! ', 2);
		document.getElementById("name").focus();
		return false;
	}
	if (document.getElementById("email").value == "") {
		inlineMsgheader('header_msg1', 'Email field cannot be blank! ', 2);
		document.getElementById("email").focus();
		return false;
	}

	if (!isEmailAddr(document.getElementById("email").value)) {
		inlineMsgheader('header_msg1', 'Email Address format is worng! ', 2);
		document.getElementById("email").focus();
		return false;
	}

	if (document.getElementById("comments").value == "") {
		inlineMsgheader('header_msg2', 'Comments field cannot be blank! ', 2);
		document.getElementById("comments").focus();
		return false;
	}

	return true;

}

function sendRequest(fid) {
	var oForm = document.forms[fid];
	document.getElementById('contactadmin').style.display = 'none';
	if (fid == 0) {
		if (validatecontactus()) {
			var sBody = getRequestBody(oForm);
			var oXmlHttp = zXmlHttp.createRequest();
			oXmlHttp.open("POST", oForm.action, true);
			oXmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			oXmlHttp.onreadystatechange = function () {
				if (oXmlHttp.readyState == 4) {
					if (oXmlHttp.status == 200) {
						saveResult(oXmlHttp.responseText, fid);
					} else {
						saveResult("An error occurred: " + oXmlHttp.statusText, fid);
					}
				}
			};
			oXmlHttp.send(sBody);
		}
	}
}
function getRequestBody(oForm) {
	var aParams = new Array();
	for (var i = 0; i < oForm.elements.length; i++) {
		var sParam = encodeURIComponent(oForm.elements[i].name);
		sParam += "=";
		sParam += encodeURIComponent(oForm.elements[i].value);
		aParams.push(sParam);
	}
	return aParams.join("&");
}

function saveResult(sMessage, fid) {
	//alert(sMessage);
	//var divStatus = document.getElementById("submitknowledge");
	//divStatus.innerHTML = "" + sMessage;  				
	showmessage(sMessage);
}


// JavaScript Document

// START OF MESSAGE SCRIPT //

var MSGTIMER = 20;
var MSGSPEED = 5;
var MSGOFFSET = 3;
var MSGHIDE = 2;

// build out the divs, set attributes and call the fade function //
function inlineMsg(target, string, autohide) {
	var msg;
	var msgcontent;
	if (!document.getElementById('msg')) {
		msg = document.createElement('div');
		msg.id = 'msg';
		msgcontent = document.createElement('div');
		msgcontent.id = 'msgcontent';
		document.body.appendChild(msg);
		msg.appendChild(msgcontent);
		msg.style.filter = 'alpha(opacity=0),z-index:102';
		msg.style.opacity = 0;
		msg.alpha = 0;
	} else {
		msg = document.getElementById('msg');
		msgcontent = document.getElementById('msgcontent');
	}
	msgcontent.innerHTML = string;
	msg.style.display = 'block';
	var msgheight = msg.offsetHeight;
	var targetdiv = document.getElementById(target);
	targetdiv.focus();

	var targetheight = targetdiv.offsetHeight;
	var targetwidth = targetdiv.offsetWidth;
	var topposition = topPosition(targetdiv) - ((msgheight - targetheight) / 2);
	var leftposition = leftPosition(targetdiv) + targetwidth + MSGOFFSET;
	var topnewposition = topposition - 30;
	var leftnewposition = leftposition - 115;
	msg.style.top = topnewposition + 'px';
	msg.style.left = leftnewposition + 'px';
	clearInterval(msg.timer);
	msg.timer = setInterval("fadeMsg(1)", MSGTIMER);
	if (!autohide) {
		autohide = MSGHIDE;
	}
	window.setTimeout("hideMsg()", (autohide * 1000));
}

// hide the form alert //
function hideMsg(msg) {
	var msg = document.getElementById('msg');
	if (!msg.timer) {
		msg.timer = setInterval("fadeMsg(0)", MSGTIMER);
	}
}

// face the message box //
function fadeMsg(flag) {
	if (flag == null) {
		flag = 1;
	}
	var msg = document.getElementById('msg');
	var value;
	if (flag == 1) {
		value = msg.alpha + MSGSPEED;
	} else {
		value = msg.alpha - MSGSPEED;
	}
	msg.alpha = value;
	msg.style.opacity = (value / 100);
	msg.style.filter = 'alpha(opacity=' + value + ')';
	if (value >= 99) {
		clearInterval(msg.timer);
		msg.timer = null;
	} else if (value <= 1) {
		msg.style.display = "none";
		clearInterval(msg.timer);
	}
}


//######################## For Header ###########################################
// build out the divs, set attributes and call the fade function //
function inlineMsgheader(target, string, autohide) {
	var msg;
	var msgcontent;

	if (!document.getElementById('msg12')) {
		msg = document.createElement('div');
		msg.id = 'msg12';
		msgcontent = document.createElement('div');
		msgcontent.id = 'msgcontent12';
		document.body.appendChild(msg);
		msg.appendChild(msgcontent);
		msg.style.filter = 'alpha(opacity=0),z-index:102';
		msg.style.opacity = 0;
		msg.alpha = 0;

	} else {

		msg = document.getElementById('msg12');
		msgcontent = document.getElementById('msgcontent12');
	}
	msgcontent.innerHTML = string;
	msg.style.display = 'block';
	var msgheight = msg.offsetHeight;
	var targetdiv = document.getElementById(target);
	targetdiv.focus();

	var targetheight = targetdiv.offsetHeight;
	var targetwidth = targetdiv.offsetWidth;
	var topposition = topPosition(targetdiv) - ((msgheight - targetheight) / 2);
	var leftposition = leftPosition(targetdiv) + targetwidth + MSGOFFSET;
	var topnewposition = topposition - 21;
	var leftnewposition = leftposition - 190;
	msg.style.top = topnewposition + 'px';
	msg.style.left = leftnewposition + 'px';
	clearInterval(msg.timer);
	msg.timer = setInterval("fadeMsg12(1)", MSGTIMER);
	if (!autohide) {
		autohide = MSGHIDE;
	}
	window.setTimeout("hideMsg12()", (autohide * 1000));
}

// hide the form alert //
function hideMsg12(msg) {
	var msg = document.getElementById('msg12');
	if (!msg.timer) {
		msg.timer = setInterval("fadeMsg12(0)", MSGTIMER);
	}
}

// face the message box //
function fadeMsg12(flag) {
	if (flag == null) {
		flag = 1;
	}
	var msg = document.getElementById('msg12');
	var value;
	if (flag == 1) {
		value = msg.alpha + MSGSPEED;
	} else {
		value = msg.alpha - MSGSPEED;
	}
	msg.alpha = value;
	msg.style.opacity = (value / 100);
	msg.style.filter = 'alpha(opacity=' + value + ')';
	if (value >= 99) {
		clearInterval(msg.timer);
		msg.timer = null;
	} else if (value <= 1) {
		msg.style.display = "none";
		clearInterval(msg.timer);
	}
}
//######################## End     ##############################################

// calculate the position of the element in relation to the left of the browser //
function leftPosition(target) {
	var left = 0;
	if (target.offsetParent) {
		while (1) {
			left += target.offsetLeft;
			if (!target.offsetParent) {
				break;
			}
			target = target.offsetParent;
		}
	} else if (target.x) {
		left += target.x;
	}
	return left;
}

// calculate the position of the element in relation to the top of the browser window //
function topPosition(target) {
	var top = 0;
	if (target.offsetParent) {
		while (1) {
			top += target.offsetTop;
			if (!target.offsetParent) {
				break;
			}
			target = target.offsetParent;
		}
	} else if (target.y) {
		top += target.y;
	}
	return top;
}

//// preload the arrow //
//if (document.images) {
//	arrow = new Image(7, 80);
//	arrow.src = "images/msg_arrow.gif";
//}
//if (document.images) {
//	arrow11 = new Image(7, 80);
//	arrow11.src = "images/msg_arrow1.gif";
//}

