const messages = ["Deaktiviert", "Beim Spielen", "Immer"];
let ratings = 0;

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

function gotAnalyse(item) {
    if (item.analyse === undefined) {
        return;
    }
    document.getElementById("analyse").checked = item.analyse;
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
    set_state(false);
}


function new_values() {
    let report = document.getElementById("report").checked;
    let duell = document.getElementById("duell").checked;
    let analyse = document.getElementById("analyse").checked;
    browser.storage.local.set({report, duell, analyse, ratings});
}

function set_state(increment) {
    if (increment) {
        ratings = (ratings + 1) % 3;
    }

    let button = document.getElementById("ratings");
    button.textContent = messages[ratings];
    button.className = "change-button" + (ratings + 1).toString();
}

function clicked() {
    set_state(true);
    new_values();
}

function sendMessage(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(tab.id, {code: 1});
        console.log(tab.id);
    }
}

function reload() {
    browser.tabs.query({currentWindow: true, active: true},
        function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {code: 0});
        });
}

function open_analysis() {
    browser.runtime.sendMessage({code: 0});
}

function start() {
    set_state(false);
    document.getElementById("ratings").addEventListener("click", clicked, false);
    document.getElementById("duell").addEventListener("click", new_values, false);
    document.getElementById("report").addEventListener("click", new_values, false);
    document.getElementById("analyse").addEventListener("click", new_values, false);
    document.getElementById("reload").addEventListener("click", reload, false);
    document.getElementById("open-analysis").addEventListener("click", open_analysis, false);
    browser.storage.local.get("report").then(gotReport, error);
    browser.storage.local.get("duell").then(gotDuell, error);
    browser.storage.local.get("ratings").then(gotRatings, error);
    browser.storage.local.get("analyse").then(gotAnalyse, error);
}

document.addEventListener("DOMContentLoaded", start, false);
