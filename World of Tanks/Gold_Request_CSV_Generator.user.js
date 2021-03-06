// ==UserScript==
// @name        Gold Request CSV Generator
// @namespace   ESL.Wasteful
// @description Gold Request CSV Generator
// @include     *://play.eslgaming.com/worldoftanks/europe/wot/*/admin_qrydatabase/showqry
// @downloadURL	https://github.com/wast/esl_scripts/raw/master/World%20of%20Tanks/Gold_Request_CSV_Generator.user.js
// @version     1.51
// @grant       none
// ==/UserScript==

/* @author wasteful@staff.eslgaming.com
* Script is active whenever you visit admin_qrydatabase/showqry. 
*
* How To Use? Go to the cup page, go to admin_command, copy League ID, go to Query Database, choose "WoT Gold" (v),
* enter data, click button, enter file name, enter prizes and click the button.
* Now download file and enjoy.
*
* The script automatically generate full csv. It excludes known ESL spectator gameaccounts.
* If there are less then XonX players in lineup, they are not added to list.
*
*/
var parent = $("table").first().parent(),
	$div = $('<div/>'),
	fileName = "cupname "+today()+".csv",
	url = window.location.href,
	xonxPattern = /\don\d/,
	xonx = xonxPattern.exec(url),
	isGo4WoT = url.indexOf("go4wot") > 0,
	go4wotGold = '0\n0\n0\n0\n0\n10500\n7000\n5250\n3500';
$(document).ready(function() {  
    if (xonx) {
        x = xonx[0].substring(0, 1);  
    } else {
		x = 7;
    }
    $('<input/>', {
        type: 'text',
        id: 'fileNameInput',
        value: fileName,
        size: '120'
    }).appendTo($div);
    $('<br />').appendTo($div);
    $('<textarea/>', {
        id: 'goldInput',
        rows: '6',
        cols: '15',
        placeholder: "Gold amount per team (per line)"
    }).appendTo($div);

    var selectTeamPrize = {
        'Choose distribution': '',
	'yolo Gold' : '25000\n17500\n12500\n10000\n7500\n5000\n3750\n',
	'ace Gold' : '13500\n9000\n6000\n3750\n2250\n1350\n750',
	'clash Gold' : '6000\n4000\n3500\n2500\n1500\n1000\n700\n400',
	'duel Gold' : '2500\n1750\n1250\n1000\n600\n400\n250\n150',
        'Go4WoT': go4wotGold
    };
    var s = $('<select/>', {
        id: 'tierLevel',
        onchange: 'fillTextArea()'
    });
    for(var val in selectTeamPrize) {
        $('<option />', {value: selectTeamPrize[val], text: val}).appendTo(s);
    }
    s.appendTo($div);

    $('<input/>', {
        type: 'text',
        id: 'adminIdInput',
        placeholder: 'admin WG ID',
        size: '11'
    }).appendTo($div);

    $('<button/>', {
        text: 'Generate Gold Request .CSV',
        onclick: 'getWoTCSV()'
    }).appendTo($div);
	$div.prependTo(parent);
	
	if(isGo4WoT){
		$("#tierLevel").val(go4wotGold);
		$("#goldInput").val(go4wotGold);
	}
});

window.getWoTCSV = function() {
    var tds = $('td'),
        places = $('tr').find('td:not(:empty):first'),
        prizes = $('#goldInput').val().split(/\n/);
    var column = [],
        index = 0,
        y = 0,
        prizesReal = [],
        place = [];

    //generating ranking object
    var rel = {
        0: [1],
        1: [2],
        2: [3],
        3: [4],
        4: [5, 6, 7, 8],
        5: [9, 10, 11, 12, 13, 14, 15, 16]
    };
    var temp = [];
    for (var i = 17; i <= 32; i++) {
    	temp.push(i);
    }
    rel[6] = temp;
    temp = [];
    for (var i = 33; i <= 64; i++) {
    	temp.push(i);
    }
    rel[7] = temp;
    temp = [];
    for (var i = 65; i <= 128; i++) {
    	temp.push(i);
    }
    rel[8] = temp;
    //end generating ranking object

	//calculate prizes
    var p = 0;
	for (var k in prizes){
	    if (prizes.hasOwnProperty(k)) {
	        for(var f in rel[k]){
	         	prizesReal[p] = prizes[k];
	         	p++;
	        }
	    }
	}

    //taken from https://docs.google.com/spreadsheets/d/10ongM5OGeYBJZ-hdVLwll4uk6M50lZ51iZErcB5qoT0/edit#gid=1241858415
    var spectators = ['539269868','539269869','539269870','539269871','539269872','539269875','539269876','539269877','539269878','539269879','530845699','530845705','530845706','505580220','505580246','530845702','530845701','530845707','530845703','530845700','530845708','530845709','530845710','530845711','530845712','530845713','530845714','539269868','539269869','539269870','539269871','539269872','539269875','539269876','539269877','539269878','539269879'];
    var tbl = $('tr:has(td)').map(function(i, v) {
        var $td =  $('td', this);
        var t = (x==1)?4:6;
	return {
                 finish: $td.eq(0).text(),
                 team: $td.eq(1).text(),
                 team_name: $td.eq(2).text(),
                 ga2: $td.eq(t).text()
               };
    }).get();
    tbl.shift();
    tbl.pop();
    tbl.forEach(function(el, index, array){
        if(el.ga2.match(/^\d{9}$/) && spectators.indexOf(el.ga2) === -1 ){
            place.push(el["finish"]);
        }
    });

    var counts = {}; //how many players per team?
    for (var i = 0; i < place.length; i++) {
        var num = place[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    var y = 0;
    tbl.forEach(function(el, index, array){
        if(el.ga2.match(/^\d{9}$/) && spectators.indexOf(el.ga2) === -1 ){
            teamSize = counts[place[y]];
            if(teamSize >= x){
               prize = Math.floor(prizesReal[place[y] - 1] / teamSize); //calculate prize per player
               if(prize > 0) column.push([el.ga2, prize]);
            }
            y++;
        }
    });

    var adminIdInputValue = $("#adminIdInput").val();

    //checking if there already is admin in the list
    var theIndex = -1;
    for (var i = 0; i < column.length; i++) {
        if (column[i][0] == adminIdInputValue) {
            theIndex = i;
            break;
        }
    }

    //adding admin ID at the end with 1 gold
    if((theIndex == -1) && adminIdInputValue){
        column.push([adminIdInputValue, "1"]);
    }
    var data = column, csvContent = '';
	finalFileName = $('#fileNameInput').val();
	data.forEach(function(infoArray, index) {
		dataString = infoArray.join(';');
		csvContent += index < data.length ? dataString + '\n' : dataString;
	});
	download(csvContent, finalFileName, 'text/csv');
};

//download csv script
var download = function(content, fileName, mimeType) {
    var a = document.createElement('a');
    mimeType = mimeType || 'application/octet-stream';
    if (navigator.msSaveBlob) { // IE10
        return navigator.msSaveBlob(new Blob([content], {
            type: mimeType
        }), fileName);
    } else if ('download' in a) { //html5 A[download]
        a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        setTimeout(function() {
            a.click();
            document.body.removeChild(a);
        }, 66);
        return true;
    } else { //do iframe dataURL download (old ch+FF):
        var f = document.createElement('iframe');
        document.body.appendChild(f);
        f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

        setTimeout(function() {
            document.body.removeChild(f);
        }, 333);
        return true;
    }
};

window.fillTextArea = function(){
    $("#goldInput").val($("#tierLevel").val());
};

function today(){
	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
	return dd + '.' + mm + '.' + yyyy;
}

