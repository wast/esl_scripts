// ==UserScript==
// @name        esl-wot-admin-leaguewizard-7-script
// @namespace   ESL.Wasteful
// @description Sets all best_of and maps when building bracket in 3on3, 5on5 and 7on7 cups with BAPI
// @include     *://play.eslgaming.com/worldoftanks/*/admin_leaguewizard/7/
// @version     1.24
// @grant       none
// ==/UserScript==
/**
 * Created by Wasteful.
 * Last update: 19.06.2017. (Added 3on3 function by _Aitor_)
 * Config: current setup is go4wot, edit bestOf_* variables if you have different cup setup
 */

var is3on3 = window.location.href.indexOf("3on3") > 0;
var is7on7or5on5 = window.location.href.indexOf("test-cup-script") > 0 || window.location.href.indexOf("go4wot") > 0 || window.location.href.indexOf("7on7") > 0 || window.location.href.indexOf("5on5") > 0;

var maps;

var bestOf_BeforeFinals = 3, bestOf_finals = 5;


if(is7on7or5on5){
    
    maps = [
        "Himmelsdorf (Standard Battle; Encounter; Attack/Defense)",
        "Murovanka (Standard Battle; Encounter; Attack/Defense)",
        "Cliff (Standard Battle; Attack/Defense)",
        "Prokhorovka (Standard Battle; Encounter; Attack/Defense)",
        "Mines (Standard Battle; Encounter; Attack/Defense)",
        "Ruinberg (Standard Battle; Encounter; Attack/Defense)",
        "Steppes (Standard Battle; Encounter; Attack/Defense)",
        "Ghost Town (Standard Battle; Attack/Defense)"
    ];
    
}
else{
    if(is3on3){
        maps = [
            "Himmelsdorf (Standard Battle; Encounter; Attack/Defense)",
            "Murovanka (Standard Battle; Encounter; Attack/Defense)",
            "Prokhorovka (Standard Battle; Encounter; Attack/Defense)",
            "Mines (Standard Battle; Encounter; Attack/Defense)",
            "Ruinberg (Standard Battle; Encounter; Attack/Defense)",
            "Steppes (Standard Battle; Encounter; Attack/Defense)",
            "Sand River (Standard Battle; Encounter; Assault; Attack/Defense)",
            "Lakeville (Standard Battle; Encounter; Attack/Defense)",
            "Ensk (Standard Battle; Encounter)"
    ];
    }
}

    //do not edit below!!

    

    var currentBestOf;
    function shuffle(array) {
        var counter = array.length, temp, index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }
    var rounds = $("tr[bgcolor='EEEEEE'] tr td:contains('best_of')");
    var lastRound = rounds.length-1;
    var mapRound = 0;

    //randomize maps
    var shuffledMaps = shuffle(maps);

    //iterate each cup round
    rounds.each(function(i){ 
        
        //find all selects in a round
        var $this = $("select", this);
        
        //check if it's final round
        currentBestOf = (i === lastRound)? bestOf_finals : bestOf_BeforeFinals;
        
        //best_of
        $this.eq(0).val(currentBestOf);
        
        //set values
        var bestOfTemp = currentBestOf + 1; //because we skip 1 (map10)
        for(var c = 1; c <= bestOfTemp; c++){
            if(c == 2){ //this is map10, skip it
                continue;
            }
            $this.eq(c).val(shuffledMaps[mapRound]);
            console.log(c + " " +$this.eq(c).val());
            if($.inArray(c, [1,4,6,8]) >= 0 && c != bestOfTemp){
                console.log("dupla");
            }else if(mapRound === shuffledMaps.length - 1){
                mapRound = 0;
            }else{
                mapRound++;
            }
        }
    });
