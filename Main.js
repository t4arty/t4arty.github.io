/**
 * cheer
 */

VK.init({
	apiId : 1755175
});

var WRONG_TEXT = 'Something goes wrong. Enter valid post address.';

var grp = '';
var us = '';
var grpAvatar = '';

var obj = [];
var parsed = new Array(2);

var grCount = 0;
var grOffset = 0;

var massoff = 0;

var sexArray = [];
var manpos = [];
var wompos = [];
var onopos = [];
var wArray = [];
var mArray = [];
var m = 0;
var w = 0;

//boys girls
var sexCountArray = [];
	sexCountArray[0] = 0;
	sexCountArray[1] = 0;
	sexCountArray[2] = 0;
//

function getGroupInfo(groupId) {// ??? 2nd main funtion

	VK.api("groups.getById", {
		'group_id' : Math.abs(groupId),
		'fields' : 'members_count,photo_100'
	}, function(data) {
		if (data.error) {
			errorMSG('Error in data. Wrong group data.')
		} else {
			for (var i = 0; i < data.response.length; i++) {
				grp = data.response[i].name;
				us = data.response[i].members_count;
				grpAvatar = data.response[i].photo_100;

				obj[0] = grp;
				obj[1] = us;
				obj[2] = grpAvatar;

			}
			//UI changes group view(avatar name and so on)
			groupViewChanges(getGroupData());
			//UI changes
			progressMembersStart(); //start msg about job
			getGroupMembers(getParsedInfo(),massoff);
		}

	});
}

function makeCanculateSex(array) {
	var sexArr = array;
	var mans = 0;
	var womans = 0;
	var ono = 0;
	var t = 0;
	for (var s in sexArr) {
		t = array[s];
		if (t == 2) mans = mans+1;
		if (t == 1) womans = womans+1;
		if (t == 0) ono = ono+1;
	}
	sexCountArray[0] = ono;
	sexCountArray[1] = womans;
	sexCountArray[2] = mans;

	//UI changes
	document.getElementById('pCaption').innerHTML =
	$("#pCaption").text('ono: '+sexCountArray[0]+' wom: '+sexCountArray[1]+' man: '+sexCountArray[2]+' end.');
	//
}

function getGroupMembers(objTargets, offset) {

	var clearTimeout = [];
	var cMembers = 0;
	var aboutPost = objTargets;
	// 0-group, 1-item_post
	var code = '';
	code = 'var od='+aboutPost[0]+';'
           +'var id='+aboutPost[1]+';'
           +'var i=0;var off='+offset+';var c=1000;'
           +'var mc=API.likes.getList({"type":"post","owner_id":od,"item_id":id,"count":c,"offset":off}).count;'
           +'var lusers=[]; var like;'
           +'while(i<10 && off<mc){'
           +'like=API.likes.getList({"type":"post","owner_id":od,"item_id":id,"count":c,"offset":off}).users;'
           +'lusers=lusers+API.users.get({"user_ids":like,"fields":"sex"})@.sex;'
           +'off=off+c;i=i+1;};'
           +'return {"count":mc,"sex":lusers};';

	VK.api('execute', {'code' : code,}, function(data) {
		if (data.error) {
			errorMSG('Wrong: Group Member');
			console.log(data.error.error_msg);
		} else {

			$('#m_members').text('Count: ' + data.response.count + ' members.' + " Length sex: " + data.response.sex.length);
			//document.getElementById("pCaption").innerHTML += '<br><br>'+data.response.sex;
			var dtd = data.response.sex;
			var cM = data.response.count;
			cMembers = cM;
			sexArray = sexArray.concat(dtd);
			massoff = sexArray.length;

			if (cM > sexArray.length) {
				setTimeout(function() { getGroupMembers(getParsedInfo(), massoff); },400);
			}else{
				makeCanculateSex(sexArray);
				console.log("sArray : "+sexArray.length);
				console.log('Array full');
			}
		}
	});
}

function getGroupData() {//data for groupName,groupMembersCount, avatar.
	return obj;
}

function getParsedInfo() {//getting obj {groupID, postID}
	return parsed;
}

function waiting() {//maybe wait some time
	var se = 0;
	var t = setTimeout(function() {
		if (se > 1) {
			waiting();
			console.log('waits ----------------------------------');
			se = 0;
		}
		se++;
	}, 500);
}

function progressMembersStart() {
	$('#goes').text('Start.');
}
function progressMembersEnd() {
	$('#goes').text('End.');
}

function groupViewChanges(obj) {//changes UI view
	var a = obj;
	$('#groupName').text('Name: ' + a[0]);
	$('#members_count').text('Count: ' + a[1]);
	$('#av').src = a[2];
}

function parseLink() {// main function for parse link from text area.
	var link = String($('#post').value()) || '';

	if (link != '' && (link.match('new.vk.com') == 'new.vk.com') && (link.match('wall-') == 'wall-')) {

		if (link.indexOf('=wall') != -1) {
			var adr = link.substring(link.indexOf('=wall') + 5, link.length);
			var p = adr.split('_');
			if ((p[0] === undefined) && (p[1] === undefined)) {
				errorMSG('Wrong: group or post or both');
			} else {
				if ((/\d+/.test(p[0])) && (/\d+/.test(p[1]))) {
					parsed[0] = p[0];
					parsed[1] = p[1];
					getGroupInfo(parsed[0]);
				}

			}
		} else {
			errorMSG('Wrong: not wall post');
		}
	} else {
		errorMSG('Wrong: not vk.com');
	}
}

function clearadress() {// clear text area
	$('#post').text('');
}

function errorMSG(msg) {// shows error messages in main text area
	$('#post').text(msg);
	var t = setTimeout(clearadress, 1000);
}

function dateFromString(str) { // return amount of age ago.
	function func(str) {
	var dat = new Date();
	if (str != null)
	{
		if (str.length > 6)
		{
			var d = str.split('.');
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth()+1;
			var yy = date.getFullYear();
			var r = 0;
			r = yy - d[2];

			if (mm == d[1]) {
				if (dd < d[0]) {
					return r-1;
				}else{
					return r;
				}
			}
			if (mm > d[1]) {
				return r-1;
			}else{
				return r+'';
			}
		}else{
			return 'bd';//date string low then 6;
		}
	}else{
		return 'bn';//'date string equal null';
	}
}
}
