function error(error) {
    console.log("Es ist ein Fehler aufgetreten.");
    console.log(error);
}

function gotReport(item) {
    if (item.report === undefined) {
        return;
    }
    document.getElementById("report").checked = item.report;
}

function gotDuell(item) {
    if (item.duell === undefined) {
        return;
    }
    document.getElementById("duell").checked = item.duell;
}
function gotRatings(item) {
    if (item.ratings === undefined) {
        return;
    }
    ratings = item.ratings;
    set_state();
}


function new_values() {
    let report = document.getElementById("report").checked;
    let duell = document.getElementById("duell").checked;
    browser.storage.local.set({report, duell});
}
function set_state(){
    let button = document.getElementById("ratings");

    if (ratings === 0){
        button.textContent = "Deaktiviert";
        button.className = "change-button1";
        // button.style.backgroundColor = "#c25367";
    }
    else if (ratings === 1){
        button.textContent = "Beim Spielen";
        button.className = "change-button2";
        // button.style.backgroundColor = "#b9872d";
    }
    else {
        button.textContent = "Immer"
        button.className = "change-button3";
        // button.style.backgroundColor = "#53c257";
    }
}

let ratings = 0;

function clicked() {
    ratings = (ratings + 1) % 3;
    set_state();
    browser.storage.local.set({ratings});
}

function start() {
    set_state();
    document.getElementById("ratings").addEventListener("click", clicked, false);
    document.getElementById("duell").addEventListener("click", new_values, false);
    document.getElementById("report").addEventListener("click", new_values, false);
    browser.storage.local.get("report").then(gotReport, error);
    browser.storage.local.get("duell").then(gotDuell, error);
    browser.storage.local.get("ratings").then(gotRatings, error);
}

document.addEventListener("DOMContentLoaded", start, false);
