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

function gotAnalyse(item) {
    if (item.analyse === undefined) {
        return;
    }
    document.getElementById("analyse").checked = item.analyse;
}


function new_values() {
    let report = document.getElementById("report").checked;
    let duell = document.getElementById("duell").checked;
    let analyse = document.getElementById("analyse").checked;
    browser.storage.local.set({report, duell, analyse});
}

function set_state() {
    let button = document.getElementById("ratings");

    if (ratings === 0) {
        button.textContent = "Deaktiviert";
        button.className = "change-button1";
    } else if (ratings === 1) {
        button.textContent = "Beim Spielen";
        button.className = "change-button2";
    } else {
        button.textContent = "Immer"
        button.className = "change-button3";
    }
}

let ratings = 0;

function clicked() {
    ratings = (ratings + 1) % 3;
    set_state();
    browser.storage.local.set({ratings});
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
    browser.tabs.query({currentWindow: true, active: true},
        function (tabs) {
            browser.tabs.sendMessage(tabs[0].id, {code: 1});
        });
}

function start() {
    set_state();
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
