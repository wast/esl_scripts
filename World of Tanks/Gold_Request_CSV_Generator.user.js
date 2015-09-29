// ==UserScript==
// @name        Gold Request CSV Generator
// @namespace   ESL.Wasteful
// @description Gold Request CSV Generator
// @include     http://play.eslgaming.com/worldoftanks/europe/wot/*/admin_qrydatabase/showqry
// @version     1.33
// @grant       none
// ==/UserScript==

/* @author wasteful@staff.eslgaming.com
* Script is active whenever you visit admin_qrydatabase/showqry. It generates filename for purpose of National Cups by reading website title. You just need
* to enter number of teams and participants.
*
* How To Use? Go to the cup page, enter admin_command, copy cup ID, go to database_query, choose WoT, fix file name, enter prizes and click the button.
* Now download files and enjoy.
*
* The script automatically generate full csv + csv files if needed. It excludes known ESL spectator gameaccounts WG_Spectator_1, WG_Spectator_2, WG_Spectator_3,
* WG_Spectator_4, WG_Spectator_5, ESL_CAST3 and ESL_CAST4. In 7on7 cups, it warns you when a team has less than 7 gameaccounts and gives them the gold
* amount as they are 7.
*
*/

$(document).ready(function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = dd + '.' + mm + '.' + yyyy;

    var parent = $("table").first().parent(),
        cupName = "",
        fileName = "",
        region = "",
        title = $('h4.title').html();
    if (title.length > 10) {
        cupName = title.substring(0, title.indexOf("  "));
        region = cupName.substring(cupName.lastIndexOf(" "), cupName.length);
        cupName = cupName.substring(0, cupName.indexOf(region));
        fileName = region.trim() + " - " + cupName.trim() + " - " + today + " - # teams - # participants.csv";
    } else {
        alert("You aren't in the cup navnode.");
    }
    $('<input/>', {
        type: 'text',
        id: 'fileNameInput',
        value: fileName,
        size: '120'
    }).appendTo(parent);
    $('<br />').appendTo(parent);
    $('<textarea/>', {
        id: 'goldInput',
        rows: '6',
        cols: '15',
        placeholder: "Gold amount per team (per line)"
    }).appendTo(parent);

    var selectData = {
        'Choose 7on7 Tier': '',
        '7on7 Tier 0': '7000\n5250\n3500\n1750',
        '7on7 Tier 1': '10500\n7000\n5250\n3500\n1750',
        '7on7 Tier 2': '14000\n10500\n7000\n5250\n3500\n1750',
        '7on7 Tier 3': '17500\n14000\n10500\n7000\n5250\n3500',
        '7on7 Tier 4': '21000\n17500\n14000\n10500\n5250\n3500\n1750',
        '7on7 Tier 5': '24500\n17500\n14000\n10500\n7000\n5250\n3500',
        '7on7 Tier 6': '28000\n17500\n14000\n10500\n7000\n5250\n3500\n1750',
        'Go4WoT': '0\n0\n0\n0\n0\n10500\n7000\n5250\n3500'
    }
    var s = $('<select/>', {
        id: 'tierLevel',
        onchange: 'fillTextArea()'
    });
    for(var val in selectData) {
        $('<option />', {value: selectData[val], text: val}).appendTo(s);
    }
    s.appendTo(parent)

    $('<input/>', {
        type: 'text',
        id: 'adminIdInput',
        placeholder: 'admin WG ID',
        size: '11'
    }).appendTo(parent);

    $('<button/>', {
        text: 'Generate Gold Request .CSV',
        onclick: 'getWoTCSV()'
    }).appendTo(parent);
});

window.fillTextArea = function(){
    $("#goldInput").val($("#tierLevel").val());
}
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
}
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


    var p = 0;
	for (var k in prizes){
	    if (prizes.hasOwnProperty(k)) {
	        for(var f in rel[k]){
	         	prizesReal[p] = prizes[k];
	         	p++;
	        }
	    }
	}

    var is7on7 = false;
    if($("#tierLevel").val().length > 0){ // if tierlevel is chosen, then the cup is 7on7 :)
        is7on7 = true;
    }
    var is3on3 = false;
       if($('#fileNameInput').val().indexOf("3on3") >= 0){ // if filename contains 3on3, then the cup is 3on3 :)
        is3on3 = true;
    }

    //taken from https://docs.google.com/spreadsheets/d/10ongM5OGeYBJZ-hdVLwll4uk6M50lZ51iZErcB5qoT0/edit#gid=1241858415
    var spectators = ["529322903", "529322904", "529322905", "529322906", "529322907", "505580220", "505580246"];
    var tbl = $('tr:has(td)').map(function(i, v) {
        var $td =  $('td', this);
        return {
                 finish: $td.eq(0).text(),
                 team: $td.eq(1).text(),
                 team_name: $td.eq(2).text(),
                 ga2: $td.eq(6).text()
               }
    }).get();
    tbl.shift();
    tbl.pop();
    tbl.forEach(function(el, index, array){
        if(el["ga2"].match(/^\d{9}$/) && spectators.indexOf(el["ga2"]) === -1 ){
            place.push(el["finish"]);
        }
        // el["finish"] el["ga2"]
    });

    var counts = {}; //how many players per team?
    for (var i = 0; i < place.length; i++) {
        var num = place[i];
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }

    var y = 0, lastTeam = "";
    tbl.forEach(function(el, index, array){
        if(el["ga2"].match(/^\d{9}$/) && spectators.indexOf(el["ga2"]) === -1 ){
            teamSize = counts[place[y]];
            if(is7on7 && teamSize < 7) {
                if(el["team"] != lastTeam){
                    alert("Team: " + el["team_name"] + " with ID: " + el["team"] + " has less than 7 players in lineup!");
                }
                lastTeam = el["team"];
                teamSize = 7;
            }
            if(is3on3 && teamSize < 3) {
                if(el["team"] != lastTeam){
                    alert("Team: " + el["team_name"] + " with ID: " + el["team"] + " has less than 3 players in lineup!");
                }
                lastTeam = el["team"];
                teamSize = 3;
            }
            prize = Math.floor(prizesReal[place[y] - 1] / teamSize); //calculate prize per player
            if(prize > 0) column.push([el["ga2"], prize]);
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


    var finalFileName = $('#fileNameInput').val();
    var data = column, csvContent = '';

    //when list is bigger than 50 players, generate more files
    var numberOfFiles = 1,
        numberOfLines = column.length,
        maxLinesPerFile = 50;
    if(numberOfLines > maxLinesPerFile){
        numberOfFiles = Math.ceil(numberOfLines / maxLinesPerFile);
        //download 1 file with all IDs
        data.forEach(function(infoArray, index) {
            dataString = infoArray.join(';');
            csvContent += index < data.length ? dataString + '\n' : dataString;
        });
        download(csvContent, finalFileName, 'text/csv');
    }

    //download files
    data = csvContent = '';
    for(var g=1; g <= numberOfFiles; g++){
        //start generating output CSV file
        finalFileName = $('#fileNameInput').val();
        if(numberOfFiles > 1){ //fix filename
            finalFileName = finalFileName.slice(0, - 4);
            finalFileName = finalFileName + " - part " + g + ".csv";
        }
        data = column.slice((g*maxLinesPerFile)-maxLinesPerFile, g*maxLinesPerFile);
        csvContent = '';
        data.forEach(function(infoArray, index) {
            dataString = infoArray.join(';');
            csvContent += index < data.length ? dataString + '\n' : dataString;
        });
        download(csvContent, finalFileName, 'text/csv');
    }
}
