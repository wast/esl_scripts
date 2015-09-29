// ==UserScript==
// @name       	ESL MiniHelper
// @description Based on meric's version and adapted to the new website with some improvements: adds an admin_match link directly in the bracket page, also contestant seeds are visible in all rounds; on league results page got rid of the annoying row onclick plus the last column now has a link to the corresponding admin_match
// @include    	http://play.eslgaming.com/*/admin_match/*
// @include    	http://play.eslgaming.com/*/rankings/*
// @include    	http://play.eslgaming.com/*/results/*
// @version    	1.2
// @updateURL   https://dl.dropbox.com/s/46bvsehd7ge5lx7/esladminmatch.user.js
// @downloadURL https://dl.dropbox.com/s/46bvsehd7ge5lx7/esladminmatch.user.js
// @grant		none
// @copyright  	2015, meric, K.Kemzura
// ==/UserScript==

/************
* CONSTANTS *
************/
var URL = document.location.href;

/***********
* SETTINGS *
***********/
var SEED_OVERTAKE = false;

/**************
* ADMIN_MATCH *
**************/

var DEFWIN = false;
var DEFWIN_CONTESTANT = 0;

function checkMatch() {
	var form;
    for (var n=0;n<document.getElementsByTagName('form').length;++n) { 
    	if (document.forms[n].getAttribute("method") == "post")
    		form = document.forms[n];
    }
	if(DEFWIN)
		form.defaultwin.selectedIndex = DEFWIN_CONTESTANT;
    form.status.selectedIndex = 3;
    form.calculate.selectedIndex = 0;
    for (var i=0;i < form.length; ++i) {
        if(form.elements[i].type == "checkbox" && form.elements[i].name != "featured") {
            form.elements[i].checked = true;
        }
    }
    var matches = document.querySelectorAll("div.TitleS");
    var newAnchor = document.createElement("a");
    newAnchor.setAttribute("name", "checked");
    matches[2].appendChild(newAnchor, matches[2].firstChild);
    var targetRes = form.elements[(form.length)-8];
    targetRes.select();
    targetRes.focus();
}

function giveWin(contestant){
    var tds = document.getElementsByTagName('td');
    for (var n=0;n<tds.length;++n) { 
        if (tds[n].textContent == "round1team1"){
    		tds[n].nextSibling.nextSibling.childNodes[2].setAttribute("value", 1-contestant);
            //if contestant = 0 -> 1
            //if contestant = 1 -> 0
        }else if (tds[n].textContent == "round1team2"){
            tds[n].nextSibling.nextSibling.childNodes[2].setAttribute("value", contestant);
            //if contestant = 1 -> 1
            //if contestant = 0 -> 0
        }
            
    }
    checkMatch();
}

function win1(){giveWin(0);}
function win2(){giveWin(1);}

if(URL.match("/admin_match/")){
	var title = document.querySelectorAll(".TitleM")[0];

	var name1 = document.querySelector("input[name=\"contestant[1][name]\"]").getAttribute("value");
	var name2 = document.querySelector("input[name=\"contestant[2][name]\"]").getAttribute("value");

	var buttonWin1 = document.createElement("a");
	var buttonWin2 = document.createElement("a");

	var textWin1 = document.createTextNode("Give win to "+name1);
	var textWin2 = document.createTextNode("Give win to "+name2);

	var buttonCheckMatch = document.createElement("a");
	buttonCheckMatch.setAttribute("href", "#checked");
	buttonCheckMatch.setAttribute("class", "btn btn-primary");
	var textCheckMatch = document.createTextNode("Check Match");
	buttonCheckMatch.addEventListener("click", checkMatch, false);
	buttonCheckMatch.appendChild(textCheckMatch);

	if(name1 != ""){
		buttonWin1.setAttribute("href", "#checked");
		buttonWin1.setAttribute("class", "btn btn-primary");
		buttonWin1.addEventListener("click", win1, false);
		buttonWin1.appendChild(textWin1);
		buttonWin1.style.marginLeft = "5px";
	}else{
		textWin2 = document.createTextNode("Give defwin to "+name2);
		buttonWin1 = document.createTextNode("");
		DEFWIN = true;
		DEFWIN_CONTESTANT = 2;
	}

	if(name2 != ""){
		buttonWin2.setAttribute("href", "#checked");
		buttonWin2.setAttribute("class", "btn btn-primary");
		buttonWin2.addEventListener("click", win2, false);
		buttonWin2.appendChild(textWin2);
		buttonWin2.style.marginLeft = "5px";
	}else{
		textWin1 = document.createTextNode("Give defwin to "+name1);
		buttonWin2 = document.createTextNode("");
		DEFWIN = true;
		DEFWIN_CONTESTANT = 1;
	}

	if (title.nextSibling) {
	  title.parentNode.insertBefore(buttonWin2, title.nextSibling);
	  title.parentNode.insertBefore(buttonWin1, title.nextSibling);
	  title.parentNode.insertBefore(buttonCheckMatch, title.nextSibling);
	}
	else {
	  title.parentNode.appendChild(buttonWin2);
	  title.parentNode.appendChild(buttonWin1);
	  title.parentNode.appendChild(buttonCheckMatch);
	}
}
/***********
* BRACKETS *
***********/
if(URL.match("/rankings/") && document.querySelector(".league--header .description").textContent.match("Cup").length != 0){
	//inject seeds into further rounds
	var bracketNodes = document.querySelectorAll(".contestant");
	for(i = 0; i < bracketNodes.length; i++){
		if(bracketNodes[i].childNodes.length == 3){
			var title = bracketNodes[i].childNodes[1].querySelector("a").getAttribute("title");
			var seed = document.querySelector("a[title=\""+title+"\"]").parentNode.previousSibling.previousSibling;
			var clone = seed.cloneNode(true);
			bracketNodes[i].appendChild(clone);
		}
	}
	//add admin match link
	var vs = document.querySelectorAll(".inner-status");
	for(i = 0; i < vs.length; i++){
		var t = document.createTextNode(" | ");
		var url = vs[i].childNodes[0].getAttribute("href").replace("match", "admin_match");
		var a = document.createElement("a");
		a.setAttribute("href", url);
		a.setAttribute("target", "_blank");
		a.style.display = "inline-block";
		a.textContent = "ADM_MATCH";
		vs[i].childNodes[0].style.display = "inline-block";
		vs[i].style.width = "100px";
		vs[i].style.left = "9px";
		vs[i].appendChild(t);
		vs[i].appendChild(a);
	}
}

/*************
* MATCHTABLE *
*************/
if(URL.match("/results/") != 0 && document.querySelector(".league--header .description").textContent.match("League").length != 0){
	var tables = document.querySelectorAll(".esl-content table");
	for(i = 0; i < tables.length; i++){
		for(j = 1; j < tables[i].rows.length; j++){
			tables[i].rows[j].removeAttribute("onclick");
			tables[i].rows[j].style.cursor = "auto";
			var td = tables[i].rows[j].lastElementChild;
			var url = tables[i].rows[j].children[3].children[0].getAttribute("href");
			tables[i].rows[j].children[3].children[0].setAttribute("target", "_blank");
			var a = document.createElement("a");
			a.setAttribute("href", url.replace("match", "admin_match"));
			a.setAttribute("target", "_blank");
			a.innerHTML = (td.innerHTML == "" ? "<img src=\"http://eslstatic.net/skins/v2008_base/content/small_cross.gif\" border=\"0\" height=\"13\" width=\"13\"/>" : td.innerHTML);
			td.innerHTML = ""
			td.appendChild(a);
		}
	}
}
